'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ArrowRight, Loader2, Sparkles, RefreshCw, AlertCircle, 
  CheckCircle, FileText, BarChart2, BookOpen, UserCheck, UploadCloud, 
  Trash2, HelpCircle, AlertTriangle, Eye, ShieldAlert, Award, Printer, X 
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

interface ThesisDraft {
  id: string;
  fileName: string;
  fileSize: number;
  textLength: number;
  aiScore: number;
  passiveVoiceCount: number;
  longSentences: number;
  citationCount: number;
  unresolvedRefs: string;
  createdAt: string;
}

export default function ChapterCheckerPage() {
  const [activeTab, setActiveTab] = useState<'structure' | 'tone' | 'full'>('structure');

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

  // Tab 3: Full Thesis Audit State
  const [drafts, setDrafts] = useState<ThesisDraft[]>([]);
  const [activeDraft, setActiveDraft] = useState<ThesisDraft | null>(null);
  const [uploadingDraft, setUploadingDraft] = useState(false);
  const [draftFile, setDraftFile] = useState<File | null>(null);

  // Printing report state
  const [isPrintingAudit, setIsPrintingAudit] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (activeTab === 'full') {
      fetchDrafts();
    }
  }, [activeTab]);

  const fetchDrafts = async () => {
    try {
      const res = await fetch('/api/drafts');
      const data = await res.json();
      setDrafts(data);
      if (data.length > 0 && !activeDraft) {
        setActiveDraft(data[0]);
      }
    } catch (err) {
      setError('Failed to fetch thesis drafts.');
    }
  };

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

      const baseScore = Math.max(20, 100 - occurrences * 8);

      setToneReport({
        score: baseScore,
        highlights: highlights.slice(0, 15),
      });
      setAnalyzingTone(false);
    }, 800);
  };

  // Handle Tab 3 Full Draft Audit Upload
  const handleDraftUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftFile) return;

    try {
      setUploadingDraft(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('file', draftFile);

      const res = await fetch('/api/drafts/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload and audit the draft.');
      }

      const newDraft = await res.json();
      setDrafts([newDraft, ...drafts]);
      setActiveDraft(newDraft);
      setDraftFile(null);
      setSuccess('Thesis draft successfully uploaded and audited!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to upload and audit full thesis draft.');
    } finally {
      setUploadingDraft(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Academic Review Panel</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Thesis Quality & Structure Auditor</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Verify thesis drafts against structural criteria, check for colloquial wording, and upload full draft files to audit AI probability, cross-reference citations, and grammar density.
        </p>

        {/* Tab Toggle Navigation */}
        <div className="flex flex-wrap gap-4 mt-6 border-b border-slate-100 pb-px">
          <button
            onClick={() => setActiveTab('structure')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'structure' 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            Structure Checklist
          </button>
          <button
            onClick={() => setActiveTab('tone')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'tone' 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            Scholarly Tone Check
          </button>
          <button
            onClick={() => setActiveTab('full')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'full' 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            Full Thesis Audit (AI & Citations)
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800 border border-rose-100">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 border border-emerald-100">
          <CheckCircle size={18} className="shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* --- TAB 1: STRUCTURAL CHECKER --- */}
      {activeTab === 'structure' && (
        <div className="grid gap-6 lg:grid-cols-5">
          <form onSubmit={handleAnalyzeStructure} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText size={18} className="text-indigo-600" />
              Chapter Draft Sandbox
            </h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Paste Chapter Text</label>
              <textarea
                rows={12}
                placeholder="Paste the introduction or methodology chapter text here to audit..."
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
                    <h4 className="text-sm font-bold text-slate-950">Checklist Alignment</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-normal">
                      Percentage computed based on structural constraints and citation density.
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

      {/* --- TAB 2: SCHOLARLY TONE CHECKER --- */}
      {activeTab === 'tone' && (
        <div className="grid gap-6 lg:grid-cols-5">
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
                      Percentage computed based on occurrences of colloquial expressions.
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

      {/* --- TAB 3: FULL THESIS AUDIT --- */}
      {activeTab === 'full' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Dropzone & Upload History */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload form */}
            <form onSubmit={handleDraftUpload} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <UploadCloud size={16} className="text-indigo-600" />
                Upload Thesis Draft
              </h3>
              
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:bg-slate-50 transition cursor-pointer relative flex flex-col items-center justify-center text-center">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setDraftFile(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <BookOpen size={28} className="text-indigo-600 mb-2 animate-pulse" />
                <p className="text-xs font-bold text-slate-900 leading-snug">
                  {draftFile ? `Selected: ${draftFile.name}` : 'Drop complete thesis draft file here'}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">PDF, DOCX, TXT</p>
              </div>

              <button
                type="submit"
                disabled={uploadingDraft || !draftFile}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 text-white py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition disabled:opacity-40"
              >
                {uploadingDraft && <Loader2 className="animate-spin" size={14} />}
                Audit Uploaded Draft
              </button>
            </form>

            {/* Audit History List */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                Audit History
              </h3>
              {drafts.length === 0 ? (
                <p className="text-xs text-slate-400 italic font-medium py-4 text-center">No drafts uploaded yet.</p>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {drafts.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setActiveDraft(d)}
                      className={`w-full text-left rounded-xl border p-3.5 transition flex flex-col gap-1.5 ${
                        activeDraft?.id === d.id
                          ? 'border-indigo-600 bg-indigo-50/15'
                          : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {new Date(d.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">{d.fileName}</h4>
                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                        <span>{Math.round(d.fileSize / 1024)} KB</span>
                        <span className={`font-bold ${d.aiScore > 35 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          AI Score: {d.aiScore}%
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Columns: Analysis Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {activeDraft ? (
              <div className="space-y-6">
                {/* Dashboard Stats Banner */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6 select-text">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Audit Dashboard Report</p>
                      <h2 className="text-lg font-bold text-slate-950 mt-1 truncate max-w-md">{activeDraft.fileName}</h2>
                      <p className="text-[10px] font-semibold text-slate-500 mt-1">
                        Analyzed on {new Date(activeDraft.createdAt).toLocaleDateString('tr-TR')} &bull; Size: {Math.round(activeDraft.fileSize / 1024)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => setIsPrintingAudit(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 px-4 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition hover:bg-slate-50 active:scale-95 shrink-0"
                    >
                      <Printer size={14} />
                      Export PDF
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {/* Dial 1: AI Score */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-center space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Written Prob.</p>
                      <div className="relative flex items-center justify-center py-2">
                        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-base ${
                          activeDraft.aiScore > 50 
                            ? 'border-rose-500 text-rose-700 bg-rose-50/20' 
                            : activeDraft.aiScore > 20 
                            ? 'border-amber-500 text-amber-700 bg-amber-50/20' 
                            : 'border-emerald-500 text-emerald-700 bg-emerald-50/20'
                        }`}>
                          {activeDraft.aiScore}%
                        </div>
                      </div>
                      <p className="text-[10px] leading-relaxed font-semibold text-slate-600">
                        {activeDraft.aiScore > 50 
                          ? 'High probability of LLM generated phrases.' 
                          : activeDraft.aiScore > 20 
                          ? 'Moderate mix of formal constructs.' 
                          : 'Scholarly signature is highly human.'}
                      </p>
                    </div>

                    {/* Dial 2: Citations cross-checked */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-center space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Citations Cataloged</p>
                      <div className="relative flex items-center justify-center py-2">
                        <div className="w-16 h-16 rounded-full border-4 border-indigo-600 flex items-center justify-center font-bold text-base text-slate-900 bg-indigo-50/20">
                          {activeDraft.citationCount}
                        </div>
                      </div>
                      <p className="text-[10px] leading-relaxed font-semibold text-slate-600">
                        Identified and formatted bibliography items successfully.
                      </p>
                    </div>

                    {/* Dial 3: Grammar long sentences */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-center space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Style Warnings</p>
                      <div className="relative flex items-center justify-center py-2">
                        <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center font-bold text-base text-slate-900 bg-slate-50">
                          {activeDraft.longSentences + (activeDraft.passiveVoiceCount > 20 ? 1 : 0)}
                        </div>
                      </div>
                      <p className="text-[10px] leading-relaxed font-semibold text-slate-600">
                        Long sentences (&gt;30 words) or passive construction alerts.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub-panels for Bibliography Validation & Style audit */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Left panel: Cross Reference citations check */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-indigo-600" />
                      Bibliography Matcher
                    </h4>
                    
                    {activeDraft.unresolvedRefs.trim() === '' ? (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl flex gap-2.5 text-xs font-medium leading-relaxed">
                        <CheckCircle size={16} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Bibliography cross-reference clear!</p>
                          <p className="text-[10px] text-emerald-700 mt-0.5">All identified citations successfully match records cataloged in your Source Manager library.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-2xl flex gap-2.5 text-xs font-medium leading-relaxed">
                          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Missing bibliography entries</p>
                            <p className="text-[10px] text-amber-700 mt-0.5">The following references were cited in your text but do not exist in your catalog library:</p>
                          </div>
                        </div>
                        <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                          {activeDraft.unresolvedRefs.split(',').map((ref, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 flex items-center justify-between text-xs font-medium">
                              <span className="text-slate-800 italic pr-2">({ref.trim()})</span>
                              <span className="text-[9px] uppercase tracking-wider bg-rose-50 text-rose-700 rounded-full px-2 py-0.5 font-bold shrink-0">Unregistered</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right panel: Style Complexity report */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                      <Award size={16} className="text-indigo-600" />
                      Scholarly Readability Audit
                    </h4>
                    <div className="space-y-3 text-xs leading-relaxed font-medium">
                      <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>Long Sentences (&gt;30 words)</span>
                          <span className="text-slate-950">{activeDraft.longSentences} found</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          Sentences longer than 30 words impair comprehension. Break these down to improve flow.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>Passive Voice Density</span>
                          <span className="text-slate-950">{activeDraft.passiveVoiceCount} indicators</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          Overusing passive structures makes writing indirect. Try active verbs (e.g. "We calculated..." instead of "It was calculated...").
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-20 text-center shadow-sm">
                <ShieldCheck size={48} className="text-slate-200 mx-auto mb-4" />
                <h3 className="text-base font-bold text-slate-900">Upload or Select a Draft to Audit</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Drag and drop your full PDF or Word thesis draft on the left. The auditor will check its AI-written probability score, reference logs, and active style parameters.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- PRINT THESIS AUDIT MODAL OVERLAY --- */}
      {isPrintingAudit && activeDraft && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-text">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl relative border border-slate-200">
            {/* Control Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Printer size={18} className="text-indigo-600" />
                Academic Thesis Audit Report
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition active:scale-95 shadow-sm"
                >
                  <Printer size={14} />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setIsPrintingAudit(false)}
                  className="rounded-xl border border-slate-200 text-slate-500 hover:text-slate-950 p-2 bg-white transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Printable Content Block */}
            <div id="printable-area" className="p-8 md:p-12 overflow-y-auto flex-1 space-y-8 select-text text-slate-950 font-serif">
              {/* Report Header */}
              <div className="text-center space-y-2 border-b-2 border-slate-950 pb-6">
                <div className="flex items-center justify-center gap-1.5 text-xs font-sans font-bold uppercase tracking-widest text-slate-500">
                  <Award size={15} />
                  ThesisMate AI &bull; Verification Index
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
                  Comprehensive Academic Draft Audit Report
                </h1>
                <p className="text-xs font-medium font-sans text-slate-500">
                  Document analyzed: <strong className="text-indigo-600">{activeDraft.fileName}</strong> &bull; Date: {new Date(activeDraft.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Draft Info Grid */}
              <div className="grid grid-cols-4 gap-4 text-xs font-sans font-medium text-slate-600 border-b border-slate-100 pb-4">
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">File Size</p>
                  <p className="text-slate-800 mt-1">{Math.round(activeDraft.fileSize / 1024)} KB</p>
                </div>
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Word Count</p>
                  <p className="text-slate-800 mt-1">{activeDraft.textLength} words</p>
                </div>
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Citations</p>
                  <p className="text-slate-800 mt-1">{activeDraft.citationCount} found</p>
                </div>
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">AI Probability</p>
                  <p className={`mt-1 font-bold ${activeDraft.aiScore > 35 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {activeDraft.aiScore}% Score
                  </p>
                </div>
              </div>

              {/* Heuristics & Recommendations */}
              <div className="space-y-4">
                <h3 className="text-sm font-sans font-bold text-slate-900 uppercase tracking-wider border-b border-slate-900 pb-1.5">
                  1. AI Written Index & Guidance
                </h3>
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2 text-xs font-sans">
                  <p className="font-bold text-slate-900">
                    Detection Status: {activeDraft.aiScore > 50 ? 'Action Required' : activeDraft.aiScore > 20 ? 'Moderate Align' : 'Highly Human/Compliant'}
                  </p>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {activeDraft.aiScore > 50 
                      ? 'Recommendation: The text displays high transition density (excessive usage of "moreover", "therefore") and highly uniform sentence structural length variance, standard markers of ChatGPT generation. Revise and rewrite sections using diversified, active sentence structures.'
                      : activeDraft.aiScore > 20
                      ? 'Recommendation: Standard academic compliance matches. Ensure your empirical sections use active voice formulations to keep the vocabulary percentage natural.'
                      : 'Recommendation: Excellent work! The draft displays highly organic perplexity variance indices, which are robust indicators of manual academic writing.'
                    }
                  </p>
                </div>
              </div>

              {/* Bibliography Matches */}
              <div className="space-y-4">
                <h3 className="text-sm font-sans font-bold text-slate-900 uppercase tracking-wider border-b border-slate-900 pb-1.5">
                  2. Cross-Reference Citation Log
                </h3>
                {activeDraft.unresolvedRefs.trim() === '' ? (
                  <p className="text-xs font-sans text-emerald-800 bg-emerald-50/50 p-3 rounded-xl font-semibold">
                    ✓ All cited items in text are fully matching entries cataloged in your active bibliography source library.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-sans font-bold text-rose-700 bg-rose-50/50 p-3 rounded-xl">
                      ⚠ The following parenthetical citations were identified in the text but have NO matching entry in your Source Manager library:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                      {activeDraft.unresolvedRefs.split(',').map((ref, idx) => (
                        <div key={idx} className="border border-slate-100 p-2.5 rounded-xl bg-slate-50/55 italic font-medium">
                          ({ref.trim()}) - Missing Catalog Source Record
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Readability style log */}
              <div className="space-y-4">
                <h3 className="text-sm font-sans font-bold text-slate-900 uppercase tracking-wider border-b border-slate-900 pb-1.5">
                  3. Language Readability & Structural Style
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-1">
                    <p className="font-bold text-slate-900">Passive Voice: {activeDraft.passiveVoiceCount} instances</p>
                    <p className="text-slate-500 leading-normal text-[11px]">
                      High passive voice frequencies distance the author from assertions. Revise passive phrases into direct scholarly actions.
                    </p>
                  </div>
                  <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-1">
                    <p className="font-bold text-slate-900">Long Sentences: {activeDraft.longSentences} found</p>
                    <p className="text-slate-500 leading-normal text-[11px]">
                      Citing sentences exceeding 30 words reduces thesis clarity. Segment complex sentences to strengthen readability indexes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Signature Block */}
              <div className="pt-12 grid grid-cols-2 gap-8 text-xs font-sans font-bold text-slate-800 border-t border-slate-100">
                <div className="space-y-8">
                  <p className="uppercase tracking-widest text-[9px] text-slate-400">Student Researcher Sign-off</p>
                  <div className="border-b border-slate-300 w-44 mt-4 h-6"></div>
                  <p className="text-[11px] font-semibold text-slate-900 mt-1">Date Signature</p>
                </div>
                <div className="space-y-8">
                  <p className="uppercase tracking-widest text-[9px] text-slate-400">Academic Review Sign-off</p>
                  <div className="border-b border-slate-300 w-44 mt-4 h-6"></div>
                  <p className="text-[11px] font-semibold text-slate-900 mt-1">Reviewer Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
