import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const data = await request.json();

    const source = await prisma.source.update({
      where: { id },
      data: {
        title: data.title,
        author: data.author,
        year: data.year ? parseInt(data.year) : undefined,
        sourceType: data.sourceType,
        summary: data.summary,
        keywords: data.keywords,
        chapter: data.chapter,
        extractedText: data.extractedText,
      },
    });

    return NextResponse.json(source);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;
    await prisma.source.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
