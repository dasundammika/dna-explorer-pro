import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  useDNAStore,
  RepresentationMode,
  LaboratoryMode,
  HighlightFilter,
  ColorSchemeMode,
  EnvironmentSettings,
} from '../store/useDNAStore';
import {
  DNABase,
  RNABase,
  NUCLEOTIDE_DATABASE,
} from '../engine/DNASequenceEngine';
import {
  BDNAHelixModel,
  CPK_ELEMENT_COLORS,
  generateReplicationForkCoordinates,
  generateTranscriptionBubbleCoordinates,
  Vec3,
} from '../engine/DNAGeometryEngine';
import {
  ParsedPDBStructure,
  calculateAtomDistance,
} from '../engine/PDBParserEngine';

const RNA_BASE_COLORS: Record<RNABase, string> = {
  A: '#10b981', // Adenine (Green)
  U: '#f43f5e', // Uracil (Rose-Pink — distinct from DNA Thymine!)
  G: '#3b82f6', // Guanine (Blue)
  C: '#eab308', // Cytosine (Yellow)
};

const STRAND_1_HEX = '#06b6d4'; // Cyan 5'->3' primary strand
const STRAND_2_HEX = '#8b5cf6'; // Violet 3'->5' antiparallel strand

// Pre-allocated scratch math objects outside the render loop (Zero GC inside tick)
const _scratchVecA = new THREE.Vector3();
const _scratchVecB = new THREE.Vector3();
const _scratchMid = new THREE.Vector3();
const _scratchDir = new THREE.Vector3();
const _scratchUp = new THREE.Vector3(0, 1, 0);
const _scratchQuat = new THREE.Quaternion();
const _scratchScale = new THREE.Vector3();
const _scratchMat4 = new THREE.Matrix4();
const _scratchColor = new THREE.Color();

function createRegularPolygonShape(radius: number, sides: number, offsetX = 0): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i <= sides; i++) {
    const theta = (i / sides) * Math.PI * 2;
    const x = offsetX + Math.cos(theta) * radius;
    const y = Math.sin(theta) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return shape;
}

function orientCylinderMatrix(
  start: Vec3,
  end: Vec3,
  radius: number,
  targetMatrix: THREE.Matrix4
): number {
  _scratchVecA.set(start.x, start.y, start.z);
  _scratchVecB.set(end.x, end.y, end.z);
  const dist = _scratchVecA.distanceTo(_scratchVecB);
  if (dist < 1e-5) {
    targetMatrix.identity();
    return 0;
  }
  _scratchMid.addVectors(_scratchVecA, _scratchVecB).multiplyScalar(0.5);
  _scratchDir.subVectors(_scratchVecB, _scratchVecA).normalize();
  _scratchQuat.setFromUnitVectors(_scratchUp, _scratchDir);
  _scratchScale.set(radius, dist, radius);
  targetMatrix.compose(_scratchMid, _scratchQuat, _scratchScale);
  return dist;
}

function isNucleotideHighlighted(
  bpIndex: number,
  strand: 1 | 2,
  base: DNABase,
  selectedBpIndex: number,
  selectedStrand: 1 | 2,
  filter: HighlightFilter
): boolean {
  switch (filter) {
    case 'none':
      return bpIndex === selectedBpIndex;
    case 'selectedNucleotide':
      return bpIndex === selectedBpIndex && strand === selectedStrand;
    case 'selectedBasePair':
      return bpIndex === selectedBpIndex;
    case 'strand1':
      return strand === 1;
    case 'strand2':
      return strand === 2;
    case 'allA':
      return base === 'A';
    case 'allT':
      return base === 'T';
    case 'allG':
      return base === 'G';
    case 'allC':
      return base === 'C';
  }
}

