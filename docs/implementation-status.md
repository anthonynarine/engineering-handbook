<!-- docs/implementation-status.md — Record implementation progress, checks, and known gaps. -->
# Implementation status

## Completed foundation

- Preserved original source and amended the working plan for the owner's name, frontend-only repository, separate backend examples, and optional public hosting.
- React/TypeScript/Vite application, history routing, responsive editorial layout, article sidebar and breadcrumbs.
- Four initial substantive Markdown guides with status, source and review date.
- Build-time metadata validation, canonical slugs, related-link checks, and shared article registry.
- Local full-text search with keyboard shortcut, native modal focus handling, arrow/Enter result selection and empty state.
- Clickable system overview, theme persistence, code copying with failure feedback, heading anchors, related and sequential article navigation, print styling and not-found page.

## Verification

`npm run build` passed: four articles validated, TypeScript passed, and Vite emitted static assets. Search ranking assertions passed for venv, selectors, and query invalidation. Dependency installation reported zero vulnerabilities after replacing gray-matter with yaml. Git whitespace checks passed; node_modules and dist are ignored. Local HTTP checks returned 200 for the homepage and a direct article URL.

No browser-control tool was available, so visual rendering, responsive layouts, dialog/drawer focus, clipboard interactions, and browser history have not been browser-verified. Backend excerpts are reference material and have not been executed here.

## Remaining

Full handbook content coverage, imported standards not yet supplied, source-specific Mermaid diagrams, syntax highlighting, complete metadata/anchor validation tests, article excerpt highlighting, mobile drawer focus management, optional bookmarks, and separate runnable Reports tutorial. The initial public preview is deployed to Netlify; see deployment.md.

Next: validate the initial implementation and review representative browser flows, then expand the coherent Reports contracts and foundational chapters.

## Diagram, security, and Foundry expansion

Seven guides now include a Foundry-first development chapter, security boundaries, and tenant isolation. Six distinct Mermaid diagrams cover development/release, runtime components, code layers, authenticated reads, authorization gates, and tenant-scoped jobs; the Foundry diagram is also on the homepage. Mermaid is lazy-loaded and uses strict rendering, with text alternatives and inspectable source.

Chrome production-preview checks passed for rendering on the homepage and all diagram articles, search navigation, mobile navigation, and no document overflow at 390px. Visual screenshot review completed for the mobile Foundry guide. Netlify headers configure CSP, framing denial, MIME sniffing prevention, referrer policy, and unused browser-feature restrictions. The Node baseline is now 22.12+.

This remains documentation of Foundry governance, not a claim that this deployment went through a governed Foundry release. Application security designs and backend denial exercises remain unexecuted.

## Owner stack correction

Ten guides now cover Django auth, Simple JWT, Clerk, and Gait as alternatives, Heroku as the main application host, Vercel/Netlify frontend delivery, AWS S3, automatic backups, restore exercises, and scheduled task reliability. The general system map uses a selected identity mechanism. Broader AWS deployment remains proposed material. Source references and review dates are recorded; no actual backend configuration, backup schedule, or restore evidence has been audited.

Final expanded production build and typecheck passed. Live Netlify Chrome checks passed for every diagram page (11 rendered instances across homepage and seven articles), search selection, mobile navigation and document overflow. Live response headers confirmed CSP, nosniff, framing denial, referrer policy and permissions policy; Netlify also supplies HSTS. Dependency installation after the patched KaTeX override reported zero vulnerabilities. Latest deployment: `6acd0b70bdb0aa04ae5a486c`. Mermaid remains a relatively large lazy-loaded dependency; performance optimization for its supported diagram types remains open.

## Architecture visual redesign

Replaced the oversized Foundry and runtime flowcharts with compact native SVG architecture plates, grouped boundaries, component icons, restrained blue/purple/teal semantics, linked guides, concise labels, and accessible descriptions. Added zoom, reset and a native expanded diagram dialog. Mermaid labels use isolated typography to avoid clipping from article prose styles. Browser checks now exercise diagram zoom and expanded-view dismissal; desktop screenshots are reviewed as well as rendering assertions.

Architecture redesign deployed as `6acd10e3005dc97d00680274`. Production browser verification passed for diagram rendering, zoom, expanded-dialog dismissal, search, and mobile navigation. Foundry and runtime plate screenshots were visually inspected.

