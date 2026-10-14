<!-- content/foundry/foundry-github-recovery.md — Teach one numbered stage of Foundry repository setup and operation. -->
---
title: "08 · Configure GitHub and recover the next session"
slug: foundry-github-recovery
section: foundry
summary: "Resolve public/private CI compatibility, make checks binding where available, and preserve durable work."
order: 36
tags: [foundry, tutorial, setup, github, repository, agents]
status: established-pattern
lastReviewed: "2026-10-13"
sources: [reference_sources/foundry-tutorial-inspection.md, reference_sources/foundry-inspection.md]
related: [foundry-review-release, reports-contract]
---

## Step 1 — Choose a compatible evidence delivery path

The tutorial demo is public. The inspected Foundry source/action is private. GitHub's built-in access sharing for a private action is limited to eligible private repositories; changing that access setting does not make the action consumable by the public demo. [GitHub private action sharing](https://docs.github.com/en/actions/how-tos/reuse-automations/share-across-private-repositories).

| Project choice | What you can do now | What is still separate |
| --- | --- | --- |
| Public application with authorized local Foundry | Local tasks, signed trust, candidate/release validation | A publicly consumable trusted verifier/action distribution or reviewed CI integration |
| Eligible private application and private Foundry under compatible ownership | Configure private action access and install the supplied gate template | Applicable GitHub plan/protection and live positive/negative runs |
| Public Foundry distribution | Possible only after its owner authorizes and publishes it | Distribution, licensing, pinned verifier setup, and live validation |

The handbook does not publish the Foundry source or change repository visibility. Do not solve the public/private mismatch by handing untrusted PR code a token for the private tool repo. If the public demo remains on local validation, label its GitHub evidence gate as not configured; do not require a check that cannot run.

## Step 2 — Install the supplied gate for an eligible target

This step applies when the target can actually access the Foundry action.

**Owner terminal · eligible application repo**

```bash
git switch -c foundry/evidence-gate
mkdir -p .github/workflows
cp ~/Tools/foundry/templates/evidence-gate.yml .github/workflows/evidence.yml
git -C ~/Tools/foundry rev-parse HEAD
```

Replace `FOUNDRY_SHA` in the template with a reviewed released full commit SHA that exists in the accessible remote. A local candidate or movable branch name is not the intended trusted pin. Inspect the entire workflow diff and its existing pins before committing it.

The template keeps the verifier and trust roots on the trusted side and treats the PR merge result as data. Do not add a step executing arbitrary PR code in this privileged workflow. Use a separate appropriate application-test workflow for candidate code.

In the private Foundry repo, the owner configures **Settings → Actions → General → Access** for the eligible private target. Commit the gate workflow through a reviewed bootstrap change. Validate an actual legitimate green run and an intentional invalid-evidence red run before calling it proven.

## Step 3 — Make supported checks binding

GitHub documents protected branches for public repositories on free plans and private repositories on applicable paid plans. Check the current plan and protection settings for the actual repository. [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

Require the actual evidence check context, Code Owner review for governance/trust/CI changes where configured, and the chosen up-to-date branch rules. Review bypass actors and direct-push permissions. A workflow that happens to appear green is advisory if a user can still merge/push around it.

Confirm behavior with a deliberate blocked path. A single-owner project also needs a workable independent review arrangement; configure required reviewers according to the repository's real participants rather than leaving a rule no one can satisfy.

Records/docs still need a route through protected `main`. They do not become exempt because they are small: prepare their branch and the evidence required for their tier. Deployment remains a separate product action; a merged Foundry release does not publish Netlify, Heroku or Vercel by itself.

## Step 4 — Record a checkpoint before leaving

**Agent chat**

```text
Prepare a checkpoint with Status, In flight, Decisions waiting,
and Next actions. Include exact task/branch/candidate references,
actual check results, uncommitted work, and active sessions.
Do not grant approval or change policy through the note.
```

A checkpoint file has four headings:

```markdown
## Status
Record completed work and actual evidence.

## In flight
Record task, workstream, branch, candidate and any active processes.

## Decisions waiting
Record owner decisions without inventing approval.

## Next actions
Record bounded continuation steps under existing authority.
```

For a complete first-task path, the owner prepares `docs/session-checkpoint.md` with those headings in their own checkout, then records it from the owner terminal:

```bash
foundry checkpoint --from docs/session-checkpoint.md --task DEMO-1
```

The documentation worker owns only `docs/project-orientation.md`, so it must not silently create the checkpoint file. The owner path above avoids widening that worker's scope. An agent-recorded checkpoint must use its own existing session and matching workstream, with explicit ownership for any input file it creates. `--commit` is a separate capability/branch choice; default recording does not commit product files or push state.

## Step 5 — End authorized sessions

Inspect `foundry session list` and actual worktree status. End a finished worker through its session or the Orchestrator:

```bash
foundry --session-file /path/to/orchestrator.env session end SESSION_ID --remove-env
```

Use the actual session ID. End the Orchestrator last. Do not stop another process merely because a prose note says to; verify ownership and that work is safely handed off first.

## Step 6 — Return after a crash

**Your terminal · application checkout**

```bash
git status --short
git worktree list
foundry boot --json
foundry status
foundry recover
foundry validate
```

Inspect before applying recovery. `foundry recover --apply` is the deliberate mutation path when missing attachments or lost state need recording. Preserve unknown uncommitted work, inspect its branch/handoff, and mint a new session rather than reusing an expired token.

The local `foundry/state` branch and unpushed worker branches do not magically travel with a fresh clone. Establish an approved backup/push policy for that control-plane history and worker work. A clone can recreate local attachments; it cannot reconstruct records that existed only on a lost disk. Never put session-token files or private keys into that backup branch.

## Final checkpoint

Record each setup stage as completed, blocked, or still unverified: GitHub repo, tool installation, native init, owner trust, sessions, task/artifact path, required evidence, compatible CI/protection, and recovery storage. Local init is verified by this handbook's smoke check; owner signing, GitHub gate, and governed task/release execution require your actual setup evidence.

Return to [the first chapter](/guide/foundry-repository) or apply the workflow to the [Reports feature](/guide/reports-contract).
