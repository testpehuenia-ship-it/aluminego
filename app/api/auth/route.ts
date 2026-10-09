import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signSession, verifyPassword, verifySession } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const admin = await prisma.admin.findUnique({
      where: { username }
    });

    if (admin && verifyPassword(password, admin.password)) {
      const token = signSession(admin.username);
      
      const cookieStore = await cookies();
      cookieStore.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 día
        path: '/'
      });

      return NextResponse.json({ success: true, user: { username: admin.username } });
    }

    return NextResponse.json({ success: false, message: 'Credenciales inválidas' }, { status: 401 });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    const session = verifySession(token);
    if (session) {
      return NextResponse.json({ authenticated: true, user: { username: session.username } });
    }
    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    return NextResponse.json({ success: true, message: 'Sesión cerrada correctamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error cerrando sesión' }, { status: 500 });
  }
}
