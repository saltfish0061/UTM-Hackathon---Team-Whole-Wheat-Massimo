import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ─── Theme Types ───────────────────────────────────────────────────────────────

export type ThemeId =
  | 'clean-light'
  | 'dark-mode'
  | 'high-contrast'
  | 'soft-dark'
  | 'botanical-garden'
  | 'harvest-gold'
  | 'hydroponic-blue';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  type: 'basic' | 'special';
  emoji?: string;
  preview: { bg: string; card: string; primary: string; text: string };
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'clean-light',
    name: 'Clean Light',
    description: 'Default minimalist light',
    type: 'basic',
    preview: { bg: '#F9FAFB', card: '#FFFFFF', primary: '#22C55E', text: '#111827' },
  },
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    description: 'Easy on the eyes at night',
    type: 'basic',
    preview: { bg: '#111827', card: '#1F2937', primary: '#4ADE80', text: '#F9FAFB' },
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Maximum clarity & visibility',
    type: 'basic',
    preview: { bg: '#000000', card: '#0D0D0D', primary: '#00FF88', text: '#FFFFFF' },
  },
  {
    id: 'soft-dark',
    name: 'Soft Dark',
    description: 'Gentle muted dark tones',
    type: 'basic',
    preview: { bg: '#1E1E2E', card: '#313244', primary: '#A6E3A1', text: '#CDD6F4' },
  },
  {
    id: 'botanical-garden',
    name: 'Botanical Garden',
    description: 'Lush forest greens',
    type: 'special',
    emoji: '🌿',
    preview: { bg: '#F0F7EE', card: '#FFFFFF', primary: '#2D6A4F', text: '#1B3A2D' },
  },
  {
    id: 'harvest-gold',
    name: 'Harvest Gold',
    description: 'Warm autumn harvest tones',
    type: 'special',
    emoji: '🌾',
    preview: { bg: '#FFFBF0', card: '#FFFFFF', primary: '#D97706', text: '#3D2B00' },
  },
  {
    id: 'hydroponic-blue',
    name: 'Hydroponic Blue',
    description: 'Clean water & tech inspired',
    type: 'special',
    emoji: '💧',
    preview: { bg: '#EFF6FF', card: '#FFFFFF', primary: '#0284C7', text: '#0F2544' },
  },
];

// ─── Shared Types ──────────────────────────────────────────────────────────────

export type Health = 'good' | 'warning' | 'critical';

export interface Slot {
  id: string;
  farmName: string;
  crop: string;
  health: Health;
  daysPlanted: number;
  harvest: string;
}

export type ToolKey = 'sprinkler' | 'fertilizer' | 'led' | 'fan';

export interface ScheduleEntry {
  id: string;
  toolKey: ToolKey;
  days: string;
  startTime: string;
  duration: string;
  active: boolean;
}

export interface Zone {
  id: string;
  name: string;
  crop: string;
}

// ─── Base Zones (always present) ───────────────────────────────────────────────

export const BASE_ZONES: Zone[] = [
  { id: 'a', name: 'Zone A - Tomatoes', crop: 'Tomatoes' },
  { id: 'b', name: 'Zone B - Lettuce', crop: 'Lettuce' },
  { id: 'c', name: 'Zone C - Basil', crop: 'Basil' },
  { id: 'd', name: 'Zone D - Spinach', crop: 'Spinach' },
];

// ─── Initial Farm Map Beds ──────────────────────────────────────────────────────

const INITIAL_SLOT_IDS = new Set([
  'A1', 'A2', 'A3', 'A4',
  'B1', 'B2', 'B3', 'B4',
  'C1', 'C2', 'C3', 'C4',
]);

const INITIAL_SLOTS: Slot[] = [
  { id: 'A1', farmName: 'Bed A1', crop: 'Lettuce',  health: 'good',     daysPlanted: 28, harvest: '2 days' },
  { id: 'A2', farmName: 'Bed A2', crop: 'Spinach',  health: 'good',     daysPlanted: 21, harvest: '9 days' },
  { id: 'A3', farmName: 'Bed A3', crop: 'Kale',     health: 'good',     daysPlanted: 30, harvest: '1 day' },
  { id: 'A4', farmName: 'Bed A4', crop: 'Arugula',  health: 'warning',  daysPlanted: 18, harvest: '12 days' },
  { id: 'B1', farmName: 'Bed B1', crop: 'Basil',    health: 'warning',  daysPlanted: 25, harvest: '5 days' },
  { id: 'B2', farmName: 'Bed B2', crop: 'Cilantro', health: 'warning',  daysPlanted: 15, harvest: '15 days' },
  { id: 'B3', farmName: 'Bed B3', crop: 'Parsley',  health: 'good',     daysPlanted: 22, harvest: '8 days' },
  { id: 'B4', farmName: 'Bed B4', crop: 'Mint',     health: 'good',     daysPlanted: 20, harvest: '10 days' },
  { id: 'C1', farmName: 'Bed C1', crop: 'Chard',    health: 'good',     daysPlanted: 24, harvest: '6 days' },
  { id: 'C2', farmName: 'Bed C2', crop: 'Lettuce',  health: 'good',     daysPlanted: 19, harvest: '11 days' },
  { id: 'C3', farmName: 'Bed C3', crop: 'Spinach',  health: 'critical', daysPlanted: 16, harvest: '14 days' },
  { id: 'C4', farmName: 'Bed C4', crop: 'Kale',     health: 'good',     daysPlanted: 27, harvest: '3 days' },
];

// ─── LocalStorage Helpers ──────────────────────────────────────────────────────

