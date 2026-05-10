import { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Search, Brain } from 'lucide-react';
import { SettingsButton } from './SettingsCenter';

type Severity = 'critical' | 'warning' | 'info' | 'anomaly' | 'pattern';

interface Alert {
  id: number;
  severity: Severity;
  title: string;
  message: string;
  time: string;
}

const initialAlerts: Alert[] = [
  {
    id: 1,
    severity: 'critical',
    title: 'Water Reservoir Critical',
    message: 'Water reservoir at 15% — Refill needed immediately',
    time: '5 min ago',
  },
  {
    id: 2,
    severity: 'anomaly',
    title: 'Anomaly Detected',
    message:
      'Soil moisture in Bed C3 dropped 18% in 90 minutes. Possible irrigation blockage or sensor fault. Tap to diagnose.',
    time: '12 min ago',
  },
  {
    id: 3,
    severity: 'pattern',
    title: 'Pattern Noticed',
    message:
      'Zone B temperature has fluctuated ±3°C every evening for 5 days. Possible ventilation issue near Rack B. AI suggests checking the cooling fan schedule.',
    time: '1 hour ago',
  },
  {
    id: 4,
    severity: 'warning',
    title: 'Temperature Fluctuation',
    message: 'Temperature variance detected in Zone C',
    time: '3 hours ago',
  },
  {
    id: 5,
    severity: 'info',
    title: 'Nutrient Cycle Complete',
    message: 'Automated nutrient dosing completed successfully',
    time: '5 hours ago',
  },
  {
    id: 6,
    severity: 'critical',
    title: 'pH Levels Critical',
    message: 'Water pH outside optimal range in Tank 2',
    time: '6 hours ago',
  },
  {
    id: 7,
    severity: 'info',
    title: 'Growth Milestone',
    message: 'Spinach in Slot A2 reached 70% maturity',
    time: '8 hours ago',
  },
];

