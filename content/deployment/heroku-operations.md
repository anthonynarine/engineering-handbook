<!-- heroku-operations — Practical build-manual reference. -->
---
title: "Heroku operations and command reference"
slug: "heroku-operations"
section: "deployment"
summary: "Inspect releases, run workers and scheduled tasks, verify backups, and plan rollback."
order: 124
tags: ["heroku", "commands", "workers", "scheduler", "backups", "rollback"]
status: "established-pattern"
lastReviewed: "2026-10-15"
sources: ["reference_sources/git-heroku-reference.md"]
related: ["heroku-django-deployment", "backup-and-scheduled-tasks", "operational-runbooks"]
---

## Confirm the app before every change

Replace YOUR-APP explicitly. These commands are a reference, not a batch script. Inspect the release, target database and recent logs before making changes. Logs and backup files can contain private data; use restricted storage and redact shared excerpts. The [CLI reference](https://devcenter.heroku.com/articles/heroku-cli-commands) documents current command options.

## Inspect and diagnose

| Intent | Command | What to verify |
| --- | --- | --- |
| App processes | `heroku ps --app YOUR-APP` | Expected process types and state |
| Recent logs | `heroku logs --num 100 --app YOUR-APP` | Startup, request and worker errors |
| Follow logs | `heroku logs --tail --app YOUR-APP` | Stop with Ctrl-C; avoid leaking request data |
| Release history | `heroku releases --app YOUR-APP` | Deployed version and failed release attempts |
| Release details | `heroku releases:info vNN --app YOUR-APP` | The candidate you actually intended |
| Release command output | `heroku releases:output vNN --app YOUR-APP` | Migration errors and partial effects |
| Database status | `heroku pg:info --app YOUR-APP` | Correct attachment and health |

## Workers and scheduled tasks

For a project already configured with Celery and a supported broker, add a Procfile entry such as `worker: celery -A config worker --loglevel=info`. Replace the package name and verify the broker configuration. Scaling it with `heroku ps:scale worker=1 --app YOUR-APP` starts a real process and can incur charges. Test an idempotent synthetic job and inspect its result, not just the worker's startup log.

Install and configure Heroku Scheduler intentionally. `heroku addons:open scheduler --app YOUR-APP` opens its dashboard after installation. For example, schedule your own `python manage.py enqueue_due_jobs` command using the interval and UTC time shown there. That management command must exist and handle retries. Scheduled work can overlap or be missed; use idempotency, execution records and alerts. Exact-once business behavior belongs in your application. See [Scheduler](https://devcenter.heroku.com/articles/scheduler) and [backup/job patterns](/guide/backup-and-scheduled-tasks).

## Backups with a recovery exercise

| Intent | Command | Consequence |
| --- | --- | --- |
| Capture now | `heroku pg:backups:capture --app YOUR-APP` | Creates a database backup; assess load on a busy database |
| List backups | `heroku pg:backups --app YOUR-APP` | Confirm successful completion and age |
| Schedule daily | `heroku pg:backups:schedule DATABASE_URL --at '02:00 UTC' --app YOUR-APP` | Changes the selected database's backup schedule |
| Check schedules | `heroku pg:backups:schedules --app YOUR-APP` | Confirm the schedule was accepted |

Check retention and feature availability for the selected database plan. PGBackups is not supported on Heroku Postgres Advanced; evaluate the provider's continuous-protection options for production recovery. Scheduled logical backup failures do not generate automatic notifications, so verify completion and recheck schedules after changing database attachments. PostgreSQL backups do not include S3 files, secrets or all infrastructure settings. Restore into a separate recovery database and verify synthetic records, constraints and application compatibility. Treat a production restore as a separate, explicitly approved recovery operation because it replaces data. Keep backup URLs private. See [PGBackups](https://devcenter.heroku.com/articles/heroku-postgres-backups).

## Rollback is a release decision

`heroku rollback vNN --app YOUR-APP` changes the running release. Inspect the target version and confirm compatibility with today's database before executing it. It does not reverse database migrations, restore deleted records or undo external side effects. Prefer a forward fix when the old code cannot read the current schema. See [release rollback](https://devcenter.heroku.com/articles/releases).

Record the incident, target revision, database compatibility decision and owner. After recovery, verify health, login, a synthetic read/write, worker backlog and error rates. Use [operational runbooks](/guide/operational-runbooks) to capture that evidence. If a process crashed, inspect the cause before using a restart; restarting does not repair configuration or data.
