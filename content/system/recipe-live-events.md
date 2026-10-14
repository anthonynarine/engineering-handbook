<!-- content/system/recipe-live-events.md — Practical build recipe and verification guidance. -->
---
title: "Recipe: connect a live event stream"
slug: "recipe-live-events"
section: "system"
summary: "Own the socket lifecycle and invalidate scoped queries from an explicit event."
order: 74
tags: ["recipe", "building", "checklist"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/build-recipes.md"]
related: ["websocket-design", "django-channels", "react-api-connection"]
---

## Before you start

Implement an authenticated, authorized socket endpoint using the [WebSocket contract](/guide/websocket-design) and [Channels boundary](/guide/django-channels). The excerpt assumes cookie-session authentication has already been deliberately configured. It does not attach bearer credentials or implement reconnects.

## File and integration excerpt

```typescript
// frontend/src/features/tasks/live.ts — Observe a defined event and return connection cleanup.
import type { QueryClient } from '@tanstack/react-query';
export function observeTaskChanges(url: string, userId: string, queryClient: QueryClient) {
  const socket = new WebSocket(url);
  const onMessage = (event: MessageEvent) => {
    if (typeof event.data !== 'string') return;
    try {
      const message: unknown = JSON.parse(event.data);
      if (message && typeof message === 'object' && 'type' in message && message.type === 'tasks.changed') {
        void queryClient.invalidateQueries({ queryKey: ['users', userId, 'tasks'] });
      }
    } catch { /* Malformed events do not update application state. */ }
  };
  socket.addEventListener('message', onMessage);
  return () => {
    socket.removeEventListener('message', onMessage);
    socket.close(1000, 'Leaving task view');
  };
}
```

Call from a feature effect and return its cleanup; use the verified current user ID and a configured `wss://` URL in production. Scope the server subscription to that user. For tenant data, include the organization in both the subscription and query keys. Coalesce or rate-limit frequent invalidations in a busy stream.

## Verify

Check authorized connection, rejected origin, foreign subscription, malformed event, unmount, logout and dropped connection. This minimal excerpt intentionally needs separate connection-status and reconnect/snapshot handling before a resilient production experience. Do not silently present a disconnected stream as healthy.
