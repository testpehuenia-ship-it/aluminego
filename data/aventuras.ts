export interface Aventura {
  id: string;
  name: string;
  category: string;
  image: string;
  whatsapp: string;
  description: string;
  details: string[]; // e.g. ["Dificultad: Media", "Duración: 3hs", "Edad min: 10 años"]
}

export const AVENTURAS: Aventura[] = [
  {
    id: "trekking-batea",
    name: "Trekking al Volcán Batea Mahuida",
    category: "Trekking",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80",
    whatsapp: "5492942123456",
    description: "Una caminata inolvidable hasta el cráter del volcán, donde podremos observar la laguna y tener una vista panorámica de los lagos Aluminé y Moquehue.",
    details: ["Dificultad: Media", "Duración: 4hs", "Edad mín: 12 años"]
  },
  {
    id: "rafting-alumine",
    name: "Rafting en el Río Aluminé",
    category: "A. Acuaticas",
    image: "/images/aventura_rafting.png",
    whatsapp: "5492942123456",
    description: "Descenso emocionante por los rápidos del río Aluminé. Ideal para disfrutar en grupo con guías profesionales.",
    details: ["Dificultad: Media", "Duración: 2.5hs", "Edad mín: 12 años"]
  },
  {
    id: "cabalgata-bosque",
    name: "Cabalgata entre Araucarias",
    category: "Cabalgatas",
    image: "/images/aventura_cabalgatas.png",
    whatsapp: "5492942123456",
    description: "Paseo a caballo guiado por senderos mapuches rodeados del bosque milenario de araucarias, ideal para familias.",
    details: ["Dificultad: Baja", "Duración: 1.5hs", "Edad mín: 5 años"]
  },
  {
    id: "snowboard-batea",
    name: "Clases de Snowboard & Ski",
    category: "Nieve",
    image: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&fit=crop&w=800&q=80",
    whatsapp: "5492942123456",
    description: "Clases particulares y grupales en el Parque de Nieve Batea Mahuida. Pistas ideales para principiantes.",
    details: ["Dificultad: Adaptable", "Duración: 2hs a 4hs", "Edad mín: 6 años"]
  },
  {
    id: "pesca-mosca",
    name: "Flotada y Pesca con Mosca",
    category: "Pesca",
    image: "/images/aventura_pesca.png",
    whatsapp: "5492942123456",
    description: "Excursión de día completo flotando el río Aluminé, buscando las mejores truchas arcoíris y marrones. Incluye almuerzo.",
    details: ["Dificultad: Baja", "Duración: Día Completo", "Edad mín: 14 años"]
  },
  {
    id: "agencia-Aluminé-tours",
    name: "Aluminé Turismo & Traslados",
    category: "Agencia de turismo",
    image: "/images/aventura_agencia.png",
    whatsapp: "5492942123456",
    description: "Agencia integral. Organizamos tus excursiones personalizadas, traslados desde el aeropuerto y paquetes turísticos.",
    details: ["Atención: Lunes a Sábados", "Servicio: Integral", "Idiomas: ESP/ENG"]
  }
];

