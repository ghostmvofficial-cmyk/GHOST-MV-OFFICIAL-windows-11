import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ChevronRight, RefreshCw, FolderPlus, SortAsc, Monitor, Paintbrush, LayoutGrid } from 'lucide-react';
import { Taskbar } from './components/Taskbar';
import { StartMenu } from './components/StartMenu';
import { SearchInterface } from './components/SearchInterface';
import { Window } from './components/Window';
import { FileExplorer } from './components/apps/FileExplorer';
import { SettingsApp } from './components/apps/Settings';
import { ScreenRecorder } from './components/apps/ScreenRecorder';
import { GhostVault } from './components/apps/GhostVault';
import { TaskManager } from './components/apps/TaskManager';
import { Terminal } from './components/apps/Terminal';
import { Paint } from './components/apps/Paint';
import { ClockApp } from './components/apps/Clock';
import { Calculator } from './components/apps/Calculator';
import { Notepad } from './components/apps/Notepad';
import NotificationCenter from './components/NotificationCenter';
import { APPS } from './constants';
import { cn } from './lib/utils';
import { Notification, UserProfile, Desktop, WindowState, SnapType } from './types';

export default function App() {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<Notification | null>(null);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(10);
  const [volume, setVolume] = useState(75);
  const [brightness, setBrightness] = useState(80);
  const [wallpaper, setWallpaper] = useState('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1920&auto=format&fit=crop');
  const [isWifiOn, setIsWifiOn] = useState(true);
  const [isBluetoothOn, setIsBluetoothOn] = useState(true);
  const [isFlightModeOn, setIsFlightModeOn] = useState(false);
  const [desktops, setDesktops] = useState<Desktop[]>([
    { id: 'desktop-1', name: 'Desktop 1' }
  ]);
  const [activeDesktopId, setActiveDesktopId] = useState('desktop-1');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Ghost MV',
    email: 'ghostmvofficial@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop',
    role: 'Administrator'
  });

  // Security States
  const [isGhostShieldOn, setIsGhostShieldOn] = useState(true);
  const [isIDSOn, setIsIDSOn] = useState(true);
  const [isRemoteControlBlocked, setIsRemoteControlBlocked] = useState(true);
  const [isIPLoggingOn, setIsIPLoggingOn] = useState(true);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Welcome to Windows 11',
      message: 'Experience the new Windows 11 Mobile on your Android device.',
      time: 'Just now',
      read: false
    },
    {
      id: '2',
      title: 'Ghost Chat Security',
      message: 'Your connection is now encrypted and secure.',
      time: '2m ago',
      appId: 'ghost',
      read: false
    }
  ]);

  const addNotification = useCallback((title: string, message: string, appId?: string) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      time: 'Just now',
      appId,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);
    setTimeout(() => setActiveToast(null), 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Simulate intrusion detection
  React.useEffect(() => {
    if (isGhostShieldOn && isIDSOn && isIPLoggingOn) {
      const interval = setInterval(() => {
        if (Math.random() > 0.95) { // 5% chance every 30s
          const randomIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
          addNotification(
            'UNAUTHORIZED ACCESS BLOCKED',
            `Ghost Shield blocked an intrusion attempt from IP: ${randomIP}. Remote control access denied.`,
            'vault'
          );
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isGhostShieldOn, isIDSOn, isIPLoggingOn, addNotification]);

  const openApp = useCallback((appId: string) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === appId);
      if (existing) {
        if (existing.isMinimized) {
          return prev.map(w => w.id === appId ? { ...w, isMinimized: false, desktopId: activeDesktopId } : w);
        }
        if (existing.desktopId !== activeDesktopId) {
          setActiveDesktopId(existing.desktopId);
        }
        return prev;
      }
      return [...prev, {
        id: appId,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: maxZIndex + 1,
        desktopId: activeDesktopId
      }];
    });
    setActiveWindowId(appId);
    setMaxZIndex(prev => prev + 1);
    setIsStartOpen(false);
  }, [maxZIndex, activeDesktopId]);

  const switchDesktop = (id: string) => {
    setActiveDesktopId(id);
  };

  const createDesktop = () => {
    const newId = `desktop-${desktops.length + 1}`;
    setDesktops(prev => [...prev, { id: newId, name: `Desktop ${desktops.length + 1}` }]);
    setActiveDesktopId(newId);
  };

  const deleteDesktop = (id: string) => {
    if (desktops.length <= 1) return;
    const remainingDesktops = desktops.filter(d => d.id !== id);
    setDesktops(remainingDesktops);
    const fallbackDesktop = remainingDesktops[0];
    setWindows(prev => prev.map(w => w.desktopId === id ? { ...w, desktopId: fallbackDesktop.id } : w));
    if (activeDesktopId === id) setActiveDesktopId(fallbackDesktop.id);
  };

  const moveWindowToDesktop = (windowId: string, desktopId: string) => {
    setWindows(prev => prev.map(w => w.id === windowId ? { ...w, desktopId } : w));
  };

  const closeWindow = (id: string) => {
    // Allow apps to intercept close (e.g. for unsaved changes)
    const closeRequestEvent = new CustomEvent(`app-close-request-${id}`, { cancelable: true });
    const isDefaultPrevented = !window.dispatchEvent(closeRequestEvent);

    if (isDefaultPrevented) {
      // App intercepted close. Wait for confirmation event.
      const handleConfirmed = () => {
        setWindows(prev => prev.filter(w => w.id !== id));
        if (activeWindowId === id) setActiveWindowId(null);
        window.removeEventListener(`app-close-confirmed-${id}`, handleConfirmed);
      };
      window.addEventListener(`app-close-confirmed-${id}`, handleConfirmed);
      return;
    }

    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    setActiveWindowId(null);
  };

  const maximizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized, snapType: 'none' } : w));
  };

  const snapWindow = (id: string, snapType: SnapType) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, snapType, isMaximized: false } : w));
  };

  const focusWindow = (id: string) => {
    setActiveWindowId(id);
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, zIndex: maxZIndex + 1 };
      }
      return w;
    }));
    setMaxZIndex(prev => prev + 1);
    window.dispatchEvent(new CustomEvent('window-focus-change', { detail: { activeId: id } }));
  };

  const renderAppContent = (id: string) => {
    switch (id) {
      case 'explorer': return <FileExplorer />;
      case 'recorder': return <ScreenRecorder />;
      case 'vault': return <GhostVault />;
      case 'taskmgr': return <TaskManager />;
      case 'terminal': return <Terminal />;
      case 'paint': return <Paint />;
      case 'clock': return <ClockApp />;
      case 'calculator': return <Calculator />;
      case 'notepad': return <Notepad />;
      case 'settings': return (
        <SettingsApp 
          onTestNotification={() => addNotification('System Update', 'A new update is available for your Windows 11 Mobile device.')} 
          userProfile={userProfile}
          wallpaper={wallpaper}
          onWallpaperChange={setWallpaper}
          isWifiOn={isWifiOn}
          onWifiToggle={setIsWifiOn}
          isBluetoothOn={isBluetoothOn}
          onBluetoothToggle={setIsBluetoothOn}
          isFlightModeOn={isFlightModeOn}
          onFlightModeToggle={setIsFlightModeOn}
          volume={volume}
          onVolumeChange={setVolume}
          brightness={brightness}
          onBrightnessChange={setBrightness}
          onProfileUpdate={setUserProfile}
          onAppOpen={openApp}
          isGhostShieldOn={isGhostShieldOn}
          onGhostShieldToggle={setIsGhostShieldOn}
          isIDSOn={isIDSOn}
          onIDSToggle={setIsIDSOn}
          isRemoteControlBlocked={isRemoteControlBlocked}
          onRemoteControlToggle={setIsRemoteControlBlocked}
          isIPLoggingOn={isIPLoggingOn}
          onIPLoggingToggle={setIsIPLoggingOn}
        />
      );
      case 'chrome': return (
        <div className="w-full h-full flex flex-col">
          <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800">
            <div className="flex-1 bg-white dark:bg-black/20 rounded px-3 py-1 text-xs">https://www.google.com</div>
          </div>
          <iframe src="https://www.google.com/search?igu=1" className="flex-1 w-full border-none" title="Chrome" />
        </div>
      );
      case 'google': return (
        <div className="w-full h-full flex flex-col">
          <iframe src="https://www.google.com/search?igu=1" className="flex-1 w-full border-none" title="Google" />
        </div>
      );
      case 'gmail': return (
        <div className="w-full h-full flex flex-col">
          <div className="flex items-center gap-2 p-2 bg-red-600 text-white">
            <span className="text-sm font-bold">Gmail</span>
          </div>
          <iframe src="https://mail.google.com" className="flex-1 w-full border-none" title="Gmail" />
        </div>
      );
      case 'photos': return (
        <div className="w-full h-full flex flex-col">
          <iframe src="https://photos.google.com" className="flex-1 w-full border-none" title="Google Photos" />
        </div>
      );
      case 'googleone': return (
        <div className="w-full h-full flex flex-col">
          <iframe src="https://one.google.com" className="flex-1 w-full border-none" title="Google One" />
        </div>
      );
      case 'playstore': return (
        <div className="w-full h-full flex flex-col">
          <iframe src="https://play.google.com/store" className="flex-1 w-full border-none" title="Play Store" />
        </div>
      );
      case 'maps': return (
        <div className="w-full h-full flex flex-col">
          <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15000!2d-122.4194!3d37.7749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1" className="flex-1 w-full border-none" title="Google Maps" />
        </div>
      );
      case 'drive': return (
        <div className="w-full h-full flex flex-col">
          <iframe src="https://drive.google.com" className="flex-1 w-full border-none" title="Google Drive" />
        </div>
      );
      case 'youtube': return (
        <div className="w-full h-full flex flex-col">
          <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" className="flex-1 w-full border-none" title="YouTube" />
        </div>
      );
      case 'calendar': return (
        <div className="w-full h-full flex flex-col">
          <iframe src="https://calendar.google.com/calendar/embed?src=en.usa%23holiday%40group.v.calendar.google.com&ctz=America%2FLos_Angeles" className="flex-1 w-full border-none" title="Google Calendar" />
        </div>
      );
      case 'docs': return (
        <div className="w-full h-full flex flex-col">
          <iframe src="https://docs.google.com/document" className="flex-1 w-full border-none" title="Google Docs" />
        </div>
      );
      case 'sheets': return (
        <div className="w-full h-full flex flex-col">
          <iframe src="https://docs.google.com/spreadsheets" className="flex-1 w-full border-none" title="Google Sheets" />
        </div>
      );
      case 'slides': return (
        <div className="w-full h-full flex flex-col">
          <iframe src="https://docs.google.com/presentation" className="flex-1 w-full border-none" title="Google Slides" />
        </div>
      );
      case 'ghost': return (
        <div className="flex flex-col h-full bg-black text-green-500 font-mono p-4">
          <div className="flex items-center gap-2 mb-4 border-b border-green-900 pb-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-widest">Ghost Secure Terminal</span>
          </div>
          <div className="flex-1 overflow-y-auto text-xs space-y-2">
            <p className="opacity-50">[SYSTEM]: Connection established...</p>
            <p className="opacity-50">[SYSTEM]: Encryption layer active.</p>
            <p className="text-green-400">Welcome to Ghost Secret Chat. Your messages are end-to-end encrypted and self-destruct after reading.</p>
            <div className="mt-4 p-2 bg-green-950/30 border border-green-900 rounded">
              <p className="text-[10px] opacity-70 mb-1">GHOST_USER_77:</p>
              <p>The package has been delivered. Awaiting further instructions.</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="text-green-500">&gt;</span>
            <input 
              type="text" 
              className="bg-transparent outline-none flex-1 text-xs text-green-400"
              placeholder="Type encrypted message..."
              autoFocus
            />
          </div>
        </div>
      );
      case 'edge': return (
        <div className="w-full h-full flex flex-col">
          <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800">
            <div className="flex-1 bg-white dark:bg-black/20 rounded px-3 py-1 text-xs">https://www.bing.com</div>
          </div>
          <iframe src="https://www.bing.com" className="flex-1 w-full border-none" title="Edge" />
        </div>
      );
      default: return (
        <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
          <div className="text-xl font-semibold">Coming Soon</div>
          <p className="text-sm">This app is under development.</p>
        </div>
      );
    }
  };

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, isOpen: boolean } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, isOpen: true });
  };

  return (
    <div 
      className="h-screen w-screen overflow-hidden relative select-none"
      onContextMenu={handleContextMenu}
      onClick={() => setContextMenu(null)}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 -z-10"
        style={{ 
          backgroundImage: `url(${desktops.find(d => d.id === activeDesktopId)?.wallpaper || wallpaper})`,
          filter: `brightness(${brightness}%)`
        }}
      />
      
      {/* Desktop Icons */}
      <div className="p-4 grid grid-flow-col grid-rows-6 gap-4 w-fit">
        {APPS.slice(0, 6).map(app => (
          <button
            key={app.id}
            onDoubleClick={() => openApp(app.id)}
            onTouchEnd={() => openApp(app.id)}
            className="flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 transition-colors group w-20"
          >
            <div className="p-2 group-active:scale-95 transition-transform">
              <app.icon className={cn("w-10 h-10 drop-shadow-md", app.color)} />
            </div>
            <span className="text-[11px] text-white text-shadow font-medium text-center leading-tight">
              {app.name}
            </span>
          </button>
        ))}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu?.isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ left: contextMenu.x, top: contextMenu.y }}
            className="fixed w-56 win-glass win-shadow rounded-lg border border-white/20 py-1 z-[10000] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/40 font-bold">Desktop</div>
            <button className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid size={14} className="opacity-60" />
                <span>View</span>
              </div>
              <ChevronRight size={12} className="opacity-40" />
            </button>
            <button className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SortAsc size={14} className="opacity-60" />
                <span>Sort by</span>
              </div>
              <ChevronRight size={12} className="opacity-40" />
            </button>
            <button 
              onClick={() => {
                setContextMenu(null);
                addNotification('System', 'Desktop refreshed successfully');
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={14} className="opacity-60" />
              <span>Refresh</span>
            </button>
            <div className="h-px bg-white/10 my-1 mx-2" />
            <button 
              onClick={() => {
                setContextMenu(null);
                addNotification('File System', 'New folder created on desktop');
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <FolderPlus size={14} className="opacity-60" />
              <span>Create new folder</span>
            </button>
            <div className="h-px bg-white/10 my-1 mx-2" />
            <button 
              onClick={() => {
                openApp('settings');
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Monitor size={14} className="opacity-60" />
              <span>Display settings</span>
            </button>
            <button 
              onClick={() => {
                openApp('settings');
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Paintbrush size={14} className="opacity-60" />
              <span>Change wallpaper</span>
            </button>
            <div className="h-px bg-white/10 my-1 mx-2" />
            <button className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-colors flex items-center justify-between">
              <span>Show more options</span>
              <span className="text-[10px] opacity-40">Shift+F10</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Windows */}
      {windows.filter(win => win.desktopId === activeDesktopId).map(win => {
        const app = APPS.find(a => a.id === win.id);
        if (!app) return null;
        return (
          <Window
            key={win.id}
            id={win.id}
            title={app.name}
            icon={app.icon}
            isOpen={win.isOpen}
            isMinimized={win.isMinimized}
            isMaximized={win.isMaximized}
            snapType={win.snapType}
            zIndex={win.zIndex}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => minimizeWindow(win.id)}
            onMaximize={() => maximizeWindow(win.id)}
            onSnap={(snapType) => snapWindow(win.id, snapType)}
            onFocus={() => focusWindow(win.id)}
            desktops={desktops}
            currentDesktopId={activeDesktopId}
            onMoveToDesktop={(desktopId) => moveWindowToDesktop(win.id, desktopId)}
          >
            {renderAppContent(win.id)}
          </Window>
        );
      })}

      {/* Search Interface */}
      <SearchInterface 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onAppClick={openApp}
      />

      {/* Start Menu */}
      <StartMenu 
        isOpen={isStartOpen} 
        onClose={() => setIsStartOpen(false)} 
        onAppClick={openApp}
        userProfile={userProfile}
      />

      {/* Taskbar */}
      <Taskbar 
        onStartClick={() => setIsStartOpen(!isStartOpen)}
        onSearchClick={() => setIsSearchOpen(!isSearchOpen)}
        onNotificationClick={() => setIsNotificationOpen(!isNotificationOpen)}
        notificationCount={notifications.length}
        volume={volume}
        openWindows={windows}
        activeWindowId={activeWindowId}
        onAppClick={openApp}
        desktops={desktops}
        activeDesktopId={activeDesktopId}
        onSwitchDesktop={switchDesktop}
        onCreateDesktop={createDesktop}
        onDeleteDesktop={deleteDesktop}
      />

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onClearNotifications={clearNotifications}
        onRemoveNotification={removeNotification}
        volume={volume}
        onVolumeChange={setVolume}
        brightness={brightness}
        onBrightnessChange={setBrightness}
        isWifiOn={isWifiOn}
        onWifiToggle={setIsWifiOn}
        isBluetoothOn={isBluetoothOn}
        onBluetoothToggle={setIsBluetoothOn}
        isFlightModeOn={isFlightModeOn}
        onFlightModeToggle={setIsFlightModeOn}
        onAppClick={openApp}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed right-4 bottom-16 w-80 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 z-[10000] shadow-2xl cursor-pointer"
            onClick={() => {
              setIsNotificationOpen(true);
              setActiveToast(null);
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Bell size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white mb-1">{activeToast.title}</h4>
                <p className="text-xs text-white/60 line-clamp-2">{activeToast.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu (Simplified) */}
      <div className="hidden">
        {/* Right click menu logic could go here */}
      </div>
    </div>
  );
}
