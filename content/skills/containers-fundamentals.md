<!-- content/skills/containers-fundamentals.md — Teach container images, Dockerfiles and Compose for a Django and React stack. -->
---
title: "Containers: images, Dockerfiles, and Compose"
slug: containers-fundamentals
section: skills
summary: "Learn what a container really is, then package a Django app the way modern platforms run it."
order: 2
tags: [skills, containers, docker, dockerfile, compose, oci, images, buildkit, sbom, concepts, education]
status: established-pattern
lastReviewed: "2026-10-21"
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
    - Build one image per commit and promote it unchanged to production
---

## Why this matters

You've probably hit this before: code works on your laptop and breaks on the server. Usually it isn't the code. It's everything around it: a different Python version, a missing system library, an environment variable that exists in one place and not the other.

Containers fix that by changing what you ship. Instead of shipping your code and hoping the server matches your laptop, you ship your code *together with* its environment. Whatever runs in testing is exactly what runs in production.

You've actually been using containers all along: every Heroku dyno is one. Heroku just builds it for you. In this lesson, you'll learn to build it yourself, which is what you'll need for Lumen on AWS.

## The big idea

Picture the shipping container. Before it existed, every cargo ship loaded goods differently: sacks, barrels, crates of every size. Then everyone agreed on one standard steel box. Any ship, crane or truck in the world could now move any box without caring what was inside.

Software containers work the same way. There's a standard format, defined by the [Open Container Initiative](https://opencontainers.org/), and any platform that understands it can run your app: Heroku, AWS ECS, Kubernetes or your laptop.

There are four words to learn, and it helps to see them as a kitchen:

- A **Dockerfile** is the **recipe**. It lists the steps: start with Python, install these packages, copy in the code, run this command.
- An **image** is the **sealed meal** you get from following the recipe. It's frozen: once built, it never changes. You label it with a version, like `moneta-api:2f3dec3`.
- A **registry** is the **freezer** where images are stored until they're needed. Docker Hub, Amazon ECR and Heroku all run registries.
- A **container** is the **meal being served**: a running copy of the image. You can serve many copies of the same meal at once, and throw any one away and start another.

One consequence trips everyone up at first: **anything a container writes to its own disk disappears when the container is replaced.** That's not a bug. It's what makes containers disposable and easy to replace. It's also exactly why your Heroku apps already keep uploaded files in S3 and data in PostgreSQL, never on the dyno's disk.

**Pause and check:** if you deploy a new version and the old containers are replaced, what happens to a file the old container saved locally? (It's gone. That's why durable data always lives outside the container.)

## How images are built: layers

Each line in a Dockerfile creates a **layer**, a snapshot of what changed in that step. Docker caches layers. If nothing a step depends on has changed, Docker reuses the cached layer instead of running the step again.

That's why the order of lines matters so much. Say your Dockerfile copies all your code, then installs dependencies. Every time you change one line of code, the copy step changes, so every step after it runs again, including the slow dependency install. Flip the order (copy only `requirements.txt`, install, *then* copy the code) and code changes no longer trigger a reinstall. Builds go from minutes to seconds.

## Modern patterns

Here's how teams build images today. Each pattern exists because someone got burned without it.

**Multi-stage builds.** Installing some Python packages needs compilers and build tools, but running your app doesn't. A multi-stage build uses one stage to build and a second, clean stage to run, copying over only the results. Your final image is smaller and has fewer tools an attacker could use. ([Docker docs](https://docs.docker.com/build/building/multi-stage/))

**Slim base images.** Every package in your base image is something that might need a security patch. `python:3.12-slim` leaves out most of what you don't need. Once your app is stable, [distroless](https://github.com/GoogleContainerTools/distroless) images go further and remove even the shell.

**Cache mounts.** Even with good layer order, changing `requirements.txt` re-downloads every package. A BuildKit cache mount keeps pip's download cache between builds, so only new packages are fetched. ([Docker docs](https://docs.docker.com/build/cache/optimize/))

**Build secrets.** Sometimes a build needs a secret, like a token for a private package index. If you pass it as a build argument or copy it in, it stays inside the image's history forever, even if a later step deletes it. Build secrets are mounted for one step only and never saved into a layer. ([Docker docs](https://docs.docker.com/build/building/secrets/))

**Run as a non-root user.** By default, the process inside a container runs as root. If someone exploits a bug in your app, they'd have root inside the container. Creating a normal user and switching to it limits the damage.

**Build once, deploy many.** This one changes how you think about releases. Build the image *once* per commit, tag it with the commit SHA, test it in staging, and promote that *exact* image to production. Never rebuild for production, because a rebuild can produce something slightly different (a newer base image, a newer package) that staging never tested.

**Configuration from the environment.** Following the same logic, don't build a "staging image" and a "production image." Build one image, and give it different environment variables at runtime: database URL, API keys, debug flags. This is the [Twelve-Factor](https://12factor.net/config) approach, and Heroku config vars already work this way.

**One process per container.** Your web server, your Celery worker and your scheduler can all come from the same image, but run each as its own container. Then you can scale workers without scaling web servers, and restart one without touching the others.

**Know what's inside: SBOMs and provenance.** A software bill of materials (SBOM) lists every package in the image. A provenance record says how and where it was built. When the next big vulnerability is announced, you can answer "are we affected?" in minutes. ([Docker docs](https://docs.docker.com/build/metadata/attestations/))

## Mistakes to avoid

