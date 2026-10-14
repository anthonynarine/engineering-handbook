<!-- docs/deployment.md — Prepare static hosting without provisioning infrastructure. -->
# Static deployment

Run `npm ci` and `npm run build`; publish `dist/` with an SPA fallback to `index.html`. The handbook can be public. Published the initial four-guide preview on the existing Netlify account: https://anthony-narine-engineering-handbook.netlify.app .

Site ID: `4328cb47-ee6a-4f9d-88b1-b0871acb77d5`. Initial deploy: `6acd0349d4209da2ced49636`. `netlify.toml` configures the build, static output, Node 22, and SPA fallback. This is a manual deployment; automatic GitHub deployment is not configured.

For future updates, commit the reviewed source, then run `npm run release:prepare` and `npm run release:deploy`. The deployment command refuses changed source or artifacts and automatically checks the live site. Do not bypass this gate with a direct Netlify deployment.

Verify a direct article URL, a refresh on that URL, back/forward navigation, asset responses, and search after deployment. Only generated frontend content is shipped. Review article text before public release; repository privacy does not control deployment audience.

Optional private hosting should restrict HTML, assets, and search at the host. Do not implement a client-side login as a substitute.

Latest expanded deployment: `6acd0b70bdb0aa04ae5a486c` (2026-10-12). Production Chrome checks verify all diagrams, search and mobile navigation under the actual CSP. Security headers were confirmed in HTTP responses. This publication remains a manual Netlify release, not a Foundry-governed release.

Latest EstateIQ design/content deployment: `6acd79ea515ce9c6cd0ed80c`. Nineteen guides; live browser checks passed across all diagram destinations and theme controls.

## Reports walkthrough deployment — 2026-10-12

Published the verified static build containing 25 guides and the `/lab/reports` synthetic browser exercise. Netlify production deploy: `6acd8d2c579b3fffb02dc416`.

Walkthrough: https://anthony-narine-engineering-handbook.netlify.app/guide/reports-contract
Lab: https://anthony-narine-engineering-handbook.netlify.app/lab/reports

No backend, worker, scheduler, database, or authentication service was deployed. Backend tutorial examples remain reference code. Publication used the existing manual Netlify deployment flow.

Post-deploy verification: the full Chrome suite passed against the production URL, including all diagrams, search, mobile navigation, theme controls, and the Reports lab scenarios.

## Incident drill deployment — 2026-10-13

Published 29 guides and `/lab/resilience` as production deploy `6ace21c952a0ce5bbc674024`. The full Chrome suite passed against the live site, including new drills, note downloads, diagrams, the Reports lab, search, and mobile/theme behavior. No backend, worker, restore, or provider operation was deployed or tested.

## Foundry tutorial deployment — 2026-10-13

Published 37 guides including the eight-chapter Foundry from zero path as production deploy `6ace2f90bcc78227ac6e52c6`.

Entry: https://anthony-narine-engineering-handbook.netlify.app/guide/foundry-repository

This publishes tutorial assets only. It does not create the demo GitHub repository, install tools on readers' machines, register owner principals, publish private Foundry code, or execute a signed task/release. Those steps are explicitly explained as reader/owner operations with verification checkpoints.

Post-deploy verification: the complete Chrome suite passed on the production URL. Tutorial navigation checks wait for the actual article, avoiding a similarly named homepage-card heading. Clipboard, diagrams, interactive labs, and mobile flows passed.

## Live verification and maintenance — October 14, 2026

`npm run check:production` checks production against the current checkout and `dist/`. It verifies the release revision, exact configured security headers, HTTPS HSTS, three rendered routes, local font and favicon bytes, and the absence of third-party browser requests or browser errors. The same checker runs against the candidate locally before release. `release:deploy` runs it after publication and records successful verification in ignored `.release/deployed.json`. A failed live check exits unsuccessfully but does not undo the completed publication; inspect the site and Netlify deploy history before choosing a rollback.

DM Sans and Libre Caslon Display are served locally with their SIL Open Font Licenses. The CSP permits fonts only from this origin; inline styles remain necessary for diagram rendering and interactive layout.

`.github/dependabot.yml` requests weekly npm and GitHub Actions updates. Minor and patch npm updates are grouped; major updates remain individually reviewable. Updates are not automatically merged or deployed. Configuration follows https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference . Dependabot and remote CI activate only after these files reach the GitHub default branch; this change does not publish the local repository. Hosting MFA, account recovery, deploy access and branch protection remain account settings to verify separately.
