# Architecture Research

**Domain:** Medical booking and appointment systems (capacity + variable pricing)
**Researched:** 2026-02-20
**Confidence:** MEDIUM-HIGH

## Standard Architecture

### System Overview

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                             Experience Layer                                 │
├───────────────────────────────────────────────────────────────────────────────┤
│  Patient App/Web   Provider Portal   Admin Console   API Clients (B2B/FHIR) │
└──────────────┬──────────────┬──────────────┬─────────────────────────────────┘
               │              │              │
┌──────────────▼──────────────▼──────────────▼─────────────────────────────────┐
│                          Application/API Layer                               │
├───────────────────────────────────────────────────────────────────────────────┤
│ AuthN/AuthZ API   Scheduling API   Pricing/Quote API   Booking API          │
│ Payment API       Notification API Audit/Reporting API                       │
└──────────────┬──────────────┬──────────────┬─────────────────────────────────┘
               │              │              │
┌──────────────▼──────────────▼──────────────▼─────────────────────────────────┐
│                             Domain Services                                  │
├───────────────────────────────────────────────────────────────────────────────┤
│ Provider Config  Capacity Engine  Fee Rules Engine  Booking Orchestrator    │
│ Payment Orchestrator  Audit/Event Service  Integration Service               │
└──────────────┬──────────────┬──────────────┬─────────────────────────────────┘
               │              │              │
┌──────────────▼──────────────▼──────────────▼─────────────────────────────────┐
│                           Data + Integration Layer                           │
├───────────────────────────────────────────────────────────────────────────────┤
│ Postgres (OLTP)  Redis (holds/cache)  Queue/Event Bus  Object Storage       │
│ Payment Provider (tokenized)  Email/SMS  Optional EHR/FHIR endpoints         │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Identity and access | Workforce and patient auth, MFA, role enforcement, tenant boundaries | OIDC/OAuth2 + RBAC in API gateway/service middleware |
| Provider configuration | Owns provider schedules, per-hour capacity policies, fee rules, exceptions | CRUD service + versioned rule tables in Postgres |
| Capacity engine | Materializes and validates bookable capacity buckets; prevents overbooking | Transactional service using row locks/constraints |
| Fee rules engine | Computes deterministic quote from fee rules + slot context | Pure function service with rule-version pinning |
| Booking orchestrator | Coordinates hold -> payment intent -> confirmation/cancel/release | Saga/state-machine with idempotent commands |
| Payment integration | Creates payment intents, handles webhooks, reconciles status | Stripe (or equivalent) adapter + verified webhook endpoint |
| Audit/compliance service | Immutable event trail for booking, pricing, access, admin actions | Append-only audit table + signed hashes/object archive |
| Notification service | Sends confirmations, reminders, cancellations | Queue worker + provider (email/SMS) |
| Interop service | Maps internal model to FHIR Schedule/Slot/Appointment when needed | Adapter layer, async export/import jobs |

## Recommended Project Structure

```
src/
├── modules/
│   ├── auth/                 # identity, session, role guards
│   ├── providers/            # provider profile + clinic settings
│   ├── schedules/            # availability windows + exceptions
│   ├── capacity/             # per-hour capacity model + enforcement
│   ├── pricing/              # fee rules, quote computation, rule versions
│   ├── bookings/             # booking lifecycle state machine
│   ├── payments/             # payment provider integration + webhooks
│   ├── notifications/        # async delivery and templates
│   ├── audit/                # audit events, read models, compliance exports
│   └── interoperability/     # FHIR mapping/adapters
├── shared/
│   ├── db/                   # migrations, transaction helpers, repositories
│   ├── events/               # outbox/event abstractions
│   └── security/             # encryption, redaction, access policy utilities
├── api/                      # HTTP/FHIR endpoints, DTOs, validators
└── workers/                  # queue processors (webhooks, reminders, exports)
```

### Structure Rationale

