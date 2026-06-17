import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { CloudflareAuthEnv } from "./types"

export async function getAuthEnv(): Promise<CloudflareAuthEnv> {
  const { env } = await getCloudflareContext({ async: true })
  const authEnv = env as unknown as CloudflareAuthEnv

  if (!authEnv.DB) {
    throw new Error("D1 binding DB is not configured. Add d1_databases to wrangler.jsonc.")
  }
  if (!authEnv.GOOGLE_CLIENT_ID || !authEnv.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set.")
  }

  return authEnv
}
