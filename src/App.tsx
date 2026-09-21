import React, { useState, useEffect, useMemo } from 'react';
import { JobPosting, AdSenseConfig, SyncLog, JobCategory, ExperienceLevel } from './types';
import { INITIAL_JOBS } from './data/initialJobs';
import { Navbar } from './components/Navbar';
import { JobCard } from './components/JobCard';
import { JobDetailsModal } from './components/JobDetailsModal';
import { AdminPanel } from './components/AdminPanel';
import { AdSlot } from './components/AdSlot';
import { SalaryGuideView, AdSensePolicyView, CareerInsightsView } from './components/OriginalGuides';
import { AboutUsView, ContactUsView } from './components/TrustPages';
import { LegalModal } from './components/LegalModals';
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

const STORAGE_KEY_JOBS = 'freshcommit_jobs_v1';
const STORAGE_KEY_ADSENSE = 'freshcommit_adsense_v1';

const DEFAULT_ADSENSE_CONFIG: AdSenseConfig = {
  publisherId: 'ca-pub-9876543210123456', // Placeholder ready for user's publisher ID
  enabled: true,
  testMode: true, // Safe test/sandbox mode active by default to prevent accidental invalid clicks
  headerAd: true,
  inFeedAd: true,
  detailSidebarAd: true,
  footerAd: true,
};

export default function App() {
  // 1. Persistent State for Jobs
  const [jobs, setJobs] = useState<JobPosting[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_JOBS) || localStorage.getItem('juniordevhub_jobs_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_JOBS.length) {
          return parsed;
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
        return { ...DEFAULT_ADSENSE_CONFIG, ...JSON.parse(saved) };
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

  // View state
  const [activeTab, setActiveTab] = useState<'jobs' | 'salary-guide' | 'insights' | 'adsense-policy' | 'about' | 'contact' | 'admin'>('jobs');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'disclaimer' | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

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
    return jobs.filter((job) => {
      // Status
      if (job.status !== 'ACTIVE') return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesCompany = job.company.toLowerCase().includes(query);
        const matchesSkills = job.skills.some((s) => s.toLowerCase().includes(query));
        const matchesDesc = job.description.toLowerCase().includes(query);
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
            job.location.toLowerCase().includes(selectedHub.toLowerCase()) ||
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
      if (minSalary > 0 && job.salary.min < minSalary) {
        return false;
      }

      return true;
    });
  }, [jobs, searchQuery, selectedHub, selectedCategory, selectedExperience, remoteOnly, minSalary]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} jobCount={jobs.length} />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: JOB SEARCH PORTAL */}
        {activeTab === 'jobs' && (
          <div>
            {/* Top Leaderboard Ad Slot (Policy compliant, clear label) */}
            {adConfig.headerAd && (
              <div className="max-w-7xl mx-auto px-4 pt-4">
                <AdSlot type="leaderboard" config={adConfig} />
              </div>
            )}

            {/* Hero & Value Proposition */}
            <section className="bg-white border-b border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold tracking-tight mb-4 border border-indigo-100">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Strictly 0–2 Years Experience • Google JobPosting Schema Validated
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Entry-Level &amp; New Grad{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                    Software Developer Jobs
                  </span>
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
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        id="select-category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-indigo-500"
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
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
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
                            ? 'bg-indigo-600 text-white shadow-sm'
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
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
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
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
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
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
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
                  {adConfig.inFeedAd && (
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

        {/* VIEW 4: ADSENSE POLICY & TRUST CENTER */}
        {activeTab === 'adsense-policy' && <AdSensePolicyView />}

        {/* VIEW 4: ADMIN PANEL */}
        {activeTab === 'admin' && (
          <AdminPanel
            jobs={jobs}
            setJobs={setJobs}
            adConfig={adConfig}
            setAdConfig={setAdConfig}
            syncLogs={syncLogs}
            setSyncLogs={setSyncLogs}
            onClose={() => setActiveTab('jobs')}
          />
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
      {adConfig.footerAd && activeTab === 'jobs' && (
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold">
              <GitCommit className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">FreshCommit</span>
              <p className="text-[11px] text-slate-400">
                Entry-Level &amp; New Grad Developer Job Board &bull; Validated Google JobPosting Schema
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 flex-wrap text-xs">
            <button
              onClick={() => setActiveTab('about')}
              className="text-slate-700 font-semibold hover:text-indigo-600 transition-colors"
            >
              About Us &amp; Standards
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className="text-slate-700 font-semibold hover:text-indigo-600 transition-colors"
            >
              Contact &amp; Support
            </button>
            <button
              onClick={() => setLegalModalType('privacy')}
              className="hover:text-slate-900 transition-colors"
            >
              Privacy Policy (AdSense &amp; Cookies)
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
              Scraping &amp; ATS Disclaimer
            </button>
            <button
              onClick={() => setActiveTab('adsense-policy')}
              className="text-amber-700 font-semibold hover:underline"
            >
              AdSense Compliance Center
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="text-indigo-600 font-semibold flex items-center gap-1 hover:underline"
            >
              <Lock className="w-3 h-3" />
              Admin Access
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div>
            &copy; {new Date().getFullYear()} FreshCommit. Built for high performance, lightweight loading, and full Google AdSense policy alignment.
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
    </div>
  );
}
