# Pitfalls Research

**Domain:** Medical booking and appointment applications (hourly capacity + variable booking fees)
**Researched:** 2026-02-20
**Confidence:** MEDIUM-HIGH

## Critical Pitfalls

### Pitfall 1: Non-atomic slot reservation causes silent overbooking

**What goes wrong:**
Two patients can book the last available spot in the same hour when read-check-write happens outside a single transaction boundary.

**Why it happens:**
Teams rely on default `READ COMMITTED` behavior and optimistic UI checks without row/predicate locks, retry strategy, or serializable conflict handling.

**How to avoid:**
Use a single transactional booking command that (1) locks the capacity row(s) for the provider-hour window, (2) decrements/allocates capacity, and (3) creates appointment + payment intent link atomically. On serialization/deadlock failures, retry with bounded backoff.

**Warning signs:**
- Capacity occasionally goes negative or exceeds configured hourly max.
- Spikes of booking failures during high traffic windows.
- Support tickets where two patients show the same confirmed time.

**Phase to address:**
Phase 1 - Scheduling Core & Concurrency Controls

---

### Pitfall 2: Modeling "availability" as boolean instead of capacity ledger

**What goes wrong:**
Systems built around free/busy booleans cannot represent hourly capacity >1, controlled overbooking, or differentiated appointment types sharing the same hour.

**Why it happens:**
Teams copy generic calendar models and skip explicit capacity accounting by provider, location, service type, and hour bucket.

**How to avoid:**
Implement an explicit capacity ledger keyed by provider + location + service + hour window. Track `configured_capacity`, `reserved`, `booked`, `released`, and `overbook_limit` separately.

**Warning signs:**
- Frequent manual capacity adjustments by staff.
- Hard-coded exceptions like "this hour is special" in application code.
- Inability to explain why an hour appears full when slots remain (or vice versa).

**Phase to address:**
Phase 0 - Domain Model Foundations

---

### Pitfall 3: Timezone and DST errors break hourly controls

**What goes wrong:**
Hourly capacity windows drift on DST transitions (missing or duplicated local hours), creating false availability or blocked inventory.

**Why it happens:**
Teams store local wall times without canonical timezone IDs or compute recurrence with UTC offsets only.

**How to avoid:**
Store canonical IANA timezone per provider schedule, persist instants in UTC, and derive display hours from timezone-aware libraries. Test DST boundary dates explicitly.

**Warning signs:**
- Booking anomalies near DST changes.
- Recurring templates shift by one hour seasonally.
- Mismatch between provider calendar and patient confirmation times.

**Phase to address:**
Phase 1 - Scheduling Core & Time Semantics

---

### Pitfall 4: Variable fee engine is non-deterministic and non-auditable

**What goes wrong:**
Patients are charged inconsistent amounts for equivalent conditions, and staff cannot reproduce "why this fee" after booking.

**Why it happens:**
Rules are evaluated from mutable runtime data without versioning, precedence rules, or quote snapshots.

**How to avoid:**
Build a deterministic pricing engine with ordered rule precedence and versioned rule sets. Persist an immutable quote artifact with inputs, winning rule, and computed fee at booking time.

**Warning signs:**
- Same slot quoted differently across channels.
- Disputes where support cannot reconstruct the fee.
- Retroactive fee changes affecting already-confirmed bookings.

**Phase to address:**
Phase 2 - Pricing Engine & Audit Trail

---

### Pitfall 5: Payment and appointment states drift apart

**What goes wrong:**
You get paid bookings without appointments, appointments without successful payment, or duplicate charges for one reservation.

**Why it happens:**
Booking confirmation is treated as synchronous with checkout completion; webhook retries/out-of-order events are not modeled.

**How to avoid:**
Use explicit state machines for `reservation`, `payment`, and `appointment` with idempotent transitions. Confirm appointment only after verified payment success event, with dedupe on event IDs and object IDs.

**Warning signs:**
- Reconciliation gaps between payment provider and booking DB.
- Duplicate charge refunds becoming common.
- Unhandled webhook events or event-order assumptions in logs.

**Phase to address:**
Phase 3 - Checkout Orchestration & Event Reliability

