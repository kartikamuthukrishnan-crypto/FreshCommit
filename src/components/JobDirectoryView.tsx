import React, { useState, useMemo, useEffect } from 'react';
import { JobPosting, AdSenseConfig } from '../types';
import { compareJobsLatestFirst } from '../utils/jobSorting';
import { sanitizeJobTitle } from '../utils/jobSanitizer';
import {
  JobFeedControls,
  JobFilterState,
  ViewModeOption,
  applyJobFiltersAndSort,
} from './JobFeedControls';
import { JobListItem } from './JobListItem';
import { JobCard } from './JobCard';
import { AdSlot } from './AdSlot';
import {
  Filter,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Building2,
  BookOpen,
  Clock,
  Sparkles,
} from 'lucide-react';

interface JobDirectoryViewProps {
  jobs: JobPosting[];
  onSelectJob: (job: JobPosting) => void;
  adConfig: AdSenseConfig;
  savedJobIds?: string[];
  onToggleSaveJob?: (jobId: string, e: React.MouseEvent) => void;
  onNavigateTab?: (tab: any) => void;
  onOpenArticle?: (articleId: string) => void;
  initialCategory?: string;
  initialHub?: string;
  initialSearch?: string;
}

export const JobDirectoryView: React.FC<JobDirectoryViewProps> = ({
  jobs,
  onSelectJob,
  adConfig,
  savedJobIds = [],
  onToggleSaveJob,
  onNavigateTab,
  onOpenArticle,
  initialCategory = 'All',
  initialHub = 'All',
  initialSearch = '',
}) => {
  const [filterState, setFilterState] = useState<JobFilterState>({
    searchQuery: initialSearch,
    selectedHub: initialHub,
    selectedCategory: initialCategory,
    workMode: 'All',
    experience: 'All',
    workAuth: 'All',
    postedWithin: 'any',
    sortBy: 'latest',
    savedOnly: false,
  });
  const [viewMode, setViewMode] = useState<ViewModeOption>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 15;

  const updateFilters = (patch: Partial<JobFilterState>) => {
    setFilterState((prev) => ({ ...prev, ...patch }));
  };

  const handleResetFilters = () => {
    setFilterState({
      searchQuery: '',
      selectedHub: 'All',
      selectedCategory: 'All',
      workMode: 'All',
      experience: 'All',
      workAuth: 'All',
      postedWithin: 'any',
      sortBy: 'latest',
      savedOnly: false,
    });
  };

  // Sync title, description, canonical link, and ItemList schema for SEO & Google for Jobs
  useEffect(() => {
    const originalTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const originalDesc = metaDesc?.content || '';
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const originalCanonical = canonical?.href || 'https://www.freshcommits.com/';

    document.title = 'Verified Entry-Level & New Grad Tech Jobs Directory (0–2 YoE) – FreshCommits';

    if (metaDesc) {
      metaDesc.content =
        'Search and browse verified entry-level, fresher, and new grad software engineering jobs (0–2 YoE) across US & global tech hubs. Direct employer ATS application links.';
    }

    if (canonical) {
      canonical.href = 'https://www.freshcommits.com/jobs';
    }

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
          url: 'https://www.freshcommits.com/jobs',
          name: 'Verified Entry-Level & New Grad Software Engineer Jobs Directory',
          description:
            'Direct ATS job postings for early-career developers with 0 to 2 years of experience.',
          isPartOf: {
            '@type': 'WebSite',
            '@id': 'https://www.freshcommits.com/#website',
            name: 'FreshCommits',
            url: 'https://www.freshcommits.com/',
          },
        },
        {
          '@type': 'BreadcrumbList',
          '@id': 'https://www.freshcommits.com/jobs#breadcrumb',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://www.freshcommits.com/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Jobs Directory',
              item: 'https://www.freshcommits.com/jobs',
            },
          ],
        },
        {
          '@type': 'ItemList',
          '@id': 'https://www.freshcommits.com/jobs#itemlist',
          numberOfItems: activeListings.length,
          itemListElement: activeListings.map((job, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: `https://www.freshcommits.com/job/${encodeURIComponent(job.id)}`,
            name: `${sanitizeJobTitle(job.title)} at ${job.company}`,
          })),
        },
      ],
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

  const activeJobs = useMemo(() => {
    return jobs.filter((j) => j.status === 'ACTIVE').sort(compareJobsLatestFirst);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return applyJobFiltersAndSort(activeJobs, filterState, savedJobIds);
  }, [activeJobs, filterState, savedJobIds]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterState]);

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

  return (
    <div className="min-h-screen bg-[#F0F8FF] text-[#202124]">
      {/* Top Breadcrumb Bar */}
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
            <span className="font-semibold text-[#202124]">All Jobs</span>
            <span className="ml-auto text-[11px] font-medium text-[#5f6368] tabular-nums">
              {activeJobs.length} active positions
            </span>
          </nav>
        </div>
      </div>

      {/* Directory Compact Header */}
      <section className="bg-white border-b border-[#dadce0] pt-6 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight mb-2">
            Entry-Level &amp; New Grad Software Engineering Jobs
          </h1>
          <p className="text-sm text-[#5f6368] max-w-2xl">
            Curated early-career openings filtered for <strong>0–2 years of experience</strong> with direct employer application links.
          </p>
        </div>
      </section>

      {/* Search & Multi-Facet Filter Bar */}
      <section className="bg-[#F0F8FF] border-b border-[#dadce0] py-5 px-4 sm:px-6 lg:px-8 sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto">
          <JobFeedControls
            state={filterState}
            onChange={updateFilters}
            onReset={handleResetFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            savedCount={savedJobIds.length}
            searchInputId="directory-search-input"
          />
        </div>
      </section>

      {/* Main Listings Container */}
      <main id="jobs-directory-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 scroll-mt-28">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold text-[#202124]">
              {filterState.experience !== 'All'
                ? `${filterState.experience} Openings`
                : filterState.selectedCategory !== 'All'
                ? `${filterState.selectedCategory} Roles`
                : 'Open Positions'}
            </h2>
            <span className="text-xs bg-[#e8f0fe] text-[#1a73e8] font-semibold px-2.5 py-0.5 rounded-md tabular-nums">
              {filteredJobs.length}
            </span>
          </div>

          <span className="text-xs text-[#5f6368] tabular-nums">
            Page {safeCurrentPage} of {totalPages}
          </span>
        </div>

        {/* Top Ad Banner if enabled */}
        {adConfig.enabled && adConfig.headerAd && (
          <div className="mb-6">
            <AdSlot type="leaderboard" config={adConfig} />
          </div>
        )}

        {/* Results */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white border border-[#dadce0] rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto my-10 space-y-4 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#202124]">No matching positions found</h3>
              <p className="text-xs sm:text-sm text-[#5f6368] mt-1 max-w-md mx-auto">
                No active 0–2 YoE roles match your current filters. Try adjusting your search criteria or clearing filters.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear all filters</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {viewMode === 'list' ? (
              <div className="space-y-3">
                {paginatedJobs.slice(0, 6).map((job) => (
                  <JobListItem
                    key={job.id}
                    job={job}
                    onSelect={onSelectJob}
                    isSaved={savedJobIds.includes(job.id)}
                    onToggleSave={onToggleSaveJob}
                  />
                ))}

                {adConfig.enabled && adConfig.inFeedAd && (
                  <div className="py-2">
                    <AdSlot type="in-feed" config={adConfig} />
                  </div>
                )}

                {paginatedJobs.slice(6).map((job) => (
                  <JobListItem
                    key={job.id}
                    job={job}
                    onSelect={onSelectJob}
                    isSaved={savedJobIds.includes(job.id)}
                    onToggleSave={onToggleSaveJob}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginatedJobs.slice(0, 6).map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSelect={onSelectJob}
                      isSaved={savedJobIds.includes(job.id)}
                      onToggleSave={onToggleSaveJob}
                    />
                  ))}
                </div>

                {adConfig.enabled && adConfig.inFeedAd && (
                  <div className="py-2">
                    <AdSlot type="in-feed" config={adConfig} />
                  </div>
                )}

                {paginatedJobs.length > 6 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {paginatedJobs.slice(6).map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onSelect={onSelectJob}
                        isSaved={savedJobIds.includes(job.id)}
                        onToggleSave={onToggleSaveJob}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#dadce0]">
                <div className="text-xs text-[#5f6368] tabular-nums">
                  Showing <span className="font-semibold text-[#202124]">{startIndex + 1}</span>–
                  <span className="font-semibold text-[#202124]">{Math.min(endIndex, filteredJobs.length)}</span> of{' '}
                  <span className="font-semibold text-[#202124]">{filteredJobs.length}</span> openings
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePageChange(1)}
                    disabled={safeCurrentPage === 1}
                    className="p-2 rounded-lg border border-[#dadce0] bg-white text-[#5f6368] hover:bg-[#f8f9fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="First Page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePageChange(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#dadce0] bg-white text-xs font-semibold text-[#3c4043] hover:bg-[#f8f9fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => page === 1 || page === totalPages || Math.abs(page - safeCurrentPage) <= 1)
                    .map((page, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && page - prev > 1;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && <span className="px-1 text-xs text-[#80868b]">...</span>}
                          <button
                            type="button"
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer tabular-nums ${
                              safeCurrentPage === page
                                ? 'bg-[#1a73e8] text-white'
                                : 'bg-white border border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa]'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    type="button"
                    onClick={() => handlePageChange(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#dadce0] bg-white text-xs font-semibold text-[#3c4043] hover:bg-[#f8f9fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={safeCurrentPage === totalPages}
                    className="p-2 rounded-lg border border-[#dadce0] bg-white text-[#5f6368] hover:bg-[#f8f9fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Last Page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Educational Standards & Career Guides */}
        <section className="mt-14 pt-10 border-t border-[#dadce0] space-y-8">
          <div className="bg-white rounded-2xl border border-[#dadce0] p-6 sm:p-8 shadow-2xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a73e8] uppercase tracking-wider mb-1.5">
                <ShieldCheck className="w-4 h-4 text-[#137333]" />
                <span>Requisition Standards</span>
              </div>
              <h3 className="text-xl font-bold text-[#202124]">
                How FreshCommits Curates Early-Career Roles
              </h3>
              <p className="text-xs sm:text-sm text-[#5f6368] mt-1.5 leading-relaxed">
                Every position is checked against direct employer ATS portals and filtered to exclude 3+ year senior requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#e8eaed] space-y-1.5">
                <h4 className="text-sm font-bold text-[#202124]">Direct Employer Portals</h4>
                <p className="text-xs text-[#5f6368] leading-relaxed">
                  Links route directly to official Greenhouse, Lever, Ashby, SmartRecruiters, Workable, and employer ATS pages.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#e8eaed] space-y-1.5">
                <h4 className="text-sm font-bold text-[#202124]">Strict 0–2 YoE Cap</h4>
                <p className="text-xs text-[#5f6368] leading-relaxed">
                  Requisitions demanding 3+, 5+, or 7+ years of experience are excluded so junior candidates focus on genuine early-career tracks.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#e8eaed] space-y-1.5">
                <h4 className="text-sm font-bold text-[#202124]">Transparent Pay Data</h4>
                <p className="text-xs text-[#5f6368] leading-relaxed">
                  Disclosed state salary ranges (CA SB 1162, NYC Local Law) are surfaced accurately when provided by the employer.
                </p>
              </div>
            </div>

            <div className="pt-5 border-t border-[#f1f3f4] flex flex-wrap items-center justify-between gap-4">
              <a
                href="/companies"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigateTab) onNavigateTab('companies');
                }}
                className="text-xs text-[#1a73e8] font-semibold hover:underline flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Explore Company Hubs (FAANG &amp; Startups)</span>
              </a>

              <div className="flex items-center gap-4">
                <a
                  href="/salary-guide"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateTab) onNavigateTab('salary-guide');
                  }}
                  className="text-xs text-[#1a73e8] font-semibold hover:underline"
                >
                  2026 Salary Index &rarr;
                </a>
                <a
                  href="/career-tools"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateTab) onNavigateTab('tools');
                  }}
                  className="text-xs text-[#1a73e8] font-semibold hover:underline"
                >
                  Free ATS Matcher &amp; Tools &rarr;
                </a>
              </div>
            </div>
          </div>

          {/* Editorial Guide Spotlight */}
          <div className="bg-white rounded-2xl border border-[#dadce0] p-6 sm:p-8 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1a73e8]">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>EDITORIAL RESEARCH</span>
                  <span className="text-[#80868b]">&middot;</span>
                  <span className="text-[#5f6368] inline-flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" /> 16 min read
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#202124]">
                  How to Land Entry-Level Software Engineer Jobs with No Experience in 2026
                </h3>
                <p className="text-xs sm:text-sm text-[#5f6368] max-w-3xl leading-relaxed">
                  Overcoming the 2–3 year experience paradox, navigating Workday and Greenhouse ATS parsers, CodeSignal OA thresholds, and verified US salary tiers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href="/insights/entry-level-software-engineer-jobs-no-experience-2026"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onOpenArticle) {
                      onOpenArticle('entry-level-software-engineer-jobs-no-experience-2026');
                    } else if (onNavigateTab) {
                      onNavigateTab('insights');
                    }
                  }}
                  className="px-4 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Read Complete Guide</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="/career-insights"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateTab) onNavigateTab('insights');
                  }}
                  className="px-4 py-2.5 bg-white hover:bg-[#f8f9fa] border border-[#dadce0] text-[#3c4043] text-xs sm:text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#1a73e8]" />
                  <span>All 25+ Playbooks</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
