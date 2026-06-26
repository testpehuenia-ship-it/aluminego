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
    id: "la-pizzeria-1",
    name: "La Pizzería del Bosque",
    category: "Pizzería",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
    whatsapp: "5492942123456",
    menu: [
      { id: "p1", name: "Muzarella Especial", description: "Muzarella, aceitunas y orégano", price: 8500 },
      { id: "p2", name: "Napolitana", description: "Tomate natural, ajo y perejil", price: 9200 },
      { id: "p3", name: "Fugazzeta con Queso", description: "Cebolla y muzarella", price: 8800 }
    ]
  },
  {
    id: "hamburgueseria-Aluminé",
    name: "Aluminé Burger",
    category: "Hamburguesa",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
    whatsapp: "5492942123456",
    menu: [
      { id: "h1", name: "Pehuen Burger", description: "Doble medallón, cheddar, bacon y salsa especial", price: 7500 },
      { id: "h2", name: "Burger Clásica", description: "Lechuga, tomate y queso", price: 6200 }
    ]
  },
  {
    id: "cerveceria-artesanal",
    name: "Cervecería del Lago",
    category: "Cervecería",
    image: "https://images.unsplash.com/photo-1608270176090-e82d65a63334?auto=format&fit=crop&w=400&q=80",
    whatsapp: "5492942123456",
    menu: [
      { id: "c1", name: "IPA Artesanal 1L", description: "Cerveza lupulada de la casa", price: 4500 },
      { id: "c2", name: "Honey 1L", description: "Suave con toque de miel local", price: 4200 }
    ]
  }
];

