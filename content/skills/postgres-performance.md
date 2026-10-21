<!-- content/skills/postgres-performance.md — Teach indexes, query plans, transactions and connection pooling for Django on PostgreSQL. -->
---
title: "PostgreSQL performance: indexes, query plans, and connections"
slug: postgres-performance
section: skills
summary: "Find why a page is slow, fix it at the query, and keep the app inside its connection limit."
order: 4
tags: [skills, postgresql, database, performance, indexes, explain, transactions, connection pooling, orm, concepts, education]
status: established-pattern
lastReviewed: "2026-10-20"
sources: [reference_sources/skills-gap-review.md]
related: [skills-gap-map, django-models-orm, safe-database-migrations, caching-and-rate-limiting, services-and-selectors]
---

## What am I learning?

Most slow pages in a Django app are database problems: too many queries, a query with no usable index, or too many connections. The ORM makes queries easy to write and easy to forget about. This lesson covers how to see what the database is actually doing, and how to fix it at the source.

## Count queries first: the N+1 problem

The most common problem is not one slow query. It's hundreds of fast ones.

```python
# 1 query for accounts, then 1 more per account for its institution
for account in Account.objects.filter(household=household):
    print(account.institution.name)

# 2 queries total, however many accounts there are
accounts = Account.objects.filter(household=household).select_related("institution")
```

Use `select_related` for foreign keys and one-to-one fields (a SQL join), and `prefetch_related` for many-to-many and reverse relations (a second query). In development, count queries per request with the Django Debug Toolbar or `assertNumQueries` in tests. Django's [database optimization guide](https://docs.djangoproject.com/en/5.2/topics/db/optimization/) lists more techniques.

Put these query shapes in [selectors](/guide/services-and-selectors), so each one is fixed and tested once.

## Indexes

An [index](https://www.postgresql.org/docs/current/indexes.html) lets PostgreSQL find rows without reading the whole table. The default B-tree index handles equality, ranges and sorting.

Index what the app actually filters and sorts by. A multi-tenant app nearly always filters by tenant first:

```python
class Transaction(models.Model):
    household = models.ForeignKey(Household, on_delete=models.CASCADE)
    posted_at = models.DateTimeField()

    class Meta:
        indexes = [models.Index(fields=["household", "-posted_at"])]
```

Column order matters. This index serves "this household's transactions, newest first," but not "all transactions on a date" across households. Indexes are not free: each one slows writes and uses storage, so add them for real query patterns. Build large indexes concurrently, following the [safe migrations](/guide/safe-database-migrations) guide.

## Read the query plan

[`EXPLAIN ANALYZE`](https://www.postgresql.org/docs/current/using-explain.html) runs a query and shows how PostgreSQL executed it. Django can produce it directly:

```python
print(Transaction.objects.filter(household=h).order_by("-posted_at")[:50].explain(analyze=True))
```

What to look for:

- **Seq Scan** on a large table where I expected an index: the index is missing, or doesn't match the filter.
- **Estimated rows far from actual rows**: stale statistics. `ANALYZE` refreshes them.
- **Where the time goes**: each node reports its actual time. Fix the most expensive node first.

`EXPLAIN ANALYZE` really executes the query. Wrap data-changing statements in a transaction and roll back.

## Transactions and isolation

A transaction makes several changes succeed or fail together. In Django, `transaction.atomic()` provides that. PostgreSQL's default [isolation level](https://www.postgresql.org/docs/current/transaction-iso.html) is Read Committed: each statement sees data committed before it began. That means a read-then-write can race:

```python
with transaction.atomic():
    budget = Budget.objects.select_for_update().get(pk=budget_id)
    budget.spent += amount
    budget.save()
```

`select_for_update()` locks the row until the transaction ends, so two requests cannot both read the old value. Alternatively, update in the database (`F("spent") + amount`) or use version checks. Keep transactions short. Never wait on a network call while holding a lock.

## Connections and pooling

Every PostgreSQL connection is a server process with real memory cost, and every plan has a connection limit. A Django process opens one connection per thread or worker. Total connections = web processes × workers per process + background workers + one-off scripts. That number must stay under the limit.

| Option | What it does |
| --- | --- |
| `CONN_MAX_AGE` | Reuses a connection across requests instead of reconnecting each time. The default `0` closes after every request. |
| `CONN_HEALTH_CHECKS` | Checks a reused connection before use, so a dropped connection fails cleanly. |
| Django's PostgreSQL pool | Django 5.1+ with psycopg 3 can keep a [connection pool](https://docs.djangoproject.com/en/5.2/ref/databases/#connection-pool) per process. |
| PgBouncer | A separate pooler shared by all processes. Use it when many processes need more connections than the database allows. |

"Too many connections" errors usually mean the math above was never done, not that the database is too small.

## Exercise

Pick the slowest page in one app. Count its queries, remove any N+1 pattern, run `explain(analyze=True)` on its main query, and add one index if the plan shows a sequential scan on a large table. Done means: the page's query count is fixed and tested with `assertNumQueries`, and before-and-after timings are recorded.

## Check your understanding

- A list page runs 201 queries for 100 rows. What is the likely cause?
- Why does an index on `(household, posted_at)` not help a query filtering only by `posted_at`?
- Two requests add to the same budget at once and one update is lost. What prevents it?
- Why can "too many connections" happen on a database with low CPU usage?

## Answer key

An N+1 pattern: one query for the list plus one or two per row; fix it with `select_related` or `prefetch_related`. A B-tree index is ordered by its first column, so it cannot efficiently find rows by the second column alone. Locking the row with `select_for_update()`, updating with an `F()` expression, or a version check. Connections are limited by count, not by load: each process holds connections whether or not it's busy.
