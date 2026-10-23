import { create } from 'zustand';
import {
  DNABase,
  SequenceAnalysis,
  analyzeSequence,
  validateDNASequence,
  DNA_PRESET_SEQUENCES,
} from '../engine/DNASequenceEngine';
import {
  BDNAHelixModel,
  generateBDNAHelixCoordinates,
} from '../engine/DNAGeometryEngine';
import {
  ParsedPDBStructure,
  SAMPLE_1BNA_PDB_TEXT,
  parsePDBText,
} from '../engine/PDBParserEngine';
import { LanguageMode, LearningTier } from '../data/learningContent';

export type RepresentationMode =
  | 'cinematic'
  | 'ballAndStick'
  | 'spaceFilling'
  | 'ribbon'
  | 'basePair'
  | 'wireframe'
  | 'pdbViewer';

export type LaboratoryMode =
  | 'structure'
  | 'replication'
  | 'transcription'
  | 'chromatin';

export type HighlightFilter =
  | 'none'
  | 'selectedNucleotide'
  | 'selectedBasePair'
  | 'strand1'
  | 'strand2'
  | 'allA'
  | 'allT'
  | 'allG'
  | 'allC';

export type ColorSchemeMode = 'nucleotide' | 'cpkElement';

export type CameraPresetCommand = {
  type: 'reset' | 'top' | 'side' | 'axial' | 'focusSelected';
  timestamp: number;
};

export interface EnvironmentSettings {
  backgroundTheme: 'midnight' | 'neutralSlate' | 'aqueous';
  aqueousParticles: boolean;
  ambientThermalMotion: boolean;
  lightingIntensity: number;
  structureOpacity: number;
  showBackbone: boolean;
  showBases: boolean;
  showHydrogenBonds: boolean;
  showLabels: boolean;
  showMajorMinorGrooves: boolean;
  autoRotate: boolean;
  showPerformanceStats: boolean;
}

interface DNAExplorerState {
  // Sequence & Structural Model
  sequence: string;
  sequenceError: string | null;
  analysis: SequenceAnalysis;
  helixModel: BDNAHelixModel;

  // Selection & Highlighting
  selectedBpIndex: number;
  selectedStrand: 1 | 2;
  hoveredBpIndex: number | null;
  hoveredStrand: 1 | 2 | null;
  highlightFilter: HighlightFilter;

  // Representation & Laboratory Mode
  representationMode: RepresentationMode;
  labMode: LaboratoryMode;
  chromatinLevel: 1 | 2 | 3 | 4 | 5;
  colorScheme: ColorSchemeMode;
  transcriptionTemplateStrand: 'antisense' | 'sense';

  // Biological Process Animation
  isPlaying: boolean;
  animationProgress: number; // 0.0 to 1.0
  animationSpeed: number; // 0.25x to 3.0x

  // PDB Experimental Data Viewer & Distance Measurement
  pdbStructure: ParsedPDBStructure;
  pdbError: string | null;
  measuredAtomIndices: [number | null, number | null];

  // Environment & Camera
  environment: EnvironmentSettings;
  cameraCommand: CameraPresetCommand;
  screenshotTrigger: number;

  // UI Layout & Learning Assistant
  leftSidebarTab:
    | 'structure'
    | 'representations'
    | 'inspector'
    | 'sequence'
    | 'processes'
    | 'measurements'
    | 'chromatin'
    | 'learning';
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  bottomDockCollapsed: boolean;
  showTutorialModal: boolean;
  languageMode: LanguageMode;
  learningTier: LearningTier;
  activeLearningTopicId: string;

  // Actions
  setSequence: (rawInput: string) => boolean;
  loadPresetSequence: (presetId: string) => void;
  selectNucleotide: (bpIndex: number, strand?: 1 | 2, focusCamera?: boolean) => void;
  setHoveredNucleotide: (bpIndex: number | null, strand?: 1 | 2 | null) => void;
  setHighlightFilter: (filter: HighlightFilter) => void;
  setRepresentationMode: (mode: RepresentationMode) => void;
  setLabMode: (mode: LaboratoryMode) => void;
  setChromatinLevel: (level: 1 | 2 | 3 | 4 | 5) => void;
  setColorScheme: (scheme: ColorSchemeMode) => void;
  setTranscriptionTemplateStrand: (strand: 'antisense' | 'sense') => void;

  // Animation Actions
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setAnimationProgress: (progress: number) => void;
  setAnimationSpeed: (speed: number) => void;
  stepAnimation: (delta: number) => void;
  resetAnimation: () => void;

