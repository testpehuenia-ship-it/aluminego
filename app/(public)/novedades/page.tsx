import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowRight } from 'lucide-react';
import PublicityBanner from '@/components/PublicityBanner';

export const metadata: Metadata = {
  title: 'Blog y Novedades | AluminéGO',
  description: 'Descubre guías, recomendaciones y las últimas noticias sobre turismo en Aluminé.',
  keywords: ['novedades Aluminé', 'blog turismo Aluminé', 'noticias Aluminé', 'guías viaje Aluminé'],
  openGraph: {
    title: 'Blog y Novedades | AluminéGO',
    description: 'Guías, recomendaciones y noticias sobre turismo en Aluminé.',
    url: '/novedades',
  }
};

export const revalidate = 60; // ISR 1 minuto

export default async function NovedadesPage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ backgroundColor: 'var(--color-green)', padding: '60px 20px 40px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, margin: 0, marginBottom: '16px' }}>Novedades y Guías</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Descubre los mejores rincones, consejos y noticias para tu estadía en Aluminé.
        </p>
      </div>

      <div style={{ maxWidth: '600px', margin: '30px auto 0 auto', padding: '0 20px' }}>
        <PublicityBanner page="Novedades" section={1} height="100px" />
      </div>

      <div className="container" style={{ marginTop: '40px' }}>
        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>Pronto publicaremos nuevos artículos y Guías de viaje.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {articles.map((article) => (
              <Link 
                href={`/novedades/${article.slug}`} 
                key={article.id}
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s', border: '1px solid var(--color-border)' }}
              >
                <div style={{ position: 'relative', height: '200px', width: '100%', backgroundColor: '#e2e8f0' }}>
                  {article.image && (
                    <Image src={article.image} alt={article.title} fill style={{ objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
                    <Calendar size={14} />
                    <span>{article.createdAt.toLocaleDateString('es-AR')}</span>
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px', lineHeight: 1.4 }}>{article.title}</h2>
                  
                  {/* Extract brief snippet from content (removing basic HTML if present) */}
                  <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '20px', flex: 1 }}>
                    {article.content.replace(/<[^>]+>/g, '').substring(0, 120)}...
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-orange)', fontWeight: 600, marginTop: 'auto' }}>
                    Leer más <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={{ maxWidth: '600px', margin: '40px auto 0 auto', padding: '0 20px' }}>
        <PublicityBanner page="Novedades" section={2} height="150px" />
      </div>
    </div>
  );
}


