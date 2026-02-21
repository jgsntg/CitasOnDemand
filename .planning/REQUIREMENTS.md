# Requirements: MedBooker

**Defined:** 2026-02-20
**Core Value:** Providers can reliably control appointment capacity per hour and monetize each booking with flexible pricing.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Scheduling & Capacity

- [ ] **CAPA-01**: Provider can configure visit capacity limits per hour for each schedule window
- [ ] **CAPA-02**: System prevents bookings that exceed configured hourly capacity
- [ ] **BOOK-01**: Patient can view real-time slot availability and book an appointment online

### Pricing & Payments

- [ ] **PRIC-01**: Provider can define variable booking fees by slot, day, or demand rule
- [ ] **PRIC-02**: Patient sees fee and total charge before confirming booking
- [ ] **PAYM-01**: Patient can pay for booking at checkout and receive a receipt
- [ ] **PAYM-02**: Staff can issue a basic partial or full refund tied to a booking

### Patient Operations

- [ ] **COMM-01**: Patient receives appointment reminders and can confirm attendance
- [ ] **INTK-01**: Patient can complete pre-visit intake/check-in form before appointment
- [ ] **PORT-01**: Patient can view booked appointments and payment status in a basic portal
- [ ] **WAIT-01**: System can offer canceled slots to waitlisted patients using deterministic ordering rules

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Optimization

- **PRIC-03**: Provider can view fee-pricing audit trail explaining which rule produced each charge
- **WAIT-02**: System performs fee-aware and capacity-aware waitlist matching by policy constraints
- **SIMU-01**: Provider can run what-if simulations for capacity and fee policy changes before publishing
- **POLI-01**: Provider admin can enforce pricing guardrails (floor, ceiling, protected periods)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Full EHR charting and clinical documentation workflows | Not required to validate booking/capacity/pricing core loop in v1 |
| Full insurance claims lifecycle and payer adjudication | High complexity and long cycle outside focused v1 scope |
| Black-box surge pricing with no rationale | Conflicts with patient trust and healthcare pricing transparency expectations |
| Real-time auction bidding for appointment slots | Ethically and operationally risky for medical access workflows |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CAPA-01 | Phase 1 | Pending |
| CAPA-02 | Phase 1 | Pending |
| BOOK-01 | Phase 2 | Pending |
| PRIC-01 | Phase 2 | Pending |
| PRIC-02 | Phase 2 | Pending |
| PAYM-01 | Phase 3 | Pending |
| PAYM-02 | Phase 3 | Pending |
| COMM-01 | Phase 4 | Pending |
| INTK-01 | Phase 4 | Pending |
| PORT-01 | Phase 3 | Pending |
| WAIT-01 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0

---
*Requirements defined: 2026-02-20*
*Last updated: 2026-02-20 after roadmap mapping*
