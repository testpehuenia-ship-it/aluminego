import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const SYSTEM_PROMPT = `Eres el Asistente Inteligente oficial de AluminéGO. Tu función es actuar como un facilitador experto en la experiencia digital, turística y comercial de Aluminé, Neuquén y sus alrededores (Río Aluminé, Lago Ruca Choroy, Lago Quillén, Lago Pulmarí, Rahue, etc.).
Tu personalidad y tono:
•	Eres cordial, resolutivo y posees un conocimiento profundo de la región de Aluminé y la Patagonia.
•	Utilizas un español claro, ágil y cercano, reflejando el profesionalismo del ecosistema digital.
Tus directrices de comportamiento:
1.	Direccionamiento a Secciones: Cuando menciones una sección, debes dirigir al usuario a la sección correspondiente mediante un hipervínculo en formato Markdown:
    - Para Qué Comer / Gastronomía: [Qué Comer](https://www.aluminego.ar/comer)
    - Para Dormir / Alojamiento: [Dormir](https://www.aluminego.ar/alojarse)
    - Para Aventuras / Excursiones / Rafting: [Aventuras](https://www.aluminego.ar/aventuras)
    - Para Comercios y Servicios generales: [Comercios](https://www.aluminego.ar/comercios)
    - Para la Guía Local y Emergencias: [Guía Local](https://www.aluminego.ar/guia)
    - Para el Estado de Rutas y Mapa: [Mapa y Rutas](https://www.aluminego.ar/mapa)
2.	Recomendaciones Efectivas y Específicas (No Generales):
    - Si el usuario busca algo específico (ej. "tomar una cerveza", "comer pizza", "alquilar cabaña", "rafting en el río", "pesca con mosca", "farmacia"), busca coincidencias exactas en el catálogo adjunto (revisando nombres, rubros y descripciones).
    - Recomienda los comercios reales que coincidan directamente con lo solicitado.
    - Proporciona SIEMPRE el nombre del comercio recomendado formateado como un hipervínculo Markdown directo a su ficha de la app. Ej: [Nombre del Comercio](https://www.aluminego.ar/comer/id_comercio).
3.	Priorización de Destacados:
    - En el catálogo se indica si un comercio es "Destacado de pago: SÍ". Debes darles prioridad absoluta en tus respuestas a estos comercios patrocinados cuando coincidan con la búsqueda.
4.	Excursiones y Aventuras:
    - Brinda información detallada sobre los atractivos naturales emblemáticos de Aluminé: Rafting en el Río Aluminé (sede del mundial de rafting), Lago Ruca Choroy (bosques milenarios de pehuenes y comunidad mapuche), Lago Quillén (vista al volcán Lanín), Lago Pulmarí, pesca deportiva con mosca, cabalgatas y senderismo.
    - Al mismo tiempo, recomienda prestadores destacados de pago que ofrezcan servicios allí usando los hipervínculos provistos.
5.	Para usuarios de negocio/anunciantes: Si detectas que la consulta es técnica, comercial o sobre gestión de servicios (como la carga de información o dudas sobre la plataforma), sé directo, preciso y eficiente.
6.	Gestión de derivaciones: Si el usuario tiene dudas específicas sobre publicidad o requiere atención personalizada, responde: 'Para brindarte atención personalizada sobre este tema, te recomiendo contactar con nuestro equipo de soporte comercial. ¿Deseas que te facilite un canal de contacto directo?' y ofrece enviar un mensaje de WhatsApp.
7.	Fidelización: Aprovecha momentos naturales de la conversación para incentivar el consumo en comercios locales adheridos a AluminéGO.
8.	Reglas de seguridad: Nunca inventes información. Si no tienes la respuesta o no hay un comercio patrocinado registrado para esa categoría, menciona que el equipo de soporte de AluminéGO está a su entera disposición.
Tu identidad: Si te preguntan quién eres, responde: 'Soy el asistente virtual de AluminéGO, diseñado para acompañarte y facilitarte todo en tu visita o vida diaria en Aluminé'.`;

