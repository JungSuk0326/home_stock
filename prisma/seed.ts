import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 카테고리 생성
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: '식품' },
      update: {},
      create: {
        name: '식품',
        description: '식료품 및 음료',
        icon: '🍎',
        color: '#FF6B6B',
      },
    }),
    prisma.category.upsert({
      where: { name: '생활용품' },
      update: {},
      create: {
        name: '생활용품',
        description: '일상 생활용품',
        icon: '🧴',
        color: '#4ECDC4',
      },
    }),
    prisma.category.upsert({
      where: { name: '의약품' },
      update: {},
      create: {
        name: '의약품',
        description: '의약품 및 건강용품',
        icon: '💊',
        color: '#95E1D3',
      },
    }),
    prisma.category.upsert({
      where: { name: '주방용품' },
      update: {},
      create: {
        name: '주방용품',
        description: '주방 도구 및 용품',
        icon: '🍳',
        color: '#F38181',
      },
    }),
    prisma.category.upsert({
      where: { name: '반려동물' },
      update: {},
      create: {
        name: '반려동물',
        description: '반려동물 용품',
        icon: '🐾',
        color: '#FFA07A',
      },
    }),
  ])

  console.log(`✅ Created ${categories.length} categories`)

  // 보관 위치 생성
  const locations = await Promise.all([
    prisma.location.upsert({
      where: { name: '냉장실' },
      update: {},
      create: {
        name: '냉장실',
        description: '냉장고 냉장실',
        icon: '❄️',
      },
    }),
    prisma.location.upsert({
      where: { name: '냉동실' },
      update: {},
      create: {
        name: '냉동실',
        description: '냉장고 냉동실',
        icon: '🧊',
      },
    }),
    prisma.location.upsert({
      where: { name: '식품 창고' },
      update: {},
      create: {
        name: '식품 창고',
        description: '실온 보관 식품',
        icon: '🏠',
      },
    }),
    prisma.location.upsert({
      where: { name: '욕실' },
      update: {},
      create: {
        name: '욕실',
        description: '욕실 보관',
        icon: '🚿',
      },
    }),
    prisma.location.upsert({
      where: { name: '창고' },
      update: {},
      create: {
        name: '창고',
        description: '일반 창고',
        icon: '📦',
      },
    }),
  ])

  console.log(`✅ Created ${locations.length} locations`)

  // 샘플 재고 아이템 생성
  const items = await Promise.all([
    prisma.item.create({
      data: {
        name: '우유',
        description: '서울우유 1L',
        brand: '서울우유',
        barcode: '8801234567890',
        quantity: 2,
        minQuantity: 1,
        unit: '개',
        categoryId: categories[0].id, // 식품
        locationId: locations[0].id, // 냉장실
        expiryDate: new Date('2026-02-10'),
        purchaseDate: new Date('2026-01-28'),
        price: 3500,
        purchaseStore: '이마트',
      },
    }),
    prisma.item.create({
      data: {
        name: '샴푸',
        description: '케라시스 향기나는 샴푸',
        brand: '케라시스',
        barcode: '8801234567891',
        quantity: 1,
        minQuantity: 1,
        unit: '개',
        categoryId: categories[1].id, // 생활용품
        locationId: locations[3].id, // 욕실
        price: 8900,
        purchaseStore: '다이소',
      },
    }),
    prisma.item.create({
      data: {
        name: '타이레놀',
        description: '타이레놀 500mg 20정',
        brand: '존슨앤존슨',
        quantity: 1,
        minQuantity: 1,
        unit: '박스',
        categoryId: categories[2].id, // 의약품
        locationId: locations[4].id, // 창고
        expiryDate: new Date('2027-12-31'),
        price: 6500,
      },
    }),
  ])

  console.log(`✅ Created ${items.length} sample items`)

  // 재고 이력 생성
  const histories = await Promise.all([
    prisma.stockHistory.create({
      data: {
        itemId: items[0].id,
        type: 'IN',
        quantity: 2,
        beforeQty: 0,
        afterQty: 2,
        reason: '초기 재고',
      },
    }),
    prisma.stockHistory.create({
      data: {
        itemId: items[1].id,
        type: 'IN',
        quantity: 1,
        beforeQty: 0,
        afterQty: 1,
        reason: '초기 재고',
      },
    }),
  ])

  console.log(`✅ Created ${histories.length} stock histories`)
  console.log('✨ Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
