export type DNABase = 'A' | 'T' | 'G' | 'C';
export type RNABase = 'A' | 'U' | 'G' | 'C';
export type BaseClassification = 'Purine' | 'Pyrimidine';

export interface NucleotideMetadata {
  symbol: DNABase;
  name: string;
  fullName: string;
  complement: DNABase;
  rnaComplement: RNABase;
  classification: BaseClassification;
  rings: 1 | 2;
  hydrogenBonds: 2 | 3;
  molecularMassDa: number;
  formula: string;
  iupacNumberingNote: string;
  colorHex: string;
  complementColorHex: string;
  scientificSummaryEn: string;
  scientificSummarySiEn: string;
}

export const NUCLEOTIDE_DATABASE: Record<DNABase, NucleotideMetadata> = {
  A: {
    symbol: 'A',
    name: 'Adenine',
    fullName: 'Deoxyadenosine 5′-monophosphate (dAMP)',
    complement: 'T',
    rnaComplement: 'U',
    classification: 'Purine',
    rings: 2,
    hydrogenBonds: 2,
    molecularMassDa: 331.22,
    formula: 'C10H14N5O6P',
    iupacNumberingNote: 'Glycosidic bond links N9 of purine bicycle to C1′ of 2′-deoxyribose.',
    colorHex: '#10b981', // Emerald Green
    complementColorHex: '#ef4444',
    scientificSummaryEn:
      'Adenine is a bicyclic purine nitrogenous base (fused 6-membered pyrimidine + 5-membered imidazole ring). In canonical Watson-Crick B-DNA, Adenine forms 2 hydrogen bonds with Thymine (N6–H···O4 and N1···H–N3).',
    scientificSummarySiEn:
      'Adenine යනු 6-membered සහ 5-membered වළලු දෙකකින් සමන්විත double-ring Purine nitrogenous base එකකි. Canonical B-DNA ව්‍යුහයේදී Adenine සෑමවිටම ප්‍රතිවිරුද්ධ දාමයේ Thymine (T) සමඟ Hydrogen bonds 2ක් (N6–H···O4 සහ N1···H–N3) සාදමින් සම්බන්ධ වේ.',
  },
  T: {
    symbol: 'T',
    name: 'Thymine',
    fullName: 'Deoxythymidine 5′-monophosphate (dTMP)',
    complement: 'A',
    rnaComplement: 'A',
    classification: 'Pyrimidine',
    rings: 1,
    hydrogenBonds: 2,
    molecularMassDa: 322.21,
    formula: 'C10H15N2O8P',
    iupacNumberingNote: 'Glycosidic bond links N1 of 5-methylpyrimidine ring to C1′ of 2′-deoxyribose.',
    colorHex: '#ef4444', // Crimson Red
    complementColorHex: '#10b981',
    scientificSummaryEn:
      'Thymine (5-methyluracil) is a monocyclic 6-membered pyrimidine base exclusive to DNA. Its C5 methyl group projects into the major groove, enhancing hydrophobic base-stacking stability and distinguishing DNA from RNA (which uses Uracil).',
    scientificSummarySiEn:
      'Thymine (5-methyluracil) යනු තනි වළල්ලකින් (single 6-membered ring) සමන්විත Pyrimidine base එකකි. එය Adenine (A) සමඟ Hydrogen bonds 2ක් සාදයි. RNA වලදී Thymine වෙනුවට Uracil (U) පවතින අතර Thymine හි C5 methyl කාණ්ඩය DNA අණුවේ රසායනික ස්ථායිතාව වැඩි කරයි.',
  },
  G: {
    symbol: 'G',
    name: 'Guanine',
    fullName: 'Deoxyguanosine 5′-monophosphate (dGMP)',
    complement: 'C',
    rnaComplement: 'C',
    classification: 'Purine',
    rings: 2,
    hydrogenBonds: 3,
    molecularMassDa: 347.22,
    formula: 'C10H14N5O7P',
    iupacNumberingNote: 'Glycosidic bond links N9 of purine bicycle to C1′ of 2′-deoxyribose.',
    colorHex: '#3b82f6', // Cobalt Blue
    complementColorHex: '#eab308',
    scientificSummaryEn:
      'Guanine is a bicyclic purine base featuring a carbonyl oxygen at C6 and an exocyclic amino group at C2. It forms 3 canonical hydrogen bonds with Cytosine (O6···H–N4, N1–H···N3, and N2–H···O2), conferring higher thermal stability.',
    scientificSummarySiEn:
      'Guanine යනු වළලු දෙකකින් යුත් Purine nitrogenous base එකකි. එය Cytosine (C) සමඟ ප්‍රබල Hydrogen bonds 3ක් (O6···H–N4, N1–H···N3, සහ N2–H···O2) සාදයි. එබැවින් ඉහළ GC-content එකක් සහිත DNA කලාපවල තාප ස්ථායිතාව (Melting temperature, Tm) ඉහළ අගයක් ගනී.',
  },
  C: {
    symbol: 'C',
    name: 'Cytosine',
    fullName: 'Deoxycytidine 5′-monophosphate (dCMP)',
    complement: 'G',
    rnaComplement: 'G',
    classification: 'Pyrimidine',
    rings: 1,
    hydrogenBonds: 3,
    molecularMassDa: 307.2,
    formula: 'C9H14N3O7P',
    iupacNumberingNote: 'Glycosidic bond links N1 of pyrimidine ring to C1′ of 2′-deoxyribose.',
    colorHex: '#eab308', // Golden Yellow
    complementColorHex: '#3b82f6',
    scientificSummaryEn:
      'Cytosine is a monocyclic pyrimidine base with an exocyclic amino group at C4 and keto oxygen at C2. It pairs with Guanine via 3 canonical hydrogen bonds and is a key epigenetic target for C5 methylation at CpG dinucleotides.',
    scientificSummarySiEn:
      'Cytosine යනු තනි වළල්ලකින් (single-ring) යුත් Pyrimidine base එකකි. එය Guanine (G) සමඟ Hydrogen bonds 3ක් මගින් බැඳේ. ජාන ප්‍රකාශනය පාලනය කරන Epigenetic DNA methylation ක්‍රියාවලියේදී CpG ස්ථානවල පවතින Cytosine ප්‍රධාන කාර්යභාරයක් ඉටු කරයි.',
  },
};

