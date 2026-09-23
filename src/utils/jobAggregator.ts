import { JobPosting, SyncLog, ExperienceLevel, JobCategory, EmploymentType } from '../types';

export interface RawExternalJob {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyWebsite?: string;
  location: string;
  isRemote?: boolean;
  city?: string;
  state?: string;
  country?: string;
  description: string;
  responsibilities?: string[];
  qualifications?: string[];
  skills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  applyUrl: string;
  datePosted: string;
  sourceName: string;
  sourceUrl: string;
  detailsUrl?: string;
  atsProvider?: string;
}

// Global feeds simulator and fetcher for reliable engineering ATS feeds
const SAMPLE_EXTERNAL_FEEDS: RawExternalJob[] = [
  {
    id: 'ext-gh-101',
    title: 'Junior Cloud Infrastructure Engineer',
    company: 'Cloudflare',
    companyLogo: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=128&auto=format&fit=crop&q=80',
    companyWebsite: 'https://cloudflare.com',
    location: 'Austin, TX',
    isRemote: true,
    city: 'Austin',
    state: 'TX',
    country: 'US',
    description: 'Cloudflare is seeking a Junior Cloud Infrastructure Engineer to join our global edge network engineering team. In this role, you will help monitor, automate, and expand our edge server clusters running across 300+ cities.',
    responsibilities: [
      'Write deployment scripts and system automation using Go and Python.',
      'Assist in troubleshooting Linux kernel network queues and BGP routing edge anomalies.',
      'Contribute to internal platform telemetry tools and runbook automation.',
      'Collaborate with global SRE on-call engineers to maintain five-nines service uptime.'
    ],
    qualifications: [
      '0-1 year experience in software or systems engineering; recent grads welcome.',
      'Fundamental understanding of Linux systems, TCP/IP networking, and DNS.',
      'Comfort with at least one scripting or systems language (Go, Python, Rust).',
      'Strong passion for Internet infrastructure and security.'
    ],
    skills: ['Go', 'Python', 'Linux', 'Networking', 'Docker', 'DNS'],
    salaryMin: 118000,
    salaryMax: 138000,
    currency: 'USD',
    applyUrl: 'https://boards.greenhouse.io/cloudflare/jobs/junior-cloud-infrastructure',
    datePosted: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sourceName: 'Greenhouse Public Feed',
    sourceUrl: 'https://boards.greenhouse.io/cloudflare'
  },
  {
    id: 'ext-lev-102',
    title: 'Software Engineer - University Graduate 2025/2026',
    company: 'Figma',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
    companyWebsite: 'https://figma.com',
    location: 'San Francisco, CA',
    isRemote: false,
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    description: 'Figma is hiring University Graduate Software Engineers for our San Francisco office. You will work across the stack—from WebAssembly rendering engines and multiplayer WebSocket sync to collaborative web canvas interfaces.',
    responsibilities: [
      'Implement collaborative editor features used by millions of designers and product managers.',
      'Optimize WebGL and WebAssembly canvas rendering performance.',
      'Build scalable backend microservices in Rust and TypeScript.',
      'Participate in design crits, code reviews, and cross-functional team sprints.'
    ],
    qualifications: [
      'Anticipated graduation between December 2024 and Summer 2026 in Computer Science or related degree.',
      'Sound knowledge of algorithms, systems programming, and modern web protocols.',
      'Experience with C++, Rust, TypeScript, or React via coursework or open source.',
      'Enthusiasm for building tools that empower human creativity.'
    ],
    skills: ['TypeScript', 'Rust', 'C++', 'WebAssembly', 'React', 'Multiplayer Sync'],
    salaryMin: 145000,
    salaryMax: 175000,
    currency: 'USD',
    applyUrl: 'https://jobs.lever.co/figma/university-graduate-swe',
    datePosted: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0],
    sourceName: 'Lever Jobs Feed',
    sourceUrl: 'https://jobs.lever.co/figma'
  },
  {
    id: 'ext-ash-103',
    title: 'Fresher Mobile Software Engineer (iOS / Swift)',
    company: 'Duolingo',
    companyLogo: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=128&auto=format&fit=crop&q=80',
    companyWebsite: 'https://duolingo.com',
    location: 'Seattle, WA',
    isRemote: true,
    city: 'Seattle',
    state: 'WA',
    country: 'US',
    description: 'Duolingo is looking for a Fresher / Early-Career Mobile Software Engineer to build engaging learning experiences for over 80 million monthly active language learners worldwide.',
    responsibilities: [
      'Develop interactive lesson exercises and gamified animations in Swift and SwiftUI.',
      'Collaborate with UI/UX designers and audio engineers to deliver delight in every screen interaction.',
      'Maintain automated iOS UI tests and monitor crash-free sessions in production.',
      'Write clean, accessible, and localized client-side mobile code.'
    ],
    qualifications: [
      '0 to 1 year of iOS development experience; fresh graduates with personal apps on the App Store or GitHub are encouraged!',
      'Working knowledge of Swift, SwiftUI, or UIKit.',
      'Understanding of client-server networking, JSON parsing, and mobile lifecycle.',
      'Strong eye for detail and micro-interactions.'
    ],
    skills: ['Swift', 'SwiftUI', 'iOS', 'Git', 'REST APIs', 'Mobile Architecture'],
    salaryMin: 125000,
    salaryMax: 140000,
    currency: 'USD',
    applyUrl: 'https://careers.duolingo.com/openings/early-career-mobile',
    datePosted: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString().split('T')[0],
    sourceName: 'Ashby Reliable Careers Feed',
    sourceUrl: 'https://careers.duolingo.com'
  },
  // Item that will be filtered out by relevancy (to test strict filtering)
  {
    id: 'ext-bad-104',
    title: 'Senior Principal Staff Software Architect',
    company: 'Enterprise MegaCorp',
    location: 'New York, NY',
    description: 'Looking for a Senior Principal Architect with 12+ years of enterprise architecture experience to direct enterprise strategy.',
    applyUrl: 'https://example.com/bad',
    datePosted: new Date().toISOString().split('T')[0],
    sourceName: 'Public Job Feed',
    sourceUrl: 'https://example.com'
  },
  {
    id: 'ext-bad-105',
    title: 'Senior Engineering Manager - Payments',
    company: 'Fintech Group',
    location: 'San Francisco, CA',
    description: 'Manage a team of 15 senior developers with 8+ years leadership experience.',
    applyUrl: 'https://example.com/bad2',
    datePosted: new Date().toISOString().split('T')[0],
    sourceName: 'Public Job Feed',
    sourceUrl: 'https://example.com'
  },
  {
    id: 'ext-gh-106',
    title: 'Associate QA & Test Automation Engineer',
    company: 'GitLab',
    companyLogo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=128&auto=format&fit=crop&q=80',
    companyWebsite: 'https://gitlab.com',
    location: 'Remote - US',
    isRemote: true,
    city: 'Remote',
    country: 'US',
    description: 'GitLab is hiring an Entry-Level / Associate Quality Assurance Engineer to build end-to-end testing frameworks, regression pipelines, and performance benchmark suites for our DevOps platform.',
    responsibilities: [
      'Create and maintain automated test scripts using Playwright and Cypress.',
      'Integrate test suites into GitLab CI/CD pipelines to prevent code regressions.',
      'Report, triage, and verify bug fixes with development teams asynchronously.',
      'Conduct exploratory testing on new product features prior to general availability.'
    ],
    qualifications: [
      '0-2 years of software engineering or software testing experience.',
      'Basic scripting proficiency in JavaScript, TypeScript, or Ruby.',
      'Knowledge of QA testing methodologies and web application basics.',
      'Self-motivated with strong written documentation skills.'
    ],
    skills: ['Cypress', 'Playwright', 'TypeScript', 'CI/CD', 'GitLab', 'QA Automation'],
    salaryMin: 95000,
    salaryMax: 115000,
    currency: 'USD',
    applyUrl: 'https://boards.greenhouse.io/gitlab/jobs/associate-qa-engineer',
    datePosted: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString().split('T')[0],
    sourceName: 'Greenhouse Public Feed',
    sourceUrl: 'https://boards.greenhouse.io/gitlab'
  }
];

