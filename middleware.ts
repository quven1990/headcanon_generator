import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 完全跳过公共页面和静态资源 - 不执行任何操作，直接返回
  // 这些页面对 SEO 很重要，不应该有任何延迟
  const publicPaths = [
    '/',
    '/character-headcanon',
    '/relationship-headcanon',
    '/explore',
  ]

  // 检查是否是公共页面
  const isPublicPath = publicPaths.some(path => {
    if (pathname === path) return true
    if (pathname.startsWith(path + '/')) return true
    return false
  })

  // 如果是公共页面，完全跳过 middleware，不创建任何客户端
  if (isPublicPath) {
    return NextResponse.next({
      request,
    })
  }

  // 只对需要认证的 API 路由执行认证检查
  const needsAuth = pathname.startsWith('/api/') && 
                    !pathname.startsWith('/api/auth/login') &&
                    !pathname.startsWith('/api/auth/callback')

  // 如果不需要认证，也直接跳过
  if (!needsAuth) {
    return NextResponse.next({
      request,
    })
  }

  // 支持多种环境变量名称
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  // 如果环境变量未配置，跳过中间件
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
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
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 只对需要认证的路由刷新用户会话
  try {
    await supabase.auth.getUser()
  } catch (error) {
    // 忽略认证错误，继续处理请求
    console.error('Middleware auth error:', error)
  }

  return supabaseResponse
}

export const config = {
  // 更精确的匹配 - 只匹配需要处理的路由
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - 静态资源文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
