<!-- content/foundry/foundry-human-authority.md — Teach one numbered stage of Foundry repository setup and operation. -->
---
title: "04 · Register yourself as the owner"
slug: foundry-human-authority
section: foundry
summary: "Create a dedicated signing identity, adopt policy, and commit the public trust configuration."
order: 32
tags: [foundry, tutorial, setup, github, repository, agents]
status: established-pattern
lastReviewed: "2026-10-13"
sources: [reference_sources/foundry-tutorial-inspection.md, reference_sources/foundry-inspection.md]
related: [foundry-initialization, foundry-sessions]
---

## Step 1 — Prepare a dedicated signing key

**Your own terminal · any directory**

```bash
mkdir -p ~/.ssh
ssh-keygen -t ed25519 -f ~/.ssh/foundry_signing -C "Foundry signing"
```

Use a passphrase. If this path already holds a key, do not overwrite it; review/reuse the intended key or choose a different dedicated filename. The private file stays outside repositories and agent workspaces. The `.pub` file is the public identity that the project will trust.

Optional agent-based signing is `ssh-add -c ~/.ssh/foundry_signing`, with the confirmation behavior tested on your platform. Human signing should remain in your own terminal.

## Step 2 — Create or review your identity file

Open `~/.config/foundry/identity.toml` in your editor, creating its parent directory if needed. For a first setup:

```toml
# ~/.config/foundry/identity.toml — Local human identity, outside every repository.
principal = "human:learner"
key = "~/.ssh/foundry_signing"
```

If a file already exists, review it instead of replacing it blindly. Use one consistent handle across this file, principal registration, and the trusted signers entry. The identity file names you; a verified signature and adopted project trust establish authority.

## Step 3 — Become the demo's first owner

**Your own terminal · `~/Projects/foundry-demo`, reviewed adoption on `main`**

```bash
foundry principal init --handle human:learner \
  --key ~/.ssh/foundry_signing.pub --name "Tutorial Owner"
```

Read the policy adoption statement and files shown. Approve only your intended policy, then sign with your key. Expected: first owner registered and policy sequence 1 adopted. This is the initial trust decision; the tutorial does not run it for you.

If the project already has principals, an existing owner adds you through the existing principal workflow. Do not treat “already initialized” as a reason to replace trust files.

```bash
foundry whoami
foundry policy status
```

Expected: the correct handle, owner role, public-key fingerprint, and adopted policy. The command creates `.foundry/policy/principals.yaml` containing public trust material. That exact adopted policy must reach the target branch before governed releases.

## Step 4 — Prepare public trust files

Create a trust branch. The following snippet uses only the public key file to construct the evidence signers entry:

```bash
git switch -c foundry/trust
python3 - <<'PYCODE'
from pathlib import Path
key = (Path.home() / ".ssh/foundry_signing.pub").read_text().split()
Path(".foundry/allowed_signers").write_text(
    'human:learner namespaces="foundry-evidence" ' + ' '.join(key[:2]) + '\n'
)
PYCODE
```

Create `.github/CODEOWNERS` with your actual GitHub username:

```text
/.github/                   @YOUR_GITHUB_USER
/.foundry/allowed_signers   @YOUR_GITHUB_USER
/.foundry/policy/           @YOUR_GITHUB_USER
/.foundry/roles/            @YOUR_GITHUB_USER
/.foundry/foundry.yaml      @YOUR_GITHUB_USER
/AGENTS.md                  @YOUR_GITHUB_USER
```

Code Owners defines reviewers; it becomes a required review control only when the applicable GitHub protection settings require it.

## Step 5 — Inspect interactive-agent secret settings

**Your terminal · demo trust branch**

```bash
foundry secrets settings
```

Review the proposed settings changes. To write them for an interactive Codex project, use `foundry secrets settings --agent codex --write`; for Claude use `--agent claude --write`. Choose the agents you actually use. These tool-specific rules have their own enforcement limits and do not turn a manually opened session into a container sandbox.

## Step 6 — Commit, review, and merge trust

Stage only the files you actually created, including the selected agent's settings file if written:

```bash
git add .foundry/policy/principals.yaml .foundry/allowed_signers .github/CODEOWNERS
# If written: git add .codex/config.toml
# If written: git add .claude/settings.json
git diff --cached
git commit -m "Register Foundry owner and release trust"
git push -u origin foundry/trust
gh pr create --base main --head foundry/trust \
  --title "Register Foundry trust" --body "Commit the first owner, evidence signer, and Code Owners configuration."
```

Review and merge this second bootstrap PR, then return to `main` and pull it. Verify `whoami` and `policy status` again. Do not call an unmerged working-tree policy a trusted target branch.

After adoption, changing signed configuration, roles or policy can make mutations fail closed. Use `foundry policy status` to inspect the mismatch. An owner reviews and signs a deliberate new adoption with `foundry policy adopt`; an agent cannot widen its own authority.

## Checkpoint

You can identify the owner and adopted policy, and the exact public trust files are committed on `main`. Keys, owner registration and signing are instructions for your own setup, not operations executed by the handbook. Continue to [start a session](/guide/foundry-sessions).
