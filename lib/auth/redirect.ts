/** Only allow same-origin relative paths after OAuth login. */
export function sanitizeNextPath(path: string | null | undefined): string {
  if (!path) return "/"

  const trimmed = path.trim()
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/"
  if (trimmed.includes("://") || trimmed.includes("\\")) return "/"

  try {
    const url = new URL(trimmed, "https://www.headcanonforge.com")
    if (url.pathname !== trimmed.split("?")[0].split("#")[0]) return "/"
  } catch {
    return "/"
  }

  return trimmed
}
