<!-- content/react/frontend-folder-structure.md — Curated engineering guidance and reference examples. -->
---
title: "My frontend project structure"
slug: "frontend-folder-structure"
section: "react"
summary: "A standalone React layout with feature ownership, Axios transport and TanStack Query."
order: 46
tags: ["react", "architecture", "practical guide"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/frontend-structure.md"]
related: ["full-stack-folder-structure", "react-api-connection", "frontend-architecture"]
---

## Start with a standalone React project

A frontend-only application has no empty backend directory. Its repository root is the frontend root. In a full-stack repository, this same tree lives inside `frontend/`.

```text
frontend-project/
├── .gitignore
├── .env.example
├── README.md
├── package.json
├── package-lock.json
├── index.html
├── vite.config.ts
├── tsconfig.json
├── public/                       # files served without module imports
└── src/
    ├── main.tsx                  # mount React
    ├── app/
    │   ├── App.tsx               # application composition
    │   ├── routes.tsx            # routing
    │   └── providers.tsx         # shared providers
    ├── api/
    │   └── client.ts             # Axios instance and transport policy
    ├── features/
    │   └── tasks/
    │       ├── api.ts            # task request functions and DTOs
    │       ├── queries.ts        # keys and TanStack Query hooks
    │       ├── TasksPage.tsx
    │       ├── components/
    │       └── TasksPage.test.tsx
    ├── components/
    │   └── ui/                   # reusable controls without feature rules
    ├── hooks/                    # genuinely shared React behavior
    ├── lib/                      # shared non-React helpers
    ├── assets/                   # imported images and fonts
    ├── styles/
    └── test/                     # shared test setup and fixtures
```

Create folders when they have a responsibility to hold. A small app can begin with `app`, `features`, `components` and `styles`; it does not need an empty architecture skeleton.

## Scaffold and keep generated configuration

```bash
# Terminal — new standalone application; use the full-stack frontend path instead if needed.
npm create vite@latest frontend-project -- --template react-ts
cd frontend-project
npm install
npm install axios @tanstack/react-query
npm run dev
```

This intentionally uses the current scaffold, not a promise of identical generated files forever. Review its Node requirement and commit the resulting lockfile. Keep a single package manager for the project. Add a routing library when the application needs multiple routes; `app/routes.tsx` is a placement convention, not a file Vite generates.

## Give Axios and TanStack Query separate jobs

Axios owns requests, base URL, cancellation and transport-level error handling. TanStack Query owns remote snapshots, loading/error states and invalidation. Feature modules own endpoint functions and keys. React state owns open menus, form drafts and selected tabs. See the [working connection example](/guide/react-api-connection).

A shared client should not import a page or a feature. A reusable button should not import task queries. Cross-feature behavior belongs in explicit application composition or a deliberate public feature interface; avoid reaching into another feature's private component files.

## Standalone .gitignore

```gitignore
# /.gitignore — Local files and generated output for a frontend-only repository.
node_modules/
dist/
build/
coverage/
.vite/
playwright-report/
test-results/
*.log
.env
.env.*
!.env.example
.DS_Store
```

Commit package manifests, lockfiles, source assets and safe environment examples. This is one `.gitignore` for a standalone frontend. The [full-stack layout](/guide/full-stack-folder-structure) uses three because it has a shared root and two runtimes.

## Verify the boundaries

Check that a clean clone can install and build, a direct route reload works on the host, every screen has loading/error/empty states, and a user change clears sensitive cached data. Test organization switching during an in-flight request where applicable. Directory names help navigation; backend access checks still enforce security.
