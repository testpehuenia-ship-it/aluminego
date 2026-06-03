import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.AlumineGo.ar';

  // Páginas estáticas públicas principales
  const staticPages = [
    '',
    '/alojarse',
    '/comer',
    '/aventuras',
    '/comercios',
    '/mapa'
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8
  }));

  return [...staticPages];
}
