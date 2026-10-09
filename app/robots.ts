import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.aluminego.ar';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/portal-comercial/perfil', '/portal-comercial/menu'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
