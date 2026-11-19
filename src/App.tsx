import React, { useState, useEffect, useMemo, useRef, Suspense, lazy } from 'react';
import { JobPosting, AdSenseConfig, SyncLog } from './types';
import { INITIAL_JOBS } from './data/initialJobs';
import { CAREER_ARTICLES } from './data/careerArticles';
import { Navbar } from './components/Navbar';
import { JobCard } from './components/JobCard';
import { JobListItem } from './components/JobListItem';
import {
  JobFeedControls,
  JobFilterState,
  ViewModeOption,
  applyJobFiltersAndSort,
} from './components/JobFeedControls';
import { JobDetailsPage } from './components/JobDetailsPage';
import { sanitizeJobPosting, sanitizeJobTitle } from './utils/jobSanitizer';
const JobDirectoryView = lazy(() => import('./components/JobDirectoryView').then((m) => ({ default: m.JobDirectoryView })));
const AdminPanel = lazy(() => import('./components/AdminPanel').then((m) => ({ default: m.AdminPanel })));
const SalaryGuideView = lazy(() => import('./components/OriginalGuides').then((m) => ({ default: m.SalaryGuideView })));
const AdSensePolicyView = lazy(() => import('./components/OriginalGuides').then((m) => ({ default: m.AdSensePolicyView })));
const CareerInsightsView = lazy(() => import('./components/OriginalGuides').then((m) => ({ default: m.CareerInsightsView })));
const InteractiveToolsView = lazy(() => import('./components/InteractiveTools').then((m) => ({ default: m.InteractiveToolsView })));
const ProjectBlueprintsView = lazy(() => import('./components/ProjectBlueprintsView').then((m) => ({ default: m.ProjectBlueprintsView })));
const CompanyHubsView = lazy(() => import('./components/CompanyHubsView').then((m) => ({ default: m.CompanyHubsView })));
const AboutUsView = lazy(() => import('./components/TrustPages').then((m) => ({ default: m.AboutUsView })));
const ContactUsView = lazy(() => import('./components/TrustPages').then((m) => ({ default: m.ContactUsView })));
const LegalPageView = lazy(() => import('./components/LegalPageView').then((m) => ({ default: m.LegalPageView })));
import { AdSlot } from './components/AdSlot';
import { LegalModal } from './components/LegalModals';
import { AdminLoginModal } from './components/AdminLoginModal';
import { FreshCommitsLogo } from './components/FreshCommitsLogo';
import { HomeEditorialContent } from './components/HomeEditorialContent';
import { FeaturedEditorialSection } from './components/FeaturedEditorialSection';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { AppTab } from './types';
import {
  isJobExpired,
  isJobPulseExtractedJob,
  isJobUsingEditorialLeadParagraph,
  isJobUsingMicrosoftPattern
} from './utils/jobAggregator';
import { getFocusKeywordForJob, stripSyntheticSpamBoilerplate } from './utils/textHumanizer';
import { disableAnalyticsForAdmin, trackPageView } from './utils/analytics';
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
  ArrowRight,
  FileSearch,
  Layers
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

export { getJobTimestamp, compareJobsLatestFirst } from './utils/jobSorting';
import { getJobTimestamp, compareJobsLatestFirst } from './utils/jobSorting';

