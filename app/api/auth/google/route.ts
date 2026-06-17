import { NextRequest, NextResponse } from "next/server"
import { buildOAuthCookies } from "@/lib/auth/cookies"
import { getAuthEnv } from "@/lib/auth/env"
import { buildGoogleAuthUrl, resolveOAuthRedirectUri } from "@/lib/auth/google-oauth"
import { createPkcePair, generateRandomString } from "@/lib/auth/pkce"

export async function GET(request: NextRequest) {
  try {
    const env = await getAuthEnv()
    const requestUrl = new URL(request.url)
    const next = requestUrl.searchParams.get("next") || "/"

    const state = generateRandomString(32)
    const { codeVerifier, codeChallenge } = await createPkcePair()
    const redirectUri = resolveOAuthRedirectUri(request, env.OAUTH_REDIRECT_URI)

    const googleUrl = buildGoogleAuthUrl({
      clientId: env.GOOGLE_CLIENT_ID,
      redirectUri,
      state: `${state}:${encodeURIComponent(next)}`,
      codeChallenge,
    })

    const response = NextResponse.redirect(googleUrl)
    for (const cookie of buildOAuthCookies(state, codeVerifier, request)) {
      response.headers.append("Set-Cookie", cookie)
    }

    return response
  } catch (error) {
    console.error("Google OAuth start error:", error)
    const message = error instanceof Error ? error.message : "OAuth configuration error"
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(message)}`, request.url)
    )
  }
}
