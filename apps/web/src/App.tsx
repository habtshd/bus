import React, { useState } from 'react';
import { Navbar, AppTab } from './components/Navbar';
import { PassengerPortal } from './components/PassengerPortal';
import { AgentCounterPOS } from './components/AgentCounterPOS';
import { OperationsDispatcher } from './components/OperationsDispatcher';
import { CheckpointManifestView } from './components/CheckpointManifestView';
import { ConductorBoardingScanner } from './components/ConductorBoardingScanner';
import { ManagementDashboard } from './components/ManagementDashboard';

export function App() {
  const [currentTab, setTab] = useState<AppTab>('passenger');
  const [isAmharic, setIsAmharic] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className={isAmharic ? 'lang-am' : ''}>
      <Navbar
        currentTab={currentTab}
        setTab={setTab}
        isAmharic={isAmharic}
        setIsAmharic={setIsAmharic}
      />

      <main style={{ flex: 1 }}>
        {currentTab === 'passenger' && <PassengerPortal isAmharic={isAmharic} />}
        {currentTab === 'agent' && <AgentCounterPOS isAmharic={isAmharic} />}
        {currentTab === 'dispatch' && <OperationsDispatcher isAmharic={isAmharic} />}
        {currentTab === 'manifest' && <CheckpointManifestView isAmharic={isAmharic} />}
        {currentTab === 'conductor' && <ConductorBoardingScanner isAmharic={isAmharic} />}
        {currentTab === 'analytics' && <ManagementDashboard isAmharic={isAmharic} />}
      </main>

      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        background: '#0B0F19'
      }}>
        <div>Abyssinia Intercity Bus Platform © 2026. All rights reserved.</div>
        <div style={{ marginTop: '4px' }}>
          Supports Ethiopian National ID / Kebele Manifests, Telebirr, CBE Birr, Chapa, and Counter Thermal Printing.
        </div>
      </footer>
    </div>
  );
}

export default App;
