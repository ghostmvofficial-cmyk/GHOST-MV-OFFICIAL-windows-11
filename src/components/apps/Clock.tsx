import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon, Timer, Hourglass, Globe, Play, Pause, RefreshCw, Plus, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ClockApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Clock' | 'Stopwatch' | 'Timer' | 'World'>('Clock');
  const [time, setTime] = useState(new Date());
  
  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  // Timer state
  const [timerTime, setTimerTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInput, setTimerInput] = useState('00:00:00');

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStopwatchRunning) {
      interval = setInterval(() => setStopwatchTime(prev => prev + 10), 10);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerTime > 0) {
      interval = setInterval(() => setTimerTime(prev => prev - 1), 1000);
    } else if (timerTime === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerTime]);

  const formatStopwatch = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const formatTimer = (s: number) => {
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar / Tabs */}
      <div className="flex items-center justify-center gap-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        {(['Clock', 'Stopwatch', 'Timer', 'World'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all group",
              activeTab === tab ? "text-blue-500" : "opacity-40 hover:opacity-100"
            )}
          >
            {tab === 'Clock' && <ClockIcon size={20} />}
            {tab === 'Stopwatch' && <Timer size={20} />}
            {tab === 'Timer' && <Hourglass size={20} />}
            {tab === 'World' && <Globe size={20} />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{tab}</span>
            {activeTab === tab && <div className="w-4 h-0.5 bg-blue-500 rounded-full mt-1" />}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {activeTab === 'Clock' && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-8xl font-light tracking-tighter font-mono">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </div>
            <div className="text-xl opacity-40 font-medium tracking-wide uppercase">
              {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            
            <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase opacity-40">Next Alarm</span>
                  <span className="text-sm font-bold">07:30 AM</span>
                </div>
                <div className="w-8 h-4 bg-blue-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase opacity-40">Bedtime</span>
                  <span className="text-sm font-bold">10:30 PM</span>
                </div>
                <div className="w-8 h-4 bg-slate-300 dark:bg-slate-700 rounded-full relative">
                  <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Stopwatch' && (
          <div className="flex flex-col items-center gap-8 w-full max-w-md">
            <div className="text-8xl font-light tracking-tighter font-mono tabular-nums">
              {formatStopwatch(stopwatchTime)}
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg",
                  isStopwatchRunning ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                )}
              >
                {isStopwatchRunning ? <Pause className="text-white" /> : <Play className="text-white ml-1" />}
              </button>
              <button 
                onClick={() => {
                  if (isStopwatchRunning) {
                    setLaps(prev => [stopwatchTime, ...prev]);
                  } else {
                    setStopwatchTime(0);
                    setLaps([]);
                  }
                }}
                className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-all"
              >
                {isStopwatchRunning ? <Plus size={20} /> : <RefreshCw size={20} />}
              </button>
            </div>

            <div className="w-full max-h-48 overflow-y-auto custom-scrollbar space-y-2">
              {laps.map((lap, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm">
                  <span className="opacity-40 font-bold">Lap {laps.length - i}</span>
                  <span className="font-mono">{formatStopwatch(lap)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Timer' && (
          <div className="flex flex-col items-center gap-8 w-full max-w-md">
            <div className="text-8xl font-light tracking-tighter font-mono tabular-nums">
              {formatTimer(timerTime)}
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                disabled={timerTime === 0}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg",
                  isTimerRunning ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600",
                  timerTime === 0 && "opacity-50 cursor-not-allowed"
                )}
              >
                {isTimerRunning ? <Pause className="text-white" /> : <Play className="text-white ml-1" />}
              </button>
              <button 
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerTime(0);
                }}
                className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-all"
              >
                <RefreshCw size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full">
              {[1, 5, 10, 15, 30, 60].map(mins => (
                <button
                  key={mins}
                  onClick={() => setTimerTime(mins * 60)}
                  className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold hover:bg-blue-500/10 hover:border-blue-500/20 transition-all"
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'World' && (
          <div className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">World Clock</h3>
              <button className="p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all">
                <Plus size={20} />
              </button>
            </div>
            {[
              { city: 'San Francisco', tz: 'America/Los_Angeles', offset: '-7h' },
              { city: 'London', tz: 'Europe/London', offset: '+1h' },
              { city: 'Tokyo', tz: 'Asia/Tokyo', offset: '+9h' },
              { city: 'New York', tz: 'America/New_York', offset: '-4h' }
            ].map(loc => {
              const locTime = new Date(new Date().toLocaleString('en-US', { timeZone: loc.tz }));
              return (
                <div key={loc.city} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{loc.city}</span>
                    <span className="text-[10px] opacity-40 uppercase font-bold">{loc.offset} from local</span>
                  </div>
                  <div className="text-2xl font-mono font-medium">
                    {locTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
