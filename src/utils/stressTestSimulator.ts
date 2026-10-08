import { PCBuild } from '../types/hardware';

export type OverclockPreset = 'stock' | 'moderate' | 'heavy' | 'extreme';

export interface StressTestSettings {
  preset: OverclockPreset;
  ambientTempC: number; // 18°C to 35°C
  fanCurve: 'silent' | 'balanced' | 'performance';
  avxSyntheticLoad: boolean; // Prime95 / AVX-512 heavy vector stress
  transientSpikes: boolean; // Simulates ATX 3.0 microsecond power spikes
  // Virtual sandbox cooling toggles
  virtualCoolerUpgrade: boolean; // Simulates 360mm Liquid AIO (320W dissipation)
  virtualContactFrame: boolean; // Simulates thermal contact frame & phase change pad (-5°C)
  virtualCaseFans: boolean; // Simulates +2x 140mm high static pressure intake fans (-4°C internal ambient)
  virtualUndervolt: boolean; // Simulates -25mV Curve Optimizer undervolt (-35W CPU power)
}

export interface StressRecommendation {
  id: string;
  category: 'cooler' | 'airflow' | 'tim_contact_frame' | 'voltage_tuning' | 'psu';
  title: string;
  impactLabel: string;
  description: string;
  severity: 'critical' | 'recommended' | 'optional';
  suggestedAction?: string;
}

export interface StressTestTelemetry {
  // Power Draw
  cpuPowerWatts: number;
  cpuStockWatts: number;
  gpuPowerWatts: number;
  gpuStockWatts: number;
  platformPowerWatts: number;
  totalSystemWatts: number;
  totalWallWatts: number;
  peakTransientWatts: number;
  psuRatedWatts: number;
  psuUtilizationPct: number;
  psuSafetyStatus: 'safe' | 'warning' | 'danger';

  // Thermals
  cpuTempC: number;
  cpuJunctionMaxC: number;
  cpuThrottling: boolean;
  cpuThrottlingDropPct: number;
  coolerRatedDissipation: number;
  coolerDeficitWatts: number;

  gpuTempC: number;
  gpuHotspotTempC: number;
  gpuThrottling: boolean;

  caseInternalTempC: number;
  caseDeltaTempC: number;

  estimatedNoiseDb: number;
  overallStabilityScore: number;
  stabilityStatus: 'optimal' | 'moderate' | 'high_heat' | 'throttling_severe';

  // Specific cooling & hardware improvements
  recommendations: StressRecommendation[];
}

export const DEFAULT_STRESS_SETTINGS: StressTestSettings = {
  preset: 'heavy',
  ambientTempC: 22,
  fanCurve: 'balanced',
  avxSyntheticLoad: true,
  transientSpikes: true,
  virtualCoolerUpgrade: false,
  virtualContactFrame: false,
  virtualCaseFans: false,
  virtualUndervolt: false,
};

