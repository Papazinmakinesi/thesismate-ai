import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let thesis = await prisma.thesis.findFirst();
    if (!thesis) {
      return NextResponse.json([]);
    }

    const sources = await prisma.source.findMany({
      where: { thesisId: thesis.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(sources);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    let thesis = await prisma.thesis.findFirst();
    if (!thesis) {
      // Create thesis first if none exists
      thesis = await prisma.thesis.create({
        data: {
          title: 'My Thesis Title',
          topic: 'Thesis Topic',
          aim: 'Thesis Aim',
          researchQuestions: JSON.stringify([]),
        },
      });
    }

    const source = await prisma.source.create({
      data: {
        title: data.title || 'Untitled Source',
        author: data.author || '',
        year: data.year ? parseInt(data.year) : 0,
        sourceType: data.sourceType || 'Journal Article',
        summary: data.summary || '',
        keywords: data.keywords || '',
        chapter: data.chapter || '',
        extractedText: data.extractedText || '',
        thesisId: thesis.id,
      },
    });

    return NextResponse.json(source);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
