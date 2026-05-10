import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useState } from 'react';
import { Sparkles, Send, Bot, User, Download, Check } from 'lucide-react';
import { ReportTemplate } from './ReportTemplate';
import { SoilAreaSelector, SOIL_AREAS } from './SoilAreaSelector';
import { NotificationCenter } from './NotificationCenter';
import { Layers } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SettingsButton } from './SettingsCenter';

const COMPARATIVE_DATA = [
  { sensor: 'Moisture', current: 62, required: 70 },
  { sensor: 'pH', current: 62, required: 65 },
  { sensor: 'Nutrient', current: 50, required: 80 },
  { sensor: 'Temp', current: 24, required: 25 },
];

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export function AIInsights() {
  const { zones } = useAppContext();
  const [areaId, setAreaId] = useState('a');
  const [started, setStarted] = useState(false);
  const selectedArea = zones.find((a) => a.id === areaId) ?? zones[0];
  const crop = selectedArea.crop;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: 'Hello! I can help analyze your crop health. What would you like to know?',
    },
  ]);
  const [input, setInput] = useState('');
  const [showReport, setShowReport] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    const next: ChatMessage[] = [
      ...messages,
      { role: 'user', text: input },
      {
        role: 'ai',
        text: `Based on current readings for ${crop ?? 'your crop'}, I recommend increasing nutrient delivery by ~20% over the next 48 hours.`,
      },
    ];
    setMessages(next);
    setInput('');
  };

  if (!started) {
    return (
      <div className="pb-24 px-4 space-y-5 min-h-screen flex flex-col">
        <header className="flex justify-between items-center pt-6 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-green-600" size={24} />
            <h2 className="text-xl text-gray-900">AI Analysis Hub</h2>
          </div>
          <div className="flex items-center gap-2">
            <SettingsButton />
            <NotificationCenter />
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center py-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm w-full">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="text-green-600" size={28} />
              <h3 className="text-gray-900">Let's Get Started</h3>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Which zone are you analyzing today? This sets the baseline for all AI insights.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 max-h-64 overflow-y-auto space-y-2">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setAreaId(zone.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                    zone.id === areaId
                      ? 'bg-green-50 border border-green-300'
                      : 'border border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layers
                      className={zone.id === areaId ? 'text-green-600' : 'text-gray-400'}
                      size={16}
                    />
                    <div className="text-left">
                      <p className="text-gray-900 text-sm">{zone.name}</p>
                      <p className="text-gray-400 text-xs">{zone.crop}</p>
                    </div>
                  </div>
                  {zone.id === areaId && <Check className="text-green-600" size={16} />}
                </button>
              ))}
            </div>
            <p className="text-gray-400 text-xs mt-3">
              Scroll for more zones · Add new zones from the Farm Map.
            </p>
            <button
              onClick={() => setStarted(true)}
              className="w-full mt-4 bg-green-600 text-white rounded-xl py-3 hover:bg-green-700 transition-colors shadow-sm"
            >
              Start Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 space-y-5">
      <header className="flex justify-between items-center pt-6 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="text-green-600" size={24} />
          <h2 className="text-xl text-gray-900">AI Analysis Hub</h2>
        </div>
        <div className="flex items-center gap-2">
          <SettingsButton />
          <NotificationCenter />
        </div>
      </header>

      <SoilAreaSelector value={areaId} onChange={setAreaId} />

      <div className="bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Check className="text-green-600" size={16} />
          <span className="text-gray-900 text-sm">Analyzing: {crop}</span>
        </div>
        <button
          onClick={() => setStarted(false)}
          className="text-green-600 text-xs hover:underline"
        >
          Change Zone
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
        <h3 className="text-gray-900 mb-1">Current vs Required</h3>
        <p className="text-gray-500 text-xs mb-4">
          Side-by-side comparison across all sensors
        </p>
        <ResponsiveContainer width="100%" height={220} key="comp-chart">
          <BarChart data={COMPARATIVE_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.8} key="cg" />
            <XAxis dataKey="sensor" stroke="#9CA3AF" key="x" />
            <YAxis stroke="#9CA3AF" key="y" />
            <Tooltip
              key="tt"
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                color: '#111827',
              }}
            />
            <Legend key="lg" wrapperStyle={{ color: '#374151', fontSize: 12 }} />
            <Bar dataKey="current" fill="#22C55E" radius={[6, 6, 0, 0]} key="b1" name="Current" />
            <Bar dataKey="required" fill="#86EFAC" radius={[6, 6, 0, 0]} key="b2" name="Required" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <button
        onClick={() => setShowReport(true)}
        className="w-full flex items-center justify-center gap-2 bg-green-600 rounded-xl py-4 hover:bg-green-700 transition-colors shadow-sm"
      >
        <Download className="text-white" size={20} />
        <span className="text-white">Download AI Analyzed Report</span>
      </button>

      {showReport && (
        <ReportTemplate
          type="ai"
          onClose={() => setShowReport(false)}
          zoneName={selectedArea.name}
          crop={crop}
        />
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <Bot className="text-green-600" size={18} />
          <h3 className="text-gray-900">AI Crop Assistant</h3>
        </div>
        <div className="px-5 py-4 space-y-3 max-h-72 overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}
            >
              {m.role === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="text-green-600" size={14} />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {m.text}
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="text-gray-500" size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="px-3 py-3 border-t border-gray-100 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your crops..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm placeholder-gray-400 outline-none focus:border-green-300"
          />
          <button
            onClick={sendMessage}
            className="p-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Send className="text-white" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}