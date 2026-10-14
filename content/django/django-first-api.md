<!-- content/django/django-first-api.md — Curated engineering guidance and reference examples. -->
---
title: "Build your first Django REST API"
slug: "django-first-api"
section: "django"
summary: "Install DRF and connect a model, serializer, protected ViewSet and router."
order: 2.1
tags: ["django", "architecture", "practical guide"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/django-toolkit.md"]
related: ["django-setup", "django-rest-boundaries", "react-api-connection"]
---

## Continue from the setup guide

Use the Tasks app created in [Django setup](/guide/django-setup). These complete file examples form a local learning API using Django session authentication. They are not an organization-aware production application or an implementation added to this handbook.

```bash
# Terminal — backend/, with its virtual environment active.
python -m pip install djangorestframework
python -m pip freeze > requirements.txt
```

Add `"rest_framework"` to `INSTALLED_APPS`, alongside `"apps.tasks.apps.TasksConfig"`. Freeze records the selected environment; a team can instead use its chosen lockfile tool.

## Define a small model

```python
# backend/apps/tasks/models.py — Store personal task records.
from django.conf import settings
from django.db import models

class Task(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=160)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

## Validate the representation

```python
# backend/apps/tasks/serializers.py — Describe writable and server-owned fields.
from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["id", "title", "completed", "created_at"]
        read_only_fields = ["id", "created_at"]
```

The owner is assigned from the authenticated request, never accepted from browser input.

## Scope every operation

```python
# backend/apps/tasks/views.py — Restrict CRUD operations to the signed-in owner.
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(owner=self.request.user).order_by("-id")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
```

This owner filter also scopes detail lookup, update and deletion. An authenticated stranger's task ID should return 404. Multi-tenant apps need additional membership and role checks: follow [tenant isolation](/guide/tenant-isolation), rather than treating this personal-task pattern as organization authorization.

## Register URLs

```python
# backend/apps/tasks/urls.py — Expose the task resource routes.
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet

router = DefaultRouter()
router.register("tasks", TaskViewSet, basename="task")
urlpatterns = router.urls
```

```python
# backend/config/urls.py — Mount the API and local learning login.
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.tasks.urls")),
    path("api-auth/", include("rest_framework.urls")),
]
```

## Migrate and try it

```bash
# Terminal — backend/, after saving the files above.
python manage.py makemigrations tasks
python manage.py migrate
python manage.py createsuperuser
python manage.py check
python manage.py runserver
```

Visit `/api-auth/login/`, sign in with your local account, then open `/api/tasks/` in DRF's browsable API. Create a task with a title and confirm the returned ID. Log in as a different local user and confirm the original task is absent. Session-authenticated writes require CSRF protection; the browsable API handles its own form flow. Anonymous denials can be 403 under session authentication, so do not assume every missing credential produces 401.

Use the [testing chapter](/guide/django-testing-delivery) to make the ownership checks repeatable. The [DRF quickstart](https://www.django-rest-framework.org/tutorial/quickstart/) provides the upstream walkthrough; our example uses a personal task resource and deliberately scopes its queryset.
