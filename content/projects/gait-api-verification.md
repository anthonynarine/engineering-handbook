<!-- content/projects/gait-api-verification.md — Curated engineering guidance and reference examples. -->
---
title: "Gait API verification: introspection and JWKS"
slug: "gait-api-verification"
section: "projects"
summary: "Choose a verification mode and understand freshness and failure behavior."
order: 51
tags: ["projects", "architecture", "practical guide"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/projects-inspection.md"]
related: ["gait-app-authorization", "gait-backend-design", "gait-sdk-design"]
---

## Integrate inside the consuming backend

The SDK is a library, not a separate server process. Configure it in the API that receives the bearer token. Introspection is the inspected default; explicit JWKS mode requires compatible issuer configuration and published signing keys. Do not silently downgrade verification modes when a provider is unavailable.

Introspection asks the authority about a token. The inspected Django authentication adapter caches successful bearer introspection for up to 45 seconds per process, with a bounded cache. Therefore “introspection mode” does not mean every ordinary API request performs a fresh authority call.

## Local verification has a different freshness boundary

Configured JWKS mode checks signature, issuer, audience, timing and required identity/session claims. A locally verified token is not evidence that the session is still active at this moment. Key caching and signature validation cannot independently observe every session revocation.

## Sensitive operations require the live guard

The inspected `require_live_session(request)` performs an uncached authority check bound to the verified subject. Invalid or revoked sessions are rejected; provider unavailability fails closed with an unavailable response rather than permission to mutate.

For the intended sensitive workflow: verify identity, enforce domain permissions, require a live session, then execute the protected change. No JWT parsing shortcut should bypass signature or authority checks. Configure error handling so an invalid credential and an unavailable verification service remain distinguishable.

This explains SDK source behavior; confirm the installed SDK version and actual issuer settings before applying it to a deployment.
