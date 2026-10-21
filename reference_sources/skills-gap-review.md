# Skills gap review — source notes

Recorded 2026-10-20 for the "Skills needed" section.

## How the gaps were found

The handbook's 103 guides were listed by section and checked for coverage of common full-stack engineering skills. Application code (Django, React), security, CI/CD, Foundry, observability and project designs were covered. Infrastructure topics appeared only in passing:

- Containers: mentioned in deployment-platforms and Lumen guides; no guide explains images, Dockerfiles or Compose.
- Load balancers and networking: troubleshoot-alb and lumen-aws-architecture assume ALB knowledge; DNS, TLS termination, L4 versus L7 and proxy headers are not taught.
- Database performance: models/ORM and safe migrations exist; indexing, query plans, isolation levels and connection pooling do not.
- Caching and rate limiting: Redis is named as an optional Lumen tier; no guide covers cache design or throttling.
- Infrastructure as code: Lumen AWS is a proposed design with no guide on Terraform, OpenTofu, CloudFormation or CDK.
- deployment-platforms states that ECS, RDS, VPC and broader AWS designs are future topics, not claimed experience.

## Official documentation consulted for the lessons

- Docker: build best practices, multi-stage builds, Compose. Open Container Initiative. Heroku Container Registry and Runtime.
- AWS Elastic Load Balancing: Application Load Balancer and Network Load Balancer user guides. Heroku HTTP routing. MDN HTTP and DNS references. Django `SECURE_PROXY_SSL_HEADER` and `ALLOWED_HOSTS`.
- PostgreSQL documentation: indexes, EXPLAIN, transaction isolation. Django database access optimization and PostgreSQL connection pool notes (Django 5.1+ with psycopg 3).
- Django cache framework (built-in Redis backend since Django 4.0). Django REST framework throttling, which states throttling is not a security measure against brute force or denial of service. MDN HTTP caching. Redis documentation.
- HashiCorp Terraform introduction and sensitive data in state. OpenTofu documentation. AWS CDK v2 developer guide.

These lessons teach concepts. They are not evidence that any of these technologies are deployed in the owner's projects.
