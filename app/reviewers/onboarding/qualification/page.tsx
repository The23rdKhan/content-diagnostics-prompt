"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ThemeToggle } from "@/components/theme-toggle"
import { trackEvent } from "@/lib/analytics"
import { AlertCircle, ArrowRight, CheckCircle2, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingScreen } from "@/components/loading-screen"

export default function ReviewerQualification() {
  const [taskStarted, setTaskStarted] = useState(false)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [qualificationResult, setQualificationResult] = useState<"pending" | "pass" | "fail">("pending")
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()

  // Guard: Ensure user has completed language selection before accessing qualification
  useEffect(() => {
    const language = sessionStorage.getItem("selected_language")
    if (!language) {
      router.replace("/reviewers/onboarding/language")
    } else {
      setIsReady(true)
    }
  }, [router])

  const questions = [
    {
      id: 1,
      question: "What is the primary issue with this video's opening?",
      options: [
        { value: "a", label: "The intro is too long and loses viewer attention" },
        { value: "b", label: "The host speaks too fast" },
        { value: "c", label: "The background music is too loud" },
        { value: "d", label: "The lighting is poor" },
      ],
      correct: "a",
    },
    {
      id: 2,
      question: "According to the timeline-based feedback model, at what point do most viewers disengage?",
      options: [
        { value: "a", label: "First 10 seconds" },
        { value: "b", label: "30-45 seconds" },
        { value: "c", label: "60% through the video" },
        { value: "d", label: "Last 20 seconds" },
      ],
      correct: "c",
    },
    {
      id: 3,
      question: "What should you do if you encounter prohibited content during a review?",
      options: [
        { value: "a", label: "Report it immediately and still get paid" },
        { value: "b", label: "Ignore it and complete the review normally" },
        { value: "c", label: "Stop watching and claim you couldn't finish" },
        { value: "d", label: "Share it with friends as an example of bad content" },
      ],
      correct: "a",
    },
  ]

  // Don't render until we've verified the prerequisite step was completed
  if (!isReady) {
    return <LoadingScreen />
  }

  const handleStartTask = () => {
    trackEvent("qualification_started")
    setTaskStarted(true)
  }

  const handleSubmitQualification = () => {
    const passed = questions.every((q) => answers[q.id] === q.correct)

    trackEvent(passed ? "qualification_passed" : "qualification_failed", { answers })

    if (passed) {
      setQualificationResult("pass")
      sessionStorage.setItem("qualification_passed", "true")
      setTimeout(() => router.push("/reviewers/dashboard"), 2000)
    } else {
      setQualificationResult("fail")
    }
  }

  // Show pass state
  if (qualificationResult === "pass") {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Qualification Passed!</h2>
            <p className="text-muted-foreground mb-6">Congratulations! You're ready to start reviewing.</p>
            <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show fail state
  if (qualificationResult === "fail") {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12">
            <div className="text-center mb-6">
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Qualification Not Passed</h2>
              <p className="text-muted-foreground">You answered some questions incorrectly. You can try again.</p>
            </div>
            <Button onClick={() => window.location.reload()} className="w-full" variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Task not started
  if (!taskStarted) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <span>1. Review Rules → 2. Language →</span>
              <span className="text-foreground">3. Qualification</span>
            </div>

            <h1 className="text-4xl font-bold text-foreground mb-4">Qualification Task</h1>
            <p className="text-lg text-muted-foreground">
              Watch a sample video and answer 3 questions to demonstrate you understand our review standards.
            </p>
          </div>

          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This qualification task is required to access the reviewer dashboard and receive review tasks.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Sample Video Review</CardTitle>
              <CardDescription>Watch this 2-minute sample and answer the questions below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mock video player */}
              <div className="relative w-full bg-secondary rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">▶</div>
                  <p className="text-muted-foreground">Sample Video (2 minutes)</p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  In production, this would be a real video you watch. For this demo, please review the questions based
                  on your understanding of what good video feedback looks like.
                </AlertDescription>
              </Alert>

              <Button onClick={handleStartTask} size="lg" className="w-full">
                I've Watched the Sample. Start Task
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Task in progress
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Answer the Review Questions</h1>
          <p className="text-lg text-muted-foreground">Answer these 3 questions based on your understanding</p>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Question {index + 1} of {questions.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium">{question.question}</p>
                <RadioGroup
                  value={answers[question.id] || ""}
                  onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
                >
                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <div key={option.value} className="flex items-center gap-3">
                        <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                        <label htmlFor={`${question.id}-${option.value}`} className="text-sm cursor-pointer flex-1">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          ))}

          <Button
            onClick={handleSubmitQualification}
            size="lg"
            className="w-full"
            disabled={Object.keys(answers).length < questions.length}
          >
            Submit Qualification
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
