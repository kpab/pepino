/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // App Routerを明示的に有効化
    appDir: true,
  },
  // 位置情報APIを使用するためのセキュリティヘッダー
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'geolocation=*',
          },
        ],
      },
    ]
  },
  // 画像最適化設定
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  // TypeScript設定
  typescript: {
    ignoreBuildErrors: false,
  },
  // ESLint設定
  eslint: {
    ignoreDuringBuilds: false,
  },
  // PWA対応（将来的に）
  // serviceWorker: {
  //   sw: './public/sw.js',
  //   scope: '/',
  // },
}

module.exports = nextConfig
