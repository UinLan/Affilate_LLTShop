/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'down-vn.img.susercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    FACEBOOK_ACCESS_TOKEN: process.env.FACEBOOK_ACCESS_TOKEN,
    FACEBOOK_PAGE_ID: process.env.FACEBOOK_PAGE_ID,
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Bỏ qua lỗi ESLint khi build
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Bỏ qua lỗi TypeScript khi build
  },
};

module.exports = nextConfig;