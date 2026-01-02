import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://contentdiagnostics.com"

  // Public marketing pages
  const publicRoutes = [
    "",
    "/how-it-works",
    "/for-creators",
    "/for-reviewers",
    "/pricing",
    "/sample-report",
    "/terms",
    "/privacy",
    "/ethics",
    "/languages",
  ]

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/pricing" ? 0.9 : 0.8,
  }))
}
