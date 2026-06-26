import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyPortalSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('portal_session');
    
    const user = verifyPortalSession(session?.value);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user with relations
    const portalUser = await prisma.portalUser.findUnique({
      where: { id: user.id },
      include: {
        businesses: true,
        accommodations: { include: { features: true } },
        adventures: true,
        localServices: true,
        commerces: { include: { details: true } },
      }
    });

    if (!portalUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Combine all services to fetch EventTracking data
    const allServices = [
      ...portalUser.businesses.map(b => ({ 
        id: b.id, 
        name: b.name, 
        type: 'business', 
        description: b.description || '', 
        details: b.details || '', 
        whatsapp: b.whatsapp || '', 
        image: b.image || '', 
        latitude: b.latitude || '', 
        longitude: b.longitude || '',
        categoryId: b.categoryId || ''
      })),
      ...portalUser.accommodations.map(a => ({ 
        id: a.id, 
        name: a.name, 
        type: 'accommodation', 
        description: a.description || '', 
        details: a.features.map(f => f.name).join(', '), 
        whatsapp: a.whatsapp || '', 
        image: a.image || '', 
        latitude: a.latitude || '', 
        longitude: a.longitude || '',
        accommodationType: a.type || ''
      })),
      ...portalUser.adventures.map(a => ({ 
        id: a.id, 
        name: a.name, 
        type: 'adventure', 
        description: a.description || '', 
        details: a.details || '', 
        whatsapp: a.whatsapp || '', 
        image: a.image || '', 
        latitude: a.latitude || '', 
        longitude: a.longitude || '',
        category: a.category || ''
      })),
      ...portalUser.localServices.map(l => ({ 
        id: l.id, 
        name: l.name, 
        type: 'localservice', 
        description: l.description || '', 
        details: l.details || '', 
        whatsapp: l.whatsapp || '', 
        image: l.image || '', 
        latitude: l.latitude || '', 
        longitude: l.longitude || '',
        category: l.category || '',
        subcategory: l.subcategory || '',
        address: l.address || ''
      })),
      ...portalUser.commerces.map(c => ({
        id: c.id,
        name: c.name,
        type: 'commerce',
        description: c.description || '',
        details: c.details.map(d => d.name).join(', '),
        whatsapp: c.whatsapp || '',
        image: c.image || '',
        latitude: c.latitude || '',
        longitude: c.longitude || '',
        category: 'Comercios',
        subcategory: c.type || ''
      }))
    ];

    const entityIds = allServices.map(s => s.id);

    // Fetch EventTracking for these entities
    const trackingEvents = await prisma.eventTracking.findMany({
      where: {
        entityId: { in: entityIds }
      }
    });

    // Group stats
    const stats: any = {};
    entityIds.forEach(id => {
      stats[id] = {
        WHATSAPP_CLICK: 0,
        VIEWS: 0, // Si quisiéramos trackear vistas
      };
    });

    trackingEvents.forEach(event => {
      if (stats[event.entityId] && stats[event.entityId][event.type] !== undefined) {
        stats[event.entityId][event.type]++;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        businesses: portalUser.businesses,
        accommodations: portalUser.accommodations,
        adventures: portalUser.adventures,
        localServices: portalUser.localServices,
        commerces: portalUser.commerces,
        stats
      },
      services: allServices
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
