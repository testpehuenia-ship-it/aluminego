import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyPortalSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('portal_session');
    const user = verifyPortalSession(session?.value);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId') || searchParams.get('businessId');
    const serviceType = searchParams.get('serviceType') || 'business';

    if (!serviceId) return NextResponse.json({ error: 'Falta serviceId o businessId' }, { status: 400 });

    const portalUser = await prisma.portalUser.findUnique({
      where: { id: user.id },
      include: {
        businesses: true,
        commerces: true,
        localServices: true
      }
    });

    if (!portalUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (serviceType === 'business') {
      const isOwner = portalUser.businesses.some(b => b.id === serviceId);
      if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      const items = await prisma.menuItem.findMany({
        where: { businessId: serviceId },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ items });
    }

    if (serviceType === 'commerce') {
      const isOwner = portalUser.commerces.some(c => c.id === serviceId);
      if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      const details = await prisma.commerceDetail.findMany({
        where: { commerceId: serviceId }
      });

      const items = details.map((d: any) => {
        try {
          if (typeof d.name === 'string' && d.name.trim().startsWith('{')) {
            const parsed = JSON.parse(d.name);
            return {
              id: d.id,
              name: parsed.name || '',
              description: parsed.description || '',
              price: parsed.price !== undefined && parsed.price !== null ? parsed.price : '',
              image: parsed.image || ''
            };
          }
        } catch {}
        return {
          id: d.id,
          name: d.name || '',
          description: '',
          price: '',
          image: ''
        };
      }).filter((item: any) => item.name);

      return NextResponse.json({ items });
    }

    if (serviceType === 'localservice') {
      const service = portalUser.localServices.find(l => l.id === serviceId);
      if (!service) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      let items: any[] = [];
      if (service.details) {
        try {
          if (service.details.trim().startsWith('[')) {
            const parsed = JSON.parse(service.details);
            items = parsed.map((p: any, idx: number) => {
              if (typeof p === 'string') {
                return { id: `item_${idx}`, name: p, description: '', price: '', image: '' };
              }
              return {
                id: p.id || `item_${idx}`,
                name: p.name || '',
                description: p.description || '',
                price: p.price !== undefined && p.price !== null ? p.price : '',
                image: p.image || ''
              };
            });
          } else {
            items = service.details.split(',').map((s: string, idx: number) => ({
              id: `item_${idx}`,
              name: s.trim(),
              description: '',
              price: '',
              image: ''
            })).filter((p: any) => p.name);
          }
        } catch {
          items = service.details.split(',').map((s: string, idx: number) => ({
            id: `item_${idx}`,
            name: s.trim(),
            description: '',
            price: '',
            image: ''
          })).filter((p: any) => p.name);
        }
      }

      return NextResponse.json({ items });
    }

    return NextResponse.json({ error: 'Tipo de servicio no soportado' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in GET /api/portal/menu:', error);
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
    const serviceId = body.serviceId || body.businessId;
    const serviceType = body.serviceType || 'business';
    const { name, description, price, image } = body;

    if (!serviceId || !name) {
      return NextResponse.json({ error: 'Faltan datos obligatorios (nombre o negocio)' }, { status: 400 });
    }

    const portalUser = await prisma.portalUser.findUnique({
      where: { id: user.id },
      include: {
        businesses: true,
        commerces: true,
        localServices: true
      }
    });

    if (!portalUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (serviceType === 'business') {
      const isOwner = portalUser.businesses.some(b => b.id === serviceId);
      if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      const count = await prisma.menuItem.count({ where: { businessId: serviceId } });
      if (count >= 5) {
        return NextResponse.json({ error: 'Has alcanzado el límite de 5 ítems de menú permitidos.' }, { status: 400 });
      }

      const newItem = await prisma.menuItem.create({
        data: {
          businessId: serviceId,
          name,
          description: description || '',
          price: price ? parseFloat(String(price)) : 0,
          image: image || null
        }
      });

      return NextResponse.json({ success: true, item: newItem });
    }

    if (serviceType === 'commerce') {
      const isOwner = portalUser.commerces.some(c => c.id === serviceId);
      if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      const count = await prisma.commerceDetail.count({ where: { commerceId: serviceId } });
      if (count >= 5) {
        return NextResponse.json({ error: 'Has alcanzado el límite de 5 productos u ofertas permitidas.' }, { status: 400 });
      }

      const payload = JSON.stringify({
        name,
        description: description || '',
        price: price ? String(price) : '',
        image: image || ''
      });

      const newDetail = await prisma.commerceDetail.create({
        data: {
          commerceId: serviceId,
          name: payload
        }
      });

      return NextResponse.json({
        success: true,
        item: {
          id: newDetail.id,
          name,
          description: description || '',
          price: price ? String(price) : '',
          image: image || ''
        }
      });
    }

    if (serviceType === 'localservice') {
      const service = portalUser.localServices.find(l => l.id === serviceId);
      if (!service) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      let currentList: any[] = [];
      if (service.details) {
        try {
          if (service.details.trim().startsWith('[')) {
            currentList = JSON.parse(service.details);
          } else {
            currentList = service.details.split(',').map((s: string) => ({ name: s.trim(), description: '', price: '', image: '' })).filter((p: any) => p.name);
          }
        } catch {
          currentList = [];
        }
      }

      if (currentList.length >= 5) {
        return NextResponse.json({ error: 'Has alcanzado el límite de 5 productos u ofertas permitidas.' }, { status: 400 });
      }

      const newItem = {
        id: `item_${Date.now()}`,
        name,
        description: description || '',
        price: price ? String(price) : '',
        image: image || ''
      };

      const updatedList = [...currentList, newItem];
      await prisma.localService.update({
        where: { id: serviceId },
        data: { details: JSON.stringify(updatedList) }
      });

      return NextResponse.json({ success: true, item: newItem });
    }

    return NextResponse.json({ error: 'Tipo de servicio no soportado' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in POST /api/portal/menu:', error);
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
    const serviceId = body.serviceId || body.businessId;
    const serviceType = body.serviceType || 'business';
    const { itemId } = body;

    if (!itemId || !serviceId) return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });

    const portalUser = await prisma.portalUser.findUnique({
      where: { id: user.id },
      include: {
        businesses: true,
        commerces: true,
        localServices: true
      }
    });

    if (!portalUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (serviceType === 'business') {
      const isOwner = portalUser.businesses.some(b => b.id === serviceId);
      if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      await prisma.menuItem.delete({
        where: { id: itemId }
      });

      return NextResponse.json({ success: true });
    }

    if (serviceType === 'commerce') {
      const isOwner = portalUser.commerces.some(c => c.id === serviceId);
      if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      await prisma.commerceDetail.delete({
        where: { id: itemId }
      });

      return NextResponse.json({ success: true });
    }

    if (serviceType === 'localservice') {
      const service = portalUser.localServices.find(l => l.id === serviceId);
      if (!service) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      let currentList: any[] = [];
      if (service.details) {
        try {
          if (service.details.trim().startsWith('[')) {
            currentList = JSON.parse(service.details);
          }
        } catch {}
      }

      const filteredList = currentList.filter((item: any, idx: number) => {
        if (item.id && item.id === itemId) return false;
        if (`item_${idx}` === itemId) return false;
        return true;
      });

      await prisma.localService.update({
        where: { id: serviceId },
        data: { details: JSON.stringify(filteredList) }
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Tipo no soportado' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in DELETE /api/portal/menu:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
