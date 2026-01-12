"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Compass, User } from "lucide-react"
import { SEOBreadcrumb } from "@/components/seo-breadcrumb"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

interface GenerationRecord {
  id: number
  created_at: string
  user_id: number
  type: string
  input_data: {
    characterName?: string
    characters?: string[]
    fandom?: string
    headcanonType?: string
    relationshipType?: string
    tone?: string
    length?: string
    context?: string
  }
  core_idea: string
  development: string
  moment: string
  is_favorite: number
  is_deleted: number
}

function ExploreContent() {
  const { user, loading: authLoading } = useAuth()
  const [records, setRecords] = useState<GenerationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  } | null>(null)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/explore?page=${currentPage}&limit=12`)
        
        if (!response.ok) {
          if (response.status === 401) {
            setError("Please sign in to view your generations")
            return
          }
          throw new Error("Failed to fetch records")
        }

        const result = await response.json()
        setRecords(result.data || [])
        setPagination(result.pagination || null)
      } catch (err) {
        console.error("Error fetching records:", err)
        setError("Failed to load generations. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchRecords()
    }
  }, [authLoading, currentPage])

  const getTitle = (record: GenerationRecord): string => {
    if (record.type === "relationship" && record.input_data.characters) {
      return record.input_data.characters.join(" & ")
    }
    return record.input_data.characterName || "Untitled"
  }

  const getTags = (record: GenerationRecord): string[] => {
    const tags: string[] = []
    
    // 类型标签
    if (record.type === "character") {
      tags.push("Character")
    } else if (record.type === "relationship") {
      tags.push("Relationship")
    }
    
    // Fandom 标签
    if (record.input_data.fandom) {
      tags.push(record.input_data.fandom)
    }
    
    return tags
  }

  const formatRelativeTime = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return "Recently"
    }
  }

  const getPreviewText = (coreIdea: string): string => {
    if (!coreIdea) return "No content"
    // 移除标签，取前150个字符
    const cleanText = coreIdea.replace(/^(Core Idea|core idea|CoreIdea):\s*/i, "").trim()
    if (cleanText.length > 150) {
      return cleanText.substring(0, 150) + "..."
    }
    return cleanText
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:py-20">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading your generations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:py-20">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            {!user && (
              <Link
                href="/api/auth/login"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:py-20">
          <SEOBreadcrumb />
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-8">Please sign in to view your generations</p>
            <Link
              href="/api/auth/login"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-md"
            >
              Sign In with Google
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:py-20">
        <SEOBreadcrumb />
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Explore Your Generations
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse through your AI-generated headcanons
          </p>
        </div>

        {/* Records Grid */}
        {records.length === 0 ? (
          <div className="text-center py-12">
            <Compass className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No generations yet</p>
            <p className="text-gray-400 text-sm">
              Start creating headcanons to see them here!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {records.map((record) => {
              const title = getTitle(record)
              const tags = getTags(record)
              const previewText = getPreviewText(record.core_idea)
              const relativeTime = formatRelativeTime(record.created_at)

              return (
                <div
                  key={record.id}
                  className="group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6 h-full flex flex-col">
                    {/* Title and Tags */}
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              index === 0
                                ? record.type === "character"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-pink-100 text-pink-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Preview Text */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                      {previewText}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Avatar className="w-5 h-5">
                          {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                            <AvatarImage
                              src={user.user_metadata.avatar_url || user.user_metadata.picture}
                              alt={`${user.user_metadata?.full_name || user.user_metadata?.name || "User"} avatar profile picture`}
                            />
                          ) : null}
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-[10px] font-medium">
                            {(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'A')
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{relativeTime}</span>
                      </div>
                      <Link
                        href={`/explore/${record.id}`}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (pagination.hasPreviousPage) {
                        setCurrentPage(currentPage - 1)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }
                    }}
                    className={!pagination.hasPreviousPage ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {/* Page Numbers */}
                {(() => {
                  const pages: (number | 'ellipsis')[] = []
                  const totalPages = pagination.totalPages
                  const current = currentPage

                  if (totalPages <= 7) {
                    // If 7 or fewer pages, show all
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i)
                    }
                  } else {
                    // Always show first page
                    pages.push(1)

                    // Calculate range around current page
                    let start = Math.max(2, current - 1)
                    let end = Math.min(totalPages - 1, current + 1)

                    // Adjust range if near edges
                    if (current <= 3) {
                      end = 4
                    } else if (current >= totalPages - 2) {
                      start = totalPages - 3
                    }

                    // Add ellipsis before range if needed
                    if (start > 2) {
                      pages.push('ellipsis')
                    }

                    // Add pages in range
                    for (let i = start; i <= end; i++) {
                      pages.push(i)
                    }

                    // Add ellipsis after range if needed
                    if (end < totalPages - 1) {
                      pages.push('ellipsis')
                    }

                    // Always show last page
                    pages.push(totalPages)
                  }

                  return pages.map((page, index) => {
                    if (page === 'ellipsis') {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(page)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })
                })()}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (pagination.hasNextPage) {
                        setCurrentPage(currentPage + 1)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }
                    }}
                    className={!pagination.hasNextPage ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            
            {/* Pagination Info */}
            <div className="text-center mt-4 text-sm text-gray-500">
              Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, pagination.total)} of {pagination.total} generations
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ExplorePage() {
  return <ExploreContent />
}