export interface SequenceValidationResult {
  isValid: boolean;
  cleaned: string;
  invalidChars: string[];
  error?: string;
}

export interface SequenceAnalysis {
  sequence5to3: string;
  complementary3to5: string;
  reverseComplement5to3: string;
  mRNATranscript5to3: string;
  lengthBp: number;
  counts: Record<DNABase, number>;
  gcCount: number;
  atCount: number;
  gcPercentage: number;
  atPercentage: number;
  purineCount: number;
  pyrimidineCount: number;
  purinePyrimidineRatio: number;
  totalHydrogenBonds: number;
  contourLengthNm: number;
  contourLengthAngstrom: number;
  helicalTurns: number;
  meanRiseNm: number;
  meanTwistDeg: number;
  helixDiameterNm: number;
  molecularWeightDa: number;
  estimatedTmCelsius: number;
}

export interface DNAPresetSequence {
  id: string;
  name: string;
  category: string;
  sequence: string;
  pdbReference?: string;
  descriptionEn: string;
  descriptionSiEn: string;
}

export const DNA_PRESET_SEQUENCES: DNAPresetSequence[] = [
  {
    id: 'dickerson-1bna',
    name: 'Drew-Dickerson Dodecamer (1BNA)',
    category: 'Crystallographic Standard',
    sequence: 'CGCGAATTCGCG',
    pdbReference: '1BNA',
    descriptionEn:
      'Palindromic 12-bp B-DNA sequence containing an EcoRI restriction site (GAATTC). The first single-crystal X-ray structure of right-handed B-DNA solved by Wing et al. (1980) at 1.9 Å resolution.',
    descriptionSiEn:
      '1980 දී X-ray crystallography මගින් මුල්වරට නිවැරදිව තහවුරු කරන ලද 12-bp B-DNA අණුවයි (PDB: 1BNA). මෙහි මැද EcoRI එන්සයිමය හඳුනාගන්නා GAATTC palindromic අනුපිළිවෙල අඩංගු වේ.',
  },
  {
    id: 'tata-promoter',
    name: 'Eukaryotic Core TATA-Box Promoter',
    category: 'Gene Regulation',
    sequence: 'GCGTATAAAAGGCGC',
    descriptionEn:
      'Core promoter motif recognized by TATA-binding protein (TBP) of transcription factor TFIID. The AT-rich central box lowers local duplex melting energy while GC flanks stabilize boundaries.',
    descriptionSiEn:
      'Transcription ආරම්භ කිරීමට RNA Polymerase II හා TBP (TATA-binding protein) බැඳෙන Promoter කලාපයකි. AT-rich මැද කොටස Hydrogen bonds 2 බැගින් පවතින නිසා DNA දාම දෙක පහසුවෙන් වෙන් කිරීමට උපකාරී වේ.',
  },
  {
    id: 'telomere-repeat',
    name: 'Human Telomeric Repeat (TTAGGG)x3',
    category: 'Chromosome Ends',
    sequence: 'TTAGGGTTAGGGTTAGGG',
    descriptionEn:
      'Conserved hexanucleotide tandem repeat capping human chromosome ends, synthesized by telomerase to prevent replicative senescence and end-to-end chromosomal fusion.',
    descriptionSiEn:
      'මානව වර්ණදේහවල කෙළවර ආරක්ෂා කරන Telomere කලාපයේ පවතින TTAGGG පුනරාවර්තන අනුපිළිවෙලයි. සෛල බෙදීමේදී ජානමය දත්ත හානි වීම මෙමගින් වළක්වයි.',
  },
  {
    id: 'tp53-exon5',
    name: 'Human TP53 Tumor Suppressor Motif',
    category: 'Medical Genomics',
    sequence: 'AGGCCTTGGAACTCAAGG',
    descriptionEn:
      '18-bp coding fragment from Human TP53 tumor suppressor gene (Guardian of the Genome), encoding conserved DNA-binding domain residues.',
    descriptionSiEn:
      'සෛලවල අසාමාන්‍ය වර්ධනය පාලනය කරන TP53 tumor suppressor ජානයේ DNA-binding domain එකට අදාළ 18-bp කේතන කොටසකි.',
  },
  {
    id: 'cpg-island',
    name: 'High-Stability GC-Rich CpG Island',
    category: 'Epigenetics',
    sequence: 'CGCGCGCGCGCGCGCG',
    descriptionEn:
      'Alternating CG dinucleotide repeat with 100% GC content (3 hydrogen bonds per base pair), exhibiting maximum thermal stability and potential Z-DNA transition under high salt/supercoiling.',
    descriptionSiEn:
      '100% GC-content එකක් සහිත CpG island අනුපිළිවෙලකි. සෑම base pair එකකම Hydrogen bonds 3 බැගින් පවතින නිසා ඉතා ඉහළ තාප ස්ථායිතාවක් පෙන්වයි.',
  },
  {
    id: 'ori-at-rich',
    name: 'Replication Origin AT-Rich Element (DUE)',
    category: 'DNA Replication',
    sequence: 'TATATAAATATATAAATA',
    descriptionEn:
      'DNA Unwinding Element (DUE) with 100% AT content (2 hydrogen bonds per base pair), facilitating initial helicase-mediated strand separation at replication origins.',
    descriptionSiEn:
      'DNA Replication ආරම්භ වන Origin of replication කලාපයේ පවතින AT-බහුල කොටසකි. Hydrogen bonds 2 බැගින් පමණක් පවතින බැවින් Helicase එන්සයිමයට පහසුවෙන් දාම දෙක විවෘත කළ හැක.',
  },
];

