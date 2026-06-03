import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  },
  serverExternalPackages: ['@prisma/client', '@libsql/client'],
  // Permitir la IP de la red local para evitar el bloqueo de JS en dispositivos móviles (Next.js 15 security feature)
  allowedDevOrigins: ['192.168.1.54', 'localhost:3000'],
};

export default nextConfig;