export async function POST(req: Request) {
  try {
    const { messages, userName } = await req.json();

    // Query ALL active entities to feed into the AI context
    let catalogContext = "";
    let businesses: any[] = [];
    let accommodations: any[] = [];
    let adventures: any[] = [];
    let commerces: any[] = [];

    try {
      const graceDate = new Date();
      graceDate.setDate(graceDate.getDate() - 7);

      [businesses, accommodations, adventures, commerces] = await Promise.all([
        prisma.business.findMany({
          include: { subscription: true, category: true }
        }),
        prisma.accommodation.findMany({
          include: { subscription: true }
        }),
        prisma.adventure.findMany({
          include: { subscription: true }
        }),
        prisma.commerce.findMany({
          include: { subscription: true }
        })
      ]);

      catalogContext = "\n\nAquí tienes el CATÁLOGO COMPLETO y actualizado de establecimientos registrados en Aluminé. Cuando el usuario pregunte por recomendaciones de lugares para comer, tomar algo, hospedarse, actividades o comercios, debes realizar una búsqueda precisa de coincidencia dentro de este catálogo. Si encuentras coincidencias, recomiéndale los lugares específicos y proporciona su enlace exacto en formato Markdown para que lo lleven directo a su ficha:\n\n";

      catalogContext += "--- CATÁLOGO DE GASTRONOMÍA (Qué Comer) ---\n";
      businesses.forEach(b => {
        const isPaid = b.subscription && new Date(b.subscription.dueDate) >= graceDate;
        catalogContext += `- Nombre: ${b.name}\n  Categoría: ${b.category?.title || ''}\n  Descripción/Detalles: ${b.description || ''} ${b.details || ''} ${b.openingHours || ''}\n  Enlace: [${b.name}](https://www.aluminego.ar/comer/${b.id})\n  Destacado de pago: ${isPaid ? 'SÍ' : 'NO'}\n\n`;
      });

      catalogContext += "--- CATÁLOGO DE ALOJAMIENTOS (Dónde Dormir) ---\n";
      accommodations.forEach(a => {
        const isPaid = a.subscription && new Date(a.subscription.dueDate) >= graceDate;
        catalogContext += `- Nombre: ${a.name}\n  Tipo: ${a.type}\n  Descripción/Detalles: ${a.description || ''} ${a.openingHours || ''}\n  Enlace: [${a.name}](https://www.aluminego.ar/alojarse/${a.id})\n  Destacado de pago: ${isPaid ? 'SÍ' : 'NO'}\n\n`;
      });

      catalogContext += "--- CATÁLOGO DE AVENTURAS Y EXCURSIONES ---\n";
      adventures.forEach(ad => {
        const isPaid = ad.subscription && new Date(ad.subscription.dueDate) >= graceDate;
        catalogContext += `- Nombre: ${ad.name}\n  Actividad/Categoría: ${ad.category}\n  Descripción/Detalles: ${ad.description || ''} ${ad.details || ''}\n  Enlace: [${ad.name}](https://www.aluminego.ar/aventuras/${ad.id})\n  Destacado de pago: ${isPaid ? 'SÍ' : 'NO'}\n\n`;
      });

      catalogContext += "--- CATÁLOGO DE COMERCIOS Y SERVICIOS ---\n";
      commerces.forEach(c => {
        const isPaid = c.subscription && new Date(c.subscription.dueDate) >= graceDate;
        catalogContext += `- Nombre: ${c.name}\n  Tipo/Rubro: ${c.type}\n  Descripción/Detalles: ${c.description || ''}\n  Enlace: [${c.name}](https://www.aluminego.ar/comercios/${c.id})\n  Destacado de pago: ${isPaid ? 'SÍ' : 'NO'}\n\n`;
      });

    } catch (dbErr) {
      console.error('Error fetching catalog from DB:', dbErr);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Mock mode for local testing when API key is not present
      const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

      const namePrefix = userName ? `Mira ${userName}, ` : '';
      const nameGreeting = userName ? `¡Hola ${userName}! ` : '¡Hola! ';

      let mockReply = '';
      if (lastUserMessage.includes('hola') || lastUserMessage.includes('buen') || lastUserMessage.includes('quien sos') || lastUserMessage.includes('quién eres')) {
        mockReply = `${nameGreeting}Soy el asistente virtual de AluminéGO, diseñado para acompañarte en tu experiencia por Aluminé. *Nota: Modo demostración local activo.* ¿En qué te puedo ayudar hoy?`;
      } else {
        let matchedItems: any[] = [];
        
        if (lastUserMessage.includes('comer') || lastUserMessage.includes('gastronom') || lastUserMessage.includes('tomar') || lastUserMessage.includes('cena') || lastUserMessage.includes('almuer') || lastUserMessage.includes('pizz') || lastUserMessage.includes('cerve') || lastUserMessage.includes('caf') || lastUserMessage.includes('restaur')) {
          matchedItems = businesses.map(b => ({ ...b, type: 'comer' }));
        } else if (lastUserMessage.includes('dormir') || lastUserMessage.includes('cabañ') || lastUserMessage.includes('hotel') || lastUserMessage.includes('alojar') || lastUserMessage.includes('camping')) {
          matchedItems = accommodations.map(a => ({ ...a, type: 'alojarse' }));
        } else if (lastUserMessage.includes('aventura') || lastUserMessage.includes('excursion') || lastUserMessage.includes('actividad') || lastUserMessage.includes('hacer') || lastUserMessage.includes('rafting') || lastUserMessage.includes('pesca') || lastUserMessage.includes('trekking') || lastUserMessage.includes('kayak')) {
          matchedItems = adventures.map(ad => ({ ...ad, type: 'aventuras' }));
        } else if (lastUserMessage.includes('comercio') || lastUserMessage.includes('supermerc') || lastUserMessage.includes('farmac') || lastUserMessage.includes('tienda') || lastUserMessage.includes('compra')) {
          matchedItems = commerces.map(c => ({ ...c, type: 'comercios' }));
        }

        if (matchedItems.length > 0) {
          const graceDate = new Date();
          graceDate.setDate(graceDate.getDate() - 7);
          const sponsored = matchedItems.find(item => item.subscription && new Date(item.subscription.dueDate) >= graceDate);
          const bestItem = sponsored || matchedItems[0];
          
          const sectionText = bestItem.type === 'comer' ? '[Qué Comer](https://www.aluminego.ar/comer)' : 
                              bestItem.type === 'alojarse' ? '[Dormir](https://www.aluminego.ar/alojarse)' :
                              bestItem.type === 'aventuras' ? '[Aventuras](https://www.aluminego.ar/aventuras)' :
                              '[Comercios](https://www.aluminego.ar/comercios)';
          
          mockReply = `${namePrefix}si buscas opciones en Aluminé, te sugiero explorar la sección de ${sectionText}. Te recomiendo especialmente visitar a [${bestItem.name}](https://www.aluminego.ar/${bestItem.type}/${bestItem.id}), ${bestItem.description || 'que cuenta con excelentes opciones para lo que estás buscando'}.`;
        } else if (lastUserMessage.includes('contacto') || lastUserMessage.includes('publicidad') || lastUserMessage.includes('anunciar') || lastUserMessage.includes('soporte') || lastUserMessage.includes('precio') || lastUserMessage.includes('plan')) {
          mockReply = `Claro ${userName || ''}, para planes comerciales o soporte en AluminéGO, puedes comunicarte con nuestro equipo comercial a través de nuestra plataforma.`;
        } else {
          mockReply = `Entiendo perfectamente tu consulta, ${userName || 'amigo'}. Para encontrar lo que necesitas en Aluminé, te recomiendo revisar las secciones de [Qué Comer](https://www.aluminego.ar/comer), [Dormir](https://www.aluminego.ar/alojarse), [Aventuras](https://www.aluminego.ar/aventuras) o [Comercios](https://www.aluminego.ar/comercios).`;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 800));
      return NextResponse.json({ reply: mockReply });
    }

    // Call real Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    let customSystemPrompt = SYSTEM_PROMPT + catalogContext;
    if (userName) {
      customSystemPrompt += `\nEl nombre del usuario actual con el que estás hablando es "${userName}". Asegúrate de dirigirte a él/ella por su nombre con frecuencia y cordialidad en tus respuestas, manteniendo una interacción muy familiar, cercana y profesional.`;
    }

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiContents,
        systemInstruction: {
          parts: [{ text: customSystemPrompt }]
        },
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', errText);
      return NextResponse.json({ error: 'Error calling Gemini API' }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta.';

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('Error in chat API route:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
