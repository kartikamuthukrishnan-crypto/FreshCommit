import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  fetchWithRetry,
  canonicalJobUrl,
  appendIndexingQueue,
} from './lib/retry-and-queue.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const FIRESTORE_PROJECT = 'centered-module-9smzh';
const FIRESTORE_DB = 'ai-studio-juniordevhubentr-9fce9c23-e540-412e-ae3f-aca1eaf015f5';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/${FIRESTORE_DB}/documents`;

const DRY_RUN = process.env.DRY_RUN === 'true';
const MAX_NEW_JOBS_PER_RUN = Math.max(1, parseInt(process.env.MAX_NEW_JOBS_PER_RUN || '25', 10));
const MAX_PER_COMPANY = Math.max(1, parseInt(process.env.MAX_PER_COMPANY || '3', 10));
const MAX_AGE_DAYS = Math.max(7, parseInt(process.env.MAX_AGE_DAYS || '45', 10));
const FETCH_TIMEOUT_MS = 9000;
const CONCURRENCY = 6;

const BROWSER_UA =
  'FreshCommitsJobSync/2.0 (+https://www.freshcommits.com; Google-for-Jobs-Compliant)';

// ---------------------------------------------------------------------------
// Firestore REST Helpers
// ---------------------------------------------------------------------------

function parseFirestoreVal(v) {
  if (!v) return undefined;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return parseInt(v.integerValue, 10);
  if ('doubleValue' in v) return parseFloat(v.doubleValue);
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) {
    const vals = v.arrayValue.values || [];
    return vals.map(parseFirestoreVal).filter((x) => x !== undefined);
  }
  if ('mapValue' in v) {
    const fields = v.mapValue.fields || {};
    const obj = {};
    for (const k in fields) {
      const parsed = parseFirestoreVal(fields[k]);
      if (parsed !== undefined) obj[k] = parsed;
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
    const values = val.map(toFirestoreVal).filter(Boolean);
    return { arrayValue: { values } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      const converted = toFirestoreVal(v);
      if (converted !== undefined) fields[k] = converted;
    }
    return { mapValue: { fields } };
  }
  return undefined;
}

function toFirestoreDocument(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    const converted = toFirestoreVal(v);
    if (converted !== undefined) fields[k] = converted;
  }
  return { fields };
}

async function fetchWithTimeout(url, init = {}, timeoutMs = FETCH_TIMEOUT_MS) {
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

async function loadExistingFirestoreJobs() {
  const res = await fetchWithRetry(
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
    { timeoutMs: 20000, maxAttempts: 4, baseDelayMs: 2000, label: 'Firestore runQuery (sync)' }
  );

  if (!res.ok) {
    throw new Error(`Firestore runQuery failed: ${res.status} ${res.statusText}`);
  }

  const rows = await res.json();
  const docs = [];
  for (const row of rows) {
    if (!row.document || !row.document.fields) continue;
    const obj = {};
    for (const [k, v] of Object.entries(row.document.fields)) {
      const parsed = parseFirestoreVal(v);
      if (parsed !== undefined) obj[k] = parsed;
    }
    const docId = row.document.name.split('/').pop();
    obj.id = obj.id || docId;
    obj._docId = docId;
    docs.push(obj);
  }
  return docs;
}

async function writeFirestoreJob(job) {
  const docId = job.id;
  const payload = { ...job };
  delete payload._docId;

  const res = await fetchWithRetry(
    `${FIRESTORE_BASE}/jobs/${encodeURIComponent(docId)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFirestoreDocument(payload)),
    },
    { timeoutMs: 12000, maxAttempts: 3, baseDelayMs: 1200, label: `Firestore PATCH ${docId}` }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Firestore PATCH failed for ${docId}: ${res.status} ${errText.slice(0, 200)}`);
  }
  return true;
}

// ---------------------------------------------------------------------------
// Sanitization & Extraction Helpers (Consistent with src/utils/jobSanitizer)
// ---------------------------------------------------------------------------

const MATERIAL_ICON_RE =
  /\b(?:star_rate|location_on|schedule|business_center|find_in_page|bookmark_border|bookmark_added|work_outline|open_in_new|arrow_forward|arrow_back|check_circle|check_circle_outline|verified_user|content_copy|attach_money|apartment|public|calendar_today|trending_up|info_outline|help_outline|flag_outlined)\b/gi;

function decodeHtmlEntities(input) {
  if (!input) return '';
  let str = String(input);
  const map = {
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&#x27;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&#xa0;': ' ',
    '&bull;': '•',
    '&middot;': '·',
    '&ndash;': '–',
    '&mdash;': '—',
    '&lsquo;': "'",
    '&rsquo;': "'",
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&hellip;': '…',
  };
  for (let pass = 0; pass < 2; pass++) {
    for (const [k, v] of Object.entries(map)) {
      if (str.includes(k)) str = str.split(k).join(v);
    }
    str = str
      .replace(/&#(\d+);/g, (_, dec) => {
        const code = parseInt(dec, 10);
        return !isNaN(code) && code > 0 && code < 0x10ffff ? String.fromCodePoint(code) : '';
      })
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
        const code = parseInt(hex, 16);
        return !isNaN(code) && code > 0 && code < 0x10ffff ? String.fromCodePoint(code) : '';
      });
  }
  return str;
}

function stripUiNoise(input, isTitle = false) {
  if (!input) return '';
  let text = decodeHtmlEntities(input)
    .replace(MATERIAL_ICON_RE, ' ')
    .replace(/\bshare\s+Share\b/gi, ' ')
    .replace(/\bSave\s+Job\b/gi, ' ')
    .replace(/\bUnsave\s+Job\b/gi, ' ')
    .replace(/\bApply\s+Now\b/gi, ' ')
    .replace(/\bEasy\s+Apply\b/gi, ' ');

  if (isTitle) {
    text = text
      .replace(/^(?:New|Hot|Featured|Urgent)\s*[•|\-:]\s*/i, '')
      .replace(/^(?:New)\s+(?=[A-Z])/g, '')
      .replace(/\s+(?:New|Save Job|Share)$/i, '')
      .replace(/\s*\|\s*FreshCommits.*$/i, '');
  }
  return text.replace(/[ \t]{2,}/g, ' ').trim();
}

function sanitizeAtsHtml(rawHtml) {
  if (!rawHtml) return '';
  let html = String(rawHtml);

  if (!/<(?:p|div|ul|ol|li|h[1-6]|br)\b/i.test(html) && /&lt;(?:p|div|ul|ol|li|h[1-6]|br)/i.test(html)) {
    html = decodeHtmlEntities(html);
  }

  const blocked = [
    'script', 'style', 'noscript', 'nav', 'header', 'footer', 'aside', 'form',
    'button', 'svg', 'picture', 'figure', 'iframe', 'object', 'embed', 'canvas', 'video', 'audio', 'template',
  ];
  for (const tag of blocked) {
    html = html.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi'), ' ');
    html = html.replace(new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi'), ' ');
  }

  html = html.replace(/<(?:img|input|select|textarea|source|track|meta|link)\b[^>]*\/?>/gi, ' ');
  html = html.replace(/<!--[\s\S]*?-->/g, ' ');
  html = html.replace(
    /<([a-z0-9]+)\b[^>]*(?:style\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?:\.0+)?\b)[^"']*["']|\bhidden\b)[^>]*>[\s\S]*?<\/\1>/gi,
    ' '
  );

  const allowedTags = new Set([
    'p', 'br', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
    'a', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr',
  ]);

  html = html.replace(/<([a-z0-9]+)\b([^>]*)>/gi, (_, rawTag, rawAttrs) => {
    const tag = rawTag.toLowerCase();
    if (!allowedTags.has(tag)) return '';
    const outTag = tag === 'h1' ? 'h2' : tag;
    if (outTag === 'a') {
      const m = rawAttrs.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const href = (m?.[1] || m?.[2] || m?.[3] || '').trim();
      if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) {
        return `<a href="${href.replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer">`;
      }
      return '<span>';
    }
    if (outTag === 'br' || outTag === 'hr') return `<${outTag} />`;
    return `<${outTag}>`;
  });

  html = html.replace(/<\/([a-z0-9]+)\s*>/gi, (_, rawTag) => {
    const tag = rawTag.toLowerCase();
    if (tag === 'h1') return '</h2>';
    return allowedTags.has(tag) ? `</${tag}>` : '';
  });

  html = html.replace(MATERIAL_ICON_RE, ' ');
  for (let i = 0; i < 3; i++) {
    html = html.replace(/<(p|div|span|strong|b|em|i|li|h[2-6])\b[^>]*>(?:\s|&nbsp;)*<\/\1>/gi, '');
  }

  return html.replace(/\r?\n/g, '\n').replace(/[ \t]{2,}/g, ' ').trim();
}

function htmlToReadableText(html) {
  if (!html) return '';
  let text = String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6]|section|article|blockquote|tr)>/gi, '\n\n')
    .replace(/<li\b[^>]*>/gi, '\n• ')
    .replace(/<\/li>/gi, '')
    .replace(/<[^>]+>/g, ' ');

  text = stripUiNoise(decodeHtmlEntities(text), false);
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractSections(plainText, rawHtml) {
  const responsibilities = [];
  const qualifications = [];

  // Extract heading + bullet list pairs from sanitized HTML when cleanly structured
  if (rawHtml) {
    const sectionRe = /<(h[2-4]|strong|p)[^>]*>([\s\S]*?)<\/\1>\s*(?:<[^>]+>\s*)*<ul[^>]*>([\s\S]*?)<\/ul>/gi;
    let m;
    while ((m = sectionRe.exec(rawHtml)) !== null) {
      const heading = htmlToReadableText(m[2]).toLowerCase();
      const items = [...m[3].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((li) => htmlToReadableText(li[1]).replace(/^[•\-\*–—]\s*/, '').trim())
        .filter((s) => s.length >= 8 && s.length <= 400);
      if (items.length === 0) continue;

      if (/(responsibilit|what you'?ll do|what you will do|in this role|day to day|you will|role overview|duties)/.test(heading)) {
        responsibilities.push(...items);
      } else if (/(qualif|require|what we'?re looking|who you are|about you|minimum|basic|preferred|skills|background|experience)/.test(heading)) {
        qualifications.push(...items);
      }
    }
  }

  // Fallback plain-text section scan
  if (responsibilities.length === 0 || qualifications.length === 0) {
    const lines = plainText.split('\n');
    let mode = '';
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      const lower = line.toLowerCase();
      if (line.length < 70 && /^(?:key\s+)?responsibilit|^what you(?:'ll| will) do|^in this role|^core duties/i.test(lower)) {
        mode = 'resp';
        continue;
      }
      if (line.length < 70 && /^(?:minimum|basic|preferred)?\s*(?:qualifications|requirements)|^what we(?:'re| are) looking for|^who you are|^required skills/i.test(lower)) {
        mode = 'qual';
        continue;
      }
      if (line.length < 60 && /^(?:benefits|compensation|perks|about us|equal opportunity|eeo|salary)/i.test(lower)) {
        mode = '';
        continue;
      }
      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
        const cleaned = line.replace(/^[•\-\*]\s*/, '').trim();
        if (cleaned.length >= 8 && cleaned.length <= 400) {
          if (mode === 'resp' && responsibilities.length < 10) responsibilities.push(cleaned);
          if (mode === 'qual' && qualifications.length < 10) qualifications.push(cleaned);
        }
      }
    }
  }

  return {
    responsibilities: Array.from(new Set(responsibilities)).slice(0, 8),
    qualifications: Array.from(new Set(qualifications)).slice(0, 8),
  };
}

const KNOWN_SKILLS = [
  'TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Golang', 'Rust', 'C++', 'C#', 'Kotlin', 'Swift', 'SQL',
  'React', 'Next.js', 'Node.js', 'GraphQL', 'REST', 'PostgreSQL', 'MongoDB', 'Redis', 'Kafka', 'Docker',
  'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform', 'PyTorch', 'TensorFlow', 'Spark', 'Linux', 'Git',
  'Tailwind', 'CI/CD', 'Microservices', 'Distributed Systems',
];

function extractSkills(title, text) {
  const hay = `${title}\n${text}`;
  const found = [];
  for (const skill of KNOWN_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re =
      skill === 'C++' || skill === 'C#'
        ? new RegExp(`(?:^|[\\s,/;(])${escaped}(?=$|[\\s,/;.)])`, 'i')
        : new RegExp(`\\b${escaped}\\b`, 'i');
    if (re.test(hay)) {
      found.push(skill === 'Golang' ? 'Go' : skill);
    }
    if (found.length >= 8) break;
  }
  return Array.from(new Set(found));
}

// ---------------------------------------------------------------------------
// 0-2 YoE Policy Filter ("The Bouncer"), Classification & Metadata
// ---------------------------------------------------------------------------

const SENIOR_TITLE_RE =
  /\b(?:senior|sr\.?|staff|principal|distinguished|fellow|lead|manager|director|vp|vice president|chief|cto|ceo|cfo|head of|architect|partner|iii|iv|v|l5|l6|l7|l8|e5|e6|ic4|ic5|level\s*[3-9])\b/i;

const NON_ENGINEERING_RE =
  /\b(?:recruiter|recruiting|talent acquisition|account executive|sales|sdr|bdr|customer success|legal|counsel|attorney|paralegal|accountant|accounting|finance|financial|treasury|tax\s+(?:intern|specialist|analyst)|sourcing|procurement|supply chain|controller|payroll|hr\b|human resources|office manager|executive assistant|receptionist|nurse|physician|therapist|pharmacist|driver|warehouse|courier|janitor|custodian|bartender|barista|cashier|chef|cook|mechanic|electrician|plumber|civil engineer|structural engineer|chemical engineer|manufacturing engineer|industrial engineer|mechanical engineer|hvac|facilities|marketing|brand|copywriter|social media|product designer|graphic designer|ux\s+designer|ui\s+designer|video editor|policy|communications|surveillance|countermeasures|operations\s+intern)\b/i;

const TECH_ROLE_RE =
  /\b(?:software|developer|programmer|swe\b|sde\b|front[\s-]?end|back[\s-]?end|full[\s-]?stack|mobile\s+(?:engineer|developer)|ios\s+(?:engineer|developer)|android\s+(?:engineer|developer)|devops|sre\b|site reliability|cloud\s+(?:engineer|developer)|platform\s+engineer|infrastructure\s+engineer|data\s+engineer|data\s+scientist|machine learning|ml\s+engineer|ai\s+engineer|research\s+engineer|analytics\s+engineer|qa\s+engineer|quality assurance|test\s+engineer|sdet|cybersecurity|application security|appsec|security\s+engineer|systems\s+engineer|embedded|firmware|solutions\s+engineer|forward deployed\s+engineer|product\s+engineer|web\s+developer)\b/i;

const EXCESSIVE_YOE_RE =
  /(?:minimum(?:\s+of)?|at\s+least|requires?|\bwith\b|\bmust\s+have\b)\s*(?:3|4|5|6|7|8|9|10|12)\+?\s*(?:years?|yrs?)\b|\b(?:3|4|5|6|7|8|9|10)\+\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|relevant|professional|industry|software|engineering|work)/gi;

function passesZeroToTwoYoeFilter(title, plainText, company) {
  if (!title || !plainText || plainText.length < 180) return { ok: false, reason: 'too-short' };

  const cleanTitle = title.trim();
  if (SENIOR_TITLE_RE.test(cleanTitle)) return { ok: false, reason: 'senior-title' };
  if (NON_ENGINEERING_RE.test(cleanTitle)) return { ok: false, reason: 'non-tech-title' };
  if (!TECH_ROLE_RE.test(cleanTitle)) return { ok: false, reason: 'not-tech-role' };

  const compLower = (company || '').toLowerCase();
  if (/\b(?:staffing|recruiting|talent solutions|tek|revature|infosys|wipro|tata consultancy)\b/i.test(compLower)) {
    return { ok: false, reason: 'staffing-agency' };
  }

  const isExplicitEarlyCareerTitle = /\b(?:intern|internship|co-op|new grad|university grad|graduate|early career|entry[- ]level|junior|jr\.?|associate|apprentice)\b/i.test(
    cleanTitle
  );

  // Check YoE demands in text
  const yoeMatches = [...plainText.matchAll(EXCESSIVE_YOE_RE)];
  if (yoeMatches.length > 0 && !isExplicitEarlyCareerTitle) {
    return { ok: false, reason: `yoe-exceeded (${yoeMatches[0][0].trim()})` };
  }
  // Even for Associate/Junior titles, reject if text asks for 5+ years
  if (isExplicitEarlyCareerTitle && /\b(?:5|6|7|8|9|10)\+\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|software)/i.test(plainText)) {
    return { ok: false, reason: 'yoe-5plus-in-junior' };
  }

  return { ok: true };
}

function classifyExperienceAndYears(title, text) {
  const t = `${title} ${text.slice(0, 600)}`.toLowerCase();
  if (/\b(?:intern|internship|co-op|summer 202\d|fall 202\d|winter 202\d|spring 202\d)\b/i.test(title)) {
    return { experienceLevel: 'Internship', employmentType: 'INTERN', maxYearsExperience: 0 };
  }
  if (/\b(?:new grad|university grad|recent grad|campus|rotational|202\d graduate)\b/i.test(title)) {
    return { experienceLevel: 'New Grad', employmentType: 'FULL_TIME', maxYearsExperience: 1 };
  }
  if (/\b(?:0-2|0\s*to\s*2|1-2|2\+\s*years|2\s*years)\b/i.test(t)) {
    return { experienceLevel: 'Entry Level', employmentType: 'FULL_TIME', maxYearsExperience: 2 };
  }
  if (/\b(?:1\+\s*year|1\s*year|junior|jr\.?|associate|level\s*1|l3|e3|ic1|early career)\b/i.test(t)) {
    return { experienceLevel: 'Entry Level', employmentType: 'FULL_TIME', maxYearsExperience: 1 };
  }
  return { experienceLevel: 'Entry Level', employmentType: 'FULL_TIME', maxYearsExperience: 2 };
}

function classifyCategory(title) {
  const t = title.toLowerCase();
  if (/\b(?:full[\s-]?stack|product engineer)\b/.test(t)) return 'Full Stack';
  if (/\b(?:front[\s-]?end|ui engineer|web engineer|react)\b/.test(t)) return 'Frontend';
  if (/\b(?:back[\s-]?end|api|distributed|systems engineer|storage)\b/.test(t)) return 'Backend';
  if (/\b(?:data|machine learning|ml\b|ai\b|analytics|research engineer|llm)\b/.test(t)) return 'Data / AI';
  if (/\b(?:devops|sre|site reliability|cloud|platform|infrastructure|security|appsec)\b/.test(t)) return 'DevOps / Cloud';
  if (/\b(?:mobile|ios|android|flutter|react native)\b/.test(t)) return 'Mobile';
  if (/\b(?:qa\b|quality|test|sdet|automation engineer)\b/.test(t)) return 'QA / Test';
  return 'Backend';
}

function detectWorkMode(locationStr, rawWorkplaceType, plainText) {
  const loc = (locationStr || '').toLowerCase();
  const wp = (rawWorkplaceType || '').toLowerCase();
  const headText = (plainText || '').slice(0, 700).toLowerCase();

  if (wp === 'hybrid' || /\bhybrid\b/.test(loc) || /\bhybrid\s+(?:role|schedule|work)\b/.test(headText)) {
    return { workMode: 'Hybrid', isRemote: false };
  }
  if (wp === 'remote' || /\bremote\b/.test(loc)) {
    return { workMode: 'Remote', isRemote: true };
  }
  if (wp === 'onsite' || wp === 'on-site' || /\b(?:on-?site|in-?office|in-?person)\b/.test(loc)) {
    return { workMode: 'On-site', isRemote: false };
  }
  return { workMode: 'On-site', isRemote: false };
}

function isUsOrRemoteAllowed(locationStr, isRemote) {
  const loc = (locationStr || '').trim();
  if (!loc) return isRemote;
  const lower = loc.toLowerCase();

  const nonUsCitiesOrCountries =
    /\b(?:india|bengaluru|bangalore|hyderabad|pune|mumbai|chennai|delhi|gurgaon|noida|uk|united kingdom|london|manchester|canada|toronto|vancouver|montreal|waterloo|germany|berlin|munich|france|paris|ireland|dublin|poland|warsaw|krakow|spain|madrid|barcelona|netherlands|amsterdam|australia|sydney|melbourne|singapore|japan|tokyo|china|beijing|shanghai|brazil|sao paulo|mexico|israel|tel aviv|switzerland|zurich|sweden|stockholm|romania|bucharest|czech|prague|portugal|lisbon|taiwan|taipei|korea|seoul)\b/i;

  const explicitUs =
    /\b(?:united states|usa|u\.s\.|us\b|san francisco|new york|nyc|seattle|austin|boston|chicago|los angeles|mountain view|palo alto|menlo park|sunnyvale|santa clara|san jose|redmond|bellevue|denver|atlanta|miami|dallas|houston|washington,?\s*dc|arlington|raleigh|durham|san diego|portland|pittsburgh|philadelphia|phoenix|salt lake|cambridge,\s*ma|,\s*(?:al|ak|az|ar|ca|co|ct|de|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy)\b)\b/i;

  if (explicitUs.test(lower)) return true;
  if (nonUsCitiesOrCountries.test(lower)) return false;
  if (/\b(?:remote|anywhere|worldwide|north america|americas)\b/i.test(lower)) return true;
  return false;
}

function parseLocationParts(locationStr, isRemote) {
  const cleaned = stripUiNoise(locationStr || '', false)
    .replace(/\s*\(hybrid\)|\s*\(remote\)|\s*\(on-?site\)/gi, '')
    .trim();
  if (!cleaned || /^remote$/i.test(cleaned)) {
    return {
      location: 'Remote, US',
      city: undefined,
      state: undefined,
      country: 'US',
      applicantLocationRequirements: 'US',
    };
  }
  const parts = cleaned.split(',').map((s) => s.trim()).filter(Boolean);
  let city = parts[0] || undefined;
  let state = parts[1] || undefined;
  if (state && (/^(?:us|usa|u\.s\.|united states|united states of america|remote|global|worldwide)$/i.test(state) || state.length > 24)) {
    state = undefined;
  }
  return {
    location: cleaned,
    city: isRemote && /^(?:remote|us|usa|united states)$/i.test(city || '') ? undefined : city,
    state,
    country: 'US',
    applicantLocationRequirements: 'US',
  };
}

function extractDisclosedSalary(text, structuredComp) {
  const undisclosed = { min: 0, max: 0, currency: 'USD', unit: 'YEAR', salaryDisclosed: false };

  // 1. Structured Ashby compensation when available
  if (structuredComp?.summaryComponents && Array.isArray(structuredComp.summaryComponents)) {
    for (const comp of structuredComp.summaryComponents) {
      if (comp?.compensationType === 'Salary' && typeof comp.minValue === 'number' && comp.minValue > 0) {
        const unit = comp.interval === 'HOUR' ? 'HOUR' : 'YEAR';
        const min = Math.round(comp.minValue);
        const max = typeof comp.maxValue === 'number' && comp.maxValue >= min ? Math.round(comp.maxValue) : min;
        if (unit === 'YEAR' && min >= 35000 && max <= 800000) {
          return { min, max, currency: comp.currencyCode || 'USD', unit: 'YEAR', salaryDisclosed: true };
        }
        if (unit === 'HOUR' && min >= 15 && max <= 250) {
          return { min, max, currency: comp.currencyCode || 'USD', unit: 'HOUR', salaryDisclosed: true };
        }
      }
    }
  }

  // 2. Explicit annual dollar range in ATS text ($120,000 - $165,000)
  const annualRangeMatch = text.match(
    /\$\s*(\d{2,3}),(\d{3})(?:\.\d{2})?\s*(?:-|–|—|to)\s*\$?\s*(\d{2,3}),(\d{3})(?:\.\d{2})?(?!\s*(?:bonus|sign|equity|stock|rsu|stipend))/i
  );
  if (annualRangeMatch) {
    const min = parseInt(`${annualRangeMatch[1]}${annualRangeMatch[2]}`, 10);
    const max = parseInt(`${annualRangeMatch[3]}${annualRangeMatch[4]}`, 10);
    if (min >= 40000 && max >= min && max <= 600000) {
      return { min, max, currency: 'USD', unit: 'YEAR', salaryDisclosed: true };
    }
  }

  // 3. Explicit hourly range ($35 - $55 / hr)
  const hourlyMatch = text.match(
    /\$\s*(\d{2,3})(?:\.\d{2})?\s*(?:-|–|—|to)\s*\$?\s*(\d{2,3})(?:\.\d{2})?\s*(?:\/|\s*per\s*)(?:hr|hour)\b/i
  );
  if (hourlyMatch) {
    const min = parseInt(hourlyMatch[1], 10);
    const max = parseInt(hourlyMatch[2], 10);
    if (min >= 18 && max >= min && max <= 220) {
      return { min, max, currency: 'USD', unit: 'HOUR', salaryDisclosed: true };
    }
  }

  return undisclosed;
}

function detectWorkAuthorization(plainText, source) {
  const lower = (plainText || '').toLowerCase();
  const usCitizenOnly =
    /\b(?:u\.?s\.?\s+citizens?\s+only|must\s+be\s+a\s+u\.?s\.?\s+citizen|security\s+clearance\s+required|active\s+(?:secret|ts\/sci|top\s+secret)\s+clearance|itar\s+compliant)\b/i.test(
      lower
    );

  const explicitlyRefusesSponsorship =
    /\b(?:unable\s+to\s+sponsor|cannot\s+sponsor|will\s+not\s+sponsor|does\s+not\s+sponsor|no\s+(?:visa\s+)?sponsorship|without\s+(?:the\s+need\s+for\s+)?(?:visa\s+)?sponsorship)\b/i.test(
      lower
    );

  const explicitlySponsors =
    /\b(?:visa\s+sponsorship\s+(?:is\s+)?available|will\s+sponsor|offers?\s+(?:visa\s+)?sponsorship|h-?1b\s+sponsorship|sponsorship\s+available)\b/i.test(
      lower
    );

  const eVerifyText = /\be-?verify\b/i.test(lower);
  const eVerify = Boolean((source.eVerifyKnown || eVerifyText) && !usCitizenOnly);
  const visaSponsorship = Boolean(explicitlySponsors && !explicitlyRefusesSponsorship && !usCitizenOnly);

  return {
    usCitizenOnly,
    eVerify,
    stemOptEVerified: eVerify,
    visaSponsorship,
  };
}

function resolveLogoUrl(website, company) {
  let domain = '';
  if (website) {
    try {
      const u = new URL(website.startsWith('http') ? website : `https://${website}`);
      domain = u.hostname.replace(/^www\./, '');
    } catch {}
  }
  if (domain && domain.includes('.')) {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(company || 'FC')}&background=0F172A&color=fff&size=128&bold=true`;
}

function normalizeUrlForDedupe(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    const keepParams = ['gh_jid', 'jid', 'jobId'];
    const filtered = new URLSearchParams();
    for (const p of keepParams) {
      const val = u.searchParams.get(p);
      if (val) filtered.set(p, val);
    }
    const qs = filtered.toString();
    return `${u.hostname.replace(/^www\./, '').toLowerCase()}${u.pathname.replace(/\/+$/, '').toLowerCase()}${qs ? `?${qs}` : ''}`;
  } catch {
    return String(url).trim().toLowerCase();
  }
}

function makeFingerprint(company, title, location) {
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${norm(company)}|${norm(title)}|${norm(location)}`.slice(0, 140);
}

