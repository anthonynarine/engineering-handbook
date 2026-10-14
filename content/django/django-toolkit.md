<!-- content/django/django-toolkit.md — Curated engineering guidance and reference examples. -->
---
title: "Django: the learning path and toolkit"
slug: "django-toolkit"
section: "django"
summary: "Start a project, build a REST API, then choose the tools your system needs."
order: 1.5
tags: ["django", "architecture", "practical guide"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/django-toolkit.md"]
related: ["django-setup", "django-first-api", "django-views"]
---

## Start here

This is my curated path through Django: how the pieces fit together, the choices I make, and the mistakes to test for. The examples use a small personal Tasks API before introducing organization-scoped systems. They are reference code for a separate application; this handbook runs no backend.

### Getting started

1. [Choose the full-stack folder structure](/guide/full-stack-folder-structure).
2. [Create the Django workspace](/guide/django-setup).
3. [Install REST Framework and build a first endpoint](/guide/django-first-api).
4. [Connect React using Axios and TanStack Query](/guide/react-api-connection).
5. [Verify the backend and prepare deployment](/guide/django-testing-delivery).

### Core tools and decisions

| Tool | Reach for it when | Keep the boundary clear |
| --- | --- | --- |
| [ORM and migrations](/guide/django-models-orm) | Modeling durable records and relationships | Database constraints protect invariants |
| [Views and ViewSets](/guide/django-views) | Mapping HTTP requests to operations | Transport should not hide domain workflows |
| [Serializers and permissions](/guide/django-rest-boundaries) | Validating input and enforcing API access | Valid input is not permission to act |
| [Services and selectors](/guide/services-and-selectors) | Sharing writes and scoped reads | Application workflow stays explicit |
| [Middleware](/guide/django-middleware) | Establishing request-wide context | Selecting a tenant does not authorize it |
| [CORS](/guide/django-cors) | React and Django use different origins | Browser response access is distinct from authentication and CSRF |
| [Signals](/guide/django-signals) | Connecting small, decoupled event handlers | Required workflow should remain visible |
| [WebSockets](/guide/websocket-design) | Designing a live connection and recovery contract | Transport delivery is not durable application completion |
| [Channels](/guide/django-channels) | Bidirectional live interactions | Authenticate, authorize and recover connections |
| [Jobs and schedules](/guide/reliable-job-lifecycle) | Work must outlive the HTTP request | Durable state and retry policy own completion |
| [Authentication](/guide/authentication-options) | Selecting sessions, JWT, Clerk or Gait | Identity and application authorization differ |
| [Operations](/guide/backup-and-scheduled-tasks) | Backups, periodic work and recovery | A schedule is not evidence of success |

## Learn from the projects

[Gaming](/guide/gaming-multiplayer-flow) shows Channels and server-owned multiplayer state. [EstateIQ](/guide/estateiq-domain-map) shows tenancy, financial workflows, documents and AI boundaries. [Gait](/guide/gait-auth-walkthrough) connects browser sessions with API verification. These are design studies, with their inspected-source limitations recorded alongside them.

## Add tools as requirements appear

Start with Django, DRF, a database and tests. Add Channels for actual live interaction; add a worker for durable asynchronous work. Redis can provide a channel layer or broker, but those are distinct responsibilities. Neither installing Redis nor adding a Python dependency starts the required service.

The framework reference answers every API option. This handbook answers where the tool belongs and how I would verify its use.

## Contracts, safe changes and evidence

Use [API contracts](/guide/api-contracts) to connect server and client expectations, [safe migrations](/guide/safe-database-migrations) to evolve live data, and the [testing strategy](/guide/testing-strategy) to choose meaningful checks. When a check fails, start at the [troubleshooting desk](/guide/troubleshooting-desk).
