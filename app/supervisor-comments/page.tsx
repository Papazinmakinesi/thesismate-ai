'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Plus, Trash2, Edit3, Loader2, Sparkles, Check, 
  AlertCircle, Printer, Filter, X, Award, CheckSquare 
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

interface Comment {
  id: string;
  content: string;
  chapter: string;
  status: string;      // TODO | IN_PROGRESS | DONE
  priority: string;    // LOW | MEDIUM | HIGH
  createdAt: string;
}

export default function SupervisorCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form Fields
  const [content, setContent] = useState('');
  const [chapter, setChapter] = useState('Introduction');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');

  // Filters
  const [filterChapter, setFilterChapter] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  // Print Mode State overlay
  const [isPrintingReport, setIsPrintingReport] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/comments');
      const data = await res.json();
      setComments(data);
    } catch (err) {
      setError('Failed to fetch comments.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setContent('');
    setChapter('Introduction');
    setStatus('TODO');
    setPriority('MEDIUM');
    setError('');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Comment content is required.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, chapter, status, priority }),
      });
      const newComment = await res.json();
      setComments([...comments, newComment]);
      setIsAdding(false);
      handleReset();
      setSuccess('Supervisor feedback comment successfully logged.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add supervisor comment.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/comments/${isEditing}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, chapter, status, priority }),
      });
      const updated = await res.json();
      setComments(comments.map(c => c.id === isEditing ? updated : c));
      setIsEditing(null);
      handleReset();
      setSuccess('Supervisor comment successfully updated.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update supervisor comment.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setIsEditing(comment.id);
    setIsAdding(false);
    setContent(comment.content);
    setChapter(comment.chapter || 'Introduction');
    setStatus(comment.status || 'TODO');
    setPriority(comment.priority || 'MEDIUM');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supervisor feedback item?')) return;

    try {
      setLoading(true);
      await fetch(`/api/comments/${id}`, { method: 'DELETE' });
      setComments(comments.filter(c => c.id !== id));
      setSuccess('Supervisor feedback item deleted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete comment.');
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredComments = comments.filter(c => {
    const matchChapter = filterChapter === 'All' || c.chapter === filterChapter;
    const matchPriority = filterPriority === 'All' || c.priority === filterPriority;
    return matchChapter && matchPriority;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Supervisor Revisions Log</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Manage Supervisor Comments</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Track chapter revisions, categorise actions by prioritsation, update completion status, and generate formatted academic review reports for your supervisor.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsPrintingReport(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
            >
              <Printer size={18} />
              Export Report
            </button>
            <button
              onClick={() => {
                setIsAdding(true);
                setIsEditing(null);
                handleReset();
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition"
            >
              <Plus size={18} />
              Log Comment
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

      {/* Manual log form */}
      {(isAdding || isEditing) && (
        <form onSubmit={isAdding ? handleAddSubmit : handleEditSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {isAdding ? 'Log Supervisor Revision Comment' : 'Edit Revision Comment'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setIsEditing(null);
                handleReset();
              }}
              className="text-sm font-semibold text-slate-500 hover:text-slate-950"
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Chapter</label>
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
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Revision Request Content *</label>
            <textarea
              rows={3}
              placeholder="e.g. Expand on the sample characteristics section. Needs clear literature backing..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500 resize-none"
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
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              {isAdding ? 'Log Revision' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Dynamic filters & Table grid */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Filter size={18} className="text-indigo-600" />
            Revision List filters
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={filterChapter}
              onChange={(e) => setFilterChapter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 outline-none"
            >
              <option value="All">All Chapters</option>
              <option value="Introduction">Introduction</option>
              <option value="Literature Review">Literature Review</option>
              <option value="Methodology">Methodology</option>
              <option value="Results">Results & Discussion</option>
              <option value="Conclusion">Conclusion</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
            </select>
          </div>
        </div>

        {loading && comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600 mb-2" size={24} />
            <p className="text-sm font-semibold text-slate-600">Retrieving feedback logs...</p>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400">
            <MessageSquare size={48} className="text-slate-200 mb-4" />
            <h3 className="text-base font-bold text-slate-800">No revisions logged.</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">Adjust your filters or add comments to track your progress.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-700">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <th className="px-5 py-4 font-semibold min-w-[120px]">Chapter</th>
                  <th className="px-5 py-4 font-semibold min-w-[300px]">Revision Task Required</th>
                  <th className="px-5 py-4 font-semibold min-w-[120px]">Priority</th>
                  <th className="px-5 py-4 font-semibold min-w-[120px]">Status</th>
                  <th className="px-5 py-4 font-semibold text-right min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredComments.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/40 transition">
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{c.chapter}</span>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-800 leading-relaxed max-w-md select-text">
                      {c.content}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={c.priority === 'HIGH' ? 'High' : c.priority === 'MEDIUM' ? 'Medium' : 'Low'} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={c.status === 'DONE' ? 'Done' : c.status === 'IN_PROGRESS' ? 'In Progress' : 'To Do'} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStartEdit(c)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition"
                          title="Edit Comment"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition"
                          title="Delete Comment"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- PRINT OVERLAY REPORT MODAL --- */}
      {isPrintingReport && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-text">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl relative border border-slate-200">
            {/* Header control bar */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Printer size={18} className="text-indigo-600" />
                Supervisor Action Report Template
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition active:scale-95 shadow-sm"
                >
                  <Printer size={14} />
                  Print/Save PDF
                </button>
                <button
                  onClick={() => setIsPrintingReport(false)}
                  className="rounded-xl border border-slate-200 text-slate-500 hover:text-slate-950 p-2 bg-white transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Printable Area content (styled exactly for academic look) */}
            <div id="printable-area" className="p-8 md:p-12 overflow-y-auto flex-1 space-y-8 select-text text-slate-950 font-serif">
              {/* Report Title */}
              <div className="text-center space-y-2 border-b-2 border-slate-950 pb-6">
                <div className="flex items-center justify-center gap-1.5 text-xs font-sans font-bold uppercase tracking-widest text-slate-500">
                  <Award size={15} />
                  ThesisMate AI &bull; Academic Review Report
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
                  Supervisor Revisions & Progress Action Plan
                </h1>
                <p className="text-xs font-medium font-sans text-slate-500">
                  Generated on: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Thesis Info */}
              <div className="grid grid-cols-3 gap-4 text-xs font-sans font-medium text-slate-600">
                <div className="border-r border-slate-100 pr-2">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Scope</p>
                  <p className="text-slate-800 mt-1">Sustainable Mobility Framework</p>
                </div>
                <div className="border-r border-slate-100 px-2">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Total Revisions</p>
                  <p className="text-slate-800 mt-1">{comments.length} Logged Items</p>
                </div>
                <div className="pl-2">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Open Tasks</p>
                  <p className="text-slate-800 mt-1">{comments.filter(c => c.status !== 'DONE').length} Revisions Pending</p>
                </div>
              </div>

              {/* Revision Table list */}
              <div className="space-y-4">
                <h3 className="text-sm font-sans font-bold text-slate-900 uppercase tracking-wider border-b border-slate-900 pb-1.5 flex items-center gap-2">
                  <CheckSquare size={16} />
                  Action Plan & Feedback Logs
                </h3>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 min-w-[100px]">Chapter</th>
                      <th className="py-2.5 min-w-[320px]">Revision Task Required</th>
                      <th className="py-2.5 min-w-[90px]">Priority</th>
                      <th className="py-2.5 min-w-[90px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {comments.map((c) => (
                      <tr key={c.id} className="py-2">
                        <td className="py-3 text-[10px] font-bold text-slate-900 uppercase tracking-wider">{c.chapter}</td>
                        <td className="py-3 pr-4 text-slate-800 font-medium leading-relaxed select-text">{c.content}</td>
                        <td className="py-3 text-[10px] font-bold tracking-wider">{c.priority}</td>
                        <td className="py-3 text-[10px] font-bold tracking-wider">{c.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures and Endorsement */}
              <div className="pt-12 grid grid-cols-2 gap-8 text-xs font-sans font-bold text-slate-800 border-t border-slate-100">
                <div className="space-y-8">
                  <p className="uppercase tracking-widest text-[9px] text-slate-400">Researcher Endorsement</p>
                  <div className="border-b border-slate-300 w-44 mt-4 h-6"></div>
                  <p className="text-[11px] font-semibold text-slate-900 mt-1">Student Candidate Signature</p>
                </div>
                <div className="space-y-8">
                  <p className="uppercase tracking-widest text-[9px] text-slate-400">Academic Endorsement</p>
                  <div className="border-b border-slate-300 w-44 mt-4 h-6"></div>
                  <p className="text-[11px] font-semibold text-slate-900 mt-1">Thesis Supervisor Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
