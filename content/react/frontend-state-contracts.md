<!-- content/react/frontend-state-contracts.md — Teach EstateIQ-derived engineering boundaries. -->
---
title: "Feature controllers, cache contracts, and workspace UX"
slug: frontend-state-contracts
section: react
summary: "Use EstateIQ patterns for typed transport, scoped server state, and deliberate visual hierarchy."
order: 18
tags: [react, estateiq, architecture, implementation]
status: established-pattern
lastReviewed: "2026-10-12"
sources: [reference_sources/estateiq-inspection.md]
related: [estateiq-tenant-boundary, deterministic-ai, estateiq-domain-workflows]
---

## Build from contract to presentation

EstateIQ features use typed API modules, query hooks, controller/workspace hooks, pages, and presentational parts. A controller is valuable where multiple state sources and user actions meet. A visual card should receive explicit props rather than independently fetching a competing version of domain truth.

The handbook itself stays static and frontend-only. Axios and TanStack Query are taught here because EstateIQ uses a backend, not installed merely to make a documentation app look full-stack.

## Scope query identity

The inspected OrgProvider invalidates queries with the `org` prefix on workspace changes. Feature query keys should include organization and normalized filter values. Canonical period/filter inputs keep cache identity predictable when URLs and controls change.

**src/features/example/queryKeys.ts · synthetic excerpt**

```typescript
// src/features/example/queryKeys.ts — Partition a feature's server snapshots.
export const exampleKeys = {
  list: (orgSlug: string, period: string) =>
    ['org', orgSlug, 'example', 'list', period] as const,
};
```

A key convention helps switching behavior; it is not server authorization. Inspect each feature for keys outside the convention before assuming a prefix-based invalidation covers every view.

## A mutation has downstream consumers

A payment allocation can change the lease ledger, Revenue collection rows, summary totals, and dashboard consumers. Unit creation can change plan usage. Document confirmation can change expenses, evidence links, and review counts. Track affected contracts explicitly.

An authoritative mutation response can update a detail cache directly. Derived aggregates usually need invalidation or recomputation through their server source. Avoid optimistic financial totals unless the operation and rollback policy justify it.

## Workspace and transient state

The inspected layout owns one global Copilot drawer and uses current organization context. The feature owns conversation behavior. Document preview owns session chat and Blob lifecycle. Page/controller composition connects those behaviors without turning every presentational component into an orchestrator.

Local state includes open drawers, selected tabs, and editing inputs. Server state includes membership, quotas, financial records, and derived setup status. Do not make a local success banner the authority for a provider webhook or background job outcome.

## The EstateIQ visual language

Its visual reference uses zinc/near-black surfaces, subtle borders, generous rounded panels, cyan actions, emerald healthy state, amber attention, and red danger. Major headers explain the workspace and primary action; badges communicate scope or status. Dense content remains grouped into purposeful surfaces.

The handbook borrows those principles: a focused header, compact section navigation, stronger article identity, subdued surfaces, cyan interaction, and diagrams that respect the surrounding theme. A reference article still needs readable line length and prose rhythm; adopting dashboard styling does not require adding invented KPI cards.

## Verify behavior with design

Review empty, loading, partial, error, and stale-refresh states. Check keyboard focus, drawer dismissal, restored focus, mobile overflow, and contrast in both themes. Test an organization switch during in-flight requests and a mutation affecting more than one view.

Source inspection found concrete loading/error states in dashboard panels and structured metadata/action treatment in document headers. The handbook applies that hierarchy to reading and navigation; it does not reuse EstateIQ's business records or private assets.
