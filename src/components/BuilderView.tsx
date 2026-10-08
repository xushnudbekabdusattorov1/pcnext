import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Layers, 
  MemoryStick, 
  Tv2, 
  HardDrive, 
  Zap, 
  Box, 
  Fan, 
  Search, 
  Check, 
  Plus, 
  AlertTriangle,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import { 
  ComponentCategory, 
  HardwareComponent, 
  PCBuild, 
  Currency, 
  Language, 
  CompatibilityStatus 
} from '../types/hardware';
import { COMPONENTS_CATALOG } from '../data/components';
import { TRANSLATIONS } from '../data/translations';

interface BuilderViewProps {
  build: PCBuild;
  onSelectComponent: (component: HardwareComponent) => void;
  onRemoveCategory: (category: ComponentCategory) => void;
  currency: Currency;
  language: Language;
  compatibility: CompatibilityStatus;
  onOpenDetails: (component: HardwareComponent) => void;
  onOpenAutoBuild: () => void;
}

export const BuilderView: React.FC<BuilderViewProps> = ({
  build,
  onSelectComponent,
  currency,
  language,
  compatibility,
  onOpenDetails,
  onOpenAutoBuild,
}) => {
  const t = TRANSLATIONS[language];
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('cpu');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'limited'>('all');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating'>('price_asc');

  const categories: { id: ComponentCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'cpu', label: t.cat_cpu, icon: <Cpu className="h-4 w-4" /> },
    { id: 'motherboard', label: t.cat_motherboard, icon: <Layers className="h-4 w-4" /> },
    { id: 'ram', label: t.cat_ram, icon: <MemoryStick className="h-4 w-4" /> },
    { id: 'gpu', label: t.cat_gpu, icon: <Tv2 className="h-4 w-4" /> },
    { id: 'storage', label: t.cat_storage, icon: <HardDrive className="h-4 w-4" /> },
    { id: 'psu', label: t.cat_psu, icon: <Zap className="h-4 w-4" /> },
    { id: 'case', label: t.cat_case, icon: <Box className="h-4 w-4" /> },
    { id: 'cooler', label: t.cat_cooler, icon: <Fan className="h-4 w-4" /> },
  ];

  // Filter components by active category
  const categoryComponents = useMemo(() => {
    return COMPONENTS_CATALOG.filter((c) => c.category === activeCategory);
  }, [activeCategory]);

  // Distinct brands for current category
  const brands = useMemo(() => {
    const list = Array.from(new Set(categoryComponents.map((c) => c.brand)));
    return ['all', ...list];
  }, [categoryComponents]);

  // Filter & sort
  const filteredComponents = useMemo(() => {
    let result = categoryComponents.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = selectedBrand === 'all' || c.brand === selectedBrand;
      const matchesStock = stockFilter === 'all' ||
                           (stockFilter === 'in_stock' && (c.stockStatus === 'in_stock' || !c.stockStatus)) ||
                           (stockFilter === 'limited' && (c.stockStatus === 'limited' || c.stockStatus === 'low_stock'));
      return matchesSearch && matchesBrand && matchesStock;
    });

    result.sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceUsd - b.priceUsd;
      if (sortBy === 'price_desc') return b.priceUsd - a.priceUsd;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

    return result;
  }, [categoryComponents, searchQuery, selectedBrand, sortBy, stockFilter]);

  // Check if current category has any compatibility issue
  const categoryIssues = compatibility.issues.filter((i) =>
    i.affectedCategories.includes(activeCategory)
  );

  return (
    <div className="flex-1 space-y-6">
      {/* AI banner callout */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-neutral-900 to-cyan-950/40 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-white tracking-wide">
                Need an optimal PC configured in 3 seconds?
              </h3>
              <p className="text-xs text-neutral-400">
                Enter your budget and purpose — AI will allocate the best parts for maximum FPS & longevity.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAutoBuild}
            className="whitespace-nowrap flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:from-purple-400 hover:to-pink-400 transition-all hover:scale-105"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Launch AI Auto-Build</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => {
            const isSelected = Boolean(build[cat.id]);
            const isActive = activeCategory === cat.id;
            const hasIssue = compatibility.issues.some((i) => i.affectedCategories.includes(cat.id));

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSelectedBrand('all');
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all border ${
                  isActive
                    ? 'bg-neutral-900 text-cyan-400 border-cyan-500 shadow-md shadow-cyan-500/15'
                    : 'bg-neutral-950/70 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : 'text-neutral-500'}>
                  {cat.icon}
                </span>
                <span>{cat.label}</span>
                {isSelected && (
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                    hasIssue ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {hasIssue ? '!' : '✓'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-xl bg-neutral-900 border border-neutral-800 py-2.5 pl-9 pr-4 text-xs text-white placeholder-neutral-500 outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Brand Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2.5 text-xs text-neutral-300 outline-none focus:border-cyan-500 cursor-pointer"
          >
            {brands.map((b) => (
              <option key={b} value={b}>
                {b === 'all' ? t.allBrands : b}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2.5 text-xs text-neutral-300 outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">📦 All Inventory</option>
            <option value="in_stock">🟢 {t.inStock}</option>
            <option value="limited">⚡ {t.limitedStock}</option>
          </select>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2.5 text-xs text-neutral-300 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="price_asc">{t.priceLowHigh}</option>
              <option value="price_desc">{t.priceHighLow}</option>
              <option value="rating">{t.ratingHighLow}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Compatibility Alerts */}
      {categoryIssues.length > 0 && (
        <div className="space-y-2">
          {categoryIssues.map((issue, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 rounded-xl p-3.5 border text-xs ${
                issue.type === 'error'
                  ? 'border-red-500/40 bg-red-950/20 text-red-300'
                  : 'border-amber-500/40 bg-amber-950/20 text-amber-300'
              }`}
            >
              <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${
                issue.type === 'error' ? 'text-red-400' : 'text-amber-400'
              }`} />
              <div>
                <p className="font-bold text-white">{issue.title}</p>
                <p className="mt-0.5 text-neutral-300">{issue.message}</p>
                {issue.suggestion && (
                  <p className="mt-1 text-[11px] text-cyan-400 font-medium">
                    💡 Tip: {issue.suggestion}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Components Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComponents.map((component) => {
          const isSelected = build[activeCategory]?.id === component.id;
          const formattedPrice = currency === 'USD'
            ? `$${component.priceUsd.toLocaleString()}`
            : `${component.priceUzs.toLocaleString()} UZS`;

          return (
            <div
              key={component.id}
              className={`group relative flex flex-col justify-between rounded-2xl border bg-neutral-900/90 p-4 transition-all duration-300 hover:shadow-xl ${
                isSelected
                  ? 'border-cyan-500 bg-neutral-900 shadow-lg shadow-cyan-500/15'
                  : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
              }`}
            >
              <div>
                {/* Image & rating & stock status */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-950 border border-neutral-800/80 mb-3 group-hover:border-neutral-700">
                  <img
                    src={component.image}
                    alt={component.name}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 rounded-md bg-neutral-950/80 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-neutral-300 backdrop-blur-sm border border-neutral-800">
                    {component.brand}
                  </div>
                  <div className="absolute top-2 right-2 rounded-md bg-neutral-950/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-sm border border-neutral-800">
                    ★ {component.rating}
                  </div>

                  {/* Real-time Inventory Status Indicator */}
                  <div className="absolute bottom-2 left-2 z-10">
                    {component.stockStatus === 'limited' || component.stockStatus === 'low_stock' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-950/90 px-2 py-0.5 text-[10px] font-bold text-amber-300 backdrop-blur-md border border-amber-500/50 shadow-sm shadow-amber-950/80">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                        </span>
                        <span>{t.limitedStock} ({component.stockCount || 3} {t.unitsLeft})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-950/90 px-2 py-0.5 text-[10px] font-bold text-emerald-400 backdrop-blur-md border border-emerald-500/50 shadow-sm shadow-emerald-950/80">
                        <span className="relative flex h-2 w-2">
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                        </span>
                        <span>{t.inStock} ({component.stockCount || 15} {t.available})</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Component Name */}
                <h4 className="font-heading text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2 leading-tight">
                  {component.name}
                </h4>

                {/* Specs Badges */}
                <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
                  {component.category === 'cpu' && (
                    <>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        Socket {(component as any).socket}
                      </span>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        {(component as any).cores}C / {(component as any).threads}T
                      </span>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        {(component as any).tdp}W TDP
                      </span>
                    </>
                  )}

                  {component.category === 'motherboard' && (
                    <>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        {(component as any).socket}
                      </span>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        {(component as any).formFactor}
                      </span>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        {(component as any).ramType}
                      </span>
                    </>
                  )}

                  {component.category === 'gpu' && (
                    <>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        {(component as any).vramGb}GB {(component as any).vramType}
                      </span>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        {(component as any).lengthMm}mm Length
                      </span>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        {(component as any).tdp}W
                      </span>
                    </>
                  )}

                  {component.category === 'ram' && (
                    <>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        {(component as any).modules}
                      </span>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        {(component as any).speedMhz}MHz
                      </span>
                    </>
                  )}

                  {component.category === 'storage' && (
                    <>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        {(component as any).capacityGb}GB
                      </span>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        {(component as any).readSpeedMbps}MB/s
                      </span>
                    </>
                  )}

                  {component.category === 'psu' && (
                    <>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        {(component as any).wattage}W
                      </span>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        {(component as any).efficiency}
                      </span>
                    </>
                  )}

                  {component.category === 'case' && (
                    <>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        {(component as any).formFactorSupport.join(', ')}
                      </span>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        Max GPU {(component as any).maxGpuLengthMm}mm
                      </span>
                    </>
                  )}

                  {component.category === 'cooler' && (
                    <>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        {(component as any).type}
                      </span>
                      <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-300 font-mono">
                        {(component as any).maxTdpDissipation}W TDP
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Price & Action button */}
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-neutral-500 font-medium">Price</div>
                  <div className="font-mono text-base font-bold text-cyan-400">
                    {formattedPrice}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenDetails(component)}
                    className="rounded-lg bg-neutral-800 px-2.5 py-1.5 text-[11px] font-semibold text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                  >
                    {t.viewDetails}
                  </button>

                  <button
                    onClick={() => onSelectComponent(component)}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shadow-md ${
                      isSelected
                        ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                        : 'bg-cyan-500 text-neutral-950 hover:bg-cyan-400 shadow-cyan-500/20'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        <span>{t.selectComponent}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
