import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        images: true,
        category: true,
        sizes: true,
        colors: true,
        stock: true,
        available: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params

    const {
      name,
      description,
      price,
      images = [],
      category,
      sizes = [],
      colors = [],
      stock = 0,
      featured = false,
      available = true,
    } = body

    const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price)
    const numericStock = typeof stock === 'string' ? parseInt(stock, 10) : Number(stock)
    const normalizedImages = Array.isArray(images)
      ? images.map((value: unknown) => String(value)).filter(Boolean)
      : []
    const normalizedSizes = Array.isArray(sizes)
      ? sizes.map((value: unknown) => String(value)).filter(Boolean)
      : []
    const normalizedColors = Array.isArray(colors)
      ? colors.map((value: unknown) => String(value)).filter(Boolean)
      : []

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: Number.isFinite(numericPrice) ? numericPrice : 0,
        images: normalizedImages,
        category,
        sizes: normalizedSizes,
        colors: normalizedColors,
        stock: Number.isFinite(numericStock) ? numericStock : 0,
        featured,
        available,
      },
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.product.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Product deleted' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