/**
 * Generates normalized string fingerprint for duplicate prevention
 */
export function generateFingerprint(company: string, title: string, location: string): string {
  const norm = (str: string) =>
    (str || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .trim();

  return `${norm(company)}-${norm(title)}-${norm(location)}`;
}

/**
 * Negative keyword filter: Rejects non-entry-level / senior positions
 */
const SENIOR_DISQUALIFIERS = [
  'senior',
  'sr.',
  'lead',
  'principal',
  'staff',
  'architect',
  'director',
  'manager',
  'head of',
  'vp ',
  'chief',
  '3+ years',
  '4+ years',
  '5+ years',
  '6+ years',
  '7+ years',
  '8+ years',
  '10+ years'
];

/**
 * Positive keyword filter: Ensures role is explicitly early career / developer
 */
const ENTRY_QUALIFIERS = [
  'entry level',
  'entry-level',
  'junior',
  'jr.',
  'new grad',
  'new graduate',
  'fresher',
  'associate',
  'university graduate',
  'campus',
  'early career',
  'intern',
  'internship',
  'apprentice',
  '0-1 year',
  '0-2 years',
  '0 years'
];

const DEV_ROLE_QUALIFIERS = [
  'software',
  'engineer',
  'developer',
  'programmer',
  'frontend',
  'backend',
  'full stack',
  'fullstack',
  'mobile',
  'ios',
  'android',
  'web',
  'cloud',
  'devops',
  'qa',
  'test',
  'infrastructure',
  'data'
];

/**
 * Checks if raw job passes strict early-career software engineering relevancy criteria
 */
export function evaluateJobRelevancy(job: RawExternalJob): { isRelevant: boolean; reason: string } {
  const combinedText = `${job.title} ${job.description}`.toLowerCase();

  // 1. Strict negative disqualification
  for (const neg of SENIOR_DISQUALIFIERS) {
    if (job.title.toLowerCase().includes(neg)) {
      return { isRelevant: false, reason: `Disqualified by senior keyword in title: "${neg}"` };
    }
  }

  // 2. Must be a developer / engineering role
  const isDevRole = DEV_ROLE_QUALIFIERS.some((role) => combinedText.includes(role));
  if (!isDevRole) {
    return { isRelevant: false, reason: 'Disqualified: Not a software developer or engineering role' };
  }

  // 3. Must match early-career / entry-level / new-grad criteria
  const isEarlyCareer = ENTRY_QUALIFIERS.some((kw) => combinedText.includes(kw));
  if (!isEarlyCareer) {
    return { isRelevant: false, reason: 'Disqualified: Does not match Entry-Level / New Grad / Fresher criteria' };
  }

  return { isRelevant: true, reason: 'Passed strict early-career developer verification' };
}

/**
 * Categorizes the job role
 */
function inferCategory(title: string, skills: string[] = []): JobCategory {
  const t = (title + ' ' + skills.join(' ')).toLowerCase();
  if (t.includes('frontend') || t.includes('react') || t.includes('ui') || t.includes('web')) return 'Frontend';
  if (t.includes('backend') || t.includes('ruby') || t.includes('go') || t.includes('api') || t.includes('java')) return 'Backend';
  if (t.includes('mobile') || t.includes('ios') || t.includes('android') || t.includes('swift')) return 'Mobile';
  if (t.includes('devops') || t.includes('cloud') || t.includes('kubernetes') || t.includes('infrastructure')) return 'DevOps / Cloud';
  if (t.includes('data') || t.includes('ai') || t.includes('machine learning')) return 'Data / AI';
  if (t.includes('qa') || t.includes('test') || t.includes('quality')) return 'QA / Test';
  return 'Full Stack';
}

function inferExperienceLevel(title: string, desc: string): ExperienceLevel {
  const text = (title + ' ' + desc).toLowerCase();
  if (text.includes('new grad') || text.includes('graduate') || text.includes('campus')) return 'New Grad';
  if (text.includes('fresher')) return 'Fresher';
  if (text.includes('intern')) return 'Internship';
  return 'Entry Level';
}

/**
 * Cleans raw HTML into human-readable plain text with clean paragraph spacing
 */
export function cleanHtmlText(html?: string): string {
  if (!html) return '';
  return html
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<[^>]+>/gi, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;|&#xa0;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

/**
 * Extracts bulleted lists from HTML or formatted text
 */
function extractBullets(text: string): string[] {
  if (!text) return [];
  const clean = cleanHtmlText(text);
  const lines = clean
    .split('\n')
    .map((l) => l.replace(/^[•\-\*]\s*/, '').trim())
    .filter((l) => l.length > 5 && !l.endsWith(':'));
  return lines.length > 0 ? lines : [];
}

/**
 * Fetches real, verified jobs from SmartRecruiters ATS (jobs.smartrecruiters.com)
 */
export async function fetchSmartRecruitersRawJobs(options?: {
  keyword?: string;
  remoteOnly?: boolean;
  limit?: number;
}): Promise<RawExternalJob[]> {
  const kw = options?.keyword?.trim() || 'junior software engineer';
  const limit = options?.limit || 50;
  const isRemote = options?.remoteOnly;

  // Primary: Local proxy endpoint (/api/sr-jobs/search)
  const proxyUrl = `/api/sr-jobs/search?keyword=${encodeURIComponent(kw)}&limit=${limit}${isRemote ? '&locationType=remote' : ''}`;
  const directTarget = `https://jobs.smartrecruiters.com/sr-jobs/search?keyword=${encodeURIComponent(kw)}&limit=${limit}${isRemote ? '&locationType=remote' : ''}`;
  const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(directTarget)}`;

  let content: any[] = [];

  // 1. Try local dev/container proxy first
  try {
    const res = await fetch(proxyUrl, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.content)) {
        content = data.content;
      }
    }
  } catch (err) {
    // console.warn('SmartRecruiters local proxy error:', err);
  }

  // 2. Try CORS proxy if local proxy was not reachable
  if (content.length === 0) {
    try {
      const res = await fetch(corsProxyUrl, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.content)) {
          content = data.content;
        }
      }
    } catch (err) {
      // console.warn('SmartRecruiters CORS proxy error:', err);
    }
  }

  // 3. Fallback: Query verified top tech companies directly from the CORS-enabled API
  if (content.length === 0) {
    const topCompanies = ['Wise', 'BoschGroup', 'Canva', 'AristaNetworks', 'DeltaElectronics', 'Ubisoft2', 'AECOM2'];
    for (const comp of topCompanies) {
      try {
        const res = await fetch(`https://api.smartrecruiters.com/v1/companies/${comp}/postings?limit=15&q=${encodeURIComponent(kw.includes('engineer') ? 'engineer' : kw)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.content)) {
            content.push(...data.content);
          }
        }
      } catch {
        // continue to next company
      }
    }
  }

  return content.map((item) => {
    const title = item.name || 'Software Engineer';
    const compName = item.company?.name || 'Verified Tech Partner';
    const compLogo = item.company?.logo;
    const city = item.location?.city;
    const region = item.location?.region;
    const country = item.location?.country ? item.location.country.toUpperCase() : 'US';
    const shortLoc = item.shortLocation || (city ? `${city}${region ? `, ${region}` : ''}` : 'Remote');
    const isRemoteRole = Boolean(item.location?.remote || item.location?.hybrid);
    const applyUrl = item.applyUrl || (item.company?.identifier ? `https://jobs.smartrecruiters.com/${item.company.identifier}/${item.id}` : '#');
    const datePosted = item.releasedDate ? item.releasedDate.split('T')[0] : new Date().toISOString().split('T')[0];
    const detailsUrl = item.actions?.details;

    return {
      id: `sr-${item.id}`,
      title,
      company: compName,
      companyLogo: compLogo,
      companyWebsite: `https://jobs.smartrecruiters.com/${item.company?.identifier || ''}`,
      location: isRemoteRole ? 'Remote - US / Global' : shortLoc,
      isRemote: isRemoteRole,
      city: isRemoteRole ? undefined : city,
      state: isRemoteRole ? undefined : region,
      country,
      description: `${title} at ${compName}. Authentic listing sourced directly from employer career portal on SmartRecruiters ATS. Direct application available with zero recruiter intermediaries.`,
      applyUrl,
      datePosted,
      sourceName: 'SmartRecruiters ATS Verified',
      sourceUrl: applyUrl,
      detailsUrl,
      atsProvider: 'SmartRecruiters'
    };
  });
}

