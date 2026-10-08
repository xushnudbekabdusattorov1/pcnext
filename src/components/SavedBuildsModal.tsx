import React, { useState, useMemo } from 'react';
import { 
  Bookmark, 
  Trash2, 
  ArrowRight, 
  Calendar, 
  Tag, 
  Plus, 
  X, 
  Search, 
  Filter, 
  Download, 
  Share2, 
  Edit2, 
  Check, 
  Sparkles,
  ArrowLeftRight,
  Scale,
  Wrench
} from 'lucide-react';
import { SavedBuild, Currency, Language, PCBuild } from '../types/hardware';
import { calculateTotalPrice } from '../utils/compatibility';
import { TRANSLATIONS } from '../data/translations';
import { exportBuildToPdf } from '../utils/pdfExport';

interface SavedBuildsModalProps {
  savedBuilds: SavedBuild[];
  onLoadBuild: (build: PCBuild) => void;
  onDeleteBuild: (id: string) => void;
  onUpdateBuild: (id: string, updated: Partial<SavedBuild>) => void;
  currency: Currency;
  language: Language;
  onSwitchToBuilder: () => void;
  onShareLink?: (build: PCBuild) => void;
  onShareDiscord?: (build: PCBuild, name?: string, notes?: string, tags?: string[]) => void;
  onOpenAssemblyGuide?: (build: PCBuild) => void;
  onOpenCompare: (id1: string, id2: string) => void;
}

const COMMON_TAG_SUGGESTIONS = [
  'Gaming',
  'Workstation',
  'Budget',
  'High-End',
  'Streaming',
  'Office',
  'Mini-ITX',
  'White Theme',
  'RGB',
];

