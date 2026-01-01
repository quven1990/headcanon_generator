import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // 确保使用完整的URL，包括协议和域名
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://headcanon-generator.com'
  
  // 确保baseUrl是完整的URL格式，移除末尾的斜杠
  let siteUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`
  siteUrl = siteUrl.replace(/\/$/, '') // 移除末尾的斜杠
  
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]
}

