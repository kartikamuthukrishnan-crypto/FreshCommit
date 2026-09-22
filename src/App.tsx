import React, { useState, useEffect, useMemo } from 'react';
import { JobPosting, AdSenseConfig, SyncLog, JobCategory, ExperienceLevel } from './types';
import { INITIAL_JOBS } from './data/initialJobs';
import { CAREER_ARTICLES } from './data/careerArticles';
import { Navbar } from './components/Navbar';
import { JobCard } from './components/JobCard';
import { JobDetailsModal } from './components/JobDetailsModal';
import { AdminPanel } from './components/AdminPanel';
import { AdSlot } from './components/AdSlot';
import { SalaryGuideView, AdSensePolicyView, CareerInsightsView } from './components/OriginalGuides';
import { InteractiveToolsView } from './components/InteractiveTools';
import { AboutUsView, ContactUsView } from './components/TrustPages';
import { LegalModal } from './components/LegalModals';
import { AdminLoginModal } from './components/AdminLoginModal';
import { FreshCommitsLogo } from './components/FreshCommitsLogo';
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
  RefreshCw,
  Lock,
  Code2,
  ExternalLink,
  ChevronRight,
  GitCommit
} from 'lucide-react';

const STORAGE_KEY_JOBS = 'freshcommit_jobs_v3';
const STORAGE_KEY_ADSENSE = 'freshcommit_adsense_v1';
const STORAGE_KEY_ADMIN_AUTH = 'freshcommit_admin_auth';
const STORAGE_KEY_ADMIN_PASSCODE = 'freshcommit_admin_passcode';
const DEFAULT_ADMIN_PASSCODE = 'freshcommit2026';

const DEFAULT_ADSENSE_CONFIG: AdSenseConfig = {
  publisherId: '', // Empty initially until approved by Google AdSense
  enabled: false, // Default to FALSE so new visitors and Google AdSense site reviewers see a pristine, content-rich editorial job board without mock placeholder boxes
  testMode: false,
  headerAd: true,
  inFeedAd: true,
  detailSidebarAd: true,
  footerAd: true,
};

