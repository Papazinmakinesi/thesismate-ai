'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Upload, FileText, Trash2, Edit3, Loader2, Sparkles, BookOpen, AlertCircle, Check 
} from 'lucide-react';

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
}

export default function SourceManagerPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [sourceType, setSourceType] = useState('Journal Article');
  const [summary, setSummary] = useState('');
  const [keywords, setKeywords] = useState('');
  const [chapter, setChapter] = useState('Literature Review');
  const [extractedText, setExtractedText] = useState('');
  
  // Upload status
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected source detail view
  const [activeSource, setActiveSource] = useState<Source | null>(null);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sources');
      const data = await res.json();
      setSources(data);
      if (data.length > 0 && !activeSource) {
        setActiveSource(data[0]);
      }
    } catch (err) {
      setError('Failed to load sources.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setAuthor('');
    setYear(new Date().getFullYear());
    setSourceType('Journal Article');
    setSummary('');
    setKeywords('');
    setChapter('Literature Review');
    setExtractedText('');
    setError('');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author, year, sourceType, summary, keywords, chapter, extractedText }),
      });
      const newSource = await res.json();
      setSources([newSource, ...sources]);
      setActiveSource(newSource);
      setIsAdding(false);
      handleReset();
      setSuccess('Source successfully added!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add source.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/sources/${isEditing}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author, year, sourceType, summary, keywords, chapter, extractedText }),
      });
      const updatedSource = await res.json();
      setSources(sources.map(s => s.id === isEditing ? updatedSource : s));
      setActiveSource(updatedSource);
      setIsEditing(null);
      handleReset();
      setSuccess('Source successfully updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update source.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (source: Source) => {
    setIsEditing(source.id);
    setIsAdding(false);
    setTitle(source.title);
    setAuthor(source.author || '');
    setYear(source.year || new Date().getFullYear());
    setSourceType(source.sourceType || 'Journal Article');
    setSummary(source.summary || '');
    setKeywords(source.keywords || '');
    setChapter(source.chapter || 'Literature Review');
    setExtractedText(source.extractedText || '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this source? This action is permanent.')) return;

    try {
      setLoading(true);
      await fetch(`/api/sources/${id}`, { method: 'DELETE' });
      const filtered = sources.filter(s => s.id !== id);
      setSources(filtered);
      if (activeSource?.id === id) {
        setActiveSource(filtered.length > 0 ? filtered[0] : null);
      }
      setSuccess('Source successfully deleted!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete source.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setError('');
      const res = await fetch('/api/sources/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to extract file text.');
      }

      const data = await res.json();
      setTitle(data.title || file.name);
      setExtractedText(data.extractedText || '');
      setSummary(data.summary || '');
      setYear(data.year || new Date().getFullYear());
      setSuccess('Text successfully extracted!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error parsing file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Source Manager</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Manage Your Thesis Sources</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Manually add references or upload academic publications (PDF, DOCX, TXT) to automatically extract text, keywords, and generate summaries.
            </p>
          </div>
          <button
            onClick={() => {
              setIsAdding(true);
              setIsEditing(null);
              handleReset();
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
          >
            <Plus size={18} />
            Add Reference
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
          <Check size={18} className="shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Add / Edit Form Panel */}
      {(isAdding || isEditing) && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">
              {isAdding ? 'Add New Reference' : 'Edit Reference Detail'}
            </h2>
            <button
              onClick={() => {
                setIsAdding(false);
                setIsEditing(null);
                handleReset();
              }}
              className="text-sm font-semibold text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>

          {/* PDF / DOCX Upload Area */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-900">
                Upload Publication (PDF, DOCX, or TXT)
              </label>
              <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center transition hover:border-indigo-400">
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                    <p className="text-sm font-medium text-slate-600">Extracting text & formatting metadata...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="text-slate-400 mb-3" size={32} />
                    <p className="text-sm font-medium text-slate-700">Drag files here or click to browse</p>
                    <p className="mt-1 text-xs text-slate-500 font-normal">PDF, DOCX, or TXT (Max 15MB)</p>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileUpload}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </>
                )}
              </div>
            </div>

            <form onSubmit={isAdding ? handleAddSubmit : handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Source Type</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500"
                  >
                    <option>Journal Article</option>
                    <option>Book</option>
                    <option>Conference Paper</option>
                    <option>Thesis / Dissertation</option>
                    <option>Web Resource</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Publication Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Sustainable Mobility Framework"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Author(s)</label>
                  <input
                    type="text"
                    placeholder="e.g. D. Banister"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Chapter</label>
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
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Keywords (comma-separated)</label>
                <input
                  type="text"
                  placeholder="sustainability, mobility, urban planning"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Executive Summary / Abstract</label>
                <textarea
                  rows={3}
                  placeholder="Provide a brief summary of the paper's key findings or goals..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Extracted Full-Text / Draft Notes</label>
                <textarea
                  rows={4}
                  placeholder="Paste manual excerpt text or let automated file upload extract it for you..."
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 resize-none font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setIsEditing(null);
                    handleReset();
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition"
                >
                  {loading && <Loader2 className="animate-spin" size={16} />}
                  {isAdding ? 'Add Source' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Workspace Explorer Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Sources list */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 lg:col-span-1">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <BookOpen size={20} className="text-indigo-600" />
            Sources Bibliography ({sources.length})
          </h2>

          {loading && sources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-indigo-600 mb-3" size={24} />
              <p className="text-sm font-medium text-slate-600">Loading your literature library...</p>
            </div>
          ) : sources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen size={36} className="text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-900">Your library is empty</p>
              <p className="mt-1 text-xs text-slate-500 max-w-[200px]">Upload papers or add them manually to begin mapping.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {sources.map((source) => (
                <div
                  key={source.id}
                  onClick={() => setActiveSource(source)}
                  className={`w-full rounded-2xl p-4 text-left cursor-pointer border transition ${
                    activeSource?.id === source.id
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 tracking-wide uppercase">
                      {source.sourceType}
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-700 font-mono">
                      {source.chapter}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-slate-900 line-clamp-1">
                    {source.title}
                  </h3>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>{source.author || 'Anonymous'} ({source.year || 'N/A'})</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(source);
                        }}
                        className="rounded-lg p-1 text-slate-500 hover:bg-white hover:text-indigo-600 transition"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(source.id);
                        }}
                        className="rounded-lg p-1 text-slate-500 hover:bg-white hover:text-rose-600 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column - Deep Details inspector */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-6">
          {activeSource ? (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-5">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-bold text-indigo-800 tracking-wide uppercase">
                    <Sparkles size={12} />
                    {activeSource.sourceType}
                  </span>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                    {activeSource.title}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-slate-600">
                    By {activeSource.author || 'Anonymous'} &bull; Published: {activeSource.year || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700">
                    Chapter: {activeSource.chapter}
                  </span>
                </div>
              </div>

              {activeSource.keywords && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Document Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSource.keywords.split(',').map((kw, i) => (
                      <span key={i} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Executive Summary</h3>
                <div className="rounded-2xl bg-indigo-50/20 border border-indigo-100/50 p-4 text-sm leading-6 text-slate-700">
                  {activeSource.summary || 'No summary has been generated for this source yet.'}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Extracted Text Content</h3>
                <div className="relative rounded-2xl border border-slate-100 bg-slate-50 p-4 max-h-[300px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-6 text-slate-600">
                    {activeSource.extractedText || 'No text extracted. Add some manual text notes or re-upload.'}
                  </pre>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <FileText size={48} className="text-slate-300 mb-3" />
              <p className="text-base font-semibold text-slate-900">Select a Source Bibliography</p>
              <p className="mt-1 text-sm text-slate-500 max-w-[280px]">Choose an entry from the list to inspect extracted texts, active chapter linking, and summaries.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
