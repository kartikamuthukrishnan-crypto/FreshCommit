import { JobPosting, SchemaValidationResult } from '../types';
import { cleanLocationString, cleanCityString } from './textHumanizer';
import {
  sanitizeJobTitle,
  sanitizeAtsHtml,
  formatPlainTextJobDescription,
} from './jobSanitizer';

/**
 * Standard country code to formal name mapping for Google Search Central JobPosting schema
 */
const COUNTRY_NAME_MAP: Record<string, string> = {
  US: 'United States',
  USA: 'United States',
  GB: 'United Kingdom',
  UK: 'United Kingdom',
  CA: 'Canada',
  IN: 'India',
  DE: 'Germany',
  AU: 'Australia',
  FR: 'France',
  IE: 'Ireland',
  NL: 'Netherlands',
  SG: 'Singapore',
  NZ: 'New Zealand',
};

/**
 * Normalizes job title to conform strictly to Google for Jobs guidelines:
 * - Strips UI/icon noise (e.g. star_rate, New)
 * - Strips promotional parentheticals like (Early Career), (New Grad), (Entry Level), [0-1 YoE], (Remote), (Urgent)
 * - Strips trailing location/remote noise like " – Remote" or " - Hybrid"
 * - Converts "(Junior) Software Engineer" to "Junior Software Engineer"
 * - Keeps the clean, canonical industry job title for 100% deduplication clustering
 */
export function normalizeJobTitleForGoogle(rawTitle: string): string {
  const sanitized = sanitizeJobTitle(rawTitle);
  if (!sanitized) return 'Software Engineer';
  const clean = sanitized
    .replace(/\s*[\(\[](?:early career|new grad(?:uate)?|entry[\s-]level|0-1 years?|0-2 years?|urgent(?:ly hiring)?|hiring now|remote|hybrid|on-site|onsite|austin|san francisco|nyc|new york)[\)\]]/gi, '')
    .replace(/\s*[\u2013\u2014-]\s*(?:Remote|Hybrid|On-site|Onsite|Austin|NYC)$/gi, '')
    .replace(/^\((?:junior|jr\.?)\)\s*/i, 'Junior ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return clean || sanitized;
}

/**
 * Generates official Google JobPosting JSON-LD structured data conforming
 * to Google Search Central guidelines (https://developers.google.com/search/docs/appearance/structured-data/job-posting)
 */
export function generateJobPostingSchema(job: JobPosting): Record<string, any> {
  const schemaTitle = normalizeJobTitleForGoogle(job.title || 'Software Engineer');

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: schemaTitle,
    description: formatHtmlDescription(job),
    identifier: {
      '@type': 'PropertyValue',
      name: job.company,
      value: job.id,
    },
    datePosted: job.datePosted,
    validThrough: job.validThrough,
    employmentType: job.employmentType,
    url: `https://www.freshcommits.com/job/${encodeURIComponent(job.id)}`,
    sameAs: job.applyUrl || undefined,
    directApply: false,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
      sameAs: job.companyWebsite || undefined,
      logo: job.companyLogo || undefined,
    },
    experienceRequirements: {
      '@type': 'OccupationalExperienceRequirements',
      monthsOfExperience: (job.maxYearsExperience === 0 ? 0 : (job.maxYearsExperience <= 2 ? 24 : job.maxYearsExperience * 12)),
    },
  };

  // Handle Remote / Telecommute vs Physical Location for Google
  let countryCode = (job.applicantLocationRequirements || job.country || 'US').trim().toUpperCase();
  const isIndianaLoc = (job.state === 'IN' || String(job.location || '').toLowerCase().includes('indiana') || String(job.location || '').toLowerCase().includes('indianapolis'));
  if (isIndianaLoc && (countryCode === 'IN' || !job.country || job.country === 'US')) {
    countryCode = 'US';
  }
  if (countryCode === 'WORLDWIDE' || countryCode === 'GLOBAL' || countryCode === 'ANYWHERE' || !COUNTRY_NAME_MAP[countryCode]) {
    countryCode = 'US';
  }
  const countryName = COUNTRY_NAME_MAP[countryCode] || 'United States';

  // Handle Base Salary (only when disclosed / positive min)
  if (job.salaryDisclosed !== false && job.salary && job.salary.min > 0) {
    let salaryCurrency = job.salary.currency || 'USD';
    let minSal = job.salary.min;
    let maxSal = job.salary.max || job.salary.min;

    if (countryCode === 'US' && (salaryCurrency === 'INR' || minSal >= 500000)) {
      salaryCurrency = 'USD';
      if (minSal >= 500000) {
        minSal = 75000;
        maxSal = 115000;
      }
    } else if (countryCode === 'IN' && salaryCurrency === 'USD' && minSal < 50000) {
      salaryCurrency = 'INR';
      minSal = 600000;
      maxSal = 1200000;
    }

    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: salaryCurrency,
      value: {
        '@type': 'QuantitativeValue',
        minValue: minSal,
        maxValue: maxSal,
        unitText: job.salary.unit || 'YEAR',
      },
    };
  }

  if (job.isRemote) {
    schema.jobLocationType = 'TELECOMMUTE';
    schema.applicantLocationRequirements = {
      '@type': 'Country',
      name: countryName,
    };
  } else {
    const cleanLoc = cleanLocationString(String(job.location || ''));
    const rawLocParts = cleanLoc.split(',');
    let rawCity = cleanCityString(String(job.city || rawLocParts[0]?.trim() || 'New York'));
    if (rawLocParts.length > 1 && rawLocParts[0].trim()) {
      rawCity = cleanCityString(rawLocParts[0].trim());
    }
    let rawState = (rawLocParts[1]?.trim() || job.state || 'NY').replace(/\s*\/.*$/, '').replace(/[^A-Za-z\s]/g, '').trim();
    if (!rawState) rawState = 'NY';

    schema.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: rawCity,
        addressRegion: rawState,
        addressCountry: countryCode === 'GB' ? 'GB' : (job.country || 'US'),
        postalCode: (job.postalCode && String(job.postalCode).trim())
          ? String(job.postalCode).trim()
          : (rawCity.toLowerCase().includes('san francisco') || rawState === 'CA' ? '94105' : undefined),
      },
    };
  }

  return schema;
}

