import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, author, email, entityId, entityType } = body;

    if (!rating || !comment || !author || !entityId || !entityType) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const ratingVal = parseInt(String(rating), 10);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json({ error: 'La calificación debe estar entre 1 y 5 estrellas' }, { status: 400 });
    }

    const data: any = {
      rating: ratingVal,
      comment: String(comment).trim(),
      author: String(author).trim(),
      email: email ? String(email).trim() : null,
      approved: true // Por defecto aprobadas automáticamente
    };

    if (entityType === 'business') {
      data.businessId = entityId;
    } else if (entityType === 'accommodation') {
      data.accommodationId = entityId;
    } else if (entityType === 'adventure') {
      data.adventureId = entityId;
    } else if (entityType === 'localservice') {
      data.localServiceId = entityId;
    } else if (entityType === 'commerce') {
      data.commerceId = entityId;
    } else {
      return NextResponse.json({ error: 'Tipo de entidad no válido' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');

    if (entityId) {
      const reviews = await prisma.review.findMany({
        where: {
          OR: [
            { businessId: entityId },
            { accommodationId: entityId },
            { adventureId: entityId },
            { localServiceId: entityId },
            { commerceId: entityId }
          ],
          approved: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(reviews);
    }

    // Si no hay entityId, es para el admin. Obtenemos todas con información del comercio
    const reviews = await prisma.review.findMany({
      include: {
        business: { select: { name: true } },
        accommodation: { select: { name: true } },
        adventure: { select: { name: true } },
        localService: { select: { name: true } },
        commerce: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Formateamos para que sea fácil leer en el admin
    const formattedReviews = reviews.map(r => {
      const entityName = r.business?.name || r.accommodation?.name || r.adventure?.name || r.localService?.name || r.commerce?.name || 'Desconocido';
      const entityType = r.businessId ? 'Gastronomía' : r.accommodationId ? 'Alojamiento' : r.adventureId ? 'Aventura' : r.localServiceId ? 'Guía Local' : r.commerceId ? 'Comercio' : 'Desconocido';
      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        author: r.author,
        email: r.email,
        approved: r.approved,
        createdAt: r.createdAt,
        entityName,
        entityType
      };
    });

    return NextResponse.json(formattedReviews);
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
