import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!verifySession(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    
    await prisma.publicity.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting publicity:', error);
    return NextResponse.json({ error: 'Failed to delete publicity banner' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!verifySession(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const { title, page, section, order, image, link, size, startDate, endDate, isHeavy, isActive } = body;

    const banner = await prisma.publicity.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        page,
        section: parseInt(section),
        order: parseInt(order),
        image,
        link,
        size,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isHeavy: isHeavy !== undefined ? Boolean(isHeavy) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error updating publicity:', error);
    return NextResponse.json({ error: 'Failed to update publicity banner' }, { status: 500 });
  }
}
