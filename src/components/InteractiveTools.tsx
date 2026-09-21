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
  MessageSquareQuote
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
const ReverseInterviewGenerator: React.FC = () => {
  const [targetAudience, setTargetAudience] = useState<'manager' | 'peer' | 'skip-level'>('manager');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const questionSets = {
    manager: [
      {
        q: 'How do you structure PR reviews, pairing, and onboarding buddies for an entry-level engineer during their first 90 days?',
        why: 'Exposes whether they have a structured mentorship pipeline or expect you to sink-or-swim.',
        greenFlag: 'Dedicated pairing schedules, weekly 1:1 check-ins, designated onboarding tickets.',
        redFlag: '"We just let new hires explore the codebase until they feel comfortable."',
      },
      {
        q: 'What was the last production incident or outage caused by a junior engineer, and how did the team post-mortem handle it?',
        why: 'Tests whether the team practices psychological safety and blameless post-mortems or blames individuals.',
        greenFlag: 'Blameless retrospectives, automated test additions to prevent recurrence.',
        redFlag: 'Pointing fingers or taking away production access permissions as punishment.',
      },
      {
        q: 'How are expectations for early-career developers communicated between "Meeting Expectations" vs. "Exceeding Expectations"?',
        why: 'Ensures you have transparent promotion criteria from day one.',
        greenFlag: 'Documented engineering career ladder rubrics and concrete milestone goals.',
        redFlag: 'Vague metrics like "just be proactive and work hard."',
      },
    ],
    peer: [
      {
        q: 'How frequently do pull requests sit awaiting review, and how are code review disagreements resolved?',
        why: 'Reveals true team velocity, PR hygiene, and whether senior engineers act as gatekeepers.',
        greenFlag: '<24 hour PR review turnaround times with constructive inline comments.',
        redFlag: 'PRs sitting for weeks or bike-shedding over minor formatting preferences.',
      },
      {
        q: 'What does the team on-call rotation look like, and at what point in tenure do junior engineers join the rotation?',
        why: 'Tests for after-hours burnout and whether new hires are thrown onto on-call prematurely.',
        greenFlag: 'Shadowing senior engineers for 6+ months before ever holding primary pager.',
        redFlag: 'Unpaid on-call with frequent middle-of-the-night alerts caused by flaky services.',
      },
      {
        q: 'What is the most frustrating part of setting up and developing against the local environment right now?',
        why: 'Junior peers will speak candidly about technical debt that managers rarely mention.',
        greenFlag: 'Honest answers like "Docker setup can be slow, but we are migrating to Dev Containers."',
        redFlag: '"It takes 3 weeks just to get local database credentials approved."',
      },
    ],
    'skip-level': [
      {
        q: 'How do you balance shipping new customer features against refactoring core architectural technical debt?',
        why: 'Identifies whether product management steamrolls engineering reliability.',
        greenFlag: 'Dedicated 20% sprint allocations or recurring "fix-it" weeks.',
        redFlag: '100% feature factory focus with zero tolerance for refactoring.',
      },
      {
        q: 'What is the company\'s strategic stance on in-office vs. remote flexibility over the next 12 to 24 months?',
        why: 'Protects you against unannounced return-to-office (RTO) mandates after accepting a role.',
        greenFlag: 'Explicit, transparent long-term workplace policies.',
        redFlag: 'Evasive answers like "we are currently evaluating executive preferences."',
      },
    ],
  };

  const currentList = questionSets[targetAudience];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-amber-600" />
            Reverse-Interview Diagnostic Question Generator
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            When the interviewer asks <code className="font-mono text-amber-800 font-bold">"Do you have any questions for us?"</code>, never say no. Use these battle-tested questions to diagnose mentorship bandwidth and team health.
          </p>
        </div>

        {/* Target Audience Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setTargetAudience('manager')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              targetAudience === 'manager'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Interviewing with: Engineering Manager (EM)
          </button>
          <button
            onClick={() => setTargetAudience('peer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              targetAudience === 'peer'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Interviewing with: Senior Peer / Tech Lead
          </button>
          <button
            onClick={() => setTargetAudience('skip-level')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              targetAudience === 'skip-level'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Interviewing with: Director / VP of Engineering
          </button>
        </div>

        {/* Questions Cards */}
        <div className="space-y-4">
          {currentList.map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm font-bold text-slate-900 leading-snug">
                  "{item.q}"
                </div>
                <button
                  onClick={() => handleCopy(item.q, idx)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                >
                  {copiedIndex === idx ? (
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
              </div>

              <div className="text-xs text-slate-600">
                <strong className="text-slate-800">Why it works:</strong> {item.why}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-950">
                  <span className="font-bold text-emerald-800">✅ Healthy Culture Signal:</span> {item.greenFlag}
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-950">
                  <span className="font-bold text-rose-800">⚠️ Red Flag Warning:</span> {item.redFlag}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