function readLS<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ─── Context ───────────────────────────────────────────────────────────────────

// ─── User / Auth ───────────────────────────────────────────────────────────────

export interface User {
  name: string;
  email: string;
  isGuest: boolean;
  joinedAt: string;
}

// ─── Bluetooth (mock) ─────────────────────────────────────────────────────────

export interface BluetoothDevice {
  id: string;
  name: string;
  signal: number; // 0-100
  type: 'sensor' | 'controller';
}

// ─── App Settings ─────────────────────────────────────────────────────────────

export interface AppSettings {
  notifications: boolean;
  soundAlerts: boolean;
  autoExport: boolean;
  units: 'metric' | 'imperial';
  language: 'en' | 'ms' | 'zh';
}

const DEFAULT_SETTINGS: AppSettings = {
  notifications: true,
  soundAlerts: false,
  autoExport: false,
  units: 'metric',
  language: 'en',
};

interface AppContextType {
  // Auth
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  // Theme
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  isThemeSwitcherOpen: boolean;
  setThemeSwitcherOpen: (open: boolean) => void;
  // Settings drawer
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  appSettings: AppSettings;
  setAppSettings: (s: AppSettings) => void;
  // Bluetooth
  pairedDevice: BluetoothDevice | null;
  setPairedDevice: (d: BluetoothDevice | null) => void;
  // Farm Map beds
  slots: Slot[];
  setSlots: (slots: Slot[]) => void;
  // Derived: base zones + custom beds as extra zones
  zones: Zone[];
  // Automation schedules (keyed by zone id)
  schedules: Record<string, ScheduleEntry[]>;
  setSchedules: (s: Record<string, ScheduleEntry[]>) => void;
  // Running tools count → bottom nav badge
  activeToolsCount: number;
  setActiveToolsCount: (n: number) => void;
}

const AppContext = createContext<AppContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  theme: 'clean-light',
  setTheme: () => {},
  isThemeSwitcherOpen: false,
  setThemeSwitcherOpen: () => {},
  isSettingsOpen: false,
  setSettingsOpen: () => {},
  appSettings: DEFAULT_SETTINGS,
  setAppSettings: () => {},
  pairedDevice: null,
  setPairedDevice: () => {},
  slots: INITIAL_SLOTS,
  setSlots: () => {},
  zones: BASE_ZONES,
  schedules: {},
  setSchedules: () => {},
  activeToolsCount: 0,
  setActiveToolsCount: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Theme — apply immediately during init to prevent flash
  const [theme, setThemeRaw] = useState<ThemeId>(() => {
    const saved = readLS<ThemeId>('gs_theme', 'clean-light');
    // Immediately sync to DOM to avoid FOUC
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = saved;
    }
    return saved;
  });

  const [isThemeSwitcherOpen, setThemeSwitcherOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  const [user, setUserRaw] = useState<User | null>(() =>
    readLS<User | null>('gs_user', null)
  );
  const [appSettings, setAppSettingsRaw] = useState<AppSettings>(() =>
    readLS<AppSettings>('gs_settings', DEFAULT_SETTINGS)
  );
  const [pairedDevice, setPairedDeviceRaw] = useState<BluetoothDevice | null>(() =>
    readLS<BluetoothDevice | null>('gs_paired_device', null)
  );

  const login = useCallback((u: User) => {
    setUserRaw(u);
    writeLS('gs_user', u);
  }, []);

  const logout = useCallback(() => {
    setUserRaw(null);
    writeLS('gs_user', null);
  }, []);

  const setAppSettings = useCallback((s: AppSettings) => {
    setAppSettingsRaw(s);
    writeLS('gs_settings', s);
  }, []);

  const setPairedDevice = useCallback((d: BluetoothDevice | null) => {
    setPairedDeviceRaw(d);
    writeLS('gs_paired_device', d);
  }, []);

  const [slots, setSlotsRaw] = useState<Slot[]>(() =>
    readLS<Slot[]>('gs_slots', INITIAL_SLOTS)
  );
  const [schedules, setSchedulesRaw] = useState<Record<string, ScheduleEntry[]>>(() =>
    readLS<Record<string, ScheduleEntry[]>>('gs_schedules', {})
  );
  const [activeToolsCount, setActiveToolsCount] = useState(0);

  // Sync theme to DOM whenever it changes
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = useCallback((t: ThemeId) => {
    setThemeRaw(t);
    writeLS('gs_theme', t);
  }, []);

  const setSlots = useCallback((s: Slot[]) => {
    setSlotsRaw(s);
    writeLS('gs_slots', s);
  }, []);

  const setSchedules = useCallback((s: Record<string, ScheduleEntry[]>) => {
    setSchedulesRaw(s);
    writeLS('gs_schedules', s);
  }, []);

  // Derive extra zones from user-added Farm Map slots (non-initial)
  const customZones: Zone[] = slots
    .filter((s) => !INITIAL_SLOT_IDS.has(s.id))
    .map((s) => ({
      id: s.id.toLowerCase(),
      name: `${s.farmName} — ${s.crop}`,
      crop: s.crop,
    }));

  const zones: Zone[] = [...BASE_ZONES, ...customZones];

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        theme,
        setTheme,
        isThemeSwitcherOpen,
        setThemeSwitcherOpen,
        isSettingsOpen,
        setSettingsOpen,
        appSettings,
        setAppSettings,
        pairedDevice,
        setPairedDevice,
        slots,
        setSlots,
        zones,
        schedules,
        setSchedules,
        activeToolsCount,
        setActiveToolsCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