function addDaysIso(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  if (isNaN(d.getTime())) {
    const fallback = new Date(Date.now() + days * 86400000);
    return fallback.toISOString().split('T')[0];
  }
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

function clampPostedTimestamps(rawDateVal) {
  const now = Date.now();
  let ms = 0;
  if (typeof rawDateVal === 'number') {
    ms = rawDateVal > 1e12 ? rawDateVal : rawDateVal * 1000;
  } else if (typeof rawDateVal === 'string' && rawDateVal.trim()) {
    const parsed = Date.parse(rawDateVal);
    if (!isNaN(parsed)) ms = parsed;
  }
  if (!ms || ms <= 0) ms = now;
  if (ms > now) ms = now; // Never publish future datePosted
  const d = new Date(ms);
  return {
    ms,
    postedAt: d.toISOString(),
    datePosted: d.toISOString().split('T')[0],
  };
}

// ---------------------------------------------------------------------------
// Provider Fetchers (Greenhouse, Ashby, Lever, SmartRecruiters, Workable)
// ---------------------------------------------------------------------------

async function fetchGreenhouseSource(source) {
  const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(source.slug)}/jobs?content=true`;
  const resp = await fetchWithTimeout(apiUrl, { headers: { Accept: 'application/json', 'User-Agent': BROWSER_UA } });
  if (!resp.ok) return { healthy: false, status: resp.status, items: [] };
  const data = await resp.json();
  const rawJobs = Array.isArray(data?.jobs) ? data.jobs : [];
  if (rawJobs.length === 0) return { healthy: false, status: resp.status, items: [] };

  const liveIds = new Set();
  const items = [];
  for (const r of rawJobs) {
    const extId = String(r.id || '');
    if (!extId) continue;
    liveIds.add(extId);
    const ts = clampPostedTimestamps(r.first_published || r.updated_at);
    const metaWorkplace = Array.isArray(r.metadata)
      ? r.metadata.find((m) => /workplace|remote|location type/i.test(m?.name || ''))?.value
      : '';
    items.push({
      externalId: extId,
      atsProvider: 'Greenhouse',
      title: stripUiNoise(r.title || '', true),
      location: stripUiNoise(r.location?.name || '', false),
      workplaceType: String(metaWorkplace || ''),
      rawHtml: r.content ? decodeHtmlEntities(r.content) : '',
      applyUrl: r.absolute_url || `https://job-boards.greenhouse.io/${source.slug}/jobs/${extId}`,
      ...ts,
      compensation: null,
    });
  }
  return { healthy: true, status: resp.status, liveIds, items };
}

