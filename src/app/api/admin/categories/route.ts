import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' }, include: { _count: { select: { menus: true } } } });
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) return NextResponse.json({ error: 'name is required' }, { status: 400 });
    const category = await prisma.category.create({ data: { name: body.name, sortOrder: body.sortOrder || 0 } });
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }); }
}
