# Feature Research

**Domain:** Medical booking and appointment applications (provider-side + patient-side)
**Researched:** 2026-02-20
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Self-service online booking (web/mobile) | Core expectation across modern platforms (Practo, Doctolib, athenahealth, NexHealth) | MEDIUM | Must expose real-time slot availability and avoid double-booking.
| Appointment reminders and two-way confirmations | Used broadly to reduce no-shows (NexHealth, Tebra, athenahealth) | LOW | SMS/email channels, opt-in management, and confirmation status are baseline.
| Patient intake/check-in forms before visit | Common operational expectation (NexHealth forms, athenahealth self check-in, Tebra digital intake) | MEDIUM | Must support pre-visit demographic/consent capture and staff review.
| Basic patient portal functions | Patients expect access to appointments and communication (athenahealth portal/mobile app; OpenEMR portal) | MEDIUM | At minimum: appointment details, messaging touchpoint, and visit/payment status.
| Online payment collection for booking or balances | Digital payment flow is now standard in booking + practice tools (NexHealth, athenahealth, Tebra) | MEDIUM | Must support receipts, partial refunds, and reconciliation with appointment records.
| Waitlist/cancellation backfill | Increasingly expected for utilization (NexHealth waitlist, athenahealth proactive waitlist) | MEDIUM | Needs deterministic priority rules and expiration windows.
| Compliance-visible pricing disclosures | Patients expect upfront cost context; regulations require protections in many contexts (CMS No Surprises Act pages) | MEDIUM | For self-pay/out-of-network contexts, show estimate-style totals and clear terms before checkout.

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Hourly capacity engine with rule-based quotas | Converts provider staffing constraints into enforceable booking limits; prevents overbooking by design | HIGH | Define capacity by provider, location, visit type, and time window with hard constraints.
| Variable fee rules by slot/day/demand | Enables revenue control without manual repricing | HIGH | Fee policy should support base fee + modifiers (time-of-day, lead time, demand band).
| Fee transparency and audit trail at checkout | Builds trust and reduces disputes for dynamic pricing | HIGH | Show fee breakdown and "why this price" explanation; log rule path and computed values.
| Capacity-aware + fee-aware waitlist matching | Fills gaps with best-fit patients while respecting caps and fairness rules | HIGH | Matching should consider urgency, price tolerance, visit type, and capacity bucket.
| Simulation mode for providers (what-if calendar economics) | Lets clinics test capacity/fee rules before publishing | MEDIUM | Forecast utilization and projected revenue deltas before activating new rules.
| Policy guardrails for compliant dynamic pricing | Prevents harmful or non-compliant pricing behavior | MEDIUM | Add floor/ceiling rules, protected-time exclusions, and required patient-facing disclosures.

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full EHR charting in v1 | "One platform" appeal | Explodes scope and delays validation of booking/capacity core loop | Integrate with existing EHRs for demographics/appointment sync only.
| Full insurance claims lifecycle in v1 | Revenue-cycle completeness | High complexity, payer-specific workflows, and heavy compliance burden | Start with patient-pay + basic eligibility check integrations.
| Black-box surge pricing | Fast monetization | Trust damage, legal/compliance scrutiny, and provider reputation risk | Rule-based transparent pricing with explicit caps and rationale.
| Real-time "auction" bidding for appointment slots | Perceived yield optimization | Ethically risky for healthcare access and operationally volatile | Controlled variable fee bands with fairness constraints.

## Feature Dependencies

```
[Provider schedule primitives]
    └──requires──> [Capacity rule engine]
                         └──requires──> [Slot generation + conflict prevention]
                                              └──requires──> [Patient booking UI/API]

[Fee rule engine]
    └──requires──> [Capacity rule engine]
    └──requires──> [Checkout + payment processing]
                         └──requires──> [Receipts/refunds + ledger records]

[Waitlist automation]
    └──requires──> [Cancellation detection]
    └──requires──> [Capacity rule engine]
    └──enhances──> [Slot utilization]

[Pricing transparency + audit logs]
    └──requires──> [Fee rule engine]
    └──requires──> [Compliance policy guardrails]

[Opaque surge pricing] ──conflicts──> [Pricing transparency + patient trust]
```

### Dependency Notes

