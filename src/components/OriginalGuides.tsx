import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  MapPin,
  CheckCircle,
  BookOpen,
  ShieldAlert,
  Award,
  ArrowUpRight,
  TrendingUp,
  ArrowRight,
  Clock,
  Sparkles,
  User,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { CAREER_ARTICLES } from '../data/careerArticles';
import { CareerArticleReader } from './CareerArticleReader';

interface SalaryHub {
  city: string;
  state: string;
  medianNewGrad: string;
  range: string;
  costIndex: string;
  topHiring: string;
  notes: string;
}

interface CountrySalaryProfile {
  countryCode: string;
  countryName: string;
  flag: string;
  currency: string;
  statutoryNotes: string;
  hubs: SalaryHub[];
}

const GLOBAL_SALARY_DATA: CountrySalaryProfile[] = [
  {
    countryCode: 'US',
    countryName: 'United States',
    flag: '🇺🇸',
    currency: 'USD ($)',
    statutoryNotes: 'Salary transparency laws in CA, NY, WA, and CO require employers to publish baseline salary ranges on all job listings. Most tech employers offer health insurance, 401(k) matching, and annual equity (RSUs).',
    hubs: [
      {
        city: 'San Francisco Bay Area',
        state: 'CA',
        medianNewGrad: '$142,000',
        range: '$120,000 – $170,000',
        costIndex: 'Very High',
        topHiring: 'Stripe, Cloudflare, OpenAI, Figma, Datadog',
        notes: 'Highest starting base compensation, high stock/RSU packages for fresh grads.',
      },
      {
        city: 'New York City',
        state: 'NY',
        medianNewGrad: '$135,000',
        range: '$115,000 – $165,000',
        costIndex: 'Very High',
        topHiring: 'Bloomberg, Datadog, Etsy, Google NYC, Palantir',
        notes: 'Strong FinTech, adtech, and consumer web starting salaries.',
      },
      {
        city: 'Seattle & Bellevue',
        state: 'WA',
        medianNewGrad: '$130,000',
        range: '$110,000 – $155,000',
        costIndex: 'High (0% State Tax)',
        topHiring: 'Microsoft, Remitly, Amazon, Tableau, F5',
        notes: 'No state income tax yields higher take-home compensation for new grads.',
      },
      {
        city: 'Austin Tech Hub',
        state: 'TX',
        medianNewGrad: '$118,000',
        range: '$95,000 – $135,000',
        costIndex: 'Moderate (0% State Tax)',
        topHiring: 'Atlassian, Dell, Indeed, Oracle, AMD',
        notes: 'Rapidly growing early-career hardware and cloud software engineering scene.',
      },
      {
        city: 'Boston & Cambridge',
        state: 'MA',
        medianNewGrad: '$116,000',
        range: '$95,000 – $132,000',
        costIndex: 'High',
        topHiring: 'HubSpot, Wayfair, DraftKings, Toast',
        notes: 'Thriving robotics, marketing tech, and biotech software development ecosystem.',
      },
      {
        city: 'Remote (US Nationwide)',
        state: 'US',
        medianNewGrad: '$110,000',
        range: '$85,000 – $130,000',
        costIndex: 'Flexible',
        topHiring: 'Automattic, GitLab, Vercel, Supabase, Zapier',
        notes: 'Typically calculated via localized cost-of-living tiers or national flat rates.',
      },
    ]
  },
  {
    countryCode: 'IN',
    countryName: 'India',
    flag: '🇮🇳',
    currency: 'INR (₹ Lakhs Per Annum)',
    statutoryNotes: 'Starting packages for 0–2 YoE typically structured as Fixed Base + PF + Gratuity + Performance Bonus. Product companies and top tier startups pay 2x–3x the IT services baseline.',
    hubs: [
      {
        city: 'Bengaluru / Bangalore',
        state: 'KA',
        medianNewGrad: '₹14.5 LPA',
        range: '₹8.5 LPA – ₹26.0 LPA',
        costIndex: 'High (India Tech)',
        topHiring: 'Swiggy, Flipkart, CRED, Google India, Amazon',
        notes: 'India’s Silicon Valley; highest density of global GCCs and high-paying tech unicorns.',
      },
      {
        city: 'Hyderabad',
        state: 'TS',
        medianNewGrad: '₹13.0 LPA',
        range: '₹8.0 LPA – ₹22.0 LPA',
        costIndex: 'Moderate-High',
        topHiring: 'Microsoft IDC, Uber, ServiceNow, Qualcomm, Salesforce',
        notes: 'Major cloud engineering and enterprise SaaS development hub with modern tech parks.',
      },
      {
        city: 'Pune',
        state: 'MH',
        medianNewGrad: '₹11.0 LPA',
        range: '₹6.5 LPA – ₹18.0 LPA',
        costIndex: 'Moderate',
        topHiring: 'Barclays, BMC Software, Nvidia, Bajaj Finserv Health',
        notes: 'Strong automotive tech, FinTech, and enterprise systems engineering clusters.',
      },
      {
        city: 'Delhi-NCR (Gurgaon / Noida)',
        state: 'NCR',
        medianNewGrad: '₹12.5 LPA',
        range: '₹7.5 LPA – ₹20.0 LPA',
        costIndex: 'High',
        topHiring: 'Zomato, MakeMyTrip, PayTM, Adobe, Airtel Digital',
        notes: 'Consumer tech, high-scale logistics, and media streaming platform engineering.',
      },
      {
        city: 'Remote (India)',
        state: 'IN',
        medianNewGrad: '₹12.0 LPA',
        range: '₹7.0 LPA – ₹24.0 LPA',
        costIndex: 'Flexible',
        topHiring: 'Postman, BrowserStack, Hasura, HackerRank',
        notes: 'Global distributed companies hiring in India often pay dollar-pegged compensation.',
      },
    ]
  },
  {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP (£)',
    statutoryNotes: 'Standard UK compensation includes workplace pension match (auto-enrolment 3%–8%), 25+ days paid annual leave, and statutory sick pay. London weighting typically adds 15%–25% to base pay.',
    hubs: [
      {
        city: 'London Tech Hub',
        state: 'ENG',
        medianNewGrad: '£52,000',
        range: '£40,000 – £70,000',
        costIndex: 'Very High',
        topHiring: 'Revolut, Monzo, DeepMind, Meta London, Bloomberg',
        notes: 'Global FinTech and AI research center with the highest UK starting developer rates.',
      },
      {
        city: 'Cambridge & Oxford',
        state: 'ENG',
        medianNewGrad: '£46,000',
        range: '£36,000 – £60,000',
        costIndex: 'High',
        topHiring: 'ARM, Amazon Cambridge, Graphcore, Darktrace',
        notes: 'Silicon Fen cluster; major hardware, semiconductor, and machine learning research.',
      },
      {
        city: 'Manchester & Leeds',
        state: 'ENG',
        medianNewGrad: '£38,000',
        range: '£30,000 – £48,000',
        costIndex: 'Moderate',
        topHiring: 'Auto Trader, Booking.com, BBC Technology, The Hut Group',
        notes: 'Thriving northern digital hub with significantly lower living costs than London.',
      },
      {
        city: 'Remote (United Kingdom)',
        state: 'UK',
        medianNewGrad: '£42,000',
        range: '£34,000 – £55,000',
        costIndex: 'Flexible',
        topHiring: 'Wise, Deliveroo, Octopus Energy, Gousto',
        notes: 'Competitive remote base salaries with standard UK statutory holiday and pension.',
      },
    ]
  },
  {
    countryCode: 'CA',
    countryName: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD (C$)',
    statutoryNotes: 'Canadian software packages include Canada Pension Plan (CPP) contributions, provincial health care coverage, and extended health/dental benefits.',
    hubs: [
      {
        city: 'Toronto & Kitchener-Waterloo',
        state: 'ON',
        medianNewGrad: 'C$95,000',
        range: 'C$80,000 – C$120,000',
        costIndex: 'High',
        topHiring: 'Shopify, Wealthsimple, Google Canada, Amazon',
        notes: 'Canada’s largest tech corridor; strong university engineering talent pipeline.',
      },
      {
        city: 'Vancouver',
        state: 'BC',
        medianNewGrad: 'C$92,000',
        range: 'C$78,000 – C$115,000',
        costIndex: 'Very High',
        topHiring: 'Slack, Electronic Arts, Hootsuite, Microsoft Vancouver',
        notes: 'Pacific Rim tech center; tight integration with Seattle engineering offices.',
      },
      {
        city: 'Montreal',
        state: 'QC',
        medianNewGrad: 'C$84,000',
        range: 'C$70,000 – C$105,000',
        costIndex: 'Moderate',
        topHiring: 'Ubisoft, Lightspeed, Morgan Stanley Technology, Element AI',
        notes: 'World-renowned AI research labs and video game graphics engineering ecosystem.',
      },
      {
        city: 'Remote (Canada)',
        state: 'CA',
        medianNewGrad: 'C$88,000',
        range: 'C$72,000 – C$112,000',
        costIndex: 'Flexible',
        topHiring: '1Password, FreshBooks, D2L, Wave HQ',
        notes: 'Remote-first Canadian companies often offer location-independent national rates.',
      },
    ]
  },
  {
    countryCode: 'DE',
    countryName: 'Germany & DACH',
    flag: '🇩🇪',
    currency: 'EUR (€)',
    statutoryNotes: 'Strict statutory employee protections: 30 days statutory vacation, public healthcare, unemployment insurance, and pension contributions split 50/50 with employer.',
    hubs: [
      {
        city: 'Berlin',
        state: 'BE',
        medianNewGrad: '€62,000',
        range: '€52,000 – €75,000',
        costIndex: 'High',
        topHiring: 'Delivery Hero, N26, Zalando, SoundCloud, Trade Republic',
        notes: 'Europe’s vibrant startup capital with English-first engineering teams and rapid career progression.',
      },
      {
        city: 'Munich',
        state: 'BY',
        medianNewGrad: '€66,000',
        range: '€56,000 – €80,000',
        costIndex: 'Very High',
        topHiring: 'Celonis, BMW Tech, Google Munich, Personio, Siemens',
        notes: 'Enterprise software, industrial automation, and deep tech with highest German base salaries.',
      },
      {
        city: 'Remote (Germany)',
        state: 'DE',
        medianNewGrad: '€60,000',
        range: '€50,000 – €72,000',
        costIndex: 'Flexible',
        topHiring: 'Contentful, Freeletics, Taxfix, Blinkist',
        notes: 'Standardized national contracts with standard German statutory social security contributions.',
      },
    ]
  },
  {
    countryCode: 'NL',
    countryName: 'Netherlands',
    flag: '🇳🇱',
    currency: 'EUR (€)',
    statutoryNotes: 'Qualifying foreign knowledge migrants may be eligible for the 30% tax ruling. Includes 8% mandatory holiday allowance (Vakantiegeld) paid each May.',
    hubs: [
      {
        city: 'Amsterdam',
        state: 'NH',
        medianNewGrad: '€64,000',
        range: '€54,000 – €78,000',
        costIndex: 'Very High',
        topHiring: 'Adyen, Booking.com, Uber EMEA, Miro, Databricks',
        notes: 'Global FinTech and internet infrastructure hub with highly international engineering cultures.',
      },
      {
        city: 'Eindhoven Brainport',
        state: 'NB',
        medianNewGrad: '€58,000',
        range: '€48,000 – €70,000',
        costIndex: 'Moderate',
        topHiring: 'ASML, Philips, NXP Semiconductors, VDL Group',
        notes: 'Hardware-software embedded systems and semiconductor lithography technology capital.',
      },
    ]
  },
  {
    countryCode: 'IE',
    countryName: 'Ireland',
    flag: '🇮🇪',
    currency: 'EUR (€)',
    statutoryNotes: 'European headquarters for the majority of US Big Tech firms. Highly competitive RSU stock grant culture alongside high Dublin rental costs.',
    hubs: [
      {
        city: 'Dublin Silicon Docks',
        state: 'LE',
        medianNewGrad: '€65,000',
        range: '€52,000 – €82,000',
        costIndex: 'Very High',
        topHiring: 'Stripe EMEA, Google, Workday, Meta, TikTok',
        notes: 'Premier European hub for US tech giants offering aggressive equity packages to new grads.',
      },
      {
        city: 'Cork & Galway',
        state: 'MU',
        medianNewGrad: '€54,000',
        range: '€44,000 – €68,000',
        costIndex: 'Moderate',
        topHiring: 'Apple Cork, VMware, Teamwork, Cisco Galway',
        notes: 'Lower living expenses with strong software and medical device technology employers.',
      },
    ]
  },
  {
    countryCode: 'AU',
    countryName: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD (A$)',
    statutoryNotes: 'Employers must pay mandatory Superannuation guarantee (11.5% in 2025–2026 on top of or inclusive of base salary). Standard 4 weeks annual leave.',
    hubs: [
      {
        city: 'Sydney',
        state: 'NSW',
        medianNewGrad: 'A$98,000',
        range: 'A$82,000 – A$125,000',
        costIndex: 'Very High',
        topHiring: 'Atlassian, Canva, Macquarie Group, Google Sydney, SafetyCulture',
        notes: 'Australia’s tech engine with high venture capital concentration and product engineering.',
      },
      {
        city: 'Melbourne',
        state: 'VIC',
        medianNewGrad: 'A$90,000',
        range: 'A$76,000 – A$115,000',
        costIndex: 'High',
        topHiring: 'REA Group, SEEK, Zendesk, Square Australia, MYOB',
        notes: 'Strong enterprise software, marketplace platforms, and design tech ecosystem.',
      },
      {
        city: 'Remote (Australia)',
        state: 'AU',
        medianNewGrad: 'A$86,000',
        range: 'A$72,000 – A$110,000',
        costIndex: 'Flexible',
        topHiring: 'Culture Amp, Deputy, Envato, Judo Bank',
        notes: 'Growing remote-first engineering adoption across Queensland and regional hubs.',
      },
    ]
  },
  {
    countryCode: 'SG',
    countryName: 'Singapore',
    flag: '🇸🇬',
    currency: 'SGD (S$)',
    statutoryNotes: 'Extremely favorable personal income tax rates (0%–22% progressive tier). Citizens and PRs contribute to Central Provident Fund (CPF).',
    hubs: [
      {
        city: 'Singapore Central & One-North',
        state: 'SG',
        medianNewGrad: 'S$72,000',
        range: 'S$58,000 – S$96,000',
        costIndex: 'Very High',
        topHiring: 'Grab, Shopee, Sea Group, ByteDance, GovTech Singapore',
        notes: 'Southeast Asia’s primary tech and finance hub with high demand for backend and mobile SWEs.',
      },
    ]
  },
  {
    countryCode: 'JP',
    countryName: 'Japan',
    flag: '🇯🇵',
    currency: 'JPY (¥ Millions)',
    statutoryNotes: 'Traditional bonus structures (summer + winter bonuses) are often included in total annual cash. English-speaking tech startups pay higher flat annual base salaries.',
    hubs: [
      {
        city: 'Tokyo Shibuya & Roppongi',
        state: 'TK',
        medianNewGrad: '¥5.8M',
        range: '¥4.5M – ¥8.2M',
        costIndex: 'High',
        topHiring: 'Mercari, LINE Yahoo, Rakuten, Woven Planet, Sony',
        notes: 'Globalizing tech scene with strong demand for international bilingual software engineers.',
      },
    ]
  },
  {
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'AED (د.إ)',
    statutoryNotes: '0% personal income tax and 0% capital gains tax. Expat employment packages typically include visa sponsorship, flight allowances, and private health insurance.',
    hubs: [
      {
        city: 'Dubai Internet City & DIFC',
        state: 'DXB',
        medianNewGrad: 'AED 160,000',
        range: 'AED 120,000 – AED 220,000',
        costIndex: 'High (0% Income Tax)',
        topHiring: 'Careem, Noon, Talabat, Kitopi, Binance Dubai',
        notes: 'Rapidly expanding MENA tech hub with high net take-home pay for early-career developers.',
      },
    ]
  },
  {
    countryCode: 'BR',
    countryName: 'Brazil & LATAM',
    flag: '🇧🇷',
    currency: 'BRL (R$) / USD ($)',
    statutoryNotes: 'CLT employment offers mandatory 13th salary, 30 days vacation, and FGTS fund. US companies hiring in LATAM typically pay in USD via Contractor agreements (PJ).',
    hubs: [
      {
        city: 'São Paulo Tech Hub',
        state: 'SP',
        medianNewGrad: 'R$ 84,000',
        range: 'R$ 60,000 – R$ 120,000',
        costIndex: 'Moderate (LATAM)',
        topHiring: 'Nubank, QuintoAndar, iFood, Stone, Mercado Libre',
        notes: 'FinTech and marketplace software powerhouse; Latin America’s largest tech cluster.',
      },
      {
        city: 'Remote LATAM (US Employers)',
        state: 'USD',
        medianNewGrad: '$42,000 USD',
        range: '$30,000 – $60,000 USD',
        costIndex: 'High Value',
        topHiring: 'Toptal, Braintrust, Deel, US Startups',
        notes: 'US tech startups hiring in same-timezone LATAM countries pay high-leverage USD rates.',
      },
    ]
  },
  {
    countryCode: 'GLOBAL',
    countryName: 'All Other Countries / Global Remote',
    flag: '🌐',
    currency: 'USD ($)',
    statutoryNotes: 'For developers in Eastern Europe, Southeast Asia, Africa, and Latin America. International remote companies (GitLab, Automattic, Deel) calculate compensation using standardized Cost-of-Living (COL) multipliers and Purchasing Power Parity (PPP).',
    hubs: [
      {
        city: 'Global Remote (Tier 1 Distributed)',
        state: 'Worldwide',
        medianNewGrad: '$58,000 USD',
        range: '$42,000 – $78,000 USD',
        costIndex: 'High Relative Value',
        topHiring: 'GitLab, Automattic, Deel, Remote.com, DuckDuckGo',
        notes: 'Worldwide contracts for entry-level developers regardless of geographic location.',
      },
      {
        city: 'Global Emerging Markets Baseline',
        state: 'Worldwide',
        medianNewGrad: '$36,000 USD',
        range: '$24,000 – $52,000 USD',
        costIndex: 'Cost Adjusted',
        topHiring: 'Canonical, Kraken, Buffer, Hotjar',
        notes: 'Standardized compensation tiers adjusted to local market purchasing power.',
      },
    ]
  }
];

