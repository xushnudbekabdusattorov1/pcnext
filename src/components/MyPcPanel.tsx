import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertOctagon, 
  Trash2, 
  Download, 
  Share2, 
  BookmarkPlus, 
  Zap, 
  Sparkles, 
  Gamepad2, 
  ChevronDown, 
  ChevronUp,
  Wrench,
  Cpu, 
  Layers, 
  MemoryStick, 
  Tv2, 
  HardDrive, 
  Box, 
  Fan
} from 'lucide-react';
import { 
  PCBuild, 
  ComponentCategory, 
  Currency, 
  Language, 
  CompatibilityStatus 
} from '../types/hardware';
import { calculateTotalPrice } from '../utils/compatibility';
import { TRANSLATIONS } from '../data/translations';
import { estimateGameFps } from '../utils/benchmarks';

interface MyPcPanelProps {
  build: PCBuild;
  onRemoveCategory: (category: ComponentCategory) => void;
  onClearBuild: () => void;
  currency: Currency;
  language: Language;
  compatibility: CompatibilityStatus;
  onExportPdf: () => void;
  onShareLink: () => void;
  onShareDiscord?: () => void;
  onOpenAssemblyGuide?: () => void;
  onSaveBuild: () => void;
  onOpenBenchmarks: () => void;
  onOpenAutoBuild: () => void;
  onOpenAnalysis?: () => void;
}

