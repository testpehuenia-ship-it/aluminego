import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import webPush from 'web-push';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Inicializar VAPID dentro del handler (no en módulo) para evitar errores en build
    const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicVapidKey || !privateVapidKey) {
      console.error('VAPID keys no configuradas en las variables de entorno');
      return NextResponse.json({ error: 'Servicio de notificaciones no configurado' }, { status: 503 });
    }

    webPush.setVapidDetails(
      'mailto:contacto@aluminego.ar',
      publicVapidKey,
      privateVapidKey
    );

    const body = await request.json();
    const { title, message, url, segment = 'all' } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Título y mensaje son obligatorios' }, { status: 400 });
    }

    const payload = JSON.stringify({
      title,
      body: message,
      url: url || '/',
      icon: '/images/logo.png',
      badge: '/images/logo.png'
    });

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    let whereClause = {};
    if (segment === 'recent') {
      whereClause = { createdAt: { gte: fourteenDaysAgo } };
    } else if (segment === 'old') {
      whereClause = { createdAt: { lt: fourteenDaysAgo } };
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: whereClause
    });
    let sentCount = 0;
    let errorCount = 0;

    // Promise.allSettled para que si falla una, no corte el envío a las demás
    const pushPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      try {
        await webPush.sendNotification(pushSubscription, payload);
        sentCount++;
      } catch (error: any) {
        // Si el error es 410 (Gone) o 404 (Not Found), la suscripción ya no es válida (ej: el usuario borró los datos)
        if (error.statusCode === 410 || error.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
        errorCount++;
      }
    });

    await Promise.allSettled(pushPromises);

    // Guardar en el historial
    await prisma.pushHistory.create({
      data: {
        title,
        message,
        url: url || null,
        sentCount,
        errorCount
      }
    });

    return NextResponse.json({ 
      success: true, 
      sent: sentCount,
      errors: errorCount,
      total: subscriptions.length 
    });
  } catch (error) {
    console.error('Error enviando notificaciones push:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}


