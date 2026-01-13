"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { SEOBreadcrumb } from "@/components/seo-breadcrumb"

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

export default function ExploreDetailPage() {
  const params = useParams()
  const [record, setRecord] = useState<GenerationRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const id = params.id as string

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/explore/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Generation not found")
            return
          }
          throw new Error("Failed to fetch record")
        }

        const result = await response.json()
        setRecord(result.data)
      } catch (err) {
        console.error("Error fetching record:", err)
        setError("Failed to load generation. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchRecord()
    }
  }, [id])

  const getTitle = (record: GenerationRecord): string => {
    if (record.type === "relationship" && record.input_data.characters) {
      return record.input_data.characters.join(" & ")
    }
    return record.input_data.characterName || "Untitled Headcanon"
  }

  const getTags = (record: GenerationRecord): string[] => {
    const tags: string[] = []
    
    if (record.type === "character") {
      tags.push("Character")
    } else if (record.type === "relationship") {
      tags.push("Relationship")
    }
    
    if (record.input_data.fandom) {
      tags.push(record.input_data.fandom)
    }
    
    if (record.input_data.headcanonType) {
      tags.push(record.input_data.headcanonType)
    } else if (record.input_data.relationshipType) {
      tags.push(record.input_data.relationshipType)
    }
    
    return tags
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16 lg:py-20">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading generation...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16 lg:py-20">
          <SEOBreadcrumb />
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error || "Generation not found"}</p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Explore
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const title = getTitle(record)
  const tags = getTags(record)
  const createdDate = new Date(record.created_at)
  const relativeTime = formatDistanceToNow(createdDate, { addSuffix: true })
  const formattedDate = format(createdDate, "MMMM d, yyyy 'at' h:mm a")

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16 lg:py-20">
        <SEOBreadcrumb />
        
        {/* Back Button */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Explore</span>
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              {title}
            </h1>
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <time dateTime={record.created_at} title={formattedDate}>
                {relativeTime}
              </time>
            </div>
          </div>

          {/* Input Parameters */}
          <div className="mt-4 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Generation Parameters</h3>
            <div className="flex flex-wrap gap-2">
              {/* Type */}
              {record.input_data.headcanonType && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Type: {record.input_data.headcanonType}
                </span>
              )}
              {record.input_data.relationshipType && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Type: {record.input_data.relationshipType}
                </span>
              )}
              
              {/* Tone */}
              {record.input_data.tone && record.input_data.tone !== "Random Selection" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Tone: {record.input_data.tone}
                </span>
              )}
              
              {/* Length */}
              {record.input_data.length && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Length: {record.input_data.length}
                </span>
              )}
              
              {/* Fandom (if not already shown as tag) */}
              {record.input_data.fandom && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  Fandom: {record.input_data.fandom}
                </span>
              )}
            </div>
            
            {/* Context (if exists) */}
            {record.input_data.context && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-1">Additional Context:</p>
                <p className="text-sm text-gray-700">{record.input_data.context}</p>
              </div>
            )}
          </div>
        </header>

        {/* Content Sections */}
        <article className="prose prose-lg max-w-none">
          {/* Core Idea */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Core Idea
            </h2>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {record.core_idea || "No core idea available."}
              </p>
            </div>
          </section>

          {/* Development */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Development
            </h2>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {record.development || "No development content available."}
              </p>
            </div>
          </section>

          {/* Moment */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              Moment
            </h2>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {record.moment || "No moment content available."}
              </p>
            </div>
          </section>
        </article>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>View All Generations</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
