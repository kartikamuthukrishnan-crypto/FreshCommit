import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  fetchWithRetry,
  readIndexingQueue,
  clearIndexingQueue,
} from './lib/retry-and-queue.mjs';

const INDEXING_ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const INDEXING_SCOPE = 'https://www.googleapis.com/auth/indexing';

const DRY_RUN = process.env.DRY_RUN === 'true';
const MAX_PER_RUN = Math.max(1, parseInt(process.env.MAX_INDEXING_PER_RUN || '100', 10));
const ALLOWED_PREFIX = 'https://www.freshcommits.com/job/';

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function parseServiceAccountFromEnv() {
  const raw = (process.env.GOOGLE_INDEXING_SA_JSON || '').trim();
  if (!raw) return null;

  let jsonStr = raw;
  if (!raw.startsWith('{')) {
    try {
      jsonStr = Buffer.from(raw, 'base64').toString('utf8').trim();
    } catch {
      throw new Error('GOOGLE_INDEXING_SA_JSON is neither valid JSON nor valid base64.');
    }
  }

  const parsed = JSON.parse(jsonStr);
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('GOOGLE_INDEXING_SA_JSON must contain client_email and private_key.');
  }
  return parsed;
}

async function getGoogleAccessToken(serviceAccount) {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claimSet = base64UrlEncode(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: INDEXING_SCOPE,
      aud: OAUTH_TOKEN_URL,
      iat: nowSec,
      exp: nowSec + 3600,
    })
  );

  const unsignedJwt = `${header}.${claimSet}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedJwt);
  signer.end();
  const signature = base64UrlEncode(signer.sign(serviceAccount.private_key));
  const assertion = `${unsignedJwt}.${signature}`;

  const tokenRes = await fetchWithRetry(
    OAUTH_TOKEN_URL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }).toString(),
    },
    { timeoutMs: 12000, maxAttempts: 3, label: 'Google OAuth2 Token' }
  );

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text().catch(() => '');
    throw new Error(`Google OAuth2 token exchange failed (${tokenRes.status}): ${errBody.slice(0, 250)}`);
  }

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error('Google OAuth2 response missing access_token.');
  }
  return tokenData.access_token;
}

function parseCliOverrides(argv) {
  const urlsArg = argv.find((a) => a.startsWith('--urls='));
  const typeArg = argv.find((a) => a.startsWith('--type='));
  if (!urlsArg) return null;

  const urls = urlsArg
    .slice('--urls='.length)
    .split(',')
    .map((u) => u.trim())
    .filter((u) => u.startsWith(ALLOWED_PREFIX));
  const type = (typeArg ? typeArg.slice('--type='.length) : 'URL_UPDATED').toUpperCase();

  return {
    updatedUrls: type === 'URL_UPDATED' ? urls : [],
    deletedUrls: type === 'URL_DELETED' ? urls : [],
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const cliQueue = parseCliOverrides(process.argv.slice(2));
  const queue = cliQueue || readIndexingQueue();

  // Prioritize URL_DELETED first so closed jobs vanish from Google for Jobs immediately
  const tasks = [
    ...queue.deletedUrls
      .filter((u) => u.startsWith(ALLOWED_PREFIX))
      .map((url) => ({ url, type: 'URL_DELETED' })),
    ...queue.updatedUrls
      .filter((u) => u.startsWith(ALLOWED_PREFIX))
      .map((url) => ({ url, type: 'URL_UPDATED' })),
  ].slice(0, MAX_PER_RUN);

  console.log(
    `[GoogleIndexing] Queued notifications: ${tasks.length} (${queue.deletedUrls.length} URL_DELETED, ${queue.updatedUrls.length} URL_UPDATED, cap=${MAX_PER_RUN}, DRY_RUN=${DRY_RUN}).`
  );

  if (tasks.length === 0) {
    console.log('[GoogleIndexing] No new or expired job URLs to notify. Skipping.');
    return;
  }

  const serviceAccount = parseServiceAccountFromEnv();
  if (!serviceAccount) {
    console.log(
      '[GoogleIndexing] GOOGLE_INDEXING_SA_JSON secret is not configured yet — skipping live API ping cleanly.'
    );
    console.log(
      '[GoogleIndexing] See community/SETUP_OPEN_SOURCE_REPO.md to enable instant Google Indexing API pings.'
    );
    return;
  }

  if (DRY_RUN) {
    console.log(`[GoogleIndexing] [DRY_RUN=true] Authenticated service account: ${serviceAccount.client_email}`);
    for (const t of tasks.slice(0, 15)) {
      console.log(`  • [${t.type}] ${t.url}`);
    }
    return;
  }

  const accessToken = await getGoogleAccessToken(serviceAccount);
  let sent = 0;
  let failed = 0;
  let quotaHit = false;

  for (const task of tasks) {
    try {
      const res = await fetchWithRetry(
        INDEXING_ENDPOINT,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: task.url, type: task.type }),
        },
        { timeoutMs: 10000, maxAttempts: 3, label: `IndexingAPI ${task.type}` }
      );

      if (res.ok) {
        sent++;
      } else {
        const body = await res.text().catch(() => '');
        console.warn(`[GoogleIndexing] HTTP ${res.status} for ${task.url}: ${body.slice(0, 180)}`);
        failed++;
        if (res.status === 429) {
          console.warn('[GoogleIndexing] Daily Indexing API quota reached — stopping remaining pings for this run.');
          quotaHit = true;
          break;
        }
      }
    } catch (err) {
      console.warn(`[GoogleIndexing] Error notifying ${task.url}:`, err?.message || err);
      failed++;
    }
    await sleep(200);
  }

  console.log(`[GoogleIndexing] Completed: ${sent} succeeded, ${failed} failed.`);
  if (!cliQueue && !quotaHit) {
    clearIndexingQueue();
  }
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main().catch((err) => {
    console.error('[GoogleIndexing] Fatal error:', err?.message || err);
    // Do not fail the entire 6-hour job sync if Google Indexing API has an outage
    process.exit(0);
  });
}
