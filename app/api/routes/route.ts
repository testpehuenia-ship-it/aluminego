import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(routes);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching routes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const route = await prisma.route.create({
      data: {
        title: body.title,
        status: body.status,
        description: body.description
      }
    });
    return NextResponse.json(route);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating route' }, { status: 500 });
  }
}
