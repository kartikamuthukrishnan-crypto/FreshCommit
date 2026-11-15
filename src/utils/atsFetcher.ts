import {
  sanitizeAtsHtml,
  htmlToReadableText,
  formatPlainTextJobDescription,
  decodeHtmlEntitiesClean,
  stripUiAndIconNoise,
} from './jobSanitizer';

export interface HydratedAtsJobResult {
  atsProvider: string;
  sourceUrl: string;
  title?: string;
  company?: string;
  location?: string;
  descriptionHtml: string;
  descriptionText: string;
  verbatimResponsibilities: string[];
  verbatimQualifications: string[];
}

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 5000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function buildResult(
  atsProvider: string,
  sourceUrl: string,
  rawHtmlOrText: string,
  meta: { title?: string; company?: string; location?: string } = {}
): HydratedAtsJobResult | null {
  if (!rawHtmlOrText || !rawHtmlOrText.trim()) return null;

  const looksLikeHtml = /<(?:p|div|ul|ol|li|br|h[1-6]|section|article)\b/i.test(rawHtmlOrText);
  let descriptionHtml = '';
  let descriptionText = '';
  let verbatimResponsibilities: string[] = [];
  let verbatimQualifications: string[] = [];

  if (looksLikeHtml) {
    descriptionHtml = sanitizeAtsHtml(rawHtmlOrText);
    descriptionText = htmlToReadableText(descriptionHtml);
    const parsed = formatPlainTextJobDescription(descriptionText);
    verbatimResponsibilities = parsed.responsibilities;
    verbatimQualifications = parsed.qualifications;
    // If sanitized HTML stripped everything or collapsed to empty, rebuild from formatted plain text
    if (descriptionHtml.replace(/<[^>]+>/g, '').trim().length < 40 && parsed.html) {
      descriptionHtml = parsed.html;
    }
  } else {
    const parsed = formatPlainTextJobDescription(rawHtmlOrText);
    descriptionHtml = parsed.html;
    descriptionText = parsed.text;
    verbatimResponsibilities = parsed.responsibilities;
    verbatimQualifications = parsed.qualifications;
  }

  if (!descriptionText || descriptionText.trim().length < 30) {
    return null;
  }

  return {
    atsProvider,
    sourceUrl,
    title: meta.title ? stripUiAndIconNoise(meta.title, { isTitle: true }) : undefined,
    company: meta.company ? stripUiAndIconNoise(meta.company) : undefined,
    location: meta.location ? stripUiAndIconNoise(meta.location) : undefined,
    descriptionHtml,
    descriptionText,
    verbatimResponsibilities,
    verbatimQualifications,
  };
}

function findJobPostingJsonLd(node: any): any | null {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findJobPostingJsonLd(item);
      if (found) return found;
    }
    return null;
  }
  const typeVal = node['@type'];
  const isJobPosting =
    typeVal === 'JobPosting' ||
    (Array.isArray(typeVal) && typeVal.includes('JobPosting'));
  if (isJobPosting && typeof node.description === 'string' && node.description.trim().length > 40) {
    return node;
  }
  if (node['@graph']) {
    const found = findJobPostingJsonLd(node['@graph']);
    if (found) return found;
  }
  return null;
}

