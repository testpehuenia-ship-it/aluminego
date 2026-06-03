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
    const route = await prisma.route.update({
      where: { id },
      data: {
        title: body.title,
        status: body.status,
        description: body.description
      }
    });
    return NextResponse.json(route);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating route' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.route.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting route' }, { status: 500 });
  }
}
