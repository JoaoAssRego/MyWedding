# 1. Use Ruby on Rails for the API

- **Status:** accepted
- **Date:** 2026-10-10
- **Supersedes:** the NestJS + Prisma backend described in the original README

## Context

The API was planned as NestJS on Node, with Prisma for persistence and Zod schemas shared with
the React frontend through a `packages/shared` workspace. Implementation had not started: the
work so far lives in `sandbox/` — the `Money` and `Contrato` domain in TypeScript and a small
contracts API on bare `node:http`.

This project is primarily a learning project. The author is joining a volunteer project built
with Ruby on Rails (an API with a separate frontend) and has no Ruby experience. Learning Rails
on a side exercise while this project kept going in NestJS would split the available study time
(5–10 hours a week) between two backend stacks.

## Decision

Build the API with **Ruby on Rails in API mode**, persisted in PostgreSQL through ActiveRecord.
The frontend stays React + Vite + TypeScript and consumes the API over JSON.

Ruby runs in Docker for local development; there is no host Ruby installation.

## Consequences

- **The domain is ported to Ruby.** `Money` and the installment split are rewritten in Ruby
  before Rails is introduced, using the TypeScript version as the specification. The
  TypeScript sandbox stays in the repository as history.
- **Domain names switch to English** (`Contract`, `Installment`) to work with Rails'
  inflector; the TypeScript sandbox keeps its Portuguese names.
- **No shared types between API and web.** `packages/shared` is removed. Validation lives in
  database constraints and ActiveRecord validations; the frontend keeps its own types for the
  API responses. If drift between the two becomes a problem, an OpenAPI description generated
  from the API is the candidate fix.
- **Tenant isolation keeps its three layers** — tenant from the session only, application-level
  scoping on every query, Postgres row level security — implemented with Rails mechanisms
  instead of a Prisma extension.
- **Hand-written SQL stays** for reports and for learning: migrations are read against the SQL
  they generate.
- **Cost:** a new language adds roughly one to two months to the study plan, partly offset by
  dropping NestJS and Prisma.
