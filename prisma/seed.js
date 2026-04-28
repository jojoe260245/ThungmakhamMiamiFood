const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Users
  await prisma.user.createMany({
    data: [
      { empId: 'EMP001', name: 'คุณแอดมิน (Admin)', pin: '9999', role: 'ADMIN' },
      { empId: 'EMP002', name: 'คุณแคชเชียร์ (Cashier)', pin: '1111', role: 'CASHIER' },
      { empId: 'EMP003', name: 'คุณพ่อครัว (Kitchen)', pin: '2222', role: 'KITCHEN' },
      { empId: 'EMP004', name: 'บาร์เทนเดอร์ (Bar)', pin: '3333', role: 'BAR' },
    ]
  });

  // Tables
  for (let i = 1; i <= 10; i++) {
    await prisma.table.create({ data: { tableNo: String(i), status: 'AVAILABLE' } });
  }

  // Categories
  const cat1 = await prisma.category.create({ data: { name: 'อาหารจานเดียว', sortOrder: 1 } });
  const cat2 = await prisma.category.create({ data: { name: 'กับข้าว', sortOrder: 2 } });
  const cat3 = await prisma.category.create({ data: { name: 'ยำ/สลัด', sortOrder: 3 } });
  const cat4 = await prisma.category.create({ data: { name: 'ซุป/แกง', sortOrder: 4 } });
  const cat5 = await prisma.category.create({ data: { name: 'เครื่องดื่ม', sortOrder: 5 } });
  const cat6 = await prisma.category.create({ data: { name: 'ของหวาน', sortOrder: 6 } });

  // Menus
  await prisma.menu.createMany({
    data: [
      { name: 'ข้าวผัดกระเพรา', price: 69, categoryId: cat1.id, isRecommended: true },
      { name: 'ข้าวผัดต้มยำ', price: 79, categoryId: cat1.id },
      { name: 'ข้าวผัดปู', price: 89, categoryId: cat1.id },
      { name: 'ข้าวหมูกรอบ', price: 75, categoryId: cat1.id },
      { name: 'ข้าวมันไก่', price: 65, categoryId: cat1.id, isRecommended: true },
      { name: 'ผัดไทกุ้งสด', price: 89, categoryId: cat1.id },
      { name: 'กะเพราหมูสับ', price: 79, categoryId: cat2.id, isRecommended: true },
      { name: 'ผัดคะน้าปลาเค็ม', price: 89, categoryId: cat2.id },
      { name: 'ไข่เจียวหมูสับ', price: 69, categoryId: cat2.id },
      { name: 'ปลากะพงทอดน้ำปลา', price: 259, categoryId: cat2.id, isRecommended: true },
      { name: 'กุ้งอบวุ้นเส้น', price: 199, categoryId: cat2.id },
      { name: 'ยำวุ้นเส้น', price: 99, categoryId: cat3.id },
      { name: 'ยำถั่วพู', price: 89, categoryId: cat3.id },
      { name: 'ส้มตำไทย', price: 69, categoryId: cat3.id, isRecommended: true },
      { name: 'ต้มยำกุ้ง', price: 159, categoryId: cat4.id, isRecommended: true },
      { name: 'ต้มข่าไก่', price: 119, categoryId: cat4.id },
      { name: 'แกงเขียวหวานไก่', price: 99, categoryId: cat4.id },
      { name: 'น้ำเปล่า', price: 15, categoryId: cat5.id, isDrink: true },
      { name: 'โค้ก', price: 25, categoryId: cat5.id, isDrink: true },
      { name: 'ชาเย็น', price: 39, categoryId: cat5.id, isDrink: true, isRecommended: true },
      { name: 'กาแฟเย็น', price: 45, categoryId: cat5.id, isDrink: true },
      { name: 'น้ำมะนาว', price: 35, categoryId: cat5.id, isDrink: true },
      { name: 'สมูทตี้มะม่วง', price: 59, categoryId: cat5.id, isDrink: true },
      { name: 'ข้าวเหนียวมะม่วง', price: 79, categoryId: cat6.id },
      { name: 'ไอศกรีมมะพร้าว', price: 49, categoryId: cat6.id },
    ]
  });

  // Settings
  await prisma.setting.createMany({
    data: [
      { key: 'restaurant_name', value: 'ThungmakhamMiamiFood', description: 'ชื่อร้าน' },
      { key: 'vat_percent', value: '7', description: 'ภาษีมูลค่าเพิ่ม %' },
      { key: 'service_charge_percent', value: '0', description: 'ค่าบริการ %' },
      { key: 'promptpay_id', value: '0812345678', description: 'PromptPay ID' },
      { key: 'receipt_footer', value: 'ขอบคุณที่มาอุดหนุนครับ!', description: 'ข้อความท้ายใบเสร็จ' },
    ]
  });

  console.log('✅ Seed completed!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
