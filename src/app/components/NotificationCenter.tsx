import { Bell, Wrench, AlertTriangle, LampCeiling, X } from 'lucide-react';
import { useState } from 'react';

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'maintenance' as const,
    title: 'Maintenance Reminder',
    message: 'Reminder: Clean sensors to ensure accurate data (Triggered every 2 days).',
    time: '10 min ago',
  },
  {
    id: 2,
    type: 'failure' as const,
    title: 'Hardware Failure',
    message: 'Warning: Sensor damaged. Please replace the Soil pH Sensor manually.',
    time: '1 hr ago',
  },
  {
    id: 3,
    type: 'malfunction' as const,
    title: 'LED Malfunction',
    message: 'Warning: LED light for Bed C3 (Spinach) is damaged. Please replace it with a new one.',
    time: '31 min ago',
  },
];

const TYPE_CONFIG = {
  maintenance: {
    icon: Wrench,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    border: 'border-l-amber-400',
  },
  failure: {
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-50',
    border: 'border-l-red-400',
  },
  malfunction: {
    icon: LampCeiling,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50',
    border: 'border-l-orange-400',
  },
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<number[]>([]);

  const visible = NOTIFICATIONS.filter((n) => !dismissed.includes(n.id));
  const count = visible.length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        aria-label="Notifications"
      >
        <Bell className="text-gray-600" size={17} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center px-1 leading-none">
            {count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-gray-900 text-sm">Notifications</span>
                {count > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                    {count} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {count > 0 && (
                  <button
                    onClick={() => setDismissed(NOTIFICATIONS.map((n) => n.id))}
                    className="text-gray-400 text-xs hover:text-gray-600 transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="text-gray-400" size={14} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {visible.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="text-gray-200 mx-auto mb-2" size={28} />
                  <p className="text-gray-400 text-sm">All caught up!</p>
                  <p className="text-gray-300 text-xs mt-0.5">No new notifications</p>
                </div>
              ) : (
                visible.map((n) => {
                  const cfg = TYPE_CONFIG[n.type];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-3.5 border-l-[3px] ${cfg.border} hover:bg-gray-50 transition-colors group`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${cfg.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={cfg.iconColor} size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm">{n.title}</p>
                        <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-gray-300 text-xs mt-1">{n.time}</p>
                      </div>
                      <button
                        onClick={() => setDismissed((d) => [...d, n.id])}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-all self-start mt-0.5"
                        aria-label="Dismiss"
                      >
                        <X size={11} className="text-gray-400" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}