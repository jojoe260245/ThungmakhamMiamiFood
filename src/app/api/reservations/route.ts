import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({ orderBy: { reservationTime: 'asc' }, include: { table: true } });
    return NextResponse.json({ reservations }, { status: 200 });
  } catch (error) { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.customerName || !body.phone || !body.reservationTime || !body.guestCount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const reservation = await prisma.reservation.create({
      data: {
        customerName: body.customerName,
        phone: body.phone,
        reservationTime: new Date(body.reservationTime),
        guestCount: parseInt(body.guestCount),
        tableId: body.tableId ? parseInt(body.tableId) : null,
        status: 'PENDING',
      }
    });
    return NextResponse.json({ success: true, reservation }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }); }
}
