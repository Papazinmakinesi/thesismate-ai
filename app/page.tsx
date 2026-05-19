'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Loader2, BookOpen, MessageSquare, Table, ShieldCheck, ChevronRight, Award, Compass, Clipboard 
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import AuthBanner from '@/components/AuthBanner';

interface Thesis {
  id: string;
  title: string;
  topic: string;
  aim: string;
  researchQuestions: string;
  sources: any[];
  comments: any[];
  matrices: any[];
}

export default function DashboardPage() {
  const [thesis, setThesis] = useState<Thesis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchThesisDetails();
  }, []);

  const fetchThesisDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/thesis');
      const data = await res.json();
      setThesis(data);
    } catch (err) {
      setError('Failed to fetch thesis database records.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600 mb-3" size={36} />
        <p className="text-sm font-semibold text-slate-600">Syncing workspace logs...</p>
      </div>
    );
  }

  // Parse questions
  let rQuestions: string[] = [];
  if (thesis?.researchQuestions) {
    try {
      rQuestions = typeof thesis.researchQuestions === 'string'
        ? JSON.parse(thesis.researchQuestions)
        : thesis.researchQuestions;
    } catch (e) {
      rQuestions = [];
    }
  }

  // Calculate metrics
  const sourcesCount = thesis?.sources?.length || 0;
  const activeCommentsCount = thesis?.comments?.filter(c => c.status !== 'DONE').length || 0;
  const matrixCount = thesis?.matrices?.length || 0;

  // Recent comments
  const activeComments = thesis?.comments?.filter(c => c.status !== 'DONE').slice(0, 2) || [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Thesis Workspace Dashboard</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 leading-tight">Welcome to ThesisMate AI</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Your professional academic assistant. Track supervisor revisions, align literature matrix grids, test chapter structures, and get contextual research gap feedback.
            </p>
          </div>
          <div className="rounded-2xl bg-indigo-50 border border-indigo-100/50 px-5 py-4 text-slate-800 shadow-sm shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-800">Workspace status</p>
            <p className="mt-1.5 text-sm font-bold flex items-center gap-1.5 text-indigo-950">
              <Award size={16} />
              Active Literature Mapping
            </p>
          </div>
        </div>
      </header>

      <AuthBanner />

      {/* Main Metric Cards */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-indigo-600">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Bibliography Library</p>
            <BookOpen size={16} />
          </div>
          <p className="text-2xl font-bold text-slate-950">{sourcesCount} Source{sourcesCount !== 1 ? 's' : ''}</p>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">Journals, books, and thesis documents mapped.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-rose-600">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Supervisor Feedback</p>
            <MessageSquare size={16} />
          </div>
          <p className="text-2xl font-bold text-slate-950">{activeCommentsCount} Open Item{activeCommentsCount !== 1 ? 's' : ''}</p>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">Pending review or rewrite tasks.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-emerald-600">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Literature Matrix</p>
            <Table size={16} />
          </div>
          <p className="text-2xl font-bold text-slate-950">{matrixCount} Grid Row{matrixCount !== 1 ? 's' : ''}</p>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">Synthesized literature rows analyzed.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-600">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Chapter Progression</p>
            <ShieldCheck size={16} />
          </div>
          <p className="text-2xl font-bold text-slate-950">Active</p>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">Checking structure parameters continuously.</p>
        </div>
      </section>

      {/* Thesis Snapshot & Supervisor Pulse Grid */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Snapshot */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Compass size={20} className="text-indigo-600" />
              Thesis Snapshot
            </h2>
            <Link 
              href="/settings"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider flex items-center gap-0.5"
            >
              Configure settings <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="grid sm:grid-cols-4 gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Working Title</p>
              <p className="text-sm font-bold text-slate-950 sm:col-span-3 leading-relaxed">
                {thesis?.title || 'Designing a Sustainable Urban Mobility Framework'}
              </p>
            </div>

            <div className="grid sm:grid-cols-4 gap-2 border-t border-slate-50 pt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Research Topic</p>
              <p className="text-sm font-semibold text-slate-700 sm:col-span-3 leading-relaxed">
                {thesis?.topic || 'Green transport systems for campus communities'}
              </p>
            </div>

            <div className="grid sm:grid-cols-4 gap-2 border-t border-slate-50 pt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Objectives</p>
              <p className="text-sm font-medium text-slate-600 sm:col-span-3 leading-relaxed">
                {thesis?.aim || 'Evaluate policies, data, and stakeholder expectations to support sustainable mobility.'}
              </p>
            </div>

            {rQuestions.length > 0 && (
              <div className="grid sm:grid-cols-4 gap-2 border-t border-slate-50 pt-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Research Questions</p>
                <div className="text-sm font-semibold text-slate-800 sm:col-span-3 space-y-2">
                  {rQuestions.map((q, idx) => (
                    <p key={idx} className="flex gap-2">
                      <span className="text-indigo-600 font-bold font-mono">RQ{idx+1}:</span>
                      <span>{q}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Supervisor Pulse */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 lg:col-span-1">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clipboard size={20} className="text-rose-600" />
              Supervisor Revisions
            </h2>
            <Link 
              href="/supervisor-comments"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {activeComments.length > 0 ? (
              activeComments.map((c) => (
                <div key={c.id} className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-wide">{c.chapter}</span>
                    <StatusBadge status={c.priority === 'HIGH' ? 'High' : c.priority === 'MEDIUM' ? 'Medium' : 'Low'} />
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 font-semibold">{c.content}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                <ShieldCheck size={28} className="mb-2 text-emerald-600" />
                <p className="text-xs font-bold text-slate-800">All revisions resolved!</p>
                <p className="text-[10px] text-slate-500 mt-0.5">No active supervisor comments logged.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pages Quick Links */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Link 
          href="/chapter-checker"
          className="rounded-2xl border border-slate-100 bg-slate-50 hover:bg-indigo-50/30 hover:border-indigo-100 p-5 shadow-sm space-y-2 transition group"
        >
          <div className="flex items-center justify-between text-slate-900">
            <p className="text-sm font-bold">Chapter Structuring Analysis</p>
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">Verify your drafts against academic requirements and citation counts.</p>
        </Link>

        <Link 
          href="/literature-matrix"
          className="rounded-2xl border border-slate-100 bg-slate-50 hover:bg-indigo-50/30 hover:border-indigo-100 p-5 shadow-sm space-y-2 transition group"
        >
          <div className="flex items-center justify-between text-slate-900">
            <p className="text-sm font-bold">Literature Matrix mapping</p>
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">Map methodologies, limitation gaps, and citation usage directly.</p>
        </Link>

        <Link 
          href="/ai-assistant"
          className="rounded-2xl border border-slate-100 bg-slate-50 hover:bg-indigo-50/30 hover:border-indigo-100 p-5 shadow-sm space-y-2 transition group"
        >
          <div className="flex items-center justify-between text-slate-900">
            <p className="text-sm font-bold">Research Assistant Co-Pilot</p>
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">Chat directly with an AI assistant contextualized on your library documents.</p>
        </Link>
      </section>
    </div>
  );
}
