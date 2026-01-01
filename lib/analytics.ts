export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === "undefined") return

  console.log("[v0] Analytics event:", eventName, properties)

  // In production, integrate with GA, Segment, Mixpanel, etc.
  // For now, just log to console
  window.parent?.postMessage(
    {
      type: "analytics_event",
      event: eventName,
      properties,
    },
    "*",
  )
}
