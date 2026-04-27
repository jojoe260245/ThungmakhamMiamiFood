import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET orders by table number (for customer order tracking)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableNo = searchParams.get('tableNo');

    if (!tableNo) {
      return NextResponse.json({ error: 'tableNo is required' }, { status: 400 });
    }

    const table = await prisma.table.findUnique({
      where: { tableNo }
    });

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: {
        tableId: table.id,
        status: 'OPEN'
      },
      include: {
        items: {
          include: { menu: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('Error fetching table orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
