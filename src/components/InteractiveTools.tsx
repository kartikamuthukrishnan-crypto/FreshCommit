import React, { useState, useMemo } from 'react';
import {
  Calculator,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scale,
  DollarSign,
  HelpCircle,
  Info,
  Percent,
  Sliders,
  Award,
  BookOpen,
  MessageSquareQuote,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  SlidersHorizontal,
  Building2,
  Target,
  Compass,
  Layers,
  Zap,
  Brain,
  Volume2,
  Shield,
  Search,
  Eye
} from 'lucide-react';

interface CompensationState {
  baseSalary: number;
  equityTotal: number;
  vestingSchedule: 'standard' | 'backloaded' | 'even';
  signOnYear1: number;
  signOnYear2: number;
  performanceBonusPct: number;
  taxLocation: string;
  stockGrowthPct: number;
}

const TAX_PRESETS: Record<string, { name: string; rate: number; stateNote: string }> = {
  california: { name: 'SF Bay Area / California', rate: 0.33, stateNote: 'High state income tax (up to 9.3%+ marginal)' },
  newyork: { name: 'NYC / New York', rate: 0.32, stateNote: 'Combined NY State + NYC municipal tax' },
  washington: { name: 'Seattle / Washington', rate: 0.24, stateNote: 'No state income tax; federal only' },
  texas: { name: 'Austin / Texas', rate: 0.24, stateNote: 'No state income tax; federal only' },
  colorado: { name: 'Denver / Colorado', rate: 0.28, stateNote: 'Flat 4.4% state income tax' },
  remote: { name: 'Remote / US National Average', rate: 0.27, stateNote: 'Standard blended federal + state baseline' },
};

export const InteractiveToolsView: React.FC = () => {
  const [activeSubTool, setActiveSubTool] = useState<'tc-calculator' | 'resume-grader' | 'reverse-interview'>('tc-calculator');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          100% Free Developer Utilities &bull; Zero Login Required
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Entry-Level SWE Interactive Career Tools
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
          Mathematically model your 4-year tech offer vesting cliffs, audit project resume bullets against Google’s XYZ formula, and generate high-signal reverse interview questions.
        </p>
      </div>

      {/* Tool Selector Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveSubTool('tc-calculator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTool === 'tc-calculator'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4 text-emerald-400" />
          <span>Total Compensation &amp; Cliff Calculator</span>
        </button>

        <button
          onClick={() => setActiveSubTool('resume-grader')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTool === 'resume-grader'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>Google XYZ Resume Bullet Grader</span>
        </button>

        <button
          onClick={() => setActiveSubTool('reverse-interview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTool === 'reverse-interview'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <MessageSquareQuote className="w-4 h-4 text-amber-500" />
          <span>Reverse-Interview Generator</span>
        </button>
      </div>

      {/* Active SubTool Component */}
      {activeSubTool === 'tc-calculator' && <TotalCompensationCalculator />}
      {activeSubTool === 'resume-grader' && <ResumeBulletGrader />}
      {activeSubTool === 'reverse-interview' && <ReverseInterviewGenerator />}
    </div>
  );
};

