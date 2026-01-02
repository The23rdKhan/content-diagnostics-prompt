export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return

  // Only log in development
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("[Analytics]", eventName, properties)
  }

  // In production, integrate with GA, Segment, Mixpanel, etc.
  window.parent?.postMessage(
    {
      type: "analytics_event",
      event: eventName,
      properties,
    },
    "*",
  )
}
