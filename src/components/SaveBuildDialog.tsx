import React, { useState } from 'react';
import { X, Tag, Plus, BookmarkPlus, Check, Sparkles } from 'lucide-react';
import { PCBuild, Currency, Language } from '../types/hardware';
import { calculateTotalPrice } from '../utils/compatibility';

interface SaveBuildDialogProps {
  build: PCBuild;
  currency: Currency;
  language: Language;
  onSave: (name: string, tags: string[], notes?: string) => void;
  onClose: () => void;
  initialTags?: string[];
}

const PRESET_TAGS = [
  'Gaming',
  'Workstation',
  'Budget',
  'High-End',
  'Streaming',
  'Office',
  'Mini-ITX',
  'White Theme',
  'RGB',
  'Esports',
];

export const SaveBuildDialog: React.FC<SaveBuildDialogProps> = ({
  build,
  currency,
  onSave,
  onClose,
  initialTags = [],
}) => {
  // Infer a smart default name based on CPU / GPU
  const defaultName = build.gpu
    ? `${build.gpu.name.split(' ')[0]} ${build.gpu.chipset} Build`
    : build.cpu
    ? `${build.cpu.name} Build`
    : 'Custom PC Build';

  // Smart default tag detection
  const detectedTags: string[] = [...initialTags];
  if (build.gpu && (build.gpu.performanceTier >= 4 || build.gpu.priceUsd > 500)) {
    if (!detectedTags.includes('High-End')) detectedTags.push('High-End');
    if (!detectedTags.includes('Gaming')) detectedTags.push('Gaming');
  } else if (build.gpu && build.gpu.performanceTier <= 2) {
    if (!detectedTags.includes('Budget')) detectedTags.push('Budget');
  } else if (!build.gpu && build.cpu?.hasIntegratedGraphics) {
    if (!detectedTags.includes('Office')) detectedTags.push('Office');
  }

  const [name, setName] = useState(defaultName);
  const [tags, setTags] = useState<string[]>(detectedTags.length > 0 ? detectedTags : ['Gaming']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [notes, setNotes] = useState('');

  const { usd, uzs } = calculateTotalPrice(build);
  const priceFormatted = currency === 'USD'
    ? `$${usd.toLocaleString()}`
    : `${uzs.toLocaleString()} UZS`;

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), tags, notes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BookmarkPlus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                Save PC Configuration
              </h3>
              <p className="text-[11px] text-neutral-400">
                Organize with tags to quickly find and filter later
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Build Name */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Configuration Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ultimate Gaming Rig 2026"
              required
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Custom Tags Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-cyan-400" />
                <span>Custom Tags (Filter by Tags)</span>
              </label>
              <span className="text-[10px] text-neutral-500 font-mono">
                {tags.length} selected
              </span>
            </div>

            {/* Currently Active Tags */}
            <div className="min-h-10 rounded-xl bg-neutral-950 p-2.5 border border-neutral-800 flex flex-wrap gap-1.5 items-center mb-2.5">
              {tags.length === 0 ? (
                <span className="text-[11px] text-neutral-500 italic">
                  No tags added yet. Pick from presets below or type a custom tag.
                </span>
              ) : (
                tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 px-2.5 py-1 text-xs font-medium text-cyan-300 animate-in zoom-in-95"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-cyan-400 hover:text-white rounded-full p-0.5 hover:bg-cyan-500/30 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type custom tag (e.g. 'Silent PC', 'DDR5', 'Blackout')..."
                className="flex-1 rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-cyan-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                disabled={!customTagInput.trim()}
                className="flex items-center gap-1 rounded-xl bg-neutral-800 px-3 py-2 text-xs font-bold text-neutral-200 hover:bg-neutral-700 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-cyan-400" />
                <span>Add</span>
              </button>
            </div>

            {/* Suggested Preset Tag Chips */}
            <div>
              <div className="text-[10px] text-neutral-500 uppercase font-semibold mb-1.5">
                Popular Presets (Click to toggle):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TAGS.map((preset) => {
                  const isSelected = tags.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => toggleTag(preset)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500 text-neutral-950 border-cyan-400 font-bold shadow-sm'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Intended for 1440p gaming and Blender rendering. Upgrading to 64GB RAM next month."
              rows={2}
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-cyan-500 transition-colors resize-none"
            />
          </div>

          {/* Quick build price summary */}
          <div className="rounded-xl bg-neutral-950/70 p-3 border border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-400">Total Config Price:</span>
            <span className="font-mono font-bold text-cyan-400 text-sm">
              {priceFormatted}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-neutral-950 shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer disabled:opacity-50"
            >
              <BookmarkPlus className="h-4 w-4" />
              <span>Save with Tags</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