- **Capacity rule engine requires provider schedule primitives:** You cannot enforce hourly limits until schedules, visit types, and provider/location availability are normalized.
- **Fee rule engine requires capacity rule engine:** Demand-linked pricing depends on accurate availability and occupancy signals.
- **Checkout requires fee rule engine output:** The charge must be deterministic before payment authorization and receipt generation.
- **Waitlist automation requires cancellation + capacity awareness:** Backfill logic fails without real-time vacancy detection and rule-compliant slot eligibility.
- **Opaque surge pricing conflicts with trust/compliance goals:** Dynamic fees are viable only when rationale and boundaries are explicit.

## MVP Definition

### Launch With (v1)

Minimum viable product — what is needed to validate the concept.

- [ ] Provider-configurable hourly capacity rules by schedule window — core operational differentiator.
- [ ] Patient self-service booking with real-time availability — required to validate booking demand.
- [ ] Variable fee engine (time/day/demand modifiers) with transparent checkout breakdown — validates monetization hypothesis.
- [ ] Payment capture + receipt + basic refund flow — closes booking-to-payment loop.
- [ ] Reminder + confirmation workflow — protects slot utilization and baseline UX.

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Capacity-aware waitlist auto-fill — add when cancellation/no-show data supports automation tuning.
- [ ] Provider what-if simulator for fee/capacity policies — add when enough historical demand data exists.
- [ ] Basic portal enhancements (self-service reschedule/cancel, message center) — add when support ticket volume indicates need.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] EHR-grade documentation workflows — defer to avoid derailing scheduling/payment focus.
- [ ] Claims adjudication and payer contract optimization — defer due complexity and long implementation cycles.
- [ ] AI triage/assistant for scheduling conversations — defer until operational baselines and governance are mature.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Hourly capacity rule engine | HIGH | HIGH | P1 |
| Patient self-service booking | HIGH | MEDIUM | P1 |
| Variable fee rule engine + transparent checkout | HIGH | HIGH | P1 |
| Payment capture/refund basics | HIGH | MEDIUM | P1 |
| Reminders and confirmations | HIGH | LOW | P1 |
| Waitlist auto-fill | MEDIUM | MEDIUM | P2 |
| Provider simulation dashboard | MEDIUM | MEDIUM | P2 |
| Full EHR/claims features | LOW (for this product thesis) | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A (NexHealth) | Competitor B (athenahealth) | Our Approach |
|---------|---------------------------|-------------------------------|--------------|
| Online booking | Strong self-service booking + sync to record systems | Patient self-scheduling within broader patient engagement suite | Real-time booking anchored to hourly capacity constraints.
| Waitlist support | Explicit waitlist and recall products | Proactive waitlist scheduling | Capacity-aware, fee-aware backfill policy tuned for hourly limits.
| Payments | Digital payments integrated in patient workflow | Online payments in patient engagement workflow | Slot-linked fee computation + transparent charge logic before payment.
| Communications | Messaging, reminders, campaigns | Two-way texting/calls and outreach messaging | Lean v1 reminders/confirmations; add richer comms after core loop validation.
| Dynamic pricing | Not a primary marketed capability | Not a primary marketed capability | Primary differentiator with rule transparency and compliance guardrails.

## Sources

- https://www.nexhealth.com/ (feature navigation and platform capabilities) - MEDIUM
- https://www.athenahealth.com/solutions/patient-engagement (self-scheduling, check-in, payments, waitlist, messaging) - MEDIUM
- https://www.tebra.com/ (online scheduling, reminders, intake, payments in integrated workflow) - MEDIUM
- https://www.practo.com/providers (online booking, digital patient experience positioning) - MEDIUM
- https://www.doctolib.com/ (online appointment booking and teleconsultation positioning) - LOW (limited extractable detail)
- https://www.cms.gov/medical-bill-rights (No Surprises Act patient protections and good faith estimate context) - HIGH
- https://www.cms.gov/priorities/key-initiatives/burden-reduction/administrative-simplification/hipaa (HIPAA administrative simplification context) - HIGH
- https://www.open-emr.org/wiki/index.php/Patient_Portal (patient portal implementation patterns) - LOW (community wiki source)

---
*Feature research for: medical booking and appointment applications*
*Researched: 2026-02-20*
