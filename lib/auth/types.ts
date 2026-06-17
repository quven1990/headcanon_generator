export interface AuthUser {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
}

export interface GoogleUserInfo {
  sub: string
  email: string
  email_verified?: boolean
  name?: string
  picture?: string
}

export interface CloudflareAuthEnv {
  DB: D1Database
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  OAUTH_REDIRECT_URI?: string
  NEXT_PUBLIC_SITE_URL?: string
}
