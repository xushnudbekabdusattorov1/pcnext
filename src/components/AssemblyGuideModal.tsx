import React, { useState, useMemo } from 'react';
import { 
  X, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  Zap, 
  Check, 
  ListOrdered, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  RotateCcw,
  Cpu,
  Monitor
} from 'lucide-react';
import { PCBuild, Language } from '../types/hardware';
import { generateAssemblyPlan, AssemblyStep, ToolRequirement } from '../utils/assemblyGuide';

interface AssemblyGuideModalProps {
  build: PCBuild;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const AssemblyGuideModal: React.FC<AssemblyGuideModalProps> = ({
  build,
  isOpen,
  onClose,
  language
}) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'tools' | 'thermal_paste' | 'cables' | 'checklist'>('steps');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Generate customized assembly plan based on current build components
  const plan = useMemo(() => generateAssemblyPlan(build), [build]);

  if (!isOpen) return null;

  const currentStep: AssemblyStep = plan.steps[currentStepIndex] || plan.steps[0];
  const totalSteps = plan.steps.length;
  const progressPercent = Math.round((completedSteps.size / totalSteps) * 100);

  const toggleStepCompleted = (stepId: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleResetProgress = () => {
    setCompletedSteps(new Set());
    setCurrentStepIndex(0);
  };

  const thermalStep = plan.steps.find(s => s.thermalPasteGuide !== undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="flex flex-col w-full max-w-5xl h-[92vh] rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  PC Assembly & Installation Guide
                </h2>
                <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono text-cyan-400 font-semibold">
                  Customized for your build
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Step-by-step physical manual with required tools, thermal compound instructions, and routing architecture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick summary badges */}
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                ~{plan.totalEstimatedMinutes} mins
              </span>
              <span className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-purple-400" />
                {plan.steps.length} Steps
              </span>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-neutral-800 bg-neutral-950/40 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('steps')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                activeTab === 'steps'
                  ? 'bg-cyan-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <ListOrdered className="h-4 w-4" />
              <span>Step-by-Step Sequence ({plan.steps.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                activeTab === 'tools'
                  ? 'bg-cyan-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Wrench className="h-4 w-4" />
              <span>Tool Requirements ({plan.tools.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('thermal_paste')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                activeTab === 'thermal_paste'
                  ? 'bg-cyan-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Flame className="h-4 w-4" />
              <span>Thermal Paste Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('cables')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                activeTab === 'cables'
                  ? 'bg-cyan-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>Cable Management Tips</span>
            </button>

            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                activeTab === 'checklist'
                  ? 'bg-cyan-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>First Boot Checklist</span>
            </button>
          </div>

          {/* Assembly Progress Meter */}
          <div className="hidden md:flex items-center gap-3 shrink-0 pl-4">
            <div className="text-right">
              <span className="text-[11px] text-neutral-400">Build Progress: </span>
              <span className="font-mono font-bold text-xs text-cyan-400">{completedSteps.size}/{totalSteps} ({progressPercent}%)</span>
            </div>
            <div className="w-24 h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700/50">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {completedSteps.size > 0 && (
              <button 
                onClick={handleResetProgress}
                title="Reset completed checklist"
                className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Main Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: STEPS INTERFACE */}
          {activeTab === 'steps' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              {/* Left Column: Interactive Step Navigator */}
              <div className="lg:col-span-4 flex flex-col space-y-1.5 pr-1 max-h-[70vh] overflow-y-auto">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1 px-1 flex items-center justify-between">
                  <span>Installation Steps</span>
                  <span className="text-[10px] text-cyan-400 font-mono">{plan.steps.length} sequential steps</span>
                </div>

                {plan.steps.map((step, idx) => {
                  const isCurrent = idx === currentStepIndex;
                  const isCompleted = completedSteps.has(step.id);

                  return (
                    <div
                      key={step.id}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                        isCurrent
                          ? 'bg-neutral-800 border-cyan-500/60 shadow-md text-white'
                          : isCompleted
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-neutral-300 hover:border-emerald-500/50'
                          : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Status Checkbox Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStepCompleted(step.id);
                          }}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                            isCompleted
                              ? 'bg-emerald-500 border-emerald-500 text-neutral-950'
                              : 'border-neutral-700 hover:border-neutral-500 text-transparent'
                          }`}
                        >
                          <Check className="h-3 w-3 stroke-[3]" />
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] text-neutral-500">#{step.id}</span>
                            <span className={`font-semibold truncate ${isCurrent ? 'text-cyan-400' : ''}`}>
                              {step.shortTitle}
                            </span>
                          </div>
                          {step.componentName && (
                            <p className="text-[10px] text-neutral-500 truncate">
                              {step.componentName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px] text-neutral-500">
                        <span>{step.estimatedMinutes}m</span>
                        <ChevronRight className={`h-3.5 w-3.5 ${isCurrent ? 'text-cyan-400' : 'text-neutral-600'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Step Details Card */}
              <div className="lg:col-span-8 flex flex-col justify-between bg-neutral-950/60 border border-neutral-800/90 rounded-2xl p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Step Header */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-neutral-800 px-2 py-0.5 text-xs font-mono font-bold text-neutral-300">
                          Step {currentStep.id} of {totalSteps}
                        </span>
                        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                          currentStep.difficulty === 'Easy'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : currentStep.difficulty === 'Moderate'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {currentStep.difficulty}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-neutral-400 font-mono">
                          <Clock className="h-3 w-3 text-cyan-400" />
                          ~{currentStep.estimatedMinutes} minutes
                        </span>
                      </div>

                      {/* Complete Step Toggle */}
                      <button
                        onClick={() => toggleStepCompleted(currentStep.id)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          completedSteps.has(currentStep.id)
                            ? 'bg-emerald-500 text-neutral-950'
                            : 'bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                        <span>{completedSteps.has(currentStep.id) ? 'Completed' : 'Mark as Done'}</span>
                      </button>
                    </div>

                    <h3 className="text-xl font-bold text-white mt-2">
                      {currentStep.title}
                    </h3>

                    <p className="text-sm text-neutral-300 mt-1 leading-relaxed">
                      {currentStep.summary}
                    </p>

                    {/* Component highlight if linked */}
                    {currentStep.componentName && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-neutral-900 border border-neutral-800 p-2.5">
                        <Cpu className="h-4 w-4 text-cyan-400 shrink-0" />
                        <span className="text-xs text-neutral-400">Target Component:</span>
                        <span className="text-xs font-semibold text-white">{currentStep.componentName}</span>
                      </div>
                    )}
                  </div>

                  {/* Tools Needed for this specific step */}
                  {currentStep.toolsNeeded.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs font-bold text-neutral-400 flex items-center gap-1">
                        <Wrench className="h-3.5 w-3.5 text-cyan-400" />
                        Tools required for this step:
                      </span>
                      {currentStep.toolsNeeded.map((t, i) => (
                        <span 
                          key={i} 
                          className="rounded-lg bg-neutral-900 border border-neutral-800 px-2 py-1 text-xs font-mono text-cyan-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Step Instructions */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-[10px]">
                        1
                      </span>
                      Action Steps
                    </h4>
                    <ol className="space-y-2 pl-1">
                      {currentStep.instructions.map((ins, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-neutral-200 leading-relaxed">
                          <span className="font-mono text-cyan-400 font-bold shrink-0 mt-0.5">
                            {i + 1}.
                          </span>
                          <span className="whitespace-pre-line">{ins}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Thermal Paste Details (If step involves cooler) */}
                  {currentStep.thermalPasteGuide && (
                    <div className="rounded-xl bg-gradient-to-r from-orange-950/30 to-amber-950/20 border border-orange-500/30 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-2">
                        <Flame className="h-4 w-4" />
                        <span>Thermal Paste Application Technique for this CPU/Socket</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="bg-neutral-900/80 rounded-lg p-2.5 border border-neutral-800">
                          <span className="text-neutral-400 block text-[10px]">Recommended Pattern</span>
                          <span className="font-bold text-white">{currentStep.thermalPasteGuide.pattern}</span>
                        </div>
                        <div className="bg-neutral-900/80 rounded-lg p-2.5 border border-neutral-800">
                          <span className="text-neutral-400 block text-[10px]">Compound Quantity</span>
                          <span className="font-bold text-cyan-300">{currentStep.thermalPasteGuide.amount}</span>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                        {currentStep.thermalPasteGuide.notes}
                      </p>
                    </div>
                  )}

                  {/* Pro Tips */}
                  {currentStep.proTips.length > 0 && (
                    <div className="rounded-xl bg-purple-950/20 border border-purple-500/30 p-3.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Enthusiast Pro Tips</span>
                      </div>
                      <ul className="space-y-1 text-xs text-neutral-300 pl-4 list-disc">
                        {currentStep.proTips.map((tip, idx) => (
                          <li key={idx} className="leading-relaxed">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {currentStep.warnings.length > 0 && (
                    <div className="rounded-xl bg-red-950/20 border border-red-500/40 p-3.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Avoid Critical Mistakes</span>
                      </div>
                      <ul className="space-y-1 text-xs text-neutral-300 pl-4 list-disc">
                        {currentStep.warnings.map((warn, idx) => (
                          <li key={idx} className="leading-relaxed">{warn}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom Step Navigation Bar */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-neutral-800">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStepIndex === 0}
                    className="flex items-center gap-1.5 rounded-xl bg-neutral-800 px-4 py-2 text-xs font-bold text-neutral-200 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous Step</span>
                  </button>

                  <div className="text-xs text-neutral-400 font-mono">
                    {currentStepIndex + 1} / {totalSteps}
                  </div>

                  <button
                    onClick={handleNextStep}
                    disabled={currentStepIndex === totalSteps - 1}
                    className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 transition-colors cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TOOLS REQUIREMENTS */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-cyan-400" />
                  <span>Required Tools & Materials for This Build</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  You only need basic hand tools to assemble modern PC hardware. Having these items laid out beforehand will prevent frustration and damaged components.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plan.tools.map((tool: ToolRequirement) => (
                  <div
                    key={tool.id}
                    className="rounded-xl bg-neutral-950/80 border border-neutral-800 p-4 flex flex-col justify-between hover:border-neutral-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase font-mono ${
                          tool.category === 'essential'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                            : tool.category === 'recommended'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {tool.category}
                        </span>
                        <Wrench className="h-4 w-4 text-neutral-500" />
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1.5">
                        {tool.name}
                      </h4>

                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Status</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Ready
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: THERMAL PASTE COMPREHENSIVE GUIDE */}
          {activeTab === 'thermal_paste' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Introduction Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-orange-950/40 via-neutral-900 to-amber-950/40 border border-orange-500/30 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Thermal Interface Compound (Paste) Application Protocol
                    </h3>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      Thermal paste fills microscopic fissures between the copper cooler cold plate and the CPU metal lid (IHS). Without it, air pockets trap heat and cause thermal throttling.
                    </p>
                  </div>
                </div>
              </div>

              {/* Socket-Specific Recommendation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wide font-mono mb-2">
                    Your System Hardware
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-neutral-800">
                      <span className="text-neutral-400">Installed Processor:</span>
                      <span className="font-semibold text-white">{build.cpu?.name || 'Standard Multi-Core CPU'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800">
                      <span className="text-neutral-400">CPU Socket:</span>
                      <span className="font-mono text-cyan-300 font-bold">{build.cpu?.socket || build.motherboard?.socket || 'Modern AM5 / LGA'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800">
                      <span className="text-neutral-400">Cooler Type:</span>
                      <span className="font-semibold text-purple-300">{build.cooler?.type || 'Standard Cooler'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-400">TDP Dissipation Needed:</span>
                      <span className="font-mono text-white">{build.cpu?.tdp || 65}W TDP</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4">
                  <div className="text-xs font-bold text-orange-400 uppercase tracking-wide font-mono mb-2">
                    Optimal Application Pattern
                  </div>
                  <div className="text-xs space-y-2 text-neutral-300">
                    <p className="font-semibold text-white">
                      {thermalStep?.thermalPasteGuide?.pattern || 'Five-Dot (Dice 5) or Central Pea'}
                    </p>
                    <p className="leading-relaxed">
                      {thermalStep?.thermalPasteGuide?.amount || 'A small 4mm central bead plus 4 pinhead dots at corners.'}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Mounting pressure from tightening the cooler screws down will spread the paste out into a wafer-thin sheet across the surface automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* The 4 Commandments of Thermal Paste */}
              <div className="rounded-xl bg-neutral-950/60 border border-neutral-800 p-5 space-y-4">
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  The Golden Rules of Thermal Paste Application
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl bg-neutral-900/90 border border-neutral-800 p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                        1
                      </span>
                      <span>Peel Off the Plastic Warning Film!</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      Almost all brand-new CPU coolers ship with a clear plastic sticker on the copper base ("Warning: Peel off before installation"). Leaving this sticker on is responsible for 90% of instantaneous overheating spikes.
                    </p>
                  </div>

                  <div className="rounded-xl bg-neutral-900/90 border border-neutral-800 p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                        2
                      </span>
                      <span>More is Better than Less (Within Reason)</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      Modern quality thermal compounds (like Arctic MX-4, Noctua NT-H1, Thermal Grizzly) are electrically non-conductive. A tiny excess oozing slightly off the IHS edge will cause zero damage, whereas too little paste leaves dry hotspots.
                    </p>
                  </div>

                  <div className="rounded-xl bg-neutral-900/90 border border-neutral-800 p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                        3
                      </span>
                      <span>Do Not Lift After Contact</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      Once the cooler base touches the paste on the CPU, keep steady contact. If you lift the heatsink to "check the spread", you create air pockets. If you break contact, clean both surfaces with 99% alcohol and re-apply fresh paste.
                    </p>
                  </div>

                  <div className="rounded-xl bg-neutral-900/90 border border-neutral-800 p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                        4
                      </span>
                      <span>Diagonal X-Pattern Tightening</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      Screw down opposing diagonal thumbscrews or springs 1 to 2 turns at a time (top-left, then bottom-right, then top-right, then bottom-left). This distributes mounting tension and spreads paste uniformly without tilting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CABLE MANAGEMENT TIPS */}
          {activeTab === 'cables' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="h-4 w-4 text-cyan-400" />
                  <span>Chassis Cable Routing & Airflow Optimization</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Good cable management looks clean through tempered glass, but more importantly, ensures unrestricted intake-to-exhaust wind tunnel airflow and eliminates fan blade strikes.
                </p>
              </div>

              {/* Cable Architecture Cards */}
              <div className="space-y-3">
                {plan.generalCableManagementTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 space-y-2 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="font-mono text-cyan-400 text-xs">0{idx + 1}.</span>
                        <span>{tip.title}</span>
                      </h4>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                        tip.importance === 'critical'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : tip.importance === 'pro-tip'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {tip.importance}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {tip.description}
                    </p>

                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80 text-[11px]">
                      <span className="text-neutral-500 font-mono">Applies to:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {tip.cablesInvolved.map((c, i) => (
                          <span key={i} className="rounded bg-neutral-900 border border-neutral-800 px-2 py-0.5 font-mono text-neutral-300">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Step-by-Step Cable Routing Workflow */}
              <div className="rounded-xl bg-neutral-950/60 border border-neutral-800 p-5 space-y-3">
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Recommended Routing Sequence Order
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-3">
                    <span className="font-mono text-cyan-400 font-bold block mb-1">Phase 1</span>
                    <p className="font-semibold text-white mb-0.5">Front Panel & Audio</p>
                    <p className="text-[11px] text-neutral-400">Route tiny, thin wires first along the case edge channels.</p>
                  </div>
                  <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-3">
                    <span className="font-mono text-cyan-400 font-bold block mb-1">Phase 2</span>
                    <p className="font-semibold text-white mb-0.5">Fan & ARGB Chains</p>
                    <p className="text-[11px] text-neutral-400">Tuck fan daisy-chains into frame recesses.</p>
                  </div>
                  <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-3">
                    <span className="font-mono text-cyan-400 font-bold block mb-1">Phase 3</span>
                    <p className="font-semibold text-white mb-0.5">Heavy 24-Pin & EPS</p>
                    <p className="text-[11px] text-neutral-400">Anchor primary power trunks down the central spine channel.</p>
                  </div>
                  <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-3">
                    <span className="font-mono text-cyan-400 font-bold block mb-1">Phase 4</span>
                    <p className="font-semibold text-white mb-0.5">GPU Power Feeds</p>
                    <p className="text-[11px] text-neutral-400">Straight run through bottom shroud with no cable tension.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FIRST BOOT CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Pre-Power & First Boot Inspection Checklist</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Verify these critical items before turning on the power supply to prevent hardware shorts or wasted diagnostic time.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {plan.firstBootChecklist.map((item, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-neutral-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-neutral-900 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-neutral-200 group-hover:text-white transition-colors">
                        {item}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Troubleshooting Tips */}
              <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 space-y-2">
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-cyan-400" />
                  <span>No Display on First Boot? Check These Common Triggers:</span>
                </h4>
                <ul className="text-xs text-neutral-400 space-y-1.5 pl-4 list-disc">
                  <li><strong className="text-white">Cable plugged into motherboard instead of GPU:</strong> The monitor HDMI/DisplayPort cable must be plugged into the graphics card rear port.</li>
                  <li><strong className="text-white">DDR5 First Boot Training:</strong> High-speed DDR5 memory can take up to 90 seconds on first POST to calibrate timings. Let fans spin undisturbed.</li>
                  <li><strong className="text-white">Motherboard Debug LEDs:</strong> Check the 4 tiny LEDs on the right side of the motherboard (CPU, DRAM, VGA, BOOT) to pinpoint any stuck stage.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-800 bg-neutral-950/80 text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            <Info className="h-3.5 w-3.5 text-cyan-400" />
            <span>Need advice during physical assembly? Consult the motherboard pin diagram booklet or component manuals.</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-800 px-4 py-2 font-bold text-white hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
