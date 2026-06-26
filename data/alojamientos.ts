export interface Alojamiento {
  id: string;
  name: string;
  category: string;
  image: string;
  whatsapp: string;
  description: string;
  amenities: string[];
}

export const ALOJAMIENTOS: Alojamiento[] = [
  {
    id: "cabanas-lago",
    name: "Cabañas del Lago Aluminé",
    category: "Cabañas",
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
    whatsapp: "5492942123456",
    description: "Cabañas premium con vista espectacular al lago Aluminé. Construidas con troncos y piedra, ideales para el descanso en familia.",
    amenities: ["Wi-Fi", "Estacionamiento", "Calefacción", "Parrilla", "Cocina Equipada"]
  },
  {
    id: "cabanas-bosque",
    name: "Refugio del Bosque",
    category: "Cabañas",
    image: "/images/refugio_bosque.png",
    whatsapp: "5492942123456",
    description: "Acogedoras cabañas rodeadas de milenarios bosques de araucarias. Un refugio de paz y tranquilidad.",
    amenities: ["Wi-Fi", "Estufa a Leña", "Estacionamiento", "Parrilla"]
  },
  {
    id: "hotel-Aluminé",
    name: "Gran Hotel Aluminé",
    category: "Hoteles",
    image: "/images/hotel_Aluminé.png",
    whatsapp: "5492942123456",
    description: "El hotel más exclusivo de la villa. Habitaciones de lujo con vista al lago y servicio de primer nivel.",
    amenities: ["Wi-Fi", "Desayuno Incluido", "Piscina Climatizada", "Spa", "Restaurante"]
  },
  {
    id: "hostel-aventura",
    name: "Hostel La Aventura",
    category: "Hostel",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    whatsapp: "5492942123456",
    description: "El punto de encuentro para mochileros y viajeros. Habitaciones compartidas y privadas con un gran ambiente joven.",
    amenities: ["Wi-Fi", "Cocina Compartida", "Bar", "Lockers", "Ropa Blanca"]
  },
  {
    id: "camping-pino",
    name: "Camping Pino Hachado",
    category: "Campings",
    image: "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?auto=format&fit=crop&w=800&q=80",
    whatsapp: "5492942123456",
    description: "Amplias parcelas con sombra, fogones y acceso directo al río. Ideal para conectar con la naturaleza.",
    amenities: ["Baños con Duchas", "Electricidad", "Proveeduría", "Parrillas"]
  }
];

