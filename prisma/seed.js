const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 เริ่มการจำลองข้อมูลเริ่มต้น (Seeding database)...');

  // 1. สร้าง Users (พนักงานตำแหน่งต่างๆ)
  const users = await Promise.all([
    prisma.user.upsert({
      where: { empId: 'EMP001' },
      update: {},
      create: { empId: 'EMP001', name: 'คุณแอดมิน (Admin)', pin: '9999', role: 'ADMIN' },
    }),
    prisma.user.upsert({
      where: { empId: 'EMP002' },
      update: {},
      create: { empId: 'EMP002', name: 'คุณแคชเชียร์ (Cashier)', pin: '1111', role: 'CASHIER' },
    }),
    prisma.user.upsert({
      where: { empId: 'EMP003' },
      update: {},
      create: { empId: 'EMP003', name: 'คุณพ่อครัว (Kitchen)', pin: '2222', role: 'KITCHEN' },
    }),
    prisma.user.upsert({
      where: { empId: 'EMP004' },
      update: {},
      create: { empId: 'EMP004', name: 'บาร์เทนเดอร์ (Bar)', pin: '3333', role: 'BAR' },
    }),
  ]);
  console.log('✅ สร้างข้อมูลพนักงานสำเร็จ');

  // 2. สร้างโต๊ะ (Tables 1-10)
  for (let i = 1; i <= 10; i++) {
    await prisma.table.upsert({
      where: { tableNo: String(i) },
      update: {},
      create: { tableNo: String(i), status: 'AVAILABLE' },
    });
  }
  console.log('✅ สร้างข้อมูลโต๊ะ 10 โต๊ะสำเร็จ');

  // 3. สร้างหมวดหมู่เมนู (Categories)
  const catFood = await prisma.category.create({ data: { name: 'อาหารจานหลัก', sortOrder: 1 } });
  const catDrink = await prisma.category.create({ data: { name: 'เครื่องดื่ม', sortOrder: 2 } });
  console.log('✅ สร้างหมวดหมู่เมนูสำเร็จ');

  // 4. สร้างเมนูเริ่มต้น (Menus)
  await prisma.menu.createMany({
    data: [
      { name: 'ข้าวผัดทะเล', price: 120, categoryId: catFood.id, isDrink: false, isRecommended: true },
      { name: 'ต้มยำกุ้ง', price: 250, categoryId: catFood.id, isDrink: false, isRecommended: true },
      { name: 'ปลากะพงทอดน้ำปลา', price: 350, categoryId: catFood.id, isDrink: false, isRecommended: false },
      { name: 'น้ำแตงโมปั่น', price: 80, categoryId: catDrink.id, isDrink: true, isRecommended: true },
      { name: 'ชามะนาว', price: 60, categoryId: catDrink.id, isDrink: true, isRecommended: false },
    ]
  });
  console.log('✅ สร้างเมนูเริ่มต้นสำเร็จ');

  // 5. สร้างกิจกรรมโปรโมชัน (Event)
  await prisma.event.create({
    data: {
      title: 'ดนตรีสดคืนวันศุกร์',
      subtitle: 'ฟังเพลงชิลๆ ริมทะเล',
      description: 'พบกับวงดนตรีอคูสติกสุดพิเศษได้ทุกคืนวันศุกร์ ตั้งแต่ 19:00 เป็นต้นไป',
      badge: 'LIVE MUSIC',
      badgeColor: 'bg-purple-500',
      isActive: true,
      sortOrder: 1
    }
  });
  console.log('✅ สร้างกิจกรรมโปรโมชันสำเร็จ');

  console.log('🎉 Seeding database เรียบร้อยแล้ว!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