async function fetchAshbySource(source) {
  const apiUrl = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(source.slug)}?includeCompensation=true`;
  const resp = await fetchWithTimeout(apiUrl, { headers: { Accept: 'application/json', 'User-Agent': BROWSER_UA } });
  if (!resp.ok) return { healthy: false, status: resp.status, items: [] };
  const data = await resp.json();
  const rawJobs = Array.isArray(data?.jobs) ? data.jobs : [];
  if (rawJobs.length === 0) return { healthy: false, status: resp.status, items: [] };

  const liveIds = new Set();
  const items = [];
  for (const r of rawJobs) {
    const extId = String(r.id || '');
    if (!extId) continue;
    liveIds.add(extId);
    if (r.isListed === false) continue;
    const ts = clampPostedTimestamps(r.publishedAt);
    const loc = r.isRemote && (!r.location || /remote/i.test(r.location)) ? `Remote (${r.location || 'US'})` : r.location || '';
    items.push({
      externalId: extId,
      atsProvider: 'Ashby',
      title: stripUiNoise(r.title || '', true),
      location: stripUiNoise(loc, false),
      workplaceType: r.workplaceType || (r.isRemote ? 'Remote' : ''),
      rawHtml: r.descriptionHtml || r.descriptionPlain || '',
      applyUrl: r.jobUrl || `https://jobs.ashbyhq.com/${source.slug}/${extId}`,
      ...ts,
      compensation: r.compensation || null,
    });
  }
  return { healthy: true, status: resp.status, liveIds, items };
}

