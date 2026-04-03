import React, { useState, useRef, useEffect } from 'react';
import { motion, useDragControls, AnimatePresence } from 'motion/react';
import { X, Minus, Square, Maximize2, MoreVertical, ArrowRightLeft, Layout } from 'lucide-react';
import { cn } from '../lib/utils';
import { Desktop, SnapType } from '../types';

interface WindowProps {
  id: string;
  title: string;
  icon: any;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  snapType?: SnapType;
  zIndex: number;
  isActive?: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onSnap?: (snapType: SnapType) => void;
  onFocus: () => void;
  onMoveToDesktop?: (desktopId: string) => void;
  desktops?: Desktop[];
  currentDesktopId?: string;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({
  id,
  title,
  icon: Icon,
  isOpen,
  isMinimized,
  isMaximized,
  snapType = 'none',
  zIndex,
  isActive,
  onClose,
  onMinimize,
  onMaximize,
  onSnap,
  onFocus,
  onMoveToDesktop,
  desktops = [],
  currentDesktopId,
  children
}) => {
  const controls = useDragControls();
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isSnapMenuOpen, setIsSnapMenuOpen] = useState(false);
  const snapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const windowStyle = React.useMemo(() => {
    if (isMaximized) {
      return {
        width: '100%',
        height: 'calc(100% - 48px)',
        top: 0,
        left: 0,
        borderRadius: 0,
      };
    }

    switch (snapType) {
      case 'left':
        return { width: '50%', height: 'calc(100% - 48px)', top: 0, left: 0, borderRadius: 0 };
      case 'right':
        return { width: '50%', height: 'calc(100% - 48px)', top: 0, left: '50%', borderRadius: 0 };
      case 'top-left':
        return { width: '50%', height: 'calc(50% - 24px)', top: 0, left: 0, borderRadius: 0 };
      case 'top-right':
        return { width: '50%', height: 'calc(50% - 24px)', top: 0, left: '50%', borderRadius: 0 };
      case 'bottom-left':
        return { width: '50%', height: 'calc(50% - 24px)', top: 'calc(50% - 24px)', left: 0, borderRadius: 0 };
      case 'bottom-right':
        return { width: '50%', height: 'calc(50% - 24px)', top: 'calc(50% - 24px)', left: '50%', borderRadius: 0 };
      case 'left-two-thirds':
        return { width: '66.66%', height: 'calc(100% - 48px)', top: 0, left: 0, borderRadius: 0 };
      case 'right-two-thirds':
        return { width: '66.66%', height: 'calc(100% - 48px)', top: 0, left: '33.33%', borderRadius: 0 };
      case 'left-one-third':
        return { width: '33.33%', height: 'calc(100% - 48px)', top: 0, left: 0, borderRadius: 0 };
      case 'center-one-third':
        return { width: '33.33%', height: 'calc(100% - 48px)', top: 0, left: '33.33%', borderRadius: 0 };
      case 'right-one-third':
        return { width: '33.33%', height: 'calc(100% - 48px)', top: 0, left: '66.66%', borderRadius: 0 };
      default:
        return { width: '800px', height: '500px', top: '10%', left: '15%', borderRadius: '8px' };
    }
  }, [isMaximized, snapType]);

  if (!isOpen || isMinimized) return null;

