import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let thesis = await prisma.thesis.findFirst();
    if (!thesis) {
      return NextResponse.json([]);
    }

    const comments = await prisma.comment.findMany({
      where: { thesisId: thesis.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(comments);
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

    const comment = await prisma.comment.create({
      data: {
        content: data.content || '',
        chapter: data.chapter || '',
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
        thesisId: thesis.id,
      },
    });

    return NextResponse.json(comment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
