<!-- content/walkthrough/reports-react.md — Teach one stage of the synthetic Reports feature. -->
---
title: "04 · Build the React feature boundary"
slug: reports-react
section: walkthrough
summary: "Connect typed transport, scoped queries, mutation recovery, and presentational parts."
order: 22
tags: [reports, walkthrough, django, react, foundry, tenant, implementation]
status: proposed-design
lastReviewed: "2026-10-12"
sources: [reference_sources/reports-walkthrough.md, reference_sources/estateiq-inspection.md, reference_sources/foundry-inspection.md]
related: [reports-api, reports-verification]
---

## Keep the feature in one place

This is reference code for the separate full-stack application. The handbook lab uses ordinary React state to simulate the contract; it does not install a query library or contact Django.

```text
src/features/reports/
  api/reports.ts             wire types and transport
  hooks/useReports.ts       server-state identity and refresh
  hooks/useReportsController.ts  form, selection, uncertain commands
  pages/ReportsPage.tsx      compose the workspace
  parts/ReportsWorkspace.tsx explicit props and visual states
  index.ts                  public feature exports
```

Use the application's existing auth and organization providers. An access token passed into these examples must come from that auth boundary; do not hard-code it or store it in a tutorial file.

## Type and capture the request

```typescript
// api/reports.ts — Transport without component state.
export type Scope = { orgSlug: string; userId: string; accessToken: string };
export type Report = {
  id: string; title: string; status: 'draft'; createdAt: string;
};
export type CreateReport = { title: string; creationKey: string };
export type ReportPage = {
  count: number; next: string | null; previous: string | null; results: Report[];
};
export class ApiError extends Error {
  constructor(public status: number, public payload: unknown) {
    super(`Reports request failed (${status})`);
  }
}
const API = '/api/v1/reports/';
async function request<T>(scope: Scope, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${scope.accessToken}`,
      'X-Org-Slug': scope.orgSlug,
    },
  });
  const payload: unknown = await response.json();
  if (!response.ok) throw new ApiError(response.status, payload);
  return payload as T; // Use runtime schema validation at an untrusted boundary.
}
export const reportsApi = {
  list: (scope: Scope, signal?: AbortSignal) =>
    request<ReportPage>(scope, `${API}?limit=20&offset=0`, { signal }),
  detail: (scope: Scope, id: string, signal?: AbortSignal) =>
    request<Report>(scope, `${API}${encodeURIComponent(id)}/`, { signal }),
  create: (scope: Scope, input: CreateReport) =>
    request<Report>(scope, API, { method: 'POST', body: JSON.stringify(input) }),
};
```

Mount these hooks under the application’s `QueryClientProvider`. A production transport must also handle non-JSON proxy errors, token refresh, timeout/cancellation policy, and an explicit API base URL where the frontend and backend use different origins. Do not turn a JSON parse error into an automatic new create command. TypeScript annotations alone do not validate a response at runtime.

## Give snapshots a complete identity

```typescript
// hooks/useReports.ts — TanStack Query v5 reference integration.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reportsApi, type Scope, type CreateReport } from '../api/reports';
export const reportKeys = {
  scope: (scope: Scope) => ['org', scope.orgSlug, 'user', scope.userId, 'reports'] as const,
  list: (scope: Scope) => [...reportKeys.scope(scope), 'list', { limit: 20, offset: 0 }] as const,
  detail: (scope: Scope, id: string) => [...reportKeys.scope(scope), 'detail', id] as const,
};
export function useReports(scope: Scope) {
  return useQuery({
    queryKey: reportKeys.list(scope),
    queryFn: ({ signal }) => reportsApi.list(scope, signal),
  });
}
export function useReportDetail(scope: Scope, id: string | null) {
  return useQuery({
    queryKey: reportKeys.detail(scope, id ?? "none"),
    queryFn: ({ signal }) => reportsApi.detail(scope, id!, signal),
    enabled: id !== null,
  });
}
export function useCreateReport() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({ scope, input }: { scope: Scope; input: CreateReport }) =>
      reportsApi.create(scope, input),
    retry: false,
    onSuccess: (_report, variables) => {
      // Refresh failures belong to query state, not the create result.
      void cache.invalidateQueries({ queryKey: reportKeys.scope(variables.scope) });
    },
  });
}
```

The mutation receives the captured scope, so a delayed response cannot invalidate a newly selected tenant by accident. Query identity includes tenant, actor, and list inputs. Clear the query cache at logout and identity change; revalidate on membership changes. Never use the access token itself as a cache key. TanStack documents query keys as the identity of cached data. [Query key guide](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys).

## Let the controller own recovery

The controller combines query state, selected report, and the current command. Use a keyed feature boundary such as `<ReportsPage key={`${orgSlug}:${userId}`} scope={scope} />` to remount local state on scope changes. On logout, remove that boundary and clear cached protected data.

```typescript
// hooks/useReportsController.ts — Retain one command until its outcome is known.
import { useState } from 'react';
import { ApiError, type Scope, type CreateReport } from '../api/reports';
import { useReports, useCreateReport } from './useReports';
export function useReportsController(scope: Scope) {
  const query = useReports(scope);
  const create = useCreateReport();
  const [title, setTitle] = useState('');
  const [pending, setPending] = useState<CreateReport | null>(null);
  const [message, setMessage] = useState('');
  async function submit() {
    const command = pending ?? { title: title.trim(), creationKey: crypto.randomUUID() };
    setPending(command);
    try {
      await create.mutateAsync({ scope, input: command });
      setPending(null); setTitle(''); setMessage('Draft created or recovered.');
    } catch (error) {
      const rejected = error instanceof ApiError && [400, 401, 403, 404, 409].includes(error.status);
      if (rejected) setPending(null);
      setMessage(rejected ? 'Request rejected. Resolve the error before creating again.'
        : 'Outcome unknown. Retry this same command before editing.');
    }
  }
  return { query, title, setTitle, submit, message,
    busy: create.isPending, uncertain: pending !== null };
}
```

Disable concurrent submit while `busy`. Disable title edits while a command is uncertain and offer a clearly named “Retry same request” action. Surface field errors from 400 rather than only the abbreviated message above. A 409 is a conflict to reconcile, not permission to automatically generate a replacement key. The page below owns selected-detail composition; scope remounting clears that selection.

## Compose the page without hiding states

```tsx
// pages/ReportsPage.tsx — Compose controller output into explicit visual states.
import { useState } from 'react';
import { type Scope } from '../api/reports';
import { useReportDetail } from '../hooks/useReports';
import { useReportsController } from '../hooks/useReportsController';
import { ReportsWorkspace } from '../parts/ReportsWorkspace';
export function ReportsPage({ scope }: { scope: Scope }) {
  const c = useReportsController(scope);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detail = useReportDetail(scope, selectedId);
  return <ReportsWorkspace
    reports={c.query.data?.results ?? []}
    loading={c.query.isPending} failed={c.query.isError}
    title={c.title} onTitleChange={c.setTitle} onSubmit={c.submit}
    busy={c.busy} uncertain={c.uncertain} message={c.message}
    selectedId={selectedId} onSelect={setSelectedId}
    detail={detail.data} detailPending={detail.isFetching} detailFailed={detail.isError}
  />;
}
```

```tsx
// parts/ReportsWorkspace.tsx — Render explicit states without fetching competing data.
import { type Report } from '../api/reports';
type Props = {
  reports: Report[]; loading: boolean; failed: boolean;
  title: string; onTitleChange: (value: string) => void;
  onSubmit: () => Promise<void>; busy: boolean; uncertain: boolean; message: string;
  selectedId: string | null; onSelect: (id: string) => void;
  detail?: Report; detailPending: boolean; detailFailed: boolean;
};
export function ReportsWorkspace(p: Props) {
  return <section aria-label="Reports workspace">
    <h1>Reports</h1>
    <form onSubmit={event => { event.preventDefault(); void p.onSubmit(); }}>
      <label>Title<input value={p.title} maxLength={120}
        disabled={p.busy || p.uncertain}
        onChange={event => p.onTitleChange(event.target.value)}/></label>
      <button disabled={p.busy || (!p.uncertain && !p.title.trim())}>
        {p.busy ? 'Submitting…' : p.uncertain ? 'Retry same request' : 'Create draft'}
      </button>
    </form>
    <p role="status">{p.message}</p>
    {p.loading ? <p>Loading reports…</p> : p.failed ?
      <p role="alert">Reports could not be loaded. Recheck access and retry the read.</p> :
      p.reports.length === 0 ? <p>No reports in this workspace.</p> :
      <ul>{p.reports.map(report => <li key={report.id}>
        <button onClick={() => p.onSelect(report.id)}>{report.title}</button>
      </li>)}</ul>}
    {p.selectedId && <aside aria-label="Report detail">
      {p.detailPending ? <p>Loading detail…</p> : p.detailFailed ?
        <p role="alert">This report is unavailable in the current scope.</p> :
        p.detail && <><h2>{p.detail.title}</h2><p>Status: {p.detail.status}</p></>}
    </aside>}
  </section>;
}
```

```typescript
// index.ts — Expose the feature page at its module boundary.
export { ReportsPage } from './pages/ReportsPage';
```

The presentational workspace takes these props. Show loading, forbidden/error, empty, ready, submitting, and uncertain outcomes distinctly. The runnable [lab](/lab/reports) provides an intentionally compact UI for the command and tenant exercises; it does not claim to implement this TanStack reference integration.

## Checkpoint

Can a delayed North mutation affect the South interface? Can a retry silently obtain a new creation key? Can old detail survive a scope change? Continue to [verification and failure drills](/guide/reports-verification).
