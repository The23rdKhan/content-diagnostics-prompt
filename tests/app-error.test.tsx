import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AppError from "@/app/error"

describe("app error boundary", () => {
  it("renders error and triggers reset", async () => {
    const reset = vi.fn()
    render(<AppError error={new Error("Boom")} reset={reset} />)

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: /try again/i }))
    expect(reset).toHaveBeenCalled()
  })

  it("shows sign-in action for auth errors", () => {
    const reset = vi.fn()
    const error = new Error("Session expired")
    error.name = "AuthenticationError"

    render(<AppError error={error} reset={reset} />)

    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/auth/sign-in")
  })
})
