<!-- docs/coverage-matrix.md — Distinguish first guides from the full planned handbook. -->
# Coverage matrix

| Component | Canonical article | Current coverage | Missing depth | State |
| --- | --- | --- | --- | --- |
| System | system-overview | Read/write boundaries, ownership, failure checks | Runtime and platform views, full flows | Initial guide |
| Django setup | django-setup | Interpreter, venv, project/app, verification | Selected dependency versions, PostgreSQL setup walkthrough | Initial guide |
| Domain logic | services-and-selectors | Scope, query excerpt, transactions, isolation checks | Complete models, services, serializers, API and tests | Initial guide |
| React | frontend-architecture | Boundaries, query keys, invalidation, states | Full worked feature, forms, hooks and runnable examples | Initial guide |
| Identity, tenancy | — | Mentioned in system and domain guides | Dedicated detailed guides, inspected Gait contracts | Pending |
| Database, networking | — | Ownership and request foundations | Detailed guides and exercises | Pending |
| Jobs, storage, integrations | — | Failure boundary explanation | Detailed implementation and recovery guides | Pending |
| AWS, Heroku, delivery | — | No operational claims | Current verified platform instructions | Pending |
| Operations, security | — | Boundary principles | Runbooks, measured exercises and launch evidence | Pending |
| Reports tutorial, templates, glossary | — | Reports as shared example terminology | Coherent full contracts and separate runnable repository | Pending |

No row represents completion of the full build plan. The final detailed matrix must include purpose, setup, repository location, implementation, flow, security, recovery, verification, related guides, and provenance for each major subtopic.

| Foundry | building-with-foundry | Build lifecycle, native layout, evidence, governance, recovery, adoption limits | Configured governed frontend evidence and exercised release | Initial guide |
| Security | security-boundaries | Trust diagram, enforcement matrix, files, sessions, secrets, public-site headers | Backend execution evidence, full threat model | Initial guide |
| Tenancy | tenant-isolation | Permission matrix, scoped reads, writes, jobs, downloads, cache boundaries, denial exercises | Executed cross-tenant test suite | Initial guide |

## EstateIQ pattern coverage

| Area | Canonical article | Source basis | Validation boundary |
| --- | --- | --- | --- |
| All domain ownership | estateiq-domain-map | Architecture/domain docs | Source review only |
| Concrete tenancy | estateiq-tenant-boundary | Middleware, permission and provider code | Tests not executed |
| Portfolio AI | deterministic-ai | Message view, router and orchestrator | Provider presentation remains planned |
| Context/document Q&A | ai-context-and-document-qa | Layout, document docs and scoped view search | No provider calls or actual uploads |
| Financial read models | ledger-and-read-models | Billing/Revenue architecture | Synthetic examples; no backend suite |
| Documents/intake | private-document-lifecycle | Storage docs, file views, confirmation service | No upload/concurrency execution |
| Entitlement | subscriptions-and-feature-gates | Instructions, AI view and webhook handler | No provider replay/live account audit |
| Property/leasing/expenses/finance/onboarding/tax | estateiq-domain-workflows | Domain architecture docs | Formal packet exports remain planned |
| Frontend contracts/design | frontend-state-contracts | OrgProvider, shell, panels and theme | Handbook browser checks passed |

These chapters provide reusable patterns and source-backed observations. They do not complete every detailed topic in the original full-system build plan or establish the sibling application as production-verified.

## Reports walkthrough coverage

| Boundary | Delivered material | Verification boundary |
| --- | --- | --- |
| Foundry | Feature brief, acceptance evidence, review and release ownership | Reference workflow; governance not configured here |
| Database | Ownership models, replay uniqueness, tenant index, migration review | Unexecuted Django/PostgreSQL reference |
| API | Scoped list/detail, create service, input/output serializers, routes | Unexecuted backend reference |
| React | Transport, query keys, mutation, recovery controller, page and workspace | TanStack reference; lab uses React state |
| Failure UX | Replay, conflict, response-loss, role denial, scope clearing | Synthetic browser exercise |
| Operations / AI | Release sequence, runbook, export lifecycle, deterministic summaries | Proposed extension |

