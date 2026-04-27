import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      include: {
        orders: {
          where: {
            status: 'OPEN'
          },
          include: {
            items: {
              include: {
                menu: true
              }
            }
          }
        }
      },
      orderBy: {
        tableNo: 'asc'
      }
    });

    return NextResponse.json({ tables }, { status: 200 });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