## EstateIQ design and architecture expansion

Nineteen guides now include nine EstateIQ-derived chapters. Read-only source review covered the visual system, workspace shell, tenant middleware/permissions, OrgProvider, Copilot view/orchestration/router, document delivery/QA, locked draft confirmation, subscription handlers, and domain documentation. No sibling application files were modified and no backend tests or production configuration checks were performed.

The handbook now uses EstateIQ-inspired zinc surfaces, cyan actions, rounded panels, stronger article/hero identity, and compact navigation. Both light and dark themes remain available; new sessions default to dark. Native architecture plates and Mermaid diagrams follow the selected theme.

Production build/typechecking/content validation passed. Chrome checks cover every diagram-bearing article, search selection, mobile navigation/overflow, zoom, expanded-view dismissal, and both theme controls. Desktop and mobile homepage screenshots were visually inspected. Source implementation/documentation discrepancies are recorded in the inspection note and relevant articles.

EstateIQ expansion deployed as `6acd79ea515ce9c6cd0ed80c`. Live Chrome verification passed on all 16 diagram-bearing destinations, search, mobile navigation/overflow, zoom, expanded view, and both themes. Dark AI article and desktop/mobile homepage screenshots were reviewed.

## Reports feature walkthrough — 2026-10-12

Added six connected chapters (25 guides total) tracing a synthetic Reports feature from a Foundry brief through schema, migrations, selectors/services, DRF views and serializers, typed React transport, TanStack reference hooks, controller, workspace, API tests, release planning, and proposed export/AI extensions. Added `/lab/reports` as a runnable browser-only exercise with synthetic in-memory records.

The lab exercises scoped lists/detail, role denial, command replay, conflicting payloads, and response loss after commit. It does not contact an API or implement real authentication, database transactions, or tenant security. Django, PostgreSQL, and TanStack examples remain reference code requiring separate integration and execution.

Verification: production build, metadata/source/related-link validation, TypeScript checks, and local Chrome suite passed. All new Mermaid diagrams rendered; the lab passed create/replay/conflict, simulated commit-before-response-loss recovery, tenant switching/detail clearing, viewer/outsider rejection, invalid title, and mobile overflow checks. Eight Python reference blocks parsed for syntax only; no backend or database execution occurred.

The same Chrome suite passed against production deploy `6acd8d2c579b3fffb02dc416`, including the published Reports route. Local preview was stopped after verification.

## Security, operations, and AI exercise expansion — 2026-10-13

Added four proposed-design guides (29 total) and `/lab/resilience`, an eight-scenario interactive decision lab. Scenarios cover expired JWTs, session CSRF, private-file revocation, worker crash/replay, missed schedules, partial restoration, document prompt injection, and provider timeouts. Readers can compare choices, collect proposed checks, and download explicitly unexecuted exercise notes.

Official framework/platform/security references are recorded in `reference_sources/resilience-drills.md`. No sibling application, identity provider, worker, scheduler, backup, S3 storage, or AI account was changed. Exercise completion is learning progress, not application verification.

Verification: production build, content/source/related-link validation, and TypeScript checks passed. Local Chrome checks passed for all diagram pages, the existing Reports lab, and new failure-drill decisions, correction, category filters, transient progress, guide navigation, reset, mobile overflow, and exercise-note download. Download content explicitly marks all real-application checks unexecuted. Desktop and mobile drill screenshots were visually reviewed. No backend/queue/restore/provider tests were run.

Incident drill production verification passed against deploy `6ace21c952a0ce5bbc674024`. Foundry setup tutorial work follows this verified publication.

## Foundry beginner tutorial — 2026-10-13

Added eight connected setup/operation chapters (37 guides total) grounded in the owner’s Foundry source checkout at `6088d5a` and installed CLI `0.2.0.dev0`. Covers creating a GitHub demo with a real first commit, opening a normal clone, authorized tool installation, native init with plan/instruction opt-in, configuration/session choices, owner signing identity, trust files, first task and worker session, commit artifact acceptance, candidate evidence/release, GitHub enforcement compatibility, and checkpoint/recovery.

A throwaway committed Git repository passed init, repeat init, boot, validate, status, and recover. No production repository, identity, private key, session-token file, or signed release was changed/read/executed. The tutorial preserves the distinction between interactive Codex support and the unavailable supervised Codex adapter in this inspected build. A public demo cannot directly reuse Foundry’s private action via GitHub’s private-action sharing setting; hosted enforcement remains a separate compatible integration. The documented workflow does not claim governed generic JavaScript test support.

