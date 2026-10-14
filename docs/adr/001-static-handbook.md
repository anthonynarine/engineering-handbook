<!-- docs/adr/001-static-handbook.md — Record the frontend architecture decision. -->
# ADR 001: Static frontend and build-time content

Use React, TypeScript, Vite, and React Router's browser router. Render repository-controlled Markdown using react-markdown with GFM and stable heading IDs. Markdown is sufficient for the first version; MDX execution is deferred until a concrete interactive article requires it.

Generate a validated JSON registry from frontmatter at build time. MiniSearch indexes that registry in the browser. A future larger corpus can move index construction to build time and lazy-load article bodies.

Use a small CSS system with an editorial layout. Preferences stay in localStorage. The handbook makes no application API calls. Backend runnable examples belong in a separate repository.

Public static hosting is allowed; no deployment destination has been selected. External fonts are decorative and fall back to local fonts if unavailable.

Official references checked 2026-10-12: https://vite.dev/guide/ and https://reactrouter.com/start/declarative/installation. Dependency resolution is pinned by package-lock.json.
