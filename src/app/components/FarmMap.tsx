import {
  Leaf,
  X,
  Calendar,
  Activity,
  Plus,
  Pencil,
  Trash2,
  Check,
  Map,
  Sprout,
  Droplets,
  FlaskConical,
  Thermometer,
  Sun,
  Clock,
} from 'lucide-react';
import { useState } from 'react';
import { HarvestTimeline } from './HarvestTimeline';
import { useAppContext } from '../context/AppContext';
import type { Slot, Health } from '../context/AppContext';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { SettingsButton } from './SettingsCenter';

// Re-export for any consumers that import Slot from here
export type { Slot };

const CROP_LIST = [
  'Lettuce',
  'Tomatoes',
  'Basil',
  'Spinach',
  'Kale',
  'Mint',
  'Cilantro',
  'Parsley',
  'Arugula',
  'Chard',
];

interface CropProfile {
  moisture: string;
  ph: string;
  temp: string;
  lightHours: number;
  daysToHarvest: number;
}

const CROP_PROFILES: Record<string, CropProfile> = {
  Lettuce:  { moisture: '60–75%', ph: '6.0–6.8', temp: '18–24°C', lightHours: 16, daysToHarvest: 30 },
  Tomatoes: { moisture: '65–80%', ph: '6.0–6.8', temp: '22–26°C', lightHours: 16, daysToHarvest: 70 },
  Basil:    { moisture: '60–70%', ph: '6.0–7.0', temp: '20–25°C', lightHours: 14, daysToHarvest: 25 },
  Spinach:  { moisture: '55–70%', ph: '6.0–7.0', temp: '15–20°C', lightHours: 12, daysToHarvest: 40 },
  Kale:     { moisture: '60–70%', ph: '6.0–7.5', temp: '18–23°C', lightHours: 14, daysToHarvest: 55 },
  Mint:     { moisture: '65–80%', ph: '6.0–7.0', temp: '18–25°C', lightHours: 13, daysToHarvest: 35 },
  Cilantro: { moisture: '55–65%', ph: '6.0–6.8', temp: '17–22°C', lightHours: 12, daysToHarvest: 25 },
  Parsley:  { moisture: '60–75%', ph: '6.0–7.0', temp: '18–24°C', lightHours: 14, daysToHarvest: 70 },
  Arugula:  { moisture: '55–70%', ph: '6.0–7.0', temp: '16–21°C', lightHours: 14, daysToHarvest: 21 },
  Chard:    { moisture: '60–75%', ph: '6.0–7.0', temp: '18–24°C', lightHours: 14, daysToHarvest: 50 },
};

