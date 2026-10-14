<!-- content/django/api-contracts.md — Practical reference and clearly scoped verification guidance. -->
---
title: "API contracts: make client and server agree"
slug: "api-contracts"
summary: "Define representations, validation errors, pagination, retries and compatibility before implementing both sides."
section: "django"
order: 86
tags: ["reference", "contracts", "delivery", "manual"]
status: "established-pattern"
lastReviewed: "2026-10-14"
sources: ["reference_sources/manual-reference.md"]
related: ["django-rest-boundaries", "reports-contract", "recipe-query-mutation"]
---

## Write the contract before the integration

For each operation, record the URL/method, authentication, authorized scope, input, output, expected errors, side effects and retry policy. Include an example using synthetic records. The contract is a shared dependency of the React request function, Django serializer/view and tests.

The starter Tasks API is deliberately simple and unpaginated. The conventions below describe choices for a larger application; they do not silently change that starter's response shape.

## Keep representations explicit

List writable fields and distinguish server-managed IDs, timestamps, organization and workflow status. Give money, dates, timezones and missing values explicit representations. Validate related IDs against the same authorized scope. TypeScript types document the client expectation but do not validate arbitrary JSON at runtime.

Use serializers and a published schema to expose the intended representation. Validate responses at sensitive or untrusted boundaries where runtime validation is justified. Do not return raw model dictionaries with accidental internal fields.

## Pick one list contract

A conventional paginated response can use the DRF page-number structure:

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [{ "id": 42, "title": "Synthetic task", "completed": false }]
}
```

Choose bounded page sizes, permitted filters and stable ordering. Document whether changing data can move records between pages; choose cursor semantics deliberately for rapidly changing collections. A frontend expecting an array must be updated when pagination is introduced. See the [DRF pagination reference](https://www.django-rest-framework.org/api-guide/pagination/).

## Make errors actionable

Define field errors, operation errors and unavailable dependencies separately. DRF's default responses do not automatically use a custom application envelope. If the team chooses one, implement the serializer/exception mapping consistently and test it.

```json
{
  "code": "validation_failed",
  "message": "Check the highlighted fields.",
  "fields": { "title": ["Enter a title."] },
  "request_id": "synthetic-request-42"
}
```

This is a proposed envelope, not an existing default. Keep raw exceptions, credentials and sensitive record contents out of the public response. A safe correlation identifier should lead an authorized operator to protected evidence.

## Decide retries and idempotency

A timeout does not prove a write failed. For commands that need safe replay, define key scope, payload fingerprint, retention, in-progress behavior and replay response. The same key with conflicting input must not perform a different operation. Use durable uniqueness/transaction rules rather than only a client-side disabled button.

Document whether an operation finishes immediately or accepts a job whose status must be observed. A successful HTTP acceptance response is not completed background work. Follow the [Reports contract](/guide/reports-contract) for a worked example.

## Evolve without surprise

Adding an optional response field is different from renaming a required field, changing pagination or altering permissions. Plan a compatibility window and explicit versioning/deprecation policy for breaking changes. Update consumers and contract tests together; an OpenAPI document alone does not prove deployed compatibility.

## Verify

Check successful and invalid input, forbidden/read-only field injection, anonymous and foreign-scope access, pagination boundaries, retry after response loss and old/new client behavior. These are proposed application checks, not tests executed by this handbook.
