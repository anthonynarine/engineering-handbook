<!-- README.md — Development and scope for the frontend engineering handbook. -->
# Anthony Narine Engineering Handbook

A frontend-only, Git-backed reference for Django and React engineering. The systems described by the articles are not services run by this project.

## Develop

Use Node 22.12+ and npm.

```bash
npm ci
npm run validate
npm run dev
```

Open the printed localhost URL. After changing Markdown, run `npm run validate` to regenerate the article registry. Restart is not required; Vite observes generated content changes.

```bash
npm run typecheck
npm run build
npm run preview
```

`dist/` is the static deployment artifact. No application server, database, API credentials, or login is required.

## Content

Add Markdown under `content/<section>/` with the same frontmatter as an existing article. Run validation before building. Article content, navigation, and search share the generated registry; articles do not require UI edits. New sections appear automatically; optional friendly labels live in `src/app/App.tsx`.

The original supplied plan is preserved under `reference_sources/`. The owner-supplied planning context is retained locally and excluded from the public source snapshot. See `docs/implementation-status.md` for honest progress and remaining scope.

## Hosting

Public hosting is supported. Configure your static host to serve `index.html` for unknown application routes so direct `/guide/...` URLs work. Deploy only `dist/`; source references are not copied as assets. Private hosting is optional and would require host-level access restrictions.

## Maintain project case studies

Run `npm run review:projects` to compare recorded source-review revisions with sibling checkouts. Set `HANDBOOK_PROJECTS_ROOT` if they live elsewhere. The command reads Git metadata and hashes only explicitly listed inspected files, then writes the comparison snapshot displayed by the handbook. It changes no inspection dates or inspected revisions. Matching files do not certify the rest of a dirty checkout or runtime behavior. Gaming currently has revision-only coverage; other project scopes are listed in `src/features/projects/sourceReviews.json`.

When a project changes, review public-safe source and update its design chapters, rationale, recovery scenario and diagrams together. Update `src/features/projects/sourceReviews.json` only after that inspection. Record which checks were actually executed in `reference_sources/projects-inspection.md`. Confidential plans, security triage, credentials and runtime/customer data stay outside the handbook. Validate content and links, build, and run the browser suite before publishing.

## Manual navigation

The eight primary homes are defined in `src/features/handbook/navigation.ts`; this mapping is separate from content-source directories. Keep existing guide URLs stable when organizing the sidebar. `SectionNavigation.tsx` defines the smaller expandable reading groups. Assign every guide one primary home and cross-link related topics from the article instead of duplicating sidebar entries. Projects keeps its catalogue and in-project chapter navigation.

## Verified releases

Commit the reviewed source, then run `npm run release:prepare`. This audits dependencies, builds, records the Git revision, scans reviewed source and the deploy directory, and runs all browser/security checks. It writes ignored local evidence tied to the exact commit and artifact bytes. `npm run release:deploy` rejects dirty source or changed artifacts before publishing that build. Direct provider-admin deployment remains an owner override; these scripts do not replace provider access control.

CI runs the same gates on pull requests and pushes without deployment credentials. Install CI Chromium with `npx playwright install --with-deps chromium`. macOS uses installed Chrome; other environments use Playwright Chromium. `dist/release.json` identifies the deployed source revision. Test fixtures build only into ignored `.security-dist/` and are rejected from the public deployment.

A local Git history is not an off-device backup. The new workflow becomes active only after these commits are pushed to GitHub; required checks and branch protection must be enabled there. No remote repository or promotion is created by these changes.
