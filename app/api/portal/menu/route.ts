import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyPortalSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const user = verifyPortalSession(session?.value);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    if (!businessId) return NextResponse.json({ error: 'Falta businessId' }, { status: 400 });
    const portalUser = await prisma.portalUser.findUnique({
      where: { id: user.id },
      include: { businesses: true }
    });

    if (!portalUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const isOwner = portalUser.businesses.some(b => b.id === businessId);
    if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const items = await prisma.menuItem.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('portal_session');
    const user = verifyPortalSession(session?.value);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const { businessId, name, description, price, image } = body;

    if (!businessId || !name || price === undefined) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const portalUser = await prisma.portalUser.findUnique({
      where: { id: user.id },
      include: { businesses: true }
    });

    if (!portalUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const isOwner = portalUser.businesses.some(b => b.id === businessId);
    if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Validate limit 5
    const count = await prisma.menuItem.count({ where: { businessId } });
    if (count >= 5) {
      return NextResponse.json({ error: 'Has alcanzado el límite de 5 ítems de menú permitidos.' }, { status: 400 });
    }

    const newItem = await prisma.menuItem.create({
      data: {
        businessId,
        name,
        description,
        price: parseFloat(price),
        image
      }
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('portal_session');
    const user = verifyPortalSession(session?.value);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const { itemId, businessId } = body;

    if (!itemId || !businessId) return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });

    const portalUser = await prisma.portalUser.findUnique({
      where: { id: user.id },
      include: { businesses: true }
    });

    if (!portalUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const isOwner = portalUser.businesses.some(b => b.id === businessId);
    if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.menuItem.delete({
      where: { id: itemId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
