# Stack Research

**Domain:** Medical booking and appointment applications (capacity-per-hour + variable booking fees)
**Researched:** 2026-02-20
**Confidence:** MEDIUM

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Node.js | 24 LTS (minimum 22 LTS) | Runtime for web and API services | Node 24 is Active LTS and the ecosystem standard for TypeScript backends in 2025/2026; Node 22 remains a safe floor for compatibility. |
| Next.js | 16.x | Patient/provider web app (SSR + server components) | Next.js is the dominant React full-stack framework, with strong routing, data loading, and production deployment patterns for booking flows. |
| NestJS | 11.x | Domain API (scheduling, pricing, booking, payments orchestration) | NestJS provides opinionated modules, DI, validation, and guard/interceptor patterns that keep healthcare business rules maintainable as complexity grows. |
| PostgreSQL | 16+ (managed on Amazon RDS) | Source of truth for slots, provider rules, bookings, and pricing audit trail | Postgres gives strict transactions, row locking, constraints, and partial indexes needed to prevent overbooking and keep fee computation deterministic/auditable. |
| Redis | 7.x (ElastiCache) | Short-lived availability cache, rate limiting, queue backend | Redis is standard for low-latency slot reads and background processing fan-out (notifications, retries, idempotency windows). |
| AWS | HIPAA-eligible services with signed BAA | Hosting, data, encryption, observability, perimeter security | For US healthcare workloads, AWS provides a mature HIPAA operating model plus documented BAA and service eligibility boundaries. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `prisma` + `@prisma/client` | 7.x | Type-safe DB access + migrations | Use by default for rapid, safe iteration on booking and pricing models; switch to hand-written SQL for extreme hotspot queries only. |
| `zod` | 3.x/4.x | Runtime validation for pricing and scheduling rules | Use at all ingress boundaries (API, web forms, webhooks) where malformed rule payloads can cause billing defects. |
| `date-fns` + `date-fns-tz` | 3.x + 2.x | Timezone-safe slot generation and display | Use for all slot math; store canonical UTC in DB and convert at edges to avoid DST overbooking bugs. |
| `stripe` | 20.x | Card collection and payment flows | Use for PCI scope reduction; keep PHI out of Stripe object metadata and descriptions. |
| `bullmq` | 5.x | Background jobs (reminders, webhooks, reconciliation) | Use for asynchronous tasks that must not block booking confirmation UX. |
| `@opentelemetry/api` (+ SDK/exporter) | 1.x | Traces/metrics across web/API/queue | Use from day 1 for incident diagnosis of booking failures and payment edge cases. |
| `pino` | 9.x | Structured application logging | Use with PHI redaction rules enabled before any production data is processed. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| pnpm | Deterministic package management | Faster monorepo installs and lower disk usage than npm in multi-package stacks. |
| Turborepo | Monorepo task orchestration | Keeps web/API/shared-domain packages aligned without CI slowdown. |
| Playwright | End-to-end booking/payment testing | Cover critical flows: slot contention, fee recalculation, payment success/failure, webhook retries. |
| Terraform | Infra-as-code for AWS environments | Required for auditable, repeatable environment setup and compliance evidence. |

## Installation

```bash
# Core
pnpm add next react react-dom @nestjs/common @nestjs/core @nestjs/platform-fastify

# Supporting
pnpm add prisma @prisma/client zod date-fns date-fns-tz stripe bullmq ioredis pino @opentelemetry/api

# Dev dependencies
pnpm add -D typescript @types/node playwright turbo eslint prettier
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| PostgreSQL (RDS) | MySQL 8 | Choose MySQL only if the team already has deep MySQL operational expertise and proven booking-locking patterns. |
| NestJS | FastAPI (Python) | Choose FastAPI when the org is Python-first and plans immediate ML-heavy triage/scoring in the booking pipeline. |
| AWS managed services | GCP/Azure managed services | Use when your compliance/legal team already has enterprise contracts and BAA workflows there. |
| BullMQ (Redis) | Temporal | Choose Temporal when workflows become long-running, multi-step, and compensation-heavy across days/weeks. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| MongoDB as primary booking store | Slot capacity and pricing correctness need strong relational constraints and transactional locking under contention. | PostgreSQL with transactional booking writes and idempotency keys. |
| Storing PHI in payment processor metadata | Payment metadata is easy to over-share and can create compliance risk; Stripe explicitly warns against sensitive data in metadata. | Store only internal opaque IDs in payment metadata; keep PHI in your HIPAA-scoped DB. |
| Any cloud/service without signed BAA for PHI workloads | HIPAA operations require contractual and technical controls, not just encryption defaults. | Use HIPAA-eligible services under executed BAAs and document boundaries per system component. |
| Calendar-first architecture without a transactional booking core | Calendar APIs are useful for sync, but not sufficient as the source of truth for overbooking prevention and fee auditability. | Treat Postgres booking ledger as source of truth; sync outward to calendars asynchronously. |

## Stack Patterns by Variant

**If greenfield MVP (single region, first 5-20 clinics):**
- Use Next.js + NestJS + Postgres + Redis + Stripe on AWS ECS/Fargate.
- Because it gives fast delivery with clean separation between UX and critical booking/payment domain logic.

**If scaling to multi-location groups and higher concurrency:**
- Add read replicas, partition large booking tables by time, and adopt queue-first notification/payment reconciliation.
- Because slot contention and reminder/webhook load become operational bottlenecks before raw API CPU does.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `@nestjs/core@11` | `node >=20` | Prefer Node 22/24 in production for longer support runway. |
| `next@16` | `react@18.2+` or `react@19` | For new builds, standardize on React 19 unless a dependency blocks it. |
| `@prisma/client@7` | `typescript >=5.4` | Keep `prisma` and `@prisma/client` on same minor version. |

## Healthcare Security and Compliance Notes

- Classify booking data (patient identity + provider association + appointment context) as sensitive from day 1.
- Enforce encryption in transit (TLS 1.2+) and at rest (KMS-managed keys for DB, object storage, backups).
- Implement least-privilege IAM, per-environment account separation, and immutable audit logs.
- Add PHI-safe defaults: log redaction, webhook signature verification, strict idempotency, and tamper-evident pricing audit records.
- Keep payment card handling delegated to Stripe-hosted components to reduce PCI scope, but do not treat PCI controls as HIPAA coverage.

## Sources

- https://nextjs.org/docs - official docs; verified current stable line and production guidance (MEDIUM)
- https://docs.nestjs.com - official framework docs for architecture patterns (MEDIUM)
- https://www.prisma.io/docs - official Prisma ORM docs and current docs version marker (MEDIUM)
- https://www.postgresql.org/docs/current/ - official PostgreSQL documentation and supported major versions (MEDIUM)
- https://nodejs.org/en/about/previous-releases - official Node release/LTS status (HIGH)
- https://aws.amazon.com/compliance/hipaa-compliance/ - AWS BAA/HIPAA eligibility guidance (HIGH)
- https://stripe.com/docs/metadata - Stripe sensitive-data warning for metadata (HIGH)
- `npm view` registry metadata for package versions/engines (`next`, `@nestjs/core`, `prisma`, `@prisma/client`, `stripe`, `bullmq`, `typescript`) (MEDIUM)

---
*Stack research for: Medical booking and appointment applications*
*Researched: 2026-02-20*
