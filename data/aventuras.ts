export interface Aventura {
  id: string;
  name: string;
  category: string;
  image: string;
  whatsapp: string;
  description: string;
  details: string[]; // e.g. ["Dificultad: Media", "DuraciÃ³n: 3hs", "Edad min: 10 aÃ±os"]
}

export const AVENTURAS: Aventura[] = [
  {
    id: "trekking-batea",
    name: "Trekking al VolcÃ¡n Batea Mahuida",
    category: "Trekking",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80",
    whatsapp: "5492942123456",
    description: "Una caminata inolvidable hasta el crÃ¡ter del volcÃ¡n, donde podremos observar la laguna y tener una vista panorÃ¡mica de los lagos AluminÃ© y Moquehue.",
    details: ["Dificultad: Media", "DuraciÃ³n: 4hs", "Edad mÃ­n: 12 aÃ±os"]
  },
  {
    id: "rafting-alumine",
    name: "Rafting en el RÃ­o AluminÃ©",
    category: "A. Acuaticas",
    image: "/images/aventura_rafting.png",
    whatsapp: "5492942123456",
    description: "Descenso emocionante por los rÃ¡pidos del rÃ­o AluminÃ©. Ideal para disfrutar en grupo con guÃ­as profesionales.",
    details: ["Dificultad: Media", "DuraciÃ³n: 2.5hs", "Edad mÃ­n: 12 aÃ±os"]
  },
  {
    id: "cabalgata-bosque",
    name: "Cabalgata entre Araucarias",
    category: "Cabalgatas",
    image: "/images/aventura_cabalgatas.png",
    whatsapp: "5492942123456",
    description: "Paseo a caballo guiado por senderos mapuches rodeados del bosque milenario de araucarias, ideal para familias.",
    details: ["Dificultad: Baja", "DuraciÃ³n: 1.5hs", "Edad mÃ­n: 5 aÃ±os"]
  },
  {
    id: "snowboard-batea",
    name: "Clases de Snowboard & Ski",
    category: "Nieve",
    image: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&fit=crop&w=800&q=80",
    whatsapp: "5492942123456",
    description: "Clases particulares y grupales en el Parque de Nieve Batea Mahuida. Pistas ideales para principiantes.",
    details: ["Dificultad: Adaptable", "DuraciÃ³n: 2hs a 4hs", "Edad mÃ­n: 6 aÃ±os"]
  },
  {
    id: "pesca-mosca",
    name: "Flotada y Pesca con Mosca",
    category: "Pesca",
    image: "/images/aventura_pesca.png",
    whatsapp: "5492942123456",
    description: "ExcursiÃ³n de dÃ­a completo flotando el rÃ­o AluminÃ©, buscando las mejores truchas arcoÃ­ris y marrones. Incluye almuerzo.",
    details: ["Dificultad: Baja", "DuraciÃ³n: DÃ­a Completo", "Edad mÃ­n: 14 aÃ±os"]
  },
  {
    id: "agencia-Aluminé-tours",
    name: "Aluminé Turismo & Traslados",
    category: "Agencia de turismo",
    image: "/images/aventura_agencia.png",
    whatsapp: "5492942123456",
    description: "Agencia integral. Organizamos tus excursiones personalizadas, traslados desde el aeropuerto y paquetes turÃ­sticos.",
    details: ["AtenciÃ³n: Lunes a SÃ¡bados", "Servicio: Integral", "Idiomas: ESP/ENG"]
  }
];