export const SavedBuildsModal: React.FC<SavedBuildsModalProps> = ({
  savedBuilds,
  onLoadBuild,
  onDeleteBuild,
  onUpdateBuild,
  currency,
  language,
  onSwitchToBuilder,
  onShareDiscord,
  onOpenAssemblyGuide,
  onOpenCompare,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selection queue for Side-by-Side comparison (max 2 items)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  
  // State for inline adding a tag to a specific build
  const [activeAddTagBuildId, setActiveAddTagBuildId] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState<string>('');
  
  // State for inline editing a build name
  const [editingNameBuildId, setEditingNameBuildId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>('');

  // Extract all unique tags across all saved builds
  const allUniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    savedBuilds.forEach((sb) => {
      if (sb.tags && Array.isArray(sb.tags)) {
        sb.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [savedBuilds]);

  // Count items per tag
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = { All: savedBuilds.length };
    savedBuilds.forEach((sb) => {
      const tags = sb.tags || [];
      tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [savedBuilds]);

  // Filter builds by selectedTag & searchQuery
  const filteredBuilds = useMemo(() => {
    return savedBuilds.filter((sb) => {
      const tags = sb.tags || [];
      const matchesTag = selectedTag === 'All' || tags.includes(selectedTag);
      
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesTag;

      const matchesName = sb.name.toLowerCase().includes(query);
      const matchesTagQuery = tags.some((tg) => tg.toLowerCase().includes(query));
      const matchesNotes = sb.notes ? sb.notes.toLowerCase().includes(query) : false;
      const matchesCpu = sb.build.cpu?.name.toLowerCase().includes(query) || false;
      const matchesGpu = sb.build.gpu?.name.toLowerCase().includes(query) || false;

      return matchesTag && (matchesName || matchesTagQuery || matchesNotes || matchesCpu || matchesGpu);
    });
  }, [savedBuilds, selectedTag, searchQuery]);

  // Toggle selection for comparison
  const toggleCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length < 2) {
        setSelectedForCompare([...selectedForCompare, id]);
      } else {
        // If already 2 selected, replace the 2nd one
        setSelectedForCompare([selectedForCompare[0], id]);
      }
    }
  };

  // Launch compare
  const handleLaunchCompare = () => {
    if (selectedForCompare.length === 2) {
      onOpenCompare(selectedForCompare[0], selectedForCompare[1]);
    } else if (savedBuilds.length >= 2) {
      // Default to first 2 builds if none or only 1 selected
      const firstId = selectedForCompare[0] || savedBuilds[0].id;
      const secondId = savedBuilds.find((b) => b.id !== firstId)?.id || savedBuilds[1].id;
      onOpenCompare(firstId, secondId);
    }
  };

  // Helper to add a tag to a saved build
  const handleAddTagToBuild = (buildId: string, tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    const target = savedBuilds.find((b) => b.id === buildId);
    if (!target) return;
    const currentTags = target.tags || [];
    if (!currentTags.includes(trimmed)) {
      onUpdateBuild(buildId, { tags: [...currentTags, trimmed] });
    }
    setNewTagInput('');
    setActiveAddTagBuildId(null);
  };

  // Helper to remove a tag from a saved build
  const handleRemoveTagFromBuild = (buildId: string, tagToRemove: string) => {
    const target = savedBuilds.find((b) => b.id === buildId);
    if (!target) return;
    const updatedTags = (target.tags || []).filter((tg) => tg !== tagToRemove);
    onUpdateBuild(buildId, { tags: updatedTags });
  };

  // Start inline rename
  const handleStartRename = (sb: SavedBuild) => {
    setEditingNameBuildId(sb.id);
    setEditedName(sb.name);
  };

  // Save inline rename
  const handleSaveRename = (buildId: string) => {
    if (editedName.trim()) {
      onUpdateBuild(buildId, { name: editedName.trim() });
    }
    setEditingNameBuildId(null);
  };

  if (savedBuilds.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500">
          <Bookmark className="h-8 w-8" />
        </div>
        <h2 className="font-heading text-xl font-bold text-white">
          No Saved Builds Yet
        </h2>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Start assembling your custom PC in the builder, then click "Save Build" to tag and store your configurations here.
        </p>
        <button
          onClick={onSwitchToBuilder}
          className="rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-neutral-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          Go to Manual Builder
        </button>
      </div>
    );
  }

  const compareBuild1 = savedBuilds.find((b) => b.id === selectedForCompare[0]);
  const compareBuild2 = savedBuilds.find((b) => b.id === selectedForCompare[1]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2.5">
            <span>{t.savedBuilds}</span>
            <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-cyan-400 border border-cyan-500/30">
              {savedBuilds.length}
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Select any 2 builds to compare specs, costs, and gaming performance side-by-side.
          </p>
        </div>

        {/* Action Controls: Search & Compare Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {savedBuilds.length >= 2 && (
            <button
              onClick={handleLaunchCompare}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-md ${
                selectedForCompare.length === 2
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-neutral-950 shadow-cyan-500/25 animate-pulse'
                  : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              <ArrowLeftRight className="h-3.5 w-3.5 text-cyan-400" />
              <span>Compare Builds</span>
              {selectedForCompare.length > 0 && (
                <span className="rounded-full bg-black/40 px-1.5 py-0.2 text-[10px] font-mono text-cyan-300">
                  {selectedForCompare.length}/2
                </span>
              )}
            </button>
          )}

          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, tag, or GPU..."
              className="w-full rounded-xl bg-neutral-900 border border-neutral-800 py-2 pl-9 pr-4 text-xs text-white placeholder-neutral-500 outline-none focus:border-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tag Filter Toolbar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
          <Filter className="h-3.5 w-3.5 text-cyan-400" />
          <span>Filter by Custom Tag:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* "All" Tag Tab */}
          <button
            onClick={() => setSelectedTag('All')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all border cursor-pointer ${
              selectedTag === 'All'
                ? 'bg-cyan-500 text-neutral-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
            }`}
          >
            <span>All Builds</span>
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
              selectedTag === 'All' ? 'bg-neutral-950 text-cyan-400 font-bold' : 'bg-neutral-800 text-neutral-400'
            }`}>
              {tagCounts['All'] || 0}
            </span>
          </button>

          {/* Dynamic Tags from existing builds */}
          {allUniqueTags.map((tag) => {
            const isSelected = selectedTag === tag;
            const count = tagCounts[tag] || 0;

            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent font-bold shadow-md shadow-purple-500/20'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <Tag className="h-3 w-3 opacity-70" />
                <span>{tag}</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  isSelected ? 'bg-black/30 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered Builds Count Notice */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>
          Showing <strong className="text-white">{filteredBuilds.length}</strong> of {savedBuilds.length} saved builds
          {selectedTag !== 'All' && <span> with tag <strong className="text-cyan-400">"{selectedTag}"</strong></span>}
        </span>
        {selectedTag !== 'All' && (
          <button
            onClick={() => setSelectedTag('All')}
            className="text-cyan-400 hover:underline font-medium"
          >
            Clear tag filter
          </button>
        )}
      </div>

      {/* No results for current filter */}
      {filteredBuilds.length === 0 && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-12 text-center space-y-3">
          <Tag className="h-8 w-8 text-neutral-600 mx-auto" />
          <h3 className="font-heading text-lg font-bold text-white">
            No builds match this filter
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            {selectedTag !== 'All'
              ? `You don't have any saved builds with the tag "${selectedTag}".`
              : `No builds matched your search query "${searchQuery}".`}
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSelectedTag('All');
                setSearchQuery('');
              }}
              className="rounded-xl bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Grid of Saved Build Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredBuilds.map((sb) => {
          const { usd, uzs } = calculateTotalPrice(sb.build);
          const formattedPrice = currency === 'USD'
            ? `$${usd.toLocaleString()}`
            : `${uzs.toLocaleString()} UZS`;

          const selectedCount = Object.values(sb.build).filter(Boolean).length;
          const buildTags = sb.tags || [];

          const isEditingName = editingNameBuildId === sb.id;
          const isAddingTag = activeAddTagBuildId === sb.id;
          const isSelectedForCompare = selectedForCompare.includes(sb.id);
          const compareIndex = selectedForCompare.indexOf(sb.id) + 1;

          return (
            <div
              key={sb.id}
              className={`flex flex-col justify-between rounded-2xl border p-5 shadow-xl transition-all group ${
                isSelectedForCompare
                  ? 'border-cyan-400 bg-neutral-900/95 ring-2 ring-cyan-500/30'
                  : 'border-neutral-800 bg-neutral-900/90 hover:border-neutral-700'
              }`}
            >
              <div>
                {/* Build Header: Name, Compare Checkbox & Actions */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="flex-1 rounded-lg bg-neutral-950 border border-cyan-500 px-2 py-1 text-sm font-bold text-white outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(sb.id);
                          if (e.key === 'Escape') setEditingNameBuildId(null);
                        }}
                      />
                      <button
                        onClick={() => handleSaveRename(sb.id)}
                        className="rounded p-1 text-emerald-400 hover:bg-neutral-800"
                        title="Save name"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingNameBuildId(null)}
                        className="rounded p-1 text-neutral-400 hover:bg-neutral-800"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h3 className="font-heading text-base font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                        {sb.name}
                      </h3>
                      <button
                        onClick={() => handleStartRename(sb)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-neutral-300 transition-opacity"
                        title="Rename build"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Compare toggle button */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleCompare(sb.id)}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer border ${
                        isSelectedForCompare
                          ? 'bg-cyan-500 text-neutral-950 border-cyan-400 font-bold'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                      }`}
                      title={isSelectedForCompare ? 'Deselect from comparison' : 'Select for side-by-side comparison'}
                    >
                      <ArrowLeftRight className="h-3 w-3" />
                      <span>{isSelectedForCompare ? `Selected (#${compareIndex})` : 'Compare'}</span>
                    </button>

                    <button
                      onClick={() => onDeleteBuild(sb.id)}
                      className="rounded p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                      title={t.deleteBuild}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Date & Component Count */}
                <div className="flex items-center gap-2 text-[11px] text-neutral-400 mb-3">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{sb.createdAt}</span>
                  <span>•</span>
                  <span>{selectedCount} components</span>
                </div>

                {/* Custom Tags Section on Card */}
                <div className="mb-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {buildTags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold border transition-all ${
                          selectedTag === tag
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25'
                        }`}
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTagFromBuild(sb.id, tag)}
                          className="text-neutral-400 hover:text-red-400 rounded-full p-0.5 hover:bg-neutral-800 transition-colors"
                          title={`Remove tag "${tag}"`}
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}

                    {/* Add Tag Toggle */}
                    {!isAddingTag && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveAddTagBuildId(sb.id);
                          setNewTagInput('');
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-dashed border-neutral-700 hover:border-cyan-500/50 px-2 py-0.5 text-[11px] font-medium text-neutral-400 hover:text-cyan-400 transition-colors cursor-pointer"
                      >
                        <Plus className="h-2.5 w-2.5" />
                        <span>Add Tag</span>
                      </button>
                    )}
                  </div>

                  {/* Inline Add Tag Input Box */}
                  {isAddingTag && (
                    <div className="mt-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 animate-in fade-in">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTagToBuild(sb.id, newTagInput);
                            }
                            if (e.key === 'Escape') {
                              setActiveAddTagBuildId(null);
                            }
                          }}
                          placeholder="Type custom tag and press Enter..."
                          className="flex-1 rounded-lg bg-neutral-900 border border-neutral-700 px-2.5 py-1 text-xs text-white placeholder-neutral-500 outline-none focus:border-cyan-500"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleAddTagToBuild(sb.id, newTagInput)}
                          disabled={!newTagInput.trim()}
                          className="rounded-lg bg-cyan-500 px-2.5 py-1 text-xs font-bold text-neutral-950 hover:bg-cyan-400 disabled:opacity-40"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveAddTagBuildId(null)}
                          className="rounded-lg p-1 text-neutral-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Quick suggestions to click */}
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        <span className="text-neutral-500 self-center">Suggestions:</span>
                        {COMMON_TAG_SUGGESTIONS.filter((tg) => !buildTags.includes(tg))
                          .slice(0, 4)
                          .map((tg) => (
                            <button
                              key={tg}
                              type="button"
                              onClick={() => handleAddTagToBuild(sb.id, tg)}
                              className="rounded bg-neutral-900 hover:bg-neutral-800 px-1.5 py-0.5 text-neutral-300 hover:text-cyan-300 border border-neutral-800"
                            >
                              + {tg}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Key Hardware Specs Summary */}
                <div className="rounded-xl bg-neutral-950/70 p-3 border border-neutral-800 space-y-1.5 text-xs mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">CPU</span>
                    <span className="font-medium text-white truncate max-w-[210px]">
                      {sb.build.cpu?.name || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">GPU</span>
                    <span className="font-medium text-cyan-400 truncate max-w-[210px]">
                      {sb.build.gpu?.name || 'Integrated / None'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">RAM</span>
                    <span className="font-medium text-neutral-300 truncate max-w-[210px]">
                      {sb.build.ram?.name || 'Not selected'}
                    </span>
                  </div>
                </div>

                {/* Notes if available */}
                {sb.notes && (
                  <p className="text-[11px] text-neutral-400 italic line-clamp-2 mb-3">
                    "{sb.notes}"
                  </p>
                )}
              </div>

              {/* Price & Actions */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase font-mono">
                    Total
                  </span>
                  <span className="font-mono text-lg font-bold text-cyan-400">
                    {formattedPrice}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {onOpenAssemblyGuide && (
                    <button
                      onClick={() => onOpenAssemblyGuide(sb.build)}
                      className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 p-2 text-cyan-400 hover:bg-cyan-500 hover:text-neutral-950 transition-all cursor-pointer"
                      title="View step-by-step assembly guide for this build"
                    >
                      <Wrench className="h-4 w-4" />
                    </button>
                  )}

                  {onShareDiscord && (
                    <button
                      onClick={() => onShareDiscord(sb.build, sb.name, sb.notes, sb.tags)}
                      className="rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/30 p-2 text-[#5865F2] hover:bg-[#5865F2] hover:text-white transition-all cursor-pointer"
                      title="Share this build directly to Discord via Webhook"
                    >
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </button>
                  )}

                  <button
                    onClick={() => exportBuildToPdf(sb.build, currency, sb.name)}
                    className="rounded-xl bg-neutral-800 p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                    title="Export Quotation PDF"
                  >
                    <Download className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onLoadBuild(sb.build)}
                    className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition-all cursor-pointer hover:scale-105"
                  >
                    <span>{t.loadBuild}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Comparison Drawer (when 1 or 2 builds selected) */}
      {selectedForCompare.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92vw] max-w-2xl rounded-2xl border border-cyan-500/40 bg-neutral-950/95 p-3.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                <ArrowLeftRight className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                  <span>Compare Queue:</span>
                  <span className="text-cyan-400">{compareBuild1?.name || 'Build 1'}</span>
                  <span className="text-neutral-500">vs</span>
                  <span className={compareBuild2 ? 'text-purple-400' : 'text-neutral-500 italic'}>
                    {compareBuild2?.name || 'Select second build'}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400">
                  {selectedForCompare.length === 2
                    ? '2 builds ready for side-by-side comparison!'
                    : 'Click "Compare" on one more build card above.'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSelectedForCompare([])}
                className="rounded-xl px-3 py-1.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                Clear
              </button>

              <button
                onClick={handleLaunchCompare}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-2 text-xs font-bold text-neutral-950 hover:from-cyan-400 hover:to-purple-500 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                <span>Compare Side-by-Side</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
