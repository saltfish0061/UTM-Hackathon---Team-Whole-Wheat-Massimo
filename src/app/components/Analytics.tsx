import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Progress } from '@radix-ui/react-progress';

const temperatureData = [
  { day: 'Mon', temp: 22 },
  { day: 'Tue', temp: 23 },
  { day: 'Wed', temp: 24 },
  { day: 'Thu', temp: 23 },
  { day: 'Fri', temp: 24 },
  { day: 'Sat', temp: 25 },
  { day: 'Sun', temp: 24 },
];

const waterUsageData = [
  { day: 'Mon', usage: 45 },
  { day: 'Tue', usage: 52 },
  { day: 'Wed', usage: 48 },
  { day: 'Thu', usage: 55 },
  { day: 'Fri', usage: 50 },
  { day: 'Sat', usage: 47 },
  { day: 'Sun', usage: 51 },
];

const cropProgress = [
  { slot: 'A1 - Lettuce', progress: 85 },
  { slot: 'A2 - Spinach', progress: 60 },
  { slot: 'A3 - Kale', progress: 92 },
  { slot: 'B1 - Arugula', progress: 45 },
  { slot: 'B2 - Basil', progress: 70 },
];

export function Analytics() {
  const [timeRange, setTimeRange] = useState('week');

  return (
    <div className="pb-24 px-4 space-y-6">
      <header className="pt-6 pb-4">
        <h2 className="text-xl text-[#39FF14]">Analytics</h2>
        <p className="text-gray-400 text-sm mt-1">Farm performance metrics</p>
      </header>

      <div className="flex gap-2 mb-4">
        {['today', 'week', 'month'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg transition-all ${
              timeRange === range
                ? 'bg-[#39FF14] text-[#0D1F0F]'
                : 'bg-[#1A2E1A] text-gray-400 border border-[#39FF14]/20 hover:border-[#39FF14]/40'
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-[#1A2E1A] rounded-2xl p-5 border border-[#39FF14]/20 shadow-[0_0_20px_rgba(57,255,20,0.15)]">
        <h3 className="text-[#39FF14] mb-4">Temperature Trends (7 Days)</h3>
        <ResponsiveContainer width="100%" height={200} key="temp-chart">
          <LineChart data={temperatureData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#39FF14" opacity={0.1} key="temp-grid" />
            <XAxis dataKey="day" stroke="#9CA3AF" key="temp-x" />
            <YAxis stroke="#9CA3AF" key="temp-y" />
            <Tooltip
              key="temp-tooltip"
              contentStyle={{
                backgroundColor: '#1A2E1A',
                border: '1px solid rgba(57, 255, 20, 0.3)',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#39FF14"
              strokeWidth={3}
              dot={{ fill: '#39FF14', r: 4 }}
              key="temp-line"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1A2E1A] rounded-2xl p-5 border border-[#39FF14]/20 shadow-[0_0_20px_rgba(57,255,20,0.15)]">
        <h3 className="text-[#39FF14] mb-4">Water Usage (Liters/Day)</h3>
        <ResponsiveContainer width="100%" height={200} key="water-chart">
          <BarChart data={waterUsageData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#39FF14" opacity={0.1} key="water-grid" />
            <XAxis dataKey="day" stroke="#9CA3AF" key="water-x" />
            <YAxis stroke="#9CA3AF" key="water-y" />
            <Tooltip
              key="water-tooltip"
              contentStyle={{
                backgroundColor: '#1A2E1A',
                border: '1px solid rgba(57, 255, 20, 0.3)',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Bar dataKey="usage" fill="#39FF14" radius={[8, 8, 0, 0]} key="water-bar" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1A2E1A] rounded-2xl p-5 border border-[#39FF14]/20 shadow-[0_0_20px_rgba(57,255,20,0.15)]">
        <h3 className="text-[#39FF14] mb-4">Crop Growth Progress</h3>
        <div className="space-y-4">
          {cropProgress.map((crop) => (
            <div key={crop.slot}>
              <div className="flex justify-between mb-2">
                <span className="text-white text-sm">{crop.slot}</span>
                <span className="text-[#39FF14] text-sm">{crop.progress}%</span>
              </div>
              <Progress
                value={crop.progress}
                className="h-2 w-full bg-[#1E1E1E] rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-gradient-to-r from-[#39FF14] to-[#00E676] rounded-full transition-all"
                  style={{ width: `${crop.progress}%` }}
                />
              </Progress>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
