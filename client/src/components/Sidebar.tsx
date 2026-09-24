import React from 'react';
import { LayoutDashboard, ShieldSearch, Network, ShieldAlert, History, FileText, CheckCircle2 } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scanner', label: 'Scanner & Target', icon: ShieldSearch },
    { id: 'tree', label: 'Endpoint Tree', icon: Network },
    { id: 'audit', label: 'Security Audit', icon: ShieldAlert },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'remediation', label: 'Remediation', icon: CheckCircle2 },
    { id: 'history', label: 'Scan History', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <img src="/lynqo-logo.svg" alt="LynQo Logo" className="w-8 h-8 rounded-lg bg-slate-800 p-1 object-contain" />
        <div>
          <h1 className="font-bold text-slate-100 tracking-wide text-lg">LynQo</h1>
          <p className="text-xs text-indigo-400 font-medium">Vulnerability Suite</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        Part 5: One-Command Runner
      </div>
    </aside>
  );
};
