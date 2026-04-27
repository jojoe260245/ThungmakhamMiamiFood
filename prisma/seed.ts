import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // Clear existing
  await prisma.menu.deleteMany()
  await prisma.category.deleteMany()
  await prisma.table.deleteMany()

  // Create Categories
  const catRecommend = await prisma.category.create({
    data: { name: 'Recommended' },
  })

  const catSeafood = await prisma.category.create({
    data: { name: 'Seafood' },
  })

  const catDrinks = await prisma.category.create({
    data: { name: 'Drinks' },
  })

  // Create Menus
  const menus = [
    {
      name: 'Spicy Seafood Tom Yum',
      price: 250,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      categoryId: catRecommend.id,
      isRecommended: true,
      status: 'AVAILABLE'
    },
    {
      name: 'Grilled Tiger Prawns',
      price: 450,
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      categoryId: catSeafood.id,
      status: 'AVAILABLE'
    },
    {
      name: 'Steamed Crab',
      price: 850,
      image: 'https://images.unsplash.com/photo-1599084942896-67520e10e9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      categoryId: catSeafood.id,
      status: 'AVAILABLE'
    },
    {
      name: 'Ocean Blue Soda',
      price: 120,
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      categoryId: catDrinks.id,
      isDrink: true,
      status: 'AVAILABLE'
    },
    {
      name: 'Fresh Coconut Water',
      price: 90,
      image: 'https://images.unsplash.com/photo-1546890975-7596e98cdbf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      categoryId: catDrinks.id,
      isDrink: true,
      status: 'AVAILABLE'
    }
  ];

  for (const menu of menus) {
    await prisma.menu.create({
      data: menu,
    })
  }

  // Create a default Table
  await prisma.table.create({
    data: {
      tableNo: '05',
      token: 'test-token-table-05',
      status: 'AVAILABLE'
    }
  })

  console.log(`Seeding finished.`)
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
