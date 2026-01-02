"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"
import { api } from "@/lib/api"

// =============================================================================
// Types
// =============================================================================

export interface SupportTicket {
  id: string
  subject: string
  message: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  priority: "LOW" | "MEDIUM" | "HIGH"
  createdAt: string
  updatedAt: string
  replies?: TicketReply[]
}

export interface TicketReply {
  id: string
  ticketId: string
  message: string
  author: "USER" | "SUPPORT_TEAM"
  createdAt: string
}

export interface CreateTicketRequest {
  subject: string
  message: string
  priority?: "LOW" | "MEDIUM" | "HIGH"
}

interface TicketsResponse {
  tickets: SupportTicket[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Hook to fetch support tickets for the current user.
 */
export function useSupportTickets(page: number = 0, size: number = 10) {
  const { data, loading, error, refetch } = useApi<TicketsResponse>(
    `/support/tickets?page=${page}&size=${size}`
  )

  return {
    tickets: data?.tickets ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook for creating support tickets.
 */
export function useCreateTicket() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createTicket = useCallback(
    async (request: CreateTicketRequest): Promise<SupportTicket> => {
      setLoading(true)
      setError(null)

      try {
        const result = await api.post<SupportTicket>("/support/tickets", request)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to create ticket")
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    createTicket,
    loading,
    error,
    clearError,
  }
}

/**
 * Hook for adding replies to tickets.
 */
export function useTicketReply() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const addReply = useCallback(
    async (ticketId: string, message: string): Promise<TicketReply> => {
      setLoading(true)
      setError(null)

      try {
        const result = await api.post<TicketReply>(
          `/support/tickets/${ticketId}/replies`,
          { message }
        )
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to add reply")
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    addReply,
    loading,
    error,
  }
}
