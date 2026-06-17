"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { LogIn, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

export function GoogleLoginButton() {
  const { user, loading, signOut, refresh } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window === "undefined") return

    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get("error")
    if (error) {
      toast({
        title: "Login Failed",
        description: decodeURIComponent(error),
        variant: "destructive",
      })
      window.history.replaceState({}, "", window.location.pathname)
    }

    const loginSuccess = urlParams.get("loginSuccess")
    if (loginSuccess === "true") {
      refresh()
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })
      urlParams.delete("loginSuccess")
      const query = urlParams.toString()
      const newUrl = window.location.pathname + (query ? `?${query}` : "")
      window.history.replaceState({}, "", newUrl)
    }
  }, [refresh, toast])

  const handleLogin = () => {
    const next = encodeURIComponent(window.location.pathname + window.location.search)
    window.location.href = `/api/auth/google?next=${next}`
  }

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await signOut()
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      })
      setTimeout(() => router.refresh(), 100)
    } catch (error) {
      console.error("Logout error:", error)
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
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture
    const userName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User"
    const userInitials =
      userName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"

    return (
      <div className="group relative ml-4">
        <div className="hidden sm:block">
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200/50 shadow-sm cursor-pointer transition-all hover:shadow-md">
              <Avatar className="h-8 w-8 flex-shrink-0">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt={userName} /> : null}
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 text-xs font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium whitespace-nowrap">{userName}</span>
            </div>
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
        <div className="flex sm:hidden items-center gap-2">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200/50 shadow-sm">
            <Avatar className="h-7 w-7 flex-shrink-0">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={userName} /> : null}
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
