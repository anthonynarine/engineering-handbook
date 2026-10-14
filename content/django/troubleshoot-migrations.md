<!-- content/django/troubleshoot-migrations.md — Symptom-led investigation and verification guidance. -->
---
title: "Troubleshoot: a migration or release schema check fails"
slug: "troubleshoot-migrations"
summary: "Inspect migration state, privileges and application compatibility before retrying a deployment."
section: "django"
order: 85
tags: ["troubleshooting", "diagnosis", "failure", "verification"]
status: "established-pattern"
lastReviewed: "2026-10-14"
sources: ["reference_sources/troubleshooting.md"]
related: ["django-models-orm", "lumen-aws-release", "recovery-runbook"]
---

## Symptom

A deploy fails during schema changes, the application reports a missing column, or authorization breaks after a migration.

## 1. Preserve the first error and target identity

Record the release revision, intended database/environment, migration name and safe error category. Confirm the command used the expected settings and database role without printing a connection string or password.

```bash
# Read-only framework diagnostics — backend/ in the intended application environment.
python manage.py showmigrations --plan
python manage.py makemigrations --check --dry-run
```

`showmigrations` reads migration history. The second command checks whether model changes need migration files; it does not prove the existing database schema matches them. Neither command applies a migration or replaces the project's release process.

## 2. Classify the failure

| Observation | Investigate |
| --- | --- |
| Missing migration file | Candidate/branch contents and committed dependencies |
| Applied history disagrees | Database target and release/migration history |
| Constraint or backfill failure | Existing data, bounded repair plan and concurrent writes |
| Lock wait or timeout | Blocking transactions and operational migration strategy |
| Permission/view errors | Role ownership and restored grants/RLS policy |
| New code sees old schema | Rollout ordering and compatibility window |

Do not reach for `--fake`, drop a database, edit applied migration history or grant superuser as a generic fix. Those actions can hide a mismatch or destroy evidence. Diagnose and review a repair suitable to the actual environment.

## 3. Respect the application's migration contract

Lumen's inspected initialization sequence includes roles, Reports migrations, Media schema, RLS, runtime grants and verification. A bare migrate can be insufficient for its full authorization contract. Its proposed RDS deployment also needs a privilege-compatibility review. Follow the [Lumen release gates](/guide/lumen-aws-release), not a generic reset recipe.

For safer changes, separate expanding the schema, backfilling records and enforcing the final constraint when necessary. Plan coexistence of old/new application versions and a rollback compatible with the data change.

## Verify the correction

Use a representative isolated database to test the migration and application compatibility. Recheck constraints, tenant policies, service grants and affected queries. Validate backup restoration before destructive changes. A successful migration exit code alone does not prove clinical/tenant authorization still works.

The handbook executes no database commands; these examples require the application's approved diagnostic access.
