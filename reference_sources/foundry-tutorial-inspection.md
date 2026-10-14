<!-- reference_sources/foundry-tutorial-inspection.md — Record current Foundry setup facts and verification boundaries. -->
# Foundry tutorial inspection — 2026-10-13

Read-only source: `/path/to/authorized/foundry`, HEAD `6088d5a` (FND-39 actual-main preflight). Installed development CLI reported `0.2.0.dev0`. This version string is not a unique release identifier; readers should record their source commit and installed help.

Inspected README, pyproject.toml, native initialization implementation, project schemas, built-in roles and instructions, evidence gate template, and walkthrough chapters 02–08 and 10–11. Confirmed CLI help for initialization, principals, task/workstream/session/artifact/review operations, checkpoints, tests, integration checks, and release. `provider list --json` reports a Claude supervised model adapter, Codex observation without a supervised model adapter, and no installation/authentication/readiness probing. `workspace create` and `role list` are not commands in this inspected CLI; use actual help instead of inferred syntax.

Authored tutorial summaries and examples; source documents are not copied wholesale. The Foundry checkout and its private/proprietary distribution remain unchanged. No GitHub repositories were created, no private keys or session-token files were read, no owner was registered, and no signed policy/release was performed for the handbook.

Isolated smoke check: created a synthetic committed Git repository under `/private/tmp`, ran native init with explicit main/prefix, managed agent instruction opt-in and a bounded plan reference; repeated init; ran boot, validate, status and recover in JSON mode. Six commands passed. Native configuration, state worktree and separate state branch were created without an application-branch commit. This verifies local initialization behavior only, not GitHub, signing, agent authentication, task acceptance, or CI release.

Official external references:
- https://cli.github.com/manual/gh_repo_create
- https://docs.astral.sh/uv/guides/tools/
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- https://docs.github.com/en/actions/how-tos/reuse-automations/share-across-private-repositories

GitHub's private action sharing is limited to eligible private repositories. The public demo cannot directly consume Foundry's currently private action via that access setting. A public trusted distribution/integration requires separate authorization and implementation; it is not supplied by this tutorial. Product build/deploy remains separate from a Foundry release.
