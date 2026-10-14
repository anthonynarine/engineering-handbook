<!-- content/foundry/foundry-first-task.md — Teach one numbered stage of Foundry repository setup and operation. -->
---
title: "06 · Create the first task and hand it to a worker"
slug: foundry-first-task
section: foundry
summary: "Turn the orientation brief into a scoped task, sessions, a worktree, and a submitted artifact."
order: 34
tags: [foundry, tutorial, setup, github, repository, agents]
status: established-pattern
lastReviewed: "2026-10-13"
sources: [reference_sources/foundry-tutorial-inspection.md, reference_sources/foundry-inspection.md]
related: [foundry-sessions, foundry-review-release]
---

## Step 1 — Bootstrap the task as the owner

**Your own terminal · demo main checkout**

```bash
foundry task create --title "Write project orientation" \
  --goal "A new collaborator can understand this repository and its Foundry workflow." \
  -c "docs/project-orientation.md describes the actual purpose and layout" \
  -c "The guide includes read-only state inspection commands and the next task" \
  -c "No secrets, product behavior, or governance permissions are changed"
```

Expected: a task in `DRAFT`. In a fresh demo it should be `DEMO-1`; use the ID actually printed if other tasks exist. The owner terminal is important for this initial step when agent sessions are required.

## Step 2 — Mint the Orchestrator session

**Your own terminal · demo main checkout**

```bash
foundry session start DEMO-1 orchestration --env-file auto
```

Expected: a session identifier, expiry, and the path of a newly created env file outside Git repositories. Give that path to the Orchestrator in its chat. Do not print/read the file into the conversation.

The following commands show a placeholder path. Replace it with the printed path. In the Orchestrator's shell, use the session file for each command; do not borrow another role's file.

## Step 3 — Assign the documentation workstream

**Orchestrator terminal · main checkout, its own session**

```bash
foundry --session-file /path/to/orchestrator.env workstream add DEMO-1 guide \
  --role documentation --goal "Write the project orientation guide" \
  --owns docs/project-orientation.md
foundry --session-file /path/to/orchestrator.env task transition DEMO-1 PLANNING
foundry --session-file /path/to/orchestrator.env task transition DEMO-1 READY
foundry task show DEMO-1
```

Expected: criteria, the assigned role, bounded owned path, and a ready task. Inspect the built-in documentation role with `foundry agent list`; native roles are not imported by blindly copying Foundry's legacy `.claude/` files.

## Step 4 — Create the worker checkout and identity

**Orchestrator terminal · main checkout**

```bash
git worktree add .worktrees/documentation/demo-1-guide \
  -b agent/documentation/demo-1-guide main
foundry --session-file /path/to/orchestrator.env session start DEMO-1 guide --env-file auto
foundry worktree list
```

Expected: a separate branch/worktree and a new worker env-file path. A hand-created Git worktree contains committed files; it is not automatically the secret-filtered checkout that some Foundry runtime paths create. Keep interactive-agent settings and actual isolation limits in view.

## Step 5 — Launch and brief the worker

Open the worker folder in a separate agent session. Give it this **chat prompt**, substituting the actual worker path and session-file path:

```text
You are the documentation worker for DEMO-1, workstream guide.
Work in ~/Projects/foundry-demo/.worktrees/documentation/demo-1-guide.
Use your own generated session file for every Foundry mutation.
Never print it or use the Orchestrator's session file.

Read the task, project instructions, actual repository, and relevant role.
Write only docs/project-orientation.md within the assigned owns path.
Verify the facts and commands, commit on your agent branch, and submit
an attributable commit artifact. Report gaps without widening scope.
```

The worker writes the real guide and verifies it against the repository. Do not ask it to run Foundry's own `tests/test_docs.py` in this application; that file belongs to the tool repository, not the demo.

## Step 6 — Submit the implementation

**Worker terminal · worker checkout, worker session**

```bash
git diff --check
git add docs/project-orientation.md
git commit -m "Document the demo project orientation"
foundry --session-file /path/to/worker.env artifact add DEMO-1 commit:orientation \
  --commit "$(git rev-parse HEAD)" --workstream guide \
  --summary "Project orientation checked against the repository"
```

Expected: an artifact ID and `SUBMITTED`. A submission satisfies nothing until another permitted actor accepts it. A full commit SHA, not a short hash or tree ID, names the candidate.

## Step 7 — Inspect and accept from the Orchestrator

**Orchestrator terminal · main checkout, Orchestrator session**

```bash
git diff main...agent/documentation/demo-1-guide
foundry --session-file /path/to/orchestrator.env integrate check DEMO-1 guide \
  --branch agent/documentation/demo-1-guide
foundry artifact list --task DEMO-1
foundry --session-file /path/to/orchestrator.env artifact accept DEMO-1/art-0001 \
  --reason "Guide checked against criteria and changed paths are within scope"
```

Use the artifact ID actually listed; `art-0001` is an example. Accept only after reviewing the diff and facts. Do not let the producer accept its own output or move `main` by an informal merge.

## Checkpoint

The first task has a scoped worker output, a real commit, and an independently accepted implementation artifact. The handbook verified command help, not this signed task lifecycle. Continue to [review and release](/guide/foundry-review-release).