/**
 * Validates and cleans a raw DNA sequence string (stripping FASTA headers and whitespace).
 */
export function validateDNASequence(raw: string): SequenceValidationResult {
  if (!raw || typeof raw !== 'string') {
    return {
      isValid: false,
      cleaned: '',
      invalidChars: [],
      error: 'Sequence cannot be empty. Enter A, T, G, or C nucleotides.',
    };
  }

  // Strip FASTA header lines if present
  const lines = raw
    .trim()
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('>'));

  const stripped = lines.join('').replace(/[\s\d-]/g, '').toUpperCase();

  if (stripped.length === 0) {
    return {
      isValid: false,
      cleaned: '',
      invalidChars: [],
      error: 'Sequence contains no nucleotide characters.',
    };
  }

  const invalidSet = new Set<string>();
  const validChars: string[] = [];

  for (const ch of stripped) {
    if (ch === 'A' || ch === 'T' || ch === 'G' || ch === 'C') {
      validChars.push(ch);
    } else {
      invalidSet.add(ch);
    }
  }

  const invalidChars = Array.from(invalidSet);
  if (invalidChars.length > 0) {
    return {
      isValid: false,
      cleaned: validChars.join(''),
      invalidChars,
      error: `Invalid nucleotide characters detected: ${invalidChars.join(', ')}. Only A, T, G, C are permitted in DNA.`,
    };
  }

  return {
    isValid: true,
    cleaned: validChars.join(''),
    invalidChars: [],
  };
}