Tutorial verification: production build/content validation/TypeScript passed for 37 articles. Local Chrome suite passed all diagram destinations, existing interactive labs, homepage tutorial entry, eight-step navigation, requested repository/init command rendering, clipboard copy, CI compatibility note, and mobile overflow. Embedded public-key trust-file Python example parsed for syntax only. Desktop/mobile tutorial screenshots were reviewed.

The full Chrome suite passed against tutorial production deploy `6ace2f90bcc78227ac6e52c6`, including article-scoped navigation readiness, command copying, all diagrams, both labs, and mobile/theme flows. Local preview was stopped after verification.

### Sidebar navigation — October 13, 2026

Grouped all guides under collapsible section headers with guide counts. One group opens at a time; direct links and guide navigation open the current section automatically. Buttons expose expanded state and controlled panel IDs and support keyboard activation. Production build and the browser suite passed, including mobile navigation and both themes.

### Project catalogue — October 13, 2026

Added `/projects` with Gaming, EstateIQ, AuthFlow, gait-sdk, Gait backend and Foundry. Eight new source-inspected design guides bring the registry to 45. Gaming has four chapters and a linked native SVG plate; other new case studies use flow and sequence diagrams. Projects sidebar lists six project names, while chapter navigation lives inside case studies. Inspected source projects remain unchanged. Content validation, TypeScript, production build and browser suite passed, including all diagrams, project links and mobile layouts.

### EstateIQ navigation adjustment — October 13, 2026

Moved all seven EstateIQ case-study chapters into Projects. Removed the standalone EstateIQ section and exposed all seven chapters through the EstateIQ project card and chapter navigation. Existing guide URLs remain valid. Content registry assertions, TypeScript and production build passed.

### Consistent case studies and richer diagrams — October 13, 2026

All six project overviews now share ownership, data/workflow, security, deployment, interpreted decision rationale, and guided failure/recovery views. Added five linked responsibility plates for EstateIQ, AuthFlow, gait-sdk, Gait and Foundry while preserving their detailed flow/sequence diagrams. Gaming retains its linked system plate. Catalogue adds URL-backed search/category filters, empty-state recovery and four cross-project reading paths. Handbook search groups results by project/section without losing keyboard navigation. Project chapters remain under Projects rather than being repeated in the homepage foundations grid.

Inspection metadata is centralized in sourceReviews.json. `npm run review:projects` compares local Git revisions and tracked edits, records a sourceComparison.json snapshot, and never updates inspected revisions or dates. Comparison flagged missing EstateIQ baseline, tracked AuthFlow edits, and newer Gait/Foundry revisions; those case studies show Review due. This is metadata comparison, not a fresh source or runtime audit.

Content validation (45 guides), TypeScript, production build and browser suite passed. New browser checks exercise filters/reload/clear, reading-path links, all six case-study views, recovery boundaries/reset, every native plate link, grouped search and mobile overflow. Existing diagrams, theme controls, walkthroughs and labs passed.

### Django curriculum, structure guides and Gait walkthrough — October 13, 2026

63 guides now include the curated Django toolkit, step-by-step nested Tasks setup and DRF CRUD, view choices, serializers/permissions, ORM, middleware, signals, Channels and delivery verification. Nested Django sidebar groups preserve keyboard operation and expand the current guide's group. Added full-stack and standalone frontend structures, three versus one .gitignore conventions, and Axios/TanStack Query integration. Six Gait walkthrough chapters connect browser sessions, refresh coordination, introspection/JWKS, local application authorization and the uncached sensitive-action guard.

Targeted source refresh records explicit inspected-file fingerprints and EstateIQ's baseline. The comparison command continues to flag later source drift without silently advancing inspected revisions; Foundry advanced again after inspection and remains marked for review. Fingerprint matches do not attest unrelated tracked edits or running services.

Verification: content/source/link validation (63 guides), TypeScript and production build passed. Existing full Chrome suite passed, including diagrams, search, project views, recovery exercises, mobile layouts, both labs and Foundry tutorial. New curriculum browser checks passed for keyboard dropdowns, direct-link expansion, learning-path destinations, folder examples and mobile access. Eight new Python blocks parsed for syntax only. No Django backend, migrations, database, Channels service or real authentication flow was executed.

