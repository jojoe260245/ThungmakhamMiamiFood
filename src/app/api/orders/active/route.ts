import { NextResponse } from 'next/server';
import { PrismaClient, type Prisma } from '@prisma/client';

const prisma = new PrismaClient();

type ActiveOrder = Prisma.OrderGetPayload<{
  include: {
    table: true;
    items: {
      include: {
        menu: true;
      };
    };
  };
}>;

// Fetch all active orders (not PAID or CANCELLED) with items
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const printerType = searchParams.get('type'); // 'KITCHEN' or 'BAR'

    const orders: ActiveOrder[] = await prisma.order.findMany({
      where: {
        status: 'OPEN',
      },
      include: {
        table: true,
        items: {
          include: {
            menu: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Oldest orders first
      },
    });

    // Filter items based on printerType if provided
    let result: ActiveOrder[] = orders;

    if (printerType) {
      const isDrinkFilter = printerType === 'BAR';

      result = orders
        .map((order: ActiveOrder) => {
          return {
            ...order,
            items: order.items.filter(
              (item: ActiveOrder['items'][number]) =>
                item.menu?.isDrink === isDrinkFilter
            ),
          };
        })
        .filter((order: ActiveOrder) => order.items.length > 0);
    }

    return NextResponse.json({ orders: result }, { status: 200 });
  } catch (error) {
    console.error('Error fetching active orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}