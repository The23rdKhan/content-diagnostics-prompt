# Launch Plan

## Soft Launch Scope
- Invite-only creators (5–20 accounts).
- Cap reviewer onboarding to maintain review quality.
- Keep feature flags ready to pause critical flows.

## Feature Flags
- `DISABLE_CHECKOUT`
- `DISABLE_UPLOADS`
- `PAUSE_WORKERS`
- `PAUSE_REVIEWER_SIGNUP`

## Operational Steps
1. Seed admin and invite creator accounts.
2. Validate onboarding and upload flow with a small set of creators.
3. Monitor reviewer capacity and adjust queue access.
4. Enable checkout only after task throughput stabilizes.
5. Expand creator access in small batches.

## Metrics to Watch
- Job completion time vs SLA
- QC rejection rate
- Task lease conflicts (409s)
- Report delivery success rate
- DLQ depth and retry rates

## Incident Response
- Disable uploads or checkout when SLA misses spike.
- Pause workers if queue saturation or DLQ spikes.
- Requeue expired leases to free the reviewer queue.

## Success Criteria
- >= 90% jobs delivered within SLA
- QC rejection rate < 15%
- < 5% task lease conflicts
- No sustained DLQ growth over 24 hours
