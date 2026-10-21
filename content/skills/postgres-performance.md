<!-- content/skills/postgres-performance.md — Teach indexes, query plans, transactions and connection pooling for Django on PostgreSQL. -->
---
title: "PostgreSQL performance: indexes, query plans, and connections"
slug: postgres-performance
section: skills
summary: "Find why a page is slow, fix it at the query, and keep the app inside its connection limit."
order: 4
tags: [skills, postgresql, database, performance, indexes, explain, pagination, transactions, connection pooling, orm, concepts, education]
status: established-pattern
lastReviewed: "2026-10-20"
sources: [reference_sources/skills-gap-review.md]
related: [skills-gap-map, django-models-orm, safe-database-migrations, caching-and-rate-limiting, services-and-selectors]
lesson:
  level: Intermediate
  duration: 75 minutes
  prerequisites: [django-models-orm, services-and-selectors]
  objectives:
    - Find and remove N+1 query patterns in Django views and selectors
    - Read an EXPLAIN ANALYZE plan and choose the right index
    - Replace OFFSET pagination with keyset pagination for large lists
    - Prevent lost updates with locks or optimistic concurrency
    - Keep total database connections under the plan's limit
---

## What am I learning?

Most slow pages in a Django app are database problems: too many queries, a query with no usable index, or too many connections. The ORM makes queries easy to write and easy to forget about. This lesson is about seeing what the database actually does and fixing problems at the source, before reaching for a cache.

## Core concepts

