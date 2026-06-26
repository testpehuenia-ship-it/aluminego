import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { generateUniqueSlug } from '@/lib/slugs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!verifySession(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const commerces = await prisma.commerce.findMany({
      where: {
        OR: [
          { slug: null },
          { locality: null }
        ]
      }
    });

    let updatedCount = 0;

    for (const commerce of commerces) {
      const locality = commerce.locality || 'Aluminé';
      const slug = await generateUniqueSlug(commerce.name, locality, commerce.id);
      
      await prisma.commerce.update({
        where: { id: commerce.id },
        data: {
          slug,
          locality
        }
      });
      updatedCount++;
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (error: any) {
    console.error('Error during commerce backfill:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

