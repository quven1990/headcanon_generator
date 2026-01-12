"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { LogIn, LogOut, User } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function GoogleLoginButton() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const hasInitialized = useRef(false) // 跟踪是否已经初始化

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
        // 标记为已初始化
        hasInitialized.current = true
      }
    }

    checkUser()

    // 检查 URL 中是否有 loginSuccess 参数（从回调返回时）
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const loginSuccess = urlParams.get('loginSuccess')
      if (loginSuccess === 'true') {
        // 重新获取用户状态（因为刚刚登录成功）
        const refreshUser = async () => {
          try {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
              setUser(session.user)
              setLoading(false)
            }
          } catch (error) {
            console.error('Error refreshing user after login:', error)
          }
        }
        refreshUser()
        
        // 显示登录成功提示
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        })
        // 清除 URL 参数
        const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString().replace(/loginSuccess=true&?/, '').replace(/&loginSuccess=true/, '') : '')
        window.history.replaceState({}, '', newUrl.replace(/\?$/, ''))
      }
    }

    // 监听认证状态变化
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null)
        // 不在 onAuthStateChange 中显示提示，因为页面刷新也会触发
        // 提示已经在上面通过 URL 参数检查显示
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
    if (isLoggingOut) return // 防止重复点击
    
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      setUser(null)
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      })
      // 使用 setTimeout 确保状态更新后再刷新
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Sign Out Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
      setIsLoggingOut(false)
    }
  }

  if (loading) {
    return (
      <Button
        disabled
        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
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
      <div className="group relative ml-4">
        {/* 桌面端：头像和名字区域，Sign Out 在下方 */}
        <div className="hidden sm:block">
          <div className="relative">
            {/* 头像和名字区域 - 与其他导航项对齐 */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200/50 shadow-sm cursor-pointer transition-all hover:shadow-md">
              <Avatar className="h-8 w-8 flex-shrink-0">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={userName} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 text-xs font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium whitespace-nowrap">
                {userName}
              </span>
            </div>
            {/* Sign Out 按钮 - 默认隐藏，hover 时显示在下方，绝对定位 */}
            <div className="absolute top-full left-0 right-0 mt-2 flex justify-center z-10">
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="ghost"
                size="default"
                className="bg-white/95 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 active:bg-red-100 active:scale-[0.98] transition-all duration-200 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto whitespace-nowrap shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed min-w-[110px] h-9 px-4 rounded-lg font-medium text-sm"
              >
                {isLoggingOut ? (
                  <>
                    <LogOut className="h-4 w-4 mr-2 animate-spin text-red-500" />
                    <span className="text-red-600">Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2 transition-transform group-hover:translate-x-0.5" />
                    <span>Sign Out</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        {/* 移动端：横向布局 */}
        <div className="flex sm:hidden items-center gap-2">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200/50 shadow-sm">
            <Avatar className="h-7 w-7 flex-shrink-0">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={userName} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 text-xs font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="ghost"
            size="default"
            className="bg-white/95 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 active:bg-red-100 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed h-9 px-3 rounded-lg"
          >
            {isLoggingOut ? (
              <LogOut className="h-4 w-4 animate-spin text-red-500" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="ml-4">
      <Button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleLogin()
        }}
        size="sm"
        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 text-xs md:text-sm font-semibold h-8 md:h-9"
        type="button"
      >
        <LogIn className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
        <span className="hidden sm:inline">Sign in with Google</span>
        <span className="sm:hidden">Sign in</span>
      </Button>
    </div>
  )
}

