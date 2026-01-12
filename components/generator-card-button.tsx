"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, LogIn, Lock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface GeneratorCardButtonProps {
  typeId: string
  className?: string
  children: React.ReactNode
}

export function GeneratorCardButton({ typeId, className, children }: GeneratorCardButtonProps) {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // 检查用户是否已登录
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    
    // 已登录，跳转到对应页面
    if (typeId === "character-headcanon") {
      router.push(`/character-headcanon`)
    } else if (typeId === "relationship-headcanon") {
      router.push(`/relationship-headcanon`)
    }
  }

  const getLoginRedirectUrl = () => {
    if (typeId === "character-headcanon") {
      return "/character-headcanon"
    } else if (typeId === "relationship-headcanon") {
      return "/relationship-headcanon"
    }
    return "/"
  }

  const getDialogTitle = () => {
    if (typeId === "character-headcanon") {
      return "Character Headcanon Generator"
    } else if (typeId === "relationship-headcanon") {
      return "Relationship Headcanon Generator"
    }
    return "Generator"
  }

  return (
    <>
      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className={cn(
                "h-5 w-5",
                typeId === "character-headcanon"
                  ? "text-blue-600"
                  : "text-pink-600"
              )} />
              Sign In Required
            </DialogTitle>
            <DialogDescription className="pt-2">
              Please sign in with Google to use the {getDialogTitle()}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start gap-2">
            <Button
              onClick={() => {
                const nextUrl = getLoginRedirectUrl()
                window.location.href = `/api/auth/login?next=${encodeURIComponent(nextUrl)}`
              }}
              className={cn(
                "w-full sm:w-auto text-white",
                typeId === "character-headcanon"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              )}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In with Google
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowLoginDialog(false)
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        onClick={handleClick}
        disabled={authLoading}
        className={cn(
          "w-full justify-center group/btn rounded-xl font-semibold text-sm md:text-base py-6 shadow-sm hover:shadow-md transition-all duration-200",
          className
        )}
      >
        {children}
        <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover/btn:translate-x-1 transition-transform" />
      </Button>
    </>
  )
}
