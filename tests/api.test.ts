import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { api } from "@/lib/api"
import { ApiRequestError, AuthenticationError } from "@/lib/types/api"
import { authStore } from "@/lib/authStore"

vi.mock("@/lib/authStore", () => ({
  authStore: {
    getAccessToken: vi.fn(() => null),
    refresh: vi.fn(() => false),
    clear: vi.fn(),
  },
}))

describe("api client", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("retries safe GET once after a network error", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Network error"))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ success: true, data: { ok: true }, timestamp: "now" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )

    vi.stubGlobal("fetch", fetchMock)

    const promise = api.get<{ ok: boolean }>("/health")

    await vi.runAllTimersAsync()

    await expect(promise).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("does not retry non-GET requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          error: { code: "SERVER_ERROR", message: "Boom" },
          timestamp: "now",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    )

    vi.stubGlobal("fetch", fetchMock)

    await expect(api.post("/fail", { ok: false })).rejects.toBeInstanceOf(ApiRequestError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("does not retry PUT requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          error: { code: "SERVER_ERROR", message: "Boom" },
          timestamp: "now",
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      )
    )

    vi.stubGlobal("fetch", fetchMock)

    await expect(api.put("/fail", { ok: false })).rejects.toBeInstanceOf(ApiRequestError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("redirects to sign-in when refresh fails after 401", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Nope" },
          timestamp: "now",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    )

    const assign = vi.fn()
    Object.defineProperty(window, "location", {
      value: { assign },
      writable: true,
    })

    vi.stubGlobal("fetch", fetchMock)

    await expect(api.get("/secure")).rejects.toBeInstanceOf(AuthenticationError)
    expect(authStore.clear).toHaveBeenCalled()
    expect(assign).toHaveBeenCalledWith("/auth/sign-in?reason=session-expired")
  })
})
