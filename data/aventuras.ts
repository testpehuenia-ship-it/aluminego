export interface Aventura {
  id: string;
  name: string;
  category: string;
  image: string;
  whatsapp: string;
  description: string;
  details: string[];
}

export const AVENTURAS: Aventura[] = [
  {
    id: "adv-1",
    name: "Rafting en el Río Aluminé",
    category: "Aventura",
    image: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=400&q=80",
    whatsapp: "5492942123456",
    description: "Rafting de nivel mundial en las aguas del Río Aluminé.",
    details: ["Duración: 3hs", "Dificultad: Moderada", "Guías certificados"]
  }
];
