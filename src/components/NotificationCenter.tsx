import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Settings, Wifi, Bluetooth, Battery, Moon, Volume2, Volume1, VolumeX, Sun, Plane, Video, Accessibility, Cast } from 'lucide-react';
import { Notification } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onClearNotifications: () => void;
  onRemoveNotification: (id: string) => void;
  volume: number;
  onVolumeChange: (val: number) => void;
  brightness: number;
  onBrightnessChange: (val: number) => void;
  isWifiOn: boolean;
  onWifiToggle: (val: boolean) => void;
  isBluetoothOn: boolean;
  onBluetoothToggle: (val: boolean) => void;
  isFlightModeOn: boolean;
  onFlightModeToggle: (val: boolean) => void;
  onAppClick?: (id: string) => void;
}

const QuickSetting = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <div className="flex flex-col items-center gap-1">
    <button 
      onClick={onClick}
      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
        active ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
      }`}
    >
      <Icon size={20} />
    </button>
    <span className="text-[10px] text-white/70">{label}</span>
  </div>
);

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearNotifications,
  onRemoveNotification,
  volume,
  onVolumeChange,
  brightness,
  onBrightnessChange,
  isWifiOn,
  onWifiToggle,
  isBluetoothOn,
  onBluetoothToggle,
  isFlightModeOn,
  onFlightModeToggle,
  onAppClick
}) => {
  const [isMuted, setIsMuted] = React.useState(false);
  const prevVolume = React.useRef(volume);

  const toggleMute = () => {
    if (isMuted) {
      onVolumeChange(prevVolume.current || 75);
      setIsMuted(false);
    } else {
      prevVolume.current = volume;
      onVolumeChange(0);
      setIsMuted(false); // We don't need a separate isMuted state if we just set volume to 0, but it helps for UI
    }
  };

  // Sync isMuted with volume
  React.useEffect(() => {
    if (volume === 0) setIsMuted(true);
    else setIsMuted(false);
  }, [volume]);

  const getVolumeIcon = () => {
    if (volume === 0 || isMuted) return VolumeX;
    if (volume < 30) return Volume1;
    return Volume2;
  };

  const VolIcon = getVolumeIcon();
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
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-2 bottom-14 w-[360px] max-h-[calc(100vh-80px)] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl z-[9999] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Quick Settings Section */}
            <div className="p-6 border-b border-white/10">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <QuickSetting 
                  icon={Wifi} 
                  label="Wi-Fi" 
                  active={isWifiOn && !isFlightModeOn} 
                  onClick={() => onWifiToggle(!isWifiOn)}
                />
                <QuickSetting 
                  icon={Bluetooth} 
                  label="Bluetooth" 
                  active={isBluetoothOn && !isFlightModeOn} 
                  onClick={() => onBluetoothToggle(!isBluetoothOn)}
                />
                <QuickSetting 
                  icon={isFlightModeOn ? Plane : Moon} 
                  label={isFlightModeOn ? "Airplane" : "Focus"} 
                  active={isFlightModeOn}
                  onClick={() => onFlightModeToggle(!isFlightModeOn)}
                />
                <QuickSetting icon={Sun} label="Night light" />
                <QuickSetting icon={Accessibility} label="Accessibility" />
                <QuickSetting 
                  icon={Video} 
                  label="Record" 
                  onClick={() => {
                    onAppClick?.('recorder');
                    onClose();
                  }}
                />
                <QuickSetting icon={Cast} label="Cast" />
                <QuickSetting icon={Plane} label="Nearby" />
              </div>
              
              <div className="flex items-center gap-4 group mb-4">
                <Sun size={16} className="text-white/70" />
                <div className="flex-1 relative h-6 flex items-center">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={brightness}
                    onChange={(e) => onBrightnessChange(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500 hover:bg-white/20 transition-colors"
                  />
                  <div 
                    className="absolute left-0 h-1 bg-blue-500 rounded-full pointer-events-none" 
                    style={{ width: `${brightness}%` }}
                  />
                </div>
                <span className="text-[10px] text-white/50 w-6">{brightness}</span>
              </div>

              <div className="flex items-center gap-4 group">
                <button 
                  onClick={toggleMute}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <VolIcon size={16} className="text-white/70" />
                </button>
                <div className="flex-1 relative h-6 flex items-center">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={volume}
                    onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500 hover:bg-white/20 transition-colors"
                  />
                  <div 
                    className="absolute left-0 h-1 bg-blue-500 rounded-full pointer-events-none" 
                    style={{ width: `${volume}%` }}
                  />
                </div>
                <span className="text-[10px] text-white/50 w-6">{volume}</span>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                {notifications.length > 0 && (
                  <button 
                    onClick={onClearNotifications}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/30">
                  <Bell size={48} strokeWidth={1} className="mb-2" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 group relative"
                    >
                      <button 
                        onClick={() => onRemoveNotification(notif.id)}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all text-white/50"
                      >
                        <X size={14} />
                      </button>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                          <Bell size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs font-bold text-white truncate pr-4">{notif.title}</h4>
                            <span className="text-[10px] text-white/40">{notif.time}</span>
                          </div>
                          <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Settings size={14} />
                <span>Settings</span>
              </div>
              <div className="text-[10px] text-white/30">
                Windows 11 Mobile Experience
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter;
