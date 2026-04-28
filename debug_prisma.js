const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const order = await prisma.order.create({
      data: {
        tableId: 4,
        status: 'OPEN',
        subtotal: 50,
        total: 50,
        items: {
          create: [{ menuId: 1, quantity: 1, price: 50, note: null }]
        }
      }
    });
    console.log("Success:", order);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
