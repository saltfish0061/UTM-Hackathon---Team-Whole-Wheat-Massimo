import { Home, Sparkles, Power, MapPin, Bell } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeToolsCount?: number;
}

export function BottomNav({ activeTab, onTabChange, activeToolsCount = 0 }: BottomNavProps) {
  const tabs = [
    { id: 'home',   label: 'Home',     Icon: Home },
    { id: 'ai',     label: 'AI Hub',   Icon: Sparkles },
    { id: 'tools',  label: 'Tools',    Icon: Power },
    { id: 'map',    label: 'Farm Map', Icon: MapPin },
    { id: 'alerts', label: 'Alerts',   Icon: Bell },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-3 shadow-sm">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`relative flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all ${
              activeTab === id ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="relative">
              <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 2} />
              {/* Running-tools badge on the Tools tab */}
              {id === 'tools' && activeToolsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-green-500 text-white text-[9px] px-1 leading-none shadow-sm">
                  {activeToolsCount}
                </span>
              )}
            </span>
            <span className="text-[10px]">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
