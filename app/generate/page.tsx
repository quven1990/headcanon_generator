"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function GeneratePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 重定向到 SEO 友好的路径
    const type = searchParams.get("type")
    if (type === "character-headcanon") {
      router.replace("/character-headcanon")
    } else {
      // 如果没有指定类型或类型不匹配，也重定向到 character-headcanon
      router.replace("/character-headcanon")
    }
  }, [router, searchParams])

  // 显示加载状态
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
