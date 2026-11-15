import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function parseFirestoreVal(v) {
  if (!v) return undefined;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return parseInt(v.integerValue, 10);
  if ('doubleValue' in v) return parseFloat(v.doubleValue);
  if ('arrayValue' in v) {
    const vals = v.arrayValue.values || [];
    return vals.map(parseFirestoreVal);
  }
  if ('mapValue' in v) {
    const fields = v.mapValue.fields || {};
    const obj = {};
    for (const k in fields) {
      obj[k] = parseFirestoreVal(fields[k]);
    }
    return obj;
  }
  return undefined;
}

const MATERIAL_ICON_RE = /\b(?:star_rate|location_on|schedule|business_center|find_in_page|bookmark_border|bookmark_added|work_outline|open_in_new|arrow_forward|arrow_back|check_circle|check_circle_outline|verified_user|content_copy|attach_money|apartment|public|calendar_today|trending_up|info_outline|help_outline|flag_outlined)\b/gi;

function decodeEntities(str) {
  if (!str) return '';
  let s = String(str);
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
    '&ndash;': '–',
    '&mdash;': '—',
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&ldquo;': '"',
    '&rdquo;': '"',
  };
  for (let i = 0; i < 2; i++) {
    for (const [k, v] of Object.entries(map)) {
      if (s.includes(k)) s = s.split(k).join(v);
    }
    s = s
      .replace(/&#(\d+);/g, (_, d) => {
        const c = parseInt(d, 10);
        return !isNaN(c) && c > 0 && c < 0x10ffff ? String.fromCodePoint(c) : '';
      })
      .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => {
        const c = parseInt(h, 16);
        return !isNaN(c) && c > 0 && c < 0x10ffff ? String.fromCodePoint(c) : '';
      });
  }
  return s;
}

function stripUiNoise(input, isTitle = false) {
  if (!input) return '';
  let text = decodeEntities(input).replace(MATERIAL_ICON_RE, ' ');
  text = text
    .replace(/\bshare\s+Share\b/gi, ' ')
    .replace(/\bSave\s+Job\b/gi, ' ')
    .replace(/\bUnsave\s+Job\b/gi, ' ')
    .replace(/\b1:1\s+JD\s+Ready\b/gi, ' ')
    .replace(/\bGoogle\s+for\s+Jobs\s+Indexed\b/gi, ' ');

  if (isTitle) {
    text = text
      .replace(/^(?:New|Hot|Featured|Urgent)\s*[•|\-:]\s*/i, '')
      .replace(/^(?:New)\s+(?=[A-Z])/g, '')
      .replace(/\s+(?:New|Save Job|Share)$/i, '')
      .replace(/\s*\|\s*FreshCommits.*$/i, '');
  } else {
    text = text.replace(/^\s*(?:New|star_rate)\s+(?=[A-Z])/gm, '');
  }
  return text.replace(/[ \t]{2,}/g, ' ').trim();
}

function stripSyntheticWrappers(input) {
  if (!input) return '';
  let text = String(input);

  if (text.includes('🏢 Role Overview:')) {
    const afterOverview = text.split('🏢 Role Overview:').slice(1).join('\n').trim();
    if (afterOverview.length > 25) {
      text = afterOverview;
    }
  }

  text = text.replace(
    /🎯\s*The FreshCommits (?:Career|Editorial) Take:[\s\S]*?(?=💡\s*Candidate Preparation Checklist:|🏢\s*Role Overview:|$)/gi,
    ''
  );
  text = text.replace(
    /💡\s*Candidate Preparation Checklist:[\s\S]*?(?=\n\s*\n\s*(?![•\-\*])|$)/gi,
    ''
  );
  text = text.replace(
    /(?:^|\n)\s*(?:🎯\s*)?(?:Round\s*1\s*Interview\s*Drill(?:\s*&\s*Winning\s*Formula)?|FreshCommits\s*Tech[\s-]Stack\s*Matrix|Estimated\s*(?:Housing|Relocation)\s*Stipend\s*Perks)\b[\s\S]*?(?=\n\s*\n\s*[A-Z]|$)/gi,
    ''
  );

  return text.replace(/\n{3,}/g, '\n\n').trim();
}

