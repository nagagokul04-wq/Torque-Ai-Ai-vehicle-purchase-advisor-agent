import React, { useState } from 'react';
import { QuoteInput, QuoteAuditResult, DealerQuoteItem } from '../types/vehicle';
import { PRESET_DEALER_QUOTES } from '../data/vehicles';
import { AlertTriangle, CheckCircle, Copy, Check, DollarSign, Sparkles, FileText, ChevronRight, ShieldAlert, ArrowRight } from 'lucide-react';

interface QuoteAuditorDashboardProps {
  onOpenAdvisorWithContext: (contextPrompt: string) => void;
}

export const QuoteAuditorDashboard: React.FC<QuoteAuditorDashboardProps> = ({ onOpenAdvisorWithContext }) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [quote, setQuote] = useState<QuoteInput>(PRESET_DEALER_QUOTES[0].data);
  const [auditResult, setAuditResult] = useState<QuoteAuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New add-on input states
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonAmount, setNewAddonAmount] = useState('');

  const handlePresetChange = (index: number) => {
    setSelectedPresetIndex(index);
    setQuote(PRESET_DEALER_QUOTES[index].data);
    setAuditResult(null);
  };

  const handleAddAddon = () => {
    if (!newAddonName.trim() || !newAddonAmount) return;
    const item: DealerQuoteItem = {
      id: Date.now().toString(),
      name: newAddonName.trim(),
      amount: parseFloat(newAddonAmount) || 0,
      isOptional: true,
      category: 'protection',
    };
    setQuote((prev) => ({
      ...prev,
      addOns: [...prev.addOns, item],
    }));
    setNewAddonName('');
    setNewAddonAmount('');
  };

  const handleRemoveAddon = (id: string) => {
    setQuote((prev) => ({
      ...prev,
      addOns: prev.addOns.filter((item) => item.id !== id),
    }));
  };

  const totalAddonsAmount = quote.addOns.reduce((sum, item) => sum + item.amount, 0);
  const taxableAmount = Math.max(0, quote.dealerPrice + quote.docFee + totalAddonsAmount - quote.tradeInAllowance);
  const estimatedTax = (taxableAmount * (quote.salesTaxPercent / 100));
  const estimatedTotalOTD = (quote.dealerPrice + quote.docFee + totalAddonsAmount + estimatedTax);
  const amountFinanced = Math.max(0, estimatedTotalOTD - quote.tradeInAllowance - quote.downPayment);

  // Loan monthly payment formula: P * (r*(1+r)^n) / ((1+r)^n - 1)
  const monthlyRate = quote.offeredApr / 100 / 12;
  const n = quote.loanTermMonths;
  const estimatedMonthlyPayment =
    monthlyRate > 0 && n > 0
      ? (amountFinanced * (monthlyRate * Math.pow(1 + monthlyRate, n))) / (Math.pow(1 + monthlyRate, n) - 1)
      : n > 0
      ? amountFinanced / n
      : 0;

  const runAudit = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/advisor/audit-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: quote.vehicleName,
          msrp: quote.msrp,
          dealerPrice: quote.dealerPrice,
          docFee: quote.docFee,
          addOns: quote.addOns,
          apr: quote.offeredApr,
          termMonths: quote.loanTermMonths,
          tradeInValue: quote.tradeInAllowance,
          downPayment: quote.downPayment,
          taxRate: quote.salesTaxPercent,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: QuoteAuditResult = await response.json();
      setAuditResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to analyze quote with AI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Preset Selector */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <ShieldAlert className="h-4 w-4" />
              <span>Dealer Quote & Out-The-Door (OTD) Auditor</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
              Expose Hidden Markups, Junk Fees & Unfair APRs
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Input a dealer worksheet or pick an authentic test scenario to generate a line-by-line audit and counter-script.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Load Scenario:</span>
            {PRESET_DEALER_QUOTES.map((preset, idx) => (
              <button
                key={preset.name}
                onClick={() => handlePresetChange(idx)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap border ${
                  selectedPresetIndex === idx
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-600'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Quote Input on Left, Live Financial Summary & AI Audit on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Worksheet Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
            <h2 className="text-base font-semibold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span>Deal Worksheet Input</span>
              <span className="text-xs font-normal text-slate-400">Customizable</span>
            </h2>

            {/* Vehicle Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300">Vehicle Make / Model / Trim</label>
              <input
                type="text"
                value={quote.vehicleName}
                onChange={(e) => setQuote({ ...quote, vehicleName: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* MSRP & Dealer Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300">Window Sticker MSRP ($)</label>
                <input
                  type="number"
                  value={quote.msrp}
                  onChange={(e) => setQuote({ ...quote, msrp: parseFloat(e.target.value) || 0 })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-2 text-sm font-mono tabular-nums text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">Dealer Offered Price ($)</label>
                <input
                  type="number"
                  value={quote.dealerPrice}
                  onChange={(e) => setQuote({ ...quote, dealerPrice: parseFloat(e.target.value) || 0 })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-2 text-sm font-mono tabular-nums text-white focus:border-cyan-500 focus:outline-none"
                />
                {quote.dealerPrice > quote.msrp && (
                  <p className="mt-1 text-xs text-rose-400">
                    +${(quote.dealerPrice - quote.msrp).toLocaleString()} Dealer Markup (ADM)
                  </p>
                )}
              </div>
            </div>

            {/* Doc Fee */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">Dealer Documentation Fee ($)</label>
                <span className="text-[11px] text-slate-400">Fair US avg: $150-$300</span>
              </div>
              <input
                type="number"
                value={quote.docFee}
                onChange={(e) => setQuote({ ...quote, docFee: parseFloat(e.target.value) || 0 })}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-2 text-sm font-mono tabular-nums text-white focus:border-cyan-500 focus:outline-none"
              />
              {quote.docFee > 400 && (
                <p className="mt-1 text-xs text-amber-400">
                  Notice: High doc fee (${quote.docFee}). May contain hidden dealer profit.
                </p>
              )}
            </div>

            {/* Itemized Add-ons List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Itemized Dealer Add-Ons & Packages</label>
                <span className="text-xs font-mono tabular-nums text-cyan-400">
                  Total: ${totalAddonsAmount.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {quote.addOns.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No dealer add-on line items present.</p>
                ) : (
                  quote.addOns.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-2 text-xs"
                    >
                      <div className="truncate pr-2">
                        <span className="text-slate-200">{item.name}</span>
                        <span className="text-slate-500 ml-2">({item.category})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono tabular-nums text-slate-300">${item.amount.toLocaleString()}</span>
                        <button
                          onClick={() => handleRemoveAddon(item.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove item"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add item row */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="e.g. Paint Sealant or GAP"
                  value={newAddonName}
                  onChange={(e) => setNewAddonName(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="$"
                  value={newAddonAmount}
                  onChange={(e) => setNewAddonAmount(e.target.value)}
                  className="w-24 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-mono tabular-nums text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddAddon}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Financing & Down Payment */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-300">Offered APR (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={quote.offeredApr}
                  onChange={(e) => setQuote({ ...quote, offeredApr: parseFloat(e.target.value) || 0 })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-2 text-sm font-mono tabular-nums text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">Loan Term (Months)</label>
                <select
                  value={quote.loanTermMonths}
                  onChange={(e) => setQuote({ ...quote, loanTermMonths: parseInt(e.target.value) || 60 })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-2 text-sm font-mono text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value={36}>36 months (3 yrs)</option>
                  <option value={48}>48 months (4 yrs)</option>
                  <option value={60}>60 months (5 yrs)</option>
                  <option value={72}>72 months (6 yrs)</option>
                  <option value={84}>84 months (7 yrs)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300">Down Payment ($)</label>
                <input
                  type="number"
                  value={quote.downPayment}
                  onChange={(e) => setQuote({ ...quote, downPayment: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800/90 px-2.5 py-1.5 text-xs font-mono tabular-nums text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-300">Trade-In Value ($)</label>
                <input
                  type="number"
                  value={quote.tradeInAllowance}
                  onChange={(e) => setQuote({ ...quote, tradeInAllowance: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800/90 px-2.5 py-1.5 text-xs font-mono tabular-nums text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-300">Sales Tax (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={quote.salesTaxPercent}
                  onChange={(e) => setQuote({ ...quote, salesTaxPercent: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800/90 px-2.5 py-1.5 text-xs font-mono tabular-nums text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Audit Trigger CTA */}
            <div className="pt-3">
              <button
                onClick={runAudit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Auditing Quote with AI Agent...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Run AI Deal Audit & Counter-Script</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Summary & AI Audit Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real-time Math Summary Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Live Mathematical Breakdown (Out-The-Door)
            </h3>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="border-r border-slate-800/80 pr-2">
                <span className="text-[11px] text-slate-400">Vehicle Price</span>
                <p className="text-base font-semibold font-mono tabular-nums text-white">
                  ${quote.dealerPrice.toLocaleString()}
                </p>
                <span className="text-[11px] text-slate-500">MSRP: ${quote.msrp.toLocaleString()}</span>
              </div>
              <div className="border-r border-slate-800/80 pr-2">
                <span className="text-[11px] text-slate-400">Add-Ons + Doc</span>
                <p className="text-base font-semibold font-mono tabular-nums text-amber-400">
                  +${(totalAddonsAmount + quote.docFee).toLocaleString()}
                </p>
                <span className="text-[11px] text-slate-500">{quote.addOns.length} items + doc</span>
              </div>
              <div className="border-r border-slate-800/80 pr-2">
                <span className="text-[11px] text-slate-400">Est. Total OTD</span>
                <p className="text-base font-bold font-mono tabular-nums text-cyan-400">
                  ${Math.round(estimatedTotalOTD).toLocaleString()}
                </p>
                <span className="text-[11px] text-slate-500">incl. tax/fees</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Est. Monthly</span>
                <p className="text-base font-bold font-mono tabular-nums text-white">
                  ${Math.round(estimatedMonthlyPayment).toLocaleString()}/mo
                </p>
                <span className="text-[11px] text-slate-500">
                  {quote.loanTermMonths}mo @ {quote.offeredApr}%
                </span>
              </div>
            </div>
          </div>

          {/* AI Audit Output Container */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-800/60 bg-rose-950/40 p-4 text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          {!auditResult && !loading && (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-slate-600" />
              <h3 className="mt-2 text-sm font-medium text-slate-300">No Audit Run Yet</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                Click &ldquo;Run AI Deal Audit & Counter-Script&rdquo; to have TorqueAI review this quote for overpriced line items, finance rate gouges, and recommended target offers.
              </p>
              <button
                onClick={runAudit}
                className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-cyan-400 hover:bg-slate-700 transition-colors"
              >
                Audit Current Quote
              </button>
            </div>
          )}

          {auditResult && (
            <div className="space-y-6">
              {/* Verdict Header Badge Card */}
              <div className={`rounded-2xl border p-6 ${
                auditResult.dealRating === 'Excellent'
                  ? 'border-emerald-500/40 bg-emerald-950/20'
                  : auditResult.dealRating === 'Fair'
                  ? 'border-cyan-500/40 bg-cyan-950/20'
                  : auditResult.dealRating === 'Poor'
                  ? 'border-amber-500/40 bg-amber-950/20'
                  : 'border-rose-500/50 bg-rose-950/30'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      auditResult.dealRating === 'Excellent'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : auditResult.dealRating === 'Fair'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : auditResult.dealRating === 'Poor'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      Deal Rating: {auditResult.dealRating}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-400">Identified Junk Fees: </span>
                      <span className="font-bold text-rose-400">
                        ${auditResult.totalJunkFees.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Target OTD: </span>
                      <span className="font-bold text-emerald-400">
                        ${auditResult.fairTargetPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-200 leading-relaxed">
                  {auditResult.executiveSummary}
                </p>

                {/* APR critique */}
                {auditResult.aprAnalysis && (
                  <div className="mt-3 text-xs text-slate-300 border-t border-slate-800/80 pt-2.5">
                    <span className="font-semibold text-cyan-400">Financing APR Analysis: </span>
                    {auditResult.aprAnalysis}
                  </div>
                )}
              </div>

              {/* Line Item Audits Table */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Itemized Fee Audits & Action Plan
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-2 font-medium">Line Item</th>
                        <th className="pb-2 font-medium text-right font-mono">Amount</th>
                        <th className="pb-2 font-medium">Verdict</th>
                        <th className="pb-2 font-medium">Tactical Action Plan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {auditResult.lineItemAudits.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="py-2.5 font-medium text-slate-200">{item.name}</td>
                          <td className="py-2.5 text-right font-mono tabular-nums text-slate-300">
                            ${item.amount.toLocaleString()}
                          </td>
                          <td className="py-2.5">
                            <span className={`font-semibold ${
                              item.status === 'Junk'
                                ? 'text-rose-400'
                                : item.status === 'Inflated'
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}>
                              {item.status}
                            </span>
                            <p className="text-[11px] text-slate-400">{item.verdict}</p>
                          </td>
                          <td className="py-2.5 text-slate-300 text-[11px] max-w-xs">{item.actionPlan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Counter-Offer Negotiation Script */}
              <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-cyan-400" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
                      Recommended Counter-Offer Email/SMS Script
                    </h4>
                  </div>
                  <button
                    onClick={() => copyScript(auditResult.counterOfferScript)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-cyan-300 hover:border-cyan-500 hover:text-white transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap select-all">
                  {auditResult.counterOfferScript}
                </div>
              </div>

              {/* Walk Away Triggers & Tactical Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-4 space-y-2">
                  <h5 className="text-xs font-semibold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Walk-Away Red Flags</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {auditResult.walkAwayTriggers.map((trigger, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">&bull;</span>
                        <span>{trigger}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                  <h5 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Next Action Steps</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {auditResult.tacticalChecklist.map((step, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">&check;</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() =>
                      onOpenAdvisorWithContext(
                        `I just audited a quote for ${quote.vehicleName}. The dealer wants $${quote.dealerPrice} with $${totalAddonsAmount} in add-ons and ${quote.offeredApr}% APR. How should I follow up if they refuse to remove the add-ons?`
                      )
                    }
                    className="mt-2 w-full flex items-center justify-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors pt-2 border-t border-slate-800"
                  >
                    <span>Discuss Strategy in Advisor War Room</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
