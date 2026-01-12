import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

/**
 * 获取认证回调 URL
 * 根据请求 URL 动态决定回调地址
 * 参考: https://supabase.com/docs/guides/auth/redirect-urls
 * 
 * 工作原理:
 * - 本地开发: requestUrl.origin = "http://localhost:3000" → 使用本地地址
 * - 生产环境: requestUrl.origin = "https://www.headcanonforge.com" → 使用生产地址
 * 
 * 注意: 这些 URL 都必须在 Supabase 的 Redirect URLs 中配置
 */
function getAuthCallbackUrl(requestUrl: URL, next: string): string {
  // 直接使用请求的 origin，因为它会自动匹配当前环境
  // - 本地开发: localhost:3000
  // - 生产环境: 生产域名
  const baseUrl = requestUrl.origin.replace(/\/$/, '') // 移除末尾斜杠
  return `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}`
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const next = requestUrl.searchParams.get('next') || '/'
  
  // 检查环境变量（支持多种变量名）
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { 
        error: 'Supabase 环境变量未配置。请在 .env.local 文件中添加 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey,
          helpUrl: 'https://supabase.com/dashboard/project/_/settings/api'
        }
      }, 
      { status: 500 }
    )
  }

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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    // 获取回调 URL（根据环境动态决定）
    const redirectTo = getAuthCallbackUrl(requestUrl, next)
    
    console.log('Starting OAuth flow with Supabase...')
    console.log('Redirect URL:', redirectTo)
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      )
    }

    if (data?.url) {
      console.log('OAuth URL generated, redirecting to Google:', data.url.substring(0, 100) + '...')
      // 创建重定向响应，并复制所有 cookies（包括 PKCE code verifier）
      const redirectResponse = NextResponse.redirect(data.url)
      // 将 response 中的所有 cookies 复制到重定向响应中
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, {
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
          sameSite: cookie.sameSite as any,
          path: cookie.path,
        })
      })
      return redirectResponse
    }

    console.error('No OAuth URL generated')
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent('Failed to generate auth URL')}`, requestUrl.origin)
    )
  } catch (error) {
    console.error('OAuth exception:', error)
    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`,
        requestUrl.origin
      )
    )
  }
}
