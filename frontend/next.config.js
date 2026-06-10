/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '**' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  async rewrites() {
    const internalApi = process.env.INTERNAL_API_URL || 'http://backend:3001'
    return [
      {
        source: '/api/:path*',
        destination: `${internalApi}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
