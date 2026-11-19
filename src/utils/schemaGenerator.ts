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

const ISO_COUNTRY_ALIASES: Record<string, string> = {
  US: 'US',
  USA: 'US',
  'U.S.': 'US',
  'UNITED STATES': 'US',
  'UNITED STATES OF AMERICA': 'US',
  GB: 'GB',
  UK: 'GB',
  'UNITED KINGDOM': 'GB',
  CA: 'CA',
  CANADA: 'CA',
  IN: 'IN',
  INDIA: 'IN',
  DE: 'DE',
  GERMANY: 'DE',
  AU: 'AU',
  AUSTRALIA: 'AU',
  FR: 'FR',
  FRANCE: 'FR',
  IE: 'IE',
  IRELAND: 'IE',
  NL: 'NL',
  NETHERLANDS: 'NL',
  SG: 'SG',
  SINGAPORE: 'SG',
  NZ: 'NZ',
  'NEW ZEALAND': 'NZ',
};

function normalizeIsoCountry(raw?: string): string {
  const key = String(raw || '').trim().toUpperCase();
  return ISO_COUNTRY_ALIASES[key] || (COUNTRY_NAME_MAP[key] ? key : 'US');
}

function isVerifiedSchemaLogoUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://')) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('google.com/s2/favicons') ||
    lower.includes('ui-avatars.com') ||
    lower.includes('logo.clearbit.com')
  ) {
    return false;
  }
  return true;
}

/**
 * Generates official Google JobPosting JSON-LD structured data conforming
 * to Google Search Central guidelines (https://developers.google.com/search/docs/appearance/structured-data/job-posting)
 */
export function generateJobPostingSchema(job: JobPosting): Record<string, any> {
  const schemaTitle = normalizeJobTitleForGoogle(job.title || 'Software Engineer');

  const hiringOrg: Record<string, any> = {
    '@type': 'Organization',
    name: job.company,
    sameAs: job.companyWebsite || undefined,
  };
  if (isVerifiedSchemaLogoUrl(job.companyLogo)) {
    hiringOrg.logo = job.companyLogo;
  }

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
    hiringOrganization: hiringOrg,
  };

  // Emit exact monthsOfExperience only when unambiguous (0 for Internship/0 YoE, 12 for strict 1 YoE)
  if (job.maxYearsExperience === 0 || job.experienceLevel === 'Internship') {
    schema.experienceRequirements = {
      '@type': 'OccupationalExperienceRequirements',
      monthsOfExperience: 0,
    };
  } else if (job.maxYearsExperience === 1) {
    schema.experienceRequirements = {
      '@type': 'OccupationalExperienceRequirements',
      monthsOfExperience: 12,
    };
  }

  // Handle Remote / Telecommute vs Physical Location cleanly
  const countryCode = normalizeIsoCountry(job.applicantLocationRequirements || job.country || 'US');
  const countryName = COUNTRY_NAME_MAP[countryCode] || 'United States';

  // Emit baseSalary strictly matching displayed compensation (no silent rewriting)
  if (job.salaryDisclosed !== false && job.salary && typeof job.salary.min === 'number' && job.salary.min > 0) {
    const salaryCurrency = (job.salary.currency || 'USD').toUpperCase();
    const minSal = job.salary.min;
    const maxSal = job.salary.max && job.salary.max >= minSal ? job.salary.max : minSal;
    const unitText =
      job.salary.unit === 'HOUR' && minSal >= 1000
        ? 'YEAR'
        : job.salary.unit || 'YEAR';

    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: salaryCurrency,
      value: {
        '@type': 'QuantitativeValue',
        minValue: minSal,
        maxValue: maxSal,
        unitText,
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
    const rawLocParts = cleanLoc.split(',').map((s) => s.trim()).filter(Boolean);
    const badStateTokens = /^(?:us|usa|united states|united states of america|remote|global|worldwide)$/i;

    const rawCity = cleanCityString(String(job.city || rawLocParts[0] || ''));
    const candidateState = String(job.state || rawLocParts[1] || '')
      .replace(/\s*\/.*$/, '')
      .replace(/[^A-Za-z\s]/g, '')
      .trim();
    const cleanState = candidateState && !badStateTokens.test(candidateState) ? candidateState : undefined;
    const addressCountry = normalizeIsoCountry(job.country || countryCode);

    if (rawCity && !badStateTokens.test(rawCity)) {
      schema.jobLocation = {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: rawCity,
          addressRegion: cleanState,
          addressCountry,
          postalCode:
            job.postalCode && String(job.postalCode).trim()
              ? String(job.postalCode).trim()
              : undefined,
        },
      };
    }
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
