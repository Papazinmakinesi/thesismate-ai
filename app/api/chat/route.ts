import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required.' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content.toLowerCase();

    // Fetch context from database
    const thesis = await prisma.thesis.findFirst({
      include: {
        sources: true,
        comments: true,
      },
    });

    const title = thesis?.title || 'Sustainable Mobility Framework';
    const topic = thesis?.topic || 'Green campus transport';
    const sourceTitles = thesis?.sources.map(s => s.title).join(', ') || 'No sources uploaded yet';
    const commentsList = thesis?.comments.map(c => `[${c.chapter}] ${c.content}`).join('\n') || 'No supervisor comments';

    let reply = '';

    // Generate responsive context-aware answers
    if (lastMessage.includes('source') || lastMessage.includes('literature') || lastMessage.includes('matrix')) {
      reply = `Regarding your thesis, **"${title}"**, you currently have the following literature sources mapped in your manager:\n\n` +
        (thesis?.sources.map(s => `- *${s.title}* by ${s.author || 'Unknown'} (${s.year || 'N/A'}) - Chapter: **${s.chapter || 'Unassigned'}**`).join('\n') || '*No sources loaded.*') +
        `\n\n**Academic Recommendation:** To address your research topic (**${topic}**), you should synthesize these sources to highlight a clear theoretical framework. I recommend expanding on the contrast between quantitative travel surveys and qualitative policy integration models. Let me know if you would like me to draft a citation usage structure for any of these.`;
    } 
    else if (lastMessage.includes('comment') || lastMessage.includes('supervisor') || lastMessage.includes('feedback')) {
      reply = `You have several pending supervisor comments. Here is an overview of what requires your immediate focus:\n\n` +
        (thesis?.comments.map(c => `- **${c.chapter || 'General'}** (${c.priority} priority): "${c.content}" [Status: ${c.status}]`).join('\n') || '*No outstanding feedback.*') +
        `\n\n**Actionable Advice:** Priority should be given to comments marked as **HIGH**. For example, the feedback on the **Introduction** section requires defining your research gap more clearly to ground the sustainable mobility questions. Would you like me to draft a revised problem statement addressing this?`;
    }
    else if (lastMessage.includes('structure') || lastMessage.includes('chapter') || lastMessage.includes('outline')) {
      reply = `Based on your thesis aim: *"${thesis?.aim || 'Evaluate policy and modal shift.'}"*, here is a highly professional chapter outline tailored to your project:\n\n` +
        `1. **Chapter 1: Introduction** - Establish campus mobility challenge, state research gap, and list your core research questions.\n` +
        `2. **Chapter 2: Literature Review** - Compare existing green transport models (referencing *${sourceTitles}*) and propose a conceptual framework.\n` +
        `3. **Chapter 3: Methodology** - Detial travel diaries, survey design, or modal shift calculations.\n` +
        `4. **Chapter 4: Results & Discussion** - Present the empirical modal shift findings and compare them against stakeholder policy levers.\n` +
        `5. **Chapter 5: Conclusion** - Policy recommendations for campus communities and future research paths.\n\n` +
        `Which section would you like to drill down into first?`;
    }
    else if (lastMessage.includes('gap') || lastMessage.includes('research gap') || lastMessage.includes('contribution')) {
      reply = `Identifying the research gap is crucial for your study on **${topic}**.\n\n` +
        `Based on the literature in your dashboard (including *${sourceTitles}*), a compelling **research gap** you can leverage is: *The lack of inclusive, campus-specific micro-mobility framework evaluations that balance policy incentives with actual stakeholder compliance in mid-sized university settings.*\n\n` +
        `To formulate this in your thesis, state that while national-level urban mobility models exist (e.g., Banister, 2020), their direct translation to semi-closed university ecosystem campuses remains heavily understudied. Does this gap align with the data you are collecting?`;
    }
    else {
      // Default academic assistant reply
      reply = `Hello! I am your **ThesisMate AI Academic Assistant**.\n\n` +
        `I am fully integrated with your current thesis workspace:\n` +
        `- **Thesis Title:** *${title}*\n` +
        `- **Research Aim:** *${thesis?.aim}*\n` +
        `- **Current Sources:** ${thesis?.sources.length || 0} entries loaded\n` +
        `- **Supervisor Comments:** ${thesis?.comments.filter(c => c.status !== 'DONE').length || 0} active comments\n\n` +
        `How can I assist you today? You can ask me to:\n` +
        `- **"Analyze my research gap"**\n` +
        `- **"Summarize my literature sources"**\n` +
        `- **"Propose a structured chapter outline"**\n` +
        `- **"Synthesize my supervisor comments into action items"**`;
    }

    return NextResponse.json({ role: 'assistant', content: reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
