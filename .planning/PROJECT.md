# MedBooker

## What This Is

MedBooker is a booking and appointment application for medical practices that need flexible scheduling and pricing control. Providers define how many visits they can accept per hour, and patients book available slots by paying a variable fee set by the provider. The product focuses on giving clinics predictable capacity management while making booking fast and transparent for patients.

## Core Value

Providers can reliably control appointment capacity per hour and monetize each booking with flexible pricing.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Providers can configure hourly visit capacity by schedule window
- [ ] Providers can define variable booking fees by slot, day, or demand rule
- [ ] Patients can discover, book, and pay for available appointment slots

### Out of Scope

- Insurance claims processing and payer adjudication — not required to validate booking and pricing core loop
- EHR charting and clinical documentation workflows — outside the scheduling and payment scope for v1

## Context

The initial product targets clinics and independent medical providers that currently manage overbooked schedules or static pricing. Capacity and fee flexibility are first-class constraints because appointment economics vary by provider, time, and demand. The first release should prioritize a complete provider-to-patient booking loop over broad healthcare platform features.

## Constraints

- **Compliance**: Handle PHI carefully and follow healthcare data privacy expectations — booking data is sensitive
- **Pricing**: Variable fee logic must be auditable and deterministic — providers need trust in what patients are charged
- **Scheduling**: Capacity enforcement must prevent overbooking per hour — this is the core operational constraint
- **Scope**: v1 stays focused on booking, capacity, and payment — avoids broad practice-management expansion

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Start with provider-defined hourly capacity controls | Capacity management is the core provider pain and primary product differentiator | — Pending |
| Include variable booking fees in v1 | Revenue flexibility is central to the requested product value | — Pending |
| Exclude full EHR/claims workflows from v1 | Keeps first milestone focused and shippable | — Pending |

---
*Last updated: 2026-02-20 after initialization*
