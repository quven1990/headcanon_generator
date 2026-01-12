import { createServerClient } from "@supabase/ssr"
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

    // 创建客户端用于验证用户
    let supabaseResponse = NextResponse.next({
      request: {
        headers: req.headers,
      },
    })

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // 使用 service_role key 查询数据
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

    // 转换 user_id: UUID字符串转bigint
    function uuidToBigInt(uuid: string): number {
      try {
        const cleanUuid = uuid.replace(/-/g, '')
        let hash = 0
        for (let i = 0; i < Math.min(15, cleanUuid.length); i++) {
          const char = cleanUuid.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash
        }
        return Math.abs(hash) % Number.MAX_SAFE_INTEGER
      } catch (error) {
        return 0
      }
    }

    const userId = uuidToBigInt(user.id)

    // 查询指定的生成记录
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
      .eq("user_id", userId)
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
