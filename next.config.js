/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Turbopack設定（Next.js 16対応）
  turbopack: {
    resolveAlias: {
      canvas: './empty-module.js',
    },
  },
  webpack: (config, { isServer }) => {
    // canvas モジュールを外部化（サーバーサイドで読み込まない）
    if (isServer) {
      config.externals.push('canvas');
    }
    return config;
  },
}

module.exports = nextConfig
