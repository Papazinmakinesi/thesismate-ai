import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required.' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;

    // Fetch workspace context from database
    const thesis = await prisma.thesis.findFirst({
      include: {
        sources: true,
        comments: true,
      },
    });

    const apiKey = thesis?.apiKey || '';
    const activeModel = thesis?.apiModel || 'gpt-4o-mini';

    const title = thesis?.title || 'Sustainable Urban Mobility Planning';
    const topic = thesis?.topic || 'Green transport systems for campus communities';
    const aim = thesis?.aim || 'Evaluate policies, travel data, and modal shifts.';
    const sourceContext = thesis?.sources.map((s, idx) => 
      `[Source ${idx+1}] Title: ${s.title}, Author: ${s.author || 'N/A'}, Year: ${s.year || 'N/A'}, Summary: ${s.summary || 'N/A'}`
    ).join('\n') || 'No sources uploaded yet.';
    
    const commentContext = thesis?.comments.map((c, idx) =>
      `[Comment ${idx+1}] Chapter: ${c.chapter || 'Global'}, Priority: ${c.priority}, Content: "${c.content}", Status: ${c.status}`
    ).join('\n') || 'No supervisor comments.';

    // Construct highly structured system prompt (academic persona RAG)
    const systemPrompt = `You are ThesisMate AI, a professional academic co-pilot. Your tone is highly formal, constructive, and scholarly.
You are helping the student with their thesis titled: "${title}".
Topic area: "${topic}"
Aim of research: "${aim}"

Below is the verified RAG context from the student's personal bibliography library:
---
${sourceContext}
---

Here are outstanding supervisor feedback revision comments that need implementation:
---
${commentContext}
---

Rules of conduct:
1. Always reference the student's sources or supervisor comments when relevant to back up your structural advice or research gap insights.
2. Maintain academic formatting. Use bold text for key terms.
3. Be concise, actionable, and mathematically or methodologically rigorous.`;

    // Check if the user has configured an API key
    if (apiKey && apiKey.trim().length > 10) {
      let replyText = '';
      
      const isGemini = apiKey.startsWith('AIzaSy') || activeModel.toLowerCase().includes('gemini');

      if (isGemini) {
        // Query Gemini API
        const geminiModel = activeModel.includes('gemini') ? activeModel : 'gemini-1.5-flash';
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nUser Question:\n${lastMessage}` }]
                }
              ]
            })
          }
        );

        if (response.ok) {
          const resJson = await response.json();
          replyText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else {
          const errText = await response.text();
          console.error('Gemini Error:', errText);
          throw new Error('Gemini API query failed.');
        }
      } else {
        // Query OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: activeModel,
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.map(m => ({ role: m.role, content: m.content }))
            ],
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          replyText = resJson.choices?.[0]?.message?.content || '';
        } else {
          const errText = await response.text();
          console.error('OpenAI Error:', errText);
          throw new Error('OpenAI API query failed.');
        }
      }

      if (replyText) {
        return NextResponse.json({ role: 'assistant', content: replyText });
      }
    }

    // --- FALLBACK MOCK RAG LOGIC ---
    const lowerMessage = lastMessage.toLowerCase();
    let reply = '';

    if (lowerMessage.includes('source') || lowerMessage.includes('literature') || lowerMessage.includes('matrix')) {
      reply = `[SIMULATED RESPONSE - No API Key entered]\n\nRegarding your thesis, **"${title}"**, you currently have the following literature sources mapped in your manager:\n\n` +
        (thesis?.sources.map(s => `- *${s.title}* by ${s.author || 'Unknown'} (${s.year || 'N/A'}) - Chapter: **${s.chapter || 'Unassigned'}**`).join('\n') || '*No sources loaded.*') +
        `\n\n**Academic Recommendation:** To address your research topic (**${topic}**), you should synthesize these sources to highlight a clear theoretical framework. I recommend expanding on the contrast between quantitative travel surveys and qualitative policy integration models. Let me know if you would like me to draft a citation usage structure for any of these.`;
    } 
    else if (lowerMessage.includes('comment') || lowerMessage.includes('supervisor') || lowerMessage.includes('feedback')) {
      reply = `[SIMULATED RESPONSE - No API Key entered]\n\nYou have several pending supervisor comments. Here is an overview of what requires your immediate focus:\n\n` +
        (thesis?.comments.map(c => `- **${c.chapter || 'General'}** (${c.priority} priority): "${c.content}" [Status: ${c.status}]`).join('\n') || '*No outstanding feedback.*') +
        `\n\n**Actionable Advice:** Priority should be given to comments marked as **HIGH**. For example, the feedback on the **Introduction** section requires defining your research gap more clearly to ground the sustainable mobility questions. Would you like me to draft a revised problem statement addressing this?`;
    }
    else if (lowerMessage.includes('structure') || lowerMessage.includes('chapter') || lowerMessage.includes('outline')) {
      reply = `[SIMULATED RESPONSE - No API Key entered]\n\nBased on your thesis aim: *"${aim}"*, here is a highly professional chapter outline tailored to your project:\n\n` +
        `1. **Chapter 1: Introduction** - Establish campus mobility challenge, state research gap, and list your core research questions.\n` +
        `2. **Chapter 2: Literature Review** - Compare existing green transport models (referencing the mapped sources) and propose a conceptual framework.\n` +
        `3. **Chapter 3: Methodology** - Detail travel diaries, survey design, or modal shift calculations.\n` +
        `4. **Chapter 4: Results & Discussion** - Present the empirical modal shift findings and compare them against stakeholder policy levers.\n` +
        `5. **Chapter 5: Conclusion** - Policy recommendations for campus communities and future research paths.\n\n` +
        `Which section would you like to drill down into first?`;
    }
    else if (lowerMessage.includes('gap') || lowerMessage.includes('research gap') || lowerMessage.includes('contribution')) {
      reply = `[SIMULATED RESPONSE - No API Key entered]\n\nIdentifying the research gap is crucial for your study on **${topic}**.\n\n` +
        `Based on the literature in your database, a compelling **research gap** you can leverage is: *The lack of inclusive, campus-specific micro-mobility framework evaluations that balance policy incentives with actual stakeholder compliance in mid-sized university settings.*\n\n` +
        `To formulate this in your thesis, state that while national-level urban mobility models exist (e.g., Banister, 2020), their direct translation to semi-closed university ecosystem campuses remains heavily understudied. Does this gap align with the data you are collecting?`;
    }
    else {
      reply = `Hello! I am your **ThesisMate AI Academic Assistant**.\n\n` +
        `[SIMULATED RESPONSE - Configure your Gemini or OpenAI API Key in Settings to get real-time AI context checking!]\n\n` +
        `I am fully integrated with your current thesis workspace:\n` +
        `- **Thesis Title:** *${title}*\n` +
        `- **Research Aim:** *${aim}*\n` +
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
