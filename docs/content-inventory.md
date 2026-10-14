<!-- docs/content-inventory.md — Track supplied sources and editorial reconciliation. -->
# Source inventory

| Source | Actual heading | Use | Import status |
| --- | --- | --- | --- |
| MOONLIGHT_ENGINEERING_HANDBOOK_BUILD_PLAN.original.md | Moonlight Engineering Handbook — Claude Code Build Plan | Product scope and initial article requirements | Original preserved; working plan renamed and amended |

Only the build plan was supplied. Architecture standards, frontend standards, testing standards, DevOps source, diagrams, and Word documents mentioned in it are not present in this repository. The first articles are authored from the plan's requirements, not claimed imports of missing documents. No Gait SDK or application contracts have been inspected.

Foundry source inspection is summarized in `reference_sources/foundry-inspection.md`; installed CLI help and native project settings informed the chapter. Private Foundry documents were read locally rather than published wholesale. Both native and legacy source layouts were identified; the chapter uses the native layout.

## EstateIQ-derived expansion

Read-only source inspection is documented in `reference_sources/estateiq-inspection.md`. Nine new canonical articles cover domain ownership, concrete tenant scope, deterministic AI, conversation/document Q&A boundaries, ledger-derived reporting, private files/intake confirmation, subscription entitlement, property/onboarding/tax workflows, and frontend state/visual contracts. The sibling application remains unchanged.

Original source files were not copied wholesale. Source-backed observations and documented patterns remain separate from executed backend validation. No environment files or customer records were read/imported. Commercial prices and real provider identifiers are excluded from examples.

## Connected Reports path

- `reports-contract`: outcome, API and replay contract, architecture, Foundry brief.
- `reports-data`: organizations, membership, Reports schema, migration review.
- `reports-api`: scoped selectors, authorized service, serializers, paginated views, routes.
- `reports-react`: typed transport, scoped query identity, controller and workspace.
- `reports-verification`: API reference tests, remaining PostgreSQL/auth tests, browser drills.
- `reports-release`: compatibility, recovery, export lifecycle, deterministic AI extension.

Interactive `/lab/reports` is synthetic and browser-only. All chapters are proposed design; backend examples are not executed by this repository.

## Security, operations, and AI drills — 2026-10-13

Four new guides bring the inventory to 29:

- `auth-and-document-drills`: JWT expiry/refresh, session CSRF, private-file revocation.
- `reliable-job-lifecycle`: business job identity, transactional outbox, leases, crash windows, missed schedules.
- `recovery-runbook`: isolated database/file restoration and measured recovery evidence.
- `ai-evaluation-and-fallbacks`: scoped evaluation fixtures, untrusted content, provider failure and budgets.

`/lab/resilience` contains eight authored decision exercises, category filtering, consequence feedback, learning progress, and downloadable exercise notes. Progress is transient and resets on leaving/reloading. Notes mark real-application checks as unexecuted. No authentication, queue, restore, storage, or AI operation is run by the lab.

## Foundry from zero — 2026-10-13

Eight linked chapters bring the inventory to 37 guides: repository creation/opening, tool installation, native initialization, owner identity/trust, interactive sessions, first task/workstream/artifact, candidate review/release, and GitHub compatibility/recovery. Homepage and Foundry overview link to the first chapter; each chapter includes the ordered path, location labels, numbered commands, expected results, and checkpoints.

Current source/help inspection and local initialization smoke evidence are recorded in `reference_sources/foundry-tutorial-inspection.md`. Key/signature setup and remote GitHub/governed release steps are instructions rather than operations executed by the handbook. The public-demo/private-action incompatibility and lack of a generic governed JavaScript test preset are explicit.

## Project designs (2026-10-13)

45 total guides. New project chapters: gaming-platform-design, gaming-multiplayer-flow, gaming-poker-tournaments, gaming-security-ai, authflow-design, gait-sdk-design, gait-backend-design, foundry-project-design. `/projects` also links existing EstateIQ chapters and the Foundry setup tutorial. Source record: `reference_sources/projects-inspection.md`. These are source reviews; no project backend tests or current production audits were executed.

## Curated Django and repository conventions — 2026-10-13

63 guides total. Added a Django learning-path hub; a consistent nested Tasks starter; REST API, view-style, serializer/permission, ORM, middleware, signal, Channels and testing chapters. Django sidebar uses Getting started, Core tools and Testing & delivery dropdowns. Added full-stack structure with three ignore templates, standalone frontend structure with one ignore template, and Axios/TanStack Query connection guidance. Six connected Gait chapters connect login, refresh, verification, authorization and proposed failure checks.

The Tasks API and React integration are reference examples for a separate application. No backend, database, identity or worker dependency was installed here. The static handbook still makes no application API calls.

Master-manual entry point added at `/guide/build-manual`, linking the repeatable path from repository structure and Foundry through a vertical slice, security, verification, deployment and recovery. Current registry: 64 guides.

CORS expansion: 65 guides. Dedicated `django-cors` chapter is accessible through Django Core tools, the toolkit table and React API connection guide. Detailed tools remain secondary to the main build workflow.

WebSocket expansion: 66 guides. `websocket-design` covers transport selection, identity, origin checks, protocol contracts, acknowledgements, recovery, React lifecycle and deployment; `django-channels` remains the Django implementation companion.

## Practical build helpers — 2026-10-13

74 guides total. Added project-starter-checklist and build-recipes entry points, plus six task recipes: protected REST endpoint, protected React screen, private document retrieval, scheduled command, live event stream and query refresh after mutation. Recipes live under the relevant Server/Client/Security dropdowns and are discoverable through a searchable, category-filtered directory.

The starter checklist supports frontend-only and full-stack paths, separate browser-saved progress, per-path reset and Markdown export. Progress is explicitly self-reported; no repository, test or deployment verification is performed. Storage failures fall back to transient page state.

## Lumen flagship and proposed AWS architecture — 2026-10-14

78 guides total, seven project cards. Lumen is the first/flagship project with four chapters: service/platform design, ALB-to-private-EC2 topology, layered AWS security plan and release/recovery gates. Includes a linked responsibility plate and a dedicated theme-aware AWS trust-zone plate. All AWS controls are proposed and unverified; the old README's absent AI tier is explicitly future work. Deployment and Security guides cross-link the planned architecture. Source context and explicit inspected-file fingerprints are separate from cloud verification.

## Troubleshooting and practical references — 2026-10-14

90 guides total. Added a searchable troubleshooting desk with six linkable symptom paths and dedicated guides for browser/CORS, Gait identity, ALB, query cache, jobs and migrations. Notes are explicitly unexecuted diagnostic plans; the desk collects no application telemetry. Added API-contract, staged-migration, testing-strategy and operational-runbook chapters, plus My library for local bookmarks/recent visits. Topic-specific troubleshooting dropdowns preserve the existing eight top-level sections. Server and Client now use matching server/monitor icons.

## Personal Learning roadmap — 2026-10-14

91 guides total. Added Learning roadmap under Start here with Next/Practicing/Learned filters, local status changes, add/edit/remove, practical exercise and completion criteria, optional internal guide links and Markdown export. Three initial priorities are explicitly suggestions rather than owner-selected goals or claims about existing knowledge. The roadmap is independent of chapter review status and application verification. Empty roadmaps persist; unreadable stored data is not overwritten until a user change; blocked storage falls back to page state.