- **Deploying `:latest`.** The `latest` tag is just a label that moves every time you build. If production runs `latest`, you can't tell which code is running or roll back to it. Deploy by commit SHA.
- **Secrets in the image.** Deleting a secret in a later step doesn't remove it from earlier layers. Anyone with the image can dig it out.
- **Running as root.** It turns an ordinary app bug into control of the container.
- **A different image per environment.** Staging stops being a real test of production.
- **Saving state in the container.** Uploads and sessions vanish on the next deploy.
- **Never rebuilding.** Base images get security fixes only if you rebuild on top of them. Schedule regular rebuilds.

## Let's build it

We'll containerize a Django app step by step.

**Step 1: tell Docker what to ignore.** When you build, Docker sends your project folder to the builder. You don't want your Git history, local secrets or `node_modules` going along. Create a `.dockerignore` file:

```text
.git
.env
node_modules
__pycache__
*.sqlite3
```

That `.env` line matters most. Without it, your local secrets could end up inside the image.

**Step 2: write the Dockerfile.** Read the comments: each one explains a pattern from above.

```dockerfile
# syntax=docker/dockerfile:1

# Stage 1: install dependencies, with build tools available
FROM python:3.12-slim AS build
WORKDIR /app
# Copy only requirements first, so code changes don't trigger a reinstall
COPY requirements.txt .
# Keep pip's cache between builds
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --prefix=/install -r requirements.txt

# Stage 2: a clean runtime image
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
# Bring over the installed packages, not the build tools
COPY --from=build /install /usr/local
COPY . .
# Don't run as root
RUN useradd --create-home --uid 10001 appuser
USER appuser
EXPOSE 8000
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

`PYTHONUNBUFFERED=1` deserves a mention: it makes Python print logs immediately instead of holding them in a buffer, so your platform's log viewer shows them in real time.

**Pause and check:** which line would you move to make every code change trigger a full dependency reinstall? (Moving `COPY . .` above the `pip install` step. Don't.)

**Step 3: run the whole stack with Compose.** Your app needs PostgreSQL. [Docker Compose](https://docs.docker.com/compose/) starts several containers together from one file:

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

Two details are worth noticing. First, `condition: service_healthy` makes Django wait until PostgreSQL is actually accepting connections, not just until its container has started. That avoids the classic "connection refused" on first boot. Second, the named volume `pgdata` keeps your database data when containers are recreated. That's the "durable data lives outside the container" rule in action.

Run `docker compose up` and your app is running against a real PostgreSQL, the same major version as production.

**Step 4: tag by commit and record what's inside.**

```text
docker buildx build \
  --tag registry.example.com/moneta-api:$(git rev-parse --short HEAD) \
  --sbom=true --provenance=mode=max --push .
```

The tag ties the image to an exact commit. The SBOM and provenance flags attach the "what's inside, and how it was built" records.

**Checkpoint:** run `docker run --rm <your-image> whoami`. It should print `appuser`, not `root`. Then run `docker history <your-image>` and confirm no secrets appear in any step.

## Where your containers will run

| Platform | What it looks like |
| --- | --- |
| Heroku | Dynos are containers. Buildpacks build the image for you, or you push your own through the [Container Registry](https://devcenter.heroku.com/articles/container-registry-and-runtime). |
| AWS ECS on Fargate | You supply the image; AWS runs containers without you managing servers. |
| AWS EC2 | You install a container runtime on a virtual machine yourself. One option for Lumen. |
| Kubernetes | A full orchestrator. Powerful, and usually more than a small team needs. |

One honest limit: containers on the same machine share that machine's operating-system kernel. That makes them a weaker security boundary than separate virtual machines. Think of containers as excellent packaging, not as a sandbox for untrusted code.

## Your turn

Containerize one of your real Django apps.

1. Add `.dockerignore` and the Dockerfile, adjusting the WSGI path for your project.
2. Add the Compose file and run `docker compose up`.
3. Open your health endpoint and confirm it responds.
4. Confirm the container runs as `appuser`.
5. Build with a commit-SHA tag and an SBOM.

**You're done when:** the app serves through Compose, it runs as non-root, the image tag matches a commit, and `docker history` shows no secrets.

## Check your understanding

Try answering each one before you open the answer key.

1. What's the difference between an image and a container?
2. Why copy `requirements.txt` before the rest of the code?
3. A Dockerfile step deletes a secret file that an earlier step copied in. Is the image safe?
4. Why promote one image from staging to production instead of rebuilding?
5. Where should uploaded files go when your app runs in containers?

## Answer key

1. An image is the frozen, versioned package. A container is a running copy of it. One image can run as many containers at once.
2. Docker caches each step. Dependencies change rarely and code changes constantly, so copying requirements first keeps the slow install step cached when only code changes.
3. No. Each step is a saved layer, so the secret is still in the earlier layer and anyone with the image can extract it. Use build secrets, which are never saved into a layer.
4. A rebuild might pull a newer base image or package, producing something staging never tested. Promoting the same image means production runs exactly what you tested.
5. In durable storage outside the container, such as S3, with the reference saved in PostgreSQL. A container's own disk is thrown away when it's replaced.

## Recap

- You ship the environment with the code, so it runs the same everywhere.
- Recipe (Dockerfile) → sealed meal (image) → freezer (registry) → served meal (container).
- Containers are disposable: durable data lives outside them.
- Order Dockerfile steps from least to most frequently changed.
- Small, non-root, multi-stage images, built once per commit and promoted unchanged.

Next up: [Lesson 2, networking and load balancers](/guide/networking-and-load-balancers), where you'll follow a request all the way to one of these containers.

## Go deeper

- [Docker build best practices](https://docs.docker.com/build/building/best-practices/)
- [Docker Compose documentation](https://docs.docker.com/compose/)
