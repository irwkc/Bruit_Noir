import { prisma } from '@/lib/prisma'

export async function getOrCreateSiteSettings() {
  let settings = await prisma.siteSettings.findFirst()

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        id: 'default',
        siteLocked: false,
        siteLockPassword: null,
      },
    })
  }

  return settings
}

export async function getDeliveryPrice(): Promise<number> {
  const settings = await prisma.siteSettings.findFirst()
  return settings?.deliveryPrice ?? 0
}

export async function updateDeliveryPrice(value: number) {
  const normalized = Number.isFinite(value) && value >= 0 ? value : 0

  const existing = await prisma.siteSettings.findFirst()
  if (existing) {
    return prisma.siteSettings.update({
      where: { id: existing.id },
      data: { deliveryPrice: normalized },
    })
  }

  return prisma.siteSettings.create({
    data: {
      id: 'default',
      siteLocked: false,
      siteLockPassword: null,
      deliveryPrice: normalized,
    },
  })
}


