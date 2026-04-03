import React, { useState, useEffect } from 'react';
import { FileText, Save, Share2, Trash2, Search, RefreshCw, X, ChevronRight, ZoomIn, ZoomOut, Type, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const Notepad: React.FC = () => {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('Untitled.txt');
  const [isSaved, setIsSaved] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<'close' | 'blur' | null>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  const handleSave = () => {
    setIsSaved(true);
    // Simulation of saving
    console.log('Saving content:', content);
    setShowSavePrompt(false);
    
    // If we were waiting for a close after save
    if (pendingAction === 'close') {
      window.dispatchEvent(new CustomEvent('app-close-confirmed-notepad'));
    }
    setPendingAction(null);
  };

  const handleDiscard = () => {
    setIsSaved(true);
    setShowSavePrompt(false);
    if (pendingAction === 'close') {
      window.dispatchEvent(new CustomEvent('app-close-confirmed-notepad'));
    }
    setPendingAction(null);
  };

  // Handle focus loss
  useEffect(() => {
    const handleBlur = (e: any) => {
      // Check if it's a simulated window focus change
      const activeId = e.detail?.activeId;
      const isSimulatedBlur = activeId !== undefined && activeId !== 'notepad';
      const isWindowBlur = e.type === 'blur';

      if ((isSimulatedBlur || isWindowBlur) && !isSaved && content.trim() !== '') {
        setPendingAction('blur');
        setShowSavePrompt(true);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('window-focus-change', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('window-focus-change', handleBlur);
    };
  }, [isSaved, content]);

  // Handle simulated app close
  useEffect(() => {
    const handleCloseRequest = (e: any) => {
      if (!isSaved && content.trim() !== '') {
        e.preventDefault();
        setPendingAction('close');
        setShowSavePrompt(true);
      }
    };

    window.addEventListener('app-close-request-notepad', handleCloseRequest);
    return () => window.removeEventListener('app-close-request-notepad', handleCloseRequest);
  }, [isSaved, content]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative">
      <AnimatePresence>
        {showSavePrompt && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-xs w-full"
            >
              <div className="flex items-center gap-3 mb-4 text-amber-500">
                <AlertCircle size={24} />
                <h3 className="font-bold text-sm">Unsaved Changes</h3>
              </div>
              <p className="text-xs opacity-70 mb-6 leading-relaxed">
                Do you want to save changes to <span className="font-bold text-slate-900 dark:text-white">{fileName}</span>?
              </p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleSave}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Save Changes
                </button>
                <button 
                  onClick={handleDiscard}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Don't Save
                </button>
                <button 
                  onClick={() => { setShowSavePrompt(false); setPendingAction(null); }}
                  className="w-full py-2 text-xs font-medium opacity-50 hover:opacity-100 transition-opacity"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Menu Bar */}
      <div className="flex items-center gap-4 px-4 py-1 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium opacity-60">
        <button className="hover:text-blue-500 transition-colors">File</button>
        <button className="hover:text-blue-500 transition-colors">Edit</button>
        <button className="hover:text-blue-500 transition-colors">Format</button>
        <button className="hover:text-blue-500 transition-colors">View</button>
        <button className="hover:text-blue-500 transition-colors">Help</button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-bold">{fileName}{!isSaved && '*'}</span>
          </div>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
          <button 
            onClick={handleSave}
            disabled={isSaved}
            className={cn(
              "p-1.5 rounded transition-colors",
              isSaved ? "opacity-30 cursor-default" : "hover:bg-blue-500/10 text-blue-500"
            )}
            title="Save (Ctrl+S)"
          >
            <Save size={16} />
          </button>
          <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
            <Share2 size={16} className="opacity-60" />
          </button>
          
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
          
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setFontSize(prev => Math.max(8, prev - 2))}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-all active:scale-90"
              title="Decrease Font Size"
            >
              <ZoomOut size={14} className="opacity-60" />
            </button>
            <div className="flex items-center gap-1 px-2 min-w-[40px] justify-center">
              <Type size={12} className="opacity-40" />
              <span className="text-[10px] font-bold font-mono">{fontSize}</span>
            </div>
            <button 
              onClick={() => setFontSize(prev => Math.min(72, prev + 2))}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-all active:scale-90"
              title="Increase Font Size"
            >
              <ZoomIn size={14} className="opacity-60" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] opacity-40 font-bold uppercase tracking-widest">
          <span>UTF-8</span>
          <span>Windows (CRLF)</span>
          <span>100%</span>
        </div>
      </div>

      {/* Editor Area */}
      <textarea 
        value={content}
        onChange={handleContentChange}
        style={{ fontSize: `${fontSize}px` }}
        className="flex-1 w-full p-6 outline-none resize-none bg-transparent font-mono leading-relaxed custom-scrollbar"
        placeholder="Start typing..."
        spellCheck={false}
        autoFocus
      />

      {/* Status Bar */}
      <div className="px-4 py-1 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] opacity-60 font-bold uppercase tracking-widest">
        <div className="flex gap-4">
          <span>Ln 1, Col {content.length + 1}</span>
          <span>{content.split('\n').length} lines</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Windows 11 Mobile</span>
        </div>
      </div>
    </div>
  );
};
