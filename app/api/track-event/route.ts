import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entityId, type } = body;

    if (!entityId || !type) {
      return NextResponse.json({ error: 'Missing entityId or type' }, { status: 400 });
    }

    await prisma.eventTracking.create({
      data: {
        entityId,
        type
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
