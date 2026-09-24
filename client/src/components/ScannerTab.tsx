import React, { useState } from 'react';
import { ShieldSearch, Play } from 'lucide-react';
import { ScanOptions } from '../types';

interface ScannerTabProps {
  onStartScan: (options: ScanOptions) => void;
  isRunning: boolean;
}

export const ScannerTab: React.FC<ScannerTabProps> = ({ onStartScan, isRunning }) => {
  const [targetUrl, setTargetUrl] = useState('http://localhost:3000');
  const [maxDepth] = useState(5);
  const [maxPages] = useState(100);
  const [timeout] = useState(10);
  const [concurrency] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartScan({ targetUrl, maxDepth, maxPages, timeout, concurrency });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl">
            <ShieldSearch className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Target Configuration</h2>
            <p className="text-sm text-slate-400">Configure target URL for scanning and assessment workflow.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Website URL / IP Address</label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="http://localhost:3000"
              required
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isRunning}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            {isRunning ? 'SCANNING...' : 'START SCAN & MAPPING'}
          </button>
        </form>
      </div>
    </div>
  );
};
