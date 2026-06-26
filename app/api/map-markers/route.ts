import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const markers = await prisma.mapMarker.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(markers);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching map markers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!verifySession(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const marker = await prisma.mapMarker.create({
      data: {
        title: body.title,
        description: body.description,
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        color: body.color || '#ea580c'
      }
    });
    return NextResponse.json(marker);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating map marker' }, { status: 500 });
  }
}
