<!-- Delivery entry point linking the existing verification and release material. -->
---
title: "CI/CD: checks, review, release"
slug: ci-cd-release-workflow
section: deployment
summary: "Find the checks, approval, deployment and recovery steps without confusing a green build with a live release."
order: 125
tags: [ci, cd, pipeline, github actions, release, deploy, netlify, heroku]
status: established-pattern
lastReviewed: "2026-10-15"
sources: [docs/deployment.md, .github/workflows/verify.yml, scripts/prepare-release.mjs, scripts/deploy-release.mjs]
related: [foundry-review-release, testing-strategy, heroku-django-deployment, operational-runbooks]
---

## Choose the step you need

Continuous integration checks a change. Delivery prepares a candidate for release. Deployment publishes it. Your project decides which steps are automated and where an owner must approve. Use this page as the map to the existing guides.

| Question | Open |
| --- | --- |
| How do I submit a reviewed change? | [Git branches and pull requests](/guide/git-basics) |
| Which tests should block release? | [Testing strategy](/guide/testing-strategy) |
| How does Foundry handle candidate evidence and authority? | [Foundry review and release](/guide/foundry-review-release) |
| How do I deploy a Django API? | [Heroku deployment](/guide/heroku-django-deployment) |
| What do I check after deployment? | [Heroku operations](/guide/heroku-operations) |
| How do I recover when something fails? | [Operational runbooks](/guide/operational-runbooks) |

## This handbook's release path

The repository contains a GitHub Actions verification workflow for pushes, pull requests, manual runs and a weekly schedule. It checks the candidate without deployment credentials. Remote CI only runs once that workflow is published to GitHub; a local workflow file is not evidence of a remote run.

The manual publication process used for this handbook is:

```sh
npm run release:prepare
npm run release:deploy
```

Preparation requires committed, clean source, audits dependencies, builds and scans the public artifact, runs browser/security checks, and records the revision and artifact digest. Deployment refuses changed source or build files. After Netlify publishes, the checker verifies the live revision, configured headers, representative routes and local assets. A failed live check reports failure after publication; it does not automatically roll back.

## Apply the pattern to your application

Agree on required checks before merging. Keep deployment credentials out of untrusted pull-request jobs. Promote the reviewed revision, account for migrations and background processes, then verify the running application. Record the candidate, executed checks, release decision and recovery route.

Foundry coordinates build evidence; your hosting platform runs the deployed application. See [the platform map](/guide/deployment-platforms) for that boundary. A green build alone does not establish database compatibility, tenant isolation or a successful production release.
