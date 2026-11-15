import { hydrateJobDescriptionFromAts } from '../../src/utils/atsFetcher';
import {
  sanitizeJobTitle,
  sanitizeAtsHtml,
  formatPlainTextJobDescription,
  htmlToReadableText,
  formatDisclosedSalary,
  resolveWorkMode,
} from '../../src/utils/jobSanitizer';

const BOT_UA_REGEX =
  /(?:googlebot|adsbot-google|mediapartners-google|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot|applebot|pinterest|perplexitybot|gptbot|oai-searchbot|claudebot|anthropic-ai|ccbot|screaming frog)/i;

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
  NG: 'Nigeria',
};

function parseFirestoreVal(v: any): any {
  if (!v) return undefined;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return parseInt(v.integerValue, 10);
  if ('doubleValue' in v) return parseFloat(v.doubleValue);
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(parseFirestoreVal);
  if ('mapValue' in v) {
    const obj: Record<string, any> = {};
    for (const k in v.mapValue.fields || {}) obj[k] = parseFirestoreVal(v.mapValue.fields[k]);
    return obj;
  }
  return undefined;
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeTitleForSchema(rawTitle: string): string {
  const cleaned = sanitizeJobTitle(rawTitle)
    .replace(/\s*[\(\[](?:early career|new grad(?:uate)?|entry[\s-]level|0-1 years?|0-2 years?|urgent(?:ly hiring)?|hiring now|remote|hybrid|on-site|onsite)[\)\]]/gi, '')
    .replace(/\s*[\u2013\u2014-]\s*(?:Remote|Hybrid|On-site|Onsite)$/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned || rawTitle || 'Software Engineer';
}

function isJobExpiredOrInvalid(job: Record<string, any>): boolean {
  if (!job || !job.title || !job.company) return true;
  if (job.status && job.status !== 'ACTIVE') return true;
  if (job.validThrough) {
    const vt = new Date(job.validThrough);
    if (!isNaN(vt.getTime())) {
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);
      if (vt < todayMidnight) return true;
    }
  }
  return false;
}

async function lookupJobRecord(requestUrl: string, jobId: string, env: any): Promise<Record<string, any> | null> {
  // 1. Check /data/jobs.json bundled static asset first (ultra-low latency)
  try {
    if (env?.ASSETS) {
      const assetRes = await env.ASSETS.fetch(new Request(new URL('/data/jobs.json', requestUrl)));
      if (assetRes.ok) {
        const list = await assetRes.json();
        if (Array.isArray(list)) {
          const found = list.find((j: any) => j?.id?.toLowerCase() === jobId.toLowerCase());
          if (found) return found;
        }
      }
    }
  } catch {
    // Continue to Firestore REST fallback
  }

  // 2. Fallback to Firestore REST API
  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/centered-module-9smzh/databases/ai-studio-juniordevhubentr-9fce9c23-e540-412e-ae3f-aca1eaf015f5/documents/jobs/${encodeURIComponent(
      jobId
    )}`;
    const jobRes = await fetch(firestoreUrl);
    if (jobRes.ok) {
      const doc: any = await jobRes.json();
      if (doc?.fields) {
        const job: Record<string, any> = {};
        for (const f in doc.fields) job[f] = parseFirestoreVal(doc.fields[f]);
        job.id = job.id || jobId;
        return job;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

function buildBotHtmlPage(params: {
  canonicalUrl: string;
  titleText: string;
  metaDesc: string;
  job: Record<string, any>;
  descriptionHtml: string;
  schemaGraphJson: string;
}): string {
  const { canonicalUrl, titleText, metaDesc, job, descriptionHtml, schemaGraphJson } = params;
  const cleanTitle = sanitizeJobTitle(job.title);
  const salaryLabel = formatDisclosedSalary(job.salary, job.salaryDisclosed);
  const workMode = resolveWorkMode(job as any);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="google-adsense-account" content="ca-pub-5760843724020240" />
  <title>${escapeHtml(titleText)}</title>
  <meta name="description" content="${escapeHtml(metaDesc)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="FreshCommits" />
  <meta property="og:title" content="${escapeHtml(titleText)}" />
  <meta property="og:description" content="${escapeHtml(metaDesc)}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:image" content="https://www.freshcommits.com/og-image.svg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(titleText)}" />
  <meta name="twitter:description" content="${escapeHtml(metaDesc)}" />
  <script type="application/ld+json">
${schemaGraphJson}
  </script>
</head>
<body>
  <header>
    <nav aria-label="Breadcrumb">
      <a href="https://www.freshcommits.com/">Home</a> &gt;
      <a href="https://www.freshcommits.com/jobs">All Jobs</a> &gt;
      <span>${escapeHtml(job.category || 'Software Engineering')}</span> &gt;
      <span>${escapeHtml(cleanTitle)}</span>
    </nav>
  </header>
  <main>
    <article>
      <h1>${escapeHtml(cleanTitle)} at ${escapeHtml(job.company)}</h1>
      <p>
        <strong>Company:</strong> ${escapeHtml(job.company)} |
        <strong>Location:</strong> ${escapeHtml(job.location || 'United States')} (${escapeHtml(workMode)}) |
        <strong>Experience:</strong> ${escapeHtml(job.experienceLevel || 'Entry Level')} |
        <strong>Posted:</strong> ${escapeHtml(job.datePosted || '')}
        ${salaryLabel ? `| <strong>Compensation:</strong> ${escapeHtml(salaryLabel)}` : ''}
      </p>
      <p>
        <a href="${escapeHtml(job.applyUrl || canonicalUrl)}" rel="noopener noreferrer">Apply - ${escapeHtml(job.company)}</a>
      </p>
      <section>
        <h2>Job Description</h2>
        ${descriptionHtml}
      </section>
    </article>
  </main>
  <footer>
    <p>&copy; ${new Date().getFullYear()} FreshCommits.com — Entry-Level &amp; New Grad Tech Careers</p>
  </footer>
</body>
</html>`;
}

export const onRequest: any = async (context: any) => {
  const { request, params, env, next } = context;

  let jobId = decodeURIComponent(String(params?.id || '')).trim().split(/[\s%]+/)[0];
  const idMatch = jobId.match(/(manual-\d+|job-[a-z0-9-]+|ext-[a-z0-9-]+|sync-[a-z0-9-]+|sr-[a-z0-9-]+)/i);
  if (idMatch) jobId = idMatch[1];

  const userAgent = request.headers.get('user-agent') || '';
  const isBot = BOT_UA_REGEX.test(userAgent);

  // Normal browser requests: pass directly through to SPA assets
  if (!isBot) {
    if (env?.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return next();
  }

  // Search/Social Crawler: serve clean semantic HTML + JobPosting + BreadcrumbList JSON-LD (or 410 Gone)
  const job = await lookupJobRecord(request.url, jobId, env);
  const canonicalUrl = `https://www.freshcommits.com/job/${encodeURIComponent(job?.id || jobId)}`;

  if (!job || isJobExpiredOrInvalid(job)) {
    const goneTitle = job?.title
      ? `${sanitizeJobTitle(job.title)} at ${job.company} (Closed) | FreshCommits`
      : 'Position Closed or Removed | FreshCommits';
    const goneHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(goneTitle)}</title>
  <meta name="robots" content="noindex, nofollow" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
</head>
<body>
  <main>
    <h1>This position is no longer accepting applications</h1>
    <p>This early-career requisition has closed or been removed by the employer.</p>
    <p><a href="https://www.freshcommits.com/jobs">Browse active entry-level &amp; new grad tech jobs on FreshCommits</a></p>
  </main>
</body>
</html>`;

    return new Response(goneHtml, {
      status: 410,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }

  // Hydrate 1:1 authentic ATS description if stored description is short or lacks sanitized HTML
  let descriptionHtml = job.descriptionHtml ? sanitizeAtsHtml(job.descriptionHtml) : '';
  const storedTextLen = (job.description || '').trim().length;

  if ((!descriptionHtml || storedTextLen < 250) && job.applyUrl) {
    const hydrated = await hydrateJobDescriptionFromAts(
      job.applyUrl,
      { company: job.company, title: job.title, location: job.location },
      3200
    );
    if (hydrated && hydrated.descriptionHtml) {
      descriptionHtml = hydrated.descriptionHtml;
    }
  }

  if (!descriptionHtml) {
    const formatted = formatPlainTextJobDescription(
      job.description || `Apply directly for ${job.title} at ${job.company}.`,
      job.responsibilities || [],
      job.qualifications || []
    );
    descriptionHtml = formatted.html;
  }

  // Normalize country & location
  let countryCode = String(job.applicantLocationRequirements || job.country || 'US').trim().toUpperCase();
  if (countryCode === 'USA' || countryCode === 'UNITED STATES OF AMERICA') countryCode = 'US';
  if (countryCode === 'UK') countryCode = 'GB';
  const isIndiana =
    job.state === 'IN' ||
    String(job.location || '').toLowerCase().includes('indiana') ||
    String(job.location || '').toLowerCase().includes('indianapolis');
  if (isIndiana && (countryCode === 'IN' || !job.country || countryCode === 'US')) {
    countryCode = 'US';
  }
  if (!COUNTRY_NAME_MAP[countryCode]) {
    countryCode = 'US';
  }
  const countryName = COUNTRY_NAME_MAP[countryCode] || 'United States';

  // Dates
  let safeDatePosted = job.datePosted || new Date().toISOString().split('T')[0];
  const postDate = new Date(safeDatePosted);
  if (isNaN(postDate.getTime()) || postDate > new Date()) {
    safeDatePosted = new Date().toISOString().split('T')[0];
  }

  let safeValidThrough = job.validThrough || '';
  const validDate = new Date(safeValidThrough);
  if (!safeValidThrough || isNaN(validDate.getTime())) {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    safeValidThrough = d.toISOString().split('T')[0];
  }

  const jobPostingSchema: Record<string, any> = {
    '@type': 'JobPosting',
    title: normalizeTitleForSchema(job.title),
    description: descriptionHtml,
    identifier: {
      '@type': 'PropertyValue',
      name: job.company,
      value: job.id || jobId,
    },
    datePosted: safeDatePosted,
    validThrough: safeValidThrough,
    employmentType: job.employmentType || 'FULL_TIME',
    url: canonicalUrl,
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
      monthsOfExperience: job.maxYearsExperience === 0 ? 0 : Math.min((job.maxYearsExperience || 1) * 12, 24),
    },
  };

  if (job.salary && typeof job.salary.min === 'number' && job.salary.min > 0) {
    let salaryCurrency = job.salary.currency || 'USD';
    let minSal = job.salary.min;
    let maxSal = job.salary.max && job.salary.max >= minSal ? job.salary.max : minSal;
    if (countryCode === 'US' && (salaryCurrency === 'INR' || minSal >= 500000)) {
      salaryCurrency = 'USD';
      if (minSal >= 500000) {
        minSal = 75000;
        maxSal = 115000;
      }
    }
    const unitText = job.salary.unit === 'HOUR' || (minSal < 500 && maxSal < 500) ? 'HOUR' : job.salary.unit || 'YEAR';
    jobPostingSchema.baseSalary = {
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
    jobPostingSchema.jobLocationType = 'TELECOMMUTE';
    jobPostingSchema.applicantLocationRequirements = {
      '@type': 'Country',
      name: countryName,
    };
  } else {
    const cleanLoc = String(job.location || '').trim();
    const parts = cleanLoc.split(',');
    const city = String(job.city || parts[0] || 'New York').trim();
    const state = String(job.state || parts[1] || 'NY')
      .replace(/\s*\/.*$/, '')
      .replace(/[^A-Za-z\s]/g, '')
      .trim() || 'NY';
    jobPostingSchema.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: city,
        addressRegion: state,
        addressCountry: countryCode,
        postalCode: job.postalCode || undefined,
      },
    };
  }

  const cleanTitle = sanitizeJobTitle(job.title);
  const breadcrumbSchema = {
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
  };

  const schemaGraphJson = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@graph': [jobPostingSchema, breadcrumbSchema],
    },
    null,
    2
  );

  const plainSnippet = htmlToReadableText(descriptionHtml).slice(0, 155).replace(/\s+/g, ' ').trim();
  const titleText = `${cleanTitle} at ${job.company} | FreshCommits`;
  const metaDesc = `${cleanTitle} at ${job.company} (${job.location || 'Remote'}). ${plainSnippet}`;

  const botHtml = buildBotHtmlPage({
    canonicalUrl,
    titleText,
    metaDesc,
    job,
    descriptionHtml,
    schemaGraphJson,
  });

  return new Response(botHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    },
  });
};
