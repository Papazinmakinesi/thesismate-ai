'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, ArrowRight, Loader2, Sparkles, RefreshCw, AlertCircle, 
  CheckCircle, FileText, BarChart2, BookOpen, UserCheck 
} from 'lucide-react';

const colloquialDict: Record<string, string> = {
  basically: 'fundamentally / essentially',
  actually: 'subsequently / in fact',
  very: 'substantially / significantly',
  think: 'hypothesize / postulate / assume',
  good: 'satisfactory / advantageous / optimal',
  bad: 'detrimental / suboptimal / deficient',
  thing: 'phenomenon / element / component',
  nice: 'suitable / appropriate',
  'a lot': 'substantially / significantly / extensively',
  get: 'obtain / acquire / secure',
  shows: 'illustrates / demonstrates / denotes',
  prove: 'validate / substantiate',
  hard: 'problematic / demanding',
  easy: 'facilitated / uncomplicated / feasible',
};

export default function ChapterCheckerPage() {
  const [activeTab, setActiveTab] = useState<'structure' | 'tone'>('structure');

  // Tab 1: Structural Checker State
  const [draft, setDraft] = useState('');
  const [analyzingStructure, setAnalyzingStructure] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [analysisReport, setAnalysisReport] = useState<any[] | null>(null);

  // Tab 2: Tone Analysis State
  const [toneText, setToneText] = useState('');
  const [analyzingTone, setAnalyzingTone] = useState(false);
  const [toneReport, setToneReport] = useState<{
    score: number;
    highlights: Array<{ original: string; replacement: string; idx: number }>;
  } | null>(null);

  const [error, setError] = useState('');

  // Handle Tab 1 Structure Check
  const handleAnalyzeStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;

    try {
      setAnalyzingStructure(true);
      setError('');
      
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft }),
      });
      const data = await res.json();
      
      setScore(data.score);
      setAnalysisReport(data.report);
    } catch (err) {
      setError('Analysis failed. Check local server connections.');
    } finally {
      setAnalyzingStructure(false);
    }
  };

  // Handle Tab 2 Tone Analysis
  const handleAnalyzeTone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toneText.trim()) return;

    setAnalyzingTone(true);
    setError('');

    setTimeout(() => {
      const lower = toneText.toLowerCase();
      const highlights: Array<{ original: string; replacement: string; idx: number }> = [];
      let occurrences = 0;

      // Scan words
      Object.keys(colloquialDict).forEach((word) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        let match;
        while ((match = regex.exec(lower)) !== null) {
          occurrences++;
          highlights.push({
            original: match[0],
            replacement: colloquialDict[word],
            idx: match.index,
          });
        }
      });

      // Calculate score
      const baseScore = Math.max(20, 100 - occurrences * 8);

      setToneReport({
        score: baseScore,
        highlights: highlights.slice(0, 15), // cap highlights for UI readability
      });
      setAnalyzingTone(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Chapter Structuring Suite</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Academic Review Panel</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Verify thesis drafts against structural citation parameters and scan paragraphs for colloquial vocabulary. Ensure your language complies with scholarly standards.
        </p>

        {/* Tab Toggle Navigation */}
        <div className="flex gap-4 mt-6 border-b border-slate-100 pb-px">
          <button
            onClick={() => setActiveTab('structure')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'structure' 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            Structure & Content Checklist
          </button>
          <button
            onClick={() => setActiveTab('tone')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'tone' 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            Scholarly Tone & Vocabulary Check
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800 border border-rose-100">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* --- TAB 1: STRUCTURAL CHECKER --- */}
      {activeTab === 'structure' && (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left Inputs */}
          <form onSubmit={handleAnalyzeStructure} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText size={18} className="text-indigo-600" />
              Chapter Draft Sandbox
            </h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Paste Chapter Text</label>
              <textarea
                rows={12}
                placeholder="Paste the introduction or methodology chapter text here..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/20 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 select-text leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={analyzingStructure || !draft.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50"
              >
                {analyzingStructure && <Loader2 className="animate-spin" size={16} />}
                Analyze Chapter
              </button>
            </div>
          </form>

          {/* Right Results Panel */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <BarChart2 size={18} className="text-indigo-600" />
              Evaluation Report
            </h3>

            {score !== null && analysisReport ? (
              <div className="space-y-6 select-text">
                <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="shrink-0 w-16 h-16 rounded-full border-4 border-indigo-600 flex items-center justify-center font-bold text-lg text-slate-900">
                    {score}%
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-950">Structural Checklist Alignment</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-normal">
                      Percentage computed based on key academic requirements, citation depth, and research constraints.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {analysisReport.map((rep, idx) => (
                    <div key={idx} className="flex gap-3 text-xs leading-relaxed font-medium">
                      {rep.passed ? (
                        <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-bold ${rep.passed ? 'text-slate-900' : 'text-slate-700'}`}>{rep.label}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5 leading-normal">{rep.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-slate-400">
                <ShieldCheck size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="text-xs font-bold text-slate-800">No Draft Analyzed</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto leading-normal">Paste your chapter content on the left to review metrics.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: SCHOLARLY TONE & VOCAB CHECKER --- */}
      {activeTab === 'tone' && (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left Inputs */}
          <form onSubmit={handleAnalyzeTone} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <UserCheck size={18} className="text-indigo-600" />
              Scholarly Vocabulary Sandbox
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Paste Text Paragraph</label>
              <textarea
                rows={12}
                placeholder="Paste academic text to scan for colloquial or informal words..."
                value={toneText}
                onChange={(e) => setToneText(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/20 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 select-text leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={analyzingTone || !toneText.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50"
              >
                {analyzingTone && <Loader2 className="animate-spin" size={16} />}
                Check Scholarly Tone
              </button>
            </div>
          </form>

          {/* Right Results Panel */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <BarChart2 size={18} className="text-indigo-600" />
              Tone Feedback Report
            </h3>

            {toneReport ? (
              <div className="space-y-6 select-text">
                <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="shrink-0 w-16 h-16 rounded-full border-4 border-indigo-600 flex items-center justify-center font-bold text-lg text-slate-900">
                    {toneReport.score}%
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-950">Academic Vocabulary Score</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-normal">
                      Percentage computed based on occurrences of colloquial expressions or informal descriptors.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-1.5 border-b border-slate-50">Colloquialisms Found</h4>
                  {toneReport.highlights.length === 0 ? (
                    <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
                      <CheckCircle size={16} />
                      Perfect academic phrasing! No colloquial words caught.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {toneReport.highlights.map((h, i) => (
                        <div key={i} className="bg-amber-50/55 border border-amber-100/50 p-3 rounded-xl flex items-start gap-2.5 text-xs font-medium">
                          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={15} />
                          <div className="leading-normal">
                            <p className="text-slate-800">
                              Informal usage detected: <strong className="text-rose-600 underline font-semibold">"{h.original}"</strong>
                            </p>
                            <p className="text-indigo-950 mt-1 font-semibold">
                              Academic substitute: <strong className="text-indigo-600 font-bold">{h.replacement}</strong>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-slate-400">
                <ShieldCheck size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="text-xs font-bold text-slate-800">No Paragraph Checked</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto leading-normal">Paste your writing sample on the left to verify scholarly tone.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
