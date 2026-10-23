import {
  DNABase,
  RNABase,
  BaseClassification,
  NUCLEOTIDE_DATABASE,
  getComplementBase,
  getRNAComplementBase,
} from './DNASequenceEngine';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type ChemicalElement = 'C' | 'N' | 'O' | 'P' | 'H';

export const CPK_ELEMENT_COLORS: Record<
  ChemicalElement,
  { name: string; hex: string; vdwRadiusNm: number; covalentRadiusNm: number }
> = {
  C: {
    name: 'Carbon (C)',
    hex: '#94a3b8', // Slate-gray CPK carbon for high dark-mode legibility
    vdwRadiusNm: 0.17,
    covalentRadiusNm: 0.076,
  },
  N: {
    name: 'Nitrogen (N)',
    hex: '#3b82f6', // Canonical CPK Blue
    vdwRadiusNm: 0.155,
    covalentRadiusNm: 0.071,
  },
  O: {
    name: 'Oxygen (O)',
    hex: '#ef4444', // Canonical CPK Red
    vdwRadiusNm: 0.152,
    covalentRadiusNm: 0.066,
  },
  P: {
    name: 'Phosphorus (P)',
    hex: '#f97316', // Canonical CPK Orange
    vdwRadiusNm: 0.18,
    covalentRadiusNm: 0.107,
  },
  H: {
    name: 'Hydrogen (H)',
    hex: '#f8fafc', // Canonical CPK White
    vdwRadiusNm: 0.12,
    covalentRadiusNm: 0.031,
  },
};

export interface ProceduralAtom {
  id: string;
  element: ChemicalElement;
  label: string; // e.g., "P", "O5'", "C1'", "N9", "O6"
  positionNm: Vec3;
  positionWorld: Vec3;
  strand: 1 | 2;
  bpIndex: number;
}

export interface ProceduralBond {
  fromWorld: Vec3;
  toWorld: Vec3;
  fromElement: ChemicalElement;
  toElement: ChemicalElement;
  bondType: 'covalent' | 'glycosidic' | 'phosphodiester';
}

export interface HydrogenBondSegment {
  index: number; // 0, 1, or 2
  donorLabel: string;
  acceptorLabel: string;
  startWorld: Vec3;
  endWorld: Vec3;
  lengthAngstrom: number;
}

export interface Nucleotide3DNode {
  id: string;
  bpIndex: number; // 0-indexed base pair position
  sequenceNumber: number; // 1-indexed position
  strand: 1 | 2; // 1 = 5'->3' primary, 2 = 3'->5' antiparallel complement
  directionLabel: '5′ → 3′' | '3′ → 5′';
  base: DNABase;
  pairedBase: DNABase;
  classification: BaseClassification;
  rings: 1 | 2;
  hydrogenBondCount: 2 | 3;
  // Key structural anchor coordinates in nanometers (scientific frame: z along helical axis)
  phosphateNm: Vec3;
  sugarCenterNm: Vec3;
  baseCenterNm: Vec3;
  // Key structural anchor coordinates in Three.js world space (y along vertical helical axis)
  phosphateWorld: Vec3;
  sugarCenterWorld: Vec3;
  sugarRingVerticesWorld: Vec3[]; // 5-membered furanose ring
  baseCenterWorld: Vec3;
  baseNormalWorld: Vec3;
  baseAxisWorld: Vec3; // unit vector pointing from C1' toward Watson-Crick pairing edge
  atoms: ProceduralAtom[];
  bonds: ProceduralBond[];
}

export interface BasePair3DStep {
  bpIndex: number;
  sequenceNumber: number;
  thetaRad: number;
  thetaDeg: number;
  axialZNm: number;
  worldY: number;
  strand1Node: Nucleotide3DNode;
  strand2Node: Nucleotide3DNode;
  hydrogenBonds: HydrogenBondSegment[];
  majorGrooveCenterWorld: Vec3;
  minorGrooveCenterWorld: Vec3;
}

export interface BDNAHelixModel {
  isIdealizedModel: true;
  modelDisclaimer: string;
  sequence5to3: string;
  complementary3to5: string;
  basePairsPerTurn: number;
  axialRiseNm: number;
  helixDiameterNm: number;
  helicalPitchNm: number;
  minorGrooveAngleDeg: number;
  majorGrooveAngleDeg: number;
  worldScalePerNm: number;
  steps: BasePair3DStep[];
  strand1BackboneCurveWorld: Vec3[];
  strand2BackboneCurveWorld: Vec3[];
}

/**
 * Canonical B-DNA geometric constants (Watson-Crick / Arnott & Hukins idealized fiber parameters)
 */
export const BDNA_CONSTANTS = {
  BASE_PAIRS_PER_TURN: 10.5,
  AXIAL_RISE_NM: 0.34, // 3.4 Å
  HELIX_RADIUS_NM: 1.0, // 2.0 nm overall diameter
  HELIX_DIAMETER_NM: 2.0,
  HELICAL_PITCH_NM: 3.57, // 10.5 * 0.34 nm
  SUGAR_RADIUS_NM: 0.72,
  BASE_CENTER_RADIUS_NM: 0.32,
  // Crucial asymmetry: In B-DNA, the glycosidic bonds / strands are separated by ~132° (2.304 rad)
  // around the helix axis on the minor-groove side and ~228° on the major-groove side,
  // creating the distinct wide Major Groove (~2.2 nm) and narrow Minor Groove (~1.2 nm).
  MINOR_GROOVE_PHASE_RAD: (132 * Math.PI) / 180,
  WORLD_UNITS_PER_NM: 3.4,
};

