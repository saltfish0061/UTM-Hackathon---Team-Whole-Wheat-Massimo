import { Check, X, Palette, Sparkles } from 'lucide-react';
import { useAppContext, THEMES, type ThemeId, type ThemeDefinition } from '../context/AppContext';
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerTitle,
  DrawerDescription,
} from './ui/drawer';

// ─── Decorative SVG patterns for special theme cards ──────────────────────────

function BotanicalPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
      viewBox="0 0 100 60"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <path d="M15 30 C12 20,5 16,8 8 C10 15,16 18,15 30Z M15 30 C18 20,25 16,22 8 C20 15,14 18,15 30Z" fill="#2D6A4F" />
      <path d="M50 25 C47 17,42 13,44 6 C46 12,51 15,50 25Z M50 25 C53 17,58 13,56 6 C54 12,49 15,50 25Z" fill="#40916C" />
      <path d="M82 35 C80 27,75 24,77 17 C79 23,83 26,82 35Z M82 35 C84 27,89 24,87 17 C85 23,81 26,82 35Z" fill="#52B788" />
      <circle cx="30" cy="48" r="2" fill="#74C69D" opacity="0.6" />
      <circle cx="65" cy="50" r="1.5" fill="#2D6A4F" opacity="0.5" />
      <circle cx="90" cy="15" r="1" fill="#40916C" opacity="0.5" />
    </svg>
  );
}

function HarvestPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
      viewBox="0 0 100 60"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Wheat stalks */}
      <line x1="20" y1="55" x2="20" y2="20" stroke="#D97706" strokeWidth="1" />
      <ellipse cx="20" cy="16" rx="3" ry="6" fill="#F59E0B" opacity="0.7" transform="rotate(-15 20 16)" />
      <ellipse cx="16" cy="24" rx="2" ry="4" fill="#FCD34D" opacity="0.6" transform="rotate(-30 16 24)" />
      <ellipse cx="24" cy="24" rx="2" ry="4" fill="#FCD34D" opacity="0.6" transform="rotate(30 24 24)" />
      <line x1="55" y1="55" x2="55" y2="25" stroke="#D97706" strokeWidth="1" />
      <ellipse cx="55" cy="21" rx="3" ry="6" fill="#F59E0B" opacity="0.5" transform="rotate(10 55 21)" />
      <ellipse cx="51" cy="30" rx="2" ry="4" fill="#FCD34D" opacity="0.5" transform="rotate(-25 51 30)" />
      <ellipse cx="59" cy="30" rx="2" ry="4" fill="#FCD34D" opacity="0.5" transform="rotate(25 59 30)" />
      {/* Dots */}
      <circle cx="80" cy="20" r="2" fill="#D97706" opacity="0.4" />
      <circle cx="90" cy="45" r="1.5" fill="#F59E0B" opacity="0.4" />
      <circle cx="35" cy="40" r="1" fill="#FCD34D" opacity="0.5" />
    </svg>
  );
}

function HydroponicPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
      viewBox="0 0 100 60"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Concentric circles / ripples */}
      <circle cx="20" cy="30" r="14" fill="none" stroke="#0284C7" strokeWidth="0.8" />
      <circle cx="20" cy="30" r="8"  fill="none" stroke="#0EA5E9" strokeWidth="0.6" />
      <circle cx="20" cy="30" r="3"  fill="#38BDF8" opacity="0.4" />
      <circle cx="70" cy="25" r="10" fill="none" stroke="#0284C7" strokeWidth="0.7" />
      <circle cx="70" cy="25" r="5"  fill="none" stroke="#0EA5E9" strokeWidth="0.5" />
      <circle cx="70" cy="25" r="2"  fill="#7DD3FC" opacity="0.4" />
      {/* Bubbles */}
      <circle cx="90" cy="48" r="3" fill="none" stroke="#38BDF8" strokeWidth="0.6" />
      <circle cx="45" cy="50" r="2" fill="none" stroke="#7DD3FC" strokeWidth="0.5" />
      <circle cx="5"  cy="10" r="4" fill="none" stroke="#0284C7" strokeWidth="0.6" />
    </svg>
  );
}

// ─── Theme Card ────────────────────────────────────────────────────────────────

function ThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: ThemeDefinition;
  isActive: boolean;
  onSelect: () => void;
}) {
  const isSpecial = theme.type === 'special';

  return (
    <button
      onClick={onSelect}
      className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-200 text-left w-full ${
        isActive
          ? 'border-primary shadow-md scale-[1.02]'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      style={{ backgroundColor: theme.preview.bg }}
    >
      {/* Decorative SVG pattern for special themes */}
      {theme.id === 'botanical-garden' && <BotanicalPattern />}
      {theme.id === 'harvest-gold' && <HarvestPattern />}
      {theme.id === 'hydroponic-blue' && <HydroponicPattern />}

      {/* Content */}
      <div className="relative z-10 p-3">
        {/* Header row */}
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            {isSpecial && theme.emoji && (
              <span className="text-base leading-none">{theme.emoji}</span>
            )}
            <span
              className="text-xs font-semibold leading-tight"
              style={{ color: theme.preview.text }}
            >
              {theme.name}
            </span>
          </div>
          {isActive && (
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: theme.preview.primary }}
            >
              <Check size={11} color="#fff" strokeWidth={3} />
            </span>
          )}
        </div>

        {/* Color swatch strip */}
        <div className="flex gap-1.5 mb-2">
          {/* Background chip */}
          <div
            className="flex-1 h-5 rounded-md border"
            style={{
              backgroundColor: theme.preview.bg,
              borderColor: theme.preview.primary + '40',
            }}
          />
          {/* Card chip */}
          <div
            className="flex-1 h-5 rounded-md border"
            style={{
              backgroundColor: theme.preview.card,
              borderColor: theme.preview.primary + '40',
            }}
          />
          {/* Primary chip */}
          <div
            className="h-5 w-8 rounded-md flex-shrink-0"
            style={{ backgroundColor: theme.preview.primary }}
          />
        </div>

        {/* Description */}
        <p
          className="text-[10px] leading-tight opacity-70"
          style={{ color: theme.preview.text }}
        >
          {theme.description}
        </p>
      </div>
    </button>
  );
}

// ─── Theme Switcher Sheet ──────────────────────────────────────────────────────

export function ThemeSwitcher() {
  const { theme, setTheme, isThemeSwitcherOpen, setThemeSwitcherOpen } = useAppContext();

  const basicThemes = THEMES.filter((t) => t.type === 'basic');
  const specialThemes = THEMES.filter((t) => t.type === 'special');

  const handleSelect = (id: ThemeId) => {
    setTheme(id);
    // Keep sheet open so user can see the preview
  };

  return (
    <Drawer
      open={isThemeSwitcherOpen}
      onOpenChange={setThemeSwitcherOpen}
      direction="bottom"
    >
      <DrawerContent className="max-h-[88vh] overflow-hidden flex flex-col">
        <DrawerTitle className="sr-only">App Theme</DrawerTitle>
        <DrawerDescription className="sr-only">
          Choose a theme to personalise your GreenStack experience.
        </DrawerDescription>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Palette size={16} color="white" />
            </div>
            <div>
              <h2 className="text-gray-900 text-base">App Theme</h2>
              <p className="text-gray-500 text-xs">Personalise your GreenStack</p>
            </div>
          </div>
          <DrawerClose asChild>
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X size={16} className="text-gray-600" />
            </button>
          </DrawerClose>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* ── Basic Themes ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Basic</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {basicThemes.map((t) => (
                <ThemeCard
                  key={t.id}
                  theme={t}
                  isActive={theme === t.id}
                  onSelect={() => handleSelect(t.id)}
                />
              ))}
            </div>
          </section>

          {/* ── Special Themes ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={12} style={{ color: 'var(--primary)' }} />
              <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                Special
              </span>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                Artistic
              </span>
            </div>
            <div className="space-y-3">
              {specialThemes.map((t) => (
                <ThemeCard
                  key={t.id}
                  theme={t}
                  isActive={theme === t.id}
                  onSelect={() => handleSelect(t.id)}
                />
              ))}
            </div>
          </section>

          {/* Active theme info banner */}
          {(() => {
            const active = THEMES.find((t) => t.id === theme);
            if (!active) return null;
            return (
              <div
                className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{
                  backgroundColor: active.preview.primary + '15',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: active.preview.primary + '30',
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: active.preview.primary }}
                />
                <div>
                  <p className="text-gray-900 text-xs">
                    Active: <span className="font-semibold">{active.name}</span>
                    {active.emoji && ` ${active.emoji}`}
                  </p>
                  <p className="text-gray-500 text-[10px] mt-0.5">
                    Theme saved — persists across sessions
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ─── Trigger Button (used in screen headers) ──────────────────────────────────

export function ThemeSwitcherButton({ className = '' }: { className?: string }) {
  const { setThemeSwitcherOpen } = useAppContext();
  return (
    <button
      onClick={() => setThemeSwitcherOpen(true)}
      className={`w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors ${className}`}
      aria-label="Change theme"
      title="Change theme"
    >
      <Palette size={17} className="text-gray-600" />
    </button>
  );
}
