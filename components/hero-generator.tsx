"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, LogIn, Lock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function HeroGenerator() {
  const router = useRouter()
  const [characterName, setCharacterName] = useState("Harry Potter")
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  const handleGenerate = () => {
    const name = characterName.trim()
    if (!name) return
    
    // 检查用户是否已登录
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    
    // Redirect to character-headcanon page with pre-filled character name and auto-generate flag
    router.push(`/character-headcanon?character=${encodeURIComponent(name)}&autoGenerate=true`)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleGenerate()
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" />
              Sign In Required
            </DialogTitle>
            <DialogDescription className="pt-2">
              Please sign in with Google to generate headcanons.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start gap-2">
            <Button
              onClick={() => {
                const currentPath = "/"
                const character = characterName.trim()
                const nextUrl = character
                  ? `/character-headcanon?character=${encodeURIComponent(character)}&autoGenerate=true`
                  : "/character-headcanon"
                window.location.href = `/api/auth/login?next=${encodeURIComponent(nextUrl)}`
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
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

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Input
          type="text"
          value={characterName}
          onChange={(e) => setCharacterName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter character name (e.g., Harry Potter)"
          className="flex-1 px-4 py-6 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <Button
          onClick={handleGenerate}
          disabled={!characterName.trim() || authLoading}
          size="lg"
          className="w-full sm:w-auto px-8 py-6 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Generate a Headcanon
        </Button>
      </div>
    </div>
  )
}
