import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, tableNo, token } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    if (!tableNo || !token) {
      return NextResponse.json({ error: 'กรุณาสแกน QR Code โต๊ะก่อนสั่งอาหาร' }, { status: 403 });
    }

    const table = await prisma.table.findUnique({ where: { tableNo: String(tableNo) } });
    if (!table) {
      return NextResponse.json({ error: 'ไม่พบโต๊ะ' }, { status: 404 });
    }
    // Validate QR token
    if (!table.token || table.token !== token) {
      return NextResponse.json({ error: 'QR Code หมดอายุแล้ว กรุณาขอ QR ใหม่จากพนักงาน' }, { status: 403 });
    }

    // Fetch real prices from DB (NEVER trust client prices)
    const menuIds = items.map((i: any) => i.menuId);
    const menus = await prisma.menu.findMany({ where: { id: { in: menuIds }, status: 'AVAILABLE' } });
    const menuMap = new Map(menus.map(m => [m.id, m]));

    // Validate all items exist and are available
    const validatedItems = [];
    for (const item of items) {
      const menu = menuMap.get(item.menuId);
      if (!menu) {
        return NextResponse.json({ error: `เมนู "${item.name || item.menuId}" หมดแล้วหรือไม่มีในระบบ` }, { status: 400 });
      }
      validatedItems.push({
        menuId: menu.id,
        quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
        priceAtOrder: menu.price, // Server-side price!
        note: item.note || null,
      });
    }

    const subtotal = validatedItems.reduce((sum, i) => sum + i.priceAtOrder * i.quantity, 0);

    // Set table to occupied
    await prisma.table.update({ where: { id: table.id }, data: { status: 'OCCUPIED' } });

    const order = await prisma.order.create({
      data: {
        tableId: table.id,
        status: 'OPEN',
        subtotal,
        total: subtotal,
        items: { create: validatedItems }
      },
      include: { items: { include: { menu: true } } }
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Error submitting order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
