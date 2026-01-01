import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                <span className="text-sm font-bold text-accent-foreground">CD</span>
              </div>
              <span className="text-lg font-semibold text-foreground">Content Diagnostics</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Test content. Improve clarity. Publish with confidence.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Product</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/sample-report" className="text-sm text-muted-foreground hover:text-foreground">
                  Sample Report
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/ethics" className="text-sm text-muted-foreground hover:text-foreground">
                  Ethics & Transparency
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Reviewers</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/for-reviewers" className="text-sm text-muted-foreground hover:text-foreground">
                  For Reviewers
                </Link>
              </li>
              <li>
                <Link href="/languages" className="text-sm text-muted-foreground hover:text-foreground">
                  Languages
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Content Diagnostics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
