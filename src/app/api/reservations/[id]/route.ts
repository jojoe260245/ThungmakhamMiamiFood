import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const reservation = await prisma.reservation.update({ where: { id: parseInt(id) }, data: body });
    return NextResponse.json({ success: true, reservation }, { status: 200 });
  } catch (error) { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.reservation.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }); }
}
