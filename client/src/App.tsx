import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { ScannerTab } from './components/ScannerTab';
import { EndpointTreeTab } from './components/EndpointTreeTab';
import { SecurityAuditTab } from './components/SecurityAuditTab';
import { ReportsTab } from './components/ReportsTab';
import { RemediationTab } from './components/RemediationTab';
import { HistoryTab } from './components/HistoryTab';
import { ScanResultData, ScanOptions, ScanResource } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scanId, setScanId] = useState<string | null>(null);
  const [scanData, setScanData] = useState<ScanResultData | null>(null);
  const [, setSelectedResource] = useState<ScanResource | null>(null);

  const targetUrl = scanData?.targetUrl || 'http://localhost:3000';
  const scanStatus = scanData?.status || 'IDLE';
  const auditStatus = scanData?.auditStatus || 'IDLE';

  useEffect(() => {
    if (!scanId || scanStatus === 'COMPLETED' || scanStatus === 'STOPPED') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/scans/${scanId}`);
        if (res.ok) setScanData(await res.json());
      } catch (err) {
        console.error(err);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [scanId, scanStatus]);

  const handleStartScan = async (options: ScanOptions) => {
    try {
      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      if (res.ok) {
        const data = await res.json();
        setScanId(data.scanId);
        setActiveTab('dashboard');
        const scanRes = await fetch(`/api/scans/${data.scanId}`);
        if (scanRes.ok) setScanData(await scanRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunAudit = async () => {
    if (!scanId) return;
    try {
      await fetch(`/api/scans/${scanId}/security-audit`, { method: 'POST' });
      const res = await fetch(`/api/scans/${scanId}`);
      if (res.ok) setScanData(await res.json());
      setActiveTab('audit');
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateReport = () => {
    setActiveTab('reports');
  };

  const handleRescan = () => {
    if (scanData?.options) handleStartScan(scanData.options);
    else handleStartScan({ targetUrl: 'http://localhost:3000', maxDepth: 5, maxPages: 100, timeout: 10, concurrency: 5 });
  };

  const handleClear = () => {
    setScanId(null);
    setScanData(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          scanId={scanId}
          scanStatus={scanStatus}
          auditStatus={auditStatus}
          targetUrl={targetUrl}
          onStart={() => handleStartScan({ targetUrl, maxDepth: 5, maxPages: 100, timeout: 10, concurrency: 5 })}
          onRunAudit={handleRunAudit}
          onRescan={handleRescan}
          onClear={handleClear}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardTab scanData={scanData} onSelectResource={setSelectedResource} onRunAudit={handleRunAudit} onGenerateReport={handleGenerateReport} />}
          {activeTab === 'scanner' && <ScannerTab onStartScan={handleStartScan} isRunning={scanStatus === 'RUNNING'} />}
          {activeTab === 'tree' && <EndpointTreeTab scanData={scanData} onSelectResource={setSelectedResource} />}
          {activeTab === 'audit' && <SecurityAuditTab scanData={scanData} onRunAudit={handleRunAudit} />}
          {activeTab === 'reports' && <ReportsTab scanData={scanData} />}
          {activeTab === 'remediation' && <RemediationTab scanData={scanData} onRefresh={() => scanId && fetch(`/api/scans/${scanId}`).then(r => r.json()).then(setScanData)} />}
          {activeTab === 'history' && <HistoryTab />}
        </main>
      </div>
    </div>
  );
}
