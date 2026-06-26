import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const subscription = await request.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Suscripción inválida' }, { status: 400 });
    }

    // Upsert subscription (if endpoint exists, do nothing or update)
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      create: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      }
    });

    return NextResponse.json({ success: true, message: 'Suscripción guardada exitosamente' });
  } catch (error) {
    console.error('Error guardando suscripción push:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
