<!-- content/skills/skills-gap-map.md — Map the engineering skills the handbook does not yet teach, in learning order. -->
---
title: "Skills needed: the engineering gap map"
slug: skills-gap-map
section: skills
summary: "The infrastructure skills underneath your apps, what each one unlocks, and the order to learn them in."
order: 1
tags: [skills, learning, gaps, course, containers, networking, load balancer, database, caching, infrastructure as code]
status: established-pattern
lastReviewed: "2026-10-21"
sources: [reference_sources/skills-gap-review.md]
related: [learning-roadmap, deployment-platforms, lumen-aws-architecture, containers-fundamentals, networking-and-load-balancers]
---

## Start here

You already know a lot. You can design Django services and selectors, wire React to an API, keep one tenant's data away from another's, ship through CI/CD and run work through Foundry. That's the application layer, and it's the part most tutorials teach.

This course is about the layer underneath: the machines, networks and data systems your code runs on. You've had little reason to learn it so far, because Heroku and Netlify do that work for you. When you push to Heroku, it builds a container, puts a router in front of it, handles HTTPS and runs PostgreSQL for you. You never see any of it.

That changes the moment a project leaves the platform. Lumen's AWS design is that moment: an Application Load Balancer, private subnets, RDS and a worker tier all become your job. This course gets you ready for it, one skill at a time.

## The map

Here's every gap, in the order to learn them. The first five have full lessons.

| # | Skill | What it unlocks for you | Where you'll use it | Lesson |
| --- | --- | --- | --- | --- |
| 1 | Containers | Packaging your app so it runs the same everywhere | Lumen on AWS, local dev, CI builds | [Start lesson 1](/guide/containers-fundamentals) |
| 2 | Networking and load balancers | Understanding every hop a request takes before Django sees it | Lumen's ALB, Heroku's router, Channels WebSockets | [Start lesson 2](/guide/networking-and-load-balancers) |
| 3 | PostgreSQL performance | Fixing slow pages at the source | Moneta dashboards, EstateIQ ledgers | [Start lesson 3](/guide/postgres-performance) |
| 4 | Caching and rate limiting | Speed without leaking data, and protection without false confidence | Lumen's Redis tier, login endpoints, AI calls | [Start lesson 4](/guide/caching-and-rate-limiting) |
| 5 | Infrastructure as code | Cloud setups you can review, repeat and rebuild | Lumen's AWS topology | [Start lesson 5](/guide/infrastructure-as-code) |
| 6 | Linux and the shell | Debugging a server: processes, files, permissions, logs | EC2 hosts, containers, CI runners | Coming later |
| 7 | Performance and load testing | Knowing your limits before users find them | Launches, AI features | Coming later |
| 8 | Web performance and accessibility | A frontend that's fast and usable by everyone | Every React app | Coming later |
| 9 | Software supply chain | Trusting the code you didn't write but still ship | npm, pip, base images | Coming later |
| 10 | Data privacy and retention | Meeting the obligations that come with health and financial data | Lumen, Moneta | Coming later |

## Why this order

Each skill leans on the one before it. Containers come first because almost everything else touches them: load balancers send traffic to containers, infrastructure code creates the places containers run, and supply-chain checks scan container images.

Database performance comes before caching for a simple reason. A cache placed over a slow query doesn't fix the query. It hides the problem until the cache misses, and then the slowness comes back under load. You want to be able to fix the query first, and add the cache only when you actually need it.

## How each lesson works

Every lesson follows the same rhythm, so you always know where you are:

| Part | What happens there |
| --- | --- |
| Lesson card | Level, time, what you'll be able to do, and what's helpful to read first |
| Why this matters | The problem this skill solves, in your own projects |
| The big idea | The core concepts, explained with an everyday picture first |
| Modern patterns | How teams solve these problems today, one problem at a time |
| Mistakes to avoid | The traps people fall into, and why they hurt |
| Let's build it | A worked example on your stack, with pause-and-check moments |
| Your turn | An exercise on a real project, with a clear finish line |
| Check your understanding | Questions to answer before peeking, with explained answers |
| Recap | The few ideas worth remembering |

## How to get the most from it

Don't just read. For each lesson:

1. Read it through once without worrying about the details.
2. Answer the self-check questions out loud, or in writing, before opening the answer key. Getting one wrong is useful: it shows you exactly what to reread.
3. Do the exercise on Moneta, EstateIQ or a throwaway repo. Skills stick when you've broken something and fixed it.
4. Add the skill to your [learning roadmap](/guide/learning-roadmap), using the exercise's finish line as your success criterion.

A note on honesty: these lessons teach concepts with official sources. Finishing one doesn't mean you've run that technology in production. [Deployment platforms](/guide/deployment-platforms) keeps the record of what you've actually deployed.
