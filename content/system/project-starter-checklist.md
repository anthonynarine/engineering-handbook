<!-- content/system/project-starter-checklist.md — Practical build recipe and verification guidance. -->
---
title: "Start a project: my build checklist"
slug: "project-starter-checklist"
section: "system"
summary: "Choose frontend-only or full-stack and track the steps from repository setup to release."
order: 0.6
tags: ["recipe", "building", "checklist"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/build-recipes.md"]
related: ["build-manual", "build-recipes", "full-stack-folder-structure"]
---

## Make the next step visible

Choose the project type above, then work through its checklist. Progress is saved in this browser when storage is available, separately for each project type. It is a reusable personal checklist, not a per-repository tracker: export your notes before resetting it for another project.

A checked box records your own completion claim. This handbook does not run commands, inspect your repository or verify a deployment. Exported notes preserve that distinction.

## Use the right amount of architecture

A frontend-only build needs a reliable reading or interaction flow, accessibility, a production build and static hosting. A full-stack application adds identity, permission boundaries, a database, API contracts and backend operations. Add workers, WebSockets and AI when a requirement calls for them—not as mandatory startup dependencies.

## Build one useful slice

Begin with the smallest end-to-end action that proves the application works. For a full-stack example, follow the [Tasks API](/guide/django-first-api) and [React connection](/guide/react-api-connection). For feature operations, use the [recipe index](/guide/build-recipes).
