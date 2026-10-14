<!-- reference_sources/cors.md — Primary references and execution limits for the CORS chapter. -->
# CORS curriculum — 2026-10-13

Owner requested a dedicated CORS section for the master manual. Authored examples target a separate Django/React application. No Django dependency, origin policy, cookie policy or production backend was changed by the handbook.

Primary technical references consulted:

- https://github.com/adamchainz/django-cors-headers — installation, middleware ordering, exact origins, credentials and URL restriction.
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS — browser enforcement, preflight, credentialed requests and response visibility.
- https://docs.djangoproject.com/en/5.2/ref/csrf/ — CSRF tokens, origin verification and login rotation.

The chapter distinguishes origin from site, direct cross-origin requests from a development proxy, and CORS response access from authorization and CSRF. Verification scenarios are proposed; no backend or real browser-to-backend authentication integration was run here.
