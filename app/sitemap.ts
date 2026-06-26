import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.AluminéGO.ar';

  // Páginas estáticas pÁºblicas principales
  const staticPages = [
    '',
    '/alojarse',
    '/comer',
    '/aventuras',
    '/comercios',
    '/guia',
    '/mapa'
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8
  }));

  // Buscar dinámicamente los IDs para las Páginas de detalle
  const alojamientos = await prisma.accommodation.findMany({ select: { id: true } });
  const comer = await prisma.business.findMany({ select: { id: true } });
  const aventuras = await prisma.adventure.findMany({ select: { id: true } });
  const servicios = await prisma.localService.findMany({ select: { id: true } });
  const comercios = await prisma.commerce.findMany({ select: { id: true, slug: true } });

  const alojamientoRoutes = alojamientos.map(item => ({
    url: `${baseUrl}/alojarse/${item.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6
  }));

  const comerRoutes = comer.map(item => ({
    url: `${baseUrl}/comer/${item.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6
  }));

  const aventuraRoutes = aventuras.map(item => ({
    url: `${baseUrl}/aventuras/${item.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6
  }));

  const servicioRoutes = servicios.map(item => ({
    url: `${baseUrl}/guia/${item.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6
  }));

  const commerceRoutes = comercios.map(item => ({
    url: `${baseUrl}/comercios/${item.slug || item.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6
  }));

  return [
    ...staticPages,
    ...alojamientoRoutes,
    ...comerRoutes,
    ...aventuraRoutes,
    ...servicioRoutes,
    ...commerceRoutes
  ];
}


