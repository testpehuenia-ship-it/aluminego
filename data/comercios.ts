export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Comercio {
  id: string;
  name: string;
  category: string;
  image: string;
  whatsapp: string;
  menu: MenuItem[];
}

export const COMERCIOS: Comercio[] = [
  {
    id: "rest-brodas",
    name: "Broda's",
    category: "Restaurante",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
    whatsapp: "5492942123456",
    menu: [
      { id: "m1", name: "Trucha al Roquefort", description: "Especialidad local", price: 12500 },
      { id: "m2", name: "Asado", description: "Porción abundante", price: 15200 }
    ]
  },
  {
    id: "rest-lacasona",
    name: "La Casona",
    category: "Pizzería",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
    whatsapp: "5492942123456",
    menu: [
      { id: "p1", name: "Pizza Especial Aluminé", description: "Muzarella y ahumados", price: 9500 }
    ]
  }
];
