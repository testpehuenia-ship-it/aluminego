import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyPortalSession, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('portal_session');
    
    const user = verifyPortalSession(session?.value);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      entityId, 
      entityType, 
      name,
      image, 
      description, 
      details, 
      whatsapp, 
      newPassword, 
      latitude, 
      longitude,
      categoryId,
      accommodationType,
      category,
      subcategory,
      address
    } = body;

    // Optional: update password if requested (doesn't need entity checks)
    if (newPassword && typeof newPassword === 'string' && newPassword.length >= 6) {
      await prisma.portalUser.update({
        where: { id: user.id },
        data: { password: hashPassword(newPassword) }
      });
      // If ONLY updating password, return early
      if (!entityId) return NextResponse.json({ success: true, message: 'Contraseña actualizada' });
    }

    if (!entityId || !entityType) {
      return NextResponse.json({ error: 'Faltan datos de la entidad' }, { status: 400 });
    }

    // Verify ownership
    const portalUser = await prisma.portalUser.findUnique({
      where: { id: user.id },
      include: {
        businesses: true,
        accommodations: true,
        adventures: true,
        localServices: true,
        commerces: true,
      }
    });

    if (!portalUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isOwner = [
      ...portalUser.businesses,
      ...portalUser.accommodations,
      ...portalUser.adventures,
      ...portalUser.localServices,
      ...portalUser.commerces
    ].some(item => item.id === entityId);

    if (!isOwner) {
      return NextResponse.json({ error: 'No tienes permiso para editar esta entidad' }, { status: 403 });
    }

    // Perform update based on type
    const updateData: any = { image, description, whatsapp };
    if (name) updateData.name = name;
    if (latitude !== undefined) updateData.latitude = latitude === "" ? null : parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = longitude === "" ? null : parseFloat(longitude);
    
    if (entityType === 'business') {
      if (details) updateData.details = details;
      if (categoryId) updateData.categoryId = categoryId;
      await prisma.business.update({ where: { id: entityId }, data: updateData });
    } else if (entityType === 'accommodation') {
      const accUpdate: any = { ...updateData };
      if (accommodationType) accUpdate.type = accommodationType;
      if (details) {
        // Replace existing features with new ones (split by comma)
        const featureNames = details.split(',').map((f: string) => f.trim()).filter(Boolean);
        accUpdate.features = {
          deleteMany: {},
          create: featureNames.map((name: string) => ({ name }))
        };
      }
      await prisma.accommodation.update({ where: { id: entityId }, data: accUpdate });
    } else if (entityType === 'adventure') {
      if (details) updateData.details = details;
      if (category) updateData.category = category;
      await prisma.adventure.update({ where: { id: entityId }, data: updateData });
    } else if (entityType === 'localservice') {
      if (details) updateData.details = details;
      if (category) updateData.category = category;
      if (subcategory) updateData.subcategory = subcategory;
      if (address) updateData.address = address;
      await prisma.localService.update({ where: { id: entityId }, data: updateData });
    } else if (entityType === 'commerce') {
      const commUpdate: any = { ...updateData };
      if (accommodationType) commUpdate.type = accommodationType; // maps commerce type
      if (details) {
        const detailNames = details.split(',').map((f: string) => f.trim()).filter(Boolean);
        commUpdate.details = {
          deleteMany: {},
          create: detailNames.map((name: string) => ({ name }))
        };
      }
      await prisma.commerce.update({ where: { id: entityId }, data: commUpdate });
    } else {
      return NextResponse.json({ error: 'Tipo de entidad no válido' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
