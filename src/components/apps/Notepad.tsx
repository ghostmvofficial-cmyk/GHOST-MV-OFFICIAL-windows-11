import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, Save, Share2, Trash2, Search, RefreshCw, X, ChevronRight, ZoomIn, ZoomOut, Type, AlertCircle, Undo, Redo, AlignLeft, WrapText, Bold, Italic, List, Languages } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const Notepad: React.FC = () => {
  const [content, setContent] = useState('');
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [fileName, setFileName] = useState('Untitled.txt');
  const [isSaved, setIsSaved] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('monospace');
  const [fontColor, setFontColor] = useState('#000000');
  const [fontWeight, setFontWeight] = useState('normal');
  const [fontStyle, setFontStyle] = useState('normal');
  const [wordWrap, setWordWrap] = useState(true);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showFontDialog, setShowFontDialog] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [isSpellCheckEnabled, setIsSpellCheckEnabled] = useState(true);
  const [searchIndex, setSearchIndex] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState<{line: number, snippet: string, index: number}[]>([]);
  const [showSearchResultsPanel, setShowSearchResultsPanel] = useState(false);
  const [pendingAction, setPendingAction] = useState<'close' | 'blur' | null>(null);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [misspelledWords, setMisspelledWords] = useState<{word: string, index: number}[]>([]);
  const [suggestionPopover, setSuggestionPopover] = useState<{x: number, y: number, word: string, suggestions: string[]} | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Simple dictionary for spell check demo
  const dictionary = new Set(['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'notepad', 'hello', 'world', 'react', 'javascript', 'typescript', 'tailwind', 'css', 'html', 'editor', 'text', 'file', 'save', 'edit', 'format', 'view', 'help', 'find', 'replace', 'bold', 'italic', 'font', 'size', 'color', 'wrap', 'undo', 'redo', 'status', 'bar', 'line', 'column', 'character', 'word', 'spell', 'check', 'suggestion', 'auto', 'save', 'restore', 'launch', 'local', 'storage', 'content', 'Untitled', 'txt', 'Windows', 'Mobile', 'UTF-8', 'CRLF']);

  // Load from local storage on launch
  useEffect(() => {
    const savedContent = localStorage.getItem('notepad_autosave_content');
    if (savedContent && savedContent !== content) {
      setShowRestorePrompt(true);
    }
  }, []);

  const handleRestore = () => {
    const savedContent = localStorage.getItem('notepad_autosave_content');
    if (savedContent) {
      setContent(savedContent);
      setIsSaved(true);
    }
    setShowRestorePrompt(false);
  };

  // Spell check logic
  const performSpellCheck = useCallback((text: string) => {
    if (!isSpellCheckEnabled) {
      setMisspelledWords([]);
      return;
    }
    const words = text.split(/(\s+|[.,!?;:()"'[\]{}])/);
    const misspelled: {word: string, index: number}[] = [];
    let currentIndex = 0;

    words.forEach(part => {
      const word = part.trim().replace(/[^a-zA-Z]/g, '');
      if (word && word.length > 1 && !dictionary.has(word.toLowerCase())) {
        misspelled.push({ word, index: currentIndex });
      }
      currentIndex += part.length;
    });
    setMisspelledWords(misspelled);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSpellCheck(content);
    }, 500);
    return () => clearTimeout(timer);
  }, [content, performSpellCheck, isSpellCheckEnabled]);

  const getSuggestions = (word: string) => {
    // Very simple suggestion logic: find words in dictionary that start with same letter
    return Array.from(dictionary)
      .filter(w => w.startsWith(word[0].toLowerCase()) && w.length > 2)
      .slice(0, 3);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isSpellCheckEnabled) return;
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Find the word under the cursor
    const pos = textarea.selectionStart;
    const text = textarea.value;
    
    let start = pos;
    while (start > 0 && /[a-zA-Z]/.test(text[start - 1])) start--;
    
    let end = pos;
    while (end < text.length && /[a-zA-Z]/.test(text[end])) end++;
    
    const word = text.substring(start, end);
    // Check if this specific instance is misspelled
    const misspelled = misspelledWords.find(m => m.index === start);

    if (misspelled) {
      e.preventDefault();
      const suggestions = getSuggestions(word);
      setSuggestionPopover({
        x: e.clientX,
        y: e.clientY,
        word: word,
        suggestions: suggestions
      });
    }
  };

  const applySuggestion = (suggestion: string) => {
    if (!suggestionPopover || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const text = textarea.value;
    const word = suggestionPopover.word;
    
    // Find all occurrences of this misspelled word and replace the one near the click?
    // Actually, let's just replace the one at the current selection if it matches.
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // For simplicity, let's find the word boundaries around the selection
    let wordStart = start;
    while (wordStart > 0 && /[a-zA-Z]/.test(text[wordStart - 1])) wordStart--;
    let wordEnd = start;
    while (wordEnd < text.length && /[a-zA-Z]/.test(text[wordEnd])) wordEnd++;
    
    const currentWord = text.substring(wordStart, wordEnd);
    if (currentWord.toLowerCase() === word.toLowerCase()) {
      const newContent = text.substring(0, wordStart) + suggestion + text.substring(wordEnd);
      setContent(newContent);
      setIsSaved(false);
    }
    
    setSuggestionPopover(null);
  };

  // Zoom shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setFontSize(prev => Math.min(72, prev + 2));
        } else if (e.key === '-') {
          e.preventDefault();
          setFontSize(prev => Math.max(8, prev - 2));
        } else if (e.key === '0') {
          e.preventDefault();
          setFontSize(14);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setIsSaved(false);
    
    // Update history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    updateCursorPos(e.target);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setContent(history[prevIndex]);
      setHistoryIndex(prevIndex);
      setIsSaved(false);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setContent(history[nextIndex]);
      setHistoryIndex(nextIndex);
      setIsSaved(false);
    }
  };

  const handleFormat = (command: string) => {
    // Note: Since we are using a textarea, we can't do real rich text bold/italic on selection
    // unless we switch to contenteditable. However, for "Notepad", we can simulate it
    // by wrapping selection in markdown-like tags or just applying it globally if requested.
    // The user specifically asked for "selected text bold or italic".
    // I will implement a helper that wraps selection in ** or * for now, 
    // OR I will switch to a contenteditable div if I want true visual bolding.
    // Let's try the markdown approach first as it's safer for "Notepad".
    // Actually, I'll use a hidden contenteditable trick or just apply it to the selection.
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (command === 'bold') {
      const newText = content.substring(0, start) + `**${selectedText}**` + content.substring(end);
      setContent(newText);
    } else if (command === 'italic') {
      const newText = content.substring(0, start) + `*${selectedText}*` + content.substring(end);
      setContent(newText);
    }
    setIsSaved(false);
  };

  const updateCursorPos = (textarea: HTMLTextAreaElement) => {
    const textBeforeCursor = textarea.value.substring(0, textarea.selectionStart);
    const lines = textBeforeCursor.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    });
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

  const handleFind = (direction: 'next' | 'prev' = 'next') => {
    if (!findText) return;
    
    const searchContent = isCaseSensitive ? content : content.toLowerCase();
    const searchTerm = isCaseSensitive ? findText : findText.toLowerCase();
    
    let index = -1;
    const textarea = textareaRef.current;
    const currentPos = textarea ? textarea.selectionStart : searchIndex;

    if (direction === 'next') {
      index = searchContent.indexOf(searchTerm, currentPos + 1);
      if (index === -1) {
        index = searchContent.indexOf(searchTerm, 0); // Wrap around
      }
    } else {
      index = searchContent.lastIndexOf(searchTerm, currentPos - 1);
      if (index === -1) {
        index = searchContent.lastIndexOf(searchTerm, searchContent.length); // Wrap around
      }
    }

    if (index !== -1) {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(index, index + findText.length);
        setSearchIndex(index + findText.length);
        setCurrentMatchIndex(index);
        
        // Scroll into view if needed
        const lineHeight = fontSize * 1.5;
        const lineCount = content.substring(0, index).split('\n').length;
        textarea.scrollTop = (lineCount - 5) * lineHeight;
      }
    }
  };

  const handleReplace = () => {
    if (!findText) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const match = isCaseSensitive 
      ? selectedText === findText 
      : selectedText.toLowerCase() === findText.toLowerCase();

    if (match) {
      const newContent = content.substring(0, start) + replaceText + content.substring(end);
      setContent(newContent);
      setIsSaved(false);
      
      // Move to next
      setTimeout(() => {
        handleFind('next');
      }, 0);
    } else {
      handleFind('next');
    }
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    
    let newContent = '';
    if (isCaseSensitive) {
      newContent = content.split(findText).join(replaceText);
    } else {
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      newContent = content.replace(regex, replaceText);
    }

    if (newContent !== content) {
      setContent(newContent);
      setIsSaved(false);
    }
  };

  const handleFindAll = () => {
    if (!findText) return;
    
    const searchContent = isCaseSensitive ? content : content.toLowerCase();
    const searchTerm = isCaseSensitive ? findText : findText.toLowerCase();
    const results: {line: number, snippet: string, index: number}[] = [];
    
    let index = searchContent.indexOf(searchTerm);
    while (index !== -1) {
      const linesBefore = content.substring(0, index).split('\n');
      const lineNumber = linesBefore.length;
      
      // Get snippet
      const start = Math.max(0, index - 20);
      const end = Math.min(content.length, index + findText.length + 20);
      let snippet = content.substring(start, end).replace(/\n/g, ' ');
      if (start > 0) snippet = '...' + snippet;
      if (end < content.length) snippet = snippet + '...';
      
      results.push({ line: lineNumber, snippet, index });
      index = searchContent.indexOf(searchTerm, index + 1);
    }
    
    setSearchResults(results);
    setShowSearchResultsPanel(results.length > 0);
    if (results.length > 0) {
      setShowFindReplace(false);
    }
  };

  const jumpToMatch = (index: number) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(index, index + findText.length);
      setCurrentMatchIndex(index);
      
      // Scroll into view
      const lineHeight = fontSize * 1.625;
      const lineCount = content.substring(0, index).split('\n').length;
      textarea.scrollTop = (lineCount - 5) * lineHeight;
    }
  };

  // Auto-save feature
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (!isSaved && content.trim() !== '') {
        console.log('Auto-saving to LocalStorage...');
        localStorage.setItem('notepad_autosave_content', content);
        setIsSaved(true);
      }
    }, 10000); // Auto-save every 10 seconds to LocalStorage

    return () => clearInterval(autoSaveInterval);
  }, [isSaved, content]);

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

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.currentTarget.scrollTop;
      highlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative">
      {/* Suggestion Popover */}
      {suggestionPopover && (
        <div 
          className="fixed z-[100] bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-1 min-w-[120px]"
          style={{ left: suggestionPopover.x, top: suggestionPopover.y }}
        >
          <div className="px-2 py-1 text-[10px] font-bold uppercase opacity-40 border-b border-slate-100 dark:border-slate-700 mb-1">
            Suggestions for "{suggestionPopover.word}"
          </div>
          {suggestionPopover.suggestions.length > 0 ? (
            suggestionPopover.suggestions.map((s, i) => (
              <button 
                key={i}
                onClick={() => applySuggestion(s)}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-500 hover:text-white rounded text-xs transition-colors"
              >
                {s}
              </button>
            ))
          ) : (
            <div className="px-3 py-1.5 text-xs opacity-50 italic">No suggestions</div>
          )}
          <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
          <button 
            onClick={() => setSuggestionPopover(null)}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-xs transition-colors"
          >
            Ignore
          </button>
        </div>
      )}

      {/* Restore Prompt */}
      <AnimatePresence>
        {showRestorePrompt && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[60] w-full max-w-sm px-4">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-blue-600 text-white rounded-xl shadow-2xl p-4 flex items-center justify-between gap-4 border border-blue-500"
            >
              <div className="flex items-center gap-3">
                <RefreshCw size={20} className="animate-spin-slow" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold">Unsaved Session Found</span>
                  <span className="text-[10px] opacity-80">Would you like to restore your last work?</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowRestorePrompt(false)}
                  className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-[10px] font-bold transition-colors"
                >
                  Ignore
                </button>
                <button 
                  onClick={handleRestore}
                  className="px-3 py-1.5 bg-white text-blue-600 rounded-lg text-[10px] font-bold transition-colors"
                >
                  Restore
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
        <button 
          onClick={() => setShowFontDialog(true)}
          className="hover:text-blue-500 transition-colors"
        >
          Format
        </button>
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
          
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          <button 
            onClick={() => handleFormat('bold')}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Bold Selection (**text**)"
          >
            <Bold size={16} className="opacity-60" />
          </button>
          <button 
            onClick={() => handleFormat('italic')}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Italic Selection (*text*)"
          >
            <Italic size={16} className="opacity-60" />
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
            <Share2 size={16} className="opacity-60" />
          </button>
          <button 
            onClick={() => setShowFindReplace(true)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Find and Replace"
          >
            <Search size={16} className="opacity-60" />
          </button>
          <button 
            onClick={() => setIsSpellCheckEnabled(!isSpellCheckEnabled)}
            className={cn(
              "p-1.5 rounded transition-colors",
              isSpellCheckEnabled ? "bg-blue-500/10 text-blue-500" : "hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
            title={isSpellCheckEnabled ? "Disable Spell Check" : "Enable Spell Check"}
          >
            <Languages size={16} className={cn(!isSpellCheckEnabled && "opacity-60")} />
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          <button 
            onClick={handleUndo}
            disabled={historyIndex === 0}
            className={cn(
              "p-1.5 rounded transition-colors",
              historyIndex === 0 ? "opacity-30 cursor-default" : "hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
            title="Undo (Ctrl+Z)"
          >
            <Undo size={16} className="opacity-60" />
          </button>
          <button 
            onClick={handleRedo}
            disabled={historyIndex === history.length - 1}
            className={cn(
              "p-1.5 rounded transition-colors",
              historyIndex === history.length - 1 ? "opacity-30 cursor-default" : "hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
            title="Redo (Ctrl+Y)"
          >
            <Redo size={16} className="opacity-60" />
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          <button 
            onClick={() => setWordWrap(!wordWrap)}
            className={cn(
              "p-1.5 rounded transition-colors",
              wordWrap ? "bg-blue-500/10 text-blue-500" : "hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
            title="Toggle Word Wrap"
          >
            <WrapText size={16} className={cn(!wordWrap && "opacity-60")} />
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

      {/* Editor Area with Gutter */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Gutter for Line Numbers */}
        <div 
          ref={gutterRef}
          className="w-12 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-end pr-2 py-6 overflow-hidden select-none"
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.625' }}
        >
          {content.split('\n').map((_, i) => (
            <div key={i} className={cn(
              "opacity-30 font-mono",
              cursorPos.line === i + 1 && "opacity-100 text-blue-500 font-bold"
            )}>
              {i + 1}
            </div>
          ))}
        </div>

        <textarea 
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyUp={(e) => updateCursorPos(e.currentTarget)}
          onContextMenu={handleContextMenu}
          onClick={(e) => {
            updateCursorPos(e.currentTarget);
            setSuggestionPopover(null);
          }}
          onScroll={handleScroll}
          onWheel={(e) => {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              if (e.deltaY < 0) {
                setFontSize(prev => Math.min(72, prev + 2));
              } else {
                setFontSize(prev => Math.max(8, prev - 2));
              }
            }
          }}
          style={{ 
            fontSize: `${fontSize}px`,
            fontFamily: fontFamily,
            color: fontColor,
            fontWeight: fontWeight,
            fontStyle: fontStyle,
            lineHeight: '1.625'
          }}
          className={cn(
            "flex-1 p-6 outline-none resize-none bg-transparent leading-relaxed custom-scrollbar z-10",
            wordWrap ? "whitespace-pre-wrap" : "whitespace-pre overflow-x-auto"
          )}
          placeholder="Start typing..."
          spellCheck={isSpellCheckEnabled}
          autoFocus
        />

        {/* Highlight Overlay */}
        <div 
          ref={highlightRef}
          className={cn(
            "absolute inset-0 pointer-events-none p-6 font-mono leading-relaxed whitespace-pre-wrap break-words overflow-hidden text-transparent ml-12",
            !wordWrap && "whitespace-pre overflow-x-auto"
          )}
          style={{ 
            fontSize: `${fontSize}px`,
            fontFamily: fontFamily,
            fontWeight: fontWeight,
            fontStyle: fontStyle,
            lineHeight: '1.625'
          }}
        >
          {/* Spell Check Underlines */}
          {content.split('').map((char, i) => {
            const isMisspelled = isSpellCheckEnabled && misspelledWords.some(m => i >= m.index && i < m.index + m.word.length);
            const isMatch = findText && content.substring(i, i + findText.length).toLowerCase() === findText.toLowerCase();
            const isCurrentMatch = currentMatchIndex !== -1 && i >= currentMatchIndex && i < currentMatchIndex + findText.length;

            return (
              <span key={i} className="relative">
                {char}
                {isMisspelled && (
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-red-500/50 border-b border-dotted border-red-500" />
                )}
                {isMatch && !isCurrentMatch && (
                  <span className="absolute inset-0 bg-yellow-400/20 rounded-sm -z-10" />
                )}
                {isCurrentMatch && (
                  <span className="absolute inset-0 bg-orange-400/40 rounded-sm -z-10 ring-1 ring-orange-500/50" />
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Find and Replace Modal */}
      <AnimatePresence>
        {showFindReplace && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/10 backdrop-blur-[2px] p-4">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">Find and Replace</h3>
                <button 
                  onClick={() => setShowFindReplace(false)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase opacity-40 ml-1">Find</label>
                  <input 
                    type="text" 
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                    placeholder="Text to find..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase opacity-40 ml-1">Replace with</label>
                  <input 
                    type="text" 
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    placeholder="Replacement text..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="flex items-center gap-2 px-1">
                  <input 
                    type="checkbox" 
                    id="caseSensitive"
                    checked={isCaseSensitive}
                    onChange={(e) => setIsCaseSensitive(e.target.checked)}
                    className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="caseSensitive" className="text-[10px] font-medium opacity-60 cursor-pointer">Case Sensitive</label>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button 
                    onClick={() => handleFind('prev')}
                    className="py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold transition-colors"
                  >
                    Find Previous
                  </button>
                  <button 
                    onClick={() => handleFind('next')}
                    className="py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold transition-colors"
                  >
                    Find Next
                  </button>
                  <button 
                    onClick={handleReplace}
                    className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                  >
                    Replace
                  </button>
                  <button 
                    onClick={handleReplaceAll}
                    className="py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold transition-colors"
                  >
                    Replace All
                  </button>
                  <button 
                    onClick={handleFindAll}
                    className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                  >
                    Find All
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search Results Panel */}
      <AnimatePresence>
        {showSearchResultsPanel && (
          <motion.div 
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl z-30 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">Search Results ({searchResults.length})</h3>
              <button 
                onClick={() => setShowSearchResultsPanel(false)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {searchResults.map((result, i) => (
                <button 
                  key={i}
                  onClick={() => jumpToMatch(result.index)}
                  className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-blue-500">Line {result.line}</span>
                    <ChevronRight size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                  </div>
                  <p className="text-[11px] opacity-70 line-clamp-2 font-mono leading-relaxed">
                    {result.snippet}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Font Dialog Modal */}
      <AnimatePresence>
        {showFontDialog && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 text-blue-500">
                  <Type size={20} />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Font Settings</h3>
                </div>
                <button 
                  onClick={() => setShowFontDialog(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase opacity-40">Font Family</label>
                  <select 
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="monospace">Monospace (Default)</option>
                    <option value="sans-serif">Sans Serif</option>
                    <option value="serif">Serif</option>
                    <option value="cursive">Cursive</option>
                    <option value="'Courier New', Courier, monospace">Courier New</option>
                    <option value="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Segoe UI</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase opacity-40">Weight</label>
                    <select 
                      value={fontWeight}
                      onChange={(e) => setFontWeight(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="600">Semi Bold</option>
                      <option value="800">Extra Bold</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase opacity-40">Style</label>
                    <select 
                      value={fontStyle}
                      onChange={(e) => setFontStyle(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="italic">Italic</option>
                      <option value="oblique">Oblique</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase opacity-40">Size ({fontSize}px)</label>
                    <input 
                      type="range" 
                      min="8" 
                      max="72" 
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase opacity-40">Color</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                      />
                      <span className="text-[10px] font-mono opacity-60 uppercase">{fontColor}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold uppercase opacity-40">Preview</label>
                  <div 
                    className="w-full h-20 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 overflow-hidden flex items-center justify-center text-center"
                    style={{ 
                      fontFamily: fontFamily, 
                      fontSize: `${Math.min(fontSize, 24)}px`, 
                      color: fontColor,
                      fontWeight: fontWeight,
                      fontStyle: fontStyle
                    }}
                  >
                    The quick brown fox jumps over the lazy dog.
                  </div>
                </div>

                <button 
                  onClick={() => setShowFontDialog(false)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors mt-4"
                >
                  Apply Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Status Bar */}
      <div className="px-4 py-1 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] opacity-60 font-bold uppercase tracking-widest">
        <div className="flex gap-4">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span>{content.split('\n').length} lines</span>
          <span>{content.trim() === '' ? 0 : content.trim().split(/\s+/).length} words</span>
          <span>{content.length} characters</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{wordWrap ? 'Word Wrap: On' : 'Word Wrap: Off'}</span>
          <div className="w-px h-3 bg-slate-300 dark:bg-slate-700 mx-1" />
          <span>Windows 11 Mobile</span>
        </div>
      </div>
    </div>
  );
};
