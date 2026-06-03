import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const marker = await prisma.mapMarker.update({
      where: { id },
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
    return NextResponse.json({ error: 'Error updating map marker' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.mapMarker.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting map marker' }, { status: 500 });
  }
}
