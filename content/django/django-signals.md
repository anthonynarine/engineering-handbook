<!-- content/django/django-signals.md — Curated engineering guidance and reference examples. -->
---
title: "Signals: useful hooks, visible workflows"
slug: "django-signals"
section: "django"
summary: "Choose between a receiver, an explicit service call and a durable job."
order: 2.6
tags: ["django", "architecture", "practical guide"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/django-toolkit.md"]
related: ["services-and-selectors", "reliable-job-lifecycle", "django-models-orm"]
---

## Use a signal for a small independent reaction

Signals can connect decoupled receivers to framework events. Examples include a lightweight cache invalidation hook or a local integration responding to a model event. A reader should still be able to discover where the receiver is registered and what it does.

If an operation must always occur as part of a business workflow, an explicit service call is usually easier to understand and test. Creating a financial record and updating its authoritative balance should not depend on an easily missed receiver import.

## Know the traps

Model save receivers can run before the enclosing transaction commits. Publishing a task there can expose uncommitted or rolled-back data. Use `on_commit` where appropriate, and a durable outbox when delivery must survive a crash.

`QuerySet.update` and bulk creation do not call each model's `save` and its save signals. A receiver is therefore not a universal invariant enforcement mechanism. Protect durable invariants with database constraints and controlled workflow entry points.

## Register intentionally

Import the receiver module in the app configuration's `ready` method. Do not query the database while loading the app. Use a stable `dispatch_uid` where duplicate registration is possible, keep handlers short and avoid recursive saves. Signals do not turn synchronous work into a background job.

## Decision checklist

| Need | Prefer |
| --- | --- |
| Mandatory multi-model operation | Explicit transactional service |
| Small independent framework-event reaction | Signal with clear registration |
| Slow or retryable external effect | Durable job published after commit |
| Must never lose an event | Transactional outbox and retrying delivery |

Test receiver registration, repeated events, rollback, bulk-operation bypass and handler failure. The [Django signal guide](https://docs.djangoproject.com/en/5.2/topics/signals/) explains dispatch and recommends considering explicit calls when code lives in the same project.