function sanitizeJobRecord(jobObj) {
  if (!jobObj) return jobObj;
  jobObj.title = stripUiNoise(jobObj.title || '', true) || jobObj.title;
  jobObj.location = stripUiNoise(jobObj.location || '', false) || jobObj.location;
  if (jobObj.description) {
    jobObj.description = stripUiNoise(stripSyntheticWrappers(jobObj.description), false);
  }

  // Clean dead Clearbit URLs and ensure crisp favicon or avatar
  let logo = jobObj.companyLogo || '';
  if (!logo || logo.includes('logo.clearbit.com')) {
    let domain = '';
    if (jobObj.companyWebsite) {
      try {
        const u = new URL(jobObj.companyWebsite.startsWith('http') ? jobObj.companyWebsite : `https://${jobObj.companyWebsite}`);
        domain = u.hostname.replace(/^www\./, '');
      } catch {}
    }
    if (!domain && logo && logo.includes('logo.clearbit.com/')) {
      const parts = logo.split('logo.clearbit.com/');
      if (parts[1]) domain = parts[1].replace(/[^a-zA-Z0-9.-]/g, '');
    }
    if (!domain && jobObj.applyUrl) {
      try {
        const u = new URL(jobObj.applyUrl);
        const parts = u.hostname.replace(/^www\./, '').split('.');
        if (parts.length >= 2) domain = parts.slice(-2).join('.');
      } catch {}
    }
    if (domain && domain.includes('.')) {
      jobObj.companyLogo = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
    } else {
      jobObj.companyLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(jobObj.company || 'FC')}&background=0F172A&color=fff&size=128&bold=true`;
    }
  }

  jobObj.isRemote = Boolean(jobObj.isRemote || (jobObj.location && jobObj.location.toLowerCase().includes('remote')));

  if (Array.isArray(jobObj.responsibilities)) {
    jobObj.responsibilities = jobObj.responsibilities
      .map((r) => stripUiNoise(String(r || ''), false).replace(/^[•\-\*–—\d\.\)]\s*/, '').trim())
      .filter((r) => r.length > 5 && !/[{}<>]/.test(r) && !r.includes('.css-') && !r.includes('@media') && !r.includes('!important') && !r.toLowerCase().startsWith('apply now'));
  }
  if (Array.isArray(jobObj.qualifications)) {
    jobObj.qualifications = jobObj.qualifications
      .map((q) => stripUiNoise(String(q || ''), false).replace(/^[•\-\*–—\d\.\)]\s*/, '').trim())
      .filter((q) => q.length > 5 && !/[{}<>]/.test(q) && !q.includes('.css-') && !q.includes('@media') && !q.includes('!important'));
  }

  return jobObj;
}

function getJobTimestamp(job) {
  if (!job) return 0;
  if (job.postedAt) {
    const postedTime = Date.parse(job.postedAt);
    if (!isNaN(postedTime) && postedTime > 1600000000000) {
      return postedTime;
    }
  }
  const idMatch = job.id?.match(/\b(\d{10,13})\b/);
  const idTime = idMatch ? Number(idMatch[1]) : 0;
  const hasValidIdTime = !isNaN(idTime) && idTime > 1600000000000;
  if (job.datePosted) {
    const dateParts = String(job.datePosted).trim().split(/[-/]/);
    let dateTime = 0;
    if (dateParts.length === 3) {
      dateTime = Date.UTC(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
    } else {
      dateTime = new Date(job.datePosted).getTime();
    }
    if (!isNaN(dateTime) && dateTime > 0) {
      if (hasValidIdTime && idTime >= dateTime - 86400000 * 2) return idTime;
      return dateTime + (hasValidIdTime ? (idTime % 86400000) : 0);
    }
  }
  if (hasValidIdTime) return idTime;
  return 0;
}

function generateSitemap(cloudJobs) {
  const today = new Date().toISOString().split('T')[0];
  const staticRoutes = [
    { loc: 'https://www.freshcommits.com/', priority: '1.0', changefreq: 'daily' },
    { loc: 'https://www.freshcommits.com/jobs', priority: '0.95', changefreq: 'daily' },
    { loc: 'https://www.freshcommits.com/salary-guide', priority: '0.95', changefreq: 'weekly' },
    { loc: 'https://www.freshcommits.com/project-blueprints', priority: '0.95', changefreq: 'weekly' },
    { loc: 'https://www.freshcommits.com/career-tools', priority: '0.95', changefreq: 'weekly' },
    { loc: 'https://www.freshcommits.com/tools', priority: '0.90', changefreq: 'weekly' },
    { loc: 'https://www.freshcommits.com/insights', priority: '0.95', changefreq: 'weekly' },
    { loc: 'https://www.freshcommits.com/about/', priority: '0.80', changefreq: 'monthly' },
    { loc: 'https://www.freshcommits.com/contact/', priority: '0.80', changefreq: 'monthly' },
    { loc: 'https://www.freshcommits.com/privacy/', priority: '0.80', changefreq: 'monthly' },
    { loc: 'https://www.freshcommits.com/privacy-policy/', priority: '0.80', changefreq: 'monthly' },
    { loc: 'https://www.freshcommits.com/terms/', priority: '0.80', changefreq: 'monthly' },
    { loc: 'https://www.freshcommits.com/disclaimer/', priority: '0.60', changefreq: 'monthly' }
  ];

  const articlesDir = path.join(rootDir, 'src', 'data', 'articles');
  const articleFiles = [
    path.join(rootDir, 'src', 'data', 'careerArticles.ts'),
    ...(fs.existsSync(articlesDir)
      ? fs.readdirSync(articlesDir).filter((f) => f.endsWith('.ts')).map((f) => path.join(articlesDir, f))
      : [])
  ];
  const allArticleIds = [];
  for (const f of articleFiles) {
    if (fs.existsSync(f)) {
      const content = fs.readFileSync(f, 'utf8');
      const matches = [...content.matchAll(/id:\s*'([a-z0-9-]+)'/g)]
        .map((m) => m[1])
        .filter((id) => !id.startsWith('doc-40'));
      allArticleIds.push(...matches);
    }
  }
  const uniqueArticleIds = Array.from(new Set(allArticleIds));

  let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemapXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  sitemapXml += '  <!-- Core Application & Index Hubs -->\n';

  for (const r of staticRoutes) {
    sitemapXml += `  <url>\n    <loc>${r.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>\n`;
  }

  sitemapXml += '\n  <!-- Editorial Career Insights Guides -->\n';
  for (const artId of uniqueArticleIds) {
    sitemapXml += `  <url>\n    <loc>https://www.freshcommits.com/insights/${artId}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
  }

  sitemapXml += '\n  <!-- Verified Job Postings (Google Search & Google for Jobs Direct Indexing) -->\n';
  for (const job of cloudJobs) {
    if (!job || !job.id || job.status === 'DRAFT' || job.status === 'EXPIRED') continue;
    const jobDate = job.datePosted || today;
    sitemapXml += `  <url>\n    <loc>https://www.freshcommits.com/job/${job.id}</loc>\n    <lastmod>${jobDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.95</priority>\n  </url>\n`;
  }

  sitemapXml += '</urlset>\n';

  const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
  console.log(`Generated public/sitemap.xml with ${staticRoutes.length + uniqueArticleIds.length + cloudJobs.length} URLs!`);
}

async function pullFirestoreJobs() {
  console.log('Fetching all live jobs from Firestore database...');
  const publicDataDir = path.join(rootDir, 'public', 'data');
  const publicJobsJsonPath = path.join(publicDataDir, 'jobs.json');
  const initialJobsPath = path.join(rootDir, 'src', 'data', 'initialJobs.ts');
  fs.mkdirSync(publicDataDir, { recursive: true });

  let res;
  try {
    res = await fetch(
      'https://firestore.googleapis.com/v1/projects/centered-module-9smzh/databases/ai-studio-juniordevhubentr-9fce9c23-e540-412e-ae3f-aca1eaf015f5/documents:runQuery',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'jobs' }],
          },
        }),
      }
    );
  } catch (err) {
    res = { ok: false, status: 0, statusText: err?.message || 'Network error' };
  }

  if (!res.ok) {
    if (fs.existsSync(publicJobsJsonPath)) {
      console.warn(`Firestore query returned ${res.status} ${res.statusText}. Retaining existing public/data/jobs.json and proceeding with build...`);
      try {
        const existingJobs = JSON.parse(fs.readFileSync(publicJobsJsonPath, 'utf8'));
        if (Array.isArray(existingJobs)) {
          generateSitemap(existingJobs);
        }
      } catch {}
      return;
    }
    throw new Error(`Failed to query Firestore: ${res.status} ${res.statusText}`);
  }

  const queryResults = await res.json();
  const cloudJobs = [];

  for (const item of queryResults) {
    if (!item.document || !item.document.fields) continue;
    const doc = item.document;
    const fields = doc.fields;
    const jobObj = {};
    for (const f in fields) {
      jobObj[f] = parseFirestoreVal(fields[f]);
    }
    const docId = doc.name.split('/').pop();
    jobObj.id = jobObj.id || docId;

    sanitizeJobRecord(jobObj);

    if (jobObj.title && jobObj.company && jobObj.applyUrl) {
      cloudJobs.push(jobObj);
    }
  }

  console.log(`Successfully fetched and sanitized ${cloudJobs.length} valid jobs from Firestore!`);

  cloudJobs.sort((a, b) => {
    const timeA = getJobTimestamp(a);
    const timeB = getJobTimestamp(b);
    if (timeB !== timeA) return timeB - timeA;
    return String(b.id || '').localeCompare(String(a.id || ''));
  });

  // 1. Write static JSON payload to public/data/jobs.json (keeps main JS bundle tiny)
  fs.writeFileSync(publicJobsJsonPath, JSON.stringify(cloudJobs, null, 2), 'utf8');
  console.log(`Updated public/data/jobs.json with ${cloudJobs.length} jobs.`);

  // 2. Keep lightweight export stub in src/data/initialJobs.ts
  const stubContent = `import { JobPosting } from '../types';\n\nexport const INITIAL_JOBS: JobPosting[] = [];\n`;
  fs.writeFileSync(initialJobsPath, stubContent, 'utf8');

  // 3. Keep index.html lean (SYNCHRONOUS_JOBS = {};)
  const indexHtmlPath = path.join(rootDir, 'index.html');
  let html = fs.readFileSync(indexHtmlPath, 'utf8');
  const regex = /var SYNCHRONOUS_JOBS\s*=\s*\{[\s\S]*?\};/;
  if (regex.test(html)) {
    html = html.replace(regex, 'var SYNCHRONOUS_JOBS = {};');
    fs.writeFileSync(indexHtmlPath, html, 'utf8');
    console.log('Kept index.html slim (SYNCHRONOUS_JOBS = {}).');
  }

  // 4. Generate public/sitemap.xml
  generateSitemap(cloudJobs);
}

pullFirestoreJobs().catch((err) => {
  console.error('Error pulling Firestore jobs:', err);
  process.exit(1);
});