## Incident exercise coverage

| Boundary | Guide and exercise | Verification limit |
| --- | --- | --- |
| Identity and browser credentials | Expired JWT recovery; enforced session CSRF | Proposed real-application tests; no credentials used here |
| Private documents | Foreign IDs; previously issued download capabilities | Delivery/revocation policy must be tested in the owning application |
| Background work | Durable job identity, dispatch intent, lease fencing, external uncertainty | No worker, queue, or scheduler deployed |
| Recovery | Isolated restore, database/file consistency, measured readiness | No backups or restore settings audited |
| AI | Scope denial, injection fixtures, narrative timeout fallback | No provider call or quality score measured |
| Learning UI | Decisions, filters, progress, truthful notes export | Browser behavior only |

## Foundry from zero coverage

| Stage | Delivered | Actual verification |
| --- | --- | --- |
| GitHub and editor | New repo with README commit, visibility choice, normal clone, main branch, opening folder | Official CLI reference; remote creation not executed |
| Installation | Authorized checkout, Python 3.12, uv tool install, development alternative | Installed CLI version/help inspected; host installation not changed |
| Native initialization | Explicit main/prefix, plan reference, managed instructions, ownership/session configuration | Isolated init/re-init/boot/validate/status/recover passed |
| Owner trust | Dedicated key, identity file, principal init, signers and Code Owners | Source/help reviewed; no key/owner/signature operation executed |
| First task | Owner bootstrap, Orchestrator/worker sessions, bounded worktree, commit artifact and acceptance | Exact command help inspected; lifecycle not executed |
| Review/release | Candidate commit/tree, tier requirements, role-bound review, signed release instructions | Source/help reviewed; no governed release executed |
| GitHub/recovery | Public/private action compatibility, eligible gate setup, protection, checkpoint and recovery | Official sharing/protection docs and local diagnostics; no live gate established |
| Tutorial UI | Eight-step path, homepage entry, code copying, responsive reading | Local Chrome checks passed |

## Project case-study coverage (2026-10-13)

Gaming: platform ownership, invite/lobby flow, game-type namespaces, poker card masking, locked transitions, tournament channel/reassignment, process-local timer limits and AI boundary. AuthFlow: current memory access token and HttpOnly refresh transport, account/organization/operator scopes. gait-sdk: introspection/JWKS, live session checks, application credentials and self-reported signals. Gait backend: sessions, workspace isolation and evidence provenance. Foundry: durable state, scoped execution, candidate evidence, review and approval. EstateIQ reuses inspected domain chapters. Browser validation covers catalogue cards, compact navigation, diagram links and mobile overflow.

## Case-study enhancement coverage (2026-10-13)

Six consistent overview panels provide conceptual record relationships, source-backed workflow summaries, trust boundaries and source-described deployment. Each includes interpreted rationale with a tradeoff/revisit condition and a four-stage guided failure scenario. Verification stages are explicitly proposed; advancing a walkthrough is never recorded as execution. Native linked diagrams complement existing Mermaid flows. Revision comparison reports drift without upgrading review or verification claims.

## Django curriculum and connected authentication — 2026-10-13

| Area | Coverage | Verification boundary |
| --- | --- | --- |
| Django startup and DRF | Nested app registration, owner-scoped CRUD, migrations, login and API test example | Reference backend, not executed here |
| Core Django tools | ORM, views, serializers, permissions, middleware, signals and Channels | Curated decisions plus upstream references |
| Repository structure | Full-stack three-ignore layout and standalone frontend layout | Rendered examples and navigation checked |
| Axios and TanStack Query | Client, typed request, cancellation, keys, provider and session cleanup | Reference integration, no runtime dependency added |
| Gait walkthrough | Login, refresh, verification modes, domain authorization, live checks and failures | Inspected source paths; live integration checks proposed |
| Freshness | Revision plus explicit inspected-file hashes | Does not attest the entire checkout or production |
