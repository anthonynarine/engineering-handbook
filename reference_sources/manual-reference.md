<!-- reference_sources/manual-reference.md — Scope and upstream references for practical manual additions. -->
# Contracts, migrations, testing, runbooks and reading tools — 2026-10-14

Owner requested the suggested manual enhancements. Added authored reference guidance on API contracts, staged migration planning, risk-based testing and operational response; local bookmarks/recently viewed are browser-only convenience features. Reference instructions are not executed application checks. No backend, migration, identity provider, credential, production incident or recovery operation was performed.

Primary references reviewed:

- https://www.django-rest-framework.org/api-guide/pagination/
- https://docs.djangoproject.com/en/5.2/howto/writing-migrations/
- https://docs.djangoproject.com/en/5.2/topics/testing/overview/
- https://docs.djangoproject.com/en/5.2/topics/db/transactions/
- Existing AWS security/recovery references in reference_sources/aws-design.md

Custom error-envelope examples are explicitly proposed conventions, not DRF defaults. The Tasks starter remains unpaginated unless separately adapted. Runbooks distinguish each real system's recovery/approval contract from this static handbook's presentation checks.
