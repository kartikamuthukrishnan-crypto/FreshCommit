import React, { useState, useMemo, useEffect } from 'react';
import { JobPosting, AdSenseConfig, JobCategory, ExperienceLevel } from '../types';
import { JobCard } from './JobCard';
import { AdSlot } from './AdSlot';
import {
  Search,
  MapPin,
  Briefcase,
  Filter,
  DollarSign,
  Globe,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Building2,
  Calendar,
  Layers,
  FileSearch,
  ExternalLink
} from 'lucide-react';

interface JobDirectoryViewProps {
  jobs: JobPosting[];
  onSelectJob: (job: JobPosting) => void;
  adConfig: AdSenseConfig;
  savedJobIds?: string[];
  onToggleSaveJob?: (jobId: string, e: React.MouseEvent) => void;
  onNavigateTab?: (tab: any) => void;
  initialCategory?: string;
  initialHub?: string;
  initialSearch?: string;
}

const TECH_HUBS = [
  { label: 'All Locations', value: 'All' },
  { label: '🇺🇸 United States (Nationwide)', value: 'US' },
  { label: '🌐 Worldwide Remote', value: 'Worldwide' },
  { label: '🌉 San Francisco Bay Area, CA', value: 'San Francisco' },
  { label: '🗽 New York City, NY', value: 'New York' },
  { label: '🌲 Seattle / Bellevue, WA', value: 'Seattle' },
  { label: '🤠 Austin / Dallas, TX', value: 'Austin' },
  { label: '🏔️ Denver / Boulder, CO', value: 'Denver' },
  { label: '🇬🇧 London / United Kingdom', value: 'GB' },
  { label: '🍁 Toronto / Vancouver, CA', value: 'Canada' },
  { label: '🇮🇳 Bengaluru / Hyderabad, IN', value: 'India' }
];

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All Roles', value: 'All' },
  { label: 'Full Stack', value: 'Full Stack' },
  { label: 'Frontend', value: 'Frontend' },
  { label: 'Backend', value: 'Backend' },
  { label: 'Data & AI', value: 'Data / AI' },
  { label: 'DevOps & Cloud', value: 'DevOps / Cloud' },
  { label: 'Mobile (iOS/Android)', value: 'Mobile' },
  { label: 'QA & Automation', value: 'QA / Test' },
  { label: 'Others', value: 'Others' }
];

