<!-- content/django/django-cors.md — Explain and configure the browser-to-Django origin boundary. -->
---
title: "CORS: connect the browser to Django"
slug: django-cors
section: django
summary: "Configure allowed origins, understand preflight, and separate CORS from cookies, CSRF and API permissions."
order: 2.55
tags: [cors, csrf, django, axios, origins, browser, deployment]
status: established-pattern
lastReviewed: "2026-10-13"
sources: [reference_sources/cors.md]
related: [react-api-connection, django-middleware, authentication-options, deployment-platforms]
---

## Start with the two URLs

Write down the URL in the browser and the API URL it calls. An origin consists of scheme, hostname and port. `http://localhost:5173` and `http://localhost:8000` have different origins. `localhost` and `127.0.0.1` differ too.

CORS tells a browser whether JavaScript from one origin may access a response from another. It does not authenticate callers, enforce tenant permissions or stop non-browser clients from calling your API. Some cross-origin requests can reach the server even when the browser refuses to expose their response. See [MDN's CORS guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS).

## Choose the development connection

| Approach | Browser request | Where configuration belongs |
| --- | --- | --- |
| Vite proxy | Relative `/api/tasks/` on the frontend origin | Vite forwards to local Django |
| Direct API | `http://localhost:8000/api/tasks/` | Django allows the exact frontend origin |
| Production reverse proxy | Relative `/api/tasks/` on the public application origin | Hosting routes API traffic to Django |
| Separate production hosts | Frontend calls a different API origin | Django and any upstream proxy must return the correct policy |

The [React connection chapter](/guide/react-api-connection) uses the first approach. A working Vite proxy does not establish the production policy.

## Configure Django for a direct cross-origin API

Install into the separate backend environment and record the resolved dependency:

```bash
# Terminal — backend/, with the project virtual environment active.
python -m pip install django-cors-headers
python -m pip freeze > requirements.txt
```

```python
# backend/config/settings.py — Add the app; keep the existing installed apps.
INSTALLED_APPS += ["corsheaders"]
```

Place `"corsheaders.middleware.CorsMiddleware"` near the beginning of the existing `MIDDLEWARE` list, before CommonMiddleware and any WhiteNoise middleware. Keep the rest of the middleware; replacing the list with only CORS removes unrelated protection.

```python
# backend/config/settings.py — Local direct-origin example, not production settings.
CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
CORS_ALLOW_ALL_ORIGINS = False
CORS_URLS_REGEX = r"^/api/.*$"
```

Use the frontend origin, without a path or trailing slash. In production replace the development origin with the exact deployed frontend origin. The [django-cors-headers reference](https://github.com/adamchainz/django-cors-headers) documents these settings and middleware ordering.

Do not allow every Netlify preview or every host on a shared hosting domain by default. Treat access from a preview as an intentional environment decision, particularly when it can reach production data. `ALLOWED_HOSTS` separately validates Django's request host; it is not the frontend origin allowlist.

## Understand preflight

A request with headers such as `Authorization`, or JSON content type in typical API writes, can require an OPTIONS preflight. The browser asks whether the intended method and headers are allowed before sending the actual request. An anonymous OPTIONS request therefore must not be redirected to a login page by a proxy or custom gateway.

Inspect both requests in DevTools. A successful OPTIONS response does not prove the following POST is authorized. Avoid accidental slash redirects by matching Django's actual URL. For a custom request header, extend the package's default allowed-header list rather than accidentally replacing needed headers.

## Bearer authentication versus cookie authentication

With a bearer-token API, explicitly attach the access token through the application's transport policy. The `Authorization` header needs CORS permission, but adding `withCredentials` is not how you create a bearer token.

With session cookies, the browser must be allowed to send credentials and Django must allow the requesting origin. For a direct cookie-based connection:

```typescript
// frontend/src/api/client.ts — Example for an intentionally cookie-authenticated API.
import axios from 'axios';
export const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  withCredentials: true,
});
```

```python
# backend/config/settings.py — Add only for the chosen cookie-based local flow.
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = ["http://localhost:5173"]
```

These settings are not a complete login implementation. The allowed-origin response must name the requesting origin; a wildcard origin is incompatible with credentialed browser access. Cookies still follow their own scope and browser policy.

## CSRF is a separate write protection

For session-authenticated unsafe requests, keep Django's CSRF protection and send the session's current CSRF token in `X-CSRFToken`. Obtain it through your designed login/bootstrap flow; a frontend on another hostname cannot simply read the API hostname's cookie. If returning a token from a bootstrap endpoint, allow only intended origins and send credentials for the same session. Login can rotate the token, so refresh it afterward.

`CSRF_TRUSTED_ORIGINS` permits configured origins in Django's origin checks; it does not waive the token requirement. A same-origin development proxy does not remove CSRF requirements either. Follow [Django's CSRF reference](https://docs.djangoproject.com/en/5.2/ref/csrf/).

For genuinely cross-site production cookies, evaluate `SameSite=None` with `Secure` for the relevant cookies and use HTTPS. “Cross-origin” and “cross-site” differ: two ports can be different origins while still being the same site. Browser third-party-cookie restrictions can still prevent the session from working. Prefer an intentional domain/routing design over repeatedly loosening settings.

## Diagnose the actual failure

| Symptom | Inspect next |
| --- | --- |
| OPTIONS redirects or fails | Proxy routing, URL slash, method and header policy |
| Browser reports missing allow-origin header | Exact Origin, middleware ordering, upstream error responses |
| CORS succeeds, request returns 401 or 403 | Credentials, session, permissions and response details |
| Django reports CSRF failure | Trusted origin, session cookie and current token |
| Works in curl, fails in browser | Browser origin rules and cookie policy; curl does not enforce CORS |
| Browser shows only a generic network error | Network panel and server status; a backend failure may lack CORS headers |
| HTTPS frontend calls HTTP API | Mixed-content blocking; use an HTTPS API |

Do not use `mode: "no-cors"` as an API fix: an opaque response is unusable for normal JSON reads. Do not disable CSRF, authentication or tenant checks to quiet a browser error.

## Verify the real deployment

Test an allowed origin and a deliberately unlisted origin in a browser. Check a preflighted authenticated request, an expired session, a session write with and without a valid CSRF token, and an API error response. Confirm no protected write occurs on a rejected request. Verify the actual production URLs, not only the development proxy.

These are proposed application checks. This static handbook does not run a Django API or change any source project's CORS configuration.
