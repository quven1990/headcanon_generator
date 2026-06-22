import { NextRequest, NextResponse } from "next/server"
import { getDbEnv } from "@/lib/auth/env"
import { getCurrentUser } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  try {
    const env = await getDbEnv()
    const user = await getCurrentUser(request, env)

    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.name,
          name: user.name,
          avatar_url: user.avatar_url,
          picture: user.avatar_url,
        },
      },
    })
  } catch (error) {
    console.error("Auth me error:", error)
    return NextResponse.json({ user: null })
  }
}
