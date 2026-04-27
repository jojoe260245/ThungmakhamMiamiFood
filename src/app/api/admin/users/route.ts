import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({ orderBy: { name: 'asc' }, select: { id: true, empId: true, name: true, role: true, createdAt: true } });
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.pin || !body.role) return NextResponse.json({ error: 'name, pin, role required' }, { status: 400 });
    const empId = `EMP${Date.now().toString().slice(-6)}`;
    const user = await prisma.user.create({ data: { empId, name: body.name, pin: body.pin, role: body.role } });
    return NextResponse.json({ success: true, user: { id: user.id, empId: user.empId, name: user.name, role: user.role } }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }); }
}
