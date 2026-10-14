<!-- reference_sources/frontend-structure.md — Owner conventions and upstream frontend references. -->
# Frontend and repository conventions — 2026-10-13

Owner uses one full-stack repository with backend and frontend directories, three .gitignore files, Axios and TanStack Query. Added the equivalent standalone frontend layout with one root ignore file. Folder names are handbook conventions, not framework requirements.

Reference examples use Axios and TanStack Query v5; these dependencies were not added to the static handbook. The development proxy example uses the starter Django session login and read-only API. Production cookie, CSRF, CORS and authentication configuration remains application-specific.

Official references consulted:

- https://tanstack.com/query/latest/docs/framework/react/quick-start
- https://axios-http.com/docs/cancellation
- https://git-scm.com/docs/gitignore
