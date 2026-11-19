import { hydrateJobDescriptionFromAts } from '../../src/utils/atsFetcher';
import {
  sanitizeJobTitle,
  sanitizeAtsHtml,
  formatPlainTextJobDescription,
  htmlToReadableText,
  formatDisclosedSalary,
  resolveWorkMode,
} from '../../src/utils/jobSanitizer';

const COUNTRY_ALIAS_MAP: Record<string, string> = {
  US: 'US',
  USA: 'US',
  'U.S.': 'US',
  'U.S.A.': 'US',
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

const COUNTRY_NAME_MAP: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
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

const BAD_LOCATION_TOKENS = /^(?:us|usa|u\.s\.|united states|united states of america|remote|global|worldwide)$/i;

function normalizeIsoCountry(raw?: string): string {
  const key = String(raw || '').trim().toUpperCase();
  return COUNTRY_ALIAS_MAP[key] || (COUNTRY_NAME_MAP[key] ? key : 'US');
}

function isVerifiedSchemaLogoUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://')) return false;
  const lower = trimmed.toLowerCase();
  return (
    !lower.includes('google.com/s2/favicons') &&
    !lower.includes('ui-avatars.com') &&
    !lower.includes('logo.clearbit.com')
  );
}

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

function safeJsonForScript(obj: unknown): string {
  return JSON.stringify(obj, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

function normalizeTitleForSchema(rawTitle: string): string {
  const cleaned = sanitizeJobTitle(rawTitle)
    .replace(
      /\s*[\(\[](?:early career|new grad(?:uate)?|entry[\s-]level|0-1 years?|0-2 years?|urgent(?:ly hiring)?|hiring now|remote|hybrid|on-site|onsite)[\)\]]/gi,
      ''
    )
    .replace(/\s*[\u2013\u2014-]\s*(?:Remote|Hybrid|On-site|Onsite)$/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned || rawTitle || 'Software Engineer';
}

function isJobExpiredOrInvalid(job: Record<string, any>): boolean {
  if (!job || !job.title || !job.company) return true;
  if (job.status && job.status !== 'ACTIVE') return true;
  if (job.validThrough) {
    const todayIso = new Date().toISOString().split('T')[0];
    const vtStr = String(job.validThrough).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(vtStr)) {
      if (vtStr < todayIso) return true;
    } else {
      const vt = new Date(vtStr);
      if (!isNaN(vt.getTime())) {
        const todayMidnight = new Date();
        todayMidnight.setUTCHours(0, 0, 0, 0);
        if (vt < todayMidnight) return true;
      }
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

function buildSsrBodyMarkup(params: {
  canonicalUrl: string;
  job: Record<string, any>;
  descriptionHtml: string;
}): string {
  const { canonicalUrl, job, descriptionHtml } = params;
  const cleanTitle = sanitizeJobTitle(job.title);
  const salaryLabel = formatDisclosedSalary(job.salary, job.salaryDisclosed);
  const workMode = resolveWorkMode(job as any);

  return `<div id="root"><article id="crawled-job-view" style="max-width:960px;margin:0 auto;padding:32px 20px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#202124;background:#ffffff;"><nav aria-label="Breadcrumb" style="font-size:13px;color:#5f6368;margin-bottom:16px;"><a href="https://www.freshcommits.com/" style="color:#1a73e8;text-decoration:none;">Home</a> &gt; <a href="https://www.freshcommits.com/jobs" style="color:#1a73e8;text-decoration:none;">All Jobs</a> &gt; <span>${escapeHtml(job.category || 'Software Engineering')}</span> &gt; <span>${escapeHtml(cleanTitle)}</span></nav><header style="border-bottom:1px solid #dadce0;padding-bottom:20px;margin-bottom:24px;"><p style="font-size:15px;font-weight:700;color:#1a73e8;margin:0 0 6px 0;">${escapeHtml(job.company)}</p><h1 style="font-size:28px;font-weight:800;margin:0 0 12px 0;line-height:1.25;">${escapeHtml(cleanTitle)} at ${escapeHtml(job.company)}</h1><p style="font-size:14px;color:#5f6368;margin:0 0 16px 0;"><strong>Location:</strong> ${escapeHtml(job.location || 'United States')} (${escapeHtml(workMode)}) &middot; <strong>Experience:</strong> ${escapeHtml(job.experienceLevel || 'Entry Level')} &middot; <strong>Posted:</strong> ${escapeHtml(job.datePosted || '')}${salaryLabel ? ` &middot; <strong>Compensation:</strong> ${escapeHtml(salaryLabel)}` : ''}</p><a href="${escapeHtml(job.applyUrl || canonicalUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#1a73e8;color:#ffffff;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">Apply - ${escapeHtml(job.company)}</a></header><section aria-label="Job Description" style="line-height:1.65;font-size:15px;color:#3c4043;"><h2 style="font-size:18px;font-weight:700;color:#202124;margin:0 0 12px 0;">Job Description</h2>${descriptionHtml}</section></article></div>`;
}

function buildStandaloneFallbackHtml(params: {
  canonicalUrl: string;
  titleText: string;
  metaDesc: string;
  schemaGraphJson: string;
  ssrRootHtml: string;
}): string {
  const { canonicalUrl, titleText, metaDesc, schemaGraphJson, ssrRootHtml } = params;
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
  <meta name="twitter:image" content="https://www.freshcommits.com/og-image.svg" />
  <script id="google-job-posting-schema" type="application/ld+json">
${schemaGraphJson}
  </script>
</head>
<body style="background:#F0F8FF;margin:0;">
  ${ssrRootHtml}
</body>
</html>`;
}

export const onRequest: any = async (context: any) => {
  const { request, params, env } = context;

  let jobId = decodeURIComponent(String(params?.id || '')).trim().split(/[\s%]+/)[0];
  const idMatch = jobId.match(/(manual-\d+|job-[a-z0-9_-]+|ext-[a-z0-9_-]+|sync-[a-z0-9_-]+|sr-[a-z0-9_-]+)/i);
  if (idMatch) jobId = idMatch[1];

  // Unified lookup for BOTH Googlebot and human visitors (Zero Dynamic Rendering divergence)
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(goneTitle)}</title>
  <meta name="robots" content="noindex, nofollow" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
</head>
<body style="background:#F0F8FF;font-family:system-ui,-apple-system,sans-serif;color:#202124;padding:48px 20px;">
  <main style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dadce0;border-radius:16px;padding:32px;">
    <h1 style="font-size:24px;margin:0 0 12px 0;">This position is no longer accepting applications</h1>
    <p style="font-size:15px;color:#5f6368;line-height:1.6;margin:0 0 24px 0;">This early-career requisition has closed or been removed by the employer.</p>
    <p style="margin:0;"><a href="https://www.freshcommits.com/jobs" style="display:inline-block;background:#1a73e8;color:#ffffff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Browse Active Entry-Level Jobs &rarr;</a></p>
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

  // Normalize country cleanly to ISO 3166-1 alpha-2
  const countryCode = normalizeIsoCountry(job.applicantLocationRequirements || job.country || 'US');
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

  const hiringOrg: Record<string, any> = {
    '@type': 'Organization',
    name: job.company,
    sameAs: job.companyWebsite || undefined,
  };
  if (isVerifiedSchemaLogoUrl(job.companyLogo)) {
    hiringOrg.logo = job.companyLogo;
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
    hiringOrganization: hiringOrg,
  };

  // Accurate experienceRequirements (never force 24 months onto 0-2 YoE entry-level ranges)
  if (job.maxYearsExperience === 0 || job.experienceLevel === 'Internship') {
    jobPostingSchema.experienceRequirements = {
      '@type': 'OccupationalExperienceRequirements',
      monthsOfExperience: 0,
    };
  } else if (job.maxYearsExperience === 1) {
    jobPostingSchema.experienceRequirements = {
      '@type': 'OccupationalExperienceRequirements',
      monthsOfExperience: 12,
    };
  }

  // Emit baseSalary strictly matching displayed compensation (no silent rewriting)
  if (job.salaryDisclosed !== false && job.salary && typeof job.salary.min === 'number' && job.salary.min > 0) {
    const salaryCurrency = String(job.salary.currency || 'USD').toUpperCase();
    const minSal = job.salary.min;
    const maxSal = job.salary.max && job.salary.max >= minSal ? job.salary.max : minSal;
    const unitText =
      job.salary.unit === 'HOUR' && minSal >= 1000
        ? 'YEAR'
        : job.salary.unit || 'YEAR';

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
    const parts = cleanLoc.split(',').map((s) => s.trim()).filter(Boolean);
    const city = String(job.city || parts[0] || '').trim();
    const rawState = String(job.state || parts[1] || '')
      .replace(/\s*\/.*$/, '')
      .replace(/[^A-Za-z\s]/g, '')
      .trim();
    const cleanState = rawState && !BAD_LOCATION_TOKENS.test(rawState) ? rawState : undefined;

    if (city && !BAD_LOCATION_TOKENS.test(city)) {
      jobPostingSchema.jobLocation = {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: city,
          addressRegion: cleanState,
          addressCountry: normalizeIsoCountry(job.country || countryCode),
          postalCode: job.postalCode || undefined,
        },
      };
    }
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

  const schemaGraphObj = {
    '@context': 'https://schema.org',
    '@graph': [jobPostingSchema, breadcrumbSchema],
  };
  const schemaGraphJson = safeJsonForScript(schemaGraphObj);

  const plainSnippet = htmlToReadableText(descriptionHtml).slice(0, 155).replace(/\s+/g, ' ').trim();
  const titleText = `${cleanTitle} at ${job.company} | FreshCommits`;
  const metaDesc = `${cleanTitle} at ${job.company} (${job.location || 'Remote'}). ${plainSnippet}`;
  const preloadedJob = {
    ...job,
    country: countryCode,
    descriptionHtml,
  };

  const ssrRootHtml = buildSsrBodyMarkup({ canonicalUrl, job: preloadedJob, descriptionHtml });

  // Serve unified SSR + Hydrated React SPA HTML identically to BOTH Googlebot and users
  if (env?.ASSETS) {
    try {
      const spaRes = await env.ASSETS.fetch(new Request(new URL('/index.html', request.url)));
      if (spaRes.ok) {
        let html = await spaRes.text();

        // 1. Update head title, meta description, canonical, OG, Twitter
        html = html
          .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(titleText)}</title>`)
          .replace(
            /<meta\s+name=["']description["'][^>]*>/i,
            `<meta name="description" content="${escapeHtml(metaDesc)}" />`
          )
          .replace(
            /<link\s+rel=["']canonical["'][^>]*>/i,
            `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`
          )
          .replace(
            /<meta\s+property=["']og:title["'][^>]*>/i,
            `<meta property="og:title" content="${escapeHtml(titleText)}" />`
          )
          .replace(
            /<meta\s+property=["']og:description["'][^>]*>/i,
            `<meta property="og:description" content="${escapeHtml(metaDesc)}" />`
          )
          .replace(
            /<meta\s+property=["']og:url["'][^>]*>/i,
            `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`
          )
          .replace(
            /<meta\s+name=["']twitter:title["'][^>]*>/i,
            `<meta name="twitter:title" content="${escapeHtml(titleText)}" />`
          )
          .replace(
            /<meta\s+name=["']twitter:description["'][^>]*>/i,
            `<meta name="twitter:description" content="${escapeHtml(metaDesc)}" />`
          );

        // 2. Replace homepage WebSite schema with exact single @graph (JobPosting + BreadcrumbList) & synchronous preload
        html = html.replace(
          /<script\s+id=["']default-website-schema["'][^>]*>[\s\S]*?<\/script>/i,
          `<script id="google-job-posting-schema" type="application/ld+json">\n${schemaGraphJson}\n    </script>\n    <script>window.__PRELOADED_JOB__ = ${safeJsonForScript(
            preloadedJob
          )};</script>`
        );

        // 3. Replace initial #root spinner shell with full semantic SSR job markup (hydrated seamlessly by React)
        html = html.replace(
          /<div\s+id=["']root["']>[\s\S]*?<\/div>\s*(?=<!--\s*Crawlable)/i,
          `${ssrRootHtml}\n\n    `
        );

        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=1800',
          },
        });
      }
    } catch {
      // Fall through to standalone semantic HTML if ASSETS fetch fails
    }
  }

  return new Response(
    buildStandaloneFallbackHtml({
      canonicalUrl,
      titleText,
      metaDesc,
      schemaGraphJson,
      ssrRootHtml,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=1800',
      },
    }
  );
};
