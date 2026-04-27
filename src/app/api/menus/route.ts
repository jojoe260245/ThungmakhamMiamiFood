import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        menus: {
          where: {
            status: 'AVAILABLE'
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error('Error fetching menus:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