export const JobDirectoryView: React.FC<JobDirectoryViewProps> = ({
  jobs,
  onSelectJob,
  adConfig,
  savedJobIds = [],
  onToggleSaveJob,
  onNavigateTab,
  initialCategory = 'All',
  initialHub = 'All',
  initialSearch = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedHub, setSelectedHub] = useState(initialHub);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedExperience, setSelectedExperience] = useState<string>('All');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'salary'>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 12;

  // Sync title, description, canonical link, and ItemList schema for SEO & Google for Jobs
  useEffect(() => {
    const originalTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const originalDesc = metaDesc?.content || '';
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const originalCanonical = canonical?.href || 'https://www.freshcommits.com/';

    // Update document title
    document.title = 'Verified Entry-Level & New Grad Tech Jobs Directory (0–2 YoE) – FreshCommits';

    // Update meta description
    if (metaDesc) {
      metaDesc.content = 'Search and browse 100+ verified entry-level, fresher, and new grad software engineering jobs (0–2 YoE) across US & global tech hubs. Direct employer ATS application links.';
    }

    // Set canonical link to /jobs
    if (canonical) {
      canonical.href = 'https://www.freshcommits.com/jobs';
    }

    // Inject ItemList + BreadcrumbList JSON-LD structured data for Google crawl graph
    const scriptId = 'google-jobs-directory-schema';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const activeListings = jobs.filter((j) => j.status === 'ACTIVE').slice(0, 30);
    const directorySchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': 'https://www.freshcommits.com/jobs#collection',
          'url': 'https://www.freshcommits.com/jobs',
          'name': 'Verified Entry-Level & New Grad Software Engineer Jobs Directory',
          'description': 'Direct ATS job postings for early-career developers with 0 to 2 years of experience.',
          'isPartOf': {
            '@type': 'WebSite',
            '@id': 'https://www.freshcommits.com/#website',
            'name': 'FreshCommits',
            'url': 'https://www.freshcommits.com/'
          }
        },
        {
          '@type': 'BreadcrumbList',
          '@id': 'https://www.freshcommits.com/jobs#breadcrumb',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': 'https://www.freshcommits.com/'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Jobs Directory',
              'item': 'https://www.freshcommits.com/jobs'
            }
          ]
        },
        {
          '@type': 'ItemList',
          '@id': 'https://www.freshcommits.com/jobs#itemlist',
          'numberOfItems': activeListings.length,
          'itemListElement': activeListings.map((job, idx) => ({
            '@type': 'ListItem',
            'position': idx + 1,
            'url': `https://www.freshcommits.com/job/${encodeURIComponent(job.id)}`,
            'name': `${job.title} at ${job.company}`
          }))
        }
      ]
    };

    scriptEl.textContent = JSON.stringify(directorySchema, null, 2);

    return () => {
      document.title = originalTitle;
      if (metaDesc) metaDesc.content = originalDesc;
      if (canonical) canonical.href = originalCanonical;
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [jobs]);

  // Active jobs filter
  const activeJobs = useMemo(() => {
    return jobs.filter((j) => j.status === 'ACTIVE');
  }, [jobs]);

  // Multi-facet filtering
  const filteredJobs = useMemo(() => {
    return activeJobs.filter((job) => {
      // 1. Text Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = job.title?.toLowerCase().includes(query);
        const companyMatch = job.company?.toLowerCase().includes(query);
        const skillMatch = job.skills?.some((s) => s.toLowerCase().includes(query));
        const locationMatch = job.location?.toLowerCase().includes(query);
        const descMatch = job.description?.toLowerCase().includes(query);
        if (!titleMatch && !companyMatch && !skillMatch && !locationMatch && !descMatch) {
          return false;
        }
      }

      // 2. Tech Hub / Location Filter
      if (selectedHub !== 'All') {
        const loc = (job.location || '').toLowerCase();
        const cty = (job.city || '').toLowerCase();
        const st = (job.state || '').toLowerCase();
        const cntry = (job.country || '').toUpperCase();
        const req = (job.applicantLocationRequirements || '').toUpperCase();

        if (selectedHub === 'US') {
          const isUS = cntry === 'US' || req === 'US' || /,\s*(?:ca|ny|tx|wa|co|ma|il|fl|nc|va|ga|or|az|oh|pa|nj)\b/i.test(loc);
          if (!isUS) return false;
        } else if (selectedHub === 'Worldwide') {
          const isWw = loc.includes('worldwide') || loc.includes('global') || req === 'WORLDWIDE' || req === 'GLOBAL';
          if (!isWw) return false;
        } else if (selectedHub === 'San Francisco') {
          if (!loc.includes('san francisco') && !loc.includes('bay area') && !cty.includes('san francisco')) return false;
        } else if (selectedHub === 'New York') {
          if (!loc.includes('new york') && !loc.includes('nyc') && !cty.includes('new york')) return false;
        } else if (selectedHub === 'Seattle') {
          if (!loc.includes('seattle') && !loc.includes('bellevue') && !cty.includes('seattle')) return false;
        } else if (selectedHub === 'Austin') {
          if (!loc.includes('austin') && !loc.includes('dallas') && !cty.includes('austin')) return false;
        } else if (selectedHub === 'Denver') {
          if (!loc.includes('denver') && !loc.includes('boulder') && !cty.includes('denver')) return false;
        } else if (selectedHub === 'GB') {
          if (cntry !== 'GB' && req !== 'GB' && !loc.includes('london') && !loc.includes('uk')) return false;
        } else if (selectedHub === 'Canada') {
          if (cntry !== 'CA' && req !== 'CA' && !loc.includes('toronto') && !loc.includes('vancouver')) return false;
        } else if (selectedHub === 'India') {
          if (cntry !== 'IN' && req !== 'IN' && !loc.includes('india') && !loc.includes('bengaluru')) return false;
        }
      }

      // 3. Category Filter
      if (selectedCategory !== 'All') {
        if (job.category !== selectedCategory) return false;
      }

      // 4. Experience Level Filter
      if (selectedExperience !== 'All') {
        if (selectedExperience === 'Internship') {
          if (job.experienceLevel !== 'Internship') return false;
        } else if (selectedExperience === 'Entry Level') {
          if (job.experienceLevel === 'Internship') return false;
        } else if (selectedExperience === 'New Grad') {
          if (job.experienceLevel !== 'New Grad' && !job.title.toLowerCase().includes('new grad')) return false;
        }
      }

      // 5. Remote Only Filter
      if (remoteOnly && !job.isRemote) return false;

      // 6. Saved Only Filter
      if (savedOnly && !savedJobIds.includes(job.id)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'salary') {
        const salA = a.salary?.max || a.salary?.min || 0;
        const salB = b.salary?.max || b.salary?.min || 0;
        return salB - salA;
      }
      // Default: Latest posted date
      const dateA = new Date(a.datePosted || 0).getTime();
      const dateB = new Date(b.datePosted || 0).getTime();
      return dateB - dateA;
    });
  }, [activeJobs, searchQuery, selectedHub, selectedCategory, selectedExperience, remoteOnly, savedOnly, sortBy, savedJobIds]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedHub, selectedCategory, selectedExperience, remoteOnly, savedOnly, sortBy]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const target = document.getElementById('jobs-directory-grid');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedHub('All');
    setSelectedCategory('All');
    setSelectedExperience('All');
    setRemoteOnly(false);
    setSavedOnly(false);
    setSortBy('latest');
  };

  return (
    <div className="min-h-screen bg-[#F0F8FF] text-[#202124]">
      {/* Top Breadcrumb Navigation Bar */}
      <div className="bg-white border-b border-[#dadce0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-[#5f6368]">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateTab) onNavigateTab('jobs');
                else window.location.href = '/';
              }}
              className="hover:text-[#1a73e8] transition-colors"
            >
              Home
            </a>
            <ChevronRight className="w-3 h-3 text-[#dadce0]" />
            <span className="font-semibold text-[#202124]">Browse Jobs Directory</span>
            <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333] font-medium text-[11px] border border-[#ceead6]">
              <CheckCircle2 className="w-3 h-3" />
              {activeJobs.length} Live Direct Requisitions
            </span>
          </nav>
        </div>
      </div>

      {/* Directory Page Hero Header */}
      <section className="bg-white border-b border-[#dadce0] pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8] text-xs font-semibold border border-[#d2e3fc] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dedicated Requisition Index &bull; Zero Ghost Postings</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#202124] tracking-tight leading-tight mb-3">
              Verified Entry-Level &amp; New Grad Software Engineer Jobs
            </h1>
            <p className="text-sm sm:text-base text-[#5f6368] leading-relaxed">
              Every position below is strictly filtered for <strong>0 to 2 years of experience</strong> with direct application links to company Applicant Tracking Systems (Greenhouse, Lever, Ashby, Workday).
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#f1f3f4]">
            <div className="bg-[#f8f9fa] rounded-xl p-3 border border-[#e8eaed]">
              <span className="text-[11px] text-[#5f6368] block">Total Active Roles</span>
              <span className="text-lg font-bold text-[#202124]">{activeJobs.length}</span>
            </div>
            <div className="bg-[#f8f9fa] rounded-xl p-3 border border-[#e8eaed]">
              <span className="text-[11px] text-[#5f6368] block">Direct ATS Verified</span>
              <span className="text-lg font-bold text-[#137333]">100%</span>
            </div>
            <div className="bg-[#f8f9fa] rounded-xl p-3 border border-[#e8eaed]">
              <span className="text-[11px] text-[#5f6368] block">Experience Cap</span>
              <span className="text-lg font-bold text-[#1a73e8]">0–2 YoE</span>
            </div>
            <div className="bg-[#f8f9fa] rounded-xl p-3 border border-[#e8eaed]">
              <span className="text-[11px] text-[#5f6368] block">Update Cadence</span>
              <span className="text-lg font-bold text-amber-600">Daily Sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Search & Filter Console */}
      <section className="bg-[#F0F8FF] border-b border-[#dadce0] py-6 px-4 sm:px-6 lg:px-8 sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Main Search Input */}
          <div className="bg-white border-2 border-slate-300 hover:border-[#1a73e8] focus-within:border-[#1a73e8] focus-within:ring-4 focus-within:ring-[#1a73e8]/20 shadow-sm rounded-full px-5 py-3 flex items-center gap-3 transition-all">
            <Search className="w-5 h-5 text-[#1a73e8] shrink-0" />
            <input
              id="directory-search-input"
              type="text"
              placeholder="Search by job title, company (Google, Palantir, Stripe), skill (React, Python, Go), or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm sm:text-base text-[#202124] placeholder-slate-500 bg-transparent focus:outline-none font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#5f6368] hover:text-[#202124] px-2.5 py-1 rounded-full hover:bg-[#f1f3f4] cursor-pointer font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Dropdowns and Quick Pills */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Dropdown */}
              <select
                id="dir-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 px-3.5 rounded-full text-xs font-medium border border-[#dadce0] bg-white text-[#3c4043] focus:outline-none focus:border-[#1a73e8] cursor-pointer hover:bg-[#f8f9fa] transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              {/* Location Hub Dropdown */}
              <select
                id="dir-hub-select"
                value={selectedHub}
                onChange={(e) => setSelectedHub(e.target.value)}
                className="h-9 px-3.5 rounded-full text-xs font-medium border border-[#dadce0] bg-white text-[#3c4043] focus:outline-none focus:border-[#1a73e8] cursor-pointer hover:bg-[#f8f9fa] transition-colors"
              >
                {TECH_HUBS.map((hub) => (
                  <option key={hub.value} value={hub.value}>
                    {hub.label}
                  </option>
                ))}
              </select>

              {/* Experience Pills */}
              <button
                onClick={() => setSelectedExperience(selectedExperience === 'Entry Level' ? 'All' : 'Entry Level')}
                className={`h-9 px-3.5 rounded-full text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-1 ${
                  selectedExperience === 'Entry Level'
                    ? 'bg-[#1a73e8] text-white shadow-xs'
                    : 'bg-white border border-[#dadce0] text-[#5f6368] hover:text-[#202124] hover:bg-[#f8f9fa]'
                }`}
              >
                <span>Entry Level (0–2 YoE)</span>
              </button>

              <button
                onClick={() => setSelectedExperience(selectedExperience === 'Internship' ? 'All' : 'Internship')}
                className={`h-9 px-3.5 rounded-full text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-1 ${
                  selectedExperience === 'Internship'
                    ? 'bg-[#1a73e8] text-white shadow-xs'
                    : 'bg-white border border-[#dadce0] text-[#5f6368] hover:text-[#202124] hover:bg-[#f8f9fa]'
                }`}
              >
                <span>🎓 Internships</span>
              </button>

              {/* Remote Toggle */}
              <label className="h-9 inline-flex items-center gap-2 px-3.5 rounded-full border border-[#dadce0] bg-white text-xs font-medium text-[#3c4043] cursor-pointer hover:bg-[#f8f9fa] transition-colors select-none">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="rounded text-[#1a73e8] focus:ring-[#1a73e8] w-3.5 h-3.5"
                />
                <span>Remote Only</span>
              </label>

              {/* Saved Only Toggle */}
              {savedJobIds.length > 0 && (
                <button
                  onClick={() => setSavedOnly(!savedOnly)}
                  className={`h-9 px-3.5 rounded-full text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-1 ${
                    savedOnly
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white border border-[#dadce0] text-[#5f6368] hover:text-[#202124] hover:bg-[#f8f9fa]'
                  }`}
                >
                  <span>⭐ Saved ({savedJobIds.length})</span>
                </button>
              )}
            </div>

            {/* Sort & Reset */}
            <div className="flex items-center gap-2 ml-auto">
              <select
                id="dir-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 px-3 rounded-full text-xs font-medium border border-[#dadce0] bg-white text-[#3c4043] focus:outline-none focus:border-[#1a73e8] cursor-pointer"
              >
                <option value="latest">Sort: Latest Posted</option>
                <option value="salary">Sort: Highest Salary</option>
              </select>

              {(searchQuery || selectedHub !== 'All' || selectedCategory !== 'All' || selectedExperience !== 'All' || remoteOnly || savedOnly) && (
                <button
                  onClick={handleResetFilters}
                  className="h-9 px-3 rounded-full text-xs font-medium border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Job Cards Grid Section */}
      <main id="jobs-directory-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-28">
        {/* Results Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#202124]">
              {selectedExperience === 'Internship'
                ? 'Summer Tech Internships'
                : selectedCategory !== 'All'
                ? `${selectedCategory} Roles`
                : 'All Software Engineering Positions'}
            </h2>
            <span className="text-xs bg-[#e8f0fe] text-[#1a73e8] font-bold px-2 py-0.5 rounded-full border border-[#d2e3fc]">
              {filteredJobs.length} openings
            </span>
          </div>

          <span className="text-xs text-[#5f6368]">
            Page {safeCurrentPage} of {totalPages}
          </span>
        </div>

        {/* Top In-Feed Ad Banner if enabled */}
        {adConfig.enabled && adConfig.headerAd && (
          <div className="mb-6">
            <AdSlot type="leaderboard" config={adConfig} />
          </div>
        )}

        {/* Zero Results State */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white border border-[#dadce0] rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto my-12 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#202124]">No matching job posts found</h3>
              <p className="text-xs sm:text-sm text-[#5f6368] mt-1 max-w-md mx-auto">
                No active 0–2 YoE roles match your current filters ({searchQuery ? `"${searchQuery}"` : selectedCategory}). Try expanding your search or resetting filters.
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-full transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Grid of Job Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSelect={onSelectJob}
                  isSaved={savedJobIds.includes(job.id)}
                  onToggleSave={onToggleSaveJob}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#dadce0]">
                <div className="text-xs text-[#5f6368]">
                  Showing <span className="font-semibold text-[#202124]">{startIndex + 1}</span>–
                  <span className="font-semibold text-[#202124]">{Math.min(endIndex, filteredJobs.length)}</span> of{' '}
                  <span className="font-semibold text-[#202124]">{filteredJobs.length}</span> verified postings
                </div>

                <div className="flex items-center gap-1.5">
                  {/* First Page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={safeCurrentPage === 1}
                    className="p-2 rounded-lg border border-[#dadce0] bg-white text-[#5f6368] hover:bg-[#f8f9fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="First Page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={() => handlePageChange(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#dadce0] bg-white text-xs font-semibold text-[#3c4043] hover:bg-[#f8f9fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - safeCurrentPage) <= 1
                      );
                    })
                    .map((page, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && page - prev > 1;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-1 text-xs text-[#80868b]">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                              safeCurrentPage === page
                                ? 'bg-[#1a73e8] text-white shadow-xs'
                                : 'bg-white border border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa]'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  {/* Next Page */}
                  <button
                    onClick={() => handlePageChange(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#dadce0] bg-white text-xs font-semibold text-[#3c4043] hover:bg-[#f8f9fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={safeCurrentPage === totalPages}
                    className="p-2 rounded-lg border border-[#dadce0] bg-white text-[#5f6368] hover:bg-[#f8f9fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Last Page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Directory Educational Hub & Verification FAQ */}
        <section className="mt-16 pt-12 border-t border-[#dadce0]">
          <div className="bg-white rounded-2xl border border-[#dadce0] p-6 sm:p-10 shadow-xs space-y-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a73e8] uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-[#137333]" />
                Google for Jobs Quality Standards
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#202124]">
                How FreshCommits Verifies Early-Career Software Engineer Jobs
              </h3>
              <p className="text-xs sm:text-sm text-[#5f6368] mt-2 leading-relaxed">
                We reject 80%+ of incoming aggregations to protect early-career candidates from phantom requisitions, third-party staffing commission traps, and misleading senior titles labeled as entry-level.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl bg-[#f8f9fa] border border-[#e8eaed] space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h4 className="text-sm font-bold text-[#202124]">Direct ATS Endpoint Auditing</h4>
                <p className="text-xs text-[#5f6368] leading-relaxed">
                  Every requisition is checked against official employer APIs (Greenhouse, Lever, Ashby, Workday). If a role is closed on the employer's board, it is purged from our index within 24 hours.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#f8f9fa] border border-[#e8eaed] space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h4 className="text-sm font-bold text-[#202124]">Strict 0–2 YoE Experience Cap</h4>
                <p className="text-xs text-[#5f6368] leading-relaxed">
                  We analyze job descriptions for hidden requirements. Postings that demand 3+, 5+, or 7+ years of experience under a "junior" title are disqualified immediately.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#f8f9fa] border border-[#e8eaed] space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h4 className="text-sm font-bold text-[#202124]">Transparent Salary Disclosures</h4>
                <p className="text-xs text-[#5f6368] leading-relaxed">
                  We normalize state pay transparency disclosures (California SB 1162, New York City Local Law 144) to ensure compensation is visible before you spend time interviewing.
                </p>
              </div>
            </div>

            {/* Quick Cross-Links */}
            <div className="pt-6 border-t border-[#f1f3f4] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#5f6368]">
                <span>Looking for company-specific hiring guides?</span>
                <a
                  href="/companies"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateTab) onNavigateTab('companies');
                  }}
                  className="text-[#1a73e8] font-semibold hover:underline flex items-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Explore Company Hubs (FAANG & Unicorns)</span>
                </a>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="/salary-guide"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateTab) onNavigateTab('salary-guide');
                  }}
                  className="text-xs text-[#1a73e8] font-semibold hover:underline"
                >
                  2026 Salary Index →
                </a>
                <a
                  href="/career-tools"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateTab) onNavigateTab('tools');
                  }}
                  className="text-xs text-[#1a73e8] font-semibold hover:underline"
                >
                  Free ATS Matcher &amp; Tools →
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
