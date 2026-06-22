import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { CloudflareAuthEnv, CloudflareDbEnv } from "./types"

async function getBindings(): Promise<CloudflareDbEnv> {
  const { env } = await getCloudflareContext({ async: true })
  return env as unknown as CloudflareDbEnv
}

export async function getDbEnv(): Promise<CloudflareDbEnv> {
  const bindings = await getBindings()

  if (!bindings.DB) {
    throw new Error("D1 binding DB is not configured. Add d1_databases to wrangler.jsonc.")
  }

  return bindings
}

export async function getAuthEnv(): Promise<CloudflareAuthEnv> {
  const bindings = await getDbEnv()

  if (!bindings.GOOGLE_CLIENT_ID || !bindings.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set.")
  }

  return bindings as CloudflareAuthEnv
}
