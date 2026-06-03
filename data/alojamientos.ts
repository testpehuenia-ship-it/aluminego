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
    id: "aloj-1",
    name: "Hostería Aluminé",
    category: "Hostería",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80",
    whatsapp: "5492942123456",
    description: "Alojamiento céntrico en Aluminé.",
    amenities: ["Wi-Fi", "Desayuno", "Estacionamiento"]
  },
  {
    id: "aloj-2",
    name: "Cabañas del Río",
    category: "Cabaña",
    image: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=400&q=80",
    whatsapp: "5492942123456",
    description: "Hermosas cabañas a orillas del río Aluminé.",
    amenities: ["Parrilla", "Wi-Fi", "Río"]
  }
];
