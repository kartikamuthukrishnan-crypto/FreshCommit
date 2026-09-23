// Google Analytics 4 (GA4) helper for FreshCommits

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const DEFAULT_GA_MEASUREMENT_ID = 'G-YQMXK76Q2H';

let isInitialized = false;

export function initGA(measurementId?: string) {
  const id =
    measurementId ||
    (typeof window !== 'undefined' ? localStorage.getItem('freshcommits_ga_id') : '') ||
    (import.meta.env.VITE_GA_MEASUREMENT_ID as string) ||
    DEFAULT_GA_MEASUREMENT_ID;

  if (!id || id === 'G-XXXXXXXXXX' || typeof window === 'undefined') {
    return;
  }

  // If already initialized with this ID, do nothing
  if (isInitialized && (window as any).__GA_ID__ === id) {
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

  (window as any).__GA_ID__ = id;
  isInitialized = true;
}

export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

export function trackPageView(pagePath: string, pageTitle?: string) {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
  });
}

export function trackJobView(job: { id: string; title: string; company: string }) {
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
  trackEvent('apply_click', {
    job_id: job.id,
    job_title: job.title,
    company: job.company,
    outbound_url: job.applyUrl,
  });
}

export function trackSearch(query: string, resultCount: number) {
  trackEvent('search', {
    search_term: query,
    result_count: resultCount,
  });
}
