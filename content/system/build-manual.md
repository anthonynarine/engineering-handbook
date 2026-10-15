<!-- content/system/build-manual.md — Provide the owner's ordered build-manual entry point. -->
---
title: "My build workflow: from repo to release"
slug: build-manual
section: system
summary: "The starting point for my engineering manual: choose a layout, build with Foundry, verify the boundaries and ship."
order: 0.5
tags: [workflow, manual, structure, foundry, delivery]
status: established-pattern
lastReviewed: "2026-10-15"
sources: [reference_sources/django-toolkit.md, reference_sources/frontend-structure.md, reference_sources/projects-inspection.md]
related: [django-toolkit, frontend-folder-structure, foundry-repository]
---

## Use this as the starting checklist

This is my master manual for building. The goal is a repeatable path from an idea to a working application, with the structure, decisions and checks easy to find. Not every application needs every tool.

Use the [interactive project checklist](/guide/project-starter-checklist) to track your next steps, and the [recipe directory](/guide/build-recipes) for common implementation tasks.

## 1. Establish the repository and project shape

Start with [Git basics and pull requests](/guide/git-basics). Keep the [Git command reference](/guide/git-command-reference) nearby when staging, branching or reviewing a change.

For a documentation site or browser-only tool, start with the [frontend structure](/guide/frontend-folder-structure). For an application with its own API, start with the [Django + React structure](/guide/full-stack-folder-structure): one repository, backend and frontend directories, three ignore files. Define what belongs to the browser and what requires server authority before choosing libraries.

## 2. Establish the work

Use the [Foundry setup tutorial](/guide/foundry-repository) for repository creation, installation and initialization. Write the intended outcome, scope and acceptance checks before assigning work. Keep human release authority explicit. Foundry helps coordinate building; the application's runtime remains a separate system.

## 3. Build a small vertical slice

Follow the [Django learning path](/guide/django-toolkit) from environment setup to a protected REST endpoint. Connect the [React transport and query layer](/guide/react-api-connection). Get one real operation working through the interface, API and database before adding more subsystems.

For a frontend-only project, deliver a complete reading or interaction flow and verify static hosting instead of creating an unnecessary backend.

## 4. Add the boundaries the product needs

Choose [authentication](/guide/authentication-options), apply [tenant isolation](/guide/tenant-isolation) where needed, and define roles around actual operations. Choose [views](/guide/django-views), [services](/guide/services-and-selectors), [Channels](/guide/django-channels) or [background jobs](/guide/reliable-job-lifecycle) because a requirement calls for them.

For AI, keep authoritative calculations and permissions outside the model. Use [deterministic context](/guide/deterministic-ai), scoped documents and explicit fallback behavior.

## 5. Verify failures before release

Check ownership, permissions, invalid inputs, retries, concurrent work and recovery. Exercise loading, error and empty states in the interface. Use the [Django delivery checks](/guide/django-testing-delivery), [Reports walkthrough](/guide/reports-verification) and [failure drills](/guide/auth-and-document-drills) to select checks appropriate to the change.

Reference examples and completed handbook exercises are not executed application tests. Record what actually ran and what remains unverified.

## 6. Deploy and keep it running

Choose the [deployment platform](/guide/deployment-platforms) for the processes the application needs. Use the [CI/CD map](/guide/ci-cd-release-workflow) to separate checks, approval and deployment. Follow [Django on Heroku](/guide/heroku-django-deployment) and the [Heroku operations reference](/guide/heroku-operations) when that is the selected host. Configure migrations, secrets, storage and static delivery deliberately. Define [scheduled work and backups](/guide/backup-and-scheduled-tasks), then verify recovery through the [runbook](/guide/recovery-runbook).

## 7. Feed real experience back into the manual

Use the [project case studies](/projects) to compare real boundaries and tradeoffs. When a project changes, update the relevant guide and its source evidence. Label a new idea as proposed until it has been implemented and checked. Keep the default path simple enough to follow, and put optional tools where their requirements become relevant.

## When something fails

Open the [troubleshooting desk](/guide/troubleshooting-desk) to start from a symptom and find the failing boundary before changing configuration.

## Keep the reference useful

Define [API contracts](/guide/api-contracts), plan [database changes](/guide/safe-database-migrations), select a [testing strategy](/guide/testing-strategy), and prepare [operational runbooks](/guide/operational-runbooks). Save frequently used guides in [My library](/guide/my-library); bookmarks and recent visits stay in your browser.

## Keep learning deliberately

Use the [Learning roadmap](/guide/learning-roadmap) for the few skills you want to practice next. Suggested topics, self-reported learning and executed project evidence remain separate.

## Find a specific answer

Open [All guides](/guides) to search a command or filter by topic. The sidebar follows the same topic names; previous and next links stay within your current topic or project. Use [Git worktrees](/guide/git-worktrees) when separate Foundry tasks need separate directories.
