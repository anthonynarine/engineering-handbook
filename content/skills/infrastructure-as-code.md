<!-- content/skills/infrastructure-as-code.md — Teach infrastructure as code concepts: declarative resources, state, plan and review. -->
---
title: "Infrastructure as code: reviewable, repeatable cloud resources"
slug: infrastructure-as-code
section: skills
summary: "Describe cloud resources in versioned files, preview every change, and protect the state that tracks them."
order: 6
tags: [skills, infrastructure as code, iac, terraform, opentofu, cdk, cloudformation, aws, state, concepts, education]
status: established-pattern
lastReviewed: "2026-10-20"
sources: [reference_sources/skills-gap-review.md]
related: [skills-gap-map, lumen-aws-architecture, lumen-aws-release, ci-cd-release-workflow, containers-fundamentals]
---

## What am I learning?

Infrastructure as code (IaC) means describing servers, networks, databases and permissions in files, then letting a tool create or change them to match. It gives infrastructure the same treatment as application code: version control, review, repeatability and history.

Without it, a cloud account is configured by hand in a console. Nobody can review those changes, rebuild the environment reliably, or see what changed before an outage. Lumen's [AWS design](/guide/lumen-aws-architecture) spans subnets, security groups, an ALB, EC2, RDS and S3 policies. That is too much to keep correct by hand.

## Declarative, not step-by-step

I describe the end state, and the tool works out the steps:

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

If the bucket exists and matches, nothing happens. If someone made it public by hand, the next run reports the drift and fixes it.

## The main tools

| Tool | Language | Notes |
| --- | --- | --- |
| [Terraform](https://developer.hashicorp.com/terraform/intro) | HCL | Most widely used; many cloud providers. Business Source License since 2023. |
| [OpenTofu](https://opentofu.org/docs/) | HCL | Open-source fork of Terraform under the Linux Foundation; largely compatible. |
| AWS CloudFormation | YAML / JSON | AWS-native; state is managed by AWS. |
| [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/home.html) | TypeScript, Python, … | Real programming languages that generate CloudFormation. |

The concepts carry over between them. Pick one per project and stay consistent.

## Plan, review, apply

The core workflow:

1. **Change the files** on a branch.
2. **Plan.** `terraform plan` shows exactly what will be created, changed or destroyed.
3. **Review the plan** in the pull request, like a code diff. Watch for `destroy` and `replace` on stateful resources such as databases.
4. **Apply** the reviewed plan, ideally from CI, not from a laptop.

This fits the [CI/CD release workflow](/guide/ci-cd-release-workflow): the plan is evidence, and applying it is a release.

## State

Terraform and OpenTofu keep a **state file** that maps code to real resources. Treat it as critical and sensitive:

- **Store it remotely** (for example an S3 backend with locking), not on a laptop, so two people can't apply at once.
- **Protect it.** State can contain [sensitive values in plain text](https://developer.hashicorp.com/terraform/language/state/sensitive-data), such as generated database passwords. Restrict access and encrypt it.
- **Never edit it by hand.** Use the tool's state commands.

## Environments and modules

Use the same code for staging and production with different variables, so staging actually rehearses production. Group repeated patterns, like "a private service behind the ALB," into modules. Keep production in a separate state, and ideally a separate AWS account, so a mistake in staging cannot destroy production.

## What stays out of IaC

- Secret values themselves. Reference them from a secrets manager instead.
- Application data. IaC creates the database, not the rows.
- One-off experiments. Use a sandbox account and delete it.

## Exercise

Write IaC for one small, real piece: a private S3 bucket with public access blocked, encryption and a lifecycle rule. Run plan and apply in a sandbox account, change a setting by hand in the console, and confirm the next plan detects the drift. Done means: the bucket is created from code, the drift shows up in the plan, and `destroy` cleans up completely.

## Check your understanding

- Why review the plan instead of only the code diff?
- What can go wrong if two people run `apply` with local state files?
- Why is the state file sensitive even if no secrets appear in the code?
- How does IaC help after someone changes a security group by hand?

## Answer key

The plan shows the real effect, including destroys and replacements the code diff doesn't make obvious. Each person's state is out of date with the other's changes, so applies can overwrite or duplicate resources; remote state with locking prevents it. Providers write resource attributes, including generated passwords, into state. The next plan reports the drift, and applying restores the reviewed configuration.