- **modules/** isolates core domain boundaries so roadmap phases can ship slice by slice.
- **shared/db + shared/events/** centralizes transaction, outbox, and idempotency primitives needed for safe booking.
- **workers/** separates side effects (notifications, reconciliation) from booking critical path latency.

## Architectural Patterns

### Pattern 1: Capacity Bucket + Reservation Hold

**What:** Model each provider-hour as a capacity bucket with `max_capacity`, `reserved`, and `booked`. Booking first creates a short hold; payment confirmation converts hold to booking.
**When to use:** Any system with strict no-overbook guarantees and payment before final confirmation.
**Trade-offs:** Strong integrity and clear UX; requires hold expiry handling and cleanup workers.

**Example:**
```typescript
await db.tx(async (tx) => {
  const bucket = await tx.capacityBucket.forUpdate(providerId, hourStart);
  if (bucket.booked + bucket.reserved >= bucket.maxCapacity) throw new Error("sold_out");

  await tx.reservationHolds.insert({
    holdId,
    providerId,
    hourStart,
    expiresAt: nowPlusMinutes(10),
    status: "pending_payment",
  });

  await tx.capacityBucket.incrementReserved(providerId, hourStart, 1);
});
```

### Pattern 2: Quote Snapshot with Rule Version Pinning

**What:** At checkout, compute a quote from fee rules and persist `rule_version`, `inputs_hash`, and `final_amount`. Never recompute the amount during confirmation.
**When to use:** Variable fees by slot/day/demand where disputes and auditability matter.
**Trade-offs:** Deterministic and auditable; adds schema and lifecycle management for quote expiration.

**Example:**
```typescript
const quote = pricingEngine.quote({ providerId, slotId, patientType, requestTime });
await quotes.insert({
  quoteId,
  providerId,
  slotId,
  amount: quote.amount,
  currency: quote.currency,
  ruleVersion: quote.ruleVersion,
  inputsHash: sha256(quote.inputsCanonicalJson),
  expiresAt: nowPlusMinutes(10),
});
```

### Pattern 3: Idempotent Booking Saga + Outbox

**What:** Use one idempotency key per booking attempt; persist state transitions and emit integration events from an outbox in the same DB transaction.
**When to use:** Payments/webhooks/retries where duplicate requests are common.
**Trade-offs:** Prevents duplicate charges/bookings; adds operational complexity (retries, dead-letter handling).

**Example:**
```typescript
await db.tx(async (tx) => {
  const existing = await tx.idempotency.find(key);
  if (existing) return existing.response;

  const booking = await tx.bookings.transition(bookingId, "hold_created", "payment_pending");
  await tx.outbox.enqueue("booking.payment.requested", { bookingId, quoteId, holdId });
  await tx.idempotency.save(key, { bookingId, status: booking.status });
});
```

## Data Flow

### Request Flow (Patient Booking)

```
Patient selects provider/time
    ↓
Availability API -> Capacity Engine (read current bucket)
    ↓
Pricing API -> Fee Rules Engine (compute quote + rule version)
    ↓
Booking API -> Booking Orchestrator (create hold + idempotency record)
    ↓
Payment API -> Payment Provider (create payment intent)
    ↓
Webhook -> Payment Orchestrator (verify signature, confirm payment)
    ↓
Booking Orchestrator (convert hold -> booked, decrement reserved/increment booked)
    ↓
Notification + Audit event emission
```

### Provider Configuration Flow

```
Provider updates schedule/capacity/fees
    ↓
Provider Config Service validates change
    ↓
New version stored (effective_from/effective_to)
    ↓
Capacity re-materialization job updates future buckets
    ↓
Pricing rule version published for new quotes only
```

### Key Data Flows

1. **Availability calculation:** schedule windows + exceptions + bucket state -> patient-visible availability.
2. **Price determination:** slot context + provider fee rules -> persisted quote snapshot.
3. **Booking finalization:** payment webhook + active hold -> confirmed appointment + immutable audit event.

## Compliance and Security Architecture Implications

- **PHI boundary:** Keep booking metadata and clinical identifiers in a controlled data domain with least-privilege access and tenant scoping.
- **HIPAA technical safeguards:** Design for access control, unique user IDs, audit controls, integrity protections, authentication, and transmission security (45 CFR 164.312).
- **Risk-based controls:** Security measures should be documented as "reasonable and appropriate" per organization size/risk profile (45 CFR 164.306).
- **Payment segregation:** Do not store PAN/CVV; use tokenized payment provider flows to reduce PCI scope and keep card data off app servers.
- **Transport + webhook security:** Enforce TLS everywhere and verify payment webhook signatures before state transitions.
- **Auditability:** Log every pricing and booking decision with actor, timestamp, rule version, input hash, and idempotency key for dispute/compliance review.

## Suggested Build Order (Roadmap-Oriented)

1. **Identity + Provider Config Foundation**
   - Build auth, role model, provider schedules, per-hour capacity config, and fee rule versioning.
2. **Capacity Engine + Availability API**
   - Materialize capacity buckets and enforce no-overbook invariants before any payment work.
3. **Pricing/Quote Engine**
   - Implement deterministic quote snapshots and quote expiration.
4. **Booking Orchestrator (without payment first)**
   - Implement hold lifecycle, idempotency, and cancellation/release paths.
5. **Payments + Webhook Reconciliation**
   - Add payment intent creation, webhook verification, and hold-to-booked conversion.
6. **Notifications + Audit Export + FHIR Adapter**
   - Add reminder flows, compliance reports, and optional interoperability endpoints.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Modular monolith, single Postgres, Redis for hold TTLs, async workers for notifications/webhooks |
| 1k-100k users | Read replicas for search, partition capacity/booking tables by provider/date, dedicated queue infrastructure |
| 100k+ users | Split into bounded services (booking, pricing, payments), regional data partitioning, event streaming + CDC for analytics |

### Scaling Priorities

1. **First bottleneck:** hot provider-hour rows during peak booking; mitigate with short transactions, row-level locks, and bucket partitioning.
2. **Second bottleneck:** webhook and notification throughput; mitigate with queue backpressure controls and idempotent workers.

## Anti-Patterns

### Anti-Pattern 1: Pricing Computed Only in Client/UI

**What people do:** Let frontend compute dynamic fees and send amount directly to payment.
**Why it's wrong:** Non-deterministic, tamper-prone, and hard to audit/provider-dispute.
**Do this instead:** Compute server-side quote, store rule version + input hash, and charge only persisted quote amount.

### Anti-Pattern 2: Confirming Capacity After Payment Only

**What people do:** Charge payment first, then try to book slot.
**Why it's wrong:** Causes paid-but-unavailable failures and expensive refund flows.
**Do this instead:** Acquire hold first, then collect payment, then atomically finalize booking.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Payment provider (Stripe-like) | Payment intent + webhook confirmation | Use idempotency keys and verified signatures |
| Email/SMS provider | Async event-driven notifications | Retries + dead-letter queue for failed sends |
| EHR/partner systems | FHIR Schedule/Slot/Appointment mapping | Keep adapter optional in v1 unless required |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Pricing -> Booking | Sync API call + persisted quote id | Booking must reject stale/expired quote |
| Booking -> Payments | Async event + webhook callback | Never trust client success callback alone |
| Booking -> Audit | Transactional outbox event | Prevents missing audit rows on partial failures |

## Sources

- HL7 FHIR Appointment workflow and request/response model: https://hl7.org/fhir/R4/appointment.html (HIGH)
- HL7 FHIR Slot semantics, including multi-allocation capacity and overbooking flags: https://build.fhir.org/slot.html (MEDIUM; CI build page)
- HIPAA Security Rule general requirements (45 CFR 164.306): https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.306 (HIGH)
- HIPAA technical safeguards (45 CFR 164.312): https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312 (HIGH)
- Stripe idempotent requests: https://docs.stripe.com/api/idempotent_requests (HIGH)
- Stripe webhook signature verification: https://docs.stripe.com/webhooks/signature (HIGH)
- Stripe integration security / PCI scope reduction guidance: https://docs.stripe.com/security/guide (HIGH)
- PostgreSQL constraints (including exclusion constraints): https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-EXCLUSION (HIGH)
- PostgreSQL transaction isolation behavior and serializable retry model: https://www.postgresql.org/docs/current/transaction-iso.html (HIGH)

---
*Architecture research for: MedBooker*
*Researched: 2026-02-20*
