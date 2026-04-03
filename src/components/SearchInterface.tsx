import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Clock, TrendingUp, LayoutGrid } from 'lucide-react';
import { APPS } from '../constants';
import { cn } from '../lib/utils';

interface SearchInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onAppClick: (appId: string) => void;
}

export const SearchInterface: React.FC<SearchInterfaceProps> = ({ isOpen, onClose, onAppClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = APPS.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={onClose}
          />
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-1/2 -translate-x-1/2 bottom-14 w-[600px] max-w-[95vw] h-[500px] bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-2xl z-[9999] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Search Bar */}
            <div className="p-4 border-b border-white/10">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                <input 
                  type="text"
                  placeholder="Type here to search"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-white/5 border-b-2 border-blue-500 p-3 pl-12 rounded-lg outline-none text-sm transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {searchQuery ? (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold opacity-50 uppercase tracking-wider px-2">Apps</h3>
                  <div className="grid grid-cols-1 gap-1">
                    {filteredApps.map(app => (
                      <button
                        key={app.id}
                        onClick={() => {
                          onAppClick(app.id);
                          onClose();
                        }}
                        className="flex items-center gap-4 p-3 hover:bg-white/20 dark:hover:bg-white/5 rounded-xl transition-all text-left group"
                      >
                        <div className={cn("p-2 rounded-lg bg-white dark:bg-white/5 shadow-sm group-hover:scale-110 transition-transform", app.color)}>
                          <app.icon size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{app.name}</span>
                          <span className="text-[10px] opacity-50">App</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-8">
                  {/* Recent */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold opacity-50 uppercase tracking-wider flex items-center gap-2">
                      <Clock size={14} />
                      Recent
                    </h3>
                    <div className="space-y-1">
                      {APPS.slice(0, 4).map(app => (
                        <button
                          key={app.id}
                          onClick={() => {
                            onAppClick(app.id);
                            onClose();
                          }}
                          className="w-full flex items-center gap-3 p-2 hover:bg-white/20 dark:hover:bg-white/5 rounded-lg transition-colors text-left"
                        >
                          <app.icon size={16} className={app.color} />
                          <span className="text-sm">{app.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Searches */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold opacity-50 uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp size={14} />
                      Quick Searches
                    </h3>
                    <div className="space-y-2">
                      {['Today in history', 'New movies', 'Translate', 'Weather'].map(query => (
                        <button
                          key={query}
                          className="w-full flex items-center gap-3 p-2 hover:bg-white/20 dark:hover:bg-white/5 rounded-lg transition-colors text-left text-sm"
                        >
                          <Search size={14} className="text-blue-500" />
                          <span>{query}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-white/5 border-t border-white/10 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-[10px] opacity-50">
                <LayoutGrid size={12} />
                <span>All Apps</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] opacity-50">
                <Search size={12} />
                <span>Web Search</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
