# Project Research Summary

**Project:** MedBooker
**Domain:** Medical booking and appointment platform with hourly capacity controls and variable booking fees
**Researched:** 2026-02-20
**Confidence:** MEDIUM-HIGH

## Executive Summary

MedBooker should be built as a healthcare-grade booking and pricing system, not a generic calendar app. The research converges on a transactional core where provider-hour capacity is enforced with database-level concurrency controls, quotes are computed deterministically with versioned rules, and bookings are finalized only after verified payment events. Teams that succeed in this domain treat scheduling, pricing, and payment orchestration as a single integrity problem with strict auditability.

The recommended implementation approach is a modular TypeScript stack on AWS: Next.js for patient/provider UX, NestJS for domain APIs, PostgreSQL as the source of truth, Redis + BullMQ for async reliability, and Stripe for tokenized payments. Architecture should follow explicit domain boundaries (capacity engine, fee engine, booking saga, audit service), with idempotency and outbox patterns from day one. This lets MedBooker deliver its core differentiator (capacity-aware dynamic pricing) without sacrificing operational safety.

The biggest risks are concurrency failures (silent overbooking), non-deterministic pricing, payment-booking drift, and PHI leakage. Mitigation must be front-loaded: transactional reservation holds, quote snapshots pinned to rule versions, webhook-idempotent state machines, PHI redaction/access controls, and append-only audit events. If these controls are postponed, roadmap velocity will look fast early and collapse later under incident/reconciliation load.

## Key Findings

### Recommended Stack

`STACK.md` recommends a modern TypeScript monorepo with compliance-first infrastructure. Node 24 LTS (floor 22) plus Next.js 16 and NestJS 11 is the preferred runtime/application baseline because it matches current ecosystem maturity and supports clean separation between UI and domain logic. PostgreSQL 16+ is non-negotiable for booking correctness under contention, with Redis 7 for low-latency availability/cache and queue primitives.

Supporting libraries and tooling are aligned with reliability and auditability requirements: Prisma 7 for model iteration, Zod for boundary validation, `date-fns` + `date-fns-tz` for timezone-safe slot math, Stripe 20 for payments, BullMQ 5 for asynchronous workflows, and OpenTelemetry + Pino for observable/PHI-redacted operations. AWS HIPAA-eligible services under signed BAA are the assumed deployment model.

**Core technologies:**
- Node.js 24 LTS (min 22): runtime baseline with long support runway for TypeScript services.
- Next.js 16: patient/provider web apps with SSR and server component data flow for booking UX.
- NestJS 11: structured API modules for scheduling, pricing, booking, and payment orchestration.
- PostgreSQL 16+ (RDS): transactional source of truth for capacity, bookings, and pricing audit records.
- Redis 7 (ElastiCache): hold TTL/cache/rate-limit and queue support for async side effects.
- AWS HIPAA-eligible stack: hosting/security/compliance boundary with BAA-backed operations.

### Expected Features

`FEATURES.md` shows a clear split between launch-critical capabilities and strategic differentiators. Table stakes include self-service booking, reminders/confirmations, intake/check-in forms, basic portal functions, online payments, waitlist support, and compliance-visible pricing. For MedBooker specifically, the must-win differentiators are hourly capacity enforcement and transparent variable fee logic.

Dependency analysis is explicit: schedule primitives enable capacity rules; capacity enables valid availability and demand-aware pricing; pricing outputs must feed checkout deterministically; waitlist automation depends on cancellation detection plus capacity intelligence. Anti-features for v1 are full EHR charting, full claims lifecycle, opaque surge pricing, and slot auctions.

**Must have (table stakes):**
- Self-service real-time booking, reminders/confirmations, and payment capture/refunds.
- Basic intake/portal and compliance-visible pricing disclosures before checkout.
- v1 MVP core: capacity rules + variable fee engine + transparent checkout + booking-to-payment loop.

**Should have (competitive):**
- Capacity-aware waitlist auto-fill with deterministic policy logic.
- Provider simulation mode for fee/capacity what-if planning.
- Policy guardrails for dynamic pricing fairness/compliance.

**Defer (v2+):**
- EHR-grade charting/documentation and full claims workflows.
- AI scheduling assistant/triage until governance + baseline operations mature.

### Architecture Approach

`ARCHITECTURE.md` recommends a layered, modular architecture with explicit domain services: provider config, capacity engine, fee rules engine, booking orchestrator (state machine/saga), payment orchestrator, notifications, audit/compliance, and optional FHIR interoperability. The strongest patterns are (1) capacity bucket + short reservation hold, (2) quote snapshot with rule-version pinning, and (3) idempotent booking saga with transactional outbox.

**Major components:**
1. Capacity engine - enforces provider-hour constraints with transactional row locking and invariant checks.
2. Fee rules engine - computes deterministic quotes and persists immutable pricing artifacts.
3. Booking/payment orchestrators - coordinate hold, payment intent, webhook verification, and final booking state transitions.
4. Audit/compliance service - preserves append-only evidence for pricing/booking/access decisions.
5. Notification + interoperability workers - handle async side effects without blocking booking critical path.

### Critical Pitfalls

`PITFALLS.md` highlights failure modes that map directly to phase gates and test strategy.

1. **Non-atomic reservation logic** - prevent with single-transaction hold allocation, locking, and bounded retry strategy.
2. **Boolean availability modeling** - prevent by adopting explicit capacity ledgers (`configured`, `reserved`, `booked`, `released`, `overbook_limit`).
3. **Timezone/DST drift** - prevent with UTC persistence + IANA timezone IDs + DST boundary test suites.
4. **Non-deterministic pricing** - prevent with versioned rule precedence and immutable quote snapshots.
5. **Payment-booking state drift** - prevent with idempotent webhook-driven state machines and reconciliation jobs.

