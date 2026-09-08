# MyWedding

A wedding finance planner: contracts, installments, payments and savings in one place, so a
couple can answer the only question that really matters while planning a wedding —

> **Does the money we have saved, plus what we will set aside, cover every bill due before the
> wedding day?**

Most couples track this in a spreadsheet. Spreadsheets handle the arithmetic, but they cannot
tell you that a single R$ 9.000 transfer settled three different installments, that a vendor
was paid twice, or that you will run out of cash in April even though the total still looks
fine. That gap is what this project is about.

> **Status: early development.** The domain and architecture are designed and documented; the
> implementation is being built module by module. Setup instructions will land with the first
> running slice. See [Roadmap](#roadmap).

## Why it is built this way

This is a real tool for a real wedding, and also a deliberate exercise in modelling money
correctly. A few decisions carry most of the weight:

**Money is never a floating point number.** Every amount is stored as a `BIGINT` of cents and
handled by an immutable `Money` value object. `0.1 + 0.2 !== 0.3` is not an academic curiosity
when you are splitting R$ 28.500 into ten installments — it is a lost cent that makes a report
disagree with a bank statement.

**A payment is not an installment.** They are linked many-to-many through allocations, because
real life does not line up one to one: one PIX transfer can settle three installments, and one
installment can be settled by two partial payments. Modelling this from day one is what makes
bank statement reconciliation possible later instead of a rewrite.

**Installment status is derived, never stored.** `PENDING`, `PARTIAL`, `PAID` and `OVERDUE` are
computed from the sum of allocations against the installment amount and its due date. A status
column would be a second source of truth, and the two would drift.

**Budget, contract and payment are three different numbers.** A category shows *planned* vs
*contracted* vs *paid*, so the overspend is visible before it happens — not after the vendor
is hired.

**Savings tell the truth about the past and estimate the future.** Deposits and manual balance
snapshots are facts taken from the bank; yields are only projected forward, calibrated against
the real CDI series from the Brazilian Central Bank. Computing past interest from a rate would
quietly disagree with the actual statement, and a number you cannot trust is worse than no
number.

**Tenant isolation is defence in depth.** Every business row belongs to a `wedding_id`, enforced
at three layers: a guard that reads the tenant from the JWT only, a Prisma extension that
injects the filter into every query, and row level security in Postgres as the last barrier.
A test proves that one tenant cannot read another's data.

The reasoning behind each choice is recorded as an ADR in [`docs/adr/`](docs/adr).

## Stack

| Layer | Choice |
|---|---|
| API | Node, NestJS, TypeScript |
| Database | PostgreSQL, Prisma for CRUD, hand-written SQL for reports |
| Web | React, Vite, TanStack Query, React Router, Tailwind, shadcn/ui |
| Validation | Zod schemas shared between API and web |
| Files | S3-compatible storage, presigned uploads (MinIO locally, R2 in production) |
| Tests | Unit tests on the domain, integration tests on a real Postgres via Testcontainers, Playwright for critical flows |
| Ops | Docker Compose for local development, GitHub Actions for CI, structured logs with pino |

## Repository layout

```
apps/
  api/     NestJS application
    src/domain/    pure business rules, no framework and no I/O
    src/modules/   contracts, payments, accounts, reports, auth, ...
    prisma/        schema and migrations
  web/     React + Vite application
packages/
  shared/  Zod schemas and API contract types
docs/
  adr/     architecture decision records
  curso/   study plan (in Portuguese)
```

The `domain` folder imports neither NestJS nor Prisma. Business rules that can be tested with a
plain function call stay that way.

## Domain model

`Vendor` → `Contract` → `Installment` → `Payment`, with `PaymentAllocation` connecting payments
to installments. `Category` carries a `BudgetLine` for planned spend. `Account` holds savings,
with `AccountEntry` for deposits and withdrawals and `BalanceSnapshot` for observed balances.
Payments debit an account, which is what keeps the cash flow projection honest.

## Roadmap

- [ ] Foundation — monorepo, Docker Compose, migrations, auth, tenant isolation, CI
- [ ] Core finance — categories, budget, vendors, contracts, installments, payments, accounts
- [ ] Reports — planned vs contracted vs paid, cash flow projection, dashboard
- [ ] Attachments — contracts and receipts via presigned upload
- [ ] Due date alerts — daily job and email digest
- [ ] Real CDI rates from the Central Bank SGS API, with a manual rate as fallback
- [ ] Audit log
- [ ] Bank statement import (OFX/CSV) and reconciliation
- [ ] Public guest area under `/w/:slug`

## About this project

Built by [João Assunção](https://github.com/) as a learning project: every line is written by
hand, on purpose, to learn backend engineering properly rather than to assemble something
quickly. The study plan is in [`docs/curso/`](docs/curso/00-plano-de-estudos.md).

The interface is in Brazilian Portuguese; code, commits and technical documentation are in
English.
