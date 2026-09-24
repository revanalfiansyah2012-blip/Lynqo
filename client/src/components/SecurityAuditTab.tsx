import React from 'react';
import { ScanResultData } from '../types';
import { ShieldCheck } from 'lucide-react';

interface SecurityAuditTabProps {
  scanData: ScanResultData | null;
  onRunAudit: () => void;
}

export const SecurityAuditTab: React.FC<SecurityAuditTabProps> = ({ scanData, onRunAudit }) => {
  const findings = scanData?.findings || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Security Audit Findings</h2>
          <p className="text-sm text-slate-400">Real vulnerability findings from audit engine.</p>
        </div>
        <button onClick={onRunAudit} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Run Audit
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
        {findings.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No findings detected. Run security audit.</div>
        ) : (
          findings.map(f => (
            <div key={f.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">{f.severity}</span>
                  <h4 className="font-bold text-slate-200 text-sm">{f.title}</h4>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">{f.status}</span>
                </div>
                <p className="text-xs font-mono text-indigo-400 mt-1">{f.url}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
