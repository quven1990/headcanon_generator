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
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
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
    
    // 创建重定向响应，并携带所有 cookies
    const redirectResponse = NextResponse.redirect(redirectUrl)
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite as any,
        path: cookie.path,
        maxAge: cookie.expires ? undefined : 60 * 60 * 24 * 365, // 1 year default
      })
    })
    
    return redirectResponse
  }

  // 如果没有 code，直接重定向
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