export default function App() {
  // 1. Persistent State for Jobs (migrates to verified live ATS URLs)
  const [jobs, setJobs] = useState<JobPosting[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_JOBS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_JOBS.length) {
          return parsed;
        }
      } else {
        // Migrate custom added jobs from older storage keys while updating seed jobs to verified live URLs
        const legacy =
          localStorage.getItem('freshcommit_jobs_v2') ||
          localStorage.getItem('freshcommit_jobs_v1') ||
          localStorage.getItem('juniordevhub_jobs_v2');
        if (legacy) {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed)) {
            const customJobs = parsed.filter(
              (j: JobPosting) => j.id.startsWith('manual-') || j.id.startsWith('sync-')
            );
            const merged = [...INITIAL_JOBS, ...customJobs];
            localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(merged));
            return merged;
          }
        }
      }
    } catch (e) {
      console.warn('Could not read saved jobs from localStorage', e);
    }
    return INITIAL_JOBS;
  });

  // 2. Persistent State for AdSense Config
  const [adConfig, setAdConfig] = useState<AdSenseConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ADSENSE) || localStorage.getItem('juniordevhub_adsense_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Force reset if publisherId is placeholder or testMode is on so frontend remains clean
        if (
          !parsed.publisherId ||
          parsed.publisherId === 'ca-pub-9876543210123456' ||
          parsed.publisherId.includes('configured-in-admin') ||
          parsed.testMode
        ) {
          return {
            ...DEFAULT_ADSENSE_CONFIG,
            enabled: false,
            testMode: false,
            publisherId: '',
          };
        }
        return { ...DEFAULT_ADSENSE_CONFIG, ...parsed };
      }
    } catch (e) {
      console.warn('Could not read AdSense config from localStorage', e);
    }
    return DEFAULT_ADSENSE_CONFIG;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
    } catch (e) {
      console.warn('Failed saving jobs', e);
    }
  }, [jobs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ADSENSE, JSON.stringify(adConfig));
    } catch (e) {
      console.warn('Failed saving adConfig', e);
    }
  }, [adConfig]);

  // View state - parse URL query or hash immediately on mount
  const resolveCurrentTab = (): 'jobs' | 'salary-guide' | 'insights' | 'tools' | 'adsense-policy' | 'about' | 'contact' | 'admin' => {
    if (typeof window === 'undefined') return 'jobs';
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const view = urlParams.get('view');
      if (view === 'salary-guide' || view === 'salary') return 'salary-guide';
      if (view === 'insights' || view === 'guides') return 'insights';
      if (view === 'tools' || view === 'calculator') return 'tools';
      if (view === 'about') return 'about';
      if (view === 'contact') return 'contact';
      if (view === 'policy' || view === 'adsense-policy') return 'adsense-policy';

      const rawHash = window.location.hash.replace('#', '');
      const hash = rawHash.toLowerCase();
      if (hash === 'admin') return 'admin';
      if (hash === 'tools' || hash === 'calculator' || hash === 'tc-calculator') return 'tools';
      if (hash === 'insights' || hash === 'guides') return 'insights';
      if (hash === 'salary' || hash === 'salary-guide') return 'salary-guide';
      if (hash === 'about') return 'about';
      if (hash === 'contact') return 'contact';
      if (hash === 'policy') return 'adsense-policy';

      // Check if hash points to an article directly (e.g. #reverse-interviewing-engineering-teams)
      if (rawHash && CAREER_ARTICLES.some((a) => a.id === rawHash || a.id.toLowerCase() === hash)) {
        return 'insights';
      }
    } catch {
      // Fallback
    }
    return 'jobs';
  };

  const [activeTab, setActiveTab] = useState<'jobs' | 'salary-guide' | 'insights' | 'tools' | 'adsense-policy' | 'about' | 'contact' | 'admin'>(resolveCurrentTab);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'disclaimer' | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

  // Owner Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem(STORAGE_KEY_ADMIN_AUTH) === 'true' ||
        sessionStorage.getItem(STORAGE_KEY_ADMIN_AUTH) === 'true'
      );
    } catch {
      return false;
    }
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_ADMIN_PASSCODE) || DEFAULT_ADMIN_PASSCODE;
    } catch {
      return DEFAULT_ADMIN_PASSCODE;
    }
  });

  // Owner Logout handler
  const handleLogoutAdmin = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
      sessionStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
    } catch (err) {
      console.warn('Failed clearing admin auth session', err);
    }
    setIsAdminAuthenticated(false);
    if (activeTab === 'admin') {
      setActiveTab('jobs');
    }
  };

  // Update passcode handler
  const handleUpdatePasscode = (newCode: string) => {
    setAdminPasscode(newCode);
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_PASSCODE, newCode);
    } catch (err) {
      console.warn('Failed persisting passcode', err);
    }
  };

  // Listen for hash routes and ?admin=true in URL
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncTabFromUrl = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const rawHash = window.location.hash.replace('#', '');
      const hash = rawHash.toLowerCase();

      if (urlParams.get('admin') === 'true' || hash === 'admin') {
        if (isAdminAuthenticated) {
          setActiveTab('admin');
        } else {
          setIsAdminLoginOpen(true);
        }
      } else {
        const tab = resolveCurrentTab();
        setActiveTab(tab);
      }
    };

    syncTabFromUrl();
    window.addEventListener('hashchange', syncTabFromUrl);
    window.addEventListener('popstate', syncTabFromUrl);
    return () => {
      window.removeEventListener('hashchange', syncTabFromUrl);
      window.removeEventListener('popstate', syncTabFromUrl);
    };
  }, [isAdminAuthenticated]);

  // Global keyboard shortcut (Ctrl+Shift+A or Cmd+Shift+A) for owner quick access
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (isAdminAuthenticated) {
          setActiveTab((prev) => (prev === 'admin' ? 'jobs' : 'admin'));
        } else {
          setIsAdminLoginOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminAuthenticated]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHub, setSelectedHub] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedExperience, setSelectedExperience] = useState<string>('All');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minSalary, setMinSalary] = useState<number>(0);

  // US Tech Hubs list
  const TECH_HUBS = [
    { label: 'All Locations', value: 'All' },
    { label: 'SF Bay Area, CA', value: 'San Francisco' },
    { label: 'New York, NY', value: 'New York' },
    { label: 'Seattle, WA', value: 'Seattle' },
    { label: 'Austin, TX', value: 'Austin' },
    { label: 'Boston, MA', value: 'Boston' },
    { label: 'Remote (US)', value: 'Remote' },
  ];

  // Filtering Logic
  const filteredJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    return jobs.filter((job) => {
      if (!job) return false;
      // Status
      if (job.status && job.status !== 'ACTIVE') return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = job.title ? job.title.toLowerCase().includes(query) : false;
        const matchesCompany = job.company ? job.company.toLowerCase().includes(query) : false;
        const matchesSkills = Array.isArray(job.skills) ? job.skills.some((s) => s && s.toLowerCase().includes(query)) : false;
        const matchesDesc = job.description ? job.description.toLowerCase().includes(query) : false;
        if (!matchesTitle && !matchesCompany && !matchesSkills && !matchesDesc) {
          return false;
        }
      }

      // Hub / Location
      if (selectedHub !== 'All') {
        if (selectedHub === 'Remote') {
          if (!job.isRemote) return false;
        } else {
          const locMatch =
            (job.location && job.location.toLowerCase().includes(selectedHub.toLowerCase())) ||
            (job.city && job.city.toLowerCase().includes(selectedHub.toLowerCase()));
          if (!locMatch) return false;
        }
      }

      // Category
      if (selectedCategory !== 'All' && job.category !== selectedCategory) {
        return false;
      }

      // Experience Level
      if (selectedExperience !== 'All' && job.experienceLevel !== selectedExperience) {
        return false;
      }

      // Remote only
      if (remoteOnly && !job.isRemote) {
        return false;
      }

      // Minimum Salary
      if (minSalary > 0 && (!job.salary || (typeof job.salary.min === 'number' && job.salary.min < minSalary))) {
        return false;
      }

      return true;
    });
  }, [jobs, searchQuery, selectedHub, selectedCategory, selectedExperience, remoteOnly, minSalary]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        jobCount={jobs.length}
        isAdminAuthenticated={isAdminAuthenticated}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: JOB SEARCH PORTAL */}
        {activeTab === 'jobs' && (
          <div>
            {/* Top Leaderboard Ad Slot */}
            {adConfig.enabled && adConfig.headerAd && (
              <div className="max-w-7xl mx-auto px-4 pt-4">
                <AdSlot type="leaderboard" config={adConfig} />
              </div>
            )}

            {/* Hero & Value Proposition */}
            <section className="bg-white border-b border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold tracking-tight mb-4 border border-emerald-200/80">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Strictly 0–2 Years Experience • Google for Jobs Schema Validated
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Entry-Level &amp; New Grad{' '}
                  <span className="text-emerald-700">Software Developer Jobs</span>
                </h1>

                <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Direct, unparaphrased software engineering listings for freshers and university graduates across major US tech hubs &amp; remote. Verified direct ATS links.
                </p>

                {/* Search & Filter Bar */}
                <div className="mt-8 bg-white p-3 rounded-2xl border border-slate-200 shadow-lg shadow-slate-100 max-w-3xl mx-auto">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="job-search-input"
                        type="text"
                        placeholder="Search title, skills (React, Python, Go), or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        id="select-category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="All">All Roles</option>
                        <option value="Full Stack">Full Stack</option>
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="Mobile">Mobile</option>
                        <option value="DevOps / Cloud">DevOps</option>
                        <option value="Data / AI">Data / AI</option>
                        <option value="QA / Test">QA / Automation</option>
                      </select>

                      <label className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer select-none text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={remoteOnly}
                          onChange={(e) => setRemoteOnly(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                        />
                        <span>Remote</span>
                      </label>
                    </div>
                  </div>

                  {/* US Tech Hub Quick Chips */}
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 overflow-x-auto text-xs pb-1">
                    <span className="text-slate-400 font-medium pl-1 flex items-center gap-1 flex-shrink-0">
                      <MapPin className="w-3 h-3" /> Tech Hubs:
                    </span>
                    {TECH_HUBS.map((hub) => (
                      <button
                        key={hub.value}
                        onClick={() => setSelectedHub(hub.value)}
                        className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all ${
                          selectedHub === hub.value
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {hub.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Micro Metrics Pill */}
                <div className="flex items-center justify-center gap-6 text-xs text-slate-500 mt-6 flex-wrap">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <strong>{jobs.length}</strong> Early-Career Listings
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Google for Jobs Schema Validated
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    $115k–$145k Avg Base Salary
                  </span>
                </div>
              </div>
            </section>

            {/* Job Listings Grid & In-Feed Ads */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {selectedHub === 'All' ? 'Latest Opportunities' : `${selectedHub} Engineering Positions`}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Showing {filteredJobs.length} verified entry-level &amp; new grad positions
                  </p>
                </div>

                {/* Reset filters if applied */}
                {(searchQuery || selectedHub !== 'All' || selectedCategory !== 'All' || remoteOnly) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedHub('All');
                      setSelectedCategory('All');
                      setSelectedExperience('All');
                      setRemoteOnly(false);
                      setMinSalary(0);
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              {filteredJobs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No matching positions found</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Try broadening your search keywords or switching locations.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedHub('All');
                      setSelectedCategory('All');
                      setRemoteOnly(false);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Reset Search Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Grid of Job Cards with In-Feed Ad insertion */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.slice(0, 6).map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onSelect={(j) => setSelectedJob(j)}
                        onViewSchema={(j) => setSelectedJob(j)}
                      />
                    ))}
                  </div>

                  {/* Compliant In-Feed Ad Unit (Inserted seamlessly between job cards with clear margin) */}
                  {adConfig.enabled && adConfig.inFeedAd && (
                    <div className="py-2">
                      <AdSlot type="in-feed" config={adConfig} />
                    </div>
                  )}

                  {/* Remaining Job Cards */}
                  {filteredJobs.length > 6 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredJobs.slice(6).map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onSelect={(j) => setSelectedJob(j)}
                          onViewSchema={(j) => setSelectedJob(j)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: ORIGINAL SALARY BENCHMARKS & GUIDES (Crucial for AdSense Approval) */}
        {activeTab === 'salary-guide' && <SalaryGuideView />}

        {/* VIEW 3: CAREER INSIGHTS & ENGINEERING ARTICLES */}
        {activeTab === 'insights' && <CareerInsightsView />}

        {/* VIEW 4: INTERACTIVE DEVELOPER TOOLS & TC CALCULATOR */}
        {activeTab === 'tools' && <InteractiveToolsView />}

        {/* VIEW 5: ADSENSE POLICY & TRUST CENTER */}
        {activeTab === 'adsense-policy' && <AdSensePolicyView />}

        {/* VIEW 4: ADMIN PANEL - RESTRICTED TO OWNER ONLY */}
        {activeTab === 'admin' && (
          isAdminAuthenticated ? (
            <AdminPanel
              jobs={jobs}
              setJobs={setJobs}
              adConfig={adConfig}
              setAdConfig={setAdConfig}
              syncLogs={syncLogs}
              setSyncLogs={setSyncLogs}
              onClose={() => setActiveTab('jobs')}
              ownerPasscode={adminPasscode}
              onUpdatePasscode={handleUpdatePasscode}
              onLogout={handleLogoutAdmin}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Restricted Owner Portal</h2>
                <p className="text-xs text-slate-500 mt-1">
                  This console is restricted to the site owner (<code className="font-mono text-emerald-700">kartikamuthukrishnan@gmail.com</code>).
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Return to Job Feed
                </button>
                <button
                  onClick={() => setIsAdminLoginOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-md"
                >
                  Unlock with Passcode
                </button>
              </div>
            </div>
          )
        )}

        {/* VIEW 5: ABOUT US */}
        {activeTab === 'about' && (
          <AboutUsView onNavigateContact={() => setActiveTab('contact')} />
        )}

        {/* VIEW 6: CONTACT US */}
        {activeTab === 'contact' && (
          <ContactUsView />
        )}
      </main>

      {/* Footer Leaderboard Ad */}
      {adConfig.enabled && adConfig.footerAd && activeTab === 'jobs' && (
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <AdSlot type="leaderboard" config={adConfig} />
        </div>
      )}

      {/* Job Details Modal with Dynamic Schema.org injection */}
      <JobDetailsModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        adConfig={adConfig}
      />

      {/* Legal & Compliance Modals (Privacy Policy, Terms, Disclaimer) */}
      <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />

      {/* Clean, Lightweight Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <FreshCommitsLogo size="sm" showWordmark={true} showDomainBadge={true} />
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <p className="text-[11px] text-slate-400">
                Entry-Level &amp; New Grad Developer Job Board &bull; Validated Google JobPosting Schema
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 flex-wrap text-xs">
            <button
              onClick={() => setActiveTab('tools')}
              className="text-emerald-700 font-bold hover:underline transition-colors"
            >
              Career Tools &amp; TC Calculator
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className="text-slate-700 font-semibold hover:text-emerald-700 transition-colors"
            >
              Career Insights
            </button>
            <button
              onClick={() => setActiveTab('salary-guide')}
              className="text-slate-700 font-semibold hover:text-emerald-700 transition-colors"
            >
              Salary Benchmarks
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className="text-slate-700 font-semibold hover:text-emerald-700 transition-colors"
            >
              About Us &amp; Standards
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className="text-slate-700 font-semibold hover:text-emerald-700 transition-colors"
            >
              Contact &amp; Support
            </button>
            <button
              onClick={() => setLegalModalType('privacy')}
              className="hover:text-slate-900 transition-colors"
            >
              Privacy &amp; Cookie Policy
            </button>
            <button
              onClick={() => setLegalModalType('terms')}
              className="hover:text-slate-900 transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => setLegalModalType('disclaimer')}
              className="hover:text-slate-900 transition-colors"
            >
              ATS Direct Application Standards
            </button>
            {/* Show owner shortcut only when authenticated */}
            {isAdminAuthenticated && (
              <button
                onClick={() => setActiveTab('admin')}
                className="text-emerald-700 font-bold flex items-center gap-1.5 hover:underline bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
              >
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Owner Portal</span>
              </button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} FreshCommits (freshcommits.com). Strictly verified 0–2 YoE software engineering opportunities.</span>
            <span>&bull;</span>
            <button
              onClick={() => {
                if (isAdminAuthenticated) {
                  setActiveTab('admin');
                } else {
                  setIsAdminLoginOpen(true);
                }
              }}
              className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
              title="Site Owner Login (kartikamuthukrishnan@gmail.com)"
            >
              <Lock className="w-2.5 h-2.5 opacity-50" />
              <span>Owner Access</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span>Direct ATS Routing</span>
            <span>&bull;</span>
            <span>Zero Paraphrasing</span>
            <span>&bull;</span>
            <span>Hash-Based Deduplication</span>
          </div>
        </div>
      </footer>

      {/* Owner Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          setIsAdminLoginOpen(false);
          setActiveTab('admin');
        }}
        storedPasscode={adminPasscode}
      />
    </div>
  );
}
