import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, tableNo, total, token } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Find the active table ID
    const table = await prisma.table.findUnique({
      where: { tableNo: tableNo || '05' }
    });

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Token Validation for PRO system security
    if (table.token && table.token !== token) {
      return NextResponse.json({ error: 'QR Code นี้หมดอายุแล้ว กรุณาสแกน QR ใหม่อีกครั้งเพื่อความปลอดภัยครับ' }, { status: 403 });
    }

    // Calculate subtotal
    const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    // In Pro POS: Service Charge 10%, VAT 7%
    // Let's keep it simple for now and use total from client or calculate here.
    const calculatedTotal = subtotal; // Assuming no VAT/SC for this basic version yet

    // Create the order
    const order = await prisma.order.create({
      data: {
        tableId: table.id,
        status: 'OPEN',
        subtotal: subtotal,
        total: calculatedTotal,
        items: {
          create: items.map((item: any) => ({
            menuId: item.menuId,
            quantity: item.quantity,
            price: item.price,
            note: item.note || null
          }))
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Error submitting order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
