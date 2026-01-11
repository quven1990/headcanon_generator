"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItemData {
  name: string
  href: string
}

interface SEOBreadcrumbProps {
  /**
   * 当前页面的标题（可选）
   * 如果不提供，将根据路径自动生成
   */
  currentPageTitle?: string
}

const pathMap: Record<string, string> = {
  "/": "Home",
  "/character-headcanon": "Character Headcanon",
  "/relationship-headcanon": "Relationship Headcanon",
  "/blog": "Blog",
}

export function SEOBreadcrumb({ currentPageTitle }: SEOBreadcrumbProps) {
  const pathname = usePathname()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.headcanonforge.com"

  // 构建面包屑列表
  const buildBreadcrumbs = (): BreadcrumbItemData[] => {
    const items: BreadcrumbItemData[] = [
      { name: "Home", href: "/" }
    ]

    // 如果是首页，不显示面包屑（或者只显示首页）
    if (pathname === "/") {
      return items
    }

    // 解析路径段
    const pathSegments = pathname.split("/").filter(Boolean)

    // 构建路径
    let currentPath = ""
    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`
      
      // 获取显示名称
      let name = pathMap[currentPath]
      
      // 如果没有映射，使用路径段的格式化版本
      if (!name) {
        // 对于博客文章，使用传入的标题或格式化slug
        if (currentPath.startsWith("/blog/") && i === pathSegments.length - 1) {
          name = currentPageTitle || pathSegments[i].replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
        } else {
          name = pathSegments[i].replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
        }
      }

      items.push({
        name,
        href: currentPath,
      })
    }

    return items
  }

  const breadcrumbs = buildBreadcrumbs()

  // 如果是首页，不显示面包屑
  if (breadcrumbs.length <= 1) {
    return null
  }

  // 生成结构化数据（JSON-LD）
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${siteUrl}${item.href}`,
    })),
  }

  return (
    <>
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 面包屑导航容器 */}
      <nav 
        aria-label="Breadcrumb" 
        className="mb-6 sm:mb-8 w-full"
      >
        {/* 背景容器 - 允许换行以便在移动端更好地显示 */}
        <div className="inline-flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg shadow-sm max-w-full">
          <BreadcrumbList className="gap-1 sm:gap-1.5 flex-wrap">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1

              return (
                <div key={item.href} className="flex items-center">
                  <BreadcrumbItem className="inline-flex items-center">
                    {isLast ? (
                      <BreadcrumbPage 
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5",
                          "text-xs sm:text-sm md:text-base font-semibold",
                          "bg-gradient-to-r from-blue-50 to-purple-50",
                          "text-blue-700 border border-blue-200/50 rounded-md",
                          "shadow-sm",
                          "max-w-[140px] sm:max-w-[200px] md:max-w-none truncate"
                        )}
                        title={item.name}
                      >
                        <span className="truncate">
                          {item.name}
                        </span>
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5",
                            "text-xs sm:text-sm font-medium",
                            "text-gray-600 hover:text-gray-900",
                            "hover:bg-gray-50 rounded-md",
                            "transition-all duration-200",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-1",
                            "whitespace-nowrap"
                          )}
                          title={item.name}
                        >
                          {index === 0 ? (
                            <>
                              <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="hidden xs:inline">{item.name}</span>
                              <span className="xs:hidden">Home</span>
                            </>
                          ) : (
                            <span className="max-w-[80px] sm:max-w-[120px] md:max-w-none truncate">
                              {item.name}
                            </span>
                          )}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator className="mx-0.5 sm:mx-1 flex-shrink-0">
                      <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                    </BreadcrumbSeparator>
                  )}
                </div>
              )
            })}
          </BreadcrumbList>
        </div>
      </nav>
    </>
  )
}
