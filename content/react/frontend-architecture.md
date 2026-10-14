<!-- content/react/frontend-architecture.md — Teach build a feature from the inside out. -->
---
title: "Build a feature from the inside out"
slug: frontend-architecture
section: react
summary: "API contracts, query hooks, controllers, and parts with clear responsibilities."
order: 4
tags: [react, controller, query invalidation, cache, frontend]
status: established-pattern
lastReviewed: "2026-10-12"
sources: [reference_sources/MOONLIGHT_ENGINEERING_HANDBOOK_BUILD_PLAN.original.md]
related: [services-and-selectors, system-overview]
---

## Start with the contract

A Reports feature starts with an agreed API representation: stable report identifiers, organization scope, status values, and error shape. TypeScript describes the expected contract; it does not validate an arbitrary server response at runtime. Add runtime validation at the boundary when the input needs it.

The handbook runtime has no API calls. Axios and a server-state query library belong in the applications this chapter teaches, not in the static handbook just to mirror an architecture diagram.

## Give each boundary one job

| Boundary | Responsibility |
| --- | --- |
| API module | URLs, transport, input/output contracts |
| Query hook | Server cache identity, fetch and mutation lifecycle |
| Controller | Combine query state, actions, and local UI behavior |
| Page | Compose the workspace |
| Parts | Render props and emit user intent |
| Barrel | Export the feature's public interface |

Avoid controllers for every small visual component. A controller is useful where several state sources and user actions meet.

## Separate server and local state

Report status belongs to the server. A dialog's open state belongs to the browser. A server-state cache is a snapshot with a refresh policy, not another durable database. Persist only preferences that should survive a reload; do not put access tokens or sensitive report records in reading preferences.

## Organization-aware query keys

Include organization identity in every tenant-specific cache key. When organization changes, requests and views must use the newly authorized scope. On logout, clear user-specific caches so a subsequent session cannot see the previous user's data.

**src/features/reports/api/queryKeys.ts · excerpt**

```typescript
// src/features/reports/api/queryKeys.ts — Partition report cache entries.
export const reportKeys = {
  list: (organizationId: string) =>
    ['organizations', organizationId, 'reports'] as const,
  detail: (organizationId: string, reportId: string) =>
    ['organizations', organizationId, 'reports', reportId] as const,
};
```

These keys express scope; they do not enforce backend authorization.

## Choose a refresh strategy

After creating a report, use the authoritative response to populate its detail entry and invalidate affected list queries. If a mutation changes a field used by a list filter or aggregate, refresh those derived views too. Refetch a specific query when only that snapshot requires a fresh result.

Optimistic updates fit reversible actions with predictable outcomes. Save the previous snapshot, cancel conflicting reads, apply the optimistic change, roll back on failure, and reconcile with the server afterward. For a queued generation job, avoid claiming success optimistically: display the accepted job and observe its actual status.

## Render every state

Loading is not the same as an empty result. Preserve useful existing data during a background refresh. Give failed actions actionable feedback and a retry when safe. Associate form errors with the relevant field, keep focus visible, and return dialog focus to its trigger.

## Verify the behavior

Exercise create success, validation failure, network failure, tenant switching, logout, and job completion. Confirm invalidation targets the correct organization and that parts can render their loading, error, and empty props without an API connection.

## Put the boundaries into folders

Use the [frontend structure](/guide/frontend-folder-structure) for a standalone app or the same layout under `frontend/` in a [full-stack repository](/guide/full-stack-folder-structure). The [Axios and TanStack Query example](/guide/react-api-connection) connects transport, cancellation, cache keys and providers.
