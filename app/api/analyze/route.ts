import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { chapter, draft } = await request.json();

    if (!chapter || !draft) {
      return NextResponse.json({ error: 'Chapter selection and draft content are required.' }, { status: 400 });
    }

    const textLength = draft.trim().length;
    if (textLength < 100) {
      return NextResponse.json({
        score: 20,
        missingElements: ['The draft is extremely short. Please add more details.'],
        suggestions: ['Expand the chapter with proper structured sections.', 'Include references and citations.'],
      });
    }

    // Determine requirements and check them dynamically
    const missingElements: string[] = [];
    const suggestions: string[] = [];
    let score = 95;

    const lowerDraft = draft.toLowerCase();

    // Generic checks
    if (!lowerDraft.includes('cite') && !lowerDraft.includes(' et al') && !/\(\d{4}\)/.test(draft)) {
      missingElements.push('Academic citations (e.g., in-text citations or author-date)');
      suggestions.push('Integrate direct and indirect academic references to ground your arguments.');
      score -= 20;
    }

    if (textLength < 1500) {
      suggestions.push('The chapter draft seems brief (under 300 words). Aim for a more thorough investigation.');
      score -= 10;
    }

    if (chapter === 'Introduction') {
      if (!lowerDraft.includes('problem') && !lowerDraft.includes('issue')) {
        missingElements.push('Explicit problem statement');
        suggestions.push('Clearly define the research problem or gap you aim to address.');
        score -= 15;
      }
      if (!lowerDraft.includes('object') && !lowerDraft.includes('aim') && !lowerDraft.includes('goal')) {
        missingElements.push('Research objectives or aims');
        suggestions.push('List the specific research objectives/questions at the end of the introduction.');
        score -= 15;
      }
      if (!lowerDraft.includes('outline') && !lowerDraft.includes('structure')) {
        missingElements.push('Thesis outline or chapter roadmap');
        suggestions.push('Provide a short overview of how the rest of the thesis is organized.');
        score -= 10;
      }
    } else if (chapter === 'Literature Review') {
      if (!lowerDraft.includes('gap') && !lowerDraft.includes('hitherto') && !lowerDraft.includes('contrast')) {
        missingElements.push('Synthesis and research gap identification');
        suggestions.push('Focus on synthesizing sources rather than just summarizing them; point out where research gaps remain.');
        score -= 20;
      }
      if (!lowerDraft.includes('theory') && !lowerDraft.includes('framework')) {
        missingElements.push('Theoretical or conceptual framework');
        suggestions.push('Establish a clear conceptual structure or theory guiding your study.');
        score -= 15;
      }
    } else if (chapter === 'Methodology') {
      if (!lowerDraft.includes('sample') && !lowerDraft.includes('participants') && !lowerDraft.includes('data')) {
        missingElements.push('Detailed data collection procedure');
        suggestions.push('Describe the exact population, sample size, or data points collected.');
        score -= 15;
      }
      if (!lowerDraft.includes('limit') && !lowerDraft.includes('bias') && !lowerDraft.includes('valid')) {
        missingElements.push('Methodological limitations or validity considerations');
        suggestions.push('Address issues of validity, reliability, or research ethics.');
        score -= 15;
      }
      if (!lowerDraft.includes('approach') && !lowerDraft.includes('design') && !lowerDraft.includes('qualitative') && !lowerDraft.includes('quantitative')) {
        missingElements.push('Methodological paradigm specification');
        suggestions.push('Explicitly state whether your study is qualitative, quantitative, or mixed-methods.');
        score -= 10;
      }
    } else if (chapter === 'Results') {
      if (!lowerDraft.includes('table') && !lowerDraft.includes('figure') && !lowerDraft.includes('data')) {
        missingElements.push('Data visualization references (tables/figures)');
        suggestions.push('Present complex numerical or categorical data in organized tables or figures.');
        score -= 15;
      }
      if (lowerDraft.includes('because') || lowerDraft.includes('think') || lowerDraft.includes('agree')) {
        suggestions.push('Keep the Results section purely descriptive and objective. Save interpretations for the Discussion.');
        score -= 10;
      }
    } else if (chapter === 'Discussion') {
      if (!lowerDraft.includes('limit') && !lowerDraft.includes('weakness')) {
        missingElements.push('Reflective analysis of study limitations');
        suggestions.push('Frankly discuss any methodological limitations or unexpected biases in your findings.');
        score -= 15;
      }
      if (!lowerDraft.includes('future') && !lowerDraft.includes('recommend')) {
        missingElements.push('Recommendations for future research');
        suggestions.push('Conclude with concrete areas where other researchers can expand on your findings.');
        score -= 15;
      }
    } else if (chapter === 'Conclusion') {
      if (lowerDraft.includes('et al') || lowerDraft.includes('cite') || /\(\d{4}\)/.test(draft)) {
        suggestions.push('Avoid introducing new literature or detailed citations in the Conclusion. Synthesize your own outcomes instead.');
        score -= 10;
      }
    }

    score = Math.max(10, Math.min(100, score));

    return NextResponse.json({
      score,
      missingElements: missingElements.length > 0 ? missingElements : ['None! Great work.'],
      suggestions: suggestions.length > 0 ? suggestions : ['Your draft meets all fundamental academic checklist criteria.'],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
