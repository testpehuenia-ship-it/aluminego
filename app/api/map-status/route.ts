import { NextResponse } from 'next/server';
import { getDPVStatus } from '@/lib/services/dpv';
import { getPehueniaWeather } from '@/lib/services/weather';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [dpvData, weatherData] = await Promise.all([
      getDPVStatus(),
      getPehueniaWeather()
    ]);

    return NextResponse.json({ dpvData, weatherData });
  } catch (error: any) {
    console.error('Error in map-status API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch map status data' },
      { status: 500 }
    );
  }
}
