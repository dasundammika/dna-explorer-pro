/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TopNavigation } from './components/TopNavigation';
import { LeftLaboratorySidebar } from './components/LeftLaboratorySidebar';
import { MolecularScene } from './components/MolecularScene';
import { RightScientificInspector } from './components/RightScientificInspector';
import { BottomControlDock } from './components/BottomControlDock';
import { TutorialModal } from './components/TutorialModal';
import { useDNAStore } from './store/useDNAStore';

export default function App() {
  const labMode = useDNAStore((s) => s.labMode);
  const representationMode = useDNAStore((s) => s.representationMode);

  return (
    <div
      className="w-screen h-screen flex flex-col overflow-hidden bg-[#07090e] text-slate-100 select-none"
      data-lab-mode={labMode}
      data-representation-mode={representationMode}
    >
      {/* Top Navigation & Specimen Bar */}
      <TopNavigation />

      {/* Main 3-Column Scientific Workbench */}
      <main className="relative flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar: 8-Module Molecular Laboratory */}
        <LeftLaboratorySidebar />

        {/* Center Stage: Real-Time 3D Molecular Viewport + Collapsible Bottom Dock */}
        <div className="relative flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <MolecularScene />
          <BottomControlDock />
        </div>

        {/* Right Sidebar: Context-Aware Scientific Inspector & Bilingual Learning Lab */}
        <RightScientificInspector />
      </main>

      {/* Scientific Instrument Guide Modal */}
      <TutorialModal />
    </div>
  );
}