Master-manual entry point added at `/guide/build-manual`, linking the repeatable path from repository structure and Foundry through a vertical slice, security, verification, deployment and recovery. Current registry: 64 guides.

### CORS guide — October 13, 2026

Added `/guide/django-cors` under Django's Core tools dropdown and linked it from the toolkit and React connection guide. Covers origin identity, Vite proxy versus direct requests, django-cors-headers configuration, preflight, bearer versus cookie transport, CSRF, production origin choices and browser troubleshooting. Current registry: 65 guides. Content validation, TypeScript, production build and Python configuration syntax checks passed. No backend CORS or authentication configuration was changed.

The preceding 64-guide master-manual release was published as Netlify deploy `6acec5089c6e4fca58c787e6`; the curriculum browser checks passed against production.

### WebSocket design companion — October 13, 2026

Added the WebSocket connection-design chapter alongside Channels. Includes a recovery sequence diagram, synthetic command envelope, polling/SSE comparison, origin and identity separation, reconnect/deduplication policies, React ownership, load boundaries and deployment considerations. Current registry: 66 guides. The design does not claim the inspected gaming application implements the proposed resume/replay contract. Production build, content validation and TypeScript checks passed. No socket or backend service was started.

The preceding CORS release was deployed as `6acec5a6415d083eab95e8fc`; curriculum checks passed against its published site.

The new diagram check caught a Mermaid sequence-note delimiter error before publication. Removed the delimiter and confirmed Mermaid parsing succeeds. This is a handbook-rendering correction, not a backend protocol change.

WebSocket release `6acec734427d9bc7e3bb4fca` published to the existing Netlify site. Local curriculum checks passed for the corrected sequence diagram, dropdowns, linked reading path and mobile layouts. The full handbook suite passed earlier in this curriculum update; subsequent CORS/WebSocket additions received targeted curriculum checks.

### Master-manual navigation — October 13, 2026

Reorganized navigation into Start here, Foundry, Server, Client, Security, AI, Deployment & operations, and Projects. Each guide has one primary sidebar home. Start here contains repository structures and the Reports walkthrough dropdown; Server keeps focused setup, core-tool, and jobs/testing dropdowns. CORS belongs to Security; reliable jobs belong to Server. Original content sections and URLs remain stable, preserving project chapters and walkthrough behavior. Article breadcrumbs, homepage card labels and search grouping use the same navigation mapping. Direct guide links and lab routes select their containing section.

Production build, TypeScript and content validation passed for 66 guides. Regression checks include ordered headings, one sidebar home per non-project guide, correct direct-link selection, keyboard dropdowns and mobile layouts.

Navigation verification completed: full Chrome regression suite and focused curriculum checks passed, including one-home coverage, ordered sections, CORS direct-link selection, diagrams, both labs, theme controls and mobile flows. Published as Netlify deploy `6acec7c4791e85370d4e8662`. No guide URLs or source project files changed.

### Homepage master build map — October 13, 2026

Replaced the homepage's handbook-specific Foundry-to-Netlify plate and smaller request-flow panel with one linked build/runtime map. The build lane connects owner intent, Foundry coordination, agent workstreams, evidence and human approval. The runtime lane connects React, Django, data/private storage and optional real-time, background-job and AI capabilities. Security and operations span the system. The map labels delivery separately from runtime requests and explicitly notes that the handbook itself remains a static frontend.

A native SVG preserves crisp text, theme support, horizontal mobile exploration, zoom, expanded view and keyboard-operable guide links. Existing detailed Foundry/runtime guide plates remain in their articles. The map is a reference architecture, not a claim of a completed governed release or a backend running in this handbook.

Verification completed: content validation, TypeScript and production build passed. Full handbook browser regression passed; focused map checks passed locally and against production for all 12 valid component links, keyboard navigation, both themes, zoom/expanded view, mobile containment and horizontal exploration. Desktop light/dark and mobile screenshots were reviewed. Published as Netlify deploy `6acecbb39de7d4267b96681a`.

### Starter checklist and build recipes — October 13, 2026

