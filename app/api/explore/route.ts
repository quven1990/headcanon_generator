import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '12', 10)
    const offset = (page - 1) * limit

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

    // 查询总数
    const { count, error: countError } = await adminSupabase
      .from("headcanon_generations")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .eq("is_deleted", 0)

    if (countError) {
      console.error("Database count error:", countError)
    }

    // 查询用户的生成记录，按创建时间倒序排列，排除已删除的记录
    const { data, error } = await adminSupabase
      .from("headcanon_generations")
      .select("*")
      .eq("user_id", userId)
      .eq("is_deleted", 0)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Database query error:", error)
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 }
      )
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    })
  } catch (error) {
    console.error("Explore API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
