import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession, hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!verifySession(token)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const d = String(new Date().getDate()).padStart(2, '0');
  const m = String(new Date().getMonth() + 1).padStart(2, '0');
  const y = new Date().getFullYear();
  const password = `AluminéGO${d}${m}${y}`;
  const hashedPassword = hashPassword(password);
  let count = 0;

  async function processEntity(model: any) {
    const entities = await model.findMany({
      where: {
        portalUserId: null,
        subscription: {
          OR: [
            { planType: { contains: 'plan_comercio_completo' } },
            { planType: { contains: 'plan_basico_destacado' } }
          ]
        }
      },
      include: { subscription: true }
    });

    for (const entity of entities) {
      const safeName = entity.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let email = `${safeName}@AluminéGO.ar`;
      
      let portalUser = await prisma.portalUser.findUnique({ where: { email } });
      
      let counter = 1;
      while (portalUser) {
        email = `${safeName}${counter}@AluminéGO.ar`;
        portalUser = await prisma.portalUser.findUnique({ where: { email } });
        counter++;
      }

      const newUser = await prisma.portalUser.create({
        data: {
          name: entity.name,
          email,
          password: hashedPassword
        }
      });

      await model.update({
        where: { id: entity.id },
        data: { portalUserId: newUser.id }
      });
      count++;
    }
  }

  await processEntity(prisma.business);
  await processEntity(prisma.accommodation);
  await processEntity(prisma.adventure);

  return NextResponse.json({ success: true, usersCreated: count });
}

