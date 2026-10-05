import React, { useState } from 'react';
import { Vehicle } from '../types/vehicle';
import { VEHICLE_CATALOG } from '../data/vehicles';
import { Sparkles, Trash2, Plus, ArrowRight, ShieldCheck } from 'lucide-react';

interface ComparisonDashboardProps {
  comparedIds: string[];
  onRemoveFromCompare: (id: string) => void;
  onAddVehicleToCompare: (id: string) => void;
  onOpenAdvisorWithContext: (prompt: string) => void;
}

export const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({
  comparedIds,
  onRemoveFromCompare,
  onAddVehicleToCompare,
  onOpenAdvisorWithContext,
}) => {
  // Ensure at least 2 vehicles are present for initial view
  const activeIds = comparedIds.length > 0 ? comparedIds : [VEHICLE_CATALOG[0].id, VEHICLE_CATALOG[2].id];
  const comparedVehicles = VEHICLE_CATALOG.filter((v) => activeIds.includes(v.id));

  const availableToAdd = VEHICLE_CATALOG.filter((v) => !activeIds.includes(v.id));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Side-By-Side Technical & Financial Benchmark
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
              Automotive Comparison Matrix
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Evaluate real-world capability, 5-year depreciation, and warranty coverage across up to 4 shortlisted models.
            </p>
          </div>

          {availableToAdd.length > 0 && activeIds.length < 4 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">+ Add Vehicle:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onAddVehicleToCompare(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="" disabled>
                  Select from catalog...
                </option>
                {availableToAdd.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.year} {v.make} {v.model}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <table className="w-full min-w-[700px] border-collapse text-left text-xs">
          <thead>
            <tr>
              <th className="w-1/4 pb-4 font-semibold text-slate-400 border-b border-slate-800">
                Specification & Metric
              </th>
              {comparedVehicles.map((v) => (
                <th key={v.id} className="pb-4 px-4 border-b border-slate-800 align-top">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] text-slate-500">{v.year} · {v.powertrain}</span>
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {v.make} {v.model}
                      </h4>
                      <p className="text-[11px] text-slate-400">{v.trim}</p>
                    </div>
                    {comparedVehicles.length > 1 && (
                      <button
                        onClick={() => onRemoveFromCompare(v.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Remove from comparison"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {/* Visual Photo Row */}
            <tr>
              <td className="py-4 font-medium text-slate-400">Exterior Profile</td>
              {comparedVehicles.map((v) => (
                <td key={v.id} className="py-4 px-4">
                  <div className="aspect-[4/3] w-full max-w-[220px] overflow-hidden rounded-xl bg-slate-950 border border-slate-800">
                    <img
                      src={v.imageUrl}
                      alt={v.model}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </td>
              ))}
            </tr>

            {/* MSRP */}
            <tr>
              <td className="py-3 font-medium text-slate-400">Window MSRP</td>
              {comparedVehicles.map((v) => (
                <td key={v.id} className="py-3 px-4 font-mono tabular-nums text-sm font-bold text-white">
                  ${v.msrp.toLocaleString()}
                </td>
              ))}
            </tr>

            {/* Target Fair Price */}
            <tr>
              <td className="py-3 font-medium text-slate-400">Target Fair Discount Price</td>
              {comparedVehicles.map((v) => (
                <td key={v.id} className="py-3 px-4 font-mono tabular-nums text-emerald-400 font-semibold">
                  ~${v.invoiceEstimate.toLocaleString()}
                </td>
              ))}
            </tr>

            {/* Range / Fuel Economy */}
            <tr>
              <td className="py-3 font-medium text-slate-400">Range / Efficiency</td>
              {comparedVehicles.map((v) => (
                <td key={v.id} className="py-3 px-4 font-mono text-cyan-300 font-medium">
                  {v.rangeOrMpg}
                </td>
              ))}
            </tr>

            {/* Performance (0-60 & Horsepower) */}
            <tr>
              <td className="py-3 font-medium text-slate-400">Horsepower & 0-60 mph</td>
              {comparedVehicles.map((v) => (
                <td key={v.id} className="py-3 px-4">
                  <span className="font-mono text-white font-semibold">{v.horsepower} hp</span>
                  <span className="text-slate-400 ml-1.5 font-mono">({v.acceleration0to60}s)</span>
                </td>
              ))}
            </tr>

            {/* Drivetrain & Cargo */}
            <tr>
              <td className="py-3 font-medium text-slate-400">Drivetrain & Cargo Space</td>
              {comparedVehicles.map((v) => (
                <td key={v.id} className="py-3 px-4 text-slate-300">
                  <span>{v.drivetrain}</span>
                  <span className="mx-1.5 text-slate-600">·</span>
                  <span className="font-mono">{v.cargoSpaceCuFt} cu ft</span>
                </td>
              ))}
            </tr>

            {/* 5-Year Resale Retention */}
            <tr>
              <td className="py-3 font-medium text-slate-400">5-Year Depreciation Loss</td>
              {comparedVehicles.map((v) => (
                <td key={v.id} className="py-3 px-4">
                  <span className={`font-mono font-semibold ${
                    v.fiveYearDepreciationPercent <= 35
                      ? 'text-emerald-400'
                      : v.fiveYearDepreciationPercent <= 45
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}>
                    -{v.fiveYearDepreciationPercent}%
                  </span>
                  <span className="text-[11px] text-slate-500 ml-1">
                    (Retains {100 - v.fiveYearDepreciationPercent}%)
                  </span>
                </td>
              ))}
            </tr>

            {/* Annual Fuel + Insurance */}
            <tr>
              <td className="py-3 font-medium text-slate-400">Annual Energy + Insurance</td>
              {comparedVehicles.map((v) => (
                <td key={v.id} className="py-3 px-4 font-mono tabular-nums text-slate-300">
                  ${(v.annualFuelEstimate + v.annualInsuranceEstimate).toLocaleString()}/yr
                </td>
              ))}
            </tr>

            {/* Warranty Coverage */}
            <tr>
              <td className="py-3 font-medium text-slate-400">Warranty (Bumper / Powertrain)</td>
              {comparedVehicles.map((v) => (
                <td key={v.id} className="py-3 px-4 text-slate-300">
                  {v.warrantyYearsBumper} yr / {v.warrantyYearsPowertrain} yr
                </td>
              ))}
            </tr>

            {/* Safety Rating */}
            <tr>
              <td className="py-3 font-medium text-slate-400">Safety Rating</td>
              {comparedVehicles.map((v) => (
                <td key={v.id} className="py-3 px-4 text-slate-200 font-medium">
                  {v.safetyRating}
                </td>
              ))}
            </tr>

            {/* Common Dealer Markup Traps */}
            <tr>
              <td className="py-3 font-medium text-slate-400">Dealer Markup Traps to Avoid</td>
              {comparedVehicles.map((v) => (
                <td key={v.id} className="py-3 px-4 text-[11px] text-amber-300/90 space-y-1">
                  {v.popularAddonTraps.map((trap, i) => (
                    <div key={i}>&bull; {trap}</div>
                  ))}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Head-to-Head AI Consultation Banner */}
      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Need an Executive AI Tie-Breaker?</span>
          </h3>
          <p className="mt-1 text-xs text-slate-300">
            Ask TorqueAI to evaluate these {comparedVehicles.length} vehicles against your specific commute, garage setup, and 5-year budget.
          </p>
        </div>

        <button
          onClick={() => {
            const names = comparedVehicles.map((v) => `${v.make} ${v.model}`).join(' vs ');
            onOpenAdvisorWithContext(
              `Conduct an in-depth head-to-head decision showdown between ${names}. Which vehicle is the smarter financial and daily-driving decision, and what are the specific dealer pitfalls for each?`
            );
          }}
          className="rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0"
        >
          <span>Run Head-to-Head AI Debate</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
