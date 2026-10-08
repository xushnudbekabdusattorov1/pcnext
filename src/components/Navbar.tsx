import React from 'react';
import { 
  Cpu, 
  Sparkles, 
  Gamepad2, 
  Bookmark, 
  Sun, 
  Moon, 
  Layers,
  Film,
  Activity,
  Wrench
} from 'lucide-react';
import { Currency, Language } from '../types/hardware';
import { TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  activeTab: 'builder' | 'autobuild' | 'analysis' | 'benchmarks' | 'saved';
  setActiveTab: (tab: 'builder' | 'autobuild' | 'analysis' | 'benchmarks' | 'saved') => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  selectedCount: number;
  onOpenVideoAnimator?: () => void;
  onOpenAssemblyGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  language,
  setLanguage,
  isDark,
  setIsDark,
  selectedCount,
  onOpenVideoAnimator,
  onOpenAssemblyGuide,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('builder')}
          className="flex cursor-pointer items-center gap-3 transition-transform hover:scale-105"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/25">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-neutral-950">
              <Cpu className="h-5 w-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-xl font-black tracking-wider text-white">
                APEX<span className="text-cyan-400">PC</span>
              </span>
              <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold tracking-wider text-cyan-300 border border-cyan-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] font-medium text-neutral-400 tracking-wide">
              {t.brandTagline}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-neutral-900/80 p-1 border border-neutral-800">
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'builder'
                ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/25'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>{t.manualBuilder}</span>
            {selectedCount > 0 && (
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                activeTab === 'builder' ? 'bg-neutral-950 text-cyan-400' : 'bg-cyan-500/20 text-cyan-300'
              }`}>
                {selectedCount}/8
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('autobuild')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'autobuild'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/25'
                : 'text-neutral-400 hover:text-purple-300 hover:bg-neutral-800/60'
            }`}
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>{t.aiAutoBuild}</span>
            <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-mono text-purple-300 border border-purple-500/30">
              AI
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'analysis'
                ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/25 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>{t.buildAnalysis}</span>
            <span className={`rounded px-1.5 py-0.2 text-[9px] font-mono border ${
              activeTab === 'analysis'
                ? 'bg-neutral-950 text-cyan-400 border-neutral-900 font-bold'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
            }`}>
              AI
            </span>
          </button>

          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'benchmarks'
                ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/25'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Gamepad2 className="h-4 w-4" />
            <span>{t.fpsCalculator}</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'saved'
                ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/25'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>{t.savedBuilds}</span>
          </button>

          {onOpenAssemblyGuide && (
            <button
              onClick={onOpenAssemblyGuide}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold tracking-wide text-neutral-400 hover:text-cyan-300 hover:bg-neutral-800/60 transition-all cursor-pointer"
              title="Step-by-step physical PC assembly instructions & tool guide"
            >
              <Wrench className="h-4 w-4 text-cyan-400" />
              <span>{t.assemblyGuide || 'Assembly Guide'}</span>
            </button>
          )}

          {onOpenVideoAnimator && (
            <button
              onClick={onOpenVideoAnimator}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold tracking-wide text-neutral-400 hover:text-pink-300 hover:bg-neutral-800/60 transition-all"
              title="Animate photo of your PC setup using Veo"
            >
              <Film className="h-4 w-4 text-pink-400" />
              <span>Animate Setup</span>
              <span className="rounded bg-pink-500/20 px-1 py-0.2 text-[9px] font-mono text-pink-300 border border-pink-500/30">
                Veo
              </span>
            </button>
          )}
        </nav>

        {/* Controls: Currency, Language & Theme */}
        <div className="flex items-center gap-2">
          {/* Currency Toggle */}
          <div className="flex rounded-lg bg-neutral-900 border border-neutral-800 p-0.5">
            <button
              onClick={() => setCurrency('USD')}
              className={`rounded-md px-2 py-1 text-xs font-mono font-bold transition-all ${
                currency === 'USD'
                  ? 'bg-cyan-500 text-neutral-950'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              USD $
            </button>
            <button
              onClick={() => setCurrency('UZS')}
              className={`rounded-md px-2 py-1 text-xs font-mono font-bold transition-all ${
                currency === 'UZS'
                  ? 'bg-cyan-500 text-neutral-950'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              UZS so'm
            </button>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="appearance-none rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 outline-none hover:border-neutral-700 cursor-pointer"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="uz">🇺🇿 UZ</option>
              <option value="ru">🇷🇺 RU</option>
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-yellow-400 transition-colors"
          >
            {isDark ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="flex md:hidden border-t border-neutral-900 bg-neutral-950/95 px-2 py-1.5 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
            activeTab === 'builder' ? 'bg-cyan-500 text-neutral-950 font-bold' : 'text-neutral-400'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          {t.manualBuilder} ({selectedCount})
        </button>
        <button
          onClick={() => setActiveTab('autobuild')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
            activeTab === 'autobuild' ? 'bg-purple-600 text-white font-bold' : 'text-neutral-400'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {t.aiAutoBuild}
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
            activeTab === 'analysis' ? 'bg-cyan-500 text-neutral-950 font-bold' : 'text-neutral-400'
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          {t.buildAnalysis}
        </button>
        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
            activeTab === 'benchmarks' ? 'bg-cyan-500 text-neutral-950 font-bold' : 'text-neutral-400'
          }`}
        >
          <Gamepad2 className="h-3.5 w-3.5" />
          {t.fpsCalculator}
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
            activeTab === 'saved' ? 'bg-cyan-500 text-neutral-950 font-bold' : 'text-neutral-400'
          }`}
        >
          <Bookmark className="h-3.5 w-3.5" />
          {t.savedBuilds}
        </button>
        {onOpenAssemblyGuide && (
          <button
            onClick={onOpenAssemblyGuide}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:text-cyan-300"
          >
            <Wrench className="h-3.5 w-3.5 text-cyan-400" />
            {t.assemblyGuide || 'Assembly Guide'}
          </button>
        )}
      </div>
    </header>
  );
};
