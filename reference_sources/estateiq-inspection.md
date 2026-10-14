<!-- reference_sources/estateiq-inspection.md — Record local EstateIQ source review without copying sensitive assets. -->
# EstateIQ inspection — 2026-10-12

Reviewed the sibling EstateIQ checkout, read-only. No application settings were changed and no backend tests or live infrastructure checks were performed. No .env files, secrets, runtime records, or customer documents were imported.

Source locations inspected:

- AGENTS.md and docs/architecture/{README,02-backend-domain-boundaries,03-org-scoping-boundary,05-request-lifecycle-fullstack}.md
- docs/architecture/domains/{identity-and-tenancy,ai-copilot,financial-workflows,documents,billing,leasing,tax-documents,onboarding,property-finance}/README.md
- docs/architecture/domains/documents/04-storage-and-security.md
- docs/architecture/domains/revenue/01-current-architecture-and-contracts.md
- backend/shared/tenancy/middleware.py; backend/shared/auth/permissions.py
- backend/apps/ai_copilot/views/message_views.py; routing/analyst_router.py; conversation/conversation_orchestrator/orchestrator.py
- backend/apps/document_intake/services/expense_draft_confirmation_service.py
- backend/apps/documents/views/document_file_views.py and document_qa_views.py (targeted code search)
- backend/apps/subscriptions/webhooks/stripe_webhook_handler.py
- frontend/src/features/tenancy/context/OrgProvider.tsx
- frontend/src/app/theme.ts; index.css; layout/DashboardLayout.tsx; components/ui/DashboardNav.tsx; features/documents/components/documentsWorkspaceParts/DocumentsHeader.tsx
- backend/Procfile and docs/celery-estateiq.md

Observed code includes scoped membership checks, organization selection/recovery, deterministic AI routing, locked draft confirmation, scoped FileResponse access, and subscription mirroring. Documentation describes additional domain semantics. Tests were located but not executed.

Reconciliation notes: tenancy middleware may resolve an organization before DRF JWT authentication, so request.org alone is not proof of membership; IsOrgMember performs an explicit check. OrgProvider's implementation auto-selects the earliest organization when no context exists, while an introductory comment says exactly one. The checked-in Procfile declares release and web only, so the older Celery walkthrough does not establish deployed worker/Beat processes. Documents use authorized backend streaming; the handbook's signed-URL discussion is an alternative design. Document Q&A and deterministic portfolio Copilot have different data sources. LLM presentation for portfolio Copilot is documented as planned.

## Scoped refresh — 2026-10-13

Recorded baseline 57b3ebe. Re-inspected tenant middleware and IsOrgMember, scoped locked expense-draft confirmation, DocumentFile query/streaming views, selector-backed analyst router, OrgProvider and the backend Procfile. The explicit seven-file scope is fingerprinted in sourceReviews.json. Confirmed the previously documented tenant/confirmation/file boundaries; the Procfile still declares release and web only. This is a targeted source refresh, not a full audit of all domains or runtime infrastructure. No customer data, settings secrets, backend tests, uploads or provider calls were used.
