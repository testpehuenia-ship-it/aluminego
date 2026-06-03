import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const now = new Date();
    
    // Start of day, month, year
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [todayVisits, monthVisits, yearVisits, allVisits] = await Promise.all([
      prisma.pageVisit.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.pageVisit.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.pageVisit.count({ where: { createdAt: { gte: startOfYear } } }),
      prisma.pageVisit.groupBy({
        by: ['path'],
        _count: {
          path: true,
        },
        orderBy: {
          _count: {
            path: 'desc'
          }
        }
      })
    ]);

    // Format page visits
    const pageVisits = allVisits.map(v => ({
      path: v.path || '/',
      count: v._count.path
    }));

    // Daily historical visits for the last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentVisits = await prisma.pageVisit.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    });

    const historicalData: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      historicalData[d.toISOString().split('T')[0]] = 0;
    }

    recentVisits.forEach(v => {
      const dateStr = v.createdAt.toISOString().split('T')[0];
      if (historicalData[dateStr] !== undefined) {
        historicalData[dateStr]++;
      }
    });

    const chartData = Object.entries(historicalData).map(([date, count]) => ({
      date,
      visits: count
    }));

    return NextResponse.json({
      today: todayVisits,
      month: monthVisits,
      year: yearVisits,
      pageVisits,
      chartData
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
