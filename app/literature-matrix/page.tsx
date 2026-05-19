'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table, Download, Plus, Trash2, Edit3, Loader2, FileSpreadsheet, Sparkles, Check, AlertCircle 
} from 'lucide-react';

interface MatrixEntry {
  id: string;
  source: string;
  method: string;
  keyFindings: string;
  limitations: string;
  relevance: string;
  citationUsage: string;
}

export default function LiteratureMatrixPage() {
  const [entries, setEntries] = useState<MatrixEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form Fields
  const [source, setSource] = useState('');
  const [method, setMethod] = useState('');
  const [keyFindings, setKeyFindings] = useState('');
  const [limitations, setLimitations] = useState('');
  const [relevance, setRelevance] = useState('');
  const [citationUsage, setCitationUsage] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMatrix();
  }, []);

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/matrix');
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      setError('Failed to load literature matrix.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSource('');
    setMethod('');
    setKeyFindings('');
    setLimitations('');
    setRelevance('');
    setCitationUsage('');
    setError('');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim()) {
      setError('Source reference title is required.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, method, keyFindings, limitations, relevance, citationUsage }),
      });
      const newEntry = await res.json();
      setEntries([...entries, newEntry]);
      setIsAdding(false);
      handleReset();
      setSuccess('Matrix entry successfully added!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add matrix row.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/matrix/${isEditing}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, method, keyFindings, limitations, relevance, citationUsage }),
      });
      const updated = await res.json();
      setEntries(entries.map(e => e.id === isEditing ? updated : e));
      setIsEditing(null);
      handleReset();
      setSuccess('Matrix entry successfully updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update matrix row.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (entry: MatrixEntry) => {
    setIsEditing(entry.id);
    setIsAdding(false);
    setSource(entry.source);
    setMethod(entry.method || '');
    setKeyFindings(entry.keyFindings || '');
    setLimitations(entry.limitations || '');
    setRelevance(entry.relevance || '');
    setCitationUsage(entry.citationUsage || '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this literature matrix row?')) return;

    try {
      setLoading(true);
      await fetch(`/api/matrix/${id}`, { method: 'DELETE' });
      setEntries(entries.filter(e => e.id !== id));
      setSuccess('Matrix entry successfully deleted!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete matrix row.');
    } finally {
      setLoading(false);
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (entries.length === 0) return;

    const headers = ['Source', 'Methodology', 'Key Findings', 'Limitations', 'Relevance', 'Citation Usage'];
    const rows = entries.map(e => [
      `"${e.source.replace(/"/g, '""')}"`,
      `"${(e.method || '').replace(/"/g, '""')}"`,
      `"${(e.keyFindings || '').replace(/"/g, '""')}"`,
      `"${(e.limitations || '').replace(/"/g, '""')}"`,
      `"${(e.relevance || '').replace(/"/g, '""')}"`,
      `"${(e.citationUsage || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'thesis_literature_matrix.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccess('Literature matrix exported successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Literature Matrix</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Map Your Research Landscape</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Systematically compare research methodologies, findings, limitations, and direct citation applicability across publications. Export clean spreadsheets for academic reporting.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExportCSV}
              disabled={entries.length === 0}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <Download size={18} />
              Export CSV
            </button>
            <button
              onClick={() => {
                setIsAdding(true);
                setIsEditing(null);
                handleReset();
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
            >
              <Plus size={18} />
              Add Row
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

      {/* Manual row addition / edit panel */}
      {(isAdding || isEditing) && (
        <form onSubmit={isAdding ? handleAddSubmit : handleEditSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {isAdding ? 'Add Matrix Row' : 'Modify Matrix Row Analysis'}
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Source Publication Name *</label>
              <input
                type="text"
                placeholder="e.g. Sustainable Urban Mobility Planning (Banister, 2020)"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Methodology Employed</label>
              <input
                type="text"
                placeholder="e.g. Travel survey diary analysis"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Key Research Findings</label>
              <textarea
                rows={3}
                placeholder="Core results or models validated in this study..."
                value={keyFindings}
                onChange={(e) => setKeyFindings(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 resize-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Research Limitations Identified</label>
              <textarea
                rows={3}
                placeholder="Sample size gaps, geographical limits, variables omitted..."
                value={limitations}
                onChange={(e) => setLimitations(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Relevance to Your Thesis Topic</label>
              <textarea
                rows={3}
                placeholder="Why is this study vital to your work? Underpins theory X..."
                value={relevance}
                onChange={(e) => setRelevance(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 resize-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Possible Citation Context / Usage</label>
              <textarea
                rows={3}
                placeholder="Where or how do you intend to cite this? (e.g. Cite in Ch2 methodology paradigm)..."
                value={citationUsage}
                onChange={(e) => setCitationUsage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 resize-none"
              />
            </div>
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
              {isAdding ? 'Add Entry' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Main Table Layout */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100 mb-6">
          <Table size={20} className="text-indigo-600" />
          Synthesis Literature Matrix Grid
        </h2>

        {loading && entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600 mb-3" size={28} />
            <p className="text-sm font-medium text-slate-600">Generating matrix table...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FileSpreadsheet size={48} className="text-slate-300 mb-4" />
            <h3 className="text-base font-semibold text-slate-900">Matrix Matrix is Empty</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-[280px]">Add references to see the comparison table mapped out automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-700">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <th className="px-5 py-4 font-semibold min-w-[200px]">Source Reference</th>
                  <th className="px-5 py-4 font-semibold min-w-[150px]">Methodology</th>
                  <th className="px-5 py-4 font-semibold min-w-[200px]">Key Findings</th>
                  <th className="px-5 py-4 font-semibold min-w-[200px]">Limitations</th>
                  <th className="px-5 py-4 font-semibold min-w-[200px]">Relevance</th>
                  <th className="px-5 py-4 font-semibold min-w-[200px]">Citation Usage</th>
                  <th className="px-5 py-4 font-semibold text-right min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/40 transition">
                    <td className="px-5 py-4 font-bold text-slate-900 leading-snug">
                      {entry.source}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-600">
                      {entry.method || '-'}
                    </td>
                    <td className="px-5 py-4 text-xs leading-relaxed text-slate-600 max-w-xs">
                      {entry.keyFindings || '-'}
                    </td>
                    <td className="px-5 py-4 text-xs leading-relaxed text-slate-600 max-w-xs">
                      {entry.limitations || '-'}
                    </td>
                    <td className="px-5 py-4 text-xs leading-relaxed text-indigo-950 font-medium max-w-xs">
                      {entry.relevance || '-'}
                    </td>
                    <td className="px-5 py-4 text-xs leading-relaxed text-emerald-950 font-medium max-w-xs">
                      {entry.citationUsage || '-'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStartEdit(entry)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition"
                          title="Edit Row"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition"
                          title="Delete Row"
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
    </div>
  );
}
