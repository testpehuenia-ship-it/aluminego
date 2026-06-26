import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const history = await prisma.pushHistory.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limitamos a los últimos 50 mensajes para no saturar
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error obteniendo historial de notificaciones push:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'El ID es obligatorio' }, { status: 400 });
    }

    await prisma.pushHistory.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar elemento del historial:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
