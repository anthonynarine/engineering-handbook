<!-- heroku-django-deployment — Practical build-manual reference. -->
---
title: "Deploy Django on Heroku"
slug: "heroku-django-deployment"
section: "deployment"
summary: "Prepare a Django API, release migrations, and verify the first Heroku deployment."
order: 123
tags: ["heroku", "django", "deployment", "procfile", "postgres"]
status: "established-pattern"
lastReviewed: "2026-10-15"
sources: ["reference_sources/git-heroku-reference.md"]
related: ["heroku-operations", "deployment-platforms", "django-cors", "safe-database-migrations"]
---

## Scope and prerequisites

This is a reference deployment for your Django API with React delivered separately. It does not provision anything from the handbook. Use a staging app first. Heroku dynos and add-ons can incur charges; select their plans in the dashboard deliberately. No plan name or price is assumed here.

Start with a reviewed Git revision, passing tests, Heroku CLI access and a PostgreSQL-compatible application. Verify the supported Python runtime and buildpack against [Heroku's Python setup](https://devcenter.heroku.com/articles/getting-started-with-python).

## 1. Choose the deploy root

Heroku's Python build needs its dependency manifest and `Procfile` at the deploy root. With `project/backend` and `project/frontend`, either configure a reviewed monorepo build pipeline or deploy the backend subtree. The example below uses a [backend subtree](https://github.com/git/git/blob/master/contrib/subtree/git-subtree.adoc); it does not change your normal GitHub repository layout. Keep a supported `.python-version` and `requirements.txt` inside backend.

Dependencies normally include Django, Gunicorn, a PostgreSQL driver, `dj-database-url` and WhiteNoise. Record reviewed versions in your project's dependency workflow; do not copy a random version list from a tutorial.

## 2. Configure production settings

Adapt the existing settings module rather than replacing it wholesale:

```python
import os
import dj_database_url

SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]
DEBUG = False
ALLOWED_HOSTS = os.environ["DJANGO_ALLOWED_HOSTS"].split(",")
DATABASES = {"default": dj_database_url.config(conn_max_age=60)}
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
```

Put WhiteNoise immediately after SecurityMiddleware and configure `STORAGES["staticfiles"]` to use `whitenoise.storage.CompressedManifestStaticFilesStorage`, preserving your existing default storage. Heroku's Python build runs `collectstatic`; fix missing assets instead of disabling that step. User uploads belong in durable private storage such as S3, not the dyno filesystem. See [Django configuration](https://devcenter.heroku.com/articles/django-app-configuration) and [static assets](https://devcenter.heroku.com/articles/django-assets).

Configure secure session/CSRF cookies, HTTPS handling and explicit trusted frontend origins for your actual host setup. Require the database TLS behavior specified by your selected Heroku Postgres offering. Confirm proxy-header trust before enabling forwarded-protocol settings. CORS and CSRF are separate controls: use the [CORS guide](/guide/django-cors), your authentication integration, and Django's deployment checks.

## 3. Declare processes

In `backend/Procfile`, replace `config` with your Django project package:

```procfile
web: gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
release: python manage.py migrate --noinput
```

Use the appropriate ASGI server and process configuration for Channels; this WSGI example does not serve WebSockets. Release migrations run before the new release is activated, but are not automatically reversed if something later fails. Use [compatible migrations](/guide/safe-database-migrations) and serialize deployments. See [release phase](https://devcenter.heroku.com/articles/release-phase).

## 4. Prepare the Heroku app

In the dashboard, create a staging app, select its region/runtime and attach an intentionally selected Heroku Postgres plan. Set `DJANGO_SECRET_KEY` through the dashboard without exposing it in shell history. Set `DJANGO_ALLOWED_HOSTS` to the actual API hostname without a scheme, along with your application's origin settings. Postgres supplies `DATABASE_URL` when attached. Never paste config exports into issues or handbook notes.

From the monorepo root, replace YOUR-STAGING-APP:

```sh
heroku login
heroku git:remote --app YOUR-STAGING-APP
git status --short
git subtree push --prefix backend heroku main
```

This publishes the committed backend subtree and can trigger a real release and migrations. Confirm the target app and reviewed commit first. For a backend-only repository, use its configured Heroku remote and `git push heroku main` instead.

## Verify and troubleshoot

Inspect `heroku releases --app YOUR-STAGING-APP`, `heroku ps --app YOUR-STAGING-APP` and recent logs. Check an actual health endpoint, static assets, login, CORS/preflight and a synthetic database operation. Confirm the intended release and migration result before promoting the same revision.

A missing Procfile or manifest usually means the deploy root is wrong. An import error often means the project package or dependencies are wrong. A failed release command requires inspecting its logs; do not keep deploying until its database effects are understood. Continue with [Heroku operations](/guide/heroku-operations).
