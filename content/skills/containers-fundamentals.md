<!-- content/skills/containers-fundamentals.md — Teach container images, Dockerfiles and Compose for a Django and React stack. -->
---
title: "Containers: images, Dockerfiles, and Compose"
slug: containers-fundamentals
section: skills
summary: "Package a Django app the way most platforms run it, and know what a container does and does not isolate."
order: 2
tags: [skills, containers, docker, dockerfile, compose, oci, images, concepts, education]
status: established-pattern
lastReviewed: "2026-10-20"
sources: [reference_sources/skills-gap-review.md]
related: [skills-gap-map, networking-and-load-balancers, deployment-platforms, heroku-django-deployment, lumen-aws-architecture]
---

## What am I learning?

A **container image** is a packaged filesystem plus metadata: my code, the Python runtime, system libraries and the command to start. A **container** is a running process started from that image, with its own view of the filesystem, network and process list. Images follow the [Open Container Initiative](https://opencontainers.org/) format, so one image built with Docker can run on Heroku, AWS ECS, Kubernetes or a laptop.

The point is that I ship the environment, not just the code. "Works on my machine" becomes "works in this image," and the image is the thing that gets tested and deployed.

## Image versus container

| Concept | Analogy | Lifetime | Example |
| --- | --- | --- | --- |
| Dockerfile | Recipe | Lives in Git | `FROM python:3.12-slim` … |
| Image | Built, immutable package | Stored in a registry, tagged by version | `moneta-api:2f3dec3` |
| Container | A running instance | Starts and stops; disposable | One web process serving requests |

A container's filesystem is temporary. Anything written inside it disappears when it is replaced. That's the same rule as a Heroku dyno: durable data goes in PostgreSQL or S3, never in the container.

## A Dockerfile for Django

```dockerfile
# Build stage: install dependencies with build tools available
FROM python:3.12-slim AS build
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Runtime stage: only what the app needs to run
FROM python:3.12-slim
WORKDIR /app
COPY --from=build /install /usr/local
COPY . .
RUN useradd --create-home appuser
USER appuser
EXPOSE 8000
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

What each choice does:

- **Multi-stage build.** Build tools stay in the first stage, so the final image is smaller and has less to attack. See [multi-stage builds](https://docs.docker.com/build/building/multi-stage/).
- **Copy requirements before code.** Each instruction is a cached layer. Code changes often and dependencies rarely, so this order keeps rebuilds fast.
- **Non-root user.** If the app is compromised, the attacker is not root inside the container.
- **A `.dockerignore` file.** Keep `.git`, `node_modules`, `.env` and local databases out of the image. A secret copied into a layer stays in the image history even if a later layer deletes it.
- **Pin base images.** `python:3.12-slim` changes over time. Pin a version, rebuild on purpose, and scan the result.

Docker's [build best practices](https://docs.docker.com/build/building/best-practices/) cover these in more depth.

## Configuration and secrets

Build one image and run it in every environment. Environment differences come from environment variables at runtime, not from different images. Never bake secrets into the image. Inject them at runtime from the platform's secret store: Heroku config vars, AWS Secrets Manager or Parameter Store.

## Compose for local development

[Docker Compose](https://docs.docker.com/compose/) runs several containers together from one file. That gives me Django, PostgreSQL and Redis locally, matching production versions:

```yaml
services:
  api:
    build: .
    ports: ["8000:8000"]
    env_file: .env
    depends_on: [db]
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: local-only
    volumes: [pgdata:/var/lib/postgresql/data]
volumes:
  pgdata:
```

The named volume keeps database data across restarts. Compose is a local and test tool. Production orchestration comes from the platform.

## Where containers run

| Platform | How containers show up |
| --- | --- |
| Heroku | Dynos are containers. Buildpacks build the image for me, or I can push my own image through the [Container Registry](https://devcenter.heroku.com/articles/container-registry-and-runtime). |
| AWS ECS / Fargate | I supply the image. ECS schedules containers; Fargate removes the servers I would otherwise manage. |
| AWS EC2 | I install and run a container runtime myself, as one option for Lumen's service instances. |
| Kubernetes | A full orchestrator. Powerful, and usually more than a small team needs. |

## What a container does not do

- It is not a security boundary as strong as a virtual machine. Containers share the host kernel.
- It does not make the app stateless. That is a design choice I still have to make.
- It does not patch itself. Base images need rebuilding when vulnerabilities are fixed.

## Exercise

Containerize one existing Django app. Write the Dockerfile above, add `.dockerignore`, and run it with Compose against PostgreSQL. Done means: `docker compose up` serves the health endpoint, the container runs as a non-root user, and `docker history` shows no secrets.

## Check your understanding

- What is the difference between an image and a container?
- Why copy `requirements.txt` before the rest of the code?
- If a later Dockerfile step deletes a secret file, is the image safe?
- Where should uploaded files go when the app runs in a container?

## Answer key

An image is the immutable package; a container is a running instance of it. Copying requirements first keeps the slow dependency-install layer cached when only code changes. No: the secret remains in the earlier layer and in the image history. Uploaded files go to durable storage such as S3, because the container's filesystem is discarded when it is replaced.
