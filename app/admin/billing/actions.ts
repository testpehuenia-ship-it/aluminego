'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getSubscriptions() {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      business: true,
      accommodation: true,
      adventure: true,
      localService: true,
      payments: {
        orderBy: { paymentDate: 'desc' },
        take: 1
      }
    },
    orderBy: { dueDate: 'asc' }
  })
  
  return subscriptions
}

export async function registerPayment(subscriptionId: string) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    })

    if (!subscription) throw new Error('Suscripción no encontrada')

    const newDueDate = new Date(subscription.dueDate)
    // Agregar 30 días o 1 mes. Lo haremos agregando 30 días exactos.
    newDueDate.setDate(newDueDate.getDate() + 30)

    await prisma.$transaction([
      prisma.payment.create({
        data: {
          subscriptionId,
          amount: subscription.price,
          periodPaid: subscription.dueDate // Era el vencimiento que se está pagando ahora
        }
      }),
      prisma.subscription.update({
        where: { id: subscriptionId },
        data: { dueDate: newDueDate }
      })
    ])

    revalidatePath('/admin/billing')
    return { success: true }
  } catch (error) {
    console.error('Error registrando pago:', error)
    return { success: false, error: 'Error al registrar el pago' }
  }
}

export async function getBillingStats() {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      business: true,
      accommodation: true,
      adventure: true,
      localService: true,
    }
  })

  let totalAds = subscriptions.length
  let estimatedMonthlyIncome = 0
  let overdueCount = 0
  
  const categoryStats: Record<string, { count: number, income: number }> = {}
  
  const now = new Date()
  
  subscriptions.forEach(sub => {
    // Determine category
    let category = 'Otros'
    if (sub.business) category = 'Comercios'
    else if (sub.accommodation) category = 'Alojamientos'
    else if (sub.adventure) category = 'Aventuras'
    else if (sub.localService) category = 'Servicios Locales'
      
    if (!categoryStats[category]) {
      categoryStats[category] = { count: 0, income: 0 }
    }
    
    categoryStats[category].count += 1
    
    // Only count income if it's not basic free plan ($0)
    if (sub.price > 0) {
      estimatedMonthlyIncome += sub.price
      categoryStats[category].income += sub.price
    }
    
    // Check if overdue (dueDate < today)
    if (sub.dueDate < now) {
      overdueCount += 1
    }
  })
  
  return {
    totalAds,
    estimatedMonthlyIncome,
    overdueCount,
    categoryStats: Object.entries(categoryStats).map(([name, data]) => ({ name, ...data }))
  }
}
