import { Sprout } from 'lucide-react';

interface Slot {
  id: string;
  farmName: string;
  crop: string;
  health: 'good' | 'warning' | 'critical';
  daysPlanted: number;
  harvest: string;
}

const CROP_CYCLES: Record<string, number> = {
  Lettuce: 30,
  Tomatoes: 70,
  Basil: 25,
  Spinach: 40,
  Kale: 55,
  Mint: 35,
  Cilantro: 25,
  Parsley: 70,
  Arugula: 21,
  Chard: 50,
};

const CROP_EMOJIS: Record<string, string> = {
  Lettuce: '🥬',
  Tomatoes: '🍅',
  Basil: '🌿',
  Spinach: '🥬',
  Kale: '🥦',
  Mint: '🌱',
  Cilantro: '🌿',
  Parsley: '🌱',
  Arugula: '🥗',
  Chard: '🥬',
};

// Today: May 9, 2026
const TODAY = new Date(2026, 4, 9);

function getHarvestDate(daysPlanted: number, cycleLength: number): Date {
  const daysLeft = Math.max(0, cycleLength - daysPlanted);
  const d = new Date(TODAY);
  d.setDate(d.getDate() + daysLeft);
  return d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface HarvestTimelineProps {
  slots: Slot[];
}

export function HarvestTimeline({ slots }: HarvestTimelineProps) {
  const enriched = slots.map((slot) => {
    const cycle = CROP_CYCLES[slot.crop] ?? 30;
    const progress = Math.min(100, Math.round((slot.daysPlanted / cycle) * 100));
    const harvestDate = getHarvestDate(slot.daysPlanted, cycle);
    const daysLeft = Math.max(0, cycle - slot.daysPlanted);
    return { ...slot, cycle, progress, harvestDate, daysLeft };
  });

  const readyThisWeek = enriched.filter((s) => s.daysLeft <= 7).length;
  const inProgress = enriched.filter((s) => s.progress < 100 && s.daysLeft > 0).length;
  const newPlantings = enriched.filter((s) => s.daysPlanted <= 3).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sprout className="text-green-600" size={22} />
          <h2 className="text-xl text-gray-900">Harvest Timeline</h2>
        </div>
        <p className="text-gray-500 text-sm">Crop growth progress across all zones</p>
      </div>

      {/* Summary strip */}
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex flex-wrap gap-y-1 gap-x-4 text-sm">
        <span className="text-green-700">
          🟢 <span className="font-medium">{readyThisWeek}</span> crops ready this week
        </span>
        <span className="text-amber-600">
          🟡 <span className="font-medium">{inProgress}</span> crops in progress
        </span>
        <span className="text-blue-600">
          🔵 <span className="font-medium">{newPlantings}</span> new planting
          {newPlantings !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Crop cards */}
      <div className="space-y-3">
        {enriched.map((slot) => (
          <CropCard key={slot.id} slot={slot} />
        ))}
      </div>
    </div>
  );
}

function CropCard({
  slot,
}: {
  slot: {
    id: string;
    farmName: string;
    crop: string;
    daysPlanted: number;
    cycle: number;
    progress: number;
    harvestDate: Date;
    daysLeft: number;
    health: 'good' | 'warning' | 'critical';
  };
}) {
  const emoji = CROP_EMOJIS[slot.crop] ?? '🌱';
  const isReady = slot.progress >= 100;
  const isNew = slot.daysPlanted <= 3;

  return (
    <div
      className={`bg-white rounded-2xl p-4 border shadow-sm ${
        isReady
          ? 'border-green-300'
          : isNew
          ? 'border-blue-200'
          : 'border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Crop icon */}
        <div className="w-11 h-11 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0 text-2xl">
          {emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div>
              <span className="text-gray-900 text-sm">{slot.farmName}</span>
              <span className="text-gray-400 text-xs mx-1.5">·</span>
              <span className="text-gray-600 text-xs">{slot.crop}</span>
            </div>
            {isReady ? (
              <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full border border-green-200 flex-shrink-0">
                Ready!
              </span>
            ) : isNew ? (
              <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full border border-blue-200 flex-shrink-0">
                New
              </span>
            ) : null}
          </div>

          {/* Progress bar */}
          <div className="mt-2 mb-1.5">
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>
                Day {slot.daysPlanted} of {slot.cycle}
              </span>
              <span>{slot.progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isReady
                    ? 'bg-green-500'
                    : slot.progress >= 75
                    ? 'bg-green-400'
                    : slot.progress >= 40
                    ? 'bg-amber-400'
                    : 'bg-blue-300'
                }`}
                style={{ width: `${slot.progress}%` }}
              />
            </div>
          </div>

          {/* Harvest date and button */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-gray-400 text-xs">
              {isReady ? (
                <span className="text-green-600">✓ Harvest now</span>
              ) : (
                <>
                  Ready:{' '}
                  <span className="text-gray-600">{formatDate(slot.harvestDate)}</span>
                  {slot.daysLeft > 0 && (
                    <span className="text-gray-400"> ({slot.daysLeft}d left)</span>
                  )}
                </>
              )}
            </p>
            {isReady && (
              <button className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                Harvest Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
