import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Folder, FolderPlus, HardDrive, Clock, Star, Download, Image, Music, Video, FileText, Search, Plus, Trash2, ChevronUp, ChevronDown, Settings2, RotateCcw, Trash, Undo2, Redo2, Copy, Scissors, Clipboard, Type, Play, Square, Package, PackageX, Columns2, Layout, Loader2 } from 'lucide-react';

interface PaneState {
  searchQuery: string;
  filterType: string;
  filterDate: string;
  filterSize: string;
  sortConfig: { key: string, direction: 'asc' | 'desc' };
  activeFolder: string;
  selectedFile: any | null;
}

export const FileExplorer: React.FC<{ onNewWindow?: () => void }> = ({ onNewWindow }) => {
  const [isSplitView, setIsSplitView] = useState(false);
  const [activePane, setActivePane] = useState<'left' | 'right'>('left');

  const [leftPane, setLeftPane] = useState<PaneState>({
    searchQuery: '',
    filterType: 'All',
    filterDate: 'All',
    filterSize: 'All',
    sortConfig: { key: 'name', direction: 'asc' },
    activeFolder: 'Quick access',
    selectedFile: null,
  });

  const [rightPane, setRightPane] = useState<PaneState>({
    searchQuery: '',
    filterType: 'All',
    filterDate: 'All',
    filterSize: 'All',
    sortConfig: { key: 'name', direction: 'asc' },
    activeFolder: 'Documents',
    selectedFile: null,
  });

  const updatePane = (side: 'left' | 'right', updates: Partial<PaneState>) => {
    if (side === 'left') setLeftPane(prev => ({ ...prev, ...updates }));
    else setRightPane(prev => ({ ...prev, ...updates }));
  };

  const currentPane = activePane === 'left' ? leftPane : rightPane;
  const selectedFile = isSplitView ? (activePane === 'left' ? leftPane.selectedFile : rightPane.selectedFile) : leftPane.selectedFile;

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [clipboard, setClipboard] = useState<{ type: 'copy' | 'cut', file: any } | null>(null);
  const [appToConfirm, setAppToConfirm] = useState<{ file: any, action: 'install' | 'uninstall' } | null>(null);
  const [deleteToConfirm, setDeleteToConfirm] = useState<{ file?: any, type: 'file' | 'bin' } | null>(null);
  
  // History for Undo/Redo
  const [history, setHistory] = useState<any[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [items, setItems] = useState([
    { icon: Clock, label: 'Quick access', id: '1' },
    { icon: Star, label: 'Favorites', id: '2' },
    { icon: Download, label: 'Downloads', id: '3' },
    { icon: FileText, label: 'Documents', id: '4' },
    { icon: Image, label: 'Pictures', id: '5' },
    { icon: Music, label: 'Music', id: '6' },
    { icon: Video, label: 'Videos', id: '7' },
    { icon: HardDrive, label: 'This PC', id: '8' },
    { icon: Trash2, label: 'Recycle Bin', id: '9' },
  ]);

  const [files, setFiles] = useState([
    { id: 'f1', name: 'Desktop', date: '20/03/2026', createdAt: '10/01/2026', type: 'File folder', size: 0, isDeleted: false, location: 'Desktop', content: 'System desktop folder containing shortcuts and files.', fullPath: 'C:/Users/User/Desktop', attributes: ['System', 'Hidden'] },
    { id: 'f2', name: 'Documents', date: '15/03/2026', createdAt: '10/01/2026', type: 'File folder', size: 0, isDeleted: false, location: 'Documents', content: 'Personal documents and files.', fullPath: 'C:/Users/User/Documents', attributes: ['System'] },
    { id: 'f3', name: 'Downloads', date: '21/03/2026', createdAt: '10/01/2026', type: 'File folder', size: 0, isDeleted: false, location: 'Downloads', content: 'Files downloaded from the internet.', fullPath: 'C:/Users/User/Downloads', attributes: ['System'] },
    { id: 'f4', name: 'Music', date: '10/02/2026', createdAt: '10/01/2026', type: 'File folder', size: 0, isDeleted: false, location: 'Music', content: 'Audio files and playlists.', fullPath: 'C:/Users/User/Music', attributes: ['System'] },
    { id: 'f5', name: 'Pictures', date: '05/01/2026', createdAt: '10/01/2026', type: 'File folder', size: 0, isDeleted: false, location: 'Pictures', content: 'Images and photo albums.', fullPath: 'C:/Users/User/Pictures', attributes: ['System'] },
    { id: 'f6', name: 'Videos', date: '12/12/2025', createdAt: '10/01/2026', type: 'File folder', size: 0, isDeleted: false, location: 'Videos', content: 'Video recordings and movies.', fullPath: 'C:/Users/User/Videos', attributes: ['System'] },
    { id: 'f7', name: 'Old_Project.zip', date: '01/01/2026', createdAt: '15/12/2025', type: 'Compressed folder', size: 12582912, isDeleted: true, location: 'Recycle Bin', content: 'Archive containing source code and assets from 2025.', fullPath: 'C:/Users/User/Recycle Bin/Old_Project.zip', attributes: ['Archive'] },
    { id: 'f8', name: 'Draft_Notes.txt', date: '02/02/2026', createdAt: '02/02/2026', type: 'Text Document', size: 1024, isDeleted: true, location: 'Recycle Bin', content: 'Meeting notes from the project kickoff. Need to review the timeline and budget.', fullPath: 'C:/Users/User/Recycle Bin/Draft_Notes.txt', attributes: ['Read-only'] },
    { id: 'f9', name: 'Vacation.jpg', date: '03/03/2026', createdAt: '03/03/2026', type: 'JPEG Image', size: 2516582, isDeleted: false, location: 'Pictures', content: 'https://picsum.photos/seed/vacation/400/300', fullPath: 'C:/Users/User/Pictures/Vacation.jpg', attributes: [] },
    { id: 'f10', name: 'Report.pdf', date: '04/04/2026', createdAt: '04/04/2026', type: 'PDF Document', size: 460800, isDeleted: false, location: 'Documents', content: 'Quarterly financial report for Q1 2026.', fullPath: 'C:/Users/User/Documents/Report.pdf', attributes: [] },
    { id: 'f11', name: 'Budget_2026.xlsx', date: '05/04/2026', createdAt: '05/04/2026', type: 'Excel Spreadsheet', size: 87040, isDeleted: false, location: 'Documents', content: 'Budget planning for the upcoming fiscal year.', fullPath: 'C:/Users/User/Documents/Budget_2026.xlsx', attributes: [] },
    { id: 'f12', name: 'Setup.exe', date: '06/04/2026', createdAt: '06/04/2026', type: 'Application', size: 157286400, isDeleted: false, location: 'Downloads', content: 'Installer for the new system utility.', isInstalled: false, isRunning: false, isInstalling: false, isUninstalling: false, installProgress: 0, fullPath: 'C:/Users/User/Downloads/Setup.exe', attributes: [] },
  ]);

  // Save state to history for undo/redo
  const saveToHistory = useCallback((newFiles: any[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newFiles);
    if (newHistory.length > 20) newHistory.shift(); // Limit history
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([files]);
      setHistoryIndex(0);
    }
  }, []);

  const updateFiles = (newFiles: any[]) => {
    setFiles(newFiles);
    saveToHistory(newFiles);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setFiles(history[prevIndex]);
      setHistoryIndex(prevIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setFiles(history[nextIndex]);
      setHistoryIndex(nextIndex);
    }
  };

  const addItem = () => {
    const label = prompt('Enter folder name:');
    if (label) {
      setItems([...items, { icon: Folder, label, id: Math.random().toString() }]);
    }
  };

  const createNewFolder = () => {
    const folderName = prompt('Enter folder name:', 'New Folder');
    if (!folderName) return;

    const targetFolder = currentPane.activeFolder;
    const newFolder = {
      id: 'f' + Date.now(),
      name: folderName,
      date: new Date().toLocaleDateString('en-GB'),
      createdAt: new Date().toLocaleDateString('en-GB'),
      type: 'File folder',
      size: 0,
      isDeleted: false,
      location: targetFolder,
      content: 'New folder created by user.',
      fullPath: `C:/Users/User/${targetFolder}/${folderName}`,
      attributes: []
    };
    updateFiles([...files, newFolder]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const deleteFile = (id: string) => {
    updateFiles(files.map(f => f.id === id ? { ...f, isDeleted: true } : f));
  };

  const restoreFile = (id: string) => {
    updateFiles(files.map(f => f.id === id ? { ...f, isDeleted: false } : f));
  };

  const permanentlyDeleteFile = (id: string) => {
    updateFiles(files.filter(f => f.id !== id));
    setDeleteToConfirm(null);
  };

  const emptyRecycleBin = () => {
    updateFiles(files.filter(f => !f.isDeleted));
    setDeleteToConfirm(null);
  };

  const startRename = (file: any) => {
    setEditingId(file.id);
    setEditName(file.name);
  };

  const finishRename = () => {
    if (editingId && editName.trim()) {
      updateFiles(files.map(f => f.id === editingId ? { ...f, name: editName.trim() } : f));
    }
    setEditingId(null);
  };

  const copyFile = (file: any) => {
    setClipboard({ type: 'copy', file });
  };

  const cutFile = (file: any) => {
    setClipboard({ type: 'cut', file });
  };

  const pasteFile = () => {
    if (!clipboard) return;
    const targetFolder = currentPane.activeFolder;

    if (clipboard.type === 'copy') {
      const newFile = {
        ...clipboard.file,
        id: 'f' + Date.now(),
        name: clipboard.file.name + ' - Copy',
        location: targetFolder,
        isDeleted: false,
        date: new Date().toLocaleDateString('en-GB')
      };
      updateFiles([...files, newFile]);
    } else {
      // Cut/Move
      updateFiles(files.map(f => f.id === clipboard.file.id ? { ...f, location: targetFolder, isDeleted: false } : f));
      setClipboard(null);
    }
  };

  const toggleApp = (file: any) => {
    if (file.type !== 'Application') return;
    updateFiles(files.map(f => f.id === file.id ? { ...f, isRunning: !f.isRunning } : f));
  };

  const installApp = (file: any) => {
    if (file.type !== 'Application' || file.isInstalled || file.isInstalling) return;
    
    // Initial state (saved to history)
    updateFiles(files.map(f => f.id === file.id ? { ...f, isInstalling: true, installProgress: 0 } : f));

    let progress = 0;
    const timer = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        clearInterval(timer);
        // Final state (saved to history)
        updateFiles(files.map(f => f.id === file.id ? { ...f, isInstalling: false, isInstalled: true, installProgress: 100 } : f));
      } else {
        // Intermediate state (not saved to history to avoid bloating)
        setFiles(prev => prev.map(f => f.id === file.id ? { ...f, installProgress: progress } : f));
      }
    }, 300);
  };

  const uninstallApp = (file: any) => {
    if (file.type !== 'Application' || !file.isInstalled || file.isUninstalling) return;
    
    updateFiles(files.map(f => f.id === file.id ? { ...f, isUninstalling: true } : f));

    setTimeout(() => {
      updateFiles(files.map(f => f.id === file.id ? { ...f, isInstalled: false, isRunning: false, isUninstalling: false, installProgress: 0 } : f));
    }, 1500);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < items.length) {
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      setItems(newItems);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSort = (key: string, side: 'left' | 'right') => {
    const pane = side === 'left' ? leftPane : rightPane;
    let direction: 'asc' | 'desc' = 'asc';
    if (pane.sortConfig.key === key && pane.sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    updatePane(side, { sortConfig: { key, direction } });
  };

  const handleDragStart = (e: React.DragEvent, file: any) => {
    e.dataTransfer.setData('fileId', file.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData('fileId');
    if (fileId) {
      updateFiles(files.map(f => f.id === fileId ? { ...f, location: targetFolder, isDeleted: false } : f));
    }
  };

  const renderFilePane = (side: 'left' | 'right') => {
    const pane = side === 'left' ? leftPane : rightPane;
    const isPaneActive = activePane === side;
    const isRecycleBin = pane.activeFolder === 'Recycle Bin';
    const isSearching = pane.searchQuery.length > 0;

    const filteredFiles = files.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(pane.searchQuery.toLowerCase());
      const matchesType = pane.filterType === 'All' || f.type.toLowerCase().includes(pane.filterType.toLowerCase());
      
      // Date Filtering
      let matchesDate = true;
      if (pane.filterDate !== 'All') {
        const [day, month, year] = f.date.split('/').map(Number);
        const fileDate = new Date(year, month - 1, day);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - fileDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (pane.filterDate === 'Today') matchesDate = diffDays <= 1;
        else if (pane.filterDate === 'This Week') matchesDate = diffDays <= 7;
        else if (pane.filterDate === 'This Month') matchesDate = diffDays <= 30;
        else if (pane.filterDate === 'This Year') matchesDate = diffDays <= 365;
      }

      // Size Filtering
      let matchesSize = true;
      if (pane.filterSize !== 'All') {
        const sizeMB = f.size / (1024 * 1024);
        if (pane.filterSize === 'Small') matchesSize = sizeMB < 1;
        else if (pane.filterSize === 'Medium') matchesSize = sizeMB >= 1 && sizeMB <= 10;
        else if (pane.filterSize === 'Large') matchesSize = sizeMB > 10;
      }

      if (!matchesType || !matchesDate || !matchesSize) return false;

      if (isSearching) {
        if (isRecycleBin) return f.isDeleted && matchesSearch;
        return !f.isDeleted && matchesSearch;
      }

      if (isRecycleBin) return f.isDeleted;
      if (pane.activeFolder === 'Quick access' || pane.activeFolder === 'This PC') return !f.isDeleted;
      return !f.isDeleted && f.location === pane.activeFolder;
    });

    const sortedFiles = [...filteredFiles].sort((a, b) => {
      const aValue = a[pane.sortConfig.key as keyof typeof a];
      const bValue = b[pane.sortConfig.key as keyof typeof b];

      if (aValue < bValue) return pane.sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return pane.sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    const handleFileDoubleClick = (file: any) => {
      if (file.type === 'Application') {
        if (file.isInstalling || file.isUninstalling) return;
        setAppToConfirm({ 
          file, 
          action: file.isInstalled ? 'uninstall' : 'install' 
        });
      } else if (file.type === 'File folder') {
        updatePane(side, { activeFolder: file.name });
      }
    };

    return (
      <div 
        onClick={() => setActivePane(side)}
        className={`flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900 transition-all border-r border-slate-200 dark:border-slate-700 last:border-r-0 ${isSplitView && isPaneActive ? 'ring-1 ring-inset ring-blue-500 z-10' : ''}`}
      >
        {/* Search Bar & Filters */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder={isRecycleBin ? "Search in Recycle Bin..." : "Search..."} 
              value={pane.searchQuery}
              onChange={(e) => updatePane(side, { searchQuery: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1 pl-9 pr-4 text-[11px] outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase opacity-40">Type:</span>
              <select 
                value={pane.filterType}
                onChange={(e) => updatePane(side, { filterType: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[9px] outline-none"
              >
                <option value="All">All</option>
                <option value="Folder">Folders</option>
                <option value="Image">Images</option>
                <option value="Document">Docs</option>
                <option value="Application">Apps</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase opacity-40">Date:</span>
              <select 
                value={pane.filterDate}
                onChange={(e) => updatePane(side, { filterDate: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[9px] outline-none"
              >
                <option value="All">Any</option>
                <option value="Today">Today</option>
                <option value="This Week">Week</option>
                <option value="This Month">Month</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase opacity-40">Size:</span>
              <select 
                value={pane.filterSize}
                onChange={(e) => updatePane(side, { filterSize: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[9px] outline-none"
              >
                <option value="All">Any</option>
                <option value="Small">&lt;1MB</option>
                <option value="Medium">1-10MB</option>
                <option value="Large">&gt;10MB</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-medium opacity-50">This PC</span>
            <span className="text-[10px] opacity-30">/</span>
            <span className="text-[10px] font-medium">{pane.activeFolder}</span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <th className="font-medium p-1.5 cursor-pointer hover:bg-black/5" onClick={() => handleSort('name', side)}>
                  Name {pane.sortConfig.key === 'name' && (pane.sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="font-medium p-1.5 cursor-pointer hover:bg-black/5" onClick={() => handleSort('date', side)}>
                  Date {pane.sortConfig.key === 'date' && (pane.sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="font-medium p-1.5 cursor-pointer hover:bg-black/5" onClick={() => handleSort('type', side)}>
                  Type {pane.sortConfig.key === 'type' && (pane.sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="font-medium p-1.5 cursor-pointer hover:bg-black/5" onClick={() => handleSort('size', side)}>
                  Size {pane.sortConfig.key === 'size' && (pane.sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                {isSearching && <th className="font-medium p-1.5">Location</th>}
              </tr>
            </thead>
            <tbody>
              {sortedFiles.map((file) => (
                <tr 
                  key={file.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, file)}
                  onDragOver={(e) => file.type === 'File folder' && e.preventDefault()}
                  onDrop={(e) => file.type === 'File folder' && handleDrop(e, file.name)}
                  onMouseEnter={() => updatePane(side, { selectedFile: file })}
                  onClick={() => updatePane(side, { selectedFile: file })}
                  onDoubleClick={() => handleFileDoubleClick(file)}
                  className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-default group transition-colors ${pane.selectedFile?.id === file.id ? 'bg-blue-100/50 dark:bg-blue-900/30' : ''} ${file.type === 'File folder' ? 'font-medium text-xs' : 'text-[11px]'} ${file.isInstalling || file.isUninstalling ? 'opacity-70' : ''}`}
                >
                  <td className="p-1.5 flex items-center gap-2">
                    {file.type === 'File folder' ? (
                      <Folder className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    ) : file.type.includes('Image') ? (
                      <Image className="w-3.5 h-3.5 text-purple-400" />
                    ) : file.type === 'Application' ? (
                      file.isInstalling || file.isUninstalling ? (
                        <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                      ) : (
                        <Package className={`w-3.5 h-3.5 ${file.isInstalled ? 'text-green-500' : 'text-slate-400'}`} />
                      )
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                    )}
                    
                    {editingId === file.id ? (
                      <input 
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={finishRename}
                        onKeyDown={(e) => e.key === 'Enter' && finishRename()}
                        className="bg-white dark:bg-slate-800 border border-blue-500 rounded px-1 outline-none text-[11px] w-full max-w-[120px]"
                      />
                    ) : (
                      <span className="truncate">
                        {file.name}
                        {file.isInstalling && <span className="ml-2 text-[9px] text-blue-500 font-normal">Installing... {file.installProgress}%</span>}
                        {file.isUninstalling && <span className="ml-2 text-[9px] text-red-500 font-normal">Uninstalling...</span>}
                      </span>
                    )}
                  </td>
                  <td className="p-1.5 text-[10px] text-slate-500 whitespace-nowrap">{file.date}</td>
                  <td className="p-1.5 text-[10px] text-slate-500 truncate max-w-[80px]">{file.type}</td>
                  <td className="p-1.5 text-[10px] text-slate-500 whitespace-nowrap">{formatSize(file.size)}</td>
                  {isSearching && <td className="p-1.5 text-[10px] text-slate-500 truncate max-w-[80px]">{file.location}</td>}
                </tr>
              ))}
              {filteredFiles.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 italic text-[10px]">
                    {isRecycleBin ? 'Recycle Bin is empty.' : 'No items match.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col text-sm">
      {/* Ribbon/Toolbar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-black/20">
        <button className="px-2 py-1 hover:bg-black/5 rounded flex items-center gap-1" onClick={onNewWindow}>
          <Layout className="w-3 h-3" />
          New Window
        </button>
        <button className="px-2 py-1 hover:bg-black/5 rounded flex items-center gap-1" onClick={createNewFolder}>
          <FolderPlus className="w-3 h-3" />
          New Folder
        </button>
        <button className="px-2 py-1 hover:bg-black/5 rounded flex items-center gap-1" onClick={addItem}>
          <Plus className="w-3 h-3" />
          Add to Sidebar
        </button>
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
        <button 
          onClick={() => selectedFile && cutFile(selectedFile)}
          disabled={!selectedFile}
          className="px-2 py-1 hover:bg-black/5 rounded disabled:opacity-30 flex items-center gap-1"
        >
          <Scissors className="w-3 h-3" />
          Cut
        </button>
        <button 
          onClick={() => selectedFile && copyFile(selectedFile)}
          disabled={!selectedFile}
          className="px-2 py-1 hover:bg-black/5 rounded disabled:opacity-30 flex items-center gap-1"
        >
          <Copy className="w-3 h-3" />
          Copy
        </button>
        <button 
          onClick={pasteFile}
          disabled={!clipboard}
          className="px-2 py-1 hover:bg-black/5 rounded disabled:opacity-30 flex items-center gap-1"
        >
          <Clipboard className="w-3 h-3" />
          Paste
        </button>
        <button 
          onClick={() => selectedFile && startRename(selectedFile)}
          disabled={!selectedFile}
          className="px-2 py-1 hover:bg-black/5 rounded disabled:opacity-30 flex items-center gap-1"
        >
          <Type className="w-3 h-3" />
          Rename
        </button>
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
        <button 
          onClick={undo}
          disabled={historyIndex <= 0}
          className="p-1 hover:bg-black/5 rounded disabled:opacity-30"
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button 
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="p-1 hover:bg-black/5 rounded disabled:opacity-30"
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
        <button 
          onClick={() => setIsSplitView(!isSplitView)}
          className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${isSplitView ? 'bg-blue-500/10 text-blue-500' : 'hover:bg-black/5'}`}
          title="Toggle Split View"
        >
          {isSplitView ? <Layout className="w-3 h-3" /> : <Columns2 className="w-3 h-3" />}
          {isSplitView ? 'Single View' : 'Split View'}
        </button>
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
        {currentPane.activeFolder === 'Recycle Bin' ? (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setDeleteToConfirm({ type: 'bin' })}
              className="px-2 py-1 hover:bg-red-500/10 text-red-500 rounded flex items-center gap-1"
            >
              <Trash className="w-3 h-3" />
              Empty Bin
            </button>
            <button 
              onClick={() => selectedFile && restoreFile(selectedFile.id)}
              disabled={!selectedFile}
              className="px-2 py-1 hover:bg-green-500/10 text-green-500 rounded disabled:opacity-30 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Restore
            </button>
            <button 
              onClick={() => selectedFile && setDeleteToConfirm({ file: selectedFile, type: 'file' })}
              disabled={!selectedFile}
              className="px-2 py-1 hover:bg-red-500/10 text-red-500 rounded disabled:opacity-30 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Delete Permanently
            </button>
          </div>
        ) : (
          <button 
            onClick={() => selectedFile && deleteFile(selectedFile.id)}
            disabled={!selectedFile}
            className="px-2 py-1 hover:bg-red-500/10 text-red-500 rounded disabled:opacity-30 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50/50 dark:bg-black/10 hidden sm:flex">
          <div className="p-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 px-2">Navigation</span>
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${isEditMode ? 'text-blue-500 bg-blue-500/10' : 'opacity-50'}`}
              title="Customize Sidebar"
            >
              <Settings2 className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {items.map((item, i) => (
              <div 
                key={item.id} 
                onClick={() => updatePane(activePane, { activeFolder: item.label })}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, item.label)}
                className={`group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer relative transition-colors ${currentPane.activeFolder === item.label ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${currentPane.activeFolder === item.label ? 'text-blue-600 dark:text-blue-400' : 'text-blue-500'}`} />
                <span className="text-xs truncate flex-1">{item.label}</span>
                
                {isEditMode && (
                  <div className="flex items-center gap-0.5 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded p-0.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); moveItem(i, 'up'); }}
                      disabled={i === 0}
                      className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-20"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); moveItem(i, 'down'); }}
                      disabled={i === items.length - 1}
                      className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-20"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                      className="p-0.5 hover:bg-red-500/10 text-red-500 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {isEditMode && (
              <button 
                onClick={addItem}
                className="w-full flex items-center gap-2 px-2 py-2 mt-2 border border-dashed border-slate-300 dark:border-slate-700 rounded hover:border-blue-500 hover:text-blue-500 transition-all text-xs opacity-60 hover:opacity-100"
              >
                <Plus className="w-3 h-3" />
                <span>Add Folder</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {renderFilePane('left')}
          {isSplitView && renderFilePane('right')}
        </div>

        {/* Preview Pane */}
        <div className="w-64 border-l border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-black/5 hidden lg:flex flex-col overflow-hidden">
          <div className="p-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 px-2">Preview</span>
          </div>
          
          {selectedFile ? (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center text-center">
              <div className="w-24 h-24 mb-4 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                {selectedFile.type === 'File folder' ? (
                  <Folder className="w-12 h-12 text-yellow-500 fill-yellow-500" />
                ) : selectedFile.type.includes('Image') ? (
                  <img src={selectedFile.content} alt={selectedFile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : selectedFile.type.includes('Compressed') ? (
                  <Download className="w-12 h-12 text-orange-400" />
                ) : (
                  <FileText className="w-12 h-12 text-blue-400" />
                )}
              </div>
              
              <h3 className="text-sm font-bold truncate w-full mb-1">{selectedFile.name}</h3>
              <p className="text-[10px] opacity-50 mb-4">{selectedFile.type} • {formatSize(selectedFile.size) || 'Folder'}</p>
              
              {selectedFile.type === 'Application' && (
                <div className="w-full flex flex-col gap-2 mb-4">
                  {selectedFile.isInstalling ? (
                    <div className="w-full p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        <span>INSTALLING...</span>
                        <span>{selectedFile.installProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedFile.installProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : selectedFile.isUninstalling ? (
                    <div className="w-full p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-red-600 dark:text-red-400">
                        <span>UNINSTALLING...</span>
                        <Loader2 className="w-3 h-3 animate-spin" />
                      </div>
                      <div className="w-full h-1.5 bg-red-200 dark:bg-red-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-red-500 animate-pulse"
                          initial={{ width: '100%' }}
                          animate={{ width: '0%' }}
                          transition={{ duration: 1.5 }}
                        />
                      </div>
                    </div>
                  ) : !selectedFile.isInstalled ? (
                    <button 
                      onClick={() => setAppToConfirm({ file: selectedFile, action: 'install' })}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-2"
                    >
                      <Package className="w-3 h-3" />
                      Install Application
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toggleApp(selectedFile)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors ${selectedFile.isRunning ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
                        >
                          {selectedFile.isRunning ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          {selectedFile.isRunning ? 'Stop Service' : 'Start Application'}
                        </button>
                      </div>
                      <button 
                        onClick={() => setAppToConfirm({ file: selectedFile, action: 'uninstall' })}
                        className="w-full py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <PackageX className="w-3 h-3" />
                        Uninstall
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="w-full text-left bg-white dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-30 block mb-2">Content Snippet</span>
                <p className="text-xs opacity-70 leading-relaxed italic">
                  {selectedFile.type.includes('Image') ? 'Image Preview' : selectedFile.content || 'No preview available.'}
                </p>
              </div>
              
              <div className="mt-auto w-full pt-4 border-t border-slate-100 dark:border-slate-800 text-left space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="opacity-40">Full Path:</span>
                  <span className="opacity-70 truncate max-w-[120px]" title={selectedFile.fullPath}>{selectedFile.fullPath}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="opacity-40">Created:</span>
                  <span className="opacity-70">{selectedFile.createdAt}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="opacity-40">Modified:</span>
                  <span className="opacity-70">{selectedFile.date}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="opacity-40">Attributes:</span>
                  <span className="opacity-70">{selectedFile.attributes.join(', ') || 'None'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 opacity-30 text-center">
              <Search className="w-8 h-8 mb-2" />
              <p className="text-xs">Select a file to see its details and preview</p>
            </div>
          )}
        </div>
      </div>
      {/* Confirmation Modals */}
      <AnimatePresence>
        {appToConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setAppToConfirm(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${appToConfirm.action === 'install' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                  {appToConfirm.action === 'install' ? <Package className="w-6 h-6" /> : <PackageX className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{appToConfirm.action === 'install' ? 'Install App?' : 'Uninstall App?'}</h3>
                  <p className="text-sm opacity-60">Are you sure you want to {appToConfirm.action} {appToConfirm.file.name}?</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setAppToConfirm(null)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800/80 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (appToConfirm.action === 'install') {
                      installApp(appToConfirm.file);
                    } else {
                      uninstallApp(appToConfirm.file);
                    }
                    setAppToConfirm(null);
                  }}
                  className={`flex-1 py-2 text-white rounded-lg text-sm font-medium transition-colors ${appToConfirm.action === 'install' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {appToConfirm.action === 'install' ? 'Install' : 'Uninstall'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {deleteToConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setDeleteToConfirm(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500/10 text-red-500">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {deleteToConfirm.type === 'bin' ? 'Empty Recycle Bin?' : 'Permanently Delete?'}
                  </h3>
                  <p className="text-sm opacity-60">
                    {deleteToConfirm.type === 'bin' 
                      ? 'All items in the Recycle Bin will be permanently removed. This action cannot be undone.'
                      : `Are you sure you want to permanently delete "${deleteToConfirm.file?.name}"? This action cannot be undone.`}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteToConfirm(null)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800/80 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (deleteToConfirm.type === 'bin') {
                      emptyRecycleBin();
                    } else if (deleteToConfirm.file) {
                      permanentlyDeleteFile(deleteToConfirm.file.id);
                    }
                  }}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-bold text-white transition-colors"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
