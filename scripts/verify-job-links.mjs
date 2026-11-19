import { fileURLToPath } from 'node:url';

const FIRESTORE_PROJECT = 'centered-module-9smzh';
const FIRESTORE_DB = 'ai-studio-juniordevhubentr-9fce9c23-e540-412e-ae3f-aca1eaf015f5';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/${FIRESTORE_DB}/documents`;

const DRY_RUN = process.env.DRY_RUN === 'true';
const CONCURRENCY = 8;
const TIMEOUT_MS = 8500;
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const CLOSED_PHRASES = [
  'this job is no longer available',
  'this position has been filled',
  'this role has been filled',
  'no longer accepting applications',
  'this requisition is closed',
  'job posting has expired',
  'sorry, this position is closed',
  'the job you are looking for is no longer open',
  "the job you're looking for doesn't exist",
  "the job you are looking for doesn't exist",
];

function parseFirestoreVal(v) {
  if (!v) return undefined;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return parseInt(v.integerValue, 10);
  if ('doubleValue' in v) return parseFloat(v.doubleValue);
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(parseFirestoreVal).filter((x) => x !== undefined);
  if ('mapValue' in v) {
    const obj = {};
    for (const k in v.mapValue.fields || {}) {
      const p = parseFirestoreVal(v.mapValue.fields[k]);
      if (p !== undefined) obj[k] = p;
    }
    return obj;
  }
  return undefined;
}

function toFirestoreVal(val) {
  if (val === null || val === undefined) return undefined;
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (!Number.isFinite(val)) return undefined;
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreVal).filter(Boolean) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      const conv = toFirestoreVal(v);
      if (conv !== undefined) fields[k] = conv;
    }
    return { mapValue: { fields } };
  }
  return undefined;
}

function toFirestoreDocument(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    const conv = toFirestoreVal(v);
    if (conv !== undefined) fields[k] = conv;
  }
  return { fields };
}

async function fetchWithTimeout(url, init = {}, ms = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function loadAllFirestoreJobs() {
  const res = await fetchWithTimeout(
    `${FIRESTORE_BASE}:runQuery`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'jobs' }],
        },
      }),
    },
    15000
  );
  if (!res.ok) throw new Error(`Firestore runQuery failed: ${res.status}`);
  const rows = await res.json();
  const docs = [];
  for (const row of rows) {
    if (!row.document?.fields) continue;
    const obj = {};
    for (const [k, v] of Object.entries(row.document.fields)) {
      const p = parseFirestoreVal(v);
      if (p !== undefined) obj[k] = p;
    }
    obj.id = obj.id || row.document.name.split('/').pop();
    docs.push(obj);
  }
  return docs;
}

async function patchFirestoreJob(job) {
  const res = await fetchWithTimeout(
    `${FIRESTORE_BASE}/jobs/${encodeURIComponent(job.id)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFirestoreDocument(job)),
    },
    10000
  );
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`PATCH failed for ${job.id}: ${res.status} ${txt.slice(0, 150)}`);
  }
}

