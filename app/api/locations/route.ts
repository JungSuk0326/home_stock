import { prisma } from '@/lib/db'
import { createLocationSchema, updateLocationSchema } from '@/lib/validations/location'
import { NextResponse } from 'next/server'

// GET /api/locations - 전체 위치 조회
export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(locations)
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { error: '위치 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

// POST /api/locations - 새 위치 생성
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validation
    const validatedData = createLocationSchema.parse(body)

    const location = await prisma.location.create({
      data: validatedData,
    })

    return NextResponse.json(location, { status: 201 })
  } catch (error: any) {
    console.error('Error creating location:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: '입력 데이터가 유효하지 않습니다', details: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '이미 존재하는 위치명입니다' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: '위치 생성에 실패했습니다' },
      { status: 500 }
    )
  }
}

// PATCH /api/locations - 위치 수정
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: '위치 ID가 필요합니다' },
        { status: 400 }
      )
    }

    // Validation
    const validatedData = updateLocationSchema.parse(data)

    const location = await prisma.location.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(location)
  } catch (error: any) {
    console.error('Error updating location:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: '입력 데이터가 유효하지 않습니다', details: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: '위치를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '이미 존재하는 위치명입니다' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: '위치 수정에 실패했습니다' },
      { status: 500 }
    )
  }
}

// DELETE /api/locations - 위치 삭제
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '위치 ID가 필요합니다' },
        { status: 400 }
      )
    }

    await prisma.location.delete({
      where: { id },
    })

    return NextResponse.json({ message: '위치가 삭제되었습니다' })
  } catch (error: any) {
    console.error('Error deleting location:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: '위치를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: '위치 삭제에 실패했습니다' },
      { status: 500 }
    )
  }
}
