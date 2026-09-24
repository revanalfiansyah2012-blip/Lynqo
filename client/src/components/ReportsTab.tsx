import React, { useState, useEffect } from 'react';
import { SecurityReport, ScanResultData } from '../types';
import { FileText, Download, Trash2 } from 'lucide-react';

interface ReportsTabProps {
  scanData: ScanResultData | null;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ scanData }) => {
  const [reports, setReports] = useState<SecurityReport[]>([]);

  useEffect(() => {
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => { if (data.reports) setReports(data.reports); })
      .catch(console.error);
  }, []);

  const handleGenerate = async () => {
    if (!scanData) return;
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId: scanData.id })
      });
      if (res.ok) {
        const newReport = await res.json();
        setReports([...reports, newReport]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      setReports(reports.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-indigo-400" />
          <div>
            <h2 className="text-xl font-bold text-slate-100">Security Report Center</h2>
            <p className="text-sm text-slate-400">Generate and export professional security assessment reports.</p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!scanData}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-2"
        >
          Generate Report from Current Scan
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 bg-slate-950/50">
              <th className="p-4">Report ID</th>
              <th className="p-4">Target</th>
              <th className="p-4">Created At</th>
              <th className="p-4">Format</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {reports.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">No reports generated yet.</td></tr>
            ) : (
              reports.map(r => (
                <tr key={r.id} className="hover:bg-slate-800/50">
                  <td className="p-4 font-mono text-xs text-indigo-400">#{r.id.slice(0, 6)}</td>
                  <td className="p-4 font-mono text-xs text-slate-200">{r.targetUrl}</td>
                  <td className="p-4 text-xs text-slate-400">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-4 text-xs text-slate-300">{r.format}</td>
                  <td className="p-4 text-right space-x-2">
                    <a href={`/api/reports/${r.id}/export/html`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs">
                      <Download className="w-3.5 h-3.5" /> HTML
                    </a>
                    <a href={`/api/reports/${r.id}/export/json`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs">
                      JSON
                    </a>
                    <a href={`/api/reports/${r.id}/export/csv`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs">
                      CSV
                    </a>
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