export const SalaryGuideView: React.FC = () => {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('US');

  const currentCountry =
    GLOBAL_SALARY_DATA.find((c) => c.countryCode === selectedCountryCode) || GLOBAL_SALARY_DATA[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Original Industry Research &bull; 0–2 YoE Verification
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          2025–2026 Global Junior SWE Salary Index
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Comprehensive compensation benchmarks for fresh university graduates and junior software engineers (0–2 years of experience) across 12 countries and global remote markets.
        </p>

        {/* Cross-Navigation Banners for Visitors */}
        <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            <span>💼 View 93+ Verified 0–2 YoE Jobs</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </a>
          <a
            href="/career-tools"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold transition-all shadow-2xs"
          >
            <span>⚡ Test Your Resume on ATS Matcher (Free)</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
          </a>
        </div>
      </div>

      {/* Country Selector Dropdown & Region Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <label htmlFor="country-selector" className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Select Country / Region Benchmark:
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentCountry.flag}</span>
              <span className="text-lg sm:text-xl font-bold text-slate-900">
                {currentCountry.countryName}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentCountry.currency}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <select
              id="country-selector"
              value={selectedCountryCode}
              onChange={(e) => setSelectedCountryCode(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            >
              {GLOBAL_SALARY_DATA.map((c) => (
                <option key={c.countryCode} value={c.countryCode}>
                  {c.flag} {c.countryName} ({c.currency})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Country Statutory & Compensation Notes */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-1">
          <strong className="text-slate-800 font-bold block">
            Statutory &amp; Market Context for {currentCountry.countryName}:
          </strong>
          <p>{currentCountry.statutoryNotes}</p>
        </div>
      </div>

      {/* Benchmarks Grid for Selected Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCountry.hubs.map((hub, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-indigo-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 font-bold text-slate-900 text-base">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  {hub.city}
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {hub.state}
                </span>
              </div>

              <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Median Starting Base:</div>
                <div className="text-2xl font-extrabold text-emerald-700 mt-0.5">{hub.medianNewGrad}</div>
                <div className="text-xs text-slate-600 mt-1">Typical Range: {hub.range}</div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div>
                  <strong className="text-slate-800">Cost of Living:</strong> {hub.costIndex}
                </div>
                <div>
                  <strong className="text-slate-800">Top Early-Career Employers:</strong> {hub.topHiring}
                </div>
                <p className="pt-2 text-slate-500 italic">{hub.notes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Guide Content for AdSense Quality Assurance */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          How to Pass Entry-Level Technical Resume Screens
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700 leading-relaxed">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Quantified Project Impact
            </h3>
            <p className="text-xs text-slate-600">
              When applying with 0 YoE, replace generic course descriptions with metric-driven accomplishments:
              <em> &ldquo;Built a full-stack real-time collaborative markdown editor in Next.js & WebSockets supporting 50+ concurrent users with &lt;100ms latency.&rdquo;</em>
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Direct Company Submissions Over InMail
            </h3>
            <p className="text-xs text-slate-600">
              All listings on FreshCommits point directly to official company career portals. Submitting directly through verified early-career employer pipelines significantly speeds review compared to 3rd-party aggregators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdSensePolicyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          AdSense Compliance & Transparency
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-3">Google AdSense Policy Center</h1>
        <p className="text-sm text-slate-600 mt-2">
          How FreshCommits upholds Google publisher policies, protects user experience, and enforces strict editorial guidelines.
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            1. Non-Deceptive Ad Placement & Labeling
          </h2>
          <p>
            In accordance with Google AdSense program policies:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
            <li>All advertisement placements are explicitly labeled with <strong>&ldquo;Advertisement&rdquo;</strong>.</li>
            <li>Ad slots maintain generous margins and distinct boundaries, preventing accidental clicks on navigation or application buttons.</li>
            <li>We do not encourage users to click ads, nor do we employ deceptive pop-ups or interstitial screens.</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            2. Anti-Thin Content & Original Value Commitment
          </h2>
          <p>
            Google AdSense enforces strict guidelines against low-value or scraped content. FreshCommits combats thin aggregation by providing:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
            <li>Original salary index research across Silicon Valley, NYC, Seattle, Austin, Boston, and Remote tech centers.</li>
            <li>Strict human and automated relevancy filtering (&le; 2 YoE only), stripping senior/lead clutter.</li>
            <li>Exact unparaphrased job descriptions preserving authentic employer requirements without artificial AI spinning.</li>
            <li>Full Google <code>JobPosting</code> JSON-LD structured data for every listing.</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            3. Privacy Policy & Cookie Disclosures (GDPR / CCPA / DART)
          </h2>
          <p className="text-xs text-slate-600">
            Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to this website or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visit to our sites and/or other sites on the Internet. Users may opt out of personalized advertising by visiting{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 font-semibold underline"
            >
              Google Ads Settings
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export const CareerInsightsView: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [articlesPerPage, setArticlesPerPage] = useState<number>(6);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    const paramArticle = urlParams.get('article') || urlParams.get('id');
    if (paramArticle && CAREER_ARTICLES.some((a) => a.id === paramArticle)) {
      return paramArticle;
    }
    const hash = window.location.hash.replace('#', '');
    if (CAREER_ARTICLES.some((a) => a.id === hash)) {
      return hash;
    }
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if ((pathParts[0] === 'blog' || pathParts[0] === 'career-insights' || pathParts[0] === 'insights' || pathParts[0] === 'article' || pathParts[0] === 'guides') && pathParts[1]) {
      const match = CAREER_ARTICLES.find((a) => a.id === pathParts[1]);
      if (match) return match.id;
    }
    if (pathParts.length === 1) {
      const match = CAREER_ARTICLES.find((a) => a.id === pathParts[0]);
      if (match) return match.id;
    }
    return null;
  });

  useEffect(() => {
    const handleUrlChange = () => {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if ((pathParts[0] === 'blog' || pathParts[0] === 'career-insights' || pathParts[0] === 'insights' || pathParts[0] === 'article' || pathParts[0] === 'guides') && pathParts[1]) {
        const match = CAREER_ARTICLES.find((a) => a.id === pathParts[1]);
        if (match) {
          setSelectedArticleId(match.id);
          return;
        }
      }
      if (pathParts.length === 1) {
        const match = CAREER_ARTICLES.find((a) => a.id === pathParts[0]);
        if (match) {
          setSelectedArticleId(match.id);
          return;
        }
      }
      const hash = window.location.hash.replace('#', '');
      if (CAREER_ARTICLES.some((a) => a.id === hash)) {
        setSelectedArticleId(hash);
      } else if (!hash || hash === 'insights' || hash === 'guides' || hash === 'blog') {
        setSelectedArticleId(null);
      }
    };
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Reset to page 1 whenever category or search filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTag, searchQuery, articlesPerPage]);

  const handleSelectArticle = (id: string) => {
    setSelectedArticleId(id);
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', `/insights/${id}`);
    } else {
      window.location.hash = id;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToOverview = () => {
    setSelectedArticleId(null);
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '/insights');
    } else {
      window.location.hash = '';
    }
  };

  const selectedArticle = selectedArticleId
    ? CAREER_ARTICLES.find((a) => a.id === selectedArticleId)
    : null;

  // If user selected an article, show the full in-depth article view
  if (selectedArticle) {
    return (
      <CareerArticleReader
        article={selectedArticle}
        onBack={handleBackToOverview}
        onSelectArticle={handleSelectArticle}
        allArticles={CAREER_ARTICLES}
      />
    );
  }

  const allTags = ['All', ...Array.from(new Set(CAREER_ARTICLES.map((a) => a.tag)))];

  const filteredArticles = CAREER_ARTICLES.filter((a) => {
    const matchesTag = selectedTag === 'All' || a.tag === selectedTag;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesTag;
    const matchesSearch =
      a.title.toLowerCase().includes(q) ||
      a.subtitle.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tag.toLowerCase().includes(q) ||
      a.highlights.some((h) => h.toLowerCase().includes(q));
    return matchesTag && matchesSearch;
  });

  const totalArticles = filteredArticles.length;
  const totalPages = Math.max(1, Math.ceil(totalArticles / articlesPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * articlesPerPage;
  const endIndex = Math.min(startIndex + articlesPerPage, totalArticles);
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Generate pagination items with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (activePage > 3) pages.push('...');
      const start = Math.max(2, activePage - 1);
      const end = Math.min(totalPages - 1, activePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (activePage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-3">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          FreshCommits Career Insights &bull; {CAREER_ARTICLES.length} Editorial Field Guides
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Engineering Career Guides &amp; Practical Field Notes
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
          Comprehensive, original editorial guides on compensation math, professional git hygiene, production-grade portfolio architectures, system design fundamentals, and team mentorship evaluation for 0–2 YoE developers.
        </p>

        <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-xl inline-flex items-center gap-2.5 text-left text-[11px] text-slate-500 max-w-2xl mx-auto shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            <strong className="text-slate-700">Editorial Standards:</strong> We utilize automated research and linguistic tools to assist our editorial workflow. Every guide is fact-checked, structured, and reviewed by human domain engineering specialists prior to publication.
          </span>
        </div>
      </div>

      {/* Search Bar & Quick Filters */}
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <Search className="w-4 h-4 text-[#1a73e8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides by keyword, stack, interview question, or role..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white rounded-xl border-2 border-slate-400 hover:border-[#1a73e8] focus:outline-none focus:ring-4 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] shadow-xs transition-all text-[#202124] placeholder-slate-500 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
        {allTags.map((tag) => {
          const isActive = selectedTag === tag;
          const count = tag === 'All'
            ? CAREER_ARTICLES.length
            : CAREER_ARTICLES.filter((a) => a.tag === tag).length;
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tag} <span className="opacity-75 text-[11px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Results Header with Page Status & Page Size Selector */}
      <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-b border-slate-100 pb-3 flex-wrap gap-2">
        <div>
          {totalArticles > 0 ? (
            <span>
              Showing <strong className="text-slate-900">{startIndex + 1}</strong>–<strong className="text-slate-900">{endIndex}</strong> of <strong className="text-slate-900">{totalArticles}</strong> guides
              {selectedTag !== 'All' && <span> in <span className="text-emerald-700 font-semibold">{selectedTag}</span></span>}
              {searchQuery && <span> matching &ldquo;<span className="text-slate-900 font-semibold">{searchQuery}</span>&rdquo;</span>}
            </span>
          ) : (
            <span>No matching field guides</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Per page:</span>
            {[6, 12, 24].map((size) => (
              <button
                key={size}
                onClick={() => setArticlesPerPage(size)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  articlesPerPage === size
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          {totalPages > 1 && (
            <span className="text-slate-400 font-medium text-[11px]">
              Page {activePage} of {totalPages}
            </span>
          )}
        </div>
      </div>

      {/* Grid of Articles */}
      {currentArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentArticles.map((art) => (
            <article
              key={art.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
              onClick={() => handleSelectArticle(art.id)}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    {art.tag}
                  </span>
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {art.readTime}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-emerald-700 transition-colors">
                  {art.title}
                </h2>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                  {art.summary}
                </p>

                {/* Author Byline for Google E-E-A-T Transparency */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-6 h-6 rounded-full ${art.author.avatarBg || 'bg-slate-800'} text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 shadow-2xs`}>
                      {art.author.initials || art.author.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-slate-900">{art.author.name}</span>
                      <span className="text-slate-400 mx-1">&bull;</span>
                      <span className="text-slate-500 truncate">{art.author.shortRole || art.author.role}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 shrink-0">
                    E-E-A-T Verified
                  </span>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Core Topics Covered
                  </div>
                  {art.highlights.slice(0, 3).map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span className="line-clamp-1">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectArticle(art.id);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 group-hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Read Full Field Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching career field guides found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or reset category filter to see all guides.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSelectedTag('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{startIndex + 1}</span>–<span className="font-bold text-slate-900">{endIndex}</span> of <span className="font-bold text-slate-900">{totalArticles}</span> field guides (Page <span className="font-bold text-slate-900">{activePage}</span> of {totalPages})
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <button
              onClick={() => handlePageChange(activePage - 1)}
              disabled={activePage === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, idx) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 text-xs select-none">
                      &hellip;
                    </span>
                  );
                }
                const isCurrent = page === activePage;
                return (
                  <button
                    key={`page-${page}`}
                    onClick={() => handlePageChange(Number(page))}
                    className={`min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(activePage + 1)}
              disabled={activePage === totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Next Page"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

