import React from 'react';
import { Play, RotateCcw, Trash2, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  scanId: string | null;
  scanStatus: string;
  auditStatus: string;
  targetUrl: string;
  onStart: () => void;
  onRescan: () => void;
  onClear: () => void;
  onRunAudit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  scanId,
  scanStatus,
  auditStatus,
  targetUrl,
  onStart,
  onRunAudit,
  onRescan,
  onClear
}) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Target:</span>
        <span className="text-sm font-mono text-indigo-400 truncate max-w-xs md:max-w-sm">
          {targetUrl || 'No Target Configured'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {scanStatus === 'COMPLETED' && auditStatus !== 'RUNNING' && (
          <button
            onClick={onRunAudit}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition shadow-lg"
          >
            <ShieldCheck className="w-4 h-4" />
            RUN AUDIT
          </button>
        )}
        <button
          onClick={onStart}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-lg"
        >
          <Play className="w-4 h-4 fill-current" />
          START SCAN
        </button>
        <button onClick={onRescan} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition" title="Rescan">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button onClick={onClear} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition" title="Clear">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
