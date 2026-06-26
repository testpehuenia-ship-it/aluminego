import { prisma } from './db';

/**
 * Genera un slug único para un comercio en base a su nombre y su localidad.
 * Si el slug resultante ya está registrado en la base de datos para otro comercio,
 * añade un número correlativo (ej. pizzeria-Aluminé-1, pizzeria-Aluminé-2).
 */
export async function generateUniqueSlug(name: string, locality: string, excludeId?: string): Promise<string> {
  const cleanName = name
    .toLowerCase()
    .normalize('NFD') // Quitar tildes y diéresis
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres no alfanuméricos por guiones
    .replace(/(^-|-$)+/g, ''); // Quitar guiones iniciales o finales

  const cleanLocality = locality
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const baseSlug = `${cleanName}-${cleanLocality}`;
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.commerce.findFirst({
      where: {
        slug,
        id: excludeId ? { not: excludeId } : undefined
      }
    });

    if (!existing) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

