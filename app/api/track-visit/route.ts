import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { path } = await request.json();

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    // Guardar la visita en la BD
    await prisma.pageVisit.create({
      data: {
        path
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking visit:', error);
    return NextResponse.json({ error: 'Failed to track visit' }, { status: 500 });
  }
}
