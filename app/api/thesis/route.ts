import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let thesis = await prisma.thesis.findFirst({
      include: {
        sources: true,
        comments: true,
        matrices: true,
      },
    });

    // If no thesis exists, create a default one
    if (!thesis) {
      thesis = await prisma.thesis.create({
        data: {
          title: 'Designing a Sustainable Urban Mobility Framework',
          topic: 'Green transport systems for campus communities',
          aim: 'Evaluate policies, data, and stakeholder expectations to support sustainable mobility.',
          researchQuestions: JSON.stringify([
            'How can campus transport be made low-carbon and inclusive?',
            'What are the critical policy levers for thesis implementation?',
          ]),
        },
        include: {
          sources: true,
          comments: true,
          matrices: true,
        },
      });
    }

    return NextResponse.json(thesis);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { title, topic, aim, researchQuestions } = await request.json();
    let thesis = await prisma.thesis.findFirst();

    if (!thesis) {
      thesis = await prisma.thesis.create({
        data: {
          title: title || '',
          topic: topic || '',
          aim: aim || '',
          researchQuestions: typeof researchQuestions === 'string' ? researchQuestions : JSON.stringify(researchQuestions || []),
        },
      });
    } else {
      thesis = await prisma.thesis.update({
        where: { id: thesis.id },
        data: {
          title: title !== undefined ? title : thesis.title,
          topic: topic !== undefined ? topic : thesis.topic,
          aim: aim !== undefined ? aim : thesis.aim,
          researchQuestions: researchQuestions !== undefined 
            ? (typeof researchQuestions === 'string' ? researchQuestions : JSON.stringify(researchQuestions))
            : thesis.researchQuestions,
        },
      });
    }

    return NextResponse.json(thesis);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
