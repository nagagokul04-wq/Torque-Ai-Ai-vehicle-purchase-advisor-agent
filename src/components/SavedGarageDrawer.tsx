import React from 'react';
import { Vehicle } from '../types/vehicle';
import { VEHICLE_CATALOG } from '../data/vehicles';
import { X, Trash2, ArrowRight, Bookmark } from 'lucide-react';

interface SavedGarageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedIds: string[];
  onRemoveSaved: (id: string) => void;
  onSelectVehicleForAudit: (v: Vehicle) => void;
  onAddToCompare: (v: Vehicle) => void;
}

export const SavedGarageDrawer: React.FC<SavedGarageDrawerProps> = ({
  isOpen,
  onClose,
  savedIds,
  onRemoveSaved,
  onSelectVehicleForAudit,
  onAddToCompare,
}) => {
  if (!isOpen) return null;

  const savedVehicles = VEHICLE_CATALOG.filter((v) => savedIds.includes(v.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Your Saved Garage</h3>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-mono text-cyan-400">
              {savedVehicles.length}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {savedVehicles.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500 space-y-2">
              <Bookmark className="mx-auto h-8 w-8 text-slate-700" />
              <p>Your garage is currently empty.</p>
              <p className="text-[11px] text-slate-600">
                Click the bookmark icon on any vehicle card to save it for quick review and comparison.
              </p>
            </div>
          ) : (
            savedVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3"
              >
                <div className="flex gap-3">
                  <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-900">
                    <img
                      src={vehicle.imageUrl}
                      alt={vehicle.model}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">{vehicle.powertrain}</span>
                      <button
                        onClick={() => onRemoveSaved(vehicle.id)}
                        className="text-slate-500 hover:text-rose-400"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-white truncate">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h4>
                    <p className="text-xs font-mono tabular-nums text-cyan-400 font-semibold mt-0.5">
                      ${vehicle.msrp.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      onClose();
                      onSelectVehicleForAudit(vehicle);
                    }}
                    className="rounded-lg bg-slate-800 py-1.5 text-xs text-slate-200 hover:bg-slate-700 text-center transition-colors"
                  >
                    Audit Quote
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onAddToCompare(vehicle);
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-900 py-1.5 text-xs text-cyan-300 hover:border-cyan-500 text-center transition-colors"
                  >
                    + Compare
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedVehicles.length > 0 && (
          <div className="border-t border-slate-800 p-5 bg-slate-950">
            <button
              onClick={() => {
                window.print();
              }}
              className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Export / Print Saved Summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