export function simulateStressTest(
  build: PCBuild,
  settings: StressTestSettings = DEFAULT_STRESS_SETTINGS
): StressTestTelemetry {
  const cpu = build.cpu;
  const gpu = build.gpu;
  const cooler = build.cooler;
  const psu = build.psu;
  const pcCase = build.case;

  // Base hardware specifications
  const isIntel = cpu?.socket?.startsWith('LGA') || cpu?.brand?.toLowerCase().includes('intel');
  const isAmdX3d = cpu?.name?.toLowerCase().includes('x3d');
  const cpuTdpStock = cpu?.tdp || 65;
  const gpuTdpStock = gpu?.tdp || (gpu ? 180 : 0);

  // Overclock multipliers & base offsets
  let cpuPowerMult = 1.0;
  let gpuPowerMult = 1.0;
  let avxExtraWatts = 0;

  switch (settings.preset) {
    case 'stock':
      cpuPowerMult = isIntel ? 1.35 : 1.15; // Intel boosts PL2, AMD boosts PPT at stock
      gpuPowerMult = 1.0;
      avxExtraWatts = settings.avxSyntheticLoad ? 20 : 0;
      break;
    case 'moderate':
      cpuPowerMult = isIntel ? 1.55 : 1.30;
      gpuPowerMult = 1.10;
      avxExtraWatts = settings.avxSyntheticLoad ? 35 : 0;
      break;
    case 'heavy':
      cpuPowerMult = isIntel ? 1.85 : 1.48; // Intel uncapped PL1=PL2=Unlimited (e.g., 280W-320W)
      gpuPowerMult = 1.22; // +22% board power limit
      avxExtraWatts = settings.avxSyntheticLoad ? 50 : 0;
      break;
    case 'extreme':
      cpuPowerMult = isIntel ? 2.15 : 1.65; // Synthetic Prime95 Small FFTs + over-voltage
      gpuPowerMult = 1.35; // FurMark extreme power unlocked
      avxExtraWatts = settings.avxSyntheticLoad ? 65 : 0;
      break;
  }

  // Calculate CPU Power under Stress
  let simulatedCpuWatts = Math.round(cpuTdpStock * cpuPowerMult + avxExtraWatts);
  if (settings.virtualUndervolt) {
    simulatedCpuWatts = Math.max(Math.round(simulatedCpuWatts * 0.88), cpuTdpStock); // -12% / ~30W reduction with curve optimizer
  }

  // Calculate GPU Power under Stress
  const simulatedGpuWatts = Math.round(gpuTdpStock * gpuPowerMult);

  // Platform & Peripherals Power (Motherboard VRM, RAM, NVMe write loads, RGB, Fans)
  const moboWatts = build.motherboard?.tdp || 35;
  const ramWatts = (build.ram?.tdp || 10) * 1.4; // RAM overclocked / heavy memory training
  const storageWatts = (build.storage?.tdp || 8) * 1.5; // NVMe sustained sequential writes
  const fansWatts = (pcCase?.includedFans || 3) * 3 + 12; // Fans + ARGB controllers
  const platformPowerWatts = Math.round(moboWatts + ramWatts + storageWatts + fansWatts);

  // Total System DC Power Draw
  const totalSystemWatts = simulatedCpuWatts + simulatedGpuWatts + platformPowerWatts;

  // PSU Efficiency factor
  let psuEfficiency = 0.88; // Default 80+ Gold baseline
  if (psu?.efficiency === '80+ Platinum' || psu?.efficiency === '80+ Titanium') {
    psuEfficiency = 0.92;
  } else if (psu?.efficiency === '80+ Bronze') {
    psuEfficiency = 0.82;
  }
  const totalWallWatts = Math.round(totalSystemWatts / psuEfficiency);

  // Peak Transient Power Excursion (Microsecond spike from GPU switching regulator)
  let transientMultiplier = settings.transientSpikes ? 1.35 : 1.05;
  if (gpu?.chipset?.includes('4090') || gpu?.chipset?.includes('3090') || gpu?.chipset?.includes('7900 XTX')) {
    transientMultiplier = settings.transientSpikes ? 1.48 : 1.08;
  }
  const peakTransientWatts = Math.round(
    simulatedCpuWatts + (simulatedGpuWatts * transientMultiplier) + platformPowerWatts
  );

  // PSU Capacity Evaluation
  const psuRatedWatts = psu?.wattage || 650;
  const psuUtilizationPct = Math.round((totalSystemWatts / psuRatedWatts) * 100);
  let psuSafetyStatus: 'safe' | 'warning' | 'danger' = 'safe';
  if (psuUtilizationPct >= 95 || peakTransientWatts > psuRatedWatts * 1.15) {
    psuSafetyStatus = 'danger';
  } else if (psuUtilizationPct >= 80) {
    psuSafetyStatus = 'warning';
  }

  // ================= THERMAL MODELING =================
  const ambient = settings.ambientTempC;

  // Case Airflow Factor
  let caseAirflowPenalty = 0;
  if (pcCase) {
    if (pcCase.sidePanel === 'Solid') caseAirflowPenalty += 5.5;
    if (pcCase.sidePanel === 'Mesh') caseAirflowPenalty -= 3.0;
    if (pcCase.includedFans <= 1) caseAirflowPenalty += 4.5;
    else if (pcCase.includedFans >= 4) caseAirflowPenalty -= 2.0;
  } else {
    caseAirflowPenalty += 4.0; // Open or unverified case
  }

  if (settings.virtualCaseFans) {
    caseAirflowPenalty -= 4.0; // Extra intake airflow
  }

  // Fan curve modifier
  let fanCurveBonus = 0;
  let noiseDb = 34; // base balanced
  if (settings.fanCurve === 'silent') {
    fanCurveBonus = 4.5; // Runs hotter
    noiseDb = 27;
  } else if (settings.fanCurve === 'performance') {
    fanCurveBonus = -3.8; // Runs cooler
    noiseDb = 45;
  }

  // Internal Case Ambient Rise
  const heatDissipatedInside = totalSystemWatts;
  const caseDeltaTempC = Math.max(
    Math.round((heatDissipatedInside / 110) * 2.8 + caseAirflowPenalty),
    4
  );
  const caseInternalTempC = Math.round(ambient + caseDeltaTempC);

  // Cooler Rated Dissipation Capacity
  let coolerRatedDissipation = cooler?.maxTdpDissipation || 65; // fallback to 65W stock if none
  if (settings.virtualCoolerUpgrade) {
    coolerRatedDissipation = 320; // High-end 360mm AIO
  }

  const coolerDeficitWatts = Math.max(simulatedCpuWatts - coolerRatedDissipation, 0);

  // CPU Junction Max (TJMax)
  const cpuJunctionMaxC = isAmdX3d ? 89 : isIntel ? 100 : 95;

  // CPU Thermal Dissipation calculation
  // Thermal resistance R_th ~ 60 / coolerRatedDissipation
  let cpuThermalRise = (simulatedCpuWatts / coolerRatedDissipation) * 58;
  cpuThermalRise += caseAirflowPenalty * 0.7;
  cpuThermalRise += fanCurveBonus;

  // Apply virtual thermal mitigations
  if (settings.virtualContactFrame) {
    cpuThermalRise -= 5.5; // Contact frame + thermal paste improvement
  }

  let cpuTempC = Math.round(ambient + cpuThermalRise);

  // Severe throttling clamp and clock degradation
  let cpuThrottling = false;
  let cpuThrottlingDropPct = 0;
  if (cpuTempC >= cpuJunctionMaxC) {
    cpuThrottling = true;
    const overTemp = cpuTempC - cpuJunctionMaxC;
    cpuThrottlingDropPct = Math.min(Math.round(overTemp * 3.5 + 15), 45);
    // Real CPU throttles clock to cap temp near TJMax (+1-3°C emergency headroom)
    cpuTempC = Math.min(cpuTempC, cpuJunctionMaxC + 3);
  }

  // GPU Temperature Calculation
  let gpuTempC = 0;
  let gpuHotspotTempC = 0;
  let gpuThrottling = false;
  if (gpu) {
    const gpuCoolerQuality = gpu.performanceTier >= 4 ? 340 : 250;
    let gpuRise = (simulatedGpuWatts / gpuCoolerQuality) * 44 + (caseDeltaTempC * 0.5) + fanCurveBonus;
    gpuTempC = Math.round(ambient + gpuRise);
    gpuHotspotTempC = Math.round(gpuTempC + 13); // Hotspot is ~12-16°C higher
    if (gpuTempC >= 86 || gpuHotspotTempC >= 102) {
      gpuThrottling = true;
    }
  }

  // Acoustic noise estimation based on thermal load
  if (cpuTempC > 85 || gpuTempC > 80) {
    noiseDb = Math.min(Math.round(noiseDb + 7), 49);
  }

  // Overall Stability Score (0 - 100)
  let stabilityScore = 100;
  if (cpuThrottling) stabilityScore -= 35;
  else if (cpuTempC > 82) stabilityScore -= 15;

  if (gpuThrottling) stabilityScore -= 25;
  else if (gpuTempC > 78) stabilityScore -= 10;

  if (psuSafetyStatus === 'danger') stabilityScore -= 30;
  else if (psuSafetyStatus === 'warning') stabilityScore -= 12;

  if (caseDeltaTempC > 18) stabilityScore -= 10;
  stabilityScore = Math.max(Math.min(stabilityScore, 100), 15);

  let stabilityStatus: 'optimal' | 'moderate' | 'high_heat' | 'throttling_severe' = 'optimal';
  if (stabilityScore >= 85) stabilityStatus = 'optimal';
  else if (stabilityScore >= 70) stabilityStatus = 'moderate';
  else if (stabilityScore >= 45) stabilityStatus = 'high_heat';
  else stabilityStatus = 'throttling_severe';

  // ================= COOLING & HARDWARE IMPROVEMENT RECOMMENDATIONS =================
  const recommendations: StressRecommendation[] = [];

  // 1. Cooler upgrade recommendation
  if (!cooler) {
    recommendations.push({
      id: 'rec-missing-cooler',
      category: 'cooler',
      title: 'Dedicated CPU Cooler Required',
      impactLabel: 'Mandatory for Stability',
      description: `Your configuration lacks a dedicated CPU cooler. Under ${settings.preset} stress (${simulatedCpuWatts}W CPU package power), stock or missing cooling causes instant 100°C thermal throttling.`,
      severity: 'critical',
      suggestedAction: 'Select a 240mm or 360mm AIO liquid cooler or dual-tower air cooler.',
    });
  } else if (coolerDeficitWatts > 0 || cpuThrottling || cpuTempC >= 88) {
    const recommendedTdp = Math.max(Math.ceil((simulatedCpuWatts * 1.25) / 20) * 20, 240);
    recommendations.push({
      id: 'rec-cooler-upgrade',
      category: 'cooler',
      title: 'Thermal Dissipation Deficit: Upgrade Cooler',
      impactLabel: `-${Math.max(cpuTempC - 74, 8)}°C Projected Drop`,
      description: `Current cooler (${cooler.name}) is rated for ${cooler.maxTdpDissipation}W, but heavy overclocking pushes the CPU to ${simulatedCpuWatts}W (${coolerDeficitWatts}W thermal deficit).`,
      severity: cpuThrottling ? 'critical' : 'recommended',
      suggestedAction: `Upgrade to a 360mm Liquid AIO or high-performance dual-tower heatsink rated for >= ${recommendedTdp}W dissipation.`,
    });
  } else if (cooler.type === 'Air Cooler' && simulatedCpuWatts >= 200) {
    recommendations.push({
      id: 'rec-aio-recommendation',
      category: 'cooler',
      title: 'Switch to Top-Mounted Liquid AIO',
      impactLabel: '-6°C to -10°C CPU & GPU Drop',
      description: `Under heavy GPU gaming loads (${simulatedGpuWatts}W), graphics card exhaust rises directly into air cooler fins. A top-mounted AIO radiator exhausts CPU heat directly outside the case.`,
      severity: 'optional',
      suggestedAction: 'Consider a 240mm or 360mm AIO with radiator mounted as top exhaust.',
    });
  }

  // 2. Thermal Paste & Contact Frame
  if (isIntel && simulatedCpuWatts >= 180) {
    recommendations.push({
      id: 'rec-contact-frame',
      category: 'tim_contact_frame',
      title: 'LGA1700 Anti-Bending Contact Frame',
      impactLabel: '-4°C to -7°C Hotspot Reduction',
      description: 'Intel LGA1700 sockets exert uneven central ILM pressure that subtly bows the CPU IHS. Installing an aftermarket CNC contact frame (e.g., Thermalright / Thermal Grizzly) ensures flat cooler contact.',
      severity: 'recommended',
      suggestedAction: 'Pair with Honeywell PTM7950 phase-change pad or Arctic MX-6 compound.',
    });
  } else if (cpuTempC >= 80) {
    recommendations.push({
      id: 'rec-premium-paste',
      category: 'tim_contact_frame',
      title: 'High-Conductivity Thermal Interface Compound',
      impactLabel: '-3°C to -5°C Temperature Shave',
      description: 'Standard silicone paste degrades over sustained heavy thermal cycles. High thermal conductivity paste (12.5+ W/mK) accelerates heat transfer to the cold plate.',
      severity: 'optional',
      suggestedAction: 'Apply Thermal Grizzly Kryonaut, Noctua NT-H2, or Arctic MX-6.',
    });
  }

  // 3. Case Airflow & Intake Pressure
  if ((pcCase?.includedFans || 0) <= 2 || pcCase?.sidePanel === 'Solid' || caseDeltaTempC >= 15) {
    recommendations.push({
      id: 'rec-chassis-airflow',
      category: 'airflow',
      title: 'Optimize Chassis Static Pressure & Fan Count',
      impactLabel: `-${Math.max(caseDeltaTempC - 8, 4)}°C Case Internal Delta-T`,
      description: `System exhausts ${totalSystemWatts}W of heat. With limited case fans or restrictive panels, heat pools around the motherboard VRM and GPU backplate.`,
      severity: caseDeltaTempC >= 18 ? 'critical' : 'recommended',
      suggestedAction: 'Install 2x 140mm high static pressure PWM intake fans (e.g., Arctic P14 / Noctua NF-A14) to maintain positive internal air pressure.',
    });
  }

  // 4. Undervolting & Power Curve Optimizer
  if (simulatedCpuWatts >= 140) {
    recommendations.push({
      id: 'rec-undervolt',
      category: 'voltage_tuning',
      title: 'BIOS Curve Optimizer / CPU Undervolting',
      impactLabel: '-25W to -40W Heat, Zero FPS Loss',
      description: isIntel
        ? 'Intel factory voltage profiles are overly generous for stability. Applying a -0.050V adaptive offset or Intel Lite Load Mode 5 reduces power draw by ~35W while maintaining identical boost clocks.'
        : 'AMD Ryzen Precision Boost Overdrive (PBO2) Curve Optimizer with a -20 to -25 all-core negative offset significantly lowers thermals and allows the boost algorithm to sustain higher clocks for longer.',
      severity: 'recommended',
      suggestedAction: 'Enable Curve Optimizer / Adaptive Voltage offset in motherboard BIOS.',
    });
  }

  // 5. Power Supply (PSU) Headroom
  if (psuSafetyStatus === 'danger') {
    const recommendedPsu = Math.ceil((peakTransientWatts * 1.3) / 100) * 100;
    recommendations.push({
      id: 'rec-psu-danger',
      category: 'psu',
      title: 'Critical PSU Overload Risk (OCP / OPP Trips)',
      impactLabel: 'Prevents Sudden Black Screen Reboots',
      description: `Stress load draws ${totalSystemWatts}W with peak transients hitting ${peakTransientWatts}W, exceeding or straining your ${psuRatedWatts}W PSU (${psuUtilizationPct}% load).`,
      severity: 'critical',
      suggestedAction: `Upgrade to an ${recommendedPsu}W ATX 3.0 / PCIe 5.0 Gold or Platinum power supply.`,
    });
  } else if (psuSafetyStatus === 'warning') {
    recommendations.push({
      id: 'rec-psu-warning',
      category: 'psu',
      title: 'High PSU Rail Load (>80% Capacity)',
      impactLabel: 'Efficiency & Longevity Protection',
      description: `PSU utilization is at ${psuUtilizationPct}%. While functional, running continuous heavy overclocks above 80% triggers aggressive PSU cooling fan curves and reduces capacitor lifespan.`,
      severity: 'optional',
      suggestedAction: 'Consider an 850W+ ATX 3.0 unit for optimal 50-60% efficiency sweet-spot.',
    });
  }

  return {
    cpuPowerWatts: simulatedCpuWatts,
    cpuStockWatts: cpuTdpStock,
    gpuPowerWatts: simulatedGpuWatts,
    gpuStockWatts: gpuTdpStock,
    platformPowerWatts,
    totalSystemWatts,
    totalWallWatts,
    peakTransientWatts,
    psuRatedWatts,
    psuUtilizationPct,
    psuSafetyStatus,

    cpuTempC,
    cpuJunctionMaxC,
    cpuThrottling,
    cpuThrottlingDropPct,
    coolerRatedDissipation,
    coolerDeficitWatts,

    gpuTempC,
    gpuHotspotTempC,
    gpuThrottling,

    caseInternalTempC,
    caseDeltaTempC,

    estimatedNoiseDb: noiseDb,
    overallStabilityScore: stabilityScore,
    stabilityStatus,

    recommendations,
  };
}
