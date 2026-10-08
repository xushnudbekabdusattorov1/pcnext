import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Flame,
  Zap,
  Activity,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Wind,
  Gauge,
  Thermometer,
  RotateCcw,
  Play,
  Pause,
  ArrowUpRight,
  Info,
  Sparkles,
  Volume2,
  ChevronRight,
  TrendingDown,
  Layers,
  Cpu,
  Layers2
} from 'lucide-react';
import { PCBuild } from '../types/hardware';
import {
  simulateStressTest,
  StressTestSettings,
  DEFAULT_STRESS_SETTINGS,
  OverclockPreset,
  StressRecommendation,
} from '../utils/stressTestSimulator';

interface CompatibilityStressTestProps {
  build: PCBuild;
  onSwitchToBuilder?: () => void;
}

export const CompatibilityStressTest: React.FC<CompatibilityStressTestProps> = ({
  build,
  onSwitchToBuilder,
}) => {
  const [settings, setSettings] = useState<StressTestSettings>(DEFAULT_STRESS_SETTINGS);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sandbox' | 'recommendations'>('dashboard');

  // Animation frame / timer ref for stress run
  const simTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute live telemetry based on current build and settings
  const telemetry = useMemo(() => {
    return simulateStressTest(build, settings);
  }, [build, settings]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, []);

  // Run 10-second interactive stress simulation cycle
  const runSimulation = () => {
    if (isSimulating) {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      setIsSimulating(false);
      return;
    }

    setIsSimulating(true);
    setSimulationProgress(0);
    setSimulationLogs([
      `[00:00] Initializing synthetic AVX2 FFT vector workload & FurMark 4K render targets...`,
    ]);

    let progress = 0;
    simTimerRef.current = setInterval(() => {
      progress += 10;
      setSimulationProgress(progress);

      if (progress === 20) {
        setSimulationLogs(prev => [
          ...prev,
          `[00:02] CPU Package Power climbed to ${telemetry.cpuPowerWatts}W. VRM phase load stabilizing.`,
        ]);
      } else if (progress === 40) {
        setSimulationLogs(prev => [
          ...prev,
          `[00:04] GPU Board Power drawing ${telemetry.gpuPowerWatts}W. Hotspot temperature: ${telemetry.gpuHotspotTempC}°C.`,
        ]);
      } else if (progress === 60) {
        setSimulationLogs(prev => [
          ...prev,
          `[00:06] Transient load excursion: 12V rail microsecond peak hit ${telemetry.peakTransientWatts}W!`,
        ]);
      } else if (progress === 80) {
        setSimulationLogs(prev => [
          ...prev,
          telemetry.cpuThrottling
            ? `[00:08] THERMAL SATURATION: CPU junction hit ${telemetry.cpuTempC}°C! Clock throttled by ${telemetry.cpuThrottlingDropPct}%.`
            : `[00:08] Thermal equilibrium achieved: CPU stabilized at ${telemetry.cpuTempC}°C (${telemetry.coolerRatedDissipation}W cooler).`,
        ]);
      } else if (progress >= 100) {
        if (simTimerRef.current) clearInterval(simTimerRef.current);
        setIsSimulating(false);
        setSimulationLogs(prev => [
          ...prev,
          `[00:10] Stress run complete: Stability Score ${telemetry.overallStabilityScore}/100. Aggregating recommendations.`,
        ]);
      }
    }, 1000);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_STRESS_SETTINGS);
  };

  // Severity color helpers
  const getStabilityBadge = () => {
    switch (telemetry.stabilityStatus) {
      case 'optimal':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
          label: 'Cool & Stable',
          sub: 'No Throttling Detected',
        };
      case 'moderate':
        return {
          bg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
          label: 'Acceptable Headroom',
          sub: 'Mild Thermal Pressure',
        };
      case 'high_heat':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
          label: 'High Thermal Stress',
          sub: 'Cooler Nearing Saturation',
        };
      case 'throttling_severe':
        return {
          bg: 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse',
          label: 'Thermal Throttling Active',
          sub: `Clocks Degraded by -${telemetry.cpuThrottlingDropPct}%`,
        };
    }
  };

  const stabilityBadge = getStabilityBadge();

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900/95 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Top Banner Header */}
      <div className="relative border-b border-neutral-800 bg-gradient-to-r from-red-950/40 via-neutral-900 to-amber-950/30 p-5 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/40 px-3 py-0.5 text-xs font-mono font-bold text-red-300">
                <Flame className="h-3.5 w-3.5 text-red-400 animate-bounce" />
                <span>THERMAL & POWER TORTURE LAB</span>
              </span>
              <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-[11px] font-mono text-neutral-400 border border-neutral-700">
                Compatibility Stress Test
              </span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Heavy Overclock & Thermal Dissipation Simulator
            </h2>
            <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
              Simulate extreme sustained all-core vector power draw, GPU transient spikes, and chassis heat soak under demanding overclocked scenarios to verify cooling sufficiency and avoid hardware throttling.
            </p>
          </div>

          {/* Quick Score Card */}
          <div className="flex items-center gap-3 shrink-0">
            <div className={`rounded-2xl border p-4 text-center min-w-36 ${stabilityBadge.bg}`}>
              <div className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-80">
                Stability Index
              </div>
              <div className="font-mono text-3xl font-black my-0.5">
                {telemetry.overallStabilityScore}
                <span className="text-xs opacity-60">/100</span>
              </div>
              <div className="text-[11px] font-bold">
                {stabilityBadge.label}
              </div>
            </div>

            <button
              onClick={runSimulation}
              className={`flex flex-col items-center justify-center gap-1 px-5 py-4 rounded-2xl font-bold text-xs transition-all shadow-lg cursor-pointer ${
                isSimulating
                  ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400 animate-pulse shadow-amber-500/20'
                  : 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500 shadow-red-600/30'
              }`}
            >
              {isSimulating ? (
                <>
                  <Pause className="h-5 w-5" />
                  <span>Stop Loop ({simulationProgress}%)</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Run 10s Stress Loop</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Simulation Progress Bar */}
        {isSimulating && (
          <div className="mt-4 space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-300">
              <span className="flex items-center gap-1.5 text-red-400">
                <Activity className="h-3.5 w-3.5 animate-spin" />
                <span>Simulating Prime95 AVX2 + FurMark Heavy Torture Loop...</span>
              </span>
              <span>{simulationProgress}% Elapsed</span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 transition-all duration-300 rounded-full"
                style={{ width: `${simulationProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-800 px-5 sm:px-7 bg-neutral-950/60 text-xs">
        <div className="flex items-center gap-1 py-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Gauge className="h-4 w-4 text-cyan-400" />
            <span>Telemetry Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'sandbox'
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Layers className="h-4 w-4 text-purple-400" />
            <span>Virtual Upgrades Sandbox</span>
            {(settings.virtualCoolerUpgrade ||
              settings.virtualContactFrame ||
              settings.virtualCaseFans ||
              settings.virtualUndervolt) && (
              <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'recommendations'
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Cooling Suggestions ({telemetry.recommendations.length})</span>
          </button>
        </div>

        <button
          onClick={resetSettings}
          className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          title="Reset to default stress test settings"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reset Baseline</span>
        </button>
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        {/* Preset Selector & Workload Tuner Bar */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                Stress Test Profile & Overclock Intensity
              </span>
            </div>
            <span className="text-[11px] text-neutral-400">
              Active CPU: <strong className="text-white">{build.cpu?.name || 'Standard Processor'}</strong> • Cooler: <strong className="text-cyan-400">{build.cooler?.name || 'Stock / Default'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              {
                id: 'stock',
                title: 'Stock / Factory',
                subtitle: 'Standard Boost PL1/PL2',
                badge: '1.0x Power',
                color: 'hover:border-neutral-700',
                activeColor: 'border-cyan-500 bg-cyan-950/20 text-cyan-300',
              },
              {
                id: 'moderate',
                title: 'Moderate OC',
                subtitle: 'PBO / XMP / GPU +10%',
                badge: '+15-20% Power',
                color: 'hover:border-neutral-700',
                activeColor: 'border-blue-500 bg-blue-950/20 text-blue-300',
              },
              {
                id: 'heavy',
                title: 'Heavy Overclock',
                subtitle: 'All-Core Max / Uncapped PL2',
                badge: '+35-45% Power',
                color: 'hover:border-neutral-700',
                activeColor: 'border-orange-500 bg-orange-950/20 text-orange-300',
              },
              {
                id: 'extreme',
                title: 'Synthetic Torture',
                subtitle: 'Prime95 AVX + FurMark 4K',
                badge: '+55-70% Power',
                color: 'hover:border-neutral-700',
                activeColor: 'border-red-500 bg-red-950/20 text-red-300',
              },
            ].map(p => {
              const isSelected = settings.preset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSettings(s => ({ ...s, preset: p.id as OverclockPreset }))}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? p.activeColor
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-850'
                  }`}
                >
                  <div className="flex items-center justify-between w-full text-xs font-bold">
                    <span>{p.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-950/60 border border-neutral-700/50">
                      {p.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 mt-0.5">
                    {p.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Granular Environmental & Cooling Condition Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Ambient Temperature Slider */}
            <div className="space-y-1.5 bg-neutral-900/50 p-3 rounded-xl border border-neutral-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Thermometer className="h-3.5 w-3.5 text-orange-400" />
                  <span>Ambient Room Temp</span>
                </span>
                <span className="font-mono font-bold text-white">
                  {settings.ambientTempC}°C{' '}
                  <span className="text-[10px] text-neutral-500">
                    ({Math.round((settings.ambientTempC * 9) / 5 + 32)}°F)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="18"
                max="35"
                step="1"
                value={settings.ambientTempC}
                onChange={e => setSettings(s => ({ ...s, ambientTempC: Number(e.target.value) }))}
                className="w-full accent-orange-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>18°C (AC)</span>
                <span>22°C (Norm)</span>
                <span>35°C (Hot)</span>
              </div>
            </div>

            {/* Fan Curve Profile */}
            <div className="space-y-1.5 bg-neutral-900/50 p-3 rounded-xl border border-neutral-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Wind className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Fan RPM Profile</span>
                </span>
                <span className="font-mono text-xs font-bold text-cyan-300 capitalize">
                  {settings.fanCurve} ({telemetry.estimatedNoiseDb} dBA)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-0.5">
                {(['silent', 'balanced', 'performance'] as const).map(curve => (
                  <button
                    key={curve}
                    onClick={() => setSettings(s => ({ ...s, fanCurve: curve }))}
                    className={`py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer capitalize ${
                      settings.fanCurve === curve
                        ? 'bg-cyan-500 text-neutral-950 shadow'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {curve}
                  </button>
                ))}
              </div>
            </div>

            {/* Microsecond Transients & AVX Stress Switches */}
            <div className="flex flex-col justify-center gap-2 bg-neutral-900/50 p-3 rounded-xl border border-neutral-800/80 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-300 text-[11px] flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-yellow-400" />
                  <span>ATX 3.0 Transient Excursion Spike</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.transientSpikes}
                  onChange={e => setSettings(s => ({ ...s, transientSpikes: e.target.checked }))}
                  className="rounded border-neutral-700 text-cyan-500 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-300 text-[11px] flex items-center gap-1.5">
                  <Activity className="h-3 w-3 text-rose-400" />
                  <span>AVX2 / AVX-512 Vector Arithmetic</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.avxSyntheticLoad}
                  onChange={e => setSettings(s => ({ ...s, avxSyntheticLoad: e.target.checked }))}
                  className="rounded border-neutral-700 text-cyan-500 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* ================= TAB 1: DASHBOARD TELEMETRY ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Primary Telemetry 4-Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CPU Thermal & Power Card */}
              <div
                className={`rounded-2xl border p-4 space-y-3 transition-all ${
                  telemetry.cpuThrottling
                    ? 'border-red-500/50 bg-red-950/20 shadow-lg shadow-red-500/10'
                    : telemetry.cpuTempC >= 85
                    ? 'border-amber-500/40 bg-amber-950/20'
                    : 'border-neutral-800 bg-neutral-950/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                    <span>CPU Package</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      telemetry.cpuThrottling
                        ? 'bg-red-500 text-white animate-pulse'
                        : telemetry.cpuTempC >= 85
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {telemetry.cpuThrottling ? 'THROTTLING' : 'NORMAL'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="font-mono">
                    <span
                      className={`text-3xl font-black ${
                        telemetry.cpuThrottling
                          ? 'text-red-400'
                          : telemetry.cpuTempC >= 85
                          ? 'text-amber-400'
                          : 'text-cyan-400'
                      }`}
                    >
                      {telemetry.cpuTempC}°C
                    </span>
                    <span className="text-xs text-neutral-500 ml-1">
                      / TJMax {telemetry.cpuJunctionMaxC}°C
                    </span>
                  </div>
                  <div className="font-mono text-xs text-yellow-400 font-bold">
                    {telemetry.cpuPowerWatts}W{' '}
                    <span className="text-[10px] text-neutral-500 block text-right">
                      (Stock: {telemetry.cpuStockWatts}W)
                    </span>
                  </div>
                </div>

                {/* Temperature Bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full rounded-full bg-neutral-900 overflow-hidden border border-neutral-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        telemetry.cpuThrottling
                          ? 'bg-red-500'
                          : telemetry.cpuTempC >= 85
                          ? 'bg-amber-500'
                          : 'bg-cyan-500'
                      }`}
                      style={{
                        width: `${Math.min((telemetry.cpuTempC / telemetry.cpuJunctionMaxC) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                    <span>Dissipation: {telemetry.coolerRatedDissipation}W</span>
                    <span>
                      {telemetry.coolerDeficitWatts > 0 ? (
                        <strong className="text-red-400">-{telemetry.coolerDeficitWatts}W Deficit</strong>
                      ) : (
                        <strong className="text-emerald-400">Headroom OK</strong>
                      )}
                    </span>
                  </div>
                </div>

                {telemetry.cpuThrottling && (
                  <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-2 text-[10px] text-red-300 leading-tight">
                    ⚠️ Clockspeed drop: <strong>-{telemetry.cpuThrottlingDropPct}%</strong>. In-game FPS stutter and frame pacing spikes will occur.
                  </div>
                )}
              </div>

              {/* GPU Thermal & Power Card */}
              <div
                className={`rounded-2xl border p-4 space-y-3 transition-all ${
                  telemetry.gpuThrottling
                    ? 'border-red-500/40 bg-red-950/20'
                    : telemetry.gpuTempC >= 80
                    ? 'border-amber-500/40 bg-amber-950/20'
                    : 'border-neutral-800 bg-neutral-950/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-purple-400" />
                    <span>GPU & Hotspot</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      telemetry.gpuThrottling
                        ? 'bg-red-500 text-white'
                        : telemetry.gpuTempC >= 80
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {telemetry.gpuThrottling ? 'HOT' : 'STABLE'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="font-mono">
                    <span
                      className={`text-3xl font-black ${
                        telemetry.gpuTempC >= 82 ? 'text-amber-400' : 'text-purple-400'
                      }`}
                    >
                      {telemetry.gpuTempC}°C
                    </span>
                    <span className="text-xs text-neutral-500 ml-1">
                      (Hotspot: {telemetry.gpuHotspotTempC}°C)
                    </span>
                  </div>
                  <div className="font-mono text-xs text-yellow-400 font-bold">
                    {telemetry.gpuPowerWatts}W{' '}
                    <span className="text-[10px] text-neutral-500 block text-right">
                      (Stock: {telemetry.gpuStockWatts}W)
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="h-2 w-full rounded-full bg-neutral-900 overflow-hidden border border-neutral-800">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((telemetry.gpuTempC / 90) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                    <span>Core: {telemetry.gpuTempC}°C</span>
                    <span>GDDR6X VRAM: ~{telemetry.gpuHotspotTempC - 2}°C</span>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-400 truncate">
                  Chipset: <strong className="text-neutral-200">{build.gpu?.name || 'Dedicated GPU'}</strong>
                </div>
              </div>

              {/* PSU Rail Load & Transient Excursion Card */}
              <div
                className={`rounded-2xl border p-4 space-y-3 transition-all ${
                  telemetry.psuSafetyStatus === 'danger'
                    ? 'border-red-500/50 bg-red-950/20 shadow-lg shadow-red-500/10'
                    : telemetry.psuSafetyStatus === 'warning'
                    ? 'border-amber-500/40 bg-amber-950/20'
                    : 'border-neutral-800 bg-neutral-950/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-yellow-400" />
                    <span>PSU Rail Load</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      telemetry.psuSafetyStatus === 'danger'
                        ? 'bg-red-500 text-white animate-pulse'
                        : telemetry.psuSafetyStatus === 'warning'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {telemetry.psuSafetyStatus === 'danger'
                      ? 'OCP RISK'
                      : telemetry.psuSafetyStatus === 'warning'
                      ? 'HEAVY'
                      : 'SAFE'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="font-mono">
                    <span
                      className={`text-3xl font-black ${
                        telemetry.psuSafetyStatus === 'danger'
                          ? 'text-red-400'
                          : telemetry.psuSafetyStatus === 'warning'
                          ? 'text-amber-400'
                          : 'text-yellow-400'
                      }`}
                    >
                      {telemetry.totalSystemWatts}W
                    </span>
                    <span className="text-xs text-neutral-500 ml-1">
                      / {telemetry.psuRatedWatts}W
                    </span>
                  </div>
                  <div className="font-mono text-xs font-bold text-neutral-300">
                    {telemetry.psuUtilizationPct}%{' '}
                    <span className="text-[10px] text-neutral-500 block text-right">
                      Rail Capacity
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="h-2 w-full rounded-full bg-neutral-900 overflow-hidden border border-neutral-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        telemetry.psuSafetyStatus === 'danger'
                          ? 'bg-red-500'
                          : telemetry.psuSafetyStatus === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-yellow-400'
                      }`}
                      style={{ width: `${Math.min(telemetry.psuUtilizationPct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                    <span>Wall AC: {telemetry.totalWallWatts}W</span>
                    <span className="text-orange-400 font-bold">
                      Peak Spike: {telemetry.peakTransientWatts}W
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-400 truncate">
                  Rating: <strong className="text-neutral-200">{build.psu?.efficiency || '80+ Gold Standard'}</strong>
                </div>
              </div>

              {/* Case Internal Heat Soak & Airflow Card */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Wind className="h-3.5 w-3.5 text-blue-400" />
                    <span>Case Internal Soak</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    +{telemetry.caseDeltaTempC}°C ΔT
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="font-mono">
                    <span className="text-3xl font-black text-blue-400">
                      {telemetry.caseInternalTempC}°C
                    </span>
                    <span className="text-xs text-neutral-500 ml-1">
                      (Ambient: {settings.ambientTempC}°C)
                    </span>
                  </div>
                  <div className="font-mono text-xs text-neutral-400 font-bold">
                    ~{telemetry.estimatedNoiseDb} dBA
                    <span className="text-[10px] text-neutral-500 block text-right">
                      Acoustic Level
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="h-2 w-full rounded-full bg-neutral-900 overflow-hidden border border-neutral-800">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((telemetry.caseDeltaTempC / 25) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                    <span>Side: {build.case?.sidePanel || 'Mesh/Glass'}</span>
                    <span>Fans: {build.case?.includedFans || 3}x PWM</span>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-400 truncate">
                  Chassis: <strong className="text-neutral-200">{build.case?.name || 'Mid-Tower Case'}</strong>
                </div>
              </div>
            </div>

            {/* Live Synthetic Telemetry Console Logs */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Synthetic Hardware Stress Telemetry Stream</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  Profile: {settings.preset.toUpperCase()} • Sample rate: 1000ms
                </span>
              </div>

              <div className="font-mono text-[11px] space-y-1 text-neutral-300 max-h-32 overflow-y-auto">
                {simulationLogs.length > 0 ? (
                  simulationLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`leading-relaxed ${
                        log.includes('THERMAL SATURATION') || log.includes('OCP')
                          ? 'text-red-400 font-bold'
                          : log.includes('excursion')
                          ? 'text-yellow-400'
                          : 'text-neutral-300'
                      }`}
                    >
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-neutral-500 py-2">
                    Click "Run 10s Stress Loop" above to stream live sensor readings, transient excursion spikes, and VRM thermal equilibrium telemetry.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: VIRTUAL UPGRADES SANDBOX ================= */}
        {activeTab === 'sandbox' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-5 space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Virtual Hardware Improvements Sandbox</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Test virtual cooling and BIOS modifications on your active build in real-time. Toggle improvements below to observe how thermal throttling disappears and operating temperatures drop.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Virtual Upgrade 1: 360mm AIO */}
              <div
                onClick={() =>
                  setSettings(s => ({ ...s, virtualCoolerUpgrade: !s.virtualCoolerUpgrade }))
                }
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  settings.virtualCoolerUpgrade
                    ? 'border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-500/10'
                    : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">
                      Virtual 360mm Liquid AIO Radiator
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                      320W Dissipation
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Replaces current cooler with high-performance 360mm triple-fan liquid cooler. Dramatically expands thermal headroom for heavy multi-core loads.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.virtualCoolerUpgrade}
                  onChange={() => {}}
                  className="mt-1 rounded border-neutral-700 text-cyan-500 pointer-events-none"
                />
              </div>

              {/* Virtual Upgrade 2: Anti-Bending Contact Frame & PTM7950 */}
              <div
                onClick={() =>
                  setSettings(s => ({ ...s, virtualContactFrame: !s.virtualContactFrame }))
                }
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  settings.virtualContactFrame
                    ? 'border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                    : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">
                      Anti-Bending Contact Frame & PTM7950
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
                      -5.5°C Junction Drop
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Eliminates CPU heat spreader warping for flat cold-plate contact and applies industrial phase-change thermal interface.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.virtualContactFrame}
                  onChange={() => {}}
                  className="mt-1 rounded border-neutral-700 text-purple-500 pointer-events-none"
                />
              </div>

              {/* Virtual Upgrade 3: +2x 140mm High Static Pressure Intake Fans */}
              <div
                onClick={() => setSettings(s => ({ ...s, virtualCaseFans: !s.virtualCaseFans }))}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  settings.virtualCaseFans
                    ? 'border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-500/10'
                    : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">
                      +2x 140mm High-CFM Intake Fans
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold">
                      -4.0°C Case Air Soak
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Pressurizes chassis interior with fresh ambient airflow, clearing GPU backplate heat pooling and feeding the CPU cooler fresh air.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.virtualCaseFans}
                  onChange={() => {}}
                  className="mt-1 rounded border-neutral-700 text-blue-500 pointer-events-none"
                />
              </div>

              {/* Virtual Upgrade 4: BIOS Curve Optimizer / Undervolt */}
              <div
                onClick={() => setSettings(s => ({ ...s, virtualUndervolt: !s.virtualUndervolt }))}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  settings.virtualUndervolt
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                    : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">
                      BIOS Curve Optimizer Undervolt (-25mV)
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      -12% CPU Power Draw
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Optimizes CPU V/F curve. Drops package power by ~35W while maintaining identical or superior boost clock frequencies.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.virtualUndervolt}
                  onChange={() => {}}
                  className="mt-1 rounded border-neutral-700 text-emerald-500 pointer-events-none"
                />
              </div>
            </div>

            {/* Sandbox Comparison Outcome Bar */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-cyan-400" />
                  <span>Current Virtual Configuration Outcome</span>
                </div>
                <p className="text-xs text-neutral-400">
                  CPU Junction: <strong className="text-white">{telemetry.cpuTempC}°C</strong> (Headroom: <strong className="text-emerald-400">{telemetry.cpuJunctionMaxC - telemetry.cpuTempC}°C to TJMax</strong>) • Stability Score: <strong className="text-cyan-400">{telemetry.overallStabilityScore}/100</strong>
                </p>
              </div>

              {onSwitchToBuilder && (
                <button
                  onClick={onSwitchToBuilder}
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-neutral-950 hover:bg-cyan-400 transition-all cursor-pointer shrink-0"
                >
                  <span>Apply Upgrades in Builder</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: COOLING SUGGESTIONS & IMPROVEMENTS ================= */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                  Targeted Cooling & Thermal Improvements
                </h3>
                <p className="text-xs text-neutral-400">
                  Tailored suggestions based on your {settings.preset} stress test simulation results
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {telemetry.recommendations.length} Action Items
              </span>
            </div>

            {telemetry.recommendations.length === 0 ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-8 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <h4 className="font-heading text-base font-bold text-white">
                  Thermal Architecture is Fully Optimized
                </h4>
                <p className="text-xs text-neutral-300 max-w-md mx-auto">
                  Even under {settings.preset} stress load, your cooling capacity, chassis airflow, and PSU headroom remain within ideal operating tolerances.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {telemetry.recommendations.map(rec => (
                  <div
                    key={rec.id}
                    className={`rounded-2xl border p-4 sm:p-5 space-y-2 transition-all ${
                      rec.severity === 'critical'
                        ? 'border-red-500/40 bg-red-950/15'
                        : rec.severity === 'recommended'
                        ? 'border-amber-500/30 bg-amber-950/10'
                        : 'border-neutral-800 bg-neutral-950/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase font-bold ${
                            rec.severity === 'critical'
                              ? 'bg-red-500 text-white'
                              : rec.severity === 'recommended'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {rec.severity}
                        </span>
                        <h4 className="font-heading text-sm font-bold text-white">
                          {rec.title}
                        </h4>
                      </div>

                      <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                        <TrendingDown className="h-3.5 w-3.5" />
                        <span>{rec.impactLabel}</span>
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {rec.description}
                    </p>

                    {rec.suggestedAction && (
                      <div className="pt-2 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-[11px] text-cyan-300 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                          <span><strong>Action:</strong> {rec.suggestedAction}</span>
                        </div>

                        {onSwitchToBuilder && (
                          <button
                            onClick={onSwitchToBuilder}
                            className="text-[11px] font-bold text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>Adjust in Builder</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
