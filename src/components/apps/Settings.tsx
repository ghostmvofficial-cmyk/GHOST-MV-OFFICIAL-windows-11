import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Keyboard,
  Mic2,
  MonitorPlay,
  Shield,
  ShieldAlert,
  Smartphone,
  Speaker,
  Type,
  UserPlus,
  Video,
  Volume2,
  Wifi,
  Zap,
  Battery,
  HardDrive,
  Layers,
  Gamepad2,
  Accessibility,
  ShieldCheck,
  Download,
  Settings2,
  Mic,
  Camera,
  MapPin,
  Layout,
  Palette,
  Key,
  Languages,
  Eye,
  Activity,
  Loader2,
  AlertCircle,
  Clock,
  RefreshCw,
  ChevronRight,
  Search,
  HelpCircle,
  Info,
  LayoutGrid,
  History,
  Lock,
  Mail,
  Code,
  Terminal,
  Trash2,
  Tv,
  Cast,
  Sun,
  Plane,
  Bluetooth,
  Monitor,
  Settings as SettingsIcon,
  User,
  Globe,
  Bell,
  Focus,
  Database,
  Cloud,
  Users,
  Gamepad,
  Keyboard as KeyboardIcon,
  MousePointer2,
  Volume1,
  VolumeX,
  MonitorCheck,
  Cpu,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { cn } from '../../lib/utils';

