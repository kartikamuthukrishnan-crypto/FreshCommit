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
import { LegalPageView } from './components/LegalPageView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { FreshCommitsLogo } from './components/FreshCommitsLogo';
import { HomeEditorialContent } from './components/HomeEditorialContent';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { AppTab } from './types';
import { trackPageView, disableAnalyticsForAdmin } from './utils/analytics';
import { isJobExpired } from './utils/jobAggregator';
import {
  subscribeToLiveJobs,
  batchSaveJobsToCloud,
  testFirebaseConnection,
  subscribeToAdConfig,
  fetchSingleJobFromCloud
} from './services/firebaseService';
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
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  GitCommit,
  Linkedin,
  Twitter,
  Youtube,
  Share2,
  Bookmark,
  Target,
  ArrowRight
} from 'lucide-react';

const STORAGE_KEY_JOBS = 'freshcommit_jobs_v5';
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

/**
 * Resolves job timestamp for accurate reverse chronological sorting (latest first)
 */
export const getJobTimestamp = (job: JobPosting): number => {
  if (!job) return 0;
  // 1. Try datePosted (e.g. 2026-09-26, 2026-09-25)
  if (job.datePosted) {
    const time = new Date(job.datePosted).getTime();
    if (!isNaN(time) && time > 0) {
      // Disambiguate jobs posted on the same date with ID timestamp if present
      const idMatch = job.id?.match(/\b(\d{10,13})\b/);
      if (idMatch) {
        const idTime = Number(idMatch[1]);
        if (!isNaN(idTime) && idTime > 1600000000000) {
          return idTime;
        }
      }
      return time;
    }
  }
  // 2. ID timestamp (e.g. manual-1790319626129)
  const idMatch = job.id?.match(/\b(\d{10,13})\b/);
  if (idMatch) {
    const idTime = Number(idMatch[1]);
    if (!isNaN(idTime) && idTime > 1600000000000) return idTime;
  }
  // 3. Fallback to lastHealthCheckedAt
  if (job.lastHealthCheckedAt) {
    const time = new Date(job.lastHealthCheckedAt).getTime();
    if (!isNaN(time) && time > 0) return time;
  }
  return 0;
};

