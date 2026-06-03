import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DiagnosticsPage() {
  let dbResult = '';
  let dbError = '';

  try {
    console.log('>>> [DIAGNOSTICO] Intentando consultar base de datos...');
    const categoriesCount = await prisma.category.count();
    dbResult = `✅ Conexión Exitosa. Cantidad de Categorías: ${categoriesCount}`;
  } catch (err: any) {
    console.error('>>> [DIAGNOSTICO] Error al conectar:', err);
    dbError = `❌ Error: ${err.message || err}\nName: ${err.name}\nCode: ${err.code}\nStack:\n${err.stack}`;
  }

  const getMaskedVal = (key: string) => {
    const val = process.env[key];
    if (val === undefined) return 'undefined (tipo undefined)';
    if (val === null) return 'null';
    if (val === 'undefined') return 'literal string "undefined" ❌';
    if (val === '') return 'empty string ""';
    
    // Mask token if any
    if (val.includes('?authToken=')) {
      const parts = val.split('?authToken=');
      return `${parts[0]}?authToken=***${parts[1].substring(parts[1].length - 5)}`;
    }
    if (val.length > 50) {
      return `${val.substring(0, 15)}... [largo: ${val.length}]`;
    }
    return val;
  };

  const keys = ['DATABASE_URL', 'TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'VERCEL_GIT_COMMIT_SHA'];

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>Diagnóstico de Variables de Entorno (v3)</h1>
      <p>Variables detectadas:</p>
      <ul>
        {keys.map(k => (
          <li key={k}>
            <strong>{k}</strong>: <code>{getMaskedVal(k)}</code>
          </li>
        ))}
      </ul>
      <hr />
      <h2>Estado de la Base de Datos (Turso / Prisma)</h2>
      {dbResult && (
        <div style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '15px', borderRadius: '5px', border: '1px solid green', whiteSpace: 'pre-wrap' }}>
          {dbResult}
        </div>
      )}
      {dbError && (
        <div style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '15px', borderRadius: '5px', border: '1px solid red', whiteSpace: 'pre-wrap' }}>
          {dbError}
        </div>
      )}
      <hr />
      <p>Estado de VERCEL: {process.env.VERCEL === '1' ? '✅ SI' : '❌ NO'}</p>
      <p>NODE_ENV: {process.env.NODE_ENV}</p>
    </div>
  );
}
