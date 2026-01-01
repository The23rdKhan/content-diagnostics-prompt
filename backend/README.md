# Content Diagnostics Backend

Production-ready Spring Boot 3.x backend for Content Diagnostics - a platform where content creators upload videos for paid human review and receive diagnostic reports.

## Tech Stack

- **Java 21** with Spring Boot 3.3
- **PostgreSQL 16** with Flyway migrations
- **Spring Security** with JWT authentication
- **AWS S3** for video/image storage
- **AWS SQS** for async job processing
- **Stripe** for payments and subscriptions

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Java 21 (for local development without Docker)
- Gradle 8.x (or use included wrapper)

### Running with Docker Compose

```bash
# Start all services (PostgreSQL, LocalStack, API)
docker compose up -d

# View logs
docker compose logs -f app

# Stop all services
docker compose down
```

The API will be available at `http://localhost:8080`

### Running Locally (Development)

1. Start PostgreSQL and LocalStack:
```bash
docker compose up -d postgres localstack
```

2. Set environment variables (see below) or create `.env` file

3. Run the application:
```bash
./gradlew bootRun
```

## Environment Variables

| Variable | Description | Default (Docker) |
|----------|-------------|------------------|
| `DB_URL` | PostgreSQL JDBC URL | `jdbc:postgresql://postgres:5432/contentdiagnostics` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `JWT_SECRET` | Secret key for JWT signing (min 256 bits) | dev key |
| `JWT_EXPIRATION_MS` | Access token expiration | `3600000` (1 hour) |
| `JWT_REFRESH_EXPIRATION_MS` | Refresh token expiration | `604800000` (7 days) |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | `test` (LocalStack) |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `test` (LocalStack) |
| `S3_BUCKET_NAME` | S3 bucket for uploads | `content-diagnostics-uploads` |
| `S3_ENDPOINT` | S3 endpoint (for LocalStack) | `http://localstack:4566` |
| `SQS_QUEUE_URL` | SQS queue URL | LocalStack URL |
| `STRIPE_SECRET_KEY` | Stripe API secret key | - |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | - |
| `RESEND_API_KEY` | Resend API key for emails | - |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/login` | Login and get tokens |
| POST | `/api/auth/logout` | Logout (revoke tokens) |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user info |

### Creator Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/creators/profile` | Get creator profile |
| PUT | `/api/creators/profile` | Update profile |
| GET | `/api/creators/jobs` | List all jobs |
| POST | `/api/creators/jobs` | Create new job |
| GET | `/api/creators/jobs/{id}` | Get job details |
| GET | `/api/creators/reports/{jobId}` | Get report for job |
| GET | `/api/creators/reports/compare` | Compare two reports |

### Reviewer Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviewers/profile` | Get reviewer profile |
| PUT | `/api/reviewers/profile` | Update profile |
| POST | `/api/reviewers/qualify` | Submit qualification |
| GET | `/api/reviewers/tasks` | Get available tasks |
| POST | `/api/reviewers/tasks/{id}/lease` | Lease a task |
| POST | `/api/reviewers/tasks/{id}/submit` | Submit task |
| DELETE | `/api/reviewers/tasks/{id}/release` | Release task |
| GET | `/api/reviewers/earnings` | Get earnings summary |

### Storage

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/storage/presign` | Get presigned upload URL |

### Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/billing/checkout` | Create checkout session |
| POST | `/api/billing/portal` | Create customer portal |
| POST | `/webhooks/stripe` | Stripe webhook (public) |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/kpis` | Platform KPIs |
| GET | `/api/admin/capacity` | Language pool capacity |
| PUT | `/api/admin/capacity/{poolId}` | Update pool settings |
| GET | `/api/admin/reviewers` | List all reviewers |
| PUT | `/api/admin/reviewers/{id}/status` | Update reviewer status |
| GET | `/api/admin/payouts` | List pending payouts |
| POST | `/api/admin/payouts/{id}/release` | Release payout |
| POST | `/api/admin/creators/{id}/credit` | Issue credit |

## Testing

### Run All Tests

```bash
./gradlew test
```

### Run Specific Test Class

```bash
./gradlew test --tests "JwtServiceTest"
./gradlew test --tests "TaskServiceTest"
```

### Generate Test Report

```bash
./gradlew test jacocoTestReport
# Report at build/reports/jacoco/test/html/index.html
```

## cURL Examples

### Signup (Creator)

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@example.com",
    "password": "password123",
    "role": "CREATOR"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "550e8400-e29b-...",
  "email": "creator@example.com",
  "role": "CREATOR"
}
```

