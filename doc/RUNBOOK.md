# Content Diagnostics Backend - Production Runbook

## Overview

Content Diagnostics is a video review platform where creators upload videos and paid reviewers provide feedback. This runbook covers deployment, operations, and troubleshooting.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Spring Boot   │────▶│   PostgreSQL    │
│   (Next.js)     │     │   Backend       │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
             ┌──────────┐ ┌──────────┐ ┌──────────┐
             │   S3     │ │   SQS    │ │  Stripe  │
             │ (Videos) │ │ (Async)  │ │(Payments)│
             └──────────┘ └──────────┘ └──────────┘
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://user:pass@host:5432/db` |
| `DATABASE_USERNAME` | Database username | `contentdiag_user` |
| `DATABASE_PASSWORD` | Database password | (secret) |
| `JWT_SECRET` | JWT signing secret (min 64 chars) | (generate with `openssl rand -base64 64`) |
| `STRIPE_SECRET_KEY` | Stripe API secret key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `AWS_ACCESS_KEY_ID` | AWS access key | (from IAM) |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | (from IAM) |
| `AWS_REGION` | AWS region | `us-east-1` |
| `S3_BUCKET_NAME` | S3 bucket for videos | `content-diagnostics-videos` |
| `SQS_QC_QUEUE_URL` | SQS queue for QC processing | `https://sqs.us-east-1.amazonaws.com/...` |
| `SQS_DLQ_URL` | Dead letter queue URL | `https://sqs.us-east-1.amazonaws.com/...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `production` |
| `SERVER_PORT` | HTTP port | `8080` |
| `LOG_LEVEL` | Root log level | `INFO` |
| `TASK_LEASE_DURATION_MINUTES` | Task lease timeout | `10` |
| `MIN_WATCH_RATIO` | Minimum video watch percentage | `0.70` |
| `STRIPE_PRICE_ID_BASIC` | Stripe price ID for Basic plan | (from Stripe) |
| `STRIPE_PRICE_ID_PROFESSIONAL` | Stripe price ID for Pro plan | (from Stripe) |
| `STRIPE_PRICE_ID_ENTERPRISE` | Stripe price ID for Enterprise | (from Stripe) |
| `POSTHOG_API_KEY` | PostHog analytics key | (optional) |
| `RESEND_API_KEY` | Resend email API key | (optional) |

## Deployment

### Prerequisites

1. Java 21+ runtime
2. PostgreSQL 16+
3. AWS account with S3 and SQS configured
4. Stripe account with webhooks configured

### Build

```bash
cd backend
./gradlew clean build -x test
```

### Database Migration

Flyway migrations run automatically on startup. To run manually:

```bash
./gradlew flywayMigrate
```

### Run

```bash
java -jar build/libs/content-diagnostics-*.jar
```

### Health Check

```bash
curl http://localhost:8080/actuator/health
```

## Monitoring

### Key Metrics

- **Task Queue Depth**: Number of pending tasks per language
- **Lease Expiration Rate**: Tasks that timeout without submission
- **QC Pass Rate**: Percentage of tasks passing quality check
- **SLA Compliance**: Jobs delivered within SLA window

### Log Analysis

Logs are in JSON format for easy parsing. Key fields:

- `correlationId`: Request trace ID
- `userId`: Authenticated user ID
- `requestPath`: API endpoint
- `level`: ERROR, WARN, INFO, DEBUG

Search for issues:
```bash
# Find all errors
cat logs/app.log | jq 'select(.level == "ERROR")'

# Find by correlation ID
cat logs/app.log | jq 'select(.correlationId == "abc-123")'

# Find task leasing issues
cat logs/app.log | jq 'select(.message | contains("lease"))'
```

### Audit Events

Admin actions are logged to `audit_events` table:

```sql
-- Recent admin actions
SELECT * FROM audit_events
WHERE action LIKE 'REVIEWER_%'
ORDER BY created_at DESC LIMIT 100;

-- Failed actions (security investigation)
SELECT * FROM audit_events
WHERE result = 'FAILURE'
ORDER BY created_at DESC;
```

## Operations

### Task Queue Management

**Clear stuck leases:**
```sql
-- Find expired leases
SELECT * FROM tasks
WHERE status = 'LEASED' AND lease_expires_at < NOW();

