import {
  Droplets,
  FlaskConical,
  Lightbulb,
  Wind,
  Sparkles,
  Check,
  X,
  Power,
  Square,
  CalendarClock,
  Play,
  Pencil,
  Trash2,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { SoilAreaSelector } from './SoilAreaSelector';
import { NotificationCenter } from './NotificationCenter';
import { useAppContext } from '../context/AppContext';
import type { ScheduleEntry, ToolKey } from '../context/AppContext';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { SettingsButton } from './SettingsCenter';

type Status = 'idle' | 'pending' | 'accepted' | 'rejected';

interface ToolState {
  duration: string;
  suggestion: { value: string; status: Status };
  running: { remainingSec: number; totalSec: number } | null;
}

interface LEDSpectrum {
  red: number;
  blue: number;
  white: number;
}

const TOOLS: { key: ToolKey; title: string; subtitle: string; unit: string; icon: React.ElementType }[] = [
  { key: 'sprinkler', title: 'Water Sprinklers / Pumps', subtitle: 'Controls soil moisture', unit: 'minutes', icon: Droplets },
  { key: 'fertilizer', title: 'Fertilizer Dispenser', subtitle: 'Controls nutrient level', unit: 'mL', icon: FlaskConical },
  { key: 'led', title: 'LED Grow Lights', subtitle: 'Affects soil temperature', unit: 'minutes', icon: Lightbulb },
  { key: 'fan', title: 'Cooling Fans', subtitle: 'Affects soil temperature', unit: 'minutes', icon: Wind },
];

const TOOL_LABELS: Record<ToolKey, string> = {
  sprinkler: 'Sprinkler',
  fertilizer: 'Fertilizer',
  led: 'LED',
  fan: 'Fan',
};

const AI_DEFAULTS_RUN: Record<ToolKey, string> = {
  sprinkler: '12',
  fertilizer: '5',
  led: '45',
  fan: '30',
};

const AI_SCHEDULE_BY_ZONE: Record<string, Record<ToolKey, { days: string; start: string; duration: string }>> = {
  a: {
    sprinkler: { days: '7', start: '06:30', duration: '15' },
    fertilizer: { days: '3', start: '18:00', duration: '5' },
    led: { days: '14', start: '07:00', duration: '60' },
    fan: { days: '7', start: '13:00', duration: '30' },
  },
  b: {
    sprinkler: { days: '5', start: '07:00', duration: '10' },
    fertilizer: { days: '4', start: '17:30', duration: '4' },
    led: { days: '10', start: '06:30', duration: '50' },
    fan: { days: '5', start: '14:00', duration: '20' },
  },
  c: {
    sprinkler: { days: '4', start: '06:00', duration: '8' },
    fertilizer: { days: '5', start: '19:00', duration: '6' },
    led: { days: '12', start: '07:30', duration: '55' },
    fan: { days: '6', start: '12:30', duration: '25' },
  },
  d: {
    sprinkler: { days: '6', start: '06:45', duration: '14' },
    fertilizer: { days: '3', start: '18:30', duration: '5' },
    led: { days: '10', start: '07:15', duration: '40' },
    fan: { days: '4', start: '13:30', duration: '20' },
  },
};

const AI_SPECTRUM_BY_ZONE: Record<string, LEDSpectrum> = {
  a: { red: 70, blue: 20, white: 10 },  // Tomatoes – more red for fruiting
  b: { red: 60, blue: 30, white: 10 },  // Lettuce – more blue for leafy growth
  c: { red: 65, blue: 25, white: 10 },  // Basil – balanced
  d: { red: 55, blue: 35, white: 10 },  // Spinach – blue for leafy
};

const initialToolState = (): ToolState => ({
  duration: '',
  suggestion: { value: '', status: 'idle' },
  running: null,
});

export function RemoteTools() {
  const { schedules, setSchedules, setActiveToolsCount, zones } = useAppContext();
  const [areaId, setAreaId] = useState('a');
  const [tools, setTools] = useState<Record<ToolKey, ToolState>>({
    sprinkler: initialToolState(),
    fertilizer: initialToolState(),
    led: initialToolState(),
    fan: initialToolState(),
  });
  const [ledSpectrum, setLedSpectrum] = useState<LEDSpectrum>({ red: 70, blue: 20, white: 10 });
  const [aiSpectrumSuggestion, setAiSpectrumSuggestion] = useState<LEDSpectrum | null>(null);

  // Confirm dialogs
  const [stopConfirm, setStopConfirm] = useState<ToolKey | null>(null);
  const [aiScheduleConfirm, setAiScheduleConfirm] = useState(false);

  const zoneSchedules = schedules[areaId] ?? [];

  // Countdown timer for running tools
  useEffect(() => {
    const id = setInterval(() => {
      setTools((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const k of Object.keys(next) as ToolKey[]) {
          const r = next[k].running;
          if (r) {
            const remaining = r.remainingSec - 1;
            if (remaining <= 0) {
              next[k] = { ...next[k], running: null };
            } else {
              next[k] = { ...next[k], running: { ...r, remainingSec: remaining } };
            }
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Keep badge count in sync with running tools
  useEffect(() => {
    const count = (Object.values(tools) as ToolState[]).filter((t) => t.running !== null).length;
    setActiveToolsCount(count);
  }, [tools, setActiveToolsCount]);

  const generate = (key: ToolKey) => {
    setTools((p) => ({
      ...p,
      [key]: { ...p[key], suggestion: { value: AI_DEFAULTS_RUN[key], status: 'pending' } },
    }));
  };

  const accept = (key: ToolKey) =>
    setTools((p) => ({
      ...p,
      [key]: {
        ...p[key],
        duration: p[key].suggestion.value,
        suggestion: { ...p[key].suggestion, status: 'accepted' },
      },
    }));

  const reject = (key: ToolKey) =>
    setTools((p) => ({
      ...p,
      [key]: { ...p[key], suggestion: { value: '', status: 'rejected' } },
    }));

  const setDuration = (key: ToolKey, value: string) =>
    setTools((p) => ({ ...p, [key]: { ...p[key], duration: value } }));

  const instruct = (key: ToolKey) => {
    const minutes = parseFloat(tools[key].duration);
    if (!minutes || minutes <= 0) return;
    const totalSec = Math.round(minutes * 60);
    setTools((p) => ({
      ...p,
      [key]: { ...p[key], running: { remainingSec: totalSec, totalSec } },
    }));
  };

  const stop = (key: ToolKey) =>
    setTools((p) => ({ ...p, [key]: { ...p[key], running: null } }));

  const updateSchedules = (next: ScheduleEntry[]) =>
    setSchedules({ ...schedules, [areaId]: next });

  const addSchedule = (entry: Omit<ScheduleEntry, 'id' | 'active'>) => {
    const newEntry: ScheduleEntry = {
      ...entry,
      id: `s-${Date.now()}`,
      active: false,
    };
    updateSchedules([...zoneSchedules, newEntry]);
  };

  const editSchedule = (id: string, patch: Partial<ScheduleEntry>) => {
    updateSchedules(zoneSchedules.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeSchedule = (id: string) =>
    updateSchedules(zoneSchedules.filter((s) => s.id !== id));

  const aiGenerateSchedule = () => {
    const zoneAI = AI_SCHEDULE_BY_ZONE[areaId] ?? AI_SCHEDULE_BY_ZONE['a'];
    const newEntries: ScheduleEntry[] = (Object.keys(zoneAI) as ToolKey[]).map((k) => ({
      id: `s-${Date.now()}-${k}`,
      toolKey: k,
      days: zoneAI[k].days,
      startTime: zoneAI[k].start,
      duration: zoneAI[k].duration,
      active: false,
    }));
    updateSchedules(newEntries);
  };

  const aiOptimizeSpectrum = () => {
    const suggestion = AI_SPECTRUM_BY_ZONE[areaId] ?? { red: 65, blue: 25, white: 10 };
    setAiSpectrumSuggestion(suggestion);
  };

  const acceptSpectrum = () => {
    if (aiSpectrumSuggestion) {
      setLedSpectrum(aiSpectrumSuggestion);
      setAiSpectrumSuggestion(null);
    }
  };

  const rejectSpectrum = () => {
    setAiSpectrumSuggestion(null);
  };

  const currentZoneName = zones.find((z) => z.id === areaId)?.name ?? '';

  return (
    <div className="pb-24 px-4 space-y-5">
      <header className="flex justify-between items-center pt-6 pb-2">
        <div className="flex items-center gap-2">
          <Power className="text-green-600" size={24} />
          <h2 className="text-xl text-gray-900">Remote Tools</h2>
        </div>
        <div className="flex items-center gap-2">
          <SettingsButton />
          <NotificationCenter />
        </div>
      </header>

      <p className="text-gray-500 text-sm -mt-2">Control center · AI-assisted scheduling</p>

      <SoilAreaSelector value={areaId} onChange={setAreaId} />

      {TOOLS.map((t) => (
        <ToolSection
          key={t.key}
          icon={t.icon}
          title={t.title}
          subtitle={t.subtitle}
          unit={t.unit}
          toolKey={t.key}
          state={tools[t.key]}
          onGenerate={generate}
          onAccept={accept}
          onReject={reject}
          onChange={setDuration}
          onInstruct={instruct}
          onStop={(key) => setStopConfirm(key)}
          ledSpectrum={t.key === 'led' ? ledSpectrum : undefined}
          onLedSpectrumChange={t.key === 'led' ? (s) => setLedSpectrum(s) : undefined}
          aiSpectrumSuggestion={t.key === 'led' ? aiSpectrumSuggestion : undefined}
          onAIOptimizeSpectrum={t.key === 'led' ? aiOptimizeSpectrum : undefined}
          onAcceptSpectrum={t.key === 'led' ? acceptSpectrum : undefined}
          onRejectSpectrum={t.key === 'led' ? rejectSpectrum : undefined}
          zoneName={currentZoneName}
        />
      ))}

      <SchedulePanel
        zoneName={currentZoneName}
        schedules={zoneSchedules}
        onAdd={addSchedule}
        onEdit={editSchedule}
        onRemove={removeSchedule}
        onAIGenerate={() => setAiScheduleConfirm(true)}
      />

      {/* Stop Device confirmation */}
      <ConfirmDialog
        open={stopConfirm !== null}
        title="Stop Device"
        message={
          stopConfirm
            ? `Stop the ${TOOLS.find((t) => t.key === stopConfirm)?.title ?? 'device'} immediately? The current cycle will be aborted.`
            : ''
        }
        confirmLabel="Stop Now"
        cancelLabel="Keep Running"
        variant="danger"
        onConfirm={() => {
          if (stopConfirm) stop(stopConfirm);
          setStopConfirm(null);
        }}
        onCancel={() => setStopConfirm(null)}
      />

      {/* AI Schedule overwrite confirmation */}
      <ConfirmDialog
        open={aiScheduleConfirm}
        title="Replace Schedule with AI Suggestion?"
        message="This will overwrite all existing schedules for this zone with AI-generated ones. You can edit them afterwards."
        confirmLabel="Replace Schedule"
        cancelLabel="Keep Current"
        variant="warning"
        onConfirm={() => {
          aiGenerateSchedule();
          setAiScheduleConfirm(false);
        }}
        onCancel={() => setAiScheduleConfirm(false)}
      />
    </div>
  );
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function ToolSection({
  icon: Icon,
  title,
  subtitle,
  unit,
  toolKey,
  state,
  onGenerate,
  onAccept,
  onReject,
  onChange,
  onInstruct,
  onStop,
  ledSpectrum,
  onLedSpectrumChange,
  aiSpectrumSuggestion,
  onAIOptimizeSpectrum,
  onAcceptSpectrum,
  onRejectSpectrum,
  zoneName,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  unit: string;
  toolKey: ToolKey;
  state: ToolState;
  onGenerate: (k: ToolKey) => void;
  onAccept: (k: ToolKey) => void;
  onReject: (k: ToolKey) => void;
  onChange: (k: ToolKey, v: string) => void;
  onInstruct: (k: ToolKey) => void;
  onStop: (k: ToolKey) => void;
  ledSpectrum?: LEDSpectrum;
  onLedSpectrumChange?: (s: LEDSpectrum) => void;
  aiSpectrumSuggestion?: LEDSpectrum | null;
  onAIOptimizeSpectrum?: () => void;
  onAcceptSpectrum?: () => void;
  onRejectSpectrum?: () => void;
  zoneName?: string;
}) {
  const isPending = state.suggestion.status === 'pending';
  const displayValue = isPending ? state.suggestion.value : state.duration;
  const running = state.running;
  const progress = running ? ((running.totalSec - running.remainingSec) / running.totalSec) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
          <Icon className="text-green-600" size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-gray-900">{title}</h3>
          <p className="text-gray-500 text-xs">{subtitle}</p>
        </div>
        {running && (
          <span className="flex items-center gap-1.5 bg-green-100 border border-green-300 text-green-700 rounded-full px-2.5 py-1 text-[10px]">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            RUNNING
          </span>
        )}
      </div>

      {running ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-gray-500 text-xs">Time remaining</span>
            <span className="text-green-600 text-2xl">{formatTime(running.remainingSec)}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-gray-400 text-xs">
            Total allocated: {Math.round(running.totalSec / 60)} {unit}
          </p>
          <button
            onClick={() => onStop(toolKey)}
            className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-red-500 rounded-lg py-2.5 hover:bg-red-100 transition-colors"
          >
            <Square size={16} fill="currentColor" />
            <span>Stop Device</span>
          </button>
        </div>
      ) : (
        <>
          <div>
            <label className="text-gray-500 text-xs">Duration / Amount ({unit})</label>
            <div className="mt-1 flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={displayValue}
                  onChange={(e) => onChange(toolKey, e.target.value)}
                  placeholder={`Insert time in ${unit}`}
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2.5 outline-none transition-colors ${
                    isPending
                      ? 'border-green-400 text-green-600 italic'
                      : 'border-gray-200 text-gray-900 focus:border-green-300'
                  }`}
                />
                {isPending && (
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    AI
                  </span>
                )}
              </div>
              <button
                onClick={() => onGenerate(toolKey)}
                className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 hover:bg-green-100 transition-colors"
              >
                <Sparkles size={16} />
                <span className="text-xs">AI</span>
              </button>
            </div>

            {isPending && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => onAccept(toolKey)}
                  className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white rounded-lg py-2 text-sm hover:bg-green-700 transition-colors"
                >
                  <Check size={14} /> Accept
                </button>
                <button
                  onClick={() => onReject(toolKey)}
                  className="flex-1 flex items-center justify-center gap-1 bg-white border border-red-200 text-red-500 rounded-lg py-2 text-sm hover:bg-red-50 transition-colors"
                >
                  <X size={14} /> Reject
                </button>
              </div>
            )}
          </div>

          {/* LED Spectrum Control */}
          {toolKey === 'led' && ledSpectrum && onLedSpectrumChange && (
            <LEDSpectrumControl
              spectrum={ledSpectrum}
              onChange={onLedSpectrumChange}
              aiSuggestion={aiSpectrumSuggestion ?? null}
              onAIOptimize={onAIOptimizeSpectrum ?? (() => {})}
              onAcceptAI={onAcceptSpectrum ?? (() => {})}
              onRejectAI={onRejectSpectrum ?? (() => {})}
              zoneName={zoneName ?? ''}
            />
          )}

          <button
            onClick={() => onInstruct(toolKey)}
            disabled={!state.duration || parseFloat(state.duration) <= 0}
            className="w-full bg-green-600 text-white rounded-lg py-2.5 hover:bg-green-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Update & Instruct Device
          </button>
        </>
      )}
    </div>
  );
}

function LEDSpectrumControl({
  spectrum,
  onChange,
  aiSuggestion,
  onAIOptimize,
  onAcceptAI,
  onRejectAI,
  zoneName,
}: {
  spectrum: LEDSpectrum;
  onChange: (s: LEDSpectrum) => void;
  aiSuggestion: LEDSpectrum | null;
  onAIOptimize: () => void;
  onAcceptAI: () => void;
  onRejectAI: () => void;
  zoneName: string;
}) {
  const channels: { key: keyof LEDSpectrum; label: string; color: string; trackColor: string }[] = [
    { key: 'red',   label: 'Red',   color: 'text-red-500',   trackColor: '#ef4444' },
    { key: 'blue',  label: 'Blue',  color: 'text-blue-500',  trackColor: '#3b82f6' },
    { key: 'white', label: 'White', color: 'text-gray-400',  trackColor: '#9ca3af' },
  ];

  return (
    <div className="border-t border-gray-100 pt-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="text-green-600" size={14} />
          <span className="text-gray-700 text-xs">Spectrum Control</span>
        </div>
        <button
          onClick={onAIOptimize}
          className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 rounded-lg px-2.5 py-1 hover:bg-green-100 transition-colors text-xs"
        >
          <Sparkles size={12} />
          AI Optimize
        </button>
      </div>

      {/* Current values display */}
      <div className="flex gap-2">
        {channels.map(({ key, label, color }) => (
          <div key={key} className="flex-1 bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
            <p className={`text-xs ${color}`}>{label}</p>
            <p className="text-gray-900 text-sm">{spectrum[key]}%</p>
          </div>
        ))}
      </div>

      {/* Sliders */}
      <div className="space-y-2.5">
        {channels.map(({ key, label, color, trackColor }) => (
          <div key={key} className="flex items-center gap-3">
            <span className={`text-xs w-9 flex-shrink-0 ${color}`}>{label}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={spectrum[key]}
              onChange={(e) => onChange({ ...spectrum, [key]: parseInt(e.target.value) })}
              className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${trackColor} 0%, ${trackColor} ${spectrum[key]}%, #e5e7eb ${spectrum[key]}%, #e5e7eb 100%)`,
              }}
            />
            <span className="text-gray-500 text-xs w-8 text-right">{spectrum[key]}%</span>
          </div>
        ))}
      </div>

      {/* AI suggestion */}
      {aiSuggestion && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="text-green-600" size={13} />
            <span className="text-green-700 text-xs">AI Suggested Spectrum · {zoneName}</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 text-center">
              <p className="text-red-400 text-[10px]">Red</p>
              <p className="text-gray-900 text-xs">{aiSuggestion.red}%</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-blue-400 text-[10px]">Blue</p>
              <p className="text-gray-900 text-xs">{aiSuggestion.blue}%</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-gray-400 text-[10px]">White</p>
              <p className="text-gray-900 text-xs">{aiSuggestion.white}%</p>
            </div>
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={onAcceptAI}
              className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white rounded-lg py-1.5 text-xs hover:bg-green-700 transition-colors"
            >
              <Check size={12} /> Apply
            </button>
            <button
              onClick={onRejectAI}
              className="flex-1 flex items-center justify-center gap-1 bg-white border border-red-200 text-red-500 rounded-lg py-1.5 text-xs hover:bg-red-50 transition-colors"
            >
              <X size={12} /> Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SchedulePanel({
  zoneName,
  schedules,
  onAdd,
  onEdit,
  onRemove,
  onAIGenerate,
}: {
  zoneName: string;
  schedules: ScheduleEntry[];
  onAdd: (entry: Omit<ScheduleEntry, 'id' | 'active'>) => void;
  onEdit: (id: string, patch: Partial<ScheduleEntry>) => void;
  onRemove: (id: string) => void;
  onAIGenerate: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const scheduleToRemove = schedules.find((s) => s.id === pendingRemoveId);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="text-green-600" size={20} />
          <h3 className="text-gray-900">Automation Schedule</h3>
        </div>
        <button
          onClick={onAIGenerate}
          className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 rounded-lg px-2.5 py-1.5 hover:bg-green-100 transition-colors text-xs"
        >
          <Sparkles size={14} />
          AI Suggest
        </button>
      </div>
      <p className="text-gray-500 text-xs -mt-2">
        Specialized for {zoneName}. Each zone has its own schedule.
      </p>

      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-2 border-b border-gray-200 text-[10px] uppercase tracking-wide text-gray-400 px-[12px] py-[8px]">
          <div className="col-span-3">Tool</div>
          <div className="col-span-1 text-center">Days</div>
          <div className="col-span-3 text-center">Start</div>
          <div className="col-span-2 text-center">Duration</div>
          <div className="col-span-3 text-center">Run</div>
        </div>
        {schedules.length === 0 ? (
          <div className="px-3 py-6 text-center text-gray-400 text-xs">
            No schedules yet. Add one or tap AI Suggest.
          </div>
        ) : (
          schedules.map((s) =>
            editingId === s.id ? (
              <ScheduleEditRow
                key={s.id}
                entry={s}
                onSave={(patch) => {
                  onEdit(s.id, patch);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <ScheduleRow
                key={s.id}
                entry={s}
                onToggle={() => onEdit(s.id, { active: !s.active })}
                onEdit={() => setEditingId(s.id)}
                onRemove={() => setPendingRemoveId(s.id)}
              />
            )
          )
        )}
      </div>

      {showForm ? (
        <ScheduleForm
          onCancel={() => setShowForm(false)}
          onSubmit={(entry) => {
            onAdd(entry);
            setShowForm(false);
          }}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 bg-white border border-dashed border-gray-300 text-gray-500 rounded-lg py-2.5 hover:bg-gray-50 transition-colors text-sm"
        >
          <Plus size={16} />
          Add Schedule
        </button>
      )}

      {/* Delete Schedule confirmation */}
      <ConfirmDialog
        open={pendingRemoveId !== null}
        title="Delete Schedule"
        message={
          scheduleToRemove
            ? `Delete the ${TOOL_LABELS[scheduleToRemove.toolKey]} schedule (every ${scheduleToRemove.days}d at ${scheduleToRemove.startTime})? This cannot be undone.`
            : 'Are you sure you want to delete this schedule?'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          if (pendingRemoveId) onRemove(pendingRemoveId);
          setPendingRemoveId(null);
        }}
        onCancel={() => setPendingRemoveId(null)}
      />
    </div>
  );
}

function ScheduleRow({
  entry,
  onToggle,
  onEdit,
  onRemove,
}: {
  entry: ScheduleEntry;
  onToggle: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`grid grid-cols-12 gap-2 px-3 py-3 items-center border-b border-gray-100 last:border-0 text-xs ${
        entry.active ? 'bg-green-50' : ''
      }`}
    >
      <div className="col-span-3 text-gray-900 truncate">{TOOL_LABELS[entry.toolKey]}</div>
      <div className="col-span-1 text-gray-500 text-center">{entry.days}d</div>
      <div className="col-span-3 text-gray-500 text-center">{entry.startTime}</div>
      <div className="col-span-2 text-gray-500 text-center">{entry.duration}m</div>
      <div className="col-span-3 flex items-center justify-end gap-1">
        <button
          onClick={onToggle}
          className={`p-1.5 rounded ${
            entry.active
              ? 'bg-red-100 text-red-500'
              : 'bg-green-100 text-green-600'
          }`}
          title={entry.active ? 'Stop' : 'Start'}
        >
          {entry.active ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
        </button>
        <button
          onClick={onEdit}
          className="p-1.5 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          title="Edit"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 rounded bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
      {entry.active && (
        <div className="col-span-12 flex items-center gap-2 text-[10px] text-green-600 mt-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Schedule active · editable while running
        </div>
      )}
    </div>
  );
}

function ScheduleEditRow({
  entry,
  onSave,
  onCancel,
}: {
  entry: ScheduleEntry;
  onSave: (patch: Partial<ScheduleEntry>) => void;
  onCancel: () => void;
}) {
  const [tool, setTool] = useState<ToolKey>(entry.toolKey);
  const [days, setDays] = useState(entry.days);
  const [start, setStart] = useState(entry.startTime);
  const [duration, setDuration] = useState(entry.duration);

  return (
    <div className="grid grid-cols-12 gap-2 px-3 py-3 items-center border-b border-gray-100 bg-green-50 text-xs">
      <select
        value={tool}
        onChange={(e) => setTool(e.target.value as ToolKey)}
        className="col-span-3 bg-white border border-gray-200 rounded px-1.5 py-1 text-gray-900 outline-none"
      >
        {Object.entries(TOOL_LABELS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
      <input
        type="number"
        value={days}
        onChange={(e) => setDays(e.target.value)}
        className="col-span-2 bg-white border border-gray-200 rounded px-1.5 py-1 text-gray-900 text-center outline-none"
      />
      <input
        type="time"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="col-span-3 bg-white border border-gray-200 rounded px-1.5 py-1 text-gray-900 text-center outline-none"
      />
      <input
        type="number"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="col-span-2 bg-white border border-gray-200 rounded px-1.5 py-1 text-gray-900 text-center outline-none"
      />
      <div className="col-span-3 flex items-center justify-end gap-1">
        <button
          onClick={() => onSave({ toolKey: tool, days, startTime: start, duration })}
          className="p-1.5 rounded bg-green-600 text-white"
        >
          <Check size={12} />
        </button>
        <button onClick={onCancel} className="p-1.5 rounded bg-white border border-red-200 text-red-500">
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

function ScheduleForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (entry: Omit<ScheduleEntry, 'id' | 'active'>) => void;
  onCancel: () => void;
}) {
  const [toolKey, setToolKey] = useState<ToolKey>('sprinkler');
  const [days, setDays] = useState('');
  const [startTime, setStartTime] = useState('06:00');
  const [duration, setDuration] = useState('');

  const canSubmit = days && startTime && duration;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <label className="text-gray-500 text-[10px] uppercase">Tool</label>
          <select
            value={toolKey}
            onChange={(e) => setToolKey(e.target.value as ToolKey)}
            className="mt-1 w-full bg-white border border-gray-200 rounded px-2 py-2 text-gray-900 text-sm outline-none"
          >
            {Object.entries(TOOL_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-gray-500 text-[10px] uppercase">Days</label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="7"
            className="mt-1 w-full bg-white border border-gray-200 rounded px-2 py-2 text-gray-900 text-sm outline-none"
          />
        </div>
        <div>
          <label className="text-gray-500 text-[10px] uppercase">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-full bg-white border border-gray-200 rounded px-2 py-2 text-gray-900 text-sm outline-none"
          />
        </div>
        <div className="col-span-2">
          <label className="text-gray-500 text-[10px] uppercase">Duration (min)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="15"
            className="mt-1 w-full bg-white border border-gray-200 rounded px-2 py-2 text-gray-900 text-sm outline-none"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          disabled={!canSubmit}
          onClick={() => onSubmit({ toolKey, days, startTime, duration })}
          className="flex-1 bg-green-600 text-white rounded py-2 text-sm hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save Schedule
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-white border border-gray-200 text-gray-600 rounded py-2 text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}