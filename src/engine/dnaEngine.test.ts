import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateDNASequence,
  getComplementBase,
  getComplementaryStrand,
  getReverseComplement,
  transcribeToRNA,
  analyzeSequence,
  generateSeededSequence,
  parseFasta,
  formatFasta,
} from './DNASequenceEngine';
import {
  generateBDNAHelixCoordinates,
  generateReplicationForkCoordinates,
  generateTranscriptionBubbleCoordinates,
  BDNA_CONSTANTS,
} from './DNAGeometryEngine';
import {
  parsePDBText,
  calculateAtomDistance,
  SAMPLE_1BNA_PDB_TEXT,
} from './PDBParserEngine';

test('DNA sequence validation accepts valid A, T, G, C and flags invalid characters', () => {
  const valid = validateDNASequence('  cgcg aatt cgcg \n');
  assert.equal(valid.isValid, true);
  assert.equal(valid.cleaned, 'CGCGAATTCGCG');
  assert.deepEqual(valid.invalidChars, []);

  const invalid = validateDNASequence('ATGCUXZ');
  assert.equal(invalid.isValid, false);
  assert.deepEqual(invalid.invalidChars.sort(), ['U', 'X', 'Z']);
});

test('Complementary strand (3′→5′) vs Reverse Complement (5′→3′) distinction', () => {
  const seq = 'ATGCAA';
  // Aligned antiparallel strand 3'->5': A->T, T->A, G->C, C->G, A->T, A->T => TACGTT
  assert.equal(getComplementaryStrand(seq), 'TACGTT');
  // Reverse complement written 5'->3': reverse of TACGTT => TTGCAT
  assert.equal(getReverseComplement(seq), 'TTGCAT');

  // Palindromic Drew-Dickerson dodecamer 5'-CGCGAATTCGCG-3' has identical reverse complement
  assert.equal(getComplementaryStrand('CGCGAATTCGCG'), 'GCGCTTAAGCGC');
  assert.equal(getReverseComplement('CGCGAATTCGCG'), 'CGCGAATTCGCG');
});

test('GC content, AT content, base counts, and hydrogen bond counts are scientifically accurate', () => {
  const stats = analyzeSequence('CGCGAATTCGCG'); // 8 G/C, 4 A/T, total 12 bp
  assert.equal(stats.lengthBp, 12);
  assert.equal(stats.counts.C, 4);
  assert.equal(stats.counts.G, 4);
  assert.equal(stats.counts.A, 2);
  assert.equal(stats.counts.T, 2);
  assert.equal(stats.gcCount, 8);
  assert.equal(stats.atCount, 4);
  assert.equal(stats.gcPercentage, 66.67);
  assert.equal(stats.atPercentage, 33.33);
  // 4 A-T pairs * 2 H-bonds + 8 G-C pairs * 3 H-bonds = 8 + 24 = 32 H-bonds
  assert.equal(stats.totalHydrogenBonds, 32);
  // Axial contour length: 12 * 0.34 nm = 4.08 nm = 40.8 Å
  assert.equal(stats.contourLengthNm, 4.08);
  assert.equal(stats.contourLengthAngstrom, 40.8);
});

