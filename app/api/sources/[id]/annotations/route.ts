import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const annotations = await prisma.annotation.findMany({
      where: { sourceId: id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(annotations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const { quote, note } = await request.json();

    if (!quote || !note) {
      return NextResponse.json({ error: 'Quote and note content are required.' }, { status: 400 });
    }

    const annotation = await prisma.annotation.create({
      data: {
        quote,
        note,
        sourceId: id,
      },
    });

    return NextResponse.json(annotation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { searchParams } = new URL(request.url);
    const annotationId = searchParams.get('annotationId');

    if (!annotationId) {
      return NextResponse.json({ error: 'annotationId query parameter is required.' }, { status: 400 });
    }

    await prisma.annotation.delete({
      where: { id: annotationId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