// ==========================================
// SUB-TOOL 1: TC & 4-YEAR CLIFF CALCULATOR
// ==========================================
const TotalCompensationCalculator: React.FC = () => {
  const [offer, setOffer] = useState<CompensationState>({
    baseSalary: 125000,
    equityTotal: 100000,
    vestingSchedule: 'standard', // 25/25/25/25
    signOnYear1: 15000,
    signOnYear2: 10000,
    performanceBonusPct: 10,
    taxLocation: 'california',
    stockGrowthPct: 0,
  });

  const [compareMode, setCompareMode] = useState(false);
  const [offerB, setOfferB] = useState<CompensationState>({
    baseSalary: 140000,
    equityTotal: 40000,
    vestingSchedule: 'standard',
    signOnYear1: 5000,
    signOnYear2: 0,
    performanceBonusPct: 8,
    taxLocation: 'washington',
    stockGrowthPct: 0,
  });

  const calculateBreakdown = (data: CompensationState) => {
    const adjustedEquity = data.equityTotal * (1 + data.stockGrowthPct / 100);

    let vestWeights = [0.25, 0.25, 0.25, 0.25];
    if (data.vestingSchedule === 'backloaded') {
      vestWeights = [0.05, 0.15, 0.40, 0.40]; // Amazon style
    } else if (data.vestingSchedule === 'even') {
      vestWeights = [0.25, 0.25, 0.25, 0.25];
    }

    const annualPerfBonus = data.baseSalary * (data.performanceBonusPct / 100);

    const years = [1, 2, 3, 4].map((year, idx) => {
      const base = data.baseSalary;
      const equity = adjustedEquity * vestWeights[idx];
      const signOn = year === 1 ? data.signOnYear1 : year === 2 ? data.signOnYear2 : 0;
      const bonus = annualPerfBonus;
      const total = base + equity + signOn + bonus;

      const taxRate = TAX_PRESETS[data.taxLocation]?.rate || 0.27;
      const net = total * (1 - taxRate);
      const monthlyNet = net / 12;

      return {
        year,
        base,
        equity,
        signOn,
        bonus,
        total,
        net,
        monthlyNet,
        vestPercent: Math.round(vestWeights[idx] * 100),
      };
    });

    const total4Year = years.reduce((acc, y) => acc + y.total, 0);
    const hasCliffDrop = years[1].total < years[0].total;
    const cliffDropAmount = years[0].total - years[1].total;

    return { years, total4Year, hasCliffDrop, cliffDropAmount };
  };

  const primary = useMemo(() => calculateBreakdown(offer), [offer]);
  const secondary = useMemo(() => calculateBreakdown(offerB), [offerB]);

  return (
    <div className="space-y-8">
      {/* Intro Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              Software Engineer Total Compensation (TC) Model
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Understand how 4-year vesting schedules, sign-on bonuses, and 1-year cliffs impact your true annual earnings. Avoid the common mistake of confusing Year 1 earnings with steady-state compensation.
            </p>
          </div>
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start lg:self-auto cursor-pointer ${
              compareMode
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{compareMode ? 'Disable Comparison' : 'Compare 2 Offers Side-by-Side'}</span>
          </button>
        </div>

        {/* Offer Inputs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 pt-6 border-t border-slate-100">
          {/* Offer A Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                {compareMode ? 'Offer A (Primary)' : 'Your Offer Details'}
              </span>
              <span className="text-xs text-slate-400 font-medium">All numbers in USD ($)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Annual Base Salary
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    step="1000"
                    value={offer.baseSalary}
                    onChange={(e) => setOffer({ ...offer, baseSalary: Number(e.target.value) || 0 })}
                    className="w-full pl-7 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total 4-Year Equity / RSUs
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    step="5000"
                    value={offer.equityTotal}
                    onChange={(e) => setOffer({ ...offer, equityTotal: Number(e.target.value) || 0 })}
                    className="w-full pl-7 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vesting Schedule
                </label>
                <select
                  value={offer.vestingSchedule}
                  onChange={(e) => setOffer({ ...offer, vestingSchedule: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="standard">Standard: 25% / 25% / 25% / 25% (1-Yr Cliff)</option>
                  <option value="backloaded">Backloaded (Amazon): 5% / 15% / 40% / 40%</option>
                  <option value="even">Monthly Even Vesting (25% per yr, no cliff)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Annual Bonus (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={offer.performanceBonusPct}
                    onChange={(e) => setOffer({ ...offer, performanceBonusPct: Number(e.target.value) || 0 })}
                    className="w-full pl-3 pr-7 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-xs">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Year 1 Sign-On Bonus
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    step="1000"
                    value={offer.signOnYear1}
                    onChange={(e) => setOffer({ ...offer, signOnYear1: Number(e.target.value) || 0 })}
                    className="w-full pl-7 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Year 2 Sign-On Bonus
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    step="1000"
                    value={offer.signOnYear2}
                    onChange={(e) => setOffer({ ...offer, signOnYear2: Number(e.target.value) || 0 })}
                    className="w-full pl-7 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location (Estimated Tax Rate)
                </label>
                <select
                  value={offer.taxLocation}
                  onChange={(e) => setOffer({ ...offer, taxLocation: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.entries(TAX_PRESETS).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.name} (~{Math.round(val.rate * 100)}% eff.)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Stock Performance</label>
                  <span className={`text-[11px] font-bold ${offer.stockGrowthPct > 0 ? 'text-emerald-600' : offer.stockGrowthPct < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                    {offer.stockGrowthPct > 0 ? `+${offer.stockGrowthPct}%` : `${offer.stockGrowthPct}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="100"
                  step="10"
                  value={offer.stockGrowthPct}
                  onChange={(e) => setOffer({ ...offer, stockGrowthPct: Number(e.target.value) })}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Offer B (If Compare Mode Active) OR Visual Overview */}
          {compareMode ? (
            <div className="space-y-4 bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-800 bg-indigo-100 px-2.5 py-1 rounded-lg">
                  Offer B (Comparison)
                </span>
                <span className="text-xs text-indigo-400 font-medium">Secondary Offer</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Annual Base Salary</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      step="1000"
                      value={offerB.baseSalary}
                      onChange={(e) => setOfferB({ ...offerB, baseSalary: Number(e.target.value) || 0 })}
                      className="w-full pl-7 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total 4-Year Equity</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      step="5000"
                      value={offerB.equityTotal}
                      onChange={(e) => setOfferB({ ...offerB, equityTotal: Number(e.target.value) || 0 })}
                      className="w-full pl-7 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vesting Schedule</label>
                  <select
                    value={offerB.vestingSchedule}
                    onChange={(e) => setOfferB({ ...offerB, vestingSchedule: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="standard">Standard: 25% / 25% / 25% / 25%</option>
                    <option value="backloaded">Backloaded (Amazon): 5% / 15% / 40% / 40%</option>
                    <option value="even">Monthly Even Vesting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Annual Bonus (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={offerB.performanceBonusPct}
                      onChange={(e) => setOfferB({ ...offerB, performanceBonusPct: Number(e.target.value) || 0 })}
                      className="w-full pl-3 pr-7 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-400 text-xs">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year 1 Sign-On</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={offerB.signOnYear1}
                      onChange={(e) => setOfferB({ ...offerB, signOnYear1: Number(e.target.value) || 0 })}
                      className="w-full pl-7 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <select
                    value={offerB.taxLocation}
                    onChange={(e) => setOfferB({ ...offerB, taxLocation: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(TAX_PRESETS).map(([key, val]) => (
                      <option key={key} value={key}>{val.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Year 1 Total Compensation</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  ${primary.years[0].total.toLocaleString()}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Base Pay</span>
                  <span className="font-semibold text-slate-900">${offer.baseSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Equity Vesting (Yr 1)</span>
                  <span className="font-semibold text-emerald-700">${primary.years[0].equity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Sign-On Bonus (Yr 1)</span>
                  <span className="font-semibold text-indigo-700">${offer.signOnYear1.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Estimated Monthly Take-Home (Net)</span>
                  <span className="font-bold text-slate-900 font-mono">${Math.round(primary.years[0].monthlyNet).toLocaleString()}/mo</span>
                </div>
              </div>

              {primary.hasCliffDrop && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Year 2 Cliff Drop Alert:</span> Your Year 2 compensation will drop by{' '}
                    <span className="font-bold text-amber-950">${primary.cliffDropAmount.toLocaleString()}</span> once your Year 1 sign-on bonus expires. Plan your savings accordingly!
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Year-by-Year Comparison Table & Charts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center justify-between">
          <span>4-Year Annual Compensation Progression</span>
          <span className="text-xs text-slate-500 font-normal">
            4-Year Total: <strong className="text-slate-900 font-mono">${primary.total4Year.toLocaleString()}</strong>
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {primary.years.map((y) => (
            <div
              key={y.year}
              className={`p-5 rounded-2xl border transition-all ${
                y.year === 1
                  ? 'border-emerald-300 bg-emerald-50/20 shadow-sm'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-extrabold text-slate-700">Year {y.year}</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                  {y.vestPercent}% Equity Vest
                </span>
              </div>

              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                ${y.total.toLocaleString()}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Base:</span>
                  <span className="font-medium text-slate-800">${y.base.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Equity:</span>
                  <span className="font-medium text-emerald-700">${y.equity.toLocaleString()}</span>
                </div>
                {y.signOn > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sign-on:</span>
                    <span className="font-medium text-indigo-600">${y.signOn.toLocaleString()}</span>
                  </div>
                )}
                {y.bonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bonus:</span>
                    <span className="font-medium text-slate-700">${y.bonus.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-100 font-semibold text-slate-900">
                  <span>Est. Monthly Net:</span>
                  <span className="font-mono text-emerald-800">${Math.round(y.monthlyNet).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Offer Comparison Results (If Enabled) */}
        {compareMode && (
          <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              Side-by-Side 4-Year Offer Audit
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-3">Metric</th>
                    <th className="p-3 text-emerald-700">Offer A (Primary)</th>
                    <th className="p-3 text-indigo-700">Offer B (Comparison)</th>
                    <th className="p-3">Financial Winner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-semibold text-slate-700">Year 1 Total Comp (TC)</td>
                    <td className="p-3 font-mono font-bold text-slate-900">${primary.years[0].total.toLocaleString()}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">${secondary.years[0].total.toLocaleString()}</td>
                    <td className="p-3 font-bold">
                      {primary.years[0].total >= secondary.years[0].total ? (
                        <span className="text-emerald-600">Offer A (+${(primary.years[0].total - secondary.years[0].total).toLocaleString()})</span>
                      ) : (
                        <span className="text-indigo-600">Offer B (+${(secondary.years[0].total - primary.years[0].total).toLocaleString()})</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-700">Guaranteed Cash Base</td>
                    <td className="p-3 font-mono font-bold text-slate-900">${offer.baseSalary.toLocaleString()}/yr</td>
                    <td className="p-3 font-mono font-bold text-slate-900">${offerB.baseSalary.toLocaleString()}/yr</td>
                    <td className="p-3 font-bold">
                      {offer.baseSalary >= offerB.baseSalary ? (
                        <span className="text-emerald-600">Offer A</span>
                      ) : (
                        <span className="text-indigo-600">Offer B (+${(offerB.baseSalary - offer.baseSalary).toLocaleString()})</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-700">Total 4-Year Wealth Accumulated</td>
                    <td className="p-3 font-mono font-bold text-slate-900">${primary.total4Year.toLocaleString()}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">${secondary.total4Year.toLocaleString()}</td>
                    <td className="p-3 font-bold">
                      {primary.total4Year >= secondary.total4Year ? (
                        <span className="text-emerald-600">Offer A (+${(primary.total4Year - secondary.total4Year).toLocaleString()})</span>
                      ) : (
                        <span className="text-indigo-600">Offer B (+${(secondary.total4Year - primary.total4Year).toLocaleString()})</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Editorial Guidance & Advice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            1
          </div>
          <h4 className="text-sm font-bold text-slate-900">The 1-Year Cliff Reality</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            At 90% of tech firms, zero equity vests if you leave or are laid off before day 365. On your 1-year anniversary, 25% vests in a single lump sum.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            2
          </div>
          <h4 className="text-sm font-bold text-slate-900">Sign-on Bonus Clawbacks</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Almost all initial sign-on bonuses have a 1-year or 2-year prorated clawback clause. If you resign before 12 months, you must repay the unvested portion.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            3
          </div>
          <h4 className="text-sm font-bold text-slate-900">Equity Refreshes</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            To prevent the Year 3/4 cliff, high-performing engineers receive annual "equity refreshers" during annual review cycles that stack on top of your initial grant.
          </p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SUB-TOOL 2: GOOGLE XYZ RESUME BULLET GRADER
// ==========================================
const ResumeBulletGrader: React.FC = () => {
  const [bulletText, setBulletText] = useState(
    'Engineered a real-time task analytics dashboard reducing query latency by 45% (280ms to 154ms) by implementing Redis caching and optimistic UI updates.'
  );
  const [copiedSample, setCopiedSample] = useState<string | null>(null);

  // Analysis Logic
  const analysis = useMemo(() => {
    const text = bulletText.trim();
    if (!text) {
      return {
        score: 0,
        hasActionVerb: false,
        hasMetric: false,
        hasTechDetail: false,
        hasImpactClause: false,
        feedback: ['Paste or type a resume bullet point above to analyze its strength.'],
      };
    }

    const actionVerbs = [
      'engineered', 'architected', 'developed', 'built', 'implemented', 'optimized',
      'refactored', 'designed', 'automated', 'streamlined', 'deployed', 'scaled',
      'spearheaded', 'orchestrated', 'authored', 'integrated', 'cut', 'decreased', 'increased'
    ];

    const weakVerbs = ['worked on', 'helped', 'assisted', 'responsible for', 'participated', 'handled', 'did'];

    const metricRegex = /\b(\d+(\.\d+)?%|\d+ms|\d+s|\$\d+|\d+\+?\s?(users|requests|queries|endpoints|records|tests|x|fold))\b/i;
    const techKeywords = [
      'react', 'node', 'python', 'java', 'typescript', 'javascript', 'c++', 'go', 'golang',
      'postgres', 'postgresql', 'mysql', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws',
      'gcp', 'rest', 'graphql', 'grpc', 'kafka', 'ci/cd', 'git', 'jest', 'tailwind'
    ];

    const lower = text.toLowerCase();
    const startsWithActionVerb = actionVerbs.some((v) => lower.startsWith(v));
    const containsWeakVerb = weakVerbs.some((wv) => lower.includes(wv));
    const hasMetric = metricRegex.test(text);
    const matchedTech = techKeywords.filter((t) => lower.includes(t));
    const hasImpact = lower.includes('by ') || lower.includes('resulting in') || lower.includes('reducing') || lower.includes('increasing') || lower.includes('saving');

    let score = 0;
    const feedback: string[] = [];

    if (startsWithActionVerb) {
      score += 30;
    } else if (containsWeakVerb) {
      feedback.push('Replace passive phrasing ("worked on", "assisted") with an authoritative action verb ("Engineered", "Refactored").');
    } else {
      feedback.push('Begin your bullet point with a decisive past-tense action verb (e.g., "Engineered", "Implemented", "Architected").');
    }

    if (hasMetric) {
      score += 30;
    } else {
      feedback.push('Add a measurable metric (e.g., latency in ms, % performance gain, user count, or test coverage).');
    }

    if (matchedTech.length >= 2) {
      score += 20;
    } else if (matchedTech.length === 1) {
      score += 10;
      feedback.push('Mention specific tools, libraries, or architectural components (e.g. Redis caching, PostgreSQL indexes).');
    } else {
      feedback.push('Specify the concrete technical stack utilized rather than generic statements.');
    }

    if (hasImpact) {
      score += 20;
    } else {
      feedback.push('Clarify the engineering mechanism using the XYZ structure ("by doing [Z]" or "resulting in [Y]").');
    }

    return {
      score: Math.min(100, score),
      hasActionVerb: startsWithActionVerb,
      hasMetric,
      hasTechDetail: matchedTech.length >= 2,
      hasImpactClause: hasImpact,
      feedback,
      matchedTech,
    };
  }, [bulletText]);

  const samples = [
    {
      domain: 'Backend & APIs',
      weak: 'Created a REST API in Node and Express for user data.',
      strong: 'Architected a low-latency RESTful microservice handling 4,500 daily requests, reducing p95 response time from 380ms to 120ms via Redis query caching.',
    },
    {
      domain: 'Frontend & Web',
      weak: 'Worked on the frontend dashboard with React.',
      strong: 'Engineered a real-time monitoring dashboard with TypeScript and React, cutting bundle size by 32% (480KB to 326KB) through code splitting and tree shaking.',
    },
    {
      domain: 'Databases & Performance',
      weak: 'Optimized the SQL database queries for the app.',
      strong: 'Refactored 12 unindexed PostgreSQL queries and introduced composite B-Tree indexes, decreasing checkout database CPU utilization from 78% to 26%.',
    },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSample(id);
    setTimeout(() => setCopiedSample(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Editor & Grader Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Google XYZ Resume Bullet Grader &amp; Optimizer
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Audit your resume project bullet points against Google\'s standard: <code className="font-mono text-indigo-700 font-bold">"Accomplished [X] as measured by [Y] by doing [Z]"</code>.
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700">
            Paste or Type a Resume Bullet Point:
          </label>
          <textarea
            rows={3}
            value={bulletText}
            onChange={(e) => setBulletText(e.target.value)}
            placeholder="e.g. Engineered a real-time task analytics dashboard reducing query latency by 45%..."
            className="w-full p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
          />
        </div>

        {/* Score & Rubric Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
          {/* Score Badge */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">XYZ Compliance Score</span>
            <div className={`text-5xl font-black font-mono tracking-tight ${
              analysis.score >= 80 ? 'text-emerald-600' : analysis.score >= 50 ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {analysis.score}/100
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              analysis.score >= 80
                ? 'bg-emerald-100 text-emerald-800'
                : analysis.score >= 50
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              {analysis.score >= 80 ? 'Production-Ready Impact' : analysis.score >= 50 ? 'Needs Metric or Tech Depth' : 'Weak / Passive Phrasing'}
            </span>
          </div>

          {/* Checklist */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Rubric Checklist</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-white text-xs">
                {analysis.hasActionVerb ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                )}
                <span className={analysis.hasActionVerb ? 'font-bold text-slate-900' : 'text-slate-500'}>
                  Strong Lead Action Verb
                </span>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-white text-xs">
                {analysis.hasMetric ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                )}
                <span className={analysis.hasMetric ? 'font-bold text-slate-900' : 'text-slate-500'}>
                  Quantifiable Metric (% or ms)
                </span>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-white text-xs">
                {analysis.hasTechDetail ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                )}
                <span className={analysis.hasTechDetail ? 'font-bold text-slate-900' : 'text-slate-500'}>
                  Specific Tech Stack (2+ tools)
                </span>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-white text-xs">
                {analysis.hasImpactClause ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                )}
                <span className={analysis.hasImpactClause ? 'font-bold text-slate-900' : 'text-slate-500'}>
                  Action Mechanism ("by doing [Z]")
                </span>
              </div>
            </div>

            {analysis.feedback.length > 0 && (
              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-1">
                <span className="text-[11px] font-bold text-indigo-900 uppercase">Recommended Next Steps:</span>
                {analysis.feedback.map((f, i) => (
                  <p key={i} className="text-xs text-indigo-800 flex items-start gap-1.5">
                    <span className="text-indigo-500 font-bold">&bull;</span>
                    {f}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Before / After Transformation Library */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Battle-Tested Before &amp; After Transformations
        </h3>

        <div className="space-y-4">
          {samples.map((s, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.domain}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-xs text-rose-900">
                  <div className="font-bold text-[11px] text-rose-700 uppercase mb-1">❌ Weak / Passive (Passes 0 ATS Filters)</div>
                  {s.weak}
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-xs text-emerald-950 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-[11px] text-emerald-700 uppercase mb-1">✅ Google XYZ Transformed (High-Signal)</div>
                    {s.strong}
                  </div>
                  <button
                    onClick={() => handleCopy(s.strong, `sample-${idx}`)}
                    className="mt-2 self-end text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    {copiedSample === `sample-${idx}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Template</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SUB-TOOL 3: REVERSE-INTERVIEW GENERATOR
// ==========================================
interface ReverseQuestionItem {
  id: string;
  audience: 'manager' | 'peer' | 'skip-level' | 'recruiter';
  stage: 'all' | 'startup' | 'scaleup' | 'bigtech' | 'remote';
  category: 'mentorship' | 'tech-debt' | 'oncall' | 'promotions' | 'stability';
  headline: string;
  q: string;
  why: string;
  greenFlag: string;
  redFlag: string;
  elaboration: {
    conversationalOpener: string;
    counterProbe: string;
    psychology: string;
    greenKeywords: string[];
    redKeywords: string[];
  };
}

const REVERSE_INTERVIEW_DATABASE: ReverseQuestionItem[] = [
  // --- ENGINEERING MANAGER (EM) ---
  {
    id: 'em-1',
    audience: 'manager',
    stage: 'all',
    category: 'mentorship',
    headline: '90-Day Ramp & Pairing Structure',
    q: 'How do you structure PR reviews, pairing, and onboarding buddies for an entry-level engineer during their first 90 days?',
    why: 'Exposes whether they have an intentional, structured mentorship pipeline or expect junior engineers to sink-or-swim.',
    greenFlag: 'Dedicated pairing schedules, weekly 1:1 check-ins, designated onboarding tickets, and an assigned buddy.',
    redFlag: '"We just let new hires explore the codebase until they feel comfortable."',
    elaboration: {
      conversationalOpener: 'When I wrap up my onboarding at a new team, I want to deliver tangible value as quickly as possible. Looking at [Company/Team], could you share how pairing and onboarding buddies are structured for a junior engineer during the first 90 days?',
      counterProbe: 'If they say "we assign an onboarding buddy", ask: "How much protected time each week does that senior buddy have allocated in their sprint specifically for unblocking new hires?"',
      psychology: 'Demonstrates that you respect engineering velocity and take personal ownership of reaching self-sufficiency quickly.',
      greenKeywords: ['Pairing calendar', 'Starter milestone bug', 'Weekly 1:1', 'Buddy allocated hours'],
      redKeywords: ['Sink or swim', 'Figure it out', 'Self-starter who needs no help', 'Trial by fire'],
    },
  },
  {
    id: 'em-2',
    audience: 'manager',
    stage: 'all',
    category: 'oncall',
    headline: 'Production Blameless Culture',
    q: 'What was the last production incident or outage caused by an early-career engineer, and how did the post-mortem handle it?',
    why: 'Tests whether the engineering culture practices true psychological safety and blameless retrospectives or scapegoats individuals.',
    greenFlag: 'Blameless retrospectives, automated test additions to prevent recurrence, systemic guardrails.',
    redFlag: 'Pointing fingers, publicly chastising the developer, or revoking production deployment permissions as punishment.',
    elaboration: {
      conversationalOpener: 'Every growing engineering org inevitably encounters production incidents. Could you walk me through the last time an early-career engineer shipped a bug to production, and what the team post-mortem looked like?',
      counterProbe: 'If they dodge with "our testing is so rigorous nobody breaks production", probe: "When was the last time the deploy pipeline was blocked by a broken main branch, and how did the team rally?"',
      psychology: 'Proves you understand that production stability is an organizational systemic discipline, not individual heroics.',
      greenKeywords: ['Blameless post-mortem', 'Root-cause analysis', 'Added integration test', 'Guardrail automation'],
      redKeywords: ['Revoked access', 'Negligence', 'They got reprimanded', 'Junior mistake'],
    },
  },
  {
    id: 'em-3',
    audience: 'manager',
    stage: 'all',
    category: 'promotions',
    headline: 'Promotion Rubric & Expectations',
    q: 'How are expectations for early-career developers communicated between "Meeting Expectations" vs. "Exceeding Expectations"?',
    why: 'Ensures you have transparent promotion criteria from day one rather than arbitrary end-of-year surprises.',
    greenFlag: 'Documented engineering career ladder rubrics, clear impact milestones, and bi-weekly growth tracking.',
    redFlag: 'Vague metrics like "just be proactive, take initiative, and work hard."',
    elaboration: {
      conversationalOpener: 'One of my key goals in this role is to rapidly progress from entry-level to mid-level engineer. In your 1:1s, how do you distinguish between someone meeting the bar versus exceeding it?',
      counterProbe: 'If they answer vaguely, ask: "Could you share an example of a junior engineer on your team who recently was promoted to L2/Mid-level, and what specific impact drove that decision?"',
      psychology: 'Signals that you are growth-minded, self-reflective, and receptive to constructive milestone-driven feedback.',
      greenKeywords: ['Career ladder rubric', 'Impact scope', 'Competency matrix', 'Objective milestones'],
      redKeywords: ['Gut feeling', 'Face time', 'Putting in extra hours', 'You just know'],
    },
  },
  {
    id: 'em-4',
    audience: 'manager',
    stage: 'startup',
    category: 'stability',
    headline: 'Startup Generalist vs. Specialist',
    q: 'In an early-stage team like [Company/Team], what proportion of my time will be spent on core product features vs. customer support or ad-hoc firefighting?',
    why: 'At startups, juniors often end up doing customer support or manual data fixes instead of developing software.',
    greenFlag: 'Transparent split (e.g. 75% product dev, 15% testing, 10% rotational on-call/support).',
    redFlag: '"We all wear every hat, so some weeks you might just be triaging Zendesk customer tickets all day."',
    elaboration: {
      conversationalOpener: 'I love the agility of early-stage teams. At this current funding stage, how does the team balance heads-down feature development with operational triage and customer inquiries?',
      counterProbe: 'If they say "we all wear whatever hat is needed", follow up: "In an average 2-week sprint, how many story points or PRs does an engineer typically complete?"',
      psychology: 'Shows you understand startup operational realities while safeguarding your professional coding progression.',
      greenKeywords: ['Dedicated support rotation', 'Shielding developers', 'Predictable sprint commitments'],
      redKeywords: ['Constant firefighting', 'Unplanned pivots daily', 'Customer service tasks'],
    },
  },
  {
    id: 'em-5',
    audience: 'manager',
    stage: 'bigtech',
    category: 'promotions',
    headline: 'FAANG Scope & Calibration',
    q: 'How are early-career engineers calibrated across teams during annual perf cycles, and how do you advocate for your reports?',
    why: 'In enterprise tech, promotion requires cross-team calibration packets; a manager who cannot articulate their calibration strategy is a career bottleneck.',
    greenFlag: 'Clear explanation of calibration committee standards, artifact gathering, and peer feedback synthesis.',
    redFlag: 'Dismissive or passive responses like "performance reviews are handled by HR upstairs."',
    elaboration: {
      conversationalOpener: 'In an organization of this scale, performance calibrations often involve cross-team committees. How do you help early-career engineers build the portfolio of artifacts needed for calibration?',
      counterProbe: 'Ask: "What is the typical time-in-role before an L3/Junior developer is put up for promotion calibration to L4/Mid-level?"',
      psychology: 'Demonstrates that you understand organizational mechanics and want to make your manager look good.',
      greenKeywords: ['Design doc artifacts', 'Cross-team visibility', 'Calibration committee', 'Peer reviews'],
      redKeywords: ['Curve limits', 'Hard quotas on promotions', 'Manager leaves it to HR'],
    },
  },

  // --- SENIOR PEER / TECH LEAD ---
  {
    id: 'peer-1',
    audience: 'peer',
    stage: 'all',
    category: 'tech-debt',
    headline: 'PR Review Latency & Gatekeeping',
    q: 'How frequently do pull requests sit awaiting review, and how are code review disagreements or bike-shedding resolved?',
    why: 'Reveals true team velocity, PR hygiene, and whether senior engineers act as gatekeepers or constructive mentors.',
    greenFlag: '<24 hour PR turnaround times with constructive inline comments and automated linters resolving formatting debates.',
    redFlag: 'PRs sitting for weeks or endless debates over formatting preferences that should be handled by Prettier/ESLint.',
    elaboration: {
      conversationalOpener: 'When I push code, I treat code reviews as the highest-bandwidth learning opportunity. On your team, what does the day-to-day code review workflow look like, and how fast are PRs typically unblocked?',
      counterProbe: 'If they say "we review PRs fast", probe: "Do you have SLAs or bot reminders in Slack for PRs that have been waiting more than 24 hours?"',
      psychology: 'Shows that you care deeply about unblocking teammates, collaborative communication, and tight feedback loops.',
      greenKeywords: ['Automated CI linters', 'Under 24 hour turnaround', 'Slack webhooks', 'Constructive pairing'],
      redKeywords: ['PRs stall for a week', 'Debates in comments for days', 'Senior engineer approves everything manually'],
    },
  },
  {
    id: 'peer-2',
    audience: 'peer',
    stage: 'all',
    category: 'oncall',
    headline: 'On-Call Pager Burden & Sleep Health',
    q: 'What does the team on-call rotation look like, and how many times was someone paged outside normal business hours last month?',
    why: 'Peers will give you the brutal truth about after-hours pager fatigue that recruiters and managers gloss over.',
    greenFlag: 'Shadowing senior engineers for 6+ months before holding the pager, <2 off-hours pages per month, comp time given.',
    redFlag: 'Frequent 2 AM alerts caused by flaky cron jobs, junior engineers on primary pager within their first month.',
    elaboration: {
      conversationalOpener: 'Maintaining high system availability is crucial. As someone on the front lines, could you walk me through the team’s on-call rotation and how alerts are prioritized?',
      counterProbe: 'If they claim "on-call is very quiet", ask: "What was the last P0 or P1 page your team received, and how was the root cause addressed in the following sprint?"',
      psychology: 'Proves you take production reliability seriously while setting healthy boundaries around sustainable engineering.',
      greenKeywords: ['Secondary shadow rotation', 'Actionable alert thresholds', 'Comp-time policy', 'Runbook documentation'],
      redKeywords: ['Flaky alerts we ignore', 'Woken up twice a week', 'Unpaid weekend shifts', 'Pushed to prod without tests'],
    },
  },
  {
    id: 'peer-3',
    audience: 'peer',
    stage: 'all',
    category: 'tech-debt',
    headline: 'Local Dev Environment Pain Points',
    q: 'What is currently the single most frustrating part of setting up and developing against the local environment or staging cluster?',
    why: 'Junior peers will speak candidly about technical debt, flaky Docker containers, or credential bottlenecks that waste hours.',
    greenFlag: 'Honest, self-aware answers: "Docker Compose can be heavy, but we are actively migrating to Dev Containers / seed scripts."',
    redFlag: '"It takes 3 weeks just to get AWS credentials and database seeds working, and half the docs are completely outdated."',
    elaboration: {
      conversationalOpener: 'Developer experience often makes or breaks day-to-day momentum. If you could wave a magic wand and improve one tool in the local build or test pipeline, what would it be?',
      counterProbe: 'Ask: "How long does a full test suite take to run locally and in GitHub Actions / CI before merging?"',
      psychology: 'Signals that you are pragmatic, care about developer tooling efficiency, and are comfortable with technical reality.',
      greenKeywords: ['Docker Compose', 'Mocked seed data', 'Active DX investment', 'Fast CI under 10m'],
      redKeywords: ['Docs are 2 years old', 'Tests only pass on one person\'s machine', 'Takes 45 minutes to build'],
    },
  },
  {
    id: 'peer-4',
    audience: 'peer',
    stage: 'remote',
    category: 'mentorship',
    headline: 'Remote Isolation vs. Async Pairing',
    q: 'In this distributed environment, how do teammates ask for quick unblocking without feeling like they are bothering senior engineers on Slack?',
    why: 'Remote juniors frequently suffer in silence for days because they are intimidated by DMing busy senior engineers.',
    greenFlag: 'Dedicated #dev-help channels, open virtual coworking rooms (e.g. Tuple/Huddle), cultural encouragement to ask early.',
    redFlag: '"Just shoot someone a DM and hope they aren\'t in back-to-back meetings all afternoon."',
    elaboration: {
      conversationalOpener: 'Remote collaboration requires deliberate communication channels. When an early-career engineer is stuck on an esoteric error for more than an hour, what is the expected escalation path?',
      counterProbe: 'Ask: "Does the team have a rule of thumb, like \'if you are stuck for 45 minutes, drop a link in the help channel\'?"',
      psychology: 'Shows high self-awareness and emotional intelligence regarding remote communication boundaries.',
      greenKeywords: ['Public help channel', 'Slack Huddles', 'Screenshare pairing', 'No dumb questions ethos'],
      redKeywords: ['Dead silence on Slack', 'People ignore DMs', 'No documentation'],
    },
  },

  // --- DIRECTOR / VP / HEAD OF ENG ---
  {
    id: 'dir-1',
    audience: 'skip-level',
    stage: 'all',
    category: 'tech-debt',
    headline: 'Product Velocity vs. Technical Debt',
    q: 'How does leadership balance shipping new customer features against refactoring core architectural technical debt and upgrading dependencies?',
    why: 'Identifies whether product management steamrolls engineering reliability, turning the codebase into an unmaintainable legacy monolith.',
    greenFlag: 'Dedicated 15–20% sprint allocations, recurring "fix-it" weeks, or clear SLAs for dependency updates.',
    redFlag: '100% feature factory focus with zero tolerance for refactoring or automated test coverage.',
    elaboration: {
      conversationalOpener: 'Engineering organizations always face a healthy tension between delivering commercial product roadmap commitments and preserving codebase health. At leadership level, how do you protect engineering hygiene?',
      counterProbe: 'If they say "we balance both equally", ask: "Could you share an example from the last quarter where a major technical refactoring was prioritized over a product feature request?"',
      psychology: 'Proves you view software as a long-term economic asset that requires deliberate maintenance rather than quick hacks.',
      greenKeywords: ['Dedicated tech debt budget', 'Fix-it week', 'Service reliability metrics', 'Architectural reviews'],
      redKeywords: ['Feature factory', 'We will refactor later when we have time', 'Deadlines are immovable'],
    },
  },
  {
    id: 'dir-2',
    audience: 'skip-level',
    stage: 'all',
    category: 'stability',
    headline: 'Team Runway & Headcount Growth',
    q: 'What does engineering hiring look like over the next 12 months, and what is the team’s current runway or profitability milestone?',
    why: 'Protects you against being hired into a team that is about to freeze hiring, conduct quiet layoffs, or run out of funding.',
    greenFlag: 'Transparent disclosures regarding cash runway (e.g. 24+ months, default alive), disciplined backfill strategy.',
    redFlag: 'Defensive responses, vague metrics like "we are exploring fundraising options," or recent unannounced layoffs.',
    elaboration: {
      conversationalOpener: 'Given current macroeconomic tech industry conditions, stability and strategic discipline are top of mind for engineers. How does leadership view team growth and runway for the upcoming fiscal year?',
      counterProbe: 'Ask: "Are the current open engineering requisitions expanding team capacity, or backfilling departures?"',
      psychology: 'Shows mature business acumen and proves you evaluate companies as an investor evaluating an asset.',
      greenKeywords: ['Disciplined hiring', 'Profitable / Default alive', 'Clear multi-year runway', 'Sustainable burn rate'],
      redKeywords: ['We don\'t discuss financials', 'Aggressive hiring followed by cuts', 'Cash crunch imminent'],
    },
  },
  {
    id: 'dir-3',
    audience: 'skip-level',
    stage: 'remote',
    category: 'stability',
    headline: 'Long-Term Remote & RTO Policy',
    q: 'What is the company\'s strategic stance on in-office vs. remote flexibility over the next 12 to 24 months?',
    why: 'Protects you against unannounced Return-to-Office (RTO) mandates or stealth geographic relocations after accepting an offer.',
    greenFlag: 'Explicit, transparent long-term workplace policies committed in writing (e.g. "We are remote-first forever with quarterly offsites").',
    redFlag: 'Evasive answers like "we are currently evaluating executive preferences and monitoring in-office badge swipes."',
    elaboration: {
      conversationalOpener: 'Different companies are adopting diverse hybrid models. To align my personal planning, what is the executive committee\'s outlook on distributed work over the next two years?',
      counterProbe: 'If they say "we are flexible for now", ask: "Are promotions or leadership roles accessible to engineers outside headquarters hubs?"',
      psychology: 'Demonstrates professional forward-thinking and prevents unexpected lifestyle disruptions.',
      greenKeywords: ['Written remote policy', 'Asynchronous first', 'Quarterly team summits', 'Equitable remote promotions'],
      redKeywords: ['Executive preferences change', 'Mandatory 3 days badge swipes', 'Local hub requirements'],
    },
  },

  // --- RECRUITER / TALENT PARTNER ---
  {
    id: 'rec-1',
    audience: 'recruiter',
    stage: 'all',
    category: 'promotions',
    headline: 'Compensation Band & Leveling Architecture',
    q: 'What are the formal base salary and equity bands for this specific level (e.g. L1/L2 or Junior/Mid), and how is initial placement calibrated?',
    why: 'Ensures you aren\'t down-leveled or low-balled at the offer stage; transparency here indicates a mature compensation philosophy.',
    greenFlag: 'Clear public or semi-transparent Radford/Pave compensation bands with geographical tier adjustments.',
    redFlag: '"We don\'t have set salary bands; it depends on what you currently make or ask for."',
    elaboration: {
      conversationalOpener: 'To ensure mutual alignment before we move to final decision phases, could you share the salary range and equity guidelines allocated for this level?',
      counterProbe: 'If they ask "What are your salary expectations first?", say: "I am evaluating opportunities based on market parity and the total package. What has been budgeted for an engineer at this level?"',
      psychology: 'Establishes that you are financially literate and will negotiate from market data rather than emotion.',
      greenKeywords: ['Standardized bands', 'Radford survey parity', 'Leveling rubric', 'Transparent equity formula'],
      redKeywords: ['Based on previous salary', 'We negotiate on a case-by-case basis', 'Non-disclosable'],
    },
  },
  {
    id: 'rec-2',
    audience: 'recruiter',
    stage: 'all',
    category: 'stability',
    headline: 'Role Origin: Backfill vs. New Headcount',
    q: 'Is this specific role a new headcount created due to team expansion, or is it backfilling an engineer who transferred or left?',
    why: 'If 3 engineers left the team in 6 months, you are stepping into a burning house with a toxic manager.',
    greenFlag: 'Expansion headcount due to business growth, or backfilling an engineer who was promoted into leadership.',
    redFlag: 'Vague hesitation or "the previous engineer decided to pursue other opportunities after a short time."',
    elaboration: {
      conversationalOpener: 'To better understand team dynamics, is this position opening up because of team headcount expansion, or is it backfilling a previous developer?',
      counterProbe: 'If it is a backfill, ask warmly: "What did that engineer enjoy most about the team, and what advice did they leave for their successor?"',
      psychology: 'Reveals institutional turnover history that no Glassdoor review will disclose.',
      greenKeywords: ['Growth expansion', 'Promoted to Staff', 'Transferred to build new team'],
      redKeywords: ['High churn', 'Didn\'t work out', 'Sudden departure', 'Restructuring'],
    },
  },
];

const ReverseInterviewGenerator: React.FC = () => {
  // Generator Controls
  const [targetAudience, setTargetAudience] = useState<'manager' | 'peer' | 'skip-level' | 'recruiter'>('manager');
  const [companyStage, setCompanyStage] = useState<'all' | 'startup' | 'scaleup' | 'bigtech' | 'remote'>('all');
  const [priorityFocus, setPriorityFocus] = useState<'all' | 'mentorship' | 'tech-debt' | 'oncall' | 'promotions' | 'stability'>('all');
  const [companyName, setCompanyName] = useState<string>('');
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);

  // Elaboration State (Track which questions have deep-dive opened)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [batchCopied, setBatchCopied] = useState<boolean>(false);

  // Quick Preset Handlers
  const handleQuickPreset = (aud: 'manager' | 'peer' | 'skip-level' | 'recruiter', cat: 'all' | 'mentorship' | 'tech-debt' | 'oncall' | 'promotions' | 'stability') => {
    setTargetAudience(aud);
    setPriorityFocus(cat);
    setShuffleSeed(0);
  };

  // Filter and rank questions based on options
  const filteredQuestions = useMemo(() => {
    let list = REVERSE_INTERVIEW_DATABASE.filter((item) => {
      const matchAudience = item.audience === targetAudience;
      const matchStage = companyStage === 'all' || item.stage === 'all' || item.stage === companyStage;
      const matchCategory = priorityFocus === 'all' || item.category === priorityFocus;
      return matchAudience && matchStage && matchCategory;
    });

    // Fallback if specific combination is narrow: broaden stage
    if (list.length === 0) {
      list = REVERSE_INTERVIEW_DATABASE.filter((item) => item.audience === targetAudience);
    }

    // Apply shuffle seed rotation if requested
    if (shuffleSeed > 0 && list.length > 1) {
      const offset = shuffleSeed % list.length;
      list = [...list.slice(offset), ...list.slice(0, offset)];
    }

    return list;
  }, [targetAudience, companyStage, priorityFocus, shuffleSeed]);

  // Toggle single elaboration
  const toggleElaboration = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand / Collapse all
  const toggleAllElaborations = () => {
    if (expandedIds.size === filteredQuestions.length) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(filteredQuestions.map((q) => q.id)));
    }
  };

  // Helper to personalize questions with company/team name
  const personalizeText = (text: string) => {
    const target = companyName.trim() ? companyName.trim() : 'your team';
    return text.replace(/\[Company\/Team\]/g, target);
  };

  // Copy single question + elaboration
  const handleCopySingle = (item: ReverseQuestionItem) => {
    const text = `QUESTION:\n"${personalizeText(item.q)}"\n\nWHY IT WORKS:\n${item.why}\n\nCONVERSATIONAL OPENER:\n"${personalizeText(item.elaboration.conversationalOpener)}"\n\nCOUNTER-PROBE (IF DODGED):\n"${item.elaboration.counterProbe}"\n\nHEALTHY SIGNAL:\n${item.greenFlag}\n\nRED FLAG WARNING:\n${item.redFlag}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy all active questions in battlecard format
  const handleCopyAll = () => {
    const header = `# REVERSE-INTERVIEW BATTLECARD: ${targetAudience.toUpperCase()} (${companyName.trim() || 'Software Engineering Role'})\nGenerated via FreshCommit Career Tools (freshcommit.dev)\n\n`;
    const body = filteredQuestions
      .map((item, idx) => {
        return `## Question ${idx + 1}: ${item.headline}\n"${personalizeText(item.q)}"\n\n- How to naturally ask:\n  "${personalizeText(item.elaboration.conversationalOpener)}"\n- If they give a vague answer, counter with:\n  "${item.elaboration.counterProbe}"\n- Signals to listen for:\n  [+] Green: ${item.greenFlag}\n  [-] Red Flag: ${item.redFlag}\n`;
      })
      .join('\n---\n\n');

    navigator.clipboard.writeText(header + body);
    setBatchCopied(true);
    setTimeout(() => setBatchCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* HEADER HERO */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Interactive Diagnostic Question Generator &amp; Script Builder
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquareQuote className="w-6 h-6 text-amber-600" />
              Reverse-Interview Diagnostic Generator
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              When the interviewer asks <code className="font-mono text-amber-900 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">"Do you have any questions for us?"</code>, never say no. Configure your interview context below to generate razor-sharp diagnostic questions and conversational scripts.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShuffleSeed((s) => s + 1)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Shuffle question variations"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Shuffle Questions</span>
            </button>
            <button
              onClick={handleCopyAll}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              {batchCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Battlecard Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Entire Battlecard</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GENERATOR CONTROLS: AUDIENCE, COMPANY STAGE, PRIORITY & TARGET COMPANY   */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/20 border border-slate-200/80 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              Generator Options &amp; Context Targeting
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Showing {filteredQuestions.length} tailored diagnostic questions
            </span>
          </div>

          {/* Option 1: Interviewer Persona */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              1. Who are you interviewing with?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'manager', label: 'Engineering Manager (EM)', sub: 'Mentorship & 1:1s' },
                { id: 'peer', label: 'Senior Peer / Tech Lead', sub: 'PRs, CI/CD & On-call' },
                { id: 'skip-level', label: 'Director / VP of Eng', sub: 'Tech Debt & Strategy' },
                { id: 'recruiter', label: 'Talent / Recruiter', sub: 'Salary Bands & Team Churn' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setTargetAudience(item.id as any);
                    setShuffleSeed(0);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    targetAudience === item.id
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs leading-tight">{item.label}</div>
                  <div className={`text-[10px] mt-0.5 ${targetAudience === item.id ? 'text-amber-100' : 'text-slate-400'}`}>
                    {item.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Option 2 & 3: Company Stage & Primary Focus Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Stage */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                2. Company Stage &amp; Architecture
              </label>
              <select
                value={companyStage}
                onChange={(e) => {
                  setCompanyStage(e.target.value as any);
                  setShuffleSeed(0);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="all">All Stages / Universal Standards</option>
                <option value="startup">Early-Stage Startup (Seed / Series A — Fast pace, high wear-all-hats risk)</option>
                <option value="scaleup">Growth Scaleup (Series B–D — Scaling tech debt, team restructuring)</option>
                <option value="bigtech">Big Tech / FAANG (Calibration committees, strict promotion packets)</option>
                <option value="remote">Remote-First / Distributed (Async communication, isolation risk)</option>
              </select>
            </div>

            {/* Diagnostic Focus */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                3. Primary Diagnostic Priority
              </label>
              <select
                value={priorityFocus}
                onChange={(e) => {
                  setPriorityFocus(e.target.value as any);
                  setShuffleSeed(0);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="all">All Pillars (360° Team Health Audit)</option>
                <option value="mentorship">Mentorship, Pairing &amp; 90-Day Ramp</option>
                <option value="tech-debt">Technical Debt, PR Velocity &amp; Testing Quality</option>
                <option value="oncall">On-Call Pager Burden, Incident Reviews &amp; WLB</option>
                <option value="promotions">Promotion Rubrics, Calibration &amp; Career Growth</option>
                <option value="stability">Runway, Hiring Stability &amp; Layoff Signals</option>
              </select>
            </div>
          </div>

          {/* Option 4: Custom Company Name Dynamic Injection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                4. Target Company or Team Name (Optional — Auto-Personalizes Scripts)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">e.g. Stripe, Datadog Platform, Series A AI</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company or team name to dynamically inject into conversational scripts..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-24 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
              />
              {companyName && (
                <button
                  onClick={() => setCompanyName('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 font-semibold px-2 py-0.5 rounded bg-slate-100"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Scenario Preset Chips */}
          <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-slate-500 mr-1">Quick Scenarios:</span>
            <button
              onClick={() => handleQuickPreset('manager', 'mentorship')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-amber-400 text-[11px] font-semibold transition-all"
            >
              🌱 "Will I actually get mentorship?"
            </button>
            <button
              onClick={() => handleQuickPreset('peer', 'oncall')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-amber-400 text-[11px] font-semibold transition-all"
            >
              🚨 "Is on-call a 2 AM burnout nightmare?"
            </button>
            <button
              onClick={() => handleQuickPreset('peer', 'tech-debt')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-amber-400 text-[11px] font-semibold transition-all"
            >
              ⚡ "Do PRs sit for 3 weeks?"
            </button>
            <button
              onClick={() => handleQuickPreset('skip-level', 'stability')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-amber-400 text-[11px] font-semibold transition-all"
            >
              📉 "Is the company running out of cash?"
            </button>
          </div>
        </div>

        {/* BATCH ACTION BAR: EXPAND ALL / COLLAPSE ALL */}
        <div className="flex items-center justify-between text-xs pt-1 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
              Generated Questions for {targetAudience.toUpperCase()}
            </span>
            <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
              {filteredQuestions.length} Questions Ready
            </span>
          </div>

          <button
            onClick={toggleAllElaborations}
            className="text-slate-600 hover:text-amber-700 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{expandedIds.size === filteredQuestions.length ? 'Collapse All Deep Dives' : 'Expand All Deep Dives'}</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* QUESTION CARDS WITH INTERACTIVE ELABORATION & DEEP DIVE TOGGLES          */}
        {/* ========================================================================= */}
        <div className="space-y-5">
          {filteredQuestions.map((item, idx) => {
            const isExpanded = expandedIds.has(item.id);
            const questionPersonalized = personalizeText(item.q);
            const openerPersonalized = personalizeText(item.elaboration.conversationalOpener);

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all ${
                  isExpanded
                    ? 'border-amber-300 bg-amber-50/10 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Main Question Card Header */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 tracking-wider">
                          #{idx + 1} &bull; {item.headline}
                        </span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Category: {item.category.toUpperCase()}
                        </span>
                        {item.stage !== 'all' && (
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                            {item.stage.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        "{questionPersonalized}"
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleCopySingle(item)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        title="Copy question and elaboration"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => toggleElaboration(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isExpanded
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        <span>{isExpanded ? 'Hide Deep Dive' : 'Elaborate & Deep Dive'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Why this works:</strong> {item.why}
                  </div>

                  {/* Surface Level Green & Red Flags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-100 text-emerald-950">
                      <span className="font-bold text-emerald-800 block mb-0.5">✅ Healthy Culture Signal:</span>
                      {item.greenFlag}
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-100 text-rose-950">
                      <span className="font-bold text-rose-800 block mb-0.5">⚠️ Red Flag Warning:</span>
                      {item.redFlag}
                    </div>
                  </div>
                </div>

                {/* ===================================================================== */}
                {/* ELABORATION ENGINE (DEEP DIVE ACCORDION)                              */}
                {/* ===================================================================== */}
                {isExpanded && (
                  <div className="border-t border-amber-200/60 bg-amber-50/20 p-5 sm:p-6 space-y-5 rounded-b-2xl animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                        Tactical Elaboration &amp; Live Interview Scripting
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Conversational Opener Script */}
                      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>How to Introduce This Naturally (Soft Opener)</span>
                        </div>
                        <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                          "{openerPersonalized}"
                        </p>
                        <div className="text-[11px] text-slate-500">
                          Framing the question around your personal desire to ship value prevents you from sounding confrontational.
                        </div>
                      </div>

                      {/* Counter-Probe Trap */}
                      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                          <span>The Counter-Probe (If they give a vague answer)</span>
                        </div>
                        <p className="text-xs text-amber-950 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100 font-medium leading-relaxed">
                          {item.elaboration.counterProbe}
                        </p>
                        <div className="text-[11px] text-slate-500">
                          Cuts through scripted PR answers by asking for a concrete, recent example rather than abstract policy.
                        </div>
                      </div>
                    </div>

                    {/* Underlying Psychology & Key Vocab */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      <div className="p-4 rounded-xl bg-white border border-slate-200 md:col-span-2 space-y-1.5">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Brain className="w-3.5 h-3.5 text-violet-600" />
                          <span>Under-The-Hood Interviewer Psychology</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.elaboration.psychology}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-teal-600" />
                          <span>Key Words to Listen For</span>
                        </div>
                        <div className="space-y-1 text-[11px]">
                          <div>
                            <span className="font-bold text-emerald-700">🟢 Positive: </span>
                            <span className="text-slate-600">{item.elaboration.greenKeywords.join(', ')}</span>
                          </div>
                          <div>
                            <span className="font-bold text-rose-700">🔴 Warning: </span>
                            <span className="text-slate-600">{item.elaboration.redKeywords.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
