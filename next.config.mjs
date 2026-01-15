/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // 域名规范化：将 headcanonforge.com 重定向到 www.headcanonforge.com
  // 这有助于 SEO，避免重复内容问题，集中权重到 www 版本
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'headcanonforge.com',
          },
        ],
        destination: 'https://www.headcanonforge.com/:path*',
        permanent: true, // 301 永久重定向，搜索引擎友好
      },
    ]
  },
}

export default nextConfig
