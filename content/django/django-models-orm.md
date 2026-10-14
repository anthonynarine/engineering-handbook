<!-- content/django/django-models-orm.md — Curated engineering guidance and reference examples. -->
---
title: "Models, migrations and transactional ORM work"
slug: "django-models-orm"
section: "django"
summary: "Use the database for invariants and make query cost visible."
order: 2.4
tags: ["django", "architecture", "practical guide"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/django-toolkit.md"]
related: ["services-and-selectors", "ledger-and-read-models", "reports-data"]
---

## Model the durable truth

Use foreign keys for relationships, explicit nullability and database constraints for invariants. Store currency with a suitable decimal representation, not binary floating point. Choose deletion behavior intentionally; historical financial records often need a different policy from disposable personal tasks.

Migrations describe schema evolution and belong in Git. Run `makemigrations`, inspect the migration and apply it against a development database. Editing a model without a migration does not change the deployed schema.

## Make reads deliberate

QuerySets are lazy. Serializing related fields can create N+1 queries. Use `select_related` for single-valued relationships and `prefetch_related` for collections when the representation needs them. Measure with realistic row counts rather than adding every relationship preemptively.

Always scope before lookup. `Task.objects.get(id=...)` is unsafe in an owner-scoped endpoint unless ownership is subsequently enforced correctly. Prefer a filtered queryset that cannot retrieve the forbidden record at all.

## Protect concurrent writes

Use `transaction.atomic` for changes that must commit together. A uniqueness constraint protects against concurrent duplicate inserts; a prior `exists()` check alone does not. Where a workflow needs a row lock, acquire it inside the transaction and verify the behavior against PostgreSQL. SQLite is not evidence of PostgreSQL locking semantics.

An `on_commit` callback runs after a successful commit; it is not a durable delivery guarantee if the process crashes before publishing a job. Use an outbox when losing the event is unacceptable. See [Django transactions](https://docs.djangoproject.com/en/5.2/topics/db/transactions/).

## Evolve production safely

For a required field on existing records, consider adding it nullable, backfilling in bounded work, then enforcing the constraint. Check old and new application versions can coexist during deployment. Treat destructive schema changes as a separate release decision with backups and recovery steps.

The [EstateIQ ledger](/guide/ledger-and-read-models) shows why authoritative financial records and derived snapshots have different jobs. Test constraint violations, rollback, query counts and concurrent operations—not only the happy-path serializer.
