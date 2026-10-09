import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.aluminego.ar';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/comer`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/alojarse`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/aventuras`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/comercios`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guia`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/mapa`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/novedades`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  try {
    const [businesses, accommodations, adventures, commerces, articles] = await Promise.all([
      prisma.business.findMany({ select: { id: true, updatedAt: true } }),
      prisma.accommodation.findMany({ select: { id: true, updatedAt: true } }),
      prisma.adventure.findMany({ select: { id: true, updatedAt: true } }),
      prisma.commerce.findMany({ select: { id: true, slug: true, updatedAt: true } }),
      prisma.article.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    ]);

    const businessRoutes: MetadataRoute.Sitemap = businesses.map((b) => ({
      url: `${baseUrl}/comer/${b.id}`,
      lastModified: b.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const accommodationRoutes: MetadataRoute.Sitemap = accommodations.map((a) => ({
      url: `${baseUrl}/alojarse/${a.id}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const adventureRoutes: MetadataRoute.Sitemap = adventures.map((ad) => ({
      url: `${baseUrl}/aventuras/${ad.id}`,
      lastModified: ad.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const commerceRoutes: MetadataRoute.Sitemap = commerces.map((c) => ({
      url: `${baseUrl}/comercios/${c.slug || c.id}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const articleRoutes: MetadataRoute.Sitemap = articles.map((art) => ({
      url: `${baseUrl}/novedades/${art.slug}`,
      lastModified: art.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    return [
      ...staticRoutes,
      ...businessRoutes,
      ...accommodationRoutes,
      ...adventureRoutes,
      ...commerceRoutes,
      ...articleRoutes,
    ];
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    return staticRoutes;
  }
}
