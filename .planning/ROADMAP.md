# Roadmap: MedBooker

## Overview

MedBooker v1 delivers a complete clinic-to-patient booking loop in four requirement-driven phases: first enforce hourly capacity integrity, then add variable pricing with transparent booking, then complete payment and portal lifecycle operations, and finally add patient readiness and deterministic waitlist refill to improve utilization.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Capacity Foundations** - Providers define hourly limits and the system enforces no-overbooking rules.
- [ ] **Phase 2: Priced Booking Flow** - Patients book real-time slots with transparent, rule-based fees.
- [ ] **Phase 3: Payment and Booking Ledger** - Paid bookings, refunds, and portal payment visibility are reliable.
- [ ] **Phase 4: Visit Readiness and Waitlist** - Reminders, intake, and deterministic waitlist offers improve fill and attendance.

## Phase Details

### Phase 1: Capacity Foundations
**Goal**: Providers can control visit volume per hour and trust that capacity limits are never exceeded.
**Depends on**: Nothing (first phase)
**Requirements**: CAPA-01, CAPA-02
**Success Criteria** (what must be TRUE):
  1. Provider can configure visit capacity limits per hour for each schedule window.
  2. Patient-facing availability never allows bookings beyond configured hourly capacity.
  3. When an hour reaches capacity, additional booking attempts are blocked with clear unavailability.
**Plans**: TBD

### Phase 2: Priced Booking Flow
**Goal**: Patients can discover and book available slots with deterministic, transparent pricing.
**Depends on**: Phase 1
**Requirements**: BOOK-01, PRIC-01, PRIC-02
**Success Criteria** (what must be TRUE):
  1. Patient can view real-time slot availability and book an appointment online.
  2. Provider can define variable booking fees by slot, day, or demand rule.
  3. Patient sees the fee and total charge before confirming the booking.
**Plans**: TBD

### Phase 3: Payment and Booking Ledger
**Goal**: Booking financial lifecycle is complete, with payment capture, refunds, and visible status.
**Depends on**: Phase 2
**Requirements**: PAYM-01, PAYM-02, PORT-01
**Success Criteria** (what must be TRUE):
  1. Patient can pay for a booking at checkout and receive a receipt.
  2. Staff can issue a partial or full refund tied to a booking.
  3. Patient can view booked appointments and payment status in the portal.
**Plans**: TBD

### Phase 4: Visit Readiness and Waitlist
**Goal**: Clinics can improve attendance and refill canceled capacity using patient operations workflows.
**Depends on**: Phase 3
**Requirements**: COMM-01, INTK-01, WAIT-01
**Success Criteria** (what must be TRUE):
  1. Patient receives appointment reminders and can confirm attendance.
  2. Patient can complete a pre-visit intake/check-in form before the appointment.
  3. When a slot is canceled, waitlisted patients are offered openings using deterministic ordering rules.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Capacity Foundations | 0/TBD | Not started | - |
| 2. Priced Booking Flow | 0/TBD | Not started | - |
| 3. Payment and Booking Ledger | 0/TBD | Not started | - |
| 4. Visit Readiness and Waitlist | 0/TBD | Not started | - |
