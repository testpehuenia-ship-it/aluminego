import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, Eye, Bell, Database, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad y Protección de Datos | AluminéGO',
  description: 'Conocé cómo protegemos tus datos personales conforme a la Ley 25.326 de la República Argentina y estándares internacionales (GDPR).',
  alternates: {
    canonical: 'https://www.aluminego.ar/privacidad',
  },
};

export default function PrivacidadPage() {
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(56, 176, 0, 0.1)', color: 'var(--color-green)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '16px' }}>
            <ShieldCheck size={18} /> LEY 25.326 • GDPR COMPLIANT
          </div>
          <h1 style={{ fontSize: '2.2rem', color: '#1e293b', fontFamily: 'var(--font-oswald), sans-serif', textTransform: 'uppercase', lineHeight: 1.15, marginBottom: '12px' }}>
            Política de Privacidad y Protección de Datos
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6 }}>
            Última actualización: Septiembre de 2026. AluminéGO («la Plataforma») está comprometida con la confidencialidad, seguridad y el tratamiento transparente de la información de sus visitantes y usuarios.
          </p>
        </div>

        {/* Contenido articulado */}
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
              <Lock size={20} color="var(--color-orange)" /> 1. Marco Legal y Ámbito de Aplicación
            </h2>
            <p>
              Esta política cumple con los lineamientos de la <strong>Ley N° 25.326 de Protección de los Datos Personales de la República Argentina</strong> y su Decreto Reglamentario N° 1558/2001, así como con los principios rectores del <strong>Reglamento General de Protección de Datos (GDPR/RGPD UE 2016/679)</strong> aplicables a turistas internacionales que utilizan los servicios de información de Aluminé.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Database size={20} color="var(--color-green)" /> 2. Datos que Recolectamos y Finalidad
            </h2>
            <p style={{ marginBottom: '10px' }}>
              AluminéGO aplica el principio de <em>minimización de datos</em>. Recopilamos únicamente lo estrictamente necesario para la funcionalidad turística:
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong>Navegación y Estadísticas Anónimas:</strong> Registramos la cantidad de visitas por sección (gastronomía, alojamiento, mapas) con el único fin de generar métricas globales de interés turístico. No almacenamos direcciones IP completas ni huellas digitales identificatorias.
              </li>
              <li>
                <strong>Reseñas y Comentarios Públicos:</strong> Al publicar voluntariamente una opinión sobre un comercio o servicio, se almacena el nombre proporcionado, la puntuación y el texto. El correo electrónico (si se ingresa) es privado y no se publica.
              </li>
              <li>
                <strong>Notificaciones Push Web:</strong> Si el usuario acepta recibir alertas sobre el estado de rutas o eventos en tiempo real, el navegador genera un identificador de suscripción criptográfico (VAPID). No se asocia a nombres, teléfonos ni tarjetas de crédito.
              </li>
              <li>
                <strong>Almacenamiento Local (Local Storage):</strong> Guardamos en tu propio dispositivo tus elementos guardados («Mis Favoritos») y tus preferencias de volumen de la radio FM Golfo Azul. Estos datos residen exclusivamente en tu navegador y podés borrarlos limpiando la memoria caché.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Eye size={20} color="var(--color-celeste)" /> 3. Transacciones y Contacto con Comercios
            </h2>
            <p>
              AluminéGO es un portal y guía interactiva de vinculación directa. Al presionar botones de WhatsApp o enlaces externos hacia prestadores turísticos, cabañas o restaurantes, la conversación o transacción comercial se efectúa directamente entre el usuario y el comercio prestador. AluminéGO <strong>no procesa cobros ni almacena datos bancarios ni números de tarjeta de crédito</strong> de los visitantes.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Bell size={20} color="var(--color-purple)" /> 4. Uso de Cookies y Tecnologías Similares
            </h2>
            <p>
              Utilizamos cookies técnicas y de sesión esenciales para el funcionamiento de la PWA (Progressive Web App) y el mantenimiento de sesión en el portal comercial. No comercializamos bases de datos ni compartimos perfiles de navegación con redes publicitarias de terceros.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Mail size={20} color="var(--color-dark-green)" /> 5. Ejercicio de Derechos ARCO (Habeas Data)
            </h2>
            <p style={{ marginBottom: '12px' }}>
              El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326.
            </p>
            <p>
              Para solicitar la actualización, rectificación o supresión de reseñas o datos comerciales registrados, podés contactarte formalmente con el equipo de administración de AluminéGO a través de WhatsApp o al correo electrónico habilitado de la plataforma.
            </p>
            <div style={{ marginTop: '14px', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
              <em>La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.</em>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
