<!-- docs/adr/002-estateiq-design-and-content.md — Record the application-inspired visual and editorial expansion. -->
# ADR 002: EstateIQ-inspired reference experience

The owner requested EstateIQ design inspiration and then expanded the request to tenancy, AI, and the rest of its architecture. Inspect the sibling repository read-only and summarize reusable engineering boundaries; do not copy runtime data, private files, credentials, or commercial assets into the public bundle.

Use near-black/zinc surfaces, cyan actions, subtle borders, restrained semantic accents, rounded panels, compact navigation, and purposeful page identity. Keep comfortable article typography and an optional light theme. Native SVG architecture plates adopt dark surfaces alongside the app; Mermaid responds to theme changes. No application API, tenancy/login runtime, or AI chatbot is added to the handbook.

The nine new guides connect the domain map, concrete organization/membership boundary, deterministic Copilot, document-specific Q&A and context, ledger/read models, private documents and reviewed intake, subscription gates/webhooks, broader domain workflows, and frontend cache/contracts. Review evidence distinguishes inspected code, domain documentation, tests located but not run, planned features, and live observations.

Known source drift is taught explicitly: middleware context versus authenticated membership, OrgProvider auto-selection comments versus implementation, streaming file delivery versus generic presigned URLs, and Celery documentation versus a web/release-only Procfile.
