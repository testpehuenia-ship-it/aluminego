# AluminéGO - Guía Comercial, Turística y Delivery de Aluminé

AluminéGO es la guía definitiva y plataforma de delivery/reserva local de Aluminé (Neuquén, Argentina). Facilita a turistas y residentes locales la búsqueda de alojamientos, restaurantes, actividades de aventura, tiendas y servicios públicos en un único lugar, permitiendo la comunicación directa sin intermediarios mediante WhatsApp.

## 🚀 Características Principales

- **Búsqueda por Categorías**: Secciones dedicadas para Alojarse (Cabañas, Hoteles), Comer (Gastronomía y Delivery), Aventuras (Excursiones y Actividades), Comercios (Tiendas, Mercados) y Guía Local (Emergencias, Servicios Públicos).
- **Redirección Directa a Modales**: Búsqueda rápida desde la Guía Local que abre directamente las fichas de contacto o menús correspondientes en su sección de origen.
- **Suscripciones y Prioridades**: Jerarquía inteligente de comercios en base a su plan contratado (Comercio Completo premium arriba con borde naranja, Comercial Básico destacado en el medio con borde negro y Gratuitos ordenados alfabéticamente en la base).
- **SEO Premium e Indexabilidad Inteligente**:
  - Datos estructurados de Schema.org en formato JSON-LD adaptados a cada rubro (`Restaurant`, `LodgingBusiness`, `TouristAttraction`, `Store`, `LocalBusiness`).
  - Esquemas de tipo `ItemList` en las páginas de categorías para una óptima lectura por parte de buscadores de IA (ChatGPT/SearchGPT, Perplexity, Gemini).
  - Configuración avanzada de URLs Canónicas absolutas para mitigar contenido duplicado.
  - Generación dinámica de Sitemap (`sitemap.xml`) a partir de la base de datos de comercios y servicios.
- **PWA (Progressive Web App)**: Instalable en dispositivos móviles, rápido y optimizado para conexiones de red de baja señal.

## 🛠️ Stack Tecnológico

- **Frontend/Backend**: Next.js 15+ (App Router con renderizado de servidor e incremental ISR).
- **Base de Datos**: Turso DB / SQLite.
- **ORM**: Prisma.
- **Estilos**: Vanilla CSS y Tailwind (en áreas específicas).
- **Iconografía**: Lucide React.

## 📁 Estructura del Proyecto

```text
├── app/                  # Rutas y páginas de Next.js (App Router)
│   ├── (public)/         # Páginas públicas (Inicio, Comer, Alojarse, etc.)
│   ├── admin/            # Panel de control administrativo
│   └── api/              # Endpoints de API internos
├── components/           # Componentes React reutilizables (Filtros, Maps, JsonLd, etc.)
├── data/                 # Archivos de datos estáticos
├── lib/                  # Utilidades comunes y conexión a base de datos (Prisma client)
├── prisma/               # Esquema de base de datos y migraciones
├── public/               # Recursos estáticos (Imágenes, manifest.json, sw.js)
└── scripts/              # Scripts de mantenimiento y base de datos
```

## ⚙️ Scripts de Mantenimiento (`scripts/`)

El proyecto cuenta con varios scripts para simplificar tareas administrativas y de base de datos:

1. **`backfill-prisma.ts`**: Rellena campos nulos o vacíos en registros existentes de la base de datos (direcciones, coordenadas predeterminadas y horarios por defecto) utilizando Prisma.
2. **`backfill-defaults.ts`**: Script complementario utilizando la biblioteca nativa de LibSQL/Turso para asignar datos predeterminados (como horarios comerciales) en lotes masivos.
3. **`check-unlinked.ts`**: Ejecuta un diagnóstico rápido que compara y mapea las relaciones de comercios y suscripciones entre la tabla de la Guía Local (`LocalService`) y sus categorías específicas (`Accommodation`, `Business`, `Adventure`, `Commerce`).
4. **`list-pricing.ts`**: Lista la configuración actual de tarifas y planes publicitarios registrados en la base de datos (`PricingConfig`).

Para ejecutar cualquiera de estos scripts, utiliza `npx tsx scripts/<nombre-del-script>.ts`.

## 💻 Comandos Útiles

### Servidor de Desarrollo
Para iniciar el servidor local en entorno de desarrollo:
```bash
npm run dev
```

### Compilar para Producción
Para validar y compilar la aplicación asegurando optimización de bundles y validación estática de tipos:
```bash
npm run build
```

### Iniciar Servidor de Producción
```bash
npm start
```
