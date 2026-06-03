import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const section = searchParams.get('section');
    const all = searchParams.get('all') === 'true'; // Para el admin

    let whereClause: any = {};
    if (page) whereClause.page = page;
    if (section) whereClause.section = parseInt(section);

    // Si no es admin, filtramos por fechas vigentes y que esté activo
    if (!all) {
      const now = new Date();
      whereClause.AND = [
        { isActive: true },
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] }
      ];
    }

    const banners = await prisma.publicity.findMany({
      where: whereClause,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(banners);
  } catch (error: any) {
    console.error('Error fetching publicity:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch publicity banners' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, page, section, order, image, link, size, startDate, endDate, isHeavy, isActive } = body;

    if (!page || !section || !order || !image || !size) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const banner = await prisma.publicity.create({
      data: {
        title: title || null,
        page,
        section: parseInt(section),
        order: parseInt(order),
        image,
        link,
        size,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isHeavy: Boolean(isHeavy),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('Error creating publicity:', error);
    return NextResponse.json({ error: 'Failed to create publicity banner' }, { status: 500 });
  }
}
