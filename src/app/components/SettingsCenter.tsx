import { useState, useEffect, useRef } from 'react';
import {
  Settings as SettingsIcon,
  LogOut,
  Palette,
  Bluetooth,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Mail,
  Shield,
  Bell,
  Volume2,
  Download,
  Globe,
  Ruler,
  Search,
  Check,
  Wifi,
  Trash2,
} from 'lucide-react';
import { useAppContext, type BluetoothDevice, THEMES } from '../context/AppContext';

type Section = 'root' | 'theme' | 'bluetooth' | 'general';

const MOCK_DEVICES: BluetoothDevice[] = [
  { id: 'gs-soil-01', name: 'GreenStack Soil Sensor 01', signal: 92, type: 'sensor' },
  { id: 'gs-soil-02', name: 'GreenStack Soil Sensor 02', signal: 78, type: 'sensor' },
  { id: 'gs-ctrl-01', name: 'GreenStack Pump Controller', signal: 65, type: 'controller' },
  { id: 'gs-env-01',  name: 'GreenStack Climate Hub',     signal: 54, type: 'sensor' },
];

export function SettingsCenter() {
  const { setSettingsOpen, pairedDevice } = useAppContext();
  const [section, setSection] = useState<Section>('root');

  const subtitle =
    section === 'bluetooth' && pairedDevice
      ? `Paired: ${pairedDevice.name}`
      : getSubtitle(section);

  function back() {
    if (section !== 'root') {
      setSection('root');
    } else {
      setSettingsOpen(false);
    }
  }

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={back}
            className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Back"
          >
            <ChevronLeft size={18} className="text-gray-700" />
          </button>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <SettingsIcon size={16} color="white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-gray-900 text-base truncate">{getTitle(section)}</h2>
              <p className="text-gray-500 text-xs truncate">{subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-5 pb-10">
        {section === 'root' && <RootSection onSelect={setSection} />}
        {section === 'theme' && <ThemeSection />}
        {section === 'bluetooth' && <BluetoothSection />}
        {section === 'general' && <GeneralSection />}
      </div>
    </div>
  );
}

function getTitle(s: Section) {
  return s === 'root' ? 'Settings'
    : s === 'theme' ? 'App Theme'
    : s === 'bluetooth' ? 'Bluetooth'
    : 'General';
}
function getSubtitle(s: Section) {
  return s === 'root' ? 'Personalise your GreenStack'
    : s === 'theme' ? 'Choose how the app looks'
    : s === 'bluetooth' ? 'Pair sensor devices'
    : 'App-wide preferences';
}

// ─── Root Menu ───────────────────────────────────────────────────────────────

