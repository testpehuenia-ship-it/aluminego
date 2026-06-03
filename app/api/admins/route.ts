import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admins = await prisma.admin.findMany({
      select: { id: true, username: true } // No enviamos la contraseña
    });
    return NextResponse.json(admins);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener administradores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const existingAdmin = await prisma.admin.findUnique({ where: { username } });
    if (existingAdmin) {
      return NextResponse.json({ error: 'El usuario ya existe' }, { status: 400 });
    }

    const admin = await prisma.admin.create({
      data: { username, password }
    });

    return NextResponse.json({ success: true, admin: { id: admin.id, username: admin.username } });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear administrador' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, password } = body;

    if (!id || !password) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const admin = await prisma.admin.update({
      where: { id },
      data: { password }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar contraseña' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    }

    // No permitir borrar si es el único administrador
    const count = await prisma.admin.count();
    if (count <= 1) {
      return NextResponse.json({ error: 'No puedes borrar el único administrador' }, { status: 400 });
    }

    await prisma.admin.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar administrador' }, { status: 500 });
  }
}
