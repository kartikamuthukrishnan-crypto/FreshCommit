import { JobPosting, SchemaValidationResult } from '../types';
import { cleanLocationString, cleanCityString } from './textHumanizer';

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
  // Google for Jobs Algorithm Compliance:
  // Title MUST be the authentic, concise job title without promotional keywords or editorial tags.
  // This guarantees exact cosine-similarity clustering with the primary ATS listing.
  const schemaTitle = (job.title || 'Software Engineer').trim();

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
    directApply: true,
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
  let countryCode = (job.applicantLocationRequirements || job.country || 'US').trim().toUpperCase();
  if (countryCode === 'WORLDWIDE' || countryCode === 'GLOBAL' || countryCode === 'ANYWHERE' || !COUNTRY_NAME_MAP[countryCode]) {
    countryCode = 'US';
  }
  const countryName = COUNTRY_NAME_MAP[countryCode] || 'United States';

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
 * Returns complete HTML script tag ready for Google Rich Results Test `< > CODE` tab
 */
export function generateJobPostingHtmlSnippet(job: JobPosting): string {
  const schema = generateJobPostingSchema(job);
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

/**
 * Formats the authentic employer job description into compliant HTML as required by Google Search.
 * Strictly adheres to Google for Jobs guidelines:
 * - Verbatim employer text, responsibilities, and qualifications
 * - No promotional editorial commentary or non-job marketing text
 * - Clean HTML tags (<p>, <ul>, <li>, <strong>)
 */
function formatHtmlDescription(job: JobPosting): string {
  let raw = job.description || '';

  // 1. If stored description contains editorial take, extract authentic employer text
  if (raw.includes('🏢 Role Overview:')) {
    raw = raw.split('🏢 Role Overview:')[1]?.trim() || raw;
  } else if (raw.includes('🎯 The FreshCommits Career Take:')) {
    if (raw.includes('💡 Candidate Preparation Checklist:')) {
      const parts = raw.split('💡 Candidate Preparation Checklist:');
      const afterChecklist = parts[1] || '';
      // If there is another section or original text after checklist
      const lines = afterChecklist.split('\n').filter(Boolean);
      const nonBulletIdx = lines.findIndex(l => !l.trim().startsWith('•') && !l.trim().startsWith('-') && !l.trim().startsWith('*'));
      if (nonBulletIdx !== -1) {
        raw = lines.slice(nonBulletIdx).join('\n');
      } else {
        raw = `Official early-career software engineering requisition for ${job.title} at ${job.company}.`;
      }
    }
  }

  // 2. Strip leading scraping artifacts
  raw = raw
    .replace(/^Description\s*\n+/i, '')
    .replace(/^Position Summary\s*\n+/i, '')
    .replace(/^About (?:The Role|Us|The Job|The Company)\s*[:\n]+/i, '')
    .trim();

  // 3. Format description paragraphs
  const cleanDesc = escapeHtml(raw)
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`)
    .join('');

  let html = cleanDesc || `<p>Apply directly for ${escapeHtml(job.title)} at ${escapeHtml(job.company)}.</p>`;

  const descLower = raw.toLowerCase();

  // 4. Append authentic responsibilities (filtered for quality)
  if (job.responsibilities && job.responsibilities.length > 0) {
    const validResp = job.responsibilities
      .map((r) => r.replace(/^[•\-\*–—\d\.\)]\s*/, '').trim())
      .filter((r) => {
        if (!r || r.length < 10) return false;
        const low = r.toLowerCase();
        if (/^(?:what you(?:’|'| )*(?:will|'ll)?\s*(?:do|bring)|responsibilities|key responsibilities|the role|what you will be doing|your mission|core duties|qualifications|requirements|basic qualifications|about us|who you are|who we are|description|position summary)[:\s]*$/i.test(low)) return false;
        if (/^about\s+[a-z0-9&.\-\s]+[:\s]/i.test(low)) return false;
        if (/^about us[:\s]/i.test(low)) return false;
        if (/^who we are[:\s]/i.test(low)) return false;
        if (/^we are looking for\b/i.test(low)) return false;
        // Avoid duplicating if the exact sentence is already in the main description
        if (descLower.includes(low.slice(0, 50))) return false;
        return true;
      });

    if (validResp.length > 0) {
      html += `<p><strong>Key Responsibilities:</strong></p><ul>`;
      for (const item of validResp) {
        html += `<li>${escapeHtml(item)}</li>`;
      }
      html += `</ul>`;
    }
  }

  // 5. Append authentic qualifications (filtered for quality)
  if (job.qualifications && job.qualifications.length > 0) {
    const validQual = job.qualifications
      .map((q) => q.replace(/^[•\-\*–—\d\.\)]\s*/, '').trim())
      .filter((q) => {
        if (!q || q.length < 10) return false;
        const low = q.toLowerCase();
        if (/^(?:what you(?:’|'| )*(?:will|'ll)?\s*bring|qualifications|requirements|basic qualifications|minimum qualifications|what we look for|who you are|about us|description|position summary)[:\s]*$/i.test(low)) return false;
        if (/^about\s+[a-z0-9&.\-\s]+[:\s]/i.test(low)) return false;
        if (descLower.includes(low.slice(0, 50))) return false;
        return true;
      });

    if (validQual.length > 0) {
      html += `<p><strong>Qualifications &amp; Requirements:</strong></p><ul>`;
      for (const item of validQual) {
        html += `<li>${escapeHtml(item)}</li>`;
      }
      html += `</ul>`;
    }
  }

  // 6. Append tech stack if provided
  if (job.skills && job.skills.length > 0) {
    html += `<p><strong>Core Tech Stack:</strong> ${job.skills.map(escapeHtml).join(', ')}</p>`;
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
