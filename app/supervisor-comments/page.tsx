'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit3, Loader2, MessageSquare, AlertCircle, Check, 
  Calendar, CheckSquare, Clock, AlertTriangle, ArrowRight 
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

interface Comment {
  id: string;
  content: string;
  chapter: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
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
  const [status, setStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

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
      setError('Failed to load supervisor comments.');
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
      setComments([newComment, ...comments]);
      setIsAdding(false);
      handleReset();
      setSuccess('Comment successfully added!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add comment.');
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
      const updatedComment = await res.json();
      setComments(comments.map(c => c.id === isEditing ? updatedComment : c));
      setIsEditing(null);
      handleReset();
      setSuccess('Comment successfully updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update comment.');
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
    if (!confirm('Are you sure you want to delete this supervisor comment?')) return;

    try {
      setLoading(true);
      await fetch(`/api/comments/${id}`, { method: 'DELETE' });
      setComments(comments.filter(c => c.id !== id));
      setSuccess('Comment successfully deleted!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete comment.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatusDirectly = async (comment: Comment, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...comment, status: newStatus }),
      });
      const updated = await res.json();
      setComments(comments.map(c => c.id === comment.id ? updated : c));
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  // Stats calculation
  const total = comments.length;
  const todoCount = comments.filter(c => c.status === 'TODO').length;
  const inProgressCount = comments.filter(c => c.status === 'IN_PROGRESS').length;
  const doneCount = comments.filter(c => c.status === 'DONE').length;
  const highPriorityCount = comments.filter(c => c.priority === 'HIGH' && c.status !== 'DONE').length;

  // Format Helper
  const formatStatus = (s: string) => {
    if (s === 'TODO') return 'To Do';
    if (s === 'IN_PROGRESS') return 'In Progress';
    return 'Done';
  };

  const formatPriority = (p: string) => {
    if (p === 'LOW') return 'Low';
    if (p === 'MEDIUM') return 'Medium';
    return 'High';
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Supervisor Comments</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Track Feedback & Action Items</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Link critical feedback from supervisors to specific thesis chapters, configure priority tags, and update implementation statuses as you iterate your drafts.
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
            Add Feedback Item
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

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Feedbacks</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{total}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-center">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">To Do</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">{todoCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-center">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">In Progress</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{inProgressCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-center">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Completed</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{doneCount}</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 shadow-sm text-center">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Pending High Priority</p>
          <p className="mt-2 text-2xl font-bold text-rose-800">{highPriorityCount}</p>
        </div>
      </div>

      {/* Interactive Form Panel */}
      {(isAdding || isEditing) && (
        <form onSubmit={isAdding ? handleAddSubmit : handleEditSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {isAdding ? 'Log Supervisor Comment' : 'Edit Comment Details'}
            </h2>
            <button
              type="button"
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

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Linked Chapter</label>
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
                <option>General / Global</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Current Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Supervisor Feedback Content *</label>
            <textarea
              rows={4}
              placeholder="Type the exact feedback received or describe the concrete task requested by your supervisor..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 resize-none leading-relaxed"
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
              {isAdding ? 'Log Feedback' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Feedback Board List */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100 mb-6">
          <MessageSquare size={20} className="text-indigo-600" />
          Outstanding Feedback Registers
        </h2>

        {loading && comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600 mb-3" size={28} />
            <p className="text-sm font-medium text-slate-600">Retrieving feedback logs...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <MessageSquare size={44} className="text-slate-300 mb-4" />
            <h3 className="text-base font-semibold text-slate-900 font-sans">No Comments Documented</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-[280px]">Add comments manually to organize thesis suggestions systematically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div 
                key={comment.id}
                className={`rounded-2xl border p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition hover:shadow-sm ${
                  comment.status === 'DONE' 
                    ? 'border-slate-100 bg-slate-50/50 opacity-75' 
                    : comment.priority === 'HIGH'
                    ? 'border-rose-100 bg-rose-50/10'
                    : 'border-slate-100 bg-white'
                }`}
              >
                <div className="space-y-3 max-w-3xl">
                  {/* Badge tags bar */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 border border-slate-200/50 px-2.5 py-0.5 font-bold text-slate-700 uppercase tracking-wide">
                      {comment.chapter || 'Global'}
                    </span>
                    
                    <StatusBadge status={formatPriority(comment.priority) as any} />
                    <StatusBadge status={formatStatus(comment.status) as any} />
                    
                    <span className="flex items-center gap-1 text-slate-400 font-medium ml-2">
                      <Calendar size={12} />
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm leading-7 text-slate-800 font-medium">
                    {comment.content}
                  </p>
                </div>

                {/* Status Switcher & Action controls */}
                <div className="flex items-center gap-3 shrink-0 border-t border-slate-100 pt-3 md:border-none md:pt-0">
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => updateStatusDirectly(comment, 'TODO')}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                        comment.status === 'TODO' 
                          ? 'bg-white text-slate-800 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      To Do
                    </button>
                    <button
                      onClick={() => updateStatusDirectly(comment, 'IN_PROGRESS')}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                        comment.status === 'IN_PROGRESS' 
                          ? 'bg-white text-amber-700 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => updateStatusDirectly(comment, 'DONE')}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                        comment.status === 'DONE' 
                          ? 'bg-white text-emerald-700 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Done
                    </button>
                  </div>

                  <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                    <button
                      onClick={() => handleStartEdit(comment)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition"
                      title="Edit Comment"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition"
                      title="Delete Comment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
