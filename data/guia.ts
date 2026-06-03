export interface GuiaItem {
  id: string;
  nombre: string;
  rubro?: string;
  direccion: string;
  categoria: string;
}

export const GUIA_CATEGORIAS = [
  "Instituciones y Servicios Públicos",
  "Alojamiento",
  "Gastronomía",
  "Comercios y Proveedurías",
  "Servicios Varios y Actividades",
  "Medios de Comunicación"
];

export const GUIA_ITEMS: GuiaItem[] = [
  { id: "inst-1", nombre: "Municipalidad de Aluminé", rubro: "Institución", direccion: "Torcuato Modarelli y Cristian Joubert", categoria: "Instituciones y Servicios Públicos" },
  { id: "inst-2", nombre: "Hospital Aluminé", rubro: "Salud", direccion: "Ruta 23 y 4 de Caballería", categoria: "Instituciones y Servicios Públicos" },
  { id: "inst-3", nombre: "Comisaría 29", rubro: "Seguridad", direccion: "Centro Aluminé", categoria: "Instituciones y Servicios Públicos" },
  { id: "aloj-1", nombre: "Hostería Aluminé", rubro: "Hostería", direccion: "Centro", categoria: "Alojamiento" },
  { id: "aloj-2", nombre: "Cabañas del Río", rubro: "Cabañas", direccion: "Costanera del Río Aluminé", categoria: "Alojamiento" },
  { id: "gastro-1", nombre: "Broda's", rubro: "Restaurante", direccion: "Centro Aluminé", categoria: "Gastronomía" },
  { id: "gastro-2", nombre: "La Casona", rubro: "Restaurante y Pizzería", direccion: "Centro Aluminé", categoria: "Gastronomía" },
  { id: "com-1", nombre: "Supermercado La Montaña", rubro: "Supermercado", direccion: "Centro", categoria: "Comercios y Proveedurías" },
  { id: "com-2", nombre: "Farmacia Aluminé", rubro: "Farmacia", direccion: "Calle Principal", categoria: "Comercios y Proveedurías" },
  { id: "serv-1", nombre: "Aluminé Rafting", rubro: "Excursiones", direccion: "Río Aluminé", categoria: "Servicios Varios y Actividades" },
  { id: "med-1", nombre: "Radio Municipal Aluminé", rubro: "FM", direccion: "Aluminé", categoria: "Medios de Comunicación" }
];
