import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const JOBS_JSON_PATH = path.join(ROOT_DIR, 'public', 'data', 'jobs.json');
const COMMUNITY_DIR = path.join(ROOT_DIR, 'community');

function escapeMdCell(str) {
  return String(str || '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function formatSalary(job) {
  if (job.salaryDisclosed === false || !job.salary || !job.salary.min || job.salary.min <= 0) {
    return '—';
  }
  const min = Number(job.salary.min);
  const max = job.salary.max && job.salary.max >= min ? Number(job.salary.max) : min;
  const unit = job.salary.unit === 'HOUR' && min < 1000 ? 'hr' : 'yr';

  if (unit === 'hr') {
    return min === max ? `$${min}/hr` : `$${min}–$${max}/hr`;
  }
  const fmtK = (v) => `$${Math.round(v / 1000)}k`;
  return min === max ? `${fmtK(min)}/yr` : `${fmtK(min)}–${fmtK(max)}/yr`;
}

function isInternshipJob(job) {
  const title = String(job.title || '').toLowerCase();
  return (
    job.experienceLevel === 'Internship' ||
    job.employmentType === 'INTERN' ||
    /\b(?:intern|internship|co-op|coop|student worker)\b/i.test(title)
  );
}

function formatLocationShort(job) {
  if (job.isRemote || String(job.workMode || '').toLowerCase() === 'remote') {
    const loc = String(job.location || '').trim();
    if (!loc || /^remote$/i.test(loc)) return 'Remote (US)';
    return loc.length > 34 ? 'Remote (US)' : loc;
  }
  const loc = String(job.location || '').trim();
  if (!loc) return 'United States';
  // Keep compact for clean Markdown tables
  const firstSegment = loc.split(';')[0].trim();
  const suffix = loc.includes(';') ? ` (+${loc.split(';').length - 1})` : '';
  const compact = firstSegment.replace(/,\s*United States(?: of America)?$/i, '').trim() + suffix;
  return compact.length > 38 ? `${compact.slice(0, 35)}…` : compact;
}

function median(nums) {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

function daysAgo(datePostedStr, nowMs) {
  if (!datePostedStr) return 999;
  const ts = Date.parse(datePostedStr);
  if (isNaN(ts)) return 999;
  return Math.max(0, Math.floor((nowMs - ts) / 86400000));
}

function buildMarkdownRow(job) {
  const company = escapeMdCell(job.company);
  const title = escapeMdCell(job.title);
  const detailUrl = `https://www.freshcommits.com/job/${encodeURIComponent(job.id)}`;
  const applyUrl = job.applyUrl || detailUrl;
  const loc = escapeMdCell(formatLocationShort(job));
  const pay = escapeMdCell(formatSalary(job));
  const posted = escapeMdCell(job.datePosted || 'Recent');

  return `| **${company}** | [${title}](${detailUrl}) | ${loc} | ${pay} | ${posted} | [Direct ATS](${applyUrl}) |`;
}

function generateExports() {
  if (!fs.existsSync(JOBS_JSON_PATH)) {
    throw new Error(`Missing ${JOBS_JSON_PATH}. Run pull-firestore-jobs.mjs first.`);
  }

  const allJobs = JSON.parse(fs.readFileSync(JOBS_JSON_PATH, 'utf8'));
  const todayIso = new Date().toISOString().split('T')[0];
  const nowMs = Date.now();

  const NON_US_LOC_RE = /\b(?:mexico|méxico|ciudad de méxico|india|bengaluru|bangalore|hyderabad|germany|berlin|munich|france|paris|netherlands|amsterdam|poland|brazil|argentina|colombia|philippines|singapore|japan|tokyo)\b/i;
  const NON_SWE_TITLE_RE = /\b(?:business\s+developer|sales\s+development|account\s+executive|recruiter)\b/i;

  const activeJobs = allJobs.filter((j) => {
    if (!j || !j.id || !j.title || !j.company) return false;
    if (j.status && j.status !== 'ACTIVE') return false;
    if (j.validThrough && String(j.validThrough).slice(0, 10) < todayIso) return false;
    if (NON_SWE_TITLE_RE.test(String(j.title))) return false;
    if (j.country && j.country !== 'US') return false;
    if (NON_US_LOC_RE.test(String(j.location || ''))) return false;
    return true;
  });

  const companiesSet = new Set(activeJobs.map((j) => j.company));
  const recent7d = activeJobs.filter((j) => daysAgo(j.datePosted, nowMs) <= 7);
  const interns = activeJobs.filter(isInternshipJob);
  const fullTime = activeJobs.filter((j) => !isInternshipJob(j));

  const remoteCount = activeJobs.filter((j) => j.isRemote || String(j.workMode || '').toLowerCase() === 'remote').length;
  const hybridCount = activeJobs.filter((j) => !j.isRemote && String(j.workMode || '').toLowerCase() === 'hybrid').length;
  const onsiteCount = activeJobs.length - remoteCount - hybridCount;

  const annualMidpoints = fullTime
    .filter((j) => j.salaryDisclosed !== false && j.salary?.min >= 35000 && j.salary?.unit !== 'HOUR')
    .map((j) => {
      const min = Number(j.salary.min);
      const max = j.salary.max && j.salary.max >= min ? Number(j.salary.max) : min;
      return Math.round((min + max) / 2);
    });

  const hourlyMidpoints = interns
    .filter((j) => j.salaryDisclosed !== false && j.salary?.min >= 15 && j.salary?.min < 250 && j.salary?.unit === 'HOUR')
    .map((j) => {
      const min = Number(j.salary.min);
      const max = j.salary.max && j.salary.max >= min ? Number(j.salary.max) : min;
      return Math.round((min + max) / 2);
    });

  const disclosedCount = activeJobs.filter((j) => j.salaryDisclosed !== false && j.salary?.min > 0).length;
  const disclosedPct = activeJobs.length ? Math.round((disclosedCount / activeJobs.length) * 100) : 0;
  const medianAnnual = median(annualMidpoints);
  const medianHourly = median(hourlyMidpoints);

  // Top hiring companies
  const companyCounts = new Map();
  for (const j of activeJobs) {
    companyCounts.set(j.company, (companyCounts.get(j.company) || 0) + 1);
  }
  const topCompanies = [...companyCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Top technical skills
  const skillCounts = new Map();
  for (const j of activeJobs) {
    for (const sk of j.skills || []) {
      const clean = String(sk || '').trim();
      if (!clean) continue;
      skillCounts.set(clean, (skillCounts.get(clean) || 0) + 1);
    }
  }
  const topSkills = [...skillCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  fs.mkdirSync(COMMUNITY_DIR, { recursive: true });

  // -------------------------------------------------------------------------
  // 1. Open-Source GitHub Jobs Board README (Auto-Updated Every 6 Hours)
  // -------------------------------------------------------------------------
  const githubReadme = `# US Entry-Level, New Grad & 2027 SWE Internships (0–2 YoE Only)

> **Auto-updated every 6 hours** from official employer ATS boards (Greenhouse, Ashby, Lever, SmartRecruiters) — **zero senior 3–5+ YoE clutter, zero repost spam, and automated dead-link pruning.**
>
> Powered by **[FreshCommits.com](https://www.freshcommits.com/jobs)** · [2026–2027 Salary Guide](https://www.freshcommits.com/salary-guide) · [2027 Internship Playbook](https://www.freshcommits.com/insights/software-engineering-internship-2027-guide) · [Free ATS Resume Matcher](https://www.freshcommits.com/career-tools)

---

### Live Market Snapshot (${todayIso})

| Metric | Verified Value |
| :--- | :--- |
| **Active 0–2 YoE Openings** | **${activeJobs.length}** across **${companiesSet.size}** employers |
| **Added in Last 7 Days** | **${recent7d.length}** fresh openings |
| **Full-Time Entry / New Grad** | **${fullTime.length}** roles${medianAnnual ? ` (Median disclosed midpoint: **$${medianAnnual.toLocaleString()}/yr**)` : ''} |
| **2027 Internships & Co-ops** | **${interns.length}** roles${medianHourly ? ` (Median disclosed hourly: **$${medianHourly}/hr**)` : ''} |
| **Salary Transparency Rate** | **${disclosedPct}%** include verified employer pay bands |
| **Work Mode Split** | ${onsiteCount} On-site · ${hybridCount} Hybrid · ${remoteCount} Remote (US) |

---

## Fresh Drops (Posted in the Last 7 Days)

${
  recent7d.length > 0
    ? `| Company | Role & Details | Location | Disclosed Pay | Posted | Apply |
| :--- | :--- | :--- | :--- | :--- | :--- |
${recent7d.slice(0, 40).map(buildMarkdownRow).join('\n')}`
    : '_No openings dated within the last 7 days — check the full verified tables below._'
}

---

## 2027 Software Engineering Internships & Co-ops (${interns.length})

| Company | Role & Details | Location | Disclosed Pay | Posted | Apply |
| :--- | :--- | :--- | :--- | :--- | :--- |
${interns.slice(0, 80).map(buildMarkdownRow).join('\n')}

---

## Entry-Level & New Grad Full-Time Roles — 0–2 YoE (${fullTime.length})

| Company | Role & Details | Location | Disclosed Pay | Posted | Apply |
| :--- | :--- | :--- | :--- | :--- | :--- |
${fullTime.slice(0, 140).map(buildMarkdownRow).join('\n')}

---

### How Verification Works
1. **Direct Employer ATS Only:** Roles are pulled directly from company ATS feeds (Greenhouse, Ashby, Lever, SmartRecruiters) and curated employer portals.
2. **Strict 0–2 YoE Gate:** Listings requiring 3+ years of experience or senior titles are filtered out automatically.
3. **Automated Dead-Link Expiry:** Every 6 hours, closed requisitions (HTTP 404/410 or generic career-portal redirects) are automatically pruned so you don't waste time on ghost jobs.

> Browse searchable filters, company hubs, and free ATS resume scoring at **[FreshCommits.com/jobs](https://www.freshcommits.com/jobs)**.
`;

  const githubReadmePath = path.join(COMMUNITY_DIR, 'GITHUB_JOBS_README.md');
  fs.writeFileSync(githubReadmePath, githubReadme, 'utf8');

  // -------------------------------------------------------------------------
  // 2. Weekly Community Drops (Reddit r/csMajors, LinkedIn, X/Twitter)
  // -------------------------------------------------------------------------
  const poolForHighlights = recent7d.length >= 12 ? recent7d : activeJobs;
  const seenHighlightCompanies = new Set();
  const topFreshRows = [];
  for (const job of poolForHighlights) {
    const key = String(job.company || '').toLowerCase();
    if (seenHighlightCompanies.has(key)) continue;
    seenHighlightCompanies.add(key);
    topFreshRows.push(job);
    if (topFreshRows.length >= 12) break;
  }
  const topCompaniesStr = topCompanies.map(([c, n]) => `${c} (${n})`).join(', ');
  const topSkillsStr = topSkills.slice(0, 6).map(([s, n]) => `${s} (${n})`).join(', ');

  const weeklyDrop = `# Weekly Fresh-Job Drops & Data Insights (${todayIso})

Ready-to-post community drops generated automatically from **${activeJobs.length} verified active US 0–2 YoE roles** (dead links pruned before generation).

---

## 1. Reddit Post (r/csMajors / r/cscareerquestions)

**Suggested Title:**
\`[${todayIso} Data] Analyzed ${activeJobs.length} live US Entry-Level & 2027 Intern SWE openings across ${companiesSet.size} direct ATS boards (${disclosedPct}% disclose pay)\`

**Body (copy & paste):**

\`\`\`markdown
We audit direct employer ATS boards (Greenhouse, Ashby, Lever, SmartRecruiters) every 6 hours for strict 0–2 YoE US software roles and automatically prune 404/closed postings. Here is this week's snapshot (${todayIso}):

### Market Snapshot (${todayIso})
- **Active 0–2 YoE US roles:** ${activeJobs.length} across ${companiesSet.size} companies (${recent7d.length} posted in the last 7 days)
- **Full-Time New Grad / Entry-Level:** ${fullTime.length}${medianAnnual ? ` — median disclosed base midpoint: **$${medianAnnual.toLocaleString()}/yr**` : ''}
- **2027 Internships / Co-ops:** ${interns.length}${medianHourly ? ` — median disclosed pay: **$${medianHourly}/hr**` : ''}
- **Pay transparency:** ${disclosedPct}% of live postings include verified salary bands
- **Work mode split:** ${Math.round((onsiteCount / Math.max(1, activeJobs.length)) * 100)}% On-site · ${Math.round((hybridCount / Math.max(1, activeJobs.length)) * 100)}% Hybrid · ${Math.round((remoteCount / Math.max(1, activeJobs.length)) * 100)}% Remote (US)
- **Most active employers this week:** ${topCompaniesStr}
- **Top requested stack:** ${topSkillsStr}

### 12 Freshest Verified Openings (Direct ATS Links)

| Company | Role | Location | Disclosed Pay | Posted |
| :--- | :--- | :--- | :--- | :--- |
${topFreshRows
  .map(
    (j) =>
      `| ${escapeMdCell(j.company)} | [${escapeMdCell(j.title)}](https://www.freshcommits.com/job/${encodeURIComponent(j.id)}) | ${escapeMdCell(formatLocationShort(j))} | ${escapeMdCell(formatSalary(j))} | ${escapeMdCell(j.datePosted || 'Recent')} |`
  )
  .join('\n')}

Full searchable list (all ${activeJobs.length} roles, updated every 6h with dead-link checks): https://www.freshcommits.com/jobs

Happy to pull salary or wave breakdowns for specific companies/roles if anyone wants them in the comments.
\`\`\`

---

## 2. LinkedIn Post

\`\`\`text
Weekly US Entry-Level & 2027 SWE Hiring Pulse (${todayIso})

We scanned ${companiesSet.size} direct employer ATS boards today and filtered strictly for 0–2 YoE engineering roles (removing expired links and senior 3+ YoE clutter).

Here is what the live numbers show right now:
• ${activeJobs.length} verified active roles (${recent7d.length} added in the last 7 days)
• ${fullTime.length} Full-Time Entry-Level / New Grad roles${medianAnnual ? ` (median disclosed base midpoint: $${medianAnnual.toLocaleString()}/yr)` : ''}
• ${interns.length} Summer/Spring 2027 Internships${medianHourly ? ` (median disclosed pay: $${medianHourly}/hr)` : ''}
• ${disclosedPct}% publish verified compensation bands
• Top hiring teams this week: ${topCompanies.slice(0, 5).map(([c]) => c).join(', ')}

5 fresh openings live right now:
${topFreshRows
  .slice(0, 5)
  .map((j) => `→ ${j.company} — ${j.title} (${formatLocationShort(j)}${formatSalary(j) !== '—' ? `, ${formatSalary(j)}` : ''})`)
  .join('\n')}

All ${activeJobs.length} verified roles + direct ATS links: https://www.freshcommits.com/jobs

#SoftwareEngineering #NewGrad #EntryLevelJobs #CSInternships #TechHiring
\`\`\`

---

## 3. X / Twitter Drop

\`\`\`text
US 0–2 YoE Tech Hiring Pulse (${todayIso}):

• ${activeJobs.length} verified live ATS roles (${recent7d.length} added this week)
• ${fullTime.length} New Grad / Entry-Level${medianAnnual ? ` (median disclosed: $${medianAnnual.toLocaleString()}/yr)` : ''}
• ${interns.length} 2027 Internships
• ${disclosedPct}% disclose salary bands

Freshest drops:
${topFreshRows
  .slice(0, 4)
  .map((j) => `- ${j.company}: ${j.title} (${formatSalary(j) !== '—' ? formatSalary(j) : formatLocationShort(j)})`)
  .join('\n')}

Direct ATS links (zero ghost jobs): https://www.freshcommits.com/jobs
\`\`\`
`;

  const weeklyDropPath = path.join(COMMUNITY_DIR, 'WEEKLY_DROP.md');
  fs.writeFileSync(weeklyDropPath, weeklyDrop, 'utf8');

  console.log(
    `[CommunityExports] Generated community/GITHUB_JOBS_README.md (${activeJobs.length} roles) & community/WEEKLY_DROP.md (${recent7d.length} fresh 7-day roles).`
  );
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  try {
    generateExports();
  } catch (err) {
    console.error('[CommunityExports] Fatal error:', err);
    process.exit(1);
  }
}
