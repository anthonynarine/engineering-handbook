<!-- content/skills/infrastructure-as-code.md — Teach infrastructure as code concepts: declarative resources, state, plan and review. -->
---
title: "Infrastructure as code: reviewable, repeatable cloud resources"
slug: infrastructure-as-code
section: skills
summary: "Learn to describe cloud resources in code, review every change before it happens, and apply it safely from CI."
order: 6
tags: [skills, infrastructure as code, iac, terraform, opentofu, cdk, cloudformation, aws, state, gitops, oidc, policy as code, concepts, education]
status: established-pattern
lastReviewed: "2026-10-21"
sources: [reference_sources/skills-gap-review.md]
related: [skills-gap-map, lumen-aws-architecture, lumen-aws-release, ci-cd-release-workflow, containers-fundamentals]
lesson:
  level: Intermediate
  duration: 90 minutes
  prerequisites: [containers-fundamentals, networking-and-load-balancers, ci-cd-release-workflow]
  objectives:
    - Explain declarative infrastructure, state and drift
    - Run a plan, review it, and apply it from CI
    - Store state remotely, locked and protected
    - Authenticate CI to AWS with OIDC instead of stored access keys
    - Separate environments so staging mistakes can't reach production
---

## Why this matters

Imagine setting up Lumen on AWS by clicking through the console: a network, subnets, security groups, a load balancer, servers, a database, S3 buckets with careful policies. It works. Then, six months later:

- Someone asks, "why is this port open?" Nobody remembers.
- You need a staging copy. You click through it all again and get something slightly different.
- A setting changes and the site breaks. There's no record of who changed what.

That's "ClickOps," and every team that grows hits these walls. Infrastructure as code (IaC) is the way out. You've already learned to build containers and route traffic to them. This lesson is about describing all of that in files you can review, version and rebuild.

## The big idea

Think of the difference between a **blueprint** and building by hand. A builder working from memory might do great work, but nobody can check it beforehand, repeat it exactly, or see what changed. A blueprint can be reviewed, approved, versioned and used to build an identical copy.

IaC makes your infrastructure a blueprint. And it's **declarative**: you describe *what should exist*, not the steps to create it.

```hcl
resource "aws_s3_bucket" "documents" {
  bucket = "lumen-documents-staging"
}
```

You're saying "a bucket with this name should exist." The tool works out the steps. If the bucket doesn't exist, it creates it. If it exists and matches, it does nothing. Running it twice is safe, and that property is what makes IaC trustworthy.

Four more ideas complete the picture:

- **State** is the tool's inventory: a record of which real resources match which lines of code. Without it, the tool wouldn't know that bucket was its own.
- **Plan** is the preview. Before changing anything, the tool shows exactly what it *would* create, change or destroy. It's like an architect showing you the marked-up blueprint before any wall moves.
- **Drift** is when reality no longer matches the blueprint: someone changed a setting in the console by hand. The next plan shows it.
- **Modules** are reusable pieces: "a private service behind the load balancer," written once and used for every service.

**Pause and check:** you run the same IaC code twice in a row with no changes. What happens the second time? (Nothing. The plan shows no changes, because reality already matches the description.)

## The tools

