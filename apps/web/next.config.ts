import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Proxy de API para desarrollo y Docker
  // Usa API_INTERNAL_URL (server-side, resuelve "api" en Docker) o NEXT_PUBLIC_API_URL (dev local)
  async rewrites() {
    const internalUrl = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${internalUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