Added browser-only frontend/full-stack starter checklists with scoped local progress, URL-selected project type, guide links, per-type reset and exportable self-reported notes. Added a URL-filtered recipe directory and six narrow implementation guides with prerequisites, file locations, copyable excerpts and application verification steps. Homepage and build workflow expose both entry points. Recipe dropdowns preserve one primary sidebar home per guide.

Production build, TypeScript and content/link validation passed for 74 guides. Full existing handbook Chrome suite passed. Two Python recipe blocks parsed for syntax only; no Django backend, scheduler, socket, file service or authentication integration was executed.

Focused build-helper checks passed locally and against production: independent per-type persistence/reload, reset isolation, completion messaging, truthful Markdown export, blocked-storage fallback, URL-backed recipe search/categories/empty-state recovery, clipboard and mobile layouts. Mobile checklist screenshot reviewed. Published as Netlify deploy `6acee1d5fb15ba0add90bf8b`. Local preview stopped after verification.

### Lumen flagship and secure AWS design — October 14, 2026

Added the owner-designated flagship as the first project, with four proposed-design chapters and linked source-context/AWS plates. Inspected source covers organization membership, transaction-local tenant context, Media identity/exam authorization, UI request scope, health probes and staged schema/RLS/grant initialization. Older README AI claims are distinguished from the absent service directory. No clinical records, credentials, environment values, logs or actual AWS configuration were inspected.

The proposed architecture uses dedicated private EC2 service instances behind per-service ALB target groups. The security plan defines environment/account separation, least-privilege roles, private networking and egress, WAF, MFA/administration, Gait identity plus local clinical permissions, encrypted restricted data, secrets, audit, alarms, recovery and release evidence. Singleton limits, ALB fail-open behavior, target-certificate validation limits, non-HTTP HL7 boundaries, production-auth compatibility and managed-RDS bootstrap privileges are explicit. No AWS resource was provisioned and no compliance claim or cloud security certification is made.

Content/link/source validation (78 guides), TypeScript, production build and full existing browser regression passed. Focused Lumen checks passed for flagship placement, planned labels, project chapters, native links, themes, expansion and mobile access. Desktop dark/light AWS screenshots reviewed; diagram data paths refined to distinguish clinical database access from media object storage.

Published Lumen release as Netlify deploy `6acf668f7c920216391c19fb`. Focused Lumen browser checks also passed against production for flagship discovery, proposed status, all chapter links, AWS diagram, both themes, expansion and mobile layouts. Local preview stopped. These results verify the handbook presentation only; proposed AWS infrastructure and security controls remain unimplemented/unverified.

### Troubleshooting, references and local reading library — October 14, 2026

Added the symptom-led troubleshooting desk and six linked investigations: browser/CORS/CSRF, Gait/auth/permissions, planned ALB failures, stale query data, missing/duplicate jobs and migration failures. Query/category/selected symptom are URL-backed. Copyable notes explicitly state that no application or infrastructure checks ran. No live telemetry or credentials are collected.

Added practical API contracts, staged schema-change planning, risk-based testing and operational runbooks. Custom error envelopes are proposed conventions, pagination does not silently change the Tasks starter, and deployment/recovery instructions remain unexecuted application guidance. Added guide bookmark controls and My library, storing only validated saved/recent guide IDs in local browser storage, with independent clears and transient fallback when storage is blocked. Server uses a server icon; Client uses a monitor icon.

Content/source/link validation, TypeScript and production build passed for 90 guides. Focused troubleshooting and library checks passed for search/category/empty-state recovery, URL selection/reload, truthful copied notes, guide links, bookmark persistence/removal, recent ordering, isolated clears, invalid-ID cleanup, blocked-storage fallback, icons and mobile layouts. Mobile library and troubleshooting screenshots reviewed. No backend, AWS, migration, queue, credential or recovery operation was executed.

Completed full handbook regression and published as Netlify deploy `6acf6b8f8615e8d6a2964c78`. Focused troubleshooting and reading-library checks passed against production. Production library assertions explicitly wait for route-driven rendering before counting links. Local preview stopped. Server/Client icons, contracts, migrations, testing, operational runbooks, bookmarks and troubleshooting are all included in this release. A Learning roadmap was recommended for Start here but not populated; owner learning priorities remain to be supplied.

### Editable personal learning roadmap — October 14, 2026

