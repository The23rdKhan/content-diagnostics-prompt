"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Mail, FileQuestion, Send } from "lucide-react"

export function ReviewerSupportSection() {
  const [message, setMessage] = useState("")

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <FileQuestion className="h-6 w-6 text-accent" />
          </div>
          <h3 className="mt-4 font-semibold text-card-foreground">Help Center</h3>
          <p className="mt-2 text-sm text-muted-foreground">Browse FAQs and guides</p>
          <Button variant="outline" className="mt-4 bg-transparent">
            View Articles
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <Mail className="h-6 w-6 text-accent" />
          </div>
          <h3 className="mt-4 font-semibold text-card-foreground">Email Support</h3>
          <p className="mt-2 text-sm text-muted-foreground">Get help via email</p>
          <Button variant="outline" className="mt-4 bg-transparent">
            Send Email
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <MessageSquare className="h-6 w-6 text-accent" />
          </div>
          <h3 className="mt-4 font-semibold text-card-foreground">Community</h3>
          <p className="mt-2 text-sm text-muted-foreground">Connect with other reviewers</p>
          <Button variant="outline" className="mt-4 bg-transparent">
            Join Forum
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Common Questions</h2>
        <div className="mt-4 space-y-4">
          {[
            {
              q: "Why was my task rejected?",
              a: "Tasks may be rejected if feedback was incomplete, content was skipped, or responses were rushed.",
            },
            {
              q: "When do I get paid?",
              a: "Payouts are processed on the 1st and 15th of each month with a minimum balance of $10.",
            },
            {
              q: "How can I get more tasks?",
              a: "Add more languages to your profile and maintain high-quality feedback to receive more tasks.",
            },
          ].map((faq, index) => (
            <div key={index} className="rounded-lg bg-secondary p-4">
              <p className="font-medium text-secondary-foreground">{faq.q}</p>
              <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Send a Message</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Have an issue? Describe it and our team will get back to you within 24-48 hours.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
            <Input placeholder="What do you need help with?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Message</label>
            <textarea
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-32"
              placeholder="Describe your issue in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>
    </div>
  )
}
