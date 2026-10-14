<!-- reference_sources/resilience-drills.md — Record official references and exercise verification limits. -->
# Security, operations, and AI drills

Reviewed 2026-10-13. The incident fixtures and decision exercises are authored synthetic examples; they do not describe observed production incidents.

Official references inspected:
- Django 5.2 CSRF: https://docs.djangoproject.com/en/5.2/howto/csrf/
- Simple JWT settings: https://django-rest-framework-simplejwt.readthedocs.io/en/latest/settings.html
- Celery tasks: https://docs.celeryq.dev/en/stable/userguide/tasks.html
- Heroku Scheduler: https://devcenter.heroku.com/articles/scheduler
- Heroku PGBackups: https://devcenter.heroku.com/articles/heroku-postgres-backups
- S3 presigned URLs: https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html
- OWASP prompt injection: https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html

Local context comes from the existing EstateIQ and owner-stack inspection notes. No sibling code, production credentials, backup settings, worker configuration, identity providers, or AI accounts were changed or audited in this expansion.

The interactive /lab/resilience route runs authored decisions in browser memory. Progress and downloaded notes describe learning choices, not executed application checks. Actual auth, queue, recovery, and provider evidence must be collected in the owning application.