async function fetchLeverSource(source) {
  const apiUrl = `https://api.lever.co/v0/postings/${encodeURIComponent(source.slug)}?mode=json`;
  const resp = await fetchWithTimeout(apiUrl, { headers: { Accept: 'application/json', 'User-Agent': BROWSER_UA } });
  if (!resp.ok) return { healthy: false, status: resp.status, items: [] };
  const rawJobs = await resp.json();
  if (!Array.isArray(rawJobs) || rawJobs.length === 0) return { healthy: false, status: resp.status, items: [] };

  const liveIds = new Set();
  const items = [];
  for (const r of rawJobs) {
    const extId = String(r.id || '');
    if (!extId) continue;
    liveIds.add(extId);
    const ts = clampPostedTimestamps(r.createdAt);
    let combined = r.description || r.descriptionPlain || '';
    if (Array.isArray(r.lists)) {
      for (const list of r.lists) {
        if (list?.text && list?.content) {
          combined += `<h3>${list.text}</h3><ul>${list.content}</ul>`;
        }
      }
    }
    if (r.additional) combined += r.additional;

    items.push({
      externalId: extId,
      atsProvider: 'Lever',
      title: stripUiNoise(r.text || '', true),
      location: stripUiNoise(r.categories?.location || '', false),
      workplaceType: r.workplaceType || '',
      rawHtml: combined,
      applyUrl: r.hostedUrl || `https://jobs.lever.co/${source.slug}/${extId}`,
      ...ts,
      compensation: null,
    });
  }
  return { healthy: true, status: resp.status, liveIds, items };
}

