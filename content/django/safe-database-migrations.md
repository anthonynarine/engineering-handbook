<!-- content/django/safe-database-migrations.md — Practical reference and clearly scoped verification guidance. -->
---
title: "Database changes: expand, backfill, then enforce"
slug: "safe-database-migrations"
summary: "Plan schema evolution around live data, old clients, permissions and recovery."
section: "django"
order: 87
tags: ["reference", "contracts", "delivery", "manual"]
status: "established-pattern"
lastReviewed: "2026-10-14"
sources: ["reference_sources/manual-reference.md"]
related: ["django-models-orm", "troubleshoot-migrations", "lumen-aws-release"]
---

## Treat a migration as a release operation

Record the affected table size, existing data, dependent code, lock/concurrency behavior, expected duration and failure plan. Review generated migrations before applying them. Use a representative isolated database and the production database engine for meaningful rehearsal.

## A safe change has stages

For a new required field on existing rows, a useful pattern is:

1. **Expand:** add a compatible nullable/default-capable representation as appropriate to the database and workload.
2. **Deploy compatible code:** support old and new records during the transition and prevent creation of new invalid data.
3. **Backfill:** update existing rows in bounded, restartable batches with a measured load policy.
4. **Verify:** check remaining nulls/invalid values and race conditions with concurrent writes.
5. **Enforce:** add the intended constraint and retire the compatibility code in a reviewed later step.

This is a planning pattern, not a claim that every schema change requires five releases. Select the actual database operation after inspecting generated SQL and its locking behavior.

## Keep data migrations historical

Use Django's migration app registry for model state inside `RunPython`; importing today's application model can make an old migration depend on future code. Preserve dependencies when a migration touches another app. Define reversibility honestly: a destructive transformation may need restoration rather than a meaningful reverse function. See [Django's migration guidance](https://docs.djangoproject.com/en/5.2/howto/writing-migrations/).

A large backfill can be better represented as separately supervised work than one long transaction. Define progress, retry, idempotency and how the final constraint is gated on completion.

## Preserve authorization infrastructure

Schema changes can affect views, grants, RLS and runtime roles as well as columns. Test the application under its actual restricted database roles. For Lumen, preserve the staged schema/RLS/grant verification process described in its [AWS release plan](/guide/lumen-aws-release); do not replace it with a generic migration command.

## Separate code rollback from data rollback

Can the previous application revision still run after the new schema change? Can the new revision tolerate records created by the old one? Answer those questions before rollout. Removing a column or rewriting clinical/financial data may make a simple code rollback insufficient.

Take the appropriate protected recovery point, verify restoration beforehand and define who can authorize a destructive recovery. Do not automatically reverse migrations after an application error without assessing what data was written.

## Release evidence

Record the candidate and migration set, reviewed SQL/plan, rehearsal results, data validation, permissions checks, deployment sequence and recovery decision. Exercise interruption during backfill and verify restart behavior. Use the [migration troubleshooting guide](/guide/troubleshoot-migrations) when the actual environment differs from the plan.

No migration, database or backup operation is executed by this handbook.
