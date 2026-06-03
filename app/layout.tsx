import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Oswald, Caveat } from "next/font/google";
import "./globals.css";
import InstallPrompt from "@/components/InstallPrompt";
import VisitTracker from "@/components/VisitTracker";

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
  metadataBase: new URL('https://www.AlumineGo.ar'),
  title: {
    default: 'AlumineGo | Guía y Delivery en Aluminé',
    template: '%s | AlumineGo'
  },
  description: 'Descubre dónde comer, alojarte y qué hacer en Aluminé. Pide comida directo por WhatsApp y reserva aventuras al instante.',
  keywords: ["Aluminé", "turismo", "delivery", "comida", "cabañas", "aventuras", "qué hacer", "dónde comer"],
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
    title: 'AlumineGo | Guía y Delivery en Aluminé',
    description: 'Descubre gastronomía, cabañas y aventuras en la joya de la Patagonia. Pedidos por WhatsApp al instante.',
    url: 'https://www.AlumineGo.ar',
    siteName: 'AlumineGo',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlumineGo | Guía y Delivery en Aluminé',
    description: 'Descubre gastronomía, cabañas y aventuras en la Patagonia.',
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
            if ('serviceWorker' in navigator) {
              var registerSW = function() {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                  console.log('ServiceWorker registered successfully:', reg.scope);
                }).catch(function(err) {
                  console.log('ServiceWorker registration failed:', err);
                });
              };
              if (document.readyState === 'complete' || document.readyState === 'interactive') {
                registerSW();
              } else {
                window.addEventListener('load', registerSW);
              }
            }
          `
        }} />
      </head>
      <body>
        {children}
        <InstallPrompt />
        <VisitTracker />
      </body>
    </html>
  );
}
