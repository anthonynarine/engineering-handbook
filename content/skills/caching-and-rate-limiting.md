<!-- content/skills/caching-and-rate-limiting.md — Teach cache design, tenant-safe cache keys and throttling for Django APIs. -->
---
title: "Caching and rate limiting: speed and protection without new bugs"
slug: caching-and-rate-limiting
section: skills
summary: "Learn when and where to cache, how to keep tenants' data apart, and why rate limiting isn't security on its own."
order: 5
tags: [skills, caching, redis, cache invalidation, http caching, stale-while-revalidate, rate limiting, throttling, tenant, concepts, education]
status: established-pattern
lastReviewed: "2026-10-21"
sources: [reference_sources/skills-gap-review.md]
related: [skills-gap-map, postgres-performance, tenant-isolation, frontend-state-contracts, networking-and-load-balancers]
lesson:
  level: Intermediate
  duration: 60 minutes
  prerequisites: [postgres-performance, tenant-isolation]
  objectives:
    - Choose the right cache layer for a piece of data
    - Build tenant-safe cache keys with a clear invalidation rule
    - Prevent cache stampedes when a popular entry expires
    - Pick a rate-limiting approach and explain where throttling isn't enough
---

## Why this matters

There's an old joke that the two hardest problems in computer science are naming things and cache invalidation. The joke lands because caching looks simple ("just save the answer") and then quietly causes some of the strangest bugs you'll ever chase: numbers that won't update, a user seeing someone else's dashboard, a site that falls over the moment a cache entry expires.

Rate limiting has a similar trap. It looks like security, but on its own it isn't.

In a multi-tenant app like Moneta or EstateIQ, the stakes are higher: one careless cache key can show one household's finances to another. This lesson teaches you to get the speed without those bugs.

## The big idea

A cache is a **sticky note on the fridge**. Instead of looking up the pizza place's number every time, you write it on a note. Fast, until the number changes and you keep calling the old one.

Every cache decision comes down to three questions. Ask them every time:

1. **What's the key?** The note needs a label that captures *everything* the answer depends on. If the answer depends on which household is asking, the household belongs in the label.
2. **How stale is acceptable?** A dashboard total five minutes old might be fine. A bank balance shown right after a payment might not be. If you can't answer this question, don't cache yet.
3. **What happens when the cache is down?** Usually: skip it and ask the database. But you have to decide that on purpose.

## Where caches live

Caching happens at several layers, from closest to the user to closest to the data:

- **The browser** caches responses for one user, controlled by HTTP headers like `Cache-Control`.
- **A CDN** caches public files and responses for everyone, close to users.
- **TanStack Query** in React caches server data in the frontend, organized by query keys.
- **Django's cache**, usually Redis, stores values your code computes.
- **PostgreSQL** keeps frequently used data in memory on its own.

A good rule: cache as close to the user as is *safe*. Static assets can live at the CDN for a year. Private data must never be cached anywhere it could be shared.

**Pause and check:** can a CDN cache the response to `GET /api/me/dashboard`? (No, not without very careful configuration. It's one user's private data. That response should carry `Cache-Control: private` or `no-store`, so shared caches never keep it.)

## The core pattern: cache-aside

Most application caching uses one pattern, called **cache-aside**: look in the cache; if it's there, use it; if not, compute it, store it, and return it.

```python
from django.core.cache import cache

def household_summary(household_id: int) -> dict:
    key = f"household:{household_id}:summary:v1"
    summary = cache.get(key)
    if summary is None:
        summary = compute_summary(household_id)
        cache.set(key, summary, timeout=300)
    return summary
```

Look closely at the key, `household:{household_id}:summary:v1`. It has three parts, each doing a job:

- `household:{household_id}`: the **scope**. Each household gets its own entry, so one can never read another's.
- `summary`: **what** is cached.
- `v1`: the **version** of its shape. If you change what `compute_summary` returns, bump to `v2` and old entries in the old shape are simply never read again.

## Keeping it fresh: invalidation

Your cached summary is now up to five minutes stale. You have three ways to manage freshness:

- **Let it expire.** Accept up to *N* seconds of staleness. Simple and predictable.
- **Delete it when the data changes.** The code that writes the data deletes the key.
- **Bump a version.** Store a version number per household; change it on writes so old keys stop being used.

The "delete on change" option hides a subtle bug. Watch:

```python
with transaction.atomic():
    create_transaction(household, data)
    cache.delete(key)  # too early!
```

