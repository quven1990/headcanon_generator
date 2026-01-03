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

  let response = NextResponse.redirect(new URL(next, requestUrl.origin))

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
            response = NextResponse.redirect(new URL(next, requestUrl.origin))
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
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
  }

  return response
}
