<!-- git-command-reference — Practical build-manual reference. -->
---
title: "Git command reference"
slug: "git-command-reference"
section: "system"
summary: "Find everyday Git commands by intent, with clear boundaries for destructive operations."
order: 121
tags: ["git", "commands", "undo", "merge", "stash"]
status: "established-pattern"
lastReviewed: "2026-10-15"
sources: ["reference_sources/git-heroku-reference.md"]
related: ["git-basics", "git-worktrees"]
---

## Choose the intent first

These are reference commands, not a script to run from top to bottom. Replace uppercase placeholders with your actual paths or revisions. Read `git status` before changing state. Search the handbook for a command or symptom to return here.

## Inspect without changing files

| Intent | Command | Read the result |
| --- | --- | --- |
| Working directory and staging | `git status --short --branch` | Confirm the branch and pending files |
| Unstaged edits | `git diff` | Not yet selected for the next commit |
| Staged edits | `git diff --staged` | Exactly what the next commit records |
| Branch history | `git log --oneline --graph --decorate -15` | Follow recent commits and pointers |
| PR-sized comparison | `git diff origin/main...HEAD` | Changes since the branches' common ancestor |
| Remote names | `git remote -v` | Check destinations; do not share credential-bearing output |
| Worktree locations | `git worktree list` | Find where branches are checked out |

The [Git command index](https://git-scm.com/docs) links to each command's full options.

## Save, share and integrate

| Intent | Command | Effect |
| --- | --- | --- |
| Select one file | `git add PATH` | Stages its current content |
| Record selected changes | `git commit -m "Describe the outcome"` | Creates a local commit |
| New feature branch | `git switch -c feat/NAME` | Creates and switches branches |
| Fetch remote history | `git fetch origin` | Updates remote-tracking references; no merge |
| Update clean main | `git pull --ff-only origin main` | Stops if integration needs a divergent merge |
| First branch push | `git push -u origin feat/NAME` | Publishes the branch and sets its upstream |
| Merge current main into feature | `git merge origin/main` | Run while on the feature branch |
| Stop an unfinished merge | `git merge --abort` | Returns toward pre-merge state; begin merges clean |

A PR is created on GitHub after pushing. Follow the [repository-to-PR walkthrough](/guide/git-basics) for base/compare selection and review.

## Undo the smallest thing

**Keep edits, change staging:** `git restore --staged PATH` removes that path from the next commit while retaining working-file edits.

**Discard edits:** `git restore PATH` replaces unstaged tracked-file content from the index. This loses those edits. Review the diff and save anything needed first. It does not delete untracked files. See [restore](https://git-scm.com/docs/git-restore).

**Reverse a shared commit:** `git revert COMMIT` creates a new inverse commit; inspect and test it, then submit it for review. Reverting a merge needs an explicit parent choice and should be planned separately. See [revert](https://git-scm.com/docs/git-revert).

**Park unfinished edits:** `git stash push -u -m "Describe unfinished work"` includes untracked files, but not ignored files. Use `git stash list`, then `git stash apply` to restore while retaining the stash. Apply can conflict. Only `git stash drop` after verifying the restored work. See [stash](https://git-scm.com/docs/git-stash).

**Find a recent local pointer:** `git reflog` can help locate a previous commit. Create `git branch rescue/NAME COMMIT` to retain it before attempting recovery. Reflog is local and expires; it is not a backup. See [reflog](https://git-scm.com/docs/git-reflog).

## Cleanup with evidence

`git branch -d feat/NAME` deletes a local branch only when Git's merge checks allow it. Remote deletion (`git push origin --delete feat/NAME`) affects collaborators; verify the PR is merged and no task still uses it. Never use force deletion just to suppress an unexplained refusal.

`reset --hard`, `clean -fd`, and force pushes can discard files or rewrite shared history. They are intentionally outside this everyday workflow. Stop and identify what must survive before choosing one.
