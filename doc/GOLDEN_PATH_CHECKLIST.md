# Golden Path Validation Checklist

End-to-end validation of the core user flow before launch.

## Prerequisites

- [ ] Backend container builds and starts (`docker compose up`)
- [ ] Frontend runs (`pnpm dev`)
- [ ] Database is seeded with test data
- [ ] Stripe test mode configured (if testing payments)

---

## 1. Creator Flow

### 1.1 Authentication
- [ ] Sign up as new creator
- [ ] Sign in with existing creator account
- [ ] Session persists on page refresh
- [ ] Sign out works

### 1.2 Upload Video
- [ ] Navigate to upload page
- [ ] Select video file
- [ ] Upload progress shows correctly
- [ ] Upload completes without error
- [ ] Job appears in dashboard with "UPLOADING" → "PROCESSING" status

### 1.3 Job Tracking
- [ ] Job status updates in real-time (or on refresh)
- [ ] Timeline shows correct stages (AI Diagnostics → Human Review → Compiling)
- [ ] SLA countdown displays correctly
- [ ] Job moves to "IN_REVIEW" when ready for reviewers

### 1.4 View Report
- [ ] Delivered job shows "View Report" button
- [ ] Report page loads with all sections
- [ ] AI diagnostics section displays
- [ ] Human feedback section displays
- [ ] Download/export works (if implemented)

### 1.5 Notifications
- [ ] Notification bell shows unread count
- [ ] Upload confirmation notification received
- [ ] Report ready notification received
- [ ] Clicking notification navigates to correct page
- [ ] Mark as read works

---

## 2. Reviewer Flow

### 2.1 Authentication
- [ ] Sign up as new reviewer
- [ ] Complete qualification flow (if required)
- [ ] Sign in with existing reviewer account
- [ ] Session persists on page refresh

### 2.2 Task Queue
- [ ] Available tasks display in queue
- [ ] Task cards show video length, pay amount, language
- [ ] Filter by status works
- [ ] Empty state shows when no tasks

### 2.3 Accept Task
- [ ] Click "Accept" on available task
- [ ] Task moves to "In Progress"
- [ ] Lease timer starts
- [ ] Video player loads
- [ ] Questions/form displays

### 2.4 Complete Task
- [ ] Answer all questions
- [ ] Attention check question works
- [ ] Submit task
- [ ] Task moves to "Submitted" status
- [ ] Confirmation shown

### 2.5 Task Lifecycle
- [ ] Submitted task moves to "QC Pending"
- [ ] Approved task shows in history
- [ ] Rejected task shows reason (if applicable)
- [ ] Earnings update after approval

### 2.6 Earnings & Payouts
- [ ] Earnings dashboard shows correct totals
- [ ] Pending vs available balance correct
- [ ] Payout request works (if implemented)

### 2.7 Notifications
- [ ] Task approved/rejected notification received
- [ ] Payout processed notification received

---

## 3. Admin Flow

### 3.1 Authentication
- [ ] Sign in as admin
- [ ] Admin dashboard loads
- [ ] Non-admin users cannot access /admin routes

### 3.2 Dashboard KPIs
- [ ] KPI cards load with real data
- [ ] Numbers are reasonable/accurate

### 3.3 Capacity Management
- [ ] Language pools display
- [ ] Edit capacity settings
- [ ] Toggle checkout enabled/disabled
- [ ] Changes persist

### 3.4 Task Management
- [ ] Tasks list loads
- [ ] Filter by status works
- [ ] Bulk actions work (requeue, cancel)
- [ ] Individual task details accessible

### 3.5 Reviewer Management
- [ ] Reviewers list loads
- [ ] Search works
- [ ] View reviewer details
- [ ] Issue warning/disable works

### 3.6 Payout Management
- [ ] Pending payouts display
- [ ] Release payout works
- [ ] Payout stats accurate

### 3.7 Creator Management
- [ ] Creators list loads
- [ ] Grant credit works
- [ ] Credit appears on creator account

---

## 4. Cross-Cutting Concerns

### 4.1 Error Handling
- [ ] API errors show user-friendly messages
- [ ] 401 redirects to sign-in
- [ ] 403 shows "Access Denied" (not redirect)
- [ ] Network errors show retry option
- [ ] App doesn't crash on errors

### 4.2 Loading States
- [ ] Skeleton loaders show during data fetch
- [ ] Buttons show loading spinner during actions
- [ ] No layout shift when data loads

### 4.3 Responsive Design
- [ ] Pages work on mobile viewport
- [ ] Tables scroll horizontally on small screens
- [ ] Modals/sheets work on mobile

### 4.4 Theme
- [ ] Light mode works
- [ ] Dark mode works
- [ ] Theme persists on refresh

---

## 5. Integration Points

### 5.1 Database
- [ ] Data persists across server restarts
- [ ] Concurrent updates handled correctly

### 5.2 File Storage
- [ ] Videos upload to storage (S3/local)
- [ ] Videos stream correctly to reviewers

### 5.3 Stripe (if applicable)
- [ ] Subscription checkout works
- [ ] Billing portal accessible
- [ ] Webhooks received and processed

---

## Test Results

| Flow | Status | Notes |
|------|--------|-------|
| Creator Auth | | |
| Video Upload | | |
| Job Tracking | | |
| View Report | | |
| Reviewer Auth | | |
| Task Queue | | |
| Complete Task | | |
| Earnings | | |
| Admin Dashboard | | |
| Capacity Mgmt | | |
| Task Mgmt | | |
| Reviewer Mgmt | | |
| Payout Mgmt | | |
| Error Handling | | |

---

## Sign-off

- [ ] All critical paths pass
- [ ] No blocking bugs found
- [ ] Ready for invite-only beta

**Tested by:** _______________
**Date:** _______________
