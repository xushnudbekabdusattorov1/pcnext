export type ComponentCategory = 
  | 'cpu'
  | 'motherboard'
  | 'ram'
  | 'gpu'
  | 'storage'
  | 'psu'
  | 'case'
  | 'cooler';

export type StockStatus = 'in_stock' | 'limited' | 'low_stock';

export interface BaseComponent {
  id: string;
  category: ComponentCategory;
  name: string;
  brand: string;
  priceUsd: number;
  priceUzs: number;
  image: string;
  rating: number;
  reviewsCount: number;
  tdp: number; // in watts
  stockStatus?: StockStatus;
  stockCount?: number;
}

export interface CpuComponent extends BaseComponent {
  category: 'cpu';
  socket: 'AM5' | 'AM4' | 'LGA1700' | 'LGA1851';
  cores: number;
  threads: number;
  baseClock: string;
  boostClock: string;
  hasIntegratedGraphics: boolean;
  supportedRamType: ('DDR4' | 'DDR5')[];
  performanceTier: 1 | 2 | 3 | 4 | 5; // 1 = Entry, 5 = Extreme
}

export interface MotherboardComponent extends BaseComponent {
  category: 'motherboard';
  socket: 'AM5' | 'AM4' | 'LGA1700' | 'LGA1851';
  ramType: 'DDR4' | 'DDR5';
  ramSlots: number;
  formFactor: 'ATX' | 'Micro-ATX' | 'Mini-ITX';
  chipset: string;
  pcieVersion: string;
  m2Slots: number;
  wifi: boolean;
}

export interface RamComponent extends BaseComponent {
  category: 'ram';
  ramType: 'DDR4' | 'DDR5';
  capacityGb: number;
  modules: string; // e.g. "2x16GB"
  speedMhz: number;
  casLatency: number;
  rgb: boolean;
}

export interface GpuComponent extends BaseComponent {
  category: 'gpu';
  vramGb: number;
  vramType: string;
  lengthMm: number;
  recommendedPsuWattage: number;
  chipset: string; // e.g. "RTX 4070 Super", "RX 7800 XT"
  performanceTier: 1 | 2 | 3 | 4 | 5;
}

export interface StorageComponent extends BaseComponent {
  category: 'storage';
  type: 'NVMe M.2 SSD' | 'SATA 2.5 SSD' | 'HDD 3.5';
  capacityGb: number;
  readSpeedMbps: number;
  writeSpeedMbps: number;
  interface: string;
}

export interface PsuComponent extends BaseComponent {
  category: 'psu';
  wattage: number;
  efficiency: '80+ Bronze' | '80+ Gold' | '80+ Platinum' | '80+ Titanium';
  modular: 'Non-Modular' | 'Semi-Modular' | 'Fully Modular';
  formFactor: 'ATX' | 'SFX';
}

export interface CaseComponent extends BaseComponent {
  category: 'case';
  formFactorSupport: ('ATX' | 'Micro-ATX' | 'Mini-ITX')[];
  maxGpuLengthMm: number;
  maxCoolerHeightMm: number;
  includedFans: number;
  sidePanel: 'Tempered Glass' | 'Mesh' | 'Solid';
  rgb: boolean;
  color: 'Black' | 'White';
}

export interface CoolerComponent extends BaseComponent {
  category: 'cooler';
  type: 'Air Cooler' | '240mm AIO' | '360mm AIO';
  heightMm: number; // For air coolers height, for AIO radiator size
  supportedSockets: ('AM5' | 'AM4' | 'LGA1700' | 'LGA1851')[];
  maxTdpDissipation: number; // in watts
  rgb: boolean;
}

export type HardwareComponent =
  | CpuComponent
  | MotherboardComponent
  | RamComponent
  | GpuComponent
  | StorageComponent
  | PsuComponent
  | CaseComponent
  | CoolerComponent;

export type PCBuild = {
  cpu?: CpuComponent;
  motherboard?: MotherboardComponent;
  ram?: RamComponent;
  gpu?: GpuComponent;
  storage?: StorageComponent;
  psu?: PsuComponent;
  case?: CaseComponent;
  cooler?: CoolerComponent;
};

export interface CompatibilityIssue {
  type: 'error' | 'warning';
  title: string;
  message: string;
  affectedCategories: ComponentCategory[];
  suggestion?: string;
}

export interface CompatibilityStatus {
  isCompatible: boolean;
  issues: CompatibilityIssue[];
  totalTdp: number;
  recommendedPsu: number;
}

export type Currency = 'USD' | 'UZS';
export type Language = 'en' | 'uz' | 'ru';

export type BuildPurpose = 
  | 'gaming'
  | 'office'
  | 'programming'
  | 'video_editing'
  | 'rendering_3d'
  | 'streaming';

export interface AIBuildTier {
  tierName: 'Budget' | 'Balanced' | 'High-End';
  totalPriceUsd: number;
  totalPriceUzs: number;
  summary: string;
  components: {
    category: ComponentCategory;
    componentId?: string;
    name: string;
    priceUsd: number;
    priceUzs: number;
    reason: string;
  }[];
  pros: string[];
  cons: string[];
  fpsEstimate: {
    game: string;
    fps1080p: number;
    fps1440p: number;
  }[];
}

export interface AIAutoBuildResponse {
  purpose: string;
  budgetTarget: number;
  currency: Currency;
  isBudgetTight: boolean;
  advice: string;
  tiers: AIBuildTier[];
}

export interface SavedBuild {
  id: string;
  name: string;
  createdAt: string;
  build: PCBuild;
  tags?: string[];
  notes?: string;
}

export interface BuildAnalysisStrength {
  title: string;
  description: string;
}

export interface BuildAnalysisWeakness {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface BuildAnalysisUpgradeStep {
  phase: string;
  targetComponent: string;
  recommendation: string;
  estimatedImpact: string;
}

export interface BuildAnalysisReport {
  overallScore: number;
  tierLabel: string;
  summary: string;
  strengths: BuildAnalysisStrength[];
  weaknesses: BuildAnalysisWeakness[];
  upgradeRoadmap: BuildAnalysisUpgradeStep[];
  longevityYears: string;
  primaryUseVerdict: string;
}