test('Canonical B-DNA 3D geometry is right-handed with 0.34 nm rise, ~34.29° twist, and asymmetric grooves', () => {
  const model = generateBDNAHelixCoordinates('CGCGAATTCGCG');
  assert.equal(model.isIdealizedModel, true);
  assert.equal(model.steps.length, 12);
  assert.equal(model.axialRiseNm, 0.34);
  assert.equal(model.basePairsPerTurn, 10.5);
  assert.equal(model.helixDiameterNm, 2.0);

  const step0 = model.steps[0];
  const step1 = model.steps[1];

  // Check axial rise between consecutive base pairs = 0.34 nm
  const riseNm = step1.axialZNm - step0.axialZNm;
  assert.ok(Math.abs(riseNm - 0.34) < 1e-6);

  // Check helical twist = 360 / 10.5 ≈ 34.29 deg
  const twistDeg = step1.thetaDeg - step0.thetaDeg;
  assert.ok(Math.abs(twistDeg - 360 / 10.5) < 0.05);

  // Verify antiparallel strand labels and complementary bases
  assert.equal(step0.strand1Node.directionLabel, '5′ → 3′');
  assert.equal(step0.strand2Node.directionLabel, '3′ → 5′');
  assert.equal(step0.strand1Node.base, 'C');
  assert.equal(step0.strand2Node.base, 'G');

  // Verify Purine (G = 2 rings) vs Pyrimidine (C = 1 ring)
  assert.equal(step0.strand1Node.classification, 'Pyrimidine');
  assert.equal(step0.strand1Node.rings, 1);
  assert.equal(step0.strand2Node.classification, 'Purine');
  assert.equal(step0.strand2Node.rings, 2);

  // Verify G-C has 3 canonical hydrogen bonds and A-T (at index 4) has 2 canonical hydrogen bonds
  assert.equal(step0.hydrogenBonds.length, 3);
  assert.equal(model.steps[4].strand1Node.base, 'A');
  assert.equal(model.steps[4].strand2Node.base, 'T');
  assert.equal(model.steps[4].hydrogenBonds.length, 2);

  // Verify major and minor grooves are asymmetric (not 180 deg opposite)
  assert.notEqual(model.minorGrooveAngleDeg, 180);
  assert.equal(model.minorGrooveAngleDeg + model.majorGrooveAngleDeg, 360);
});

test('RNA transcription replaces Thymine with Uracil and maintains 5′→3′ synthesis', () => {
  const tx = transcribeToRNA('ATGCTAG', 'antisense');
  assert.equal(tx.coding5to3, 'ATGCTAG');
  assert.equal(tx.template3to5, 'TACGATC');
  assert.equal(tx.mRNA5to3, 'AUGCUAG');

  const bubble = generateTranscriptionBubbleCoordinates('ATGCTAG', 0.5);
  assert.ok(bubble.nascentRNASequence5to3.startsWith('AUG'));
  assert.ok(!bubble.nascentRNASequence5to3.includes('T'));
});

test('Replication fork model generates leading and lagging Okazaki strands', () => {
  const rep = generateReplicationForkCoordinates('CGCGAATTCGCGCGCGAATTCGCG', 0.65);
  assert.ok(rep.forkBpIndex > 0);
  const unwoundSteps = rep.steps.filter((s) => s.isUnwound);
  assert.ok(unwoundSteps.length > 0);
  assert.equal(unwoundSteps[0].leadingDaughterBase, getComplementBase(unwoundSteps[0].base2));
});

test('Seeded random sequence generator and FASTA parser/formatter are deterministic', () => {
  const s1 = generateSeededSequence(20, 42, 0.5);
  const s2 = generateSeededSequence(20, 42, 0.5);
  assert.equal(s1, s2);
  assert.equal(s1.length, 20);

  const fasta = formatFasta('Test_Seq_1', s1, 10);
  const parsed = parseFasta(fasta);
  assert.equal(parsed.header, 'Test_Seq_1');
  assert.equal(parsed.sequence, s1);
});

test('PDB coordinate parser preserves experimental Angstrom coordinates and calculates Euclidean distances', () => {
  const pdb = parsePDBText(SAMPLE_1BNA_PDB_TEXT);
  assert.equal(pdb.pdbId, '1BNA');
  assert.equal(pdb.isExperimentalCoordinateData, true);
  assert.ok(pdb.atoms.length > 40);
  assert.deepEqual(pdb.chains, ['A', 'B']);

  // Check distance between O5' (atom 0) and C5' (atom 1) of DC1 (~1.43 Å covalent bond)
  const dist = calculateAtomDistance(pdb.atoms[0], pdb.atoms[1]);
  assert.ok(dist.distanceAngstrom > 1.3 && dist.distanceAngstrom < 1.6);
  assert.ok(Math.abs(dist.distanceNm - dist.distanceAngstrom * 0.1) < 1e-3);
});
