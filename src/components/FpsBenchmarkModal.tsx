import React, { useState } from 'react';
import { 
  Gamepad2, 
  Activity, 
  Monitor, 
  AlertCircle, 
  CheckCircle, 
  Zap, 
  Info,
  Scale
} from 'lucide-react';
import { PCBuild, Language } from '../types/hardware';
import { estimateGameFps, calculateBottleneck } from '../utils/benchmarks';
import { TRANSLATIONS } from '../data/translations';

interface FpsBenchmarkModalProps {
  build: PCBuild;
  language: Language;
  onOpenAutoBuild: () => void;
}

export const FpsBenchmarkModal: React.FC<FpsBenchmarkModalProps> = ({
  build,
  language,
  onOpenAutoBuild,
}) => {
  const t = TRANSLATIONS[language];
  const [resolution, setResolution] = useState<'1080p' | '1440p' | '4k'>('1080p');

  const benchmarks = estimateGameFps(build);
  const bottleneck = calculateBottleneck(build);

  const hasComponents = Boolean(build.cpu || build.gpu);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1 text-xs font-semibold text-cyan-300">
          <Gamepad2 className="h-3.5 w-3.5 text-cyan-400" />
          <span>Real-Time Hardware Benchmark Engine</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t.gamingPerformance}
        </h1>
        <p className="max-w-xl mx-auto text-xs text-neutral-400">
          {t.fpsNotice}
        </p>
      </div>

      {/* Resolution Selector Tabs */}
      <div className="flex justify-center">
        <div className="flex rounded-xl bg-neutral-900 border border-neutral-800 p-1">
          <button
            onClick={() => setResolution('1080p')}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-bold transition-all ${
              resolution === '1080p'
                ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Monitor className="h-4 w-4" />
            <span>{t.resolution1080p}</span>
          </button>

          <button
            onClick={() => setResolution('1440p')}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-bold transition-all ${
              resolution === '1440p'
                ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Monitor className="h-4 w-4" />
            <span>{t.resolution1440p}</span>
          </button>

          <button
            onClick={() => setResolution('4k')}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-bold transition-all ${
              resolution === '4k'
                ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Monitor className="h-4 w-4" />
            <span>{t.resolution4k}</span>
          </button>
        </div>
      </div>

      {/* Bottleneck Inspector Banner */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-heading text-sm font-bold text-white tracking-wide flex items-center gap-2 uppercase">
              <Scale className="h-4 w-4 text-cyan-400" />
              <span>{t.bottleneckAnalysis}</span>
            </h3>
            <p className="text-xs text-neutral-400 max-w-xl">
              {bottleneck.explanation}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {bottleneck.type === 'balanced' && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                <span>Perfect Synergy (&lt;5%)</span>
              </div>
            )}

            {bottleneck.type === 'cpu_bottleneck' && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 text-xs font-bold text-amber-400">
                <AlertCircle className="h-4 w-4" />
                <span>CPU Bottleneck ({bottleneck.percentage}%)</span>
              </div>
            )}

            {bottleneck.type === 'gpu_bottleneck' && (
              <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 border border-blue-500/30 px-3.5 py-2 text-xs font-bold text-blue-400">
                <Info className="h-4 w-4" />
                <span>GPU Bound ({bottleneck.percentage}%)</span>
              </div>
            )}

            {!hasComponents && (
              <button
                onClick={onOpenAutoBuild}
                className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 transition-colors cursor-pointer"
              >
                Auto-Build Balanced PC
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {benchmarks.map((game) => {
          const fps = resolution === '1080p'
            ? game.fps1080p
            : resolution === '1440p'
            ? game.fps1440p
            : game.fps4k;

          const isPlayable = fps >= 30;
          const isSmooth = fps >= 60;
          const isComp = fps >= 144;

          return (
            <div
              key={game.id}
              className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/90 transition-all duration-300 hover:border-neutral-700 hover:shadow-2xl"
            >
              {/* Game Banner */}
              <div className="relative h-44 w-full overflow-hidden bg-neutral-950">
                <img
                  src={game.banner}
                  alt={game.name}
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

                <div className="absolute top-3 left-3 rounded-lg bg-neutral-950/80 px-2.5 py-1 text-[11px] font-mono font-bold text-neutral-300 backdrop-blur-sm border border-neutral-800">
                  {game.settings}
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-white drop-shadow-md">
                      {game.name}
                    </h3>
                  </div>

                  {/* FPS Number */}
                  <div className="text-right">
                    <span className="font-mono text-3xl font-black text-cyan-400 drop-shadow-lg">
                      {fps}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase">
                      AVG FPS
                    </span>
                  </div>
                </div>
              </div>

              {/* Status details */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Target Playability</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isComp
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isSmooth
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : isPlayable
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {game.playability}
                  </span>
                </div>

                {/* Visual FPS Gauge Bar */}
                <div className="h-2 w-full rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                  <div
                    className={`h-full transition-all duration-700 rounded-full ${
                      fps >= 144
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                        : fps >= 60
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        : fps >= 30
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((fps / 240) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
