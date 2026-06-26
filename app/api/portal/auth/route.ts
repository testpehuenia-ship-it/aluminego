import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyPassword, signPortalSession, verifyPortalSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = await prisma.portalUser.findUnique({
      where: { email }
    });

    if (user && verifyPassword(password, user.password)) {
      // Create session cookie
      const sessionData = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      const token = signPortalSession(sessionData);

      const cookieStore = await cookies();
      cookieStore.set('portal_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      });

      return NextResponse.json({ success: true, user: sessionData });
    }

    return NextResponse.json({ success: false, message: 'Credenciales inválidas' }, { status: 401 });
  } catch (error) {
    console.error('Error during portal login:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('portal_session');
  return NextResponse.json({ success: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('portal_session');
  
  const user = verifyPortalSession(session?.value);
  if (user) {
    return NextResponse.json({ success: true, user });
  }
  
  return NextResponse.json({ success: false, user: null }, { status: 401 });
}
