import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  try {
    const tables = await prisma.table.findMany({ orderBy: { tableNo: 'asc' } });
    return NextResponse.json({ tables }, { status: 200 });
  } catch (error) { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.tableNo) return NextResponse.json({ error: 'tableNo is required' }, { status: 400 });
    const table = await prisma.table.create({ data: { tableNo: body.tableNo, status: body.status || 'AVAILABLE' } });
    return NextResponse.json({ success: true, table }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }); }
}
