import React from 'react';
import { useDNAStore } from '../store/useDNAStore';
import { X, Dna, MousePointer, Layers, Activity, BookOpen } from 'lucide-react';

export const TutorialModal: React.FC = () => {
  const showTutorialModal = useDNAStore((s) => s.showTutorialModal);
  const setShowTutorialModal = useDNAStore((s) => s.setShowTutorialModal);

  if (!showTutorialModal) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <div className="w-full max-w-2xl rounded-xl bg-[#0b0f19] border border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Dna className="w-5 h-5 text-cyan-400" />
            <h2
              id="tutorial-modal-title"
              className="text-base font-bold text-white"
            >
              DNA Explorer Pro — Scientific Instrument Guide
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowTutorialModal(false)}
            aria-label="Close Guide Modal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-300">
          <p className="leading-relaxed">
            Welcome to <strong>DNA Explorer Pro</strong> ("Explore Life at the
            Molecular Scale"), an interactive 3D molecular biology research and
            educational workbench.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <MousePointer className="w-4 h-4 text-cyan-400" />
                <span>3D Camera & Selection Controls</span>
              </div>
              <ul className="space-y-1 text-slate-400">
                <li>· Left-drag to rotate the 3D molecular stage.</li>
                <li>· Scroll wheel to zoom in/out; Right-drag to pan.</li>
                <li>
                  · Click any nucleotide or base pair to inspect its chemistry.
                </li>
                <li>
                  · Double-click a nucleotide (or press Focus BP) to smoothly
                  glide the camera to that step.
                </li>
                <li>
                  · Press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-white font-mono">H</kbd> to collapse/expand the bottom dock, or <kbd className="px-1 py-0.5 bg-slate-800 rounded text-white font-mono">Space</kbd> to Play/Pause.
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>7 Molecular Representation Modes</span>
              </div>
              <ul className="space-y-1 text-slate-400">
                <li>
                  · <strong>Modes A–F</strong>: Switch between Cinematic Helix,
                  Ball-and-Stick, Space-Filling (VDW), Ribbon, Base-Pair
                  Analysis, and Wireframe.
                </li>
                <li>
                  · <strong>Mode G (PDB Viewer)</strong>: Inspect experimental
                  X-ray crystallographic coordinates (1BNA at 1.9 Å) or import
                  local <code>.pdb</code> files and measure interatomic
                  Euclidean distances in Ångströms.
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Replication, Transcription & Chromatin</span>
              </div>
              <ul className="space-y-1 text-slate-400">
                <li>
                  · <strong>Replication Lab</strong>: Observe Helicase unwinding
                  the fork, continuous 5′→3′ Leading Strand synthesis, and
                  discontinuous Lagging Strand Okazaki fragments.
                </li>
                <li>
                  · <strong>Transcription Lab</strong>: Watch RNA Polymerase II
                  synthesize 5′→3′ mRNA with Uracil (U) replacing Thymine (T).
                </li>
                <li>
                  · <strong>Chromatin Scales</strong>: Transition across 5
                  multiscale packaging tiers from single nucleotides to 147 bp
                  Nucleosome Core Particles and 30 nm fibers.
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Bilingual Sinhala + English Learning Lab</span>
              </div>
              <ul className="space-y-1 text-slate-400">
                <li>
                  · Toggle between <strong>සිංහල + EN</strong> and{' '}
                  <strong>English</strong> at any time.
                </li>
                <li>
                  · Select from 4 depth tiers: <em>Beginner</em>,{' '}
                  <em>Intermediate</em>, <em>Advanced</em>, and{' '}
                  <em>Mathematical</em>.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-[#080b12] border-t border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setShowTutorialModal(false)}
            className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-colors"
          >
            Enter Laboratory
          </button>
        </div>
      </div>
    </div>
  );
};
