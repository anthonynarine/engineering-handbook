<!-- content/foundry/foundry-initialization.md — Teach one numbered stage of Foundry repository setup and operation. -->
---
title: "03 · Initialize the project and inspect the result"
slug: foundry-initialization
section: foundry
summary: "Run init in the right checkout, attach a plan, and review configuration before adoption."
order: 31
tags: [foundry, tutorial, setup, github, repository, agents]
status: established-pattern
lastReviewed: "2026-10-13"
sources: [reference_sources/foundry-tutorial-inspection.md, reference_sources/foundry-inspection.md]
related: [foundry-installation, foundry-human-authority]
---

## Step 1 — Prepare an adoption branch

**Your terminal · `~/Projects/foundry-demo`**

```bash
git status --short
git worktree list
git switch -c foundry/adopt
```

Start with the new demo's clean normal clone. When adopting an existing busy application, use a separate normal clone for this branch. In the inspected implementation, `init` resolves a linked worktree to its main checkout; do not run adoption from a specialist worktree and expect it to stay there.

## Step 2 — Write a small plan

Create `docs/build-plan.md` in the demo. Use a normal UTF-8 Markdown file:

```markdown
# Foundry demo plan

Outcome: a new collaborator can orient themselves in this repository.

First task: add docs/project-orientation.md with purpose, layout,
verification steps, and the next learning task.

Acceptance: documentation matches the actual repository; no secrets,
application behavior, or governance permissions are changed.
```

The plan guides the conversation. Recording its path does not automatically turn every paragraph into tasks or confer authority.

## Step 3 — Initialize once, with explicit choices

**Your terminal · demo adoption branch**

```bash
foundry init --name foundry-demo --prefix DEMO --main main \
  --build-plan docs/build-plan.md --agent-instructions
```

Expected: `.foundry/` configuration and policy directories, ignore rules, a `foundry/state` branch, and a local `.foundry/state/` worktree. With `--agent-instructions`, the managed Foundry section is installed into `AGENTS.md` and its diff is shown. Instructions take effect immediately; review them before launching an agent.

Default init leaves `AGENTS.md` unchanged. The plan option records bounded advisory metadata in `.foundry/project/build-plan.yaml`; it does not import or execute the plan's content. The inspected implementation accepts a bounded, plain repository-relative file and rejects protected/linked paths.

## Step 4 — Inspect the two kinds of state

| Path or branch | Keep it where? | Purpose |
| --- | --- | --- |
| `.foundry/foundry.yaml` | Application Git history | Project identity, main/state branches, provider/runtime settings |
| `.foundry/project/` | Application Git history | Component map, architecture and advisory plan reference |
| `.foundry/policy/` and project roles | Application Git history | Reviewed authority and evidence configuration |
| `AGENTS.md` | Application Git history | Explicitly adopted agent instructions |
| `foundry/state` branch | Separate control-plane history | Task, session, artifact and event records |
| `.foundry/state/`, `.foundry/work/`, `.worktrees/` | Locally ignored directories | State checkout and workspaces |

**Your terminal · demo adoption branch**

```bash
git status --short
git worktree list
rg 'main_branch|task_prefix|sessions' .foundry/foundry.yaml
foundry boot --json
foundry status
foundry validate
```

If `rg` is unavailable, open the YAML in your editor. Confirm `main_branch: main` and `task_prefix: DEMO`. `init` preserves existing configuration: rerunning with a new `--main` does not overwrite an existing YAML value. Correct a wrong value deliberately before committing.

## Step 5 — Describe ownership and secrets

For this documentation-only demo, a component entry can be:

```yaml
# .foundry/project/components.yaml — Describe the demo's actual documentation.
components:
  - id: documentation
    kind: docs
    description: Repository orientation and learning notes
    paths: ["docs/**", "README.md"]
    owner_role: documentation
```

Replace the architecture placeholder with a short description of the actual README/docs repository. Do not invent frontend/backend services that do not exist. When adopting a real React/Django project, map its actual paths and commands here instead.

Inspect classification without reading file contents:

```bash
foundry secrets policy
foundry secrets check .env.example docs/build-plan.md
foundry agent list
```

Foundry treats `.env.*` templates as protected too. Document setting names in an ordinary configuration guide rather than placing real values in the plan. Add project-specific secret/sensitive path patterns before first owner adoption.

For the session-based path in this tutorial, set `sessions: required` in `.foundry/foundry.yaml` before first adoption. This is an authority configuration choice. The later human-owned bootstrap creates the first task/session; agents then use their own session files.

## Step 6 — Review and merge the bootstrap

**Your terminal · demo adoption branch**

```bash
git add .foundry .gitignore AGENTS.md docs/build-plan.md
git diff --cached --stat
git diff --cached
git commit -m "Adopt Foundry in the demo"
git push -u origin foundry/adopt
gh pr create --base main --head foundry/adopt \
  --title "Adopt Foundry" --body "Initialize native configuration, project instructions, and the demo plan."
```

Review the actual diff on GitHub. `.foundry/state/` must not be staged. Include `node_modules/` in the application's `.gitignore` when using Node dependencies; that rule is separate from Foundry's generated workspace ignores.

This initial adoption is a reviewed bootstrap PR: there is no established owner trust or evidence workflow yet. After you approve and merge it, update your local checkout:

```bash
git switch main
git pull --ff-only origin main
foundry recover
```

Use `foundry recover --apply` only when its report calls for attaching or recording missing local state. In the same normal clone, the existing state worktree may already be attached.

## Checkpoint

The reviewed native configuration is on `main`; the main branch, plan reference, instructions, ownership and session choice are correct. Local init/re-init/boot/validate/status/recover were smoke-checked for this handbook. GitHub bootstrap and signed owner adoption were not performed. Continue to [register the owner](/guide/foundry-human-authority).