### Get Presigned Upload URL

```bash
curl -X POST http://localhost:8080/api/storage/presign \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "my-video.mp4",
    "contentType": "video/mp4",
    "fileSize": 125400000
  }'
```

### Create Job

```bash
curl -X POST http://localhost:8080/api/creators/jobs \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Product Demo Video",
    "videoKey": "uploads/my-video.mp4",
    "language": "English",
    "addons": {
      "extraReviewers": 10,
      "fasterDelivery": true
    }
  }'
```

### List Available Tasks (Reviewer)

```bash
curl http://localhost:8080/api/reviewers/tasks \
  -H "Authorization: Bearer <reviewer_token>"
```

### Lease Task

```bash
curl -X POST http://localhost:8080/api/reviewers/tasks/task-123/lease \
  -H "Authorization: Bearer <reviewer_token>"
```

### Submit Task

```bash
curl -X POST http://localhost:8080/api/reviewers/tasks/task-123/submit \
  -H "Authorization: Bearer <reviewer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "clarity": 4,
      "pacing": 5,
      "engagement": 4,
      "attention_check": "Blue",
      "feedback": "Great video, clear message!"
    },
    "watchedSeconds": 150,
    "completionTimeSeconds": 180
  }'
```

### Get Report

```bash
curl http://localhost:8080/api/creators/reports/job-123 \
  -H "Authorization: Bearer <access_token>"
```

### Refresh Token

```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "550e8400-e29b-..."
  }'
```

## Project Structure

```
src/main/java/com/contentdiagnostics/
├── ContentDiagnosticsApplication.java
├── common/
│   ├── config/          # CORS, Jackson, etc.
│   ├── dto/             # Common DTOs
│   ├── exception/       # Exception handlers
│   └── util/            # Utilities
├── auth/
│   ├── config/          # Security config
│   ├── controller/
│   ├── dto/
│   ├── entity/          # User, RefreshToken
│   ├── repository/
│   └── service/         # JwtService, AuthService
├── creators/
├── reviewers/
├── storage/
├── videos/
├── jobs/
├── tasks/
├── reports/
├── billing/
├── notifications/
├── admin/
├── payouts/
└── workers/             # SQS consumers
```

## Database Migrations

Migrations are in `src/main/resources/db/migration/`:

- `V1__create_users_tables.sql` - Users, profiles, refresh tokens
- `V2__create_videos_jobs_tables.sql` - Videos, jobs
- `V3__create_tasks_table.sql` - Review tasks
- `V4__create_reports_table.sql` - Reports
- `V5__create_billing_tables.sql` - Stripe events, payouts
- `V6__create_notifications_tables.sql` - Notifications, email prefs

## Key Features

### Task Leasing

Tasks use atomic leasing to prevent race conditions:
- 10-minute lease timeout
- Automatic requeue on expiration
- Single-row UPDATE with status guard

### QC Rules

Task submissions are validated:
- Watch ratio >= 70%
- Completion time >= 30 seconds
- Attention check validation

### Quality Score

Reviewers start at 100, adjusted per submission:
- +1 on approval (capped at 100)
- -5 on rejection
- Account locked if score < 60

### Stripe Integration

- Idempotent webhook handling
- Subscription lifecycle management
- One-time add-on payments

## Health Check

```bash
curl http://localhost:8080/actuator/health
```

## License

Proprietary - All rights reserved.
