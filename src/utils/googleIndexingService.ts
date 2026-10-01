/**
 * Google Indexing API Automation (100% Free / Zero-Cost)
 * Specially authorized by Google for JobPosting schema URLs.
 * Pushes new job URLs directly to Googlebot within 15–60 minutes.
 */

export interface GoogleIndexingConfig {
  clientEmail: string;
  privateKey: string;
  autoIndexOnPublish: boolean;
  lastPingTime?: string;
}

const STORAGE_KEY = 'freshcommits_google_indexing_config';

/**
 * Get stored service account configuration
 */
export function getGoogleIndexingConfig(): GoogleIndexingConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save service account configuration
 */
export function saveGoogleIndexingConfig(config: GoogleIndexingConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * Utility: Convert PEM string to ArrayBuffer for Web Crypto API
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const cleanPem = pem
    .replace(/-----BEGIN[A-Z\s]+-----/g, '')
    .replace(/-----END[A-Z\s]+-----/g, '')
    .replace(/\\n/g, '')
    .replace(/\s+/g, '');
  const binary = atob(cleanPem);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Base64URL encoder
 */
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * ArrayBuffer to Base64URL
 */
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64UrlEncode(binary);
}

/**
 * Sign JWT and exchange with Google OAuth2 for Indexing API access token
 */
export async function getGoogleIndexingAccessToken(config: GoogleIndexingConfig): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: config.clientEmail.trim(),
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
  const unsignedToken = `${encodedHeader}.${encodedClaimSet}`;

  // Import PKCS#8 private key
  const keyBuffer = pemToArrayBuffer(config.privateKey);
  const cryptoKey = await window.crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' }
    },
    false,
    ['sign']
  );

  // Sign token
  const signatureBuffer = await window.crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signedJwt = `${unsignedToken}.${arrayBufferToBase64Url(signatureBuffer)}`;

  // Exchange with Google OAuth2
  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signedJwt
    })
  });

  if (!tokenResp.ok) {
    const errorData = await tokenResp.json().catch(() => ({}));
    throw new Error(errorData.error_description || `Failed to authenticate service account (${tokenResp.status})`);
  }

  const tokenData = await tokenResp.json();
  return tokenData.access_token;
}

/**
 * Publish a single job URL to Google Indexing API
 */
export async function publishUrlToGoogle(
  url: string,
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<{ success: boolean; message: string; notificationTime?: string }> {
  const config = getGoogleIndexingConfig();
  if (!config || !config.clientEmail || !config.privateKey) {
    return {
      success: false,
      message: 'Google Indexing API Service Account is not configured in Admin Panel.'
    };
  }

  try {
    const accessToken = await getGoogleIndexingAccessToken(config);
    const resp = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        url,
        type
      })
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return {
        success: false,
        message: err.error?.message || `Google Indexing API rejected submission (${resp.status})`
      };
    }

    const data = await resp.json();
    return {
      success: true,
      message: `Googlebot notified! Status: ${type}`,
      notificationTime: data.urlNotificationMetadata?.latestUpdate?.notifyTime || new Date().toISOString()
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Error communicating with Google Indexing API.'
    };
  }
}

/**
 * Free Google Sitemap Ping (signals Googlebot to re-read sitemap)
 */
export async function pingGoogleSitemap(): Promise<boolean> {
  try {
    const sitemapUrl = encodeURIComponent('https://www.freshcommits.com/sitemap.xml');
    await fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`, {
      mode: 'no-cors'
    });
    return true;
  } catch {
    return false;
  }
}