function RootSection({ onSelect }: { onSelect: (s: Section) => void }) {
  const { user, logout, theme, pairedDevice } = useAppContext();
  const currentTheme = THEMES.find((t) => t.id === theme);

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-5">
      {/* User profile card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <span className="text-lg">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-gray-900 truncate">{user?.name ?? 'Guest'}</p>
              {user?.isGuest && (
                <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                  Guest
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs truncate flex items-center gap-1 mt-0.5">
              <Mail size={11} /> {user?.email ?? '—'}
            </p>
            {user?.joinedAt && (
              <p className="text-gray-400 text-xs mt-0.5">
                Joined {new Date(user.joinedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <InfoStat label="Account" value={user?.isGuest ? 'Guest' : 'Standard'} icon={<Shield size={12} />} />
          <InfoStat label="Devices" value={pairedDevice ? '1 paired' : 'None'} icon={<Bluetooth size={12} />} />
        </div>

        <button
          onClick={logout}
          className="w-full mt-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center gap-2 transition-colors text-sm"
        >
          <LogOut size={15} />
          {user?.isGuest ? 'Exit guest session' : 'Log out'}
        </button>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <MenuRow
          icon={<Palette size={16} className="text-purple-600" />}
          iconBg="bg-purple-50"
          title="Theme"
          subtitle={currentTheme?.name ?? 'Clean Light'}
          onClick={() => onSelect('theme')}
        />
        <MenuRow
          icon={<Bluetooth size={16} className="text-blue-600" />}
          iconBg="bg-blue-50"
          title="Bluetooth"
          subtitle={pairedDevice ? `Paired: ${pairedDevice.name}` : 'No device paired'}
          onClick={() => onSelect('bluetooth')}
        />
        <MenuRow
          icon={<SlidersHorizontal size={16} className="text-gray-600" />}
          iconBg="bg-gray-100"
          title="General Settings"
          subtitle="Notifications, units, language"
          onClick={() => onSelect('general')}
          last
        />
      </div>

      <p className="text-center text-gray-400 text-xs">GreenStack · v1.0.0</p>
    </div>
  );
}

function InfoStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2">
      <div className="flex items-center gap-1 text-gray-500 text-xs">{icon} {label}</div>
      <p className="text-gray-900 text-sm mt-0.5">{value}</p>
    </div>
  );
}

function MenuRow({
  icon, iconBg, title, subtitle, onClick, last,
}: {
  icon: React.ReactNode; iconBg: string; title: string; subtitle: string;
  onClick: () => void; last?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left ${
        last ? '' : 'border-b border-gray-100'
      }`}
    >
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 text-sm">{title}</p>
        <p className="text-gray-500 text-xs truncate">{subtitle}</p>
      </div>
      <ChevronRight size={16} className="text-gray-400 shrink-0" />
    </button>
  );
}

// ─── Theme Section (inline) ──────────────────────────────────────────────────

function ThemeSection() {
  const { theme, setTheme } = useAppContext();
  const basic = THEMES.filter((t) => t.type === 'basic');
  const special = THEMES.filter((t) => t.type === 'special');

  return (
    <div className="space-y-5">
      <ThemeGroup label="Basic" themes={basic} active={theme} onPick={setTheme} />
      <ThemeGroup label="Special" themes={special} active={theme} onPick={setTheme} />
    </div>
  );
}

function ThemeGroup({
  label, themes, active, onPick,
}: {
  label: string;
  themes: typeof THEMES;
  active: string;
  onPick: (id: any) => void;
}) {
  return (
    <div>
      <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 px-1">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        {themes.map((t) => {
          const selected = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
              className={`relative rounded-xl border p-3 text-left overflow-hidden transition-all ${
                selected ? 'border-gray-900 ring-2 ring-gray-900/10' : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ backgroundColor: t.preview.card }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: t.preview.bg }} />
                <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: t.preview.primary }} />
                <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: t.preview.text }} />
                {selected && (
                  <Check size={14} className="ml-auto" style={{ color: t.preview.primary }} />
                )}
              </div>
              <p className="text-sm" style={{ color: t.preview.text }}>
                {t.emoji ? `${t.emoji} ` : ''}{t.name}
              </p>
              <p className="text-xs mt-0.5 opacity-70" style={{ color: t.preview.text }}>
                {t.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Bluetooth Section ───────────────────────────────────────────────────────

function BluetoothSection() {
  const { pairedDevice, setPairedDevice } = useAppContext();
  const [scanning, setScanning] = useState(false);

  // Seed the list with the paired device + mock devices, deduped, so the
  // section never appears empty when entered.
  const initial: BluetoothDevice[] = (() => {
    const list = [...MOCK_DEVICES];
    if (pairedDevice && !list.find((d) => d.id === pairedDevice.id)) {
      list.unshift(pairedDevice);
    }
    return list;
  })();
  const [found, setFound] = useState<BluetoothDevice[]>(initial);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function scan() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setScanning(true);
    setFound(pairedDevice ? [pairedDevice] : []);
    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i >= MOCK_DEVICES.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setScanning(false);
        return;
      }
      const next = MOCK_DEVICES[i];
      setFound((prev) => (prev.find((d) => d.id === next.id) ? prev : [...prev, next]));
      i++;
    }, 350);
  }

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Bluetooth size={18} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-gray-900 text-sm">
              {pairedDevice ? 'Connected' : 'Not connected'}
            </p>
            <p className="text-gray-500 text-xs">
              {pairedDevice ? pairedDevice.name : 'Pair a sensor device to start syncing'}
            </p>
          </div>
          {pairedDevice && (
            <button
              onClick={() => setPairedDevice(null)}
              className="p-2 rounded-lg hover:bg-red-50 text-red-600"
              aria-label="Unpair"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      <button
        onClick={scan}
        disabled={scanning}
        className="w-full py-3 rounded-xl text-white flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ backgroundColor: 'var(--primary)' }}
      >
        <Search size={16} />
        {scanning ? 'Scanning…' : 'Scan for devices'}
      </button>

      {/* Discovered list */}
      {(found.length > 0 || scanning) && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <p className="text-gray-500 text-xs uppercase tracking-wider px-4 pt-3 pb-2">
            Available devices
          </p>
          {found.map((d, i) => {
            const isPaired = pairedDevice?.id === d.id;
            return (
              <div
                key={d.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i === found.length - 1 ? '' : 'border-b border-gray-100'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Wifi size={15} className="text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 text-sm truncate">{d.name}</p>
                  <p className="text-gray-500 text-xs">
                    Signal {d.signal}% · {d.type}
                  </p>
                </div>
                <button
                  onClick={() => setPairedDevice(isPaired ? null : d)}
                  className={`px-3 py-1.5 rounded-lg text-xs ${
                    isPaired
                      ? 'bg-gray-100 text-gray-700'
                      : 'text-white'
                  }`}
                  style={!isPaired ? { backgroundColor: 'var(--primary)' } : undefined}
                >
                  {isPaired ? 'Paired' : 'Pair'}
                </button>
              </div>
            );
          })}
          {scanning && (
            <div className="px-4 py-3 text-gray-400 text-xs text-center">
              Searching for nearby devices…
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── General Section ─────────────────────────────────────────────────────────

function GeneralSection() {
  const { appSettings, setAppSettings } = useAppContext();

  function update<K extends keyof typeof appSettings>(key: K, value: (typeof appSettings)[K]) {
    setAppSettings({ ...appSettings, [key]: value });
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <ToggleRow
          icon={<Bell size={15} className="text-amber-600" />}
          iconBg="bg-amber-50"
          title="Push notifications"
          subtitle="Alerts for sensor anomalies"
          checked={appSettings.notifications}
          onChange={(v) => update('notifications', v)}
        />
        <ToggleRow
          icon={<Volume2 size={15} className="text-rose-600" />}
          iconBg="bg-rose-50"
          title="Sound alerts"
          subtitle="Play a chime for critical events"
          checked={appSettings.soundAlerts}
          onChange={(v) => update('soundAlerts', v)}
        />
        <ToggleRow
          icon={<Download size={15} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
          title="Auto-export reports"
          subtitle="Generate weekly PDF summaries"
          checked={appSettings.autoExport}
          onChange={(v) => update('autoExport', v)}
          last
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <SelectRow
          icon={<Ruler size={15} className="text-indigo-600" />}
          iconBg="bg-indigo-50"
          title="Units"
          value={appSettings.units}
          options={[
            { v: 'metric', label: 'Metric (°C, kg)' },
            { v: 'imperial', label: 'Imperial (°F, lb)' },
          ]}
          onChange={(v) => update('units', v as any)}
        />
        <SelectRow
          icon={<Globe size={15} className="text-sky-600" />}
          iconBg="bg-sky-50"
          title="Language"
          value={appSettings.language}
          options={[
            { v: 'en', label: 'English' },
            { v: 'ms', label: 'Bahasa Melayu' },
            { v: 'zh', label: '中文' },
          ]}
          onChange={(v) => update('language', v as any)}
          last
        />
      </div>
    </div>
  );
}

function ToggleRow({
  icon, iconBg, title, subtitle, checked, onChange, last,
}: {
  icon: React.ReactNode; iconBg: string; title: string; subtitle: string;
  checked: boolean; onChange: (v: boolean) => void; last?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${last ? '' : 'border-b border-gray-100'}`}>
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 text-sm">{title}</p>
        <p className="text-gray-500 text-xs">{subtitle}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          checked ? '' : 'bg-gray-200'
        }`}
        style={checked ? { backgroundColor: 'var(--primary)' } : undefined}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </button>
    </div>
  );
}

function SelectRow({
  icon, iconBg, title, value, options, onChange, last,
}: {
  icon: React.ReactNode; iconBg: string; title: string;
  value: string; options: { v: string; label: string }[];
  onChange: (v: string) => void; last?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${last ? '' : 'border-b border-gray-100'}`}>
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 text-sm">{title}</p>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-gray-100 rounded-lg px-2 py-1.5 text-sm text-gray-900 outline-none border border-transparent focus:border-gray-300"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Trigger Button (used in screen headers) ────────────────────────────────

export function SettingsButton({ className = '' }: { className?: string }) {
  const { setSettingsOpen } = useAppContext();
  return (
    <button
      onClick={() => setSettingsOpen(true)}
      className={`w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors ${className}`}
      aria-label="Open settings"
      title="Settings"
    >
      <SettingsIcon size={17} className="text-gray-600" />
    </button>
  );
}
