import { NextRequest, NextResponse } from "next/server"

/** @deprecated Supabase callback — redirect to home; use /api/auth/callback/google */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url))
}