| Tool | Language | Good to know |
| --- | --- | --- |
| [Terraform](https://developer.hashicorp.com/terraform/intro) | HCL | The most widely used; moved to the Business Source License in 2023 |
| [OpenTofu](https://opentofu.org/docs/) | HCL | An open-source fork of Terraform under the Linux Foundation; largely compatible |
| AWS CloudFormation | YAML / JSON | AWS's own tool; AWS manages the state for you |
| [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/home.html) | TypeScript, Python, … | Write infrastructure in a real programming language; it generates CloudFormation |

Don't agonize over the choice. The concepts in this lesson carry across all of them. Pick one per project and be consistent. The examples here use Terraform syntax, which OpenTofu shares.

## The workflow: plan, review, apply

This is the heart of IaC, and you'll recognize the shape from your [CI/CD release workflow](/guide/ci-cd-release-workflow):

1. **Change the code** on a branch.
2. **Plan.** CI runs the plan and posts it on your pull request.
3. **Review the plan**, not just the code. This matters more than it sounds. A one-line code change, like renaming a database, can mean "destroy the database and create a new, empty one." The diff looks harmless; the plan shows `destroy` in red. Always scan for `destroy` and `replace` on anything that holds data.
4. **Apply from CI** after merge, using the plan that was reviewed.

## State: the part to protect

State deserves special care, for three reasons.

**It must be shared.** If two people each keep state on their laptops, each one's inventory is missing the other's changes. Their applies can overwrite or duplicate each other's work. Keep state remotely, for example in an S3 bucket, with **locking** so only one apply runs at a time.

**It can contain secrets.** When a tool creates a database with a generated password, that password can be written into state [in plain text](https://developer.hashicorp.com/terraform/language/state/sensitive-data). So state needs encryption and tight access control, even when your code contains no secrets at all.

**Never edit it by hand.** Use the tool's state commands. Hand edits are how inventories end up wrong.

## Modern patterns

**Apply only from CI.** Applying from a laptop means unreviewed changes, made with whatever credentials that laptop happens to hold. Merging to main should be what triggers an apply.

**OIDC instead of stored keys.** The old way: create an AWS access key and store it as a CI secret. It never expires, so if it leaks, it's valid until someone notices. The modern way is OIDC federation: on each run, CI proves its identity to AWS and receives temporary credentials for one narrowly scoped role. There's no permanent key to leak. ([GitHub's guide for AWS](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services))

**One AWS account per environment.** Running staging and production in one account means a staging mistake can touch production. Separate accounts create a hard wall between them. ([AWS guidance](https://docs.aws.amazon.com/whitepapers/latest/organizing-your-aws-environment/organizing-your-aws-environment.html))

**Same modules, different inputs.** Staging and production should use the same modules with different variables, like a smaller database for staging. Then staging is a real rehearsal for production, not a hand-made approximation.

**Policy as code.** Automate the reviewer's checklist. Tools like [Open Policy Agent](https://www.openpolicyagent.org/docs/latest/) and [Checkov](https://www.checkov.io/) read the plan and fail the build on rules like "no public buckets" or "databases must be encrypted." Humans miss things in long plans; policy checks don't get tired.

**Scheduled drift detection.** Run a plan every night. If it's ever not empty, someone changed something by hand, and you want to know.

**Immutable infrastructure.** Instead of logging into a server to patch it, build a new image and replace the server. You already learned this habit with containers: rebuild and replace, never hand-edit.

**Ephemeral preview environments.** For bigger changes, spin up a short-lived environment for the branch, test it, and destroy it when the pull request closes.

## Mistakes to avoid

- **ClickOps in production.** Every console change is unreviewed, unrecorded drift.
- **Applying from a laptop.** No review, no log, and personal credentials.
- **Long-lived access keys in CI.** Switch to OIDC.
- **Secrets in committed variable files.** Reference a secrets manager instead.
- **One giant state for everything.** Every apply puts everything at risk. Split state by lifecycle: network, data, services.
- **Copy-pasted environments.** They drift apart until staging no longer predicts production.

## Let's build it

We'll build one small but real piece: a private S3 bucket for documents.

**Step 1: describe the bucket and block public access.**

```hcl
resource "aws_s3_bucket" "documents" {
  bucket = "lumen-documents-staging"
}

resource "aws_s3_bucket_public_access_block" "documents" {
  bucket                  = aws_s3_bucket.documents.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

Notice `aws_s3_bucket.documents.id`: the second resource refers to the first. The tool reads that reference, understands the ordering, and creates the bucket first. You never write "step 1, step 2."

**Step 2: keep state remotely.**

```hcl
terraform {
  backend "s3" {
    bucket  = "lumen-terraform-state"
    key     = "staging/storage.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}
```

Enable locking for the backend so two applies can't overlap. The `key` puts this state under `staging/`; production gets its own state, ideally in its own account.

**Step 3: plan and read it.** Run `terraform plan`. You should see two resources to create and nothing to change or destroy. Read it the way a reviewer would.

**Step 4: see drift for yourself.** After applying, open the AWS console and change one public-access setting by hand. Run `plan` again. The tool reports the difference and offers to put it back. That moment is the whole value of IaC in one screen.

**Pause and check:** a teammate's pull request changes one line, and the plan shows `-/+ destroy and then create replacement` for your production database. What do you do? (Stop. Don't merge. That plan would delete the database and create an empty one. Find out why the change forces a replacement, and find a safe path, such as a migration or a different setting.)

## What stays out of IaC

- **Secret values themselves.** IaC references them in a secrets manager.
- **Application data.** IaC creates the database, not the rows.
- **One-off experiments.** Use a sandbox account and delete it afterward.

## Your turn

In a sandbox AWS account (never production):

1. Write IaC for a private S3 bucket with public access blocked, encryption and a lifecycle rule.
2. Configure remote state with locking.
3. Plan, read the plan, then apply.
4. Change a setting by hand in the console and confirm the next plan detects it.
5. Run `destroy` and confirm nothing remains.

**You're done when:** the bucket was created from code, your hand-made change showed up as drift, and cleanup was complete. **Stretch goal:** run the plan from GitHub Actions using OIDC, with no access key stored anywhere.

## Check your understanding

1. Why review the plan instead of only the code diff?
2. What goes wrong when two people apply with their own local state files?
3. Why is the state file sensitive even when the code contains no secrets?
4. What does OIDC federation replace, and why is that safer?
5. Someone opens a port on a security group by hand. How does IaC help?

## Answer key

1. The plan shows the real effect, including destroys and replacements that a small, innocent-looking diff can trigger.
2. Each person's inventory is missing the other's changes, so applies can overwrite or duplicate resources. Shared remote state with locking prevents it.
3. Tools record resource attributes in state, including generated values like database passwords, in plain text.
4. It replaces permanent access keys stored in CI with temporary credentials issued for each run. There's no long-lived key to leak, and each run gets only its role's permissions.
5. The next plan, or the nightly drift check, shows the difference. Applying puts the reviewed configuration back, and the conversation about whether the port should be open happens in a pull request.

## Recap

- IaC turns infrastructure into a reviewable, repeatable blueprint.
- Declarative: describe what should exist; the tool works out the steps.
- Plan → review the plan → apply from CI. Watch for `destroy`.
- Protect state: remote, locked, encrypted, never hand-edited.
- OIDC instead of stored keys, an account per environment, policy checks and drift detection.

That's the end of the core course. Go back to the [gap map](/guide/skills-gap-map) to pick your next skill, and add the exercises you haven't done yet to your [learning roadmap](/guide/learning-roadmap).

## Go deeper

- [Terraform: introduction](https://developer.hashicorp.com/terraform/intro)
- [OpenTofu documentation](https://opentofu.org/docs/)
