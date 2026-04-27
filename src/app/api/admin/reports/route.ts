import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily'; // daily, weekly, monthly

    const now = new Date();
    let startDate = new Date();
    let days = 7;

    if (period === 'daily') { days = 7; startDate.setDate(now.getDate() - 7); }
    else if (period === 'weekly') { days = 28; startDate.setDate(now.getDate() - 28); }
    else if (period === 'monthly') { days = 180; startDate.setDate(now.getDate() - 180); }
    startDate.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: { status: 'PAID', createdAt: { gte: startDate } },
      select: { total: true, createdAt: true, items: { select: { quantity: true, menuId: true, menu: { select: { name: true } } } } }
    });

    // Group by date
    const dailyMap = new Map<string, { revenue: number; orders: number }>();
    const menuMap = new Map<number, { name: string; sold: number; revenue: number }>();

    for (const order of orders) {
      const dateKey = period === 'monthly'
        ? `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`
        : order.createdAt.toISOString().split('T')[0];

      const existing = dailyMap.get(dateKey) || { revenue: 0, orders: 0 };
      existing.revenue += order.total;
      existing.orders += 1;
      dailyMap.set(dateKey, existing);

      for (const item of order.items) {
        const m = menuMap.get(item.menuId) || { name: item.menu.name, sold: 0, revenue: 0 };
        m.sold += item.quantity;
        menuMap.set(item.menuId, m);
      }
    }

    const chartData = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const topMenus = Array.from(menuMap.entries())
      .map(([id, data]) => ({ menuId: id, ...data }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;

    return NextResponse.json({ report: { period, totalRevenue, totalOrders, chartData, topMenus } }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
