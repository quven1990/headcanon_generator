import { NextRequest, NextResponse } from "next/server"
import {
  buildSessionCookie,
  clearOAuthCookies,
  getOAuthStateFromRequest,
} from "@/lib/auth/cookies"
import { getAuthEnv } from "@/lib/auth/env"
import {
  exchangeGoogleCode,
  fetchGoogleUserInfo,
  resolveOAuthRedirectUri,
} from "@/lib/auth/google-oauth"
import { createSession, upsertGoogleUser } from "@/lib/auth/session"
import { sanitizeNextPath } from "@/lib/auth/redirect"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const stateParam = requestUrl.searchParams.get("state")
  const oauthError = requestUrl.searchParams.get("error")

  if (oauthError) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(oauthError)}`, requestUrl.origin)
    )
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(
      new URL("/?error=missing_oauth_code", requestUrl.origin)
    )
  }

  const { state: savedState, codeVerifier } = getOAuthStateFromRequest(request)
  const [state, encodedNext = encodeURIComponent("/")] = stateParam.split(":", 2)
  const nextPath = sanitizeNextPath(decodeURIComponent(encodedNext || "/"))

  if (!savedState || !codeVerifier || savedState !== state) {
    return NextResponse.redirect(
      new URL("/?error=invalid_oauth_state", requestUrl.origin)
    )
  }

  try {
    const env = await getAuthEnv()
    const redirectUri = resolveOAuthRedirectUri(request, env.OAUTH_REDIRECT_URI)

    const accessToken = await exchangeGoogleCode({
      code,
      codeVerifier,
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri,
    })

    const profile = await fetchGoogleUserInfo(accessToken)

    if (!profile.sub || !profile.email) {
      throw new Error("Google profile missing sub or email")
    }

    const userId = await upsertGoogleUser(env.DB, {
      sub: profile.sub,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    })

    const sessionId = await createSession(env.DB, userId, {
      userAgent: request.headers.get("user-agent"),
      ipAddress: request.headers.get("cf-connecting-ip"),
    })

    const redirectUrl = new URL(nextPath, requestUrl.origin)
    redirectUrl.searchParams.set("loginSuccess", "true")

    const response = NextResponse.redirect(redirectUrl)
    response.headers.append("Set-Cookie", buildSessionCookie(sessionId, request))
    for (const cookie of clearOAuthCookies(request)) {
      response.headers.append("Set-Cookie", cookie)
    }

    return response
  } catch (error) {
    console.error("Google OAuth callback error:", error)
    const message = error instanceof Error ? error.message : "OAuth callback failed"
    const response = NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(message)}`, requestUrl.origin)
    )
    for (const cookie of clearOAuthCookies(request)) {
      response.headers.append("Set-Cookie", cookie)
    }
    return response
  }
}
