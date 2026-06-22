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

export interface CloudflareDbEnv {
  DB: D1Database
  OAUTH_REDIRECT_URI?: string
  NEXT_PUBLIC_SITE_URL?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  SILICONFLOW_API_KEY?: string
  SILICONFLOW_MODEL?: string
}

export interface CloudflareAuthEnv extends CloudflareDbEnv {
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
}
