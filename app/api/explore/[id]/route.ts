import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    // 使用 service_role key 查询数据（无需登录，显示所有人的记录）
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Server configuration error: service_role key not found" },
        { status: 500 }
      )
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 查询指定的生成记录（所有用户的记录）
    const recordId = parseInt(id, 10)
    if (isNaN(recordId)) {
      return NextResponse.json(
        { error: "Invalid record ID" },
        { status: 400 }
      )
    }

    const { data, error } = await adminSupabase
      .from("headcanon_generations")
      .select("*")
      .eq("id", recordId)
      .eq("is_deleted", 0)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return NextResponse.json(
          { error: "Generation not found" },
          { status: 404 }
        )
      }
      console.error("Database query error:", error)
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: "Generation not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Explore detail API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
