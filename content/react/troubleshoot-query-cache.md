<!-- content/react/troubleshoot-query-cache.md — Symptom-led investigation and verification guidance. -->
---
title: "Troubleshoot: stale or incorrect React query data"
slug: "troubleshoot-query-cache"
summary: "Trace the authoritative response, query identity and invalidation before forcing a reload."
section: "react"
order: 83
tags: ["troubleshooting", "diagnosis", "failure", "verification"]
status: "established-pattern"
lastReviewed: "2026-10-14"
sources: ["reference_sources/troubleshooting.md"]
related: ["recipe-query-mutation", "frontend-state-contracts", "react-api-connection"]
---

## Symptom

A successful save is not visible, switching organizations shows an old list, or the UI changes only after a full reload.

## 1. Establish whether the write succeeded

Inspect the authoritative mutation response and a scoped read of the resulting record. A stale cache and a server-side failure need different corrections. A lost response can follow a committed write; do not automatically submit it again.

## 2. Inspect the exact query identity

Compare the key used by the reader with the key targeted by the mutation. Include the current user or organization and normalized filters that change the representation. Check whether the query is enabled and whether the component observes the intended QueryClient/provider.

```typescript
// frontend/src/features/reports/queryKeys.ts — Keep list identity explicit.
export const reportKeys = {
  list: (orgSlug: string, status: string) =>
    ['org', orgSlug, 'reports', 'list', { status }] as const,
};
```

Do not include unstable timestamps or unrelated UI state just to force fresh fetches. Conversely, omitting organization identity can mix snapshots across workspaces. Keys partition client data; backend authorization remains required.

## 3. Follow downstream consumers

A mutation may affect a detail view, several filtered lists and derived aggregates. Update a known detail entry with an authoritative representation or invalidate the relevant scoped consumers. Await invalidation when a subsequent redirect depends on its completion. See the [query mutation recipe](/guide/recipe-query-mutation).

Invalidating is not a promise that every disabled or unobserved query immediately sends a request. Inspect the query's lifecycle and actual network activity. A UI holding a copied local snapshot may also ignore a correctly refreshed cache.

## Verify the correction

Test the original mutation, a filtered list, organization change during an in-flight request, logout and a different user's next session. Confirm old requests cannot repopulate the active view with private data. Avoid a global browser reload as the only evidence of a cache fix.

The [frontend contract guide](/guide/frontend-state-contracts) explains server-state ownership, downstream consumers and workspace behavior. This chapter does not run queries against any project backend.
