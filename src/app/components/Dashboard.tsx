import { Droplets, Wind, FlaskConical, Leaf, Thermometer, Hand, Sparkles, Check, X, BarChart2 } from 'lucide-react';
import { useState } from 'react';
import { SoilAreaSelector, SOIL_AREAS } from './SoilAreaSelector';
import { NotificationCenter } from './NotificationCenter';
import { ExportButtons } from './ExportButtons';
import { ResourceDashboard } from './ResourceDashboard';
import { useAppContext } from '../context/AppContext';
import { SettingsButton } from './SettingsCenter';

const SENSOR_DATA: Record<
  string,
  {
    moisture: { current: string; target: string };
    humidity: { current: string; target: string };
    ph: { current: string; target: string };
    nutrient: { current: string; target: string };
    temp: { current: string; target: string };
  }
> = {
  a: {
    moisture: { current: '62%', target: '65-75%' },
    humidity: { current: '67%', target: '65-75%' },
    ph: { current: '6.2', target: '6.0-6.8' },
    nutrient: { current: 'Medium', target: 'High' },
    temp: { current: '24°C', target: '22-26°C' },
  },
  b: {
    moisture: { current: '48%', target: '60-70%' },
    humidity: { current: '42%', target: '60-70%' },
    ph: { current: '6.5', target: '6.0-7.0' },
    nutrient: { current: 'Low', target: 'Medium' },
    temp: { current: '21°C', target: '18-22°C' },
  },
  c: {
    moisture: { current: '55%', target: '50-60%' },
    humidity: { current: '58%', target: '50-60%' },
    ph: { current: '6.8', target: '5.5-6.5' },
    nutrient: { current: 'High', target: 'Medium' },
    temp: { current: '26°C', target: '20-25°C' },
  },
  d: {
    moisture: { current: '70%', target: '60-70%' },
    humidity: { current: '78%', target: '60-70%' }, 
    ph: { current: '6.0', target: '6.0-7.5' },
    nutrient: { current: 'Medium', target: 'Medium' },
    temp: { current: '19°C', target: '16-20°C' },
  },
};

// ─── Dynamic status helper ────────────────────────────────────────────────────
function getStatus(current: string, target: string): 'good' | 'warning' | 'critical' {
  const numCurrent = current.match(/^([\d.]+)/);
  const rangeTarget = target.match(/^([\d.]+)[–\-]([\d.]+)/);

  if (numCurrent && rangeTarget) {
    const val = parseFloat(numCurrent[1]);
    const min = parseFloat(rangeTarget[1]);
    const max = parseFloat(rangeTarget[2]);
    if (val >= min && val <= max) return 'good';
    const span = max - min;
    const deviation = val < min ? min - val : val - max;
    if (deviation > span * 0.6) return 'critical';
    return 'warning';
  }

  // Categorical (e.g. Nutrient level)
  if (current.trim() === target.trim()) return 'good';
  const levels = ['Low', 'Medium', 'High'];
  const ci = levels.indexOf(current.trim());
  const ti = levels.indexOf(target.trim());
  if (ci >= 0 && ti >= 0) return Math.abs(ci - ti) > 1 ? 'critical' : 'warning';
  return 'warning';
}

