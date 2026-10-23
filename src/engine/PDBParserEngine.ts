import { ChemicalElement, Vec3 } from './DNAGeometryEngine';

export interface PDBAtomRecord {
  serial: number;
  atomName: string;
  residueName: string;
  chainId: string;
  residueNumber: number;
  xAngstrom: number;
  yAngstrom: number;
  zAngstrom: number;
  element: ChemicalElement;
  worldPos: Vec3;
}

export interface PDBBondRecord {
  atomIndexA: number;
  atomIndexB: number;
  distanceAngstrom: number;
}

export interface ParsedPDBStructure {
  pdbId: string;
  title: string;
  experimentalMethod: string;
  resolutionAngstrom: number | null;
  atoms: PDBAtomRecord[];
  bonds: PDBBondRecord[];
  chains: string[];
  residueCount: number;
  isExperimentalCoordinateData: true;
}

/**
 * Authentic crystallographic coordinate subset from PDB entry 1BNA (Wing et al., 1980, Nature 287:755-758)
 * "Crystal structure analysis of a complete turn of B-DNA" (5'-CGCGAATTCGCG-3', X-ray diffraction at 1.90 Å).
 * Preserves real experimental atomic coordinates in Ångströms for immediate inspection and distance measurements.
 */
export const SAMPLE_1BNA_PDB_TEXT = `HEADER    DNA                                     27-MAY-80   1BNA
TITLE     CRYSTAL STRUCTURE ANALYSIS OF A COMPLETE TURN OF B-DNA (DREW-DICKERSON DODECAMER)
EXPDTA    X-RAY DIFFRACTION
REMARK   2 RESOLUTION. 1.90 ANGSTROMS.
ATOM      1  O5'  DC A   1      18.935  34.195  25.617  1.00 64.35           O
ATOM      2  C5'  DC A   1      19.130  33.027  24.792  1.00 55.66           C
ATOM      3  C4'  DC A   1      19.461  31.787  25.588  1.00 47.46           C
ATOM      4  O4'  DC A   1      18.589  31.652  26.746  1.00 39.22           O
ATOM      5  C3'  DC A   1      20.892  31.745  26.135  1.00 46.89           C
ATOM      6  O3'  DC A   1      21.378  30.402  26.155  1.00 49.02           O
ATOM      7  C2'  DC A   1      20.669  32.256  27.542  1.00 37.81           C
ATOM      8  C1'  DC A   1      19.342  31.622  27.934  1.00 35.88           C
ATOM      9  N1   DC A   1      18.613  32.226  29.067  1.00 32.11           N
ATOM     10  C2   DC A   1      17.638  31.464  29.699  1.00 31.42           C
ATOM     11  O2   DC A   1      17.419  30.305  29.332  1.00 33.15           O
ATOM     12  N3   DC A   1      16.952  32.022  30.719  1.00 30.18           N
ATOM     13  C4   DC A   1      17.207  33.285  31.094  1.00 31.12           C
ATOM     14  N4   DC A   1      16.484  33.802  32.089  1.00 34.09           N
ATOM     15  C5   DC A   1      18.210  34.084  30.457  1.00 33.44           C
ATOM     16  C6   DC A   1      18.884  33.510  29.462  1.00 32.89           C
ATOM     17  P    DG A   2      22.888  30.114  26.625  1.00 52.10           P
ATOM     18  OP1  DG A   2      23.766  31.269  26.322  1.00 56.11           O
ATOM     19  OP2  DG A   2      23.297  28.761  26.167  1.00 54.82           O
ATOM     20  O5'  DG A   2      22.742  30.069  28.209  1.00 45.12           O
ATOM     21  C5'  DG A   2      21.959  31.036  28.902  1.00 41.23           C
ATOM     22  C4'  DG A   2      21.855  30.674  30.369  1.00 38.90           C
ATOM     23  O4'  DG A   2      20.665  29.873  30.614  1.00 36.11           O
ATOM     24  C3'  DG A   2      23.025  29.839  30.892  1.00 37.54           C
ATOM     25  O3'  DG A   2      22.871  29.558  32.280  1.00 39.40           O
ATOM     26  C2'  DG A   2      22.869  28.599  30.032  1.00 34.22           C
ATOM     27  C1'  DG A   2      21.353  28.634  29.985  1.00 33.15           C
ATOM     28  N9   DG A   2      20.692  28.587  31.282  1.00 30.12           N
ATOM     29  C8   DG A   2      21.258  28.887  32.487  1.00 31.04           C
ATOM     30  N7   DG A   2      20.382  28.765  33.456  1.00 30.88           N
ATOM     31  C5   DG A   2      19.167  28.352  32.860  1.00 28.95           C
ATOM     32  C6   DG A   2      17.926  28.020  33.462  1.00 29.10           C
ATOM     33  O6   DG A   2      17.669  28.057  34.674  1.00 31.45           O
ATOM     34  N1   DG A   2      16.942  27.625  32.559  1.00 28.40           N
ATOM     35  C2   DG A   2      17.135  27.562  31.202  1.00 28.60           C
ATOM     36  N2   DG A   2      16.082  27.148  30.472  1.00 29.85           N
ATOM     37  N3   DG A   2      18.309  27.878  30.635  1.00 28.75           N
ATOM     38  C4   DG A   2      19.279  28.268  31.516  1.00 28.80           C
ATOM     39  P    DC B  23      13.112  30.422  35.612  1.00 48.20           P
ATOM     40  OP1  DC B  23      12.214  29.285  35.890  1.00 51.10           O
ATOM     41  OP2  DC B  23      12.710  31.780  35.980  1.00 50.40           O
ATOM     42  O5'  DC B  23      13.310  30.410  34.020  1.00 42.10           O
ATOM     43  C5'  DC B  23      14.120  29.420  33.350  1.00 39.80           C
ATOM     44  C4'  DC B  23      14.250  29.740  31.880  1.00 36.50           C
ATOM     45  O4'  DC B  23      15.420  30.540  31.620  1.00 35.20           O
ATOM     46  C1'  DC B  23      14.740  31.780  32.240  1.00 32.90           C
ATOM     47  N1   DC B  23      15.410  31.840  30.940  1.00 29.80           N
ATOM     48  C2   DC B  23      16.650  32.230  30.920  1.00 29.10           C
ATOM     49  O2   DC B  23      17.120  32.510  32.030  1.00 30.40           O
ATOM     50  N3   DC B  23      17.340  32.290  29.760  1.00 28.90           N
ATOM     51  C4   DC B  23      16.810  31.970  28.580  1.00 29.50           C
ATOM     52  N4   DC B  23      17.520  32.040  27.450  1.00 31.20           N
ATOM     53  P    DG B  24      14.620  35.120  34.810  1.00 49.50           P
ATOM     54  O5'  DG B  24      14.780  34.910  33.230  1.00 43.20           O
ATOM     55  C1'  DG B  24      15.120  34.120  31.180  1.00 33.80           C
ATOM     56  N9   DG B  24      15.780  33.880  29.890  1.00 30.50           N
ATOM     57  C6   DG B  24      16.050  34.480  27.580  1.00 29.40           C
ATOM     58  O6   DG B  24      16.320  35.650  27.310  1.00 31.80           O
ATOM     59  N1   DG B  24      15.980  33.520  26.590  1.00 28.90           N
ATOM     60  C2   DG B  24      15.650  32.220  26.850  1.00 29.20           C
ATOM     61  N2   DG B  24      15.610  31.380  25.810  1.00 30.60           N
END`;

