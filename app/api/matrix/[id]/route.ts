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

    const matrix = await prisma.literatureMatrix.update({
      where: { id },
      data: {
        source: data.source,
        method: data.method,
        keyFindings: data.keyFindings,
        limitations: data.limitations,
        relevance: data.relevance,
        citationUsage: data.citationUsage,
      },
    });

    return NextResponse.json(matrix);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;
    await prisma.literatureMatrix.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
