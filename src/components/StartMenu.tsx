import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Power, Settings, User, Moon, RefreshCw, Shield } from 'lucide-react';
import { APPS } from '../constants';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAppClick: (appId: string) => void;
  userProfile: UserProfile;
}

export const StartMenu: React.FC<StartMenuProps> = ({ isOpen, onClose, onAppClick, userProfile }) => {
  const [view, setView] = React.useState<'pinned' | 'all'>('pinned');
  const [isPowerMenuOpen, setIsPowerMenuOpen] = React.useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[9997]" 
            onClick={() => {
              onClose();
              setIsPowerMenuOpen(false);
              setView('pinned');
            }}
          />
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-14 left-1/2 -translate-x-1/2 w-[95vw] max-w-[640px] h-[600px] max-h-[85vh] win-glass win-shadow rounded-xl z-[9998] flex flex-col overflow-hidden"
          >
            {/* Search Bar */}
            <div className="p-6 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Type here to search"
                  className="w-full bg-white/50 dark:bg-black/20 border-b-2 border-blue-500 py-2 pl-10 pr-4 text-sm outline-none focus:bg-white dark:focus:bg-black/40 transition-all rounded-t"
                />
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar">
              {view === 'pinned' ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold">Pinned</h3>
                    <button 
                      onClick={() => setView('all')}
                      className="text-xs bg-white/30 px-2 py-1 rounded hover:bg-white/50 transition-colors"
                    >
                      All apps &gt;
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-y-6">
                    {APPS.slice(0, 18).map(app => (
                      <button
                        key={app.id}
                        onClick={() => {
                          onAppClick(app.id);
                          onClose();
                        }}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className="p-3 rounded hover:bg-white/20 transition-colors group-active:scale-90 transform">
                          <app.icon className={cn("w-8 h-8", app.color)} />
                        </div>
                        <span className="text-[11px] text-center leading-tight px-1">{app.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Recommended Section */}
                  <div className="mt-10">
                    <h3 className="text-sm font-semibold mb-4">Recommended</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { name: 'Get Started', time: 'Recently added', icon: Search },
                        { name: 'Ghost Vault Guide', time: '2h ago', icon: Shield },
                        { name: 'System Report', time: 'Yesterday', icon: Settings },
                        { name: 'Welcome.txt', time: '3h ago', icon: User }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/20 rounded cursor-pointer">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                            <item.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium">{item.name}</span>
                            <span className="text-[10px] opacity-60">{item.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold">All apps</h3>
                    <button 
                      onClick={() => setView('pinned')}
                      className="text-xs bg-white/30 px-2 py-1 rounded hover:bg-white/50 transition-colors"
                    >
                      &lt; Back
                    </button>
                  </div>
                  <div className="space-y-1">
                    {APPS.sort((a, b) => a.name.localeCompare(b.name)).map(app => (
                      <button
                        key={app.id}
                        onClick={() => {
                          onAppClick(app.id);
                          onClose();
                          setView('pinned');
                        }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-white/20 rounded transition-colors group"
                      >
                        <app.icon className={cn("w-5 h-5", app.color)} />
                        <span className="text-xs font-medium">{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="h-16 bg-black/5 dark:bg-white/5 flex items-center justify-between px-10 relative">
              <div 
                onClick={() => {
                  onAppClick('settings');
                  onClose();
                }}
                className="flex items-center gap-3 hover:bg-white/20 p-2 rounded cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                  {userProfile.avatar ? (
                    <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">{userProfile.name}</span>
                  <span className="text-[10px] opacity-50">{userProfile.role}</span>
                </div>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setIsPowerMenuOpen(!isPowerMenuOpen)}
                  className="p-2 hover:bg-white/20 rounded transition-colors"
                >
                  <Power className="w-5 h-5" />
                </button>

                <AnimatePresence>
                  {isPowerMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full right-0 mb-2 w-40 bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl py-1 z-50 overflow-hidden"
                    >
                      <button className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/10 transition-colors flex items-center gap-3">
                        <Moon size={14} className="opacity-60" /> Sleep
                      </button>
                      <button className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/10 transition-colors flex items-center gap-3">
                        <RefreshCw size={14} className="opacity-60" /> Restart
                      </button>
                      <button className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/10 transition-colors flex items-center gap-3">
                        <Power size={14} className="opacity-60" /> Shut down
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
