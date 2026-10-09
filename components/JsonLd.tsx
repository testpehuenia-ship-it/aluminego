import React from 'react';

export default function JsonLd() {
  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.aluminego.ar/#website",
        "name": "AluminéGO",
        "url": "https://www.aluminego.ar",
        "description": "Guía oficial y comercial de Aluminé: alojamientos, cabañas, restaurantes, delivery, rafting en Río Aluminé, Ruca Choroy, Quillén y estado de rutas.",
        "inLanguage": "es-AR",
        "publisher": {
          "@id": "https://www.aluminego.ar/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.aluminego.ar/comercios?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": ["TouristInformationCenter", "Organization"],
        "@id": "https://www.aluminego.ar/#organization",
        "name": "AluminéGO",
        "url": "https://www.aluminego.ar",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.aluminego.ar/icon-512x512.png"
        },
        "image": "https://www.aluminego.ar/og-muelle.jpg",
        "description": "Portal y guía de turismo, gastronomía, alojamientos, comercios y servicios de Aluminé, Neuquén, Patagonia Argentina.",
        "telephone": "+5492942123456",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Centro Comercial y Turístico",
          "addressLocality": "Aluminé",
          "addressRegion": "Neuquén",
          "postalCode": "8347",
          "addressCountry": "AR"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": -39.2369,
          "longitude": -70.9194
        },
        "areaServed": [
          {
            "@type": "AdministrativeArea",
            "name": "Aluminé, Neuquén, Argentina"
          },
          {
            "@type": "AdministrativeArea",
            "name": "Ruca Choroy, Neuquén, Argentina"
          },
          {
            "@type": "AdministrativeArea",
            "name": "Lago Quillén, Neuquén, Argentina"
          }
        ],
        "sameAs": [
          "https://www.aluminego.ar"
        ]
      },
      {
        "@type": "FAQPage",
        "@id": "https://www.aluminego.ar/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "¿Cómo llegar a Aluminé, Neuquén?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Se accede desde Zapala por la RP 13 empalmando con la RP 23, o por la RN 40 empalmando con la RP 23 o RP 46 por el Cuesta del Rahue. Se recomienda consultar el estado actualizado de rutas en AluminéGO antes de viajar."
            }
          },
          {
            "@type": "Question",
            "name": "¿Dónde alojarse en Aluminé?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Aluminé cuenta con cabañas a la orilla del río, hosterías, hoteles céntricos y campings organizados. Puedes comparar servicios y contactar directo por WhatsApp a través del directorio de AluminéGO."
            }
          },
          {
            "@type": "Question",
            "name": "¿Qué actividades y excursiones hacer en Aluminé?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Las actividades principales incluyen rafting y kayak en el Río Aluminé (de fama mundial), pesca deportiva con mosca, trekking por el Lago Ruca Choroy y Quillén, visitas a comunidades mapuches y cabalgatas cordilleranas."
            }
          },
          {
            "@type": "Question",
            "name": "¿Cómo pedir delivery de comida en Aluminé?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "En la sección Qué Comer de AluminéGO puedes ver la carta de restaurantes, pizzerías, rotiserías y cervecerías de Aluminé, armar tu pedido online y enviarlo directamente por WhatsApp al comercio."
            }
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
    />
  );
}
