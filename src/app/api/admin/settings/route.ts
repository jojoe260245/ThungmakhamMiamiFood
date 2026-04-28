import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    return NextResponse.json({ settings }, { status: 200 });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const { settings } = await req.json();
    for (const s of settings) {
      await prisma.setting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: { key: s.key, value: s.value, description: s.description || '' }
      });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
