<!-- reference_sources/reports-walkthrough.md — Record tutorial provenance and verification boundaries. -->
# Reports walkthrough provenance

Authored 2026-10-12 as a synthetic feature exercise for Anthony Narine Engineering Handbook.

The layering, tenant checks, feature controllers, and Foundry responsibilities adapt the patterns recorded in `estateiq-inspection.md` and `foundry-inspection.md`. Reports is a new teaching feature, not a claim about a shipped EstateIQ module.

Official documentation reviewed:
- https://docs.djangoproject.com/en/5.2/ref/models/querysets/#get-or-create
- https://www.django-rest-framework.org/api-guide/serializers/
- https://www.django-rest-framework.org/api-guide/views/
- https://www.django-rest-framework.org/api-guide/exceptions/
- https://www.django-rest-framework.org/api-guide/testing/
- https://tanstack.com/query/latest/docs/framework/react/guides/query-keys

Python, migrations, API and TanStack snippets are reference code. This frontend repository does not run them and does not contain a backend. The browser lab uses local React state and synthetic records, with simulated authorization and status codes. Browser verification covers only that implementation. A separate Django/PostgreSQL application must integrate and execute the backend examples before they become verified implementation.