export const MyPcPanel: React.FC<MyPcPanelProps> = ({
  build,
  onRemoveCategory,
  onClearBuild,
  currency,
  language,
  compatibility,
  onExportPdf,
  onShareLink,
  onShareDiscord,
  onOpenAssemblyGuide,
  onSaveBuild,
  onOpenBenchmarks,
  onOpenAutoBuild,
  onOpenAnalysis,
}) => {
  const t = TRANSLATIONS[language];
  const [showIssues, setShowIssues] = useState(true);
  const { usd, uzs } = calculateTotalPrice(build);

  const totalPriceFormatted = currency === 'USD'
    ? `$${usd.toLocaleString()}`
    : `${uzs.toLocaleString()} UZS`;

  const categories: { key: ComponentCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'cpu', label: t.cat_cpu, icon: <Cpu className="h-3.5 w-3.5" /> },
    { key: 'motherboard', label: t.cat_motherboard, icon: <Layers className="h-3.5 w-3.5" /> },
    { key: 'ram', label: t.cat_ram, icon: <MemoryStick className="h-3.5 w-3.5" /> },
    { key: 'gpu', label: t.cat_gpu, icon: <Tv2 className="h-3.5 w-3.5" /> },
    { key: 'storage', label: t.cat_storage, icon: <HardDrive className="h-3.5 w-3.5" /> },
    { key: 'psu', label: t.cat_psu, icon: <Zap className="h-3.5 w-3.5" /> },
    { key: 'case', label: t.cat_case, icon: <Box className="h-3.5 w-3.5" /> },
    { key: 'cooler', label: t.cat_cooler, icon: <Fan className="h-3.5 w-3.5" /> },
  ];

  const selectedCount = Object.values(build).filter(Boolean).length;
  const psuWattage = build.psu?.wattage || 0;
  const powerUsagePercent = psuWattage > 0 
    ? Math.min(Math.round((compatibility.totalTdp / psuWattage) * 100), 100) 
    : 0;

  const benchmarks = estimateGameFps(build);
  const cs2Fps = benchmarks.find((b) => b.id === 'cs2')?.fps1080p || 0;
  const cyberpunkFps = benchmarks.find((b) => b.id === 'cyberpunk')?.fps1080p || 0;

  return (
    <aside className="w-full lg:w-96 shrink-0 space-y-4">
      {/* Main Panel Box */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4 sm:p-5 backdrop-blur-md shadow-2xl">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-white tracking-wide">
              {t.myPc}
            </h2>
            <p className="text-xs text-neutral-400 font-mono">
              {selectedCount} of 8 components selected
            </p>
          </div>

          {selectedCount > 0 && (
            <button
              onClick={onClearBuild}
              title={t.clearBuild}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t.clearBuild}</span>
            </button>
          )}
        </div>

        {/* Compatibility Status Banner */}
        <div className="mt-4">
          <div
            className={`flex items-center justify-between rounded-xl p-3 border cursor-pointer transition-all ${
              compatibility.isCompatible
                ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
                : 'border-red-500/40 bg-red-950/30 text-red-400'
            }`}
            onClick={() => setShowIssues(!showIssues)}
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              {compatibility.isCompatible ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{t.fullyCompatible}</span>
                </>
              ) : (
                <>
                  <AlertOctagon className="h-4 w-4 text-red-400 shrink-0 animate-pulse" />
                  <span>{compatibility.issues.length} {t.issuesDetected}</span>
                </>
              )}
            </div>

            {compatibility.issues.length > 0 && (
              <button className="text-neutral-400 hover:text-white">
                {showIssues ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
          </div>

          {/* Compatibility Issues Details Accordion */}
          {!compatibility.isCompatible && showIssues && (
            <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {compatibility.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-red-950/40 border border-red-500/30 p-2 text-[11px] text-red-300 leading-snug"
                >
                  <p className="font-bold text-white mb-0.5">• {issue.title}</p>
                  <p className="text-neutral-300">{issue.message}</p>
                  {issue.suggestion && (
                    <p className="mt-1 text-cyan-400 font-medium">
                      Fix: {issue.suggestion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price & Power Summary */}
        <div className="mt-4 rounded-xl bg-neutral-950/70 p-3.5 border border-neutral-800 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-neutral-400">{t.totalPrice}</span>
            <span className="font-mono text-2xl font-black text-cyan-400">
              {totalPriceFormatted}
            </span>
          </div>

          {/* Power Consumption Gauge */}
          <div className="border-t border-neutral-800/80 pt-2.5">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-neutral-400 flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-400" />
                {t.estimatedPower}: <strong className="text-white font-mono">{compatibility.totalTdp}W</strong>
              </span>
              <span className="text-neutral-400">
                {t.recommendedPsu}: <strong className="text-cyan-400 font-mono">{compatibility.recommendedPsu}W</strong>
              </span>
            </div>

            {psuWattage > 0 ? (
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      powerUsagePercent > 85 ? 'bg-red-500' : powerUsagePercent > 70 ? 'bg-yellow-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${powerUsagePercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                  <span>Load: {powerUsagePercent}% of {psuWattage}W PSU</span>
                  <span>Headroom: {Math.max(psuWattage - compatibility.totalTdp, 0)}W</span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-amber-400/90">
                Select a PSU to calculate power headroom.
              </p>
            )}
          </div>
        </div>

        {/* Component Slots */}
        <div className="mt-4 space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {categories.map((cat) => {
            const component = build[cat.key];

            return (
              <div
                key={cat.key}
                className={`rounded-xl border p-2.5 transition-all text-xs ${
                  component
                    ? 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-700'
                    : 'border-dashed border-neutral-800 bg-neutral-950/20 text-neutral-500'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {component ? (
                      <img
                        src={component.image}
                        alt={component.name}
                        className="h-9 w-9 rounded-lg object-cover bg-neutral-900 border border-neutral-800 shrink-0"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-neutral-500 shrink-0 border border-neutral-800">
                        {cat.icon}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                        {cat.label}
                      </div>
                      {component ? (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                              component.stockStatus === 'limited' || component.stockStatus === 'low_stock'
                                ? 'bg-amber-400 animate-pulse'
                                : 'bg-emerald-400'
                            }`}
                            title={
                              component.stockStatus === 'limited' || component.stockStatus === 'low_stock'
                                ? `Limited stock (${component.stockCount || 3} left)`
                                : `In stock (${component.stockCount || 15} available)`
                            }
                          />
                          <span className="truncate font-medium text-white text-xs">
                            {component.name}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-neutral-600 italic">
                          Slot empty
                        </div>
                      )}
                    </div>
                  </div>

                  {component && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {currency === 'USD'
                          ? `$${component.priceUsd}`
                          : `${component.priceUzs.toLocaleString()}`}
                      </span>
                      <button
                        onClick={() => onRemoveCategory(cat.key)}
                        className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-red-400 transition-colors"
                        title={t.removeComponent}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick FPS preview widget */}
        {build.gpu && (
          <div 
            onClick={onOpenBenchmarks}
            className="mt-4 cursor-pointer rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/20 p-3 hover:border-cyan-500/40 transition-all group"
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <Gamepad2 className="h-3.5 w-3.5 text-cyan-400" />
                Est. Gaming Performance (1080p)
              </span>
              <span className="text-[10px] text-cyan-400 group-hover:underline">
                View All →
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
              <div className="rounded-lg bg-neutral-950/80 p-1.5 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">CS2</span>
                <span className="font-bold text-emerald-400">{cs2Fps} FPS</span>
              </div>
              <div className="rounded-lg bg-neutral-950/80 p-1.5 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Cyberpunk</span>
                <span className="font-bold text-cyan-400">{cyberpunkFps} FPS</span>
              </div>
            </div>
          </div>
        )}

        {/* Assembly Guide Callout */}
        {selectedCount > 0 && onOpenAssemblyGuide && (
          <div
            onClick={onOpenAssemblyGuide}
            className="mt-3 cursor-pointer rounded-xl bg-gradient-to-r from-cyan-950/40 via-neutral-900 to-blue-950/40 border border-cyan-500/30 p-2.5 hover:border-cyan-500/60 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Wrench className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{t.assemblyGuide || 'Assembly Guide'}</span>
                  <span className="rounded bg-cyan-500/20 px-1 py-0.2 text-[9px] font-mono text-cyan-300">Manual</span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  Step-by-step physical build sequence & tools
                </div>
              </div>
            </div>
            <span className="text-xs text-cyan-400 group-hover:translate-x-0.5 transition-transform font-bold pr-1">→</span>
          </div>
        )}

        {/* Quick Build Analysis Callout */}
        {selectedCount > 0 && onOpenAnalysis && (
          <div
            onClick={onOpenAnalysis}
            className="mt-3 cursor-pointer rounded-xl bg-gradient-to-r from-purple-950/40 via-neutral-900 to-cyan-950/40 border border-purple-500/30 p-2.5 hover:border-purple-500/60 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>AI Build Analysis</span>
                  <span className="rounded bg-purple-500/20 px-1 py-0.2 text-[9px] font-mono text-purple-300">Gemini</span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  Inspect strengths, weaknesses & upgrades
                </div>
              </div>
            </div>
            <span className="text-xs text-purple-400 group-hover:translate-x-0.5 transition-transform font-bold pr-1">→</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-3 gap-1.5 pt-2 border-t border-neutral-800">
          <button
            onClick={onExportPdf}
            disabled={selectedCount === 0}
            className="flex items-center justify-center gap-1 rounded-xl bg-neutral-800 px-2 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
            title={t.exportPdf}
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span className="truncate">{t.exportPdf}</span>
          </button>

          <button
            onClick={onShareLink}
            disabled={selectedCount === 0}
            className="flex items-center justify-center gap-1 rounded-xl bg-neutral-800 px-2 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
            title={t.shareLink}
          >
            <Share2 className="h-3.5 w-3.5 text-cyan-400" />
            <span className="truncate">{t.shareLink}</span>
          </button>

          {onShareDiscord && (
            <button
              onClick={onShareDiscord}
              disabled={selectedCount === 0}
              className="flex items-center justify-center gap-1 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/30 px-2 py-2 text-xs font-semibold text-[#5865F2] hover:bg-[#5865F2] hover:text-white disabled:opacity-50 transition-all cursor-pointer"
              title="Share Build to Discord Server via Webhook"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span className="truncate">{t.shareDiscord}</span>
            </button>
          )}

          <button
            onClick={onSaveBuild}
            disabled={selectedCount === 0}
            className="col-span-3 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2.5 text-xs font-bold text-neutral-950 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
          >
            <BookmarkPlus className="h-4 w-4" />
            <span>{t.saveBuild}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
