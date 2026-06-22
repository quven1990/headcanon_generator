import { NextRequest, NextResponse } from "next/server"
import { sanitizeNextPath } from "@/lib/auth/redirect"

/** @deprecated Use /api/auth/google — kept for existing links */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"))
  const target = new URL("/api/auth/google", requestUrl.origin)
  if (next !== "/") target.searchParams.set("next", next)
  return NextResponse.redirect(target)
}
