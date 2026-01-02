/**
 * Error Tracking Utility
 *
 * Provides a unified interface for error reporting.
 * Currently logs to console, but can be extended to use Sentry, LogRocket, etc.
 *
 * To enable Sentry:
 * 1. npm install @sentry/nextjs
 * 2. Run: npx @sentry/wizard@latest -i nextjs
 * 3. Set NEXT_PUBLIC_SENTRY_DSN in .env.local
 */

interface ErrorContext {
  section?: string
  userId?: string
  extra?: Record<string, unknown>
}

/**
 * Check if Sentry is available (will be true after Sentry SDK is installed)
 */
function getSentry(): { captureException: (error: Error, context?: unknown) => void } | null {
  // Dynamic import check for Sentry
  // This allows the code to work without Sentry installed
  if (typeof window !== "undefined" && (window as unknown as { Sentry?: unknown }).Sentry) {
    return (window as unknown as { Sentry: { captureException: (error: Error, context?: unknown) => void } }).Sentry
  }
  return null
}

/**
 * Report an error to the error tracking service.
 *
 * @param error - The error to report
 * @param context - Additional context about where/why the error occurred
 */
export function captureError(error: Error, context?: ErrorContext): void {
  const sentry = getSentry()

  if (sentry) {
    sentry.captureException(error, {
      tags: {
        section: context?.section || "unknown",
      },
      user: context?.userId ? { id: context.userId } : undefined,
      extra: context?.extra,
    })
  }

  // Always log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context?.section || "Error"}]`, error)
    if (context?.extra) {
      console.error("Context:", context.extra)
    }
  }
}

/**
 * Report an error from an error boundary.
 * Includes the error digest for correlation.
 *
 * @param error - The error with optional digest
 * @param section - Which part of the app (global, creators, reviewers, admin)
 */
export function captureErrorBoundary(
  error: Error & { digest?: string },
  section: "global" | "creators" | "reviewers" | "admin"
): void {
  captureError(error, {
    section: `error-boundary-${section}`,
    extra: {
      digest: error.digest,
      name: error.name,
      stack: error.stack,
    },
  })
}

/**
 * Log a warning that doesn't throw but should be tracked.
 *
 * @param message - Warning message
 * @param context - Additional context
 */
export function captureWarning(message: string, context?: ErrorContext): void {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.warn(`[${context?.section || "Warning"}]`, message, context?.extra)
  }

  // Sentry can capture messages too
  const sentry = getSentry()
  if (sentry) {
    // Sentry.captureMessage would be used here when SDK is installed
  }
}

/**
 * Log an error in development only.
 * Use this for non-critical errors that don't need production tracking.
 *
 * @param message - Error message or prefix
 * @param error - The error object
 */
export function logError(message: string, error?: unknown): void {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.error(`[${message}]`, error)
  }
}
