/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'www.infoknocks.com',
      },
      {
        protocol: 'https',
        hostname: 'bsmedia.business-standard.com',
      },
    ],
  },
}

export default nextConfig
