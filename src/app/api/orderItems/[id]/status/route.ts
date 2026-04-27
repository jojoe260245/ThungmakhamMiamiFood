import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body; // PENDING, COOKING, DONE, SERVED

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    return NextResponse.json({ success: true, item: updatedItem }, { status: 200 });
  } catch (error) {
    console.error('Error updating order item status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
