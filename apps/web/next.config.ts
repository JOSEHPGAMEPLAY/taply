import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Proxy de API para desarrollo y Docker
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // En Docker usa el servicio 'api', en desarrollo usa localhost
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://api:3001'}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
