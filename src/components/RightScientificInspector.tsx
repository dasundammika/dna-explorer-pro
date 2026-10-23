import React from 'react';
import {
  useDNAStore,
} from '../store/useDNAStore';
import {
  NUCLEOTIDE_DATABASE,
} from '../engine/DNASequenceEngine';
import {
  EDUCATIONAL_TOPICS,
  LearningTier,
} from '../data/learningContent';
import {
  BookOpen,
  Microscope,
  Crosshair,
  Globe,
} from 'lucide-react';

export const RightScientificInspector: React.FC = () => {
  const rightSidebarOpen = useDNAStore((s) => s.rightSidebarOpen);
  const helixModel = useDNAStore((s) => s.helixModel);
  const selectedBpIndex = useDNAStore((s) => s.selectedBpIndex);
  const selectedStrand = useDNAStore((s) => s.selectedStrand);
  const languageMode = useDNAStore((s) => s.languageMode);
  const learningTier = useDNAStore((s) => s.learningTier);
  const activeLearningTopicId = useDNAStore((s) => s.activeLearningTopicId);

  const selectNucleotide = useDNAStore((s) => s.selectNucleotide);
  const triggerCameraPreset = useDNAStore((s) => s.triggerCameraPreset);
  const setLanguageMode = useDNAStore((s) => s.setLanguageMode);
  const setLearningTier = useDNAStore((s) => s.setLearningTier);
  const setActiveLearningTopicId = useDNAStore(
    (s) => s.setActiveLearningTopicId
  );

  if (!rightSidebarOpen) return null;

  const steps = helixModel.steps;
  const activeStep =
    steps[Math.min(selectedBpIndex, steps.length - 1)] || steps[0];
  const activeNode =
    selectedStrand === 1 ? activeStep.strand1Node : activeStep.strand2Node;
  const partnerNode =
    selectedStrand === 1 ? activeStep.strand2Node : activeStep.strand1Node;

  const meta = NUCLEOTIDE_DATABASE[activeNode.base];
  const partnerMeta = NUCLEOTIDE_DATABASE[partnerNode.base];

  const activeTopic =
    EDUCATIONAL_TOPICS.find((t) => t.id === activeLearningTopicId) ||
    EDUCATIONAL_TOPICS[0];
  const tierContent = activeTopic.tiers[learningTier];

  return (
    <aside
      aria-label="Scientific Inspector and Learning Assistant"
      className="w-80 lg:w-[370px] shrink-0 h-full bg-[#0b0f19] border-l border-slate-800/90 flex flex-col z-10 overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* =============================================================== */}
        {/* SECTION 1: SELECTED NUCLEOTIDE & BASE-PAIR CHEMICAL INSPECTOR   */}
        {/* =============================================================== */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Microscope className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Nucleotide Inspector
              </h2>
            </div>
            <button
              type="button"
              onClick={() => triggerCameraPreset('focusSelected')}
              className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-[11px] font-mono text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <Crosshair className="w-3 h-3" />
              <span>Focus 3D</span>
            </button>
          </div>

          {/* Primary Nucleotide Identity Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] font-mono text-slate-400">
                  Base-Pair Position #{activeStep.sequenceNumber} · Strand{' '}
                  {activeNode.strand} ({activeNode.directionLabel})
                </div>
                <h3 className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-sm"
                    style={{ backgroundColor: meta.colorHex }}
                  />
                  <span>
                    {meta.name} ({meta.symbol})
                  </span>
                </h3>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  {meta.fullName}
                </div>
              </div>

              {/* Switch between Strand 1 and Strand 2 of the selected pair */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5 font-mono text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => selectNucleotide(activeStep.bpIndex, 1, false)}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    selectedStrand === 1
                      ? 'bg-cyan-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  5′-{activeStep.strand1Node.base}
                </button>
                <button
                  type="button"
                  onClick={() => selectNucleotide(activeStep.bpIndex, 2, false)}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    selectedStrand === 2
                      ? 'bg-violet-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {activeStep.strand2Node.base}-3′
                </button>
              </div>
            </div>

            {/* Chemical Metadata Grid (Unboxed clean typographic pairs) */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-3 pt-2.5 border-t border-slate-800/80 text-xs">
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">
                  Chemical Class
                </div>
                <div className="font-semibold text-white mt-0.5">
                  {meta.classification} ({meta.rings}{' '}
                  {meta.rings === 2 ? 'Fused Rings' : 'Ring'})
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">
                  Paired Partner
                </div>
                <div className="font-semibold text-white mt-0.5">
                  {partnerMeta.name} ({partnerMeta.symbol}) ·{' '}
                  {partnerNode.directionLabel}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">
                  Pentose Sugar
                </div>
                <div className="font-mono text-slate-200 mt-0.5">
                  2′-Deoxyribose (C2′-endo)
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">
                  Formula & Mass
                </div>
                <div className="font-mono text-slate-200 tabular-nums mt-0.5">
                  {meta.formula} · {meta.molecularMassDa} Da
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">
                  Backbone Link
                </div>
                <div className="font-mono text-slate-200 mt-0.5">
                  3′,5′-Phosphodiester
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">
                  Helical Coords
                </div>
                <div className="font-mono text-cyan-300 tabular-nums mt-0.5">
                  z = {activeStep.axialZNm} nm · θ = {activeStep.thetaDeg}°
                </div>
              </div>
            </div>

            {/* Canonical Watson-Crick Hydrogen Bond Breakdown */}
            <div className="pt-2.5 border-t border-slate-800/80">
              <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-amber-300 mb-1.5 whitespace-nowrap">
                <span>
                  Watson-Crick H-Bonds ({meta.hydrogenBonds})
                </span>
                <span className="font-bold">
                  {meta.symbol === 'A' || meta.symbol === 'T' ? 'A = T' : 'G ≡ C'}
                </span>
              </div>
              <div className="space-y-1">
                {activeStep.hydrogenBonds.map((hb) => (
                  <div
                    key={hb.index}
                    className="flex items-center justify-between text-[11px] font-mono bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800/80"
                  >
                    <span className="text-slate-300">
                      H-Bond #{hb.index + 1}: {hb.donorLabel} ··· {hb.acceptorLabel}
                    </span>
                    <span className="text-amber-300 tabular-nums">
                      {hb.lengthAngstrom} Å
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bilingual Nucleotide Explanation */}
            <div className="pt-2.5 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              {languageMode === 'si-en'
                ? meta.scientificSummarySiEn
                : meta.scientificSummaryEn}
            </div>
          </div>
        </section>

        {/* =============================================================== */}
        {/* SECTION 2: SYNCHRONIZED INTERACTIVE SEQUENCE LADDER             */}
        {/* =============================================================== */}
        <section className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between gap-2 whitespace-nowrap">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Sequence Map
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Click base pair to inspect
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1.5 pt-0.5">
            {steps.map((step) => {
              const isSelected = step.bpIndex === selectedBpIndex;
              const b1 = step.strand1Node.base;
              const b2 = step.strand2Node.base;
              return (
                <button
                  key={step.bpIndex}
                  type="button"
                  onClick={() => selectNucleotide(step.bpIndex, 1, false)}
                  aria-label={`Select Base Pair ${step.sequenceNumber} ${b1}-${b2}`}
                  className={`px-2 py-1.5 rounded border font-mono text-xs flex flex-col items-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white'
                      : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-[9px] text-slate-500">
                    {step.sequenceNumber}
                  </span>
                  <span
                    className="font-bold"
                    style={{ color: NUCLEOTIDE_DATABASE[b1].colorHex }}
                  >
                    {b1}
                  </span>
                  <span className="text-[10px] text-amber-400 leading-none my-0.5">
                    {b1 === 'A' || b1 === 'T' ? '∶' : '⋮'}
                  </span>
                  <span
                    className="font-bold"
                    style={{ color: NUCLEOTIDE_DATABASE[b2].colorHex }}
                  >
                    {b2}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =============================================================== */}
        {/* SECTION 3: SCIENTIFIC LEARNING ASSISTANT (EN & SINHALA + EN)    */}
        {/* =============================================================== */}
        <section className="space-y-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Scientific Learning Lab
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                setLanguageMode(languageMode === 'si-en' ? 'en' : 'si-en')
              }
              className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-medium text-cyan-300 flex items-center gap-1 hover:border-slate-700"
            >
              <Globe className="w-3 h-3" />
              <span>
                {languageMode === 'si-en' ? 'සිංහල + English' : 'English Mode'}
              </span>
            </button>
          </div>

          {/* Topic Selector */}
          <div>
            <label
              htmlFor="learning-topic-select"
              className="sr-only"
            >
              Select Scientific Topic
            </label>
            <select
              id="learning-topic-select"
              value={activeTopic.id}
              onChange={(e) => setActiveLearningTopicId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
            >
              {EDUCATIONAL_TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {languageMode === 'si-en' ? t.titleSiEn : t.titleEn}
                </option>
              ))}
            </select>
          </div>

          {/* 4 Comprehension Tier Tabs */}
          <div
            role="tablist"
            aria-label="Scientific Depth Tier"
            className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800"
          >
            {(
              [
                { id: 'beginner', label: 'Beginner' },
                { id: 'intermediate', label: 'Intermed.' },
                { id: 'advanced', label: 'Advanced' },
                { id: 'mathematical', label: 'Math' },
              ] as Array<{ id: LearningTier; label: string }>
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={learningTier === t.id}
                onClick={() => setLearningTier(t.id)}
                className={`py-1 px-1.5 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                  learningTier === t.id
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Topic Card Content */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white leading-snug">
                {languageMode === 'si-en'
                  ? activeTopic.titleSiEn
                  : activeTopic.titleEn}
              </h3>
              <div className="text-[11px] font-mono text-cyan-400 mt-0.5">
                {activeTopic.subtitle}
              </div>
            </div>

            {activeTopic.keyEquation && (
              <div className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto">
                {activeTopic.keyEquation}
              </div>
            )}

            <p className="text-xs text-slate-200 leading-relaxed">
              {languageMode === 'si-en' ? tierContent.siEn : tierContent.en}
            </p>

            <ul className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
              {(languageMode === 'si-en'
                ? tierContent.bulletPointsSiEn
                : tierContent.bulletPointsEn
              ).map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-snug">
                  <span className="text-cyan-400 font-mono">·</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </aside>
  );
};
