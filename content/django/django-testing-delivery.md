<!-- content/django/django-testing-delivery.md — Curated engineering guidance and reference examples. -->
---
title: "Verify a Django API and prepare delivery"
slug: "django-testing-delivery"
section: "django"
summary: "Check identity boundaries, migrations and operational readiness before shipping."
order: 2.8
tags: ["django", "architecture", "practical guide"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/django-toolkit.md"]
related: ["django-first-api", "deployment-platforms", "recovery-runbook"]
---

## Start with the Tasks API

Create `backend/apps/tasks/tests.py` with this owner-boundary test. Django creates an isolated test database; use synthetic records.

```python
# backend/apps/tasks/tests.py — Prove another user cannot read a task.
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from .models import Task

class TaskIsolationTests(APITestCase):
    def test_other_owner_cannot_read_task(self):
        user_model = get_user_model()
        owner = user_model.objects.create_user(username="owner", password="test-only-password")
        other = user_model.objects.create_user(username="other", password="test-only-password")
        task = Task.objects.create(owner=owner, title="Private task")
        self.client.force_authenticate(user=other)
        self.assertEqual(self.client.get("/api/tasks/").data, [])
        self.assertEqual(self.client.get(f"/api/tasks/{task.pk}/").status_code, 404)
```

This assumes the starter's unpaginated default. If pagination is configured, inspect its `results` field instead. `force_authenticate` tests authorization wiring; it bypasses real login and does not verify credentials, cookies or CSRF. Add separate transport-level authentication tests.

```bash
# Terminal — backend/, with the selected environment active.
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test apps.tasks
```

## Broaden by risk

Add validation failures, owner injection, update/delete isolation and anonymous requests. Domain tests should prove constraints, rollback and idempotency. Use the target database for locking and concurrent-write tests. Check query counts for list representations.

For session authentication, use explicit CSRF-enforcing tests. For JWT, verify expiration, issuer/audience where applicable, revoked-session behavior and provider outages. Read the [DRF testing guide](https://www.django-rest-framework.org/api-guide/testing/) for the difference between API helpers and full request behavior.

## Prepare deployment as its own step

Run `check --deploy` with production settings; it is a configuration diagnostic, not a complete security audit. Set secrets through the host, configure allowed hosts and trusted origins deliberately, disable debug, apply migrations with a release plan and serve via a production WSGI or ASGI process.

Static frontend hosting does not run Django. Heroku web/worker processes, scheduled work and S3 storage have different responsibilities. Follow the [deployment platforms](/guide/deployment-platforms) and [recovery runbook](/guide/recovery-runbook). Verify backups by restoring them; verify jobs by their recorded outcomes.

The handbook build validates these articles and diagrams. It does not execute this backend or prove that any source project passed the checks listed here.
