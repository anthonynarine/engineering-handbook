<!-- content/skills/postgres-performance.md — Teach indexes, query plans, transactions and connection pooling for Django on PostgreSQL. -->
---
title: "PostgreSQL performance: indexes, query plans, and connections"
slug: postgres-performance
section: skills
summary: "Learn to see what the database is really doing, fix slow pages at the query, and stay inside your connection limit."
order: 4
tags: [skills, postgresql, database, performance, indexes, explain, pagination, transactions, connection pooling, orm, concepts, education]
status: established-pattern
lastReviewed: "2026-10-21"
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
    - Keep total database connections under your plan's limit
---

## Why this matters

When a Django page is slow, the database is the usual suspect, and usually guilty. Not because PostgreSQL is slow (it's remarkably fast), but because the ORM makes it easy to ask it the wrong questions without noticing.

A line like `account.institution.name` looks like reading an attribute. It might actually be a database query. Put it in a loop and one page quietly makes hundreds of queries. The ORM is a great tool, but it hides the database. In this lesson, you'll learn to look behind it.

## The big idea

There are three ways a database makes a page slow. Learn to tell them apart, because each has a different fix:

1. **Too many queries.** Each one is fast, but there are hundreds.
2. **A query doing too much work.** One query reads far more data than it needs, usually because no index fits.
3. **Waiting.** For a lock another request holds, or for a free connection.

We'll take them one at a time.

## Problem 1: too many queries (the N+1)

Imagine cooking dinner and driving to the store separately for each ingredient. Each trip is short. Twelve trips is a terrible evening. That's the N+1 problem: one query to get a list, then one more query *for each item* in it.

```python
# 1 query to get the accounts...
for account in Account.objects.filter(household=household):
    # ...plus 1 query per account, right here
    print(account.institution.name)
```

With 50 accounts, that's 51 queries. The fix is to tell Django up front that you'll need the institutions too:

```python
accounts = Account.objects.filter(household=household).select_related("institution")
```

Now it's one query with a SQL join, however many accounts there are.

Two tools, two situations:

- **`select_related`** follows foreign keys and one-to-one fields with a join. Use it when each row points to *one* related object.
- **`prefetch_related`** runs one extra query for *many* related objects (many-to-many fields, or reverse relations like `household.accounts`) and stitches the results together in Python.

**Pause and check:** a page lists households, and for each one shows all its members. `select_related` or `prefetch_related`? (`prefetch_related`, because each household has many members.)

## Problem 2: a query doing too much work (indexes)

Think about finding "PostgreSQL" in a 600-page book. You could read every page, or you could flip to the index at the back and go straight to page 412. A database **index** is that same idea: a sorted structure that points to where the rows live. Without a usable index, PostgreSQL reads the whole table. That's a **sequential scan**.

The key word is *usable*. An index is sorted by its columns **in order**, like a phone book sorted by last name, then first name. A phone book is great for finding "Narine, Anthony" and useless for finding everyone named "Anthony," because first names are scattered throughout.

That's why column order matters in this index:

```python
class Transaction(models.Model):
    household = models.ForeignKey(Household, on_delete=models.CASCADE)
    posted_at = models.DateTimeField()

    class Meta:
        indexes = [models.Index(fields=["household", "-posted_at"])]
```

It's perfect for "this household's transactions, newest first," which is how a multi-tenant app nearly always queries. It does nothing for "all transactions on March 3rd across every household."

Indexes aren't free, though. Every insert and update must also update every index on the table. Add indexes for the queries you actually run, not for every column.

## Seeing what the database actually does

You don't have to guess whether an index is used. PostgreSQL will tell you. [`EXPLAIN ANALYZE`](https://www.postgresql.org/docs/current/using-explain.html) runs a query and reports exactly how it was executed. Django can produce it:

```python
qs = Transaction.objects.filter(household=h).order_by("-posted_at")[:50]
print(qs.explain(analyze=True))
```

Read the output looking for three things:

- **"Seq Scan" on a big table**, where you expected an index. Either the index is missing or it doesn't match the query's shape.
- **Estimated rows far from actual rows.** PostgreSQL's planner guessed wrong, usually because its statistics are stale. Running `ANALYZE` refreshes them.
- **Where the time went.** Each step reports its actual time. Fix the most expensive step first.

One warning: `EXPLAIN ANALYZE` really executes the query. To analyze an `UPDATE` or `DELETE`, wrap it in a transaction and roll it back.

## Problem 3: waiting (transactions, locks and connections)

**Lost updates.** Two people add an expense to the same budget at the same moment. Both read "spent: $100." Both add their amount and save. One update silently disappears. Wrapping the code in a transaction alone doesn't prevent this, because PostgreSQL's default isolation level ([Read Committed](https://www.postgresql.org/docs/current/transaction-iso.html)) lets both transactions read the same starting value.

There are three ways to fix it:

```python
# Option 1: lock the row while you work on it (pessimistic)
with transaction.atomic():
    budget = Budget.objects.select_for_update().get(pk=budget_id)
    budget.spent += amount
    budget.save()

# Option 2: let the database do the math in one statement
Budget.objects.filter(pk=budget_id).update(spent=F("spent") + amount)
```

Option 3 is **optimistic concurrency**: store a version number on the row, and reject a save if the version changed since you read it. That's the right choice when people edit a form and might take minutes; you never hold a lock that long. Moneta's budget editing uses this "revision check" style.

**Connections.** Each PostgreSQL connection is a separate server process with real memory cost, so every database plan has a connection limit. Think of a call center with a fixed number of phone lines. It doesn't matter how quiet each call is: when every line is taken, the next caller gets a busy signal, which in your logs looks like "too many connections."

Do the math for your app: **web processes × workers per process + background workers + one-off scripts.** That total must stay under the limit. Then use the tools:

| Tool | What it does |
| --- | --- |
| `CONN_MAX_AGE` | Reuses a connection across requests. The default, `0`, opens a fresh one for every request. |
| `CONN_HEALTH_CHECKS` | Checks a reused connection still works before using it. |
| Django's built-in pool | Django 5.1+ with psycopg 3 can keep a [pool of connections](https://docs.djangoproject.com/en/5.2/ref/databases/#connection-pool) per process. |
| PgBouncer | A separate pooler shared by all processes, for when you need more processes than the database has connections. |

## Modern patterns

Now that you have the basics, here are patterns teams use today:

**Keyset (cursor) pagination.** `OFFSET 50000` makes the database read 50,000 rows and throw them away just to show page 1,001. Keyset pagination remembers where you stopped, like a bookmark, and asks for "the next 50 after this point." Page 1,001 is as fast as page 1. Django REST framework includes [CursorPagination](https://www.django-rest-framework.org/api-guide/pagination/#cursorpagination).

**Partial indexes.** If you only ever query pending jobs, index only pending jobs: `WHERE status = 'pending'`. The index stays tiny. ([docs](https://www.postgresql.org/docs/current/indexes-partial.html))

**Covering indexes.** If a hot query only needs two extra columns, store them in the index with `INCLUDE`, and PostgreSQL can answer from the index alone without visiting the table. ([index-only scans](https://www.postgresql.org/docs/current/indexes-index-only-scans.html))

**Expand and contract migrations.** Change a schema in safe steps (add the new column, backfill, switch the code, then remove the old one) so a deploy never locks a busy table or breaks running code. See [safe migrations](/guide/safe-database-migrations).

**Read models.** When a dashboard sums thousands of rows on every load, keep a precomputed summary updated as data changes. See [ledgers and read models](/guide/ledger-and-read-models).

**Measure in production with `pg_stat_statements`.** This extension ranks your real queries by total time spent. Fix the top of that list, not the query you happen to suspect. ([docs](https://www.postgresql.org/docs/current/pgstatstatements.html))

## Mistakes to avoid

- **Queries inside loops.** The N+1, every time.
- **Deep OFFSET pagination.** Each later page is slower than the last.
- **Indexing every column.** Writes slow down and storage grows, for indexes nobody uses.
- **Long transactions.** They hold locks and block cleanup work.
- **Calling an external API inside a transaction.** A slow provider now holds your database locks.
- **An exact `COUNT(*)` on a huge table on every page load.** Show "more results" or an estimate.
- **Reaching for a cache first.** A cache over a slow query hides the problem until the cache misses.

## Let's build it

We'll fix a slow list page end to end.

**Step 1: measure the query count, then lock it in with a test.**

```python
def test_account_list_query_count(self):
    with self.assertNumQueries(2):
        list(account_list(self.household))
```

Write this test first. It fails, showing the N+1. Add `select_related` in the [selector](/guide/services-and-selectors) and it passes. Now nobody can reintroduce the problem without a failing test.

**Step 2: check the plan for the main query** with `explain(analyze=True)`. If you see a sequential scan on a large table, add an index that matches the filter and the sort, with the tenant column first.

**Step 3: switch to keyset pagination.**

```python
page = (Transaction.objects
        .filter(household=h, posted_at__lt=cursor)
        .order_by("-posted_at")[:50])
```

The index from step 2 takes PostgreSQL straight to the right spot. If two transactions can share a timestamp, add `id` as a tiebreaker so no row is skipped or repeated.

**Step 4: protect any read-modify-write** with `select_for_update`, an `F()` update, or a version check.

**Checkpoint:** the page's query count is fixed by a test, and its main query plan shows an index scan.

## Your turn

Pick the slowest list page in one of your apps.

1. Count its queries and remove any N+1 pattern.
2. Run `explain(analyze=True)` on its main query.
3. Add one index if the plan shows a sequential scan on a large table.
4. Switch to cursor pagination if the list can grow large.
5. Record timings before and after.

**You're done when:** `assertNumQueries` protects the page, the plan uses an index, and you can show the before-and-after numbers.

## Check your understanding

1. A list page runs 201 queries for 100 rows. What's the likely cause?
2. Why doesn't an index on `(household, posted_at)` help a query filtering only by `posted_at`?
3. Why does page 1,000 get slower with OFFSET pagination but not with keyset pagination?
4. Two requests add to the same budget at once and one update is lost. Name two fixes.
5. Why can "too many connections" happen on a database with low CPU usage?

## Answer key

1. An N+1 pattern, probably two related lookups per row (100 × 2 + 1 = 201). Fix it with `select_related` or `prefetch_related`.
2. Like a phone book sorted by last name, the index is ordered by its first column. Rows for one `posted_at` value are scattered across every household, so the index can't jump to them.
3. OFFSET reads and discards every earlier row, so the work grows with the page number. Keyset pagination jumps straight to the bookmark through the index.
4. Lock the row with `select_for_update()`, update atomically with `F("spent") + amount`, or use a version check that rejects stale saves.
5. The limit is on the *number* of connections, not on how busy they are. Idle connections held by processes still use up the lines.

## Recap

- Three causes of slowness: too many queries, a query doing too much work, and waiting.
- `select_related` for single related objects, `prefetch_related` for many.
- Indexes are ordered like a phone book; lead with the tenant column.
- `EXPLAIN ANALYZE` shows what really happened. Measure, don't guess.
- Prevent lost updates with locks, `F()` expressions or version checks.
- Do the connection math, and pool connections.

Next up: [Lesson 4, caching and rate limiting](/guide/caching-and-rate-limiting), for when the query is already good but still runs too often.

## Go deeper

- [PostgreSQL: indexes](https://www.postgresql.org/docs/current/indexes.html)
- [Django: database access optimization](https://docs.djangoproject.com/en/5.2/topics/db/optimization/)
