import React, { useEffect } from 'react';
import {
  useDNAStore,
  RepresentationMode,
} from '../store/useDNAStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Crosshair,
  RefreshCw,
} from 'lucide-react';

const REPRESENTATION_OPTIONS: Array<{
  id: RepresentationMode;
  label: string;
}> = [
  { id: 'cinematic', label: 'A · Cinematic Helix' },
  { id: 'ballAndStick', label: 'B · Ball & Stick' },
  { id: 'spaceFilling', label: 'C · Space-Filling (VDW)' },
  { id: 'ribbon', label: 'D · Backbone Ribbon' },
  { id: 'basePair', label: 'E · Base-Pair Analysis' },
  { id: 'wireframe', label: 'F · Wireframe' },
  { id: 'pdbViewer', label: 'G · PDB Coordinates' },
];

export const BottomControlDock: React.FC = () => {
  const isPlaying = useDNAStore((s) => s.isPlaying);
  const animationProgress = useDNAStore((s) => s.animationProgress);
  const animationSpeed = useDNAStore((s) => s.animationSpeed);
  const representationMode = useDNAStore((s) => s.representationMode);
  const labMode = useDNAStore((s) => s.labMode);
  const environment = useDNAStore((s) => s.environment);
  const bottomDockCollapsed = useDNAStore((s) => s.bottomDockCollapsed);

  const togglePlay = useDNAStore((s) => s.togglePlay);
  const setAnimationProgress = useDNAStore((s) => s.setAnimationProgress);
  const setAnimationSpeed = useDNAStore((s) => s.setAnimationSpeed);
  const stepAnimation = useDNAStore((s) => s.stepAnimation);
  const resetAnimation = useDNAStore((s) => s.resetAnimation);
  const setRepresentationMode = useDNAStore((s) => s.setRepresentationMode);
  const triggerCameraPreset = useDNAStore((s) => s.triggerCameraPreset);
  const updateEnvironment = useDNAStore((s) => s.updateEnvironment);
  const setBottomDockCollapsed = useDNAStore((s) => s.setBottomDockCollapsed);

  // Keyboard shortcut 'H' to toggle Zen/Cinema dock collapse, Space to Play/Pause
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'h' || e.key === 'H') {
        setBottomDockCollapsed(!useDNAStore.getState().bottomDockCollapsed);
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        triggerCameraPreset('reset');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setBottomDockCollapsed, togglePlay, triggerCameraPreset]);

  return (
    <div
      className="pointer-events-auto absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-full max-w-[min(960px,95vw)] transition-transform duration-200"
      aria-label="Molecular Viewport Bottom Control Dock"
    >
      {/* Collapse / Expand Handle */}
      <button
        type="button"
        onClick={() => setBottomDockCollapsed(!bottomDockCollapsed)}
        className="px-3 py-1 bg-[#0b0f19] border border-b-0 border-slate-800 rounded-t-lg text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
      >
        {bottomDockCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Show Controls (H)</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Hide Controls (H)</span>
          </>
        )}
      </button>

      {!bottomDockCollapsed && (
        <div className="w-full bg-[#0b0f19]/95 border border-slate-800 rounded-xl px-4 py-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3">
          {/* Playback & Timeline Scrubber */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause Animation' : 'Play Animation'}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-xs hover:bg-cyan-400 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => stepAnimation(-0.08)}
              aria-label="Step Backward"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors shrink-0"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => stepAnimation(0.08)}
              aria-label="Step Forward"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors shrink-0"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={resetAnimation}
              aria-label="Reset Animation Timeline"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Timeline Slider */}
            <div className="flex items-center gap-2 ml-1">
              <label
                htmlFor="timeline-scrubber"
                className="text-[11px] font-mono text-slate-400 whitespace-nowrap shrink-0"
              >
                {labMode === 'replication'
                  ? 'Fork:'
                  : labMode === 'transcription'
                    ? 'RNAP:'
                    : 'Phase:'}
              </label>
              <input
                id="timeline-scrubber"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={animationProgress}
                onChange={(e) =>
                  setAnimationProgress(parseFloat(e.target.value))
                }
                aria-label="Process Animation Timeline"
                className="w-24 sm:w-32 accent-cyan-400 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-cyan-400 tabular-nums w-9 text-right shrink-0">
                {Math.round(animationProgress * 100)}%
              </span>
            </div>

            {/* Speed Selector */}
            <select
              aria-label="Animation Playback Speed"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-[11px] font-mono rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500"
            >
              <option value={0.5}>0.5×</option>
              <option value={1.0}>1.0×</option>
              <option value={1.5}>1.5×</option>
              <option value={2.0}>2.0×</option>
              <option value={3.0}>3.0×</option>
            </select>
          </div>

          {/* Molecular Representation Mode Selector */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="dock-rep-mode"
              className="text-[11px] font-mono text-slate-400 hidden sm:inline whitespace-nowrap shrink-0"
            >
              Mode:
            </label>
            <select
              id="dock-rep-mode"
              aria-label="Molecular Representation Mode"
              value={representationMode}
              onChange={(e) =>
                setRepresentationMode(e.target.value as RepresentationMode)
              }
              className="bg-slate-900 border border-slate-700 text-white text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400"
            >
              {REPRESENTATION_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Camera Views & Labels Toggles */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => triggerCameraPreset('side')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              Side
            </button>
            <button
              type="button"
              onClick={() => triggerCameraPreset('axial')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              Axial
            </button>
            <button
              type="button"
              onClick={() => triggerCameraPreset('focusSelected')}
              aria-label="Focus Camera on Selected Nucleotide"
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-300 hover:bg-slate-800 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Focus BP</span>
            </button>
            <button
              type="button"
              onClick={() =>
                updateEnvironment({ autoRotate: !environment.autoRotate })
              }
              aria-label="Toggle Slow Automatic Orbital Rotation"
              className={`px-2.5 py-1 rounded-lg border text-xs transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 ${
                environment.autoRotate
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <RefreshCw className="w-3 h-3" />
              <span>Orbit</span>
            </button>
            <button
              type="button"
              onClick={() =>
                updateEnvironment({ showLabels: !environment.showLabels })
              }
              aria-label="Toggle Scientific HUD Labels"
              className={`px-2.5 py-1 rounded-lg border text-xs transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 ${
                environment.showLabels
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {environment.showLabels ? (
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
              <span>Labels</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
