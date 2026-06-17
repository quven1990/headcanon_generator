import { NextRequest, NextResponse } from "next/server"
import { clearSessionCookie, getSessionIdFromRequest } from "@/lib/auth/cookies"
import { getAuthEnv } from "@/lib/auth/env"
import { deleteSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const env = await getAuthEnv()
    const sessionId = getSessionIdFromRequest(request)

    if (sessionId) {
      await deleteSession(env.DB, sessionId)
    }

    const response = NextResponse.json({ ok: true })
    response.headers.append("Set-Cookie", clearSessionCookie(request))
    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
