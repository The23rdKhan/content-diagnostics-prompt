"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"
import { api } from "@/lib/api"

// =============================================================================
// Types
// =============================================================================

export interface PaymentMethod {
  id: string
  type: "CARD" | "BANK"
  lastFour: string
  expiryMonth?: number
  expiryYear?: number
  brand?: string
  bankName?: string
}

export interface BillingSummary {
  currentPlanCost: number
  addonsThisMonth: number
  nextInvoiceAmount: number
  nextInvoiceDate: string
  currency: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  amount: number
  status: "PAID" | "PENDING" | "OVERDUE" | "REFUNDED"
  pdfUrl?: string
  currency: string
}

interface InvoicesResponse {
  invoices: Invoice[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Hook to fetch billing summary.
 */
export function useBillingSummary() {
  const { data, loading, error, refetch } = useApi<BillingSummary>(
    "/creator/billing/summary"
  )

  return {
    summary: data,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch payment method.
 */
export function usePaymentMethod() {
  const { data, loading, error, refetch } = useApi<PaymentMethod>(
    "/creator/billing/payment-method"
  )

  return {
    paymentMethod: data,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch invoice history.
 */
export function useInvoices(page: number = 0, size: number = 10) {
  const { data, loading, error, refetch } = useApi<InvoicesResponse>(
    `/creator/billing/invoices?page=${page}&size=${size}`
  )

  return {
    invoices: data?.invoices ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook for downloading invoice PDF.
 */
export function useDownloadInvoice() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const downloadInvoice = useCallback(
    async (invoiceId: string): Promise<void> => {
      setLoading(invoiceId)
      setError(null)

      try {
        // This will typically return a blob or redirect to PDF
        const response = await fetch(`/api/creator/billing/invoices/${invoiceId}/download`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error("Failed to download invoice")
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${invoiceId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to download invoice")
        setError(error)
        throw error
      } finally {
        setLoading(null)
      }
    },
    []
  )

  return {
    downloadInvoice,
    loading,
    error,
  }
}

/**
 * Hook for initiating payment method update (Stripe redirect).
 */
export function useUpdatePaymentMethod() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const initiateUpdate = useCallback(async (): Promise<string> => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.post<{ url: string }>(
        "/creator/billing/payment-method/update-session",
        {}
      )
      return result.url
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to initiate payment update")
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    initiateUpdate,
    loading,
    error,
  }
}
