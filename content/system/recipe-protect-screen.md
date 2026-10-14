<!-- content/system/recipe-protect-screen.md — Practical build recipe and verification guidance. -->
---
title: "Recipe: protect a React screen"
slug: "recipe-protect-screen"
section: "system"
summary: "Gate navigation using session state while keeping authorization on the API."
order: 71
tags: ["recipe", "building", "checklist"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/build-recipes.md"]
related: ["authentication-options", "gait-auth-walkthrough", "frontend-state-contracts"]
---

## Before you start

The application must already resolve a session with explicit loading, signed-in and signed-out states. This example uses React Router's `Navigate` and `Outlet`. It does not implement token verification or login.

## File and integration excerpt

```tsx
// frontend/src/app/RequireSession.tsx — Avoid rendering private screens before session resolution.
import { Navigate, Outlet, useLocation } from 'react-router';
type SessionState = 'loading' | 'signed-in' | 'signed-out' | 'unavailable';
export function RequireSession({ state }: { state: SessionState }) {
  const location = useLocation();
  if (state === 'loading') return <p role="status">Checking your session…</p>;
  if (state === 'unavailable') return <p role="alert">Session service unavailable. Try again.</p>;
  if (state === 'signed-out') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
```

Nest private routes beneath this element and pass the real provider's session state. Keep `/login` outside the protected branch. Only accept safe internal return paths after login; do not redirect to arbitrary submitted URLs.

## Verify both boundaries

Check a direct private URL, reload during session restoration, expired login, an unavailable provider and logout. Clear private query data when the identity ends or changes. Call the underlying endpoint directly without credentials and as an unauthorized user: the API must deny access even when the route guard is bypassed.

A React route guard improves navigation. The [authentication options](/guide/authentication-options) and [Gait walkthrough](/guide/gait-auth-walkthrough) explain the actual identity and permission boundaries.
