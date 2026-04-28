import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableNo = searchParams.get('tableNo');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = searchParams.get('baseUrl') || `${protocol}://${host}`;

    if (!tableNo) return NextResponse.json({ error: 'tableNo required' }, { status: 400 });

    const table = await prisma.table.findUnique({ where: { tableNo } });
    if (!table) return NextResponse.json({ error: 'Table not found' }, { status: 404 });

    // Generate token if not exists
    let token = table.token;
    if (!token) {
      token = randomBytes(8).toString('hex');
      await prisma.table.update({ where: { tableNo }, data: { token } });
    }

    const url = `${baseUrl}/table/${tableNo}?token=${token}`;
    const qrDataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2, color: { dark: '#000000', light: '#ffffff' } });

    return NextResponse.json({ qrCode: qrDataUrl, url, token }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 });
  }
}
