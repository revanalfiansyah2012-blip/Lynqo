import React, { useState, useEffect } from 'react';
import { ScanHistoryItem } from '../types';
import { History } from 'lucide-react';

export const HistoryTab: React.FC = () => {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  useEffect(() => {
    fetch('/api/scans/history')
      .then(res => res.json())
      .then(data => { if (data.history) setHistory(data.history); })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-3">
        <History className="w-6 h-6 text-indigo-400" />
        <div>
          <h2 className="text-xl font-bold text-slate-100">Scan History</h2>
          <p className="text-sm text-slate-400">Persistent database history of past scans.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 bg-slate-950/50">
              <th className="p-4">Scan ID</th>
              <th className="p-4">Target</th>
              <th className="p-4">Started At</th>
              <th className="p-4">Pages</th>
              <th className="p-4">Findings</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {history.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">No scan history available.</td></tr>
            ) : (
              history.map(h => (
                <tr key={h.id} className="hover:bg-slate-800/50">
                  <td className="p-4 font-mono text-xs text-indigo-400">#{h.id.slice(0, 6)}</td>
                  <td className="p-4 font-mono text-xs text-slate-200">{h.targetUrl}</td>
                  <td className="p-4 text-xs text-slate-400">{new Date(h.startTime).toLocaleTimeString()}</td>
                  <td className="p-4 text-xs text-slate-300">{h.pagesCount}</td>
                  <td className="p-4 text-xs text-slate-300">{h.findingsCount}</td>
                  <td className="p-4 text-xs"><span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">{h.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
