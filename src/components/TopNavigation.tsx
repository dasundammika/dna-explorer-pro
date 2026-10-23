import React from 'react';
import {
  useDNAStore,
  LaboratoryMode,
} from '../store/useDNAStore';
import { DNA_PRESET_SEQUENCES } from '../engine/DNASequenceEngine';
import {
  Camera,
  Maximize2,
  RotateCcw,
  PanelLeft,
  PanelRight,
  HelpCircle,
  Dna,
} from 'lucide-react';

export const TopNavigation: React.FC = () => {
  const labMode = useDNAStore((s) => s.labMode);
  const sequence = useDNAStore((s) => s.sequence);
  const leftSidebarOpen = useDNAStore((s) => s.leftSidebarOpen);
  const rightSidebarOpen = useDNAStore((s) => s.rightSidebarOpen);
  const languageMode = useDNAStore((s) => s.languageMode);

  const setLabMode = useDNAStore((s) => s.setLabMode);
  const setLeftSidebarTab = useDNAStore((s) => s.setLeftSidebarTab);
  const setLeftSidebarOpen = useDNAStore((s) => s.setLeftSidebarOpen);
  const setRightSidebarOpen = useDNAStore((s) => s.setRightSidebarOpen);
  const loadPresetSequence = useDNAStore((s) => s.loadPresetSequence);
  const triggerCameraPreset = useDNAStore((s) => s.triggerCameraPreset);
  const triggerScreenshot = useDNAStore((s) => s.triggerScreenshot);
  const setShowTutorialModal = useDNAStore((s) => s.setShowTutorialModal);
  const setLanguageMode = useDNAStore((s) => s.setLanguageMode);

  const handleNavClick = (
    mode: LaboratoryMode,
    tab:
      | 'structure'
      | 'representations'
      | 'inspector'
      | 'sequence'
      | 'processes'
      | 'measurements'
      | 'chromatin'
      | 'learning'
  ) => {
    setLabMode(mode);
    setLeftSidebarTab(tab);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="shrink-0 z-20 bg-[#0b0f19] border-b border-slate-800/90">
      {/* Primary Top Bar: Strict 3-Zone Contract */}
      <header className="flex items-center justify-between gap-8 px-5 py-2.5 border-b border-slate-800/70">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('structure', 'structure');
          }}
          className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          DNA Explorer Pro
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Primary Laboratory Modes"
          className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300"
        >
          <button
            type="button"
            onClick={() => handleNavClick('structure', 'structure')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              labMode === 'structure'
                ? 'text-cyan-400 border-cyan-400'
                : 'border-transparent hover:text-white'
            }`}
          >
            B-DNA Structure
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('replication', 'processes')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              labMode === 'replication'
                ? 'text-cyan-400 border-cyan-400'
                : 'border-transparent hover:text-white'
            }`}
          >
            Replication Lab
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('transcription', 'processes')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              labMode === 'transcription'
                ? 'text-cyan-400 border-cyan-400'
                : 'border-transparent hover:text-white'
            }`}
          >
            Transcription Lab
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('chromatin', 'chromatin')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              labMode === 'chromatin'
                ? 'text-cyan-400 border-cyan-400'
                : 'border-transparent hover:text-white'
            }`}
          >
            Chromatin Scales
          </button>
          <button
            type="button"
            onClick={() => {
              setLeftSidebarTab('learning');
              setRightSidebarOpen(true);
            }}
            className="py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 border-transparent hover:text-white"
          >
            Learning Guide
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={triggerScreenshot}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-md hover:bg-cyan-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Export PNG</span>
          </button>
        </div>
      </header>

      {/* Secondary Workbench Strip: Quick-Try Biological Presets & Instrument Controls */}
      <div className="flex items-center justify-between gap-4 px-4 py-1.5 bg-[#080b12] text-xs overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            aria-label="Toggle Left Molecular Laboratory Sidebar"
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 ${
              leftSidebarOpen
                ? 'bg-slate-800/90 text-cyan-300 border-slate-700'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <PanelLeft className="w-3.5 h-3.5" />
            <span>Lab Panel</span>
          </button>

          <span className="text-slate-700" aria-hidden="true">
            |
          </span>

          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 whitespace-nowrap shrink-0">
            <Dna className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quick Specimens:</span>
          </span>

          <div className="flex items-center gap-1">
            {DNA_PRESET_SEQUENCES.map((preset) => {
              const isActive = sequence === preset.sequence;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => loadPresetSequence(preset.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  {preset.name.split(' (')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Instrument Utility Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Language Mode Switcher (English vs Sinhala + English) */}
          <div
            role="group"
            aria-label="Educational Explanation Language"
            className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5"
          >
            <button
              type="button"
              onClick={() => setLanguageMode('si-en')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                languageMode === 'si-en'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              සිංහල + EN
            </button>
            <button
              type="button"
              onClick={() => setLanguageMode('en')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                languageMode === 'en'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          <button
            type="button"
            onClick={() => triggerCameraPreset('reset')}
            aria-label="Reset 3D Camera"
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </button>

          <button
            type="button"
            onClick={handleFullscreen}
            aria-label="Toggle Fullscreen"
            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors shrink-0"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowTutorialModal(true)}
            aria-label="Open Scientific Instrument Guide"
            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            aria-label="Toggle Right Scientific Inspector"
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 ${
              rightSidebarOpen
                ? 'bg-slate-800/90 text-cyan-300 border-slate-700'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span>Inspector</span>
            <PanelRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
