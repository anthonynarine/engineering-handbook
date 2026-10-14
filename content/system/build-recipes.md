<!-- content/system/build-recipes.md — Practical build recipe and verification guidance. -->
---
title: "Build recipes: find the task, follow the steps"
slug: "build-recipes"
section: "system"
summary: "Short implementation paths with file locations, copyable excerpts and checks."
order: 0.7
tags: ["recipe", "building", "checklist"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/build-recipes.md"]
related: ["project-starter-checklist", "django-toolkit", "frontend-architecture"]
---

## Use a recipe while building

Search the task list above and open the relevant recipe. Each gives prerequisites, file locations, an integration excerpt, and checks to run in the real application. Examples reuse the manual's Tasks and Reports domains; a snippet is not a complete application scaffold.

## Keep the deeper guide nearby

Recipes handle a narrow task. The linked chapters explain architecture, failure behavior and alternatives. Start a new application with the [project checklist](/guide/project-starter-checklist), then return here when you need an implementation path.

## Verification stays explicit

These are reference instructions. Copying an example or marking a checklist item does not execute a backend test, establish authentication or prove a release is ready.

## When something fails

Open the [troubleshooting desk](/guide/troubleshooting-desk) to start from a symptom and find the failing boundary before changing configuration.
