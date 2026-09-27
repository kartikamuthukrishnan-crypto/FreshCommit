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
  X
} from 'lucide-react';
import { CAREER_ARTICLES } from '../data/careerArticles';
import { CareerArticleReader } from './CareerArticleReader';

export const SalaryGuideView: React.FC = () => {
  const hubs = [
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
      costIndex: 'High (0% State Income Tax)',
      topHiring: 'Microsoft, Remitly, Amazon, Tableau, F5',
      notes: 'No state income tax yields higher take-home compensation for new grads.',
    },
    {
      city: 'Austin Tech Hub',
      state: 'TX',
      medianNewGrad: '$118,000',
      range: '$95,000 – $135,000',
      costIndex: 'Moderate (0% State Income Tax)',
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
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Original Industry Research & Insights
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
          2025–2026 Entry-Level Software Engineer Salary Index
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
          Comprehensive compensation benchmarks for fresh university graduates and junior software engineers (0–2 years of experience) across major US tech hubs.
        </p>
      </div>

      {/* Benchmarks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hubs.map((hub, idx) => (
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
    if ((pathParts[0] === 'blog' || pathParts[0] === 'career-insights' || pathParts[0] === 'insights') && pathParts[1]) {
      const match = CAREER_ARTICLES.find((a) => a.id === pathParts[1]);
      if (match) return match.id;
    }
    return null;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (CAREER_ARTICLES.some((a) => a.id === hash)) {
        setSelectedArticleId(hash);
      } else if (!hash || hash === 'insights' || hash === 'guides' || hash === 'blog') {
        setSelectedArticleId(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Reset to page 1 whenever category or search filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTag, searchQuery, articlesPerPage]);

  const handleSelectArticle = (id: string) => {
    setSelectedArticleId(id);
    window.location.hash = id;
  };

  const handleBackToOverview = () => {
    setSelectedArticleId(null);
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
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
      </div>

      {/* Search Bar & Quick Filters */}
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides by keyword, stack, interview question, or role..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-xs transition-all"
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

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
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