async function fetchSmartRecruitersSource(source) {
  const listUrl = `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(source.slug)}/postings?limit=100`;
  const resp = await fetchWithTimeout(listUrl, { headers: { Accept: 'application/json', 'User-Agent': BROWSER_UA } });
  if (!resp.ok) return { healthy: false, status: resp.status, items: [] };
  const data = await resp.json();
  const content = Array.isArray(data?.content) ? data.content : [];
  if (content.length === 0) return { healthy: false, status: resp.status, items: [] };

  const liveIds = new Set();
  const candidates = [];
  for (const r of content) {
    const extId = String(r.id || '');
    if (!extId) continue;
    liveIds.add(extId);

    const title = stripUiNoise(r.name || '', true);
    if (!title || SENIOR_TITLE_RE.test(title) || NON_ENGINEERING_RE.test(title) || !TECH_ROLE_RE.test(title)) {
      continue;
    }
    const locCountry = (r.location?.country || '').toUpperCase();
    if (locCountry && locCountry !== 'US' && !r.location?.remote) continue;

    const city = r.location?.city || '';
    const region = r.location?.region || locCountry;
    const loc = r.location?.remote
      ? `Remote${city ? ` (${city})` : ', US'}`
      : [city, region].filter(Boolean).join(', ') || 'United States';

    candidates.push({
      extId,
      title,
      loc,
      isRemote: Boolean(r.location?.remote),
      releasedDate: r.releasedDate,
      refUrl: `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(source.slug)}/postings/${encodeURIComponent(extId)}`,
      applyUrl: `https://jobs.smartrecruiters.com/${encodeURIComponent(source.slug)}/${encodeURIComponent(extId)}`,
    });
  }

  // Lazy-fetch full jobAd detail for up to 5 early-career candidates per run
  const items = [];
  for (const c of candidates.slice(0, 5)) {
    try {
      const detResp = await fetchWithTimeout(c.refUrl, { headers: { Accept: 'application/json', 'User-Agent': BROWSER_UA } }, 6000);
      if (!detResp.ok) continue;
      const det = await detResp.json();
      const sections = det?.jobAd?.sections || {};
      const parts = [];
      for (const key of ['companyDescription', 'jobDescription', 'qualifications', 'additionalInformation']) {
        if (sections[key]?.text) {
          if (sections[key].title) parts.push(`<h3>${sections[key].title}</h3>`);
          parts.push(sections[key].text);
        }
      }
      const ts = clampPostedTimestamps(det.releasedDate || c.releasedDate);
      items.push({
        externalId: c.extId,
        atsProvider: 'SmartRecruiters',
        title: c.title,
        location: c.loc,
        workplaceType: c.isRemote ? 'Remote' : '',
        rawHtml: parts.join('\n'),
        applyUrl: det.postingUrl || c.applyUrl,
        ...ts,
        compensation: null,
      });
    } catch {
      // ignore single detail timeout
    }
  }

  return { healthy: true, status: resp.status, liveIds, items };
}

