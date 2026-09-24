import React from 'react';
import { ScanResultData, ScanResource } from '../types';
import { Network, Folder, File } from 'lucide-react';

interface EndpointTreeTabProps {
  scanData: ScanResultData | null;
  onSelectResource: (resource: ScanResource) => void;
}

export const EndpointTreeTab: React.FC<EndpointTreeTabProps> = ({ scanData, onSelectResource }) => {
  const resources = scanData?.resources || [];
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Network className="w-6 h-6 text-indigo-400" />
        <div>
          <h2 className="text-lg font-bold text-slate-100">Endpoint Tree</h2>
          <p className="text-xs text-slate-400">Hierarchical visual map of discovered resources.</p>
        </div>
      </div>
      <div className="font-mono text-sm space-y-2 bg-slate-950 p-6 rounded-xl border border-slate-800">
        <div className="text-indigo-400 font-bold flex items-center gap-2">
          <Folder className="w-4 h-4" /> {scanData?.targetUrl || 'TARGET'}
        </div>
        <div className="ml-6 space-y-1">
          {resources.map(item => (
            <div key={item.id} onClick={() => onSelectResource(item)} className="text-xs text-slate-400 hover:text-indigo-300 cursor-pointer py-0.5 flex items-center gap-2">
              <File className="w-3 h-3 text-slate-600" /> <span className="truncate">{item.url}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
