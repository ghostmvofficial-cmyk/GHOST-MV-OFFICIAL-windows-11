export interface Desktop {
  id: string;
  name: string;
  wallpaper?: string;
}

export type SnapType = 'none' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left-two-thirds' | 'right-two-thirds' | 'left-one-third' | 'center-one-third' | 'right-one-third';

export interface WindowState {
  id: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  desktopId: string;
  snapType?: SnapType;
}

export interface AppConfig {
  id: string;
  name: string;
  icon: string;
  component: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  appId?: string;
  read: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
}