async function fetchWorkableSource(source) {
  const apiUrl = `https://apply.workable.com/api/v3/accounts/${encodeURIComponent(source.slug)}/jobs`;
  const resp = await fetchWithTimeout(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': BROWSER_UA },
    body: JSON.stringify({ query: '', location: [], department: [], worktype: [], remote: [] }),
  });
  if (!resp.ok) return { healthy: false, status: resp.status, items: [] };
  const data = await resp.json();
  const rawJobs = Array.isArray(data?.results) ? data.results : [];
  if (rawJobs.length === 0) return { healthy: false, status: resp.status, items: [] };

  const liveIds = new Set();
  const candidates = [];
  for (const r of rawJobs) {
    const extId = String(r.shortcode || r.id || '');
    if (!extId) continue;
    liveIds.add(extId);
    const title = stripUiNoise(r.title || '', true);
    if (!title || SENIOR_TITLE_RE.test(title) || NON_ENGINEERING_RE.test(title) || !TECH_ROLE_RE.test(title)) {
      continue;
    }
    const locCountry = (r.location?.countryCode || '').toUpperCase();
    if (locCountry && locCountry !== 'US' && !r.remote) continue;

    const city = r.location?.city || '';
    const region = r.location?.region || r.location?.country || '';
    const loc = r.remote ? 'Remote, US' : [city, region].filter(Boolean).join(', ') || 'Remote, US';
    candidates.push({
      extId,
      title,
      loc,
      isRemote: Boolean(r.remote),
      workplace: r.workplace || '',
      published: r.published,
    });
  }

  const items = [];
  for (const c of candidates.slice(0, 5)) {
    try {
      const detUrl = `https://apply.workable.com/api/v3/accounts/${encodeURIComponent(source.slug)}/jobs/${encodeURIComponent(c.extId)}`;
      const detResp = await fetchWithTimeout(detUrl, { headers: { Accept: 'application/json', 'User-Agent': BROWSER_UA } }, 6000);
      if (!detResp.ok) continue;
      const det = await detResp.json();
      const parts = [
        det.description || '',
        det.requirements ? `<h3>Requirements</h3>${det.requirements}` : '',
        det.benefits ? `<h3>Benefits</h3>${det.benefits}` : '',
      ].filter(Boolean);
      const ts = clampPostedTimestamps(det.published || c.published);
      items.push({
        externalId: c.extId,
        atsProvider: 'Workable',
        title: c.title,
        location: c.loc,
        workplaceType: c.workplace || (c.isRemote ? 'Remote' : ''),
        rawHtml: parts.join('\n'),
        applyUrl: `https://apply.workable.com/${encodeURIComponent(source.slug)}/j/${encodeURIComponent(c.extId)}/`,
        ...ts,
        compensation: null,
      });
    } catch {
      // ignore single detail timeout
    }
  }

  return { healthy: true, status: resp.status, liveIds, items };
}

