import { JobPosting, SchemaValidationResult } from '../types';

/**
 * Generates official Google JobPosting JSON-LD structured data conforming
 * to Google Search Central guidelines (https://developers.google.com/search/docs/appearance/structured-data/job-posting)
 */
export function generateJobPostingSchema(job: JobPosting): Record<string, any> {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org/',
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
  if (job.isRemote) {
    schema.jobLocationType = 'TELECOMMUTE';
    schema.applicantLocationRequirements = {
      '@type': 'Country',
      name: job.applicantLocationRequirements || 'US',
    };
    // Include location if hybrid/remote from specific city
    if (job.city || job.state) {
      schema.jobLocation = {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.city || undefined,
          addressRegion: job.state || undefined,
          addressCountry: job.country || 'US',
        },
      };
    }
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
 * Formats a job description into compliant HTML as required by Google Search
 */
function formatHtmlDescription(job: JobPosting): string {
  let html = `<p>${escapeHtml(job.description)}</p>`;

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
