import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Proxy de API para desarrollo y Docker
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // En desarrollo usa localhost, en Docker usa la variable NEXT_PUBLIC_API_URL
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
