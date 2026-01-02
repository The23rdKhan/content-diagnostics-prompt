import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Content Diagnostics",
  description: "Privacy Policy for Content Diagnostics platform.",
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-12">Last updated: January 2025</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Content Diagnostics (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">Account Information</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Name and email address</li>
                <li>Password (encrypted)</li>
                <li>Country and timezone</li>
                <li>Phone number (optional)</li>
                <li>Payment information (processed by Stripe)</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">Content Data</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Videos submitted for review (creators)</li>
                <li>Feedback and ratings provided (reviewers)</li>
                <li>AI analysis results and reports</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">Usage Data</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Browser type and device information</li>
                <li>IP address and approximate location</li>
                <li>Pages visited and features used</li>
                <li>Time spent on the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">We use collected information to:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>Provide and maintain the Service</li>
                <li>Process payments and manage subscriptions</li>
                <li>Match content with qualified reviewers</li>
                <li>Generate AI-powered content analysis</li>
                <li>Compile feedback reports for creators</li>
                <li>Communicate service updates and support</li>
                <li>Improve our platform and develop new features</li>
                <li>Detect and prevent fraud or abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Content Handling</h2>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Video Content:</strong> Videos submitted for review are stored
                securely and only accessible to assigned reviewers and our AI systems. We do not use your
                content for training purposes without explicit consent. Content is automatically deleted
                90 days after the review is completed unless you request earlier deletion.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong className="text-foreground">Reviewer Feedback:</strong> Feedback provided by reviewers is
                anonymized before being included in reports. Reviewers cannot identify creators, and creators
                cannot identify individual reviewers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Information Sharing</h2>
              <p className="text-muted-foreground leading-relaxed">We may share your information with:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li><strong className="text-foreground">Service Providers:</strong> Payment processors (Stripe), cloud hosting, and analytics services</li>
                <li><strong className="text-foreground">Reviewers:</strong> Limited video content for review purposes only (no personal creator information)</li>
                <li><strong className="text-foreground">Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong className="text-foreground">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication with password hashing</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and employee training</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                While we strive to protect your information, no method of transmission over the Internet
                is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">You have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li><strong className="text-foreground">Access:</strong> Request a copy of your personal data</li>
                <li><strong className="text-foreground">Correction:</strong> Update or correct inaccurate information</li>
                <li><strong className="text-foreground">Deletion:</strong> Request deletion of your account and data</li>
                <li><strong className="text-foreground">Portability:</strong> Receive your data in a portable format</li>
                <li><strong className="text-foreground">Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, contact us at{" "}
                <a href="mailto:privacy@contentdiagnostics.com" className="text-accent hover:underline">
                  privacy@contentdiagnostics.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use essential cookies to maintain your session and preferences. We may also use
                analytics cookies to understand how users interact with our platform. You can control
                cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your account information for as long as your account is active. Video content
                is deleted 90 days after review completion. After account deletion, we may retain certain
                information as required by law or for legitimate business purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. International Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your own.
                We ensure appropriate safeguards are in place for such transfers in compliance with
                applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Children&apos;s Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service is not intended for users under 18 years of age. We do not knowingly collect
                personal information from children. If we discover we have collected information from a
                child, we will delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of material changes
                via email or through the platform. Your continued use of the Service after changes
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about this Privacy Policy or our data practices, contact us at:
              </p>
              <p className="text-muted-foreground mt-4">
                Email:{" "}
                <a href="mailto:privacy@contentdiagnostics.com" className="text-accent hover:underline">
                  privacy@contentdiagnostics.com
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
