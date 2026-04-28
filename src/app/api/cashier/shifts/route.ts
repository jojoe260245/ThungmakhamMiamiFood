import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Open or Close Shift
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, openingAmount, closingAmount } = body;

    if (action === 'OPEN') {
      if (!userId || openingAmount === undefined) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      
      // Check if user already has an open shift
      const existing = await prisma.shift.findFirst({ where: { userId: parseInt(userId), status: 'OPEN' } });
      if (existing) return NextResponse.json({ error: 'Shift already open' }, { status: 400 });

      const shift = await prisma.shift.create({
        data: { userId: parseInt(userId), openingAmount: parseFloat(openingAmount), status: 'OPEN' }
      });
      return NextResponse.json({ success: true, shift }, { status: 201 });
    } 
    
    if (action === 'CLOSE') {
      const { shiftId } = body;
      if (!shiftId || closingAmount === undefined) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

      const shift = await prisma.shift.update({
        where: { id: parseInt(shiftId) },
        data: { closingAmount: parseFloat(closingAmount), status: 'CLOSED', closedAt: new Date() }
      });
      return NextResponse.json({ success: true, shift }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
