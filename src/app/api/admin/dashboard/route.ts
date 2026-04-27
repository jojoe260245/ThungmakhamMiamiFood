import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalMenus, totalTables, todayOrders, todayRevenue, openOrders] = await Promise.all([
      prisma.menu.count(),
      prisma.table.count(),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'PAID', createdAt: { gte: today } }
      }),
      prisma.order.count({ where: { status: 'OPEN' } }),
    ]);

    // Top selling items today - fetch raw data and aggregate in JS
    let topItems: { menuId: number; name: string; totalSold: number }[] = [];
    try {
      const todayItems = await prisma.orderItem.findMany({
        where: { order: { createdAt: { gte: today } } },
        select: { menuId: true, quantity: true, menu: { select: { name: true } } }
      });

      const itemMap = new Map<number, { name: string; total: number }>();
      for (const item of todayItems) {
        const existing = itemMap.get(item.menuId);
        if (existing) {
          existing.total += item.quantity;
        } else {
          itemMap.set(item.menuId, { name: item.menu.name, total: item.quantity });
        }
      }

      topItems = Array.from(itemMap.entries())
        .map(([menuId, data]) => ({ menuId, name: data.name, totalSold: data.total }))
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5);
    } catch (e) {
      console.error('Top items query failed:', e);
    }

    return NextResponse.json({
      stats: {
        totalMenus,
        totalTables,
        todayOrders,
        todayRevenue: todayRevenue._sum.total || 0,
        openOrders,
        topItems
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
