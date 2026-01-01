export type TaskStatus =
  | "AVAILABLE"
  | "LEASED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "QC_PENDING"
  | "APPROVED"
  | "REJECTED"
  | "REQUEUED"

export interface ReviewTask {
  id: string
  videoSegmentLength: string // e.g., "2:45"
  videoSegmentDuration: number // in seconds
  payAmount: number
  language: string
  estimatedTime: string
  status: TaskStatus
  leaseExpiresAt?: number // timestamp
  submittedAt?: number
  reviewedAt?: number
  videoUrl?: string
  questions: TaskQuestion[]
  attentionCheckIndex?: number // which question is the attention check
}

export interface TaskQuestion {
  id: string
  question: string
  type: "scale" | "choice" | "text" | "attention-check"
  options?: string[]
  correctAnswer?: string // for attention checks
}

export interface ReviewerQualityProfile {
  score: number // 0-100
  tasksCompleted: number
  tasksApproved: number
  tasksRejected: number
  isLocked: boolean
  warnings: string[]
}

// Mock tasks with various states
export const mockTasks: ReviewTask[] = [
  {
    id: "task-1",
    videoSegmentLength: "2:45",
    videoSegmentDuration: 165,
    payAmount: 0.3,
    language: "English",
    estimatedTime: "~3 min",
    status: "AVAILABLE",
    videoUrl: "/video-content-sample.jpg",
    questions: [
      {
        id: "q1",
        question: "How clear was the main message?",
        type: "scale",
        options: ["Very Unclear", "Unclear", "Neutral", "Clear", "Very Clear"],
      },
      {
        id: "q2",
        question: "How was the pacing of the content?",
        type: "scale",
        options: ["Too Slow", "Slightly Slow", "Just Right", "Slightly Fast", "Too Fast"],
      },
      {
        id: "q3",
        question: "What color was the logo in the video?",
        type: "attention-check",
        options: ["Red", "Blue", "Green", "Yellow"],
        correctAnswer: "Blue",
      },
      {
        id: "q4",
        question: "Were there any confusing sections?",
        type: "text",
      },
    ],
    attentionCheckIndex: 2,
  },
  {
    id: "task-2",
    videoSegmentLength: "1:30",
    videoSegmentDuration: 90,
    payAmount: 0.2,
    language: "English",
    estimatedTime: "~2 min",
    status: "AVAILABLE",
    videoUrl: "/product-demo-video.png",
    questions: [
      {
        id: "q1",
        question: "How engaging was the content?",
        type: "scale",
        options: ["Not Engaging", "Slightly Engaging", "Moderately Engaging", "Very Engaging", "Extremely Engaging"],
      },
      {
        id: "q2",
        question: "What product was shown in the video?",
        type: "attention-check",
        options: ["Laptop", "Phone", "Tablet", "Watch"],
        correctAnswer: "Phone",
      },
      {
        id: "q3",
        question: "Additional feedback",
        type: "text",
      },
    ],
    attentionCheckIndex: 1,
  },
  {
    id: "task-3",
    videoSegmentLength: "4:00",
    videoSegmentDuration: 240,
    payAmount: 0.45,
    language: "Spanish",
    estimatedTime: "~5 min",
    status: "LEASED",
    leaseExpiresAt: Date.now() + 480000, // 8 minutes from now
    videoUrl: "/spanish-tutorial-video.jpg",
    questions: [
      {
        id: "q1",
        question: "¿Qué tan clara fue la explicación?",
        type: "scale",
        options: ["Muy confusa", "Confusa", "Neutral", "Clara", "Muy clara"],
      },
      {
        id: "q2",
        question: "¿Cuántos ejemplos se mostraron en el video?",
        type: "attention-check",
        options: ["1", "2", "3", "4"],
        correctAnswer: "3",
      },
      {
        id: "q3",
        question: "Comentarios adicionales",
        type: "text",
      },
    ],
    attentionCheckIndex: 1,
  },
  {
    id: "task-4",
    videoSegmentLength: "2:00",
    videoSegmentDuration: 120,
    payAmount: 0.25,
    language: "English",
    estimatedTime: "~3 min",
    status: "SUBMITTED",
    submittedAt: Date.now() - 300000,
    videoUrl: "/educational-content.png",
    questions: [],
    attentionCheckIndex: 0,
  },
  {
    id: "task-5",
    videoSegmentLength: "3:15",
    videoSegmentDuration: 195,
    payAmount: 0.35,
    language: "Portuguese",
    estimatedTime: "~4 min",
    status: "QC_PENDING",
    submittedAt: Date.now() - 120000,
    videoUrl: "/portuguese-content.jpg",
    questions: [],
    attentionCheckIndex: 0,
  },
  {
    id: "task-6",
    videoSegmentLength: "2:30",
    videoSegmentDuration: 150,
    payAmount: 0.28,
    language: "English",
    estimatedTime: "~3 min",
    status: "APPROVED",
    submittedAt: Date.now() - 7200000,
    reviewedAt: Date.now() - 3600000,
    videoUrl: "/approved-video-content.jpg",
    questions: [],
    attentionCheckIndex: 0,
  },
  {
    id: "task-7",
    videoSegmentLength: "1:45",
    videoSegmentDuration: 105,
    payAmount: 0.22,
    language: "English",
    estimatedTime: "~2 min",
    status: "REJECTED",
    submittedAt: Date.now() - 10800000,
    reviewedAt: Date.now() - 7200000,
    videoUrl: "/rejected-video.jpg",
    questions: [],
    attentionCheckIndex: 0,
  },
  {
    id: "task-8",
    videoSegmentLength: "3:00",
    videoSegmentDuration: 180,
    payAmount: 0.33,
    language: "English",
    estimatedTime: "~4 min",
    status: "AVAILABLE",
    videoUrl: "/marketing-video.png",
    questions: [
      {
        id: "q1",
        question: "How professional was the presentation?",
        type: "scale",
        options: ["Very Unprofessional", "Unprofessional", "Neutral", "Professional", "Very Professional"],
      },
      {
        id: "q2",
        question: "What was the speaker wearing?",
        type: "attention-check",
        options: ["Suit", "T-shirt", "Sweater", "Jacket"],
        correctAnswer: "Sweater",
      },
      {
        id: "q3",
        question: "Overall feedback",
        type: "text",
      },
    ],
    attentionCheckIndex: 1,
  },
]

export const initialQualityProfile: ReviewerQualityProfile = {
  score: 100,
  tasksCompleted: 12,
  tasksApproved: 11,
  tasksRejected: 1,
  isLocked: false,
  warnings: [],
}