## Implications for Roadmap

Based on combined research, MedBooker should follow a five-phase delivery sequence.

### Phase 0: Domain and Compliance Foundation
**Rationale:** Capacity and PHI governance are prerequisites for every later feature and are expensive to retrofit.
**Delivers:** Provider schedule primitives, capacity ledger schema, auth/RBAC baseline, PHI classification/redaction defaults, initial audit event model.
**Addresses:** Feature dependency roots (provider schedule primitives) and compliance-visible pricing groundwork.
**Avoids:** Pitfall 2 (weak availability model) and Pitfall 6 (PHI leakage).

### Phase 1: Scheduling Core and Availability Integrity
**Rationale:** Booking correctness must be proven before charging money or adding advanced UX.
**Delivers:** Capacity engine, provider-hour bucket materialization, reservation holds with TTL, real-time availability APIs, DST-safe time semantics.
**Addresses:** P1 booking expectations and no-double-booking guarantees.
**Avoids:** Pitfall 1 (non-atomic overbooking) and Pitfall 3 (timezone drift).

### Phase 2: Pricing Engine and Transparent Checkout
**Rationale:** MedBooker differentiation depends on trustworthy dynamic pricing, not generic booking.
**Delivers:** Versioned fee rules, deterministic quote snapshots, itemized fee disclosure contract, policy guardrails, quote expiry handling.
**Addresses:** MVP variable fee engine + transparency requirement from FEATURES P1.
**Avoids:** Pitfall 4 (non-deterministic fees) and Pitfall 7 (late fee transparency).

### Phase 3: Payment Orchestration and Lifecycle Reliability
**Rationale:** Revenue flow must be reliable and idempotent before scale features.
**Delivers:** Payment intents, webhook verification/dedupe, reservation->paid booking transitions, refunds, reconciliation jobs, core reminders/confirmations.
**Addresses:** Payment capture/refund + operational communications table stakes.
**Avoids:** Pitfall 5 (payment/booking drift) and integration gotchas around out-of-order events.

### Phase 4: Utilization Optimization, Audit, and Integrations
**Rationale:** Optimization features create value only after stable transactional core and financial integrity.
**Delivers:** Capacity-aware waitlist automation, simulation dashboard, compliance exports/forensics, optional FHIR adapters.
**Addresses:** P2 differentiators and enterprise-readiness requirements.
**Avoids:** Pitfall 8 (missing immutable audit trail) while containing integration complexity.

### Phase Ordering Rationale

- Dependencies force this order: schedule primitives -> capacity engine -> pricing snapshots -> payments/webhooks -> optimization.
- Architecture boundaries align to phase boundaries, enabling modular releases without violating invariants.
- Early phases explicitly burn down highest-severity risks (overbooking, PHI leakage, pricing disputes) before growth features.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** Jurisdiction-specific pricing disclosure/compliance policy details and fairness constraints.
- **Phase 4:** FHIR/EHR interoperability scope, partner-specific mapping, and rollout strategy.

Phases with standard patterns (can likely skip `/gsd-research-phase`):
- **Phase 1:** Transactional reservation holds, locking, and DST handling are well-documented patterns.
- **Phase 3:** Stripe idempotency/webhook reliability patterns are mature and strongly documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Strong official documentation for runtime/cloud/compliance + current package ecosystem checks. |
| Features | MEDIUM | Good cross-vendor signal for table stakes; differentiator assumptions need market validation with target clinics. |
| Architecture | HIGH | Patterns backed by strong sources (FHIR semantics, Postgres transactional behavior, Stripe reliability guidance). |
| Pitfalls | HIGH | Failure modes are concrete, recurring in this domain, and tied to explicit prevention/verification tactics. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- Regulatory variance by region (pricing disclosure and consent specifics): validate in planning with legal/compliance input before Phase 2 scope freeze.
- Real-world demand elasticity for variable fees: run controlled pilots and A/B guardrails before broad rollout.
- EHR integration depth per customer segment: decide early whether Phase 4 interoperability is optional or contractually required for launch accounts.
- Operational SLO targets (booking latency, webhook reconciliation windows): define explicit SLOs before load testing and reliability acceptance.

## Sources

### Primary (HIGH confidence)
- Node.js LTS schedule (`nodejs.org`) - runtime support windows.
- AWS HIPAA/BAA guidance (`aws.amazon.com/compliance/hipaa-compliance`) - deployment/compliance boundaries.
- PostgreSQL docs (`postgresql.org/docs/current`) - constraints, transaction isolation, locking behavior.
- Stripe docs (`docs.stripe.com`) - idempotency, webhook verification, integration security.
- HIPAA regulations (`ecfr.gov` 45 CFR 164.306, 164.312, 164.502) - safeguards and PHI handling obligations.
- HL7 FHIR appointment/slot docs (`hl7.org/fhir`) - scheduling and capacity semantics.

### Secondary (MEDIUM confidence)
- Next.js, NestJS, Prisma official docs - framework and implementation guidance.
- Competitor product pages (NexHealth, athenahealth, Tebra, Practo) - market table stakes and workflow expectations.
- CMS patient billing/No Surprises resources - pricing transparency context.
- npm registry metadata (`npm view`) - compatibility/version signals.

### Tertiary (LOW confidence)
- Doctolib public marketing pages - limited technical depth for feature parity analysis.
- OpenEMR community wiki portal docs - useful patterns but lower authority for roadmap commitments.

---
*Research completed: 2026-02-20*
*Ready for roadmap: yes*
