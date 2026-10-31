import React, { useState, useEffect, useMemo } from 'react';
import { CompanyHub, COMPANY_HUBS } from '../data/companyHubsData';
import { JobPosting } from '../types';
import { JobCard } from './JobCard';
import {
  Building2,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Briefcase,
  ExternalLink,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Search,
  Code2,
  Users,
  MapPin,
  Clock,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

interface CompanyHubsViewProps {
  jobs: JobPosting[];
  onSelectJob: (job: JobPosting) => void;
  initialSlug?: string;
  onNavigateToArticle?: (articleId: string) => void;
}

export const CompanyHubsView: React.FC<CompanyHubsViewProps> = ({
  jobs,
  onSelectJob,
  initialSlug,
  onNavigateToArticle
}) => {
  // Slug state
  const [activeSlug, setActiveSlug] = useState<string>(() => {
    if (initialSlug && COMPANY_HUBS.some((c) => c.slug === initialSlug)) {
      return initialSlug;
    }
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramSlug = urlParams.get('company');
      if (paramSlug && COMPANY_HUBS.some((c) => c.slug === paramSlug.toLowerCase())) {
        return paramSlug.toLowerCase();
      }
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts[0] === 'companies' && pathParts[1]) {
        const found = COMPANY_HUBS.find((c) => c.slug === pathParts[1].toLowerCase());
        if (found) return found.slug;
      }
    }
    return 'all';
  });

  // Listen to popstate / url changes
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paramSlug = urlParams.get('company');
      if (paramSlug && COMPANY_HUBS.some((c) => c.slug === paramSlug.toLowerCase())) {
        setActiveSlug(paramSlug.toLowerCase());
        return;
      }
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts[0] === 'companies' && pathParts[1]) {
        const found = COMPANY_HUBS.find((c) => c.slug === pathParts[1].toLowerCase());
        if (found) {
          setActiveSlug(found.slug);
          return;
        }
      }
      if (pathParts[0] === 'companies' && !pathParts[1]) {
        setActiveSlug('all');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectTab = (slug: string) => {
    setActiveSlug(slug);
    try {
      const newUrl = slug === 'all' ? '/companies' : `/companies/${slug}`;
      window.history.pushState(null, '', newUrl);
      const title =
        slug === 'all'
          ? 'FAANG & Tech Unicorn Early Career Hubs (2026) – FreshCommits'
          : `${COMPANY_HUBS.find((c) => c.slug === slug)?.name} Entry-Level Software Engineer Hub & Salaries – FreshCommits`;
      document.title = title;
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentCompany = useMemo(() => {
    return COMPANY_HUBS.find((c) => c.slug === activeSlug) || null;
  }, [activeSlug]);

  // Filter jobs matching current company
  const companyJobs = useMemo(() => {
    if (!currentCompany) return [];
    const query = currentCompany.name.toLowerCase();
    return jobs.filter((j) => j.company.toLowerCase().includes(query));
  }, [jobs, currentCompany]);

  // Aggregate stats
  const totalVerifiedCompanyJobs = useMemo(() => {
    return jobs.filter((j) => {
      const c = j.company.toLowerCase();
      return c.includes('google') || c.includes('amazon') || c.includes('microsoft') || c.includes('stripe');
    }).length;
  }, [jobs]);

  // Inject JSON-LD Schema for rich search snippet
  useEffect(() => {
    const scriptId = 'company-hubs-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemaData = currentCompany
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          name: `${currentCompany.name} Entry Level Software Engineer Career Hub`,
          description: `2026 early career software developer compensation, interview rounds, and verified zero-experience requisitions at ${currentCompany.name}.`,
          mainEntity: currentCompany.faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer
            }
          }))
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'FAANG & Tech Unicorn Entry Level Software Engineering Hubs (2026)',
          description: 'Official early career compensation benchmarks, technical interview stages, and verified entry-level software engineer jobs at Google, Amazon, Microsoft, and Stripe.',
          url: 'https://freshcommits.com/companies'
        };

    scriptTag.text = JSON.stringify(schemaData);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [currentCompany]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>FAANG &amp; Tech Unicorn Employer Hubs &bull; 2026 Edition</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Big Tech Entry-Level Career Hubs &amp; Salary Benchmarks
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Comprehensive, verified field intelligence on entry-level software engineering pipelines (0–2 YoE) at <strong>Google, Amazon, Microsoft, and Stripe</strong>. Explore realistic first-year total compensation, interview round teardowns, and live verified requisitions.
        </p>

        {/* Search & Compliance Trust Badge */}
        <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            AdSense Quality Assured
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            90,000+ Monthly US Search Demand
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            {totalVerifiedCompanyJobs} Verified FAANG Openings
          </span>
        </div>
      </div>

      {/* Cross-Link to the Cornerstone Guide */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-slate-800">
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Brand New Editorial Field Guide
          </span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Top Tech Employers Hiring with 0 Commercial Experience in the US (2026)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Read our step-by-step teardown with real candidate case studies: how a biology major got hired at Google L3, a bootcamp grad cleared Amazon SDE 1, and a college senior passed Stripe's practical screening without prior internships.
          </p>
        </div>
        <button
          onClick={() => {
            if (onNavigateToArticle) {
              onNavigateToArticle('top-tech-employers-hiring-0-experience-us-2026');
            } else {
              window.location.href = '/insights/top-tech-employers-hiring-0-experience-us-2026';
            }
          }}
          className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
        >
          <span>Read Full 0-YoE Guide</span>
          <ArrowRight className="w-4 h-4 text-indigo-600" />
        </button>
      </div>

      {/* Company Selector Navigation Tabs */}
      <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 max-w-2xl mx-auto overflow-x-auto">
        <button
          onClick={() => handleSelectTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSlug === 'all'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-slate-500" />
          <span>All 4 Hubs</span>
        </button>

        {COMPANY_HUBS.map((hub) => {
          const isActive = activeSlug === hub.slug;
          return (
            <button
              key={hub.slug}
              onClick={() => handleSelectTab(hub.slug)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: hub.brandColor }}
              />
              <span>{hub.name}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW: All Hubs Comparative Matrix */}
      {activeSlug === 'all' && (
        <div className="space-y-10">
          {/* Comparative Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COMPANY_HUBS.map((hub) => (
              <div
                key={hub.slug}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: hub.brandColor }}
                        />
                        <h3 className="text-xl font-bold text-slate-900">{hub.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{hub.tagline}</p>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {hub.salaryTier.level}
                    </span>
                  </div>

                  {/* Compensation Metric Box */}
                  <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Median US Total First-Year Compensation
                    </div>
                    <div className="text-2xl font-black text-emerald-700">
                      {hub.salaryTier.totalCompYear1}
                    </div>
                    <div className="text-xs text-slate-600">
                      Base Salary: <strong className="text-slate-800">{hub.salaryTier.medianBase}</strong> ({hub.salaryTier.baseSalaryRange})
                    </div>
                  </div>

                  {/* Quick specs */}
                  <div className="space-y-2 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span><strong>Tech Hubs:</strong> {hub.usTechHubs.slice(0, 3).join(', ')}...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span><strong>Requisition:</strong> {hub.salaryTier.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span><strong>US Search Demand:</strong> {hub.monthlySearchVolume} (KD {hub.organicKD})</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleSelectTab(hub.slug)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <span>View Salary &amp; Interview Breakdown</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <a
                    href={hub.officialCareersUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Full Comparison Table for AdSense & Organic SEO Depth */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  2026 Big Tech Entry-Level Compensation &amp; Screening Matrix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct side-by-side comparison across Google, Amazon, Microsoft, and Stripe US engineering pipelines.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75">
                    <th className="py-3 px-4 font-bold text-slate-700">Company</th>
                    <th className="py-3 px-4 font-bold text-slate-700">Entry Level</th>
                    <th className="py-3 px-4 font-bold text-slate-700">Median Base</th>
                    <th className="py-3 px-4 font-bold text-slate-700">Annual Equity / RSUs</th>
                    <th className="py-3 px-4 font-bold text-slate-700">Sign-on Bonus</th>
                    <th className="py-3 px-4 font-bold text-slate-700">Total Year 1</th>
                    <th className="py-3 px-4 font-bold text-slate-700">Screening Style</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {COMPANY_HUBS.map((c) => (
                    <tr key={c.slug} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.brandColor }} />
                        {c.name}
                      </td>
                      <td className="py-3.5 px-4">{c.salaryTier.level}</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-800">{c.salaryTier.medianBase}</td>
                      <td className="py-3.5 px-4">{c.salaryTier.equityPerYear}</td>
                      <td className="py-3.5 px-4">{c.salaryTier.signOnBonus}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">{c.salaryTier.totalCompYear1}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {c.slug === 'google' && 'Algorithmic Big-O & Googleyness'}
                        {c.slug === 'amazon' && 'HackerRank OA + 14 Leadership Principles'}
                        {c.slug === 'microsoft' && 'Codility + Growth Mindset Collaboration'}
                        {c.slug === 'stripe' && 'Practical IDE Bug-Squash & API Integration'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Single Company In-Depth Hub */}
      {currentCompany && (
        <div className="space-y-10">
          {/* Company Hero Profile */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: currentCompany.brandColor }}
                  />
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {currentCompany.name} Entry-Level Engineering Hub
                  </h2>
                </div>
                <p className="text-sm text-slate-600 mt-1 font-medium">{currentCompany.tagline}</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    HQ: {currentCompany.headquarters}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Level: {currentCompany.salaryTier.level}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    US Monthly Search: {currentCompany.monthlySearchVolume}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 flex items-center gap-3">
                <a
                  href={currentCompany.officialCareersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs"
                >
                  <span>Apply on Official Portal</span>
                  <ExternalLink className="w-4 h-4 text-emerald-400" />
                </a>
              </div>
            </div>

            {/* 2026 Compensation Tiers Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                2026 Verified Compensation Benchmark ({currentCompany.salaryTier.level})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Base Salary Range</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{currentCompany.salaryTier.baseSalaryRange}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Median: {currentCompany.salaryTier.medianBase}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Annual Equity / RSUs</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{currentCompany.salaryTier.equityPerYear.split(' ')[0]}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Vesting schedule applies</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Sign-on Bonus</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{currentCompany.salaryTier.signOnBonus.split(' ')[0]}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Paid upon start date</div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Total Year 1 Comp</div>
                  <div className="text-xl font-black text-emerald-900 mt-1">{currentCompany.salaryTier.totalCompYear1}</div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">US National Average</div>
                </div>
              </div>

              {/* US Location Tiers */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                <strong className="text-slate-900 font-bold block">US Cost-of-Living Regional Tiers:</strong>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="font-bold text-slate-900 block">Tier 1 Metros:</span>
                    <span className="text-emerald-700 font-semibold">{currentCompany.salaryTier.locationTiers.tier1}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="font-bold text-slate-900 block">Tier 2 Metros:</span>
                    <span className="text-emerald-700 font-semibold">{currentCompany.salaryTier.locationTiers.tier2}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="font-bold text-slate-900 block">Tier 3 / Remote US:</span>
                    <span className="text-emerald-700 font-semibold">{currentCompany.salaryTier.locationTiers.tier3}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interview Stages Teardown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-600" />
                {currentCompany.name} Step-by-Step Technical Interview Teardown
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                What interviewers evaluate across each round and the exact screening criteria needed to advance.
              </p>
            </div>

            <div className="space-y-4">
              {currentCompany.interviewStages.map((stage, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">{stage.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{stage.duration}</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-indigo-600 font-medium">{stage.format}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <strong>Evaluation Focus:</strong> {stage.focus}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] font-bold text-slate-500">Tested Topics:</span>
                    {stage.keyTopics.map((topic, tidx) => (
                      <span
                        key={tidx}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Insider Screener Advice:</strong> {stage.screeningTips}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Behavioral Framework & Values */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Behavioral Evaluation: {currentCompany.behavioralValues.frameworkName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {currentCompany.behavioralValues.description}
            </p>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Typical Behavioral Questions Asked to Early Career Engineers:
              </span>
              <div className="grid grid-cols-1 gap-2.5">
                {currentCompany.behavioralValues.sampleQuestions.map((q, qidx) => (
                  <div
                    key={qidx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium flex items-start gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0 mt-1.5" />
                    <span>&ldquo;{q}&rdquo;</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 leading-relaxed">
              <strong className="font-bold block mb-1">Preparation Framework:</strong>
              {currentCompany.behavioralValues.prepAdvice}
            </div>
          </div>

          {/* Zero Experience Tactics & Portfolio Criteria */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              0-Experience Playbook for {currentCompany.name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                <strong className="text-emerald-900 font-bold block text-sm">
                  Recommended Portfolio Projects:
                </strong>
                <ul className="space-y-1.5 list-disc list-inside text-slate-700 leading-relaxed">
                  {currentCompany.zeroExperienceStrategy.portfolioCriteria.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-2">
                <strong className="text-rose-900 font-bold block text-sm">
                  Fatal Screening Mistakes to Avoid:
                </strong>
                <ul className="space-y-1.5 list-disc list-inside text-slate-700 leading-relaxed">
                  {currentCompany.zeroExperienceStrategy.screeningPitfalls.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-xs text-slate-600 pt-1">
              <strong>Hiring Cycle &amp; Application Window:</strong> {currentCompany.zeroExperienceStrategy.idealTimeline}
            </div>
          </div>

          {/* Live Verified Job Requisitions for this Company */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Live Verified 0–2 YoE Roles at {currentCompany.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct ATS verified requisitions on FreshCommits matching {currentCompany.name}.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                {companyJobs.length} Active Requisitions
              </span>
            </div>

            {companyJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {companyJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onSelect={onSelectJob}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">No Requisitions Currently Open in Database</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {currentCompany.name} frequently updates early career requisitions in seasonal waves. Check their official careers portal directly below.
                </p>
                <a
                  href={currentCompany.officialCareersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  <span>Visit {currentCompany.name} Careers</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* FAQ Accordion Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              Frequently Asked Questions: {currentCompany.name} Early Career
            </h3>

            <div className="space-y-3 pt-2">
              {currentCompany.faqs.map((faq, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-sm">{faq.question}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
