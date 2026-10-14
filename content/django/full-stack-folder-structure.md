<!-- content/django/full-stack-folder-structure.md — Curated engineering guidance and reference examples. -->
---
title: "My Django + React folder structure"
slug: "full-stack-folder-structure"
section: "django"
summary: "One repository, backend and frontend directories, and three focused .gitignore files."
order: 45
tags: ["django", "architecture", "practical guide"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/django-toolkit.md", "reference_sources/frontend-structure.md"]
related: ["frontend-folder-structure", "django-setup"]
---

## One project, two runtimes

```text
project-name/
├── .gitignore
├── README.md
├── docs/
├── backend/
│   ├── .gitignore
│   ├── .venv/                  # local, ignored
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/                 # settings, URLs, ASGI, WSGI
│   └── apps/
│       ├── __init__.py
│       └── tasks/              # models, API, services, tests
└── frontend/
    ├── .gitignore
    ├── package.json
    ├── package-lock.json
    ├── index.html
    ├── public/
    └── src/                    # see the frontend structure guide
```

Run `git init` once at the project root. Do not initialize nested repositories in backend and frontend. Initialize Foundry at that same root when using its workflow; follow the [Foundry tutorial](/guide/foundry-repository) for generated governance files.

```bash
# Terminal — create the repository layout, before scaffolding either runtime.
mkdir project-name
cd project-name
git init
mkdir backend frontend docs
```

## Root .gitignore: shared local files

```gitignore
# /.gitignore — Shared local environment and OS files.
.DS_Store
Thumbs.db
.env
.env.*
!.env.example
.idea/
```

## Backend .gitignore: Python and generated data

```gitignore
# /backend/.gitignore — Python environments and generated runtime files.
.venv/
venv/
__pycache__/
*.py[cod]
.pytest_cache/
.coverage
htmlcov/
*.sqlite3
*.sqlite3-journal
media/
staticfiles/
```

Keep migrations, source static assets, dependency inputs and lockfiles committed. `media/` above is uploaded runtime data; `staticfiles/` is collected output. Do not use either path for source code.

## Frontend .gitignore: JavaScript dependencies and output

```gitignore
# /frontend/.gitignore — Installed packages and generated browser artifacts.
node_modules/
dist/
build/
coverage/
.vite/
playwright-report/
test-results/
*.log
```

Commit `package-lock.json`, configuration and safe `.env.example` files. Never put a secret in a Vite environment variable: values exposed to frontend code are public.

Nested ignore rules apply relative to their own directory. They do not stop tracking files already committed; inspect `git ls-files` and use `git check-ignore -v` to check a rule before changing tracking. See the [Git ignore reference](https://git-scm.com/docs/gitignore).

## Grow the backend deliberately

The [setup guide](/guide/django-setup) creates `apps/tasks` directly, with `AppConfig.name = "apps.tasks"`. Keep `config/` for application wiring and settings. Keep each domain's models, serializers, views, selectors, services and tests together. Introduce packages such as `api/` or `services/` when the files become large, rather than creating empty layers in advance.

## Keep frontend conventions consistent

Use the same [frontend directory structure](/guide/frontend-folder-structure) whether React sits inside this repository or has its own repository. The runtime commands change working directory; the responsibilities stay the same. The handbook itself remains frontend-only.
