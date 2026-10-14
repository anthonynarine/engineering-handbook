<!-- content/system/recipe-query-mutation.md — Practical build recipe and verification guidance. -->
---
title: "Recipe: refresh the right query after a write"
slug: "recipe-query-mutation"
section: "system"
summary: "Connect an authoritative mutation to the cache entries that depend on it."
order: 75
tags: ["recipe", "building", "checklist"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/build-recipes.md"]
related: ["react-api-connection", "frontend-state-contracts", "django-cors"]
---

## Before you start

Use the Tasks API and [Axios/Query connection](/guide/react-api-connection). Configure the authentication and CSRF handling required by your API before using POST; the read-only client example alone does not implement session writes.

## File and integration excerpt

```typescript
// frontend/src/features/tasks/useCreateTask.ts — Refresh this user's list after a confirmed write.
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { Task } from './api';
import { taskKeys } from './queries';
export function useCreateTask(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const response = await api.post<Task>('tasks/', { title });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.list(userId) });
    },
    retry: false,
  });
}
```

Use inside a signed-in screen and submit through its mutation state. Preserve a useful form draft on failure and prevent accidental repeat submissions. A lost response can follow a committed write, so disabling retries is not an idempotency guarantee. Commands that must be safely replayed need a backend idempotency contract.

## Verify

Check successful creation, validation errors, CSRF/authentication rejection, a response lost after commit and logout while the mutation is pending. On identity changes, ensure no late callback repopulates the next user's private view. For organization data, partition all affected keys by organization and invalidate derived consumers deliberately.

The [frontend state guide](/guide/frontend-state-contracts) explains downstream consumers and why a global refetch is usually a poor substitute for known dependencies.
