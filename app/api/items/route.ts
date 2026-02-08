import { prisma } from '@/lib/db'
import { createItemSchema } from '@/lib/validations/item'
import { NextResponse } from 'next/server'

// GET /api/items - 전체 아이템 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const locationId = searchParams.get('locationId')
    const lowStock = searchParams.get('lowStock') === 'true'

    const where: any = {}

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (locationId) {
      where.locationId = locationId
    }

    if (lowStock) {
      where.quantity = { lte: prisma.item.fields.minQuantity }
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        category: true,
        location: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: '아이템 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

// POST /api/items - 새 아이템 생성
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validation
    const validatedData = createItemSchema.parse(body)

    // 날짜 필드 변환
    const itemData: any = {
      ...validatedData,
    }

    if (validatedData.expiryDate) {
      itemData.expiryDate = new Date(validatedData.expiryDate)
    }
    if (validatedData.purchaseDate) {
      itemData.purchaseDate = new Date(validatedData.purchaseDate)
    }
    if (validatedData.openedDate) {
      itemData.openedDate = new Date(validatedData.openedDate)
    }

    // 아이템 생성
    const item = await prisma.item.create({
      data: itemData,
      include: {
        category: true,
        location: true,
      },
    })

    // 재고 이력 생성 (초기 재고)
    if (item.quantity > 0) {
      await prisma.stockHistory.create({
        data: {
          itemId: item.id,
          type: 'IN',
          quantity: item.quantity,
          beforeQty: 0,
          afterQty: item.quantity,
          reason: '초기 재고',
        },
      })
    }

    return NextResponse.json(item, { status: 201 })
  } catch (error: any) {
    console.error('Error creating item:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: '입력 데이터가 유효하지 않습니다', details: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '이미 존재하는 바코드 또는 QR 코드입니다' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: '아이템 생성에 실패했습니다' },
      { status: 500 }
    )
  }
}