-- The LeaseExpirationJob runs every minute and handles these automatically
-- Manual intervention only needed if scheduler is down
UPDATE tasks
SET status = 'AVAILABLE', reviewer_id = NULL, lease_expires_at = NULL
WHERE status = 'LEASED' AND lease_expires_at < NOW();
```

### Reviewer Management

**Lock a reviewer's queue access:**
```sql
UPDATE reviewer_profiles
SET queue_locked = true
WHERE id = ?;
```

**Check reviewer quality scores:**
```sql
SELECT name, quality_score, tasks_approved, tasks_rejected,
       (tasks_approved::float / NULLIF(tasks_completed, 0)) * 100 as approval_rate
FROM reviewer_profiles
WHERE qualification_passed = true
ORDER BY quality_score ASC;
```

### Stripe Webhook Issues

**Check for failed webhook processing:**
```sql
SELECT event_id, event_type, processing_error, created_at
FROM stripe_events
WHERE processed = false
ORDER BY created_at DESC;
```

**Retry a failed webhook:**
1. Get the event from Stripe dashboard
2. Resend the webhook event
3. The idempotency check will skip if already processed successfully

### SQS DLQ Processing

**Check DLQ messages:**
```bash
aws sqs receive-message --queue-url $SQS_DLQ_URL --max-number-of-messages 10
```

**Reprocess DLQ messages:**
```bash
# Move messages back to main queue
aws sqs send-message --queue-url $SQS_QC_QUEUE_URL --message-body "$(cat message.json)"
```

## Troubleshooting

### Common Issues

#### "Task is not available" when leasing

- **Cause**: Race condition - another reviewer leased first
- **Resolution**: Normal behavior, task queue shows stale data
- **Prevention**: Frontend should refresh queue on 409 response

#### High lease expiration rate

- **Cause**: Reviewers abandoning tasks or connectivity issues
- **Check**:
  ```sql
  SELECT reviewer_id, COUNT(*) as expired_count
  FROM tasks
  WHERE status = 'REQUEUED'
  GROUP BY reviewer_id
  ORDER BY expired_count DESC;
  ```
- **Action**: Consider banning repeat offenders

#### Webhook signature verification failed

- **Cause**: Wrong webhook secret or clock skew
- **Check**: Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- **Action**: Regenerate webhook secret if compromised

#### SQS messages going to DLQ

- **Cause**: Processing errors exceeding retry limit
- **Check**:
  ```sql
  SELECT message_id, error_message, created_at
  FROM sqs_processed_messages
  WHERE processing_result = 'FAILURE'
  ORDER BY created_at DESC;
  ```
- **Action**: Fix root cause, then reprocess DLQ

### Emergency Procedures

#### Disable task queue (maintenance mode)

```sql
-- Lock all reviewers temporarily
UPDATE reviewer_profiles SET queue_locked = true;
```

#### Rollback bad migration

```bash
./gradlew flywayUndo  # Requires Flyway Teams edition
# OR manually:
# 1. Restore database from backup
# 2. Delete migration from flyway_schema_history
```

#### Invalidate all JWTs

Change `JWT_SECRET` and restart. All users will need to re-authenticate.

## Security

### Access Control

- **ADMIN**: Full access, can only be assigned via database
- **CREATOR**: Upload videos, view reports
- **REVIEWER**: Access task queue, submit reviews

### Secrets Management

- Never commit secrets to git
- Use environment variables or secrets manager
- Rotate secrets quarterly:
  - JWT_SECRET (coordinate with sessions)
  - STRIPE_WEBHOOK_SECRET (update in Stripe dashboard)
  - Database credentials

### Audit Trail

All admin actions are logged with:
- Actor ID and IP address
- Before/after values for modifications
- Correlation ID for request tracing

## Backup and Recovery

### Database Backup

Daily automated backups via AWS RDS or manual:

```bash
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$(date +%Y%m%d).sql
```

### Restore Procedure

1. Stop application
2. Restore database: `psql -h $DB_HOST -U $DB_USER -d $DB_NAME < backup.sql`
3. Verify migrations: `./gradlew flywayInfo`
4. Start application
5. Verify health check

## API Documentation

OpenAPI documentation available at:
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI spec: `http://localhost:8080/v3/api-docs`

## Support

- GitHub Issues: https://github.com/contentdiagnostics/backend/issues
- On-call: ops@contentdiagnostics.com
