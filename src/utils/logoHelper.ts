/**
 * Resilient company logo resolution helper
 * Eliminates hanging network requests and dead Clearbit URLs
 */

export function resolveCompanyLogo(company: string, logo?: string, website?: string): string {
  const comp = (company || '').trim();
  
  // 1. If a valid data URL (uploaded file) or valid non-clearbit image URL is provided, use it
  if (logo && !logo.includes('logo.clearbit.com')) {
    return logo;
  }

  // 2. Extract domain if available
  let domain = '';
  if (website) {
    try {
      const u = new URL(website.startsWith('http') ? website : `https://${website}`);
      domain = u.hostname.replace(/^www\./, '');
    } catch {
      // ignore
    }
  }

  // 3. If logo had a clearbit domain (e.g. https://logo.clearbit.com/mindex.com)
  if (!domain && logo && logo.includes('logo.clearbit.com/')) {
    const parts = logo.split('logo.clearbit.com/');
    if (parts[1]) {
      domain = parts[1].replace(/[^a-zA-Z0-9.-]/g, '');
    }
  }

  // 4. If we have a domain, use Google's ultra-reliable global favicon service (zero hang, 128px)
  if (domain && domain.includes('.')) {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  }

  // 5. Clean, instant vector avatar using UI-Avatars (no external hanging dependency)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(comp || 'FC')}&background=0F172A&color=fff&size=128&bold=true`;
}
