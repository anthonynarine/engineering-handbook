<!-- content/foundry/foundry-repository.md — Teach one numbered stage of Foundry repository setup and operation. -->
---
title: "01 · Create and open your GitHub repository"
slug: foundry-repository
section: foundry
summary: "Start with a real GitHub repo and a normal local clone before installing governance."
order: 29
tags: [foundry, tutorial, setup, github, repository, agents]
status: established-pattern
lastReviewed: "2026-10-13"
sources: [reference_sources/foundry-tutorial-inspection.md, reference_sources/foundry-inspection.md]
related: [building-with-foundry, foundry-installation]
---

## What you will build

This tutorial starts from zero and follows one small repository through Foundry setup, a documentation task, review, release planning, and recovery. It teaches the native `.foundry/` layout. Foundry's own source repository also contains older `.claude/state/` governance; that is not the layout to copy into your application.

The running project is `foundry-demo`, with task prefix `DEMO`, main branch `main`, and owner handle `human:learner`. Replace `YOUR_GITHUB_USER` with your GitHub username. Run one numbered step at a time and inspect the checkpoint before continuing.

| Place | What belongs there |
| --- | --- |
| Your terminal | Git, installation, configuration, and your personal signing/approval commands |
| Your agent chat | The brief that tells Claude or Codex what role and task to work on |
| GitHub website | Repository visibility, pull request review, Actions access, and branch protection |

Commands in this tutorial are instructions for your own setup. Publishing the handbook did not create this demo repository or register an owner. Local initialization was separately smoke-checked in an isolated synthetic Git repository.

## Step 1 — Check your tools

**Your terminal · any directory**

```bash
git --version
gh --version
uv --version
```

Use Git 2.38 or newer for the release trial-merge path, Python 3.12 or newer for Foundry, and an OpenSSH installation with signing support. `uv` can provision the Python environment. On macOS, if you already use Homebrew, an owner-run installation is `brew install git gh uv`. On other systems, use the official installers for your platform.

You also need access to the Foundry source repository or an authorized local checkout. The inspected source is private/proprietary and not a public PyPI distribution. A public application repo does not make Foundry itself publicly installable.

## Step 2 — Sign in to GitHub

**Your terminal · any directory**

```bash
gh auth login
gh auth status
```

Follow the browser login flow and confirm the expected account. If Git commits are not configured yet, set your identity deliberately; use a GitHub-provided no-reply address if that is your preference. Your Git identity is separate from Foundry's signed owner identity.

## Step 3 — Create and clone the demo

**Your terminal · parent folder for projects**

```bash
mkdir -p ~/Projects
cd ~/Projects
gh repo create YOUR_GITHUB_USER/foundry-demo --public --add-readme --clone
cd foundry-demo
```

The command creates a real public repository and clones it. `--add-readme` establishes an initial commit; `--clone` gives you a normal checkout. Choose a new name if `foundry-demo` already exists. Use `--private` instead if you want a private demo. [GitHub CLI repository creation](https://cli.github.com/manual/gh_repo_create).

For the website route, click **New repository**, choose the owner/name and visibility, add a README, and create it. Then copy its clone URL from **Code** and run `git clone <that URL>` in `~/Projects`. Both routes should end in a normal clone containing a real commit.

## Step 4 — Establish the tutorial's main branch

**Your terminal · `~/Projects/foundry-demo`**

```bash
git branch --show-current
git log -1 --oneline
git remote -v
git worktree list
```

Expected: a branch with the README commit, the intended GitHub `origin`, and one checkout. If the new demo's branch is already `main`, continue. If the fresh demo uses another default, normalize it before adoption:

```bash
git branch -M main
git push -u origin main
gh repo edit --default-branch main
git remote set-head origin -a
```

Those normalization commands are for this fresh demo. In an existing application, preserve its branch convention and pass that name to Foundry instead.

## Step 5 — Open the project

Open `~/Projects/foundry-demo` as a folder in your editor. If the VS Code shell command is installed, `code .` opens the current folder; otherwise use **File → Open Folder**. Open the integrated terminal and run `pwd` to confirm the same project root.

Your application checkout and the Foundry tool checkout are separate folders:

```text
~/Tools/foundry/               the tool's source
~/Projects/foundry-demo/       the application Foundry will govern
```

## Checkpoint

The demo exists on GitHub, its intended main branch is pushed, and the editor terminal is in a normal clone with a README commit. Continue to [install Foundry](/guide/foundry-installation).
