<!-- git-worktrees — Practical build-manual reference. -->
---
title: "Git worktrees for Foundry tasks"
slug: "git-worktrees"
section: "foundry"
summary: "Give parallel tasks separate directories, integrate reviewed branches, and clean up safely."
order: 122
tags: ["git", "worktree", "foundry", "agents", "branches"]
status: "established-pattern"
lastReviewed: "2026-10-15"
sources: ["reference_sources/git-heroku-reference.md"]
related: ["git-basics", "git-command-reference", "foundry-first-task", "foundry-review-release"]
---

## When a second directory helps

Use a worktree when a task needs its own checkout while another task remains open. A branch names a line of commits; a worktree gives a branch a working directory and staging area. Linked worktrees share repository objects and references. They are not separate security boundaries.

## Create two task checkouts

This standalone Git exercise assumes a repository with a clean, committed main and an origin remote. Run it from the repository root. The sibling directories must not already exist.

```sh
git switch main
git pull --ff-only origin main
git worktree add -b feat/api-notes ../build-api-notes main
git worktree add -b feat/client-notes ../build-client-notes main
git worktree list
```

One branch normally cannot be checked out in two worktrees at once. Choose unique task names. Each checkout needs its own ignored `.env`, dependencies and distinct local ports where applicable. These do not copy automatically. See [Git worktree documentation](https://git-scm.com/docs/git-worktree).

## Match Foundry's task ownership

For a Foundry-managed task, follow [the first-task workflow](/guide/foundry-first-task) and its assigned workspace instead of creating a competing checkout. The standalone commands above explain the Git mechanism; they do not register or approve a Foundry task.

Give each agent its task, exact directory, permitted paths and acceptance criteria. Ask it to verify `pwd`, `git branch --show-current` and `git status` before editing. A separate directory prevents accidental checkout collisions; it does not prevent overlapping changes or grant deployment authority. Shared files still need coordination.

## Review and integrate

In each task directory, stage only the task's changes, run its checks and commit. Push its branch and open its PR using [the Git walkthrough](/guide/git-basics). Review against the latest main and run integration checks after merging. If conflicts appear, resolve their behavior rather than selecting one whole side blindly.

A Foundry implementation commit still needs its required review and release evidence. A Git merge or a green local test is not an owner release decision. Follow [Foundry review and release](/guide/foundry-review-release).

## Remove finished checkouts

After the corresponding PR is merged and local work is accounted for, run from the original repository:

```sh
git -C ../build-api-notes status --short
git worktree remove ../build-api-notes
git branch -d feat/api-notes
git worktree list
```

Removal deletes the linked directory. Keep any ignored local files you still need first, and never force removal to bypass unfinished work. Repeat for the second task when it is finished. Squash merges can require separate branch-cleanup review; a refusal from `branch -d` is a reason to inspect.

## Verify and troubleshoot

The original main checkout should contain the integrated behavior, and removed paths should disappear from `worktree list`. If Git says a branch is already checked out, locate its existing directory. Use `worktree remove` rather than deleting folders by hand; `worktree prune --dry-run` can preview stale metadata cleanup after a directory was removed externally.
