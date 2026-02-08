import { prisma } from '@/lib/db'
import { createCategorySchema, updateCategorySchema } from '@/lib/validations/category'
import { NextResponse } from 'next/server'

// GET /api/categories - 전체 카테고리 조회
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: '카테고리 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

// POST /api/categories - 새 카테고리 생성
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validation
    const validatedData = createCategorySchema.parse(body)

    const category = await prisma.category.create({
      data: validatedData,
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: '입력 데이터가 유효하지 않습니다', details: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '이미 존재하는 카테고리명입니다' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: '카테고리 생성에 실패했습니다' },
      { status: 500 }
    )
  }
}

// PATCH /api/categories - 카테고리 수정
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: '카테고리 ID가 필요합니다' },
        { status: 400 }
      )
    }

    // Validation
    const validatedData = updateCategorySchema.parse(data)

    const category = await prisma.category.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(category)
  } catch (error: any) {
    console.error('Error updating category:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: '입력 데이터가 유효하지 않습니다', details: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: '카테고리를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '이미 존재하는 카테고리명입니다' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: '카테고리 수정에 실패했습니다' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories - 카테고리 삭제
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '카테고리 ID가 필요합니다' },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ message: '카테고리가 삭제되었습니다' })
  } catch (error: any) {
    console.error('Error deleting category:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: '카테고리를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: '카테고리 삭제에 실패했습니다' },
      { status: 500 }
    )
  }
}
