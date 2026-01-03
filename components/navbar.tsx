"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sparkles, Heart, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { GoogleLoginButton } from "@/components/google-login-button"
import { Toaster } from "@/components/ui/toaster"

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    description: "Headcanon Generator Home",
  },
  {
    name: "Character Headcanon",
    href: "/character-headcanon",
    icon: Sparkles,
    description: "Generate character headcanons",
  },
  {
    name: "Relationship Headcanon",
    href: "/relationship-headcanon",
    icon: Heart,
    description: "Generate relationship headcanons",
  },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline-block">
              Headcanon Forge
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-gray-900" : "text-gray-500"
                  )} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            <div className="ml-3 pl-3 border-l border-gray-200">
              <GoogleLoginButton />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 min-w-fit",
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                >
                  <Icon className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-gray-900" : "text-gray-500"
                  )} />
                  <span className="whitespace-nowrap text-[10px] leading-tight">{item.name === "Home" ? "Home" : item.name.split(" ")[0]}</span>
                </Link>
              )
            })}
            <div className="ml-2 pl-2 border-l border-gray-200">
              <GoogleLoginButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

