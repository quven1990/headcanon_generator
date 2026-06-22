import { getCloudflareContext } from "@opennextjs/cloudflare"

type RuntimeBindings = Record<string, string | undefined>

export async function getRuntimeEnv(): Promise<RuntimeBindings> {
  try {
    const { env } = await getCloudflareContext({ async: true })
    return env as RuntimeBindings
  } catch {
    return {}
  }
}

export async function getEnvVar(name: string): Promise<string | undefined> {
  const runtimeEnv = await getRuntimeEnv()
  return runtimeEnv[name] ?? process.env[name]
}