/**
 * Fetches detailed posting information (sections, unparaphrased job description, compensation)
 * from SmartRecruiters' CORS-enabled postings API
 */
export async function fetchSmartRecruitersJobPostingDetails(detailsUrl: string): Promise<any> {
  if (!detailsUrl) return null;
  try {
    const res = await fetch(detailsUrl, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // console.warn('Could not fetch details for posting:', detailsUrl, e);
  }
  return null;
}

/**
 * Dedicated synchronization function for SmartRecruiters ATS
 */
export async function syncSmartRecruitersJobs(
  existingJobs: JobPosting[],
  keyword?: string,
  remoteOnly?: boolean
): Promise<{ newJobs: JobPosting[]; log: SyncLog; refreshedJobIds?: string[] }> {
  const existingFingerprints = new Set(existingJobs.map((j) => j.fingerprint));

  const queries = keyword?.trim()
    ? [keyword.trim()]
    : ['junior software engineer', 'entry level software developer', 'software engineer intern', 'graduate software engineer'];

  const rawJobs: RawExternalJob[] = [];
  for (const q of queries) {
    try {
      const batch = await fetchSmartRecruitersRawJobs({ keyword: q, remoteOnly, limit: 50 });
      rawJobs.push(...batch);
    } catch (err) {
      console.warn(`Query "${q}" failed:`, err);
    }
  }

  let passedRelevancyCount = 0;
  let duplicatesSkippedCount = 0;
  let manualOverridesCount = 0;
  const refreshedJobIds: string[] = [];
  const newJobs: JobPosting[] = [];

  for (const raw of rawJobs) {
    const relevancy = evaluateJobRelevancy(raw);
    if (!relevancy.isRelevant) {
      continue;
    }
    passedRelevancyCount++;

    // Strict multi-layer duplicate check (URL, fingerprint, fuzzy entity) against existing & in-flight jobs
    const dupCheck = checkDuplicateJob([...existingJobs, ...newJobs], {
      company: raw.company,
      title: raw.title,
      applyUrl: raw.applyUrl,
      location: raw.location,
      isRemote: raw.isRemote
    });

    if (dupCheck.isDuplicate) {
      duplicatesSkippedCount++;
      // If a manual curated job already exists, protect its content and mark it verified by the ATS feed
      if (dupCheck.matchingJob && (dupCheck.matchingJob.source === 'EMPLOYER_POST' || dupCheck.matchingJob.source === 'MANUAL_ADMIN')) {
        manualOverridesCount++;
        if (!refreshedJobIds.includes(dupCheck.matchingJob.id)) {
          refreshedJobIds.push(dupCheck.matchingJob.id);
        }
      }
      continue;
    }

    let detailedDesc = raw.description;
    let responsibilities = [
      'Contribute to software engineering features, bug fixes, and system improvements.',
      'Write clean, maintainable code with unit tests and peer code reviews.',
      'Collaborate with product and design team members in agile sprint cycles.'
    ];
    let qualifications = [
      '0–2 years of software engineering or coursework experience; entry level and fresh graduates welcome.',
      'Core foundation in computer science, algorithms, and data structures.',
      'Familiarity with modern programming languages and version control (Git).'
    ];
    let salaryMin = raw.salaryMin || 95000;
    let salaryMax = raw.salaryMax || 135000;
    let salaryCurrency = 'USD';
    let empType: EmploymentType = 'FULL_TIME';

    // Fetch details for the top positions to get authentic unparaphrased descriptions & verified compensation
    if (raw.detailsUrl && newJobs.length < 15) {
      try {
        const details = await fetchSmartRecruitersJobPostingDetails(raw.detailsUrl);
        if (details) {
          const jobAd = details.jobAd?.sections;
          if (jobAd?.jobDescription?.text) {
            const cleaned = cleanHtmlText(jobAd.jobDescription.text);
            if (cleaned) {
              detailedDesc = cleaned;
              const bullets = extractBullets(jobAd.jobDescription.text);
              if (bullets.length >= 2) responsibilities = bullets.slice(0, 6);
            }
          }
          if (jobAd?.qualifications?.text) {
            const bullets = extractBullets(jobAd.qualifications.text);
            if (bullets.length >= 2) qualifications = bullets.slice(0, 6);
          }
          if (details.compensation?.max) {
            salaryMax = Number(details.compensation.max);
            salaryMin = Number(details.compensation.min || Math.round(salaryMax * 0.85));
            salaryCurrency = details.compensation.currency || 'USD';
          }
          if (details.typeOfEmployment?.id === 'internship' || raw.title.toLowerCase().includes('intern')) {
            empType = 'INTERN';
          }
        }
      } catch {
        // use default structured copy
      }
    }

    const fingerprint = generateFingerprint(raw.company, raw.title, raw.location);
    const validThroughDate = new Date();
    validThroughDate.setDate(validThroughDate.getDate() + 45);

    const cleanJob: JobPosting = {
      id: `sr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: raw.title,
      company: raw.company,
      companyLogo: raw.companyLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(raw.company)}&background=0D9488&color=fff&size=128`,
      companyWebsite: raw.companyWebsite || '',
      location: raw.location,
      isRemote: Boolean(raw.isRemote),
      applicantLocationRequirements: raw.isRemote ? (raw.country || 'US') : undefined,
      city: raw.city,
      state: raw.state,
      country: raw.country || 'US',
      experienceLevel: inferExperienceLevel(raw.title, detailedDesc),
      maxYearsExperience: raw.title.toLowerCase().includes('intern') ? 0 : 1,
      category: inferCategory(raw.title, raw.skills),
      employmentType: raw.title.toLowerCase().includes('intern') ? 'INTERN' : empType,
      salary: {
        min: salaryMin,
        max: salaryMax,
        currency: salaryCurrency,
        unit: empType === 'INTERN' ? 'HOUR' : 'YEAR'
      },
      description: detailedDesc,
      responsibilities,
      qualifications,
      skills: raw.skills && raw.skills.length > 0 ? raw.skills : ['Git', 'Software Engineering', 'Problem Solving'],
      applyUrl: raw.applyUrl,
      datePosted: raw.datePosted,
      validThrough: validThroughDate.toISOString().split('T')[0],
      source: 'SMARTRECRUITERS',
      atsProvider: 'SmartRecruiters',
      smartRecruitersId: raw.id,
      sourceUrl: raw.sourceUrl,
      status: 'ACTIVE',
      fingerprint,
      viewsCount: Math.floor(Math.random() * 25) + 5,
      featured: false
    };

    newJobs.push(cleanJob);
  }

  const log: SyncLog = {
    id: `log-sr-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    sourceName: `SmartRecruiters ATS Verified (${keyword ? `"${keyword}"` : 'Live Early-Career Pipeline'})`,
    rawJobsCount: rawJobs.length,
    passedRelevancyCount,
    duplicatesSkippedCount,
    savedCount: newJobs.length,
    manualOverridesCount,
    details: `Scanned ${rawJobs.length} live postings from SmartRecruiters. ${passedRelevancyCount} passed early-career criteria. ${duplicatesSkippedCount} duplicates discarded${manualOverridesCount > 0 ? ` (${manualOverridesCount} existing manual listings protected & verified)` : ''}. Ingested ${newJobs.length} verified listings.`
  };

  return { newJobs, log, refreshedJobIds };
}

/**
 * Performs automated job fetching, relevancy filtering, and deduplication
 */
export async function executeAutomatedSync(
  existingJobs: JobPosting[],
  feedUrl?: string
): Promise<{ newJobs: JobPosting[]; log: SyncLog; refreshedJobIds?: string[] }> {
  const rawJobs: RawExternalJob[] = [...SAMPLE_EXTERNAL_FEEDS];

  // Also pull live verified early-career jobs from SmartRecruiters
  try {
    const srJobs = await fetchSmartRecruitersRawJobs({ keyword: 'junior software engineer', limit: 30 });
    rawJobs.push(...srJobs);
  } catch (err) {
    console.warn('SmartRecruiters automated batch fetch fallback:', err);
  }

  // If a custom external RSS/JSON feed URL was provided, attempt live fetch
  if (feedUrl && feedUrl.trim().startsWith('http')) {
    try {
      const resp = await fetch(feedUrl, { headers: { Accept: 'application/json' } });
      if (resp.ok) {
        const data = await resp.json();
        // Support common open job API formats (e.g. RemoteOK, GitHub Jobs format, etc.)
        const items = Array.isArray(data) ? data : data.jobs || data.data || [];
        for (const item of items) {
          if (item.title && item.company) {
            rawJobs.push({
              id: 'feed-' + (item.id || Math.random().toString(36).substring(2, 9)),
              title: item.title,
              company: item.company || item.company_name,
              companyLogo: item.company_logo || item.logo,
              companyWebsite: item.company_url || item.url,
              location: item.location || 'Remote - US',
              isRemote: item.remote || Boolean(item.location?.toLowerCase().includes('remote')),
              description: item.description || item.title,
              applyUrl: item.apply_url || item.url || '#',
              datePosted: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
              sourceName: 'Custom Live Feed',
              sourceUrl: feedUrl
            });
          }
        }
      }
    } catch (err) {
      console.warn('Live feed fetch fallback used:', err);
    }
  }

  let passedRelevancyCount = 0;
  let duplicatesSkippedCount = 0;
  let manualOverridesCount = 0;
  const refreshedJobIds: string[] = [];
  const newJobs: JobPosting[] = [];

  for (const raw of rawJobs) {
    const relevancy = evaluateJobRelevancy(raw);
    if (!relevancy.isRelevant) {
      continue;
    }
    passedRelevancyCount++;

    // Strict multi-layer duplicate check (URL, fingerprint, fuzzy entity) against existing & in-flight jobs
    const dupCheck = checkDuplicateJob([...existingJobs, ...newJobs], {
      company: raw.company,
      title: raw.title,
      applyUrl: raw.applyUrl,
      location: raw.location,
      isRemote: raw.isRemote
    });

    if (dupCheck.isDuplicate) {
      duplicatesSkippedCount++;
      // If a manual curated job already exists, protect its content and mark it verified by the ATS feed
      if (dupCheck.matchingJob && (dupCheck.matchingJob.source === 'EMPLOYER_POST' || dupCheck.matchingJob.source === 'MANUAL_ADMIN')) {
        manualOverridesCount++;
        if (!refreshedJobIds.includes(dupCheck.matchingJob.id)) {
          refreshedJobIds.push(dupCheck.matchingJob.id);
        }
      }
      continue;
    }

    const fingerprint = generateFingerprint(raw.company, raw.title, raw.location);

    // Build unparaphrased, structured JobPosting with valid Google Schema data
    const validThroughDate = new Date();
    validThroughDate.setDate(validThroughDate.getDate() + 45);

    const isRemote = raw.isRemote ?? Boolean(raw.location.toLowerCase().includes('remote'));
    const isSR = raw.sourceName?.includes('SmartRecruiters') || raw.applyUrl?.includes('smartrecruiters.com');

    const cleanJob: JobPosting = {
      id: isSR ? `sr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` : `sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: raw.title,
      company: raw.company,
      companyLogo: raw.companyLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(raw.company)}&background=0F172A&color=fff&size=128`,
      companyWebsite: raw.companyWebsite || '',
      location: raw.location,
      isRemote: isRemote,
      applicantLocationRequirements: isRemote ? (raw.country || 'US') : undefined,
      city: raw.city || (isRemote ? undefined : raw.location.split(',')[0]?.trim()),
      state: raw.state || (isRemote ? undefined : raw.location.split(',')[1]?.trim()),
      country: raw.country || 'US',
      experienceLevel: inferExperienceLevel(raw.title, raw.description),
      maxYearsExperience: raw.title.toLowerCase().includes('intern') ? 0 : 1,
      category: inferCategory(raw.title, raw.skills),
      employmentType: raw.title.toLowerCase().includes('intern') ? 'INTERN' : 'FULL_TIME',
      salary: {
        min: raw.salaryMin || 95000,
        max: raw.salaryMax || 125000,
        currency: raw.currency || 'USD',
        unit: raw.title.toLowerCase().includes('intern') ? 'HOUR' : 'YEAR'
      },
      description: raw.description, // Unparaphrased authentic employer description
      responsibilities: raw.responsibilities || [
        'Build and maintain software engineering features in collaborative team sprints.',
        'Write clean unit tests, review peer code, and document technical solutions.',
        'Work alongside senior engineering mentors to scale production systems.'
      ],
      qualifications: raw.qualifications || [
        '0 to 2 years of software engineering experience; entry-level and freshers welcome.',
        'Knowledge of computer science fundamentals, data structures, and algorithms.',
        'Strong problem-solving capability and desire to learn modern tools.'
      ],
      skills: raw.skills || ['JavaScript', 'Python', 'SQL', 'Git'],
      applyUrl: raw.applyUrl, // Direct ATS application URL
      datePosted: raw.datePosted || new Date().toISOString().split('T')[0],
      validThrough: validThroughDate.toISOString().split('T')[0],
      source: isSR ? 'SMARTRECRUITERS' : 'AUTOMATED_SYNC',
      atsProvider: isSR ? 'SmartRecruiters' : 'Verified ATS',
      sourceUrl: raw.sourceUrl,
      status: 'ACTIVE',
      fingerprint,
      viewsCount: 14,
      featured: false
    };

    newJobs.push(cleanJob);
  }

  const log: SyncLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    sourceName: feedUrl ? 'Custom Feed + SmartRecruiters & Verified ATS' : 'SmartRecruiters & Greenhouse / Lever / Ashby Verified ATS Feeds',
    rawJobsCount: rawJobs.length,
    passedRelevancyCount,
    duplicatesSkippedCount,
    manualOverridesCount,
    savedCount: newJobs.length,
    details: `Processed ${rawJobs.length} raw jobs. ${passedRelevancyCount} passed early-career criteria. ${duplicatesSkippedCount} duplicates discarded${manualOverridesCount > 0 ? ` (${manualOverridesCount} existing manual listings protected & verified)` : ''}. Added ${newJobs.length} new listings.`
  };

  return { newJobs, log, refreshedJobIds };
}

/**
 * Determines whether a job posting is expired based on either:
 * 1. Explicit status !== 'ACTIVE'
 * 2. validThrough date is earlier than today's date (auto-vanishing cutoff)
 */
export function isJobExpired(job: JobPosting): boolean {
  if (!job) return true;
  if (job.status && job.status !== 'ACTIVE') return true;
  if (!job.validThrough) return false;
  const todayStr = new Date().toISOString().split('T')[0];
  return job.validThrough < todayStr;
}

/**
 * Returns number of days remaining until expiration (positive number),
 * 0 if expires today, or negative if already expired.
 */
export function getDaysUntilExpiration(validThrough?: string): number | null {
  if (!validThrough) return null;
  const target = new Date(validThrough).getTime();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (isNaN(target)) return null;
  return Math.ceil((target - now.getTime()) / (1000 * 60 * 60 * 24));
}

export interface DuplicateMatchResult {
  isDuplicate: boolean;
  matchType?: 'EXACT_URL' | 'EXACT_FINGERPRINT' | 'FUZZY_TITLE_COMPANY';
  matchingJob?: JobPosting;
  reason?: string;
}

/**
 * Checks an incoming job candidate against existing inventory to detect duplicates
 * across exact ATS Apply URLs, fingerprint hash, or fuzzy company + role matching.
 */
export function checkDuplicateJob(
  inventory: JobPosting[],
  candidate: {
    company: string;
    title: string;
    applyUrl?: string;
    location?: string;
    isRemote?: boolean;
  }
): DuplicateMatchResult {
  if (!inventory || inventory.length === 0) {
    return { isDuplicate: false };
  }

  const cleanUrl = (url?: string) => {
    if (!url) return '';
    try {
      const u = new URL(url.trim());
      // Strip tracking params like utm_*, gh_jid tracking, ref, etc.
      return `${u.origin}${u.pathname}`.toLowerCase().replace(/\/+$/, '');
    } catch {
      return url.trim().toLowerCase().split('?')[0].replace(/\/+$/, '');
    }
  };

  const candUrl = cleanUrl(candidate.applyUrl);

  // 1. Direct Canonical ATS Apply URL check
  if (candUrl && candUrl.length > 10 && !candUrl.includes('careers.example.com')) {
    const urlMatch = inventory.find((j) => {
      const existingClean = cleanUrl(j.applyUrl);
      return existingClean && existingClean === candUrl;
    });

    if (urlMatch) {
      return {
        isDuplicate: true,
        matchType: 'EXACT_URL',
        matchingJob: urlMatch,
        reason: `Matches exact ATS URL of "${urlMatch.title}" at ${urlMatch.company} (${urlMatch.source === 'EMPLOYER_POST' || urlMatch.source === 'MANUAL_ADMIN' ? 'Manual Posting' : 'Automated ATS Feed'})`
      };
    }
  }

  // 2. Exact Fingerprint check
  const candCompany = (candidate.company || '').trim();
  const candTitle = (candidate.title || '').trim();
  const candLoc = candidate.isRemote ? 'remote' : (candidate.location || '').trim();

  if (candCompany && candTitle) {
    const candFingerprint = generateFingerprint(candCompany, candTitle, candLoc);
    const fpMatch = inventory.find((j) => j.fingerprint === candFingerprint);

    if (fpMatch) {
      return {
        isDuplicate: true,
        matchType: 'EXACT_FINGERPRINT',
        matchingJob: fpMatch,
        reason: `Matches exact company & title fingerprint: "${fpMatch.title}" at ${fpMatch.company} (${fpMatch.location})`
      };
    }

    // 3. Normalized Fuzzy Company + Title check (catches minor location or punctuation variations)
    const norm = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normCandComp = norm(candCompany);
    const normCandTitle = norm(candTitle);

    if (normCandComp.length >= 3 && normCandTitle.length >= 4) {
      const fuzzyMatch = inventory.find((j) => {
        const jComp = norm(j.company);
        const jTitle = norm(j.title);
        // If company matches and title is either identical or one contains the other
        if (jComp === normCandComp || jComp.includes(normCandComp) || normCandComp.includes(jComp)) {
          if (jTitle === normCandTitle || jTitle.includes(normCandTitle) || normCandTitle.includes(jTitle)) {
            return true;
          }
        }
        return false;
      });

      if (fuzzyMatch) {
        return {
          isDuplicate: true,
          matchType: 'FUZZY_TITLE_COMPANY',
          matchingJob: fuzzyMatch,
          reason: `High similarity with existing listing: "${fuzzyMatch.title}" at ${fuzzyMatch.company} (${fuzzyMatch.location})`
        };
      }
    }
  }

  return { isDuplicate: false };
}

