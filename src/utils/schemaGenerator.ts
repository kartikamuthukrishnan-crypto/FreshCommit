import { JobPosting, SchemaValidationResult } from '../types';

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
 * Generates official Google JobPosting JSON-LD structured data conforming
 * to Google Search Central guidelines (https://developers.google.com/search/docs/appearance/structured-data/job-posting)
 */
export function generateJobPostingSchema(job: JobPosting): Record<string, any> {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: formatHtmlDescription(job),
    identifier: {
      '@type': 'PropertyValue',
      name: job.company,
      value: job.id,
    },
    datePosted: job.datePosted,
    validThrough: job.validThrough,
    employmentType: job.employmentType,
    url: job.applyUrl || undefined,
    directApply: true,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
      sameAs: job.companyWebsite || undefined,
      logo: job.companyLogo || undefined,
    },
    experienceRequirements: {
      '@type': 'OccupationalExperienceRequirements',
      monthsOfExperience: job.maxYearsExperience * 12,
    },
  };

  // Handle Base Salary
  if (job.salary && job.salary.min > 0) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: job.salary.currency || 'USD',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salary.min,
        maxValue: job.salary.max || job.salary.min,
        unitText: job.salary.unit || 'YEAR',
      },
    };
  }

  // Handle Remote / Telecommute vs Physical Location for Google
  const countryCode = (job.applicantLocationRequirements || job.country || 'US').trim().toUpperCase();
  const countryName = COUNTRY_NAME_MAP[countryCode] || countryCode;

  if (job.isRemote) {
    schema.jobLocationType = 'TELECOMMUTE';
    schema.applicantLocationRequirements = {
      '@type': 'Country',
      name: countryName,
    };

    // Provide physical jobLocation fallback for hybrid & geographic search indexing
    const locality = job.city || (job.location && !job.location.toLowerCase().includes('remote') ? job.location.split(',')[0]?.trim() : undefined) || (countryCode === 'GB' ? 'Belfast' : 'San Francisco');
    const region = job.state || (job.location && !job.location.toLowerCase().includes('remote') ? job.location.split(',')[1]?.trim() : undefined) || (countryCode === 'GB' ? 'Northern Ireland' : 'CA');

    schema.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: locality,
        addressRegion: region,
        addressCountry: countryCode === 'GB' ? 'GB' : (job.country || 'US'),
        postalCode: job.postalCode || undefined,
      },
    };
  } else {
    schema.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.city || job.location.split(',')[0]?.trim() || 'San Francisco',
        addressRegion: job.state || job.location.split(',')[1]?.trim() || 'CA',
        addressCountry: job.country || 'US',
        postalCode: job.postalCode || undefined,
      },
    };
  }

  return schema;
}

/**
 * Returns complete HTML script tag ready for Google Rich Results Test `< > CODE` tab
 */
export function generateJobPostingHtmlSnippet(job: JobPosting): string {
  const schema = generateJobPostingSchema(job);
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

/**
 * Formats a job description into compliant HTML as required by Google Search
 */
function formatHtmlDescription(job: JobPosting): string {
  const cleanDesc = escapeHtml(job.description || '')
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`)
    .join('');

  let html = cleanDesc || `<p>Apply directly for ${escapeHtml(job.title)} at ${escapeHtml(job.company)}.</p>`;

  if (job.responsibilities && job.responsibilities.length > 0) {
    html += `<p><strong>Key Responsibilities:</strong></p><ul>`;
    for (const item of job.responsibilities) {
      html += `<li>${escapeHtml(item)}</li>`;
    }
    html += `</ul>`;
  }

  if (job.qualifications && job.qualifications.length > 0) {
    html += `<p><strong>Qualifications (Entry-Level / Fresh Grad):</strong></p><ul>`;
    for (const item of job.qualifications) {
      html += `<li>${escapeHtml(item)}</li>`;
    }
    html += `</ul>`;
  }

  if (job.skills && job.skills.length > 0) {
    html += `<p><strong>Required Tech Stack:</strong> ${job.skills.map(escapeHtml).join(', ')}</p>`;
  }

  return html;
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
  };
}
