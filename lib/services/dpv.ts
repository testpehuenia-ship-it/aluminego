export interface DPVRouteTramo {
  codigoTramo: number;
  rutaNumero: number;
  rutaProvincial: boolean;
  rutaTramo: string;
  rutaTipo: string;
  rutaLongitud: number;
  rutaEstado: string;
  rutaSeccion: string;
  rutaObservacion: string;
}

export interface DPVPaso {
  codTramo: number;
  descripcion: string;
  nroRuta: number;
  superficie: string;
}

export interface DPVParteResponse {
  fecha: string;
  hora: string;
  info?: string;
  tramoRutaList: DPVRouteTramo[];
}

export interface DPVUnifiedData {
  lastUpdated: string;
  pasos: (DPVPaso & { status: string; observacion: string; estadoCompleto: DPVRouteTramo | null })[];
  rutas: DPVRouteTramo[];
}

// Convert state codes to human readable format based on OpenAPI specs/common knowledge
export const formatDPVStatus = (statusCode: string) => {
  switch (statusCode?.toUpperCase()) {
    case 'T':
      return 'Transitable';
    case 'TCP':
      return 'Transitable con Precaución';
    case 'I':
    case 'C':
      return 'Cerrado / Intransitable';
    default:
      return statusCode || 'Desconocido';
  }
};

export async function getDPVStatus(): Promise<DPVUnifiedData | null> {
  try {
    // Fetch live status and border crossings list in parallel
    // Using Next.js caching, revalidate every 15 minutes (900 seconds)
    const [parteRes, pasosRes] = await Promise.all([
      fetch('https://w2.dpvneuquen.gov.ar/parteopendata/api/parte', {
        next: { revalidate: 900 }
      }),
      fetch('https://w2.dpvneuquen.gov.ar/parteopendata/api/pasos', {
        next: { revalidate: 86400 } // Pasos list doesn't change often, cache for 1 day
      })
    ]);

    if (!parteRes.ok || !pasosRes.ok) {
      console.error('Failed to fetch from DPV API');
      return null;
    }

    const parteData: DPVParteResponse = await parteRes.json();
    const pasosData: DPVPaso[] = await pasosRes.json();

    const tramos = parteData.tramoRutaList || [];

    // Map the border crossings (Pasos) with their current live status
    const unifiedPasos = pasosData.map((paso) => {
      // Find the corresponding tramo in the live data
      const liveStatus = tramos.find(t => t.codigoTramo === paso.codTramo) || null;
      
      return {
        ...paso,
        status: liveStatus ? formatDPVStatus(liveStatus.rutaEstado) : 'Desconocido',
        observacion: liveStatus?.rutaObservacion || 'Sin observaciones recientes',
        estadoCompleto: liveStatus
      };
    });

    return {
      lastUpdated: `${parteData.fecha} ${parteData.hora}`,
      pasos: unifiedPasos,
      rutas: tramos
    };
  } catch (error) {
    console.error('Error fetching DPV status:', error);
    return null;
  }
}