function nmToWorld(nm: Vec3, centerZNm: number): Vec3 {
  const s = BDNA_CONSTANTS.WORLD_UNITS_PER_NM;
  // Map scientific (x, y, z_helical) -> Three.js right-handed world (x, y_vertical = z_helical, -y)
  // Note: To keep right-handedness when mapping scientific Z -> +Y:
  // If X_world = X_nm, Y_world = Z_nm, Z_world = -Y_nm:
  // det([1,0,0; 0,0,1; 0,-1,0]) = +1 (strictly right-handed!)
  // A right-handed helix in scientific coords (x = R cos θ, y = R sin θ, z = +h θ)
  // maps to (R cos θ, +h θ, -R sin θ), which rotates counter-clockwise looking down +Y -> right-handed thumb along +Y!
  return {
    x: nm.x * s,
    y: (nm.z - centerZNm) * s,
    z: -nm.y * s,
  };
}

function addVec(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function subVec(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scaleVec(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function normalizeVec(v: Vec3): Vec3 {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Builds the schematic atomistic & ring geometry for a single nucleotide in a base pair step.
 */
function buildNucleotideGeometry(params: {
  bpIndex: number;
  strand: 1 | 2;
  base: DNABase;
  pairedBase: DNABase;
  thetaStrand: number;
  thetaPairTarget: number;
  zNm: number;
  centerZNm: number;
}): Nucleotide3DNode {
  const {
    bpIndex,
    strand,
    base,
    pairedBase,
    thetaStrand,
    thetaPairTarget,
    zNm,
    centerZNm,
  } = params;

  const meta = NUCLEOTIDE_DATABASE[base];
  const R_p = BDNA_CONSTANTS.HELIX_RADIUS_NM; // 1.0 nm phosphate radius
  const R_s = BDNA_CONSTANTS.SUGAR_RADIUS_NM; // 0.72 nm deoxyribose center

  // Antiparallel axial offset for phosphate vs sugar along the 5'->3' vs 3'->5' strand
  const strandSign = strand === 1 ? 1 : -1;
  const pTheta = thetaStrand - strandSign * 0.14;
  const sTheta = thetaStrand;

  const phosphateNm: Vec3 = {
    x: R_p * Math.cos(pTheta),
    y: R_p * Math.sin(pTheta),
    z: zNm - strandSign * 0.09,
  };

  const sugarCenterNm: Vec3 = {
    x: R_s * Math.cos(sTheta),
    y: R_s * Math.sin(sTheta),
    z: zNm,
  };

  // Partner sugar position on the opposite strand to orient the base-pair hydrogen-bonding axis
  const partnerSugarNm: Vec3 = {
    x: R_s * Math.cos(thetaPairTarget),
    y: R_s * Math.sin(thetaPairTarget),
    z: zNm,
  };

  // Vector from this sugar toward partner sugar across the helix chord
  const chordNm = subVec(partnerSugarNm, sugarCenterNm);
  const chordDirNm = normalizeVec(chordNm);
  // In-plane perpendicular vector (pointing toward major/minor groove)
  const perpInPlaneNm: Vec3 = {
    x: -chordDirNm.y * strandSign,
    y: chordDirNm.x * strandSign,
    z: 0,
  };

  // Purines (2 rings: A, G) extend further across the chord (~0.36 nm) than Pyrimidines (1 ring: T, C, ~0.27 nm)
  const isPurine = meta.classification === 'Purine';
  const baseDistanceAlongChordNm = isPurine ? 0.36 : 0.27;

  const baseCenterNm = addVec(
    sugarCenterNm,
    scaleVec(chordDirNm, baseDistanceAlongChordNm)
  );

  const phosphateWorld = nmToWorld(phosphateNm, centerZNm);
  const sugarCenterWorld = nmToWorld(sugarCenterNm, centerZNm);
  const baseCenterWorld = nmToWorld(baseCenterNm, centerZNm);

  const atoms: ProceduralAtom[] = [];
  const bonds: ProceduralBond[] = [];

  const addAtom = (
    label: string,
    element: ChemicalElement,
    posNm: Vec3
  ): ProceduralAtom => {
    const atom: ProceduralAtom = {
      id: `s${strand}-bp${bpIndex}-${label}`,
      element,
      label,
      positionNm: posNm,
      positionWorld: nmToWorld(posNm, centerZNm),
      strand,
      bpIndex,
    };
    atoms.push(atom);
    return atom;
  };

  const addBond = (
    a: ProceduralAtom,
    b: ProceduralAtom,
    bondType: ProceduralBond['bondType'] = 'covalent'
  ) => {
    bonds.push({
      fromWorld: a.positionWorld,
      toWorld: b.positionWorld,
      fromElement: a.element,
      toElement: b.element,
      bondType,
    });
  };

  // 1. Phosphate Group (PO4)
  const atomP = addAtom('P', 'P', phosphateNm);
  const radialOutNm = normalizeVec({ x: phosphateNm.x, y: phosphateNm.y, z: 0 });
  const atomOP1 = addAtom(
    'OP1',
    'O',
    addVec(phosphateNm, addVec(scaleVec(radialOutNm, 0.14), { x: 0, y: 0, z: 0.06 }))
  );
  const atomOP2 = addAtom(
    'OP2',
    'O',
    addVec(phosphateNm, addVec(scaleVec(radialOutNm, 0.14), { x: 0, y: 0, z: -0.06 }))
  );
  const atomO5 = addAtom(
    "O5'",
    'O',
    addVec(
      scaleVec(phosphateNm, 0.6),
      scaleVec(sugarCenterNm, 0.4)
    )
  );
  addBond(atomP, atomOP1);
  addBond(atomP, atomOP2);
  addBond(atomP, atomO5);

  // 2. 2'-Deoxyribose Furanose Ring (C1', C2', C3', C4', O4')
  const sugarRadiusLocal = 0.13;
  // Orient furanose ring in vertical-radial plane
  const sugarRingAngles = [0, (2 * Math.PI) / 5, (4 * Math.PI) / 5, (6 * Math.PI) / 5, (8 * Math.PI) / 5];
  const sugarRingDefinitions: Array<{ label: string; element: ChemicalElement }> = [
    { label: "C1'", element: 'C' },
    { label: "C2'", element: 'C' },
    { label: "C3'", element: 'C' },
    { label: "C4'", element: 'C' },
    { label: "O4'", element: 'O' },
  ];

  const sugarAtoms: ProceduralAtom[] = [];
  const sugarRingVerticesWorld: Vec3[] = [];

  for (let k = 0; k < 5; k++) {
    const ang = sugarRingAngles[k];
    // C1' points inward along chordDirNm, C3'/C4' point toward backbone
    const offsetNm: Vec3 = {
      x:
        chordDirNm.x * Math.cos(ang) * sugarRadiusLocal +
        perpInPlaneNm.x * Math.sin(ang) * sugarRadiusLocal * 0.6,
      y:
        chordDirNm.y * Math.cos(ang) * sugarRadiusLocal +
        perpInPlaneNm.y * Math.sin(ang) * sugarRadiusLocal * 0.6,
      z: Math.sin(ang) * sugarRadiusLocal * 0.85 * strandSign,
    };
    const posNm = addVec(sugarCenterNm, offsetNm);
    const sAtom = addAtom(
      sugarRingDefinitions[k].label,
      sugarRingDefinitions[k].element,
      posNm
    );
    sugarAtoms.push(sAtom);
    sugarRingVerticesWorld.push(sAtom.positionWorld);
  }

  for (let k = 0; k < 5; k++) {
    addBond(sugarAtoms[k], sugarAtoms[(k + 1) % 5]);
  }

  // Exocyclic C5' linking O5' to C4'
  const atomC5 = addAtom(
    "C5'",
    'C',
    addVec(scaleVec(atomO5.positionNm, 0.5), scaleVec(sugarAtoms[3].positionNm, 0.5))
  );
  addBond(atomO5, atomC5);
  addBond(atomC5, sugarAtoms[3]); // C5' - C4'

  // 3. Nitrogenous Base Ring Atoms (Purine = 9-atom bicyclic 5+6 ring; Pyrimidine = 6-atom monocyclic ring)
  const atomC1Prime = sugarAtoms[0];

  if (isPurine) {
    // Bicyclic Purine (Imidazole 5-ring + Pyrimidine 6-ring)
    const imidazoleCenterNm = addVec(sugarCenterNm, scaleVec(chordDirNm, 0.25));
    const pyrimidineCenterNm = addVec(sugarCenterNm, scaleVec(chordDirNm, 0.45));

    const n9 = addAtom(
      'N9',
      'N',
      addVec(imidazoleCenterNm, scaleVec(chordDirNm, -0.09))
    );
    const c8 = addAtom(
      'C8',
      'C',
      addVec(
        imidazoleCenterNm,
        addVec(scaleVec(chordDirNm, -0.03), scaleVec(perpInPlaneNm, 0.11))
      )
    );
    const n7 = addAtom(
      'N7',
      'N',
      addVec(
        imidazoleCenterNm,
        addVec(scaleVec(chordDirNm, 0.07), scaleVec(perpInPlaneNm, 0.11))
      )
    );
    const c5 = addAtom(
      'C5',
      'C',
      addVec(
        pyrimidineCenterNm,
        addVec(scaleVec(chordDirNm, -0.08), scaleVec(perpInPlaneNm, 0.06))
      )
    );
    const c4 = addAtom(
      'C4',
      'C',
      addVec(
        pyrimidineCenterNm,
        addVec(scaleVec(chordDirNm, -0.08), scaleVec(perpInPlaneNm, -0.06))
      )
    );
    const c6 = addAtom(
      'C6',
      'C',
      addVec(
        pyrimidineCenterNm,
        addVec(scaleVec(chordDirNm, 0.04), scaleVec(perpInPlaneNm, 0.11))
      )
    );
    const n1 = addAtom(
      'N1',
      'N',
      addVec(pyrimidineCenterNm, scaleVec(chordDirNm, 0.12))
    );
    const c2 = addAtom(
      'C2',
      'C',
      addVec(
        pyrimidineCenterNm,
        addVec(scaleVec(chordDirNm, 0.04), scaleVec(perpInPlaneNm, -0.11))
      )
    );
    const n3 = addAtom(
      'N3',
      'N',
      addVec(
        pyrimidineCenterNm,
        addVec(scaleVec(chordDirNm, -0.03), scaleVec(perpInPlaneNm, -0.12))
      )
    );

    // Glycosidic bond C1' - N9
    addBond(atomC1Prime, n9, 'glycosidic');
    // Imidazole ring bonds
    addBond(n9, c8);
    addBond(c8, n7);
    addBond(n7, c5);
    addBond(c5, c4);
    addBond(c4, n9);
    // Pyrimidine ring bonds
    addBond(c5, c6);
    addBond(c6, n1);
    addBond(n1, c2);
    addBond(c2, n3);
    addBond(n3, c4);

    // Exocyclic functional groups for Watson-Crick H-bonding
    if (base === 'A') {
      const n6 = addAtom(
        'N6',
        'N',
        addVec(c6.positionNm, addVec(scaleVec(chordDirNm, 0.08), scaleVec(perpInPlaneNm, 0.08)))
      );
      addBond(c6, n6);
    } else {
      // Guanine (G): O6 carbonyl and N2 amino
      const o6 = addAtom(
        'O6',
        'O',
        addVec(c6.positionNm, addVec(scaleVec(chordDirNm, 0.08), scaleVec(perpInPlaneNm, 0.08)))
      );
      const n2 = addAtom(
        'N2',
        'N',
        addVec(c2.positionNm, addVec(scaleVec(chordDirNm, 0.08), scaleVec(perpInPlaneNm, -0.08)))
      );
      addBond(c6, o6);
      addBond(c2, n2);
    }
  } else {
    // Monocyclic Pyrimidine (6-membered ring: T or C)
    const ringCenterNm = addVec(sugarCenterNm, scaleVec(chordDirNm, 0.3));
    const n1 = addAtom(
      'N1',
      'N',
      addVec(ringCenterNm, scaleVec(chordDirNm, -0.11))
    );
    const c6 = addAtom(
      'C6',
      'C',
      addVec(
        ringCenterNm,
        addVec(scaleVec(chordDirNm, -0.05), scaleVec(perpInPlaneNm, 0.11))
      )
    );
    const c5 = addAtom(
      'C5',
      'C',
      addVec(
        ringCenterNm,
        addVec(scaleVec(chordDirNm, 0.05), scaleVec(perpInPlaneNm, 0.11))
      )
    );
    const c4 = addAtom(
      'C4',
      'C',
      addVec(
        ringCenterNm,
        addVec(scaleVec(chordDirNm, 0.08), scaleVec(perpInPlaneNm, 0.06))
      )
    );
    const n3 = addAtom(
      'N3',
      'N',
      addVec(ringCenterNm, scaleVec(chordDirNm, 0.12))
    );
    const c2 = addAtom(
      'C2',
      'C',
      addVec(
        ringCenterNm,
        addVec(scaleVec(chordDirNm, 0.06), scaleVec(perpInPlaneNm, -0.1))
      )
    );

    // Glycosidic bond C1' - N1
    addBond(atomC1Prime, n1, 'glycosidic');
    addBond(n1, c6);
    addBond(c6, c5);
    addBond(c5, c4);
    addBond(c4, n3);
    addBond(n3, c2);
    addBond(c2, n1);

    // Exocyclic groups
    const o2 = addAtom(
      'O2',
      'O',
      addVec(c2.positionNm, addVec(scaleVec(chordDirNm, 0.07), scaleVec(perpInPlaneNm, -0.07)))
    );
    addBond(c2, o2);

    if (base === 'T') {
      const o4 = addAtom(
        'O4',
        'O',
        addVec(c4.positionNm, addVec(scaleVec(chordDirNm, 0.07), scaleVec(perpInPlaneNm, 0.07)))
      );
      const c5m = addAtom(
        'C5M',
        'C',
        addVec(c5.positionNm, scaleVec(perpInPlaneNm, 0.11))
      );
      addBond(c4, o4);
      addBond(c5, c5m);
    } else {
      // Cytosine (C): N4 amino
      const n4 = addAtom(
        'N4',
        'N',
        addVec(c4.positionNm, addVec(scaleVec(chordDirNm, 0.07), scaleVec(perpInPlaneNm, 0.07)))
      );
      addBond(c4, n4);
    }
  }

  const baseAxisWorld = normalizeVec(
    subVec(nmToWorld(partnerSugarNm, centerZNm), sugarCenterWorld)
  );

  return {
    id: `nt-${bpIndex}-s${strand}`,
    bpIndex,
    sequenceNumber: bpIndex + 1,
    strand,
    directionLabel: strand === 1 ? '5′ → 3′' : '3′ → 5′',
    base,
    pairedBase,
    classification: meta.classification,
    rings: meta.rings,
    hydrogenBondCount: meta.hydrogenBonds,
    phosphateNm,
    sugarCenterNm,
    baseCenterNm,
    phosphateWorld,
    sugarCenterWorld,
    sugarRingVerticesWorld,
    baseCenterWorld,
    baseNormalWorld: { x: 0, y: 1, z: 0 },
    baseAxisWorld,
    atoms,
    bonds,
  };
}

/**
 * Generates a scientifically grounded 3D B-DNA Double Helix model from a nucleotide sequence.
 */
export function generateBDNAHelixCoordinates(
  rawSequence: string
): BDNAHelixModel {
  const cleaned = rawSequence.toUpperCase().replace(/[^ATGC]/g, '') || 'CGCGAATTCGCG';
  const n = cleaned.length;
  const centerZNm = ((n - 1) * BDNA_CONSTANTS.AXIAL_RISE_NM) / 2;
  const twistPerStepRad = (2 * Math.PI) / BDNA_CONSTANTS.BASE_PAIRS_PER_TURN;

  const steps: BasePair3DStep[] = [];
  const strand1BackboneCurveWorld: Vec3[] = [];
  const strand2BackboneCurveWorld: Vec3[] = [];

  for (let i = 0; i < n; i++) {
    const base1 = cleaned[i] as DNABase;
    const base2 = getComplementBase(base1);

    // Parameterized right-handed B-DNA helical equations:
    // theta(i) = 2 * pi * i / 10.5
    // z(i) = i * 0.34 nm
    const theta1 = i * twistPerStepRad;
    // Second antiparallel strand is offset by MINOR_GROOVE_PHASE_RAD (~132°), NOT 180°,
    // producing distinct major (~228°) and minor (~132°) grooves!
    const theta2 = theta1 + BDNA_CONSTANTS.MINOR_GROOVE_PHASE_RAD;
    const axialZNm = i * BDNA_CONSTANTS.AXIAL_RISE_NM;

    const strand1Node = buildNucleotideGeometry({
      bpIndex: i,
      strand: 1,
      base: base1,
      pairedBase: base2,
      thetaStrand: theta1,
      thetaPairTarget: theta2,
      zNm: axialZNm,
      centerZNm,
    });

    const strand2Node = buildNucleotideGeometry({
      bpIndex: i,
      strand: 2,
      base: base2,
      pairedBase: base1,
      thetaStrand: theta2,
      thetaPairTarget: theta1,
      zNm: axialZNm,
      centerZNm,
    });

    // Inter-strand Watson-Crick Hydrogen Bonds (2 for A-T, 3 for G-C)
    const hBondCount = NUCLEOTIDE_DATABASE[base1].hydrogenBonds;
    const hydrogenBonds: HydrogenBondSegment[] = [];

    const b1World = strand1Node.baseCenterWorld;
    const b2World = strand2Node.baseCenterWorld;
    const pairAxis = normalizeVec(subVec(b2World, b1World));
    // Lateral direction in the base-pair plane (perpendicular to vertical Y and pairAxis)
    const lateralWorld = normalizeVec({
      x: -pairAxis.z,
      y: 0,
      z: pairAxis.x,
    });

    // Bridge gap between the two base ring edges
    const gapStart = addVec(b1World, scaleVec(pairAxis, 0.32));
    const gapEnd = addVec(b2World, scaleVec(pairAxis, -0.32));

    if (hBondCount === 2) {
      // A-T pair: 2 canonical hydrogen bonds (N6..O4 and N1..N3)
      const offsets = [-0.22, 0.22];
      const labels =
        base1 === 'A'
          ? [
              { donor: 'N6(A)', acceptor: 'O4(T)', len: 2.91 },
              { donor: 'N1(A)', acceptor: 'N3(T)', len: 2.82 },
            ]
          : [
              { donor: 'O4(T)', acceptor: 'N6(A)', len: 2.91 },
              { donor: 'N3(T)', acceptor: 'N1(A)', len: 2.82 },
            ];
      offsets.forEach((latOffset, idx) => {
        const shift = scaleVec(lateralWorld, latOffset);
        hydrogenBonds.push({
          index: idx,
          donorLabel: labels[idx].donor,
          acceptorLabel: labels[idx].acceptor,
          startWorld: addVec(gapStart, shift),
          endWorld: addVec(gapEnd, shift),
          lengthAngstrom: labels[idx].len,
        });
      });
    } else {
      // G-C pair: 3 canonical hydrogen bonds (O6..N4, N1..N3, N2..O2)
      const offsets = [-0.3, 0, 0.3];
      const labels =
        base1 === 'G'
          ? [
              { donor: 'O6(G)', acceptor: 'N4(C)', len: 2.91 },
              { donor: 'N1(G)', acceptor: 'N3(C)', len: 2.95 },
              { donor: 'N2(G)', acceptor: 'O2(C)', len: 2.86 },
            ]
          : [
              { donor: 'N4(C)', acceptor: 'O6(G)', len: 2.91 },
              { donor: 'N3(C)', acceptor: 'N1(G)', len: 2.95 },
              { donor: 'O2(C)', acceptor: 'N2(G)', len: 2.86 },
            ];
      offsets.forEach((latOffset, idx) => {
        const shift = scaleVec(lateralWorld, latOffset);
        hydrogenBonds.push({
          index: idx,
          donorLabel: labels[idx].donor,
          acceptorLabel: labels[idx].acceptor,
          startWorld: addVec(gapStart, shift),
          endWorld: addVec(gapEnd, shift),
          lengthAngstrom: labels[idx].len,
        });
      });
    }

    // Groove markers
    const minorBisectorAngle = theta1 + BDNA_CONSTANTS.MINOR_GROOVE_PHASE_RAD / 2;
    const majorBisectorAngle = minorBisectorAngle + Math.PI;
    const minorGrooveCenterWorld = nmToWorld(
      {
        x: 0.95 * Math.cos(minorBisectorAngle),
        y: 0.95 * Math.sin(minorBisectorAngle),
        z: axialZNm,
      },
      centerZNm
    );
    const majorGrooveCenterWorld = nmToWorld(
      {
        x: 0.95 * Math.cos(majorBisectorAngle),
        y: 0.95 * Math.sin(majorBisectorAngle),
        z: axialZNm,
      },
      centerZNm
    );

    strand1BackboneCurveWorld.push(strand1Node.phosphateWorld);
    strand2BackboneCurveWorld.push(strand2Node.phosphateWorld);

    steps.push({
      bpIndex: i,
      sequenceNumber: i + 1,
      thetaRad: theta1,
      thetaDeg: Number(((theta1 * 180) / Math.PI).toFixed(2)),
      axialZNm: Number(axialZNm.toFixed(3)),
      worldY: strand1Node.sugarCenterWorld.y,
      strand1Node,
      strand2Node,
      hydrogenBonds,
      majorGrooveCenterWorld,
      minorGrooveCenterWorld,
    });
  }

  // Add phosphodiester backbone bonds connecting consecutive nucleotides along each strand
  for (let i = 0; i < n - 1; i++) {
    const s1Curr = steps[i].strand1Node;
    const s1Next = steps[i + 1].strand1Node;
    const c3Curr1 = s1Curr.atoms.find((a) => a.label === "C3'");
    const pNext1 = s1Next.atoms.find((a) => a.label === 'P');
    if (c3Curr1 && pNext1) {
      s1Curr.bonds.push({
        fromWorld: c3Curr1.positionWorld,
        toWorld: pNext1.positionWorld,
        fromElement: 'C',
        toElement: 'P',
        bondType: 'phosphodiester',
      });
    }

    const s2Curr = steps[i].strand2Node;
    const s2Next = steps[i + 1].strand2Node;
    const c3Next2 = s2Next.atoms.find((a) => a.label === "C3'");
    const pCurr2 = s2Curr.atoms.find((a) => a.label === 'P');
    if (c3Next2 && pCurr2) {
      s2Curr.bonds.push({
        fromWorld: c3Next2.positionWorld,
        toWorld: pCurr2.positionWorld,
        fromElement: 'C',
        toElement: 'P',
        bondType: 'phosphodiester',
      });
    }
  }

  return {
    isIdealizedModel: true,
    modelDisclaimer:
      'Idealized canonical B-DNA fiber geometry (10.5 bp/turn, 0.34 nm axial rise, 2.0 nm diameter). Switch to Structural PDB Viewer for experimental crystallographic coordinates.',
    sequence5to3: cleaned,
    complementary3to5: steps.map((s) => s.strand2Node.base).join(''),
    basePairsPerTurn: BDNA_CONSTANTS.BASE_PAIRS_PER_TURN,
    axialRiseNm: BDNA_CONSTANTS.AXIAL_RISE_NM,
    helixDiameterNm: BDNA_CONSTANTS.HELIX_DIAMETER_NM,
    helicalPitchNm: BDNA_CONSTANTS.HELICAL_PITCH_NM,
    minorGrooveAngleDeg: 132,
    majorGrooveAngleDeg: 228,
    worldScalePerNm: BDNA_CONSTANTS.WORLD_UNITS_PER_NM,
    steps,
    strand1BackboneCurveWorld,
    strand2BackboneCurveWorld,
  };
}

export interface ReplicationForkStep {
  bpIndex: number;
  isUnwound: boolean;
  separationFactor: number; // 0 = intact duplex, 1 = fully separated template strands
  parentStrand1PosWorld: Vec3;
  parentStrand2PosWorld: Vec3;
  parentBase1PosWorld: Vec3;
  parentBase2PosWorld: Vec3;
  base1: DNABase;
  base2: DNABase;
  // Newly synthesized daughter strands (5' -> 3')
  hasLeadingDaughter: boolean;
  leadingDaughterBase: DNABase; // complements parent strand 2 (3'->5' template)
  leadingDaughterPosWorld: Vec3;
  leadingDaughterBackboneWorld: Vec3;
  hasLaggingDaughter: boolean;
  laggingDaughterBase: DNABase; // complements parent strand 1 (5'->3' template, synthesized in Okazaki fragments)
  laggingDaughterPosWorld: Vec3;
  laggingDaughterBackboneWorld: Vec3;
  okazakiFragmentId: number;
}

export interface ReplicationForkModel {
  forkBpIndex: number;
  forkWorldY: number;
  progress: number;
  helicasePositionWorld: Vec3;
  leadingPolymerasePosWorld: Vec3;
  laggingPolymerasePosWorld: Vec3;
  steps: ReplicationForkStep[];
}

/**
 * Computes educational 3D coordinates for DNA Replication Fork progression.
 * - Parent Strand 2 (3′→5′ upward) serves as the Leading Strand template (continuous 5′→3′ synthesis toward the fork).
 * - Parent Strand 1 (5′→3′ upward) serves as the Lagging Strand template (discontinuous 5′→3′ Okazaki fragments synthesized away from the fork).
 */
export function generateReplicationForkCoordinates(
  sequence: string,
  progress: number // 0 to 1
): ReplicationForkModel {
  const baseHelix = generateBDNAHelixCoordinates(sequence);
  const n = baseHelix.steps.length;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const forkFloat = clampedProgress * (n - 1);
  const forkBpIndex = Math.floor(forkFloat);

  const steps: ReplicationForkStep[] = [];
  const okazakiSize = 4; // 4-bp Okazaki fragments for clear visual segmentation

  for (let i = 0; i < n; i++) {
    const s = baseHelix.steps[i];
    // Unwinding starts from the bottom (bpIndex = 0) and moves upward toward bpIndex = n - 1
    const distBehindFork = forkFloat - i;
    const isUnwound = distBehindFork > 0;
    const separationFactor = isUnwound
      ? Math.min(1, distBehindFork / 3.5)
      : 0;

    // Splay the two parent strands apart into a Y-shaped replication fork
    const splayX = separationFactor * (3.2 + Math.max(0, distBehindFork) * 0.28);

    const parentStrand1PosWorld: Vec3 = {
      x: s.strand1Node.phosphateWorld.x * (1 - separationFactor * 0.65) - splayX,
      y: s.strand1Node.phosphateWorld.y,
      z: s.strand1Node.phosphateWorld.z * (1 - separationFactor * 0.65),
    };
    const parentBase1PosWorld: Vec3 = {
      x: parentStrand1PosWorld.x + 0.95,
      y: parentStrand1PosWorld.y,
      z: parentStrand1PosWorld.z * 0.5,
    };

    const parentStrand2PosWorld: Vec3 = {
      x: s.strand2Node.phosphateWorld.x * (1 - separationFactor * 0.65) + splayX,
      y: s.strand2Node.phosphateWorld.y,
      z: s.strand2Node.phosphateWorld.z * (1 - separationFactor * 0.65),
    };
    const parentBase2PosWorld: Vec3 = {
      x: parentStrand2PosWorld.x - 0.95,
      y: parentStrand2PosWorld.y,
      z: parentStrand2PosWorld.z * 0.5,
    };

    // Leading strand is synthesized continuously 5'->3' along parent strand 2 (which runs 3'->5' toward the fork)
    const hasLeadingDaughter = distBehindFork >= 1.0;
    const leadingDaughterBackboneWorld: Vec3 = {
      x: parentStrand2PosWorld.x - 2.1,
      y: parentStrand2PosWorld.y,
      z: parentStrand2PosWorld.z,
    };
    const leadingDaughterPosWorld: Vec3 = {
      x: parentStrand2PosWorld.x - 1.35,
      y: parentStrand2PosWorld.y,
      z: parentStrand2PosWorld.z * 0.5,
    };

    // Lagging strand is synthesized discontinuously 5'->3' (away from fork) in Okazaki fragments along parent strand 1
    const okazakiFragmentId = Math.floor(i / okazakiSize);
    const fragmentEndBp = (okazakiFragmentId + 1) * okazakiSize - 1;
    // An Okazaki fragment begins synthesis once the fork has passed its 5' start site
    const hasLaggingDaughter =
      distBehindFork >= 1.6 && forkFloat >= Math.min(n - 1, fragmentEndBp - 0.5);

    const laggingDaughterBackboneWorld: Vec3 = {
      x: parentStrand1PosWorld.x + 2.1,
      y: parentStrand1PosWorld.y,
      z: parentStrand1PosWorld.z,
    };
    const laggingDaughterPosWorld: Vec3 = {
      x: parentStrand1PosWorld.x + 1.35,
      y: parentStrand1PosWorld.y,
      z: parentStrand1PosWorld.z * 0.5,
    };

    steps.push({
      bpIndex: i,
      isUnwound,
      separationFactor,
      parentStrand1PosWorld,
      parentStrand2PosWorld,
      parentBase1PosWorld,
      parentBase2PosWorld,
      base1: s.strand1Node.base,
      base2: s.strand2Node.base,
      hasLeadingDaughter,
      leadingDaughterBase: getComplementBase(s.strand2Node.base),
      leadingDaughterPosWorld,
      leadingDaughterBackboneWorld,
      hasLaggingDaughter,
      laggingDaughterBase: getComplementBase(s.strand1Node.base),
      laggingDaughterPosWorld,
      laggingDaughterBackboneWorld,
      okazakiFragmentId,
    });
  }

  const forkStep = steps[Math.min(n - 1, Math.max(0, forkBpIndex))] || steps[0];
  const forkWorldY = forkStep ? forkStep.parentStrand1PosWorld.y : 0;

  const leadingIdx = Math.max(0, Math.min(n - 1, Math.floor(forkFloat - 1)));
  const laggingIdx = Math.max(0, Math.min(n - 1, Math.floor(forkFloat - 2)));

  return {
    forkBpIndex,
    forkWorldY,
    progress: clampedProgress,
    helicasePositionWorld: { x: 0, y: forkWorldY, z: 0 },
    leadingPolymerasePosWorld: steps[leadingIdx]
      ? steps[leadingIdx].leadingDaughterBackboneWorld
      : { x: 2, y: forkWorldY, z: 0 },
    laggingPolymerasePosWorld: steps[laggingIdx]
      ? steps[laggingIdx].laggingDaughterBackboneWorld
      : { x: -2, y: forkWorldY, z: 0 },
    steps,
  };
}

export interface TranscriptionStep {
  bpIndex: number;
  inBubble: boolean;
  bubbleFactor: number;
  isTranscribed: boolean;
  codingStrandPosWorld: Vec3;
  templateStrandPosWorld: Vec3;
  codingBasePosWorld: Vec3;
  templateBasePosWorld: Vec3;
  codingBase: DNABase;
  templateBase: DNABase;
  rnaBase: RNABase;
  rnaBackbonePosWorld: Vec3;
  rnaBasePosWorld: Vec3;
}

export interface TranscriptionBubbleModel {
  activeBpIndex: number;
  polymeraseCenterWorld: Vec3;
  progress: number;
  nascentRNASequence5to3: string;
  steps: TranscriptionStep[];
}

/**
 * Generates 3D coordinates for an active Transcription Bubble with RNA Polymerase and a nascent 5′→3′ mRNA transcript (containing Uracil U instead of Thymine T).
 */
export function generateTranscriptionBubbleCoordinates(
  sequence: string,
  progress: number // 0 to 1
): TranscriptionBubbleModel {
  const baseHelix = generateBDNAHelixCoordinates(sequence);
  const n = baseHelix.steps.length;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const activeFloat = clampedProgress * (n - 1);
  const activeBpIndex = Math.floor(activeFloat);
  const bubbleHalfWidth = 3.2; // ~6-7 bp local transcription bubble

  const steps: TranscriptionStep[] = [];
  let nascentRNA = '';

  for (let i = 0; i < n; i++) {
    const s = baseHelix.steps[i];
    const distFromActive = Math.abs(i - activeFloat);
    const inBubble = distFromActive < bubbleHalfWidth;
    const bubbleFactor = inBubble
      ? Math.cos(((distFromActive / bubbleHalfWidth) * Math.PI) / 2)
      : 0;

    const isTranscribed = i <= activeFloat;
    const rnaBase = getRNAComplementBase(s.strand2Node.base);
    if (isTranscribed) {
      nascentRNA += rnaBase;
    }

    // Locally open the DNA strands inside the transcription bubble
    const openOffset = bubbleFactor * 2.1;
    const codingStrandPosWorld: Vec3 = {
      x: s.strand1Node.phosphateWorld.x - openOffset,
      y: s.strand1Node.phosphateWorld.y,
      z: s.strand1Node.phosphateWorld.z,
    };
    const codingBasePosWorld: Vec3 = {
      x: s.strand1Node.baseCenterWorld.x - openOffset * 0.85,
      y: s.strand1Node.baseCenterWorld.y,
      z: s.strand1Node.baseCenterWorld.z,
    };

    const templateStrandPosWorld: Vec3 = {
      x: s.strand2Node.phosphateWorld.x + openOffset,
      y: s.strand2Node.phosphateWorld.y,
      z: s.strand2Node.phosphateWorld.z,
    };
    const templateBasePosWorld: Vec3 = {
      x: s.strand2Node.baseCenterWorld.x + openOffset * 0.85,
      y: s.strand2Node.baseCenterWorld.y,
      z: s.strand2Node.baseCenterWorld.z,
    };

    // Nascent RNA pairs transiently inside the bubble, then peels out into the exit channel behind the polymerase
    const behindDistance = Math.max(0, activeFloat - i);
    const peelFactor = Math.max(0, (behindDistance - 2.0) * 0.55);

    const rnaBackbonePosWorld: Vec3 = {
      x: templateStrandPosWorld.x - 1.55 + peelFactor * 2.2,
      y: templateStrandPosWorld.y - peelFactor * 0.25,
      z: templateStrandPosWorld.z + 1.1 + peelFactor * 1.4,
    };
    const rnaBasePosWorld: Vec3 = {
      x: templateBasePosWorld.x - 0.85 + peelFactor * 1.8,
      y: templateBasePosWorld.y - peelFactor * 0.2,
      z: templateBasePosWorld.z + 0.65 + peelFactor * 1.1,
    };

    steps.push({
      bpIndex: i,
      inBubble,
      bubbleFactor,
      isTranscribed,
      codingStrandPosWorld,
      templateStrandPosWorld,
      codingBasePosWorld,
      templateBasePosWorld,
      codingBase: s.strand1Node.base,
      templateBase: s.strand2Node.base,
      rnaBase,
      rnaBackbonePosWorld,
      rnaBasePosWorld,
    });
  }

  const activeStep = steps[Math.min(n - 1, Math.max(0, activeBpIndex))] || steps[0];
  return {
    activeBpIndex,
    polymeraseCenterWorld: {
      x: 0,
      y: activeStep ? activeStep.templateStrandPosWorld.y : 0,
      z: 0,
    },
    progress: clampedProgress,
    nascentRNASequence5to3: nascentRNA,
    steps,
  };
}