  // PDB Actions
  importPDBFileText: (pdbText: string, filename?: string) => boolean;
  resetPDBToDefault1BNA: () => void;
  pickAtomForMeasurement: (atomIndex: number) => void;
  clearAtomMeasurement: () => void;

  // Environment & Camera Actions
  updateEnvironment: (partial: Partial<EnvironmentSettings>) => void;
  triggerCameraPreset: (type: CameraPresetCommand['type']) => void;
  triggerScreenshot: () => void;

  // UI Actions
  setLeftSidebarTab: (tab: DNAExplorerState['leftSidebarTab']) => void;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  setBottomDockCollapsed: (collapsed: boolean) => void;
  setShowTutorialModal: (show: boolean) => void;
  setLanguageMode: (lang: LanguageMode) => void;
  setLearningTier: (tier: LearningTier) => void;
  setActiveLearningTopicId: (topicId: string) => void;
}

const DEFAULT_SEQUENCE = DNA_PRESET_SEQUENCES[0].sequence; // 'CGCGAATTCGCG' (Drew-Dickerson 1BNA Dodecamer)
const initialAnalysis = analyzeSequence(DEFAULT_SEQUENCE);
const initialHelix = generateBDNAHelixCoordinates(DEFAULT_SEQUENCE);
const initialPDB = parsePDBText(SAMPLE_1BNA_PDB_TEXT, '1BNA');

