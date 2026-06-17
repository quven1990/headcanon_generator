"use client"

import { useCallback, useEffect, useState } from "react"

export interface AuthUser {
  id: string
  email: string
  user_metadata?: {
    full_name?: string | null
    name?: string | null
    avatar_url?: string | null
    picture?: string | null
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" })
      if (!response.ok) {
        setUser(null)
        return
      }
      const data = await response.json()
      setUser(data.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    setUser(null)
  }, [])

  return { user, loading, signOut, refresh, isAuthenticated: Boolean(user) }
}
