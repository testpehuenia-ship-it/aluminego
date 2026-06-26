import React from 'react';

export default function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["WebSite", "LocalBusiness"],
    "name": "AluminéGO",
    "url": "https://www.AluminéGO.ar",
    "description": "Guía local, comercial y turística definitiva de Aluminé. Todo el turismo, alojamiento, gastronomía, paseos y servicios al alcance de tu mano.",
    "telephone": "+5492942524300",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Aluminé",
      "addressRegion": "Neuquén",
      "addressCountry": "AR"
    },
    "sameAs": [
      "https://wa.me/5492942524300"
    ],
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.AluminéGO.ar/comercios?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

