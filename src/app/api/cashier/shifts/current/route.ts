import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const shift = await prisma.shift.findFirst({
      where: { userId: parseInt(userId), status: 'OPEN' }
    });

    if (!shift) return NextResponse.json({ shift: null }, { status: 200 });

    // Calculate current revenue for this shift
    const orders = await prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: 'PAID',
        createdAt: { gte: shift.openedAt }
      }
    });

    return NextResponse.json({
      shift,
      revenue: orders._sum.total || 0,
      expectedCash: shift.openingAmount + (orders._sum.total || 0)
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
