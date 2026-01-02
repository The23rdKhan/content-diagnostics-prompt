import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { NotificationProvider } from "@/lib/notification-context"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://contentdiagnostics.com"

export const metadata: Metadata = {
  title: {
    default: "Content Diagnostics | Test Content Before You Publish",
    template: "%s | Content Diagnostics",
  },
  description:
    "Test content privately using AI diagnostics and paid human reviewers to identify clarity issues, pacing problems, and attention drop-offs before release.",
  keywords: [
    "content testing",
    "video feedback",
    "content diagnostics",
    "video review",
    "content analysis",
    "AI video analysis",
    "creator tools",
  ],
  authors: [{ name: "Content Diagnostics" }],
  creator: "Content Diagnostics",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Content Diagnostics",
    title: "Content Diagnostics | Test Content Before You Publish",
    description:
      "Get actionable feedback on your videos before publishing. AI diagnostics + paid human reviewers identify clarity issues, pacing problems, and engagement drop-offs.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Content Diagnostics - Test Content Before You Publish",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Content Diagnostics | Test Content Before You Publish",
    description:
      "Get actionable feedback on your videos before publishing. AI diagnostics + paid human reviewers.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
