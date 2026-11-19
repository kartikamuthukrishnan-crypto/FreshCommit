import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT_DIR = path.resolve(__dirname, '..', '..');
export const INDEXING_QUEUE_PATH = path.join(ROOT_DIR, '.sync-indexing-queue.json');

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with AbortController timeout and exponential backoff retry on transient
 * network errors, timeouts, 429 rate limits, and 5xx server blips.
 */
export async function fetchWithRetry(
  url,
  init = {},
  {
    timeoutMs = 15000,
    maxAttempts = 4,
    baseDelayMs = 1500,
    label = 'Request',
  } = {}
) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);

      if (res.ok || !RETRYABLE_STATUS.has(res.status) || attempt === maxAttempts) {
        return res;
      }

      const retryAfterSec = parseInt(res.headers.get('retry-after') || '', 10);
      const jitter = Math.floor(Math.random() * 400);
      const delayMs =
        Number.isFinite(retryAfterSec) && retryAfterSec > 0
          ? Math.min(retryAfterSec * 1000, 15000)
          : baseDelayMs * Math.pow(2, attempt - 1) + jitter;

      console.warn(
        `[Retry] ${label} returned HTTP ${res.status} (attempt ${attempt}/${maxAttempts}). Retrying in ${delayMs}ms...`
      );
      await sleep(delayMs);
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt === maxAttempts) {
        throw err;
      }
      const jitter = Math.floor(Math.random() * 400);
      const delayMs = baseDelayMs * Math.pow(2, attempt - 1) + jitter;
      console.warn(
        `[Retry] ${label} failed (${err?.name || 'Error'}: ${err?.message || err}) (attempt ${attempt}/${maxAttempts}). Retrying in ${delayMs}ms...`
      );
      await sleep(delayMs);
    }
  }

  throw lastError || new Error(`${label} failed after ${maxAttempts} attempts`);
}

export function canonicalJobUrl(jobId) {
  return `https://www.freshcommits.com/job/${encodeURIComponent(String(jobId || '').trim())}`;
}

export function readIndexingQueue() {
  try {
    if (!fs.existsSync(INDEXING_QUEUE_PATH)) {
      return { updatedUrls: [], deletedUrls: [] };
    }
    const raw = JSON.parse(fs.readFileSync(INDEXING_QUEUE_PATH, 'utf8'));
    return {
      updatedUrls: Array.isArray(raw.updatedUrls) ? raw.updatedUrls : [],
      deletedUrls: Array.isArray(raw.deletedUrls) ? raw.deletedUrls : [],
    };
  } catch {
    return { updatedUrls: [], deletedUrls: [] };
  }
}

export function appendIndexingQueue({ updatedUrls = [], deletedUrls = [] } = {}) {
  const existing = readIndexingQueue();
  const updatedSet = new Set(existing.updatedUrls);
  const deletedSet = new Set(existing.deletedUrls);

  for (const u of updatedUrls) {
    if (typeof u === 'string' && u.startsWith('https://www.freshcommits.com/job/')) {
      updatedSet.add(u);
      deletedSet.delete(u);
    }
  }
  for (const u of deletedUrls) {
    if (typeof u === 'string' && u.startsWith('https://www.freshcommits.com/job/')) {
      deletedSet.add(u);
      updatedSet.delete(u);
    }
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    updatedUrls: Array.from(updatedSet),
    deletedUrls: Array.from(deletedSet),
  };
  fs.writeFileSync(INDEXING_QUEUE_PATH, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

export function clearIndexingQueue() {
  try {
    if (fs.existsSync(INDEXING_QUEUE_PATH)) {
      fs.unlinkSync(INDEXING_QUEUE_PATH);
    }
  } catch {
    // ignore
  }
}