Between that delete and the moment the transaction commits, another request can miss the cache, read the *old* data (the new row isn't committed yet), and put the stale value right back. The fix is to delete *after* the commit:

```python
with transaction.atomic():
    create_transaction(household, data)
    transaction.on_commit(lambda: cache.delete(key))
```

## Modern patterns

**Stale-while-revalidate.** Instead of making a user wait while an expired value is recomputed, serve the slightly stale value immediately and refresh it in the background. HTTP supports this directly with the [`stale-while-revalidate`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) directive, and it's exactly how [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/guides/caching) behaves by default: show cached data, refetch quietly.

**Immutable, fingerprinted assets.** Build tools like Vite put a content hash in each file name (`index-BouZs7ir.js`). Because a new build gets new names, old files can be cached for a year without ever going stale.

**Stampede protection.** Picture a popular cache entry expiring while 500 requests arrive. All 500 miss, and all 500 run the same expensive query at once, like a crowd rushing a store as the doors open. Two defenses: let only one request recompute (a short lock), and add random **jitter** to expiry times so many keys don't expire at the same instant.

**Rate-limiting algorithms.** A *fixed window* ("100 per minute, resetting on the minute") allows a burst of 200 across a minute boundary. A *sliding window* counts over a rolling period instead. A *token bucket* is like a turnstile that hands out tokens at a steady rate: each request spends one, short bursts are fine, and sustained floods run dry.

**Rate limiting at the edge.** The cheapest request to reject is one that never reaches your app. CDNs and load balancers can limit traffic before Django runs, for example with [AWS WAF rate-based rules](https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-rate-based.html).

**Idempotency keys.** When a client retries a write (after a timeout, say), the server should recognize the repeat and return the first result instead of doing the work twice. The client sends a unique key with the request; the server stores the outcome under it.

## Mistakes to avoid

- **A key without tenant scope.** `"dashboard:summary"` serves the first household's numbers to everyone. That's a [tenant isolation](/guide/tenant-isolation) breach, not just a caching bug.
- **No expiry.** Every entry needs a timeout or a clear invalidation path.
- **Caching private responses publicly.** User-specific API responses get `Cache-Control: private` or `no-store`.
- **Treating the cache as the source of truth.** Caches can evict anything at any time.
- **Caching to hide a slow query.** Fix the [query](/guide/postgres-performance) first.
- **Per-process caches in production.** Django's local-memory backend gives each process its own separate cache, so they disagree with each other.

## Rate limiting, and its limits

Rate limiting protects your *capacity* and your *wallet*: login endpoints, AI calls, exports, outgoing email. Django REST framework includes [throttles](https://www.django-rest-framework.org/api-guide/throttling/):

```python
REST_FRAMEWORK = {
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.UserRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {"user": "1000/day", "ai": "30/hour"},
}
```

To give one view its own limit, use `ScopedRateThrottle` and set `throttle_scope = "ai"` on the view.

Now the important part. DRF's own documentation says throttling is **not** a security measure against brute force or denial-of-service attacks. Think about credential stuffing: an attacker tries leaked passwords across thousands of accounts from thousands of IP addresses. Each IP and each account stays politely under your limit, and the attack succeeds anyway.

Real protection layers several defenses: limits at the edge, backoff or lockout on failed logins, MFA, and [security monitoring](/guide/observability-and-security-monitoring) that spots patterns across accounts. And if you limit by IP, get the client IP from trusted [proxy headers](/guide/networking-and-load-balancers), or every request will look like it came from your load balancer.

## Let's build it

**Step 1: use a shared cache.** Django has had a built-in Redis backend since version 4.0 ([cache framework](https://docs.djangoproject.com/en/5.2/topics/cache/)):

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": os.environ["REDIS_URL"],
    }
}
```

Now all your web processes share one cache, and throttle counters are accurate.

**Step 2: cache-aside with a scoped key and jittered expiry.**

```python
import random

def household_summary(household_id: int) -> dict:
    key = f"household:{household_id}:summary:v1"
    summary = cache.get(key)
    if summary is None:
        summary = compute_summary(household_id)
        cache.set(key, summary, timeout=300 + random.randint(0, 60))
    return summary
```

The random 0–60 extra seconds spreads expiry times out.

**Step 3: invalidate after commit**, using `transaction.on_commit` as shown above.

**Step 4: guard a hot entry against a stampede.**

```python
if summary is None and cache.add(f"{key}:lock", 1, timeout=30):
    summary = compute_summary(household_id)
    cache.set(key, summary, timeout=300)
    cache.delete(f"{key}:lock")
```

`cache.add` only succeeds if the key doesn't exist yet, so exactly one request wins the lock and recomputes. The others can serve a stale copy or wait briefly and retry.

**Step 5: decide your failure modes.** If Redis goes down, a speed-only cache should fall back to the database and log a warning. A login throttle might reasonably fail *closed* and reject attempts. Write the decision down.

**Checkpoint:** write a test that computes the summary for two households and proves each gets its own value.

## Your turn

In one of your apps:

1. Cache a slow, read-heavy summary with a tenant-scoped, versioned key and jittered expiry.
2. Invalidate it on commit when its data changes.
3. Add a scoped throttle to the most expensive endpoint.
4. Set `Cache-Control: private` on user-specific API responses.

**You're done when:** tests prove households never share a cached value, writes invalidate it, and the throttled endpoint returns `429 Too Many Requests` after the limit.

## Check your understanding

1. What's wrong with the cache key `"dashboard:summary"` in a multi-tenant app?
2. Why delete a cache key in `on_commit` instead of right after `save()`?
3. What's a cache stampede, and what are two ways to prevent it?
4. Why does Django's local-memory cache break throttling when you run three web processes?
5. Is a DRF throttle enough to stop credential stuffing? Why or why not?

## Answer key

1. It has no tenant scope. The first household to load the dashboard fills the cache, and every other household then sees its numbers.
2. Before the commit, another request can miss the cache, read the old data, and store it again, so the cache ends up stale. After the commit, the new data is visible to everyone.
3. Many requests recomputing the same expired entry at once. Prevent it with a recompute lock so only one request does the work, and with jittered expiry so entries don't expire together.
4. Each process keeps its own counters, so a client spread across three processes gets three times the limit. A shared cache like Redis fixes it.
5. No. Attackers spread attempts across many IPs and accounts, each under the limit. It takes edge limits, login backoff or lockout, MFA and cross-account monitoring together.

## Recap

- Ask the three questions every time: what's the key, how stale is acceptable, what happens when the cache is down?
- Scope keys by tenant and version them.
- Invalidate after commit, not before.
- Prevent stampedes with a lock and jitter.
- Rate limiting protects capacity and cost. Security needs more layers.

Next up: [Lesson 5, infrastructure as code](/guide/infrastructure-as-code), where you'll describe the servers, load balancers and Redis you've been learning about in reviewable code.

## Go deeper

- [MDN: HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Redis documentation](https://redis.io/docs/latest/)
