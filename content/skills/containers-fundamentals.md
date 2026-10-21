<!-- content/skills/containers-fundamentals.md — Teach container images, Dockerfiles and Compose for a Django and React stack. -->
---
title: "Containers: images, Dockerfiles, and Compose"
slug: containers-fundamentals
section: skills
summary: "Package a Django app the way modern platforms run it: small, non-root, built once and promoted unchanged."
order: 2
tags: [skills, containers, docker, dockerfile, compose, oci, images, buildkit, sbom, concepts, education]
status: established-pattern
lastReviewed: "2026-10-20"
sources: [reference_sources/skills-gap-review.md]
related: [skills-gap-map, networking-and-load-balancers, deployment-platforms, heroku-django-deployment, lumen-aws-architecture]
lesson:
  level: Foundation
  duration: 60 minutes
  prerequisites: [deployment-platforms]
  objectives:
    - Explain the difference between an image, a container and a registry
    - Write a multi-stage, non-root Dockerfile for a Django app
    - Run Django and PostgreSQL together locally with Compose
    - Build one image per commit and promote it unchanged from staging to production
---

## What am I learning?

A **container image** is a packaged filesystem plus metadata: my code, the Python runtime, system libraries and the start command. A **container** is a running process started from that image, with its own view of the filesystem, network and process list. Images follow the [Open Container Initiative](https://opencontainers.org/) standard, so one image runs on Heroku, AWS ECS, Kubernetes or a laptop.

The point: I ship the environment, not just the code. "Works on my machine" becomes "works in this image," and that exact image is what gets tested and deployed.

## Core concepts

| Concept | What it is | Lifetime | Example |
| --- | --- | --- | --- |
| Dockerfile | The build recipe | Versioned in Git | `FROM python:3.12-slim` … |
| Layer | One cached build step | Reused until its inputs change | The `pip install` step |
| Image | The immutable built package | Stored in a registry, tagged | `moneta-api:2f3dec3` |
| Registry | Where images are stored and pulled from | Long-lived | Docker Hub, Amazon ECR, Heroku |
| Container | A running instance of an image | Disposable | One web process |
| Volume | Storage that outlives a container | Managed separately | Local PostgreSQL data |

A container's own filesystem is temporary. Anything written inside it disappears when it's replaced, just like a Heroku dyno. Durable data goes in PostgreSQL or S3.

## Modern patterns

| Pattern | Problem it solves | Use it when |
| --- | --- | --- |
| **Multi-stage builds** | Build tools bloat the runtime image and widen the attack surface | Always, for compiled dependencies or frontend builds |
| **Slim or distroless base images** | Fewer packages mean fewer vulnerabilities to patch | Always prefer `-slim`; consider [distroless](https://github.com/GoogleContainerTools/distroless) once the app is stable |
| **BuildKit cache mounts** | Reinstalling every dependency on each build is slow | Any build that downloads packages ([cache docs](https://docs.docker.com/build/cache/optimize/)) |
| **Build secrets** | Secrets passed with `ARG` or `COPY` stay in image history | A private package index or token is needed during the build ([build secrets](https://docs.docker.com/build/building/secrets/)) |
| **Non-root user** | A compromised app gets root inside the container | Always |
| **Build once, deploy many** | Rebuilding per environment means production runs an untested image | Every pipeline: tag by commit SHA and promote the same digest |
| **Config from the environment** | Environment-specific images drift apart | Always; the [Twelve-Factor App](https://12factor.net/config) pattern |
| **SBOM and provenance attestations** | No record of what is inside an image or how it was built | Anything shipped to production ([attestations](https://docs.docker.com/build/metadata/attestations/)) |
| **One process per container** | Mixed processes are hard to scale, restart and observe | Separate web, worker and scheduler containers from the same image |
| **Dev containers** | Every laptop has a slightly different toolchain | Teams or multi-machine work ([containers.dev](https://containers.dev/)) |

## Anti-patterns to avoid

- **Deploying `:latest`.** It is a moving pointer, so I can't tell what is running or roll back to it. Deploy by commit SHA or digest.
- **Secrets in the image.** A secret deleted in a later layer still exists in the earlier one.
- **Running as root.** It turns an app bug into control of the container.
- **One image per environment.** Staging tests a different artifact than production runs.
- **State inside the container.** Uploads and sessions on local disk vanish on redeploy.
- **Never rebuilding.** Base images receive security fixes only if I rebuild on them.

## Build it step by step

**Step 1: keep the build context clean.** Create `.dockerignore`:

```text
.git
.env
node_modules
__pycache__
*.sqlite3
```

**Step 2: write a multi-stage Dockerfile.**

```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.12-slim AS build
WORKDIR /app
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --prefix=/install -r requirements.txt

FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY --from=build /install /usr/local
COPY . .
RUN useradd --create-home --uid 10001 appuser
USER appuser
EXPOSE 8000
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

Requirements are copied before the code because dependencies change rarely. That keeps the slow install layer cached when only code changes.

**Step 3: run the stack locally with Compose.** [Docker Compose](https://docs.docker.com/compose/) starts several containers from one file:

```yaml
services:
  api:
    build: .
    ports: ["8000:8000"]
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: local-only
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
    volumes: [pgdata:/var/lib/postgresql/data]
volumes:
  pgdata:
```

The health condition makes the API wait until PostgreSQL accepts connections, not just until its container starts.

**Step 4: tag by commit and attach build metadata.**

```text
docker buildx build \
  --tag registry.example.com/moneta-api:$(git rev-parse --short HEAD) \
  --sbom=true --provenance=mode=max --push .
```

Checkpoint: `docker run --rm <image> whoami` prints `appuser`, and `docker history <image>` shows no secrets.

## Where containers run

| Platform | How containers show up |
| --- | --- |
| Heroku | Dynos are containers. Buildpacks build the image, or I push my own through the [Container Registry](https://devcenter.heroku.com/articles/container-registry-and-runtime). |
| AWS ECS on Fargate | I supply the image; AWS schedules containers without servers for me to manage. |
| AWS EC2 | I run a container runtime myself, as one option for Lumen's service instances. |
| Kubernetes | A full orchestrator. Powerful, and usually more than a small team needs. |

Containers share the host's kernel, so they are a weaker isolation boundary than virtual machines. Treat them as packaging, not as a security sandbox.

## Exercise

Containerize one existing Django app.

1. Add `.dockerignore` and the Dockerfile above, adjusted for the project.
2. Add the Compose file and run `docker compose up`.
3. Confirm the health endpoint responds and the container runs as `appuser`.
4. Build with a commit-SHA tag and an SBOM.

**Done means:** the app serves from Compose, runs as non-root, the image tag matches a commit, and `docker history` shows no secrets.

## Check your understanding

- What is the difference between an image and a container?
- Why copy `requirements.txt` before the rest of the code?
- If a later Dockerfile step deletes a secret file, is the image safe?
- Why promote one image from staging to production instead of rebuilding?
- Where should uploaded files go when the app runs in a container?

## Answer key

An image is the immutable package; a container is a running instance of it. Copying requirements first keeps the slow dependency layer cached when only code changes. No: the secret remains in the earlier layer and the image history; use build secrets instead. Rebuilding can produce a different artifact, so production would run something staging never tested. Uploads go to durable storage such as S3, because the container's filesystem is discarded when it's replaced.

## Go deeper

- [Docker build best practices](https://docs.docker.com/build/building/best-practices/)
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Open Container Initiative](https://opencontainers.org/)
