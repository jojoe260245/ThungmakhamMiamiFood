import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH: Checkout / Pay for an order
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { paymentMethod, discount } = body; // CASH, PROMPTPAY, CREDIT_CARD

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true, table: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'PAID') {
      return NextResponse.json({ error: 'Order already paid' }, { status: 400 });
    }

    const finalDiscount = discount || 0;
    const finalTotal = order.subtotal - finalDiscount;

    // Update order to PAID
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        status: 'PAID',
        paymentMethod: paymentMethod || 'CASH',
        discount: finalDiscount,
        total: finalTotal,
      }
    });

    // Check if table has any remaining OPEN orders
    if (order.tableId) {
      const remainingOrders = await prisma.order.count({
        where: {
          tableId: order.tableId,
          status: 'OPEN',
          id: { not: parseInt(id) }
        }
      });

      // If no more open orders, set table back to AVAILABLE and clear token
      if (remainingOrders === 0) {
        await prisma.table.update({
          where: { id: order.tableId },
          data: { status: 'AVAILABLE', token: null }
        });
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder }, { status: 200 });
  } catch (error) {
    console.error('Error checking out order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET: Get a single order by ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        table: true,
        items: {
          include: { menu: true }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
