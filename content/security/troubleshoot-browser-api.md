<!-- content/security/troubleshoot-browser-api.md — Symptom-led investigation and verification guidance. -->
---
title: "Troubleshoot: browser request blocked or rejected"
slug: "troubleshoot-browser-api"
summary: "Separate transport, CORS, CSRF, credentials and API permission failures."
section: "security"
order: 80
tags: ["troubleshooting", "diagnosis", "failure", "verification"]
status: "established-pattern"
lastReviewed: "2026-10-14"
sources: ["reference_sources/troubleshooting.md"]
related: ["django-cors", "react-api-connection", "authentication-options"]
---

## Symptom

The browser reports a network/CORS failure, a session write returns 403, or a request works in curl but fails in React. Do not assume all three have the same cause.

## 1. Inspect the actual request chain

Open DevTools Network and record the frontend origin, API URL, method and status without copying credentials. Check whether OPTIONS ran, whether the actual request followed, and whether either redirected. A path mistake can route an API request into the frontend HTML fallback.

| Observation | Next check |
| --- | --- |
| HTTPS page calls HTTP API | Mixed-content blocking; fix the API URL/TLS |
| OPTIONS redirects to login | Proxy/preflight route handling |
| No actual request after preflight | Allowed origin, method and requested headers |
| Actual request returns 401/403 | Read its safe error contract and server-side classification |
| JSON client receives HTML | Host/path routing or SPA fallback |
| Server returns 500 without CORS headers | Investigate the backend error as well as middleware placement |

## 2. Follow the chosen authentication transport

For bearer auth, confirm the intended API receives the header; do not expose its value in notes. For cookie sessions, inspect cookie presence, credentials policy and applicable browser restrictions. Verify CSRF origin and token handling for unsafe requests. `withCredentials` does not create a login, and a trusted origin does not remove the CSRF token requirement.

The [CORS guide](/guide/django-cors) explains exact origins, middleware and deployment choices. The [React connection](/guide/react-api-connection) uses a development proxy; its success does not establish production cross-origin behavior.

## 3. Correct the narrow mismatch

Fix the URL, configured origin, preflight route or authentication/CSRF flow established by the evidence. Do not enable every origin, disable CSRF, or retry a failed write blindly. A request can commit even if the browser cannot expose its response; inspect the durable outcome before resubmission.

## Verify the correction

Repeat the original request from the intended deployed origin. Confirm a forbidden origin remains unreadable, missing/invalid credentials remain denied, and an unsafe session write with a missing token remains rejected. Check that no extra record was created during retries.

These are proposed application checks. The handbook does not intercept your browser requests or inspect a running API.
