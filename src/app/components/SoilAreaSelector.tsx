import { ChevronDown, Layers } from 'lucide-react';
import { useState } from 'react';
import { useAppContext, BASE_ZONES } from '../context/AppContext';

// Backward-compat alias for components that import the static list
export const SOIL_AREAS = BASE_ZONES;

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export function SoilAreaSelector({ value, onChange }: Props) {
  const { zones } = useAppContext();
  const [open, setOpen] = useState(false);
  const current = zones.find((a) => a.id === value) ?? zones[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-green-300 transition-colors shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Layers className="text-green-600" size={18} />
          <span className="text-gray-900 text-sm">{current.name}</span>
        </div>
        <ChevronDown
          className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          size={18}
        />
      </button>

      {open && (
        <div className="absolute z-30 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg max-h-60 overflow-y-auto">
          {zones.map((area) => (
            <button
              key={area.id}
              onClick={() => {
                onChange(area.id);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                area.id === value ? 'text-green-600' : 'text-gray-700'
              }`}
            >
              <span>{area.name}</span>
              {area.id === value && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
