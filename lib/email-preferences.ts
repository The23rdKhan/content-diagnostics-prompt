export interface CreatorEmailPreferences {
  uploadReceived: boolean
  aiDiagnosticsReady: boolean
  reportReady: boolean
  subscriptionBilling: boolean
  addonConfirmations: boolean
}

export interface ReviewerEmailPreferences {
  qualificationResult: boolean
  taskApprovedRejected: boolean
  payoutProcessed: boolean
  policyUpdates: boolean
}

export const defaultCreatorEmailPreferences: CreatorEmailPreferences = {
  uploadReceived: true,
  aiDiagnosticsReady: false,
  reportReady: true,
  subscriptionBilling: true,
  addonConfirmations: false,
}

export const defaultReviewerEmailPreferences: ReviewerEmailPreferences = {
  qualificationResult: true,
  taskApprovedRejected: false,
  payoutProcessed: true,
  policyUpdates: false,
}
