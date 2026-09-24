import React from 'react';
import { ScanResultData, SecurityFinding } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface RemediationTabProps {
  scanData: ScanResultData | null;
  onRefresh: () => void;
}

export const RemediationTab: React.FC<RemediationTabProps> = ({ scanData, onRefresh }) => {
  const findings = scanData?.findings || [];

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/findings/${id}/remediation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const verifyFix = async (id: string) => {
    try {
      await fetch(`/api/findings/${id}/verify`, { method: 'POST' });
      onRefresh();
      alert('Verification scan completed.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-indigo-400" />
        <div>
          <h2 className="text-xl font-bold text-slate-100">Remediation & Verification Center</h2>
          <p className="text-sm text-slate-400">Manage finding status, view remediation guides, and verify fixes.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
        {findings.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No remediation items available.</div>
        ) : (
          findings.map((f: SecurityFinding) => (
            <div key={f.id} className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">{f.severity}</span>
                  <h4 className="font-bold text-slate-200 text-sm">{f.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={f.status}
                    onChange={(e) => updateStatus(f.id, e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Accepted Risk">Accepted Risk</option>
                    <option value="Ignored">Ignored</option>
                  </select>
                  <button onClick={() => verifyFix(f.id)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium">
                    Verify Fix
                  </button>
                </div>
              </div>
              <p className="text-xs font-mono text-indigo-400">{f.url}</p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <p className="text-slate-400"><b>Remediation Guide:</b> {f.remediation}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