/**
 * Generates combined JSON-LD @graph containing JobPosting + BreadcrumbList
 */
export function generateJobDetailGraphSchema(job: JobPosting): Record<string, any> {
  const jobSchema = generateJobPostingSchema(job);
  const { '@context': _ctx, ...jobNode } = jobSchema;
  const canonicalUrl = `https://www.freshcommits.com/job/${encodeURIComponent(job.id)}`;
  const cleanTitle = sanitizeJobTitle(job.title || 'Software Engineer');

  return {
    '@context': 'https://schema.org',
    '@graph': [
      jobNode,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'All Jobs',
            item: 'https://www.freshcommits.com/jobs',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: job.category || 'Engineering',
            item: 'https://www.freshcommits.com/jobs',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: cleanTitle,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };
}

/**
 * Returns complete HTML script tag ready for Google Rich Results Test `< > CODE` tab
 */
export function generateJobPostingHtmlSnippet(job: JobPosting): string {
  const schema = generateJobPostingSchema(job);
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

/**
 * Formats authentic employer job description into compliant HTML as required by Google Search.
 * Strictly uses sanitized employer HTML when available, or clean formatted paragraphs + lists.
 */
function formatHtmlDescription(job: JobPosting): string {
  if (job.descriptionHtml) {
    const cleanHtml = sanitizeAtsHtml(job.descriptionHtml);
    if (cleanHtml && cleanHtml.length > 60) {
      return cleanHtml;
    }
  }

  const formatted = formatPlainTextJobDescription(
    job.description || '',
    job.responsibilities || [],
    job.qualifications || []
  );

  if (formatted.html && formatted.html.length > 20) {
    return formatted.html;
  }

  const title = escapeHtml(sanitizeJobTitle(job.title || 'Software Engineer'));
  const company = escapeHtml(job.company || 'the employer');
  return `<p>Apply directly for ${title} at ${company}.</p>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates whether a JobPosting satisfies Google's required & recommended fields
 */
export function validateJobPostingSchema(job: JobPosting): SchemaValidationResult {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Required by Google for Jobs
  if (!job.title?.trim()) missingFields.push('title');
  if (!job.description?.trim()) missingFields.push('description');
  if (!job.datePosted) missingFields.push('datePosted');
  if (!job.company?.trim()) missingFields.push('hiringOrganization.name');

  // Location / Telecommute validation
  if (!job.isRemote && !job.location && !job.city) {
    missingFields.push('jobLocation (or jobLocationType: TELECOMMUTE for remote)');
  }
  if (job.isRemote && !job.applicantLocationRequirements) {
    warnings.push('applicantLocationRequirements is recommended for telecommute jobs (e.g. "US")');
  }

  // Recommended fields
  if (!job.validThrough) warnings.push('validThrough (expiration date) is strongly recommended');
  if (!job.salary || job.salary.min <= 0) {
    warnings.push('baseSalary enhances Google for Jobs visibility and click-through');
  }
  if (!job.companyLogo) {
    warnings.push('hiringOrganization.logo improves Google search card branding');
  }

  // Direct ATS Application URL validation
  if (!job.applyUrl?.trim()) {
    missingFields.push('applyUrl (direct ATS application link required for Google for Jobs)');
  } else {
    const urlLower = job.applyUrl.toLowerCase();
    if (
      urlLower.includes('/search') ||
      urlLower.endsWith('/careers') ||
      urlLower.endsWith('/jobs') ||
      urlLower.endsWith('/students') ||
      urlLower.includes('?q=') ||
      urlLower.includes('search?q=')
    ) {
      warnings.push(
        'applyUrl links to a generic search or career portal rather than a specific job requisition form. Direct ATS links (e.g. Greenhouse, Lever, Ashby, or Workday requisition ID) yield significantly higher conversion.'
      );
    }
  }

  const jsonLd = generateJobPostingSchema(job);

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings,
    jsonLd,
  };
}

/**
 * Injects or updates the JSON-LD script tag in the document head for the active job view
 */
export function injectJobJsonLd(schema: Record<string, any>): () => void {
  const scriptId = 'google-job-posting-schema';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;

  // Suppress any competing WebApplication / SoftwareApplication schemas so Googlebot & Rich Results Test evaluate ONLY this JobPosting
  const competingScripts: { el: HTMLScriptElement; origText: string }[] = [];
  try {
    const allLd = document.querySelectorAll('script[type="application/ld+json"]');
    allLd.forEach((s) => {
      if (s.id !== scriptId && (s.textContent?.includes('WebApplication') || s.textContent?.includes('SoftwareApplication'))) {
        competingScripts.push({ el: s as HTMLScriptElement, origText: s.textContent || '' });
        s.setAttribute('data-disabled-on-job', 'true');
        s.textContent = '';
      }
    });
  } catch (_) {}

  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(schema, null, 2);

  return () => {
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }
    // Restore competing scripts when navigating away from job details view
    competingScripts.forEach(({ el, origText }) => {
      el.removeAttribute('data-disabled-on-job');
      el.textContent = origText;
    });
  };
}