export function getComplementBase(base: DNABase): DNABase {
  switch (base) {
    case 'A':
      return 'T';
    case 'T':
      return 'A';
    case 'G':
      return 'C';
    case 'C':
      return 'G';
  }
}

export function getRNAComplementBase(base: DNABase): RNABase {
  switch (base) {
    case 'A':
      return 'U';
    case 'T':
      return 'A';
    case 'G':
      return 'C';
    case 'C':
      return 'G';
  }
}

/**
 * Generates the aligned antiparallel complementary strand (written 3′ → 5′ to align position-by-position with 5′ → 3′ primary strand).
 */
export function getComplementaryStrand(sequence5to3: string): string {
  const cleaned = sequence5to3.toUpperCase().replace(/[^ATGC]/g, '');
  let result = '';
  for (let i = 0; i < cleaned.length; i++) {
    result += getComplementBase(cleaned[i] as DNABase);
  }
  return result;
}

/**
 * Generates the reverse-complement strand written in canonical 5′ → 3′ convention.
 */
export function getReverseComplement(sequence5to3: string): string {
  const comp3to5 = getComplementaryStrand(sequence5to3);
  return comp3to5.split('').reverse().join('');
}

/**
 * Transcribes a DNA sequence into a 5′ → 3′ mRNA transcript.
 * - If templateStrand === 'antisense' (standard convention: primary 5′→3′ strand is the coding/sense strand, and the 3′→5′ antiparallel strand serves as template),
 *   the resulting 5′→3′ mRNA matches the 5′→3′ coding strand with T replaced by U.
 * - If templateStrand === 'sense' (the primary strand is read 3′→5′ as template),
 *   the 5′→3′ RNA is complementary to the reversed primary strand.
 */
export function transcribeToRNA(
  sequence5to3: string,
  templateStrand: 'antisense' | 'sense' = 'antisense'
): {
  mRNA5to3: string;
  template3to5: string;
  coding5to3: string;
} {
  const coding = sequence5to3.toUpperCase().replace(/[^ATGC]/g, '');
  const antiparallel = getComplementaryStrand(coding);

  if (templateStrand === 'antisense') {
    // RNA polymerase reads the 3′→5′ antisense strand and synthesizes 5′→3′ mRNA complementary to it
    let mRNA = '';
    for (let i = 0; i < antiparallel.length; i++) {
      mRNA += getRNAComplementBase(antiparallel[i] as DNABase);
    }
    return {
      mRNA5to3: mRNA,
      template3to5: antiparallel,
      coding5to3: coding,
    };
  } else {
    // RNA polymerase reads the primary strand from 3′→5′ (right to left)
    let mRNA = '';
    for (let i = coding.length - 1; i >= 0; i--) {
      mRNA += getRNAComplementBase(coding[i] as DNABase);
    }
    return {
      mRNA5to3: mRNA,
      template3to5: coding.split('').reverse().join(''),
      coding5to3: getReverseComplement(coding),
    };
  }
}

/**
 * Performs comprehensive quantitative and structural analysis of a B-DNA sequence.
 */
