"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sparkles, Heart, Home } from "lucide-react"
import { cn } from "@/lib/utils"

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
    <nav className="sticky top-0 z-50 w-full border-b border-pink-200/50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
              <Sparkles className="relative h-7 w-7 text-purple-600 group-hover:text-pink-600 transition-colors" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent hidden sm:inline-block">
              Headcanon Forge
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
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
                      ? "bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 shadow-sm"
                      : "text-gray-700 hover:text-pink-600 hover:bg-pink-50/50"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-pink-600" : "text-gray-500"
                  )} />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2 overflow-x-auto scrollbar-hide">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 min-w-fit",
                    isActive
                      ? "bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700"
                      : "text-gray-700 hover:text-pink-600 hover:bg-pink-50/50"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-pink-600" : "text-gray-500"
                  )} />
                  <span className="whitespace-nowrap">{item.name === "Home" ? "Home" : item.name.split(" ")[0]}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

