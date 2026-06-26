# AluminéGO - GuÃ­a Comercial, TurÃ­stica y Delivery de Aluminé

AluminéGO es la guÃ­a definitiva y plataforma de delivery/reserva local de Aluminé (NeuquÃ©n, Argentina). Facilita a turistas y residentes locales la bÃºsqueda de alojamientos, restaurantes, actividades de aventura, tiendas y servicios pÃºblicos en un Ãºnico lugar, permitiendo la comunicaciÃ³n directa sin intermediarios mediante WhatsApp.

## ðŸš€ CaracterÃ­sticas Principales

- **BÃºsqueda por CategorÃ­as**: Secciones dedicadas para Alojarse (CabaÃ±as, Hoteles), Comer (GastronomÃ­a y Delivery), Aventuras (Excursiones y Actividades), Comercios (Tiendas, Mercados) y GuÃ­a Local (Emergencias, Servicios PÃºblicos).
- **RedirecciÃ³n Directa a Modales**: BÃºsqueda rÃ¡pida desde la GuÃ­a Local que abre directamente las fichas de contacto o menÃºs correspondientes en su secciÃ³n de origen.
- **Suscripciones y Prioridades**: JerarquÃ­a inteligente de comercios en base a su plan contratado (Comercio Completo premium arriba con borde naranja, Comercial BÃ¡sico destacado en el medio con borde negro y Gratuitos ordenados alfabÃ©ticamente en la base).
- **SEO Premium e Indexabilidad Inteligente**:
  - Datos estructurados de Schema.org en formato JSON-LD adaptados a cada rubro (`Restaurant`, `LodgingBusiness`, `TouristAttraction`, `Store`, `LocalBusiness`).
  - Esquemas de tipo `ItemList` en las pÃ¡ginas de categorÃ­as para una Ã³ptima lectura por parte de buscadores de IA (ChatGPT/SearchGPT, Perplexity, Gemini).
  - ConfiguraciÃ³n avanzada de URLs CanÃ³nicas absolutas para mitigar contenido duplicado.
  - GeneraciÃ³n dinÃ¡mica de Sitemap (`sitemap.xml`) a partir de la base de datos de comercios y servicios.
- **PWA (Progressive Web App)**: Instalable en dispositivos mÃ³viles, rÃ¡pido y optimizado para conexiones de red de baja seÃ±al.

## ðŸ› ï¸ Stack TecnolÃ³gico

- **Frontend/Backend**: Next.js 15+ (App Router con renderizado de servidor e incremental ISR).
- **Base de Datos**: Turso DB / SQLite.
- **ORM**: Prisma.
- **Estilos**: Vanilla CSS y Tailwind (en Ã¡reas especÃ­ficas).
- **IconografÃ­a**: Lucide React.

## ðŸ“ Estructura del Proyecto

```text
â”œâ”€â”€ app/                  # Rutas y pÃ¡ginas de Next.js (App Router)
â”‚   â”œâ”€â”€ (public)/         # PÃ¡ginas pÃºblicas (Inicio, Comer, Alojarse, etc.)
â”‚   â”œâ”€â”€ admin/            # Panel de control administrativo
â”‚   â””â”€â”€ api/              # Endpoints de API internos
â”œâ”€â”€ components/           # Componentes React reutilizables (Filtros, Maps, JsonLd, etc.)
â”œâ”€â”€ data/                 # Archivos de datos estÃ¡ticos
â”œâ”€â”€ lib/                  # Utilidades comunes y conexiÃ³n a base de datos (Prisma client)
â”œâ”€â”€ prisma/               # Esquema de base de datos y migraciones
â”œâ”€â”€ public/               # Recursos estÃ¡ticos (ImÃ¡genes, manifest.json, sw.js)
â””â”€â”€ scripts/              # Scripts de mantenimiento y base de datos
```

## âš™ï¸ Scripts de Mantenimiento (`scripts/`)

El proyecto cuenta con varios scripts para simplificar tareas administrativas y de base de datos:

1. **`backfill-prisma.ts`**: Rellena campos nulos o vacÃ­os en registros existentes de la base de datos (direcciones, coordenadas predeterminadas y horarios por defecto) utilizando Prisma.
2. **`backfill-defaults.ts`**: Script complementario utilizando la biblioteca nativa de LibSQL/Turso para asignar datos predeterminados (como horarios comerciales) en lotes masivos.
3. **`check-unlinked.ts`**: Ejecuta un diagnÃ³stico rÃ¡pido que compara y mapea las relaciones de comercios y suscripciones entre la tabla de la GuÃ­a Local (`LocalService`) y sus categorÃ­as especÃ­ficas (`Accommodation`, `Business`, `Adventure`, `Commerce`).
4. **`list-pricing.ts`**: Lista la configuraciÃ³n actual de tarifas y planes publicitarios registrados en la base de datos (`PricingConfig`).

Para ejecutar cualquiera de estos scripts, utiliza `npx tsx scripts/<nombre-del-script>.ts`.

## ðŸ’» Comandos Ãštiles

### Servidor de Desarrollo
Para iniciar el servidor local en entorno de desarrollo:
```bash
npm run dev
```

### Compilar para ProducciÃ³n
Para validar y compilar la aplicaciÃ³n asegurando optimizaciÃ³n de bundles y validaciÃ³n estÃ¡tica de tipos:
```bash
npm run build
```

### Iniciar Servidor de ProducciÃ³n
```bash
npm start
```
