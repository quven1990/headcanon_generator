"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient()
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          if (sessionError.message?.includes('session') || sessionError.message?.includes('Session')) {
            setUser(null)
            setLoading(false)
            return
          }
          throw sessionError
        }
        
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }
      } catch (error: any) {
        if (error?.message?.includes('session') || error?.message?.includes('Session')) {
          setUser(null)
        } else {
          console.error('Error checking user:', error)
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // 监听认证状态变化
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading, isAuthenticated: !!user }
}

