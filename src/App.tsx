/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, DashboardTab } from './components/Navbar';
import { MatchmakerDashboard } from './components/MatchmakerDashboard';
import { QuoteAuditorDashboard } from './components/QuoteAuditorDashboard';
import { TcoDashboard } from './components/TcoDashboard';
import { ComparisonDashboard } from './components/ComparisonDashboard';
import { AdvisorChat } from './components/AdvisorChat';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { SavedGarageDrawer } from './components/SavedGarageDrawer';
import { Vehicle } from './types/vehicle';
import { VEHICLE_CATALOG } from './data/vehicles';
import { ShieldCheck, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('matchmaker');

  // Shortlist / Saved garage state
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('torqueai_saved_ids');
      return stored ? JSON.parse(stored) : [VEHICLE_CATALOG[0].id, VEHICLE_CATALOG[2].id];
    } catch {
      return [VEHICLE_CATALOG[0].id, VEHICLE_CATALOG[2].id];
    }
  });

  // Compared vehicles state
  const [comparedIds, setComparedIds] = useState<string[]>([
    VEHICLE_CATALOG[0].id,
    VEHICLE_CATALOG[2].id,
  ]);

  // Modal and drawer states
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);
  const [isGarageOpen, setIsGarageOpen] = useState(false);

  // Contextual prompt routing to Advisor War Room
  const [advisorInitialPrompt, setAdvisorInitialPrompt] = useState<string | null>(null);

  // Synchronize savedIds with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('torqueai_saved_ids', JSON.stringify(savedIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedIds]);

  const handleToggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddToCompare = (v: Vehicle) => {
    setComparedIds((prev) => {
      if (prev.includes(v.id)) return prev;
      if (prev.length >= 4) {
        return [...prev.slice(1), v.id]; // keep max 4
      }
      return [...prev, v.id];
    });
    setActiveTab('compare');
  };

  const handleRemoveFromCompare = (id: string) => {
    setComparedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleSelectVehicleForAudit = (v: Vehicle) => {
    setActiveTab('auditor');
  };

  const handleOpenAdvisorWithContext = (prompt: string) => {
    setAdvisorInitialPrompt(prompt);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top 3-Zone Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedIds.length}
        onOpenSaved={() => setIsGarageOpen(true)}
        onOpenAdvisor={() => setActiveTab('chat')}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'matchmaker' && (
          <MatchmakerDashboard
            onSelectVehicleForAudit={handleSelectVehicleForAudit}
            onAddToCompare={handleAddToCompare}
            comparedIds={comparedIds}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onOpenAdvisorWithContext={handleOpenAdvisorWithContext}
            onViewDetails={(v) => setDetailVehicle(v)}
          />
        )}

        {activeTab === 'auditor' && (
          <QuoteAuditorDashboard
            onOpenAdvisorWithContext={handleOpenAdvisorWithContext}
          />
        )}

        {activeTab === 'tco' && (
          <TcoDashboard
            onOpenAdvisorWithContext={handleOpenAdvisorWithContext}
          />
        )}

        {activeTab === 'compare' && (
          <ComparisonDashboard
            comparedIds={comparedIds}
            onRemoveFromCompare={handleRemoveFromCompare}
            onAddVehicleToCompare={(id) => setComparedIds((prev) => [...prev, id])}
            onOpenAdvisorWithContext={handleOpenAdvisorWithContext}
          />
        )}

        {activeTab === 'chat' && (
          <AdvisorChat
            initialPrompt={advisorInitialPrompt}
            onClearInitialPrompt={() => setAdvisorInitialPrompt(null)}
          />
        )}
      </main>

      {/* Vehicle Deep Dive Modal */}
      <VehicleDetailModal
        vehicle={detailVehicle}
        onClose={() => setDetailVehicle(null)}
        onSelectForAudit={handleSelectVehicleForAudit}
        onOpenAdvisorWithContext={handleOpenAdvisorWithContext}
      />

      {/* Saved Garage Drawer */}
      <SavedGarageDrawer
        isOpen={isGarageOpen}
        onClose={() => setIsGarageOpen(false)}
        savedIds={savedIds}
        onRemoveSaved={handleToggleSave}
        onSelectVehicleForAudit={handleSelectVehicleForAudit}
        onAddToCompare={handleAddToCompare}
      />

      {/* Clean Domain Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">TorqueAI</span>
            <span>·</span>
            <span>Buyer-Side Automotive Intelligence & Purchase Advisory Agent</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() =>
                handleOpenAdvisorWithContext(
                  'What are the state statutory limits on dealer documentation fees across California, Texas, Florida, and New York?'
                )
              }
              className="hover:text-cyan-400 transition-colors"
            >
              Doc Fee Limits by State
            </button>
            <span>·</span>
            <button
              onClick={() =>
                handleOpenAdvisorWithContext(
                  'How does the federal $7,500 clean vehicle tax credit work for 2026 EV leases versus purchases?'
                )
              }
              className="hover:text-cyan-400 transition-colors"
            >
              EV Tax Credit Guide
            </button>
            <span>·</span>
            <span>Zero Dealer Kickbacks</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
