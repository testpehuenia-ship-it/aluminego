'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getPricingConfigs() {
  const configs = await prisma.pricingConfig.findMany({
    orderBy: { createdAt: 'asc' }
  })
  
  if (configs.length === 0) {
    const defaultConfigs = [
      { key: 'plan_basico_destacado', name: 'Plan Básico (Destacado)', price: 25000 },
      { key: 'plan_comercio_completo', name: 'Plan Comercio Completo', price: 45000 },
      { key: 'banner_top', name: 'Banner Superior (Top)', price: 35000 },
      { key: 'banner_middle', name: 'Banner Medio', price: 30000 },
      { key: 'banner_bottom', name: 'Banner Inferior', price: 25000 },
      { key: 'portada_principal', name: 'Portada Principal (Inicio)', price: 45000 },
    ]
    
    await prisma.pricingConfig.createMany({
      data: defaultConfigs
    })
    
    return await prisma.pricingConfig.findMany({
      orderBy: { createdAt: 'asc' }
    })
  }
  
  return configs
}

export async function updatePricingConfig(key: string, price: number) {
  try {
    await prisma.pricingConfig.update({
      where: { key },
      data: { price }
    })
    revalidatePath('/admin/pricing')
    return { success: true }
  } catch (error) {
    console.error('Error updating pricing:', error)
    return { success: false, error: 'Error al actualizar el precio' }
  }
}
