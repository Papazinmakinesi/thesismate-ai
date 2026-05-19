'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, UploadCloud, BookOpen, Trash2, Edit3, Loader2, FileText, 
  Sparkles, Check, AlertCircle, Copy, Bookmark, MessageSquarePlus 
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

interface Source {
  id: string;
  title: string;
  author: string;
  year: number;
  sourceType: string;
  summary: string;
  keywords: string;
  chapter: string;
  extractedText: string;
  filePath: string;
}

interface Annotation {
  id: string;
  quote: string;
  note: string;
  createdAt: string;
}

export default function SourceManagerPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [activeSource, setActiveSource] = useState<Source | null>(null);
  
  // Annotations State
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newQuote, setNewQuote] = useState('');
  const [newNote, setNewNote] = useState('');
  const [loadingAnnotations, setLoadingAnnotations] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [sourceType, setSourceType] = useState('Journal Article');
  const [summary, setSummary] = useState('');
  const [keywords, setKeywords] = useState('');
  const [chapter, setChapter] = useState('Introduction');

  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Copy Citation Alerts
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSources();
  }, []);

  useEffect(() => {
    if (activeSource) {
      fetchAnnotations(activeSource.id);
    } else {
      setAnnotations([]);
    }
  }, [activeSource]);

  const fetchSources = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sources');
      const data = await res.json();
      setSources(data);
      if (data.length > 0) {
        setActiveSource(data[0]);
      }
    } catch (err) {
      setError('Failed to fetch bibliography sources.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnotations = async (sourceId: string) => {
    try {
      setLoadingAnnotations(true);
      const res = await fetch(`/api/sources/${sourceId}/annotations`);
      const data = await res.json();
      setAnnotations(data);
    } catch (err) {
      // Fail silently
    } finally {
      setLoadingAnnotations(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setAuthor('');
    setYear(new Date().getFullYear());
    setSourceType('Journal Article');
    setSummary('');
    setKeywords('');
    setChapter('Introduction');
    setFile(null);
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Auto fill title if empty
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Source title is required.');
      return;
    }

    try {
      setLoading(true);
      let finalSummary = summary;
      let finalExtractedText = '';

      // Upload file if exists
      if (file) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        
        const uploadRes = await fetch('/api/sources/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalSummary = uploadData.summary || finalSummary;
          finalExtractedText = uploadData.extractedText || '';
        }
      }

      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          author,
          year: Number(year),
          sourceType,
          summary: finalSummary,
          keywords,
          chapter,
          extractedText: finalExtractedText,
        }),
      });

      const newSource = await res.json();
      setSources([...sources, newSource]);
      setActiveSource(newSource);
      setIsAdding(false);
      handleReset();
      setSuccess('Source successfully cataloged!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to catalog source reference.');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this source reference?')) return;

    try {
      setLoading(true);
      await fetch(`/api/sources/${id}`, { method: 'DELETE' });
      const filtered = sources.filter(s => s.id !== id);
      setSources(filtered);
      if (activeSource?.id === id) {
        setActiveSource(filtered[0] || null);
      }
      setSuccess('Source citation deleted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete source reference.');
    } finally {
      setLoading(false);
    }
  };

  // Add Annotation Action
  const handleAddAnnotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSource || !newQuote.trim() || !newNote.trim()) return;

    try {
      setLoadingAnnotations(true);
      const res = await fetch(`/api/sources/${activeSource.id}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote: newQuote, note: newNote }),
      });
      const data = await res.json();
      setAnnotations([data, ...annotations]);
      setNewQuote('');
      setNewNote('');
    } catch (err) {
      setError('Failed to save excerpt annotation.');
    } finally {
      setLoadingAnnotations(false);
    }
  };

  // Delete Annotation Action
  const handleDeleteAnnotation = async (id: string) => {
    if (!activeSource) return;

    try {
      setLoadingAnnotations(true);
      await fetch(`/api/sources/${activeSource.id}/annotations?annotationId=${id}`, {
        method: 'DELETE',
      });
      setAnnotations(annotations.filter(a => a.id !== id));
    } catch (err) {
      setError('Failed to delete annotation.');
    } finally {
      setLoadingAnnotations(false);
    }
  };

  // Formatting Citations Engine
  const generateCitations = (s: Source) => {
    const lastName = s.author.split(' ').pop() || 'Unknown';
    const init = s.author.charAt(0) ? `${s.author.charAt(0)}.` : 'A.';
    const cleanAuthor = s.author || 'Anon';
    
    return {
      apa: `${cleanAuthor} (${s.year}). *${s.title}*. ${s.sourceType}.`,
      mla: `${lastName}, ${s.author.split(' ')[0] || ''}. "${s.title}." *${s.sourceType}*, ${s.year}.`,
      harvard: `${cleanAuthor}, ${s.year}. *${s.title}*. ${s.sourceType}.`,
      chicago: `${cleanAuthor}. ${s.year}. "${s.title}." *${s.sourceType}*.`,
      ieee: `[1] ${init} ${lastName}, "${s.title}," *${s.sourceType}*, pp. 1-10, ${s.year}.`,
    };
  };

  const copyToClipboard = (text: string, style: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStyle(style);
    setTimeout(() => setCopiedStyle(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Literature & Bibliography Manager</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Catalog Your Research Material</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Upload PDF or DOCX academic articles to extract clean summaries, format instant bibliographic citations (APA, MLA, Harvard, IEEE), and record context annotations on document excerpts.
            </p>
          </div>
          <div className="shrink-0">
            <button
              onClick={() => {
                setIsAdding(true);
                handleReset();
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition"
            >
              <Plus size={18} />
              Catalog Source
            </button>
          </div>
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
          <Check size={18} className="shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Add Source Modal Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Catalog New Reference Document</h2>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                handleReset();
              }}
              className="text-sm font-semibold text-slate-500 hover:text-slate-950"
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Document Title *</label>
              <input
                type="text"
                placeholder="e.g. Sustainable Urban Mobility and the Campus Ecosystem"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Primary Author(s)</label>
              <input
                type="text"
                placeholder="e.g. D. Banister"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Publication Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Reference Type</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500"
              >
                <option value="Journal Article">Journal Article</option>
                <option value="Book Chapter">Book Chapter</option>
                <option value="Conference Paper">Conference Paper</option>
                <option value="Thesis Draft">Thesis Draft</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assigned Chapter</label>
              <select
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500"
              >
                <option value="Introduction">Introduction</option>
                <option value="Literature Review">Literature Review</option>
                <option value="Methodology">Methodology</option>
                <option value="Results">Results & Discussion</option>
                <option value="Conclusion">Conclusion</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Keywords (comma-separated)</label>
              <input
                type="text"
                placeholder="micro-mobility, policy, emissions"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Reference Text Summary</label>
            <textarea
              rows={3}
              placeholder="Enter brief literature summary or let PDF extraction automatically summarize it..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* PDF file drop section */}
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:bg-slate-50 transition cursor-pointer relative flex flex-col items-center justify-center text-center">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <UploadCloud size={32} className="text-indigo-600 mb-2" />
            <p className="text-sm font-bold text-slate-900">
              {file ? `Selected file: ${file.name}` : 'Drop PDF or DOCX file to extract text summary'}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              Supports .pdf, .docx, .txt (up to 10MB)
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                handleReset();
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition"
            >
              {(loading || uploading) && <Loader2 className="animate-spin" size={16} />}
              {uploading ? 'Extracting Text...' : 'Save Catalog'}
            </button>
          </div>
        </form>
      )}

      {/* Main Workspace Layout */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Left 1 Col: Bibliography Library List */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-1 space-y-4">
          <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-600" />
            Bibliography Library
          </h2>

          {loading && sources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={24} />
              <p className="text-xs text-slate-500 font-semibold mt-2">Loading documents...</p>
            </div>
          ) : sources.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <BookOpen size={36} className="mx-auto text-slate-200 mb-2" />
              <p className="text-xs font-bold text-slate-800">Library is empty.</p>
              <p className="text-[10px] text-slate-500 mt-1">Catalog references to start analysis.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {sources.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSource(s)}
                  className={`w-full text-left rounded-2xl border p-4 transition group flex flex-col gap-2 ${
                    activeSource?.id === s.id 
                      ? 'border-indigo-600 bg-indigo-50/10 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{s.sourceType}</span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">{s.year || 'N/A'}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug line-clamp-2">
                    {s.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className="truncate max-w-[120px]">{s.author || 'Anonymous'}</span>
                    <span className="inline-flex rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-[10px] font-semibold">{s.chapter}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right 2 Cols: Active Inspector / Multi-Features Panel */}
        <div className="xl:col-span-2 space-y-6">
          {activeSource ? (
            <div className="space-y-6">
              {/* Excerpt Details Panel */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-5">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">{activeSource.sourceType} &bull; {activeSource.year}</span>
                    <h2 className="text-xl font-bold text-slate-950 mt-1 select-text leading-snug">
                      {activeSource.title}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500 mt-1.5">
                      by {activeSource.author || 'Anonymous'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(activeSource.id)}
                    className="rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-100 p-2.5 shadow-sm transition"
                    title="Delete Catalog Reference"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-2 select-text">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Extracted RAG Summary</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap bg-slate-50 border border-slate-100/50 p-4 rounded-2xl">
                    {activeSource.summary || 'No summary generated yet.'}
                  </p>
                </div>

                {activeSource.keywords && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeSource.keywords.split(',').map((kw, i) => (
                      <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full px-2.5 py-1 uppercase tracking-wide">
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Citation Generator Panel & Notepad Row */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left side: Citation Generator */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Sparkles size={18} className="text-indigo-600" />
                    Bibliography Citation Output
                  </h3>

                  {(() => {
                    const citations = generateCitations(activeSource);
                    return (
                      <div className="space-y-3">
                        {[
                          { label: 'APA (7th Edition)', text: citations.apa, key: 'apa' },
                          { label: 'MLA (9th Edition)', text: citations.mla, key: 'mla' },
                          { label: 'Harvard Style', text: citations.harvard, key: 'harvard' },
                          { label: 'Chicago Manual', text: citations.chicago, key: 'chicago' },
                          { label: 'IEEE Format', text: citations.ieee, key: 'ieee' },
                        ].map((c) => (
                          <div key={c.key} className="space-y-1.5 bg-slate-50/50 border border-slate-100/80 p-3.5 rounded-2xl group relative transition hover:bg-slate-50">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.label}</span>
                              <button
                                onClick={() => copyToClipboard(c.text, c.key)}
                                className="text-slate-400 hover:text-indigo-600 rounded-lg p-1 hover:bg-white transition"
                                title="Copy to Clipboard"
                              >
                                {copiedStyle === c.key ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                              </button>
                            </div>
                            <p className="text-xs font-serif text-slate-800 leading-normal select-all select-text font-medium pr-6">
                              {c.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Right side: Active Excerpt Annotations Notepad */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 flex flex-col">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100 shrink-0">
                    <Bookmark size={18} className="text-indigo-600" />
                    Excerpt Notepad Notes
                  </h3>

                  {/* Add Annotation Form */}
                  <form onSubmit={handleAddAnnotation} className="space-y-3 bg-indigo-50/20 border border-indigo-100/50 p-4 rounded-2xl shrink-0">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider">Highlighted Quote</label>
                      <input
                        type="text"
                        placeholder="e.g. 'Micro-mobility patterns showed a 12% peak...'"
                        value={newQuote}
                        onChange={(e) => setNewQuote(e.target.value)}
                        className="w-full rounded-xl border border-indigo-100 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider">Analytical Reflection / Note</label>
                      <input
                        type="text"
                        placeholder="Why is this important? Refute with study X..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="w-full rounded-xl border border-indigo-100 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loadingAnnotations || !newQuote.trim() || !newNote.trim()}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-2 text-xs font-bold uppercase tracking-wider active:scale-98 transition disabled:opacity-40"
                    >
                      <MessageSquarePlus size={14} />
                      Save Annotation
                    </button>
                  </form>

                  {/* Annotations List */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[220px] pr-1">
                    {loadingAnnotations && annotations.length === 0 ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="animate-spin text-indigo-600" size={16} />
                      </div>
                    ) : annotations.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-10 font-medium">No notes created on excerpts yet.</p>
                    ) : (
                      annotations.map((a) => (
                        <div key={a.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 flex justify-between gap-3 text-xs">
                          <div className="space-y-1 font-medium select-text">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Excerpt Quote:</p>
                            <blockquote className="border-l-2 border-indigo-600 pl-2 text-slate-600 italic">
                              "{a.quote}"
                            </blockquote>
                            <p className="text-[10px] font-bold text-indigo-950 uppercase tracking-wide mt-2">Annotation Reflection:</p>
                            <p className="text-slate-800 leading-normal">{a.note}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteAnnotation(a.id)}
                            className="text-slate-400 hover:text-rose-600 shrink-0 self-start p-1 hover:bg-white rounded-lg transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-20 text-center shadow-sm">
              <BookOpen size={48} className="text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-900">Select a Source to View Analysis</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Click on any bibliography document in the list on the left to see dynamic summaries, annotations, and generated citation styles.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
