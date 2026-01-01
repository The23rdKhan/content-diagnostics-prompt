export type ReportStatus = "delivered" | "in_progress" | "awaiting_human" | "compiling"
export type LanguagePool =
  | "english_global"
  | "spanish_latam"
  | "portuguese_brazil"
  | "french_europe"
  | "german"
  | "japanese"
  | "korean"
  | "hindi"
export type SeverityLevel = "minor" | "moderate" | "critical"
export type VideoLength = "short" | "medium" | "long"

export interface TimelineInsight {
  timestamp: string
  observation: string
  severity: SeverityLevel
  category: "hook" | "clarity" | "pace" | "energy" | "structure"
}

export interface Report {
  id: string
  videoTitle: string
  duration: string
  videoDuration: number // in minutes for filtering
  languagePool: LanguagePool
  status: ReportStatus
  guaranteedReviewers: number
  slaWindow: string
  actualDeliveryTime?: string
  dateSubmitted: string
  dateCompleted?: string
  aiComplete: boolean
  humanComplete: boolean
  compiled: boolean

  // Report content
  executiveSummary: string
  clarityScore: number
  pacingScore: number
  engagementScore: number
  structureScore: number

  timelineInsights: TimelineInsight[]
  aiAnalysis: {
    monologueStretches: string[]
    silenceDowntime: string[]
    topicDrift: string[]
    energyVariance: string[]
  }
  humanReviews: {
    engagementStats: string
    comments: string[]
  }
  actionPlan: {
    action: string
    why: string
    expectedResult: string
  }[]

  // For comparison/series tracking
  seriesId?: string
  version?: number
}

