import React, { useState } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  Check, 
  Zap, 
  TrendingDown, 
  TrendingUp, 
  Gamepad2, 
  Scale, 
  Cpu, 
  Layers, 
  MemoryStick, 
  Tv2, 
  HardDrive, 
  Box, 
  Fan, 
  Download, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { SavedBuild, Currency, Language, PCBuild, ComponentCategory } from '../types/hardware';
import { calculateTotalPrice, checkCompatibility } from '../utils/compatibility';
import { estimateGameFps, calculateBottleneck } from '../utils/benchmarks';
import { TRANSLATIONS } from '../data/translations';

interface CompareBuildsModalProps {
  builds: SavedBuild[];
  initialBuildId1: string;
  initialBuildId2: string;
  currency: Currency;
  language: Language;
  onClose: () => void;
  onLoadBuild: (build: PCBuild) => void;
}

export const CompareBuildsModal: React.FC<CompareBuildsModalProps> = ({
  builds,
  initialBuildId1,
  initialBuildId2,
  currency,
  language,
  onClose,
  onLoadBuild,
}) => {
  const t = TRANSLATIONS[language];

  const [buildId1, setBuildId1] = useState<string>(initialBuildId1);
  const [buildId2, setBuildId2] = useState<string>(initialBuildId2);

  const build1 = builds.find((b) => b.id === buildId1) || builds[0];
  const build2 = builds.find((b) => b.id === buildId2) || builds[1] || builds[0];

  const price1 = calculateTotalPrice(build1.build);
  const price2 = calculateTotalPrice(build2.build);

  const compat1 = checkCompatibility(build1.build);
  const compat2 = checkCompatibility(build2.build);

  const fps1 = estimateGameFps(build1.build);
  const fps2 = estimateGameFps(build2.build);

  const bottleneck1 = calculateBottleneck(build1.build);
  const bottleneck2 = calculateBottleneck(build2.build);

  const currentPrice1 = currency === 'USD' ? price1.usd : price1.uzs;
  const currentPrice2 = currency === 'USD' ? price2.usd : price2.uzs;
  const priceDiff = currentPrice2 - currentPrice1;
  const percentDiff = currentPrice1 > 0 ? Math.round((Math.abs(priceDiff) / currentPrice1) * 100) : 0;

  const categories: { key: ComponentCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'cpu', label: t.cat_cpu, icon: <Cpu className="h-4 w-4" /> },
    { key: 'motherboard', label: t.cat_motherboard, icon: <Layers className="h-4 w-4" /> },
    { key: 'ram', label: t.cat_ram, icon: <MemoryStick className="h-4 w-4" /> },
    { key: 'gpu', label: t.cat_gpu, icon: <Tv2 className="h-4 w-4" /> },
    { key: 'storage', label: t.cat_storage, icon: <HardDrive className="h-4 w-4" /> },
    { key: 'psu', label: t.cat_psu, icon: <Zap className="h-4 w-4" /> },
    { key: 'case', label: t.cat_case, icon: <Box className="h-4 w-4" /> },
    { key: 'cooler', label: t.cat_cooler, icon: <Fan className="h-4 w-4" /> },
  ];

  const formatPrice = (usd: number, uzs: number) => {
    return currency === 'USD' ? `$${usd.toLocaleString()}` : `${uzs.toLocaleString()} UZS`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-5 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-6xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 text-neutral-950 shadow-md">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>Side-by-Side PC Build Comparison</span>
                <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-500/30">
                  Head-to-Head
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Detailed specs, price difference, power draw, and FPS comparison
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Top Comparison Cards with Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Build 1 Header Card */}
            <div className="rounded-2xl border border-cyan-500/30 bg-neutral-950/70 p-5 space-y-4 shadow-lg">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1">
                    Build #1 Selection
                  </div>
                  <select
                    value={buildId1}
                    onChange={(e) => setBuildId1(e.target.value)}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm font-bold text-white outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {builds.map((b) => (
                      <option key={b.id} value={b.id} disabled={b.id === buildId2}>
                        {b.name} ({formatPrice(calculateTotalPrice(b.build).usd, calculateTotalPrice(b.build).uzs)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags & Summary */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(build1.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-semibold text-cyan-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-mono">Total Cost</div>
                  <div className="font-mono text-2xl font-black text-cyan-400">
                    {formatPrice(price1.usd, price1.uzs)}
                  </div>
                </div>

                <button
                  onClick={() => {
                    onLoadBuild(build1.build);
                    onClose();
                  }}
                  className="rounded-xl bg-cyan-500 px-3.5 py-2 text-xs font-bold text-neutral-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  Load this Build
                </button>
              </div>
            </div>

            {/* Build 2 Header Card */}
            <div className="rounded-2xl border border-purple-500/30 bg-neutral-950/70 p-5 space-y-4 shadow-lg">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider mb-1">
                    Build #2 Selection
                  </div>
                  <select
                    value={buildId2}
                    onChange={(e) => setBuildId2(e.target.value)}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm font-bold text-white outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {builds.map((b) => (
                      <option key={b.id} value={b.id} disabled={b.id === buildId1}>
                        {b.name} ({formatPrice(calculateTotalPrice(b.build).usd, calculateTotalPrice(b.build).uzs)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags & Summary */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(build2.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 text-[10px] font-semibold text-purple-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-mono">Total Cost</div>
                  <div className="font-mono text-2xl font-black text-purple-400">
                    {formatPrice(price2.usd, price2.uzs)}
                  </div>
                </div>

                <button
                  onClick={() => {
                    onLoadBuild(build2.build);
                    onClose();
                  }}
                  className="rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-purple-500 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                >
                  Load this Build
                </button>
              </div>
            </div>
          </div>

          {/* Price Difference Indicator Banner */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-cyan-400" />
              <span className="font-bold text-white">Cost Difference Analysis:</span>
            </div>
            <div className="flex items-center gap-3">
              {priceDiff === 0 ? (
                <span className="rounded-full bg-neutral-800 px-3 py-1 font-mono font-bold text-neutral-300">
                  Exact Identical Total Cost
                </span>
              ) : priceDiff > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-neutral-300">
                    "{build1.name}" is
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 font-mono font-bold text-emerald-400">
                    <TrendingDown className="h-3 w-3" />
                    {currency === 'USD' ? `$${Math.abs(priceDiff).toLocaleString()}` : `${Math.abs(priceDiff).toLocaleString()} UZS`} ({percentDiff}%) cheaper
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-neutral-300">
                    "{build2.name}" is
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 font-mono font-bold text-emerald-400">
                    <TrendingDown className="h-3 w-3" />
                    {currency === 'USD' ? `$${Math.abs(priceDiff).toLocaleString()}` : `${Math.abs(priceDiff).toLocaleString()} UZS`} ({percentDiff}%) cheaper
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Side-by-Side Component Comparison Table */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 overflow-hidden">
            <div className="border-b border-neutral-800 bg-neutral-950 px-5 py-3">
              <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                Component-by-Component Specifications
              </h3>
            </div>

            <div className="divide-y divide-neutral-800/80">
              {categories.map((cat) => {
                const comp1 = build1.build[cat.key];
                const comp2 = build2.build[cat.key];
                const isIdentical = comp1?.id === comp2?.id;

                return (
                  <div
                    key={cat.key}
                    className="p-4 hover:bg-neutral-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                      <span className="text-cyan-400">{cat.icon}</span>
                      <span>{cat.label}</span>
                      {isIdentical && comp1 && (
                        <span className="rounded bg-neutral-800 px-1.5 py-0.2 text-[9px] font-mono text-neutral-400 lowercase">
                          identical part
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Build 1 Component Column */}
                      <div className={`rounded-xl border p-3 flex items-start gap-3 ${
                        comp1
                          ? 'border-neutral-800 bg-neutral-900/60'
                          : 'border-dashed border-neutral-800 bg-neutral-950/40'
                      }`}>
                        {comp1 ? (
                          <>
                            <img
                              src={comp1.image}
                              alt={comp1.name}
                              className="h-12 w-12 rounded-lg object-cover bg-neutral-950 border border-neutral-800 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-heading text-xs font-bold text-white truncate">
                                {comp1.name}
                              </div>
                              <div className="text-[11px] text-neutral-400 mt-0.5">
                                {comp1.brand} • {comp1.tdp}W TDP
                              </div>
                              <div className="font-mono text-xs font-bold text-cyan-400 mt-1">
                                {formatPrice(comp1.priceUsd, comp1.priceUzs)}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-neutral-500 italic py-2">
                            Slot empty (Not chosen)
                          </div>
                        )}
                      </div>

                      {/* Build 2 Component Column */}
                      <div className={`rounded-xl border p-3 flex items-start gap-3 ${
                        comp2
                          ? 'border-neutral-800 bg-neutral-900/60'
                          : 'border-dashed border-neutral-800 bg-neutral-950/40'
                      }`}>
                        {comp2 ? (
                          <>
                            <img
                              src={comp2.image}
                              alt={comp2.name}
                              className="h-12 w-12 rounded-lg object-cover bg-neutral-950 border border-neutral-800 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-heading text-xs font-bold text-white truncate">
                                {comp2.name}
                              </div>
                              <div className="text-[11px] text-neutral-400 mt-0.5">
                                {comp2.brand} • {comp2.tdp}W TDP
                              </div>
                              <div className="font-mono text-xs font-bold text-purple-400 mt-1">
                                {formatPrice(comp2.priceUsd, comp2.priceUzs)}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-neutral-500 italic py-2">
                            Slot empty (Not chosen)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gaming Performance Comparison (FPS Benchmarks) */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-cyan-400" />
                <span>Estimated Gaming FPS Comparison (1080p Ultra)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {['cs2', 'cyberpunk', 'fortnite', 'valorant', 'warzone', 'gta'].map((gameId) => {
                const g1 = fps1.find((g) => g.id === gameId);
                const g2 = fps2.find((g) => g.id === gameId);

                if (!g1 || !g2) return null;

                const diffFps = g2.fps1080p - g1.fps1080p;

                return (
                  <div
                    key={gameId}
                    className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-3.5 space-y-2"
                  >
                    <div className="font-heading text-xs font-bold text-white truncate">
                      {g1.name}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                      <div className="rounded-lg bg-neutral-950 p-2 border border-cyan-500/20">
                        <span className="text-[10px] text-neutral-400 block truncate">Build 1</span>
                        <span className="font-bold text-cyan-400 text-sm">{g1.fps1080p} FPS</span>
                      </div>
                      <div className="rounded-lg bg-neutral-950 p-2 border border-purple-500/20">
                        <span className="text-[10px] text-neutral-400 block truncate">Build 2</span>
                        <span className="font-bold text-purple-400 text-sm">{g2.fps1080p} FPS</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-neutral-400 text-center font-mono">
                      {diffFps === 0 ? (
                        <span>Equal performance</span>
                      ) : diffFps > 0 ? (
                        <span className="text-purple-400 font-semibold">Build 2 is +{diffFps} FPS faster</span>
                      ) : (
                        <span className="text-cyan-400 font-semibold">Build 1 is +{Math.abs(diffFps)} FPS faster</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Power & Hardware Synergy Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 space-y-2 text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-400" />
                <span>Build #1 Power & Synergy:</span>
              </span>
              <p className="text-neutral-400">
                Peak Load: <strong className="text-white font-mono">{compat1.totalTdp}W</strong> • Recommended PSU: <strong className="text-cyan-400 font-mono">{compat1.recommendedPsu}W</strong>
              </p>
              <p className="text-neutral-400">
                Hardware Balance: <span className="text-neutral-200">{bottleneck1.explanation}</span>
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 space-y-2 text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-400" />
                <span>Build #2 Power & Synergy:</span>
              </span>
              <p className="text-neutral-400">
                Peak Load: <strong className="text-white font-mono">{compat2.totalTdp}W</strong> • Recommended PSU: <strong className="text-purple-400 font-mono">{compat2.recommendedPsu}W</strong>
              </p>
              <p className="text-neutral-400">
                Hardware Balance: <span className="text-neutral-200">{bottleneck2.explanation}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-950/90 px-6 py-4 shrink-0">
          <div className="text-xs text-neutral-400 font-mono hidden sm:block">
            ApexPC Hardware Comparison Engine
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
