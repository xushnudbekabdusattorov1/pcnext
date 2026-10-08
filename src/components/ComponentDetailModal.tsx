import React from 'react';
import { X, Check, Zap, Info, ShieldCheck } from 'lucide-react';
import { HardwareComponent, Currency } from '../types/hardware';

interface ComponentDetailModalProps {
  component: HardwareComponent | null;
  currency: Currency;
  onClose: () => void;
  onSelect: (component: HardwareComponent) => void;
  isSelected: boolean;
}

export const ComponentDetailModal: React.FC<ComponentDetailModalProps> = ({
  component,
  currency,
  onClose,
  onSelect,
  isSelected,
}) => {
  if (!component) return null;

  const priceText = currency === 'USD'
    ? `$${component.priceUsd.toLocaleString()}`
    : `${component.priceUzs.toLocaleString()} UZS`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 border border-cyan-500/30">
              {component.category}
            </span>
            <span className="text-xs text-neutral-400 font-medium">Brand: {component.brand}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-full sm:w-1/2 aspect-video sm:aspect-square rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 relative group">
              <img
                src={component.image}
                alt={component.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs text-amber-400 backdrop-blur-sm border border-neutral-800">
                ★ {component.rating} ({component.reviewsCount} reviews)
              </div>
            </div>

            <div className="w-full sm:w-1/2 flex flex-col justify-between">
              <div>
                <h3 className="font-heading text-xl font-bold text-white mb-2 leading-tight">
                  {component.name}
                </h3>
                <div className="text-2xl font-mono font-bold text-cyan-400 mb-4">
                  {priceText}
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400 mb-3">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span>TDP / Power Consumption: <strong className="text-white font-mono">{component.tdp}W</strong></span>
                </div>

                {/* Stock Status Indicator */}
                <div className="mb-4">
                  {component.stockStatus === 'limited' || component.stockStatus === 'low_stock' ? (
                    <div className="flex items-center gap-2 rounded-xl bg-amber-950/40 p-2.5 border border-amber-500/30 text-xs text-amber-300">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
                      </span>
                      <div>
                        <span className="font-bold">Limited Availability</span>: Only <strong>{component.stockCount || 3} units remaining</strong> in distribution warehouse!
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-950/40 p-2.5 border border-emerald-500/30 text-xs text-emerald-300">
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                      <div>
                        <span className="font-bold">In Stock</span>: <strong>{component.stockCount || 15} units available</strong> for express dispatch.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-neutral-950/80 p-3.5 border border-neutral-800 text-xs text-neutral-300 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verified 100% Genuine Retail Unit</span>
                </div>
                <p className="text-neutral-400">
                  Backed by standard official distributor warranty with compatibility guarantees in the ApexPC Engine.
                </p>
              </div>
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="mt-6 border-t border-neutral-800 pt-5">
            <h4 className="font-heading text-sm font-semibold tracking-wider text-neutral-300 uppercase mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-cyan-400" />
              Technical Specifications
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              {component.category === 'cpu' && (
                <>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Socket</span>
                    <span className="font-mono font-bold text-white">{(component as any).socket}</span>
                  </div>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Cores / Threads</span>
                    <span className="font-mono font-bold text-white">{(component as any).cores}C / {(component as any).threads}T</span>
                  </div>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Base / Boost Clock</span>
                    <span className="font-mono font-bold text-white">{(component as any).baseClock} / {(component as any).boostClock}</span>
                  </div>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Memory Support</span>
                    <span className="font-mono font-bold text-white">{(component as any).supportedRamType.join(', ')}</span>
                  </div>
                </>
              )}

              {component.category === 'motherboard' && (
                <>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Socket</span>
                    <span className="font-mono font-bold text-white">{(component as any).socket}</span>
                  </div>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Form Factor</span>
                    <span className="font-mono font-bold text-white">{(component as any).formFactor}</span>
                  </div>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">RAM Slots & Type</span>
                    <span className="font-mono font-bold text-white">{(component as any).ramSlots}x {(component as any).ramType}</span>
                  </div>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Chipset & PCIe</span>
                    <span className="font-mono font-bold text-white">{(component as any).chipset} ({(component as any).pcieVersion})</span>
                  </div>
                </>
              )}

              {component.category === 'gpu' && (
                <>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">VRAM</span>
                    <span className="font-mono font-bold text-white">{(component as any).vramGb}GB {(component as any).vramType}</span>
                  </div>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Card Length</span>
                    <span className="font-mono font-bold text-white">{(component as any).lengthMm} mm</span>
                  </div>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Recommended PSU</span>
                    <span className="font-mono font-bold text-white">{(component as any).recommendedPsuWattage}W</span>
                  </div>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Graphics Engine</span>
                    <span className="font-mono font-bold text-white">{(component as any).chipset}</span>
                  </div>
                </>
              )}

              {component.category === 'ram' && (
                <>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Capacity & Modules</span>
                    <span className="font-mono font-bold text-white">{(component as any).capacityGb}GB ({(component as any).modules})</span>
                  </div>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Speed & Latency</span>
                    <span className="font-mono font-bold text-white">{(component as any).speedMhz} MHz (CL{(component as any).casLatency})</span>
                  </div>
                </>
              )}

              {component.category === 'storage' && (
                <>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Capacity & Type</span>
                    <span className="font-mono font-bold text-white">{(component as any).capacityGb}GB ({(component as any).type})</span>
                  </div>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Read / Write Speed</span>
                    <span className="font-mono font-bold text-white">{(component as any).readSpeedMbps} / {(component as any).writeSpeedMbps} MB/s</span>
                  </div>
                </>
              )}

              {component.category === 'psu' && (
                <>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Wattage & Efficiency</span>
                    <span className="font-mono font-bold text-white">{(component as any).wattage}W ({(component as any).efficiency})</span>
                  </div>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Cabling</span>
                    <span className="font-mono font-bold text-white">{(component as any).modular}</span>
                  </div>
                </>
              )}

              {component.category === 'case' && (
                <>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Motherboard Support</span>
                    <span className="font-mono font-bold text-white">{(component as any).formFactorSupport.join(', ')}</span>
                  </div>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Max GPU / Cooler</span>
                    <span className="font-mono font-bold text-white">GPU: {(component as any).maxGpuLengthMm}mm / CPU: {(component as any).maxCoolerHeightMm}mm</span>
                  </div>
                </>
              )}

              {component.category === 'cooler' && (
                <>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Type & Height</span>
                    <span className="font-mono font-bold text-white">{(component as any).type} ({(component as any).heightMm}mm)</span>
                  </div>
                  <div className="rounded-lg bg-neutral-950/60 p-2.5 border border-neutral-800/80">
                    <span className="text-neutral-500 block">Thermal Dissipation</span>
                    <span className="font-mono font-bold text-white">Up to {(component as any).maxTdpDissipation}W TDP</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-950/90 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            Close
          </button>

          <button
            onClick={() => {
              onSelect(component);
              onClose();
            }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-md ${
              isSelected
                ? 'bg-neutral-800 text-neutral-400 hover:text-white'
                : 'bg-cyan-500 text-neutral-950 hover:bg-cyan-400 shadow-cyan-500/20'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="h-4 w-4" />
                <span>Currently in Build</span>
              </>
            ) : (
              <>
                <span>Select for Build</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
