import React from 'react';
import { ScanResultData, ScanResource } from '../types';
import { Globe, Layers, Database, Cpu, ShieldCheck, FileText } from 'lucide-react';

interface DashboardTabProps {
  scanData: ScanResultData | null;
  onSelectResource: (resource: ScanResource) => void;
  onRunAudit: () => void;
  onGenerateReport: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ scanData, onSelectResource, onRunAudit, onGenerateReport }) => {
  if (!scanData) {
    return <div className="p-8 text-center text-slate-500">No scan data available. Start a scan to view dashboard.</div>;
  }

  const stats = scanData.stats || { pages: 0, endpoints: 0, api: 0, technologies: 0 };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400">Target</span>
          <h2 className="text-xl font-mono font-bold text-indigo-400">{scanData.targetUrl}</h2>
          <p className="text-xs text-slate-500 mt-1">Last Scan: {new Date(scanData.startTime).toLocaleTimeString()}</p>
        </div>
        <div className="flex gap-3">
          {scanData.auditStatus === 'IDLE' && (
            <button onClick={onRunAudit} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg">
              <ShieldCheck className="w-4 h-4" /> Run Audit
            </button>
          )}
          {scanData.status === 'COMPLETED' && (
            <button onClick={onGenerateReport} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg">
              <FileText className="w-4 h-4" /> Generate Report
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-sm"><span>Pages</span><Globe className="w-5 h-5 text-indigo-400" /></div>
          <p className="text-3xl font-bold text-slate-100 mt-2">{stats.pages}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-sm"><span>Endpoints</span><Layers className="w-5 h-5 text-emerald-400" /></div>
          <p className="text-3xl font-bold text-slate-100 mt-2">{stats.endpoints}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-sm"><span>API</span><Database className="w-5 h-5 text-amber-400" /></div>
          <p className="text-3xl font-bold text-slate-100 mt-2">{stats.api}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-sm"><span>Findings</span><Cpu className="w-5 h-5 text-rose-400" /></div>
          <p className="text-3xl font-bold text-slate-100 mt-2">{scanData.findings.length}</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800"><h3 className="font-bold text-slate-100">Discovered Resources</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 bg-slate-950/50">
                <th className="p-4">URL</th><th className="p-4">Type</th><th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {scanData.resources.map(r => (
                <tr key={r.id} onClick={() => onSelectResource(r)} className="hover:bg-slate-800/50 cursor-pointer">
                  <td className="p-4 font-mono text-xs text-indigo-300">{r.url}</td>
                  <td className="p-4 text-xs text-slate-300">{r.type}</td>
                  <td className="p-4 text-xs"><span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">{r.statusCode}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
