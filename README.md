# AlumineGo

AlumineGo es la plataforma digital completa para descubrir y disfrutar de **Aluminé, Neuquén**.
Diseñada para conectar a turistas y residentes con la oferta local: gastronomía, alojamientos, aventuras, información del clima y el estado oficial de las rutas.

## Características

- **Guía Local:** Directorio de comercios, restaurantes, cabañas, servicios y guías locales.
- **Pedidos Rápidos:** Contacto directo vía WhatsApp con los comercios.
- **Info Hub en Tiempo Real:** Clima local integrado y mapa interactivo con estado de los pasos fronterizos y rutas (datos de DPV Neuquén).
- **PWA Ready:** Instalable como aplicación móvil (PWA) desde el navegador para acceso offline y rápido.
- **Panel Administrativo:** Gestión de los comercios y banners publicitarios en tiempo real.

## Stack Tecnológico

- [Next.js 14+](https://nextjs.org/) con App Router
- **Base de Datos:** LibSQL (Turso) y Prisma ORM
- **Estilos:** CSS Modules y Tailwind (donde aplique)
- **Mapas:** MapLibre GL
- **Clima:** Open-Meteo API

## Configuración y Despliegue

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar Base de Datos:**
   Crear un archivo `.env` basado en la configuración necesaria y ejecutar:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Ejecutar Entorno de Desarrollo:**
   ```bash
   npm run dev
   ```
   Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

4. **Producción (Build):**
   ```bash
   npm run build
   npm start
   ```

## Mantenimiento

Para forzar la limpieza de caché durante el build:
`# Forzado de build para limpiar cache`