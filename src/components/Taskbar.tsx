import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Wifi, 
  Volume2, 
  Volume1,
  VolumeX,
  Battery, 
  ChevronUp, 
  Search,
  LayoutGrid,
  Plus,
  X,
  Layers
} from 'lucide-react';
import { APPS } from '../constants';
import { cn } from '../lib/utils';
import { Desktop } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface TaskbarProps {
  onStartClick: () => void;
  onSearchClick: () => void;
  onNotificationClick: () => void;
  notificationCount?: number;
  volume?: number;
  openWindows: any[];
  activeWindowId: string | null;
  onAppClick: (appId: string) => void;
  desktops: Desktop[];
  activeDesktopId: string;
  onSwitchDesktop: (id: string) => void;
  onCreateDesktop: () => void;
  onDeleteDesktop: (id: string) => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({ 
  onStartClick, 
  onSearchClick,
  onNotificationClick,
  notificationCount = 0,
  volume = 75,
  openWindows, 
  activeWindowId,
  onAppClick,
  desktops,
  activeDesktopId,
  onSwitchDesktop,
  onCreateDesktop,
  onDeleteDesktop
}) => {
  const [time, setTime] = useState(new Date());
  const [isTaskViewOpen, setIsTaskViewOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getVolumeIcon = (vol: number) => {
    if (vol === 0) return VolumeX;
    if (vol < 30) return Volume1;
    return Volume2;
  };

  const VolIcon = getVolumeIcon(volume);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 win-glass flex items-center justify-between px-3 z-[9999]">
      {/* Left side: Widgets/Weather (simplified) */}
      <div className="hidden md:flex items-center gap-2 w-32">
        <div className="text-xs font-medium">Cloudy 22°C</div>
      </div>

      {/* Center: Apps */}
      <div className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
        <button 
          onClick={onStartClick}
          className="p-2 hover:bg-white/20 rounded transition-colors"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/Windows_logo_-_2021.svg" className="w-5 h-5" alt="Start" />
        </button>
        
        {/* Search Bar */}
        <button 
          onClick={onSearchClick}
          className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/5 rounded-md transition-all w-48 group"
        >
          <Search className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs text-slate-700 dark:text-slate-200 opacity-60">Search</span>
        </button>

        {/* Mobile Search Icon */}
        <button 
          onClick={onSearchClick}
          className="sm:hidden p-2 hover:bg-white/20 rounded transition-colors"
        >
          <Search className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>

        {/* Task View Icon */}
        <button 
          onClick={() => setIsTaskViewOpen(!isTaskViewOpen)}
          className={cn(
            "p-2 hover:bg-white/20 rounded transition-colors relative",
            isTaskViewOpen && "bg-white/30"
          )}
        >
          <Layers className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Task View
          </div>
        </button>

        <div className="h-6 w-px bg-slate-400/30 mx-1" />

        {APPS.slice(0, 5).map(app => (
          <button
            key={app.id}
            onClick={() => onAppClick(app.id)}
            className={cn(
              "p-2 hover:bg-white/20 rounded transition-all relative group",
              activeWindowId === app.id && "bg-white/30"
            )}
          >
            <app.icon className={cn("w-5 h-5", app.color)} />
            {openWindows.some(w => w.appId === app.id) && (
              <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-0.5 bg-blue-500 rounded-full" />
            )}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {app.name}
            </div>
          </button>
        ))}
      </div>

      {/* Right side: System Tray */}
      <div className="flex items-center gap-1">
        <button className="p-1.5 hover:bg-white/20 rounded">
          <ChevronUp className="w-4 h-4" />
        </button>
        
        <div 
          onClick={onNotificationClick}
          className="flex items-center gap-2 px-3 py-1 hover:bg-white/20 rounded-md transition-colors cursor-default group"
        >
          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <Wifi className="w-3.5 h-3.5" />
            <VolIcon className="w-3.5 h-3.5" />
            <Battery className="w-3.5 h-3.5" />
          </div>
          
          <div className="h-4 w-px bg-slate-400/30 mx-1" />

          <div className="flex flex-col items-end text-[11px] leading-tight relative">
            {notificationCount > 0 && (
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 text-white text-[9px] flex items-center justify-center rounded-full border border-slate-900 shadow-lg">
                {notificationCount}
              </div>
            )}
            <span className="font-medium">{format(time, 'h:mm a')}</span>
            <span className="opacity-60">{format(time, 'M/d/yyyy')}</span>
          </div>
        </div>
        
        <div className="w-1.5 h-full border-l border-slate-400/30 ml-1" />
      </div>

      {/* Task View Popover */}
      <AnimatePresence>
        {isTaskViewOpen && (
          <>
            <div 
              className="fixed inset-0 z-[-1]" 
              onClick={() => setIsTaskViewOpen(false)}
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-14 left-1/2 -translate-x-1/2 w-[90vw] max-w-4xl bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Desktops</h3>
                <button 
                  onClick={onCreateDesktop}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  New Desktop
                </button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {desktops.map((desktop, index) => {
                  const desktopWindows = openWindows.filter(w => w.desktopId === desktop.id);
                  return (
                    <div 
                      key={desktop.id}
                      className="flex flex-col gap-2 min-w-[200px]"
                    >
                      <div 
                        onClick={() => {
                          onSwitchDesktop(desktop.id);
                          setIsTaskViewOpen(false);
                        }}
                        className={cn(
                          "aspect-video rounded-xl border-2 transition-all cursor-pointer group relative overflow-hidden bg-slate-800/50",
                          activeDesktopId === desktop.id ? "border-blue-500 scale-100 shadow-lg shadow-blue-500/20" : "border-white/10 hover:border-white/30 scale-95"
                        )}
                      >
                        {/* Desktop Preview Content */}
                        <div className="absolute inset-0 p-2 grid grid-cols-2 gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          {desktopWindows.slice(0, 4).map(win => {
                            const app = APPS.find(a => a.id === win.id);
                            return (
                              <div key={win.id} className="bg-white/10 rounded-sm flex items-center justify-center p-1">
                                {app && <app.icon className={cn("w-4 h-4", app.color)} />}
                              </div>
                            );
                          })}
                        </div>
                        
                        {desktops.length > 1 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteDesktop(desktop.id);
                            }}
                            className="absolute top-2 right-2 p-1 bg-black/40 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                      <span className={cn(
                        "text-xs text-center font-medium",
                        activeDesktopId === desktop.id ? "text-blue-400" : "text-white/60"
                      )}>
                        {desktop.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
