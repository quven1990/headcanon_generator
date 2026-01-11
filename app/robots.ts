import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.headcanonforge.com'
  
  // 禁止访问的路由列表
  const disallowPaths = [
    '/api/',        // API路由，不应该被索引
    '/auth/',       // 认证回调路由，内部使用
    '/generate',    // 重定向页面，不需要索引
  ]

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowPaths,
      },
      // 允许Google爬虫
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: disallowPaths,
      },
      // 允许Google图片爬虫
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: disallowPaths,
      },
      // 允许AI大模型爬虫（如GPTBot, ChatGPT-User, Claude-Web等）
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'CCBot',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'Applebot-Extended',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: disallowPaths,
      },
    ],
    sitemap: `${baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`.replace(/\/$/, '')}/sitemap.xml`,
  }
}

