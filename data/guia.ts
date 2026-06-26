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
  // 1. Instituciones y Servicios Públicos
  {
    id: "inst-muni",
    nombre: "Municipalidad Aluminé Moquehue",
    rubro: "Servicio Público",
    direccion: "Ruta Provincial 13, km 10",
    categoria: "Instituciones y Servicios Públicos"
  },
  {
    id: "inst-turismo",
    nombre: "Secretaría de Turismo",
    rubro: "Servicio Público",
    direccion: "Ruta Provincial 13",
    categoria: "Instituciones y Servicios Públicos"
  },
  {
    id: "inst-salud",
    nombre: "Centro de Salud",
    rubro: "Salud",
    direccion: "Ruta Provincial 13",
    categoria: "Instituciones y Servicios Públicos"
  },
  {
    id: "inst-policia",
    nombre: "Policía (Comisaría 47)",
    rubro: "Seguridad",
    direccion: "Los Cóndores s/n",
    categoria: "Instituciones y Servicios Públicos"
  },
  {
    id: "inst-bomberos",
    nombre: "Bomberos Voluntarios",
    rubro: "Emergencias",
    direccion: "Aluminé",
    categoria: "Instituciones y Servicios Públicos"
  },
  {
    id: "inst-defensa",
    nombre: "Defensa Civil",
    rubro: "Emergencias",
    direccion: "Aluminé",
    categoria: "Instituciones y Servicios Públicos"
  },
  {
    id: "inst-gendarmeria",
    nombre: "Gendarmería Nacional (Icalma)",
    rubro: "Seguridad",
    direccion: "Paraje La Angostura",
    categoria: "Instituciones y Servicios Públicos"
  },

  // 2. Alojamiento
  {
    id: "aloj-paraiso",
    nombre: "Al Paraíso",
    rubro: "Hostería",
    direccion: "Aluminé",
    categoria: "Alojamiento"
  },
  {
    id: "aloj-amarras",
    nombre: "Amarras",
    rubro: "Hostería - Cabañas",
    direccion: "Aluminé",
    categoria: "Alojamiento"
  },
  {
    id: "aloj-escondida",
    nombre: "Posada La Escondida",
    rubro: "Hostería - Apart",
    direccion: "Aluminé",
    categoria: "Alojamiento"
  },
  {
    id: "aloj-malen",
    nombre: "Puerto Malen",
    rubro: "Hostería - Cabañas",
    direccion: "Aluminé",
    categoria: "Alojamiento"
  },
  {
    id: "aloj-melewe",
    nombre: "Melewe",
    rubro: "Hostería - Cabañas",
    direccion: "Lago Moquehue",
    categoria: "Alojamiento"
  },
  {
    id: "aloj-mansa",
    nombre: "Bahia Mansa",
    rubro: "Apart Hotel",
    direccion: "Villa Italia",
    categoria: "Alojamiento"
  },
  {
    id: "aloj-balconada",
    nombre: "La Balconada",
    rubro: "Hostería",
    direccion: "Manzana K Lote 3",
    categoria: "Alojamiento"
  },
  {
    id: "aloj-refugio",
    nombre: "El Refugio",
    rubro: "Cabañas",
    direccion: "Ruta 13 Km 8",
    categoria: "Alojamiento"
  },
  {
    id: "aloj-sueno",
    nombre: "Sueño de Aluminé",
    rubro: "Cabañas",
    direccion: "Laguna Chica s/n",
    categoria: "Alojamiento"
  },
  {
    id: "aloj-busqueda",
    nombre: "La Búsqueda",
    rubro: "Apart Hotel",
    direccion: "Ruta 11 Km 10.2 Moquehue",
    categoria: "Alojamiento"
  },

  // 3. Gastronomía
  {
    id: "gastro-brava",
    nombre: "Cervecería Brava",
    rubro: "Cerveza Artesanal",
    direccion: "Aluminé",
    categoria: "Gastronomía"
  },
  {
    id: "gastro-drumlin",
    nombre: "Drumlin",
    rubro: "Cervecería",
    direccion: "Centro Cívico",
    categoria: "Gastronomía"
  },
  {
    id: "gastro-chokolhaa",
    nombre: "Chokolhaa",
    rubro: "Chocolatería",
    direccion: "Los Picaflores 180",
    categoria: "Gastronomía"
  },
  {
    id: "gastro-alfonsina",
    nombre: "Alfonsina",
    rubro: "Restaurante",
    direccion: "Los Coihues s/n",
    categoria: "Gastronomía"
  },
  {
    id: "gastro-borravino",
    nombre: "Borravino",
    rubro: "Restaurante",
    direccion: "Los Maitenes s/n",
    categoria: "Gastronomía"
  },
  {
    id: "gastro-isla",
    nombre: "Isla de Aire",
    rubro: "Resto-Bar",
    direccion: "Moquehue (RP 11 Km 12)",
    categoria: "Gastronomía"
  },
  {
    id: "gastro-troncos",
    nombre: "Los Troncos",
    rubro: "Resto-Bar",
    direccion: "Las Araucarias 200",
    categoria: "Gastronomía"
  },
  {
    id: "gastro-finca",
    nombre: "Finca Gnaien",
    rubro: "Casa de Té",
    direccion: "Aluminé",
    categoria: "Gastronomía"
  },

  // 4. Comercios y Proveedurías
  {
    id: "com-montana",
    nombre: "De la Montaña",
    rubro: "Supermercado",
    direccion: "Centro Comercial",
    categoria: "Comercios y Proveedurías"
  },
  {
    id: "com-radales",
    nombre: "Los Radales",
    rubro: "Supermercado",
    direccion: "Moquehue",
    categoria: "Comercios y Proveedurías"
  },
  {
    id: "com-lengas",
    nombre: "Las Lengas",
    rubro: "Ferretería",
    direccion: "Moquehue",
    categoria: "Comercios y Proveedurías"
  },
  {
    id: "com-cirilo",
    nombre: "Don Cirilo",
    rubro: "Ferretería",
    direccion: "Galería El Cántaro",
    categoria: "Comercios y Proveedurías"
  },
  {
    id: "com-faro",
    nombre: "Botiquín Faro Azul",
    rubro: "Farmacia/Salud",
    direccion: "Centro Comercial",
    categoria: "Comercios y Proveedurías"
  },
  {
    id: "com-golfo",
    nombre: "Autoservicio del Golfo",
    rubro: "Almacén",
    direccion: "Costanera Gastronómica",
    categoria: "Comercios y Proveedurías"
  },
  {
    id: "com-pinonero",
    nombre: "El Piñonero",
    rubro: "Supermercado",
    direccion: "Moquehue",
    categoria: "Comercios y Proveedurías"
  },
  {
    id: "com-verde",
    nombre: "Verde Violeta",
    rubro: "Mercería",
    direccion: "Galería El Cántaro",
    categoria: "Comercios y Proveedurías"
  },
  {
    id: "com-pioneros",
    nombre: "Pioneros",
    rubro: "Ferretería",
    direccion: "Centro Comercial",
    categoria: "Comercios y Proveedurías"
  },

  // 5. Servicios Varios y Actividades
  {
    id: "serv-rafting",
    nombre: "Aluminé Rafting",
    rubro: "Excursiones",
    direccion: "Aluminé",
    categoria: "Servicios Varios y Actividades"
  },
  {
    id: "serv-mecanico",
    nombre: "Juan Hernandez",
    rubro: "Taller Mecánico",
    direccion: "Ruta 13 Villa Italia",
    categoria: "Servicios Varios y Actividades"
  },
  {
    id: "serv-gomeria",
    nombre: "Joaquin",
    rubro: "Gomería",
    direccion: "Centro Comercial",
    categoria: "Servicios Varios y Actividades"
  },
  {
    id: "serv-lavadero",
    nombre: "Aluminé Lavadero",
    rubro: "Lavado de ropa",
    direccion: "Centro Comercial",
    categoria: "Servicios Varios y Actividades"
  },
  {
    id: "serv-fotos",
    nombre: "Punctum",
    rubro: "Fotos y Diseño",
    direccion: "Centro Cívico",
    categoria: "Servicios Varios y Actividades"
  },
  {
    id: "serv-ski",
    nombre: "Aloha Rental",
    rubro: "Alquiler de Ski",
    direccion: "Aluminé",
    categoria: "Servicios Varios y Actividades"
  },

  // 6. Medios de Comunicación
  {
    id: "medio-golfo",
    nombre: "FM Golfo Azul",
    rubro: "FM 92.5",
    direccion: "Aluminé y zona",
    categoria: "Medios de Comunicación"
  },
  {
    id: "medio-online",
    nombre: "Aluminé Online",
    rubro: "Diario Digital",
    direccion: "Aluminéonline.com.ar",
    categoria: "Medios de Comunicación"
  },
  {
    id: "medio-muni1",
    nombre: "Radio Municipal",
    rubro: "FM 91.3",
    direccion: "Aluminé",
    categoria: "Medios de Comunicación"
  },
  {
    id: "medio-muni2",
    nombre: "Radio Municipal Moquehue",
    rubro: "FM 89.3",
    direccion: "Moquehue",
    categoria: "Medios de Comunicación"
  }
];

