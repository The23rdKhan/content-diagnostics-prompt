"use client"

import { logError } from "@/lib/error-tracking"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Mail, FileQuestion, Send, Loader2, CheckCircle, AlertCircle, Clock, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useSupportTickets, useCreateTicket, type SupportTicket } from "@/lib/hooks/use-support"

export function SupportSection() {
  const { tickets, loading: ticketsLoading, error: ticketsError, refetch } = useSupportTickets()
  const { createTicket, loading: creating, error: createError, clearError } = useCreateTicket()

  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setValidationError(null)
    clearError()

    if (!subject.trim()) {
      setValidationError("Please enter a subject")
      return
    }
    if (!message.trim()) {
      setValidationError("Please enter a message")
      return
    }

    try {
      await createTicket({
        subject: subject.trim(),
        message: message.trim(),
        priority: "MEDIUM",
      })
      setSubject("")
      setMessage("")
      setSubmitSuccess(true)
      refetch()
      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (err) {
      logError("Failed to create ticket", err)
    }
  }

  const getStatusBadge = (status: SupportTicket["status"]) => {
    switch (status) {
      case "OPEN":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">Open</Badge>
      case "IN_PROGRESS":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">In Progress</Badge>
      case "RESOLVED":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Resolved</Badge>
      case "CLOSED":
        return <Badge variant="secondary">Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

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
          <h3 className="mt-4 font-semibold text-card-foreground">Live Chat</h3>
          <p className="mt-2 text-sm text-muted-foreground">Chat with our team</p>
          <Button variant="outline" className="mt-4 bg-transparent">
            Start Chat
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Send a Message</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe your issue and our team will get back to you within 24 hours.
        </p>

        {submitSuccess && (
          <Alert className="mt-4 border-green-500/30 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Your message has been sent! We&apos;ll get back to you soon.
            </AlertDescription>
          </Alert>
        )}

        {(createError || validationError) && (
          <Alert className="mt-4 border-destructive/30 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              {validationError || createError?.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
            <Input
              placeholder="What do you need help with?"
              value={subject}
              onChange={(e) => { setSubject(e.target.value); setValidationError(null); }}
              disabled={creating}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Message</label>
            <textarea
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-32 disabled:opacity-50"
              placeholder="Describe your issue in detail..."
              value={message}
              onChange={(e) => { setMessage(e.target.value); setValidationError(null); }}
              disabled={creating}
            />
          </div>
          <Button onClick={handleSubmit} disabled={creating}>
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Recent Tickets</h2>
          {!ticketsLoading && (
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {ticketsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-border rounded-lg">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-32 mt-2" />
              </div>
            ))}
          </div>
        ) : ticketsError ? (
          <div className="rounded-lg bg-destructive/5 border border-destructive/30 p-4 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
            <p className="mt-2 text-sm text-destructive">{ticketsError.message}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-lg bg-secondary p-4 text-center">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No support tickets</p>
            <p className="text-sm text-muted-foreground">Your support history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{ticket.subject}</p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{ticket.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{formatDate(ticket.createdAt)}</p>
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
