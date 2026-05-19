import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    let thesis = await prisma.thesis.findFirst();
    if (!thesis) {
      thesis = await prisma.thesis.create({
        data: {
          title: 'Designing a Sustainable Urban Mobility Framework',
          topic: 'Green transport systems for campus communities',
          aim: 'Evaluate policies, data, and stakeholder expectations.',
          researchQuestions: JSON.stringify([]),
        },
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = '';

    // Parse according to type
    if (file.name.endsWith('.pdf')) {
      const parsed = await pdfParse(buffer);
      extractedText = parsed.text;
    } else if (file.name.endsWith('.docx')) {
      const parsed = await mammoth.extractRawText({ buffer });
      extractedText = parsed.value;
    } else {
      extractedText = buffer.toString('utf-8');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ error: 'Failed to extract text from thesis draft.' }, { status: 422 });
    }

    // Fetch cataloged sources for RAG Cross-Reference Checker
    const sources = await prisma.source.findMany({
      where: { thesisId: thesis.id },
    });

    // --- 1. AI PROBABILITY SCORE HEURISTICS ---
    // Evaluates sentence structures, length variance, and formal repetitive transitions
    const words = extractedText.split(/\s+/);
    const textLength = words.length;

    // AI indicators (transition overload, lack of variance, repetitive keywords)
    const transitionWords = ['moreover', 'therefore', 'furthermore', 'consequently', 'crucial', 'essential', 'interestingly', 'notably'];
    let transitionCount = 0;
    transitionWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = extractedText.match(regex);
      if (matches) transitionCount += matches.length;
    });

    const transitionDensity = textLength > 0 ? (transitionCount / textLength) * 100 : 0;
    // Heuristic AI written probability computation
    // LLMs tend to use a lot of transitions and have very uniform sentence lengths
    let computedAiScore = 15; // default base probability
    if (transitionDensity > 2.5) computedAiScore += 18;
    else if (transitionDensity > 1.5) computedAiScore += 8;

    // Deduct/add based on overall document length variance proxies
    const sentences = extractedText.split(/[.!?]+/);
    let longSentences = 0;
    let passiveVoiceCount = 0;

    // --- 2. LANGUAGE AUDIT ---
    // Scan for passive voice patterns
    const passiveVoiceRegex = /\b(is|are|was|were|be|been|being)\s+([a-z]+ed|written|seen|done|analyzed|studied|observed|evaluated|calculated|measured)\b/gi;
    const passiveMatches = extractedText.match(passiveVoiceRegex);
    if (passiveMatches) {
      passiveVoiceCount = passiveMatches.length;
    }

    sentences.forEach((s) => {
      const sentenceWords = s.trim().split(/\s+/);
      if (sentenceWords.length > 30) {
        longSentences++;
      }
    });

    // Adjust score based on passive density
    if (passiveVoiceCount > 20) computedAiScore += 12;
    // clamp AI score
    computedAiScore = Math.min(98, Math.max(8, computedAiScore));

    // --- 3. CROSS-REFERENCE CITATION CHECKER ---
    // Regex matching standard academic citations, e.g., (Banister, 2020) or (Smith et al., 2018)
    const citationRegex = /\(([A-Za-z\s]+(et\s*al\.)?),\s*(\d{4})\)/g;
    const ieeeRegex = /\[(\d+)\]/g;

    const citationMatches: Array<{ author: string; year: number; fullText: string }> = [];
    let match;

    while ((match = citationRegex.exec(extractedText)) !== null) {
      const rawAuthor = match[1].replace(/et\s*al\./gi, '').trim();
      const year = parseInt(match[3]);
      citationMatches.push({
        author: rawAuthor,
        year,
        fullText: match[0],
      });
    }

    // Clean matches and cross reference against cataloged sources
    const missingReferences: string[] = [];
    let resolvedCitations = 0;

    citationMatches.forEach((cit) => {
      // Look for a cataloged source where author includes citation author and year matches
      const isFound = sources.some((s) => {
        const dbAuthor = s.author.toLowerCase();
        const citAuthor = cit.author.toLowerCase();
        return (dbAuthor.includes(citAuthor) || citAuthor.includes(dbAuthor)) && s.year === cit.year;
      });

      if (isFound) {
        resolvedCitations++;
      } else {
        const format = `${cit.author}, ${cit.year}`;
        if (!missingReferences.includes(format)) {
          missingReferences.push(format);
        }
      }
    });

    // --- 4. PERSIST TO DATABASE ---
    const draftRecord = await prisma.thesisDraft.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        textLength,
        aiScore: computedAiScore,
        passiveVoiceCount,
        longSentences,
        citationCount: citationMatches.length,
        unresolvedRefs: missingReferences.join(', '),
        thesisId: thesis.id,
      },
    });

    return NextResponse.json(draftRecord);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
