<!-- content/skills/caching-and-rate-limiting.md — Teach cache design, tenant-safe cache keys and throttling for Django APIs. -->
---
title: "Caching and rate limiting: speed and protection without new bugs"
slug: caching-and-rate-limiting
section: skills
summary: "Cache the right data with tenant-safe keys, avoid stampedes, and rate-limit without mistaking it for security."
order: 5
tags: [skills, caching, redis, cache invalidation, http caching, stale-while-revalidate, rate limiting, throttling, tenant, concepts, education]
status: established-pattern
lastReviewed: "2026-10-20"
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
    - Pick a rate-limiting algorithm and explain where throttling is not enough
---

## What am I learning?

A cache stores a result so the next request doesn't recompute it. Rate limiting caps how often a client can do something. Both rely on fast shared storage, often Redis. Both can create serious bugs: a cache can serve stale or wrong data, including another tenant's, and a rate limit can block real users while giving a false sense of security.

## Core concepts

| Layer | What it caches | Controlled by |
| --- | --- | --- |
| Browser | Responses, per user | HTTP headers (`Cache-Control`, `ETag`) |
| CDN | Public responses and static assets | HTTP headers and CDN rules |
| TanStack Query | Server data in React | Query keys and stale times |
| Django cache | Computed values, fragments, sessions | Application code |
| PostgreSQL | Data pages in memory | The database itself |

Three questions decide every cache: **what is the key** (everything the value depends on), **how stale may it be**, and **what happens when the cache is down**.

## Modern patterns

| Pattern | Problem it solves | How |
| --- | --- | --- |
| **Cache-aside** | Repeated expensive reads | Check the cache, fall back to the source, store the result |
| **Stale-while-revalidate** | Users wait while an expired value is recomputed | Serve the stale value and refresh in the background: the HTTP [`stale-while-revalidate`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) directive, and TanStack Query's [default model](https://tanstack.com/query/latest/docs/framework/react/guides/caching) |
| **Immutable hashed assets** | Users load outdated JavaScript, or caches can't be long | Fingerprinted file names cached for a year; new builds get new names |
| **Scoped, versioned keys** | Cross-tenant leaks and stale shapes after a deploy | `household:{id}:summary:v2` |
| **Invalidate on commit** | Deleting too early lets stale data back in | `transaction.on_commit(lambda: cache.delete(key))` |
| **Stampede protection** | Hundreds of requests recompute the same expired entry at once | A short lock so one request recomputes, plus random TTL jitter |
| **Token bucket or sliding window limits** | Fixed windows allow double bursts at the window edge | Count requests over a rolling window or refill tokens at a steady rate |
| **Edge rate limiting** | Floods reach the app before any throttle runs | Limits at the CDN or load balancer, for example [AWS WAF rate-based rules](https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-rate-based.html) |
| **Idempotency keys** | Retries repeat side effects | Store the result of a write under a client-sent key and replay it on retry |

## Anti-patterns to avoid

- **A key without tenant scope.** `"dashboard:summary"` serves one household's numbers to all of them. That is a [tenant isolation](/guide/tenant-isolation) bug.
- **No expiry.** Every entry needs a TTL or an explicit invalidation path.
- **Publicly caching private responses.** API responses for a user need `Cache-Control: private` or `no-store`.
- **The cache as the source of truth.** It can be evicted at any time.
- **Caching to hide a slow query.** Fix the [query](/guide/postgres-performance) first.
- **Throttling as the only login protection.** It doesn't stop distributed attacks.
- **Per-process caches in production.** Django's local-memory backend gives each process its own cache and its own throttle counters.

## Build it step by step

**Step 1: configure a shared cache.** Django has a built-in Redis backend since 4.0 ([cache framework](https://docs.djangoproject.com/en/5.2/topics/cache/)):

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": os.environ["REDIS_URL"],
    }
}
```

**Step 2: cache-aside with a scoped key and jittered TTL.**

```python
import random
from django.core.cache import cache

def household_summary(household_id: int) -> dict:
    key = f"household:{household_id}:summary:v1"
    summary = cache.get(key)
    if summary is None:
        summary = compute_summary(household_id)
        cache.set(key, summary, timeout=300 + random.randint(0, 60))
    return summary
```

The jitter spreads expiry so many keys don't expire at the same moment.

**Step 3: invalidate after commit.**

```python
def record_transaction(household, data):
    with transaction.atomic():
        create_transaction(household, data)
        transaction.on_commit(
            lambda: cache.delete(f"household:{household.id}:summary:v1")
        )
```

**Step 4: protect a hot entry from a stampede.** Let only one request recompute:

```python
if summary is None and cache.add(f"{key}:lock", 1, timeout=30):
    summary = compute_summary(household_id)
    cache.set(key, summary, timeout=300)
    cache.delete(f"{key}:lock")
```

`cache.add` only succeeds if the lock key doesn't exist yet. Other requests serve a stale copy or wait briefly.

**Step 5: throttle expensive endpoints.** Django REST framework provides [throttles](https://www.django-rest-framework.org/api-guide/throttling/):

```python
REST_FRAMEWORK = {
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.UserRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {"user": "1000/day", "ai": "30/hour"},
}
```

Give a view its own limit with `ScopedRateThrottle` and `throttle_scope = "ai"`. DRF's documentation is explicit that throttling is not a security measure against brute force or denial of service. Real login protection combines edge limits, backoff or lockout, MFA and [security monitoring](/guide/observability-and-security-monitoring). Client IPs for limits must come from trusted [proxy headers](/guide/networking-and-load-balancers).

**Step 6: choose failure modes.** A speed-only cache falls back to the database when Redis is down. A login throttle may fail closed. Decide and document which is which.

Checkpoint: a test proves two households never share a cached summary.

## Exercise

In one app:

1. Cache a slow, read-heavy summary with a tenant-scoped, versioned key and jittered TTL.
2. Invalidate it on commit when the underlying data changes.
3. Add a scoped throttle to the most expensive endpoint.
4. Set `Cache-Control: private` on user-specific API responses.

**Done means:** tests prove tenant separation, invalidation after a write, and a 429 response after the limit.

## Check your understanding

- What is wrong with the key `"dashboard:summary"` in a multi-tenant app?
- Why delete a cache key in `on_commit` instead of right after `save()`?
- What is a cache stampede, and what stops it?
- Why does the local-memory backend break throttling with three web processes?
- Is a DRF throttle enough to stop credential stuffing?

## Answer key

It has no tenant scope, so every tenant reads the first tenant's summary. If the transaction rolls back, or another request reads before commit, the cache refills with stale data. A stampede is many requests recomputing one expired entry at once; a short recompute lock and TTL jitter prevent it. Each process keeps its own counters, so clients get three times the limit. No: attacks spread across IPs and accounts, so it takes edge limits, backoff or lockout, MFA and pattern monitoring together.

## Go deeper

- [MDN: HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Redis documentation](https://redis.io/docs/latest/)
