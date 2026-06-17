const SESSION_COOKIE = "session"
const OAUTH_STATE_COOKIE = "oauth_state"
const OAUTH_VERIFIER_COOKIE = "oauth_code_verifier"

function isSecureContext(request?: Request): boolean {
  if (process.env.NODE_ENV === "production") return true
  if (!request) return false
  const url = new URL(request.url)
  return url.protocol === "https:"
}

function cookieSuffix(request?: Request, maxAgeSec?: number): string {
  const parts = ["Path=/", "HttpOnly", "SameSite=Lax"]
  if (isSecureContext(request)) parts.push("Secure")
  if (maxAgeSec !== undefined) parts.push(`Max-Age=${maxAgeSec}`)
  return parts.join("; ")
}

export function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {}
  return Object.fromEntries(
    header.split(";").map((part) => {
      const [key, ...rest] = part.trim().split("=")
      return [key, decodeURIComponent(rest.join("=") || "")]
    })
  )
}

export function getSessionIdFromRequest(request: Request): string | null {
  const cookies = parseCookies(request.headers.get("Cookie"))
  return cookies[SESSION_COOKIE] || null
}

export function buildSessionCookie(
  sessionId: string,
  request?: Request,
  maxAgeSec = 60 * 60 * 24 * 30
): string {
  return `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}; ${cookieSuffix(request, maxAgeSec)}`
}

export function clearSessionCookie(request?: Request): string {
  return `${SESSION_COOKIE}=; ${cookieSuffix(request, 0)}`
}

export function buildOAuthCookies(state: string, codeVerifier: string, request?: Request): string[] {
  const suffix = cookieSuffix(request, 600)
  return [
    `${OAUTH_STATE_COOKIE}=${encodeURIComponent(state)}; ${suffix}`,
    `${OAUTH_VERIFIER_COOKIE}=${encodeURIComponent(codeVerifier)}; ${suffix}`,
  ]
}

export function clearOAuthCookies(request?: Request): string[] {
  const suffix = cookieSuffix(request, 0)
  return [
    `${OAUTH_STATE_COOKIE}=; ${suffix}`,
    `${OAUTH_VERIFIER_COOKIE}=; ${suffix}`,
  ]
}

export function getOAuthStateFromRequest(request: Request): {
  state: string | null
  codeVerifier: string | null
} {
  const cookies = parseCookies(request.headers.get("Cookie"))
  return {
    state: cookies[OAUTH_STATE_COOKIE] || null,
    codeVerifier: cookies[OAUTH_VERIFIER_COOKIE] || null,
  }
}
