import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Content Diagnostics",
  description: "Terms of Service for Content Diagnostics platform.",
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-12">Last updated: January 2025</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Content Diagnostics (&quot;the Service&quot;), you agree to be bound by these
                Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Content Diagnostics provides a platform for content creators to receive feedback on their
                video content before publication. The Service includes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>AI-powered content analysis for clarity, pacing, and engagement</li>
                <li>Paid human reviewer feedback through structured tasks</li>
                <li>Aggregated reports with actionable recommendations</li>
                <li>Optional add-on services for enhanced feedback</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong className="text-foreground">Important:</strong> This service is for internal content testing only.
                It does not provide public views, engagement metrics, or any form of algorithmic manipulation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized account access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Creator Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                As a content creator using the Service, you agree that:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>You own or have rights to the content you submit for review</li>
                <li>Your content does not violate any laws or third-party rights</li>
                <li>You will not submit content containing illegal material, hate speech, or explicit content without appropriate warnings</li>
                <li>Feedback received is confidential and for your use only</li>
                <li>Subscription fees are billed monthly and non-refundable except as required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Reviewer Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                As a reviewer on the platform, you agree that:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>You are at least 18 years of age</li>
                <li>You will maintain strict confidentiality of all content reviewed</li>
                <li>You will provide honest, unbiased, and constructive feedback</li>
                <li>You will complete assigned tasks within the specified timeframe</li>
                <li>You will not share, copy, or distribute any reviewed content</li>
                <li>Payment is made per completed task according to the current rate schedule</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Prohibited Uses</h2>
              <p className="text-muted-foreground leading-relaxed">
                You may not use the Service to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Submit or review content containing malware or harmful code</li>
                <li>Attempt to gain unauthorized access to the Service or other accounts</li>
                <li>Engage in any activity that disrupts or interferes with the Service</li>
                <li>Use the Service to artificially manipulate public platform algorithms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Payment Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Creators:</strong> Subscription plans are billed monthly in advance.
                You may cancel at any time, but no refunds will be provided for partial months. Add-on purchases
                are charged at the time of purchase.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong className="text-foreground">Reviewers:</strong> Payment is issued monthly for all completed
                and approved tasks. We reserve the right to withhold payment for tasks that do not meet quality standards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                Creators retain all rights to their submitted content. By using the Service, you grant us a
                limited license to process and display your content solely for the purpose of providing the Service.
                We do not claim ownership of your content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service is provided &quot;as is&quot; without warranties of any kind. We are not liable for any
                indirect, incidental, or consequential damages arising from your use of the Service. Our total
                liability is limited to the amount you paid for the Service in the past 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may suspend or terminate your account at any time for violation of these terms. You may
                cancel your account at any time through your account settings. Upon termination, your right
                to use the Service ceases immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update these terms from time to time. We will notify you of material changes via email
                or through the Service. Continued use after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:legal@contentdiagnostics.com" className="text-accent hover:underline">
                  legal@contentdiagnostics.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
