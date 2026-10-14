<!-- content/projects/gait-login-session.md — Curated engineering guidance and reference examples. -->
---
title: "Gait login and session establishment"
slug: "gait-login-session"
section: "projects"
summary: "Trace password and second-factor handling into the browser session."
order: 49
tags: ["projects", "architecture", "practical guide"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/projects-inspection.md"]
related: ["gait-refresh-revocation", "gait-backend-design", "gait-sdk-design"]
---

## Establish the browser session

The inspected AuthFlow login sends the configured API's `/login/` request with cookie session transport. A response requiring two-factor authentication switches the UI to a second-factor step. `/two-factor-login/` accepts an OTP or recovery code. Wrong-code, expired-login and rate-limit states need distinct feedback.

The access token stays in module memory. The refresh credential uses an HttpOnly cookie; it is not returned to application code for localStorage persistence. Reload recovery therefore depends on the refresh path, not a token surviving in browser storage.

## Keep browser protections explicit

The inspected refresh cookie is host-only and restricted to `/api/auth/`. Cookie-based refresh validates an allowed Origin and the expected Gait request marker before consuming cookie credentials. Secure and SameSite settings must fit the deployed origins. HttpOnly prevents ordinary JavaScript reads; it does not replace cross-site request protections.

## Audience is authority configuration

The backend selects the configured relying-party audience from the sign-in Origin and preserves it with the session. Request body input must not pick arbitrary audiences. The consuming API must expect the intended audience. Source support for RS256 does not prove a deployment has published keys or selected that mode.

Check login success, invalid password, second-factor transition, recovery-code consumption and throttling with synthetic accounts in the actual integration. These are proposed checks; the handbook did not run them.
