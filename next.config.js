/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/remove-bg',
        destination: 'https://api.remove.bg/v1.0/removebg',
      },
    ];
  },
};

module.exports = nextConfig;
