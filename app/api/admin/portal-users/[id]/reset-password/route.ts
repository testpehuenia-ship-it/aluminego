import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession, hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!verifySession(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const customPassword = body.newPassword?.trim();

    // Check if `id` is a portalUser id or a service/commerce/business/accommodation id
    let portalUser = await prisma.portalUser.findUnique({
      where: { id },
      include: {
        localServices: { select: { whatsapp: true, name: true } },
        commerces: { select: { whatsapp: true, name: true } },
        businesses: { select: { whatsapp: true, name: true } },
        accommodations: { select: { whatsapp: true, name: true } },
      }
    });

    if (!portalUser) {
      // Try finding by localServiceId
      const ls = await prisma.localService.findUnique({ where: { id }, select: { portalUser: true, whatsapp: true, name: true } });
      if (ls?.portalUser) {
        portalUser = {
          ...ls.portalUser,
          localServices: [{ whatsapp: ls.whatsapp, name: ls.name }],
          commerces: [],
          businesses: [],
          accommodations: []
        };
      }
    }

    if (!portalUser) {
      return NextResponse.json({ error: 'Usuario del portal no encontrado' }, { status: 404 });
    }

    // Generate new password if not provided
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const generatedPassword = customPassword || `pehuenia${randomDigits}`;

    await prisma.portalUser.update({
      where: { id: portalUser.id },
      data: {
        password: hashPassword(generatedPassword)
      }
    });

    const phone = portalUser.localServices[0]?.whatsapp || 
                  portalUser.commerces[0]?.whatsapp || 
                  portalUser.businesses[0]?.whatsapp || 
                  portalUser.accommodations[0]?.whatsapp || '';

    return NextResponse.json({
      success: true,
      email: portalUser.email,
      name: portalUser.name,
      newPassword: generatedPassword,
      whatsapp: phone
    });
  } catch (error: any) {
    console.error('Error resetting portal user password:', error);
    return NextResponse.json({ error: error.message || 'Error al resetear contraseña' }, { status: 500 });
  }
}
