export interface GuiaItem {
  id: string;
  nombre: string;
  rubro?: string;
  direccion: string;
  categoria: string;
}

export const GUIA_CATEGORIAS = [
  "Instituciones y Servicios PÃºblicos",
  "Alojamiento",
  "GastronomÃ­a",
  "Comercios y ProveedurÃ­as",
  "Servicios Varios y Actividades",
  "Medios de ComunicaciÃ³n"
];

export const GUIA_ITEMS: GuiaItem[] = [
  // 1. Instituciones y Servicios PÃºblicos
  {
    id: "inst-muni",
    nombre: "Municipalidad Aluminé Moquehue",
    rubro: "Servicio PÃºblico",
    direccion: "Ruta Provincial 13, km 10",
    categoria: "Instituciones y Servicios PÃºblicos"
  },
  {
    id: "inst-turismo",
    nombre: "SecretarÃ­a de Turismo",
    rubro: "Servicio PÃºblico",
    direccion: "Ruta Provincial 13",
    categoria: "Instituciones y Servicios PÃºblicos"
  },
  {
    id: "inst-salud",
    nombre: "Centro de Salud",
    rubro: "Salud",
    direccion: "Ruta Provincial 13",
    categoria: "Instituciones y Servicios PÃºblicos"
  },
  {
    id: "inst-policia",
    nombre: "PolicÃ­a (ComisarÃ­a 47)",
    rubro: "Seguridad",
    direccion: "Los CÃ³ndores s/n",
    categoria: "Instituciones y Servicios PÃºblicos"
  },
  {
    id: "inst-bomberos",
    nombre: "Bomberos Voluntarios",
    rubro: "Emergencias",
    direccion: "Aluminé",
    categoria: "Instituciones y Servicios PÃºblicos"
  },
  {
    id: "inst-defensa",
    nombre: "Defensa Civil",
    rubro: "Emergencias",
    direccion: "Aluminé",
    categoria: "Instituciones y Servicios PÃºblicos"
  },
  {
    id: "inst-gendarmeria",
    nombre: "GendarmerÃ­a Nacional (Icalma)",
    rubro: "Seguridad",
    direccion: "Paraje La Angostura",
    categoria: "Instituciones y Servicios PÃºblicos"
  },

  // 2. Alojamiento
  {
    id: "aloj-paraiso",
    nombre: "Al ParaÃ­so",
    rubro: "HosterÃ­a",
    direccion: "Aluminé",
    categoria: "Alojamiento"
  },
  {
    id: "aloj-amarras",
    nombre: "Amarras",
    rubro: "HosterÃ­a - CabaÃ±as",
    direccion: "Aluminé",
    categoria: "Alojamiento"
  },
  {
    id: "aloj-escondida",
    nombre: "Posada La Escondida",
    rubro: "HosterÃ­a - Apart",
    direccion: "Aluminé",
    categoria: "Alojamiento"
  },
  {
    id: "aloj-malen",
    nombre: "Puerto Malen",
    rubro: "HosterÃ­a - CabaÃ±as",
    direccion: "Aluminé",
    categoria: "Alojamiento"
  },
  {
    id: "aloj-melewe",
    nombre: "Melewe",
    rubro: "HosterÃ­a - CabaÃ±as",
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
    rubro: "HosterÃ­a",
    direccion: "Manzana K Lote 3",
    categoria: "Alojamiento"
  },
  {
    id: "aloj-refugio",
    nombre: "El Refugio",
    rubro: "CabaÃ±as",
    direccion: "Ruta 13 Km 8",
    categoria: "Alojamiento"
  },
  {
    id: "aloj-sueno",
    nombre: "SueÃ±o de Aluminé",
    rubro: "CabaÃ±as",
    direccion: "Laguna Chica s/n",
    categoria: "Alojamiento"
  },
  {
    id: "aloj-busqueda",
    nombre: "La BÃºsqueda",
    rubro: "Apart Hotel",
    direccion: "Ruta 11 Km 10.2 Moquehue",
    categoria: "Alojamiento"
  },

  // 3. GastronomÃ­a
  {
    id: "gastro-brava",
    nombre: "CervecerÃ­a Brava",
    rubro: "Cerveza Artesanal",
    direccion: "Aluminé",
    categoria: "GastronomÃ­a"
  },
  {
    id: "gastro-drumlin",
    nombre: "Drumlin",
    rubro: "CervecerÃ­a",
    direccion: "Centro CÃ­vico",
    categoria: "GastronomÃ­a"
  },
  {
    id: "gastro-chokolhaa",
    nombre: "Chokolhaa",
    rubro: "ChocolaterÃ­a",
    direccion: "Los Picaflores 180",
    categoria: "GastronomÃ­a"
  },
  {
    id: "gastro-alfonsina",
    nombre: "Alfonsina",
    rubro: "Restaurante",
    direccion: "Los Coihues s/n",
    categoria: "GastronomÃ­a"
  },
  {
    id: "gastro-borravino",
    nombre: "Borravino",
    rubro: "Restaurante",
    direccion: "Los Maitenes s/n",
    categoria: "GastronomÃ­a"
  },
  {
    id: "gastro-isla",
    nombre: "Isla de Aire",
    rubro: "Resto-Bar",
    direccion: "Moquehue (RP 11 Km 12)",
    categoria: "GastronomÃ­a"
  },
  {
    id: "gastro-troncos",
    nombre: "Los Troncos",
    rubro: "Resto-Bar",
    direccion: "Las Araucarias 200",
    categoria: "GastronomÃ­a"
  },
  {
    id: "gastro-finca",
    nombre: "Finca Gnaien",
    rubro: "Casa de TÃ©",
    direccion: "Aluminé",
    categoria: "GastronomÃ­a"
  },

  // 4. Comercios y ProveedurÃ­as
  {
    id: "com-montana",
    nombre: "De la MontaÃ±a",
    rubro: "Supermercado",
    direccion: "Centro Comercial",
    categoria: "Comercios y ProveedurÃ­as"
  },
  {
    id: "com-radales",
    nombre: "Los Radales",
    rubro: "Supermercado",
    direccion: "Moquehue",
    categoria: "Comercios y ProveedurÃ­as"
  },
  {
    id: "com-lengas",
    nombre: "Las Lengas",
    rubro: "FerreterÃ­a",
    direccion: "Moquehue",
    categoria: "Comercios y ProveedurÃ­as"
  },
  {
    id: "com-cirilo",
    nombre: "Don Cirilo",
    rubro: "FerreterÃ­a",
    direccion: "GalerÃ­a El CÃ¡ntaro",
    categoria: "Comercios y ProveedurÃ­as"
  },
  {
    id: "com-faro",
    nombre: "BotiquÃ­n Faro Azul",
    rubro: "Farmacia/Salud",
    direccion: "Centro Comercial",
    categoria: "Comercios y ProveedurÃ­as"
  },
  {
    id: "com-golfo",
    nombre: "Autoservicio del Golfo",
    rubro: "AlmacÃ©n",
    direccion: "Costanera GastronÃ³mica",
    categoria: "Comercios y ProveedurÃ­as"
  },
  {
    id: "com-pinonero",
    nombre: "El PiÃ±onero",
    rubro: "Supermercado",
    direccion: "Moquehue",
    categoria: "Comercios y ProveedurÃ­as"
  },
  {
    id: "com-verde",
    nombre: "Verde Violeta",
    rubro: "MercerÃ­a",
    direccion: "GalerÃ­a El CÃ¡ntaro",
    categoria: "Comercios y ProveedurÃ­as"
  },
  {
    id: "com-pioneros",
    nombre: "Pioneros",
    rubro: "FerreterÃ­a",
    direccion: "Centro Comercial",
    categoria: "Comercios y ProveedurÃ­as"
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
    rubro: "Taller MecÃ¡nico",
    direccion: "Ruta 13 Villa Italia",
    categoria: "Servicios Varios y Actividades"
  },
  {
    id: "serv-gomeria",
    nombre: "Joaquin",
    rubro: "GomerÃ­a",
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
    rubro: "Fotos y DiseÃ±o",
    direccion: "Centro CÃ­vico",
    categoria: "Servicios Varios y Actividades"
  },
  {
    id: "serv-ski",
    nombre: "Aloha Rental",
    rubro: "Alquiler de Ski",
    direccion: "Aluminé",
    categoria: "Servicios Varios y Actividades"
  },

  // 6. Medios de ComunicaciÃ³n
  {
    id: "medio-golfo",
    nombre: "FM Golfo Azul",
    rubro: "FM 92.5",
    direccion: "Aluminé y zona",
    categoria: "Medios de ComunicaciÃ³n"
  },
  {
    id: "medio-online",
    nombre: "Aluminé Online",
    rubro: "Diario Digital",
    direccion: "Aluminéonline.com.ar",
    categoria: "Medios de ComunicaciÃ³n"
  },
  {
    id: "medio-muni1",
    nombre: "Radio Municipal",
    rubro: "FM 91.3",
    direccion: "Aluminé",
    categoria: "Medios de ComunicaciÃ³n"
  },
  {
    id: "medio-muni2",
    nombre: "Radio Municipal Moquehue",
    rubro: "FM 89.3",
    direccion: "Moquehue",
    categoria: "Medios de ComunicaciÃ³n"
  }
];