export function FarmMap() {
  // Slots now live in shared context and are persisted to localStorage
  const { slots, setSlots } = useAppContext();

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [editing, setEditing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'timeline'>('map');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const addSlot = (farmName: string, crop: string) => {
    const id = `N${slots.length + 1}`;
    setSlots([
      ...slots,
      {
        id,
        farmName,
        crop,
        health: 'good',
        daysPlanted: 0,
        harvest: '— days',
      },
    ]);
  };

  const removeSlot = (id: string) => {
    setSlots(slots.filter((s) => s.id !== id));
  };

  const slotToDelete = slots.find((s) => s.id === pendingDeleteId);

  return (
    <div className="pb-24 px-4 space-y-5">
      <header className="flex justify-between items-center pt-6 pb-2">
        <div>
          <h2 className="text-xl text-gray-900">Farm Map</h2>
          <p className="text-gray-500 text-sm mt-1">
            {activeTab === 'map'
              ? editing
                ? 'Tap a slot to remove it'
                : 'Tap a slot for details'
              : 'Crop growth progress across all zones'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SettingsButton />
          {activeTab === 'map' && (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing((e) => !e)}
                className={`p-2.5 rounded-lg border transition-colors ${
                  editing
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {editing ? <Check size={18} /> : <Pencil size={18} />}
              </button>
              <button
                onClick={() => setShowAdd(true)}
                className="p-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
              >
                <Plus size={18} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Tab bar */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm transition-all ${
            activeTab === 'map'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Map size={14} />
          Farm Map
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm transition-all ${
            activeTab === 'timeline'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sprout size={14} />
          Harvest
        </button>
      </div>

      {activeTab === 'timeline' ? (
        <HarvestTimeline slots={slots} />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3">
            {slots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                editing={editing}
                onClick={() => (editing ? setPendingDeleteId(slot.id) : setSelectedSlot(slot))}
              />
            ))}
            {!editing && (
              <button
                onClick={() => setShowAdd(true)}
                className="bg-white rounded-xl p-3 border-2 border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors aspect-square flex flex-col items-center justify-center gap-1"
              >
                <Plus className="text-gray-400" size={20} />
                <span className="text-gray-400 text-[10px]">Add</span>
              </button>
            )}
          </div>

          <div className="flex gap-4 items-center justify-center mt-6">
            <LegendItem color="bg-green-500" label="Good" />
            <LegendItem color="bg-amber-400" label="Warning" />
            <LegendItem color="bg-red-500" label="Critical" />
          </div>

          {/* Persistence notice */}
          <p className="text-center text-gray-400 text-[10px] pb-2">
            Farm layout is saved automatically
          </p>
        </>
      )}

      {selectedSlot && (
        <SlotDetailSheet slot={selectedSlot} onClose={() => setSelectedSlot(null)} />
      )}

      {showAdd && (
        <AddSlotSheet
          onClose={() => setShowAdd(false)}
          onAdd={(name, crop) => {
            addSlot(name, crop);
            setShowAdd(false);
          }}
        />
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Remove Slot"
        message={
          slotToDelete
            ? `Remove "${slotToDelete.farmName}" (${slotToDelete.crop}) from the farm map? This action cannot be undone.`
            : 'Are you sure you want to remove this slot?'
        }
        confirmLabel="Remove Slot"
        cancelLabel="Keep It"
        variant="danger"
        onConfirm={() => {
          if (pendingDeleteId) removeSlot(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}

function SlotCard({
  slot,
  editing,
  onClick,
}: {
  slot: Slot;
  editing: boolean;
  onClick: () => void;
}) {
  const healthColors: Record<Health, string> = {
    good: 'border-green-300',
    warning: 'border-amber-300',
    critical: 'border-red-300',
  };
  const dotColors: Record<Health, string> = {
    good: 'bg-green-500',
    warning: 'bg-amber-400',
    critical: 'bg-red-500',
  };

  return (
    <button
      onClick={onClick}
      className={`relative bg-white rounded-xl p-3 border-2 ${healthColors[slot.health]} hover:scale-105 transition-transform aspect-square flex flex-col items-center justify-center gap-1 shadow-sm ${
        editing ? 'animate-pulse' : ''
      }`}
    >
      {editing && (
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md">
          <Trash2 size={12} />
        </span>
      )}
      <Leaf className="text-green-600" size={18} />
      <span className="text-gray-900 text-[10px] truncate w-full text-center">{slot.farmName}</span>
      <span className="text-gray-400 text-[9px] truncate w-full text-center">{slot.crop}</span>
      <div className={`w-2 h-2 rounded-full ${dotColors[slot.health]}`}></div>
    </button>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <span className="text-gray-500 text-sm">{label}</span>
    </div>
  );
}

function SlotDetailSheet({ slot, onClose }: { slot: Slot; onClose: () => void }) {
  const healthLabels: Record<Health, string> = {
    good: 'Good',
    warning: 'Needs Attention',
    critical: 'Critical',
  };
  const healthColors: Record<Health, string> = {
    good: 'text-green-600',
    warning: 'text-amber-500',
    critical: 'text-red-500',
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl border-t border-gray-200 shadow-xl p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl text-gray-900 mb-1">
              {slot.farmName} — {slot.crop}
            </h3>
            <p className={`text-sm ${healthColors[slot.health]}`}>
              {healthLabels[slot.health]}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="text-gray-400" size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <DetailRow icon={Calendar} label="Days Planted" value={`${slot.daysPlanted} days`} />
          <DetailRow icon={Activity} label="Current Health" value={healthLabels[slot.health]} />
          <DetailRow icon={Calendar} label="Estimated Harvest" value={`in ${slot.harvest}`} />
        </div>

        <button className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors shadow-sm">
          View Details
        </button>
      </div>
    </div>
  );
}

function AddSlotSheet({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (farmName: string, crop: string) => void;
}) {
  const [farmName, setFarmName] = useState('');
  const [crop, setCrop] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const profile = crop ? CROP_PROFILES[crop] : null;
  const canSubmit = farmName.trim() && crop;

  if (confirmed && profile) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end">
        <div className="bg-white w-full rounded-t-3xl border-t border-gray-200 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl text-gray-900">Crop Profile</h3>
              <p className="text-gray-500 text-sm mt-0.5">{farmName} · {crop}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="text-gray-400" size={24} />
            </button>
          </div>

          {/* Recommended targets card */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="text-green-600" size={16} />
              <span className="text-green-700 text-sm">Recommended Targets for {crop}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ProfileItem icon={Droplets}    label="Soil Moisture" value={profile.moisture}              color="text-blue-500" />
              <ProfileItem icon={FlaskConical} label="pH Range"      value={profile.ph}                   color="text-amber-500" />
              <ProfileItem icon={Thermometer}  label="Temperature"   value={profile.temp}                  color="text-red-400" />
              <ProfileItem icon={Sun}          label="Light Hours"   value={`${profile.lightHours} hrs/day`} color="text-yellow-500" />
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-green-100">
              <Clock className="text-green-600 flex-shrink-0" size={16} />
              <div>
                <p className="text-gray-500 text-[10px]">Est. Days to Harvest</p>
                <p className="text-gray-900 text-sm">{profile.daysToHarvest} days</p>
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-xs mb-5 leading-relaxed">
            These targets will be used to generate alerts and AI recommendations for this bed.
            This zone will also appear in the Soil Area Selector across all screens.
          </p>

          <button
            onClick={() => onAdd(farmName.trim(), crop)}
            className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors shadow-sm"
          >
            Add Bed with These Settings
          </button>
          <button
            onClick={() => setConfirmed(false)}
            className="w-full mt-2 bg-white border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl border-t border-gray-200 shadow-xl p-6">
        <div className="flex justify-between items-start mb-5">
          <h3 className="text-xl text-gray-900">Add New Slot</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="text-gray-400" size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-gray-500 text-xs">Farm / Slot Name</label>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="e.g. North Bed 5"
              className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:border-green-300"
            />
          </div>
          <div>
            <label className="text-gray-500 text-xs">Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:border-green-300 appearance-none"
            >
              <option value="">Select a crop…</option>
              {CROP_LIST.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Inline profile preview */}
          {crop && CROP_PROFILES[crop] && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Sprout className="text-green-600" size={13} />
                <span className="text-green-700 text-xs">Quick profile preview for {crop}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <span className="text-gray-500">Moisture:</span>
                <span className="text-gray-900">{CROP_PROFILES[crop].moisture}</span>
                <span className="text-gray-500">Harvest in:</span>
                <span className="text-gray-900">{CROP_PROFILES[crop].daysToHarvest} days</span>
              </div>
            </div>
          )}
        </div>

        <button
          disabled={!canSubmit}
          onClick={() => setConfirmed(true)}
          className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          {crop ? `View ${crop} Profile →` : 'Next'}
        </button>
      </div>
    </div>
  );
}

function ProfileItem({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-2 bg-white rounded-lg p-2.5 border border-green-100">
      <Icon className={`${color} flex-shrink-0 mt-0.5`} size={14} />
      <div>
        <p className="text-gray-400 text-[10px]">{label}</p>
        <p className="text-gray-900 text-xs">{value}</p>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100">
      <Icon className="text-green-600" size={20} />
      <div className="flex-1">
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-gray-900">{value}</p>
      </div>
    </div>
  );
}