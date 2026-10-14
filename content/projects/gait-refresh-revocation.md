<!-- content/projects/gait-refresh-revocation.md — Curated engineering guidance and reference examples. -->
---
title: "Gait refresh, browser tabs and logout"
slug: "gait-refresh-revocation"
section: "projects"
summary: "Understand rotating cookies, coordination limits and server-side revocation."
order: 50
tags: ["projects", "architecture", "practical guide"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/projects-inspection.md"]
related: ["gait-api-verification", "gait-backend-design", "gait-sdk-design"]
---

## Restore without persisting the access token

The inspected AuthFlow Axios layer uses a separate session client for `/auth/refresh/`, with the configured base URL providing `/api`. A failed authenticated request can refresh and retry once. A dedicated client avoids recursively triggering the same refresh interceptor.

An in-flight promise coordinates refresh calls within one tab. Where available, the Web Locks API serializes refresh across browser tabs. Without Web Locks, the in-tab guard alone does not guarantee cross-tab safety with a shared rotating cookie.

## Rotation belongs to the authority

The inspected rotating backend path locks session state, records hashed refresh credentials and tracks consumption. Reuse of consumed credentials can revoke the session. A late browser request must not be treated as harmless simply because the user appears logged in elsewhere.

## Logout has two outcomes to verify

AuthFlow attempts `/auth/logout/` and clears memory and client query state in cleanup. Local cleanup still happens if that network request fails. It removes the visible local session but does not prove the authority revoked the server session.

Sensitive actions should use the SDK's separate uncached session check. A cached identity or locally valid access token may remain usable for ordinary verification until its applicable cache/expiration policy catches up.

Test simultaneous requests, two tabs, replay, refresh outage, logout outage and reload. Do not claim immediate global revocation solely from the browser's signed-out screen.