export function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [diagnosingId, setDiagnosingId] = useState<number | null>(null);

  const dismissAlert = (id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter(
    (a) => a.severity === 'warning' || a.severity === 'anomaly' || a.severity === 'pattern'
  ).length;
  const infoCount = alerts.filter((a) => a.severity === 'info').length;

  return (
    <div className="pb-24 px-4 space-y-6">
      <header className="flex justify-between items-center pt-6 pb-4">
        <div>
          <h2 className="text-xl text-gray-900">Alerts & Notifications</h2>
          <p className="text-gray-500 text-sm mt-1">{alerts.length} active notifications</p>
        </div>
        <SettingsButton />
      </header>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Critical" value={criticalCount} color="text-red-500" bg="bg-red-50" border="border-red-100" />
        <StatCard label="Warning" value={warningCount} color="text-amber-500" bg="bg-amber-50" border="border-amber-100" />
        <StatCard label="Info" value={infoCount} color="text-green-600" bg="bg-green-50" border="border-green-100" />
      </div>

      <div className="space-y-3">
        {alerts.map((alert) =>
          alert.severity === 'anomaly' || alert.severity === 'pattern' ? (
            <AnomalyAlertCard
              key={alert.id}
              alert={alert}
              diagnosing={diagnosingId === alert.id}
              onDismiss={() => dismissAlert(alert.id)}
              onDiagnose={() => setDiagnosingId(diagnosingId === alert.id ? null : alert.id)}
            />
          ) : (
            <AlertCard key={alert.id} alert={alert} onDismiss={() => dismissAlert(alert.id)} />
          )
        )}
      </div>

      {alerts.length === 0 && (
        <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center shadow-sm">
          <CheckCircle className="text-green-600 mx-auto mb-3" size={48} />
          <h3 className="text-gray-900 mb-2">All Clear!</h3>
          <p className="text-gray-500 text-sm">No active alerts at the moment</p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  bg,
  border,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4 border ${border} shadow-sm`}>
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className={`text-2xl ${color}`}>{value}</p>
    </div>
  );
}

function AlertCard({ alert, onDismiss }: { alert: Alert; onDismiss: () => void }) {
  const severityConfig: Record<string, { dot: string; bg: string; border: string }> = {
    critical: { dot: 'bg-red-500', bg: 'bg-red-50', border: 'border-red-100' },
    warning:  { dot: 'bg-amber-400', bg: 'bg-amber-50', border: 'border-amber-100' },
    info:     { dot: 'bg-green-500', bg: 'bg-green-50', border: 'border-green-100' },
  };

  const config = severityConfig[alert.severity] ?? severityConfig.info;

  return (
    <div className={`${config.bg} rounded-2xl p-4 border ${config.border} shadow-sm`}>
      <div className="flex gap-4">
        <div className="flex-shrink-0 mt-1">
          <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h4 className="text-gray-900">{alert.title}</h4>
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-black/5 rounded transition-colors flex-shrink-0"
            >
              <X className="text-gray-400" size={16} />
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-2">{alert.message}</p>
          <p className="text-gray-400 text-xs">{alert.time}</p>
        </div>
      </div>
    </div>
  );
}

function AnomalyAlertCard({
  alert,
  diagnosing,
  onDismiss,
  onDiagnose,
}: {
  alert: Alert;
  diagnosing: boolean;
  onDismiss: () => void;
  onDiagnose: () => void;
}) {
  const isPattern = alert.severity === 'pattern';

  const DIAGNOSE_RESPONSES: Record<number, string[]> = {
    2: [
      '🔍 Checking sensor logs for Bed C3…',
      '📊 Moisture sensor last calibrated 14 days ago.',
      '⚠️ Irrigation valve B3 shows irregular flow pattern.',
      '💡 Recommendation: Inspect valve B3 and flush the irrigation line. If issue persists, recalibrate sensor.',
    ],
    3: [
      '🔍 Analyzing Zone B temperature logs…',
      '📊 Pattern confirmed: 5 consecutive evenings, 18:00–21:00.',
      '🌬️ Cooling fan C2 schedule ends at 17:45 — gap before nighttime cooling.',
      '💡 Recommendation: Extend fan C2 schedule by 90 minutes or add a secondary evening cycle.',
    ],
  };

  const steps = DIAGNOSE_RESPONSES[alert.id] ?? [];

  return (
    <div
      className="bg-amber-50 rounded-2xl p-4 border border-amber-200 shadow-sm"
      style={{ borderLeft: '4px solid #f59e0b' }}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {isPattern ? (
            <Search className="text-amber-500" size={18} />
          ) : (
            <AlertTriangle className="text-amber-500" size={18} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-1">
            <div>
              <span className="text-amber-600 text-[10px] uppercase tracking-wide">
                {isPattern ? '🔍 Pattern Noticed' : '⚠️ Anomaly Detected'}
              </span>
              <h4 className="text-gray-900 mt-0.5">{alert.title}</h4>
            </div>
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-black/5 rounded transition-colors flex-shrink-0"
            >
              <X className="text-gray-400" size={16} />
            </button>
          </div>
          <p className="text-gray-600 text-sm mb-3 leading-relaxed">{alert.message}</p>
          <p className="text-gray-400 text-xs mb-3">{alert.time}</p>

          <button
            onClick={onDiagnose}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors w-full justify-center ${
              diagnosing
                ? 'bg-amber-200 text-amber-800 border border-amber-300'
                : 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200'
            }`}
          >
            <Brain size={14} />
            {diagnosing ? 'Diagnosing…' : 'Diagnose with AI'}
          </button>

          {diagnosing && (
            <div className="mt-3 bg-white border border-amber-200 rounded-xl p-3 space-y-2">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs text-gray-700 animate-[fadeIn_0.3s_ease]"
                  style={{ animationDelay: `${i * 0.15}s`, opacity: 1 }}
                >
                  <span className="text-amber-500 flex-shrink-0 mt-0.5">›</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}