export default function App() {
  // 1. Persistent State for Jobs (authoritative verified listings)
  const [jobs, setJobs] = useState<JobPosting[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_JOBS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Deduplicate by id
          const seen = new Set<string>();
          const deduped: JobPosting[] = [];
          for (const item of parsed) {
            if (item && item.id && !seen.has(item.id)) {
              // Automatically purge deprecated thin scraped stubs from stale browser caches
              const words = (item.description || '').trim().split(/\s+/).filter(Boolean).length;
              const isThinStub = (item.id.startsWith('manual-179') && words <= 48) ||
                                 item.id === 'manual-1792069663312' ||
                                 item.id === 'manual-1791997615288';
              if (!isThinStub) {
                seen.add(item.id);
                let finalItem = sanitizeJobPosting(item);
                if (
                  isJobPulseExtractedJob(finalItem) ||
                  isJobUsingEditorialLeadParagraph(finalItem) ||
                  isJobUsingMicrosoftPattern(finalItem)
                ) {
                  finalItem = {
                    ...finalItem,
                    status: 'EXPIRED',
                    validThrough: '2025-01-01',
                    healthStatus: 'DEAD_LINK'
                  };
                }
                deduped.push(finalItem);
              }
            }
          }
          if (deduped.length > 0) {
            return deduped;
          }
        }
      }
    } catch (e) {
      console.warn('Could not read saved jobs from localStorage', e);
    }
    return INITIAL_JOBS.map((j) => sanitizeJobPosting(j));
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

  // 3. Hydrate static /data/jobs.json cache immediately + connect real-time Firestore synchronization
  const cloudJobsLoadedRef = useRef(false);
  useEffect(() => {
    let mounted = true;
    testFirebaseConnection();

    // Async static jobs hydration (keeps initial JS bundle lightweight)
    fetch('/data/jobs.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((staticList) => {
        if (!mounted || !Array.isArray(staticList) || staticList.length === 0) return;
        const sanitizedStatic = staticList.filter((j) => j && j.id).map(sanitizeJobPosting);
        if (!cloudJobsLoadedRef.current) {
          setJobs((prev) => (prev.length === 0 ? sanitizedStatic : prev));
        }

        // Hydrate active /job/:id deep link immediately if selectedJob isn't resolved yet
        try {
          const pathMatch = window.location.pathname.match(/^\/(?:jobs|job)\/([^/?#]+)/i);
          const urlParams = new URLSearchParams(window.location.search);
          const targetId = pathMatch?.[1] ? decodeURIComponent(pathMatch[1]) : (urlParams.get('job') || urlParams.get('jobId'));
          if (targetId) {
            const matched = sanitizedStatic.find((j) => j.id.toLowerCase() === targetId.trim().toLowerCase());
            if (matched) {
              setSelectedJob((curr) => curr || matched);
            }
          }
        } catch {}
      })
      .catch(() => {});

    // Subscribe to live cloud jobs (Firestore is authoritative source of truth)
    const unsubscribeJobs = subscribeToLiveJobs((cloudJobs) => {
      if (cloudJobs && cloudJobs.length > 0) {
        cloudJobsLoadedRef.current = true;
        const expiredToSync: JobPosting[] = [];
        const sanitizedCloudJobs = cloudJobs.map((rawJob) => {
          const j = sanitizeJobPosting(rawJob);
          const isPulse = isJobPulseExtractedJob(j);
          const isEditorial = isJobUsingEditorialLeadParagraph(j);
          const isMicrosoft = isJobUsingMicrosoftPattern(j);
          if (
            (isPulse || isEditorial || isMicrosoft) &&
            (j.status !== 'EXPIRED' || !j.validThrough || j.validThrough >= '2026-01-01')
          ) {
            const updated = {
              ...j,
              status: 'EXPIRED' as const,
              validThrough: '2025-01-01',
              healthStatus: 'DEAD_LINK' as const
            };
            expiredToSync.push(updated);
            return updated;
          }
          return j;
        });
        if (expiredToSync.length > 0) {
          batchSaveJobsToCloud(expiredToSync).catch((err) => console.warn('Could not sync expired jobs to cloud:', err));
        }
        setJobs(sanitizedCloudJobs);
        try {
          localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(sanitizedCloudJobs));
        } catch {
          // ignore
        }

        try {
          const urlParams = new URLSearchParams(window.location.search);
          const targetJobId = urlParams.get('job') || urlParams.get('jobId');
          if (targetJobId) {
            const matchedCloudJob = sanitizedCloudJobs.find((j) => j.id.toLowerCase() === targetJobId.toLowerCase());
            if (matchedCloudJob) {
              setSelectedJob(matchedCloudJob);
              document.title = `${sanitizeJobTitle(matchedCloudJob.title)} at ${matchedCloudJob.company} | FreshCommits`;
            }
          }
        } catch {
          // ignore
        }
      }
    });

    const unsubscribeAds = subscribeToAdConfig((cloudAdConfig) => {
      if (cloudAdConfig) {
        setAdConfig((prev) => ({ ...prev, ...cloudAdConfig }));
      }
    });

    return () => {
      mounted = false;
      unsubscribeJobs();
      unsubscribeAds();
    };
  }, []);

  // Save changes to localStorage for 0-cost instant cached reload (strictly guarded against echo loops)
  const lastSavedJobsHash = useRef<string>('');
  useEffect(() => {
    if (!jobs || jobs.length === 0) return;
    const summaryKey = `${jobs.length}-${jobs[0]?.id || ''}-${jobs[jobs.length - 1]?.id || ''}`;
    if (lastSavedJobsHash.current === summaryKey) return;
    lastSavedJobsHash.current = summaryKey;
    try {
      localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
    } catch (e) {
      console.warn('Failed saving jobs to localStorage', e);
    }
  }, [jobs]);

  // Synchronize AdSense configuration across tabs if modified in Admin panel
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
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
      if (path === '/jobs' || path === '/all-jobs' || path === '/jobs-directory' || path === '/job-directory' || path.endsWith('/jobs')) return 'jobs-directory';
      if (path === '/privacy' || path === '/privacy-policy' || path === '/privacy-policy.html' || path.endsWith('/privacy-policy')) return 'privacy';
      if (path === '/about' || path === '/about-us' || path === '/about.html' || path.endsWith('/about')) return 'about';
      if (path === '/terms' || path === '/terms-of-service' || path === '/tos' || path.endsWith('/terms')) return 'terms';
      if (path === '/contact' || path === '/contact-us' || path.endsWith('/contact')) return 'contact';
      if (path === '/companies' || path.startsWith('/companies') || path.startsWith('/company')) return 'companies';
      if (path === '/salary-guide' || path === '/salary' || path.endsWith('/salary-guide')) return 'salary-guide';
      if (
        path === '/insights' ||
        path === '/career-insights' ||
        path === '/guides' ||
        path === '/blog' ||
        path === '/articles' ||
        path.startsWith('/insights') ||
        path.startsWith('/career-insights') ||
        path.startsWith('/blog') ||
        path.startsWith('/guides') ||
        path.startsWith('/article') ||
        CAREER_ARTICLES.some((a) => path === '/' + a.id || path.endsWith('/' + a.id))
      ) {
        return 'insights';
      }
      if (path === '/tools' || path === '/career-tools' || path === '/calculator' || path.endsWith('/career-tools')) return 'tools';
      if (path === '/project-blueprints' || path === '/blueprints' || path.endsWith('/project-blueprints')) return 'blueprints';
      if (path === '/policy' || path === '/adsense-policy' || path.endsWith('/adsense-policy')) return 'adsense-policy';
      if (path === '/disclaimer' || path.endsWith('/disclaimer')) return 'disclaimer';
      if (path === '/cookie-policy' || path === '/cookies' || path.endsWith('/cookie-policy')) return 'cookie-policy';
      if (path === '/admin') return 'admin';

      // 2. Check query params (?view=...)
      const urlParams = new URLSearchParams(window.location.search);
      const view = urlParams.get('view');
      const companyParam = urlParams.get('company');
      if (view === 'jobs-directory' || view === 'directory') return 'jobs-directory';
      if (view === 'companies' || view === 'company' || Boolean(companyParam)) return 'companies';
      if (view === 'salary-guide' || view === 'salary') return 'salary-guide';
      if (view === 'insights' || view === 'career-insights' || view === 'guides' || view === 'blog' || view === 'articles') return 'insights';
      if (view === 'tools' || view === 'career-tools' || view === 'calculator') return 'tools';
      if (view === 'blueprints' || view === 'project-blueprints') return 'blueprints';
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
      if (hash === 'jobs-directory' || hash === 'directory' || hash === 'browse-jobs') return 'jobs-directory';
      if (hash === 'companies' || hash === 'company' || hash.startsWith('companies/') || hash.startsWith('company/')) return 'companies';
      if (hash === 'tools' || hash === 'calculator' || hash === 'career-tools' || hash === 'tc-calculator') return 'tools';
      if (hash === 'blueprints' || hash === 'project-blueprints') return 'blueprints';
      if (hash === 'insights' || hash === 'career-insights' || hash === 'guides' || hash === 'blog' || hash === 'articles') return 'insights';
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
      case 'jobs-directory':
        return 'Verified Entry-Level & New Grad Tech Jobs Directory (0–2 YoE) – FreshCommits';
      case 'companies':
        return 'FAANG & Tech Unicorn Early Career Hubs (2026) – FreshCommits';
      case 'salary-guide':
        return '2026 Tech Salary Guide & Compensation Benchmarks – FreshCommits';
      case 'insights':
        return 'Engineering Career Insights & Practical Guides – FreshCommits';
      case 'tools':
        return 'Developer Career Tools & TC Calculator – FreshCommits';
      case 'blueprints':
        return 'Commercial Engineering Project Blueprints (0–2 YoE) – FreshCommits';
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

  // Dedicated Job URL Resolver: checks /job/<jobId>, /jobs/<jobId>, ?job=<jobId>, or #job=<jobId>
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

      // Check pathname: /job/:jobId or /jobs/:jobId
      if (!targetJobId) {
        const pathMatch = window.location.pathname.match(/^\/(?:jobs|job)\/([^/?#]+)/i);
        if (pathMatch) {
          targetJobId = decodeURIComponent(pathMatch[1]);
        }
      }

      if (targetJobId) {
        targetJobId = targetJobId.trim();
        const idMatch = targetJobId.match(/(manual-\d+|job-[a-z0-9_-]+|ext-[a-z0-9_-]+|sync-[a-z0-9_-]+|sr-[a-z0-9_-]+)/i);
        if (idMatch) {
          targetJobId = idMatch[1];
        } else {
          targetJobId = targetJobId.split(/[\s%]+/)[0];
        }
        const lowerTarget = targetJobId.toLowerCase();

        // 0. Prioritize edge SSR preloaded job for strict 1:1 SSR/hydration parity
        const preloaded = (window as any).__PRELOADED_JOB__;
        if (preloaded && preloaded.id && preloaded.id.toLowerCase() === lowerTarget) {
          return sanitizeJobPosting(preloaded);
        }

        // 1. Check sessionStorage for instant 0-cost retrieval (0ms latency, 0 database reads)
        try {
          const sessionRaw = sessionStorage.getItem(`job_${targetJobId}`) || sessionStorage.getItem('freshcommit_last_job');
          if (sessionRaw) {
            const parsed = JSON.parse(sessionRaw);
            if (parsed && parsed.id && parsed.id.toLowerCase() === lowerTarget) {
              return parsed;
            }
          }
        } catch (_) {}

        // 2. Check INITIAL_JOBS
        const inInitial = INITIAL_JOBS.find((j) => j.id.toLowerCase() === lowerTarget);
        if (inInitial) return inInitial;

        // 3. Check localStorage jobs
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

  // Dedicated Job Selection Handlers with zero-cost pushState URL routing & double-click protection
  const lastJobSelectTimeRef = useRef<number>(0);
  const handleSelectJob = (job: JobPosting, openInNewTab = false) => {
    const now = Date.now();
    if (now - lastJobSelectTimeRef.current < 350) {
      return;
    }
    lastJobSelectTimeRef.current = now;

    const cleanJob = sanitizeJobPosting(job);
    try {
      sessionStorage.setItem(`job_${cleanJob.id}`, JSON.stringify(cleanJob));
      sessionStorage.setItem('freshcommit_last_job', JSON.stringify(cleanJob));
    } catch (_) {}

    if (openInNewTab) {
      window.open(`/job/${cleanJob.id}`, '_blank', 'noopener,noreferrer');
    } else {
      setSelectedJob(cleanJob);
      try {
        window.history.pushState({ jobId: cleanJob.id }, '', `/job/${cleanJob.id}`);
        document.title = `${sanitizeJobTitle(cleanJob.title)} at ${cleanJob.company} | FreshCommits`;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        console.warn('Failed updating job URL', e);
      }
    }
  };

  const handleCloseJob = () => {
    setSelectedJob(null);
    try {
      const returnPath = activeTab === 'jobs-directory' ? '/jobs' : '/';
      window.history.pushState({}, '', returnPath);
      document.title = getTabTitle(activeTab);
    } catch (e) {
      console.warn('Failed clearing job URL', e);
    }
  };

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    if (selectedJob) {
      setSelectedJob(null);
    }
    try {
      const routeMap: Record<AppTab, string> = {
        jobs: '/',
        'jobs-directory': '/jobs',
        companies: '/companies',
        'salary-guide': '/salary-guide',
        insights: '/career-insights',
        tools: '/career-tools',
        blueprints: '/project-blueprints',
        about: '/about',
        contact: '/contact',
        'adsense-policy': '/adsense-policy',
        terms: '/terms',
        privacy: '/privacy-policy',
        disclaimer: '/disclaimer',
        'cookie-policy': '/cookie-policy',
        admin: '/?view=admin'
      };
      const newPath = routeMap[tab] || '/';
      window.history.pushState({ tab }, '', newPath);
      document.title = getTabTitle(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.warn('Failed updating tab URL', e);
    }
  };

  const handleOpenArticle = (articleId: string) => {
    setActiveTab('insights');
    if (selectedJob) {
      setSelectedJob(null);
    }
    try {
      window.history.pushState({ tab: 'insights', article: articleId }, '', `/career-insights?article=${articleId}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.warn('Failed opening article', e);
    }
  };

  // Listen for hash routes, ?job=, and ?admin=true in URL on browser navigation (popstate & hashchange)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncFromUrl = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const rawHash = window.location.hash.replace('#', '');
      const hash = rawHash.toLowerCase();

      // 1. Sync Job selection from pathname (/job/:id), ?job=, or #job=
      const jobParam = urlParams.get('job') || urlParams.get('jobId');
      let targetJobId = jobParam;
      if (!targetJobId && rawHash) {
        if (rawHash.startsWith('job=')) {
          targetJobId = rawHash.replace('job=', '');
        } else if (rawHash.startsWith('job-')) {
          targetJobId = rawHash;
        }
      }
      if (!targetJobId) {
        const pathMatch = window.location.pathname.match(/^\/(?:jobs|job)\/([^/?#]+)/i);
        if (pathMatch) {
          targetJobId = decodeURIComponent(pathMatch[1]);
        }
      }

      if (targetJobId) {
        targetJobId = targetJobId.trim();
        const idMatch = targetJobId.match(/(manual-\d+|job-[a-z0-9-]+|ext-[a-z0-9-]+|sync-[a-z0-9-]+)/i);
        if (idMatch) {
          targetJobId = idMatch[1];
        } else {
          targetJobId = targetJobId.split(/[\s%]+/)[0];
        }
        const lowerTarget = targetJobId.toLowerCase();

        // Check sessionStorage first for 0-cost instant hydration
        let sessionJob: JobPosting | null = null;
        try {
          const raw = sessionStorage.getItem(`job_${targetJobId}`) || sessionStorage.getItem('freshcommit_last_job');
          if (raw) {
            const p = JSON.parse(raw);
            if (p && p.id && p.id.toLowerCase() === lowerTarget) {
              sessionJob = p;
            }
          }
        } catch (_) {}

        const preloaded = (window as any).__PRELOADED_JOB__;
        const isPreloaded = preloaded && preloaded.id && preloaded.id.toLowerCase() === lowerTarget ? preloaded : null;

        const found =
          sessionJob ||
          isPreloaded ||
          jobs.find((j) => j && j.id && j.id.toLowerCase() === lowerTarget) ||
          INITIAL_JOBS.find((j) => j && j.id && j.id.toLowerCase() === lowerTarget);

        if (found) {
          setSelectedJob(found);
          document.title = `${found.title} at ${found.company} (${found.experienceLevel}) – FreshCommits`;
        } else if (targetJobId) {
          const activeJobId = targetJobId;
          // Actively fetch this specific job from Firestore cloud for instant discovery
          fetchSingleJobFromCloud(activeJobId).then((cloudJob) => {
            if (cloudJob) {
              setSelectedJob(cloudJob);
              document.title = `${cloudJob.title} at ${cloudJob.company} (${cloudJob.experienceLevel}) – FreshCommits`;
            } else {
              // Graceful Expired/Archived Job Shell for AdSense & Google Webmaster hygiene:
              // Rather than showing a dead 404 or empty screen, render an archived position state
              // with similar active alternatives and career context.
              const prettyTitle = activeJobId
                .replace(/^ext-[a-z]+-\d+-?/i, '')
                .replace(/^job-\d+-?/i, '')
                .split('-')
                .filter(Boolean)
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ') || 'Software Engineer (Early Career)';

              const archivedFallbackJob: JobPosting = {
                id: activeJobId,
                title: prettyTitle,
                company: 'Tech Employer',
                location: 'Remote / US & Global',
                isRemote: true,
                maxYearsExperience: 1,
                experienceLevel: 'Entry Level',
                category: 'Full Stack',
                employmentType: 'FULL_TIME',
                salary: { min: 0, max: 0, currency: 'USD', unit: 'YEAR' },
                description: `This position (${prettyTitle}) has concluded its recruitment cycle and is no longer accepting new applications. You can explore active entry-level software engineering openings below.`,
                responsibilities: [],
                qualifications: [],
                skills: ['Software Engineering', 'Problem Solving', 'Git'],
                applyUrl: 'https://www.freshcommits.com/',
                datePosted: 'Archived Requisition',
                validThrough: '2025-01-01', // Explicit past date so isJobExpired evaluates to true
                status: 'EXPIRED',
                source: 'AUTOMATED_SYNC',
                fingerprint: `archived-${targetJobId}`,
                viewsCount: 1,
                featured: false
              };

              setSelectedJob(archivedFallbackJob);
              document.title = `${prettyTitle} (Position Closed) – FreshCommits`;
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
        const focus = getFocusKeywordForJob(e.detail);
        document.title = `${e.detail.title} at ${e.detail.company} (${focus.displayTag}) – FreshCommits`;
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

  // Search & JobPulse Filters State
  const [filterState, setFilterState] = useState<JobFilterState>({
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
  const [viewMode, setViewMode] = useState<ViewModeOption>('list');

  const updateFilters = (patch: Partial<JobFilterState>) => {
    setFilterState((prev) => ({ ...prev, ...patch }));
  };

  const resetAllFilters = () => {
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
  const [pageSize, setPageSize] = useState<number>(12);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterState, pageSize]);

  // Bot & Duplicate Content Protection on filtered views
  useEffect(() => {
    if (selectedJob) return;

    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }

    const hasActiveFilters =
      Boolean(filterState.searchQuery.trim()) ||
      filterState.selectedHub !== 'All' ||
      filterState.selectedCategory !== 'All' ||
      filterState.workMode !== 'All' ||
      filterState.experience !== 'All' ||
      filterState.workAuth !== 'All' ||
      filterState.postedWithin !== 'any' ||
      filterState.savedOnly ||
      currentPage > 1;

    if (hasActiveFilters || activeTab === 'admin') {
      robotsMeta.content = 'noindex, follow';
    } else {
      robotsMeta.content = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    }
  }, [selectedJob, filterState, currentPage, activeTab]);

  // Active (Non-Expired) Jobs
  const activeJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    return jobs
      .filter((job) => !isJobExpired(job))
      .sort(compareJobsLatestFirst);
  }, [jobs]);

  // Filtered & Sorted Jobs
  const filteredJobs = useMemo(() => {
    return applyJobFiltersAndSort(activeJobs, filterState, savedJobIds);
  }, [activeJobs, filterState, savedJobIds]);

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
    <div className="min-h-screen bg-[#F0F8FF] text-[#202124] flex flex-col selection:bg-[#1a73e8] selection:text-white font-sans pb-16 md:pb-0">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        jobCount={activeJobs.length}
        isAdminAuthenticated={isAdminAuthenticated}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Main Content Area */}
      {selectedJob ? (
        <JobDetailsPage
          job={selectedJob}
          allJobs={activeJobs}
          onBack={handleCloseJob}
          adConfig={adConfig}
          isSaved={savedJobIds.includes(selectedJob.id)}
          onToggleSave={handleToggleSaveJob}
          onSelectRelatedJob={(relJob) => handleSelectJob(relJob, false)}
        />
      ) : (
        <>
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

            {/* Compact Hero Section */}
            <section className="bg-white border-b border-[#dadce0] pt-9 pb-11 px-4 sm:px-6 lg:px-8 overflow-hidden">
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

                    <div className="flex items-center gap-4 flex-wrap">
                      <a
                        href="/jobs"
                        onClick={(e) => {
                          e.preventDefault();
                          handleTabChange('jobs-directory');
                        }}
                        className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-7 py-3.5 rounded-full font-medium text-sm transition-all shadow-xs hover:shadow-md cursor-pointer inline-flex items-center gap-2"
                      >
                        <Briefcase className="w-4 h-4" />
                        <span>Browse Jobs Directory ({activeJobs.length})</span>
                      </a>
                      <button
                        onClick={() => {
                          document.getElementById('job-feed-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-white border border-[#dadce0] hover:bg-[#f8f9fa] text-[#3c4043] px-6 py-3.5 rounded-full font-medium text-sm transition-all cursor-pointer"
                      >
                        Quick Feed View
                      </button>
                      <button
                        onClick={() => handleTabChange('salary-guide')}
                        className="text-[#1a73e8] hover:text-[#1557b0] font-medium text-sm inline-flex items-center gap-1 group cursor-pointer"
                      >
                        <span>Salary guide</span>
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

            {/* Quick Guide & Platform Tools Availability Hub (Beginner friendly & at a glance) */}
            <section id="platform-tools-hub" className="bg-[#f8fafd] border-b border-[#dadce0] py-12 px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="text-center max-w-3xl mx-auto space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Everything You Need to Break Into Tech &bull; 100% Free &bull; No Login Required
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
                    Tools &amp; Features Available On FreshCommits
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5f6368] leading-relaxed">
                    Designed specifically for early-career engineers and university graduates. Understand what each tool is, how to use it, and what you get in under 5 seconds.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Verified Job Feed */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {activeJobs.length} Live Openings
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        Verified 0–2 YoE Job Feed
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="font-bold text-slate-800 block text-[11px] mb-0.5">🎯 WHAT IT IS:</span>
                          <p className="text-slate-600 leading-snug">Strictly filtered entry-level and new grad SWE jobs with direct links to company ATS portals.</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
                          <span className="font-bold text-blue-900 block text-[11px] mb-0.5">⚡ HOW TO USE IT:</span>
                          <p className="text-blue-800 leading-snug">Filter by stack (Frontend, Backend, AI) and click Direct Apply to bypass recruiting spam.</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                          <span className="font-bold text-emerald-950 block text-[11px] mb-0.5">🏆 WHAT YOU GET:</span>
                          <p className="text-emerald-900 leading-snug">Apply only to genuine 0–2 YoE postings that will never ghost you for lacking 5+ years experience.</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        document.getElementById('job-feed-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Explore Jobs ({activeJobs.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 2: ATS Keyword Matcher */}
                  <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                          <FileSearch className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white uppercase tracking-wider">
                          NEW &bull; Free
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        ATS Keyword Matcher
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="font-bold text-slate-800 block text-[11px] mb-0.5">🎯 WHAT IT IS:</span>
                          <p className="text-slate-600 leading-snug">A client-side scanner that compares your resume text against any job requisition in 3 seconds.</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                          <span className="font-bold text-emerald-950 block text-[11px] mb-0.5">⚡ HOW TO USE IT:</span>
                          <p className="text-emerald-900 leading-snug">Paste your resume and target requisition. Click Scan to calculate your match score.</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                          <span className="font-bold text-emerald-950 block text-[11px] mb-0.5">🏆 WHAT YOU GET:</span>
                          <p className="text-emerald-900 leading-snug">Spot exact missing technologies and get pre-written XYZ bullets to pass automated screens.</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleTabChange('tools');
                        try { window.location.hash = '#ats-matcher'; } catch {}
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Launch ATS Matcher (Free)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 3: Role Mock Interview Simulator */}
                  <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                          <Target className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          5 Rounds
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        Role Mock Simulator
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="font-bold text-slate-800 block text-[11px] mb-0.5">🎯 WHAT IT IS:</span>
                          <p className="text-slate-600 leading-snug">Simulated 5-round technical interview drill with realistic questions tailored to junior SWE roles.</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                          <span className="font-bold text-amber-950 block text-[11px] mb-0.5">⚡ HOW TO USE IT:</span>
                          <p className="text-amber-900 leading-snug">Choose your track, read/listen to questions, type answers, and check hints or model solutions.</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                          <span className="font-bold text-emerald-950 block text-[11px] mb-0.5">🏆 WHAT YOU GET:</span>
                          <p className="text-emerald-900 leading-snug">Zero-pressure practice that eliminates interview anxiety and sharpens your communication.</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleTabChange('tools');
                        try { window.location.hash = '#mock-simulator'; } catch {}
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Start Mock Practice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 4: Global Salary Index */}
                  <div className="bg-white rounded-2xl border border-teal-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-300 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                          12 Countries
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        2025–2026 Salary Index
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="font-bold text-slate-800 block text-[11px] mb-0.5">🎯 WHAT IT IS:</span>
                          <p className="text-slate-600 leading-snug">Transparent entry-level compensation benchmarks covering base pay, equity cliffs, and taxes.</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-100">
                          <span className="font-bold text-teal-950 block text-[11px] mb-0.5">⚡ HOW TO USE IT:</span>
                          <p className="text-teal-900 leading-snug">Select your country or US state from the drop-down to see realistic 0–2 YoE numbers.</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                          <span className="font-bold text-emerald-950 block text-[11px] mb-0.5">🏆 WHAT YOU GET:</span>
                          <p className="text-emerald-900 leading-snug">Accurate negotiation leverage so you never get lowballed on your first developer offer.</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTabChange('salary-guide')}
                      className="w-full py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Explore Salary Index</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Publisher Spotlight: 3 Premier Original Editorial Guides */}
            <FeaturedEditorialSection
              onOpenArticle={handleOpenArticle}
              onViewAllGuides={() => handleTabChange('insights')}
            />

            {/* JobPulse-Grade Search & Filter Console Section */}
            <section id="job-feed-section" className="bg-[#F0F8FF] border-b border-[#dadce0] py-6 px-4 sm:px-6 lg:px-8 scroll-mt-20">
              <div className="max-w-7xl mx-auto">
                <JobFeedControls
                  state={filterState}
                  onChange={updateFilters}
                  onReset={resetAllFilters}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  savedCount={savedJobIds.length}
                  searchInputId="job-search-input"
                />
              </div>
            </section>

            {/* Job Listings Feed & In-Feed Ads */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-[#202124]">
                    {filterState.experience !== 'All'
                      ? `${filterState.experience} Opportunities`
                      : filterState.selectedHub === 'All'
                      ? 'Latest Opportunities'
                      : `${filterState.selectedHub} Engineering Positions`}
                  </h2>
                  <p className="text-xs text-[#5f6368] tabular-nums">
                    {filteredJobs.length > 0
                      ? `Showing ${startIndex + 1}–${endIndex} of ${filteredJobs.length} open positions`
                      : '0 positions found'}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center flex-wrap">
                  {filteredJobs.length > 6 && (
                    <div className="flex items-center gap-1.5 text-xs text-[#5f6368]">
                      <span className="hidden sm:inline">Per page:</span>
                      <select
                        id="select-page-size"
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="px-2.5 py-1 bg-white border border-[#dadce0] rounded-lg text-xs font-medium text-[#3c4043] focus:outline-none focus:border-[#1a73e8]"
                        title="Jobs per page"
                      >
                        <option value={9}>9</option>
                        <option value={12}>12</option>
                        <option value={18}>18</option>
                        <option value={24}>24</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="space-y-8 my-6">
                  <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#dadce0] shadow-2xs text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e8f0fe] text-[#1a73e8] rounded-md text-xs font-semibold mb-3">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>No Exact Match</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#202124] mb-2">
                      No open 0–2 YoE roles match {filterState.searchQuery ? `"${filterState.searchQuery}"` : 'your active filters'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5f6368] max-w-lg mx-auto mb-5 leading-relaxed">
                      Try broadening your location, experience level, or keyword filters — or browse our latest open positions below.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={resetAllFilters}
                        className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Clear All Filters
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTabChange('tools')}
                        className="px-4 py-2 bg-white hover:bg-[#f8f9fa] text-[#3c4043] text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-[#dadce0] inline-flex items-center gap-1.5"
                      >
                        <FileSearch className="w-3.5 h-3.5 text-[#1a73e8]" />
                        <span>Check Resume ATS Match</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#1a73e8]" />
                        <h4 className="text-sm font-bold text-[#202124]">
                          Latest Early-Career Openings (0–2 YoE)
                        </h4>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {activeJobs.slice(0, 3).map((job) => (
                        <JobListItem
                          key={job.id}
                          job={job}
                          onSelect={handleSelectJob}
                          isSaved={savedJobIds.includes(job.id)}
                          onToggleSave={handleToggleSaveJob}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {viewMode === 'list' ? (
                    <div className="space-y-3">
                      {paginatedJobs.slice(0, 6).map((job) => (
                        <JobListItem
                          key={job.id}
                          job={job}
                          onSelect={handleSelectJob}
                          isSaved={savedJobIds.includes(job.id)}
                          onToggleSave={handleToggleSaveJob}
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
                          onSelect={handleSelectJob}
                          isSaved={savedJobIds.includes(job.id)}
                          onToggleSave={handleToggleSaveJob}
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
                            onSelect={handleSelectJob}
                            isSaved={savedJobIds.includes(job.id)}
                            onToggleSave={handleToggleSaveJob}
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
                              onSelect={handleSelectJob}
                              isSaved={savedJobIds.includes(job.id)}
                              onToggleSave={handleToggleSaveJob}
                            />
                          ))}
                        </div>
                      )}
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

        <Suspense
          fallback={
            <div className="max-w-4xl mx-auto py-24 px-4 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#1a73e8] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-[#5f6368]">Loading directory...</p>
            </div>
          }
        >
          {/* VIEW: DEDICATED SEPARATE JOBS LISTING & DIRECTORY PAGE (/jobs) */}
          {activeTab === 'jobs-directory' && (
            <JobDirectoryView
              jobs={jobs}
              onSelectJob={(job) => handleSelectJob(job, false)}
              adConfig={adConfig}
              savedJobIds={savedJobIds}
              onToggleSaveJob={handleToggleSaveJob}
              onNavigateTab={handleTabChange}
              onOpenArticle={handleOpenArticle}
              initialCategory={filterState.selectedCategory}
              initialHub={filterState.selectedHub}
              initialSearch={filterState.searchQuery}
            />
          )}

          {/* VIEW: FAANG & TECH UNICORN COMPANY HUBS */}
          {activeTab === 'companies' && (
            <CompanyHubsView
              jobs={jobs}
              onSelectJob={(job) => handleSelectJob(job, false)}
              onNavigateToArticle={(articleId) => handleOpenArticle(articleId)}
            />
          )}

          {/* VIEW 2: ORIGINAL SALARY BENCHMARKS & GUIDES */}
          {activeTab === 'salary-guide' && <SalaryGuideView />}

          {/* VIEW 3: CAREER INSIGHTS & ENGINEERING ARTICLES */}
          {activeTab === 'insights' && (
            <CareerInsightsView
              jobs={jobs}
              onSelectJob={(job) => handleSelectJob(job, false)}
            />
          )}

          {/* VIEW 4: INTERACTIVE DEVELOPER TOOLS & TC CALCULATOR */}
          {activeTab === 'tools' && <InteractiveToolsView />}

          {/* VIEW 5: PRODUCTION-READY PROJECT BLUEPRINTS */}
          {activeTab === 'blueprints' && (
            <ProjectBlueprintsView
              onNavigateJobs={(category) => {
                if (category) {
                  updateFilters({ selectedCategory: category });
                }
                handleTabChange('jobs');
              }}
            />
          )}

          {/* VIEW 6: ADSENSE POLICY & TRUST CENTER */}
          {activeTab === 'adsense-policy' && <AdSensePolicyView />}

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
        </Suspense>

        {/* VIEW 4: ADMIN PANEL - RESTRICTED TO OWNER ONLY */}
        {activeTab === 'admin' && (
          isAdminAuthenticated ? (
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-28 space-y-4">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-slate-500">Loading secure admin environment...</p>
                </div>
              }
            >
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
            </Suspense>
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Restricted Owner Portal</h2>
                <p className="text-xs text-slate-500 mt-1">
                  This console is restricted to the site owner (<code className="font-mono text-emerald-700">freshcommitsjobs@gmail.com</code>).
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
      </main>

          {/* Footer Leaderboard Ad */}
          {adConfig.enabled && adConfig.footerAd && activeTab === 'jobs' && (
            <div className="max-w-7xl mx-auto px-4 pb-4">
              <AdSlot type="leaderboard" config={adConfig} />
            </div>
          )}
        </>
      )}

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
                Verified Entry Level, New Graduate &amp; Junior Engineer Roles &bull; Direct ATS Career Routing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 flex-wrap text-xs">
            <a
              href="/companies"
              onClick={(e) => {
                e.preventDefault();
                handleTabChange('companies');
              }}
              className="text-[#1a73e8] font-bold hover:underline transition-colors"
            >
              FAANG Company Hubs
            </a>
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
              href="/project-blueprints"
              onClick={(e) => {
                e.preventDefault();
                handleTabChange('blueprints');
              }}
              className="text-[#1a73e8] font-medium hover:underline transition-colors"
            >
              Project Blueprints
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
            <span>&copy; {new Date().getFullYear()} FreshCommits (freshcommits.com). Strictly verified entry level, new graduate, and early career software engineering opportunities.</span>
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
              title="Site Owner Login (freshcommitsjobs@gmail.com)"
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
