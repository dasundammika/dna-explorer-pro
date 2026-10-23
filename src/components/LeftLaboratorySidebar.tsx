import React, { useState, useRef } from 'react';
import {
  useDNAStore,
  RepresentationMode,
  HighlightFilter,
} from '../store/useDNAStore';
import {
  DNA_PRESET_SEQUENCES,
  generateSeededSequence,
  parseFasta,
  formatFasta,
  transcribeToRNA,
} from '../engine/DNASequenceEngine';
import { calculateAtomDistance } from '../engine/PDBParserEngine';
import {
  Dna,
  Layers,
  Search,
  Edit3,
  Activity,
  Ruler,
  GitBranch,
  Settings,
  Upload,
  Download,
  Shuffle,
  Check,
  AlertCircle,
} from 'lucide-react';

export const LeftLaboratorySidebar: React.FC = () => {
  const leftSidebarOpen = useDNAStore((s) => s.leftSidebarOpen);
  const leftSidebarTab = useDNAStore((s) => s.leftSidebarTab);
  const sequence = useDNAStore((s) => s.sequence);
  const sequenceError = useDNAStore((s) => s.sequenceError);
  const analysis = useDNAStore((s) => s.analysis);
  const selectedBpIndex = useDNAStore((s) => s.selectedBpIndex);
  const selectedStrand = useDNAStore((s) => s.selectedStrand);
  const highlightFilter = useDNAStore((s) => s.highlightFilter);
  const representationMode = useDNAStore((s) => s.representationMode);
  const labMode = useDNAStore((s) => s.labMode);
  const chromatinLevel = useDNAStore((s) => s.chromatinLevel);
  const colorScheme = useDNAStore((s) => s.colorScheme);
  const transcriptionTemplateStrand = useDNAStore(
    (s) => s.transcriptionTemplateStrand
  );
  const animationProgress = useDNAStore((s) => s.animationProgress);
  const pdbStructure = useDNAStore((s) => s.pdbStructure);
  const pdbError = useDNAStore((s) => s.pdbError);
  const measuredAtomIndices = useDNAStore((s) => s.measuredAtomIndices);
  const environment = useDNAStore((s) => s.environment);

  const setLeftSidebarTab = useDNAStore((s) => s.setLeftSidebarTab);
  const setSequence = useDNAStore((s) => s.setSequence);
  const loadPresetSequence = useDNAStore((s) => s.loadPresetSequence);
  const selectNucleotide = useDNAStore((s) => s.selectNucleotide);
  const setHighlightFilter = useDNAStore((s) => s.setHighlightFilter);
  const setRepresentationMode = useDNAStore((s) => s.setRepresentationMode);
  const setLabMode = useDNAStore((s) => s.setLabMode);
  const setChromatinLevel = useDNAStore((s) => s.setChromatinLevel);
  const setColorScheme = useDNAStore((s) => s.setColorScheme);
  const setTranscriptionTemplateStrand = useDNAStore(
    (s) => s.setTranscriptionTemplateStrand
  );
  const importPDBFileText = useDNAStore((s) => s.importPDBFileText);
  const resetPDBToDefault1BNA = useDNAStore((s) => s.resetPDBToDefault1BNA);
  const pickAtomForMeasurement = useDNAStore((s) => s.pickAtomForMeasurement);
  const clearAtomMeasurement = useDNAStore((s) => s.clearAtomMeasurement);
  const updateEnvironment = useDNAStore((s) => s.updateEnvironment);

  // Local Sequence Editor Draft State
  const [seqDraft, setSeqDraft] = useState(sequence);
  const [randomLen, setRandomLen] = useState(16);
  const [randomSeed, setRandomSeed] = useState(1953);
  const [randomGcRatio, setRandomGcRatio] = useState(0.5);
  const [fastaModalText, setFastaModalText] = useState('');
  const [showFastaPaste, setShowFastaPaste] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const pdbFileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync draft when preset changes
  React.useEffect(() => {
    setSeqDraft(sequence);
  }, [sequence]);

  if (!leftSidebarOpen) return null;

  const handleApplySequence = (e: React.FormEvent) => {
    e.preventDefault();
    setSequence(seqDraft);
  };

  const handleGenerateSeededRandom = () => {
    const gen = generateSeededSequence(randomLen, randomSeed, randomGcRatio);
    setSeqDraft(gen);
    setSequence(gen);
  };

  const handleImportFasta = () => {
    const parsed = parseFasta(fastaModalText);
    setSeqDraft(parsed.sequence);
    if (setSequence(parsed.sequence)) {
      setShowFastaPaste(false);
      setFastaModalText('');
    }
  };

  const handleExportFasta = () => {
    const content = formatFasta(
      `DNA_Explorer_Pro_${analysis.lengthBp}bp_GC${analysis.gcPercentage}`,
      sequence
    );
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DNA_Sequence_${analysis.lengthBp}bp.fasta`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      application: 'DNA Explorer Pro',
      modelType: 'Idealized Canonical B-DNA (10.5 bp/turn, 0.34 nm axial rise)',
      analysis,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DNA_Analysis_${analysis.lengthBp}bp.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePDBFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        importPDBFileText(reader.result, file.name);
      }
    };
    reader.readAsText(file);
  };

  const copyString = (label: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 1800);
  };

  const rnaTranscriptData = transcribeToRNA(
    sequence,
    transcriptionTemplateStrand
  );

  const SIDEBAR_TABS: Array<{
    id: typeof leftSidebarTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'structure', label: '1. Structure', icon: Dna },
    { id: 'representations', label: '2. Modes', icon: Layers },
    { id: 'inspector', label: '3. Filters', icon: Search },
    { id: 'sequence', label: '4. Sequence', icon: Edit3 },
    { id: 'processes', label: '5. Processes', icon: Activity },
    { id: 'measurements', label: '6. Metrics', icon: Ruler },
    { id: 'chromatin', label: '7. Chromatin', icon: GitBranch },
    { id: 'learning', label: '8. Settings', icon: Settings },
  ];

  const atomDist =
    measuredAtomIndices[0] !== null &&
    measuredAtomIndices[1] !== null &&
    pdbStructure.atoms[measuredAtomIndices[0]] &&
    pdbStructure.atoms[measuredAtomIndices[1]]
      ? calculateAtomDistance(
          pdbStructure.atoms[measuredAtomIndices[0]],
          pdbStructure.atoms[measuredAtomIndices[1]]
        )
      : null;

  return (
    <aside
      aria-label="Molecular Laboratory Left Sidebar"
      className="w-80 lg:w-[340px] shrink-0 h-full bg-[#0b0f19] border-r border-slate-800/90 flex flex-col z-10 overflow-hidden"
    >
      {/* 8-Module Navigation Grid */}
      <div className="p-2.5 border-b border-slate-800/80 bg-[#080b12]">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-1 mb-1.5">
          Molecular Laboratory Modules
        </div>
        <div className="grid grid-cols-4 gap-1">
          {SIDEBAR_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = leftSidebarTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setLeftSidebarTab(tab.id)}
                className={`px-1.5 py-1.5 rounded text-[11px] font-medium flex flex-col items-center gap-1 transition-colors whitespace-nowrap shrink-0 border ${
                  active
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-900/70 border-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label.split('. ')[1]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Laboratory Module Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* =============================================================== */}
        {/* MODULE 1: DNA STRUCTURE & SPECIMENS                             */}
        {/* =============================================================== */}
        {leftSidebarTab === 'structure' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                01. Canonical B-DNA Structure
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Right-handed antiparallel double helix parameterized with 10.5
                bp/turn, 0.34 nm axial rise, 2.0 nm diameter, and asymmetric
                Major (228°) and Minor (132°) grooves.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-300">
                Reference Biological DNA Specimens
              </div>
              {DNA_PRESET_SEQUENCES.map((preset) => {
                const isSelected = sequence === preset.sequence;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      loadPresetSequence(preset.id);
                      setLabMode('structure');
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white">
                        {preset.name}
                      </span>
                      <span className="text-[11px] font-mono text-cyan-400 shrink-0">
                        {preset.sequence.length} bp
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                      5′-{preset.sequence}-3′
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      {preset.descriptionEn}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Structural Layer Visibility Toggles */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="text-xs font-medium text-slate-300">
                Chemical Substructure Layers
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateEnvironment({
                      showBackbone: !environment.showBackbone,
                    })
                  }
                  className={`px-3 py-1.5 rounded text-xs font-medium border text-left transition-colors ${
                    environment.showBackbone
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Backbone (PO₄ + Sugar)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateEnvironment({ showBases: !environment.showBases })
                  }
                  className={`px-3 py-1.5 rounded text-xs font-medium border text-left transition-colors ${
                    environment.showBases
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Nitrogenous Bases
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateEnvironment({
                      showHydrogenBonds: !environment.showHydrogenBonds,
                    })
                  }
                  className={`px-3 py-1.5 rounded text-xs font-medium border text-left transition-colors ${
                    environment.showHydrogenBonds
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Hydrogen Bonds (2/3)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateEnvironment({
                      showMajorMinorGrooves: !environment.showMajorMinorGrooves,
                    })
                  }
                  className={`px-3 py-1.5 rounded text-xs font-medium border text-left transition-colors ${
                    environment.showMajorMinorGrooves
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Groove Axis Trace
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* MODULE 2: MOLECULAR REPRESENTATION MODES (A–G)                  */}
        {/* =============================================================== */}
        {leftSidebarTab === 'representations' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                02. Molecular Representations
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Switch between 7 structural rendering styles and configure
                nucleotide vs. CPK chemical element color encoding.
              </p>
            </div>

            <div className="space-y-1.5">
              {(
                [
                  {
                    id: 'cinematic',
                    title: 'Mode A · Cinematic Double Helix',
                    desc: 'Tubular sugar-phosphate backbones, extruded 2-ring purines & 1-ring pyrimidines, and dashed H-bonds.',
                  },
                  {
                    id: 'ballAndStick',
                    title: 'Mode B · Ball-and-Stick Atomic',
                    desc: 'Explicit atoms and covalent/glycosidic/phosphodiester bonds.',
                  },
                  {
                    id: 'spaceFilling',
                    title: 'Mode C · Space-Filling / VDW Volume',
                    desc: 'Atoms scaled to calibrated van der Waals radii showing steric groove packing.',
                  },
                  {
                    id: 'ribbon',
                    title: 'Mode D · Backbone / Ribbon',
                    desc: 'Emphasizes antiparallel strand ribbons and helical contour.',
                  },
                  {
                    id: 'basePair',
                    title: 'Mode E · Base-Pair & Groove Analysis',
                    desc: 'Highlights Watson-Crick hydrogen bonding (2 vs 3) and Major/Minor groove traces.',
                  },
                  {
                    id: 'wireframe',
                    title: 'Mode F · Computational Wireframe',
                    desc: 'Polygonal mesh lattice for inspecting 3D topological tessellation.',
                  },
                  {
                    id: 'pdbViewer',
                    title: 'Mode G · Experimental PDB Viewer',
                    desc: 'Renders crystallographic atomic coordinates (1BNA X-ray 1.9 Å or custom .pdb).',
                  },
                ] as Array<{
                  id: RepresentationMode;
                  title: string;
                  desc: string;
                }>
              ).map((item) => {
                const active = representationMode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setLabMode('structure');
                      setRepresentationMode(item.id);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
                      active
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {item.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Color Scheme Switcher */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="text-xs font-medium text-slate-300">
                Color Encoding System
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setColorScheme('nucleotide')}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    colorScheme === 'nucleotide'
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Nucleotide (A/T/G/C)
                </button>
                <button
                  type="button"
                  onClick={() => setColorScheme('cpkElement')}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    colorScheme === 'cpkElement'
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  CPK Elements (C/N/O/P)
                </button>
              </div>
            </div>

            {/* PDB File Import Section */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="text-xs font-medium text-slate-300">
                Experimental Coordinate Import (.PDB)
              </div>
              <input
                ref={pdbFileInputRef}
                type="file"
                accept=".pdb,.ent,.txt"
                onChange={handlePDBFileUpload}
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => pdbFileInputRef.current?.click()}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Import Local .PDB</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetPDBToDefault1BNA();
                    setRepresentationMode('pdbViewer');
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono"
                >
                  Load 1BNA
                </button>
              </div>
              {pdbError && (
                <div className="p-2 rounded bg-rose-950/60 border border-rose-800 text-[11px] text-rose-200">
                  {pdbError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* MODULE 3: NUCLEOTIDE INSPECTOR & HIGHLIGHT FILTERS              */}
        {/* =============================================================== */}
        {leftSidebarTab === 'inspector' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                03. Substructure Highlight Filters
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Isolate specific nucleotides, complementary base pairs, single
                antiparallel strands, or base classes in the 3D helix.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'none', label: 'Show All Uniformly' },
                  { id: 'selectedNucleotide', label: 'One Nucleotide' },
                  { id: 'selectedBasePair', label: 'One Base Pair' },
                  { id: 'strand1', label: 'Strand 1 (5′ → 3′)' },
                  { id: 'strand2', label: 'Strand 2 (3′ → 5′)' },
                  { id: 'allA', label: 'All Adenines (A)' },
                  { id: 'allT', label: 'All Thymines (T)' },
                  { id: 'allG', label: 'All Guanines (G)' },
                  { id: 'allC', label: 'All Cytosines (C)' },
                ] as Array<{ id: HighlightFilter; label: string }>
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setHighlightFilter(f.id)}
                  className={`px-2.5 py-2 rounded-lg border text-xs font-medium text-left transition-colors ${
                    highlightFilter === f.id
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Interactive Base-Pair Step Selector */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">
                  Select Base-Pair Position (1–{analysis.lengthBp})
                </span>
                <span className="font-mono text-cyan-400">
                  BP #{selectedBpIndex + 1} · Strand {selectedStrand}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto pr-1">
                {analysis.sequence5to3.split('').map((b1, idx) => {
                  const b2 = analysis.complementary3to5[idx];
                  const active = idx === selectedBpIndex;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded border font-mono text-xs ${
                        active
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                      }`}
                    >
                      <span className="text-[11px] text-slate-500 w-6">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => selectNucleotide(idx, 1, true)}
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          active && selectedStrand === 1
                            ? 'bg-cyan-400 text-slate-950'
                            : 'text-slate-200 hover:text-cyan-300'
                        }`}
                      >
                        5′-{b1}
                      </button>
                      <span className="text-amber-400">
                        {b1 === 'A' || b1 === 'T' ? '=' : '≡'}
                      </span>
                      <button
                        type="button"
                        onClick={() => selectNucleotide(idx, 2, true)}
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          active && selectedStrand === 2
                            ? 'bg-violet-400 text-slate-950'
                            : 'text-slate-200 hover:text-violet-300'
                        }`}
                      >
                        {b2}-3′
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* MODULE 4: INTERACTIVE DNA SEQUENCE EDITOR                       */}
        {/* =============================================================== */}
        {leftSidebarTab === 'sequence' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                04. Interactive DNA Sequence Editor
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Edit the 5′→3′ primary strand to dynamically rebuild the 3D
                B-DNA double helix and compute antiparallel strands.
              </p>
            </div>

            <form onSubmit={handleApplySequence} className="space-y-2.5">
              <div>
                <label
                  htmlFor="dna-seq-input"
                  className="block text-xs font-medium text-slate-300 mb-1"
                >
                  Primary Strand (5′ → 3′) [A, T, G, C]
                </label>
                <textarea
                  id="dna-seq-input"
                  rows={3}
                  value={seqDraft}
                  onChange={(e) => setSeqDraft(e.target.value.toUpperCase())}
                  placeholder="Enter A, T, G, C sequence (e.g. CGCGAATTCGCG)"
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 uppercase tracking-wider"
                />
              </div>

              {sequenceError && (
                <div
                  role="alert"
                  className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-800 text-xs text-rose-200 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{sequenceError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-colors"
              >
                Apply Sequence & Rebuild 3D Helix
              </button>
            </form>

            {/* Aligned Complementary (3'->5') vs Reverse Complement (5'->3') Readouts */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Aligned Complementary Strand (3′ → 5′)</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyString('comp', analysis.complementary3to5)
                    }
                    className="text-cyan-400 hover:underline font-mono"
                  >
                    {copyFeedback === 'comp' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="text-xs font-mono text-violet-300 break-all">
                  3′-{analysis.complementary3to5}-5′
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Canonical Reverse-Complement (5′ → 3′)</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyString('revcomp', analysis.reverseComplement5to3)
                    }
                    className="text-cyan-400 hover:underline font-mono"
                  >
                    {copyFeedback === 'revcomp' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="text-xs font-mono text-emerald-300 break-all">
                  5′-{analysis.reverseComplement5to3}-3′
                </div>
              </div>
            </div>

            {/* Reproducible Seeded Random Sequence Generator */}
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Seeded Random Sequence Generator</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="rand-length"
                    className="block text-[11px] text-slate-400 mb-1"
                  >
                    Length (bp): {randomLen}
                  </label>
                  <input
                    id="rand-length"
                    type="range"
                    min={6}
                    max={48}
                    value={randomLen}
                    onChange={(e) => setRandomLen( parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-400"
                  />
                </div>
                <div>
                  <label
                    htmlFor="rand-gc"
                    className="block text-[11px] text-slate-400 mb-1"
                  >
                    Target GC: {Math.round(randomGcRatio * 100)}%
                  </label>
                  <input
                    id="rand-gc"
                    type="range"
                    min={0.2}
                    max={0.8}
                    step={0.05}
                    value={randomGcRatio}
                    onChange={(e) => setRandomGcRatio(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="rand-seed"
                  className="text-[11px] font-mono text-slate-400 shrink-0"
                >
                  PRNG Seed:
                </label>
                <input
                  id="rand-seed"
                  type="number"
                  value={randomSeed}
                  onChange={(e) =>
                    setRandomSeed(parseInt(e.target.value, 10) || 1)
                  }
                  className="w-24 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-white"
                />
                <button
                  type="button"
                  onClick={handleGenerateSeededRandom}
                  className="flex-1 py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            {/* FASTA & JSON Import / Export */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="text-xs font-medium text-slate-300">
                Bioinformatics File I/O
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowFastaPaste(!showFastaPaste)}
                  className="px-2 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] font-medium text-slate-200"
                >
                  Paste FASTA
                </button>
                <button
                  type="button"
                  onClick={handleExportFasta}
                  className="px-2 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] font-medium text-slate-200 flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>FASTA</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-2 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] font-medium text-slate-200 flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>JSON</span>
                </button>
              </div>

              {showFastaPaste && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <textarea
                    rows={3}
                    value={fastaModalText}
                    onChange={(e) => setFastaModalText(e.target.value)}
                    placeholder=">Sequence_Header&#10;CGCGAATTCGCG"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono text-white"
                  />
                  <button
                    type="button"
                    onClick={handleImportFasta}
                    className="w-full py-1.5 rounded bg-cyan-500 text-slate-950 font-semibold text-xs"
                  >
                    Load FASTA Sequence
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* MODULE 5: BIOLOGICAL PROCESSES (REPLICATION & TRANSCRIPTION)    */}
        {/* =============================================================== */}
        {leftSidebarTab === 'processes' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                05. Biological Process Laboratories
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Animate conceptual 3D molecular machinery along the current DNA
                sequence.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setLabMode('replication')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  labMode === 'replication'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="text-xs font-semibold text-cyan-300">
                  DNA Replication Fork Lab
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Helicase strand unzipping, continuous 5′→3′ Leading Strand
                  synthesis, and discontinuous 5′→3′ Lagging Strand Okazaki
                  fragments.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLabMode('transcription')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  labMode === 'transcription'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="text-xs font-semibold text-rose-300">
                  RNA Transcription Bubble Lab
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Local DNA unwinding inside RNA Polymerase II with 5′→3′ mRNA
                  synthesis incorporating Uracil (U) instead of Thymine (T).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLabMode('structure')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                  labMode === 'structure'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400'
                }`}
              >
                Return to Static B-DNA Structure
              </button>
            </div>

            {/* Process-Specific Telemetry & Controls */}
            {labMode === 'replication' && (
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2.5">
                <div className="text-xs font-semibold text-white">
                  Replication Fork Progression:{' '}
                  <span className="font-mono text-cyan-400">
                    {Math.round(animationProgress * 100)}%
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div>
                    <span className="text-cyan-400 font-mono">Helicase:</span>{' '}
                    Disrupting Watson-Crick H-bonds at BP #
                    {Math.max(
                      1,
                      Math.round(animationProgress * analysis.lengthBp)
                    )}
                  </div>
                  <div>
                    <span className="text-emerald-400 font-mono">
                      Leading Strand (5′→3′):
                    </span>{' '}
                    Continuous synthesis reading 3′→5′ parental template toward
                    the fork.
                  </div>
                  <div>
                    <span className="text-amber-400 font-mono">
                      Lagging Strand (5′→3′):
                    </span>{' '}
                    Discontinuous Okazaki fragments synthesized away from the
                    fork.
                  </div>
                </div>
              </div>
            )}

            {labMode === 'transcription' && (
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-white">
                  Template Strand Selection
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTranscriptionTemplateStrand('antisense')}
                    className={`px-2 py-1.5 rounded text-[11px] font-medium border ${
                      transcriptionTemplateStrand === 'antisense'
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    3′→5′ Antisense (Std)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTranscriptionTemplateStrand('sense')}
                    className={`px-2 py-1.5 rounded text-[11px] font-medium border ${
                      transcriptionTemplateStrand === 'sense'
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Primary Strand (3′←5′)
                  </button>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 mb-1">
                    Full Resulting mRNA Transcript (5′ → 3′) [Uracil U in Rose]:
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-xs break-all tracking-wider">
                    5′-
                    {rnaTranscriptData.mRNA5to3.split('').map((ch, idx) => (
                      <span
                        key={idx}
                        className={
                          ch === 'U'
                            ? 'text-rose-400 font-bold'
                            : ch === 'A'
                              ? 'text-emerald-400'
                              : ch === 'G'
                                ? 'text-blue-400'
                                : 'text-amber-300'
                        }
                      >
                        {ch}
                      </span>
                    ))}
                    -3′
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =============================================================== */}
        {/* MODULE 6: STRUCTURAL MEASUREMENTS & PDB DISTANCE TOOL           */}
        {/* =============================================================== */}
        {leftSidebarTab === 'measurements' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                06. Scientific Measurements
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Quantitative geometric & thermodynamic parameters with explicit
                nm, Å, and degree units.
              </p>
            </div>

            {/* Data Provenance Notice */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
              <span className="font-mono text-cyan-400 font-semibold">
                PROVENANCE:
              </span>{' '}
              {representationMode === 'pdbViewer'
                ? `Experimental Crystallographic Coordinates (PDB: ${pdbStructure.pdbId})`
                : 'Idealized Canonical B-DNA Fiber Parameters'}
            </div>

            {/* Quantitative Telemetry Table */}
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">
                  Base-Pair Count
                </div>
                <div className="text-base font-bold text-white tabular-nums mt-0.5">
                  {analysis.lengthBp}{' '}
                  <span className="text-xs font-normal text-slate-400">bp</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">
                  Contour Length
                </div>
                <div className="text-base font-bold text-cyan-400 tabular-nums mt-0.5">
                  {analysis.contourLengthNm}{' '}
                  <span className="text-xs font-normal text-slate-400">nm</span>
                </div>
                <div className="text-[10px] text-slate-400 tabular-nums">
                  {analysis.contourLengthAngstrom} Å
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">
                  Helical Turns
                </div>
                <div className="text-base font-bold text-white tabular-nums mt-0.5">
                  {analysis.helicalTurns}{' '}
                  <span className="text-xs font-normal text-slate-400">
                    turns
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">
                  GC Content
                </div>
                <div className="text-base font-bold text-emerald-400 tabular-nums mt-0.5">
                  {analysis.gcPercentage.toFixed(1)}
                  <span className="text-xs font-normal text-slate-400">%</span>
                </div>
                <div className="text-[10px] text-slate-400 tabular-nums">
                  AT: {analysis.atPercentage.toFixed(1)}%
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">
                  Mean Axial Rise
                </div>
                <div className="text-sm font-bold text-white tabular-nums mt-0.5">
                  0.34 <span className="text-xs font-normal text-slate-400">nm</span>{' '}
                  <span className="text-[11px] text-slate-400">(3.4 Å)</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">
                  Mean Helical Twist
                </div>
                <div className="text-sm font-bold text-white tabular-nums mt-0.5">
                  34.29<span className="text-xs font-normal text-slate-400">°/bp</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">
                  Helix Diameter
                </div>
                <div className="text-sm font-bold text-white tabular-nums mt-0.5">
                  2.00 <span className="text-xs font-normal text-slate-400">nm</span>{' '}
                  <span className="text-[11px] text-slate-400">(20 Å)</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">
                  Total H-Bonds
                </div>
                <div className="text-sm font-bold text-amber-300 tabular-nums mt-0.5">
                  {analysis.totalHydrogenBonds}{' '}
                  <span className="text-xs font-normal text-slate-400">bonds</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">
                  Molecular Weight
                </div>
                <div className="text-sm font-bold text-white tabular-nums mt-0.5">
                  {(analysis.molecularWeightDa / 1000).toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-400">kDa</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">
                  Est. Melting Tm
                </div>
                <div className="text-sm font-bold text-white tabular-nums mt-0.5">
                  {analysis.estimatedTmCelsius}{' '}
                  <span className="text-xs font-normal text-slate-400">°C</span>
                </div>
              </div>
            </div>

            {/* PDB Experimental Atom-to-Atom Euclidean Distance Tool */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  PDB Interatomic Distance Ruler
                </span>
                <button
                  type="button"
                  onClick={() => setRepresentationMode('pdbViewer')}
                  className="text-[11px] font-mono text-cyan-400 hover:underline"
                >
                  Open PDB Mode
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="pdb-atom-a"
                    className="block text-[10px] font-mono text-slate-400 mb-1"
                  >
                    Atom A
                  </label>
                  <select
                    id="pdb-atom-a"
                    value={measuredAtomIndices[0] ?? 0}
                    onChange={(e) =>
                      pickAtomForMeasurement(parseInt(e.target.value, 10))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-white"
                  >
                    {pdbStructure.atoms.map((a, idx) => (
                      <option key={a.serial} value={idx}>
                        #{a.serial} {a.atomName} ({a.residueName}
                        {a.residueNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="pdb-atom-b"
                    className="block text-[10px] font-mono text-slate-400 mb-1"
                  >
                    Atom B
                  </label>
                  <select
                    id="pdb-atom-b"
                    value={measuredAtomIndices[1] ?? 1}
                    onChange={(e) => {
                      const idxB = parseInt(e.target.value, 10);
                      useDNAStore.setState({
                        measuredAtomIndices: [
                          measuredAtomIndices[0] ?? 0,
                          idxB,
                        ],
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-white"
                  >
                    {pdbStructure.atoms.map((a, idx) => (
                      <option key={a.serial} value={idx}>
                        #{a.serial} {a.atomName} ({a.residueName}
                        {a.residueNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {atomDist && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/40 font-mono">
                  <div className="text-[10px] uppercase text-amber-300">
                    Measured 3D Euclidean Distance
                  </div>
                  <div className="text-sm font-bold text-white tabular-nums mt-0.5">
                    {atomDist.distanceAngstrom} Å{' '}
                    <span className="text-xs font-normal text-slate-300">
                      ({atomDist.distanceNm} nm)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* MODULE 7: CHROMATIN MULTISCALE ORGANIZATION (LEVELS 1–5)        */}
        {/* =============================================================== */}
        {leftSidebarTab === 'chromatin' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                07. Multiscale Chromatin Packaging
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Explore how 2 meters of genomic DNA compact ~10,000-fold from
                individual nucleotides into higher-order chromatin fibers.
              </p>
            </div>

            <div className="space-y-2">
              {(
                [
                  {
                    lvl: 1,
                    title: 'Level 1 · Chemical Nucleotide Pair (1.0 nm)',
                    scale: 'Atomic Scale · PO4 + 2′-Deoxyribose + Base Pair',
                    desc: 'Zoomed atomic geometry of a single Watson-Crick step with explicit furanose sugar ring and hydrogen bonds.',
                  },
                  {
                    lvl: 2,
                    title: 'Level 2 · Canonical B-DNA Double Helix (2.0 nm)',
                    scale: '10.5 bp/turn · 0.34 nm rise · Naked Duplex',
                    desc: 'Unpackaged right-handed double helix with wide Major and narrow Minor grooves.',
                  },
                  {
                    lvl: 3,
                    title: 'Level 3 · Nucleosome Core Particle (11 nm)',
                    scale: '147 bp B-DNA · 1.67 Left-Handed Turns · Histone Octamer',
                    desc: 'DNA wrapped 1.67 turns around the 8-subunit core Histone Octamer (2× H2A, H2B, H3, H4).',
                  },
                  {
                    lvl: 4,
                    title: 'Level 4 · 10 nm Nucleosome Array ("Beads-on-a-String")',
                    scale: '~6–7× Compaction · Linker DNA + Histone H1',
                    desc: 'Euchromatic array of 6 nucleosomes bridged by 20–60 bp linker DNA segments and H1 linker histones.',
                  },
                  {
                    lvl: 5,
                    title: 'Level 5 · 30 nm Higher-Order Chromatin Fiber',
                    scale: '~40× Compaction · Supercoiled Solenoid Architecture',
                    desc: 'Helical solenoid packing of 18 nucleosomes forming transcriptionally repressed heterochromatin fibers.',
                  },
                ] as const
              ).map((item) => {
                const active =
                  labMode === 'chromatin' && chromatinLevel === item.lvl;
                return (
                  <button
                    key={item.lvl}
                    type="button"
                    onClick={() => setChromatinLevel(item.lvl)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
                      active
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white">
                      {item.title}
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400 mt-0.5">
                      {item.scale}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* MODULE 8: ENVIRONMENT, LIGHTING & INSTRUMENT SETTINGS           */}
        {/* =============================================================== */}
        {leftSidebarTab === 'learning' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                08. Environment & Optical Calibration
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Customize laboratory illumination, background atmosphere,
                opacity, and telemetry overlays.
              </p>
            </div>

            {/* Background Theme */}
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-slate-300">
                Chamber Background Atmosphere
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'midnight', label: 'Midnight Lab' },
                    { id: 'neutralSlate', label: 'Neutral Slate' },
                    { id: 'aqueous', label: 'Aqueous Blue' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      updateEnvironment({ backgroundTheme: t.id })
                    }
                    className={`px-2 py-1.5 rounded text-xs font-medium border ${
                      environment.backgroundTheme === t.id
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders for Lighting & Opacity */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Studio Light Intensity</span>
                  <span className="font-mono text-cyan-400 tabular-nums">
                    {environment.lightingIntensity.toFixed(2)}×
                  </span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={2.2}
                  step={0.05}
                  value={environment.lightingIntensity}
                  onChange={(e) =>
                    updateEnvironment({
                      lightingIntensity: parseFloat(e.target.value),
                    })
                  }
                  aria-label="Studio Light Intensity"
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Molecular Opacity</span>
                  <span className="font-mono text-cyan-400 tabular-nums">
                    {Math.round(environment.structureOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.25}
                  max={1.0}
                  step={0.05}
                  value={environment.structureOpacity}
                  onChange={(e) =>
                    updateEnvironment({
                      structureOpacity: parseFloat(e.target.value),
                    })
                  }
                  aria-label="Molecular Structure Opacity"
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>

            {/* Environment Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() =>
                  updateEnvironment({
                    aqueousParticles: !environment.aqueousParticles,
                  })
                }
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
              >
                <span>Conceptual Aqueous Field Particles</span>
                <span
                  className={`font-mono ${
                    environment.aqueousParticles
                      ? 'text-cyan-400'
                      : 'text-slate-500'
                  }`}
                >
                  {environment.aqueousParticles ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  updateEnvironment({
                    ambientThermalMotion: !environment.ambientThermalMotion,
                  })
                }
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
              >
                <span>Subtle Ambient Motion (Disable for Inspection)</span>
                <span
                  className={`font-mono ${
                    environment.ambientThermalMotion
                      ? 'text-cyan-400'
                      : 'text-slate-500'
                  }`}
                >
                  {environment.ambientThermalMotion ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  updateEnvironment({
                    showPerformanceStats: !environment.showPerformanceStats,
                  })
                }
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
              >
                <span>WebGL FPS & Mesh Telemetry Badge</span>
                <span
                  className={`font-mono ${
                    environment.showPerformanceStats
                      ? 'text-cyan-400'
                      : 'text-slate-500'
                  }`}
                >
                  {environment.showPerformanceStats ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