async function fetchSourceBoard(source) {
  try {
    if (source.provider === 'greenhouse') return await fetchGreenhouseSource(source);
    if (source.provider === 'ashby') return await fetchAshbySource(source);
    if (source.provider === 'lever') return await fetchLeverSource(source);
    if (source.provider === 'smartrecruiters') return await fetchSmartRecruitersSource(source);
    if (source.provider === 'workable') return await fetchWorkableSource(source);
    return { healthy: false, status: 0, items: [] };
  } catch (err) {
    return { healthy: false, status: 0, error: err?.message || 'fetch error', items: [] };
  }
}

// ---------------------------------------------------------------------------
// Job Record Builder
// ---------------------------------------------------------------------------

function buildNormalizedJob(source, raw) {
  const sanitizedHtml = sanitizeAtsHtml(raw.rawHtml);
  const plainText = htmlToReadableText(sanitizedHtml);

  const ageDays = (Date.now() - raw.ms) / 86400000;
  if (ageDays > MAX_AGE_DAYS) {
    return { ok: false, reason: 'too-old' };
  }

  const filterRes = passesZeroToTwoYoeFilter(raw.title, plainText, source.company);
  if (!filterRes.ok) {
    return filterRes;
  }

  const { workMode, isRemote } = detectWorkMode(raw.location, raw.workplaceType, plainText);
  if (!isUsOrRemoteAllowed(raw.location, isRemote)) {
    return { ok: false, reason: 'non-us-location' };
  }

  const locParts = parseLocationParts(raw.location, isRemote);
  const exp = classifyExperienceAndYears(raw.title, plainText);
  const category = classifyCategory(raw.title);
  const salary = extractDisclosedSalary(plainText, raw.compensation);

  // Guard against unlabelled Senior/L5+ roles revealed only by top-of-band senior base salary (>= $205k)
  const isExplicitEarlyTitle = /\b(?:intern|internship|new grad|university grad|early career|junior|entry[- ]level|associate)\b/i.test(
    raw.title
  );
  if (salary.salaryDisclosed && salary.unit === 'YEAR' && salary.min >= 205000 && !isExplicitEarlyTitle) {
    return { ok: false, reason: 'senior-salary-band' };
  }

  const auth = detectWorkAuthorization(plainText, source);
  const { responsibilities, qualifications } = extractSections(plainText, sanitizedHtml);
  const skills = extractSkills(raw.title, plainText);

  const safeExternalId = String(raw.externalId).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48);
  const docId = `sync-${source.provider}-${source.slug}-${safeExternalId}`.toLowerCase().slice(0, 110);
  const todayIso = new Date().toISOString().split('T')[0];

  // Valid through: 45 days after employer publish date, always at least 21 days from today while live
  const baseValid = addDaysIso(raw.datePosted, 45);
  const minValid = addDaysIso(todayIso, 21);
  const validThrough = baseValid > minValid ? baseValid : minValid;

  const job = {
    id: docId,
    externalId: String(raw.externalId),
    syncSourceId: source.id,
    title: raw.title,
    company: source.company,
    companyLogo: resolveLogoUrl(source.website, source.company),
    companyWebsite: source.website,
    location: locParts.location,
    isRemote,
    workMode,
    applicantLocationRequirements: locParts.applicantLocationRequirements,
    ...(locParts.city ? { city: locParts.city } : {}),
    ...(locParts.state ? { state: locParts.state } : {}),
    country: locParts.country,
    experienceLevel: exp.experienceLevel,
    maxYearsExperience: exp.maxYearsExperience,
    category,
    employmentType: exp.employmentType,
    salary: {
      min: salary.min,
      max: salary.max,
      currency: salary.currency,
      unit: salary.unit,
    },
    salaryDisclosed: salary.salaryDisclosed,
    description: plainText.slice(0, 12000),
    descriptionHtml: sanitizedHtml.slice(0, 24000),
    responsibilities,
    qualifications,
    skills,
    applyUrl: raw.applyUrl,
    sourceUrl: raw.applyUrl,
    datePosted: raw.datePosted,
    postedAt: raw.postedAt,
    validThrough,
    source: 'AUTOMATED_SYNC',
    atsProvider: raw.atsProvider,
    atsVerified: true,
    status: 'ACTIVE',
    fingerprint: makeFingerprint(source.company, raw.title, locParts.location),
    viewsCount: 0,
    stemOptEVerified: auth.stemOptEVerified,
    eVerify: auth.eVerify,
    visaSponsorship: auth.visaSponsorship,
    usCitizenOnly: auth.usCitizenOnly,
    healthStatus: 'HEALTHY',
    lastHealthCheckedAt: new Date().toISOString(),
  };

  return { ok: true, job };
}

// ---------------------------------------------------------------------------
// Concurrency Runner & Main Pipeline
// ---------------------------------------------------------------------------

async function runPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