  return (
    <motion.div
      drag={!isMaximized && snapType === 'none'}
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        ...windowStyle
      }}
      style={{ zIndex }}
      onPointerDown={onFocus}
      className={cn(
        "fixed win-glass win-shadow flex flex-col overflow-hidden transition-all duration-300",
        (isMaximized || snapType !== 'none') ? "rounded-none" : "rounded-lg border border-white/20"
      )}
    >
      {/* Title Bar */}
      <div 
        className="h-9 flex items-center justify-between px-3 bg-white/40 dark:bg-black/20 cursor-default"
        onPointerDown={(e) => controls.start(e)}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-medium">{title}</span>
          
          {desktops.length > 1 && onMoveToDesktop && (
            <div className="relative ml-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDesktopMenuOpen(!isDesktopMenuOpen);
                }}
                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                title="Move to desktop"
              >
                <ArrowRightLeft className="w-3 h-3 opacity-60" />
              </button>
              
              <AnimatePresence>
                {isDesktopMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-[-1]" 
                      onClick={() => setIsDesktopMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-1 w-40 bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl py-1 z-50"
                    >
                      <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/40 font-bold">
                        Move to desktop
                      </div>
                      {desktops.map(desktop => (
                        <button
                          key={desktop.id}
                          disabled={desktop.id === currentDesktopId}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveToDesktop(desktop.id);
                            setIsDesktopMenuOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-1.5 text-xs transition-colors",
                            desktop.id === currentDesktopId 
                              ? "text-blue-400 bg-blue-500/10 cursor-default" 
                              : "text-white hover:bg-white/10"
                          )}
                        >
                          {desktop.name}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        
        <div className="flex items-center h-full">
          <button 
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="h-full px-4 hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button 
            onMouseEnter={() => {
              if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
              setIsSnapMenuOpen(true);
            }}
            onMouseLeave={() => {
              snapTimeoutRef.current = setTimeout(() => setIsSnapMenuOpen(false), 300);
            }}
            onClick={(e) => { e.stopPropagation(); onMaximize(); setIsSnapMenuOpen(false); }}
            className="h-full px-4 hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center relative"
          >
            {isMaximized ? <Square className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            
            <AnimatePresence>
              {isSnapMenuOpen && onSnap && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-1 p-3 bg-slate-800/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl z-[100] w-64"
                  onMouseEnter={() => {
                    if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
                  }}
                  onMouseLeave={() => {
                    setIsSnapMenuOpen(false);
                  }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {/* 50/50 Split */}
                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Split</div>
                      <div className="grid grid-cols-2 gap-1.5 h-16">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSnap('left'); setIsSnapMenuOpen(false); }}
                          className="bg-white/10 hover:bg-blue-500/40 rounded-md border border-white/5 transition-all hover:scale-[1.02] active:scale-95"
                        />
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSnap('right'); setIsSnapMenuOpen(false); }}
                          className="bg-white/10 hover:bg-blue-500/40 rounded-md border border-white/5 transition-all hover:scale-[1.02] active:scale-95"
                        />
                      </div>
                    </div>

                    {/* 70/30 Split */}
                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Priority</div>
                      <div className="grid grid-cols-3 gap-1.5 h-16">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSnap('left-two-thirds'); setIsSnapMenuOpen(false); }}
                          className="col-span-2 bg-white/10 hover:bg-blue-500/40 rounded-md border border-white/5 transition-all hover:scale-[1.02] active:scale-95"
                        />
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSnap('right-one-third'); setIsSnapMenuOpen(false); }}
                          className="bg-white/10 hover:bg-blue-500/40 rounded-md border border-white/5 transition-all hover:scale-[1.02] active:scale-95"
                        />
                      </div>
                    </div>

                    {/* Three Columns */}
                    <div className="flex flex-col gap-2 col-span-2">
                      <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Three Columns</div>
                      <div className="grid grid-cols-3 gap-1.5 h-16">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSnap('left-one-third'); setIsSnapMenuOpen(false); }}
                          className="bg-white/10 hover:bg-blue-500/40 rounded-md border border-white/5 transition-all hover:scale-[1.02] active:scale-95"
                        />
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSnap('center-one-third'); setIsSnapMenuOpen(false); }}
                          className="bg-white/10 hover:bg-blue-500/40 rounded-md border border-white/5 transition-all hover:scale-[1.02] active:scale-95"
                        />
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSnap('right-one-third'); setIsSnapMenuOpen(false); }}
                          className="bg-white/10 hover:bg-blue-500/40 rounded-md border border-white/5 transition-all hover:scale-[1.02] active:scale-95"
                        />
                      </div>
                    </div>

                    {/* Quadrants */}
                    <div className="flex flex-col gap-2 col-span-2">
                      <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Quadrants</div>
                      <div className="grid grid-cols-2 grid-rows-2 gap-1.5 h-24">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSnap('top-left'); setIsSnapMenuOpen(false); }}
                          className="bg-white/10 hover:bg-blue-500/40 rounded-md border border-white/5 transition-all hover:scale-[1.02] active:scale-95"
                        />
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSnap('top-right'); setIsSnapMenuOpen(false); }}
                          className="bg-white/10 hover:bg-blue-500/40 rounded-md border border-white/5 transition-all hover:scale-[1.02] active:scale-95"
                        />
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSnap('bottom-left'); setIsSnapMenuOpen(false); }}
                          className="bg-white/10 hover:bg-blue-500/40 rounded-md border border-white/5 transition-all hover:scale-[1.02] active:scale-95"
                        />
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSnap('bottom-right'); setIsSnapMenuOpen(false); }}
                          className="bg-white/10 hover:bg-blue-500/40 rounded-md border border-white/5 transition-all hover:scale-[1.02] active:scale-95"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="h-full px-4 hover:bg-red-500 hover:text-white transition-colors flex items-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white/80 dark:bg-slate-900/90 overflow-auto">
        {children}
      </div>
    </motion.div>
  );
};
