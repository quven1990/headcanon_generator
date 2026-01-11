"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sparkles, Heart, Home, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const footerNavigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Character Headcanon",
    href: "/character-headcanon",
    icon: Sparkles,
  },
  {
    name: "Relationship Headcanon",
    href: "/relationship-headcanon",
    icon: Heart,
  },
  {
    name: "Blog",
    href: "/blog",
    icon: BookOpen,
  },
]

export function Footer() {
  const pathname = usePathname()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Headcanon Forge
              </span>
            </Link>
            <p className="text-sm text-gray-600">
              Free AI-powered headcanon generator for writers, fanfiction creators, and RPG enthusiasts.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Quick Links</h3>
            <ul className="space-y-3">
              {footerNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 text-sm transition-colors",
                        isActive
                          ? "text-blue-600 font-medium"
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">About</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <span className="hover:text-gray-900 cursor-default">
                  Free to use
                </span>
              </li>
              <li>
                <span className="hover:text-gray-900 cursor-default">
                  Google Sign-in
                </span>
              </li>
              <li>
                <span className="hover:text-gray-900 cursor-default">
                  AI-powered generation
                </span>
              </li>
              <li>
                <span className="hover:text-gray-900 cursor-default">
                  For creative inspiration only
                </span>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Resources</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/blog" className="hover:text-gray-900 transition-colors">
                  Blog & Guides
                </Link>
              </li>
              <li>
                <Link 
                  href="/character-headcanon" 
                  className="hover:text-gray-900 transition-colors"
                >
                  Character Headcanon Generator
                </Link>
              </li>
              <li>
                <Link 
                  href="/relationship-headcanon" 
                  className="hover:text-gray-900 transition-colors"
                >
                  Relationship Headcanon Generator
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-600">
              © {currentYear} Headcanon Forge. Powered by AI · For creative inspiration only.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a 
                href="https://headcanonforge.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-900 transition-colors"
              >
                headcanonforge.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
