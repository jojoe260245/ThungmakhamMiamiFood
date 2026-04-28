import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// In-memory service requests (for simplicity without WebSocket)
// In production, use Redis or DB table
declare global { var serviceRequests: any[]; }
if (!global.serviceRequests) global.serviceRequests = [];

export async function GET() {
  return NextResponse.json({ requests: global.serviceRequests }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const { tableNo, type, message } = await req.json();
    // type: CALL_STAFF, CHECK_BILL, REQUEST_PLATE, REQUEST_ICE, REQUEST_TISSUE
    const request = {
      id: Date.now(),
      tableNo,
      type,
      message: message || '',
      status: 'PENDING', // PENDING, ACKNOWLEDGED
      createdAt: new Date().toISOString(),
    };
    global.serviceRequests.push(request);
    // Keep only last 50 requests
    if (global.serviceRequests.length > 50) {
      global.serviceRequests = global.serviceRequests.slice(-50);
    }
    return NextResponse.json({ success: true, request }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id } = await req.json();
    const idx = global.serviceRequests.findIndex((r: any) => r.id === id);
    if (idx >= 0) {
      global.serviceRequests[idx].status = 'ACKNOWLEDGED';
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
