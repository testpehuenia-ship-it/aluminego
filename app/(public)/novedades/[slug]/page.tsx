import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug }
  });

  if (!article) {
    return { title: 'Artículo no encontrado | AluminéGO' };
  }

  return {
    title: `${article.title} | Novedades AluminéGO`,
    description: article.content.replace(/<[^>]+>/g, '').substring(0, 160) + '...',
    openGraph: {
      title: article.title,
      description: article.content.replace(/<[^>]+>/g, '').substring(0, 160) + '...',
      images: article.image ? [article.image] : [],
      url: `/novedades/${slug}`,
    }
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug }
  });

  if (!article) {
    notFound();
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ position: 'relative', height: '45vh', width: '100%', minHeight: '350px' }}>
        {article.image ? (
          <Image src={article.image} alt={article.title} fill style={{ objectFit: 'cover' }} priority />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-green)' }} />
        )}
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
          <Link href="/novedades" style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: 'var(--shadow-md)' }}>
            <ArrowLeft size={18} /> Volver a Novedades
          </Link>
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)' }} />
        
        <div className="container" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 20px', zIndex: 5 }}>
          <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, margin: 0, marginBottom: '16px', lineHeight: 1.2, maxWidth: '800px' }}>
            {article.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} />
              <span>{article.createdAt.toLocaleDateString('es-AR')}</span>
            </div>
            {article.author && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} />
                <span>{article.author}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '40px', maxWidth: '800px', margin: '40px auto 0' }}>
        <div 
          style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '40px', boxShadow: 'var(--shadow-sm)', color: 'var(--color-text)', fontSize: '1.1rem', lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }}
        />
        
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--color-text-main)', marginBottom: '16px' }}>¿Te gustó este artículo?</h3>
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: article.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('¡Link copiado al portapapeles!');
              }
            }}
            className="btn-primary" 
            style={{ display: 'inline-flex', padding: '12px 24px', fontSize: '1rem', borderRadius: '50px' }}
          >
            Compartir con amigos
          </button>
        </div>
      </div>
    </div>
  );
}
