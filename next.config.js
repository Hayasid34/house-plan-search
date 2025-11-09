/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // canvas モジュールを外部化（サーバーサイドで読み込まない）
    if (isServer) {
      config.externals.push('canvas');
    }
    return config;
  },
}

module.exports = nextConfig
