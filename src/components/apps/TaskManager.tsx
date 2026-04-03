import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Database, LayoutGrid, List, Shield, Zap, Search, RefreshCw, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Process {
  id: string;
  name: string;
  cpu: number;
  memory: number;
  status: 'Running' | 'Suspended' | 'Background';
  type: 'App' | 'Background Service' | 'System';
}

export const TaskManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Processes' | 'Performance' | 'Services'>('Processes');
  const [processes, setProcesses] = useState<Process[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const initialProcesses: Process[] = [
      { id: '1', name: 'System', cpu: 0.1, memory: 124, status: 'Running', type: 'System' },
      { id: '2', name: 'Desktop Window Manager', cpu: 1.2, memory: 45, status: 'Running', type: 'System' },
      { id: '3', name: 'File Explorer', cpu: 0.5, memory: 82, status: 'Running', type: 'App' },
      { id: '4', name: 'Microsoft Edge', cpu: 2.4, memory: 342, status: 'Running', type: 'App' },
      { id: '5', name: 'Windows Update Service', cpu: 0.0, memory: 12, status: 'Background', type: 'Background Service' },
      { id: '6', name: 'Ghost Shield IDS', cpu: 0.8, memory: 28, status: 'Running', type: 'Background Service' },
      { id: '7', name: 'Print Spooler', cpu: 0.0, memory: 8, status: 'Suspended', type: 'Background Service' },
      { id: '8', name: 'Antimalware Service Executable', cpu: 1.5, memory: 156, status: 'Running', type: 'System' },
    ];
    setProcesses(initialProcesses);

    const interval = setInterval(() => {
      setProcesses(prev => prev.map(p => ({
        ...p,
        cpu: Math.max(0, p.cpu + (Math.random() - 0.5) * 0.5),
        memory: Math.max(5, p.memory + (Math.random() - 0.5) * 2)
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const filteredProcesses = processes.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCpu = processes.reduce((acc, p) => acc + p.cpu, 0).toFixed(1);
  const totalMem = processes.reduce((acc, p) => acc + p.memory, 0).toFixed(0);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-bold">Task Manager</span>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-md p-0.5">
            {(['Processes', 'Performance', 'Services'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded transition-all",
                  activeTab === tab 
                    ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" 
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 opacity-40" />
            <input 
              type="text"
              placeholder="Search processes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-3 py-1 bg-slate-100 dark:bg-slate-800 border-none rounded text-xs w-48 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
            <RefreshCw className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'Processes' && (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10">
              <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-2 font-bold">Name</th>
                <th className="px-4 py-2 font-bold">Status</th>
                <th className="px-4 py-2 font-bold text-right">CPU</th>
                <th className="px-4 py-2 font-bold text-right">Memory</th>
                <th className="px-4 py-2 font-bold">Type</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {filteredProcesses.map(p => (
                <tr key={p.id} className="group hover:bg-blue-500/5 border-b border-slate-100 dark:border-slate-900 transition-colors">
                  <td className="px-4 py-2 flex items-center gap-2">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      p.status === 'Running' ? "bg-emerald-500" : p.status === 'Suspended' ? "bg-amber-500" : "bg-slate-400"
                    )} />
                    <span className="font-medium">{p.name}</span>
                  </td>
                  <td className="px-4 py-2 opacity-60">{p.status}</td>
                  <td className="px-4 py-2 text-right font-mono">{p.cpu.toFixed(1)}%</td>
                  <td className="px-4 py-2 text-right font-mono">{p.memory.toFixed(0)} MB</td>
                  <td className="px-4 py-2">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold uppercase",
                      p.type === 'App' ? "bg-blue-500/10 text-blue-600" : 
                      p.type === 'System' ? "bg-purple-500/10 text-purple-600" : 
                      "bg-slate-500/10 text-slate-600"
                    )}>
                      {p.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'Performance' && (
          <div className="p-6 grid grid-cols-2 gap-6">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-bold">CPU</span>
                </div>
                <span className="text-2xl font-mono font-bold text-blue-500">{totalCpu}%</span>
              </div>
              <div className="h-24 flex items-end gap-1">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-blue-500/20 rounded-t-sm transition-all duration-500"
                    style={{ height: `${Math.random() * 100}%` }}
                  />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-[10px] opacity-60 uppercase tracking-widest font-bold">
                <div>Base speed: 3.20 GHz</div>
                <div>Sockets: 1</div>
                <div>Cores: 8</div>
                <div>Logical processors: 16</div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-bold">Memory</span>
                </div>
                <span className="text-2xl font-mono font-bold text-emerald-500">{totalMem} MB</span>
              </div>
              <div className="h-24 flex items-end gap-1">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-emerald-500/20 rounded-t-sm transition-all duration-500"
                    style={{ height: `${60 + Math.random() * 20}%` }}
                  />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-[10px] opacity-60 uppercase tracking-widest font-bold">
                <div>In use: {totalMem} MB</div>
                <div>Available: {16384 - parseInt(totalMem)} MB</div>
                <div>Committed: 12.4/18.2 GB</div>
                <div>Cached: 4.2 GB</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Services' && (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10">
              <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-2 font-bold">Name</th>
                <th className="px-4 py-2 font-bold">PID</th>
                <th className="px-4 py-2 font-bold">Description</th>
                <th className="px-4 py-2 font-bold">Status</th>
                <th className="px-4 py-2 font-bold">Group</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {processes.filter(p => p.type === 'Background Service').map(p => (
                <tr key={p.id} className="group hover:bg-blue-500/5 border-b border-slate-100 dark:border-slate-900 transition-colors">
                  <td className="px-4 py-2 font-medium">{p.name}</td>
                  <td className="px-4 py-2 font-mono opacity-60">{Math.floor(Math.random() * 9000) + 1000}</td>
                  <td className="px-4 py-2 opacity-60">System service for {p.name.toLowerCase()}</td>
                  <td className="px-4 py-2">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                      p.status === 'Running' ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-600"
                    )}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 opacity-60">LocalSystem</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-[10px] opacity-60 font-bold uppercase tracking-widest">
        <div className="flex gap-4">
          <span>Processes: {processes.length}</span>
          <span>CPU Usage: {totalCpu}%</span>
          <span>Physical Memory: {((parseInt(totalMem) / 16384) * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3 text-emerald-500" />
          <span>System Secure</span>
        </div>
      </div>
    </div>
  );
};
