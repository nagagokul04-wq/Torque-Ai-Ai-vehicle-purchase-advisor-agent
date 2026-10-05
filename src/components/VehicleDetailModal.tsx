import React from 'react';
import { Vehicle } from '../types/vehicle';
import { X, ShieldAlert, Sparkles, CheckCircle2, TrendingDown, Fuel, ArrowRight } from 'lucide-react';

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSelectForAudit: (v: Vehicle) => void;
  onOpenAdvisorWithContext: (prompt: string) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  onClose,
  onSelectForAudit,
  onOpenAdvisorWithContext,
}) => {
  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header with image */}
        <div className="relative aspect-[16/9] w-full max-h-64 overflow-hidden bg-slate-950 shrink-0">
          <img
            src={vehicle.imageUrl}
            alt={vehicle.model}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-slate-950/80 p-2 text-slate-300 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                {vehicle.year} · {vehicle.powertrain} · {vehicle.bodyType}
              </div>
              <h2 className="text-2xl font-bold text-white">
                {vehicle.make} {vehicle.model}
              </h2>
              <p className="text-xs text-slate-300">{vehicle.trim} · {vehicle.drivetrain}</p>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400">Window MSRP</span>
              <div className="text-xl font-bold font-mono tabular-nums text-white">
                ${vehicle.msrp.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable details */}
        <div className="overflow-y-auto p-6 space-y-6 text-xs">
          {/* Key Specs Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div>
              <span className="text-slate-500">Range / MPG</span>
              <p className="font-semibold text-white font-mono mt-0.5">{vehicle.rangeOrMpg}</p>
            </div>
            <div>
              <span className="text-slate-500">Performance</span>
              <p className="font-semibold text-white font-mono mt-0.5">
                {vehicle.horsepower} hp · {vehicle.acceleration0to60}s (0-60)
              </p>
            </div>
            <div>
              <span className="text-slate-500">Cargo Volume</span>
              <p className="font-semibold text-white font-mono mt-0.5">{vehicle.cargoSpaceCuFt} cu ft</p>
            </div>
            <div>
              <span className="text-slate-500">5Y Resale Value</span>
              <p className="font-semibold text-emerald-400 font-mono mt-0.5">
                {100 - vehicle.fiveYearDepreciationPercent}% Retained
              </p>
            </div>
          </div>

          {/* Highlights & Target Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
              <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
                Target Negotiation Benchmark
              </h4>
              <p className="text-emerald-400 font-semibold font-mono text-sm">
                {vehicle.recommendedTargetDiscount}
              </p>
              <p className="text-slate-400 text-[11px]">
                Dealer invoice estimate: <span className="font-mono text-white">${vehicle.invoiceEstimate.toLocaleString()}</span>. Never pay above this unless market supply is strictly restricted.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-4 space-y-2">
              <h4 className="font-semibold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Known Dealer Markup Traps</span>
              </h4>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {vehicle.popularAddonTraps.map((trap, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-amber-400">&bull;</span>
                    <span>{trap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Warranty & Safety */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-2">
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              Safety & Factory Warranty Terms
            </h4>
            <div className="flex flex-wrap items-center gap-6 text-slate-300">
              <div>
                <span className="text-slate-500">Safety Rating: </span>
                <span className="font-medium text-white">{vehicle.safetyRating}</span>
              </div>
              <span className="text-slate-700">·</span>
              <div>
                <span className="text-slate-500">Bumper-to-Bumper: </span>
                <span className="font-medium text-white">{vehicle.warrantyYearsBumper} Years</span>
              </div>
              <span className="text-slate-700">·</span>
              <div>
                <span className="text-slate-500">Powertrain/Battery: </span>
                <span className="font-medium text-white">{vehicle.warrantyYearsPowertrain} Years</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 p-4 shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenAdvisorWithContext(
                `Provide a complete negotiation strategy and dealership script for buying a ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}. What factory rebates, dealer holdbacks, and finance terms should I demand?`
              );
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate Strategy in Advisor Room</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onSelectForAudit(vehicle);
              }}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors"
            >
              Audit Quote on this Model
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