---

### Pitfall 6: PHI leakage through logs, URLs, and notifications

**What goes wrong:**
Sensitive appointment context appears in analytics events, URLs, plaintext emails/SMS, or verbose logs.

**Why it happens:**
Engineering teams treat booking metadata as normal app data and miss healthcare-specific minimum-necessary and audit-control obligations.

**How to avoid:**
Classify PHI fields early, redact by default in logs, keep PHI out of query params, and use role-based access with audit trails for all PHI reads/changes.

**Warning signs:**
- Full names/visit reasons visible in third-party monitoring tools.
- Support exports containing unnecessary patient detail.
- No reliable audit report of who accessed appointment records.

**Phase to address:**
Phase 0 - Compliance Baseline & Data Governance

---

### Pitfall 7: Fee transparency is bolted on late

**What goes wrong:**
Patients see one amount at discovery and another at checkout, or cannot understand facility/service add-ons, producing disputes and chargebacks.

**Why it happens:**
Pricing disclosure, estimate generation, and jurisdiction-specific notices are treated as UI polish rather than core product logic.

**How to avoid:**
Define a fee disclosure contract in API responses (base fee, modifiers, taxes/fees, total, policy note, expiry). Enforce "displayed quote equals charged quote" invariants.

**Warning signs:**
- High checkout drop-off on payment step.
- Frequent "unexpected fee" complaints.
- Manual billing adjustments after appointments.

**Phase to address:**
Phase 2 - Pricing UX & Compliance Controls

---

### Pitfall 8: No immutable audit trail for schedule and fee decisions

**What goes wrong:**
When disputes occur, the team cannot prove capacity at booking time, rule version used, or who changed schedules/prices.

**Why it happens:**
Operational tables are overwritten in place; event history is partial or missing.

**How to avoid:**
Adopt append-only audit events for capacity changes, booking lifecycle transitions, and fee rule publications. Link each appointment to rule/version/actor metadata.

**Warning signs:**
- Investigations rely on screenshots or staff memory.
- Incomplete timeline for canceled/rescheduled disputes.
- No "as-of" reconstruction tooling.

