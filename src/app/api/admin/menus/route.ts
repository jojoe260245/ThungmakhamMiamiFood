import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all menus with categories (for admin)
export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      include: { category: true },
      orderBy: { id: 'asc' }
    });
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    return NextResponse.json({ menus, categories }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin menus:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new menu item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, image, isDrink, isRecommended, categoryId, status } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: 'name, price, categoryId are required' }, { status: 400 });
    }

    const menu = await prisma.menu.create({
      data: {
        name,
        price: parseFloat(price),
        image: image || null,
        isDrink: isDrink || false,
        isRecommended: isRecommended || false,
        categoryId: parseInt(categoryId),
        status: status || 'AVAILABLE'
      }
    });

    return NextResponse.json({ success: true, menu }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
