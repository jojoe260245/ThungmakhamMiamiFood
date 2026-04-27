import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableNo = searchParams.get('tableNo');
    const baseUrl = searchParams.get('baseUrl') || 'http://localhost:3000';

    if (!tableNo) return NextResponse.json({ error: 'tableNo required' }, { status: 400 });

    const url = `${baseUrl}/table/${tableNo}`;
    const qrDataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2, color: { dark: '#000000', light: '#ffffff' } });

    return NextResponse.json({ qrCode: qrDataUrl, url }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 });
  }
}
