<!-- content/skills/infrastructure-as-code.md — Teach infrastructure as code concepts: declarative resources, state, plan and review. -->
---
title: "Infrastructure as code: reviewable, repeatable cloud resources"
slug: infrastructure-as-code
section: skills
summary: "Describe cloud resources in versioned files, review every plan, and apply from CI without long-lived keys."
order: 6
tags: [skills, infrastructure as code, iac, terraform, opentofu, cdk, cloudformation, aws, state, gitops, oidc, policy as code, concepts, education]
status: established-pattern
lastReviewed: "2026-10-20"
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
    - Separate environments so staging mistakes cannot reach production
---

## What am I learning?

Infrastructure as code (IaC) means describing servers, networks, databases and permissions in files, then letting a tool create or change them to match. Infrastructure gets the same treatment as application code: version control, review, repeatability and history.

Without it, a cloud account is configured by hand in a console ("ClickOps"). Nobody can review those changes, rebuild the environment, or see what changed before an outage. Lumen's [AWS design](/guide/lumen-aws-architecture) spans subnets, security groups, an ALB, EC2, RDS and S3 policies. That is too much to keep correct by hand.

## Core concepts

| Concept | What it means |
| --- | --- |
| Declarative | I describe the end state; the tool works out the steps |
| Provider | The plugin that talks to a cloud API, such as AWS |
| State | The tool's record mapping code to real resources |
| Plan | A preview of what will be created, changed or destroyed |
| Drift | Real infrastructure that no longer matches the code |
| Module | A reusable group of resources with inputs and outputs |

The main tools:

| Tool | Language | Notes |
| --- | --- | --- |
| [Terraform](https://developer.hashicorp.com/terraform/intro) | HCL | Most widely used; Business Source License since 2023 |
| [OpenTofu](https://opentofu.org/docs/) | HCL | Open-source fork under the Linux Foundation; largely compatible |
| AWS CloudFormation | YAML / JSON | AWS-native; AWS manages the state |
| [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/home.html) | TypeScript, Python, … | Real programming languages that generate CloudFormation |

The concepts carry over. Pick one per project and stay consistent.

## Modern patterns

| Pattern | Problem it solves | How |
| --- | --- | --- |
| **Plan in the pull request** | Infrastructure changes merged without anyone seeing their effect | CI posts the plan on every PR; reviewers approve the plan, not just the diff |
| **Apply only from CI** | Laptop applies with stale code and personal credentials | Merging to main triggers the apply of the reviewed plan |
| **OIDC federation for CI** | Long-lived cloud keys stored as CI secrets can leak | CI exchanges a short-lived identity token for a scoped role ([GitHub OIDC with AWS](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)) |
| **Remote, locked, encrypted state** | Lost state, concurrent applies, leaked secrets | An S3 backend with locking, encryption and narrow access |
| **Account per environment** | A staging mistake destroys production | Separate AWS accounts for staging and production ([AWS guidance](https://docs.aws.amazon.com/whitepapers/latest/organizing-your-aws-environment/organizing-your-aws-environment.html)) |
| **Versioned modules** | Copy-pasted resources drift between environments | One module, pinned versions, different inputs per environment |
| **Policy as code** | Unsafe settings, such as public buckets, pass review | Automated checks on the plan with [Open Policy Agent](https://www.openpolicyagent.org/docs/latest/) or [Checkov](https://www.checkov.io/) |
| **Scheduled drift detection** | Manual console changes go unnoticed | A nightly plan that alerts when it isn't empty |
| **Immutable infrastructure** | Hand-patched servers become unique and unrebuildable | Replace servers from a new image instead of changing them in place |
| **Ephemeral preview environments** | Testing infrastructure changes only in shared staging | Short-lived environments per branch, destroyed after merge |

## Anti-patterns to avoid

- **ClickOps in production.** Every console change is invisible to review and is drift.
- **Applying from a laptop.** Unreviewed, unlogged, and with whatever credentials that laptop has.
- **Long-lived access keys in CI.** Use OIDC.
- **Secrets in `.tfvars` committed to Git.** Reference a secrets manager.
- **One giant state for everything.** Every apply risks everything; split by lifecycle and blast radius.
- **Editing state by hand.** Use the tool's state commands.
- **Copy-pasted environments.** Staging stops rehearsing production.

## Build it step by step

**Step 1: describe a resource declaratively.**

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

If the bucket exists and matches, nothing happens. If someone made it public by hand, the next plan shows the drift.

**Step 2: configure remote state.**

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

Enable locking for the backend so two applies can't run at once. State can contain [sensitive values in plain text](https://developer.hashicorp.com/terraform/language/state/sensitive-data), such as generated passwords, so restrict who can read it.

**Step 3: plan, review, apply.**

1. Change the files on a branch.
2. CI runs `terraform plan` and posts the result on the pull request.
3. A reviewer reads the plan, watching especially for `destroy` and `replace` on stateful resources such as databases.
4. After merge, CI applies the reviewed plan using an OIDC role.

This is the same evidence-then-release flow as the [CI/CD release workflow](/guide/ci-cd-release-workflow).

**Step 4: add a policy check.** Run a policy tool against the plan in CI and fail the build on rules such as "no public S3 buckets" or "databases must be encrypted."

Checkpoint: a pull request shows the plan, and no AWS access key exists in CI secrets.

## What stays out of IaC

- Secret values themselves. Reference them from a secrets manager.
- Application data. IaC creates the database, not the rows.
- One-off experiments. Use a sandbox account and delete it.

## Exercise

In a sandbox AWS account:

1. Write IaC for a private S3 bucket with public access blocked, encryption and a lifecycle rule.
2. Store state remotely with locking.
3. Plan and apply.
4. Change a setting by hand in the console and confirm the next plan detects it.
5. Run `destroy` and confirm nothing remains.

**Done means:** the bucket is created from code, drift shows up in the plan, and cleanup is complete. Stretch goal: run the plan from GitHub Actions with OIDC.

## Check your understanding

- Why review the plan instead of only the code diff?
- What goes wrong when two people apply with local state files?
- Why is the state file sensitive even when no secrets appear in the code?
- What does OIDC federation replace, and why is that safer?
- How does IaC help after someone changes a security group by hand?

## Answer key

The plan shows the real effect, including destroys and replacements the diff doesn't make obvious. Each person's state misses the other's changes, so applies can overwrite or duplicate resources; remote locked state prevents it. Providers write resource attributes, including generated passwords, into state. It replaces long-lived access keys stored in CI with short-lived credentials issued per run, so there is no permanent key to leak. The next plan reports the drift, and applying restores the reviewed configuration.

## Go deeper

- [Terraform: introduction](https://developer.hashicorp.com/terraform/intro)
- [OpenTofu documentation](https://opentofu.org/docs/)