export function Dashboard() {
  const [areaId, setAreaId] = useState('a');
  const [activeTab, setActiveTab] = useState<'sensor' | 'resources'>('sensor');
  const { zones } = useAppContext();
  // Fall back to Zone A data if a custom zone has no sensor data
  const data = SENSOR_DATA[areaId] ?? SENSOR_DATA['a'];
  const area = zones.find((a) => a.id === areaId) ?? zones[0];

  return (
    <div className="pb-24 px-4 space-y-5">
      <header className="flex justify-between items-center pt-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
            <Leaf className="text-white" size={24} />
          </div>
          <h1 className="text-xl text-gray-900">GreenStack</h1>
        </div>
        <div className="flex items-center gap-2">
          <SettingsButton />
          <NotificationCenter />
        </div>
      </header>

      {/* Tab switcher */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        <button
          onClick={() => setActiveTab('sensor')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm transition-all ${
            activeTab === 'sensor'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart2 size={14} />
          Sensor Data
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm transition-all ${
            activeTab === 'resources'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart2 size={14} />
          Resources
        </button>
      </div>

      {activeTab === 'resources' ? (
        <ResourceDashboard />
      ) : (
        <>
          <SoilAreaSelector value={areaId} onChange={setAreaId} />

          <div>
            <h2 className="text-gray-900 mb-3">Live Raw Data</h2>
            <div className="grid grid-cols-2 gap-3">
              <SensorCard
                icon={Droplets}
                label="Soil Moisture"
                value={data.moisture.current}
                target={data.moisture.target}
                tag="Linked: Water Pump"
                status={getStatus(data.moisture.current, data.moisture.target)}
              />
              <SensorCard
                icon={Wind}
                label="Air Humidity"
                value={data.humidity.current}
                target={data.humidity.target}
                tag="Linked: Ventilation"
                status={getStatus(data.humidity.current, data.humidity.target)}
              />
              <SensorCard
                icon={FlaskConical}
                label="Soil pH"
                value={data.ph.current}
                target={data.ph.target}
                tag="Manual Action"
                status={getStatus(data.ph.current, data.ph.target)}
              />
              <SensorCard
                icon={Leaf}
                label="Nutrient Level"
                value={data.nutrient.current}
                target={data.nutrient.target}
                tag="Linked: Fertilizer"
                status={getStatus(data.nutrient.current, data.nutrient.target)}
              />
              <div className="col-span-2">
                <SensorCard
                  icon={Thermometer}
                  label="Soil Temperature"
                  value={data.temp.current}
                  target={data.temp.target}
                  tag="Linked: LED / Fan"
                  status={getStatus(data.temp.current, data.temp.target)}
                  wide
                />
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-2 text-center">
              Targets shown for current crop: {area.crop}
            </p>
          </div>

          <PHAdjustmentCard
            currentPh={parseFloat(data.ph.current)}
            targetPh={data.ph.target}
            zoneName={area.name}
          />

          <div>
            <h3 className="text-gray-900 mb-3">Export</h3>
            <ExportButtons zoneName={area.name} crop={area.crop} />
          </div>
        </>
      )}
    </div>
  );
}

function SensorCard({
  icon: Icon,
  label,
  value,
  target,
  tag,
  status,
  wide = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  target: string;
  tag: string;
  status: 'good' | 'warning' | 'critical';
  wide?: boolean;
}) {
  const statusColors = {
    good: 'bg-green-50 border-green-200',
    warning: 'bg-amber-50 border-amber-200',
    critical: 'bg-red-50 border-red-200',
  };
  const dotColors = {
    good: 'bg-green-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  };
  const iconColors = {
    good: 'text-green-600',
    warning: 'text-amber-500',
    critical: 'text-red-500',
  };
  const targetColors = {
    good: 'text-green-600',
    warning: 'text-amber-500',
    critical: 'text-red-500',
  };

  if (wide) {
    return (
      <div className={`rounded-xl p-4 border ${statusColors[status]} shadow-sm flex items-center gap-4`}>
        <div className="flex flex-col items-center gap-1.5">
          <Icon className={iconColors[status]} size={22} />
          <div className={`w-2 h-2 rounded-full ${dotColors[status]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 text-xs">{label}</p>
          <p className="text-gray-900 text-lg">{value}</p>
          <p className="text-gray-400 text-[10px] mt-0.5">{tag}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-gray-400 text-[10px]">Target</p>
          <p className={`text-xs ${targetColors[status]}`}>{target}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-4 border ${statusColors[status]} shadow-sm`}>
      <div className="flex justify-between items-start mb-2">
        <Icon className={iconColors[status]} size={20} />
        <div className={`w-2 h-2 rounded-full ${dotColors[status]}`}></div>
      </div>
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="text-gray-900 text-lg">{value}</p>
      <div className="mt-2 pt-2 border-t border-gray-100">
        <p className="text-gray-400 text-[10px]">Target</p>
        <p className={`text-xs ${targetColors[status]}`}>{target}</p>
      </div>
      <p className="text-gray-400 text-[10px] mt-1">{tag}</p>
    </div>
  );
}

function PHAdjustmentCard({
  currentPh,
  targetPh,
  zoneName,
}: {
  currentPh: number;
  targetPh: string;
  zoneName: string;
}) {
  const [suggestion, setSuggestion] = useState<{
    action: string;
    amount: string;
    reason: string;
  } | null>(null);
  const [applied, setApplied] = useState<'accepted' | 'rejected' | null>(null);

  const generate = () => {
    const [minStr, maxStr] = targetPh.split('-');
    const min = parseFloat(minStr);
    const max = parseFloat(maxStr);
    const mid = (min + max) / 2;

    if (currentPh < min) {
      const diff = (mid - currentPh).toFixed(1);
      setSuggestion({
        action: 'Raise pH',
        amount: `Add ${(parseFloat(diff) * 4).toFixed(1)} mL of pH-Up solution`,
        reason: `Current pH ${currentPh} is below target range (${targetPh}). Raising by ~${diff} brings the soil to optimal acidity for the crop.`,
      });
    } else if (currentPh > max) {
      const diff = (currentPh - mid).toFixed(1);
      setSuggestion({
        action: 'Lower pH',
        amount: `Add ${(parseFloat(diff) * 4).toFixed(1)} mL of pH-Down solution`,
        reason: `Current pH ${currentPh} is above target range (${targetPh}). Lowering by ~${diff} restores optimal acidity.`,
      });
    } else {
      setSuggestion({
        action: 'Maintain pH',
        amount: 'No adjustment needed',
        reason: `Current pH ${currentPh} is already within the optimal range (${targetPh}). Re-test in 24h.`,
      });
    }
    setApplied(null);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm">
      <div className="flex gap-3 mb-4">
        <Hand className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <h3 className="text-gray-900">Soil pH Adjustment</h3>
          <p className="text-gray-500 text-xs mt-1">
            Manual action required for {zoneName}. Current pH:{' '}
            <span className="text-gray-900">{currentPh}</span> · Target:{' '}
            <span className="text-green-600">{targetPh}</span>
          </p>
        </div>
      </div>

      {!suggestion ? (
        <button
          onClick={generate}
          className="w-full flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg py-2.5 hover:bg-green-100 transition-colors"
        >
          <Sparkles size={16} />
          <span className="text-sm">Get AI pH Suggestion</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="text-green-600" size={14} />
              <span className="text-green-600 text-xs">AI Suggestion</span>
            </div>
            <p className="text-gray-900 text-sm">{suggestion.action}</p>
            <p className="text-green-600 text-sm mt-1">{suggestion.amount}</p>
            <p className="text-gray-500 text-xs mt-2">{suggestion.reason}</p>
          </div>

          {applied === null ? (
            <div className="flex gap-2">
              <button
                onClick={() => setApplied('accepted')}
                className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white rounded-lg py-2 text-sm hover:bg-green-700 transition-colors"
              >
                <Check size={14} /> Accept
              </button>
              <button
                onClick={() => setApplied('rejected')}
                className="flex-1 flex items-center justify-center gap-1 bg-white border border-red-200 text-red-500 rounded-lg py-2 text-sm hover:bg-red-50 transition-colors"
              >
                <X size={14} /> Reject
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <p
                className={`text-xs ${
                  applied === 'accepted' ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {applied === 'accepted'
                  ? '✓ Suggestion logged. Apply solution manually.'
                  : 'Suggestion dismissed.'}
              </p>
              <button
                onClick={generate}
                className="text-green-600 text-xs hover:underline"
              >
                Regenerate
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}