import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') || 'all'
    const sort = searchParams.get('sort') || 'newest'
    const page = Number(searchParams.get('page') || '1')
    const limit = Math.min(Number(searchParams.get('limit') || '12'), 48)
    const skip = (page - 1) * limit

    let where: any = {}
    if (category !== 'all') {
      where = { category }
    }

    let orderBy = {}
    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' }
        break
      case 'price-desc':
        orderBy = { price: 'desc' }
        break
      case 'name':
        orderBy = { name: 'asc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          category: true,
          sizes: true,
          colors: true,
          stock: true,
          featured: true,
          available: true,
          createdAt: true,
        },
      }),
    ])

    return NextResponse.json(
      {
        data: products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

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

    const product = await prisma.product.create({
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
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

