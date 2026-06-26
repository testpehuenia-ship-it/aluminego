import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Oswald, Caveat } from "next/font/google";
import "./globals.css";
import InstallPrompt from "@/components/InstallPrompt";
import VisitTracker from "@/components/VisitTracker";
import PushPrompt from "@/components/PushPrompt";
import JsonLd from "@/components/JsonLd";
import { FavoritesProvider } from "@/components/FavoritesContext";
import { PortalProvider } from "@/components/PortalContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const viewport: Viewport = {
  themeColor: '#27ae60',
};

export const metadata: Metadata = {
  manifest: '/manifest.json',
  metadataBase: new URL('https://www.AluminéGO.ar'),
  title: {
    default: 'AluminéGO | Guía Turística y Delivery en Aluminé',
    template: '%s | AluminéGO'
  },
  description: 'La Guía Turística y Local definitiva. Encuentra alojamiento, gastronomía, excursiones, aventuras, estado de las rutas, clima y servicios en Aluminé.',
  keywords: ["Aluminé", "guía local", "guía turística", "turismo", "alojamiento", "cabañas", "dónde comer", "gastronomía", "delivery", "aventuras", "servicios locales", "paseos"],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'AluminéGO | Guía Turística y Delivery en Aluminé',
    description: 'La Guía Turística y Local definitiva. Encuentra alojamiento, gastronomía, excursiones, aventuras, estado de las rutas, clima y servicios en Aluminé.',
    url: 'https://www.AluminéGO.ar',
    siteName: 'AluminéGO',
    locale: 'es_AR',
    type: 'website',
    images: [
      {
        url: 'https://AluminéGO.ar/og-muelle.jpg',
        width: 1200,
        height: 630,
        alt: 'Paisaje en Aluminé',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AluminéGO | Guía Turística y Delivery en Aluminé',
    description: 'La Guía Turística y Local definitiva. Encuentra alojamiento, gastronomía, excursiones, aventuras, estado de las rutas, clima y servicios en Aluminé.',
    images: ['https://AluminéGO.ar/og-muelle.jpg'],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} ${caveat.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.deferredPrompt = null;
            window.addEventListener('beforeinstallprompt', function(e) {
              e.preventDefault();
              window.deferredPrompt = e;
              window.dispatchEvent(new CustomEvent('deferredPromptReady'));
            });
          `
        }} />
        <JsonLd />
      </head>
      <body>
        <PortalProvider>
          <FavoritesProvider>
            {children}
            <InstallPrompt />
            <PushPrompt />
            <VisitTracker />
          </FavoritesProvider>
        </PortalProvider>
      </body>
    </html>
  );
}