export const useDNAStore = create<DNAExplorerState>((set, get) => ({
  sequence: DEFAULT_SEQUENCE,
  sequenceError: null,
  analysis: initialAnalysis,
  helixModel: initialHelix,

  selectedBpIndex: 4, // Adenine-Thymine step in the EcoRI site (GAATTC)
  selectedStrand: 1,
  hoveredBpIndex: null,
  hoveredStrand: null,
  highlightFilter: 'none',

  representationMode: 'cinematic',
  labMode: 'structure',
  chromatinLevel: 3,
  colorScheme: 'nucleotide',
  transcriptionTemplateStrand: 'antisense',

  isPlaying: false,
  animationProgress: 0.45,
  animationSpeed: 1.0,

  pdbStructure: initialPDB,
  pdbError: null,
  measuredAtomIndices: [0, 16], // Default: O5'(DC1) to P(DG2) intrastrand distance

  environment: {
    backgroundTheme: 'midnight',
    aqueousParticles: true,
    ambientThermalMotion: false,
    lightingIntensity: 1.15,
    structureOpacity: 1.0,
    showBackbone: true,
    showBases: true,
    showHydrogenBonds: true,
    showLabels: true,
    showMajorMinorGrooves: false,
    autoRotate: false,
    showPerformanceStats: false,
  },
  cameraCommand: { type: 'reset', timestamp: 0 },
  screenshotTrigger: 0,

  leftSidebarTab: 'structure',
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  bottomDockCollapsed: false,
  showTutorialModal: false,
  languageMode: 'en',
  learningTier: 'intermediate',
  activeLearningTopicId: 'bdna-geometry',

  setSequence: (rawInput: string) => {
    const validation = validateDNASequence(rawInput);
    if (!validation.isValid) {
      set({ sequenceError: validation.error || 'Invalid DNA sequence.' });
      return false;
    }
    const capped = validation.cleaned.slice(0, 120); // Cap interactive 3D helix at 120 bp for 60 FPS GPU comfort
    const newAnalysis = analyzeSequence(capped);
    const newHelix = generateBDNAHelixCoordinates(capped);
    const currentSelected = get().selectedBpIndex;
    set({
      sequence: capped,
      sequenceError: null,
      analysis: newAnalysis,
      helixModel: newHelix,
      selectedBpIndex: Math.min(currentSelected, Math.max(0, capped.length - 1)),
    });
    return true;
  },

  loadPresetSequence: (presetId: string) => {
    const found = DNA_PRESET_SEQUENCES.find((p) => p.id === presetId);
    if (!found) return;
    get().setSequence(found.sequence);
  },

  selectNucleotide: (bpIndex: number, strand = 1, focusCamera = false) => {
    const maxIdx = Math.max(0, get().helixModel.steps.length - 1);
    const clamped = Math.max(0, Math.min(maxIdx, bpIndex));
    set({
      selectedBpIndex: clamped,
      selectedStrand: strand,
      ...(focusCamera
        ? { cameraCommand: { type: 'focusSelected', timestamp: Date.now() } }
        : {}),
    });
  },

  setHoveredNucleotide: (bpIndex, strand = null) => {
    set({ hoveredBpIndex: bpIndex, hoveredStrand: strand });
  },

  setHighlightFilter: (filter) => set({ highlightFilter: filter }),

  setRepresentationMode: (mode) => {
    set({
      representationMode: mode,
      colorScheme:
        mode === 'ballAndStick' || mode === 'spaceFilling' || mode === 'pdbViewer'
          ? 'cpkElement'
          : 'nucleotide',
    });
  },

  setLabMode: (mode) => {
    const topicMap: Record<LaboratoryMode, string> = {
      structure: 'bdna-geometry',
      replication: 'dna-replication',
      transcription: 'rna-transcription',
      chromatin: 'chromatin-packaging',
    };
    set({
      labMode: mode,
      activeLearningTopicId: topicMap[mode],
      isPlaying: mode === 'replication' || mode === 'transcription',
    });
  },

  setChromatinLevel: (level) => set({ chromatinLevel: level, labMode: 'chromatin' }),

  setColorScheme: (scheme) => set({ colorScheme: scheme }),

  setTranscriptionTemplateStrand: (strand) =>
    set({ transcriptionTemplateStrand: strand }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  togglePlay: () => {
    const state = get();
    if (
      state.labMode === 'structure' &&
      !state.environment.autoRotate &&
      !state.isPlaying
    ) {
      // In static structure mode, pressing Play toggles smooth orbital rotation or starts replication demo
      set({
        environment: { ...state.environment, autoRotate: true },
        isPlaying: true,
      });
    } else if (state.labMode === 'structure' && state.isPlaying) {
      set({
        environment: { ...state.environment, autoRotate: false },
        isPlaying: false,
      });
    } else {
      set({ isPlaying: !state.isPlaying });
    }
  },

  setAnimationProgress: (progress) =>
    set({ animationProgress: Math.max(0, Math.min(1, progress)) }),

  setAnimationSpeed: (speed) =>
    set({ animationSpeed: Math.max(0.25, Math.min(3.0, speed)) }),

  stepAnimation: (delta) => {
    const next = Math.max(0, Math.min(1, get().animationProgress + delta));
    set({ animationProgress: Number(next.toFixed(3)), isPlaying: false });
  },

  resetAnimation: () => set({ animationProgress: 0, isPlaying: false }),

  importPDBFileText: (pdbText: string, filename = 'CUSTOM') => {
    try {
      const cleanId = filename.replace(/\.pdb$/i, '').slice(0, 12).toUpperCase() || 'CUSTOM';
      const parsed = parsePDBText(pdbText, cleanId);
      set({
        pdbStructure: parsed,
        pdbError: null,
        representationMode: 'pdbViewer',
        labMode: 'structure',
        colorScheme: 'cpkElement',
        measuredAtomIndices: [
          0,
          parsed.atoms.length > 1 ? 1 : null,
        ],
      });
      return true;
    } catch (err) {
      set({
        pdbError:
          err instanceof Error
            ? err.message
            : 'Failed to parse PDB coordinate file.',
      });
      return false;
    }
  },

  resetPDBToDefault1BNA: () => {
    const parsed = parsePDBText(SAMPLE_1BNA_PDB_TEXT, '1BNA');
    set({
      pdbStructure: parsed,
      pdbError: null,
      measuredAtomIndices: [0, 16],
    });
  },

  pickAtomForMeasurement: (atomIndex: number) => {
    const [a, b] = get().measuredAtomIndices;
    if (a === null || (a !== null && b !== null)) {
      set({ measuredAtomIndices: [atomIndex, null] });
    } else {
      set({ measuredAtomIndices: [a, atomIndex] });
    }
  },

  clearAtomMeasurement: () => set({ measuredAtomIndices: [null, null] }),

  updateEnvironment: (partial) =>
    set((state) => ({
      environment: { ...state.environment, ...partial },
    })),

  triggerCameraPreset: (type) =>
    set({ cameraCommand: { type, timestamp: Date.now() } }),

  triggerScreenshot: () =>
    set((state) => ({ screenshotTrigger: state.screenshotTrigger + 1 })),

  setLeftSidebarTab: (tab) => {
    set({ leftSidebarTab: tab, leftSidebarOpen: true });
    if (tab === 'chromatin') {
      set({ labMode: 'chromatin', activeLearningTopicId: 'chromatin-packaging' });
    }
  },

  setLeftSidebarOpen: (open) => set({ leftSidebarOpen: open }),
  setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
  setBottomDockCollapsed: (collapsed) => set({ bottomDockCollapsed: collapsed }),
  setShowTutorialModal: (show) => set({ showTutorialModal: show }),
  setLanguageMode: (lang) => set({ languageMode: lang }),
  setLearningTier: (tier) => set({ learningTier: tier }),
  setActiveLearningTopicId: (topicId) => set({ activeLearningTopicId: topicId }),
}));
