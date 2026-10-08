import { PCBuild, CompatibilityStatus, CompatibilityIssue } from '../types/hardware';

export function checkCompatibility(build: PCBuild): CompatibilityStatus {
  const issues: CompatibilityIssue[] = [];

  // 1. Calculate TDP & Recommended PSU
  const cpuTdp = build.cpu?.tdp || 0;
  const gpuTdp = build.gpu?.tdp || 0;
  const moboTdp = build.motherboard?.tdp || 25;
  const ramTdp = build.ram?.tdp || 10;
  const storageTdp = build.storage?.tdp || 8;
  const coolerTdp = build.cooler?.tdp || 5;
  const baseOverhead = 30; // fans, controllers, chipset

  const totalTdp = cpuTdp + gpuTdp + moboTdp + ramTdp + storageTdp + coolerTdp + baseOverhead;
  
  // Safe power headroom recommendation
  const gpuReqPsu = build.gpu?.recommendedPsuWattage || 0;
  const calculatedRecommendedPsu = Math.max(Math.ceil((totalTdp * 1.35) / 50) * 50, 450, gpuReqPsu);

  // Check 1: CPU Socket vs Motherboard Socket
  if (build.cpu && build.motherboard) {
    if (build.cpu.socket !== build.motherboard.socket) {
      issues.push({
        type: 'error',
        title: 'CPU & Motherboard Incompatible Socket',
        message: `CPU socket ${build.cpu.socket} (${build.cpu.name}) does not match Motherboard socket ${build.motherboard.socket} (${build.motherboard.name}).`,
        affectedCategories: ['cpu', 'motherboard'],
        suggestion: `Choose an ${build.cpu.socket} motherboard or an ${build.motherboard.socket} processor.`,
      });
    }
  }

  // Check 2: RAM Type vs Motherboard RAM Type
  if (build.ram && build.motherboard) {
    if (build.ram.ramType !== build.motherboard.ramType) {
      issues.push({
        type: 'error',
        title: 'RAM & Motherboard Type Mismatch',
        message: `Motherboard ${build.motherboard.name} requires ${build.motherboard.ramType} RAM, but ${build.ram.ramType} (${build.ram.name}) was selected.`,
        affectedCategories: ['ram', 'motherboard'],
        suggestion: `Select a compatible ${build.motherboard.ramType} memory kit.`,
      });
    }
  }

  // Check 3: CPU Supported RAM Type
  if (build.cpu && build.ram) {
    if (!build.cpu.supportedRamType.includes(build.ram.ramType)) {
      issues.push({
        type: 'error',
        title: 'CPU Does Not Support Selected RAM Type',
        message: `${build.cpu.name} only supports ${build.cpu.supportedRamType.join('/')}, but you selected ${build.ram.ramType}.`,
        affectedCategories: ['cpu', 'ram'],
        suggestion: `Switch RAM to ${build.cpu.supportedRamType.join('/')}.`,
      });
    }
  }

  // Check 4: Motherboard Form Factor vs Case Support
  if (build.motherboard && build.case) {
    if (!build.case.formFactorSupport.includes(build.motherboard.formFactor)) {
      issues.push({
        type: 'error',
        title: 'Motherboard Does Not Fit in Case',
        message: `Case ${build.case.name} only supports ${build.case.formFactorSupport.join(', ')} motherboards, but selected motherboard is ${build.motherboard.formFactor}.`,
        affectedCategories: ['motherboard', 'case'],
        suggestion: `Choose an ATX-compatible case or a ${build.case.formFactorSupport.join('/')} motherboard.`,
      });
    }
  }

  // Check 5: Cooler Socket Support
  if (build.cpu && build.cooler) {
    if (!build.cooler.supportedSockets.includes(build.cpu.socket)) {
      issues.push({
        type: 'error',
        title: 'Cooler Socket Incompatible',
        message: `Cooler ${build.cooler.name} does not include brackets for CPU socket ${build.cpu.socket}.`,
        affectedCategories: ['cpu', 'cooler'],
        suggestion: `Pick a cooler that explicitly lists ${build.cpu.socket} mounting support.`,
      });
    }
  }

  // Check 6: Cooler TDP Dissipation vs CPU TDP
  if (build.cpu && build.cooler) {
    if (build.cooler.maxTdpDissipation < build.cpu.tdp) {
      issues.push({
        type: 'warning',
        title: 'Insufficient Cooler Thermal Capacity',
        message: `Cooler dissipation rating (${build.cooler.maxTdpDissipation}W) is lower than CPU thermal design power (${build.cpu.tdp}W). Under heavy load or gaming, thermal throttling may occur.`,
        affectedCategories: ['cooler', 'cpu'],
        suggestion: `Upgrade to a dual-tower air cooler or 240mm/360mm liquid AIO cooler.`,
      });
    }
  }

  // Check 7: Cooler Physical Clearance in Case (Air Cooler Height)
  if (build.cooler && build.case) {
    if (build.cooler.type === 'Air Cooler' && build.cooler.heightMm > build.case.maxCoolerHeightMm) {
      issues.push({
        type: 'error',
        title: 'Air Cooler Too Tall for Case',
        message: `Cooler height is ${build.cooler.heightMm}mm, but case clearance allows a maximum of ${build.case.maxCoolerHeightMm}mm. Side panel will not close.`,
        affectedCategories: ['cooler', 'case'],
        suggestion: `Choose a lower profile cooler (<= ${build.case.maxCoolerHeightMm}mm) or a wider case.`,
      });
    }
  }

  // Check 8: GPU Physical Length vs Case Clearance
  if (build.gpu && build.case) {
    if (build.gpu.lengthMm > build.case.maxGpuLengthMm) {
      issues.push({
        type: 'error',
        title: 'Graphics Card Exceeds Case GPU Length',
        message: `GPU length is ${build.gpu.lengthMm}mm, exceeding the case maximum limit of ${build.case.maxGpuLengthMm}mm.`,
        affectedCategories: ['gpu', 'case'],
        suggestion: `Pick a more compact dual-fan GPU or a case with >= ${build.gpu.lengthMm}mm clearance.`,
      });
    }
  }

  // Check 9: PSU Wattage vs System Load
  if (build.psu) {
    if (build.psu.wattage < calculatedRecommendedPsu) {
      issues.push({
        type: 'error',
        title: 'PSU Wattage Below Recommended Limit',
        message: `Chosen PSU provides ${build.psu.wattage}W, but the recommended capacity for this CPU & GPU combination is at least ${calculatedRecommendedPsu}W (system peak draw: ~${totalTdp}W).`,
        affectedCategories: ['psu', 'gpu', 'cpu'],
        suggestion: `Upgrade to at least a ${calculatedRecommendedPsu}W PSU with 80+ Gold certification for safety and longevity.`,
      });
    }
  }

  // Check 10: Missing GPU when CPU has no integrated graphics
  if (build.cpu && !build.cpu.hasIntegratedGraphics && !build.gpu) {
    issues.push({
      type: 'warning',
      title: 'Dedicated GPU Required for Video Output',
      message: `${build.cpu.name} has no integrated graphics (iGPU). Without a dedicated graphics card, your monitor will receive no video signal.`,
      affectedCategories: ['cpu', 'gpu'],
      suggestion: `Add a dedicated graphics card to your build.`,
    });
  }

  const hasErrors = issues.some(i => i.type === 'error');

  return {
    isCompatible: !hasErrors,
    issues,
    totalTdp,
    recommendedPsu: calculatedRecommendedPsu,
  };
}

export function calculateTotalPrice(build: PCBuild): { usd: number; uzs: number } {
  const components = Object.values(build).filter(Boolean);
  const usd = components.reduce((sum, item) => sum + (item?.priceUsd || 0), 0);
  const uzs = components.reduce((sum, item) => sum + (item?.priceUzs || 0), 0);
  return { usd, uzs };
}