function extractMainJobContainerHtml(html: string): string {
  const containerPatterns = [
    /<div[^>]+data-automation-id=["']jobPostingDescription["'][^>]*>([\s\S]*?)<\/div>\s*(?:<\/div>|<div[^>]+data-automation-id)/i,
    /<div[^>]+id=["'](?:job-description|jobDescriptionText|job-details|job_description|content)["'][^>]*>([\s\S]*?)<\/div>/i,
    /<section[^>]+class=["'][^"']*(?:job-description|description|posting-description)[^"']*["'][^>]*>([\s\S]*?)<\/section>/i,
    /<article\b[^>]*>([\s\S]*?)<\/article>/i,
    /<main\b[^>]*>([\s\S]*?)<\/main>/i,
  ];

  for (const re of containerPatterns) {
    const m = html.match(re);
    if (m && m[1] && htmlToReadableText(m[1]).length > 140) {
      return m[1];
    }
  }

  // Try meta description as last resort only if body extraction is tiny
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : html;
}

export async function hydrateJobDescriptionFromAts(
  targetUrl: string,
  hints: { company?: string; title?: string; location?: string } = {},
  timeoutMs = 5000
): Promise<HydratedAtsJobResult | null> {
  if (!targetUrl) return null;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return null;
  }

  const host = parsedUrl.hostname.toLowerCase();
  const pathname = parsedUrl.pathname;

  try {
    // 1. GREENHOUSE
    const ghJid = parsedUrl.searchParams.get('gh_jid');
    const ghPathMatch =
      pathname.match(/^\/(?:v1\/boards\/)?([^/]+)\/jobs\/(\d+)/i) ||
      pathname.match(/^\/([^/]+)\/jobs\/(\d+)/i);
    if (
      host.includes('greenhouse.io') ||
      (ghJid && hints.company)
    ) {
      const board = ghPathMatch?.[1] || (hints.company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const jobId = ghPathMatch?.[2] || ghJid;
      if (board && jobId) {
        const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs/${encodeURIComponent(jobId)}?questions=false`;
        const resp = await fetchWithTimeout(apiUrl, { headers: { Accept: 'application/json' } }, timeoutMs);
        if (resp.ok) {
          const data: any = await resp.json();
          if (data?.content) {
            const decodedContent = decodeHtmlEntitiesClean(data.content);
            const result = buildResult('Greenhouse', targetUrl, decodedContent, {
              title: data.title || hints.title,
              company: data.company_name || hints.company,
              location: data.location?.name || hints.location,
            });
            if (result) return result;
          }
        }
      }
    }

    // 2. LEVER
    if (host.includes('lever.co')) {
      const leverMatch = pathname.match(/^\/([^/]+)\/([a-f0-9-]{8,})(?:\/apply)?/i);
      if (leverMatch) {
        const company = leverMatch[1];
        const jobId = leverMatch[2];
        const apiDomain = host.includes('.eu.') ? 'api.eu.lever.co' : 'api.lever.co';
        const apiUrl = `https://${apiDomain}/v0/postings/${encodeURIComponent(company)}/${encodeURIComponent(jobId)}`;
        const resp = await fetchWithTimeout(apiUrl, { headers: { Accept: 'application/json' } }, timeoutMs);
        if (resp.ok) {
          const data: any = await resp.json();
          let combined = data.description || data.descriptionPlain || '';
          if (Array.isArray(data.lists)) {
            for (const list of data.lists) {
              if (list?.text && list?.content) {
                combined += `<h3>${list.text}</h3><ul>${list.content}</ul>`;
              }
            }
          }
          if (data.additional) {
            combined += data.additional;
          }
          const result = buildResult('Lever', targetUrl, combined, {
            title: data.text || hints.title,
            company: hints.company || company,
            location: data.categories?.location || hints.location,
          });
          if (result) return result;
        }
      }
    }

    // 3. ASHBY
    if (host.includes('ashbyhq.com')) {
      const ashbyMatch = pathname.match(/^\/([^/]+)\/(?:jobs\/)?([a-f0-9-]{8,})/i);
      if (ashbyMatch) {
        const org = ashbyMatch[1];
        const jobId = ashbyMatch[2];
        const apiUrl = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(org)}`;
        const resp = await fetchWithTimeout(apiUrl, { headers: { Accept: 'application/json' } }, timeoutMs);
        if (resp.ok) {
          const data: any = await resp.json();
          const postings = Array.isArray(data?.jobs) ? data.jobs : [];
          const match = postings.find(
            (j: any) =>
              j.id === jobId ||
              (typeof j.jobUrl === 'string' && j.jobUrl.includes(jobId))
          );
          if (match) {
            const rawBody = match.descriptionHtml || match.descriptionPlain || '';
            const result = buildResult('Ashby', targetUrl, rawBody, {
              title: match.title || hints.title,
              company: hints.company || org,
              location: match.location || hints.location,
            });
            if (result) return result;
          }
        }
      }
    }

    // 4. SMARTRECRUITERS
    if (host.includes('smartrecruiters.com')) {
      const srMatch = pathname.match(/^\/([^/]+)\/([a-zA-Z0-9-]+)/);
      if (srMatch) {
        const company = srMatch[1];
        const postingId = srMatch[2].split('-')[0];
        const apiUrl = `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(company)}/postings/${encodeURIComponent(postingId)}`;
        const resp = await fetchWithTimeout(apiUrl, { headers: { Accept: 'application/json' } }, timeoutMs);
        if (resp.ok) {
          const data: any = await resp.json();
          const sections = data?.jobAd?.sections || {};
          const htmlParts: string[] = [];
          for (const key of ['companyDescription', 'jobDescription', 'qualifications', 'additionalInformation']) {
            if (sections[key]?.text) {
              if (sections[key].title) {
                htmlParts.push(`<h3>${sections[key].title}</h3>`);
              }
              htmlParts.push(sections[key].text);
            }
          }
          const result = buildResult('SmartRecruiters', targetUrl, htmlParts.join('\n'), {
            title: data.name || hints.title,
            company: data.company?.name || hints.company,
            location: data.location?.city ? `${data.location.city}, ${data.location.region || data.location.country || ''}` : hints.location,
          });
          if (result) return result;
        }
      }
    }

    // 5. WORKABLE
    if (host.includes('workable.com')) {
      const wkMatch = pathname.match(/^\/([^/]+)\/j\/([A-Za-z0-9]+)/i);
      if (wkMatch) {
        const account = wkMatch[1];
        const shortcode = wkMatch[2];
        const apiUrl = `https://apply.workable.com/api/v3/accounts/${encodeURIComponent(account)}/jobs/${encodeURIComponent(shortcode)}`;
        const resp = await fetchWithTimeout(apiUrl, { headers: { Accept: 'application/json' } }, timeoutMs);
        if (resp.ok) {
          const data: any = await resp.json();
          const parts = [
            data.description || '',
            data.requirements ? `<h3>Requirements</h3>${data.requirements}` : '',
            data.benefits ? `<h3>Benefits</h3>${data.benefits}` : '',
          ].filter(Boolean);
          const result = buildResult('Workable', targetUrl, parts.join('\n'), {
            title: data.title || hints.title,
            company: hints.company || account,
            location: data.location?.city ? `${data.location.city}, ${data.location.region || data.location.country || ''}` : hints.location,
          });
          if (result) return result;
        }
      }
    }

    // 6. GENERIC / WORKDAY / ICIMS / DIRECT HTML EXTRACTION
    const htmlResp = await fetchWithTimeout(
      targetUrl,
      {
        headers: {
          'User-Agent': BROWSER_UA,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
      },
      timeoutMs
    );

    if (!htmlResp.ok) return null;
    const contentType = htmlResp.headers.get('content-type') || '';
    if (!contentType.includes('html') && !contentType.includes('xml') && !contentType.includes('json')) {
      return null;
    }
    const rawHtml = await htmlResp.text();
    if (!rawHtml) return null;

    // 6a. Extract <script type="application/ld+json"> JobPosting.description first
    const ldScripts = [
      ...rawHtml.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
    ];
    for (const match of ldScripts) {
      const jsonText = (match[1] || '').trim();
      if (!jsonText) continue;
      try {
        const parsed = JSON.parse(jsonText);
        const jp = findJobPostingJsonLd(parsed);
        if (jp && jp.description) {
          const decodedDesc = decodeHtmlEntitiesClean(jp.description);
          const provider = host.includes('myworkdayjobs')
            ? 'Workday'
            : host.includes('icims')
            ? 'iCIMS'
            : 'Direct Career Portal';
          const result = buildResult(provider, targetUrl, decodedDesc, {
            title: jp.title || hints.title,
            company: jp.hiringOrganization?.name || hints.company,
            location:
              jp.jobLocation?.address?.addressLocality ||
              hints.location,
          });
          if (result && result.descriptionText.length >= 120) {
            return result;
          }
        }
      } catch {
        // Malformed JSON-LD block; continue to next
      }
    }

    // 6b. Fallback to main job container HTML
    const mainHtml = extractMainJobContainerHtml(rawHtml);
    const provider = host.includes('myworkdayjobs')
      ? 'Workday'
      : host.includes('icims')
      ? 'iCIMS'
      : 'Direct Career Portal';
    return buildResult(provider, targetUrl, mainHtml, hints);
  } catch {
    return null;
  }
}
