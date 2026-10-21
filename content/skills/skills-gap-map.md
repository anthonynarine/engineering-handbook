<!-- content/skills/skills-gap-map.md — Map the engineering skills the handbook does not yet teach, in learning order. -->
---
title: "Skills needed: the engineering gap map"
slug: skills-gap-map
section: skills
summary: "The infrastructure and platform skills underneath my apps, ranked by where they show up in real projects."
order: 1
tags: [skills, learning, gaps, containers, networking, load balancer, database, caching, infrastructure as code]
status: established-pattern
lastReviewed: "2026-10-20"
sources: [reference_sources/skills-gap-review.md]
related: [learning-roadmap, deployment-platforms, lumen-aws-architecture, containers-fundamentals, networking-and-load-balancers]
---

## What am I learning?

My handbook is strong on application code: Django services and selectors, React data flow, authentication, tenant isolation, CI/CD, Foundry and observability. It is thin on the layer underneath, meaning the machines, networks and data systems my code runs on.

That gap stays hidden on Heroku and Netlify, because the platform handles it. It becomes visible as soon as a project leaves the platform. Lumen's AWS design assumes I can reason about an ALB, private subnets, RDS and a worker tier. This section is the list of what to learn, and why, in order.

## The map

| Priority | Skill | Why I need it | Where it shows up | Lesson |
| --- | --- | --- | --- | --- |
| 1 | Containers | The unit of packaging and deployment almost everywhere off-platform | Lumen on AWS, local dev parity, CI builds | [Containers](/guide/containers-fundamentals) |
| 2 | Networking and load balancers | Every request crosses DNS, TLS and a proxy before Django sees it | Lumen's ALB, Heroku's router, WebSockets for Channels | [Networking and load balancers](/guide/networking-and-load-balancers) |
| 3 | PostgreSQL performance | Slow pages and connection errors are usually database problems | Moneta dashboards, EstateIQ ledgers, every Heroku app | [PostgreSQL performance](/guide/postgres-performance) |
| 4 | Caching and rate limiting | Speed without leaking tenant data; protection without false security | Redis tier in Lumen, login endpoints, AI calls | [Caching and rate limiting](/guide/caching-and-rate-limiting) |
| 5 | Infrastructure as code | Cloud resources clicked by hand cannot be reviewed, repeated or recovered | Lumen's AWS topology | [Infrastructure as code](/guide/infrastructure-as-code) |
| 6 | Linux and the shell | Debugging a server means processes, files, permissions and logs | EC2 hosts, containers, CI runners | Not yet written |
| 7 | Performance and load testing | Knowing capacity before users find the limit | Any launch, AI features | Not yet written |
| 8 | Web performance and accessibility | Core Web Vitals and WCAG decide whether real users can use the frontend | Every React app | Not yet written |
| 9 | Software supply chain | Dependencies and images are code I did not write but still ship | npm, pip, base images, CI | Not yet written |
| 10 | Data privacy and retention | Health and financial data carry obligations beyond security | Lumen (clinical), Moneta (financial) | Not yet written |

The order follows dependency. Containers come first because load balancers route to them, IaC provisions them, and supply-chain checks scan them. Database performance comes before caching because a cache that hides a slow query only postpones the problem.

## How each lesson works

Every lesson follows the same structure, so I always know where I am:

| Part | What it gives me |
| --- | --- |
| Lesson card | Level, time, prerequisites, and what I'll be able to do afterward |
| Core concepts | The vocabulary, in one table |
| Modern patterns | Current practice: the problem each pattern solves and when to use it |
| Anti-patterns | Common mistakes and why they hurt |
| Build it step by step | A worked example on my own stack, with a checkpoint |
| Exercise | A task on a real project, with a clear "done means" |
| Check your understanding | Questions to answer before reading the answer key |
| Go deeper | Official documentation for the next level |

## How to use this section

1. Read one lesson and answer its self-check without looking.
2. Do its exercise against a real project: Moneta, EstateIQ or a throwaway repo.
3. Add the skill to my [learning roadmap](/guide/learning-roadmap) with the exercise as the success criterion.
4. When a "Not yet written" skill becomes urgent, write its lesson here.

## What this section is not

These lessons teach concepts with official sources. They are not claims that I have deployed ECS, Terraform or Redis in production. [Deployment platforms](/guide/deployment-platforms) records what I have actually run.

## Check your understanding

- Why does this gap stay invisible while I deploy to Heroku and Netlify?
- Why learn containers before infrastructure as code?
- What is wrong with caching a slow query instead of fixing it?

## Answer key

The platform runs the containers, router, TLS and database operations for me, so I never touch them. Infrastructure as code mostly provisions things that run containers and route traffic to them, so it makes sense only once those parts are understood. A cache hides the slow query until the cache misses, expires or is wrong, and then the original problem returns under load.
