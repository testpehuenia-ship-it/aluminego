import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      deviceId,
      platform = 'Otro',
      browser = 'Desconocido',
      isStandalone = true,
      hasPush = false,
      language = 'es',
      screenSize = '',
    } = body;

    if (!deviceId) {
      return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });
    }

    // Normalizar plataforma
    let normPlatform = 'Otro';
    const pLower = String(platform).toLowerCase();
    if (pLower.includes('android')) normPlatform = 'Android';
    else if (pLower.includes('ios') || pLower.includes('iphone') || pLower.includes('ipad')) normPlatform = 'iOS';
    else if (pLower.includes('win')) normPlatform = 'Windows';
    else if (pLower.includes('mac')) normPlatform = 'macOS';

    // Upsert dispositivo
    const existing = await prisma.appInstallation.findUnique({
      where: { deviceId }
    });

    if (existing) {
      const updated = await prisma.appInstallation.update({
        where: { deviceId },
        data: {
          lastActiveAt: new Date(),
          sessionCount: { increment: 1 },
          isStandalone: isStandalone ? true : existing.isStandalone,
          hasPush: typeof hasPush === 'boolean' ? hasPush : existing.hasPush,
          language: language || existing.language,
          screenSize: screenSize || existing.screenSize,
          browser: browser || existing.browser,
          platform: normPlatform || existing.platform,
        }
      });
      return NextResponse.json({ success: true, isNew: false, device: updated });
    } else {
      const created = await prisma.appInstallation.create({
        data: {
          deviceId,
          platform: normPlatform,
          browser: String(browser),
          isStandalone: Boolean(isStandalone),
          hasPush: Boolean(hasPush),
          language: String(language),
          screenSize: String(screenSize),
          installedAt: new Date(),
          lastActiveAt: new Date(),
          sessionCount: 1,
        }
      });
      return NextResponse.json({ success: true, isNew: true, device: created });
    }
  } catch (error) {
    console.error('Error in app-analytics POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Estadísticas agregadas
    const [
      totalInstalled,
      totalDevices,
      activeToday,
      active7Days,
      active30Days,
      pushCount,
      allInstallations,
      recentList
    ] = await Promise.all([
      prisma.appInstallation.count({ where: { isStandalone: true } }),
      prisma.appInstallation.count(),
      prisma.appInstallation.count({ where: { isStandalone: true, lastActiveAt: { gte: todayStart } } }),
      prisma.appInstallation.count({ where: { isStandalone: true, lastActiveAt: { gte: sevenDaysAgo } } }),
      prisma.appInstallation.count({ where: { isStandalone: true, lastActiveAt: { gte: thirtyDaysAgo } } }),
      prisma.appInstallation.count({ where: { isStandalone: true, hasPush: true } }),
      prisma.appInstallation.findMany({
        where: { isStandalone: true },
        select: { platform: true, installedAt: true, sessionCount: true }
      }),
      prisma.appInstallation.findMany({
        where: { isStandalone: true },
        orderBy: { lastActiveAt: 'desc' },
        take: 12,
        select: {
          id: true,
          platform: true,
          browser: true,
          hasPush: true,
          installedAt: true,
          lastActiveAt: true,
          sessionCount: true,
          language: true,
          screenSize: true
        }
      })
    ]);

    // Desglose por plataforma
    const platformCounts: Record<string, number> = {
      Android: 0,
      iOS: 0,
      Windows: 0,
      macOS: 0,
      Otro: 0
    };

    let totalSessions = 0;
    allInstallations.forEach(inst => {
      totalSessions += (inst.sessionCount || 1);
      if (inst.platform.includes('Android')) platformCounts.Android++;
      else if (inst.platform.includes('iOS') || inst.platform.includes('iPhone') || inst.platform.includes('iPad')) platformCounts.iOS++;
      else if (inst.platform.includes('Windows')) platformCounts.Windows++;
      else if (inst.platform.includes('macOS') || inst.platform.includes('Mac')) platformCounts.macOS++;
      else platformCounts.Otro++;
    });

    return NextResponse.json({
      totalInstalled,
      totalDevices,
      activeToday,
      active7Days,
      active30Days,
      totalSessions,
      pushCount,
      pushPercentage: totalInstalled > 0 ? Math.round((pushCount / totalInstalled) * 100) : 0,
      platforms: platformCounts,
      recentInstallations: recentList
    });
  } catch (error) {
    console.error('Error fetching app stats:', error);
    return NextResponse.json({ error: 'Failed to fetch app stats' }, { status: 500 });
  }
}
