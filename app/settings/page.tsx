'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Loader2, Sparkles, AlertCircle, Check, 
  HelpCircle, Trash2, Plus, FileText 
} from 'lucide-react';

export default function SettingsPage() {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [aim, setAim] = useState('');
  const [researchQuestions, setResearchQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/thesis');
      const data = await res.json();
      setTitle(data.title || '');
      setTopic(data.topic || '');
      setAim(data.aim || '');
      
      let rqs: string[] = [];
      if (data.researchQuestions) {
        try {
          rqs = typeof data.researchQuestions === 'string' 
            ? JSON.parse(data.researchQuestions) 
            : data.researchQuestions;
        } catch (e) {
          // Fallback if not JSON string
          rqs = [data.researchQuestions];
        }
      }
      setResearchQuestions(rqs);
    } catch (err) {
      setError('Failed to load thesis settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !topic.trim()) {
      setError('Thesis Title and Research Topic are required fields.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const res = await fetch('/api/thesis', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          topic,
          aim,
          researchQuestions,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update settings.');
      }

      setSuccess('Thesis configurations successfully saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update thesis metadata.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    setResearchQuestions([...researchQuestions, newQuestion.trim()]);
    setNewQuestion('');
  };

  const handleRemoveQuestion = (idx: number) => {
    setResearchQuestions(researchQuestions.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Settings</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Thesis Configurations & Metadata</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Configure the primary metadata details of your thesis research. These parameters dynamically customize the AI assistant co-pilot outputs, matrices alignment context, and dashboard indicators.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800 border border-rose-100">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 border border-emerald-100">
          <Check size={18} className="shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-20 flex flex-col items-center justify-center shadow-sm">
          <Loader2 className="animate-spin text-indigo-600 mb-3" size={32} />
          <p className="text-sm font-medium text-slate-600">Loading configurations...</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form Settings inputs */}
          <form onSubmit={handleSave} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Settings size={20} className="text-indigo-600" />
              Thesis Context Settings
            </h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Thesis Working Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Designing a Sustainable Urban Mobility Framework"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/20 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Research Topic *</label>
                <input
                  type="text"
                  placeholder="e.g. Green transport systems for campus communities"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/20 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Research Aim / Hypothesis</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Evaluate policies, data patterns, and stakeholder expectation shifts..."
                  value={aim}
                  onChange={(e) => setAim(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/20 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>

              {/* Research Questions list manager */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Thesis Research Questions</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. How can university micro-mobility incentives be optimized?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="flex-grow rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition shrink-0 active:scale-95"
                  >
                    Add Q
                  </button>
                </div>

                {researchQuestions.length === 0 ? (
                  <p className="text-xs text-slate-500 font-medium italic pl-1">No research questions logged yet.</p>
                ) : (
                  <div className="space-y-2 mt-2">
                    {researchQuestions.map((q, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <span className="text-xs font-semibold text-slate-800 pr-2">
                          <strong className="text-indigo-600 font-mono mr-1">RQ{idx+1}:</strong> {q}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(idx)}
                          className="text-slate-400 hover:text-rose-600 rounded-lg p-1.5 hover:bg-white transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Saving Metadata...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Configurations
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Right Side: Informative Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1 space-y-4">
            <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600" />
              Dynamic Integration info
            </h2>
            <div className="space-y-3 leading-relaxed text-xs text-slate-600 font-medium">
              <div className="flex gap-2">
                <span className="text-indigo-600 font-bold">&bull;</span>
                <p><strong>Dashboard sync:</strong> The title, topic, and aim are rendered as snapshot headers.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-600 font-bold">&bull;</span>
                <p><strong>AI Context injection:</strong> All active queries automatically reference these fields to keep LLM suggestions tightly anchored to your study constraints.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-600 font-bold">&bull;</span>
                <p><strong>Database model:</strong> SQLite database ensures fast updates and reliable schema synchronization.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
