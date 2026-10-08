import React, { useState } from 'react';
import { 
  Sparkles, 
  Gamepad2, 
  Briefcase, 
  Code, 
  Video, 
  Box, 
  Radio, 
  Check, 
  ArrowRight, 
  AlertTriangle,
  Zap,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';
import { 
  Currency, 
  Language, 
  BuildPurpose, 
  AIAutoBuildResponse, 
  AIBuildTier,
  PCBuild,
  HardwareComponent
} from '../types/hardware';
import { TRANSLATIONS } from '../data/translations';
import { COMPONENTS_CATALOG } from '../data/components';

interface AutoBuildViewProps {
  currency: Currency;
  language: Language;
  onApplyBuild: (build: PCBuild) => void;
  onClose?: () => void;
}

export const AutoBuildView: React.FC<AutoBuildViewProps> = ({
  currency,
  language,
  onApplyBuild,
}) => {
  const t = TRANSLATIONS[language];

  // Default budget based on currency
  const [budget, setBudget] = useState<number>(currency === 'USD' ? 1200 : 15000000);
  const [purpose, setPurpose] = useState<BuildPurpose>('gaming');
  const [wishes, setWishes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AIAutoBuildResponse | null>(null);
  const [activeTierIndex, setActiveTierIndex] = useState<number>(0);

  const purposeOptions: { id: BuildPurpose; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'gaming',
      label: t.purpose_gaming,
      desc: 'Optimized GPU budget share (45-50%) for maximum high-refresh frame rates',
      icon: <Gamepad2 className="h-5 w-5 text-cyan-400" />,
    },
    {
      id: 'programming',
      label: t.purpose_programming,
      desc: 'Strong multi-core CPU, fast PCIe 4.0 NVMe SSD & 32GB+ RAM for Docker & compilers',
      icon: <Code className="h-5 w-5 text-purple-400" />,
    },
    {
      id: 'video_editing',
      label: t.purpose_video_editing,
      desc: 'Fast NVMe cache, large VRAM GPU with NVENC/AV1 encoders & high memory bandwidth',
      icon: <Video className="h-5 w-5 text-pink-400" />,
    },
    {
      id: 'rendering_3d',
      label: t.purpose_rendering_3d,
      desc: 'CUDA cores, high VRAM GPU, 16+ CPU threads & robust liquid cooling',
      icon: <Box className="h-5 w-5 text-blue-400" />,
    },
    {
      id: 'streaming',
      label: t.purpose_streaming,
      desc: 'Extra CPU threads and dedicated GPU hardware encoder (NVENC) for zero-drop frames',
      icon: <Radio className="h-5 w-5 text-emerald-400" />,
    },
    {
      id: 'office',
      label: t.purpose_office,
      desc: 'Cost-efficient APU or quiet compact build for multi-tasking, web & office suite',
      icon: <Briefcase className="h-5 w-5 text-amber-400" />,
    },
  ];

  const quickBudgetsUsd = [600, 900, 1200, 1800, 2500, 3500];
  const quickBudgetsUzs = [7500000, 12000000, 16000000, 24000000, 35000000, 48000000];

  const quickPillWishes = [
    'RGB lighting & glass case',
    'Quiet operation (silent fans)',
    'White aesthetic theme',
    'Future upgradeability (AM5 socket)',
    'Maximum CS2 & Valorant FPS',
    'Compact form factor',
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/ai/auto-build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget,
          currency,
          purpose,
          wishes,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate build');
      }

      const data: AIAutoBuildResponse = await response.json();
      setResult(data);
      setActiveTierIndex(0);
    } catch (err) {
      console.error('Error generating AI build:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyTier = (tier: AIBuildTier) => {
    const newBuild: PCBuild = {};

    tier.components.forEach((c) => {
      // Find matching component in catalog by ID or fuzzy name match
      let match = COMPONENTS_CATALOG.find((item) => item.id === c.componentId);
      if (!match) {
        match = COMPONENTS_CATALOG.find(
          (item) => item.category === c.category && item.name.toLowerCase().includes(c.name.toLowerCase().slice(0, 8))
        );
      }
      if (!match) {
        match = COMPONENTS_CATALOG.find((item) => item.category === c.category);
      }

      if (match) {
        newBuild[c.category] = match as any;
      }
    });

    onApplyBuild(newBuild);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Hero header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/30 px-3.5 py-1 text-xs font-semibold text-purple-300">
          <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-spin" />
          <span>Next-Gen Neural PC Builder</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t.aiModalTitle}
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-neutral-400">
          {t.aiModalDesc}
        </p>
      </div>

      {/* Input Form Card */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
        {/* Budget Input & Presets */}
        <div>
          <label className="block font-heading text-sm font-bold text-neutral-200 uppercase tracking-wider mb-2">
            {t.yourBudget} ({currency})
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-neutral-500 text-lg">
                {currency === 'USD' ? '$' : 'UZS'}
              </span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value) || 0)}
                placeholder="Enter budget..."
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 py-3.5 pl-12 pr-4 font-mono text-xl font-bold text-cyan-400 outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-neutral-500 self-center mr-1">Quick Select:</span>
            {(currency === 'USD' ? quickBudgetsUsd : quickBudgetsUzs).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setBudget(val)}
                className={`rounded-lg px-2.5 py-1 text-xs font-mono font-semibold transition-all border ${
                  budget === val
                    ? 'bg-cyan-500 text-neutral-950 border-cyan-400'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                }`}
              >
                {currency === 'USD' ? `$${val}` : `${(val / 1000000).toFixed(1)}M UZS`}
              </button>
            ))}
          </div>
        </div>

        {/* Purpose Cards */}
        <div>
          <label className="block font-heading text-sm font-bold text-neutral-200 uppercase tracking-wider mb-2">
            {t.purposeLabel}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {purposeOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPurpose(opt.id)}
                className={`flex flex-col text-left rounded-xl p-3.5 border transition-all ${
                  purpose === opt.id
                    ? 'bg-purple-950/30 border-purple-500 text-white shadow-lg shadow-purple-500/15'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2.5 font-heading text-sm font-bold text-white mb-1">
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-snug">
                  {opt.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Extra Wishes / Preferences */}
        <div>
          <label className="block font-heading text-sm font-bold text-neutral-200 uppercase tracking-wider mb-2">
            {t.extraWishes}
          </label>
          <input
            type="text"
            value={wishes}
            onChange={(e) => setWishes(e.target.value)}
            placeholder={t.extraWishesPlaceholder}
            className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-purple-500 transition-colors"
          />

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {quickPillWishes.map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => setWishes(wishes ? `${wishes}, ${pill}` : pill)}
                className="rounded-full bg-neutral-950 border border-neutral-800 px-2.5 py-1 text-[11px] text-neutral-400 hover:border-purple-500 hover:text-purple-300 transition-colors"
              >
                + {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || budget <= 0}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-xl shadow-purple-500/25 hover:from-purple-500 hover:to-cyan-400 disabled:opacity-50 transition-all cursor-pointer hover:scale-[1.01]"
          >
            <Sparkles className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? t.generatingButton : t.generateButton}</span>
          </button>
        </div>
      </div>

      {/* Results Display */}
      {result && result.tiers && result.tiers.length > 0 && (
        <div className="space-y-6 pt-4">
          {/* Advice & Budget Alert */}
          {result.isBudgetTight && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 text-xs text-amber-300 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-bold">{t.budgetLowAlert}</strong>
                <p className="mt-1 text-neutral-300">{result.advice}</p>
              </div>
            </div>
          )}

          {/* Tier Selector Pills */}
          <div className="flex gap-2 border-b border-neutral-800 pb-2">
            {result.tiers.map((tier, idx) => (
              <button
                key={tier.tierName}
                onClick={() => setActiveTierIndex(idx)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all border ${
                  activeTierIndex === idx
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg shadow-purple-500/20'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <span>
                  {tier.tierName === 'Budget'
                    ? t.tierBudget
                    : tier.tierName === 'Balanced'
                    ? t.tierBalanced
                    : t.tierHighEnd}
                </span>
                <span className="font-mono text-[11px] opacity-90">
                  {currency === 'USD'
                    ? `$${tier.totalPriceUsd.toLocaleString()}`
                    : `${tier.totalPriceUzs.toLocaleString()} UZS`}
                </span>
              </button>
            ))}
          </div>

          {/* Active Tier Card */}
          {(() => {
            const currentTier = result.tiers[activeTierIndex] || result.tiers[0];

            return (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8 space-y-6 shadow-2xl">
                {/* Tier Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-purple-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-purple-300 border border-purple-500/30">
                        {currentTier.tierName} Tier
                      </span>
                      <h3 className="font-heading text-xl font-bold text-white">
                        {currentTier.summary}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[11px] text-neutral-400 block">{t.totalPrice}</span>
                      <span className="font-mono text-2xl font-black text-cyan-400">
                        {currency === 'USD'
                          ? `$${currentTier.totalPriceUsd.toLocaleString()}`
                          : `${currentTier.totalPriceUzs.toLocaleString()} UZS`}
                      </span>
                    </div>

                    <button
                      onClick={() => applyTier(currentTier)}
                      className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-neutral-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition-all cursor-pointer hover:scale-105"
                    >
                      <Check className="h-4 w-4" />
                      <span>{t.applyTierToBuild}</span>
                    </button>
                  </div>
                </div>

                {/* Component Breakdown Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-500 uppercase tracking-wider font-mono">
                        <th className="pb-3 font-semibold">Category</th>
                        <th className="pb-3 font-semibold">Selected Component</th>
                        <th className="pb-3 font-semibold">{t.whyThisPart}</th>
                        <th className="pb-3 font-semibold text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {currentTier.components.map((comp, idx) => (
                        <tr key={idx} className="hover:bg-neutral-950/40 transition-colors">
                          <td className="py-3 font-mono font-bold text-cyan-400 uppercase text-[11px]">
                            {comp.category}
                          </td>
                          <td className="py-3 font-semibold text-white">
                            {comp.name}
                          </td>
                          <td className="py-3 text-neutral-400 max-w-xs">
                            {comp.reason}
                          </td>
                          <td className="py-3 font-mono font-bold text-neutral-200 text-right">
                            {currency === 'USD'
                              ? `$${comp.priceUsd.toLocaleString()}`
                              : `${comp.priceUzs.toLocaleString()} UZS`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pros and Cons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/20 p-4">
                    <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                      ✓ {t.pros}
                    </h4>
                    <ul className="space-y-1 text-xs text-neutral-300">
                      {currentTier.pros?.map((pro, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-amber-950/20 border border-amber-500/20 p-4">
                    <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                      ⚠ {t.cons}
                    </h4>
                    <ul className="space-y-1 text-xs text-neutral-300">
                      {currentTier.cons?.map((con, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* FPS Estimates for this Tier */}
                {currentTier.fpsEstimate && currentTier.fpsEstimate.length > 0 && (
                  <div className="rounded-xl bg-neutral-950 p-4 border border-neutral-800">
                    <div className="text-xs font-heading font-bold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Gamepad2 className="h-4 w-4 text-cyan-400" />
                      Estimated FPS in Popular Titles (Ultra Settings)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {currentTier.fpsEstimate.map((game, i) => (
                        <div key={i} className="rounded-lg bg-neutral-900/90 p-3 border border-neutral-800 text-center">
                          <span className="text-[11px] text-neutral-400 block truncate">{game.game}</span>
                          <span className="font-mono text-base font-bold text-cyan-400 block mt-1">
                            {game.fps1080p} FPS
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            1440p: {game.fps1440p} FPS
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
