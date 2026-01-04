import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  // 检查环境变量（支持多种变量名）
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent('Supabase 环境变量未配置')}`, requestUrl.origin)
    )
  }

  if (code) {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            // 注意：这里不能直接修改 response，需要在 exchangeCodeForSession 之后创建
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Exchange code error:', error)
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      )
    }
    
    // 登录成功，在重定向 URL 中添加 loginSuccess 参数
    const redirectUrl = new URL(next, requestUrl.origin)
    redirectUrl.searchParams.set('loginSuccess', 'true')
    return NextResponse.redirect(redirectUrl)
  }

  // 如果没有 code，直接重定向
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