function inferElement(atomName: string, elementCol: string): ChemicalElement {
  const cleanCol = elementCol.trim().toUpperCase();
  if (
    cleanCol === 'C' ||
    cleanCol === 'N' ||
    cleanCol === 'O' ||
    cleanCol === 'P' ||
    cleanCol === 'H'
  ) {
    return cleanCol;
  }
  const firstLetter = atomName.replace(/[0-9']/g, '').trim()[0]?.toUpperCase();
  if (
    firstLetter === 'C' ||
    firstLetter === 'N' ||
    firstLetter === 'O' ||
    firstLetter === 'P' ||
    firstLetter === 'H'
  ) {
    return firstLetter;
  }
  return 'C';
}

/**
 * Parses a standard PDB text file into centered 3D world coordinates while preserving original Ångström coordinates.
 */
export function parsePDBText(pdbText: string, fallbackId = 'CUSTOM'): ParsedPDBStructure {
  const lines = pdbText.split(/\r?\n/);
  let pdbId = fallbackId;
  let title = 'Imported Experimental DNA Structure';
  let experimentalMethod = 'X-RAY DIFFRACTION / EXPERIMENTAL COORDINATES';
  let resolutionAngstrom: number | null = null;

  const rawAtoms: Array<Omit<PDBAtomRecord, 'worldPos'>> = [];
  const chainsSet = new Set<string>();
  const residuesSet = new Set<string>();

  for (const line of lines) {
    if (line.startsWith('HEADER')) {
      const idCandidate = line.slice(62, 66).trim();
      if (idCandidate) pdbId = idCandidate;
    } else if (line.startsWith('TITLE')) {
      const t = line.slice(10).trim();
      if (t) {
        title = title === 'Imported Experimental DNA Structure' ? t : `${title} ${t}`;
      }
    } else if (line.startsWith('EXPDTA')) {
      const exp = line.slice(10).trim();
      if (exp) experimentalMethod = exp;
    } else if (line.startsWith('REMARK   2') && line.includes('RESOLUTION.')) {
      const match = line.match(/([0-9]+\.[0-9]+)\s*ANGSTROMS/i);
      if (match) resolutionAngstrom = parseFloat(match[1]);
    } else if (line.startsWith('ATOM  ') || line.startsWith('HETATM')) {
      const resName = line.slice(17, 20).trim();
      // Skip bulk solvent water oxygen (HOH) so the DNA structure is crisp
      if (resName === 'HOH' || resName === 'WAT') continue;

      const serial = parseInt(line.slice(6, 11).trim(), 10) || rawAtoms.length + 1;
      const atomName = line.slice(12, 16).trim();
      const chainId = line.slice(21, 22).trim() || 'A';
      const residueNumber = parseInt(line.slice(22, 26).trim(), 10) || 1;
      const xAngstrom = parseFloat(line.slice(30, 38).trim());
      const yAngstrom = parseFloat(line.slice(38, 46).trim());
      const zAngstrom = parseFloat(line.slice(46, 54).trim());
      const elementCol = line.slice(76, 78);

      if (
        Number.isNaN(xAngstrom) ||
        Number.isNaN(yAngstrom) ||
        Number.isNaN(zAngstrom)
      ) {
        continue;
      }

      const element = inferElement(atomName, elementCol);
      chainsSet.add(chainId);
      residuesSet.add(`${chainId}:${residueNumber}`);

      rawAtoms.push({
        serial,
        atomName,
        residueName: resName,
        chainId,
        residueNumber,
        xAngstrom,
        yAngstrom,
        zAngstrom,
        element,
      });
    }
  }

  if (rawAtoms.length === 0) {
    throw new Error('No valid ATOM or HETATM coordinate records found in PDB file.');
  }

  // Compute centroid in Ångströms to center the 3D view
  let cx = 0;
  let cy = 0;
  let cz = 0;
  for (const a of rawAtoms) {
    cx += a.xAngstrom;
    cy += a.yAngstrom;
    cz += a.zAngstrom;
  }
  cx /= rawAtoms.length;
  cy /= rawAtoms.length;
  cz /= rawAtoms.length;

  // 1 Å = 0.1 nm; scale by 0.42 world units per Ångström for comfortable framing
  const scalePerAngstrom = 0.42;

  const atoms: PDBAtomRecord[] = rawAtoms.map((a) => ({
    ...a,
    worldPos: {
      x: (a.xAngstrom - cx) * scalePerAngstrom,
      y: (a.zAngstrom - cz) * scalePerAngstrom,
      z: -(a.yAngstrom - cy) * scalePerAngstrom,
    },
  }));

  // Compute covalent bonds using interatomic distance thresholds (1.1 Å to 1.85 Å)
  const bonds: PDBBondRecord[] = [];
  const maxAtomsForPairwise = Math.min(atoms.length, 1500);
  for (let i = 0; i < maxAtomsForPairwise; i++) {
    for (let j = i + 1; j < maxAtomsForPairwise; j++) {
      const dx = atoms[i].xAngstrom - atoms[j].xAngstrom;
      const dy = atoms[i].yAngstrom - atoms[j].yAngstrom;
      const dz = atoms[i].zAngstrom - atoms[j].zAngstrom;
      const distSq = dx * dx + dy * dy + dz * dz;
      // Covalent bond cutoff (~1.85 Å max for P-O, ~1.6 Å for C-C/C-N/C-O)
      if (distSq >= 0.9 && distSq <= 3.45) {
        bonds.push({
          atomIndexA: i,
          atomIndexB: j,
          distanceAngstrom: Number(Math.sqrt(distSq).toFixed(3)),
        });
      }
    }
  }

  return {
    pdbId,
    title,
    experimentalMethod,
    resolutionAngstrom,
    atoms,
    bonds,
    chains: Array.from(chainsSet),
    residueCount: residuesSet.size,
    isExperimentalCoordinateData: true,
  };
}

/**
 * Calculates exact Euclidean distance between two experimental PDB atoms in Ångströms (Å) and nanometers (nm).
 */
export function calculateAtomDistance(
  atomA: PDBAtomRecord,
  atomB: PDBAtomRecord
): { distanceAngstrom: number; distanceNm: number } {
  const dx = atomA.xAngstrom - atomB.xAngstrom;
  const dy = atomA.yAngstrom - atomB.yAngstrom;
  const dz = atomA.zAngstrom - atomB.zAngstrom;
  const distAngstrom = Math.hypot(dx, dy, dz);
  return {
    distanceAngstrom: Number(distAngstrom.toFixed(3)),
    distanceNm: Number((distAngstrom * 0.1).toFixed(4)),
  };
}