export default function App() {
  // 1. Persistent State for Jobs (ensures verified live direct URLs with application forms and internships)
  const [jobs, setJobs] = useState<JobPosting[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_JOBS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If saved has the new verified jobs and internships, keep it
          const hasVerifiedSeed = parsed.some((j: JobPosting) => j.id === 'job-int-stripe-001');
          if (hasVerifiedSeed) {
            return parsed;
          }
        }
      }
      
      // Clean migration: preserve any custom admin jobs (ids starting with manual- or sync-), and load INITIAL_JOBS
      const legacyRaw =
        localStorage.getItem('freshcommit_jobs_v4') ||
        localStorage.getItem('freshcommit_jobs_v3') ||
        localStorage.getItem('freshcommit_jobs_v2') ||
        localStorage.getItem('freshcommit_jobs_v1') ||
        localStorage.getItem('juniordevhub_jobs_v2');
      
      let customJobs: JobPosting[] = [];
      if (legacyRaw) {
        try {
          const parsedLegacy = JSON.parse(legacyRaw);
          if (Array.isArray(parsedLegacy)) {
            customJobs = parsedLegacy.filter(
              (j: JobPosting) => j.id.startsWith('manual-') || j.id.startsWith('sync-')
            );
          }
        } catch {
          // ignore
        }
      }

      const merged = [...INITIAL_JOBS, ...customJobs];
      localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(merged));
      return merged;
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

  // 3. Connect real-time Firestore synchronization for all global visitors
  useEffect(() => {
    // Health check on boot
    testFirebaseConnection();

    // Subscribe to live cloud jobs
    const unsubscribeJobs = subscribeToLiveJobs((cloudJobs) => {
      if (cloudJobs && cloudJobs.length > 0) {
        setJobs((prev) => {
          // Merge any newly added cloud jobs with current state
          const cloudIds = new Set(cloudJobs.map((j) => j.id));
          // If local has custom jobs not yet in cloud, keep them locally too
          const localOnly = prev.filter((j) => !cloudIds.has(j.id) && (j.id.startsWith('manual-') || j.id.startsWith('sync-')));
          const combined = [...cloudJobs, ...localOnly];
          try {
            localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(combined));
          } catch {
            // ignore
          }

          // If the user or crawler navigated to a specific ?job= that just arrived from Firestore, select it
          try {
            const urlParams = new URLSearchParams(window.location.search);
            const targetJobId = urlParams.get('job') || urlParams.get('jobId');
            if (targetJobId) {
              const matchedCloudJob = combined.find((j) => j.id.toLowerCase() === targetJobId.toLowerCase());
              if (matchedCloudJob) {
                setSelectedJob(matchedCloudJob);
                document.title = `${matchedCloudJob.title} at ${matchedCloudJob.company} (0-2 YoE) – FreshCommits`;
              }
            }
          } catch {
            // ignore
          }

          return combined;
        });
      } else {
        // Cloud is currently empty, seed it with our initial jobs so visitors immediately see listings
        if (jobs && jobs.length > 0) {
          batchSaveJobsToCloud(jobs).catch((e) => console.warn('Could not auto-seed cloud jobs:', e));
        }
      }
    });

    // Subscribe to live AdSense settings
    const unsubscribeAds = subscribeToAdConfig((cloudAdConfig) => {
      if (cloudAdConfig) {
        setAdConfig((prev) => ({ ...prev, ...cloudAdConfig }));
      }
    });

    return () => {
      unsubscribeJobs();
      unsubscribeAds();
    };
  }, []);

  // Save changes to localStorage and notify other tabs/windows
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
      window.dispatchEvent(new CustomEvent('freshcommits_jobs_updated', { detail: jobs }));
    } catch (e) {
      console.warn('Failed saving jobs', e);
    }
  }, [jobs]);

  // Synchronize state across different browser tabs/windows via storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_JOBS && e.newValue) {
        try {
          const updatedJobs = JSON.parse(e.newValue);
          if (Array.isArray(updatedJobs)) {
            setJobs(updatedJobs);
          }
        } catch (err) {
          console.warn('Failed syncing jobs from storage event', err);
        }
      }
      if (e.key === STORAGE_KEY_ADSENSE && e.newValue) {
        try {
          const updatedAd = JSON.parse(e.newValue);
          setAdConfig((prev) => ({ ...prev, ...updatedAd }));
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ADSENSE, JSON.stringify(adConfig));
    } catch (e) {
      console.warn('Failed saving adConfig', e);
    }
  }, [adConfig]);

  // View state - parse URL path, query or hash immediately on mount
  const resolveCurrentTab = (): AppTab => {
    if (typeof window === 'undefined') return 'jobs';
    try {
      // 1. Check clean path for crawlers, direct URLs and browser history
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      if (path === '/privacy' || path === '/privacy-policy' || path === '/privacy-policy.html' || path.endsWith('/privacy-policy')) return 'privacy';
      if (path === '/about' || path === '/about-us' || path === '/about.html' || path.endsWith('/about')) return 'about';
      if (path === '/terms' || path === '/terms-of-service' || path === '/tos' || path.endsWith('/terms')) return 'terms';
      if (path === '/contact' || path === '/contact-us' || path.endsWith('/contact')) return 'contact';
      if (path === '/salary-guide' || path === '/salary' || path.endsWith('/salary-guide')) return 'salary-guide';
      if (path === '/insights' || path === '/career-insights' || path === '/guides' || path.endsWith('/career-insights')) return 'insights';
      if (path === '/tools' || path === '/career-tools' || path === '/calculator' || path.endsWith('/career-tools')) return 'tools';
      if (path === '/policy' || path === '/adsense-policy' || path.endsWith('/adsense-policy')) return 'adsense-policy';
      if (path === '/disclaimer' || path.endsWith('/disclaimer')) return 'disclaimer';
      if (path === '/cookie-policy' || path === '/cookies' || path.endsWith('/cookie-policy')) return 'cookie-policy';
      if (path === '/admin') return 'admin';

      // 2. Check query params (?view=...)
      const urlParams = new URLSearchParams(window.location.search);
      const view = urlParams.get('view');
      if (view === 'salary-guide' || view === 'salary') return 'salary-guide';
      if (view === 'insights' || view === 'career-insights' || view === 'guides') return 'insights';
      if (view === 'tools' || view === 'career-tools' || view === 'calculator') return 'tools';
      if (view === 'about' || view === 'about-us') return 'about';
      if (view === 'contact' || view === 'contact-us') return 'contact';
      if (view === 'policy' || view === 'adsense-policy') return 'adsense-policy';
      if (view === 'terms' || view === 'tos' || view === 'terms-of-service') return 'terms';
      if (view === 'privacy' || view === 'privacy-policy') return 'privacy';
      if (view === 'disclaimer') return 'disclaimer';
      if (view === 'cookie-policy' || view === 'cookies') return 'cookie-policy';

      // 3. Check hash (#...)
      const rawHash = window.location.hash.replace('#', '');
      const hash = rawHash.toLowerCase();
      if (view === 'admin' || urlParams.get('admin') === 'true' || hash === 'admin') return 'admin';
      if (hash === 'tools' || hash === 'calculator' || hash === 'career-tools' || hash === 'tc-calculator') return 'tools';
      if (hash === 'insights' || hash === 'career-insights' || hash === 'guides') return 'insights';
      if (hash === 'salary' || hash === 'salary-guide') return 'salary-guide';
      if (hash === 'about' || hash === 'about-us') return 'about';
      if (hash === 'contact' || hash === 'contact-us') return 'contact';
      if (hash === 'policy' || hash === 'adsense-policy') return 'adsense-policy';
      if (hash === 'terms' || hash === 'tos' || hash === 'terms-of-service') return 'terms';
      if (hash === 'privacy' || hash === 'privacy-policy') return 'privacy';
      if (hash === 'disclaimer') return 'disclaimer';
      if (hash === 'cookie-policy' || hash === 'cookies') return 'cookie-policy';

      // Check if hash points to an article directly (e.g. #reverse-interviewing-engineering-teams)
      if (rawHash && CAREER_ARTICLES.some((a) => a.id === rawHash || a.id.toLowerCase() === hash)) {
        return 'insights';
      }
    } catch {
      // Fallback
    }
    return 'jobs';
  };

  // Helper to resolve title by active tab
  const getTabTitle = (tab: AppTab) => {
    switch (tab) {
      case 'salary-guide':
        return '2026 Tech Salary Guide & Compensation Benchmarks – FreshCommits';
      case 'insights':
        return 'Engineering Career Insights & Practical Guides – FreshCommits';
      case 'tools':
        return 'Developer Career Tools & TC Calculator – FreshCommits';
      case 'about':
        return 'About Us & Verification Standards – FreshCommits';
      case 'contact':
        return 'Contact & Employer Support – FreshCommits';
      case 'adsense-policy':
        return 'Editorial & Advertising Policy – FreshCommits';
      case 'terms':
        return 'Terms of Service & Conditions of Use – FreshCommits';
      case 'privacy':
        return 'Privacy Policy & DART Cookie Disclosures – FreshCommits';
      case 'disclaimer':
        return 'Publisher Disclaimer & Verification Standards – FreshCommits';
      case 'cookie-policy':
        return 'Cookie Policy & Consent Settings – FreshCommits';
      case 'admin':
        return 'Owner Administration Portal – FreshCommits';
      default:
        return 'FreshCommits – Entry Level & New Grad Software Engineer Jobs';
    }
  };

  // Dedicated Job URL Resolver: checks ?job=<jobId> or #job=<jobId>
  const resolveCurrentJob = (): JobPosting | null => {
    if (typeof window === 'undefined') return null;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let targetJobId = urlParams.get('job') || urlParams.get('jobId');
      const rawHash = window.location.hash.replace('#', '');
      if (!targetJobId && rawHash) {
        if (rawHash.startsWith('job=')) {
          targetJobId = rawHash.replace('job=', '');
        } else if (rawHash.startsWith('job-')) {
          targetJobId = rawHash;
        }
      }
      if (targetJobId) {
        const lowerTarget = targetJobId.toLowerCase();

        // 0. Check preloaded job from index.html direct crawler hydration
        const preloaded = (window as any).__PRELOADED_JOB__;
        if (preloaded && preloaded.id && preloaded.id.toLowerCase() === lowerTarget) {
          return preloaded;
        }

        // 1. Check INITIAL_JOBS
        const inInitial = INITIAL_JOBS.find((j) => j.id.toLowerCase() === lowerTarget);
        if (inInitial) return inInitial;

        // 2. Check localStorage jobs
        try {
          const savedRaw = localStorage.getItem(STORAGE_KEY_JOBS);
          if (savedRaw) {
            const parsed = JSON.parse(savedRaw);
            if (Array.isArray(parsed)) {
              const inSaved = parsed.find((j: JobPosting) => j.id.toLowerCase() === lowerTarget);
              if (inSaved) return inSaved;
            }
          }
        } catch {
          // ignore
        }
      }
    } catch {
      // Fallback
    }
    return null;
  };

  const [activeTab, setActiveTab] = useState<AppTab>(resolveCurrentTab);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(resolveCurrentJob);
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

  // Enforce analytics exclusion if admin is authenticated
  useEffect(() => {
    if (isAdminAuthenticated) {
      disableAnalyticsForAdmin();
    }
  }, [isAdminAuthenticated]);

  // Track page views in Google Analytics on tab change (strictly excludes admin portal)
  useEffect(() => {
    if (activeTab === 'admin' || isAdminAuthenticated) {
      return;
    }
    if (!selectedJob) {
      const title = getTabTitle(activeTab);
      document.title = title;
      trackPageView(activeTab === 'jobs' ? '/' : `/?view=${activeTab}`, title);
    }
  }, [activeTab, selectedJob, isAdminAuthenticated]);

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
      handleTabChange('jobs');
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

  // Dedicated Job Selection Handlers with zero-cost pushState URL routing
  const handleSelectJob = (job: JobPosting) => {
    setSelectedJob(job);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('job', job.id);
      window.history.pushState({ jobId: job.id }, '', url.toString());
      document.title = `${job.title} at ${job.company} (0-2 YoE) – FreshCommits`;
    } catch (e) {
      console.warn('Failed updating job URL', e);
    }
  };

  const handleCloseJob = () => {
    setSelectedJob(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('job');
      url.searchParams.delete('jobId');
      const newQuery = url.searchParams.toString();
      const newUrl = url.pathname + (newQuery ? `?${newQuery}` : '') + (url.hash || '');
      window.history.pushState({}, '', newUrl);
      document.title = getTabTitle(activeTab);
    } catch (e) {
      console.warn('Failed clearing job URL', e);
    }
  };

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    try {
      const routeMap: Record<AppTab, string> = {
        jobs: '/',
        'salary-guide': '/salary-guide',
        insights: '/career-insights',
        tools: '/career-tools',
        about: '/about',
        contact: '/contact',
        'adsense-policy': '/adsense-policy',
        terms: '/terms',
        privacy: '/privacy-policy',
        disclaimer: '/disclaimer',
        'cookie-policy': '/cookie-policy',
        admin: '/?view=admin'
      };
      if (selectedJob && tab !== 'jobs') {
        setSelectedJob(null);
      }
      const newPath = routeMap[tab] || '/';
      window.history.pushState({ tab }, '', newPath);
      document.title = getTabTitle(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.warn('Failed updating tab URL', e);
    }
  };

  // Listen for hash routes, ?job=, and ?admin=true in URL on browser navigation (popstate & hashchange)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncFromUrl = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const rawHash = window.location.hash.replace('#', '');
      const hash = rawHash.toLowerCase();

      // 1. Sync Job selection from ?job= or #job=
      const jobParam = urlParams.get('job') || urlParams.get('jobId');
      let targetJobId = jobParam;
      if (!targetJobId && rawHash) {
        if (rawHash.startsWith('job=')) {
          targetJobId = rawHash.replace('job=', '');
        } else if (rawHash.startsWith('job-')) {
          targetJobId = rawHash;
        }
      }

      if (targetJobId) {
        const lowerTarget = targetJobId.toLowerCase();
        const preloaded = (window as any).__PRELOADED_JOB__;
        const isPreloaded = preloaded && preloaded.id && preloaded.id.toLowerCase() === lowerTarget ? preloaded : null;

        const found =
          isPreloaded ||
          jobs.find((j) => j && j.id && j.id.toLowerCase() === lowerTarget) ||
          INITIAL_JOBS.find((j) => j && j.id && j.id.toLowerCase() === lowerTarget);

        if (found) {
          setSelectedJob(found);
          document.title = `${found.title} at ${found.company} (0-2 YoE) – FreshCommits`;
        } else {
          // Actively fetch this specific job from Firestore cloud for instant discovery
          fetchSingleJobFromCloud(targetJobId).then((cloudJob) => {
            if (cloudJob) {
              setSelectedJob(cloudJob);
              setJobs((prev) => (prev.some((j) => j.id === cloudJob.id) ? prev : [cloudJob, ...prev]));
              document.title = `${cloudJob.title} at ${cloudJob.company} (0-2 YoE) – FreshCommits`;
            }
          });
        }
      } else {
        setSelectedJob(null);
      }

      // 2. Sync Tab view
      if (urlParams.get('admin') === 'true' || urlParams.get('view') === 'admin' || hash === 'admin') {
        setActiveTab('admin');
        if (isAdminAuthenticated) {
          document.title = getTabTitle('admin');
        } else {
          setIsAdminLoginOpen(true);
        }
      } else {
        const tab = resolveCurrentTab();
        // If owner is currently in admin tab, do not kick them out when jobs state updates
        setActiveTab((curr) => {
          if (curr === 'admin' && isAdminAuthenticated && !urlParams.get('view') && !rawHash) {
            return 'admin';
          }
          return tab;
        });
        if (!targetJobId) {
          document.title = getTabTitle(tab);
        }
      }
    };

    syncFromUrl();
    const handleJobPreloaded = (e: any) => {
      if (e.detail) {
        setSelectedJob(e.detail);
        setJobs((prev) => (prev.some((j) => j.id === e.detail.id) ? prev : [e.detail, ...prev]));
        document.title = `${e.detail.title} at ${e.detail.company} (0-2 YoE) – FreshCommits`;
      }
    };
    window.addEventListener('freshcommits_job_preloaded', handleJobPreloaded);
    window.addEventListener('hashchange', syncFromUrl);
    window.addEventListener('popstate', syncFromUrl);
    return () => {
      window.removeEventListener('freshcommits_job_preloaded', handleJobPreloaded);
      window.removeEventListener('hashchange', syncFromUrl);
      window.removeEventListener('popstate', syncFromUrl);
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
  const [savedOnly, setSavedOnly] = useState(false);

  // Saved Jobs Bookmarking state (Stored in LocalStorage)
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('freshcommits_saved_jobs_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleSaveJob = (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedJobIds((prev) => {
      const updated = prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId];
      try {
        localStorage.setItem('freshcommits_saved_jobs_v1', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed saving bookmarks', err);
      }
      return updated;
    });
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9); // 9 jobs per page (perfect 3x3 grid)

  // Reset to page 1 whenever any search, filter, or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedHub, selectedCategory, selectedExperience, remoteOnly, minSalary, pageSize, savedOnly]);

  // Global & Regional Tech Hubs
  const TECH_HUBS = [
    { label: 'All Locations & Remote', value: 'All' },
    { label: 'Remote (Worldwide / Global)', value: 'Worldwide' },
    { label: 'Remote (Any)', value: 'Remote' },
    { label: 'SF Bay Area, CA', value: 'San Francisco' },
    { label: 'New York, NY', value: 'New York' },
    { label: 'Seattle, WA', value: 'Seattle' },
    { label: 'Austin, TX', value: 'Austin' },
    { label: 'Boston, MA', value: 'Boston' },
    { label: 'London, UK & Europe', value: 'London' },
    { label: 'Bengaluru / India', value: 'India' },
    { label: 'Toronto & Canada', value: 'Toronto' },
    { label: 'Singapore & APAC', value: 'Singapore' },
  ];

  const [sortBy, setSortBy] = useState<'latest' | 'salary'>('latest');

  // Active (Non-Expired) Jobs: Automatically vanish jobs whose validThrough date has passed or status !== 'ACTIVE'
  const activeJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    return jobs
      .filter((job) => !isJobExpired(job))
      .sort((a, b) => getJobTimestamp(b) - getJobTimestamp(a));
  }, [jobs]);

  // Filtering & Sorting Logic over active jobs (Latest jobs always on top by default)
  const filteredJobs = useMemo(() => {
    const list = activeJobs.filter((job) => {
      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = job.title ? job.title.toLowerCase().includes(query) : false;
        const matchesCompany = job.company ? job.company.toLowerCase().includes(query) : false;
        const matchesSkills = Array.isArray(job.skills) ? job.skills.some((s) => s && s.toLowerCase().includes(query)) : false;
        const matchesDesc = job.description ? job.description.toLowerCase().includes(query) : false;
        const matchesAts =
          (job.atsProvider && job.atsProvider.toLowerCase().includes(query)) ||
          (job.source && job.source.toLowerCase().includes(query));
        if (!matchesTitle && !matchesCompany && !matchesSkills && !matchesDesc && !matchesAts) {
          return false;
        }
      }

      // Hub / Location
      if (selectedHub !== 'All') {
        if (selectedHub === 'Remote') {
          if (!job.isRemote) return false;
        } else if (selectedHub === 'Worldwide') {
          const loc = (job.location || '').toLowerCase();
          const req = (job.applicantLocationRequirements || '').toLowerCase();
          if (!loc.includes('worldwide') && !loc.includes('global') && !req.includes('worldwide') && !req.includes('global')) {
            return false;
          }
        } else {
          const query = selectedHub.toLowerCase();
          const locMatch =
            (job.location && job.location.toLowerCase().includes(query)) ||
            (job.city && job.city.toLowerCase().includes(query)) ||
            (job.country && job.country.toLowerCase().includes(query)) ||
            (job.state && job.state.toLowerCase().includes(query));
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

      // Bookmarked / Saved Only
      if (savedOnly && !savedJobIds.includes(job.id)) {
        return false;
      }

      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'salary') {
        const salA = a.salary?.max || a.salary?.min || 0;
        const salB = b.salary?.max || b.salary?.min || 0;
        if (salB !== salA) return salB - salA;
      }
      // Default: Latest jobs on top (newest datePosted / creation timestamp first)
      const diff = getJobTimestamp(b) - getJobTimestamp(a);
      if (diff !== 0) return diff;
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [activeJobs, searchQuery, selectedHub, selectedCategory, selectedExperience, remoteOnly, minSalary, savedOnly, savedJobIds, sortBy]);

  // Derived Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredJobs.length);
  const paginatedJobs = useMemo(() => {
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, startIndex, endIndex]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Smoothly scroll back to job list container
      const container = document.getElementById('job-feed-section');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#202124] flex flex-col selection:bg-[#1a73e8] selection:text-white font-sans">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        jobCount={activeJobs.length}
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

            {/* Google AdSense Style Hero Section */}
            <section className="bg-white border-b border-[#dadce0] pt-14 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                  {/* Left Column: Bold Typography & CTAs */}
                  <div className="lg:col-span-7">
                    <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-bold text-[#202124] tracking-tight leading-[1.15] mb-6">
                      Entry-Level, Fresher,<br />
                      <span className="text-[#1a73e8]">New Grad tech jobs</span>
                    </h1>

                    <p className="text-base sm:text-lg text-[#5f6368] max-w-xl mb-9 leading-relaxed font-normal">
                      Direct software engineering listings for entry level, freshers, and university graduates across US &amp; Global tech hubs &amp; remote.
                    </p>

                    <div className="flex items-center gap-6 flex-wrap">
                      <button
                        onClick={() => {
                          document.getElementById('job-feed-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-8 py-3.5 rounded-full font-medium text-sm transition-all shadow-xs hover:shadow-md cursor-pointer"
                      >
                        Explore Open Roles
                      </button>
                      <button
                        onClick={() => handleTabChange('salary-guide')}
                        className="text-[#1a73e8] hover:text-[#1557b0] font-medium text-sm inline-flex items-center gap-1 group cursor-pointer"
                      >
                        <span>Learn how salary guides work</span>
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Google Corporate Device & Metric Visuals */}
                  <div className="lg:col-span-5 relative">
                    <div className="relative mx-auto w-full max-w-sm sm:max-w-md">
                      {/* Device Container Frame */}
                      <div className="bg-white border border-[#dadce0] rounded-3xl p-5 shadow-sm">
                        <div className="bg-[#f8f9fa] rounded-2xl p-4 border border-[#e8eaed]">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-[#1a73e8] text-white flex items-center justify-center font-bold text-xs">
                                FC
                              </div>
                              <span className="text-xs font-semibold text-[#202124]">Verified Direct Feed</span>
                            </div>
                            <span className="text-[10px] font-medium bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded-full border border-[#ceead6]">
                              Live Openings
                            </span>
                          </div>

                          {/* Mini Sample Cards */}
                          <div className="space-y-3">
                            <div className="bg-white rounded-xl p-3.5 border border-[#dadce0] shadow-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-xs text-[#202124]">Stripe • SWE New Grad</span>
                                <span className="text-xs font-medium text-[#1a73e8]">$140k–$175k</span>
                              </div>
                              <div className="text-[11px] text-[#5f6368] flex items-center gap-1.5 mb-2">
                                <span>San Francisco, CA</span>
                                <span>•</span>
                                <span>0–1 YoE Cap</span>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-full font-medium">
                                  Direct Verified
                                </span>
                                <span className="text-[#1a73e8] font-medium">Direct Apply ›</span>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl p-3.5 border border-[#dadce0] shadow-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-xs text-[#202124]">Cloudflare • Systems Engineer</span>
                                <span className="text-xs font-medium text-[#1a73e8]">$118k–$138k</span>
                              </div>
                              <div className="text-[11px] text-[#5f6368] flex items-center gap-1.5 mb-2">
                                <span>Remote (Worldwide)</span>
                                <span>•</span>
                                <span>Early Career</span>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-full font-medium">
                                  Direct Verified
                                </span>
                                <span className="text-[#1a73e8] font-medium">Direct Apply ›</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Floating Accent Card 1: Pastel Blue Target/Click Icon */}
                      <div className="absolute -top-4 -right-3 bg-[#e8f0fe] text-[#1a73e8] p-3.5 rounded-2xl shadow-sm border border-[#d2e3fc] flex items-center justify-center">
                        <Target className="w-6 h-6" />
                      </div>

                      {/* Floating Accent Card 2: Pastel Blue Growth Graph Icon */}
                      <div className="absolute top-1/2 -right-5 translate-y-3 bg-[#e8f0fe] text-[#1a73e8] p-3.5 rounded-2xl shadow-sm border border-[#d2e3fc] flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                      </div>

                      {/* Floating Accent Card 3: Shield Badge */}
                      <div className="absolute -bottom-5 -left-3 bg-white border border-[#dadce0] rounded-2xl p-3 shadow-md flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#e6f4ea] text-[#137333] flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[#202124]">Strict 0–2 YoE Cap</div>
                          <div className="text-[10px] text-[#5f6368]">No Senior Clutter</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Three Steps to Get Started Section */}
            <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-b border-[#dadce0]">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-normal text-[#202124] text-center tracking-tight mb-16">
                  Three steps to get started
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-[#e8f0fe] text-[#1a73e8] rounded-2xl flex items-center justify-center text-3xl font-medium mb-6">
                      1
                    </div>
                    <h3 className="text-xl font-medium text-[#202124] mb-3">
                      Find 0–2 YoE Roles
                    </h3>
                    <p className="text-sm text-[#5f6368] leading-relaxed max-w-xs font-normal">
                      Browse verified early-career, new grad, and junior engineering openings across global tech hubs and remote.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-[#e8f0fe] text-[#1a73e8] rounded-2xl flex items-center justify-center text-3xl font-medium mb-6">
                      2
                    </div>
                    <h3 className="text-xl font-medium text-[#202124] mb-3">
                      Review Transparent Pay
                    </h3>
                    <p className="text-sm text-[#5f6368] leading-relaxed max-w-xs font-normal">
                      Evaluate verified state compensation disclosures, total compensation benchmarks, and cost-of-living metrics.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-[#e8f0fe] text-[#1a73e8] rounded-2xl flex items-center justify-center text-3xl font-medium mb-6">
                      3
                    </div>
                    <h3 className="text-xl font-medium text-[#202124] mb-3">
                      Direct Career Apply
                    </h3>
                    <p className="text-sm text-[#5f6368] leading-relaxed max-w-xs font-normal">
                      Route directly to official company career portals and application forms with zero middleman friction.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Google-Style Search & Filter Console Section */}
            <section className="bg-[#f8f9fa] border-b border-[#dadce0] py-8 px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                {/* Search Bar Container */}
                <div className="bg-white border border-[#dadce0] hover:border-[#bdc1c6] focus-within:border-[#1a73e8] focus-within:shadow-md rounded-full px-5 py-3 flex items-center gap-3 transition-all mb-4">
                  <Search className="w-5 h-5 text-[#5f6368] shrink-0" />
                  <input
                    id="job-search-input"
                    type="text"
                    placeholder="Search software jobs, skills (React, Python, Go, Rust), or companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-sm sm:text-base text-[#202124] placeholder-[#80868b] bg-transparent focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-[#5f6368] hover:text-[#202124] px-2 py-1 rounded-full hover:bg-[#f1f3f4] cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filter Pills & Selectors (Even and Centered) */}
                <div className="flex flex-col items-center justify-center gap-3 w-full">
                  {/* Primary Chips: Centered */}
                  <div className="flex items-center justify-center gap-2 flex-wrap w-full">
                    <button
                      onClick={() => setSelectedExperience('All')}
                      className={`h-9 px-4 rounded-full text-xs font-medium transition-all cursor-pointer inline-flex items-center justify-center ${
                        selectedExperience === 'All'
                          ? 'bg-[#1a73e8] text-white shadow-xs'
                          : 'bg-white border border-[#dadce0] text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]'
                      }`}
                    >
                      All Openings ({activeJobs.length})
                    </button>
                    <button
                      onClick={() => setSelectedExperience('Entry Level')}
                      className={`h-9 px-4 rounded-full text-xs font-medium transition-all cursor-pointer inline-flex items-center justify-center ${
                        selectedExperience === 'Entry Level'
                          ? 'bg-[#1a73e8] text-white shadow-xs'
                          : 'bg-white border border-[#dadce0] text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]'
                      }`}
                    >
                      Entry/Early &amp; Remote (0–2 YoE)
                    </button>
                    <button
                      onClick={() => setSelectedExperience('Internship')}
                      className={`h-9 px-4 rounded-full text-xs font-medium transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                        selectedExperience === 'Internship'
                          ? 'bg-[#1a73e8] text-white shadow-xs'
                          : 'bg-white border border-[#dadce0] text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]'
                      }`}
                    >
                      <span>🎓 Internships</span>
                    </button>
                    <button
                      onClick={() => setSavedOnly(!savedOnly)}
                      className={`h-9 px-4 rounded-full text-xs font-medium transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                        savedOnly
                          ? 'bg-[#f9ab00] text-[#202124] shadow-xs'
                          : 'bg-white border border-[#dadce0] text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${savedOnly ? 'fill-current' : ''}`} />
                      <span>Saved ({savedJobIds.length})</span>
                    </button>
                  </div>

                  {/* Dropdowns & Modifiers: Centered & Even Height */}
                  <div className="flex items-center justify-center gap-2 flex-wrap w-full">
                    <select
                      id="select-hub"
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

                    <select
                      id="select-category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="h-9 px-3.5 rounded-full text-xs font-medium border border-[#dadce0] bg-white text-[#3c4043] focus:outline-none focus:border-[#1a73e8] cursor-pointer hover:bg-[#f8f9fa] transition-colors"
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

                    <label className="h-9 inline-flex items-center gap-2 px-3.5 rounded-full border border-[#dadce0] bg-white text-xs font-medium text-[#3c4043] cursor-pointer hover:bg-[#f8f9fa] transition-colors select-none">
                      <input
                        type="checkbox"
                        checked={remoteOnly}
                        onChange={(e) => setRemoteOnly(e.target.checked)}
                        className="rounded text-[#1a73e8] focus:ring-[#1a73e8] w-3.5 h-3.5"
                      />
                      <span>Remote Only</span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Job Listings Grid & In-Feed Ads */}
            <div id="job-feed-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {selectedExperience === 'Internship' 
                      ? '🎓 Summer 2026/2027 Tech Internships' 
                      : selectedHub === 'All' 
                        ? 'Latest Opportunities' 
                        : `${selectedHub} Engineering Positions`}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {filteredJobs.length > 0
                      ? `Showing ${startIndex + 1}–${endIndex} of ${filteredJobs.length} verified ${selectedExperience === 'Internship' ? 'internships' : 'positions'}`
                      : '0 positions found'}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center flex-wrap">
                  {/* Sort Selector: Latest / Highest Salary */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="hidden sm:inline">Sort:</span>
                    <select
                      id="select-job-sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'latest' | 'salary')}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1a73e8] cursor-pointer"
                      title="Sort jobs"
                    >
                      <option value="latest">Latest First</option>
                      <option value="salary">Highest Salary</option>
                    </select>
                  </div>

                  {/* Page Size Selector */}
                  {filteredJobs.length > 6 && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="hidden sm:inline">Per page:</span>
                      <select
                        id="select-page-size"
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
                        title="Jobs per page"
                      >
                        <option value={6}>6</option>
                        <option value={9}>9</option>
                        <option value={12}>12</option>
                        <option value={18}>18</option>
                      </select>
                    </div>
                  )}

                  {/* Reset filters if applied */}
                  {(searchQuery || selectedHub !== 'All' || selectedCategory !== 'All' || selectedExperience !== 'All' || remoteOnly) && (
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
                      setSelectedExperience('All');
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
                    {paginatedJobs.slice(0, 6).map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onSelect={handleSelectJob}
                        isSaved={savedJobIds.includes(job.id)}
                        onToggleSave={handleToggleSaveJob}
                      />
                    ))}
                  </div>

                  {/* Compliant In-Feed Ad Unit (Inserted seamlessly between job cards with clear margin) */}
                  {adConfig.enabled && adConfig.inFeedAd && (
                    <div className="py-2">
                      <AdSlot type="in-feed" config={adConfig} />
                    </div>
                  )}

                  {/* Remaining Job Cards for current page */}
                  {paginatedJobs.length > 6 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedJobs.slice(6).map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onSelect={handleSelectJob}
                          isSaved={savedJobIds.includes(job.id)}
                          onToggleSave={handleToggleSaveJob}
                        />
                      ))}
                    </div>
                  )}

                  {/* Pagination Controls Bar */}
                  {totalPages > 1 && (
                    <div className="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
                      <div className="text-xs text-slate-500 font-medium order-2 sm:order-1">
                        Page <strong className="text-slate-900">{safeCurrentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong> ({filteredJobs.length} total openings)
                      </div>

                      <div className="flex items-center gap-1.5 order-1 sm:order-2">
                        {/* First Page */}
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={safeCurrentPage === 1}
                          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          title="First Page"
                        >
                          <ChevronsLeft className="w-4 h-4" />
                        </button>

                        {/* Prev Page */}
                        <button
                          onClick={() => handlePageChange(safeCurrentPage - 1)}
                          disabled={safeCurrentPage === 1}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span className="hidden sm:inline">Prev</span>
                        </button>

                        {/* Page Number Buttons */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((page) => {
                              // Show first, last, and within 1 of safeCurrentPage
                              return (
                                page === 1 ||
                                page === totalPages ||
                                Math.abs(page - safeCurrentPage) <= 1
                              );
                            })
                            .reduce<(number | string)[]>((acc, page, idx, arr) => {
                              if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) {
                                acc.push(`ellipsis-${page}`);
                              }
                              acc.push(page);
                              return acc;
                            }, [])
                            .map((item) => {
                              if (typeof item === 'string') {
                                return (
                                  <span key={item} className="px-2 py-1 text-slate-400 text-xs">
                                    &hellip;
                                  </span>
                                );
                              }
                              const pageNum = item as number;
                              const isActive = pageNum === safeCurrentPage;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                    isActive
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                        </div>

                        {/* Next Page */}
                        <button
                          onClick={() => handlePageChange(safeCurrentPage + 1)}
                          disabled={safeCurrentPage === totalPages}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        {/* Last Page */}
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          disabled={safeCurrentPage === totalPages}
                          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          title="Last Page"
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Editorial Guide, Regional Salary Matrix & Comprehensive FAQs */}
            <HomeEditorialContent onNavigateTab={handleTabChange} />
          </div>
        )}

        {/* VIEW 2: ORIGINAL SALARY BENCHMARKS & GUIDES */}
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
          <AboutUsView onNavigateContact={() => handleTabChange('contact')} />
        )}

        {/* VIEW 6: CONTACT US */}
        {activeTab === 'contact' && (
          <ContactUsView />
        )}

        {/* VIEW 7: LEGAL, TERMS OF SERVICE & DISCLOSURES */}
        {(activeTab === 'terms' || activeTab === 'privacy' || activeTab === 'disclaimer' || activeTab === 'cookie-policy') && (
          <LegalPageView
            initialSection={activeTab}
            onNavigateTab={handleTabChange}
          />
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
        onClose={handleCloseJob}
        adConfig={adConfig}
        isSaved={selectedJob ? savedJobIds.includes(selectedJob.id) : false}
        onToggleSave={handleToggleSaveJob}
      />

      {/* Legal & Compliance Modals */}
      <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />

      {/* GDPR / CCPA / Google AdSense Cookie Consent Banner */}
      <CookieConsentBanner onOpenPrivacyModal={() => setLegalModalType('privacy')} />

      {/* Google Corporate Footer */}
      <footer className="bg-[#f8f9fa] border-t border-[#dadce0] mt-16 py-12 px-4 sm:px-6 lg:px-8 text-xs text-[#5f6368] font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <FreshCommitsLogo size="sm" showWordmark={true} showDomainBadge={true} />
            <div className="hidden sm:block border-l border-[#dadce0] pl-3">
              <p className="text-[11px] text-[#5f6368]">
                Verified 0–2 YoE Software Engineering Opportunities &bull; Direct Career Routing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 flex-wrap text-xs">
            <a
              href="/?view=tools"
              onClick={(e) => {
                e.preventDefault();
                handleTabChange('tools');
              }}
              className="text-[#1a73e8] font-medium hover:underline transition-colors"
            >
              Career Tools &amp; TC Calculator
            </a>
            <a
              href="/?view=insights"
              onClick={(e) => {
                e.preventDefault();
                handleTabChange('insights');
              }}
              className="text-[#5f6368] hover:text-[#202124] transition-colors"
            >
              Career Insights
            </a>
            <a
              href="/salary-guide"
              onClick={(e) => {
                e.preventDefault();
                handleTabChange('salary-guide');
              }}
              className="text-[#5f6368] hover:text-[#202124] transition-colors"
            >
              Salary Benchmarks
            </a>
            <a
              href="/about"
              id="footer-link-about"
              onClick={(e) => {
                e.preventDefault();
                handleTabChange('about');
              }}
              className="text-[#5f6368] hover:text-[#202124] transition-colors"
            >
              About Us
            </a>
            <a
              href="/contact"
              id="footer-link-contact"
              onClick={(e) => {
                e.preventDefault();
                handleTabChange('contact');
              }}
              className="text-[#5f6368] hover:text-[#202124] transition-colors"
            >
              Contact Us
            </a>
            <a
              href="/terms"
              id="footer-link-terms"
              onClick={(e) => {
                e.preventDefault();
                handleTabChange('terms');
              }}
              className="text-[#5f6368] hover:text-[#202124] transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/privacy-policy"
              id="footer-link-privacy"
              onClick={(e) => {
                e.preventDefault();
                handleTabChange('privacy');
              }}
              className="text-[#5f6368] hover:text-[#202124] transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/disclaimer"
              id="footer-link-disclaimer"
              onClick={(e) => {
                e.preventDefault();
                handleTabChange('disclaimer');
              }}
              className="text-[#5f6368] hover:text-[#202124] transition-colors"
            >
              Disclaimer
            </a>
            <button
              onClick={() => {
                localStorage.removeItem('freshcommits_cookie_consent_v1');
                window.location.reload();
              }}
              className="text-[#80868b] hover:text-[#202124] text-[11px] underline transition-colors cursor-pointer"
              title="Change your cookie consent preferences"
            >
              Cookie Preferences
            </button>

            {/* Social channels */}
            <div className="flex items-center gap-2 pl-3 border-l border-[#dadce0]">
              <a
                href="https://www.linkedin.com/company/freshcommits"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#5f6368] hover:text-[#0A66C2] transition-colors"
                title="LinkedIn community page"
              >
                <Linkedin className="w-3.5 h-3.5 fill-current" />
                <span>LinkedIn</span>
              </a>
              <span className="text-[#dadce0]">&bull;</span>
              <a
                href="https://x.com/Jishaka4"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#5f6368] hover:text-[#202124] transition-colors"
                title="X / Twitter official alerts (@Jishaka4)"
              >
                <Twitter className="w-3.5 h-3.5 fill-current" />
                <span>Twitter / X</span>
              </a>
              <span className="text-[#dadce0]">&bull;</span>
              <a
                href="https://www.youtube.com/@FreshCommits-t3l"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#5f6368] hover:text-[#ea4335] transition-colors"
                title="FreshCommits YouTube Channel (@FreshCommits-t3l)"
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>YouTube</span>
              </a>
            </div>

            {/* Show owner shortcut only when authenticated */}
            {isAdminAuthenticated && (
              <button
                onClick={() => setActiveTab('admin')}
                className="text-[#1a73e8] font-medium flex items-center gap-1.5 hover:underline bg-[#e8f0fe] px-2.5 py-1 rounded-full border border-[#d2e3fc] cursor-pointer"
              >
                <Lock className="w-3 h-3 text-[#1a73e8]" />
                <span>Owner Portal</span>
              </button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#dadce0] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#80868b] gap-2">
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
              className="text-[#80868b] hover:text-[#202124] transition-colors flex items-center gap-1 cursor-pointer"
              title="Site Owner Login (kartikamuthukrishnan@gmail.com)"
            >
              <Lock className="w-2.5 h-2.5 opacity-50" />
              <span>Owner Access</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span>Direct Career Routing</span>
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
