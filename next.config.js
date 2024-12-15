/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configure for Replit
  output: 'standalone',
  // Allow Replit domains for images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.repl.co',
      },
      {
        protocol: 'https',
        hostname: '**.repl.dev',
      },
    ],
  },
  // Add headers for security but allow Replit iframe
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  // Configure for Replit environment
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    }
    return config
  },
}

module.exports = nextConfig
