import { createBrowserClient } from '@supabase/ssr'

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

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
