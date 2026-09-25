// Google Analytics 4 (GA4) helper for FreshCommits
// Includes comprehensive Admin exclusion to ensure owner visits, tests, and admin portal activity never pollute Google Analytics reports

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    __GA_ID__?: string;
    __GA_EXCLUDED_ADMIN__?: boolean;
    [key: string]: any;
  }
}

export const DEFAULT_GA_MEASUREMENT_ID = 'G-YQMXK76Q2H';
export const STORAGE_KEY_EXCLUDE_ANALYTICS = 'freshcommits_exclude_analytics';
export const STORAGE_KEY_ADMIN_AUTH = 'freshcommit_admin_auth';

let isInitialized = false;

/**
 * Checks whether the current user is an admin or browsing admin views,
 * in which case Google Analytics tracking should be strictly disabled.
 */
export function shouldExcludeAnalytics(): boolean {
  if (typeof window === 'undefined') return true;

  try {
    // 1. Explicit window runtime flag
    if (window.__GA_EXCLUDED_ADMIN__) return true;

    // 2. Check URL query parameters and hashes for admin route
    const search = (window.location.search || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();

    if (
      search.includes('view=admin') ||
      search.includes('admin=true') ||
      search.includes('admin=1') ||
      hash.includes('admin')
    ) {
      return true;
    }

    // 3. Check persistent admin authentication or exclusion toggle in storage
    const isAdminAuth =
      localStorage.getItem(STORAGE_KEY_ADMIN_AUTH) === 'true' ||
      sessionStorage.getItem(STORAGE_KEY_ADMIN_AUTH) === 'true';

    const isExcludedInStorage =
      localStorage.getItem(STORAGE_KEY_EXCLUDE_ANALYTICS) === 'true' ||
      sessionStorage.getItem(STORAGE_KEY_EXCLUDE_ANALYTICS) === 'true';

    if (isAdminAuth || isExcludedInStorage) {
      return true;
    }
  } catch {
    // If reading storage fails, default to safe behavior
  }

  return false;
}

/**
 * Deactivates Google Analytics 4 tracking for the current browser session
 * by registering the official ga-disable flag and saving exclusion state.
 */
export function disableAnalyticsForAdmin(measurementId?: string) {
  if (typeof window === 'undefined') return;

  const id =
    measurementId ||
    localStorage.getItem('freshcommits_ga_id') ||
    DEFAULT_GA_MEASUREMENT_ID;

  window[`ga-disable-${id}`] = true;
  window.__GA_EXCLUDED_ADMIN__ = true;

  try {
    localStorage.setItem(STORAGE_KEY_EXCLUDE_ANALYTICS, 'true');
  } catch {
    // ignore
  }
}

/**
 * Re-enables Google Analytics tracking (e.g. if the user explicitly tests tracking).
 */
export function enableAnalyticsForAdmin(measurementId?: string) {
  if (typeof window === 'undefined') return;

  const id =
    measurementId ||
    localStorage.getItem('freshcommits_ga_id') ||
    DEFAULT_GA_MEASUREMENT_ID;

  delete window[`ga-disable-${id}`];
  window.__GA_EXCLUDED_ADMIN__ = false;

  try {
    localStorage.removeItem(STORAGE_KEY_EXCLUDE_ANALYTICS);
  } catch {
    // ignore
  }
}

/**
 * Returns true if admin traffic exclusion is currently active.
 */
export function isAnalyticsExcludedForAdmin(): boolean {
  return shouldExcludeAnalytics();
}

/**
 * Initializes GA4 unless the user is an admin or on an admin route.
 */
export function initGA(measurementId?: string) {
  const id =
    measurementId ||
    (typeof window !== 'undefined' ? localStorage.getItem('freshcommits_ga_id') : '') ||
    DEFAULT_GA_MEASUREMENT_ID;

  if (!id || id === 'G-XXXXXXXXXX' || typeof window === 'undefined') {
    return;
  }

  // Strictly exclude admin traffic
  if (shouldExcludeAnalytics()) {
    disableAnalyticsForAdmin(id);
    return;
  }

  // If already initialized with this ID, do nothing
  if (isInitialized && window.__GA_ID__ === id) {
    return;
  }

  // Load Google tag script dynamically
  const scriptId = 'google-analytics-script';
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, {
    send_page_view: true,
    anonymize_ip: true,
  });

  window.__GA_ID__ = id;
  isInitialized = true;
}

export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  // Never fire events for admin users or admin routes
  if (shouldExcludeAnalytics()) {
    return;
  }

  // Drop any events explicitly associated with admin views
  if (params.page_path && typeof params.page_path === 'string' && params.page_path.includes('admin')) {
    return;
  }

  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

export function trackPageView(pagePath: string, pageTitle?: string) {
  // Never track admin pages
  if (pagePath.includes('admin') || shouldExcludeAnalytics()) {
    return;
  }

  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
  });
}

export function trackJobView(job: { id: string; title: string; company: string }) {
  if (shouldExcludeAnalytics()) return;

  trackEvent('select_item', {
    item_list_name: 'Job Listings',
    items: [
      {
        item_id: job.id,
        item_name: job.title,
        item_brand: job.company,
      },
    ],
  });
}

export function trackApplyClick(job: { id: string; title: string; company: string; applyUrl: string }) {
  if (shouldExcludeAnalytics()) return;

  trackEvent('apply_click', {
    job_id: job.id,
    job_title: job.title,
    company: job.company,
    outbound_url: job.applyUrl,
  });
}

export function trackSearch(query: string, resultCount: number) {
  if (shouldExcludeAnalytics()) return;

  trackEvent('search', {
    search_term: query,
    result_count: resultCount,
  });
}
