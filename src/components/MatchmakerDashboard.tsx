import React, { useState } from 'react';
import { Vehicle, PowertrainType, MatchRecommendation } from '../types/vehicle';
import { VEHICLE_CATALOG } from '../data/vehicles';
import { Sparkles, SlidersHorizontal, ArrowUpDown, Bookmark, Check, ShieldCheck, Zap, Fuel, ArrowRight, Info } from 'lucide-react';

interface MatchmakerDashboardProps {
  onSelectVehicleForAudit: (v: Vehicle) => void;
  onAddToCompare: (v: Vehicle) => void;
  comparedIds: string[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onOpenAdvisorWithContext: (prompt: string) => void;
  onViewDetails: (v: Vehicle) => void;
}

export const MatchmakerDashboard: React.FC<MatchmakerDashboardProps> = ({
  onSelectVehicleForAudit,
  onAddToCompare,
  comparedIds,
  savedIds,
  onToggleSave,
  onOpenAdvisorWithContext,
  onViewDetails,
}) => {
  const [selectedPowertrain, setSelectedPowertrain] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(65000);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'efficiency' | 'resale'>('price-asc');
  
  // AI Matchmaker Wizard States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardBudget, setWizardBudget] = useState(55000);
  const [wizardUse, setWizardUse] = useState('Daily commute & family weekend trips');
  const [wizardCommute, setWizardCommute] = useState(35);
  const [wizardCharging, setWizardCharging] = useState(true);
  const [wizardPassengers, setWizardPassengers] = useState(5);
  const [wizardWinter, setWizardWinter] = useState(false);
  const [wizardPriorities, setWizardPriorities] = useState<string[]>(['Low 5-year cost', 'High reliability']);
  const [wizardLoading, setWizardLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<MatchRecommendation[] | null>(null);

  const togglePriority = (p: string) => {
    setWizardPriorities((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleRunMatchmaker = async () => {
    setWizardLoading(true);
    try {
      const response = await fetch('/api/advisor/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: wizardBudget,
          primaryUse: wizardUse,
          dailyCommuteMiles: wizardCommute,
          hasHomeCharging: wizardCharging,
          passengers: wizardPassengers,
          winterDriving: wizardWinter,
          priorities: wizardPriorities,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWizardLoading(false);
    }
  };

  // Filter catalog
  const filteredVehicles = VEHICLE_CATALOG.filter((v) => {
    if (selectedPowertrain !== 'All' && v.powertrain !== selectedPowertrain) return false;
    if (v.msrp > maxPrice) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.msrp - b.msrp;
    if (sortBy === 'price-desc') return b.msrp - a.msrp;
    if (sortBy === 'resale') return a.fiveYearDepreciationPercent - b.fiveYearDepreciationPercent; // lower depreciation is better
    if (sortBy === 'efficiency') return a.annualFuelEstimate - b.annualFuelEstimate; // lower annual fuel is better
    return 0;
  });

  return (
    <div className="space-y-10">
      {/* Editorial Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_vehicle_advisor_1791178385357.jpg"
            alt="TorqueAI Automotive Studio"
            className="h-full w-full object-cover opacity-25"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        </div>

        <div className="relative z-10 p-8 sm:p-12 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Buyer-Side Automotive Advocate</span>
          </div>

          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans leading-tight">
            Stop Overpaying at Dealerships. Meet Your Intelligent Vehicle Advisor.
          </h1>

          <p className="mt-3 text-base text-slate-300 leading-relaxed">
            TorqueAI models the true 5-year cost of ownership, exposes hidden dealer fee markups, and crafts data-driven counter-offer scripts to save you thousands before you sign.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 hover:bg-cyan-500 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch AI Matchmaker</span>
            </button>
            <button
              onClick={() =>
                onOpenAdvisorWithContext(
                  'What are the 5 biggest financial mistakes buyers make when buying a new or used vehicle today?'
                )
              }
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-500 transition-colors"
            >
              <span>Ask Advisor Top 5 Mistakes</span>
            </button>
          </div>

          {/* Clean Unboxed Metadata Proof Stats */}
          <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-slate-800/80 pt-6 text-xs text-slate-400">
            <div>
              <span className="font-mono tabular-nums text-base font-bold text-white">$3,420</span>
              <span className="ml-1.5 text-slate-400">Avg. Identified Junk Add-ons</span>
            </div>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <div>
              <span className="font-mono tabular-nums text-base font-bold text-white">5-Year TCO</span>
              <span className="ml-1.5 text-slate-400">Depreciation & Energy Modeling</span>
            </div>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <div>
              <span className="font-mono tabular-nums text-base font-bold text-cyan-400">100% Unbiased</span>
              <span className="ml-1.5 text-slate-400">Zero Dealer Referral Kickbacks</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations Panel (if generated) */}
      {recommendations && recommendations.length > 0 && (
        <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/80 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Personalized Recommendation Matrix
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Top Tailored Matches for Your Commute & Budget
              </h2>
            </div>
            <button
              onClick={() => setRecommendations(null)}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Close AI Summary
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <div
                key={rec.rank}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-cyan-400">Rank #{rec.rank}</span>
                    <span className="font-mono tabular-nums text-emerald-400 font-semibold">
                      {rec.matchScore}% Match
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{rec.makeModel}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    <span>{rec.recommendedTrim}</span>
                    <span className="mx-1.5">·</span>
                    <span className="font-mono tabular-nums">${rec.startingMSRP.toLocaleString()}</span>
                  </div>

                  <p className="mt-3 text-xs text-slate-300 leading-relaxed">{rec.whyItWins}</p>

                  <div className="mt-3 space-y-1.5 text-[11px]">
                    <div className="text-slate-400">
                      <span className="font-medium text-slate-300">5Y TCO: </span>
                      {rec.fiveYearTcoVerdict}
                    </div>
                    <div className="text-slate-400">
                      <span className="font-medium text-emerald-400">Target Fair Price: </span>
                      <span className="font-mono tabular-nums text-white">
                        ${rec.targetNegotiatedPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    onOpenAdvisorWithContext(
                      `I'm interested in the ${rec.makeModel} (${rec.recommendedTrim}). You recommended it with a ${rec.matchScore}% match. What specific dealer negotiation leverage points and manufacturer incentives should I use?`
                    )
                  }
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 py-2 text-xs font-medium text-cyan-300 hover:border-cyan-500 hover:text-white transition-colors"
                >
                  <span>Negotiation Playbook</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Powertrain Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-950 rounded-xl border border-slate-800/80">
            {(['All', 'EV', 'Hybrid', 'PHEV', 'Gas'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedPowertrain(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedPowertrain === type
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type === 'All' ? 'All Powertrains' : type}
              </button>
            ))}
          </div>

          {/* Sliders and Sorters */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Max MSRP:</span>
              <span className="font-mono tabular-nums font-semibold text-white">
                ${maxPrice.toLocaleString()}
              </span>
              <input
                type="range"
                min={35000}
                max={75000}
                step={2500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-28 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="efficiency">Lowest Annual Fuel Cost</option>
                <option value="resale">Best 5-Yr Resale Retention</option>
              </select>
            </div>

            <button
              onClick={() => setIsWizardOpen(true)}
              className="ml-auto rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors flex items-center gap-1.5"
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span>Advisor Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const isSaved = savedIds.includes(vehicle.id);
          const isCompared = comparedIds.includes(vehicle.id);

          return (
            <div
              key={vehicle.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/60 transition-all hover:border-slate-700 hover:shadow-xl hover:shadow-slate-950/50"
            >
              <div>
                {/* Vehicle Image with Measured Scrim and Fallback */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                  <img
                    src={vehicle.imageUrl}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback gradient if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />

                  {/* Bookmark Button */}
                  <button
                    onClick={() => onToggleSave(vehicle.id)}
                    className="absolute top-3 right-3 rounded-full bg-slate-950/70 p-2 text-slate-300 backdrop-blur-md hover:text-white transition-colors"
                    title={isSaved ? 'Remove from Saved Garage' : 'Save to Garage'}
                  >
                    <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                  </button>

                  {/* Bottom Image Overlay Info */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                    <span className="font-semibold">{vehicle.drivetrain}</span>
                    <span className="font-mono tabular-nums text-cyan-300">{vehicle.rangeOrMpg}</span>
                  </div>
                </div>

                {/* Card Content: Zero-pill discipline */}
                <div className="p-5 space-y-3">
                  <div>
                    {/* Unboxed Metadata Header */}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{vehicle.year}</span>
                      <span aria-hidden="true">·</span>
                      <span>{vehicle.powertrain}</span>
                      <span aria-hidden="true">·</span>
                      <span>{vehicle.bodyType}</span>
                    </div>

                    <h3 className="mt-1 text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-xs text-slate-400">{vehicle.trim}</p>
                  </div>

                  {/* Pricing row with Tabular Figures */}
                  <div className="flex items-baseline justify-between border-t border-slate-800/80 pt-3">
                    <div>
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider">Base MSRP</span>
                      <div className="text-base font-bold font-mono tabular-nums text-white">
                        ${vehicle.msrp.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider">Target Fair Price</span>
                      <div className="text-xs font-mono tabular-nums text-emerald-400 font-semibold">
                        ~${vehicle.invoiceEstimate.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Key Highlights */}
                  <ul className="space-y-1 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                    {vehicle.keyHighlights.slice(0, 2).map((hl, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 mt-0.5">&bull;</span>
                        <span className="truncate">{hl}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Watchout / Markup Trap teaser */}
                  <div className="text-[11px] text-amber-300/90 bg-amber-950/20 rounded-lg p-2 border border-amber-900/30">
                    <span className="font-semibold text-amber-400">Advisor Watchout: </span>
                    {vehicle.popularAddonTraps[0]}
                  </div>
                </div>
              </div>

              {/* Card Actions Bottom Bar */}
              <div className="p-5 pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectVehicleForAudit(vehicle)}
                    className="rounded-lg bg-slate-800 py-2 text-xs font-medium text-cyan-300 hover:bg-slate-700 transition-colors text-center"
                  >
                    Audit Quote
                  </button>
                  <button
                    onClick={() => onAddToCompare(vehicle)}
                    className={`rounded-lg py-2 text-xs font-medium transition-colors text-center border ${
                      isCompared
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                        : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {isCompared ? 'In Comparison' : '+ Compare'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={() => onViewDetails(vehicle)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Full Specs & TCO
                  </button>
                  <button
                    onClick={() =>
                      onOpenAdvisorWithContext(
                        `What are the secret dealer holdbacks, incentives, and recommended discount strategy for a ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}?`
                      )
                    }
                    className="text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Ask Agent &rarr;
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Matchmaker Modal / Wizard Drawer */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">AI Vehicle Matchmaker Wizard</h3>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Budget */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Target Purchase Budget: <span className="text-cyan-400 font-mono">${wizardBudget.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={30000}
                  max={85000}
                  step={2500}
                  value={wizardBudget}
                  onChange={(e) => setWizardBudget(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Primary Use */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Primary Lifestyle & Use Case</label>
                <input
                  type="text"
                  value={wizardUse}
                  onChange={(e) => setWizardUse(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Commute & Passengers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Daily Commute (Miles)</label>
                  <input
                    type="number"
                    value={wizardCommute}
                    onChange={(e) => setWizardCommute(parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Passengers Needed</label>
                  <select
                    value={wizardPassengers}
                    onChange={(e) => setWizardPassengers(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value={5}>5 Passengers</option>
                    <option value={6}>6 Passengers</option>
                    <option value={7}>7+ Passengers</option>
                  </select>
                </div>
              </div>

              {/* Home Charging & Winter */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wizardCharging}
                    onChange={(e) => setWizardCharging(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                  />
                  <span className="text-slate-300">Can charge EV at home/work</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wizardWinter}
                    onChange={(e) => setWizardWinter(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                  />
                  <span className="text-slate-300">Harsh winter / snow climate</span>
                </label>
              </div>

              {/* Priorities */}
              <div>
                <label className="block font-medium text-slate-300 mb-2">Buyer Priorities (Pick 2-3):</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Low 5-year cost',
                    'High reliability',
                    'Top safety rating',
                    'Fast DC charging',
                    'Maximum cargo volume',
                    'Strong resale value',
                    'Sporty acceleration',
                  ].map((p) => {
                    const active = wizardPriorities.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePriority(p)}
                        className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                          active
                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsWizardOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleRunMatchmaker();
                  setIsWizardOpen(false);
                }}
                disabled={wizardLoading}
                className="rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-md disabled:opacity-50"
              >
                {wizardLoading ? 'Analyzing...' : 'Generate AI Matches'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
