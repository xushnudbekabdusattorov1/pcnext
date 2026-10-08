import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Currency, 
  Language, 
  PCBuild, 
  HardwareComponent, 
  ComponentCategory, 
  SavedBuild 
} from './types/hardware';
import { COMPONENTS_CATALOG } from './data/components';
import { checkCompatibility } from './utils/compatibility';
import { exportBuildToPdf } from './utils/pdfExport';
import { Navbar } from './components/Navbar';
import { BuilderView } from './components/BuilderView';
import { MyPcPanel } from './components/MyPcPanel';
import { AutoBuildView } from './components/AutoBuildView';
import { FpsBenchmarkModal } from './components/FpsBenchmarkModal';
import { SavedBuildsModal } from './components/SavedBuildsModal';
import { ComponentDetailModal } from './components/ComponentDetailModal';
import { SaveBuildDialog } from './components/SaveBuildDialog';
import { VideoAnimatorModal } from './components/VideoAnimatorModal';
import { CompareBuildsModal } from './components/CompareBuildsModal';
import { BuildAnalysisView } from './components/BuildAnalysisView';
import { DiscordShareModal } from './components/DiscordShareModal';
import { AssemblyGuideModal } from './components/AssemblyGuideModal';
import { AIChatDrawer } from './components/AIChatDrawer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'builder' | 'autobuild' | 'analysis' | 'benchmarks' | 'saved'>('builder');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [language, setLanguage] = useState<Language>('en');
  const [isDark, setIsDark] = useState<boolean>(true);
  
  // Active Build State
  const [build, setBuild] = useState<PCBuild>({});
  
  // Modals State
  const [detailComponent, setDetailComponent] = useState<HardwareComponent | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState<boolean>(false);
  const [isVideoAnimatorOpen, setIsVideoAnimatorOpen] = useState<boolean>(false);
  const [compareBuildIds, setCompareBuildIds] = useState<{ id1: string; id2: string } | null>(null);
  const [discordShareTarget, setDiscordShareTarget] = useState<{
    build: PCBuild;
    name?: string;
    notes?: string;
    tags?: string[];
  } | null>(null);
  const [assemblyGuideTarget, setAssemblyGuideTarget] = useState<PCBuild | null>(null);
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved Builds State (with initial sample tagged builds so user can immediately test tags)
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>(() => {
    try {
      const stored = localStorage.getItem('apexpc_saved_builds');
      if (stored) {
        const parsed: SavedBuild[] = JSON.parse(stored);
        if (parsed.length > 0) {
          return parsed.map((item) => ({
            ...item,
            tags: item.tags && Array.isArray(item.tags) ? item.tags : ['Gaming'],
          }));
        }
      }
      
      // Default tagged starter builds for instant testing
      return [
        {
          id: 'demo-build-1',
          name: 'Apex Esports Crusher (1440p)',
          createdAt: new Date().toLocaleDateString(),
          tags: ['Gaming', 'High-End', 'RGB'],
          build: {
            cpu: COMPONENTS_CATALOG.find((c) => c.id === 'cpu-r7-7800x3d') as any,
            motherboard: COMPONENTS_CATALOG.find((c) => c.id === 'mobo-msi-b650m-a-wifi') as any,
            ram: COMPONENTS_CATALOG.find((c) => c.id === 'ram-corsair-vengeance-32-d5') as any,
            gpu: COMPONENTS_CATALOG.find((c) => c.id === 'gpu-rtx-4070-super-12g') as any,
            storage: COMPONENTS_CATALOG.find((c) => c.id === 'ssd-samsung-990-pro-2tb') as any,
            psu: COMPONENTS_CATALOG.find((c) => c.id === 'psu-corsair-rm750e') as any,
            case: COMPONENTS_CATALOG.find((c) => c.id === 'case-montech-air903-max') as any,
            cooler: COMPONENTS_CATALOG.find((c) => c.id === 'cooler-thermalright-peerless-120') as any,
          },
          notes: 'Tuned for 360+ FPS in CS2 and ultra graphics in Cyberpunk 2077.',
        },
        {
          id: 'demo-build-2',
          name: 'Pro Studio Workstation (3D & Code)',
          createdAt: new Date().toLocaleDateString(),
          tags: ['Workstation', 'High-End'],
          build: {
            cpu: COMPONENTS_CATALOG.find((c) => c.id === 'cpu-i9-14900k') as any,
            motherboard: COMPONENTS_CATALOG.find((c) => c.id === 'mobo-gigabyte-z790-aorus-elite-ax') as any,
            ram: COMPONENTS_CATALOG.find((c) => c.id === 'ram-teamgroup-expert-64-d5') as any,
            gpu: COMPONENTS_CATALOG.find((c) => c.id === 'gpu-rtx-4080-super-16g') as any,
            storage: COMPONENTS_CATALOG.find((c) => c.id === 'ssd-crucial-t700-2tb') as any,
            psu: COMPONENTS_CATALOG.find((c) => c.id === 'psu-seasonic-vertex-gx1000') as any,
            case: COMPONENTS_CATALOG.find((c) => c.id === 'case-fractal-north') as any,
            cooler: COMPONENTS_CATALOG.find((c) => c.id === 'cooler-corsair-h150i-lcd') as any,
          },
          notes: 'Heavy multi-threading workstation for 4K video editing, Docker containers, and Blender cycles.',
        },
        {
          id: 'demo-build-3',
          name: 'Smart Value 1080p Starter',
          createdAt: new Date().toLocaleDateString(),
          tags: ['Budget', 'Office'],
          build: {
            cpu: COMPONENTS_CATALOG.find((c) => c.id === 'cpu-r5-5600x') as any,
            motherboard: COMPONENTS_CATALOG.find((c) => c.id === 'mobo-asrock-b450m-hdv') as any,
            ram: COMPONENTS_CATALOG.find((c) => c.id === 'ram-corsair-lpx-16-d4') as any,
            gpu: COMPONENTS_CATALOG.find((c) => c.id === 'gpu-rx-6600-8g') as any,
            storage: COMPONENTS_CATALOG.find((c) => c.id === 'ssd-crucial-p3-plus-1tb') as any,
            psu: COMPONENTS_CATALOG.find((c) => c.id === 'psu-corsair-cv650') as any,
            case: COMPONENTS_CATALOG.find((c) => c.id === 'case-cm-q300l') as any,
            cooler: COMPONENTS_CATALOG.find((c) => c.id === 'cooler-deepcool-ag400') as any,
          },
          notes: 'Great value entry-level build for 1080p gaming and daily tasks under $600.',
        },
      ];
    } catch {
      return [];
    }
  });

  // Sync dark class on html
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('apexpc_saved_builds', JSON.stringify(savedBuilds));
    } catch (e) {
      console.error(e);
    }
  }, [savedBuilds]);

  // Restore build from URL share parameters on initial mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const buildParam = params.get('build');
      if (buildParam) {
        const ids = buildParam.split(',');
        const restored: PCBuild = {};
        ids.forEach((id) => {
          const comp = COMPONENTS_CATALOG.find((c) => c.id === id);
          if (comp) {
            restored[comp.category] = comp as any;
          }
        });
        if (Object.keys(restored).length > 0) {
          setBuild(restored);
          showToast('Shared PC build loaded successfully!');
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Check compatibility in real-time
  const compatibility = checkCompatibility(build);
  const selectedCount = Object.values(build).filter(Boolean).length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectComponent = (comp: HardwareComponent) => {
    setBuild((prev) => {
      const updated = {
        ...prev,
        [comp.category]: comp,
      };

      // Trigger confetti if all 8 components are selected and 100% compatible!
      const count = Object.values(updated).filter(Boolean).length;
      if (count === 8) {
        const compat = checkCompatibility(updated);
        if (compat.isCompatible) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
          showToast('Epic! All 8 components selected with 100% compatibility!');
        }
      }

      return updated;
    });
  };

  const handleRemoveCategory = (cat: ComponentCategory) => {
    setBuild((prev) => {
      const copy = { ...prev };
      delete copy[cat];
      return copy;
    });
  };

  const handleClearBuild = () => {
    setBuild({});
    showToast('Active build cleared');
  };

  const handleExportPdf = () => {
    exportBuildToPdf(build, currency, 'ApexPC-Custom-Configuration');
    showToast('Quotation PDF generated & downloaded');
  };

  const handleShareLink = () => {
    const ids = Object.values(build)
      .filter(Boolean)
      .map((c) => c?.id)
      .join(',');

    const url = new URL(window.location.href);
    url.searchParams.set('build', ids);
    navigator.clipboard.writeText(url.toString());
    showToast('Shareable link copied to clipboard!');
  };

  const handleOpenDiscordShare = (targetBuild?: PCBuild, name?: string, notes?: string, tags?: string[]) => {
    const b = targetBuild || build;
    const count = Object.values(b).filter(Boolean).length;
    if (count === 0) {
      showToast('Please add at least one component to share to Discord.');
      return;
    }
    setDiscordShareTarget({
      build: b,
      name: name || 'ApexPC Custom Build',
      notes,
      tags,
    });
  };

  // Open the Save Dialog with custom tags
  const handleOpenSaveDialog = () => {
    if (selectedCount === 0) {
      showToast('Please add at least one component before saving.');
      return;
    }
    setIsSaveDialogOpen(true);
  };

  // Execute Save with Name & Custom Tags
  const handleSaveWithTags = (name: string, tags: string[], notes?: string) => {
    const newSaved: SavedBuild = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toLocaleDateString(),
      build,
      tags: tags.length > 0 ? tags : ['Custom'],
      notes,
    };
    setSavedBuilds((prev) => [newSaved, ...prev]);
    showToast(`Build "${name}" saved with ${tags.length} tag(s)!`);
  };

  // Update an existing saved build (tags, name, notes)
  const handleUpdateBuild = (id: string, updated: Partial<SavedBuild>) => {
    setSavedBuilds((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updated } : b))
    );
    showToast('Saved build updated!');
  };

  const handleLoadBuild = (loadedBuild: PCBuild) => {
    setBuild(loadedBuild);
    setActiveTab('builder');
    showToast('Configuration loaded into active builder!');
  };

  const handleDeleteBuild = (id: string) => {
    setSavedBuilds((prev) => prev.filter((b) => b.id !== id));
    showToast('Build deleted');
  };

  const handleApplyAiBuild = (aiBuild: PCBuild) => {
    setBuild(aiBuild);
    setActiveTab('builder');
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
    showToast('AI Build loaded into active workbench!');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 cyber-grid flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-cyan-500 text-neutral-950 px-4 py-2 text-xs font-bold shadow-2xl shadow-cyan-500/30 animate-in fade-in slide-in-from-top-2">
          ✓ {toastMessage}
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        language={language}
        setLanguage={setLanguage}
        isDark={isDark}
        setIsDark={setIsDark}
        selectedCount={selectedCount}
        onOpenVideoAnimator={() => setIsVideoAnimatorOpen(true)}
        onOpenAssemblyGuide={() => setAssemblyGuideTarget(build)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'builder' && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <BuilderView
              build={build}
              onSelectComponent={handleSelectComponent}
              onRemoveCategory={handleRemoveCategory}
              currency={currency}
              language={language}
              compatibility={compatibility}
              onOpenDetails={(c) => setDetailComponent(c)}
              onOpenAutoBuild={() => setActiveTab('autobuild')}
            />

            <MyPcPanel
              build={build}
              onRemoveCategory={handleRemoveCategory}
              onClearBuild={handleClearBuild}
              currency={currency}
              language={language}
              compatibility={compatibility}
              onExportPdf={handleExportPdf}
              onShareLink={handleShareLink}
              onShareDiscord={() => handleOpenDiscordShare(build)}
              onOpenAssemblyGuide={() => setAssemblyGuideTarget(build)}
              onSaveBuild={handleOpenSaveDialog}
              onOpenBenchmarks={() => setActiveTab('benchmarks')}
              onOpenAutoBuild={() => setActiveTab('autobuild')}
              onOpenAnalysis={() => setActiveTab('analysis')}
            />
          </div>
        )}

        {activeTab === 'autobuild' && (
          <AutoBuildView
            currency={currency}
            language={language}
            onApplyBuild={handleApplyAiBuild}
          />
        )}

        {activeTab === 'analysis' && (
          <BuildAnalysisView
            build={build}
            currency={currency}
            language={language}
            onSwitchToBuilder={() => setActiveTab('builder')}
            onOpenAutoBuild={() => setActiveTab('autobuild')}
            onSaveBuild={handleOpenSaveDialog}
            onExportPdf={handleExportPdf}
            onShareDiscord={() => handleOpenDiscordShare(build)}
            onOpenAssemblyGuide={() => setAssemblyGuideTarget(build)}
          />
        )}

        {activeTab === 'benchmarks' && (
          <FpsBenchmarkModal
            build={build}
            language={language}
            onOpenAutoBuild={() => setActiveTab('autobuild')}
          />
        )}

        {activeTab === 'saved' && (
          <SavedBuildsModal
            savedBuilds={savedBuilds}
            onLoadBuild={handleLoadBuild}
            onDeleteBuild={handleDeleteBuild}
            onUpdateBuild={handleUpdateBuild}
            currency={currency}
            language={language}
            onSwitchToBuilder={() => setActiveTab('builder')}
            onShareDiscord={(targetBuild, name, notes, tags) => handleOpenDiscordShare(targetBuild, name, notes, tags)}
            onOpenAssemblyGuide={(targetBuild) => setAssemblyGuideTarget(targetBuild)}
            onOpenCompare={(id1, id2) => setCompareBuildIds({ id1, id2 })}
          />
        )}
      </main>

      {/* Component Details Modal */}
      {detailComponent && (
        <ComponentDetailModal
          component={detailComponent}
          currency={currency}
          onClose={() => setDetailComponent(null)}
          onSelect={handleSelectComponent}
          isSelected={build[detailComponent.category]?.id === detailComponent.id}
        />
      )}

      {/* Save Build with Tags Dialog */}
      {isSaveDialogOpen && (
        <SaveBuildDialog
          build={build}
          currency={currency}
          language={language}
          onSave={handleSaveWithTags}
          onClose={() => setIsSaveDialogOpen(false)}
        />
      )}

      {/* Compare Builds Side-by-Side Modal */}
      {compareBuildIds && (
        <CompareBuildsModal
          builds={savedBuilds}
          initialBuildId1={compareBuildIds.id1}
          initialBuildId2={compareBuildIds.id2}
          currency={currency}
          language={language}
          onClose={() => setCompareBuildIds(null)}
          onLoadBuild={handleLoadBuild}
        />
      )}

      {/* Discord Webhook Share Modal */}
      {discordShareTarget && (
        <DiscordShareModal
          build={discordShareTarget.build}
          buildName={discordShareTarget.name}
          notes={discordShareTarget.notes}
          tags={discordShareTarget.tags}
          currency={currency}
          language={language}
          onClose={() => setDiscordShareTarget(null)}
          onSuccessToast={showToast}
        />
      )}

      {/* Assembly Guide Modal */}
      {assemblyGuideTarget && (
        <AssemblyGuideModal
          build={assemblyGuideTarget}
          isOpen={!!assemblyGuideTarget}
          onClose={() => setAssemblyGuideTarget(null)}
          language={language}
        />
      )}

      {/* Veo Video Animator Modal */}
      {isVideoAnimatorOpen && (
        <VideoAnimatorModal
          onClose={() => setIsVideoAnimatorOpen(false)}
          language={language}
        />
      )}

      {/* AI Assistant Chat Drawer */}
      <AIChatDrawer build={build} language={language} />

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 ApexPC Builder. Powered by Google Gemini AI & Hardware Intelligence Engine.</p>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>UZS & USD Real-time Currency</span>
            <span>•</span>
            <span>AM5 / LGA1700 Sockets</span>
            <span>•</span>
            <span>Custom Tagged Builds</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
