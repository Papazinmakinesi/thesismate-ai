import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let thesis = await prisma.thesis.findFirst();

    if (!thesis) {
      return NextResponse.json([]);
    }

    const drafts = await prisma.thesisDraft.findMany({
      where: { thesisId: thesis.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(drafts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
