import { Droplets, Zap, Leaf } from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const WATER_DATA = [
  { day: 'Mon', liters: 7.2 },
  { day: 'Tue', liters: 8.1 },
  { day: 'Wed', liters: 6.8 },
  { day: 'Thu', liters: 9.3 },
  { day: 'Fri', liters: 7.5 },
  { day: 'Sat', liters: 8.9 },
  { day: 'Sun', liters: 8.4 },
];

const WEEKLY_AVG = parseFloat(
  (WATER_DATA.reduce((s, d) => s + d.liters, 0) / WATER_DATA.length).toFixed(2)
);

const WATER_DATA_WITH_AVG = WATER_DATA.map((d) => ({ ...d, avg: WEEKLY_AVG }));

const ENERGY_DATA = [
  { name: 'LED Lights', value: 58, color: '#16a34a' },
  { name: 'Water Pump', value: 25, color: '#3b82f6' },
  { name: 'Cooling Fan', value: 17, color: '#d1d5db' },
];

function CircularProgress({ score }: { score: number }) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  return (
    <svg width="76" height="76" viewBox="0 0 76 76">
      <circle cx="38" cy="38" r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
      <circle
        cx="38"
        cy="38"
        r={r}
        fill="none"
        stroke="#16a34a"
        strokeWidth="7"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 38 38)"
      />
      <text x="38" y="33" textAnchor="middle" fontSize="13" fill="var(--foreground)" fontWeight="600">
        {score}
      </text>
      <text x="38" y="47" textAnchor="middle" fontSize="9" fill="#6b7280">
        /100
      </text>
    </svg>
  );
}

export function ResourceDashboard() {
  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          icon={Droplets}
          label="Water Today"
          value="8.4L"
          iconColor="text-blue-500"
          bg="bg-blue-50"
          border="border-blue-100"
        />
        <SummaryCard
          icon={Zap}
          label="Energy"
          value="1.2 kWh"
          iconColor="text-amber-500"
          bg="bg-amber-50"
          border="border-amber-100"
        />
        <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex flex-col items-center justify-center shadow-sm">
          <p className="text-gray-500 text-[10px] mb-1 tracking-wide">Score</p>
          <CircularProgress score={87} />
        </div>
      </div>

      {/* Water usage bar chart */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
        <h3 className="text-gray-900 mb-0.5">Water Usage</h3>
        <p className="text-gray-500 text-xs mb-4">
          Past 7 days · avg{' '}
          <span className="text-green-600">{WEEKLY_AVG}L/day</span>
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <ComposedChart
            data={WATER_DATA_WITH_AVG}
            margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 12]}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
              formatter={(value: number, name: string) => [
                name === 'avg' ? `${value}L avg` : `${value}L`,
                name === 'avg' ? 'Weekly Avg' : 'Used',
              ]}
            />
            <Bar dataKey="liters" fill="#bbf7d0" radius={[4, 4, 0, 0]} name="liters" />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#16a34a"
              strokeDasharray="5 4"
              strokeWidth={2}
              dot={false}
              name="avg"
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-200" />
            <span className="text-gray-400 text-[10px]">Daily usage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 border-t-2 border-dashed border-green-600" />
            <span className="text-gray-400 text-[10px]">Weekly avg</span>
          </div>
        </div>
      </div>

      {/* Energy breakdown donut */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
        <h3 className="text-gray-900 mb-0.5">Energy Breakdown</h3>
        <p className="text-gray-500 text-xs mb-3">Today's consumption split by device</p>
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={ENERGY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  dataKey="value"
                  strokeWidth={0}
                  startAngle={90}
                  endAngle={-270}
                >
                  {ENERGY_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            {ENERGY_DATA.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600 text-xs flex-1">{item.name}</span>
                <span className="text-gray-900 text-xs">{item.value}%</span>
              </div>
            ))}
            <p className="text-gray-400 text-[10px]">Total: 1.2 kWh today</p>
          </div>
        </div>
      </div>

      {/* Savings banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-xl flex-shrink-0">💧</span>
        <div>
          <p className="text-blue-800 text-sm">
            You saved <span className="font-medium">4.2L</span> compared to yesterday.{' '}
            <span className="text-blue-600">Great efficiency!</span>
          </p>
          <p className="text-blue-400 text-xs mt-1">
            Sustainability score improved by 3 pts this week
          </p>
        </div>
      </div>

      {/* Tip card */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <Leaf className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-green-800 text-sm">
            <span className="font-medium">Eco Tip:</span> Scheduling irrigation during cooler hours
            reduces evaporation by up to 20%.
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  iconColor,
  bg,
  border,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor: string;
  bg: string;
  border: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-3 border ${border} shadow-sm`}>
      <Icon className={`${iconColor} mb-2`} size={18} />
      <p className="text-gray-500 text-[10px]">{label}</p>
      <p className="text-gray-900 text-sm mt-0.5">{value}</p>
    </div>
  );
}