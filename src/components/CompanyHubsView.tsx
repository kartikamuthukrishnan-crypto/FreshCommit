import React, { useState, useEffect, useMemo } from 'react';
import { CompanyHub, COMPANY_HUBS, CompanyCategory } from '../data/companyHubsData';
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
  AlertTriangle,
  X,
  Filter
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
  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
      const found = COMPANY_HUBS.find((c) => c.slug === slug);
      const title =
        slug === 'all'
          ? 'Tech Employer Early Career Hubs (2026) – FreshCommits'
          : `${found?.name} Entry-Level Software Engineer Hub & Salaries (2026) – FreshCommits`;
      document.title = title;
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentCompany = useMemo(() => {
    return COMPANY_HUBS.find((c) => c.slug === activeSlug) || null;
  }, [activeSlug]);

  // Filtered companies based on category & search
  const displayedCompanies = useMemo(() => {
    return COMPANY_HUBS.filter((hub) => {
      const matchesCategory = selectedCategory === 'All' || hub.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;
      const matchesSearch =
        hub.name.toLowerCase().includes(q) ||
        hub.tagline.toLowerCase().includes(q) ||
        hub.headquarters.toLowerCase().includes(q) ||
        hub.primaryRequisitions.some((r) => r.toLowerCase().includes(q)) ||
        hub.searchKeywords.some((k) => k.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Filter jobs matching current company
  const companyJobs = useMemo(() => {
    if (!currentCompany) return [];
    const query = currentCompany.name.toLowerCase();
    return jobs.filter((j) => j.company.toLowerCase().includes(query));
  }, [jobs, currentCompany]);

  // Aggregate stats across all supported employers
  const totalVerifiedCompanyJobs = useMemo(() => {
    const hubNames = COMPANY_HUBS.map((c) => c.name.toLowerCase());
    return jobs.filter((j) => {
      const c = j.company.toLowerCase();
      return hubNames.some((name) => c.includes(name));
    }).length;
  }, [jobs]);

  // Pillar guides data
  const PILLAR_GUIDES = [
    {
      id: 'top-tech-employers-hiring-0-experience-us-2026',
      badge: 'FAANG & Big Tech',
      title: 'FAANG 0-YoE Playbook: Google, Amazon, Microsoft & Stripe',
      desc: 'Case studies of non-CS and bootcamp candidates passing screening loops and clearing L3/SDE 1 pipelines.',
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    {
      id: 'fortune-500-consulting-enterprise-entry-level-swe-2026',
      badge: 'Enterprise & Consulting',
      title: 'Consulting Powerhouses: Accenture, Deloitte, Cognizant & Oracle',
      desc: 'Inside the high-volume campus cohorts, paid training academies, and cognitive assessment filters.',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    {
      id: 'unicorns-fintech-entry-level-swe-2026',
      badge: 'Unicorns & FinTech',
      title: 'High-Growth Unicorns: Uber, Airbnb, Palantir & Databricks',
      desc: 'Elite $185k+ total compensation tiers, practical IDE pair programming, and distributed systems screens.',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'remote-first-scale-up-entry-level-swe-2026',
      badge: 'Remote & Scale-Ups',
      title: '100% Remote Junior Roles: Shopify, Atlassian, GitHub & Discord',
      desc: 'Asynchronous engineering hygiene, public pull request etiquette, and landing remote US tech jobs.',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    }
  ];

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
          name: 'Tech Employer Entry Level Software Engineering Hubs (2026)',
          description: 'Official early career compensation benchmarks, technical interview stages, and verified entry-level software engineer jobs across FAANG, Enterprise, Unicorns, and Remote-first employers.',
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
          <span>Tech Employer Early Career Hubs &bull; {COMPANY_HUBS.length} Verified Employers (2026)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Tech Employer Career Hubs &amp; Salary Benchmarks
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Comprehensive, verified field intelligence on entry-level software engineering pipelines (0–2 YoE) across <strong>FAANG, Enterprise Consulting, Tech Unicorns, and Remote-First Scale-Ups</strong>. Explore realistic first-year total compensation, interview round teardowns, and live verified requisitions.
        </p>

        {/* Search & Compliance Trust Badge */}
        <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            AdSense Quality Assured
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            350,000+ Monthly US Search Demand
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            {totalVerifiedCompanyJobs} Live Verified Requisitions
          </span>
        </div>
      </div>

      {/* The 3 Core Pillar Guides Showcase Carousel / Grid */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              The 3 Official 0-YoE Pillar Guides
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Complete Editorial Screening &amp; Case Study Blueprints
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Select a pillar guide to read the full candidate case studies &amp; ATS breakdowns.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLAR_GUIDES.map((pillar) => (
            <div
              key={pillar.id}
              onClick={() => {
                if (onNavigateToArticle) {
                  onNavigateToArticle(pillar.id);
                } else {
                  window.location.href = `/insights/${pillar.id}`;
                }
              }}
              className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-400 transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
            >
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${pillar.color}`}>
                  {pillar.badge}
                </span>
                <h3 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors mt-2 leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-700/60 mt-3 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                <span>Read Full Guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter Chips & Quick Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['All', 'FAANG & Big Tech', 'Enterprise & Consulting', 'Unicorns & FinTech', 'Remote & Scale-Ups'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter company or stack..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Company Quick-Select Buttons */}
        <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-2xl border border-slate-200/80 overflow-x-auto">
          <button
            onClick={() => handleSelectTab('all')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSlug === 'all'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>All Companies Matrix ({displayedCompanies.length})</span>
          </button>

          {displayedCompanies.map((hub) => {
            const isActive = activeSlug === hub.slug;
            return (
              <button
                key={hub.slug}
                onClick={() => handleSelectTab(hub.slug)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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
      </div>

      {/* VIEW: All Hubs Comparative Matrix */}
      {activeSlug === 'all' && (
        <div className="space-y-10">
          {/* Comparative Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCompanies.map((hub) => (
              <div
                key={hub.slug}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: hub.brandColor }}
                        />
                        <h3 className="text-lg font-bold text-slate-900">{hub.name}</h3>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
                        {hub.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {hub.salaryTier.level}
                    </span>
                  </div>

                  {/* Compensation Metric Box */}
                  <div className="my-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Median US Total First-Year Comp
                    </div>
                    <div className="text-xl font-black text-emerald-700">
                      {hub.salaryTier.totalCompYear1}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Base Salary: <strong className="text-slate-800">{hub.salaryTier.medianBase}</strong>
                    </div>
                  </div>

                  {/* Quick specs */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate"><strong>HQ:</strong> {hub.headquarters}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate"><strong>Role:</strong> {hub.salaryTier.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span><strong>Search Demand:</strong> {hub.monthlySearchVolume} (KD {hub.organicKD})</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleSelectTab(hub.slug)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <span>View Hub &amp; Prep</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <a
                    href={hub.officialCareersUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800"
                  >
                    <span>Careers</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Full Comparison Table for AdSense & Organic SEO Depth */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                2026 Tech Employer Compensation &amp; Screening Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct side-by-side comparison across all {COMPANY_HUBS.length} indexed technology employers in the United States.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75">
                    <th className="py-3 px-4 font-bold text-slate-700">Company</th>
                    <th className="py-3 px-4 font-bold text-slate-700">Category</th>
                    <th className="py-3 px-4 font-bold text-slate-700">Entry Level</th>
                    <th className="py-3 px-4 font-bold text-slate-700">Median Base</th>
                    <th className="py-3 px-4 font-bold text-slate-700">Annual Equity</th>
                    <th className="py-3 px-4 font-bold text-slate-700">Sign-on</th>
                    <th className="py-3 px-4 font-bold text-slate-700">Total Year 1</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {displayedCompanies.map((c) => (
                    <tr key={c.slug} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.brandColor }} />
                        <button
                          onClick={() => handleSelectTab(c.slug)}
                          className="hover:underline text-left cursor-pointer"
                        >
                          {c.name}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{c.category}</td>
                      <td className="py-3 px-4">{c.salaryTier.level}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-800">{c.salaryTier.medianBase}</td>
                      <td className="py-3 px-4">{c.salaryTier.equityPerYear.split(' ')[0]}</td>
                      <td className="py-3 px-4">{c.salaryTier.signOnBonus.split(' ')[0]}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">{c.salaryTier.totalCompYear1}</td>
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
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                    {currentCompany.category}
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
                  {currentCompany.name} frequently updates early-career requisitions in seasonal waves. Check their official careers portal directly below.
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
