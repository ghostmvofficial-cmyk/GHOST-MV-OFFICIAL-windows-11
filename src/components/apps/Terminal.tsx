import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Shield, Zap, Search, RefreshCw, X, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CommandOutput {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  time: string;
}

export const Terminal: React.FC = () => {
  const [history, setHistory] = useState<CommandOutput[]>([
    { type: 'system', content: 'Windows Terminal [Version 10.0.22621.1778]', time: new Date().toLocaleTimeString() },
    { type: 'system', content: '(c) Microsoft Corporation. All rights reserved.', time: new Date().toLocaleTimeString() },
    { type: 'system', content: 'Ghost Secure Layer Active. Type "help" for commands.', time: new Date().toLocaleTimeString() },
  ]);
  const [input, setInput] = useState('');
  const [currentDir, setCurrentDir] = useState('C:\\Users\\GhostMV');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    const newHistory: CommandOutput[] = [...history, { type: 'input', content: `${currentDir}> ${input}`, time: new Date().toLocaleTimeString() }];

    switch (cmd) {
      case 'help':
        newHistory.push({ type: 'output', content: 'Available commands:\n  help - Show this help\n  clear - Clear terminal\n  ls / dir - List files\n  cd <dir> - Change directory\n  date - Show current date\n  whoami - Show current user\n  systeminfo - Show system information\n  ghost-scan - Scan for intrusions\n  echo <text> - Print text', time: new Date().toLocaleTimeString() });
        break;
      case 'clear':
      case 'cls':
        setHistory([]);
        setInput('');
        return;
      case 'ls':
      case 'dir':
        newHistory.push({ type: 'output', content: '  Documents\n  Downloads\n  Pictures\n  Videos\n  Desktop\n  GhostVault (Secure)', time: new Date().toLocaleTimeString() });
        break;
      case 'date':
        newHistory.push({ type: 'output', content: new Date().toString(), time: new Date().toLocaleTimeString() });
        break;
      case 'whoami':
        newHistory.push({ type: 'output', content: 'ghost-mv\\administrator', time: new Date().toLocaleTimeString() });
        break;
      case 'systeminfo':
        newHistory.push({ type: 'output', content: 'OS Name: Windows 11 Mobile\nOS Version: 10.0.22621 Build 22621\nSystem Manufacturer: Ghost Technologies\nSystem Model: Ghost Pro X\nProcessor: Ghost Silicon G1 @ 3.2GHz\nTotal Physical Memory: 16,384 MB', time: new Date().toLocaleTimeString() });
        break;
      case 'ghost-scan':
        newHistory.push({ type: 'system', content: '[GHOST]: Scanning system integrity...', time: new Date().toLocaleTimeString() });
        setTimeout(() => {
          setHistory(prev => [...prev, { type: 'system', content: '[GHOST]: No threats detected. System secure.', time: new Date().toLocaleTimeString() }]);
        }, 1500);
        break;
      default:
        if (cmd.startsWith('echo ')) {
          newHistory.push({ type: 'output', content: input.slice(5), time: new Date().toLocaleTimeString() });
        } else if (cmd.startsWith('cd ')) {
          const dir = input.slice(3);
          newHistory.push({ type: 'output', content: `Changed directory to ${dir}`, time: new Date().toLocaleTimeString() });
          setCurrentDir(`C:\\Users\\GhostMV\\${dir}`);
        } else {
          newHistory.push({ type: 'error', content: `'${cmd}' is not recognized as an internal or external command, operable program or batch file.`, time: new Date().toLocaleTimeString() });
        }
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0c] text-[#cccccc] font-mono p-4 overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar mb-4" ref={scrollRef}>
        <div className="space-y-1">
          {history.map((item, i) => (
            <div key={i} className={cn(
              "whitespace-pre-wrap text-xs leading-relaxed",
              item.type === 'input' ? "text-white font-bold" : 
              item.type === 'error' ? "text-red-400" : 
              item.type === 'system' ? "text-emerald-500" : "text-slate-300"
            )}>
              {item.content}
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleCommand} className="flex items-center gap-2 text-xs">
        <span className="text-emerald-500 font-bold whitespace-nowrap">{currentDir}&gt;</span>
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-white caret-emerald-500"
          autoFocus
          spellCheck={false}
        />
      </form>
    </div>
  );
};
