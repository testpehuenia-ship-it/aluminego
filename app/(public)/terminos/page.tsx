import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowLeft, AlertTriangle, CheckCircle, Navigation, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Términos y Condiciones de Uso | AluminéGO',
  description: 'Términos de servicio, descargo de responsabilidad del estado de rutas provinciales y condiciones de uso de AluminéGO.',
  alternates: {
    canonical: 'https://www.aluminego.ar/terminos',
  },
};

export default function TerminosPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Enlace volver */}
        <Link 
          href="/" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: 'var(--color-dark-green)', 
            fontWeight: 600, 
            marginBottom: '24px',
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={18} /> Volver al Inicio
        </Link>

        {/* Encabezado */}
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '36px 28px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)', 
          border: '1px solid var(--color-border)',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(211, 84, 0, 0.1)', color: 'var(--color-orange)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '16px' }}>
            <FileText size={18} /> CONDICIONES GENERALES
          </div>
          <h1 style={{ fontSize: '2.2rem', color: '#1e293b', fontFamily: 'var(--font-oswald), sans-serif', textTransform: 'uppercase', lineHeight: 1.15, marginBottom: '12px' }}>
            Términos y Condiciones de Uso
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6 }}>
            Al utilizar la aplicación y sitio web AluminéGO, aceptás las siguientes condiciones pensadas para garantizar una experiencia confiable tanto a turistas como a vecinos y prestadores locales.
          </p>
        </div>

        {/* Articulado */}
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '36px 28px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)', 
          border: '1px solid var(--color-border)',
          color: '#334155',
          lineHeight: 1.7,
          fontSize: '0.98rem'
        }}>
          
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <CheckCircle size={20} color="var(--color-green)" /> 1. Propósito de la Guía
            </h2>
            <p>
              AluminéGO es una guía digital de servicios turísticos, gastronómicos, comerciales y comunitarios de Aluminé (Provincia del Neuquén). Su finalidad es facilitar el acceso directo a información verificada, teléfonos de emergencias, mapas y enlaces de comunicación con los prestadores habilitados.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Navigation size={20} color="#0984e3" /> 2. Descargo sobre Estado de Rutas y Clima
            </h2>
            <p style={{ marginBottom: '10px' }}>
              La información relativa al estado de transitabilidad de las Rutas Provinciales (RP 13, RP 23 y conexiones) se replica a título informativo a partir de partes emitidos por la <strong>Dirección Provincial de Vialidad de Neuquén</strong> y organismos de seguridad competentes.
            </p>
            <div style={{ padding: '14px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', fontSize: '0.9rem', color: '#1e40af' }}>
              <strong>Aviso de Seguridad en Cordillera:</strong> Las condiciones climáticas en la montaña pueden provocar nevadas repentinas, congelamiento de calzada o formación de hielo en lapsos breves. Se recomienda siempre portar cadenas en temporada invernal y consultar con las autoridades de tránsito antes de emprender viaje.
            </div>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <MessageCircle size={20} color="var(--color-orange)" /> 3. Vínculo Comercial y Pedidos
            </h2>
            <p>
              AluminéGO no interviene como parte en los contratos, reservas de alojamiento, contrataciones de excursiones o pedidos gastronómicos acordados entre el usuario y los comercios. Los precios, disponibilidad, horarios de apertura y calidad de los servicios son de exclusiva responsabilidad de cada prestador adherido.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <AlertTriangle size={20} color="#eab308" /> 4. Uso de la Señal de Radio FM Golfo Azul
            </h2>
            <p>
              La transmisión online de <strong>FM Golfo Azul (92.5 MHz)</strong> incorporada en AluminéGO se ofrece para enriquecer la experiencia de audio local y cultural de los visitantes. La disponibilidad y continuidad de la emisión dependen de la conectividad de los servidores de streaming de la emisora.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              5. Modificaciones y Contacto
            </h2>
            <p>
              AluminéGO se reserva el derecho de actualizar los contenidos y términos en cualquier momento. Para consultas o reclamos institucionales, podés comunicarte con nuestro canal de atención oficial vía WhatsApp al +54 9 2942 66-1000.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
