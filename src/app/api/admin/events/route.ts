import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// GET all events (admin)
export async function GET() {
  try {
    const events = await prisma.event.findMany({ orderBy: { sortOrder: 'asc' } });
    return NextResponse.json({ events }, { status: 200 });
  } catch (error) { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }); }
}

// POST create event
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = await prisma.event.create({ data: { title: body.title, subtitle: body.subtitle || null, description: body.description || null, image: body.image || null, badge: body.badge || null, badgeColor: body.badgeColor || 'bg-amber-500', price: body.price || null, isActive: body.isActive ?? true, sortOrder: body.sortOrder || 0 } });
    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }); }
}
