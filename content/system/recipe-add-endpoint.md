<!-- content/system/recipe-add-endpoint.md — Practical build recipe and verification guidance. -->
---
title: "Recipe: add a protected REST endpoint"
slug: "recipe-add-endpoint"
section: "system"
summary: "Add one operation with validation, scoped lookup and an explicit API contract."
order: 70
tags: ["recipe", "building", "checklist"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/build-recipes.md"]
related: ["django-first-api", "django-views", "django-rest-boundaries"]
---

## Before you start

Use an existing Django/DRF application with authentication and a Task model. The [starter API](/guide/django-first-api) supplies the owner-scoped model, serializer and ViewSet. This excerpt adds a read-only completed-task endpoint; it does not expose general model editing.

## Files and implementation

Create `backend/apps/tasks/completed_views.py`, then mount the view from your existing app URL configuration.

```python
# backend/apps/tasks/completed_views.py — Return only the caller's completed tasks.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def completed_tasks(request):
    rows = Task.objects.filter(owner=request.user, completed=True).order_by("-id")[:100]
    return Response(TaskSerializer(rows, many=True).data)
```

Add a `path("completed-tasks/", completed_tasks)` entry to `apps/tasks/urls.py` while preserving its router routes; the project already mounts that app under `/api/`. Import `path` and the new view there. This example deliberately returns at most 100 rows; use a pagination contract when clients need the full collection.

## Verify in the application

Create completed and incomplete tasks for two users. Check that only the caller's completed tasks appear, anonymous access is denied, and POST is rejected. If the domain is organization-scoped, resolve active membership and apply organization scope as well. A valid identity alone is insufficient.

Continue with [view choices](/guide/django-views) and [serializer/permission boundaries](/guide/django-rest-boundaries).
