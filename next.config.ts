import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
});

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/portal-comercial/login.',
        destination: '/portal-comercial/login',
        permanent: true,
      },
    ];
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  serverExternalPackages: ['@prisma/client', '@libsql/client'],
  // Permitir la IP de la red local para evitar el bloqueo de JS en dispositivos móviles (Next.js 15 security feature)
  allowedDevOrigins: ['192.168.1.54', 'localhost:3000'],

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withPWA(nextConfig);
