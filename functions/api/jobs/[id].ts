import { hydrateJobDescriptionFromAts } from '../../../src/utils/atsFetcher';
import {
  sanitizeJobTitle,
  sanitizeAtsHtml,
  formatPlainTextJobDescription,
  htmlToReadableText,
} from '../../../src/utils/jobSanitizer';

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

async function lookupJobFallback(requestUrl: string, jobId: string, env: any): Promise<any | null> {
  // 1. Try /data/jobs.json static asset
  try {
    if (env?.ASSETS) {
      const assetResp = await env.ASSETS.fetch(new Request(new URL('/data/jobs.json', requestUrl)));
      if (assetResp.ok) {
        const list = await assetResp.json();
        if (Array.isArray(list)) {
          const match = list.find((j: any) => j?.id?.toLowerCase() === jobId.toLowerCase());
          if (match) return match;
        }
      }
    }
  } catch {
    // ignore
  }

  // 2. Try Firestore REST API
  try {
    const fsUrl = `https://firestore.googleapis.com/v1/projects/centered-module-9smzh/databases/ai-studio-juniordevhubentr-9fce9c23-e540-412e-ae3f-aca1eaf015f5/documents/jobs/${encodeURIComponent(jobId)}`;
    const res = await fetch(fsUrl);
    if (res.ok) {
      const doc: any = await res.json();
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

export const onRequest = async (context: any) => {
  const { request, params, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const reqUrl = new URL(request.url);
  const jobId = decodeURIComponent(String(params?.id || '')).trim();

  let targetUrl = (reqUrl.searchParams.get('url') || '').trim();
  const companyHint = reqUrl.searchParams.get('company') || '';
  const titleHint = reqUrl.searchParams.get('title') || '';
  const locationHint = reqUrl.searchParams.get('location') || '';

  let storedJob: any = null;
  if (!targetUrl && jobId) {
    storedJob = await lookupJobFallback(request.url, jobId, env);
    if (storedJob?.applyUrl) {
      targetUrl = storedJob.applyUrl;
    }
  }

  if (targetUrl) {
    const hydrated = await hydrateJobDescriptionFromAts(
      targetUrl,
      {
        company: companyHint || storedJob?.company,
        title: titleHint || storedJob?.title,
        location: locationHint || storedJob?.location,
      },
      6000
    );

    if (hydrated) {
      return new Response(
        JSON.stringify({
          id: jobId,
          ...hydrated,
          hydratedFromAts: true,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600',
          },
        }
      );
    }
  }

  // Fallback to sanitized stored job if live ATS fetch failed or timed out
  if (!storedJob && jobId) {
    storedJob = await lookupJobFallback(request.url, jobId, env);
  }

  if (storedJob) {
    const rawHtml = storedJob.descriptionHtml ? sanitizeAtsHtml(storedJob.descriptionHtml) : '';
    const formatted = formatPlainTextJobDescription(
      storedJob.description || '',
      storedJob.responsibilities || [],
      storedJob.qualifications || []
    );
    const descriptionHtml = rawHtml || formatted.html;
    const descriptionText = rawHtml ? htmlToReadableText(rawHtml) : formatted.text;

    return new Response(
      JSON.stringify({
        id: jobId,
        atsProvider: storedJob.atsProvider || 'Direct Career Portal',
        sourceUrl: storedJob.applyUrl || targetUrl,
        title: sanitizeJobTitle(storedJob.title || titleHint),
        company: storedJob.company || companyHint,
        location: storedJob.location || locationHint,
        descriptionHtml,
        descriptionText,
        verbatimResponsibilities: formatted.responsibilities,
        verbatimQualifications: formatted.qualifications,
        hydratedFromAts: false,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=900',
        },
      }
    );
  }

  return new Response(
    JSON.stringify({
      error: 'Job description unavailable',
      id: jobId,
      descriptionHtml: '',
      descriptionText: '',
      verbatimResponsibilities: [],
      verbatimQualifications: [],
    }),
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    }
  );
};
