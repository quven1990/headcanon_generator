const HOURLY_GENERATION_LIMIT = 20

export async function checkGenerationRateLimit(
  db: D1Database,
  userId: string
): Promise<{ allowed: boolean; remaining: number }> {
  const row = await db
    .prepare(
      `SELECT COUNT(*) as count FROM headcanon_generations
       WHERE user_id = ?
         AND datetime(created_at) > datetime('now', '-1 hour')`
    )
    .bind(userId)
    .first<{ count: number }>()

  const used = row?.count ?? 0
  const remaining = Math.max(0, HOURLY_GENERATION_LIMIT - used)

  return {
    allowed: used < HOURLY_GENERATION_LIMIT,
    remaining,
  }
}
