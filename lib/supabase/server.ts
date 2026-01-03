import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  // 支持多种环境变量名称
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) in your .env.local file. ' +
      'Get these values from: https://supabase.com/dashboard/project/_/settings/api'
    )
  }

  const cookieStore = cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          // 检查 cookieStore 是否有 getAll 方法
          if (!cookieStore || typeof cookieStore.getAll !== 'function') {
            console.error('cookieStore.getAll is not a function. cookieStore type:', typeof cookieStore)
            console.error('cookieStore methods:', Object.keys(cookieStore || {}))
            // 返回空数组，Supabase 会在需要时重新设置 cookies
            return []
          }
          
          try {
            return cookieStore.getAll()
          } catch (error) {
            console.error('Error calling cookieStore.getAll():', error)
            return []
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              if (cookieStore && typeof cookieStore.set === 'function') {
                cookieStore.set(name, value, options)
              }
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            // 在 Server Components 中，setAll 可能会失败，这是正常的
          }
        },
      },
    }
  )
}
