import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean database first
  await prisma.literatureMatrix.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.source.deleteMany({});
  await prisma.thesis.deleteMany({});

  const thesis = await prisma.thesis.create({
    data: {
      title: 'Designing a Sustainable Urban Mobility Framework',
      topic: 'Green transport systems for campus communities',
      aim: 'Evaluate policies, data, and stakeholder expectations to support sustainable mobility.',
      researchQuestions: JSON.stringify([
        'How can campus transport be made low-carbon and inclusive?',
        'What are the critical policy levers for thesis implementation?',
      ]),
      sources: {
        create: [
          {
            title: 'Sustainable Urban Mobility Planning',
            author: 'D. Banister',
            year: 2020,
            sourceType: 'Journal Article',
            summary: 'A review of integrated mobility policy frameworks for low-carbon cities.',
            keywords: 'sustainability, policy, urban mobility',
            chapter: 'Literature Review',
            extractedText: 'This paper highlights the role of integrated planning in sustainable transport systems.',
          },
          {
            title: 'Campus Transport Strategy',
            author: 'A. Chen',
            year: 2022,
            sourceType: 'Conference Paper',
            summary: 'Methodology for measuring campus travel behavior and modal shift potential.',
            keywords: 'campus, modal shift, behavior',
            chapter: 'Methodology',
            extractedText: 'Empirical strategies for collecting travel diaries and stakeholder interviews.',
          },
        ],
      },
      comments: {
        create: [
          {
            content: 'Clarify the definition of the research gap in the introduction section.',
            chapter: 'Introduction',
            status: 'TODO',
            priority: 'HIGH',
          },
          {
            content: 'Add a short table comparing the main sources in Chapter 2.',
            chapter: 'Literature Review',
            status: 'IN_PROGRESS',
            priority: 'MEDIUM',
          },
        ],
      },
      matrices: {
        create: [
          {
            source: 'Sustainable Urban Mobility Planning',
            method: 'Literature review',
            keyFindings: 'Policy integration is essential for reducing emissions.',
            limitations: 'Limited case studies from university environments.',
            relevance: 'Supports argument for framework design.',
            citationUsage: 'Use in literature review to justify policy focus.',
          },
          {
            source: 'Campus Transport Strategy',
            method: 'Travel survey analysis',
            keyFindings: 'High potential for bike and shuttle mode shift.',
            limitations: 'Sample limited to one campus in 2021.',
            relevance: 'Guides methodology and data collection.',
            citationUsage: 'Reference when describing research design.',
          },
        ],
      },
    },
  });

  console.log('Seeded thesis record with id:', thesis.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
