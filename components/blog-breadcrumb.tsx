"use client"

import { SEOBreadcrumb } from "./seo-breadcrumb"

interface BlogBreadcrumbProps {
  postTitle: string
}

/**
 * 博客文章页面的面包屑组件
 * 用于传递文章标题给SEO面包屑组件
 */
export function BlogBreadcrumb({ postTitle }: BlogBreadcrumbProps) {
  return <SEOBreadcrumb currentPageTitle={postTitle} />
}