| Concept | What it means |
| --- | --- |
| Query count | How many round trips one request makes. Many fast queries can be slower than one slow one. |
| Index | A sorted structure that finds rows without scanning the whole table. B-tree is the default. |
| Query plan | How PostgreSQL decides to run a query: which indexes, joins and scans. |
| Transaction | Changes that succeed or fail together. `transaction.atomic()` in Django. |
| Isolation level | What a transaction can see of others' work. PostgreSQL's default is [Read Committed](https://www.postgresql.org/docs/current/transaction-iso.html). |
| Connection | A server process with real memory cost. Every plan has a limit. |

## Modern patterns

| Pattern | Problem it solves | Use it when |
| --- | --- | --- |
| **Eager loading** (`select_related`, `prefetch_related`) | N+1 queries in lists | Any list that shows related data |
| **Composite indexes led by the tenant** | Multi-tenant queries scanning other tenants' rows | Tables filtered by household or organization |
| **Partial indexes** | Indexing rows that are never queried | Queries on a subset, such as `WHERE status = 'pending'` ([docs](https://www.postgresql.org/docs/current/indexes-partial.html)) |
| **Covering indexes** (`INCLUDE`) | Extra table lookups after the index | Hot queries reading a few extra columns ([index-only scans](https://www.postgresql.org/docs/current/indexes-index-only-scans.html)) |
| **Keyset (cursor) pagination** | `OFFSET 50000` reads and discards 50,000 rows | Long or infinite lists; DRF [CursorPagination](https://www.django-rest-framework.org/api-guide/pagination/#cursorpagination) |
| **Optimistic concurrency** | Lost updates without holding locks | Edits by people, using a version column, as in the Moneta budgets feature |
| **Pessimistic locking** (`select_for_update`) | Two writers reading the same old value | Short, critical read-modify-write steps |
| **Expand and contract migrations** | Schema changes that lock tables or break running code | Every production schema change ([safe migrations](/guide/safe-database-migrations)) |
| **Read models** | Expensive aggregations on every page load | Dashboards and ledgers ([read models](/guide/ledger-and-read-models)) |
| **Measure with `pg_stat_statements`** | Guessing which queries matter | Production: rank queries by total time ([docs](https://www.postgresql.org/docs/current/pgstatstatements.html)) |

## Anti-patterns to avoid

- **Queries in a loop.** The classic N+1.
- **Deep OFFSET pagination.** Each later page gets slower.
- **Indexing every column.** Each index slows writes and costs storage.
- **Long transactions.** They hold locks and block cleanup.
- **Network calls inside a transaction.** A slow provider now holds database locks.
- **Exact `COUNT(*)` on huge tables for every page.** Show "more results" or an estimate instead.
- **Caching first.** A cache over a slow query hides the problem until the cache misses.

## Build it step by step

**Step 1: count queries.** The most common problem isn't one slow query; it's hundreds of fast ones.

```python
# 1 query for accounts, plus 1 per account for its institution
for account in Account.objects.filter(household=household):
    print(account.institution.name)

# 2 queries total, however many accounts there are
accounts = Account.objects.filter(household=household).select_related("institution")
```

Lock the fix in with a test:

```python
def test_account_list_query_count(self):
    with self.assertNumQueries(2):
        list(account_list(self.household))
```

**Step 2: index the real access pattern.** A multi-tenant app nearly always filters by tenant first:

```python
class Transaction(models.Model):
    household = models.ForeignKey(Household, on_delete=models.CASCADE)
    posted_at = models.DateTimeField()

    class Meta:
        indexes = [models.Index(fields=["household", "-posted_at"])]
```

Column order matters. This serves "this household's transactions, newest first," but not a date filter across all households.

**Step 3: read the plan.**

```python
print(Transaction.objects.filter(household=h).order_by("-posted_at")[:50].explain(analyze=True))
```

Look for a **Seq Scan** on a large table, **estimated rows far from actual rows** (stale statistics; run `ANALYZE`), and the node with the most actual time. [`EXPLAIN ANALYZE`](https://www.postgresql.org/docs/current/using-explain.html) really runs the query, so wrap data changes in a transaction and roll back.

**Step 4: paginate by key, not offset.**

```python
page = (Transaction.objects
        .filter(household=h, posted_at__lt=cursor)
        .order_by("-posted_at")[:50])
```

The index from step 2 finds the next page directly, however deep the user scrolls. Use a unique tiebreaker such as `id` when timestamps can repeat.

**Step 5: prevent lost updates.**

```python
with transaction.atomic():
    budget = Budget.objects.select_for_update().get(pk=budget_id)
    budget.spent += amount
    budget.save()
```

Or update in one statement with `F("spent") + amount`, or check a version column and reject stale edits. Keep the transaction short.

**Step 6: do the connection math.** Total = web processes × workers per process + background workers + one-off scripts. It must stay under the plan's limit.

| Option | What it does |
| --- | --- |
| `CONN_MAX_AGE` | Reuses a connection across requests. The default `0` closes after every request. |
| `CONN_HEALTH_CHECKS` | Checks a reused connection before use. |
| Django's PostgreSQL pool | Django 5.1+ with psycopg 3 can keep a [pool](https://docs.djangoproject.com/en/5.2/ref/databases/#connection-pool) per process. |
| PgBouncer | A shared pooler for when many processes need more connections than the database allows. |

Checkpoint: the page's query count is fixed by a test and its main query uses an index scan.

## Exercise

Pick the slowest list page in one app.

1. Count its queries and remove any N+1 pattern.
2. Run `explain(analyze=True)` on the main query.
3. Add one index if the plan shows a sequential scan on a large table.
4. Switch the endpoint to cursor pagination if the list can grow large.
5. Record before-and-after timings.

**Done means:** `assertNumQueries` protects the page, the plan uses an index, and timings are recorded.

## Check your understanding

- A list page runs 201 queries for 100 rows. What is the likely cause?
- Why doesn't an index on `(household, posted_at)` help a query filtering only by `posted_at`?
- Why does page 1,000 get slower with OFFSET pagination but not with keyset pagination?
- Two requests add to the same budget at once and one update is lost. What prevents it?
- Why can "too many connections" happen on a database with low CPU usage?

## Answer key

An N+1 pattern; fix it with `select_related` or `prefetch_related`. A B-tree index is ordered by its first column, so it can't efficiently find rows by the second column alone. OFFSET reads and discards every earlier row; a keyset query jumps straight to the position through the index. Locking the row with `select_for_update()`, an `F()` expression update, or a version check. Connections are limited by count, not load: each process holds its connections whether or not it's busy.

## Go deeper

- [PostgreSQL: indexes](https://www.postgresql.org/docs/current/indexes.html)
- [Django: database access optimization](https://docs.djangoproject.com/en/5.2/topics/db/optimization/)
