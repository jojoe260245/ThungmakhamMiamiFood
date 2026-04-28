import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH: Checkout / Pay for an order
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { paymentMethod, discount, checkoutAll } = body;

    if (checkoutAll) {
      // Checkout ALL open orders for this table
      const order = await prisma.order.findUnique({ where: { id: parseInt(id) }, include: { table: true } });
      if (!order || !order.tableId) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

      const openOrders = await prisma.order.findMany({
        where: { tableId: order.tableId, status: 'OPEN' },
        include: { items: { include: { menu: true } } }
      });

      let grandSubtotal = 0;
      for (const o of openOrders) {
        const sub = o.items
          .filter(i => i.status !== 'CANCELLED')
          .reduce((s, i) => s + i.priceAtOrder * i.quantity, 0);
        grandSubtotal += sub;
      }

      const finalDiscount = discount || 0;
      const finalTotal = Math.max(0, grandSubtotal - finalDiscount);

      // Update all orders to PAID
      for (const o of openOrders) {
        await prisma.order.update({
          where: { id: o.id },
          data: {
            status: 'PAID',
            paymentMethod: paymentMethod || 'CASH',
            discount: finalDiscount / openOrders.length,
            total: finalTotal / openOrders.length,
          }
        });
      }

      // Clear table
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'AVAILABLE', token: null }
      });

      return NextResponse.json({ success: true, totalPaid: finalTotal, ordersCount: openOrders.length }, { status: 200 });
    }

    // Single order checkout
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true, table: true }
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.status === 'PAID') return NextResponse.json({ error: 'Order already paid' }, { status: 400 });

    const activeItems = order.items.filter(i => i.status !== 'CANCELLED');
    const subtotal = activeItems.reduce((s, i) => s + i.priceAtOrder * i.quantity, 0);
    const finalDiscount = discount || 0;
    const finalTotal = Math.max(0, subtotal - finalDiscount);

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: 'PAID', paymentMethod: paymentMethod || 'CASH', discount: finalDiscount, subtotal, total: finalTotal }
    });

    // Check remaining open orders
    if (order.tableId) {
      const remaining = await prisma.order.count({ where: { tableId: order.tableId, status: 'OPEN', id: { not: parseInt(id) } } });
      if (remaining === 0) {
        await prisma.table.update({ where: { id: order.tableId }, data: { status: 'AVAILABLE', token: null } });
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder }, { status: 200 });
  } catch (error) {
    console.error('Error checking out:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET: Get a single order by ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { table: true, items: { include: { menu: true } } }
    });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
