export type PowertrainType = 'EV' | 'Hybrid' | 'PHEV' | 'Gas';
export type BodyType = 'Sedan' | 'SUV' | 'Crossover' | 'Truck';

export interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  msrp: number;
  invoiceEstimate: number;
  bodyType: BodyType;
  powertrain: PowertrainType;
  rangeOrMpg: string; // e.g. "310 mi range" or "40 MPG combined"
  horsepower: number;
  torqueLbFt: number;
  acceleration0to60: number; // seconds
  cargoSpaceCuFt: number;
  seatingCapacity: number;
  drivetrain: 'AWD' | 'FWD' | 'RWD';
  safetyRating: string; // e.g. "IIHS Top Safety Pick+"
  fiveYearDepreciationPercent: number; // e.g. 42%
  annualInsuranceEstimate: number;
  annualFuelEstimate: number;
  warrantyYearsBumper: number;
  warrantyYearsPowertrain: number;
  imageUrl: string;
  popularAddonTraps: string[];
  recommendedTargetDiscount: string; // e.g. "Invoice - $500 or 4% below MSRP"
  keyHighlights: string[];
}

export interface DealerQuoteItem {
  id: string;
  name: string;
  amount: number;
  isOptional: boolean;
  category: 'price' | 'dealer_fee' | 'government' | 'protection' | 'finance';
}

export interface QuoteInput {
  vehicleName: string;
  msrp: number;
  dealerPrice: number;
  docFee: number;
  tradeInAllowance: number;
  downPayment: number;
  offeredApr: number;
  loanTermMonths: number;
  salesTaxPercent: number;
  addOns: DealerQuoteItem[];
}

export interface LineItemAudit {
  name: string;
  amount: number;
  status: 'Legitimate' | 'Inflated' | 'Junk';
  verdict: string;
  actionPlan: string;
}

export interface QuoteAuditResult {
  dealRating: 'Excellent' | 'Fair' | 'Poor' | 'Predatory';
  executiveSummary: string;
  totalJunkFees: number;
  fairTargetPrice: number;
  potentialSavings: number;
  lineItemAudits: LineItemAudit[];
  aprAnalysis: string;
  counterOfferScript: string;
  walkAwayTriggers: string[];
  tacticalChecklist: string[];
}

export interface MatchmakerCriteria {
  budget: number;
  primaryUse: string;
  dailyCommuteMiles: number;
  hasHomeCharging: boolean;
  passengers: number;
  winterDriving: boolean;
  priorities: string[];
}

export interface MatchRecommendation {
  rank: number;
  makeModel: string;
  recommendedTrim: string;
  startingMSRP: number;
  powertrain: PowertrainType;
  matchScore: number;
  whyItWins: string;
  fiveYearTcoVerdict: string;
  keyPros: string[];
  watchouts: string[];
  targetNegotiatedPrice: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
