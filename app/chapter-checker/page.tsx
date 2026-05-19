'use client';

import React, { useState } from 'react';
import { 
  CheckSquare, FileText, AlertTriangle, Lightbulb, Sparkles, Loader2, PlayCircle, ShieldAlert 
} from 'lucide-react';

export default function ChapterCheckerPage() {
  const [chapter, setChapter] = useState('Introduction');
  const [draft, setDraft] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    missingElements: string[];
    suggestions: string[];
  } | null>(null);
  
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) {
      setError('Please paste a chapter draft to evaluate.');
      return;
    }

    try {
      setAnalyzing(true);
      setError('');
      setResults(null);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapter, draft }),
      });

      if (!res.ok) {
        throw new Error('Analysis failed.');
      }

      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError('Error analyzing draft. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 border-emerald-200 bg-emerald-50';
    if (score >= 60) return 'text-amber-600 border-amber-200 bg-amber-50';
    return 'text-rose-600 border-rose-200 bg-rose-50';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 85) return 'Excellent Draft. Highly rigorous and structurally sound.';
    if (score >= 60) return 'Good draft. Structure is present, but needs academic refinement.';
    return 'Weak structure. Critical academic components are missing.';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Chapter Checker</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Review Drafts Against Academic Standards</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Paste your chapter drafts to analyze them against academic requirements. Identify missing sections, reference structures, and check a dynamic checklist score.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Side: Draft pasting interface */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 space-y-5">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText size={20} className="text-indigo-600" />
            Chapter Checker Workspace
          </h2>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-800 border border-rose-100">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Chapter Target</label>
              <select
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500"
              >
                <option>Introduction</option>
                <option>Literature Review</option>
                <option>Methodology</option>
                <option>Results</option>
                <option>Discussion</option>
                <option>Conclusion</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Paste Chapter Draft Content</label>
              <textarea
                rows={16}
                placeholder="Paste your draft text or excerpts here (Academic structure checks for key terms, references, and chapter specific criteria)..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none focus:border-indigo-500 font-sans leading-relaxed resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={analyzing}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Evaluating Academic Requirements...
                </>
              ) : (
                <>
                  <PlayCircle size={18} />
                  Evaluate Chapter Quality
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Analysis Results feedback panel */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles size={20} className="text-indigo-600" />
            Checklist Score & Insights
          </h2>

          {analyzing ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <Loader2 className="animate-spin text-indigo-600 mb-3" size={32} />
              <p className="text-sm font-semibold text-slate-900">Academic parsing model active...</p>
              <p className="mt-1 text-xs text-slate-500 max-w-[200px]">Measuring citations, syntax style, problem statements, and methodology details.</p>
            </div>
          ) : results ? (
            <div className="space-y-6">
              {/* Dynamic Score Ring */}
              <div className={`rounded-2xl border p-5 flex items-center gap-5 ${getScoreColor(results.score)}`}>
                <div className="relative shrink-0 flex items-center justify-center rounded-xl bg-white border border-slate-200/50 shadow-sm w-16 h-16 text-xl font-bold font-mono">
                  {results.score}%
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Draft Alignment Score</p>
                  <p className="text-sm font-semibold leading-relaxed">{getScoreDescription(results.score)}</p>
                </div>
              </div>

              {/* Missing Elements */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Missing Academic Elements
                </h3>
                <ul className="space-y-2">
                  {results.missingElements.map((elem, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-100">
                      <span className="text-rose-500 shrink-0 font-bold font-mono text-xs">&times;</span>
                      <span>{elem}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvement Suggestions */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Lightbulb size={14} className="text-indigo-500" />
                  Actionable Recommendations
                </h3>
                <ul className="space-y-2">
                  {results.suggestions.map((sug, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-indigo-50/30 px-3.5 py-2.5 rounded-xl border border-indigo-50/50">
                      <span className="text-indigo-600 shrink-0 font-semibold font-mono text-xs">&rarr;</span>
                      <span className="leading-relaxed">{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-36 text-center">
              <CheckSquare size={44} className="text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-900">Analysis Awaiting Input</p>
              <p className="mt-1 text-xs text-slate-500 max-w-[200px]">Paste your thesis draft in the worksheet and initiate checking to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
