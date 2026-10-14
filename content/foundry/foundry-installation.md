<!-- content/foundry/foundry-installation.md — Teach one numbered stage of Foundry repository setup and operation. -->
---
title: "02 · Install the Foundry tool"
slug: foundry-installation
section: foundry
summary: "Install from an authorized checkout, expose the CLI, and check provider support separately."
order: 30
tags: [foundry, tutorial, setup, github, repository, agents]
status: established-pattern
lastReviewed: "2026-10-13"
sources: [reference_sources/foundry-tutorial-inspection.md, reference_sources/foundry-inspection.md]
related: [foundry-repository, foundry-initialization]
---

## Step 1 — Obtain the tool source

**Your terminal · tool parent directory**

```bash
mkdir -p ~/Tools
cd ~/Tools
git clone https://github.com/anthonynarine/foundry.git
cd foundry
git rev-parse HEAD
```

The repository requires authorized access. If GitHub returns a permission or repository-not-found error, resolve access under the correct account. Do not substitute an unrelated package named Foundry.

If you already have the authorized checkout at `/path/to/authorized/foundry`, use that path instead of cloning another copy. Record its commit alongside your tutorial notes. Do not discard local changes to update it.

## Step 2 — Install as a tool

**Your terminal · any directory, authorized checkout available**

```bash
uv tool install --python 3.12 ~/Tools/foundry
uv tool update-shell
```

Open a new terminal if shell-path changes are required. Then check:

```bash
foundry --version
foundry --help
foundry init --help
```

For the existing local checkout, the install command is `uv tool install --python 3.12 /path/to/authorized/foundry` instead. Choose one checkout as your tool source.

Foundry is a Python CLI; this setup needs installation rather than a separate frontend compilation step. `uv tool install` installs a CLI into its own tool environment. It does not add Foundry to the application's frontend dependencies. [uv tool installation](https://docs.astral.sh/uv/guides/tools/).

The inspected development CLI reported `0.2.0.dev0`; that label does not uniquely identify the source revision. Check your installed help before using an option that may differ by version.

## Step 3 — Understand the development alternative

**Your terminal · Foundry tool checkout**

```bash
cd ~/Tools/foundry
uv sync
uv run foundry --version
```

This runs in Foundry's development environment. Installing the tool is the simpler way to call `foundry` from other repositories. On Anthony's machine the existing development executable is `/path/to/authorized/foundry/.venv/bin/foundry`; using an absolute executable path does not change which project your current directory selects.

After deliberately updating the source, reinstall the tool with `uv tool install --reinstall --python 3.12 ~/Tools/foundry`. A source pull alone does not necessarily update the installed tool environment.

## Step 4 — Check the agent you will use

**Your terminal · any directory**

```bash
foundry provider list --json
```

| Inspected provider | Registered support | What still needs checking |
| --- | --- | --- |
| Claude | Supervised model adapter and observation parser | CLI installation, login, compatibility, readiness |
| Codex | Observation parser; no supervised model adapter in this inspected build | Interactive CLI installation/login; observation does not launch it |
| Process | Generic command supervision | Not a model-session adapter |

You can use an interactive Codex session to follow repository instructions. Do not change the provider name in YAML and assume a missing supervised adapter now exists. The provider registry reports support without probing your executables or credentials.

This tutorial uses manually opened agent sessions. A worktree separates checkouts; container enforcement is a separate runtime setup with its own verification.

## Step 5 — Return to the application

**Your terminal · application checkout**

```bash
cd ~/Projects/foundry-demo
pwd
foundry init --help
```

The tool is installed; the demo is not initialized yet. Keep those two checkpoints separate.

## Checkpoint

`foundry --version` and `foundry init --help` work from the demo folder, and you understand the selected agent's actual support. Continue to [initialize the project](/guide/foundry-initialization).
