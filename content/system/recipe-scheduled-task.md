<!-- content/system/recipe-scheduled-task.md — Practical build recipe and verification guidance. -->
---
title: "Recipe: add scheduled backend work"
slug: "recipe-scheduled-task"
section: "system"
summary: "Separate the command, durable business job and scheduler that invokes it."
order: 73
tags: ["recipe", "building", "checklist"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/build-recipes.md"]
related: ["reliable-job-lifecycle", "backup-and-scheduled-tasks", "django-testing-delivery"]
---

## Before you start

Choose the scheduler available on your deployment platform and decide how missed or duplicate invocations are handled. A management command is an entry point; it is not a scheduler or a durable worker by itself.

## File and integration excerpt

Create the app's `management/` and `management/commands/` packages with `__init__.py` files. This harmless command is a smoke check for command discovery and scheduler invocation, not a production job runner.

```python
# backend/apps/tasks/management/commands/scheduler_probe.py — Verify a scheduler can invoke Django.
from django.core.management.base import BaseCommand
from django.utils import timezone

class Command(BaseCommand):
    help = "Print an invocation timestamp without changing application records."

    def handle(self, *args, **options):
        self.stdout.write(f"Scheduler probe invoked at {timezone.now().isoformat()}")
```

```bash
# Terminal — backend/, then the same environment through your chosen scheduler.
python manage.py scheduler_probe
```

Commit the command and configure the scheduler explicitly on the host. Keep credentials in its environment configuration. For real work, call a tested service or enqueue a durable job with a business identity; avoid burying the operation inside scheduler configuration.

## Verify

Confirm invocation time and exit status, timezone, disabled schedules and overlapping executions. Then test duplicate delivery, process failure and missed-run reconciliation for the actual operation. A timestamp only proves invocation—it does not prove business completion.

Use [reliable jobs](/guide/reliable-job-lifecycle) for outbox, leases and idempotency, and [scheduling and backups](/guide/backup-and-scheduled-tasks) for operational setup.
