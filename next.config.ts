/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ibyteimg.com',
      },
      // Thêm các hostname khác nếu cần
    ],
  },
};

module.exports = nextConfig;