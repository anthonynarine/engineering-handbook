<!-- content/django/django-setup.md — Bootstrap the separate Django Tasks learning backend. -->
---
title: "Set up a Django workspace"
slug: django-setup
section: django
summary: "Create the environment, project configuration and first domain app."
order: 2
tags: [python, venv, django, setup]
status: established-pattern
lastReviewed: "2026-10-13"
sources: [reference_sources/django-toolkit.md]
related: [full-stack-folder-structure, django-first-api, django-toolkit]
---

## Begin in your project's backend directory

Use the [full-stack layout](/guide/full-stack-folder-structure), or create a standalone backend repository. The following commands target macOS/Linux and Python 3.12 or another interpreter compatible with Django 5.2. This tutorial deliberately uses Django 5.2; it does not claim that is the newest major release. See the [official Django tutorial](https://docs.djangoproject.com/en/5.2/intro/tutorial01/) for the framework's project/app distinction.

```bash
# Terminal — backend/, initially empty.
python3 --version
python3 -m venv .venv
source .venv/bin/activate
python -c "import sys; print(sys.executable)"
python -m pip install "Django>=5.2,<5.3"
python -m django --version
python -m django startproject config .
mkdir -p apps/tasks
touch apps/__init__.py
python manage.py startapp tasks apps/tasks
```

On PowerShell activate with `.venv\Scripts\Activate.ps1` and create the directories/files with the equivalent shell commands. Confirm the active interpreter in your editor too.

## Register the nested app correctly

Replace the generated app configuration's `name`, then add it to settings. Django's app label remains `tasks`; its import path is `apps.tasks`.

```python
# backend/apps/tasks/apps.py — Register the nested domain package.
from django.apps import AppConfig

class TasksConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.tasks"
```

```python
# backend/config/settings.py — Append after the generated INSTALLED_APPS definition.
INSTALLED_APPS += ["apps.tasks.apps.TasksConfig"]
```

Keep the other generated settings intact for this local exercise. If you decide to introduce a custom user model, configure it before your first migrations; changing user models later needs a separate migration plan.

## Check and run

```bash
# Terminal — backend/, virtual environment still active.
python -m pip freeze > requirements.txt
python manage.py check
python manage.py migrate
python manage.py runserver
```

Open `http://127.0.0.1:8000/`. Stop the development server with Ctrl+C before continuing commands. Commit dependency inputs, app code and migrations; ignore the virtual environment and local database. Add DRF in the [first API chapter](/guide/django-first-api), then record its resolved dependencies too.

SQLite is sufficient for this starter. Use PostgreSQL when verifying the production database behavior your application relies on. A development server is for local work; deployment uses a production WSGI or ASGI process.

## Know what was verified

These are runnable reference steps for a separate backend. This frontend handbook does not install Django or execute migrations. Framework checks, API tests and deployment checks must run in the application you create.
