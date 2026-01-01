# Staging Plan

## Goals
- Validate the full content review flow end-to-end with real AWS primitives.
- Keep costs low while mirroring production constraints (auth, storage, queues).
- Use Stripe test mode with a dedicated webhook endpoint.

## AWS Services (Minimal)
- ECS Fargate + ALB (single service for the API)
- RDS Postgres (db.t4g.micro or equivalent)
- S3 private bucket with CORS for uploads
- SQS queues + DLQs for pipeline stages
- Secrets Manager for JWT, Stripe, DB credentials
- CloudWatch logs for API and worker visibility

## Environment & Secrets
- `JWT_SECRET` (256-bit minimum)
- `DB_URL`, `DB_USER`, `DB_PASS`
- `S3_BUCKET`, `AWS_REGION`
- `SQS_VIDEO_PROCESSING_QUEUE`, `SQS_SEGMENTATION_QUEUE`, `SQS_QC_QUEUE`, `SQS_REPORT_COMPILATION_QUEUE`, `SQS_NOTIFICATION_QUEUE`, `SQS_EMAIL_QUEUE`
- `STRIPE_SECRET_KEY` (test)
- `STRIPE_WEBHOOK_SECRET` (test)
- `DEBUG_TOOLS_ENABLED=true` (staging only)

## Deployment Steps (Minimal)
1. Create VPC, subnets, and security groups for ALB + ECS + RDS.
2. Create RDS Postgres and apply migrations on first boot.
3. Create S3 bucket + CORS rules for `http://localhost:3000` and staging domain.
4. Create SQS queues and DLQs; wire URLs into env vars.
5. Push API image to ECR and deploy ECS service behind ALB.
6. Configure Secrets Manager + ECS task definitions for secrets.
7. Point staging domain to ALB and verify health check `/api/actuator/health`.
8. Configure Stripe test webhook to `https://api-staging.<domain>/api/webhooks/stripe`.

## Validation Checklist
- Auth signup/login works against staging API.
- Upload presign returns valid URL and S3 uploads succeed.
- Reviewer can lease and submit tasks.
- Admin debug tools work in staging only.
- Reports deliver and compare endpoints respond.

## Rollback
- Revert ECS task definition to previous image tag.
- Restore RDS snapshot if migrations cause issues.
