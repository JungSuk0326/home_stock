import { prisma } from '@/lib/db'
import { updateItemSchema } from '@/lib/validations/item'
import { NextResponse } from 'next/server'

// GET /api/items/[id] - 개별 아이템 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        location: true,
        stockHistory: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    })

    if (!item) {
      return NextResponse.json(
        { error: '아이템을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { error: '아이템 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

// PATCH /api/items/[id] - 아이템 수정
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Validation
    const validatedData = updateItemSchema.parse(body)

    // 기존 아이템 조회
    const existingItem = await prisma.item.findUnique({
      where: { id: params.id },
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: '아이템을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 날짜 필드 변환
    const updateData: any = {
      ...validatedData,
    }

    if (validatedData.expiryDate) {
      updateData.expiryDate = new Date(validatedData.expiryDate)
    }
    if (validatedData.purchaseDate) {
      updateData.purchaseDate = new Date(validatedData.purchaseDate)
    }
    if (validatedData.openedDate) {
      updateData.openedDate = new Date(validatedData.openedDate)
    }

    // 수량 변경 감지
    const quantityChanged =
      validatedData.quantity !== undefined &&
      validatedData.quantity !== existingItem.quantity

    // 아이템 업데이트
    const updatedItem = await prisma.item.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true,
        location: true,
      },
    })

    // 수량이 변경된 경우 재고 이력 생성
    if (quantityChanged && validatedData.quantity !== undefined) {
      const quantityDiff = validatedData.quantity - existingItem.quantity
      await prisma.stockHistory.create({
        data: {
          itemId: params.id,
          type: quantityDiff > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(quantityDiff),
          beforeQty: existingItem.quantity,
          afterQty: validatedData.quantity,
          reason: '수량 조정',
        },
      })
    }

    return NextResponse.json(updatedItem)
  } catch (error: any) {
    console.error('Error updating item:', error)

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
      { error: '아이템 수정에 실패했습니다' },
      { status: 500 }
    )
  }
}

// DELETE /api/items/[id] - 아이템 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 아이템 존재 확인
    const item = await prisma.item.findUnique({
      where: { id: params.id },
    })

    if (!item) {
      return NextResponse.json(
        { error: '아이템을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 아이템 삭제 (Cascade로 재고 이력도 자동 삭제)
    await prisma.item.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: '아이템이 삭제되었습니다' })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { error: '아이템 삭제에 실패했습니다' },
      { status: 500 }
    )
  }
}
