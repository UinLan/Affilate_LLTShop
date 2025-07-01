/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['down-vn.img.susercontent.com'],
    // Hoặc có thể dùng remotePatterns nếu muốn:
    /*
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'down-vn.img.susercontent.com',
      },
    ],
    */
  },
};

module.exports = nextConfig;