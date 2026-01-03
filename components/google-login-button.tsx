"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { LogIn, LogOut, User } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function GoogleLoginButton() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // 检查 URL 中的错误参数（使用 window.location 而不是 useSearchParams）
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const error = urlParams.get('error')
      if (error) {
        toast({
          title: "Login Failed",
          description: decodeURIComponent(error),
          variant: "destructive",
        })
        // 清除 URL 中的错误参数
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }

    // 检查用户登录状态
    const checkUser = async () => {
      try {
        const supabase = createClient()
        // 先尝试获取 session，如果 session 存在，再获取 user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          // 如果是 AuthSessionMissingError，这是正常的（未登录状态）
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
        // 忽略 AuthSessionMissingError，这是正常的未登录状态
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
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        })
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, toast])

  const handleLogin = () => {
    console.log('Login button clicked, redirecting to /api/auth/login')
    // 直接跳转到登录 API 路由，该路由会重定向到 Google 授权页面
    // 使用 window.location.href 而不是 replace，这样用户可以通过浏览器返回按钮返回
    window.location.href = "/api/auth/login"
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      setUser(null)
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      })
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Sign Out Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Button
        disabled
        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
      >
        <LogIn className="h-4 w-4 mr-2 animate-spin" />
        <span className="hidden sm:inline">Loading...</span>
        <span className="sm:hidden">Loading</span>
      </Button>
    )
  }

  if (user) {
    // 获取用户头像 URL（Google OAuth 通常存储在 user_metadata.avatar_url 或 user_metadata.picture）
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || user.avatar_url
    const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
    const userInitials = userName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'

    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 border border-cyan-200/50 shadow-sm">
          <Avatar className="h-8 w-8">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={userName} />
            ) : null}
            <AvatarFallback className="bg-cyan-100 text-cyan-700 text-xs font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">
            {userName}
          </span>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-400 transition-all"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Sign Out</span>
          <span className="sm:hidden">Sign Out</span>
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleLogin()
      }}
      size="sm"
      className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 text-xs md:text-sm font-semibold h-8 md:h-9"
      type="button"
    >
      <LogIn className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
      <span className="hidden sm:inline">Sign in with Google</span>
      <span className="sm:hidden">Sign in</span>
    </Button>
  )
}

