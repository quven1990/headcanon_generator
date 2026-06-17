import type { AuthUser, CloudflareAuthEnv } from "./types"
import { getSessionIdFromRequest } from "./cookies"

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

export async function upsertGoogleUser(
  db: D1Database,
  profile: { sub: string; email: string; name?: string; picture?: string }
): Promise<string> {
  const existing = await db
    .prepare("SELECT id FROM users WHERE google_sub = ?")
    .bind(profile.sub)
    .first<{ id: string }>()

  if (existing?.id) {
    await db
      .prepare(
        `UPDATE users SET email = ?, name = ?, avatar_url = ?, updated_at = datetime('now') WHERE id = ?`
      )
      .bind(profile.email, profile.name ?? null, profile.picture ?? null, existing.id)
      .run()
    return existing.id
  }

  const userId = crypto.randomUUID()
  await db
    .prepare(
      `INSERT INTO users (id, google_sub, email, name, avatar_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    )
    .bind(userId, profile.sub, profile.email, profile.name ?? null, profile.picture ?? null)
    .run()

  return userId
}

export async function createSession(
  db: D1Database,
  userId: string,
  meta?: { userAgent?: string | null; ipAddress?: string | null }
): Promise<string> {
  const sessionId = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()

  await db
    .prepare(
      `INSERT INTO sessions (id, user_id, expires_at, created_at, user_agent, ip_address)
       VALUES (?, ?, ?, datetime('now'), ?, ?)`
    )
    .bind(sessionId, userId, expiresAt, meta?.userAgent ?? null, meta?.ipAddress ?? null)
    .run()

  return sessionId
}

export async function deleteSession(db: D1Database, sessionId: string): Promise<void> {
  await db.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run()
}

export async function getCurrentUser(
  request: Request,
  env: CloudflareAuthEnv
): Promise<AuthUser | null> {
  const sessionId = getSessionIdFromRequest(request)
  if (!sessionId) return null

  const row = await env.DB.prepare(
    `SELECT u.id, u.email, u.name, u.avatar_url
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = ?
       AND datetime(s.expires_at) > datetime('now')`
  )
    .bind(sessionId)
    .first<AuthUser>()

  return row ?? null
}