function hasSpecificJobIdentifier(urlStr) {
  try {
    const u = new URL(urlStr);
    if (u.searchParams.has('gh_jid') || u.searchParams.has('jid') || u.searchParams.has('jobId')) return true;
    if (/\/(?:job|jobs|positions|postings|requisition|opening|vacancy)\/[A-Za-z0-9_-]{3,}/i.test(u.pathname)) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function isGenericSearchLandingUrl(finalUrlStr) {
  try {
    const u = new URL(finalUrlStr);
    const p = u.pathname.toLowerCase().replace(/\/+$/, '');
    if (
      /\/(?:jobsearch|jobs\/search|careers\/search|search-jobs|find-jobs)$/i.test(p) ||
      p === '/careers' ||
      p === '/jobs' ||
      p === ''
    ) {
      return !u.searchParams.has('gh_jid') && !u.searchParams.has('jobId');
    }
    // Oracle Cloud dead job redirect drops `/job/{id}` and stops at `/sites/jobsearch`
    if (u.hostname.includes('oraclecloud.com') && p.endsWith('/sites/jobsearch')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function checkJobLinkLiveness(job, todayIso) {
  if (!job || job.status === 'EXPIRED' || job.status === 'DRAFT') {
    return { alive: true, skip: true };
  }

  // 1. Expired validThrough date check
  if (job.validThrough && /^\d{4}-\d{2}-\d{2}/.test(String(job.validThrough))) {
    const vt = String(job.validThrough).slice(0, 10);
    if (vt < todayIso) {
      return { alive: false, reason: `validThrough expired (${vt})` };
    }
  }

  const targetUrl = String(job.applyUrl || '').trim();
  if (!targetUrl || !targetUrl.startsWith('http')) {
    return { alive: false, reason: 'missing/invalid applyUrl' };
  }

  try {
    const u = new URL(targetUrl);
    const host = u.hostname.toLowerCase();
    const ghJid = u.searchParams.get('gh_jid');
    const ghBoardSlug =
      job.syncSourceId && job.syncSourceId.startsWith('gh-')
        ? job.syncSourceId.slice(3)
        : u.pathname.match(/^\/(?:v1\/boards\/)?([^/]+)\/jobs\/\d+/i)?.[1];

    // 2. Direct Greenhouse API confirmation when available
    if ((host.includes('greenhouse.io') || ghJid) && ghBoardSlug && (ghJid || u.pathname.match(/\/jobs\/(\d+)/))) {
      const ghId = ghJid || u.pathname.match(/\/jobs\/(\d+)/)[1];
      const apiResp = await fetchWithTimeout(
        `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(ghBoardSlug)}/jobs/${encodeURIComponent(ghId)}`,
        { headers: { Accept: 'application/json' } }
      );
      if (apiResp.status === 404 || apiResp.status === 410) {
        return { alive: false, reason: `Greenhouse API HTTP ${apiResp.status}` };
      }
    }

    // 3. Destination HTTP check following redirects
    const resp = await fetchWithTimeout(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (resp.status === 404 || resp.status === 410) {
      return { alive: false, reason: `Destination HTTP ${resp.status}` };
    }

    // Ignore bot blocks / rate limits / server hiccups so we never false-expire active roles
    if (resp.status === 401 || resp.status === 403 || resp.status === 429 || resp.status >= 500) {
      return { alive: true, reason: `Transient/bot-wall HTTP ${resp.status}` };
    }

    // Check if a requisition-specific URL redirected to a generic /jobsearch or /careers page
    if (hasSpecificJobIdentifier(targetUrl) && resp.url && isGenericSearchLandingUrl(resp.url)) {
      return { alive: false, reason: `Redirected to generic portal (${resp.url.slice(0, 80)})` };
    }

    // Scan lightweight text snippet for unambiguous closed-requisition phrases
    const contentType = resp.headers.get('content-type') || '';
    if (resp.ok && contentType.includes('text/html')) {
      const bodyText = (await resp.text()).slice(0, 45000).toLowerCase();
      for (const phrase of CLOSED_PHRASES) {
        if (bodyText.includes(phrase)) {
          return { alive: false, reason: `Closed copy detected ("${phrase}")` };
        }
      }
    }

    return { alive: true };
  } catch (err) {
    // Do NOT expire on timeouts or transient network resets
    return { alive: true, reason: `Timeout/network skip (${err?.message || 'err'})` };
  }
}

async function runPool(items, concurrency, workerFn) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await workerFn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

async function main() {
  const todayIso = new Date().toISOString().split('T')[0];
  console.log(`[LinkVerify] Auditing active Firestore jobs (today=${todayIso}, DRY_RUN=${DRY_RUN})...`);

  const allJobs = await loadAllFirestoreJobs();
  const activeJobs = allJobs.filter((j) => !j.status || j.status === 'ACTIVE');
  console.log(`[LinkVerify] Loaded ${allJobs.length} total jobs (${activeJobs.length} currently ACTIVE).`);

  const deadJobs = [];
  await runPool(activeJobs, CONCURRENCY, async (job) => {
    const check = await checkJobLinkLiveness(job, todayIso);
    if (!check.alive) {
      deadJobs.push({ job, reason: check.reason });
    }
  });

  console.log(`\n--- Liveness Audit Results ---`);
  console.log(`Active Checked : ${activeJobs.length}`);
  console.log(`Dead / Expired : ${deadJobs.length}`);
  for (const d of deadJobs) {
    console.log(`  • [EXPIRE] ${d.job.id} (${d.job.company} — ${d.job.title}) -> ${d.reason}`);
  }

  if (DRY_RUN) {
    console.log(`\n[DRY_RUN=true] No Firestore writes performed.`);
    return;
  }

  let updatedCount = 0;
  const nowIso = new Date().toISOString();
  for (const { job } of deadJobs) {
    try {
      await patchFirestoreJob({
        ...job,
        status: 'EXPIRED',
        healthStatus: 'DEAD_LINK',
        lastHealthCheckedAt: nowIso,
      });
      updatedCount++;
    } catch (err) {
      console.error(`[LinkVerify] Failed to expire ${job.id}:`, err.message);
    }
  }

  console.log(`[LinkVerify] Marked ${updatedCount}/${deadJobs.length} dead/expired jobs as EXPIRED in Firestore.`);
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main().catch((err) => {
    console.error('[LinkVerify] Fatal error:', err);
    process.exit(1);
  });
}