export function analyzeSequence(rawSequence: string): SequenceAnalysis {
  const cleaned = rawSequence.toUpperCase().replace(/[^ATGC]/g, '');
  const lengthBp = cleaned.length;

  const counts: Record<DNABase, number> = { A: 0, T: 0, G: 0, C: 0 };
  for (let i = 0; i < lengthBp; i++) {
    const b = cleaned[i] as DNABase;
    counts[b]++;
  }

  const gcCount = counts.G + counts.C;
  const atCount = counts.A + counts.T;
  const gcPercentage = lengthBp > 0 ? (gcCount / lengthBp) * 100 : 0;
  const atPercentage = lengthBp > 0 ? (atCount / lengthBp) * 100 : 0;

  const purineCount = counts.A + counts.G;
  const pyrimidineCount = counts.T + counts.C;
  const purinePyrimidineRatio =
    pyrimidineCount > 0 ? purineCount / pyrimidineCount : purineCount;

  // Canonical hydrogen bonds: 2 per A-T pair, 3 per G-C pair
  const totalHydrogenBonds = atCount * 2 + gcCount * 3;

  // Canonical B-DNA structural parameters
  const meanRiseNm = 0.34; // 0.34 nm = 3.4 Å per base pair step
  const meanTwistDeg = 360 / 10.5; // ~34.2857° per base pair
  const helixDiameterNm = 2.0; // 2.0 nm = 20.0 Å
  const contourLengthNm = Number((lengthBp * meanRiseNm).toFixed(3));
  const contourLengthAngstrom = Number((contourLengthNm * 10).toFixed(2));
  const helicalTurns = Number((lengthBp / 10.5).toFixed(3));

  // Double-stranded B-DNA molecular weight (average ~650 Da per bp, or exact sum of nucleotides minus water of condensation)
  let mw = 0;
  const complementary3to5 = getComplementaryStrand(cleaned);
  for (let i = 0; i < lengthBp; i++) {
    const b1 = cleaned[i] as DNABase;
    const b2 = complementary3to5[i] as DNABase;
    mw +=
      NUCLEOTIDE_DATABASE[b1].molecularMassDa +
      NUCLEOTIDE_DATABASE[b2].molecularMassDa -
      36.03; // condensation of two phosphodiester bonds
  }
  const molecularWeightDa = Number(Math.max(0, mw).toFixed(1));

  // Melting temperature (Tm) estimation:
  // For short oligos (< 14 bp): Wallace rule Tm = 2*(A+T) + 4*(G+C)
  // For longer duplexes (>= 14 bp): Marmur-Doty / salt-adjusted equation Tm = 64.9 + 41*(G+C - 16.4)/N
  let estimatedTmCelsius = 0;
  if (lengthBp > 0) {
    if (lengthBp < 14) {
      estimatedTmCelsius = Number((2 * atCount + 4 * gcCount).toFixed(1));
    } else {
      estimatedTmCelsius = Number(
        (64.9 + (41 * (gcCount - 16.4)) / lengthBp).toFixed(1)
      );
    }
  }

  return {
    sequence5to3: cleaned,
    complementary3to5,
    reverseComplement5to3: getReverseComplement(cleaned),
    mRNATranscript5to3: transcribeToRNA(cleaned, 'antisense').mRNA5to3,
    lengthBp,
    counts,
    gcCount,
    atCount,
    gcPercentage: Number(gcPercentage.toFixed(2)),
    atPercentage: Number(atPercentage.toFixed(2)),
    purineCount,
    pyrimidineCount,
    purinePyrimidineRatio: Number(purinePyrimidineRatio.toFixed(2)),
    totalHydrogenBonds,
    contourLengthNm,
    contourLengthAngstrom,
    helicalTurns,
    meanRiseNm,
    meanTwistDeg: Number(meanTwistDeg.toFixed(2)),
    helixDiameterNm,
    molecularWeightDa,
    estimatedTmCelsius,
  };
}

/**
 * Deterministic Mulberry32 PRNG for reproducible random DNA sequence generation.
 */
export function generateSeededSequence(
  length: number,
  seed: number,
  gcFraction = 0.5
): string {
  const clampedLen = Math.max(4, Math.min(120, Math.floor(length)));
  const clampedGc = Math.max(0.1, Math.min(0.9, gcFraction));
  let state = (seed >>> 0) || 1;

  const nextRand = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  let out = '';
  for (let i = 0; i < clampedLen; i++) {
    const r = nextRand();
    if (r < clampedGc) {
      out += nextRand() < 0.5 ? 'G' : 'C';
    } else {
      out += nextRand() < 0.5 ? 'A' : 'T';
    }
  }
  return out;
}

export function parseFasta(input: string): { header: string; sequence: string } {
  const lines = input.trim().split(/\r?\n/);
  let header = 'Custom_DNA_Sequence';
  const seqLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('>')) {
      header = trimmed.slice(1).trim() || header;
    } else {
      seqLines.push(trimmed);
    }
  }

  const cleaned = seqLines.join('').replace(/[^A-Za-z]/g, '').toUpperCase();
  return { header, sequence: cleaned };
}

export function formatFasta(
  header: string,
  sequence: string,
  lineWidth = 60
): string {
  const cleanHeader = header.replace(/^>+/, '').trim() || 'DNA_Explorer_Pro_Sequence';
  const chunks: string[] = [];
  for (let i = 0; i < sequence.length; i += lineWidth) {
    chunks.push(sequence.slice(i, i + lineWidth));
  }
  return `>${cleanHeader}\n${chunks.join('\n')}\n`;
}
