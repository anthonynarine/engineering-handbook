<!-- reference_sources/lumen-inspection.md — Public-safe, scoped Lumen source inspection. -->
# Lumen inspection — 2026-10-13

Owner identified Lumen as the flagship and specified a future AWS deployment with dedicated EC2 service instances behind an ALB, secured through Gait. AWS deployment is not complete. Read-only review at revision a30467f; exact inspected public-source scope is recorded in sourceReviews.json with a file fingerprint. No source-project files changed. No environment files, credentials, logs, patient data, databases, private signing/session material or actual cloud state were inspected.

Reviewed README for context, then current source for the Reports URLs/health checks, organization middleware and membership permission, Media JWT verification/authorization and route dependencies, UI Reports client, and deployment proxy/bootstrap wiring. Current source supersedes historical architecture descriptions. The checkout has React/Vite, Django Reports, FastAPI Media and a shared policy package; the older README's lumen_ai directory is absent. AI is marked future work, not a deployed service.

Source shows organization selection distinct from active membership, transaction-local PostgreSQL tenant context after membership, Media authorization based on scoped facts and shared policy, and separate identity adapters. These findings are architectural observations, not a fresh security audit or runtime certification. No historical test count was treated as current evidence. Internal security findings and real operational identifiers are omitted from published prose.

The container/proxy deployment notes identify production compatibility work still requiring verification. The AWS chapters preserve that uncertainty and require fresh production-shaped login, permission, migration, media and recovery checks. The database bootstrap sequence preserves schema, RLS and runtime grants; adapting it to managed RDS needs review of privileges.
