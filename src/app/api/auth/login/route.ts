import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    if (!pin) return NextResponse.json({ error: 'PIN required' }, { status: 400 });

    const user = await prisma.user.findFirst({ where: { pin: String(pin) } });
    if (!user) return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });

    // Return user info (role-based access)
    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, role: user.role, empId: user.empId }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