// Mock data: 12 reports with variety
export const mockReports: Report[] = [
  {
    id: "rpt_001",
    videoTitle: "Product Demo v3.mp4",
    duration: "14:32",
    videoDuration: 14.5,
    languagePool: "english_global",
    status: "delivered",
    guaranteedReviewers: 20,
    slaWindow: "Within 48 hours",
    actualDeliveryTime: "42 hours",
    dateSubmitted: "2025-12-27",
    dateCompleted: "2025-12-29",
    aiComplete: true,
    humanComplete: true,
    compiled: true,
    seriesId: "product_demo",
    version: 3,

    executiveSummary:
      "This iteration shows marked improvement in hook clarity and pacing compared to v2. The opening 45 seconds effectively communicate value, though the middle section still contains technical detail that may confuse non-technical viewers.",

    clarityScore: 82,
    pacingScore: 88,
    engagementScore: 79,
    structureScore: 85,

    timelineInsights: [
      {
        timestamp: "0:00-0:45",
        observation:
          "Strong hook with clear value statement. 18/20 reviewers reported immediate understanding of product benefit.",
        severity: "minor",
        category: "hook",
      },
      {
        timestamp: "2:15-3:30",
        observation:
          "Technical terminology without context. 12/20 reviewers noted confusion around 'API gateway integration'.",
        severity: "moderate",
        category: "clarity",
      },
      {
        timestamp: "5:00-6:45",
        observation: "Pace slows noticeably. Extended monologue without visual support or examples.",
        severity: "moderate",
        category: "pace",
      },
      {
        timestamp: "9:00-10:30",
        observation:
          "Strong demonstration segment. Clear screen recording with verbal walkthrough maintains attention.",
        severity: "minor",
        category: "energy",
      },
      {
        timestamp: "13:45-14:32",
        observation: "Call-to-action is present but lacks urgency. Ending feels abrupt.",
        severity: "moderate",
        category: "structure",
      },
    ],

    aiAnalysis: {
      monologueStretches: [
        "5:00-6:45: 105-second uninterrupted monologue",
        "11:20-12:40: 80-second technical explanation without breaks",
      ],
      silenceDowntime: [
        "3:45-3:52: 7-second pause while transitioning slides",
        "8:10-8:15: 5-second silence during screen switch",
      ],
      topicDrift: ["7:00-7:45: Discussion of internal tooling not relevant to target audience"],
      energyVariance: [
        "Opening 2 minutes: High energy (8/10)",
        "Minutes 5-8: Noticeable drop (4/10)",
        "Minutes 9-11: Recovery to medium energy (6/10)",
      ],
    },

    humanReviews: {
      engagementStats:
        "18/20 reviewers stayed engaged through opening. 14/20 maintained attention through middle section. 16/20 reported clear understanding of next steps.",
      comments: [
        "Hook was excellent - I knew exactly what this was solving within 20 seconds.",
        "Lost me around the 3-minute mark when technical terms weren't explained.",
        "The live demo section brought me back in. Show, don't tell works well here.",
        "Ending feels rushed. I wanted more information on pricing or next steps.",
        "Overall solid improvement from previous version. Much clearer value prop up front.",
        "Middle section drags a bit. Consider adding B-roll or cutting some detail.",
      ],
    },

    actionPlan: [
      {
        action: "Add 10-second definition overlay when introducing 'API gateway integration' at 2:20",
        why: "12/20 reviewers noted confusion at this technical term",
        expectedResult: "Improved clarity score from 82 to ~88. Reduced mid-video drop-off.",
      },
      {
        action: "Break up 5:00-6:45 monologue with 2-3 supporting visuals or customer quote",
        why: "Extended monologue shows 30% engagement drop in AI analysis",
        expectedResult: "Maintain energy curve. Improved pacing score from 88 to ~92.",
      },
      {
        action: "Extend ending by 15-20 seconds with specific call-to-action and urgency element",
        why: "Current ending feels abrupt. 8/20 reviewers wanted clearer next steps.",
        expectedResult: "Stronger conversion intent. Improved structure score from 85 to ~90.",
      },
    ],
  },

  {
    id: "rpt_002",
    videoTitle: "Product Demo v2.mp4",
    duration: "15:10",
    videoDuration: 15.2,
    languagePool: "english_global",
    status: "delivered",
    guaranteedReviewers: 20,
    slaWindow: "Within 48 hours",
    actualDeliveryTime: "46 hours",
    dateSubmitted: "2025-12-20",
    dateCompleted: "2025-12-22",
    aiComplete: true,
    humanComplete: true,
    compiled: true,
    seriesId: "product_demo",
    version: 2,

    executiveSummary:
      "Opening hook lacks clarity on target audience and value proposition. The middle demonstration is strong, but transitions are abrupt and pacing is uneven.",

    clarityScore: 68,
    pacingScore: 72,
    engagementScore: 65,
    structureScore: 70,

    timelineInsights: [
      {
        timestamp: "0:00-0:50",
        observation:
          "Opening is generic. 14/20 reviewers couldn't identify who this product is for within first 30 seconds.",
        severity: "critical",
        category: "hook",
      },
      {
        timestamp: "3:20-4:40",
        observation: "Technical details without context. Assumes audience familiarity with concepts.",
        severity: "critical",
        category: "clarity",
      },
      {
        timestamp: "8:00-9:30",
        observation: "Strong demo, but transition into it was jarring.",
        severity: "moderate",
        category: "structure",
      },
    ],

    aiAnalysis: {
      monologueStretches: ["6:30-8:00: 90-second monologue", "11:00-13:00: 120-second uninterrupted speech"],
      silenceDowntime: ["2:10-2:18: 8-second pause", "7:45-7:51: 6-second silence"],
      topicDrift: ["10:00-11:00: Tangent about company history not relevant to product"],
      energyVariance: [
        "Opening: Medium energy (5/10)",
        "Minutes 5-10: Drop to low (3/10)",
        "Closing: slight recovery (4/10)",
      ],
    },

    humanReviews: {
      engagementStats:
        "11/20 reviewers stayed engaged through opening. 9/20 maintained full attention. 13/20 understood product by end.",
      comments: [
        "I wasn't sure who this was for until about 5 minutes in.",
        "Demo portion was helpful but came too late.",
        "Too much technical detail without explaining why I should care.",
        "Felt like this was made for people who already understand the product.",
        "Pacing was slow. Consider cutting 2-3 minutes.",
      ],
    },

    actionPlan: [
      {
        action: "Rewrite opening 45 seconds to explicitly state target audience and core benefit",
        why: "14/20 reviewers couldn't identify audience or value within critical first 30 seconds",
        expectedResult: "Improved hook retention. Clarity score increase from 68 to ~78.",
      },
      {
        action: "Move demo segment from 8:00 to 3:30 mark",
        why: "Show before tell. Demo is strongest section but appears too late.",
        expectedResult: "Improved engagement curve. Engagement score increase from 65 to ~75.",
      },
      {
        action: "Cut company history tangent (10:00-11:00) entirely",
        why: "Not relevant to target audience. Causes engagement drop.",
        expectedResult: "Tighter pacing. Overall video length reduced to ~14 minutes.",
      },
    ],
  },

  {
    id: "rpt_003",
    videoTitle: "Customer Onboarding Flow.mov",
    duration: "8:45",
    videoDuration: 8.75,
    languagePool: "english_global",
    status: "delivered",
    guaranteedReviewers: 15,
    slaWindow: "Within 24 hours",
    actualDeliveryTime: "18 hours",
    dateSubmitted: "2025-12-28",
    dateCompleted: "2025-12-29",
    aiComplete: true,
    humanComplete: true,
    compiled: true,

    executiveSummary:
      "Clear, concise tutorial with strong pacing. Minor clarity issues in step 3, but overall execution is solid. Suitable for immediate use with minimal edits.",

    clarityScore: 88,
    pacingScore: 92,
    engagementScore: 85,
    structureScore: 90,

    timelineInsights: [
      {
        timestamp: "0:00-0:20",
        observation: "Excellent opening. Clear statement of what user will learn.",
        severity: "minor",
        category: "hook",
      },
      {
        timestamp: "3:15-3:45",
        observation: "Step 3 explanation moves quickly. 6/15 reviewers requested slower pace or repeat.",
        severity: "moderate",
        category: "pace",
      },
      {
        timestamp: "7:00-8:45",
        observation: "Strong summary and next steps. Clear call-to-action.",
        severity: "minor",
        category: "structure",
      },
    ],

    aiAnalysis: {
      monologueStretches: ["4:00-5:15: 75-second segment (acceptable for tutorial format)"],
      silenceDowntime: ["2:30-2:33: 3-second pause (within normal range)"],
      topicDrift: [],
      energyVariance: ["Consistent medium-high energy throughout (7/10)"],
    },

    humanReviews: {
      engagementStats:
        "14/15 reviewers stayed fully engaged. 15/15 understood all steps by conclusion. 13/15 felt confident to implement independently.",
      comments: [
        "Perfect length and pacing for a tutorial.",
        "Step 3 went a bit fast - consider adding a 5-second pause or on-screen checklist.",
        "Clear structure. I knew exactly where I was in the process.",
        "Great use of screen recording with voiceover.",
        "Would love to see this format for other features.",
      ],
    },

    actionPlan: [
      {
        action: "Add 5-second pause with on-screen checklist after step 3 (3:45 mark)",
        why: "6/15 reviewers noted faster pace here. Low-effort improvement.",
        expectedResult: "Improved clarity score from 88 to ~92. Reduced user support questions.",
      },
      {
        action: "Consider creating companion PDF with written steps",
        why: "Multiple reviewers mentioned wanting reference material",
        expectedResult: "Increased perceived value. Better user outcomes.",
      },
    ],
  },

  {
    id: "rpt_004",
    videoTitle: "Q4 Feature Announcement.mp4",
    duration: "6:20",
    videoDuration: 6.3,
    languagePool: "english_global",
    status: "delivered",
    guaranteedReviewers: 15,
    slaWindow: "Within 24 hours",
    actualDeliveryTime: "22 hours",
    dateSubmitted: "2025-12-26",
    dateCompleted: "2025-12-27",
    aiComplete: true,
    humanComplete: true,
    compiled: true,

    executiveSummary:
      "High energy and engaging presentation. Hook is effective and pacing is strong. Minor structural issue with feature ordering, but overall very strong execution.",

    clarityScore: 85,
    pacingScore: 90,
    engagementScore: 92,
    structureScore: 82,

    timelineInsights: [
      {
        timestamp: "0:00-0:25",
        observation: "Energetic hook with clear excitement. 14/15 reviewers reported interest within 10 seconds.",
        severity: "minor",
        category: "hook",
      },
      {
        timestamp: "2:10-3:00",
        observation: "Feature 3 (collaboration tools) seems more significant than its placement suggests.",
        severity: "moderate",
        category: "structure",
      },
      {
        timestamp: "5:30-6:20",
        observation: "Strong closing with clear launch dates and access information.",
        severity: "minor",
        category: "structure",
      },
    ],

    aiAnalysis: {
      monologueStretches: [],
      silenceDowntime: [],
      topicDrift: [],
      energyVariance: ["Consistent high energy throughout (8/10)"],
    },

    humanReviews: {
      engagementStats:
        "15/15 reviewers stayed fully engaged. 14/15 reported excitement about announced features. 12/15 noted clear understanding of availability timeline.",
      comments: [
        "Great energy! I felt the excitement about these features.",
        "The collaboration tools seem huge - maybe lead with that?",
        "Perfect length for an announcement video.",
        "Clear visuals and good pacing between features.",
        "Ending was strong with specific dates and next steps.",
      ],
    },

    actionPlan: [
      {
        action: "Reorder features: lead with collaboration tools (currently feature 3)",
        why: "Multiple reviewers noted this seems like the most significant feature",
        expectedResult: "Stronger progression. Improved structure score from 82 to ~88.",
      },
      {
        action: "Consider adding 10-second teaser for Q1 roadmap at end",
        why: "Maintain momentum and ongoing engagement",
        expectedResult: "Sustained interest. Sets up future communication.",
      },
    ],
  },

  {
    id: "rpt_005",
    videoTitle: "Tutorial Series Ep 8.mov",
    duration: "18:30",
    videoDuration: 18.5,
    languagePool: "spanish_latam",
    status: "delivered",
    guaranteedReviewers: 12,
    slaWindow: "Within 72 hours",
    actualDeliveryTime: "68 hours",
    dateSubmitted: "2025-12-23",
    dateCompleted: "2025-12-26",
    aiComplete: true,
    humanComplete: true,
    compiled: true,

    executiveSummary:
      "Comprehensive tutorial with good technical depth. Length is appropriate for complexity, though middle section could benefit from tighter editing. Language-specific reviewers noted excellent clarity of Spanish terminology.",

    clarityScore: 86,
    pacingScore: 78,
    engagementScore: 81,
    structureScore: 88,

    timelineInsights: [
      {
        timestamp: "0:00-1:10",
        observation: "Clear introduction with episode context and learning objectives.",
        severity: "minor",
        category: "structure",
      },
      {
        timestamp: "8:00-10:30",
        observation: "Repetitive explanation of concept already covered in episode 6.",
        severity: "moderate",
        category: "pace",
      },
      {
        timestamp: "15:00-17:30",
        observation: "Advanced technique well-explained. Reviewers noted good use of visual aids.",
        severity: "minor",
        category: "clarity",
      },
    ],

    aiAnalysis: {
      monologueStretches: ["11:00-13:30: 150-second explanation (appropriate for tutorial complexity)"],
      silenceDowntime: ["4:20-4:26: 6-second pause during code execution (acceptable)"],
      topicDrift: ["8:00-10:30: Recap of previous episode content"],
      energyVariance: ["Consistent medium energy (6/10) appropriate for technical content"],
    },

    humanReviews: {
      engagementStats:
        "11/12 reviewers stayed engaged throughout. 12/12 reported understanding advanced concept. 10/12 noted clear Spanish terminology.",
      comments: [
        "Excelente uso de terminología técnica en español.",
        "La sección del minuto 8-10 es repetitiva si ya vi el episodio 6.",
        "Buen ritmo para contenido avanzado.",
        "Las ayudas visuales ayudaron mucho con el concepto complejo.",
        "Tal vez agregar timestamps en la descripción para referencia rápida.",
      ],
    },

    actionPlan: [
      {
        action: "Reduce episode 6 recap from 2:30 to 45 seconds with 'See Ep 6 for full details' reference",
        why: "Repetitive for series viewers. Saves 1:45 of runtime.",
        expectedResult: "Improved pacing score from 78 to ~84. Tighter episode length.",
      },
      {
        action: "Add chapter markers at 0:00, 4:00, 11:00, 15:00 for easy navigation",
        why: "Reviewer suggestion for reference material. Low effort, high value.",
        expectedResult: "Improved user experience for tutorial series format.",
      },
    ],
  },

  {
    id: "rpt_006",
    videoTitle: "Webinar Recording - Advanced Techniques.mp4",
    duration: "42:15",
    videoDuration: 42.25,
    languagePool: "english_global",
    status: "in_progress",
    guaranteedReviewers: 25,
    slaWindow: "Within 96 hours",
    dateSubmitted: "2025-12-28",
    aiComplete: true,
    humanComplete: false,
    compiled: false,

    executiveSummary: "",
    clarityScore: 0,
    pacingScore: 0,
    engagementScore: 0,
    structureScore: 0,
    timelineInsights: [],
    aiAnalysis: {
      monologueStretches: [],
      silenceDowntime: [],
      topicDrift: [],
      energyVariance: [],
    },
    humanReviews: {
      engagementStats: "",
      comments: [],
    },
    actionPlan: [],
  },

  {
    id: "rpt_007",
    videoTitle: "Product Walkthrough - New UI.mov",
    duration: "11:20",
    videoDuration: 11.3,
    languagePool: "portuguese_brazil",
    status: "awaiting_human",
    guaranteedReviewers: 15,
    slaWindow: "Within 48 hours",
    dateSubmitted: "2025-12-29",
    aiComplete: true,
    humanComplete: false,
    compiled: false,

    executiveSummary: "",
    clarityScore: 0,
    pacingScore: 0,
    engagementScore: 0,
    structureScore: 0,
    timelineInsights: [],
    aiAnalysis: {
      monologueStretches: [],
      silenceDowntime: [],
      topicDrift: [],
      energyVariance: [],
    },
    humanReviews: {
      engagementStats: "",
      comments: [],
    },
    actionPlan: [],
  },

  {
    id: "rpt_008",
    videoTitle: "Sales Pitch V1.mp4",
    duration: "5:45",
    videoDuration: 5.75,
    languagePool: "english_global",
    status: "compiling",
    guaranteedReviewers: 15,
    slaWindow: "Within 24 hours",
    dateSubmitted: "2025-12-29",
    dateCompleted: "2025-12-29",
    aiComplete: true,
    humanComplete: true,
    compiled: false,

    executiveSummary: "",
    clarityScore: 0,
    pacingScore: 0,
    engagementScore: 0,
    structureScore: 0,
    timelineInsights: [],
    aiAnalysis: {
      monologueStretches: [],
      silenceDowntime: [],
      topicDrift: [],
      energyVariance: [],
    },
    humanReviews: {
      engagementStats: "",
      comments: [],
    },
    actionPlan: [],
  },

  {
    id: "rpt_009",
    videoTitle: "Company Culture Video.mov",
    duration: "3:30",
    videoDuration: 3.5,
    languagePool: "english_global",
    status: "delivered",
    guaranteedReviewers: 10,
    slaWindow: "Within 24 hours",
    actualDeliveryTime: "16 hours",
    dateSubmitted: "2025-12-27",
    dateCompleted: "2025-12-28",
    aiComplete: true,
    humanComplete: true,
    compiled: true,

    executiveSummary:
      "Authentic, well-paced culture overview. Strong visual storytelling with employee interviews. Minor audio quality issues in outdoor segments, but overall highly effective for recruitment purposes.",

    clarityScore: 90,
    pacingScore: 88,
    engagementScore: 94,
    structureScore: 92,

    timelineInsights: [
      {
        timestamp: "0:00-0:15",
        observation: "Compelling opening montage. 10/10 reviewers reported immediate positive impression.",
        severity: "minor",
        category: "hook",
      },
      {
        timestamp: "1:45-2:10",
        observation: "Outdoor interview has slight wind noise. Doesn't obscure message but noticeable.",
        severity: "minor",
        category: "clarity",
      },
      {
        timestamp: "3:00-3:30",
        observation: "Strong closing with values statement and recruitment CTA.",
        severity: "minor",
        category: "structure",
      },
    ],

    aiAnalysis: {
      monologueStretches: [],
      silenceDowntime: [],
      topicDrift: [],
      energyVariance: ["High positive energy throughout (9/10)"],
    },

    humanReviews: {
      engagementStats:
        "10/10 reviewers stayed fully engaged. 10/10 reported positive impression of company. 9/10 noted authenticity of employee interviews.",
      comments: [
        "This feels genuine, not like typical corporate video.",
        "Employee interviews are the strongest part.",
        "Great pacing - 3:30 is perfect length.",
        "Wind noise at 1:50 is slightly distracting but not a deal-breaker.",
        "I'd want to work here after watching this.",
      ],
    },

    actionPlan: [
      {
        action: "Apply light noise reduction filter to 1:45-2:10 segment",
        why: "Minor audio issue noted by multiple reviewers. Easy post-production fix.",
        expectedResult: "Improved clarity score from 90 to ~93. More professional polish.",
      },
      {
        action: "No other changes recommended - proceed with publication",
        why: "Video achieves its purpose effectively. High engagement and authenticity.",
        expectedResult: "Strong recruitment tool. Use as template for future culture videos.",
      },
    ],
  },

  {
    id: "rpt_010",
    videoTitle: "Explainer - How It Works.mp4",
    duration: "4:15",
    videoDuration: 4.25,
    languagePool: "french_europe",
    status: "delivered",
    guaranteedReviewers: 10,
    slaWindow: "Within 48 hours",
    actualDeliveryTime: "44 hours",
    dateSubmitted: "2025-12-24",
    dateCompleted: "2025-12-26",
    aiComplete: true,
    humanComplete: true,
    compiled: true,

    executiveSummary:
      "Concise, animated explainer with clear progression. French language reviewers noted excellent localization. Animation quality is high, though step 2 could benefit from additional 3-5 seconds of explanation time.",

    clarityScore: 84,
    pacingScore: 86,
    engagementScore: 88,
    structureScore: 90,

    timelineInsights: [
      {
        timestamp: "0:00-0:20",
        observation: "Clear problem statement. Effective opening for explainer format.",
        severity: "minor",
        category: "hook",
      },
      {
        timestamp: "1:30-1:50",
        observation: "Step 2 moves quickly. 4/10 reviewers wanted slightly more detail.",
        severity: "moderate",
        category: "pace",
      },
      {
        timestamp: "3:45-4:15",
        observation: "Strong CTA with multiple language-appropriate contact options.",
        severity: "minor",
        category: "structure",
      },
    ],

    aiAnalysis: {
      monologueStretches: [],
      silenceDowntime: [],
      topicDrift: [],
      energyVariance: ["Consistent upbeat energy (7/10) appropriate for explainer"],
    },

    humanReviews: {
      engagementStats:
        "10/10 reviewers stayed engaged throughout. 9/10 understood full process. 10/10 noted high-quality French translation.",
      comments: [
        "Animation professionnelle et claire.",
        "L'étape 2 pourrait utiliser quelques secondes de plus d'explication.",
        "Excellente localisation - pas seulement une traduction.",
        "Longueur parfaite pour ce type de vidéo.",
        "La musique de fond complète bien sans être distrayante.",
      ],
    },

    actionPlan: [
      {
        action: "Extend step 2 explanation by 4-5 seconds (1:45-1:50 segment)",
        why: "4/10 reviewers wanted more detail. Minimal re-animation required.",
        expectedResult: "Improved clarity score from 84 to ~88. Better comprehension of full process.",
      },
      {
        action: "Create English and Spanish versions using same animation template",
        why: "High-quality asset. French reviewers noted excellent localization approach.",
        expectedResult: "Scalable explainer content for multiple markets.",
      },
    ],
  },

  {
    id: "rpt_011",
    videoTitle: "Case Study - Enterprise Client.mov",
    duration: "7:55",
    videoDuration: 7.9,
    languagePool: "english_global",
    status: "delivered",
    guaranteedReviewers: 15,
    slaWindow: "Within 24 hours",
    actualDeliveryTime: "20 hours",
    dateSubmitted: "2025-12-25",
    dateCompleted: "2025-12-26",
    aiComplete: true,
    humanComplete: true,
    compiled: true,

    executiveSummary:
      "Professional case study with strong client testimonial. Data visualization is effective, though some metrics could be explained more clearly for viewers unfamiliar with industry benchmarks.",

    clarityScore: 82,
    pacingScore: 85,
    engagementScore: 80,
    structureScore: 88,

    timelineInsights: [
      {
        timestamp: "0:00-0:40",
        observation: "Effective problem setup with client context.",
        severity: "minor",
        category: "hook",
      },
      {
        timestamp: "3:20-4:00",
        observation:
          "Metrics shown without context. 7/15 reviewers unfamiliar with '40% improvement in NPS' significance.",
        severity: "moderate",
        category: "clarity",
      },
      {
        timestamp: "5:30-6:45",
        observation: "Client testimonial is authentic and compelling. Strongest segment.",
        severity: "minor",
        category: "engagement",
      },
      {
        timestamp: "7:20-7:55",
        observation: "Clear call-to-action with contact information and case study download offer.",
        severity: "minor",
        category: "structure",
      },
    ],

    aiAnalysis: {
      monologueStretches: ["2:00-3:15: 75-second solution overview"],
      silenceDowntime: [],
      topicDrift: [],
      energyVariance: ["Professional medium energy throughout (6/10) appropriate for enterprise content"],
    },

    humanReviews: {
      engagementStats:
        "13/15 reviewers stayed engaged. 12/15 understood value proposition. 8/15 wanted more context on metrics.",
      comments: [
        "Client testimonial feels genuine and specific.",
        "What does 40% NPS improvement mean compared to industry average?",
        "Good balance of problem-solution-results structure.",
        "Professional production quality appropriate for enterprise audience.",
        "Would appreciate more before/after comparison visuals.",
        "Length is good - not too long for a case study.",
      ],
    },

    actionPlan: [
      {
        action: "Add 5-second context overlay for NPS metric at 3:25 ('Benchmark: Industry avg is 15% improvement')",
        why: "7/15 reviewers lacked context for metrics significance",
        expectedResult: "Improved clarity score from 82 to ~87. Stronger proof of impact.",
      },
      {
        action: "Insert 8-second before/after visual comparison at 4:10",
        why: "Reviewer request for more comparative visuals. Shows transformation clearly.",
        expectedResult: "Improved engagement score from 80 to ~85. Stronger visual storytelling.",
      },
      {
        action: "Consider creating case study series template based on this structure",
        why: "Strong format. Repeatable for multiple clients.",
        expectedResult: "Consistent, professional case study content pipeline.",
      },
    ],
  },

  {
    id: "rpt_012",
    videoTitle: "Year in Review 2024.mp4",
    duration: "9:40",
    videoDuration: 9.7,
    languagePool: "english_global",
    status: "delivered",
    guaranteedReviewers: 20,
    slaWindow: "Within 48 hours",
    actualDeliveryTime: "38 hours",
    dateSubmitted: "2025-12-21",
    dateCompleted: "2025-12-23",
    aiComplete: true,
    humanComplete: true,
    compiled: true,

    executiveSummary:
      "Celebratory year-in-review with strong visual storytelling and effective milestone pacing. High energy throughout. Consider reducing statistics density in middle section to maintain engagement momentum.",

    clarityScore: 78,
    pacingScore: 83,
    engagementScore: 86,
    structureScore: 85,

    timelineInsights: [
      {
        timestamp: "0:00-0:30",
        observation: "High-energy opening montage. 19/20 reviewers reported positive first impression.",
        severity: "minor",
        category: "hook",
      },
      {
        timestamp: "4:00-5:30",
        observation: "Dense statistics segment. 11/20 reviewers noted information overload.",
        severity: "moderate",
        category: "clarity",
      },
      {
        timestamp: "7:00-8:00",
        observation: "Employee/customer highlight montage is engaging and humanizes achievements.",
        severity: "minor",
        category: "engagement",
      },
      {
        timestamp: "9:10-9:40",
        observation: "Forward-looking closing statement maintains momentum into new year.",
        severity: "minor",
        category: "structure",
      },
    ],

    aiAnalysis: {
      monologueStretches: ["4:00-5:30: 90-second statistics recitation"],
      silenceDowntime: [],
      topicDrift: [],
      energyVariance: ["Opening: High (9/10)", "Minutes 4-5: Slight drop (6/10)", "Closing: High (8/10)"],
    },

    humanReviews: {
      engagementStats:
        "19/20 reviewers stayed engaged through opening. 14/20 maintained attention through statistics. 18/20 felt energized by closing.",
      comments: [
        "Love the energy and celebration of achievements.",
        "Stats section at 4-5 minutes is a lot to absorb - maybe visualize more?",
        "The people montage at 7:00 is my favorite part. More human connection.",
        "Great way to close out the year and look forward.",
        "Music choice is perfect for the celebratory tone.",
        "Consider breaking this into quarterly highlights instead of all at once?",
      ],
    },

    actionPlan: [
      {
        action:
          "Reduce statistics from 90 seconds to 45 seconds. Visualize top 5 metrics only, put rest in description.",
        why: "11/20 reviewers noted information overload. Maintains momentum without losing key data.",
        expectedResult: "Improved clarity score from 78 to ~85. Better engagement retention through middle section.",
      },
      {
        action: "Extend people/customer montage from 60 to 90 seconds using additional footage",
        why: "Most engaging segment per reviewers. Human stories resonate more than numbers.",
        expectedResult: "Improved engagement score from 86 to ~90. Stronger emotional connection.",
      },
    ],
  },
]

// Language pool labels
export const languagePoolLabels: Record<LanguagePool, string> = {
  english_global: "English (Global)",
  spanish_latam: "Spanish (LATAM)",
  portuguese_brazil: "Portuguese (Brazil)",
  french_europe: "French (Europe)",
  german: "German",
  japanese: "Japanese",
  korean: "Korean",
  hindi: "Hindi",
}

// Status labels
export const statusLabels: Record<ReportStatus, string> = {
  delivered: "Delivered",
  in_progress: "In Progress",
  awaiting_human: "Awaiting Human Review",
  compiling: "Compiling",
}