interface SettingsAppProps {
  onTestNotification?: () => void;
  userProfile?: UserProfile;
  wallpaper?: string;
  onWallpaperChange?: (url: string) => void;
  isWifiOn: boolean;
  onWifiToggle: (val: boolean) => void;
  isBluetoothOn: boolean;
  onBluetoothToggle: (val: boolean) => void;
  isFlightModeOn: boolean;
  onFlightModeToggle: (val: boolean) => void;
  volume: number;
  onVolumeChange: (val: number) => void;
  brightness: number;
  onBrightnessChange: (val: number) => void;
  onProfileUpdate?: (profile: UserProfile) => void;
  onAppOpen?: (id: string) => void;
  isGhostShieldOn: boolean;
  onGhostShieldToggle: (val: boolean) => void;
  isIDSOn: boolean;
  onIDSToggle: (val: boolean) => void;
  isRemoteControlBlocked: boolean;
  onRemoteControlToggle: (val: boolean) => void;
  isIPLoggingOn: boolean;
  onIPLoggingToggle: (val: boolean) => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({ 
  onTestNotification, 
  userProfile, 
  wallpaper, 
  onWallpaperChange,
  isWifiOn,
  onWifiToggle,
  isBluetoothOn,
  onBluetoothToggle,
  isFlightModeOn,
  onFlightModeToggle,
  volume,
  onVolumeChange,
  brightness,
  onBrightnessChange,
  onProfileUpdate,
  onAppOpen,
  isGhostShieldOn,
  onGhostShieldToggle,
  isIDSOn,
  onIDSToggle,
  isRemoteControlBlocked,
  onRemoteControlToggle,
  isIPLoggingOn,
  onIPLoggingToggle
}) => {
  const [activeCategory, setActiveCategory] = React.useState('System');
  const [activeSubPage, setActiveSubPage] = React.useState<string | null>(null);
  const [isDevOptionsEnabled, setIsDevOptionsEnabled] = React.useState(false);
  const [isUsbDebuggingEnabled, setIsUsbDebuggingEnabled] = React.useState(false);
  const [installedApps, setInstalledApps] = React.useState(['Ghost Chat', 'Calculator', 'Notepad', 'Edge', 'Paint', 'Slides']);
  const [isInstalling, setIsInstalling] = React.useState(false);
  const [installProgress, setInstallProgress] = React.useState(0);
  const [installingAppName, setInstallingAppName] = React.useState('');
  const [appToUninstall, setAppToUninstall] = React.useState<string | null>(null);
  const [appToInstallConfirm, setAppToInstallConfirm] = React.useState<string | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = React.useState(false);
  const [newAppName, setNewAppName] = React.useState('');
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [expandedDevices, setExpandedDevices] = React.useState<string[]>([]);
  const [users, setUsers] = React.useState([
    { id: '1', name: userProfile?.name || 'Admin', email: userProfile?.email || 'admin@ghost.os', role: 'Owner', avatar: userProfile?.avatar },
    { id: '2', name: 'Guest', email: 'guest@ghost.os', role: 'Guest', avatar: '' }
  ]);
  const [backupStatus, setBackupStatus] = React.useState({
    lastBackup: 'Yesterday, 11:45 PM',
    status: 'Up to date',
    autoBackup: true,
    storageUsed: '12.4 GB'
  });
  const [statusBarSettings, setStatusBarSettings] = React.useState({
    showBatteryPercentage: true,
    showNetworkSpeed: false,
    showNotificationIcons: true,
    clockFormat: '12h'
  });
  const [ramInfo, setRamInfo] = React.useState({
    total: 32,
    used: 8.4,
    cached: 4.2,
    available: 19.4
  });

  const toggleDevice = (id: string) => {
    setExpandedDevices(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Profile editing state
  const [editName, setEditName] = React.useState(userProfile?.name || '');
  const [editEmail, setEditEmail] = React.useState(userProfile?.email || '');
  const [editAvatar, setEditAvatar] = React.useState(userProfile?.avatar || '');
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);

  const handleSaveProfile = () => {
    if (onProfileUpdate) {
      onProfileUpdate({
        name: editName,
        email: editEmail,
        avatar: editAvatar,
        role: userProfile?.role || 'User'
      });
    }
    setIsEditingProfile(false);
  };

  const handleInstall = (appName: string) => {
    setInstallingAppName(appName);
    setIsInstalling(true);
    setInstallProgress(0);
    setShowSuccess(false);
    
    const interval = setInterval(() => {
      setInstallProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setInstalledApps(apps => [...apps, appName]);
            setIsInstalling(false);
            setInstallProgress(0);
            setInstallingAppName('');
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const Toggle = ({ active, onToggle }: { active: boolean, onToggle: (val: boolean) => void }) => (
    <button 
      onClick={() => onToggle(!active)}
      className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-6' : 'left-1'}`} />
    </button>
  );

  const wallpapers = [
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?q=80&w=1920&auto=format&fit=crop'
  ];

  const menuItems = [
    { icon: Monitor, label: 'System', desc: 'Display, sound, notifications, power' },
    { icon: Smartphone, label: 'Bluetooth & devices', desc: 'Mouse, keyboard, phone, cast' },
    { icon: Globe, label: 'Network & internet', desc: 'Wi-Fi, airplane mode, VPN, proxy' },
    { icon: Smartphone, label: 'Personalization', desc: 'Background, lock screen, themes' },
    { icon: LayoutGrid, label: 'Apps', desc: 'Installed apps, default apps, startup' },
    { icon: User, label: 'Accounts', desc: 'Your info, emails, sign-in options' },
    { icon: Users, label: 'Multiple Users', desc: 'Manage user accounts and guests' },
    { icon: Database, label: 'RAM & Storage', desc: 'Memory usage, disk space' },
    { icon: Bell, label: 'Notifications & Status Bar', desc: 'Alerts, status icons, clock' },
    { icon: Cloud, label: 'Backup & Restore', desc: 'Cloud backup, recovery' },
    { icon: RotateCcw, label: 'Reset Options', desc: 'Reset Wi-Fi, apps, or factory reset' },
    { icon: SettingsIcon, label: 'System Management', desc: 'Advanced system controls' },
    { icon: Clock, label: 'Time & language', desc: 'Region, date, speech' },
    { icon: Zap, label: 'Gaming', desc: 'Xbox Game Bar, Game Mode' },
    { icon: Eye, label: 'Accessibility', desc: 'Narrator, magnifier, contrast' },
    { icon: Shield, label: 'Privacy & security', desc: 'Windows Security, permissions' },
    { icon: Shield, label: 'Ghost Shield', desc: 'Intrusion detection, firewall' },
    { icon: RefreshCw, label: 'Windows Update', desc: 'Updates, history, options' },
    { icon: Info, label: 'About', desc: 'System info, version' },
    ...(isDevOptionsEnabled ? [{ icon: Code, label: 'Developer options', desc: 'Advanced settings' }] : [])
  ];

  const renderSubPage = () => {
    const backButton = (
      <button 
        onClick={() => setActiveSubPage(null)}
        className="flex items-center gap-2 text-xs font-medium text-blue-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Back to {activeCategory}
      </button>
    );

    switch (activeSubPage) {
      case 'DateTime':
        return (
          <div className="space-y-6">
            {backButton}
            <h2 className="text-xl font-semibold">Date & time</h2>
            <div className="grid gap-4">
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-sm opacity-60">{new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <Clock className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Set time automatically</span>
                  <span className="text-xs opacity-60">On</span>
                </div>
                <Toggle active={true} onToggle={() => {}} />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="text-sm font-medium block mb-2">Time zone</span>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs outline-none">
                  <option>(UTC-08:00) Pacific Time (US & Canada)</option>
                  <option>(UTC+00:00) Dublin, Edinburgh, Lisbon, London</option>
                  <option>(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'GameMode':
        return (
          <div className="space-y-6">
            {backButton}
            <h2 className="text-xl font-semibold">Game Mode</h2>
            <div className="grid gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Game Mode</span>
                  <span className="text-xs opacity-60">Optimize your PC for play by turning things off in the background</span>
                </div>
                <Toggle active={true} onToggle={() => {}} />
              </div>
            </div>
          </div>
        );
      case 'Magnifier':
        return (
          <div className="space-y-6">
            {backButton}
            <h2 className="text-xl font-semibold">Magnifier</h2>
            <div className="grid gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Magnifier</span>
                  <span className="text-xs opacity-60">Zoom in on parts of your screen</span>
                </div>
                <Toggle active={false} onToggle={() => {}} />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Zoom level</span>
                  <span className="text-xs opacity-60">100%</span>
                </div>
                <div className="flex items-center gap-4">
                  <button className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-bold">-</button>
                  <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <button className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-bold">+</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Mouse':
        return (
          <div className="space-y-6">
            {backButton}
            <h2 className="text-xl font-semibold">Mouse</h2>
            <div className="grid gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="text-sm font-medium block mb-2">Primary mouse button</span>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs outline-none">
                  <option>Left</option>
                  <option>Right</option>
                </select>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Mouse pointer speed</span>
                  <span className="text-xs opacity-60">10</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  defaultValue="10"
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="text-sm font-medium block mb-2">Scrolling</span>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs outline-none">
                  <option>Multiple lines at a time</option>
                  <option>One screen at a time</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'WiFi':
        return (
          <div className="space-y-6">
            {backButton}
            <h2 className="text-xl font-semibold">Wi-Fi</h2>
            <div className="grid gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Wi-Fi</span>
                  <span className="text-xs opacity-60">{isWifiOn ? 'Connected' : 'Off'}</span>
                </div>
                <Toggle active={isWifiOn} onToggle={onWifiToggle} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mt-4 mb-2 px-1">Available networks</h3>
              {['Ghost_Network_5G', 'Home_WiFi', 'Coffee_Shop_Free'].map(net => (
                <div key={net} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all">
                  <div className="flex items-center gap-3">
                    <Wifi className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">{net}</span>
                  </div>
                  <span className="text-[10px] opacity-40">{net === 'Ghost_Network_5G' ? 'Connected' : 'Secured'}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'InstalledApps':
        return (
          <div className="space-y-6">
            {backButton}
            <h2 className="text-xl font-semibold">Installed apps</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <input 
                type="text" 
                placeholder="Search apps" 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-10 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid gap-2">
              {installedApps.map(app => (
                <div key={app} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <LayoutGrid className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{app}</span>
                      <span className="text-xs opacity-40">1.2 MB | Version 1.0.0</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setAppToUninstall(app)}
                      className="p-2 hover:bg-red-500/10 text-red-500 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'SignInOptions':
        return (
          <div className="space-y-6">
            {backButton}
            <h2 className="text-xl font-semibold">Sign-in options</h2>
            <div className="grid gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Facial recognition (Windows Hello)</span>
                    <span className="text-xs opacity-60">This option is currently unavailable</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Key className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">PIN (Windows Hello)</span>
                    <span className="text-xs opacity-60">Use a PIN to sign in to Windows</span>
                  </div>
                </div>
                <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-xs font-medium transition-colors">
                  Change
                </button>
              </div>
            </div>
          </div>
        );
      case 'WindowsSecurity':
        return (
          <div className="space-y-6">
            {backButton}
            <h2 className="text-xl font-semibold">Windows Security</h2>
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Security at a glance</h3>
                <p className="text-sm opacity-60">See what's happening with the security and health of your device.</p>
              </div>
            </div>
            <div className="grid gap-2">
              {[
                { label: 'Virus & threat protection', icon: Shield, status: 'No action needed' },
                { label: 'Account protection', icon: User, status: 'No action needed' },
                { label: 'Firewall & network protection', icon: Globe, status: 'No action needed' },
                { label: 'App & browser control', icon: LayoutGrid, status: 'No action needed' },
              ].map(item => (
                <div key={item.label} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all">
                  <div className="flex items-center gap-4">
                    <item.icon className="w-5 h-5 text-blue-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-green-500">{item.status}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </div>
              ))}
            </div>
          </div>
        );
      case 'Display':
        return (
          <div className="space-y-6">
            {backButton}
            <h2 className="text-xl font-semibold">Display</h2>
            <div className="grid gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Brightness</span>
                  <span className="text-xs opacity-60">{brightness}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={brightness}
                  onChange={(e) => onBrightnessChange(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Night light</span>
                  <span className="text-xs opacity-60">Use warmer colors to help you sleep</span>
                </div>
                <Toggle active={false} onToggle={() => {}} />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="text-sm font-medium block mb-2">Scale</span>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs outline-none">
                  <option>100% (Recommended)</option>
                  <option>125%</option>
                  <option>150%</option>
                </select>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="text-sm font-medium block mb-2">Display resolution</span>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs outline-none">
                  <option>1920 x 1080 (Recommended)</option>
                  <option>1600 x 900</option>
                  <option>1366 x 768</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'Sound':
        return (
          <div className="space-y-6">
            {backButton}
            <h2 className="text-xl font-semibold">Sound</h2>
            <div className="grid gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Master volume</span>
                  <span className="text-xs opacity-60">{volume}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume}
                  onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="text-sm font-medium block mb-2">Output device</span>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs outline-none">
                  <option>Speakers (Realtek Audio)</option>
                  <option>Headphones (Ghost Wireless)</option>
                </select>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="text-sm font-medium block mb-2">Input device</span>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs outline-none">
                  <option>Microphone (Realtek Audio)</option>
                  <option>External Mic (USB Audio)</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'Power':
        return (
          <div className="space-y-6">
            {backButton}
            <h2 className="text-xl font-semibold">Power & battery</h2>
            <div className="grid gap-4">
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Battery className="w-10 h-10 text-green-500" />
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">85%</span>
                    <span className="text-xs opacity-60">Estimated time remaining: 4h 12m</span>
                  </div>
                </div>
                <div className="h-12 w-24 bg-slate-100 dark:bg-slate-800 rounded relative overflow-hidden">
                  <div className="absolute inset-0 bg-green-500/20" />
                  <div className="absolute top-0 left-0 bottom-0 bg-green-500 w-[85%]" />
                </div>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mt-4 mb-2 px-1">Screen and sleep</h3>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="text-sm font-medium block mb-2">On battery power, turn off my screen after</span>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs outline-none">
                  <option>5 minutes</option>
                  <option>10 minutes</option>
                  <option>Never</option>
                </select>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="text-sm font-medium block mb-2">When plugged in, turn off my screen after</span>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs outline-none">
                  <option>10 minutes</option>
                  <option>30 minutes</option>
                  <option>Never</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'Sound':
        return (
          <div className="space-y-6">
            {backButton}
            <h2 className="text-xl font-semibold">Background</h2>
            <div className="grid gap-6">
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <h3 className="text-sm font-semibold mb-4">Personalize your background</h3>
                <div className="grid grid-cols-3 gap-3">
                  {wallpapers.map((wp, i) => (
                    <button
                      key={i}
                      onClick={() => onWallpaperChange?.(wp)}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                        wallpaper === wp ? 'border-blue-500 scale-95 shadow-lg' : 'border-transparent hover:scale-105'
                      }`}
                    >
                      <img src={wp} alt={`Wallpaper ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="text-sm font-medium block mb-2">Background type</span>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs outline-none">
                  <option>Picture</option>
                  <option>Solid color</option>
                  <option>Slideshow</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'Taskbar':
        return (
          <div className="space-y-6">
            {backButton}
            <h2 className="text-xl font-semibold">Taskbar</h2>
            <div className="grid gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="text-sm font-medium block mb-2">Taskbar alignment</span>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs outline-none">
                  <option>Center</option>
                  <option>Left</option>
                </select>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Automatically hide the taskbar</span>
                  <span className="text-xs opacity-60">Hide taskbar when not in use</span>
                </div>
                <Toggle active={false} onToggle={() => {}} />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Show badges on taskbar apps</span>
                  <span className="text-xs opacity-60">Notification counters</span>
                </div>
                <Toggle active={true} onToggle={() => {}} />
              </div>
            </div>
          </div>
        );
      case 'DeviceManager':
        const devices = [
          { id: 'cpu', name: 'Processors', icon: Cpu, subDevices: ['Ghost Core i9-13900K @ 3.00GHz (24 CPUs)'] },
          { id: 'gpu', name: 'Display adapters', icon: Monitor, subDevices: ['Ghost RTX 4090 Ti', 'Intel(R) UHD Graphics 770'] },
          { id: 'disk', name: 'Disk drives', icon: HardDrive, subDevices: ['Ghost NVMe SSD 2TB', 'Ghost SATA SSD 1TB'] },
          { id: 'net', name: 'Network adapters', icon: Wifi, subDevices: ['Ghost Wi-Fi 6E Adapter', 'Ghost Gigabit Ethernet Controller'] },
          { id: 'audio', name: 'Audio inputs and outputs', icon: Speaker, subDevices: ['Speakers (Realtek Audio)', 'Microphone (Realtek Audio)'] },
          { id: 'hid', name: 'Human Interface Devices', icon: MousePointer2, subDevices: ['Ghost Wireless Mouse', 'Ghost Mechanical Keyboard', 'Ghost Touchpad'] },
          { id: 'bluetooth', name: 'Bluetooth', icon: Bluetooth, subDevices: ['Ghost Bluetooth 5.3 Radio'] },
          { id: 'camera', name: 'Cameras', icon: Camera, subDevices: ['Ghost HD Webcam'] },
          { id: 'battery', name: 'Batteries', icon: Battery, subDevices: ['Ghost High Capacity Battery', 'Microsoft AC Adapter'] },
        ];
        return (
          <div className="space-y-6">
            {backButton}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Device Manager</h2>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4 opacity-60" />
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <Search className="w-4 h-4 opacity-60" />
                </button>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
                <Monitor className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold">GHOST-DESKTOP-PC</span>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {devices.map(device => (
                  <div key={device.id} className="flex flex-col">
                    <button 
                      onClick={() => toggleDevice(device.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <device.icon className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium">{device.name}</span>
                      </div>
                      <ChevronDown className={cn("w-4 h-4 opacity-40 transition-transform", expandedDevices.includes(device.id) && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {expandedDevices.includes(device.id) && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-slate-50/50 dark:bg-slate-800/20"
                        >
                          {device.subDevices.map((sub, idx) => (
                            <div key={idx} className="p-4 pl-12 flex items-center justify-between group border-t border-slate-100 dark:border-slate-800/50">
                              <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-xs opacity-70">{sub}</span>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="px-2 py-1 text-[10px] font-bold text-blue-500 hover:bg-blue-500/10 rounded transition-colors">Update Driver</button>
                                <button className="px-2 py-1 text-[10px] font-bold text-red-500 hover:bg-red-500/10 rounded transition-colors">Disable</button>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-4">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">Driver Updates</span>
                <p className="text-xs opacity-60 leading-relaxed">All drivers are up to date. Last checked: Today, 10:06 AM. Windows Update manages most driver installations automatically.</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <SettingsIcon className="w-12 h-12 mb-4" />
            <p className="text-sm font-medium">This section is under development</p>
          </div>
        );
    }
  };

  const renderContent = () => {
    if (activeSubPage) {
      return renderSubPage();
    }

    switch (activeCategory) {
      case 'System':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">System</h2>
            <div className="grid gap-2">
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2 px-1">Display & Sound</h3>
              <div 
                onClick={() => setActiveSubPage('Display')}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Display</span>
                    <span className="text-xs opacity-60">Brightness, night light, scale</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-60">{brightness}%</span>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </div>
              </div>

              <div 
                onClick={() => setActiveSubPage('Sound')}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Sound</span>
                    <span className="text-xs opacity-60">Volume levels, output, input</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-60">{volume}%</span>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </div>
              </div>

              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mt-4 mb-2 px-1">Notifications & Focus</h3>
              <div 
                onClick={() => {
                  setActiveCategory('Notifications & Status Bar');
                  setActiveSubPage(null);
                }}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <Bell className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Notifications</span>
                    <span className="text-xs opacity-60">Alerts from apps and system</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Focus className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Focus Assist</span>
                    <span className="text-xs opacity-60">Choose which notifications you want to see</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mt-4 mb-2 px-1">Power & Performance</h3>
              <div 
                onClick={() => setActiveSubPage('Power')}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <Battery className="w-5 h-5 text-green-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Power & battery</span>
                    <span className="text-xs opacity-60">Sleep, battery usage, battery saver</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <div 
                onClick={() => {
                  setActiveCategory('RAM & Storage');
                  setActiveSubPage(null);
                }}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <HardDrive className="w-5 h-5 text-purple-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Storage</span>
                    <span className="text-xs opacity-60">Storage space, cleanup recommendations</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Layers className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Multitasking</span>
                    <span className="text-xs opacity-60">Snap windows, desktops, task switching</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <MonitorCheck className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Activation</span>
                    <span className="text-xs opacity-60">Activation state, subscriptions, product key</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mt-4 mb-2 px-1">Maintenance</h3>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Troubleshoot</span>
                    <span className="text-xs opacity-60">Recommended troubleshooters, history</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <div 
                onClick={() => {
                  setActiveCategory('Reset Options');
                  setActiveSubPage(null);
                }}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <RefreshCw className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Recovery</span>
                    <span className="text-xs opacity-60">Reset this PC, advanced startup, go back</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <div 
                onClick={onTestNotification}
                className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <RefreshCw className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Test Notification</span>
                    <span className="text-xs opacity-60">Send a mock notification to test the system</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
            </div>
          </div>
        );

      case 'Multiple Users':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Multiple Users</h2>
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Multiple users</span>
                <span className="text-xs opacity-60">Allow other people to use this device</span>
              </div>
              <Toggle active={true} onToggle={() => {}} />
            </div>
            
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4 px-1">User Accounts</h3>
            <div className="grid gap-3">
              {users.map(user => (
                <div key={user.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs opacity-60">{user.role} • {user.email}</span>
                    </div>
                  </div>
                  {user.role !== 'Owner' && (
                    <button className="p-2 hover:bg-red-500/10 text-red-500 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center gap-2 hover:bg-white dark:hover:bg-white/5 transition-all group">
                <UserPlus className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Add user or profile</span>
              </button>
            </div>
          </div>
        );

      case 'RAM & Storage':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">RAM & Storage</h2>
            
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4 px-1">Memory (RAM)</h3>
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium">System Memory</span>
                <span className="text-xs opacity-60">{ramInfo.used} GB used / {ramInfo.total} GB total</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-blue-500" style={{ width: `${(ramInfo.used / ramInfo.total) * 100}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium opacity-50">Used</span>
                  <span className="text-sm font-bold">{ramInfo.used} GB</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium opacity-50">Cached</span>
                  <span className="text-sm font-bold">{ramInfo.cached} GB</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium opacity-50">Available</span>
                  <span className="text-sm font-bold">{ramInfo.available} GB</span>
                </div>
              </div>
            </div>

            <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mt-6 mb-4 px-1">Storage</h3>
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium">Local Disk (C:)</span>
                <span className="text-xs opacity-60">124 GB used / 512 GB total</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-purple-500 w-[24%]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium opacity-50">Apps & features</span>
                  <span className="text-sm font-bold">42.5 GB</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium opacity-50">Temporary files</span>
                  <span className="text-sm font-bold">1.2 GB</span>
                </div>
              </div>
              <button className="w-full mt-6 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg text-xs font-bold transition-all">
                Run Storage Cleanup
              </button>
            </div>
          </div>
        );

      case 'Notifications & Status Bar':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Notifications & Status Bar</h2>
            
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4 px-1">Notifications</h3>
            <div className="grid gap-3">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Allow notifications</span>
                  <span className="text-xs opacity-60">Get alerts from apps and other senders</span>
                </div>
                <Toggle active={true} onToggle={() => {}} />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Notification sounds</span>
                  <span className="text-xs opacity-60">Play a sound when a notification arrives</span>
                </div>
                <Toggle active={true} onToggle={() => {}} />
              </div>
            </div>

            <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mt-6 mb-4 px-1">Status Bar</h3>
            <div className="grid gap-3">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Show battery percentage</span>
                  <span className="text-xs opacity-60">Display the percentage next to the battery icon</span>
                </div>
                <Toggle 
                  active={statusBarSettings.showBatteryPercentage} 
                  onToggle={(val) => setStatusBarSettings(prev => ({ ...prev, showBatteryPercentage: val }))} 
                />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Show network speed</span>
                  <span className="text-xs opacity-60">Display real-time upload/download speeds</span>
                </div>
                <Toggle 
                  active={statusBarSettings.showNetworkSpeed} 
                  onToggle={(val) => setStatusBarSettings(prev => ({ ...prev, showNetworkSpeed: val }))} 
                />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Clock format</span>
                  <span className="text-xs opacity-60">Switch between 12-hour and 24-hour format</span>
                </div>
                <select 
                  value={statusBarSettings.clockFormat}
                  onChange={(e) => setStatusBarSettings(prev => ({ ...prev, clockFormat: e.target.value }))}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs outline-none"
                >
                  <option value="12h">12-hour</option>
                  <option value="24h">24-hour</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'Backup & Restore':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Backup & Restore</h2>
            
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Cloud className="w-10 h-10" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">Ghost Cloud Backup</h3>
                <p className="text-sm opacity-60">Keep your files and settings safe in the cloud.</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs font-medium text-green-500">{backupStatus.status}</span>
                  <span className="text-xs opacity-40">Last backup: {backupStatus.lastBackup}</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Back up now
              </button>
            </div>

            <div className="grid gap-3">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Automatic backup</span>
                  <span className="text-xs opacity-60">Back up your data automatically when connected to Wi-Fi</span>
                </div>
                <Toggle 
                  active={backupStatus.autoBackup} 
                  onToggle={(val) => setBackupStatus(prev => ({ ...prev, autoBackup: val }))} 
                />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all">
                <div className="flex items-center gap-4">
                  <History className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Restore from backup</span>
                    <span className="text-xs opacity-60">Choose a previous backup to restore your device</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
            </div>

            <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase opacity-40">Cloud Storage</span>
                <span className="text-xs font-medium">{backupStatus.storageUsed} / 50 GB</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[25%]" />
              </div>
              <button className="mt-4 text-xs font-bold text-blue-500 hover:underline">Manage storage</button>
            </div>
          </div>
        );

      case 'Reset Options':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Reset Options</h2>
            <p className="text-sm opacity-60 mb-6">Choose which parts of the system you want to reset. Be careful, some actions cannot be undone.</p>
            
            <div className="grid gap-3">
              {[
                { label: 'Reset Wi-Fi, mobile & Bluetooth', icon: Wifi, desc: 'Resets all network settings, including Wi-Fi, mobile data, and Bluetooth.' },
                { label: 'Reset app preferences', icon: LayoutGrid, desc: 'Resets all preferences for disabled apps, notification settings, and default apps.' },
                { label: 'Erase all data (factory reset)', icon: Trash2, desc: 'Erases all data from your device internal storage, including accounts, apps, and media.', danger: true }
              ].map(option => (
                <div key={option.label} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", option.danger ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500")}>
                      <option.icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className={cn("text-sm font-medium", option.danger && "text-red-500")}>{option.label}</span>
                      <span className="text-xs opacity-60 max-w-md">{option.desc}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'System Management':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">System Management</h2>
            
            <div className="grid gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all">
                <div className="flex items-center gap-4">
                  <Terminal className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Command Line Interface</span>
                    <span className="text-xs opacity-60">Configure advanced system parameters via CLI</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all">
                <div className="flex items-center gap-4">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">System Performance</span>
                    <span className="text-xs opacity-60">Monitor CPU, GPU, and disk activity</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all">
                <div className="flex items-center gap-4">
                  <Lock className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Kernel Security</span>
                    <span className="text-xs opacity-60">Manage kernel-level isolation and security modules</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Automatic system updates</span>
                  <span className="text-xs opacity-60">Download and install system patches automatically</span>
                </div>
                <Toggle active={true} onToggle={() => {}} />
              </div>
            </div>
          </div>
        );
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Bluetooth & devices</h2>
            <div className="grid gap-2">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Bluetooth className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Bluetooth</span>
                    <span className="text-xs opacity-60">{isBluetoothOn ? 'Discoverable as "Ghost Mobile"' : 'Off'}</span>
                  </div>
                </div>
                <Toggle active={isBluetoothOn && !isFlightModeOn} onToggle={onBluetoothToggle} />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Cast className="w-5 h-5 text-blue-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Screen Mirroring & Cast</span>
                      <span className="text-xs opacity-60">Connect to wireless displays</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-blue-500/30">
                    <Tv className="w-8 h-8 text-blue-500" />
                    <span className="text-xs font-medium">Living Room TV</span>
                    <span className="text-[10px] opacity-40">Available</span>
                  </button>
                  <button className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-blue-500/30">
                    <Monitor className="w-8 h-8 text-blue-500" />
                    <span className="text-xs font-medium">Office Monitor</span>
                    <span className="text-[10px] opacity-40">Available</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Phone Link</span>
                    <span className="text-xs opacity-60">Connect your Android or iPhone</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <div 
                onClick={() => setActiveSubPage('DeviceManager')}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <Settings2 className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Device Manager</span>
                    <span className="text-xs opacity-60">Manage hardware and drivers</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
            </div>
          </div>
        );

      case 'Network & internet':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Network & internet</h2>
            <div className="grid gap-2">
              <div 
                onClick={() => setActiveSubPage('WiFi')}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <Wifi className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Wi-Fi</span>
                    <span className="text-xs opacity-60">{isWifiOn ? 'Connected to "Ghost_Network_5G"' : 'Disconnected'}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Plane className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Airplane mode</span>
                    <span className="text-xs opacity-60">Disable all wireless communications</span>
                  </div>
                </div>
                <Toggle active={isFlightModeOn} onToggle={onFlightModeToggle} />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">VPN</span>
                    <span className="text-xs opacity-60">Add, edit, and manage VPN connections</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Wifi className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Mobile hotspot</span>
                    <span className="text-xs opacity-60">Share your internet connection</span>
                  </div>
                </div>
                <Toggle active={false} onToggle={() => {}} />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Proxy</span>
                    <span className="text-xs opacity-60">Proxy server for Wi-Fi and Ethernet</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Data usage</span>
                    <span className="text-xs opacity-60">1.2 GB used in the last 30 days</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
            </div>
          </div>
        );

      case 'Personalization':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Personalization</h2>
            <div className="grid gap-6">
              <div 
                onClick={() => setActiveSubPage('Background')}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Background</span>
                    <span className="text-xs opacity-60">Wallpaper, slideshow, solid colors</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <div className="grid gap-2">
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Sun className="w-5 h-5 text-blue-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Colors</span>
                      <span className="text-xs opacity-60">Accent color, transparency effects</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Layers className="w-5 h-5 text-blue-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Themes</span>
                      <span className="text-xs opacity-60">Install, create, manage themes</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Lock className="w-5 h-5 text-blue-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Lock screen</span>
                      <span className="text-xs opacity-60">Lock screen images, apps, timeout</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Languages className="w-5 h-5 text-blue-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Fonts</span>
                      <span className="text-xs opacity-60">Install and manage fonts</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Settings2 className="w-5 h-5 text-blue-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Start</span>
                      <span className="text-xs opacity-60">Recent apps, folders, layout</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </div>

                <div 
                  onClick={() => setActiveSubPage('Taskbar')}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Monitor className="w-5 h-5 text-blue-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Taskbar</span>
                      <span className="text-xs opacity-60">Taskbar behaviors, system icons</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'Apps':
        return (
          <div className="space-y-6 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Apps</h2>
              <button 
                onClick={() => setIsInstallModalOpen(true)}
                disabled={isInstalling}
                className={`px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${isInstalling ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isInstalling ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                {isInstalling ? 'Installing...' : 'Install App'}
              </button>
            </div>

            {isInstalling && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    <span className="text-sm font-medium">Installing {installingAppName}...</span>
                  </div>
                  <span className="text-xs font-bold text-blue-500">{installProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${installProgress}%` }}
                    className="h-full bg-blue-500"
                  />
                </div>
              </div>
            )}

            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl mb-6 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-medium block">Installation Complete</span>
                  <span className="text-xs opacity-60">The app is now ready to use.</span>
                </div>
              </motion.div>
            )}

            <div className="grid gap-2">
              <div 
                onClick={() => setActiveSubPage('InstalledApps')}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <LayoutGrid className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Installed Apps</span>
                    <span className="text-xs opacity-60">Manage your applications</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <LayoutGrid className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Default apps</span>
                    <span className="text-xs opacity-60">Choose defaults for file types</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <RefreshCw className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Optional features</span>
                    <span className="text-xs opacity-60">Extra functionality for your device</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <RefreshCw className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Startup apps</span>
                    <span className="text-xs opacity-60">Apps that start when you sign in</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
              
              <div className="space-y-1 mt-4">
                <h3 className="text-xs font-semibold opacity-50 px-2 mb-2">All apps ({installedApps.length})</h3>
                {installedApps.map(app => (
                  <div key={app} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <LayoutGrid className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-sm">{app}</span>
                    </div>
                    <button 
                      onClick={() => setAppToUninstall(app)}
                      className="p-2 hover:bg-red-500/10 text-red-500 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* App Installation Modal */}
            <AnimatePresence>
              {isInstallModalOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                  onClick={() => setIsInstallModalOpen(false)}
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <RefreshCw className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Install New App</h3>
                        <p className="text-sm opacity-60">Enter the name of the application you want to install.</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <input 
                        type="text" 
                        value={newAppName}
                        onChange={(e) => setNewAppName(e.target.value)}
                        placeholder="App Name"
                        autoFocus
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newAppName.trim()) {
                            handleInstall(newAppName.trim());
                            setNewAppName('');
                            setIsInstallModalOpen(false);
                          }
                        }}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          setIsInstallModalOpen(false);
                          setNewAppName('');
                        }}
                        className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800/80 rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => {
                          if (newAppName.trim()) {
                            setAppToInstallConfirm(newAppName.trim());
                            setNewAppName('');
                            setIsInstallModalOpen(false);
                          }
                        }}
                        disabled={!newAppName.trim()}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Install
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom Installation Confirmation Modal */}
            <AnimatePresence>
              {appToInstallConfirm && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
                  onClick={() => setAppToInstallConfirm(null)}
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <RefreshCw className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Confirm Installation</h3>
                        <p className="text-sm opacity-60">Are you sure you want to install {appToInstallConfirm}?</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setAppToInstallConfirm(null)}
                        className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800/80 rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => {
                          handleInstall(appToInstallConfirm);
                          setAppToInstallConfirm(null);
                        }}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Confirm
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom Uninstallation Confirmation Modal */}
            <AnimatePresence>
              {appToUninstall && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    onClick={() => setAppToUninstall(null)}
                  >
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 20 }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">Uninstall App?</h3>
                          <p className="text-sm opacity-60">Are you sure you want to uninstall {appToUninstall}?</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setAppToUninstall(null)}
                          className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800/80 rounded-lg text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => {
                            setInstalledApps(prev => prev.filter(a => a !== appToUninstall));
                            setAppToUninstall(null);
                          }}
                          className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Uninstall
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        );

      case 'Accounts':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Accounts</h2>
              {!isEditingProfile && (
                <button 
                  onClick={() => {
                    setEditName(userProfile?.name || '');
                    setEditEmail(userProfile?.email || '');
                    setEditAvatar(userProfile?.avatar || '');
                    setIsEditingProfile(true);
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold opacity-60 uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold opacity-60 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold opacity-60 uppercase tracking-wider">Avatar URL</label>
                  <input 
                    type="text" 
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="Enter image URL"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500/20">
                  {userProfile?.avatar ? (
                    <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                      {userProfile?.name?.[0] || 'G'}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold">{userProfile?.name || 'Ghost User'}</span>
                  <span className="text-sm opacity-60">{userProfile?.email || 'ghost@windows.mobile'}</span>
                  <span className="text-xs text-blue-500 font-medium mt-1">{userProfile?.role || 'Administrator'}</span>
                </div>
              </div>
            )}
            
            <div className="grid gap-2">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Email & accounts</span>
                    <span className="text-xs opacity-60">Emails used by apps</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
              <div 
                onClick={() => setActiveSubPage('SignInOptions')}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <Key className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Sign-in options</span>
                    <span className="text-xs opacity-60">Windows Hello, security key</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Family & other users</span>
                    <span className="text-xs opacity-60">Add users, set up kiosk</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Cloud className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Windows backup</span>
                    <span className="text-xs opacity-60">Back up your files and settings</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
              <button 
                onClick={() => alert('Signing out...')}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-4 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all"
              >
                <Lock className="w-5 h-5" />
                <span className="text-sm font-bold">Sign out</span>
              </button>
            </div>
          </div>
        );

      case 'Time & language':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Time & language</h2>
            <div className="grid gap-2">
              <div 
                onClick={() => setActiveSubPage('DateTime')}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Date & time</span>
                    <span className="text-xs opacity-60">{new Date().toLocaleString()}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Languages className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Language & region</span>
                    <span className="text-xs opacity-60">English (United States)</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Type className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Typing</span>
                    <span className="text-xs opacity-60">Touch keyboard, text suggestions</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Mic className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Speech</span>
                    <span className="text-xs opacity-60">Speech recognition, voice typing</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
            </div>
          </div>
        );

      case 'Gaming':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Gaming</h2>
            <div className="grid gap-2">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Gamepad className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Xbox Game Bar</span>
                    <span className="text-xs opacity-60">Clips, screenshots, and broadcasting</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
              <div 
                onClick={() => setActiveSubPage('GameMode')}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Game Mode</span>
                    <span className="text-xs opacity-60">Optimize your PC for play</span>
                  </div>
                </div>
                <Toggle active={true} onToggle={() => {}} />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Video className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Captures</span>
                    <span className="text-xs opacity-60">Save location, recording preferences</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
            </div>
          </div>
        );

      case 'Accessibility':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Accessibility</h2>
            <div className="grid gap-2">
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2 px-1">Vision</h3>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Mic2 className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Narrator</span>
                    <span className="text-xs opacity-60">Screen reader for your device</span>
                  </div>
                </div>
                <Toggle active={false} onToggle={() => {}} />
              </div>
              <div 
                onClick={() => setActiveSubPage('Magnifier')}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <Search className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Magnifier</span>
                    <span className="text-xs opacity-60">Zoom in on parts of your screen</span>
                  </div>
                </div>
                <Toggle active={false} onToggle={() => {}} />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Palette className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">High contrast</span>
                    <span className="text-xs opacity-60">Distinctive colors for better visibility</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mt-4 mb-2 px-1">Interaction</h3>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <KeyboardIcon className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Keyboard shortcuts</span>
                    <span className="text-xs opacity-60">Customize system-wide hotkeys</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
              
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl mt-4">
                <h3 className="text-sm font-bold mb-4">Custom Shortcuts</h3>
                <div className="space-y-3">
                  {[
                    { action: 'Open Start Menu', key: 'Win' },
                    { action: 'Open Search', key: 'Win + S' },
                    { action: 'Open Settings', key: 'Win + I' },
                    { action: 'Open Task Manager', key: 'Ctrl + Shift + Esc' },
                    { action: 'Lock Screen', key: 'Win + L' },
                    { action: 'Snap Left', key: 'Win + Left' },
                    { action: 'Snap Right', key: 'Win + Right' },
                  ].map((shortcut, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-transparent hover:border-blue-500/30 transition-all">
                      <span className="text-xs font-medium">{shortcut.action}</span>
                      <div className="flex gap-1">
                        {shortcut.key.split(' + ').map((k, j) => (
                          <kbd key={j} className="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-mono shadow-sm">
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all">
                  Add New Shortcut
                </button>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Mic className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Speech</span>
                    <span className="text-xs opacity-60">Voice access, speech recognition</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
            </div>
          </div>
        );

      case 'Privacy & security':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Privacy & security</h2>
            <div className="grid gap-2">
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2 px-1">Security</h3>
              <div 
                onClick={() => setActiveSubPage('WindowsSecurity')}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Windows Security</span>
                    <span className="text-xs opacity-60">Antivirus, firewall, and network protection</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Lock className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Find my device</span>
                    <span className="text-xs opacity-60">On</span>
                  </div>
                </div>
                <Toggle active={true} onToggle={() => {}} />
              </div>

              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mt-4 mb-2 px-1">App permissions</h3>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Location</span>
                    <span className="text-xs opacity-60">Apps can access your location</span>
                  </div>
                </div>
                <Toggle active={true} onToggle={() => {}} />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Camera className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Camera</span>
                    <span className="text-xs opacity-60">Apps can access your camera</span>
                  </div>
                </div>
                <Toggle active={true} onToggle={() => {}} />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Mic className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Microphone</span>
                    <span className="text-xs opacity-60">Apps can access your microphone</span>
                  </div>
                </div>
                <Toggle active={true} onToggle={() => {}} />
              </div>

              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mt-4 mb-2 px-1">Diagnostics</h3>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Diagnostics & feedback</span>
                    <span className="text-xs opacity-60">Send diagnostic data to improve Windows</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>

              <div 
                onClick={() => onAppOpen?.('vault')}
                className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between hover:bg-emerald-500/20 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Ghost Vault</span>
                    <span className="text-xs opacity-60">Access the world's best data protection system</span>
                  </div>
                </div>
                <Zap className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        );

      case 'Ghost Shield':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Ghost Shield Security</h2>
              <div className={cn(
                "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest",
                isGhostShieldOn ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
              )}>
                {isGhostShieldOn ? 'System Protected' : 'System Vulnerable'}
              </div>
            </div>

            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Master Protection</h3>
                  <p className="text-xs opacity-60">Enable global security protocols and unauthorized entry blocking.</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="text-sm font-medium">Enable Ghost Shield</span>
                <Toggle active={isGhostShieldOn} onToggle={onGhostShieldToggle} />
              </div>
            </div>

            <div className="grid gap-2">
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2 px-1">Advanced Defense</h3>
              
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Intrusion Detection System (IDS)</span>
                    <span className="text-xs opacity-60">Monitor and block suspicious network activities</span>
                  </div>
                </div>
                <Toggle active={isIDSOn} onToggle={onIDSToggle} />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Monitor className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Block Remote Control</span>
                    <span className="text-xs opacity-60">Prevent unauthorized remote desktop sessions</span>
                  </div>
                </div>
                <Toggle active={isRemoteControlBlocked} onToggle={onRemoteControlToggle} />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Terminal className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">IP Address Logging</span>
                    <span className="text-xs opacity-60">Log and notify IP addresses of blocked attempts</span>
                  </div>
                </div>
                <Toggle active={isIPLoggingOn} onToggle={onIPLoggingToggle} />
              </div>
            </div>

            <div className="mt-8 p-4 border border-blue-500/20 bg-blue-500/5 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                <p className="text-[11px] leading-relaxed opacity-70">
                  Ghost Shield uses quantum-encrypted nodes to verify every entry request. When an unauthorized attempt is detected, the system automatically logs the source IP and triggers a high-priority notification.
                </p>
              </div>
            </div>
          </div>
        );

      case 'Windows Update':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Windows Update</h2>
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold">You're up to date</span>
                    <span className="text-xs opacity-60">Last checked: Today, 12:45 PM</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
                  Check for updates
                </button>
              </div>
              
              <div className="grid gap-2">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <History className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">Update history</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">Advanced options</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'About':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-blue-500/20">
                <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/Windows_logo_-_2021.svg" className="w-10 h-10 invert brightness-0" alt="Windows" />
              </div>
              <h3 className="text-lg font-bold">Windows 11 Mobile</h3>
              <p className="text-xs opacity-60 mb-6">Version 24H2 (Build 22631.3296)</p>
              
              <div className="w-full grid gap-2 text-left">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded flex justify-between">
                  <span className="text-xs font-medium">OS Version</span>
                  <span className="text-xs opacity-60">Windows 11 Mobile 24H2</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded flex justify-between">
                  <span className="text-xs font-medium">Model</span>
                  <span className="text-xs opacity-60">Ghost Phone 1 Pro</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded flex justify-between">
                  <span className="text-xs font-medium">Serial number</span>
                  <span className="text-xs opacity-60">GHOST-2026-MV-001</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded flex justify-between">
                  <span className="text-xs font-medium">Hardware version</span>
                  <span className="text-xs opacity-60">Rev 2.1</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded flex justify-between">
                  <span className="text-xs font-medium">Build number</span>
                  <span className="text-xs opacity-60">GHOST_OS_ALPHA_001</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded flex justify-between">
                  <span className="text-xs font-medium">Baseband version</span>
                  <span className="text-xs opacity-60">GHOST_MODEM_5.3.0_V1</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded flex justify-between">
                  <span className="text-xs font-medium">Kernel version</span>
                  <span className="text-xs opacity-60">6.8.0-ghost-x86_64-v1</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded flex justify-between">
                  <span className="text-xs font-medium">Android security patch</span>
                  <span className="text-xs opacity-60">April 1, 2026</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded flex justify-between">
                  <span className="text-xs font-medium">Google Play system update</span>
                  <span className="text-xs opacity-60">March 1, 2026</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded flex justify-between">
                  <span className="text-xs font-medium">Processor</span>
                  <span className="text-xs opacity-60">Ghost Core™ i9-14900K</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded flex justify-between">
                  <span className="text-xs font-medium">RAM</span>
                  <span className="text-xs opacity-60">64 GB LPDDR5x</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded flex justify-between">
                  <span className="text-xs font-medium">System type</span>
                  <span className="text-xs opacity-60">64-bit operating system</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  // Secret way to enable dev options
                  setIsDevOptionsEnabled(true);
                  setActiveCategory('Developer options');
                  alert('Developer options enabled!');
                }}
                className="mt-8 text-[10px] opacity-20 hover:opacity-100 transition-opacity"
              >
                Build: GHOST_OS_ALPHA_001
              </button>
            </div>
          </div>
        );

      case 'Developer options':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Developer options</h2>
            <div className="grid gap-2">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Terminal className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">USB Debugging</span>
                    <span className="text-xs opacity-60">Enable debug mode over USB</span>
                  </div>
                </div>
                <Toggle active={isUsbDebuggingEnabled} onToggle={setIsUsbDebuggingEnabled} />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Code className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Show layout bounds</span>
                    <span className="text-xs opacity-60">Display clip bounds, margins, etc.</span>
                  </div>
                </div>
                <Toggle active={false} onToggle={() => {}} />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <SettingsIcon className="w-12 h-12 mb-4" />
            <p className="text-sm font-medium">Select a category to view settings</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <div className="w-64 p-4 flex flex-col gap-1 border-r border-slate-200 dark:border-slate-800 hidden md:flex">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
            {userProfile?.avatar ? (
              <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white">
                <User className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{userProfile?.name || 'User Account'}</span>
            <span className="text-[10px] opacity-60">{userProfile?.email || 'Local Account'}</span>
          </div>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50" />
          <input 
            type="text" 
            placeholder="Find a setting" 
            className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded py-1 pl-8 text-xs outline-none focus:border-blue-500"
          />
        </div>

        {menuItems.map((item, i) => (
          <div 
            key={i} 
            onClick={() => {
              setActiveCategory(item.label);
              setActiveSubPage(null);
            }}
            className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors ${activeCategory === item.label ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-white dark:hover:bg-white/5'}`}
          >
            <item.icon className={`w-4 h-4 ${activeCategory === item.label ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
            <span className="text-xs">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};
