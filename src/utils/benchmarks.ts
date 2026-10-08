import { PCBuild } from '../types/hardware';

export interface GameBenchmarkResult {
  id: string;
  name: string;
  banner: string;
  settings: string;
  fps1080p: number;
  fps1440p: number;
  fps4k: number;
  playability: 'Unplayable' | 'Playable (30+ FPS)' | 'Smooth (60+ FPS)' | 'Competitive (144+ FPS)' | 'Ultra (240+ FPS)';
}

export interface BottleneckInfo {
  type: 'cpu_bottleneck' | 'gpu_bottleneck' | 'balanced' | 'no_components';
  percentage: number;
  explanation: string;
}

export function estimateGameFps(build: PCBuild): GameBenchmarkResult[] {
  const cpuTier = build.cpu?.performanceTier || 1;
  const gpuTier = build.gpu?.performanceTier || (build.cpu?.hasIntegratedGraphics ? 0.8 : 0);
  const ramTierBonus = build.ram && build.ram.capacityGb >= 32 ? 1.06 : 1.0;

  if (gpuTier === 0) {
    return [
      {
        id: 'cs2',
        name: 'Counter-Strike 2',
        banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
        settings: '1080p Low',
        fps1080p: 0,
        fps1440p: 0,
        fps4k: 0,
        playability: 'Unplayable',
      },
    ];
  }

  // Baseline 1080p scores based on GPU tier (1=entry ~RTX 3050, 2=RX 6600, 3=RTX 4060, 4=4070S/7800XT, 5=4080S/4090)
  const baseScores: Record<string, { name: string; settings: string; tier1: number; tier2: number; tier3: number; tier4: number; tier5: number; banner: string }> = {
    cs2: {
      name: 'Counter-Strike 2',
      settings: 'Very High / Competitive',
      tier1: 110,
      tier2: 170,
      tier3: 260,
      tier4: 380,
      tier5: 520,
      banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    },
    cyberpunk: {
      name: 'Cyberpunk 2077',
      settings: 'Ultra + Ray Tracing Medium',
      tier1: 34,
      tier2: 48,
      tier3: 75,
      tier4: 115,
      tier5: 165,
      banner: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    },
    fortnite: {
      name: 'Fortnite (Unreal Engine 5)',
      settings: 'Pro Competitive DX12',
      tier1: 105,
      tier2: 160,
      tier3: 230,
      tier4: 340,
      tier5: 480,
      banner: 'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=600&auto=format&fit=crop&q=80',
    },
    valorant: {
      name: 'Valorant',
      settings: '1080p High',
      tier1: 180,
      tier2: 260,
      tier3: 380,
      tier4: 520,
      tier5: 700,
      banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    },
    warzone: {
      name: 'Call of Duty: Warzone',
      settings: 'Ultra Balanced',
      tier1: 52,
      tier2: 78,
      tier3: 115,
      tier4: 175,
      tier5: 240,
      banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    },
    gta: {
      name: 'Grand Theft Auto V / VI Ready',
      settings: 'Very High / Ultra MSAA 2x',
      tier1: 75,
      tier2: 110,
      tier3: 145,
      tier4: 195,
      tier5: 250,
      banner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    },
  };

  // Interpolate based on GPU tier & CPU influence
  return Object.entries(baseScores).map(([id, game]) => {
    let rawGpuFps = 0;
    if (gpuTier <= 1) rawGpuFps = game.tier1 * (gpuTier < 1 ? 0.45 : 1.0);
    else if (gpuTier <= 2) rawGpuFps = game.tier1 + (game.tier2 - game.tier1) * (gpuTier - 1);
    else if (gpuTier <= 3) rawGpuFps = game.tier2 + (game.tier3 - game.tier2) * (gpuTier - 2);
    else if (gpuTier <= 4) rawGpuFps = game.tier3 + (game.tier4 - game.tier3) * (gpuTier - 3);
    else rawGpuFps = game.tier4 + (game.tier5 - game.tier4) * Math.min(gpuTier - 4, 1);

    // CPU influence (CPU-heavy games like CS2 & Valorant depend more on CPU)
    const isCpuHeavy = id === 'cs2' || id === 'valorant';
    const cpuFactor = isCpuHeavy
      ? 0.7 + (cpuTier / 5) * 0.45
      : 0.85 + (cpuTier / 5) * 0.25;

    const fps1080p = Math.round(rawGpuFps * cpuFactor * ramTierBonus);
    const fps1440p = Math.round(fps1080p * 0.72);
    const fps4k = Math.round(fps1080p * 0.42);

    let playability: GameBenchmarkResult['playability'] = 'Unplayable';
    if (fps1080p >= 200) playability = 'Ultra (240+ FPS)';
    else if (fps1080p >= 120) playability = 'Competitive (144+ FPS)';
    else if (fps1080p >= 60) playability = 'Smooth (60+ FPS)';
    else if (fps1080p >= 30) playability = 'Playable (30+ FPS)';

    return {
      id,
      name: game.name,
      banner: game.banner,
      settings: game.settings,
      fps1080p,
      fps1440p,
      fps4k,
      playability,
    };
  });
}

export function calculateBottleneck(build: PCBuild): BottleneckInfo {
  if (!build.cpu || !build.gpu) {
    return {
      type: 'no_components',
      percentage: 0,
      explanation: 'Select both CPU and GPU to analyze hardware balance.',
    };
  }

  const cpuScore = build.cpu.performanceTier;
  const gpuScore = build.gpu.performanceTier;
  const diff = gpuScore - cpuScore;

  if (diff >= 2) {
    const pct = Math.min(Math.round(diff * 14), 45);
    return {
      type: 'cpu_bottleneck',
      percentage: pct,
      explanation: `Your graphics card (${build.gpu.name}) is significantly stronger than your CPU (${build.cpu.name}). In high refresh rate gaming and esports, the processor will limit max frame rates by ~${pct}%.`,
    };
  }

  if (diff <= -2) {
    const pct = Math.min(Math.round(Math.abs(diff) * 15), 50);
    return {
      type: 'gpu_bottleneck',
      percentage: pct,
      explanation: `Your CPU (${build.cpu.name}) has much more headroom than your GPU (${build.gpu.name}). Your GPU will run at 100% capacity and define the performance ceiling. Upgrade the GPU for balanced performance.`,
    };
  }

  return {
    type: 'balanced',
    percentage: 3,
    explanation: `Excellent pairing! ${build.cpu.name} and ${build.gpu.name} complement each other with negligible bottleneck (<5%). Both components will reach their peak efficiency.`,
  };
}