export const MolecularScene: React.FC = () => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const helixModel = useDNAStore((s) => s.helixModel);
  const selectedBpIndex = useDNAStore((s) => s.selectedBpIndex);
  const selectedStrand = useDNAStore((s) => s.selectedStrand);
  const highlightFilter = useDNAStore((s) => s.highlightFilter);
  const representationMode = useDNAStore((s) => s.representationMode);
  const labMode = useDNAStore((s) => s.labMode);
  const chromatinLevel = useDNAStore((s) => s.chromatinLevel);
  const colorScheme = useDNAStore((s) => s.colorScheme);
  const isPlaying = useDNAStore((s) => s.isPlaying);
  const animationProgress = useDNAStore((s) => s.animationProgress);
  const animationSpeed = useDNAStore((s) => s.animationSpeed);
  const pdbStructure = useDNAStore((s) => s.pdbStructure);
  const measuredAtomIndices = useDNAStore((s) => s.measuredAtomIndices);
  const environment = useDNAStore((s) => s.environment);
  const cameraCommand = useDNAStore((s) => s.cameraCommand);
  const screenshotTrigger = useDNAStore((s) => s.screenshotTrigger);

  const selectNucleotide = useDNAStore((s) => s.selectNucleotide);
  const setHoveredNucleotide = useDNAStore((s) => s.setHoveredNucleotide);
  const setAnimationProgress = useDNAStore((s) => s.setAnimationProgress);
  const pickAtomForMeasurement = useDNAStore((s) => s.pickAtomForMeasurement);

  const [hoverTooltip, setHoverTooltip] = useState<{
    x: number;
    y: number;
    title: string;
    subtitle: string;
    detail: string;
  } | null>(null);

  const [fpsDisplay, setFpsDisplay] = useState<number>(60);
  const [webglFallbackError, setWebglFallbackError] = useState<string | null>(null);

  // Store latest mutable state in refs for the persistent WebGL lifecycle
  const stateRef = useRef({
    helixModel,
    selectedBpIndex,
    selectedStrand,
    highlightFilter,
    representationMode,
    labMode,
    chromatinLevel,
    colorScheme,
    isPlaying,
    animationProgress,
    animationSpeed,
    pdbStructure,
    measuredAtomIndices,
    environment,
  });

  useEffect(() => {
    stateRef.current = {
      helixModel,
      selectedBpIndex,
      selectedStrand,
      highlightFilter,
      representationMode,
      labMode,
      chromatinLevel,
      colorScheme,
      isPlaying,
      animationProgress,
      animationSpeed,
      pdbStructure,
      measuredAtomIndices,
      environment,
    };
  });

  // Persistent Three.js scene objects
  const sceneObjectsRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    moleculeRoot: THREE.Group;
    particlesMesh: THREE.Points;
    keyLight: THREE.DirectionalLight;
    hemiLight: THREE.HemisphereLight;
    rimLight: THREE.DirectionalLight;
    contactDisc: THREE.Mesh;
    interactables: THREE.Object3D[];
    requestRender: () => void;
    cameraGoalPos: THREE.Vector3 | null;
    cameraGoalTarget: THREE.Vector3 | null;
    rebuildSceneGeometry: () => void;
    isSoftwareGl: boolean;
  } | null>(null);

  // Initialize Three.js WebGLRenderer & Scene ONCE
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software WebGL detection from GPU renderer string
    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      });
    } catch (e) {
      setWebglFallbackError(
        e instanceof Error ? e.message : 'WebGL context could not be initialized.'
      );
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#07090e');
    scene.fog = new THREE.FogExp2('#07090e', 0.012);

    // 2. Mandatory Studio Environment Reflection (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 400);
    camera.position.set(0, 2.5, 22);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 3.5;
    controls.maxDistance = 120;
    controls.target.set(0, 0, 0);

    // 3. Balanced 3-Point Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.85);
    hemiLight.position.set(0, 40, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.65);
    keyLight.position.set(16, 22, 18);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      const d = 18;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 70;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.95);
    rimLight.position.set(-16, 10, -16);
    scene.add(rimLight);

    // 4. Radial Contact Shadow Grounding Plane + Scientific Reference Grid Ring
    const contactCanvas = document.createElement('canvas');
    contactCanvas.width = 128;
    contactCanvas.height = 128;
    const ctx = contactCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.24)');
      grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.18)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const contactTex = new THREE.CanvasTexture(contactCanvas);
    contactTex.colorSpace = THREE.SRGBColorSpace;
    const contactDisc = new THREE.Mesh(
      new THREE.CircleGeometry(14, 48),
      new THREE.MeshBasicMaterial({
        map: contactTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.65,
      })
    );
    contactDisc.rotation.x = -Math.PI / 2;
    contactDisc.position.y = -11;
    scene.add(contactDisc);

    // 5. Conceptual Aqueous Environment Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 44;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 36;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 44;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const particlesMesh = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.16,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      })
    );
    scene.add(particlesMesh);

    const moleculeRoot = new THREE.Group();
    scene.add(moleculeRoot);

    // Reusable procedural base geometries
    const unitSphereGeo = new THREE.SphereGeometry(1, 20, 16);
    const lowSphereGeo = new THREE.SphereGeometry(1, 14, 12);
    const unitCylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 14, 1, false);
    const coneArrowGeo = new THREE.ConeGeometry(0.32, 0.75, 16);

    // Extruded 5-membered furanose sugar ring
    const pentoseShape = createRegularPolygonShape(0.38, 5);
    const pentoseExtrudeGeo = new THREE.ExtrudeGeometry(pentoseShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
    });
    pentoseExtrudeGeo.center();

    // Extruded 6-membered Pyrimidine ring (1 ring: T, C)
    const hexShape = createRegularPolygonShape(0.46, 6);
    const pyrimidineExtrudeGeo = new THREE.ExtrudeGeometry(hexShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
    });
    pyrimidineExtrudeGeo.center();

    // Extruded 5-membered Imidazole ring for Purines (fused 6+5 ring: A, G)
    const imidazoleShape = createRegularPolygonShape(0.36, 5);
    const imidazoleExtrudeGeo = new THREE.ExtrudeGeometry(imidazoleShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
    });
    imidazoleExtrudeGeo.center();

    const interactables: THREE.Object3D[] = [];
    const dynamicDisposables: Array<{ dispose: () => void }> = [];

    const clearMoleculeRoot = () => {
      interactables.length = 0;
      while (moleculeRoot.children.length > 0) {
        const child = moleculeRoot.children[0];
        moleculeRoot.remove(child);
      }
      while (dynamicDisposables.length > 0) {
        const d = dynamicDisposables.pop();
        d?.dispose();
      }
    };

    // Build / Rebuild 3D Molecular Scene based on current store state
    const rebuildSceneGeometry = () => {
      clearMoleculeRoot();
      const st = stateRef.current;
      const {
        helixModel: model,
        selectedBpIndex: selBp,
        selectedStrand: selStrand,
        highlightFilter: hlFilter,
        representationMode: repMode,
        labMode: currentLabMode,
        chromatinLevel: chromLevel,
        colorScheme: scheme,
        animationProgress: prog,
        pdbStructure: pdb,
        measuredAtomIndices: measuredPair,
        environment: env,
      } = st;

      // Update background & fog theme
      const bgHex =
        env.backgroundTheme === 'neutralSlate'
          ? '#111827'
          : env.backgroundTheme === 'aqueous'
            ? '#061524'
            : '#07090e';
      scene.background = new THREE.Color(bgHex);
      scene.fog = new THREE.FogExp2(bgHex, 0.011);
      particlesMesh.visible = env.aqueousParticles;
      keyLight.intensity = 1.5 * env.lightingIntensity;
      hemiLight.intensity = 0.8 * env.lightingIntensity;
      rimLight.intensity = 0.9 * env.lightingIntensity;

      const opacity = env.structureOpacity;
      const isTransparent = opacity < 0.99;

      const getBaseColorHex = (base: DNABase): string => {
        if (scheme === 'cpkElement') {
          return base === 'A' || base === 'G' ? '#3b82f6' : '#38bdf8';
        }
        return NUCLEOTIDE_DATABASE[base].colorHex;
      };

      // =========================================================================
      // MODE 1: CHROMATIN MULTISCALE VIEWER (Levels 1 to 5)
      // =========================================================================
      if (currentLabMode === 'chromatin') {
        contactDisc.position.y = -11;

        if (chromLevel === 1) {
          // Level 1: High-detail Zoomed Chemical Anatomy of a Single Base Pair (Selected Step)
          const step = model.steps[Math.min(selBp, model.steps.length - 1)] || model.steps[0];
          const group = new THREE.Group();
          group.position.set(0, -step.worldY * 2.2, 0);
          group.scale.setScalar(2.2);

          const allNodes = [step.strand1Node, step.strand2Node];
          for (const node of allNodes) {
            for (const atom of node.atoms) {
              const elemInfo = CPK_ELEMENT_COLORS[atom.element];
              const mat = new THREE.MeshPhysicalMaterial({
                color: elemInfo.hex,
                roughness: 0.22,
                metalness: 0.15,
                clearcoat: 0.6,
              });
              dynamicDisposables.push(mat);
              const mesh = new THREE.Mesh(unitSphereGeo, mat);
              mesh.position.set(
                atom.positionWorld.x,
                atom.positionWorld.y,
                atom.positionWorld.z
              );
              mesh.scale.setScalar(elemInfo.vdwRadiusNm * 1.45);
              mesh.userData = {
                bpIndex: step.bpIndex,
                strand: node.strand,
                atomLabel: `${atom.label} (${elemInfo.name})`,
              };
              interactables.push(mesh);
              group.add(mesh);
            }

            for (const bond of node.bonds) {
              const mat = new THREE.MeshStandardMaterial({
                color: bond.bondType === 'glycosidic' ? 0xf59e0b : 0x94a3b8,
                roughness: 0.35,
                metalness: 0.4,
              });
              dynamicDisposables.push(mat);
              const cyl = new THREE.Mesh(unitCylinderGeo, mat);
              orientCylinderMatrix(bond.fromWorld, bond.toWorld, 0.08, cyl.matrix);
              cyl.matrixAutoUpdate = false;
              group.add(cyl);
            }
          }

          // Hydrogen bonds
          for (const hb of step.hydrogenBonds) {
            const hbMat = new THREE.MeshStandardMaterial({
              color: 0xfef08a,
              emissive: 0xfacc15,
              emissiveIntensity: 0.45,
              roughness: 0.2,
            });
            dynamicDisposables.push(hbMat);
            // 4 dashed segments along each hydrogen bond
            for (let sIdx = 0; sIdx < 4; sIdx++) {
              const t0 = sIdx / 4 + 0.03;
              const t1 = (sIdx + 0.65) / 4;
              const p0: Vec3 = {
                x: hb.startWorld.x + (hb.endWorld.x - hb.startWorld.x) * t0,
                y: hb.startWorld.y + (hb.endWorld.y - hb.startWorld.y) * t0,
                z: hb.startWorld.z + (hb.endWorld.z - hb.startWorld.z) * t0,
              };
              const p1: Vec3 = {
                x: hb.startWorld.x + (hb.endWorld.x - hb.startWorld.x) * t1,
                y: hb.startWorld.y + (hb.endWorld.y - hb.startWorld.y) * t1,
                z: hb.startWorld.z + (hb.endWorld.z - hb.startWorld.z) * t1,
              };
              const seg = new THREE.Mesh(unitCylinderGeo, hbMat);
              orientCylinderMatrix(p0, p1, 0.055, seg.matrix);
              seg.matrixAutoUpdate = false;
              group.add(seg);
            }
          }

          moleculeRoot.add(group);
          return;
        }

        if (chromLevel >= 3) {
          // Helper to build a composite 8-subunit Histone Octamer + 1.67 turns of 147-bp B-DNA
          const createNucleosomeUnit = (
            center: THREE.Vector3,
            scale: number,
            detailRungs: number
          ): THREE.Group => {
            const ncpGroup = new THREE.Group();
            ncpGroup.position.copy(center);
            ncpGroup.scale.setScalar(scale);

            // 8 Histone subunits arranged as 2 stacked tetramer rings (H3, H4, H2A, H2B) x 2
            const histoneColors = [0x38bdf8, 0x818cf8, 0x34d399, 0xf472b6];
            for (let layer = 0; layer < 2; layer++) {
              const yOff = (layer === 0 ? -0.95 : 0.95);
              for (let q = 0; q < 4; q++) {
                const ang = (q * Math.PI) / 2 + layer * 0.4;
                const hMat = new THREE.MeshPhysicalMaterial({
                  color: histoneColors[q],
                  roughness: 0.32,
                  metalness: 0.18,
                  clearcoat: 0.5,
                });
                dynamicDisposables.push(hMat);
                const subunit = new THREE.Mesh(
                  new THREE.CylinderGeometry(1.45, 1.45, 1.65, 20),
                  hMat
                );
                subunit.position.set(
                  Math.cos(ang) * 1.55,
                  yOff,
                  Math.sin(ang) * 1.55
                );
                ncpGroup.add(subunit);
              }
            }

            // Inner histone octamer core spool
            const coreMat = new THREE.MeshStandardMaterial({
              color: 0x1e293b,
              roughness: 0.5,
              metalness: 0.35,
            });
            dynamicDisposables.push(coreMat);
            const coreCylinder = new THREE.Mesh(
              new THREE.CylinderGeometry(2.7, 2.7, 3.2, 32),
              coreMat
            );
            ncpGroup.add(coreCylinder);

            // 1.67 left-handed toroidal superhelical turns of B-DNA (147 bp) around the octamer
            const superTurns = 1.67;
            const totalAngle = superTurns * Math.PI * 2;
            const curvePts1: THREE.Vector3[] = [];
            const curvePts2: THREE.Vector3[] = [];
            const rSuper = 3.85;
            const samples = detailRungs;

            for (let i = 0; i <= samples; i++) {
              const t = i / samples;
              // Left-handed toroidal superhelix
              const phi = -t * totalAngle;
              const yCenter = (t - 0.5) * 3.1;
              // Local B-DNA minor double-helix oscillation around the superhelical centerline
              const localTwist = t * 14 * Math.PI * 2;
              const rMinor = 0.38;

              const cx = Math.cos(phi) * rSuper;
              const cz = Math.sin(phi) * rSuper;
              const radialX = Math.cos(phi);
              const radialZ = Math.sin(phi);

              curvePts1.push(
                new THREE.Vector3(
                  cx + radialX * Math.cos(localTwist) * rMinor,
                  yCenter + Math.sin(localTwist) * rMinor,
                  cz + radialZ * Math.cos(localTwist) * rMinor
                )
              );
              curvePts2.push(
                new THREE.Vector3(
                  cx - radialX * Math.cos(localTwist) * rMinor,
                  yCenter - Math.sin(localTwist) * rMinor,
                  cz - radialZ * Math.cos(localTwist) * rMinor
                )
              );
            }

            const tube1Geo = new THREE.TubeGeometry(
              new THREE.CatmullRomCurve3(curvePts1),
              samples * 2,
              0.16,
              8,
              false
            );
            const tube2Geo = new THREE.TubeGeometry(
              new THREE.CatmullRomCurve3(curvePts2),
              samples * 2,
              0.16,
              8,
              false
            );
            dynamicDisposables.push(tube1Geo, tube2Geo);

            const mat1 = new THREE.MeshStandardMaterial({
              color: STRAND_1_HEX,
              roughness: 0.25,
              metalness: 0.3,
            });
            const mat2 = new THREE.MeshStandardMaterial({
              color: STRAND_2_HEX,
              roughness: 0.25,
              metalness: 0.3,
            });
            dynamicDisposables.push(mat1, mat2);

            ncpGroup.add(new THREE.Mesh(tube1Geo, mat1));
            ncpGroup.add(new THREE.Mesh(tube2Geo, mat2));

            // Base-pair cross-rungs along the wrapped DNA
            const rungMat = new THREE.MeshStandardMaterial({
              color: 0x10b981,
              roughness: 0.35,
            });
            dynamicDisposables.push(rungMat);
            const rungInst = new THREE.InstancedMesh(
              unitCylinderGeo,
              rungMat,
              samples
            );
            const palette = [0x10b981, 0xef4444, 0x3b82f6, 0xeab308];
            for (let i = 0; i < samples; i++) {
              orientCylinderMatrix(
                curvePts1[i],
                curvePts2[i],
                0.06,
                _scratchMat4
              );
              rungInst.setMatrixAt(i, _scratchMat4);
              _scratchColor.setHex(palette[i % 4]);
              rungInst.setColorAt(i, _scratchColor);
            }
            rungInst.instanceMatrix.needsUpdate = true;
            if (rungInst.instanceColor) rungInst.instanceColor.needsUpdate = true;
            rungInst.computeBoundingSphere();
            ncpGroup.add(rungInst);

            return ncpGroup;
          };

          if (chromLevel === 3) {
            // Single high-resolution Nucleosome Core Particle (147 bp around Histone Octamer)
            const singleNcp = createNucleosomeUnit(new THREE.Vector3(0, 0, 0), 1.45, 72);
            moleculeRoot.add(singleNcp);
            return;
          }

          if (chromLevel === 4) {
            // Level 4: 10 nm "Beads-on-a-String" Chromatin Array (6 Nucleosomes + Linker DNA + H1 Histone)
            const arrayGroup = new THREE.Group();
            const positions = [
              new THREE.Vector3(-8.5, 4.2, -1.5),
              new THREE.Vector3(-3.2, 4.8, 2.0),
              new THREE.Vector3(3.2, 4.0, -1.8),
              new THREE.Vector3(8.5, 1.2, 1.8),
              new THREE.Vector3(3.5, -4.2, 2.2),
              new THREE.Vector3(-4.5, -4.8, -1.5),
            ];
            for (let i = 0; i < positions.length; i++) {
              const unit = createNucleosomeUnit(positions[i], 0.62, 36);
              unit.rotation.set(0.3 * i, 0.5 * i, 0.2 * i);
              arrayGroup.add(unit);

              // H1 Linker Histone clamp sphere at DNA entry/exit
              const h1Mat = new THREE.MeshStandardMaterial({
                color: 0xf59e0b,
                roughness: 0.3,
                metalness: 0.2,
              });
              dynamicDisposables.push(h1Mat);
              const h1Mesh = new THREE.Mesh(lowSphereGeo, h1Mat);
              h1Mesh.position.copy(positions[i]).add(new THREE.Vector3(0, 1.4, 1.8));
              h1Mesh.scale.setScalar(0.55);
              arrayGroup.add(h1Mesh);
            }

            // Linker DNA connecting the nucleosomes
            const linkerGeo = new THREE.TubeGeometry(
              new THREE.CatmullRomCurve3(positions),
              80,
              0.22,
              8,
              false
            );
            const linkerMat = new THREE.MeshStandardMaterial({
              color: STRAND_1_HEX,
              roughness: 0.3,
              metalness: 0.25,
            });
            dynamicDisposables.push(linkerGeo, linkerMat);
            arrayGroup.add(new THREE.Mesh(linkerGeo, linkerMat));
            moleculeRoot.add(arrayGroup);
            return;
          }

          if (chromLevel === 5) {
            // Level 5: 30 nm Higher-Order Solenoid Chromatin Fiber (18 compacted nucleosomes)
            const solenoidGroup = new THREE.Group();
            const count = 18;
            const fiberCenters: THREE.Vector3[] = [];
            for (let i = 0; i < count; i++) {
              const angle = (i / 6) * Math.PI * 2;
              const y = (i - count / 2) * 0.92;
              const r = 4.2;
              const pos = new THREE.Vector3(
                Math.cos(angle) * r,
                y,
                Math.sin(angle) * r
              );
              fiberCenters.push(pos);
              const ncp = createNucleosomeUnit(pos, 0.42, 20);
              ncp.lookAt(0, y, 0);
              solenoidGroup.add(ncp);
            }
            const backboneGeo = new THREE.TubeGeometry(
              new THREE.CatmullRomCurve3(fiberCenters),
              96,
              0.28,
              8,
              false
            );
            const backboneMat = new THREE.MeshStandardMaterial({
              color: 0x8b5cf6,
              roughness: 0.3,
              metalness: 0.35,
            });
            dynamicDisposables.push(backboneGeo, backboneMat);
            solenoidGroup.add(new THREE.Mesh(backboneGeo, backboneMat));
            moleculeRoot.add(solenoidGroup);
            return;
          }
        }
        // Note: chromLevel === 2 falls through to standard B-DNA Double Helix below!
      }

      // =========================================================================
      // MODE 2: EXPERIMENTAL PDB STRUCTURAL DATA VIEWER
      // =========================================================================
      if (repMode === 'pdbViewer' && currentLabMode === 'structure') {
        const atomCount = pdb.atoms.length;
        const bondCount = pdb.bonds.length;

        const atomMat = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          roughness: 0.22,
          metalness: 0.15,
          clearcoat: 0.5,
          transparent: isTransparent,
          opacity,
        });
        const bondMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.35,
          metalness: 0.4,
          transparent: isTransparent,
          opacity,
        });
        dynamicDisposables.push(atomMat, bondMat);

        const atomInst = new THREE.InstancedMesh(unitSphereGeo, atomMat, atomCount);
        for (let i = 0; i < atomCount; i++) {
          const a = pdb.atoms[i];
          const elem = CPK_ELEMENT_COLORS[a.element];
          const isPicked =
            measuredPair[0] === i || measuredPair[1] === i;
          const radius = elem.vdwRadiusNm * 2.1 * (isPicked ? 1.35 : 1.0);
          _scratchVecA.set(a.worldPos.x, a.worldPos.y, a.worldPos.z);
          _scratchQuat.identity();
          _scratchScale.setScalar(radius);
          _scratchMat4.compose(_scratchVecA, _scratchQuat, _scratchScale);
          atomInst.setMatrixAt(i, _scratchMat4);
          _scratchColor.set(isPicked ? '#facc15' : elem.hex);
          atomInst.setColorAt(i, _scratchColor);
        }
        atomInst.instanceMatrix.needsUpdate = true;
        if (atomInst.instanceColor) atomInst.instanceColor.needsUpdate = true;
        atomInst.computeBoundingSphere();
        atomInst.userData = { isPDBAtomMesh: true };
        interactables.push(atomInst);
        moleculeRoot.add(atomInst);

        if (bondCount > 0) {
          const bondInst = new THREE.InstancedMesh(
            unitCylinderGeo,
            bondMat,
            bondCount
          );
          for (let i = 0; i < bondCount; i++) {
            const b = pdb.bonds[i];
            orientCylinderMatrix(
              pdb.atoms[b.atomIndexA].worldPos,
              pdb.atoms[b.atomIndexB].worldPos,
              0.085,
              _scratchMat4
            );
            bondInst.setMatrixAt(i, _scratchMat4);
          }
          bondInst.instanceMatrix.needsUpdate = true;
          bondInst.computeBoundingSphere();
          moleculeRoot.add(bondInst);
        }

        // Euclidean Distance Measurement Ruler between two picked PDB atoms
        if (
          measuredPair[0] !== null &&
          measuredPair[1] !== null &&
          pdb.atoms[measuredPair[0]] &&
          pdb.atoms[measuredPair[1]]
        ) {
          const atomA = pdb.atoms[measuredPair[0]];
          const atomB = pdb.atoms[measuredPair[1]];
          const rulerMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
          dynamicDisposables.push(rulerMat);
          const rulerMesh = new THREE.Mesh(unitCylinderGeo, rulerMat);
          orientCylinderMatrix(
            atomA.worldPos,
            atomB.worldPos,
            0.065,
            rulerMesh.matrix
          );
          rulerMesh.matrixAutoUpdate = false;
          moleculeRoot.add(rulerMesh);
        }
        return;
      }

      // =========================================================================
      // MODE 3: INTERACTIVE DNA REPLICATION FORK LAB
      // =========================================================================
      if (currentLabMode === 'replication') {
        const repModel = generateReplicationForkCoordinates(model.sequence5to3, prog);
        const steps = repModel.steps;
        const n = steps.length;

        // Parent Strand 1 & 2 Backbone Curves
        const p1Pts = steps.map(
          (s) =>
            new THREE.Vector3(
              s.parentStrand1PosWorld.x,
              s.parentStrand1PosWorld.y,
              s.parentStrand1PosWorld.z
            )
        );
        const p2Pts = steps.map(
          (s) =>
            new THREE.Vector3(
              s.parentStrand2PosWorld.x,
              s.parentStrand2PosWorld.y,
              s.parentStrand2PosWorld.z
            )
        );

        if (n >= 2) {
          const p1Geo = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(p1Pts),
            n * 6,
            0.24,
            12,
            false
          );
          const p2Geo = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(p2Pts),
            n * 6,
            0.24,
            12,
            false
          );
          const p1Mat = new THREE.MeshPhysicalMaterial({
            color: STRAND_1_HEX,
            roughness: 0.25,
            metalness: 0.35,
            clearcoat: 0.6,
          });
          const p2Mat = new THREE.MeshPhysicalMaterial({
            color: STRAND_2_HEX,
            roughness: 0.25,
            metalness: 0.35,
            clearcoat: 0.6,
          });
          dynamicDisposables.push(p1Geo, p2Geo, p1Mat, p2Mat);
          moleculeRoot.add(new THREE.Mesh(p1Geo, p1Mat));
          moleculeRoot.add(new THREE.Mesh(p2Geo, p2Mat));
        }

        // Daughter Leading & Lagging Strand Backbones
        const leadingPts = steps
          .filter((s) => s.hasLeadingDaughter)
          .map(
            (s) =>
              new THREE.Vector3(
                s.leadingDaughterBackboneWorld.x,
                s.leadingDaughterBackboneWorld.y,
                s.leadingDaughterBackboneWorld.z
              )
          );
        if (leadingPts.length >= 2) {
          const leadGeo = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(leadingPts),
            leadingPts.length * 5,
            0.22,
            10,
            false
          );
          const leadMat = new THREE.MeshPhysicalMaterial({
            color: 0x34d399, // Newly synthesized Leading Strand (Emerald)
            roughness: 0.2,
            metalness: 0.3,
            clearcoat: 0.7,
          });
          dynamicDisposables.push(leadGeo, leadMat);
          moleculeRoot.add(new THREE.Mesh(leadGeo, leadMat));

          // 5'->3' synthesis direction arrow at tip of leading strand
          const tip = leadingPts[leadingPts.length - 1];
          const arrowMesh = new THREE.Mesh(coneArrowGeo, leadMat);
          arrowMesh.position.set(tip.x, tip.y + 0.5, tip.z);
          moleculeRoot.add(arrowMesh);
        }

        // Okazaki fragments on Lagging Strand
        const fragmentGroups = new Map<number, THREE.Vector3[]>();
        for (const s of steps) {
          if (s.hasLaggingDaughter) {
            const arr = fragmentGroups.get(s.okazakiFragmentId) || [];
            arr.push(
              new THREE.Vector3(
                s.laggingDaughterBackboneWorld.x,
                s.laggingDaughterBackboneWorld.y,
                s.laggingDaughterBackboneWorld.z
              )
            );
            fragmentGroups.set(s.okazakiFragmentId, arr);
          }
        }
        const lagMat = new THREE.MeshPhysicalMaterial({
          color: 0xf59e0b, // Okazaki fragments (Amber)
          roughness: 0.22,
          metalness: 0.3,
          clearcoat: 0.6,
        });
        dynamicDisposables.push(lagMat);

        fragmentGroups.forEach((pts) => {
          if (pts.length >= 2) {
            const fragGeo = new THREE.TubeGeometry(
              new THREE.CatmullRomCurve3(pts),
              pts.length * 5,
              0.22,
              10,
              false
            );
            dynamicDisposables.push(fragGeo);
            moleculeRoot.add(new THREE.Mesh(fragGeo, lagMat));
            // 5'->3' synthesis arrow pointing downward (away from fork)
            const bottomPt = pts[0];
            const arrow = new THREE.Mesh(coneArrowGeo, lagMat);
            arrow.position.set(bottomPt.x, bottomPt.y - 0.45, bottomPt.z);
            arrow.rotation.x = Math.PI;
            moleculeRoot.add(arrow);
          }
        });

        // Base rungs for parental and daughter bases
        for (const s of steps) {
          const b1Mat = new THREE.MeshStandardMaterial({
            color: getBaseColorHex(s.base1),
            roughness: 0.3,
          });
          const b2Mat = new THREE.MeshStandardMaterial({
            color: getBaseColorHex(s.base2),
            roughness: 0.3,
          });
          dynamicDisposables.push(b1Mat, b2Mat);

          const m1 = new THREE.Mesh(unitCylinderGeo, b1Mat);
          orientCylinderMatrix(
            s.parentStrand1PosWorld,
            s.parentBase1PosWorld,
            0.14,
            m1.matrix
          );
          m1.matrixAutoUpdate = false;
          moleculeRoot.add(m1);

          const m2 = new THREE.Mesh(unitCylinderGeo, b2Mat);
          orientCylinderMatrix(
            s.parentStrand2PosWorld,
            s.parentBase2PosWorld,
            0.14,
            m2.matrix
          );
          m2.matrixAutoUpdate = false;
          moleculeRoot.add(m2);

          if (s.hasLeadingDaughter) {
            const dMat = new THREE.MeshStandardMaterial({
              color: getBaseColorHex(s.leadingDaughterBase),
              roughness: 0.3,
            });
            dynamicDisposables.push(dMat);
            const dm = new THREE.Mesh(unitCylinderGeo, dMat);
            orientCylinderMatrix(
              s.leadingDaughterBackboneWorld,
              s.parentBase2PosWorld,
              0.12,
              dm.matrix
            );
            dm.matrixAutoUpdate = false;
            moleculeRoot.add(dm);
          }

          if (s.hasLaggingDaughter) {
            const dMat = new THREE.MeshStandardMaterial({
              color: getBaseColorHex(s.laggingDaughterBase),
              roughness: 0.3,
            });
            dynamicDisposables.push(dMat);
            const dm = new THREE.Mesh(unitCylinderGeo, dMat);
            orientCylinderMatrix(
              s.laggingDaughterBackboneWorld,
              s.parentBase1PosWorld,
              0.12,
              dm.matrix
            );
            dm.matrixAutoUpdate = false;
            moleculeRoot.add(dm);
          }
        }

        // Composite 3D DNA Helicase Ring at the Replication Fork
        const helicaseGroup = new THREE.Group();
        helicaseGroup.position.set(
          repModel.helicasePositionWorld.x,
          repModel.helicasePositionWorld.y,
          repModel.helicasePositionWorld.z
        );
        const helicaseTorusGeo = new THREE.TorusGeometry(1.75, 0.42, 16, 36);
        const helicaseMat = new THREE.MeshPhysicalMaterial({
          color: 0x38bdf8,
          roughness: 0.25,
          metalness: 0.3,
          transparent: true,
          opacity: 0.78,
          clearcoat: 0.8,
        });
        dynamicDisposables.push(helicaseTorusGeo, helicaseMat);
        const torusMesh = new THREE.Mesh(helicaseTorusGeo, helicaseMat);
        torusMesh.rotation.x = Math.PI / 2;
        helicaseGroup.add(torusMesh);
        moleculeRoot.add(helicaseGroup);

        // Schematic DNA Polymerase III clamp complexes on Leading & Lagging strands
        const polyMat = new THREE.MeshPhysicalMaterial({
          color: 0xa855f7,
          roughness: 0.3,
          metalness: 0.2,
          transparent: true,
          opacity: 0.72,
        });
        dynamicDisposables.push(polyMat);

        const leadPoly = new THREE.Mesh(lowSphereGeo, polyMat);
        leadPoly.position.set(
          repModel.leadingPolymerasePosWorld.x,
          repModel.leadingPolymerasePosWorld.y,
          repModel.leadingPolymerasePosWorld.z
        );
        leadPoly.scale.set(1.15, 1.45, 1.15);
        moleculeRoot.add(leadPoly);

        const lagPoly = new THREE.Mesh(lowSphereGeo, polyMat);
        lagPoly.position.set(
          repModel.laggingPolymerasePosWorld.x,
          repModel.laggingPolymerasePosWorld.y,
          repModel.laggingPolymerasePosWorld.z
        );
        lagPoly.scale.set(1.15, 1.45, 1.15);
        moleculeRoot.add(lagPoly);

        return;
      }

      // =========================================================================
      // MODE 4: INTERACTIVE TRANSCRIPTION BUBBLE LAB (RNA Polymerase + Uracil)
      // =========================================================================
      if (currentLabMode === 'transcription') {
        const txModel = generateTranscriptionBubbleCoordinates(model.sequence5to3, prog);
        const steps = txModel.steps;
        const n = steps.length;

        const codingPts = steps.map(
          (s) =>
            new THREE.Vector3(
              s.codingStrandPosWorld.x,
              s.codingStrandPosWorld.y,
              s.codingStrandPosWorld.z
            )
        );
        const templatePts = steps.map(
          (s) =>
            new THREE.Vector3(
              s.templateStrandPosWorld.x,
              s.templateStrandPosWorld.y,
              s.templateStrandPosWorld.z
            )
        );

        if (n >= 2) {
          const cGeo = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(codingPts),
            n * 6,
            0.23,
            12,
            false
          );
          const tGeo = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(templatePts),
            n * 6,
            0.23,
            12,
            false
          );
          const cMat = new THREE.MeshPhysicalMaterial({
            color: STRAND_1_HEX,
            roughness: 0.25,
            metalness: 0.35,
          });
          const tMat = new THREE.MeshPhysicalMaterial({
            color: STRAND_2_HEX,
            roughness: 0.25,
            metalness: 0.35,
          });
          dynamicDisposables.push(cGeo, tGeo, cMat, tMat);
          moleculeRoot.add(new THREE.Mesh(cGeo, cMat));
          moleculeRoot.add(new THREE.Mesh(tGeo, tMat));
        }

        // Nascent 5'->3' mRNA Transcript Strand
        const rnaSteps = steps.filter((s) => s.isTranscribed);
        const rnaPts = rnaSteps.map(
          (s) =>
            new THREE.Vector3(
              s.rnaBackbonePosWorld.x,
              s.rnaBackbonePosWorld.y,
              s.rnaBackbonePosWorld.z
            )
        );
        if (rnaPts.length >= 2) {
          const rnaGeo = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(rnaPts),
            rnaPts.length * 6,
            0.22,
            12,
            false
          );
          const rnaMat = new THREE.MeshPhysicalMaterial({
            color: 0xf43f5e, // Rose-Red Nascent mRNA Backbone
            roughness: 0.2,
            metalness: 0.3,
            clearcoat: 0.8,
          });
          dynamicDisposables.push(rnaGeo, rnaMat);
          moleculeRoot.add(new THREE.Mesh(rnaGeo, rnaMat));
        }

        // DNA & Nascent RNA nucleotide base rungs (highlighting Uracil U in rose-pink)
        for (const s of steps) {
          const cBaseMat = new THREE.MeshStandardMaterial({
            color: getBaseColorHex(s.codingBase),
            roughness: 0.3,
          });
          const tBaseMat = new THREE.MeshStandardMaterial({
            color: getBaseColorHex(s.templateBase),
            roughness: 0.3,
          });
          dynamicDisposables.push(cBaseMat, tBaseMat);

          const m1 = new THREE.Mesh(unitCylinderGeo, cBaseMat);
          orientCylinderMatrix(
            s.codingStrandPosWorld,
            s.codingBasePosWorld,
            0.13,
            m1.matrix
          );
          m1.matrixAutoUpdate = false;
          moleculeRoot.add(m1);

          const m2 = new THREE.Mesh(unitCylinderGeo, tBaseMat);
          orientCylinderMatrix(
            s.templateStrandPosWorld,
            s.templateBasePosWorld,
            0.13,
            m2.matrix
          );
          m2.matrixAutoUpdate = false;
          moleculeRoot.add(m2);

          if (s.isTranscribed) {
            const rnaColor = RNA_BASE_COLORS[s.rnaBase];
            const rBaseMat = new THREE.MeshStandardMaterial({
              color: rnaColor,
              emissive: s.rnaBase === 'U' ? 0xf43f5e : 0x000000,
              emissiveIntensity: s.rnaBase === 'U' ? 0.35 : 0,
              roughness: 0.25,
            });
            dynamicDisposables.push(rBaseMat);
            const rMesh = new THREE.Mesh(unitCylinderGeo, rBaseMat);
            orientCylinderMatrix(
              s.rnaBackbonePosWorld,
              s.rnaBasePosWorld,
              0.14,
              rMesh.matrix
            );
            rMesh.matrixAutoUpdate = false;
            moleculeRoot.add(rMesh);
          }
        }

        // Translucent Multi-Subunit RNA Polymerase II Envelope surrounding the transcription bubble
        const rnapGroup = new THREE.Group();
        rnapGroup.position.set(
          txModel.polymeraseCenterWorld.x,
          txModel.polymeraseCenterWorld.y,
          txModel.polymeraseCenterWorld.z
        );
        const rnapMat = new THREE.MeshPhysicalMaterial({
          color: 0x38bdf8,
          roughness: 0.25,
          metalness: 0.1,
          transparent: true,
          opacity: 0.26,
          depthWrite: false,
        });
        dynamicDisposables.push(rnapMat);
        const mainLobe = new THREE.Mesh(unitSphereGeo, rnapMat);
        mainLobe.scale.set(5.2, 3.8, 4.4);
        rnapGroup.add(mainLobe);
        moleculeRoot.add(rnapGroup);

        return;
      }

      // =========================================================================
      // MODE 5: CANONICAL B-DNA STRUCTURE (Modes A–F)
      // =========================================================================
      const steps = model.steps;
      const n = steps.length;
      const isWireframe = repMode === 'wireframe';

      // Fit contact shadow disc below the bottom of the helix
      const minY = steps[0]?.worldY ?? -6;
      contactDisc.position.y = minY - 2.4;

      // 1. Sugar-Phosphate Backbones (Strand 1: 5'->3', Strand 2: 3'->5')
      if (env.showBackbone && n >= 2) {
        const curve1Pts = model.strand1BackboneCurveWorld.map(
          (v) => new THREE.Vector3(v.x, v.y, v.z)
        );
        const curve2Pts = model.strand2BackboneCurveWorld.map(
          (v) => new THREE.Vector3(v.x, v.y, v.z)
        );

        const tubeRadius =
          repMode === 'ribbon'
            ? 0.34
            : repMode === 'basePair'
              ? 0.14
              : 0.24;

        const tube1Geo = new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(curve1Pts),
          n * 8,
          tubeRadius,
          repMode === 'ribbon' ? 6 : 16,
          false
        );
        const tube2Geo = new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(curve2Pts),
          n * 8,
          tubeRadius,
          repMode === 'ribbon' ? 6 : 16,
          false
        );
        dynamicDisposables.push(tube1Geo, tube2Geo);

        const strand1Mat = new THREE.MeshPhysicalMaterial({
          color: STRAND_1_HEX,
          roughness: 0.24,
          metalness: 0.35,
          clearcoat: 0.65,
          clearcoatRoughness: 0.15,
          wireframe: isWireframe,
          transparent: isTransparent,
          opacity:
            hlFilter === 'strand2'
              ? opacity * 0.25
              : opacity,
        });
        const strand2Mat = new THREE.MeshPhysicalMaterial({
          color: STRAND_2_HEX,
          roughness: 0.24,
          metalness: 0.35,
          clearcoat: 0.65,
          clearcoatRoughness: 0.15,
          wireframe: isWireframe,
          transparent: isTransparent,
          opacity:
            hlFilter === 'strand1'
              ? opacity * 0.25
              : opacity,
        });
        dynamicDisposables.push(strand1Mat, strand2Mat);

        const mesh1 = new THREE.Mesh(tube1Geo, strand1Mat);
        const mesh2 = new THREE.Mesh(tube2Geo, strand2Mat);
        if (repMode === 'ribbon') {
          mesh1.scale.set(1.0, 1.0, 0.45);
          mesh2.scale.set(1.0, 1.0, 0.45);
        }
        moleculeRoot.add(mesh1);
        moleculeRoot.add(mesh2);

        // 5' and 3' Terminal Polarity Caps & Directional Cones
        const s1End = curve1Pts[curve1Pts.length - 1];
        const s1Prev = curve1Pts[curve1Pts.length - 2];
        const dir1 = new THREE.Vector3().subVectors(s1End, s1Prev).normalize();
        const cone1 = new THREE.Mesh(coneArrowGeo, strand1Mat);
        cone1.position.copy(s1End).addScaledVector(dir1, 0.4);
        cone1.quaternion.setFromUnitVectors(_scratchUp, dir1);
        moleculeRoot.add(cone1);

        // Strand 2 runs 3'->5' upward, so its 5'->3' arrow points downward at index 0
        const s2Start = curve2Pts[0];
        const s2Next = curve2Pts[1];
        const dir2 = new THREE.Vector3().subVectors(s2Start, s2Next).normalize();
        const cone2 = new THREE.Mesh(coneArrowGeo, strand2Mat);
        cone2.position.copy(s2Start).addScaledVector(dir2, 0.4);
        cone2.quaternion.setFromUnitVectors(_scratchUp, dir2);
        moleculeRoot.add(cone2);
      }

      // 2. Ball-and-Stick or Space-Filling Atomistic Mode
      if (repMode === 'ballAndStick' || repMode === 'spaceFilling') {
        const allAtoms: Array<{
          atom: typeof steps[0]['strand1Node']['atoms'][0];
          base: DNABase;
          highlighted: boolean;
        }> = [];
        const allBonds: Array<typeof steps[0]['strand1Node']['bonds'][0]> = [];

        for (const step of steps) {
          for (const node of [step.strand1Node, step.strand2Node]) {
            const hl = isNucleotideHighlighted(
              step.bpIndex,
              node.strand,
              node.base,
              selBp,
              selStrand,
              hlFilter
            );
            for (const a of node.atoms) {
              allAtoms.push({ atom: a, base: node.base, highlighted: hl });
            }
            if (repMode === 'ballAndStick') {
              for (const b of node.bonds) {
                allBonds.push(b);
              }
            }
          }
        }

        const atomMat = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          roughness: 0.22,
          metalness: 0.15,
          clearcoat: 0.55,
          transparent: isTransparent,
          opacity,
        });
        dynamicDisposables.push(atomMat);

        const atomInst = new THREE.InstancedMesh(
          unitSphereGeo,
          atomMat,
          allAtoms.length
        );
        const atomLookup: Array<{ bpIndex: number; strand: 1 | 2; label: string }> = [];

        for (let i = 0; i < allAtoms.length; i++) {
          const { atom, base, highlighted } = allAtoms[i];
          const elem = CPK_ELEMENT_COLORS[atom.element];
          const radiusScale =
            repMode === 'spaceFilling'
              ? elem.vdwRadiusNm * 3.1
              : elem.vdwRadiusNm * 1.35;

          _scratchVecA.set(
            atom.positionWorld.x,
            atom.positionWorld.y,
            atom.positionWorld.z
          );
          _scratchQuat.identity();
          _scratchScale.setScalar(radiusScale * (highlighted ? 1.12 : 0.94));
          _scratchMat4.compose(_scratchVecA, _scratchQuat, _scratchScale);
          atomInst.setMatrixAt(i, _scratchMat4);

          const hex =
            scheme === 'cpkElement'
              ? elem.hex
              : NUCLEOTIDE_DATABASE[base].colorHex;
          _scratchColor.set(hex);
          if (!highlighted && hlFilter !== 'none') {
            _scratchColor.multiplyScalar(0.32);
          }
          atomInst.setColorAt(i, _scratchColor);
          atomLookup.push({
            bpIndex: atom.bpIndex,
            strand: atom.strand,
            label: `${atom.label} (${elem.name})`,
          });
        }
        atomInst.instanceMatrix.needsUpdate = true;
        if (atomInst.instanceColor) atomInst.instanceColor.needsUpdate = true;
        atomInst.computeBoundingSphere();
        atomInst.userData = { atomLookup };
        interactables.push(atomInst);
        moleculeRoot.add(atomInst);

        if (repMode === 'ballAndStick' && allBonds.length > 0) {
          const bondMat = new THREE.MeshStandardMaterial({
            color: 0x94a3b8,
            roughness: 0.35,
            metalness: 0.35,
            transparent: isTransparent,
            opacity,
          });
          dynamicDisposables.push(bondMat);
          const bondInst = new THREE.InstancedMesh(
            unitCylinderGeo,
            bondMat,
            allBonds.length
          );
          for (let i = 0; i < allBonds.length; i++) {
            orientCylinderMatrix(
              allBonds[i].fromWorld,
              allBonds[i].toWorld,
              0.068,
              _scratchMat4
            );
            bondInst.setMatrixAt(i, _scratchMat4);
          }
          bondInst.instanceMatrix.needsUpdate = true;
          bondInst.computeBoundingSphere();
          moleculeRoot.add(bondInst);
        }
      } else {
        // 3. Cinematic / Ribbon / BasePair / Wireframe Detailed Nucleotide Components
        for (const step of steps) {
          const nodes = [step.strand1Node, step.strand2Node];
          for (const node of nodes) {
            const isSelected =
              step.bpIndex === selBp && node.strand === selStrand;
            const isPairSelected = step.bpIndex === selBp;
            const highlighted = isNucleotideHighlighted(
              step.bpIndex,
              node.strand,
              node.base,
              selBp,
              selStrand,
              hlFilter
            );
            const dimMultiplier =
              !highlighted && hlFilter !== 'none' ? 0.28 : 1.0;

            const baseHex = getBaseColorHex(node.base);
            const baseColor = new THREE.Color(baseHex).multiplyScalar(dimMultiplier);

            // A) Phosphate PO4 Sphere on Backbone
            if (env.showBackbone) {
              const pMat = new THREE.MeshPhysicalMaterial({
                color:
                  scheme === 'cpkElement'
                    ? CPK_ELEMENT_COLORS.P.hex
                    : node.strand === 1
                      ? '#22d3ee'
                      : '#a78bfa',
                roughness: 0.2,
                metalness: 0.45,
                clearcoat: 0.6,
                wireframe: isWireframe,
                transparent: isTransparent,
                opacity,
              });
              dynamicDisposables.push(pMat);
              const pSphere = new THREE.Mesh(lowSphereGeo, pMat);
              pSphere.position.set(
                node.phosphateWorld.x,
                node.phosphateWorld.y,
                node.phosphateWorld.z
              );
              pSphere.scale.setScalar(isSelected ? 0.42 : 0.33);
              pSphere.userData = {
                bpIndex: step.bpIndex,
                strand: node.strand,
                component: 'Phosphate Group (PO₄⁻)',
              };
              interactables.push(pSphere);
              moleculeRoot.add(pSphere);

              // Deoxyribose Furanose 5-Membered Ring
              const sugarMat = new THREE.MeshStandardMaterial({
                color: node.strand === 1 ? 0x0891b2 : 0x6d28d9,
                roughness: 0.4,
                metalness: 0.2,
                wireframe: isWireframe,
                transparent: isTransparent,
                opacity,
              });
              dynamicDisposables.push(sugarMat);
              const sugarMesh = new THREE.Mesh(pentoseExtrudeGeo, sugarMat);
              sugarMesh.position.set(
                node.sugarCenterWorld.x,
                node.sugarCenterWorld.y,
                node.sugarCenterWorld.z
              );
              sugarMesh.lookAt(
                node.baseCenterWorld.x,
                node.sugarCenterWorld.y,
                node.baseCenterWorld.z
              );
              sugarMesh.userData = {
                bpIndex: step.bpIndex,
                strand: node.strand,
                component: '2′-Deoxyribose Sugar (C₅H₁₀O₄)',
              };
              interactables.push(sugarMesh);
              moleculeRoot.add(sugarMesh);

              // Phosphodiester link from Phosphate to Sugar
              const psCylinder = new THREE.Mesh(unitCylinderGeo, sugarMat);
              orientCylinderMatrix(
                node.phosphateWorld,
                node.sugarCenterWorld,
                0.09,
                psCylinder.matrix
              );
              psCylinder.matrixAutoUpdate = false;
              moleculeRoot.add(psCylinder);
            }

            // B) Nitrogenous Base Geometry (Purine = 2 fused rings, Pyrimidine = 1 ring)
            if (env.showBases) {
              const baseMat = new THREE.MeshPhysicalMaterial({
                color: baseColor,
                emissive: baseColor,
                emissiveIntensity: isSelected
                  ? 0.55
                  : isPairSelected
                    ? 0.28
                    : 0.08,
                roughness: 0.25,
                metalness: 0.18,
                clearcoat: 0.65,
                wireframe: isWireframe,
                transparent: isTransparent,
                opacity,
              });
              dynamicDisposables.push(baseMat);

              // Glycosidic C1'-N9/N1 covalent bond cylinder
              const glycoMesh = new THREE.Mesh(unitCylinderGeo, baseMat);
              orientCylinderMatrix(
                node.sugarCenterWorld,
                node.baseCenterWorld,
                0.11,
                glycoMesh.matrix
              );
              glycoMesh.matrixAutoUpdate = false;
              moleculeRoot.add(glycoMesh);

              // Construct Purine (2-ring) or Pyrimidine (1-ring) horizontal planar ring group
              const baseGroup = new THREE.Group();
              baseGroup.position.set(
                node.baseCenterWorld.x,
                node.baseCenterWorld.y,
                node.baseCenterWorld.z
              );
              // Orient ring plane horizontally (normal along Y) and pointing along baseAxisWorld
              const yawAngle = Math.atan2(
                node.baseAxisWorld.x,
                node.baseAxisWorld.z
              );
              baseGroup.rotation.set(Math.PI / 2, 0, -yawAngle + Math.PI / 2);

              if (node.classification === 'Purine') {
                // Bicyclic Purine (Adenine / Guanine): 5-membered imidazole + 6-membered pyrimidine ring
                const ring5 = new THREE.Mesh(imidazoleExtrudeGeo, baseMat);
                ring5.position.set(-0.22, 0, 0);
                ring5.userData = {
                  bpIndex: step.bpIndex,
                  strand: node.strand,
                  component: `${NUCLEOTIDE_DATABASE[node.base].name} (${node.base}) — Purine (2 Rings)`,
                };
                const ring6 = new THREE.Mesh(pyrimidineExtrudeGeo, baseMat);
                ring6.position.set(0.32, 0, 0);
                ring6.userData = ring5.userData;

                interactables.push(ring5, ring6);
                baseGroup.add(ring5, ring6);
              } else {
                // Monocyclic Pyrimidine (Thymine / Cytosine): single 6-membered ring
                const ring6 = new THREE.Mesh(pyrimidineExtrudeGeo, baseMat);
                ring6.position.set(0.05, 0, 0);
                ring6.userData = {
                  bpIndex: step.bpIndex,
                  strand: node.strand,
                  component: `${NUCLEOTIDE_DATABASE[node.base].name} (${node.base}) — Pyrimidine (1 Ring)`,
                };
                interactables.push(ring6);
                baseGroup.add(ring6);
              }

              if (isSelected || isPairSelected) {
                baseGroup.scale.setScalar(1.12);
              }

              moleculeRoot.add(baseGroup);
            }
          }
        }
      }

      // 4. Canonical Watson-Crick Hydrogen Bonds (2 for A-T, 3 for G-C)
      if (env.showHydrogenBonds && repMode !== 'spaceFilling') {
        const hbMat = new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xfacc15,
          emissiveIntensity: repMode === 'basePair' ? 0.65 : 0.3,
          roughness: 0.25,
          wireframe: isWireframe,
        });
        dynamicDisposables.push(hbMat);

        const dashSegments: Array<{ p0: Vec3; p1: Vec3 }> = [];
        for (const step of steps) {
          for (const hb of step.hydrogenBonds) {
            // Render each H-bond as 3 distinct non-covalent dashed segments
            const numDashes = 3;
            for (let d = 0; d < numDashes; d++) {
              const tStart = d / numDashes + 0.05;
              const tEnd = (d + 0.65) / numDashes;
              dashSegments.push({
                p0: {
                  x: hb.startWorld.x + (hb.endWorld.x - hb.startWorld.x) * tStart,
                  y: hb.startWorld.y + (hb.endWorld.y - hb.startWorld.y) * tStart,
                  z: hb.startWorld.z + (hb.endWorld.z - hb.startWorld.z) * tStart,
                },
                p1: {
                  x: hb.startWorld.x + (hb.endWorld.x - hb.startWorld.x) * tEnd,
                  y: hb.startWorld.y + (hb.endWorld.y - hb.startWorld.y) * tEnd,
                  z: hb.startWorld.z + (hb.endWorld.z - hb.startWorld.z) * tEnd,
                },
              });
            }
          }
        }

        if (dashSegments.length > 0) {
          const hbInst = new THREE.InstancedMesh(
            unitCylinderGeo,
            hbMat,
            dashSegments.length
          );
          const hbRadius = repMode === 'basePair' ? 0.068 : 0.048;
          for (let i = 0; i < dashSegments.length; i++) {
            orientCylinderMatrix(
              dashSegments[i].p0,
              dashSegments[i].p1,
              hbRadius,
              _scratchMat4
            );
            hbInst.setMatrixAt(i, _scratchMat4);
          }
          hbInst.instanceMatrix.needsUpdate = true;
          hbInst.computeBoundingSphere();
          moleculeRoot.add(hbInst);
        }
      }

      // 5. Major & Minor Groove Indicators (when enabled or in Base-Pair Analysis Mode)
      if (env.showMajorMinorGrooves || repMode === 'basePair') {
        const majorPts = steps.map(
          (s) =>
            new THREE.Vector3(
              s.majorGrooveCenterWorld.x,
              s.majorGrooveCenterWorld.y,
              s.majorGrooveCenterWorld.z
            )
        );
        const minorPts = steps.map(
          (s) =>
            new THREE.Vector3(
              s.minorGrooveCenterWorld.x,
              s.minorGrooveCenterWorld.y,
              s.minorGrooveCenterWorld.z
            )
        );
        if (majorPts.length >= 2) {
          const majGeo = new THREE.BufferGeometry().setFromPoints(majorPts);
          const minGeo = new THREE.BufferGeometry().setFromPoints(minorPts);
          const majMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
          const minMat = new THREE.LineBasicMaterial({ color: 0xf43f5e });
          dynamicDisposables.push(majGeo, minGeo, majMat, minMat);
          moleculeRoot.add(new THREE.Line(majGeo, majMat));
          moleculeRoot.add(new THREE.Line(minGeo, minMat));
        }
      }
    };

    // Frame pacing and on-demand rendering (`afterDraw` for software WebGL, `requestAnimationFrame` for GPUs)
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let lastTime = performance.now();
    let frameCounter = 0;
    let fpsTimer = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (status === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    let cameraGoalPos: THREE.Vector3 | null = null;
    let cameraGoalTarget: THREE.Vector3 | null = null;

    const stepSimulationAndRender = () => {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      frameCounter++;
      if (now - fpsTimer >= 1000) {
        setFpsDisplay(Math.round((frameCounter * 1000) / (now - fpsTimer)));
        frameCounter = 0;
        fpsTimer = now;
      }

      const st = stateRef.current;
      let needsAnotherFrame = false;

      // Smooth exponential camera damping toward preset goals
      if (sceneObjectsRef.current?.cameraGoalPos && sceneObjectsRef.current?.cameraGoalTarget) {
        const gPos = sceneObjectsRef.current.cameraGoalPos;
        const gTgt = sceneObjectsRef.current.cameraGoalTarget;
        const alpha = 1 - Math.exp(-8 * dt);
        camera.position.lerp(gPos, alpha);
        controls.target.lerp(gTgt, alpha);
        if (
          camera.position.distanceTo(gPos) < 0.04 &&
          controls.target.distanceTo(gTgt) < 0.04
        ) {
          camera.position.copy(gPos);
          controls.target.copy(gTgt);
          sceneObjectsRef.current.cameraGoalPos = null;
          sceneObjectsRef.current.cameraGoalTarget = null;
        } else {
          needsAnotherFrame = true;
        }
      }

      // Advance biological process timeline when playing in Replication or Transcription mode
      if (
        st.isPlaying &&
        (st.labMode === 'replication' || st.labMode === 'transcription')
      ) {
        const nextProg = st.animationProgress + dt * 0.14 * st.animationSpeed;
        const wrapped = nextProg > 1 ? 0 : nextProg;
        setAnimationProgress(Number(wrapped.toFixed(4)));
        needsAnotherFrame = true;
      }

      // Auto-rotation or subtle conceptual thermal oscillation
      if (st.environment.autoRotate && !isSoftwareGl) {
        moleculeRoot.rotation.y += dt * 0.45 * st.animationSpeed;
        needsAnotherFrame = true;
      } else if (st.isPlaying && st.labMode === 'structure') {
        moleculeRoot.rotation.y += dt * 0.55 * st.animationSpeed;
        needsAnotherFrame = true;
      }

      if (st.environment.ambientThermalMotion) {
        moleculeRoot.position.y = Math.sin(now * 0.0025) * 0.15;
        particlesMesh.rotation.y += dt * 0.06;
        needsAnotherFrame = true;
      } else {
        moleculeRoot.position.y = 0;
      }

      controls.update();
      renderer.render(scene, camera);

      return needsAnotherFrame;
    };

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        renderDirty = false;
        const keepLooping = stepSimulationAndRender();
        const done = () => {
          renderBusy = false;
          if (renderDirty || keepLooping) {
            requestRender();
          }
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    // Cancel scripted camera transition if user manually grabs OrbitControls
    controls.addEventListener('start', () => {
      if (sceneObjectsRef.current) {
        sceneObjectsRef.current.cameraGoalPos = null;
        sceneObjectsRef.current.cameraGoalTarget = null;
      }
      if (stateRef.current.environment.autoRotate) {
        useDNAStore.getState().updateEnvironment({ autoRotate: false });
      }
    });

    controls.addEventListener('change', () => {
      requestRender();
    });

    // Raycasting for Click Selection, Double-Click Focus, and Hover Tooltip
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const updateMouseNDC = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: MouseEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: MouseEvent) => {
      const moveDist = Math.hypot(
        e.clientX - pointerDownPos.x,
        e.clientY - pointerDownPos.y
      );
      if (moveDist > 6) return; // Ignore drag release

      updateMouseNDC(e);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactables, false);
      if (hits.length > 0) {
        const hit = hits[0];
        const obj = hit.object;

        // Check if PDB atom instanced mesh
        if (obj.userData?.isPDBAtomMesh && typeof hit.instanceId === 'number') {
          pickAtomForMeasurement(hit.instanceId);
          return;
        }

        // Check if atomistic InstancedMesh
        if (obj.userData?.atomLookup && typeof hit.instanceId === 'number') {
          const info = obj.userData.atomLookup[hit.instanceId];
          if (info) {
            selectNucleotide(info.bpIndex, info.strand, false);
          }
          return;
        }

        // Standard nucleotide mesh
        if (typeof obj.userData?.bpIndex === 'number') {
          selectNucleotide(
            obj.userData.bpIndex,
            obj.userData.strand || 1,
            false
          );
        }
      }
    };

    const onDoubleClick = (e: MouseEvent) => {
      updateMouseNDC(e);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactables, false);
      if (hits.length > 0) {
        const hit = hits[0];
        const obj = hit.object;
        if (typeof obj.userData?.bpIndex === 'number') {
          selectNucleotide(obj.userData.bpIndex, obj.userData.strand || 1, true);
        } else if (
          obj.userData?.atomLookup &&
          typeof hit.instanceId === 'number'
        ) {
          const info = obj.userData.atomLookup[hit.instanceId];
          if (info) selectNucleotide(info.bpIndex, info.strand, true);
        }
      }
    };

    let lastHoverTime = 0;
    const onPointerMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastHoverTime < 45) return; // Throttle raycast to ~22 Hz
      lastHoverTime = now;

      updateMouseNDC(e);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactables, false);

      if (hits.length === 0) {
        renderer.domElement.style.cursor = 'grab';
        setHoverTooltip(null);
        setHoveredNucleotide(null, null);
        return;
      }

      renderer.domElement.style.cursor = 'pointer';
      const hit = hits[0];
      const obj = hit.object;
      const rect = renderer.domElement.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      if (obj.userData?.isPDBAtomMesh && typeof hit.instanceId === 'number') {
        const pdbAtom = stateRef.current.pdbStructure.atoms[hit.instanceId];
        if (pdbAtom) {
          setHoverTooltip({
            x: localX,
            y: localY,
            title: `Atom #${pdbAtom.serial}: ${pdbAtom.atomName} (${pdbAtom.element})`,
            subtitle: `Residue ${pdbAtom.residueName} ${pdbAtom.residueNumber} · Chain ${pdbAtom.chainId}`,
            detail: `Coords: (${pdbAtom.xAngstrom.toFixed(2)}, ${pdbAtom.yAngstrom.toFixed(2)}, ${pdbAtom.zAngstrom.toFixed(2)}) Å`,
          });
        }
        return;
      }

      let bpIdx: number | null = null;
      let strand: 1 | 2 = 1;
      let componentLabel = '';

      if (obj.userData?.atomLookup && typeof hit.instanceId === 'number') {
        const info = obj.userData.atomLookup[hit.instanceId];
        if (info) {
          bpIdx = info.bpIndex;
          strand = info.strand;
          componentLabel = info.label;
        }
      } else if (typeof obj.userData?.bpIndex === 'number') {
        bpIdx = obj.userData.bpIndex;
        strand = obj.userData.strand || 1;
        componentLabel = obj.userData.component || '';
      }

      if (bpIdx !== null) {
        const step = stateRef.current.helixModel.steps[bpIdx];
        if (step) {
          const node = strand === 1 ? step.strand1Node : step.strand2Node;
          setHoveredNucleotide(bpIdx, strand);
          setHoverTooltip({
            x: localX,
            y: localY,
            title: `BP #${step.sequenceNumber}: ${node.base}–${node.pairedBase} (${NUCLEOTIDE_DATABASE[node.base].name})`,
            subtitle: `Strand ${strand} (${node.directionLabel}) · ${node.classification} · ${node.hydrogenBondCount} H-Bonds`,
            detail: componentLabel || `Axial z = ${step.axialZNm} nm · Twist θ = ${step.thetaDeg}°`,
          });
        }
      }
    };

    const onPointerLeave = () => {
      setHoverTooltip(null);
      setHoveredNucleotide(null, null);
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onPointerDown);
    domElem.addEventListener('mouseup', onPointerUp);
    domElem.addEventListener('dblclick', onDoubleClick);
    domElem.addEventListener('mousemove', onPointerMove);
    domElem.addEventListener('mouseleave', onPointerLeave);

    // WebGL Context Loss Safety
    const onContextLost = (e: Event) => {
      e.preventDefault();
    };
    const onContextRestored = () => {
      rebuildSceneGeometry();
      requestRender();
    };
    domElem.addEventListener('webglcontextlost', onContextLost);
    domElem.addEventListener('webglcontextrestored', onContextRestored);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', onResize);
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    sceneObjectsRef.current = {
      renderer,
      scene,
      camera,
      controls,
      moleculeRoot,
      particlesMesh,
      keyLight,
      hemiLight,
      rimLight,
      contactDisc,
      interactables,
      requestRender,
      cameraGoalPos,
      cameraGoalTarget,
      rebuildSceneGeometry,
      isSoftwareGl,
    };

    rebuildSceneGeometry();
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    requestRender();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', onResize);
      domElem.removeEventListener('mousedown', onPointerDown);
      domElem.removeEventListener('mouseup', onPointerUp);
      domElem.removeEventListener('dblclick', onDoubleClick);
      domElem.removeEventListener('mousemove', onPointerMove);
      domElem.removeEventListener('mouseleave', onPointerLeave);
      domElem.removeEventListener('webglcontextlost', onContextLost);
      domElem.removeEventListener('webglcontextrestored', onContextRestored);
      clearMoleculeRoot();
      unitSphereGeo.dispose();
      lowSphereGeo.dispose();
      unitCylinderGeo.dispose();
      coneArrowGeo.dispose();
      pentoseExtrudeGeo.dispose();
      pyrimidineExtrudeGeo.dispose();
      imidazoleExtrudeGeo.dispose();
      particleGeo.dispose();
      contactTex.dispose();
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Trigger geometry rebuild and render whenever relevant molecular state updates
  useEffect(() => {
    const ctx = sceneObjectsRef.current;
    if (!ctx) return;
    ctx.rebuildSceneGeometry();
    ctx.requestRender();
  }, [
    helixModel,
    selectedBpIndex,
    selectedStrand,
    highlightFilter,
    representationMode,
    labMode,
    chromatinLevel,
    colorScheme,
    animationProgress,
    pdbStructure,
    measuredAtomIndices,
    environment,
  ]);

  // Trigger animation loop when play state or autoRotate changes
  useEffect(() => {
    const ctx = sceneObjectsRef.current;
    if (!ctx) return;
    ctx.requestRender();
  }, [isPlaying, environment.autoRotate, environment.ambientThermalMotion]);

  // Handle Camera Preset Commands smoothly
  useEffect(() => {
    const ctx = sceneObjectsRef.current;
    if (!ctx || cameraCommand.timestamp === 0) return;

    const steps = stateRef.current.helixModel.steps;
    const spanY =
      steps.length > 0
        ? Math.max(12, (steps[steps.length - 1].worldY - steps[0].worldY) * 1.15)
        : 18;

    switch (cameraCommand.type) {
      case 'reset':
        ctx.moleculeRoot.rotation.set(0, 0, 0);
        ctx.cameraGoalTarget = new THREE.Vector3(0, 0, 0);
        ctx.cameraGoalPos = new THREE.Vector3(0, 2.0, Math.max(19, spanY * 1.15));
        break;
      case 'side':
        ctx.cameraGoalTarget = new THREE.Vector3(0, 0, 0);
        ctx.cameraGoalPos = new THREE.Vector3(Math.max(19, spanY * 1.15), 0, 0);
        break;
      case 'top':
      case 'axial':
        ctx.cameraGoalTarget = new THREE.Vector3(0, 0, 0);
        ctx.cameraGoalPos = new THREE.Vector3(0, Math.max(22, spanY * 1.35), 0.01);
        break;
      case 'focusSelected': {
        const step =
          steps[Math.min(stateRef.current.selectedBpIndex, steps.length - 1)] ||
          steps[0];
        if (step) {
          const node =
            stateRef.current.selectedStrand === 1
              ? step.strand1Node
              : step.strand2Node;
          ctx.cameraGoalTarget = new THREE.Vector3(
            node.baseCenterWorld.x * 0.5,
            step.worldY,
            node.baseCenterWorld.z * 0.5
          );
          ctx.cameraGoalPos = new THREE.Vector3(
            node.phosphateWorld.x * 2.4 + 4.5,
            step.worldY + 1.8,
            node.phosphateWorld.z * 2.4 + 6.5
          );
        }
        break;
      }
    }
    ctx.requestRender();
  }, [cameraCommand]);

  // Handle High-Resolution PNG Screenshot Export (synchronously calling renderer.render right before toDataURL)
  useEffect(() => {
    const ctx = sceneObjectsRef.current;
    if (!ctx || screenshotTrigger === 0) return;

    ctx.renderer.render(ctx.scene, ctx.camera);
    const dataUrl = ctx.renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `DNA-Explorer-Pro-${stateRef.current.labMode}-${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [screenshotTrigger]);

  // Selected step for contextual HUD overlay
  const activeStep =
    helixModel.steps[Math.min(selectedBpIndex, helixModel.steps.length - 1)] ||
    helixModel.steps[0];

  const atomDistResult =
    representationMode === 'pdbViewer' &&
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
    <div
      className="relative w-full h-full flex-1 overflow-hidden select-none bg-[#07090e]"
      data-testid="molecular-viewport"
    >
      {/* Dedicated WebGL Mount Container */}
      <div
        ref={canvasMountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D DNA Molecular Viewport"
      />

      {/* Graceful WebGL Fallback if hardware/software context unavailable */}
      {webglFallbackError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/95 p-6 text-center z-30">
          <div className="max-w-md border border-slate-800 bg-slate-900 p-6 rounded-xl">
            <h2 className="text-base font-semibold text-white mb-2">
              3D WebGL Viewport Notice
            </h2>
            <p className="text-xs text-slate-400 mb-4">{webglFallbackError}</p>
            <p className="text-xs font-mono text-cyan-400">
              Sequence: 5′-{helixModel.sequence5to3}-3′ ({helixModel.steps.length} bp)
            </p>
          </div>
        </div>
      )}

      {/* Top-Left Scientific Provenance & Selected Base-Pair HUD Header */}
      <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-col gap-1.5 max-w-[305px]">
        <div className="bg-[#0b0f19]/92 border border-slate-800/90 px-3 py-2 rounded-lg">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 whitespace-nowrap">
            <span className="text-cyan-400 font-semibold">
              {representationMode === 'pdbViewer'
                ? `EXPERIMENTAL PDB (${pdbStructure.pdbId})`
                : labMode === 'replication'
                  ? 'REPLICATION FORK'
                  : labMode === 'transcription'
                    ? 'RNA TRANSCRIPTION'
                    : labMode === 'chromatin'
                      ? `CHROMATIN LVL ${chromatinLevel}/5`
                      : 'CANONICAL B-DNA'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {representationMode === 'pdbViewer'
                ? `${pdbStructure.atoms.length} Atoms · 1.90 Å`
                : `${helixModel.steps.length} bp · ${(helixModel.steps.length * 0.34).toFixed(2)} nm`}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
            {representationMode === 'pdbViewer'
              ? 'X-ray coordinates in Å (click two atoms for distance).'
              : labMode === 'replication' || labMode === 'transcription'
                ? 'Conceptual 5′→3′ process animation (non-MD model).'
                : 'Idealized right-handed B-DNA (10.5 bp/turn, 0.34 nm rise).'}
          </p>

          {environment.showLabels && activeStep && representationMode !== 'pdbViewer' && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center gap-2 text-[11px] font-mono">
              <span className="text-slate-400">BP #{activeStep.sequenceNumber}:</span>
              <span className="font-bold text-white">
                5′-{activeStep.strand1Node.base}
                {activeStep.strand1Node.hydrogenBondCount === 2 ? '=' : '≡'}
                {activeStep.strand2Node.base}-3′
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400 tabular-nums">
                {activeStep.axialZNm} nm
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-amber-300 tabular-nums">
                {activeStep.strand1Node.hydrogenBondCount} HB
              </span>
            </div>
          )}
        </div>

        {/* Active PDB Atom-to-Atom Distance Readout */}
        {representationMode === 'pdbViewer' && atomDistResult && (
          <div className="bg-[#0b0f19]/95 border border-amber-500/40 px-3 py-2 rounded-lg">
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
              Euclidean Interatomic Distance
            </div>
            <div className="text-sm font-mono font-bold text-white tabular-nums mt-0.5">
              {atomDistResult.distanceAngstrom} Å{' '}
              <span className="text-xs font-normal text-slate-400">
                ({atomDistResult.distanceNm} nm)
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-300 mt-0.5">
              {pdbStructure.atoms[measuredAtomIndices[0]!].atomName}(
              {pdbStructure.atoms[measuredAtomIndices[0]!].residueName}
              {pdbStructure.atoms[measuredAtomIndices[0]!].residueNumber}) ↔{' '}
              {pdbStructure.atoms[measuredAtomIndices[1]!].atomName}(
              {pdbStructure.atoms[measuredAtomIndices[1]!].residueName}
              {pdbStructure.atoms[measuredAtomIndices[1]!].residueNumber})
            </div>
          </div>
        )}
      </div>

      {/* Top-Right Color Encoding Legend & Optional Performance Telemetry */}
      {environment.showLabels && (
        <div className="pointer-events-none absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5 max-w-[265px]">
          <div className="bg-[#0b0f19]/92 border border-slate-800/90 px-3 py-2 rounded-lg text-[11px]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              {colorScheme === 'cpkElement'
                ? 'CPK Element Legend'
                : labMode === 'transcription'
                  ? 'DNA / mRNA Legend'
                  : 'Nucleotide Legend'}
            </div>

            {colorScheme === 'cpkElement' ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px]">
                {(['C', 'N', 'O', 'P'] as const).map((el) => (
                  <div key={el} className="flex items-center gap-1.5 text-slate-200 whitespace-nowrap">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: CPK_ELEMENT_COLORS[el].hex }}
                    />
                    <span>{CPK_ELEMENT_COLORS[el].name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-200 whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981] shrink-0" />
                  <span>A · Adenine</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-200 whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444] shrink-0" />
                  <span>T · Thymine</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-200 whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6] shrink-0" />
                  <span>G · Guanine</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-200 whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#eab308] shrink-0" />
                  <span>C · Cytosine</span>
                </div>
                {labMode === 'transcription' && (
                  <div className="col-span-2 flex items-center gap-1.5 text-rose-300 pt-0.5 border-t border-slate-800 whitespace-nowrap">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#f43f5e] shrink-0" />
                    <span>U · RNA Uracil</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-1.5 pt-1 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400 whitespace-nowrap">
              <span>5′→3′ Cyan · 3′→5′ Violet</span>
              <span className="text-amber-300">HB: Dashed</span>
            </div>
          </div>

          {environment.showPerformanceStats && (
            <div className="bg-[#0b0f19]/90 border border-slate-800 px-2.5 py-1 rounded text-[11px] font-mono text-slate-300 tabular-nums">
              FPS: {fpsDisplay} · Steps: {helixModel.steps.length} · Meshes:{' '}
              {sceneObjectsRef.current?.interactables.length ?? 0}
            </div>
          )}
        </div>
      )}

      {/* Hover Raycast Tooltip */}
      {hoverTooltip && (
        <div
          className="pointer-events-none absolute z-20 bg-[#0b0f19]/95 border border-slate-700 px-3 py-2 rounded-lg shadow-lg max-w-xs"
          style={{
            left: Math.min(hoverTooltip.x + 14, 900),
            top: Math.max(hoverTooltip.y - 68, 12),
          }}
        >
          <div className="text-xs font-semibold text-white font-mono">
            {hoverTooltip.title}
          </div>
          <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
            {hoverTooltip.subtitle}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {hoverTooltip.detail}
          </div>
        </div>
      )}
    </div>
  );
};
