import React, { useState } from 'react';
import { VEHICLE_CATALOG } from '../data/vehicles';
import { Vehicle } from '../types/vehicle';
import { DollarSign, TrendingDown, Fuel, Shield, Wrench, Percent, Info, ArrowRight } from 'lucide-react';

interface TcoDashboardProps {
  onOpenAdvisorWithContext: (prompt: string) => void;
}

export const TcoDashboard: React.FC<TcoDashboardProps> = ({ onOpenAdvisorWithContext }) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(VEHICLE_CATALOG[0].id);
  const [annualMiles, setAnnualMiles] = useState<number>(13500);
  const [gasPricePerGal, setGasPricePerGal] = useState<number>(3.65);
  const [electricPricePerKwh, setElectricPricePerKwh] = useState<number>(0.16);

  // Financing vs Lease Calculator state
  const [financeType, setFinanceType] = useState<'loan' | 'lease'>('loan');
  const [downPayment, setDownPayment] = useState<number>(5000);
  const [loanTerm, setLoanTerm] = useState<number>(60);
  const [apr, setApr] = useState<number>(5.9);
  const [leaseTerm, setLeaseTerm] = useState<number>(36);
  const [leaseMoneyFactor, setLeaseMoneyFactor] = useState<number>(0.0021); // ~5.04% APR
  const [leaseResidualPercent, setLeaseResidualPercent] = useState<number>(58);

  const vehicle = VEHICLE_CATALOG.find((v) => v.id === selectedVehicleId) || VEHICLE_CATALOG[0];

  // 5-Year TCO calculations
  // 1. Depreciation: vehicle.msrp * (fiveYearDepreciationPercent / 100)
  const depreciationCost = Math.round(vehicle.msrp * (vehicle.fiveYearDepreciationPercent / 100));

  // 2. Fuel / Energy across 5 years
  // EV: ~3.3 miles per kWh -> (annualMiles / 3.3) * electricPricePerKwh * 5
  // Gas: ~28 MPG -> (annualMiles / 28) * gasPricePerGal * 5
  // Hybrid: ~40 MPG -> (annualMiles / 40) * gasPricePerGal * 5
  // PHEV: 60% EV, 40% Hybrid
  let annualFuelCost = vehicle.annualFuelEstimate;
  if (vehicle.powertrain === 'EV') {
    annualFuelCost = Math.round((annualMiles / 3.4) * electricPricePerKwh);
  } else if (vehicle.powertrain === 'Hybrid') {
    annualFuelCost = Math.round((annualMiles / 38) * gasPricePerGal);
  } else if (vehicle.powertrain === 'PHEV') {
    const evMiles = annualMiles * 0.65;
    const gasMiles = annualMiles * 0.35;
    annualFuelCost = Math.round((evMiles / 3.2) * electricPricePerKwh + (gasMiles / 38) * gasPricePerGal);
  } else {
    annualFuelCost = Math.round((annualMiles / 25) * gasPricePerGal);
  }
  const fiveYearFuelCost = annualFuelCost * 5;

  // 3. Insurance across 5 years
  const fiveYearInsurance = vehicle.annualInsuranceEstimate * 5;

  // 4. Maintenance, Tires & Repairs
  // EVs have no oil changes/spark plugs, but heavier tire wear
  const annualMaint = vehicle.powertrain === 'EV' ? 550 : vehicle.powertrain === 'Hybrid' ? 700 : 920;
  const fiveYearMaint = annualMaint * 5;

  // 5. Financing Interest (5-year estimate)
  const financedPrincipal = Math.max(0, vehicle.msrp - downPayment);
  const monthlyRate = apr / 100 / 12;
  const monthlyPayment =
    monthlyRate > 0 && loanTerm > 0
      ? (financedPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm))) /
        (Math.pow(1 + monthlyRate, loanTerm) - 1)
      : financedPrincipal / loanTerm;
  const totalLoanInterest = Math.max(0, Math.round(monthlyPayment * loanTerm - financedPrincipal));

  const totalFiveYearTco = depreciationCost + fiveYearFuelCost + fiveYearInsurance + fiveYearMaint + totalLoanInterest;
  const trueMonthlyCost = Math.round(totalFiveYearTco / 60);

  // Lease math
  // Cap Cost = vehicle.msrp
  // Residual Value = vehicle.msrp * (residual% / 100)
  // Depreciation per month = (Cap Cost - Down - Residual) / term
  // Finance Fee per month = (Cap Cost - Down + Residual) * MoneyFactor
  const leaseResidual = vehicle.msrp * (leaseResidualPercent / 100);
  const leaseNetCap = Math.max(0, vehicle.msrp - downPayment);
  const leaseMonthlyDeprec = Math.max(0, (leaseNetCap - leaseResidual) / leaseTerm);
  const leaseMonthlyFinance = (leaseNetCap + leaseResidual) * leaseMoneyFactor;
  const leaseMonthlyPayment = Math.round(leaseMonthlyDeprec + leaseMonthlyFinance);
  const leaseTotalOutOfPocket = Math.round(downPayment + leaseMonthlyPayment * leaseTerm);

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Automotive Financial Modeling
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
              5-Year Total Cost of Ownership & Loan vs. Lease Engine
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              The purchase price is only 52% of what a vehicle costs. Model depreciation, insurance, and energy costs to see true monthly burn.
            </p>
          </div>

          {/* Vehicle Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Focus Vehicle:</span>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
            >
              {VEHICLE_CATALOG.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.year} {v.make} {v.model} ({v.powertrain})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Primary 5-Year Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: TCO Overview Card & Component Stack (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Executive Summary Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-slate-400">True 5-Year Ownership Burden</span>
                <div className="text-3xl font-extrabold font-mono tabular-nums text-white mt-0.5">
                  ${totalFiveYearTco.toLocaleString()}
                </div>
                <div className="text-xs text-cyan-400 mt-1">
                  True Real-World Cost: <span className="font-mono font-bold">${trueMonthlyCost.toLocaleString()}/month</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6">
                <div>
                  <span className="text-slate-500">MSRP</span>
                  <p className="font-semibold text-white">${vehicle.msrp.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-500">Powertrain</span>
                  <p className="font-semibold text-cyan-300">{vehicle.powertrain}</p>
                </div>
                <div>
                  <span className="text-slate-500">5Y Resale</span>
                  <p className="font-semibold text-emerald-400">
                    {100 - vehicle.fiveYearDepreciationPercent}%
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Progress Stack Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Cost Component Composition</span>
                <span className="font-mono">{annualMiles.toLocaleString()} miles/yr</span>
              </div>
              <div className="flex h-3.5 w-full overflow-hidden rounded-lg bg-slate-950">
                <div
                  style={{ width: `${(depreciationCost / totalFiveYearTco) * 100}%` }}
                  className="bg-rose-500"
                  title="Depreciation"
                />
                <div
                  style={{ width: `${(fiveYearFuelCost / totalFiveYearTco) * 100}%` }}
                  className="bg-amber-500"
                  title="Energy / Fuel"
                />
                <div
                  style={{ width: `${(fiveYearInsurance / totalFiveYearTco) * 100}%` }}
                  className="bg-blue-500"
                  title="Insurance"
                />
                <div
                  style={{ width: `${(fiveYearMaint / totalFiveYearTco) * 100}%` }}
                  className="bg-purple-500"
                  title="Maintenance"
                />
                <div
                  style={{ width: `${(totalLoanInterest / totalFiveYearTco) * 100}%` }}
                  className="bg-cyan-500"
                  title="Finance Interest"
                />
              </div>
            </div>

            {/* 5-Year Itemized Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <div>
                    <span className="font-medium text-slate-200">Depreciation</span>
                    <p className="text-[11px] text-slate-500">Loss of vehicle value</p>
                  </div>
                </div>
                <span className="font-mono tabular-nums font-semibold text-white">
                  ${depreciationCost.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <div>
                    <span className="font-medium text-slate-200">Fuel / Electricity</span>
                    <p className="text-[11px] text-slate-500">
                      ${annualFuelCost.toLocaleString()}/yr est.
                    </p>
                  </div>
                </div>
                <span className="font-mono tabular-nums font-semibold text-white">
                  ${fiveYearFuelCost.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <div>
                    <span className="font-medium text-slate-200">Insurance Premiums</span>
                    <p className="text-[11px] text-slate-500">
                      ${vehicle.annualInsuranceEstimate.toLocaleString()}/yr tier
                    </p>
                  </div>
                </div>
                <span className="font-mono tabular-nums font-semibold text-white">
                  ${fiveYearInsurance.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                  <div>
                    <span className="font-medium text-slate-200">Tires & Maintenance</span>
                    <p className="text-[11px] text-slate-500">Routine service & brakes</p>
                  </div>
                </div>
                <span className="font-mono tabular-nums font-semibold text-white">
                  ${fiveYearMaint.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3 sm:col-span-2">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                  <div>
                    <span className="font-medium text-slate-200">Financing Interest Cost</span>
                    <p className="text-[11px] text-slate-500">{loanTerm} mo loan @ {apr}% APR</p>
                  </div>
                </div>
                <span className="font-mono tabular-nums font-semibold text-white">
                  ${totalLoanInterest.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Advisor TCO Insight */}
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 text-xs text-slate-300 flex items-start gap-3">
              <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-cyan-300">TorqueAI Ownership Strategy: </span>
                {vehicle.powertrain === 'EV'
                  ? 'EV fuel savings ($4,000+ vs gas) are significant, but higher Year-1-3 depreciation makes leasing with passed-through federal tax credits mathematically superior to buying.'
                  : vehicle.powertrain === 'PHEV' || vehicle.powertrain === 'Hybrid'
                  ? 'Exceptional 5-year resale retention and high fuel efficiency make purchasing or financing this vehicle one of the lowest total-cost options on the market.'
                  : 'Gas powertrains incur higher 5-year fuel burdens ($9,000+), but have lower insurance rates and standard replacement parts.'}
              </div>
            </div>
          </div>

          {/* Dynamic Scenario Adjusters */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Personalize Energy & Mileage Variables
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">
                  Annual Mileage: <span className="font-mono font-semibold text-white">{annualMiles.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={8000}
                  max={25000}
                  step={500}
                  value={annualMiles}
                  onChange={(e) => setAnnualMiles(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">
                  Gas Price ($/gal): <span className="font-mono font-semibold text-white">${gasPricePerGal.toFixed(2)}</span>
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={gasPricePerGal}
                  onChange={(e) => setGasPricePerGal(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">
                  Electricity ($/kWh): <span className="font-mono font-semibold text-white">${electricPricePerKwh.toFixed(2)}</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={electricPricePerKwh}
                  onChange={(e) => setElectricPricePerKwh(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 font-mono text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Loan vs Lease Comparison Room (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-semibold text-white">Loan vs. Lease Comparison</h2>
              <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
                <button
                  onClick={() => setFinanceType('loan')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    financeType === 'loan' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400'
                  }`}
                >
                  Loan (Purchase)
                </button>
                <button
                  onClick={() => setFinanceType('lease')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    financeType === 'lease' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400'
                  }`}
                >
                  Lease
                </button>
              </div>
            </div>

            {/* Inputs based on selection */}
            {financeType === 'loan' ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Cash Down Payment ($)</label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 font-mono text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1">Interest Rate (APR %)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={apr}
                      onChange={(e) => setApr(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Loan Term</label>
                    <select
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(parseInt(e.target.value))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white font-mono"
                    >
                      <option value={36}>36 Months</option>
                      <option value={48}>48 Months</option>
                      <option value={60}>60 Months</option>
                      <option value={72}>72 Months</option>
                    </select>
                  </div>
                </div>

                {/* Loan Outputs */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Monthly Loan Payment:</span>
                    <span className="text-lg font-bold font-mono text-white">
                      ${Math.round(monthlyPayment).toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px]">
                    <span className="text-slate-500">Total Financed Interest:</span>
                    <span className="font-mono text-amber-400 font-semibold">
                      ${totalLoanInterest.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Vehicle Equity at End:</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      ${(vehicle.msrp - depreciationCost).toLocaleString()} (100% Owned)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Cap Reduction / Down Payment ($)</label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 font-mono text-white"
                  />
                  <p className="mt-1 text-[11px] text-amber-400">
                    Rule: Never put &gt;$0 down on a lease. If totaled on day 1, down payment is lost.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1">Residual Value (%)</label>
                    <input
                      type="number"
                      value={leaseResidualPercent}
                      onChange={(e) => setLeaseResidualPercent(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Money Factor</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={leaseMoneyFactor}
                      onChange={(e) => setLeaseMoneyFactor(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 font-mono text-white"
                    />
                    <span className="text-[10px] text-slate-500">
                      ≈ {(leaseMoneyFactor * 2400).toFixed(2)}% APR equivalent
                    </span>
                  </div>
                </div>

                {/* Lease Outputs */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Estimated Lease Payment:</span>
                    <span className="text-lg font-bold font-mono text-white">
                      ${leaseMonthlyPayment.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px]">
                    <span className="text-slate-500">Total 36-Mo Out-of-Pocket:</span>
                    <span className="font-mono text-slate-200 font-semibold">
                      ${leaseTotalOutOfPocket.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">End-of-Term Equity:</span>
                    <span className="font-mono text-slate-400">$0 (Turn vehicle in or buy out)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Strategic Advice Button */}
            <button
              onClick={() =>
                onOpenAdvisorWithContext(
                  `Should I lease or buy a ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.powertrain})? The MSRP is $${vehicle.msrp} with a ${vehicle.fiveYearDepreciationPercent}% 5-year depreciation rate.`
                )
              }
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
            >
              <span>Consult Advisor: Lease vs Buy Strategy</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