Owner authorized the Learning roadmap after discussing it as the next enhancement. Added the guide under Start here and linked it from the master workflow and reading library. The browser-only tool offers editable suggested priorities, reason/exercise/completion fields, optional related guides, Next/Practicing/Learned states, filters, local persistence and portable Markdown export. No competency assessment or project execution is implied. Suggested topics are labeled as proposals and can be removed or replaced.

Validation, source/related-link checks, TypeScript and production build passed for 91 guides. Full existing handbook browser regression passed. Focused roadmap checks passed for initial suggestions, status/filter, add/edit/remove, reload, persisted empty state, honest export, unreadable-storage preservation, blocked-storage fallback, theme controls and mobile layout. Mobile screenshot reviewed. No AWS resource, source-project application, test exercise or credential operation was performed by the roadmap.

Published Learning roadmap as Netlify deploy `6acf72433e157df1ec80dfa8`. The focused roadmap browser suite also passed against production. Local preview stopped after verification. Learning goals and self-reported statuses do not alter application security, source-review or release evidence.

### Versioning, release gates and publication review — October 14, 2026

Hardening adds a reviewed source snapshot excluding local governance, private archives, original owner planning context, provider linkage, environment files, keys and generated/test output. Public gaming prose no longer publishes location-specific security findings. Public reference stubs and generic checkout paths replace private planning text and personal source locations; originals are retained locally outside Git/deployment.

The release pipeline audits dependencies, validates/builds, records the Git revision, scans source/artifacts, compiles isolated security fixtures and runs browser regressions. Local verification evidence binds the clean source revision to a digest of every deployed path/byte. The deploy wrapper rejects stale/dirty candidates. CI configuration uses read-only permissions, pinned actions and no publishing credentials; the new checks execute remotely only after these commits are published. Provider branch protection/account controls remain separate settings, not established by workflow files.

Renderer changes explicitly skip raw HTML, restrict link schemes, block external Markdown images and reject Mermaid configuration directives/oversized input. Security regression checks exercise hostile content, delivered headers, inline-script blocking, artifact tampering and malformed/oversized browser storage. Existing inline SVG styles remain an explicit CSP exception. Automated scans detect selected secret/operational patterns and do not replace editorial review.

Final executed release evidence is recorded in ignored `.release/verified.json` after the complete clean-candidate gate. No remote repository is created/pushed, account MFA settings changed, or old deployment history deleted by this source update. See docs/publication-review.md for promotion boundaries and historical-publication limits.

### Moon browser icon — October 14, 2026

Added an ivory crescent moon on a black SVG tile as the browser favicon and changed browser theme chrome to black. The icon is a local static asset; it requires no external image service or script. Release verification follows the existing guarded pipeline.

### Local fonts and live release verification — October 14, 2026

Replaced Google Fonts requests with licensed local font assets and tightened CSP font/style origins. Added weekly Dependabot configuration for npm and GitHub Actions (pending repository publication). Added candidate and post-deployment smoke checks for revision, security headers, rendered routes, local assets and third-party requests. Deployment fails visibly if post-publication checks fail; it does not claim or attempt an automatic rollback. No hosting account settings or remote repository publication changed.

### Final Git and Heroku field guides — October 15, 2026

Added Git repository-to-PR steps, a searchable command reference, task worktrees connected to Foundry, Django-on-Heroku deployment and Heroku operations. Git essentials and Heroku field guide use sidebar dropdowns, with entry links from the build workflow and existing Foundry/hosting guides. Official documentation reviewed; these are reference instructions, not claims that Heroku resources, GitHub PRs, backups or Foundry tasks were executed. Final release checks validate the content and navigation before the existing guarded Netlify publication.

### Organization and discovery pass — October 15, 2026

Renamed sidebar topics to Backend, Frontend, and Cloud & CI/CD, keeping existing article URLs and internal topic identifiers. Grouped project structure, Foundry setup, CI/CD, hosting, and recovery guides into focused dropdowns. Added a complete guide directory with linkable topic/search filters, homepage intent links and an eight-step suggested reading path instead of the full article list. Previous/next links follow the current sidebar group or project chapter sequence. Recipe and troubleshooting labels use Backend/Frontend while accepting old Server/Client filter URLs. Added a CI/CD entry guide linking existing review, verification and delivery material; remote CI is not claimed active. Updated the build workflow to put Git before structure and Foundry. Organization checks cover discovery, filters, reload, reading order and mobile containment.
