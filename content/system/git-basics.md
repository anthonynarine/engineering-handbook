<!-- git-basics — Practical build-manual reference. -->
---
title: "Git: repository to pull request"
slug: "git-basics"
section: "system"
summary: "Start a repository, commit a focused change, open a PR, and merge with confidence."
order: 120
tags: ["git", "github", "branches", "pull requests", "merge"]
status: "established-pattern"
lastReviewed: "2026-10-15"
sources: ["reference_sources/git-heroku-reference.md"]
related: ["git-command-reference", "git-worktrees", "full-stack-folder-structure"]
---

## When to use this

Use this path at the start of a build, before Foundry assigns work. Git records revisions; GitHub hosts collaboration. A commit is local until pushed. A pull request proposes a branch change for review; it does not deploy by itself.

## 1. Create or clone

For a new project, create an empty GitHub repository with your chosen visibility. Leave its initial README unchecked when pushing an existing local project. Replace OWNER and REPO below. First check `git status`: if you are already in a repository, do not initialize a nested one.

```sh
mkdir build-demo
cd build-demo
git init -b main
git config user.name "Your Name"
git config user.email "your-public-or-noreply-email@example.com"
```

Create a README and the [root, backend and frontend ignore files](/guide/full-stack-folder-structure) before staging. Review what will be public. `.gitignore` does not remove an already tracked secret; rotate an exposed credential.

```sh
git status --short
git add README.md .gitignore
git diff --staged
git commit -m "Initialize project"
git remote add origin https://github.com/OWNER/REPO.git
git push -u origin main
```

For an existing remote, use `git clone https://github.com/OWNER/REPO.git` instead, then `cd REPO`. Authenticate through your approved GitHub credential setup; never embed a token in the URL.

## 2. Branch and make one change

Start with a clean working directory and an up-to-date main. Edit README.md after creating the branch.

```sh
git switch main
git pull --ff-only origin main
git switch -c feat/build-notes
git diff
git add README.md
git diff --staged
git commit -m "Document local build steps"
git push -u origin feat/build-notes
```

Run the project's checks before pushing. Stage named paths so unrelated edits stay out of review. See the [Git tutorial](https://git-scm.com/docs/gittutorial).

## 3. Review a pull request

On GitHub, open **Compare & pull request**. Select base `main` and compare `feat/build-notes`; inspect Files changed. Describe the problem, resulting behavior and actual checks run. Use a draft while work remains. Review the final commit and wait for required checks before merging. See [GitHub's PR steps](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request).

Choose the repository's agreed merge method. A merge commit preserves branch topology; squash combines the PR into one commit; rebase-and-merge replays commits. After a squash merge, Git may not recognize the original branch as merged, so `branch -d` can refuse deletion. Verify the PR before deciding on cleanup.

## 4. Handle a conflict deliberately

To bring current main into your feature branch, start clean, then:

```sh
git fetch origin
git switch feat/build-notes
git merge origin/main
```

If Git reports conflicts, inspect `git status`, edit each conflicted file, remove conflict markers, and preserve the intended behavior from both changes. Stage resolved paths, rerun checks, then `git commit` and push the branch. To abandon this unfinished merge, use `git merge --abort`; starting clean makes recovery predictable. See [merge documentation](https://git-scm.com/docs/git-merge).

## Verify and recover

After the PR merges, switch to main and `git pull --ff-only origin main`. Confirm the merged behavior and a clean `git status`. If a pull refuses to fast-forward, inspect the history instead of forcing it. If you committed to the wrong branch, preserve the commit on a new branch before changing anything. Use the [command reference](/guide/git-command-reference) for safer undo choices.
