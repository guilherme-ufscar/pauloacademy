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
    const minioEndpoint = process.env.MINIO_INTERNAL_URL || 'http://minio:9000'
    const minioBucket = process.env.MINIO_BUCKET || 'academy-uploads'
    return [
      {
        source: '/api/:path*',
        destination: `${internalApi}/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${minioEndpoint}/${minioBucket}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