**Phase to address:**
Phase 4 - Auditability, Reporting, and Forensics

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Single `is_available` flag per slot | Fast MVP | Cannot enforce hourly capacity >1 or explain overbook states | Never |
| Pricing rules embedded in frontend | Rapid iteration | Charge logic divergence across clients and no auditability | Never |
| Confirm booking before payment finality | Fewer code paths | Reconciliation pain, ghost bookings, refunds | Never |
| Skip retry handling for serialization/deadlocks | Faster initial launch | Sporadic booking failures at peak | Only in internal alpha |
| Store PHI in generic logs for debugging | Easy troubleshooting | Compliance and breach risk | Never |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Payment gateway (Stripe) | No idempotency key on create/confirm calls | Use unique idempotency keys for every retriable POST tied to booking attempt |
| Payment webhooks | Assuming ordered delivery and exactly-once events | Design idempotent consumers, dedupe events, and handle out-of-order processing |
| Calendar interoperability | Treating external calendar acceptance as source of truth for capacity | Keep internal booking ledger authoritative; external calendars are projections |
| Messaging (email/SMS) | Sending PHI-rich reminders through unsecured templates | Minimize content and include secure portal links for sensitive details |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Recomputing hourly availability from raw appointments on each search | Slow search endpoints, DB spikes | Precompute/provider-hour counters with transactional updates | ~10K+ monthly bookings |
| Full-table scans for "open slots" | p95 latency climbs with provider count | Composite indexes on provider/location/service/start-hour/status | ~1K+ providers |
| Synchronous webhook processing with business logic inline | Timeout retries and duplicate side effects | Ack fast, enqueue async processing with idempotent workers | During payment bursts |
| Single giant transaction across pricing + payment + notifications | Lock contention and deadlocks | Keep transaction scope small; orchestrate with state machine/events | Peak booking windows |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Missing unique user identity and fine-grained access for PHI | Unauthorized record access with weak attribution | Enforce unique identities, RBAC, and auditable access controls |
| Exposing appointment identifiers as predictable IDs | Enumeration of patient bookings | Use opaque IDs and authorization checks on every read/write |
| Storing raw card data | PCI scope explosion and breach risk | Use tokenized payment collection and avoid handling PAN directly |
| Not validating webhook signatures | Forged payment events confirm fake bookings | Verify signatures and replay window before state transitions |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing stale availability during checkout | Last-step failure and distrust | Hold short-lived reservations with visible countdown |
| Hidden dynamic fees | Surprise charges and abandonment | Show itemized fee breakdown before payment entry |
| Complex reschedule/cancel flows | Support load and no-shows | Provide self-service policy-aware modifications |
| Ambiguous local time labels | Missed appointments | Show timezone abbreviations and local conversion in confirmations |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Capacity engine:** Prevents race conditions under concurrent load tests, not just unit tests.
- [ ] **Dynamic pricing:** Every charge has a persisted quote snapshot and rule version.
- [ ] **Checkout integration:** Handles duplicate/out-of-order webhooks without double-booking.
- [ ] **Compliance controls:** PHI redaction, audit logs, and role permissions are verified in staging.
- [ ] **Time handling:** DST transition test suite passes for all supported provider timezones.
- [ ] **Operations:** Reconciliation job detects payment/appointment drift daily.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Double-booked hour | HIGH | Freeze affected hour, prioritize clinical triage, rebook impacted patients, run root-cause on transaction traces |
| Incorrect variable fee charged | MEDIUM-HIGH | Refund/adjust quickly, preserve quote evidence, patch rule precedence, backfill impacted bookings |
| PHI exposed in logs | HIGH | Rotate/seal logs, incident response, legal/compliance notification workflow, implement redaction guardrails |
| Payment-booking mismatch | MEDIUM | Reconcile ledger, repair states idempotently, refund duplicates, add missing dedupe constraints |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Non-atomic reservation | Phase 1 - Scheduling Core | Concurrency stress test proves no over-capacity bookings |
| Weak availability model | Phase 0 - Domain Model | Schema review confirms ledger fields and invariants |
| DST/timezone drift | Phase 1 - Time Semantics | DST edge-case test suite passes for key locales |
| Non-deterministic fees | Phase 2 - Pricing Engine | Same inputs always produce same quote hash + version |
| Payment/booking state drift | Phase 3 - Orchestration | Replay test of duplicate/out-of-order webhooks is idempotent |
| PHI leakage | Phase 0 - Compliance Baseline | Security review shows redaction + access audit completeness |
| Fee transparency gaps | Phase 2 - Pricing UX | "displayed vs charged" invariant monitoring stays within SLA |
| Missing forensic audit trail | Phase 4 - Auditability | Dispute drill reconstructs full timeline from stored events |

## Sources

- HL7 FHIR Appointment (R5), status/workflow/timezone recurrence guidance - https://www.hl7.org/fhir/appointment.html (HIGH)
- HL7 FHIR Slot (R5), capacity/overbook semantics - https://www.hl7.org/fhir/slot.html (HIGH)
- PostgreSQL transaction isolation - https://www.postgresql.org/docs/current/transaction-iso.html (HIGH)
- PostgreSQL explicit locking and deadlocks - https://www.postgresql.org/docs/current/explicit-locking.html (HIGH)
- Stripe idempotent requests - https://docs.stripe.com/api/idempotent_requests (HIGH)
- Stripe webhooks best practices (duplicates, ordering, retries, signatures) - https://docs.stripe.com/webhooks (HIGH)
- Stripe integration security and PCI scope guidance - https://docs.stripe.com/security/guide (HIGH)
- 45 CFR 164.312 technical safeguards (access control, audit controls, authentication, transmission security) - https://www.ecfr.gov/current/title-45/part-164/section-164.312 (HIGH)
- 45 CFR 164.502 minimum necessary and PHI disclosure rules - https://www.ecfr.gov/current/title-45/part-164/section-164.502 (HIGH)
- CMS No Surprises overview and provider resources (pricing transparency context) - https://www.cms.gov/nosurprises (MEDIUM)

---
*Pitfalls research for: medical booking and appointment applications*
*Researched: 2026-02-20*