async function main() {
  const sourcesPath = path.join(__dirname, 'ats-sources.json');
  const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));

  console.log(
    `[Sync] Starting ATS sync across ${sources.length} curated boards (DRY_RUN=${DRY_RUN}, MAX_NEW=${MAX_NEW_JOBS_PER_RUN}, MAX_PER_COMPANY=${MAX_PER_COMPANY})...`
  );

  // 1. Load existing Firestore records and strictly protect Part 1 (manual/employer) jobs
  const existingDocs = await loadExistingFirestoreJobs();
  const manualDocs = [];
  const autoDocs = [];

  const existingIds = new Set();
  const existingFingerprints = new Set();
  const existingApplyUrls = new Set();

  for (const doc of existingDocs) {
    existingIds.add(doc.id);
    if (doc.fingerprint) existingFingerprints.add(doc.fingerprint.toLowerCase());
    if (doc.company && doc.title && doc.location) {
      existingFingerprints.add(makeFingerprint(doc.company, doc.title, doc.location));
    }
    if (doc.applyUrl) existingApplyUrls.add(normalizeUrlForDedupe(doc.applyUrl));

    const isAuto = doc.source === 'AUTOMATED_SYNC' || String(doc.id || '').startsWith('sync-');
    if (isAuto) {
      autoDocs.push(doc);
    } else {
      manualDocs.push(doc);
    }
  }

  console.log(
    `[Sync] Existing Firestore inventory: ${existingDocs.length} total (${manualDocs.length} protected manual/employer, ${autoDocs.length} auto-synced).`
  );

  // 2. Fetch all curated ATS boards politely in parallel batches
  const boardResults = await runPool(sources, CONCURRENCY, async (source) => {
    const res = await fetchSourceBoard(source);
    return { source, ...res };
  });

  const healthyBoards = new Map();
  const failedBoards = [];
  const candidateBuckets = []; // per-company buckets for round-robin diversity
  let totalRawInspected = 0;
  let totalPassedFilter = 0;
  let totalManualCollisionsSkipped = 0;
  let totalExistingAutoSkipped = 0;

  for (const br of boardResults) {
    const { source, healthy, status, liveIds, items } = br;
    if (!healthy) {
      failedBoards.push(`${source.company} (${source.provider}:${source.slug} -> HTTP ${status})`);
      continue;
    }

    healthyBoards.set(source.id, liveIds);
    totalRawInspected += liveIds.size;

    const companyNewCandidates = [];
    for (const rawItem of items) {
      const built = buildNormalizedJob(source, rawItem);
      if (!built.ok) continue;

      totalPassedFilter++;
      const job = built.job;

      // Strict deduplication against ALL existing records (Part 1 manual + existing auto)
      const normUrl = normalizeUrlForDedupe(job.applyUrl);
      if (existingIds.has(job.id)) {
        totalExistingAutoSkipped++;
        continue;
      }
      if (existingFingerprints.has(job.fingerprint) || (normUrl && existingApplyUrls.has(normUrl))) {
        totalManualCollisionsSkipped++;
        continue;
      }

      companyNewCandidates.push(job);
    }

    // Sort this company's new jobs newest-first and cap per company
    if (companyNewCandidates.length > 0) {
      companyNewCandidates.sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));
      candidateBuckets.push({
        company: source.company,
        jobs: companyNewCandidates.slice(0, MAX_PER_COMPANY),
      });
    }
  }

  // 3. Round-robin interleave across companies so no single employer floods Page 1
  const selectedNewJobs = [];
  let round = 0;
  while (selectedNewJobs.length < MAX_NEW_JOBS_PER_RUN) {
    let addedInRound = false;
    for (const bucket of candidateBuckets) {
      if (round < bucket.jobs.length && selectedNewJobs.length < MAX_NEW_JOBS_PER_RUN) {
        const candidate = bucket.jobs[round];
        const normUrl = normalizeUrlForDedupe(candidate.applyUrl);
        // Guard intra-run collisions too
        if (!existingIds.has(candidate.id) && !existingFingerprints.has(candidate.fingerprint) && !existingApplyUrls.has(normUrl)) {
          existingIds.add(candidate.id);
          existingFingerprints.add(candidate.fingerprint);
          existingApplyUrls.add(normUrl);
          selectedNewJobs.push(candidate);
          addedInRound = true;
        }
      }
    }
    if (!addedInRound) break;
    round++;
  }

  // 4. Healthy-Board-Only Expiration Check (NEVER expire manual jobs or failed-fetch boards!)
  const yesterdayIso = addDaysIso(new Date().toISOString().split('T')[0], -1);
  const expiredToUpdate = [];

  for (const autoDoc of autoDocs) {
    if (autoDoc.status === 'EXPIRED' || autoDoc.status === 'DRAFT') continue;
    const boardId = autoDoc.syncSourceId;
    if (!boardId || !healthyBoards.has(boardId)) {
      // Board did not return healthy 200 OK full payload -> NEVER false-expire!
      continue;
    }
    const liveIds = healthyBoards.get(boardId);
    const extId = String(autoDoc.externalId || '');
    if (extId && !liveIds.has(extId)) {
      expiredToUpdate.push({
        ...autoDoc,
        status: 'EXPIRED',
        validThrough: yesterdayIso,
        healthStatus: 'DEAD_LINK',
        lastHealthCheckedAt: new Date().toISOString(),
      });
    }
  }

  console.log('\n--- ATS Sync Summary ---');
  console.log(`Healthy ATS Boards     : ${healthyBoards.size}/${sources.length}`);
  if (failedBoards.length > 0) {
    console.log(`Unavailable/Empty      : ${failedBoards.slice(0, 12).join(', ')}${failedBoards.length > 12 ? ` (+${failedBoards.length - 12} more)` : ''}`);
  }
  console.log(`Total Live Postings    : ${totalRawInspected}`);
  console.log(`0-2 YoE Tech Qualified : ${totalPassedFilter}`);
  console.log(`Already Synced Skipped : ${totalExistingAutoSkipped}`);
  console.log(`Deduped vs Existing    : ${totalManualCollisionsSkipped}`);
  console.log(`Queued New Jobs        : ${selectedNewJobs.length} (Round-robin across ${candidateBuckets.length} companies)`);
  console.log(`Verified Expirations   : ${expiredToUpdate.length} (Healthy-board-only, 0 manual jobs touched)`);

  if (selectedNewJobs.length > 0) {
    console.log('\nSample Queued Openings:');
    for (const j of selectedNewJobs.slice(0, 10)) {
      const sal = j.salaryDisclosed ? `$${j.salary.min.toLocaleString()}-${j.salary.max.toLocaleString()}/${j.salary.unit}` : 'Undisclosed';
      console.log(`  • [${j.atsProvider}] ${j.company} — ${j.title} | ${j.location} (${j.workMode}) | ${j.datePosted} | ${sal}`);
    }
  }

  if (DRY_RUN) {
    console.log('\n[DRY_RUN=true] No Firestore writes performed.');
    return;
  }

  // 5. Commit live writes to Firestore
  let writtenNew = 0;
  const updatedUrls = [];
  for (const job of selectedNewJobs) {
    try {
      await writeFirestoreJob(job);
      writtenNew++;
      updatedUrls.push(canonicalJobUrl(job.id));
    } catch (err) {
      console.error(`[Sync] Failed to write new job ${job.id}:`, err.message);
    }
  }

  let writtenExpired = 0;
  const deletedUrls = [];
  for (const expJob of expiredToUpdate) {
    try {
      await writeFirestoreJob(expJob);
      writtenExpired++;
      deletedUrls.push(canonicalJobUrl(expJob.id));
    } catch (err) {
      console.error(`[Sync] Failed to mark expired job ${expJob.id}:`, err.message);
    }
  }

  if (updatedUrls.length > 0 || deletedUrls.length > 0) {
    appendIndexingQueue({ updatedUrls, deletedUrls });
  }

  console.log(`\n[Sync] Completed live writes: +${writtenNew} added, ${writtenExpired} marked EXPIRED.`);
}

main().catch((err) => {
  console.error('[Sync] Fatal error:', err);
  process.exit(1);
});
