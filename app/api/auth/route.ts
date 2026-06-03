import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const admin = await prisma.admin.findUnique({
      where: { username }
    });

    if (admin && admin.password === password) {
      // En una app real, aquí usaríamos JWT o cookies de sesión
      return NextResponse.json({ success: true, user: { username: admin.username } });
    }

    return NextResponse.json({ success: false, message: 'Credenciales inválidas' }, { status: 401 });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
