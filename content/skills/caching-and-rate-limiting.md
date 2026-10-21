<!-- content/skills/caching-and-rate-limiting.md — Teach cache design, tenant-safe cache keys and throttling for Django APIs. -->
---
title: "Caching and rate limiting: speed and protection without new bugs"
slug: caching-and-rate-limiting
section: skills
summary: "Cache the right data with tenant-safe keys, and rate-limit without mistaking it for security."
order: 5
tags: [skills, caching, redis, cache invalidation, http caching, rate limiting, throttling, tenant, concepts, education]
status: established-pattern
lastReviewed: "2026-10-20"
sources: [reference_sources/skills-gap-review.md]
related: [skills-gap-map, postgres-performance, tenant-isolation, frontend-state-contracts, networking-and-load-balancers]
---

## What am I learning?

A cache stores a result so the next request doesn't recompute it. Rate limiting caps how often a client can do something. Both use fast shared storage, often Redis. Both can create serious bugs: a cache can serve stale or wrong data, including another tenant's, and a rate limit can block real users while giving a false sense of security.

## Where caches live

| Layer | What it caches | Controlled by |
| --- | --- | --- |
| Browser | Responses, per user | HTTP headers (`Cache-Control`, `ETag`) |
| CDN | Public responses and static assets | HTTP headers and CDN rules |
| React Query | Server data in the frontend | Query keys and stale times |
| Django cache | Computed values, fragments, sessions | Application code |
| PostgreSQL | Pages in memory | The database itself |

Start at the edge for static assets. Hashed asset files can be cached for a year because a new build gets new file names. Private API responses should be `Cache-Control: private` or `no-store`, so a shared cache never stores one user's data. MDN's [HTTP caching guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching) explains the headers.

## Cache-aside in Django

The common pattern: check the cache, fall back to the database, store the result.

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

Django's [cache framework](https://docs.djangoproject.com/en/5.2/topics/cache/) has a built-in Redis backend since Django 4.0. The local-memory backend is per process, so it is fine for development but inconsistent across several web processes.

## The two hard parts

**Keys must carry the full scope.** If a value depends on the tenant, the user or their permissions, the key must include them. A key like `"summary"` would serve one household's numbers to every household. That is a [tenant isolation](/guide/tenant-isolation) bug, not just a caching bug. Add a version segment (`v1`) so changing the cached shape doesn't read old entries.

**Invalidation needs a rule.** Choose one per cached value:

- **Expire by time.** Accept data up to N seconds old. Simple and predictable.
- **Delete on write.** The code that changes the data deletes the key, after the transaction commits (`transaction.on_commit`).
- **Version the key.** Store a version number and bump it on change.

If I can't state how stale a value may be, it shouldn't be cached yet. And measure first: a cache over an unindexed query hides a [database problem](/guide/postgres-performance) instead of fixing it.

## Rate limiting

Rate limiting protects capacity and expensive operations: login attempts, AI calls, exports, outbound email. Django REST framework provides [throttles](https://www.django-rest-framework.org/api-guide/throttling/):

```python
REST_FRAMEWORK = {
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.UserRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {"user": "1000/day", "ai": "30/hour"},
}
```

`ScopedRateThrottle` gives specific views their own limits, such as `throttle_scope = "ai"`. Throttles store counters in the cache, so they need a shared cache like Redis to work across processes.

Know the limits of this tool. DRF's documentation says throttling is not a security measure against brute force or denial of service. A determined attacker rotates IPs and accounts. Real protection layers several controls: rate limits at the edge or load balancer, account lockout or backoff on authentication, MFA, and monitoring that spots patterns across accounts (see [security monitoring](/guide/observability-and-security-monitoring)). Client IPs for limits must come from trusted [proxy headers](/guide/networking-and-load-balancers).

## When the cache is down

Decide the failure mode. For a cache that only speeds things up, fall back to the database and log it. For throttling, choose deliberately whether an outage fails open (allow requests) or closed (reject them). Login protection usually justifies failing closed. A dashboard cache never does.

## Exercise

In one app, cache a slow, read-heavy summary for 5 minutes with a key scoped to the tenant, and delete it on commit when the underlying data changes. Add a scoped throttle to its most expensive endpoint. Done means: a test proves two tenants never share a cached value, and a test proves the throttle returns 429 after the limit.

## Check your understanding

- What is wrong with the cache key `"dashboard:summary"` in a multi-tenant app?
- Why delete a cache key in `on_commit` instead of right after `save()`?
- Why does the local-memory cache backend break throttling with three web processes?
- Is a DRF throttle enough to stop credential stuffing?

## Answer key

It has no tenant scope, so every tenant would read the first tenant's cached summary. If the transaction rolls back, or another request reads before commit, the cache can be refilled with stale data; deleting after commit avoids both. Each process keeps its own counters, so a client gets three times the limit. No: attackers spread attempts across IPs and accounts, so it takes edge limits, lockout or backoff, MFA and pattern monitoring together.
