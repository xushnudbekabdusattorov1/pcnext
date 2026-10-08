import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw, 
  Cpu, 
  Layers, 
  Zap, 
  Clock, 
  Target, 
  ArrowRight, 
  CheckCircle2, 
  Award, 
  SlidersHorizontal,
  BookmarkPlus,
  Download,
  Wrench,
  Flame
} from 'lucide-react';
import { PCBuild, Currency, Language, BuildAnalysisReport } from '../types/hardware';
import { calculateTotalPrice, checkCompatibility } from '../utils/compatibility';
import { TRANSLATIONS } from '../data/translations';
import { CompatibilityStressTest } from './CompatibilityStressTest';

interface BuildAnalysisViewProps {
  build: PCBuild;
  currency: Currency;
  language: Language;
  onSwitchToBuilder: () => void;
  onOpenAutoBuild: () => void;
  onSaveBuild: () => void;
  onExportPdf: () => void;
  onShareDiscord?: () => void;
  onOpenAssemblyGuide?: () => void;
}

export const BuildAnalysisView: React.FC<BuildAnalysisViewProps> = ({
  build,
  currency,
  language,
  onSwitchToBuilder,
  onOpenAutoBuild,
  onSaveBuild,
  onExportPdf,
  onShareDiscord,
  onOpenAssemblyGuide,
}) => {
  const t = TRANSLATIONS[language];
  const [report, setReport] = useState<BuildAnalysisReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'combined' | 'stress' | 'report'>('combined');

  const selectedCount = Object.values(build).filter(Boolean).length;
  const { usd, uzs } = calculateTotalPrice(build);
  const compatibility = checkCompatibility(build);

  const formatPrice = (usdVal: number, uzsVal: number) => {
    return currency === 'USD' ? `$${usdVal.toLocaleString()}` : `${uzsVal.toLocaleString()} UZS`;
  };

  const runAnalysis = async () => {
    if (selectedCount === 0) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/analyze-build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          build,
          currency,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate build analysis.');
      }

      const data: BuildAnalysisReport = await res.json();
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error communicating with AI analysis engine.');
    } finally {
      setLoading(false);
    }
  };

  // Run automatically when component mounts if build has parts
  useEffect(() => {
    if (selectedCount > 0 && !report) {
      runAnalysis();
    }
  }, [build]);

  // Empty state if user has no components selected
  if (selectedCount === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4 animate-in fade-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-purple-400">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-white">
          No Components in Active Workbench
        </h2>
        <p className="text-xs text-neutral-400 max-w-md mx-auto">
          To generate an architectural summary with strengths, weaknesses, and upgrade roadmaps, select your components first or generate a configuration using the AI Auto-Builder.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onSwitchToBuilder}
            className="rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-neutral-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            Go to Manual Builder
          </button>
          <button
            onClick={onOpenAutoBuild}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-xs font-bold text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
          >
            Launch AI Auto-Build
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-0.5 text-xs font-semibold text-cyan-300 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
            <span>Gemini Neural Hardware Diagnostic</span>
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight">
            PC Build Analysis & Architecture Report
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Comprehensive breakdown of your active computer configuration's strengths, weaknesses, and upgrade paths.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-neutral-800 border border-neutral-700 px-3.5 py-2.5 text-xs font-bold text-neutral-200 hover:text-white hover:bg-neutral-700 disabled:opacity-50 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing...' : 'Re-Analyze'}</span>
          </button>

          {onOpenAssemblyGuide && (
            <button
              onClick={onOpenAssemblyGuide}
              className="flex items-center gap-1.5 rounded-xl bg-neutral-800 border border-neutral-700 px-3.5 py-2.5 text-xs font-bold text-neutral-200 hover:text-cyan-300 hover:bg-neutral-700 transition-all cursor-pointer"
              title="Physical assembly manual & tool checklist"
            >
              <Wrench className="h-3.5 w-3.5 text-cyan-400" />
              <span>Assembly Guide</span>
            </button>
          )}

          {onShareDiscord && (
            <button
              onClick={onShareDiscord}
              className="flex items-center gap-1.5 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/30 px-3.5 py-2.5 text-xs font-bold text-[#5865F2] hover:bg-[#5865F2] hover:text-white transition-all cursor-pointer"
              title="Share Analysis & Build to Discord"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span>Share to Discord</span>
            </button>
          )}

          <button
            onClick={() => setViewMode(v => v === 'stress' ? 'combined' : 'stress')}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'stress'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 border-red-500 text-white shadow-lg shadow-red-500/20'
                : 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:text-orange-300 hover:bg-neutral-700'
            }`}
            title="Simulate Overclock Power Draw & Thermals"
          >
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            <span>Stress Test {viewMode === 'stress' ? 'Active' : ''}</span>
          </button>

          <button
            onClick={onSaveBuild}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-neutral-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <BookmarkPlus className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* Active System Quick Hardware Spec Bar */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4 sm:p-5 backdrop-blur-md shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 border border-neutral-800 text-cyan-400 font-mono font-bold">
              {selectedCount}/8
            </div>
            <div>
              <div className="font-bold text-white">Active Workbench Configuration</div>
              <div className="text-[11px] text-neutral-400 truncate max-w-sm">
                CPU: <strong className="text-neutral-200">{build.cpu?.name || 'Empty'}</strong> • GPU: <strong className="text-cyan-400">{build.gpu?.name || 'Empty'}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 font-mono">
            <div>
              <span className="text-[10px] text-neutral-500 block uppercase">Est. Total Cost</span>
              <span className="text-base font-bold text-cyan-400">{formatPrice(usd, uzs)}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block uppercase">Peak Power</span>
              <span className="text-base font-bold text-yellow-400">{compatibility.totalTdp}W TDP</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block uppercase">Synergy</span>
              <span className={`text-xs font-bold rounded px-1.5 py-0.5 ${compatibility.isCompatible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {compatibility.isCompatible ? '100% Compatible' : 'Check Alerts'}
              </span>
            </div>
            <button
              onClick={() => setViewMode(v => v === 'stress' ? 'combined' : 'stress')}
              className="flex items-center gap-1.5 rounded-lg bg-red-950/40 border border-red-500/30 px-2.5 py-1 text-[11px] font-mono text-red-300 hover:bg-red-900/50 hover:text-white transition-colors cursor-pointer"
            >
              <Flame className="h-3 w-3 text-red-400 animate-pulse" />
              <span>Torture Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Mode Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-1 text-xs">
        <button
          onClick={() => setViewMode('combined')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            viewMode === 'combined'
              ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Full Report & Stress Lab</span>
        </button>

        <button
          onClick={() => setViewMode('stress')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            viewMode === 'stress'
              ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Flame className="h-3.5 w-3.5 text-orange-400" />
          <span>Compatibility Stress Test</span>
        </button>

        <button
          onClick={() => setViewMode('report')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            viewMode === 'report'
              ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Target className="h-3.5 w-3.5" />
          <span>Architecture Report</span>
        </button>
      </div>

      {/* Dedicated Stress Test View */}
      {viewMode === 'stress' && (
        <div className="space-y-6 animate-in fade-in">
          <CompatibilityStressTest build={build} onSwitchToBuilder={onSwitchToBuilder} />
        </div>
      )}

      {/* Loading state skeleton (when viewMode is not stress) */}
      {viewMode !== 'stress' && loading && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-12 text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
            <h3 className="font-heading text-lg font-bold text-white">
              Gemini is Analyzing Your Hardware Configuration...
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Evaluating CPU and GPU balance, memory timings, motherboard VRM support, and future upgrade headroom.
            </p>
          </div>
          {viewMode === 'combined' && (
            <CompatibilityStressTest build={build} onSwitchToBuilder={onSwitchToBuilder} />
          )}
        </div>
      )}

      {/* Error state (when viewMode is not stress) */}
      {viewMode !== 'stress' && error && !loading && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 text-center space-y-3">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto" />
            <h3 className="font-heading text-base font-bold text-white">
              Analysis Failed
            </h3>
            <p className="text-xs text-red-300 max-w-md mx-auto">
              {error}
            </p>
            <button
              onClick={runAnalysis}
              className="rounded-xl bg-neutral-800 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-700"
            >
              Try Again
            </button>
          </div>
          {viewMode === 'combined' && (
            <CompatibilityStressTest build={build} onSwitchToBuilder={onSwitchToBuilder} />
          )}
        </div>
      )}

      {/* Report Details */}
      {viewMode !== 'stress' && report && !loading && (
        <div className="space-y-6">
          {/* Executive Overview & Score Card */}
          <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-cyan-950/40 p-6 sm:p-7 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-cyan-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-cyan-300 border border-cyan-500/40">
                    {report.tierLabel}
                  </span>
                  <span className="rounded-md bg-purple-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-purple-300 border border-purple-500/40 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Estimated Lifespan: {report.longevityYears}</span>
                  </span>
                </div>

                <h2 className="font-heading text-xl sm:text-2xl font-bold text-white leading-tight">
                  {report.summary}
                </h2>

                <p className="text-xs text-neutral-300 flex items-center gap-1.5 pt-1">
                  <Target className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span><strong>Optimal Workload Verdict:</strong> {report.primaryUseVerdict}</span>
                </p>
              </div>

              {/* Hardware Score Badge */}
              <div className="flex flex-col items-center justify-center rounded-2xl bg-neutral-950/80 border border-cyan-500/40 p-5 shrink-0 min-w-36 text-center shadow-lg">
                <div className="flex items-baseline gap-0.5 font-mono">
                  <span className="text-4xl font-black text-cyan-400">{report.overallScore}</span>
                  <span className="text-xs text-neutral-500 font-semibold">/10</span>
                </div>
                <span className="text-[10px] font-heading font-bold text-neutral-400 uppercase tracking-wider mt-1">
                  Hardware Synergy Score
                </span>
              </div>
            </div>
          </div>

          {/* Compatibility Stress Test Torture Lab (in Combined Mode) */}
          {viewMode === 'combined' && (
            <CompatibilityStressTest build={build} onSwitchToBuilder={onSwitchToBuilder} />
          )}

          {/* Core Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths Section */}
            <div className="rounded-2xl border border-emerald-500/30 bg-neutral-900/90 p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                  Hardware Strengths & Synergy
                </h3>
              </div>

              <div className="space-y-3">
                {report.strengths.map((str, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-neutral-950/60 border border-neutral-800 p-3.5 space-y-1 hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>{str.title}</span>
                    </div>
                    <p className="text-xs text-neutral-300 pl-5 leading-relaxed">
                      {str.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses Section */}
            <div className="rounded-2xl border border-amber-500/30 bg-neutral-900/90 p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                  Weaknesses & Architectural Bottlenecks
                </h3>
              </div>

              <div className="space-y-3">
                {report.weaknesses.map((wkn, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-neutral-950/60 border border-neutral-800 p-3.5 space-y-1 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>{wkn.title}</span>
                      </div>
                      <span className={`rounded-full px-2 py-0.2 text-[9px] font-mono uppercase font-bold ${
                        wkn.severity === 'high'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : wkn.severity === 'medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {wkn.severity} severity
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 pl-5 leading-relaxed">
                      {wkn.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Upgrade Paths Roadmap */}
          <div className="rounded-2xl border border-purple-500/30 bg-neutral-900/90 p-5 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-white uppercase tracking-wider">
                    Recommended Sequential Upgrade Roadmap
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Step-by-step future modifications to extract maximum longevity and framerates
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.upgradeRoadmap.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 space-y-2 flex flex-col justify-between hover:border-purple-500/40 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-purple-400 uppercase text-[11px]">
                        {step.phase}
                      </span>
                      <span className="rounded bg-neutral-900 px-2 py-0.5 text-[10px] font-mono text-neutral-400">
                        Step #{idx + 1}
                      </span>
                    </div>

                    <h4 className="font-heading text-sm font-bold text-white">
                      {step.targetComponent}
                    </h4>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {step.recommendation}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80">
                    <span className="text-[10px] text-neutral-500 block uppercase font-mono">Expected Impact</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ⚡ {step.estimatedImpact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Footer Bar */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-neutral-400">
              Want to adjust parts based on these recommendations?
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={onSwitchToBuilder}
                className="flex items-center gap-1.5 rounded-xl bg-neutral-800 px-4 py-2 font-bold text-neutral-200 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                <span>Edit in Manual Builder</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={onExportPdf}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 font-bold text-neutral-950 hover:bg-cyan-400 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export PDF Quotation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
