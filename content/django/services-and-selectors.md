<!-- content/django/services-and-selectors.md — Teach services write. selectors read.. -->
---
title: "Services write. Selectors read."
slug: services-and-selectors
section: django
summary: "Put workflow rules and trusted query scope in explicit domain boundaries."
order: 3
tags: [services, selectors, transactions, tenant]
status: established-pattern
lastReviewed: "2026-10-12"
sources: [reference_sources/MOONLIGHT_ENGINEERING_HANDBOOK_BUILD_PLAN.original.md]
related: [django-setup, frontend-architecture]
---

## Make the operation visible

The reports domain needs a clear distinction between changing durable state and retrieving it. Services own writes and workflow rules. Selectors expose reads with trusted scope. Views resolve identity and authorization, then orchestrate these boundaries.

This pattern is useful when more than one endpoint or job shares an operation. A simple read does not need an elaborate class hierarchy. Start with functions and introduce abstractions when actual repetition appears.

## A scoped read

The example is an excerpt from a separate backend application. It assumes a Report model with organization, creator, status, and created_at fields, plus an already authorized organization object.

**backend/apps/reports/selectors.py · excerpt**

```python
# backend/apps/reports/selectors.py — Retrieve reports within trusted scope.
def report_list(*, organization):
    """Return reports belonging to an authorized organization.

    Args:
        organization: Organization resolved through active membership.

    Returns:
        Queryset of reports ordered from newest to oldest.
    """
    # Step 1: Apply the tenant boundary before returning data.
    return (
        Report.objects.filter(organization=organization)
        .select_related("created_by")
        .order_by("-created_at", "-id")
    )
```

The omitted Report import depends on the application's model package. `select_related` joins single-valued relationships; `prefetch_related` is for collections. Add either because the response needs those relationships, and verify query counts with representative data.

## A transactional write

A create service accepts trusted organization and actor objects plus validated input. It verifies business rules, writes durable state, and returns the authoritative report. The caller must not pass an arbitrary client-supplied organization object without checking membership.

Use database uniqueness constraints for invariants such as an organization-specific external identifier. A Python pre-check alone races: two requests can both observe no existing record and then insert. Handle the constraint violation through the application's error contract.

## Side effects and jobs

Do not send email or publish a job before a transaction commits. `transaction.on_commit` prevents publication for rolled-back writes, but it does not recover from a process crash after commit and before publishing. A durable outbox is appropriate when losing the job is unacceptable.

## Verify isolation and cost

Test two organizations with synthetic reports. A scoped selector for the first organization must never include the second organization's rows. Test related-object assignments as well as the primary report identifier. Use query-count assertions to expose N+1 behavior when serializing several reports.

Test the service directly for invalid workflow transitions, duplicate requests, and rollback on errors. API tests then verify that identity, membership, permission checks, and error responses connect those rules correctly.
