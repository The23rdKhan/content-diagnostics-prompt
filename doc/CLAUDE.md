# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Content Diagnostics is a Next.js application that allows content creators to test their content using AI diagnostics and human reviewers before publishing. The platform serves three user roles: Creators, Reviewers, and Admins.

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Architecture

### Core Technology Stack
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Type Safety**: TypeScript with strict mode
- **Forms**: react-hook-form with zod validation
- **Analytics**: Vercel Analytics

### Application Structure

The app follows a role-based multi-tenant architecture with three main user flows:

1. **Creators** (`/creators/*`) - Upload content for review, view diagnostics, manage subscriptions
2. **Reviewers** (`/reviewers/*`) - Review content tasks, track earnings, manage qualifications
3. **Admins** (`/admin/*`) - Manage users, capacity, tasks, and payouts

### Global State Management

The application uses React Context for cross-cutting concerns:

- **AuthContext** (`lib/auth-context.tsx`): Manages user authentication and role-based access
  - Supports three roles: `CREATOR`, `REVIEWER`, `ADMIN`
  - Currently uses localStorage for mock authentication
  - Each role has a distinct profile structure (creatorProfile, reviewerProfile, adminProfile)

- **NotificationContext** (`lib/notification-context.tsx`): Handles in-app notifications
  - Role-specific notification types for creators and reviewers
  - Includes unread counts, read/unread tracking, and deep linking

- **ThemeProvider** (`components/theme-provider.tsx`): Dark/light mode theming via next-themes

### Routing and Authentication

- Uses Next.js App Router with file-based routing
- Authentication middleware in `proxy.ts` (configured in next.config.mjs)
- Protected routes redirect unauthenticated users to `/auth/sign-in`
- Role-based access control enforced at the route level

### Data Layer

Mock data is currently stored in `/lib/*-data.ts` files:
- `admin-data.ts` - Admin dashboard metrics and user data
- `job-data.ts` - Creator job submissions and status
- `reports-data.ts` - Diagnostic reports and review data
- `task-data.ts` - Reviewer tasks and queue management

When implementing real backend integration, replace these mock data files with API calls.

### UI Components

The project uses shadcn/ui (New York style) with the following configuration:
- Components located in `components/ui/`
- Custom components organized by role: `components/admin/`, `components/creator/`, `components/reviewer/`, `components/marketing/`
- Path alias `@/*` maps to project root
- Icon library: lucide-react

### Important Configuration Notes

- **TypeScript Build Errors**: Currently set to `ignoreBuildErrors: true` in next.config.mjs
- **Image Optimization**: Disabled (`unoptimized: true`) - likely for static export compatibility
- **Default Theme**: Light mode is the default theme
- **Font**: Uses Geist and Geist Mono from next/font/google

### Testing Content Before Implementation

This is a demo/prototype application with mock authentication and data. When implementing real features:
1. Replace localStorage authentication with proper auth (NextAuth.js, Clerk, etc.)
2. Swap mock data files with actual API endpoints
3. Implement proper database models for users, jobs, tasks, and reports
4. Add server-side validation and authorization checks
5. Remove or update the proxy.ts middleware to work with real auth

### Path Aliases

```typescript
@/* - Project root
@/components - UI components
@/lib - Utilities and contexts
@/hooks - React hooks
@/app - Next.js app directory
```
