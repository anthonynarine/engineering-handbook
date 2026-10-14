<!-- content/django/django-middleware.md — Curated engineering guidance and reference examples. -->
---
title: "Middleware: establish request context carefully"
slug: "django-middleware"
section: "django"
summary: "Use request-wide hooks without turning context into authorization."
order: 2.5
tags: ["django", "architecture", "practical guide"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/django-toolkit.md"]
related: ["estateiq-tenant-boundary", "django-rest-boundaries", "security-boundaries"]
---

## What belongs here

Middleware is useful for request IDs, timing, security headers and resolving shared request context. Keep feature workflows out of it. An ordinary request should not unexpectedly trigger billing mutations or a slow AI call before its view runs.

Django enters middleware in configured order and unwinds responses in reverse. A middleware can also return early. Put dependencies after the middleware that establishes them, and make error/short-circuit behavior explicit. See the [middleware reference](https://docs.djangoproject.com/en/5.2/topics/http/middleware/).

## Django authentication and DRF authentication differ

Django's session AuthenticationMiddleware depends on SessionMiddleware. DRF bearer authentication normally occurs later inside the API view. Middleware cannot assume a DRF-authenticated token user is already available on `request.user`. Resolve token-dependent authorization in the API boundary, or deliberately implement and verify a compatible integration.

## Tenant selection is not permission

A header, URL or stored browser preference can select an organization. Validate the selected identifier and then verify the caller's active membership before querying tenant data. Keep request-scoped values on the request; avoid process-global mutable tenant variables that can leak between concurrent requests.

The [EstateIQ tenant boundary](/guide/estateiq-tenant-boundary) separates middleware selection from membership permissions. Missing, malformed, foreign and inactive membership cases all need checks.

## Verify request-wide behavior

Exercise anonymous requests, health checks, exceptions, early responses and concurrent requests for different organizations. Match sync/async support to the deployed stack. Ensure logs do not expose authorization headers, cookies, document contents or secrets.
