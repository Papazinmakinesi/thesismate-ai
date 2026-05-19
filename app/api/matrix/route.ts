import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let thesis = await prisma.thesis.findFirst();
    if (!thesis) {
      return NextResponse.json([]);
    }

    const matrices = await prisma.literatureMatrix.findMany({
      where: { thesisId: thesis.id },
    });

    return NextResponse.json(matrices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    let thesis = await prisma.thesis.findFirst();
    if (!thesis) {
      thesis = await prisma.thesis.create({
        data: {
          title: 'My Thesis Title',
          topic: 'Thesis Topic',
          aim: 'Thesis Aim',
          researchQuestions: JSON.stringify([]),
        },
      });
    }

    const matrix = await prisma.literatureMatrix.create({
      data: {
        source: data.source || 'Untitled Source',
        method: data.method || '',
        keyFindings: data.keyFindings || '',
        limitations: data.limitations || '',
        relevance: data.relevance || '',
        citationUsage: data.citationUsage || '',
        thesisId: thesis.id,
      },
    });

    return NextResponse.json(matrix);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
