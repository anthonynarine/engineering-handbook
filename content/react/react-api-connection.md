<!-- content/react/react-api-connection.md — Curated engineering guidance and reference examples. -->
---
title: "Connect React to Django with Axios and TanStack Query"
slug: "react-api-connection"
section: "react"
summary: "Build a typed request boundary and render remote data without mixing it with local UI state."
order: 47
tags: ["react", "architecture", "practical guide"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/frontend-structure.md"]
related: ["frontend-folder-structure", "django-first-api", "frontend-architecture"]
---

## Start with a read-only connection

Use the [Tasks API](/guide/django-first-api) and the [frontend layout](/guide/frontend-folder-structure). The code below is reference integration for a separate React project with Axios and TanStack Query v5 installed. Login remains the local Django browser login for this exercise.

For local development, proxy API requests through Vite so the browser sees one origin. Log in through the frontend's `/api-auth/login/` route, then return to the app. Keep `localhost` versus `127.0.0.1` consistent in the browser.

```typescript
// frontend/vite.config.ts — Proxy the learning API and its login during development.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { proxy: {
    '/api/': 'http://127.0.0.1:8000',
    '/api-auth/': 'http://127.0.0.1:8000',
  } },
});
```

This proxy exists during development. Production needs deliberate routing or a cross-origin policy; static hosting cannot execute Django.

## Transport belongs in the client

```typescript
// frontend/src/api/client.ts — Centralize the same-origin learning transport.
import axios from 'axios';
export const api = axios.create({ baseURL: '/api/', timeout: 15_000 });
```

For separate-origin deployments, choose the API URL through public environment configuration. For cookie authentication, configure credentials, trusted origins, secure cookie policy and CSRF together. Do not simply enable credentials and wildcard CORS. This read example does not implement a mutation or its required CSRF handling.

```typescript
// frontend/src/features/tasks/api.ts — Define the starter's unpaginated list contract.
import { api } from '../../api/client';
export type Task = { id: number; title: string; completed: boolean; created_at: string };
export async function listTasks(signal?: AbortSignal): Promise<Task[]> {
  const response = await api.get<Task[]>('tasks/', { signal });
  return response.data;
}
```

## Server state belongs in TanStack Query

```typescript
// frontend/src/features/tasks/queries.ts — Scope snapshots to the current identity.
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { listTasks } from './api';
export const taskKeys = { list: (userId: string) => ['users', userId, 'tasks'] as const };
export function useTasks(userId: string) {
  return useQuery({
    queryKey: taskKeys.list(userId),
    queryFn: ({ signal }) => listTasks(signal),
    enabled: Boolean(userId),
    retry: (count, error) => {
      if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) return false;
      return count < 2;
    },
  });
}
```

Get `userId` from the application's verified session state, not a hardcoded production identity. For organization data, include the organization ID and normalized filters in the key too. Cache keys partition snapshots; the API still checks access. Axios supports [AbortController cancellation](https://axios-http.com/docs/cancellation), allowing the query signal to reach the request.

```tsx
// frontend/src/app/providers.tsx — Create one query client for this browser application.
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
export const queryClient = new QueryClient();
export function AppProviders({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

Wrap `<App />` with `<AppProviders>` in `main.tsx`. A task page consumes `useTasks(userId)` and renders pending, error, empty and success states. Keep form drafts and dialog state in React.

## Plan writes and session changes

On a successful task mutation, invalidate `taskKeys.list(userId)` using the authoritative response and current scope. Do not automatically retry a non-idempotent write. On logout or identity change, cancel in-flight private queries and clear their cache before displaying the next session. An organization switch needs new keys and current authorization, not a recycled list from the previous tenant.

The [TanStack Query quickstart](https://tanstack.com/query/latest/docs/framework/react/quick-start) documents provider, query and mutation APIs. Verify actual login, session expiry, failed fetches and switching identities in your integration; these snippets alone do not provide an authentication system.

## When the frontend and API have different origins

Follow the dedicated [CORS chapter](/guide/django-cors) for direct local requests, deployed origin allowlists, preflight, credentials and CSRF. Keep the development proxy and production routing decisions explicit.
