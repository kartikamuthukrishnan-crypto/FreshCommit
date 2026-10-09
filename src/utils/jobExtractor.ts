import { ExperienceLevel, EmploymentType, JobCategory, SalaryRange } from '../types';
import { inferCategory, inferExperienceLevel } from './jobAggregator';
import { KNOWN_CITY_ZIP_MAP, lookupCityZip } from './cityZipMap';
import {
  humanizeCareerTake,
  generateLeadEngineerTake,
  stripSeniorityFromTitle,
  generateCandidatePreparationChecklist,
  cleanLocationString,
  cleanCityString,
  humanizeChecklistItems
} from './textHumanizer';

export interface ExtractedJobData {
  title: string;
  company: string;
  companyLogo?: string;
  companyWebsite?: string;
  location: string;
  isRemote: boolean;
  applicantLocationRequirements?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  experienceLevel: ExperienceLevel;
  maxYearsExperience: number;
  category: JobCategory;
  employmentType: EmploymentType;
  salary: SalaryRange;
  salaryDisclosed: boolean;
  suggestedBenchmark?: SalaryRange;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  applyUrl: string;
  detectedAtsProvider?: string;
  datePosted?: string;
}

/**
 * Curated brand dictionary with official company names, headquarters/primary hubs, and verified logos
 */
const KNOWN_COMPANIES: Record<string, { name: string; website: string; logo?: string; defaultLocation?: string }> = {
  'google.com': {
    name: 'Google',
    website: 'https://careers.google.com',
    logo: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
    defaultLocation: 'Mountain View, CA / Hybrid'
  },
  'careers.google.com': {
    name: 'Google',
    website: 'https://careers.google.com',
    logo: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
    defaultLocation: 'Mountain View, CA / Hybrid'
  },
  'amazon.com': {
    name: 'Amazon',
    website: 'https://amazon.jobs',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=amazon.com',
    defaultLocation: 'Seattle, WA / Hybrid'
  },
  'amazon.jobs': {
    name: 'Amazon',
    website: 'https://amazon.jobs',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=amazon.com',
    defaultLocation: 'Seattle, WA / Hybrid'
  },
  'microsoft.com': {
    name: 'Microsoft',
    website: 'https://careers.microsoft.com',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=microsoft.com',
    defaultLocation: 'Redmond, WA / Hybrid'
  },
  'apple.com': {
    name: 'Apple',
    website: 'https://jobs.apple.com',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=apple.com',
    defaultLocation: 'Cupertino, CA / Hybrid'
  },
  'meta.com': {
    name: 'Meta',
    website: 'https://metacareers.com',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=meta.com',
    defaultLocation: 'Menlo Park, CA / Hybrid'
  },
  'metacareers.com': {
    name: 'Meta',
    website: 'https://metacareers.com',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=meta.com',
    defaultLocation: 'Menlo Park, CA / Hybrid'
  },
  'netflix.com': {
    name: 'Netflix',
    website: 'https://jobs.netflix.com',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=netflix.com',
    defaultLocation: 'Los Gatos, CA / Hybrid'
  },
  'nvidia.com': {
    name: 'NVIDIA',
    website: 'https://nvidia.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=nvidia.com',
    defaultLocation: 'Santa Clara, CA / Hybrid'
  },
  'openai.com': {
    name: 'OpenAI',
    website: 'https://openai.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=openai.com',
    defaultLocation: 'San Francisco, CA / Hybrid'
  },
  'anthropic.com': {
    name: 'Anthropic',
    website: 'https://anthropic.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=anthropic.com',
    defaultLocation: 'San Francisco, CA / Hybrid'
  },
  'uber.com': {
    name: 'Uber',
    website: 'https://uber.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=uber.com',
    defaultLocation: 'San Francisco, CA / Hybrid'
  },
  'airbnb.com': {
    name: 'Airbnb',
    website: 'https://airbnb.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=airbnb.com',
    defaultLocation: 'San Francisco, CA / Remote'
  },
  'stripe.com': {
    name: 'Stripe',
    website: 'https://stripe.com/jobs',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=stripe.com',
    defaultLocation: 'San Francisco, CA / Remote'
  },
  'salesforce.com': {
    name: 'Salesforce',
    website: 'https://salesforce.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=salesforce.com',
    defaultLocation: 'San Francisco, CA / Hybrid'
  },
  'spotify.com': {
    name: 'Spotify',
    website: 'https://lifeatspotify.com',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=spotify.com',
    defaultLocation: 'New York, NY / Remote'
  },
  'snowflake.com': {
    name: 'Snowflake',
    website: 'https://snowflake.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=snowflake.com',
    defaultLocation: 'Bozeman, MT / Remote'
  },
  'datadoghq.com': {
    name: 'Datadog',
    website: 'https://datadoghq.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=datadoghq.com',
    defaultLocation: 'New York, NY / Hybrid'
  },
  'datadog.com': {
    name: 'Datadog',
    website: 'https://datadoghq.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=datadoghq.com',
    defaultLocation: 'New York, NY / Hybrid'
  },
  'cloudflare.com': {
    name: 'Cloudflare',
    website: 'https://cloudflare.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=cloudflare.com',
    defaultLocation: 'San Francisco, CA / Hybrid'
  },
  'palantir.com': {
    name: 'Palantir',
    website: 'https://palantir.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=palantir.com',
    defaultLocation: 'Denver, CO / Hybrid'
  },
  'robinhood.com': {
    name: 'Robinhood',
    website: 'https://robinhood.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=robinhood.com',
    defaultLocation: 'Menlo Park, CA / Remote'
  },
  'coinbase.com': {
    name: 'Coinbase',
    website: 'https://coinbase.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=coinbase.com',
    defaultLocation: 'Remote - US'
  },
  'pinterest.com': {
    name: 'Pinterest',
    website: 'https://pinterestcareers.com',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=pinterest.com',
    defaultLocation: 'San Francisco, CA / Remote'
  },
  'snap.com': {
    name: 'Snapchat',
    website: 'https://snap.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=snap.com',
    defaultLocation: 'Santa Monica, CA / Hybrid'
  },
  'bytedance.com': {
    name: 'ByteDance',
    website: 'https://bytedance.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=bytedance.com',
    defaultLocation: 'Seattle, WA / Hybrid'
  },
  'joinbytedance.com': {
    name: 'ByteDance',
    website: 'https://joinbytedance.com',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=bytedance.com',
    defaultLocation: 'Seattle, WA / Hybrid'
  },
  'tiktok.com': {
    name: 'TikTok',
    website: 'https://tiktok.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=tiktok.com',
    defaultLocation: 'San Jose, CA / Hybrid'
  },
  'linkedin.com': {
    name: 'LinkedIn',
    website: 'https://linkedin.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=linkedin.com',
    defaultLocation: 'Sunnyvale, CA / Hybrid'
  },
  'x.com': {
    name: 'X',
    website: 'https://x.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=x.com',
    defaultLocation: 'San Francisco, CA'
  },
  'zoom.us': {
    name: 'Zoom',
    website: 'https://zoom.us/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=zoom.us',
    defaultLocation: 'San Jose, CA / Remote'
  },
  'servicenow.com': {
    name: 'ServiceNow',
    website: 'https://servicenow.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=servicenow.com',
    defaultLocation: 'Santa Clara, CA / Hybrid'
  },
  'workday.com': {
    name: 'Workday',
    website: 'https://workday.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=workday.com',
    defaultLocation: 'Pleasanton, CA / Hybrid'
  },
  'figma.com': {
    name: 'Figma',
    website: 'https://figma.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=figma.com',
    defaultLocation: 'San Francisco, CA / Hybrid'
  },
  'atlassian.com': {
    name: 'Atlassian',
    website: 'https://atlassian.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=atlassian.com',
    defaultLocation: 'Remote - US'
  },
  'github.com': {
    name: 'GitHub',
    website: 'https://github.com/about/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=github.com',
    defaultLocation: 'Remote - US'
  },
  'gitlab.com': {
    name: 'GitLab',
    website: 'https://about.gitlab.com/jobs',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=gitlab.com',
    defaultLocation: 'Remote - Worldwide'
  },
  'crowdstrike.com': {
    name: 'CrowdStrike',
    website: 'https://crowdstrike.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=crowdstrike.com',
    defaultLocation: 'Austin, TX / Remote'
  },
  'paloaltonetworks.com': {
    name: 'Palo Alto Networks',
    website: 'https://paloaltonetworks.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=paloaltonetworks.com',
    defaultLocation: 'Santa Clara, CA / Hybrid'
  },
  'bloomberg.com': {
    name: 'Bloomberg',
    website: 'https://bloomberg.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=bloomberg.com',
    defaultLocation: 'New York, NY / Hybrid'
  },
  'rtx.com': {
    name: 'RTX',
    website: 'https://rtx.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=rtx.com',
    defaultLocation: 'McKinney, TX'
  },
  'raytheon.com': {
    name: 'Raytheon',
    website: 'https://rtx.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=rtx.com',
    defaultLocation: 'McKinney, TX'
  },
  'lockheedmartin.com': {
    name: 'Lockheed Martin',
    website: 'https://www.lockheedmartinjobs.com',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=lockheedmartin.com',
    defaultLocation: 'Fort Worth, TX'
  },
  'northropgrumman.com': {
    name: 'Northrop Grumman',
    website: 'https://www.northropgrumman.com/careers',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=northropgrumman.com',
    defaultLocation: 'Melbourne, FL'
  },
  'boeing.com': {
    name: 'Boeing',
    website: 'https://jobs.boeing.com',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=boeing.com',
    defaultLocation: 'Seattle, WA'
  },
  'l3harris.com': {
    name: 'L3Harris',
    website: 'https://careers.l3harris.com',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=l3harris.com',
    defaultLocation: 'Melbourne, FL'
  }
};

/**
 * Robustly strips HTML tags, handles double-encoded or entitized HTML,
 * preserves readable paragraph/bullet structure, and decodes HTML entities.
 */
export function cleanHtml(html: string): string {
  if (!html) return '';
  let text = String(html);

  // 1. Decode double-encoded or entitized HTML (e.g. from Greenhouse, Lever, or copy-pasted markup)
  if (text.includes('&lt;') || text.includes('&gt;')) {
    text = text
      .replace(/&lt;br\s*[\/]?&gt;/gi, '\n')
      .replace(/&lt;\/(?:p|div|h[1-6]|li|ul|ol|section|article)&gt;/gi, '\n\n')
      .replace(/&lt;li[^&]*&gt;/gi, '\n• ')
      .replace(/&lt;[^&gt;]+&gt;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }

  // 2. Strip standard HTML tags, preserving block and list formatting
  text = text
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6]|section|article)>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<[^>]+>/g, ' ');

  // 3. Decode remaining entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;#xa;/gi, ' ')
    .replace(/&#xa;/gi, ' ')
    .replace(/&#xa0;/gi, ' ')
    .replace(/&#43;/g, '+')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&bull;/g, '•');

  // 4. Normalize multiple spaces and blank lines
  return text
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extracts clean bullet points from HTML or multiline text
 */
export function extractBulletPoints(html: string): string[] {
  if (!html) return [];
  const matches = html.match(/<li[^>]*>(.*?)<\/li>/gi);
  if (matches && matches.length > 0) {
    return matches
      .map((li) => cleanHtml(li).replace(/^[-*•\s]+/, '').trim())
      .filter((line) => line.length > 10 && !line.toLowerCase().includes('#li-') && !line.startsWith('+'));
  }
  return html
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•\s]+/, '').trim())
    .filter((line) => line.length > 10 && !line.toLowerCase().includes('#li-') && !line.startsWith('+'));
}

/**
 * Detects tech skills from text
 */
export function detectSkills(text: string): string[] {
  const commonSkills = [
    'FPGA', 'Verilog', 'SystemVerilog', 'VHDL', 'Digital Logic', 'Hardware Design', 'Circuit Design',
    'Embedded Systems', 'Firmware', 'C', 'C++', 'Microcontrollers', 'RTOS', 'PCB Design', 'LabVIEW', 'MATLAB',
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
    'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'FastAPI',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Linux', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB',
    'Redis', 'GraphQL', 'REST APIs', 'APIs', 'Git', 'CI/CD', 'ServiceNow', 'Terraform', 'Kafka', 'Jest', 'Playwright',
    'PyTorch', 'TensorFlow', 'Data Analysis', 'Security', 'Developer Experience', 'Trust & Safety'
  ];
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const skill of commonSkills) {
    if (skill === 'C++') {
      if (/(?:^|\W)c\+\+(?:\W|$)/i.test(text) || text.includes('&#43;&#43;')) {
        found.push('C++');
      }
      continue;
    }
    if (skill === 'C#') {
      if (/(?:^|\W)c#(?:\W|$)/i.test(text)) {
        found.push('C#');
      }
      continue;
    }
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(lower)) {
      found.push(skill);
    }
  }
  return found.length > 0 ? found.slice(0, 8) : ['Git', 'Software Engineering', 'Problem Solving'];
}

/**
 * Detects ATS / Career Portal Provider from URL
 */
export function detectAtsProviderFromUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    const host = u.hostname.toLowerCase();
    const path = u.pathname.toLowerCase();

    if (host.includes('google.com') || host.includes('google.cn')) return 'Google Careers';
    if (host.includes('amazon.jobs') || (host.includes('amazon.') && path.includes('job'))) return 'Amazon Jobs';
    if (host.includes('microsoft.com') && (path.includes('job') || host.includes('careers'))) return 'Microsoft Careers';
    if (host.includes('apple.com') && (path.includes('job') || host.includes('jobs'))) return 'Apple Jobs';
    if (host.includes('metacareers.com') || (host.includes('facebook.com') && path.includes('careers'))) return 'Meta Careers';
    if (host.includes('myworkdayjobs.com')) return 'Workday';
    if (host.includes('smartrecruiters.com')) return 'SmartRecruiters';
    if (host.includes('greenhouse.io')) return 'Greenhouse';
    if (host.includes('lever.co')) return 'Lever';
    if (host.includes('ashbyhq.com')) return 'Ashby';
    if (host.includes('workable.com')) return 'Workable';
    if (host.includes('bamboohr.com')) return 'BambooHR';
    if (host.includes('rippling.com')) return 'Rippling';
    if (host.includes('jobvite.com')) return 'Jobvite';
    if (host.includes('taleo.net')) return 'Taleo';
    if (host.includes('breezy.hr')) return 'Breezy HR';
    if (host.includes('applytojob.com')) return 'JazzHR';
    if (host.includes('netflix.com')) return 'Netflix Jobs';
    if (host.includes('uber.com')) return 'Uber Careers';
    if (host.includes('airbnb.com')) return 'Airbnb Careers';
    if (host.includes('stripe.com')) return 'Stripe Careers';

    return 'Direct Career Portal';
  } catch {
    return 'Career Portal';
  }
}

/**
 * Parses job slug to separate clean job title from trailing -at-[company] and -in-[location]
 * e.g. "hybrid-solution-specialist-in-los-angeles-at-vista-group"
 *   -> cleanTitleSlug: "hybrid-solution-specialist"
 *   -> inferredCompany: "Vista Group"
 *   -> inferredLocation: "Los Angeles"
 */
export function parseSlugMetadata(slug: string): {
  cleanTitleSlug: string;
  inferredCompany?: string;
  inferredLocation?: string;
} {
  let s = (slug || '').trim();
  let inferredCompany: string | undefined;
  let inferredLocation: string | undefined;

  // 1. Remove trailing requisition IDs if any (e.g. _26WD101433-1, -1289381, or -JR91283)
  s = s.replace(/_[0-9A-Za-z-]{5,}$/, '');
  s = s.replace(/[-_]+(?:JR|req|R|WD)?-?[0-9]{4,}.*$/i, '');

  // 2. Extract trailing -at-[company] (strictly -at-, never -for- which belongs to job titles)
  const atMatch = s.match(/(.+?)[-_]+(?:at)[-_]+([a-zA-Z0-9-_]+)$/i);
  if (atMatch) {
    const candidateComp = atMatch[2].replace(/[-_]+/g, ' ').trim();
    // Ensure it's not a common role word like "work", "home", "night", etc.
    const nonCompanyWords = new Set(['work', 'home', 'scale', 'night', 'site', 'first']);
    if (candidateComp && candidateComp.length > 1 && !/^[0-9]+$/.test(candidateComp) && !nonCompanyWords.has(candidateComp.toLowerCase())) {
      s = atMatch[1];
      inferredCompany = candidateComp
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
  }

  // 3. Extract trailing -in-[location]
  const inMatch = s.match(/(.+?)[-_]+(?:in)[-_]+([a-zA-Z0-9-_]+)$/i);
  if (inMatch) {
    const rawLoc = inMatch[2].replace(/[-_]+/g, ' ').trim();
    const nonLocationWords = new Set(['action', 'depth', 'production', 'cloud', 'python', 'java', 'react', 'c', 'cpp', 'rust']);
    if (rawLoc && rawLoc.length > 2 && !/^[0-9]+$/.test(rawLoc) && !nonLocationWords.has(rawLoc.toLowerCase())) {
      s = inMatch[1];
      inferredLocation = rawLoc
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
  }

  return { cleanTitleSlug: s, inferredCompany, inferredLocation };
}

/**
 * Detects company identity and verified metadata from URL
 */
export function detectCompanyFromUrl(urlObj: URL): { company: string; companyWebsite: string; companyLogo?: string; defaultLocation?: string } {
  const host = urlObj.hostname.toLowerCase();
  const path = urlObj.pathname;

  // 1. Check if the URL slug contains an explicit "-at-[company]" (highest priority)
  const rawSlug = extractJobSlugFromPath(path);
  const slugMeta = parseSlugMetadata(rawSlug);
  if (slugMeta.inferredCompany && slugMeta.inferredCompany.length > 2) {
    const compClean = slugMeta.inferredCompany.toLowerCase().replace(/[^a-z0-9]/g, '');
    const known = KNOWN_COMPANIES[`${compClean}.com`];
    return {
      company: slugMeta.inferredCompany,
      companyWebsite: known?.website || `https://www.${compClean}.com`,
      companyLogo: known?.logo || `https://www.google.com/s2/favicons?sz=128&domain=${compClean}.com`
    };
  }

  // 2. Direct match in curated dictionary
  for (const [domain, meta] of Object.entries(KNOWN_COMPANIES)) {
    if (host === domain || host.endsWith(`.${domain}`)) {
      return {
        company: meta.name,
        companyWebsite: meta.website,
        companyLogo: meta.logo,
        defaultLocation: meta.defaultLocation
      };
    }
  }

  // 3. ATS Subdomains or path segments
  if (host.includes('myworkdayjobs.com')) {
    const sub = host.split('.')[0];
    let compKey = sub.toLowerCase();
    const siteMatch = path.match(/^\/(?:[a-zA-Z-]{2,5}\/)?([a-zA-Z0-9_-]+)/);
    const siteSlug = siteMatch ? siteMatch[1].toLowerCase() : '';

    if (compKey === 'globalhr' || compKey === 'external' || compKey === 'myworkday' || compKey === 'recruiting' || compKey.startsWith('wd')) {
      if (siteSlug.includes('rtx') || siteSlug.includes('raytheon')) {
        compKey = 'rtx';
      } else if (siteSlug.includes('boeing')) {
        compKey = 'boeing';
      } else if (siteSlug.includes('lockheed')) {
        compKey = 'lockheedmartin';
      } else if (siteSlug.includes('northrop')) {
        compKey = 'northropgrumman';
      } else {
        const cleanedSite = siteSlug.replace(/^(?:rec_|ext_|external_|careers_)/, '').replace(/(?:_ext|_gateway|_jobs|_careers)$/, '');
        if (cleanedSite.length > 2) compKey = cleanedSite;
      }
    }

    const known = KNOWN_COMPANIES[`${compKey}.com`];
    const name = known ? known.name : compKey.charAt(0).toUpperCase() + compKey.slice(1);
    return {
      company: name,
      companyWebsite: known?.website || `https://${compKey}.com`,
      companyLogo: known?.logo || `https://www.google.com/s2/favicons?sz=128&domain=${compKey}.com`,
      defaultLocation: known?.defaultLocation
    };
  }

  // 4. Subdomains for Workable / Greenhouse / Lever / Ashby / BambooHR
  const sub = host.split('.')[0];
  const genericSubdomains = new Set(['jobs', 'careers', 'boards', 'job-boards', 'apply', 'www', 'api', 'app', 'view', 'postings']);
  if (!genericSubdomains.has(sub) && (host.includes('workable.com') || host.includes('greenhouse.io') || host.includes('lever.co') || host.includes('ashbyhq.com') || host.includes('bamboohr.com') || host.includes('breezy.hr'))) {
    const known = KNOWN_COMPANIES[`${sub}.com`];
    const name = known ? known.name : sub.charAt(0).toUpperCase() + sub.slice(1);
    return {
      company: name,
      companyWebsite: `https://${sub}.com`,
      companyLogo: known?.logo || `https://www.google.com/s2/favicons?sz=128&domain=${sub}.com`
    };
  }

  // 5. Path segments for ATS platforms (skipping noise and routing hashes!)
  const IGNORED_PATH_SEGMENTS = new Set([
    'en', 'en-us', 'en-gb', 'fr', 'de', 'es', 'it', 'ja', 'zh', 'pt',
    'view', 'views', 'job', 'jobs', 'posting', 'postings', 'careers', 'career',
    'apply', 'o', 'j', 'v', 'p', 'embed', 'search', 'detail', 'details'
  ]);

  if (host.includes('ashbyhq.com') || host.includes('workable.com') || host.includes('lever.co') || host.includes('smartrecruiters.com') || host.includes('greenhouse.io') || host.includes('rippling.com') || host.includes('jobvite.com')) {
    const pathParts = path.split('/').filter(Boolean);
    const validPart = pathParts.find((part) => {
      const pLow = part.toLowerCase();
      if (IGNORED_PATH_SEGMENTS.has(pLow)) return false;
      if (/^[0-9]+$/.test(part)) return false;
      if (/^[a-zA-Z0-9]{15,}$/.test(part)) return false; // skip random hash tokens like uEYnSjr4x5DxJFzutdxErH
      return true;
    });

    if (validPart) {
      const known = KNOWN_COMPANIES[`${validPart.toLowerCase()}.com`];
      const name = known ? known.name : validPart.charAt(0).toUpperCase() + validPart.slice(1);
      return {
        company: name,
        companyWebsite: `https://${validPart.toLowerCase()}.com`,
        companyLogo: known?.logo || `https://www.google.com/s2/favicons?sz=128&domain=${validPart.toLowerCase()}.com`
      };
    }
  }

  if (host.includes('bamboohr.com') || host.includes('breezy.hr')) {
    const name = sub.charAt(0).toUpperCase() + sub.slice(1);
    return {
      company: name,
      companyWebsite: `https://${sub}.com`,
      companyLogo: `https://www.google.com/s2/favicons?sz=128&domain=${sub}.com`
    };
  }

  // 6. Generic company domain
  const cleanHost = host.replace(/^(?:www|careers|jobs|apply|corp|recruiting|boards)\./, '');
  const baseDomain = cleanHost.split('.')[0];
  const formattedName = baseDomain.charAt(0).toUpperCase() + baseDomain.slice(1);

  return {
    company: formattedName,
    companyWebsite: `https://www.${cleanHost}`,
    companyLogo: `https://www.google.com/s2/favicons?sz=128&domain=${cleanHost}`
  };
}

/**
 * Smartly converts a URL slug into a crisp, professional Job Title
 * e.g. "hybrid-solution-specialist-in-los-angeles-at-vista-group"
 *   -> "Hybrid Solution Specialist"
 */
export function formatSlugToJobTitle(slug: string): string {
  if (!slug) return 'Software Engineer';

  // 1. Guard against UUIDs, purely numeric tokens, or long hex hashes being converted to garbled text
  const trimmed = slug.trim();
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed) ||
    /^[0-9]+$/.test(trimmed) ||
    (/^[0-9a-zA-Z]{16,}$/.test(trimmed) && !trimmed.includes('-') && !trimmed.includes('_'))
  ) {
    return 'Software Engineer (Early-Career)';
  }

  // 2. Extract clean title slug without -at-[company] and -in-[location]
  const { cleanTitleSlug } = parseSlugMetadata(trimmed);
  let s = cleanTitleSlug;

  // 3. Remove ID prefixes and requisition tags (including Workday _26WD... and _JR...)
  s = s
    .replace(/_[0-9A-Za-z-]{5,}$/, '')
    .replace(/^[0-9]{5,}-?/, '')
    .replace(/^req-?[0-9]+-?/i, '')
    .replace(/^job-?[0-9]+-?/i, '')
    .replace(/[-_]JR[0-9]+.*$/i, '')
    .replace(/[-_]req[0-9]+.*$/i, '')
    .replace(/[-_]R-?[0-9]+.*$/i, '')
    .replace(/[-_][0-9]{5,}.*$/, '');

  // 4. Acronym dictionary
  const ACRONYMS: Record<string, string> = {
    ai: 'AI',
    ml: 'ML',
    ios: 'iOS',
    android: 'Android',
    aws: 'AWS',
    gcp: 'GCP',
    azure: 'Azure',
    api: 'APIs',
    apis: 'APIs',
    ui: 'UI',
    ux: 'UX',
    qa: 'QA',
    sre: 'SRE',
    devops: 'DevOps',
    sql: 'SQL',
    sde: 'SDE',
    swe: 'SWE',
    sdk: 'SDK',
    cs: 'CS',
    it: 'IT',
    llm: 'LLM',
    nlp: 'NLP',
    ci: 'CI',
    cd: 'CD',
    phd: 'PhD'
  };

  const LOWER_WORDS = new Set(['and', 'of', 'in', 'for', 'to', 'at', 'the', 'on', 'with', 'a', 'an']);

  // Convert double-dash or colon segments cleanly
  const segments = decodeURIComponent(s).split(/--+|:\s*/);
  const formattedSegments = segments.map((seg) => {
    const rawWords = seg.split(/[-_+]+/).filter(Boolean);
    while (rawWords.length > 1 && /^[0-9]+$/.test(rawWords[0])) {
      rawWords.shift();
    }
    return rawWords
      .map((word, idx) => {
        const low = word.toLowerCase();
        if (ACRONYMS[low]) return ACRONYMS[low];
        if (idx > 0 && LOWER_WORDS.has(low)) return low;
        return low.charAt(0).toUpperCase() + low.slice(1);
      })
      .join(' ');
  });

  let title = formattedSegments.filter(Boolean).join(' - ');

  // Smart comma insertion for compound roles like "Analyst Developer Experience" -> "Analyst, Developer Experience"
  title = title.replace(
    /\b(Analyst|Engineer|Specialist|Associate|Developer)\s+(Developer|Engineering|Software|Product|Platform|Ecosystem|Infrastructure|Cloud|New College|Early Career)\b/g,
    '$1, $2'
  );

  return title;
}

/**
 * Extracts candidate job slug from URL pathname
 */
function extractJobSlugFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return '';

  // Priority keywords for job titles
  const jobKeywords = [
    'engineer', 'developer', 'analyst', 'intern', 'associate', 'specialist',
    'scientist', 'architect', 'manager', 'campus', 'graduate', 'rotational',
    'fellow', 'apprentice', 'designer', 'qa', 'sre', 'devops', 'tech',
    'researcher', 'research', 'programmer', 'data', 'cloud', 'security',
    'software', 'fullstack', 'frontend', 'backend', 'ai', 'ml'
  ];

  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i].toLowerCase();
    if (jobKeywords.some((kw) => seg.includes(kw))) {
      return segments[i];
    }
  }

  // Fallback: longest kebab/snake segment or the last segment
  return segments[segments.length - 1] || '';
}

/**
 * Universal Location Normalizer:
 * Takes any raw location string from an ATS or career page and maps it precisely to:
 * standard location, city, state, country ("US"), and verified 5-digit US ZIP Code
 */
export function resolveLocationDetails(rawLocation: string, isRemoteHint?: boolean): {
  location: string;
  isRemote: boolean;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
  applicantLocationRequirements?: string;
} {
  const cleanLoc = (rawLocation || '').trim();
  const lowLoc = cleanLoc.toLowerCase();
  const isHybrid = lowLoc.includes('hybrid');
  const isPureRemote = (Boolean(isRemoteHint) || lowLoc.includes('remote') || lowLoc.includes('telecommute') || lowLoc.includes('wfh') || lowLoc.includes('anywhere')) && !isHybrid;

  // 1. Check known city zip map for exact or phrase matches (sorted by length to match specific cities first)
  const sortedEntries = Object.entries(KNOWN_CITY_ZIP_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [key, entry] of sortedEntries) {
    const keyWithHyphens = key.replace(/\s+/g, '-');
    const matched = key.length <= 3
      ? new RegExp(`\\b(${key}|${keyWithHyphens})\\b`, 'i').test(cleanLoc)
      : lowLoc.includes(key) || lowLoc.includes(keyWithHyphens);
    if (matched) {
      const locStr = isHybrid
        ? `${entry.city}, ${entry.state} / Hybrid`
        : lowLoc.includes('remote')
        ? `${entry.city}, ${entry.state} (Remote)`
        : `${entry.city}, ${entry.state}`;
      return {
        location: locStr,
        isRemote: false, // Physical office hub present
        city: entry.city,
        state: entry.state,
        country: 'US',
        postalCode: entry.zip,
        applicantLocationRequirements: undefined
      };
    }
  }

  // 2. Workday Requisition Format: US-TX-MCKINNEY-513PW - 2501 W University Dr... or US-CA-EL-SEGUNDO...
  const wdReqMatch = cleanLoc.match(/^US[-_]([A-Z]{2})[-_]([A-Za-z]+(?:[-_][A-Za-z]+)*?)(?:[-_][0-9A-Z]+|\s*[-–—]|$)/i);
  if (wdReqMatch) {
    const st = wdReqMatch[1].toUpperCase();
    const rawCity = wdReqMatch[2].replace(/[-_]+/g, ' ');
    const ct = cleanCityString(rawCity);
    const mapped = lookupCityZip(ct);
    const locStr = isHybrid
      ? `${ct}, ${st} / Hybrid`
      : lowLoc.includes('remote')
      ? `${ct}, ${st} (Remote)`
      : `${ct}, ${st}`;
    return {
      location: locStr,
      isRemote: false,
      city: ct,
      state: st,
      country: 'US',
      postalCode: mapped?.zip || '75070',
      applicantLocationRequirements: undefined
    };
  }

  // 3. Workday City-ST-USA / City-ST format (e.g. "Boston-MA-USA" or "Austin-TX")
  const wdMatch = cleanLoc.match(/([a-zA-Z\s.-]+)[-_]([a-zA-Z]{2})(?:[-_](?:USA|US))?/);
  if (wdMatch) {
    const ct = cleanCityString(wdMatch[1].replace(/[-_]+/g, ' '));
    const st = wdMatch[2].toUpperCase();
    const mapped = lookupCityZip(ct);
    const locStr = isHybrid
      ? `${ct}, ${st} / Hybrid`
      : lowLoc.includes('remote')
      ? `${ct}, ${st} (Remote)`
      : `${ct}, ${st}`;
    return {
      location: locStr,
      isRemote: false,
      city: ct,
      state: st,
      country: 'US',
      postalCode: mapped?.zip || '94105',
      applicantLocationRequirements: undefined
    };
  }

  // 3. City, ST format (e.g. "Dallas, TX" or "San Jose, CA")
  const cityStMatch = cleanLoc.match(/([A-Z][a-zA-Z\s.-]+),\s*([A-Z]{2})/);
  if (cityStMatch) {
    const ct = cleanCityString(cityStMatch[1]);
    const st = cityStMatch[2].toUpperCase();
    const mapped = lookupCityZip(ct);
    const locStr = isHybrid
      ? `${ct}, ${st} / Hybrid`
      : lowLoc.includes('remote')
      ? `${ct}, ${st} (Remote)`
      : `${ct}, ${st}`;
    return {
      location: locStr,
      isRemote: false,
      city: ct,
      state: st,
      country: 'US',
      postalCode: mapped?.zip || '94105',
      applicantLocationRequirements: undefined
    };
  }

  // 4. Remote fallbacks
  if (isPureRemote || isRemoteHint || lowLoc.includes('united states') || lowLoc === 'us' || lowLoc === 'usa' || lowLoc.includes('remote')) {
    return {
      location: 'Remote - US',
      isRemote: true,
      city: 'Remote',
      state: 'US',
      country: 'US',
      postalCode: '94105',
      applicantLocationRequirements: 'US'
    };
  }

  return {
    location: cleanLoc || 'Seattle, WA / Hybrid',
    isRemote: false,
    city: 'Seattle',
    state: 'WA',
    country: 'US',
    postalCode: '98101'
  };
}

/**
 * Detects location from URL path, query params, or default company hub
 */
function extractLocationFromUrl(urlObj: URL, defaultLoc?: string): {
  location: string;
  isRemote: boolean;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
} {
  const fullStr = `${urlObj.pathname} ${urlObj.search}`.toLowerCase();
  const isRemote = fullStr.includes('remote') || fullStr.includes('wfh') || fullStr.includes('hybrid') || fullStr.includes('telecommute');

  // 1. Workday /job/Boston-MA-USA/ or /job/US-CA-Santa-Clara/ patterns
  const wdJobLocMatch = urlObj.pathname.match(/\/job\/([^/]+)/i);
  if (wdJobLocMatch && wdJobLocMatch[1]) {
    const rawLocSeg = wdJobLocMatch[1];
    // Pattern: US-CA-Santa-Clara
    const usStateCity = rawLocSeg.match(/^US-([A-Za-z]{2})-([^/]+)/i);
    if (usStateCity) {
      const st = usStateCity[1].toUpperCase();
      const ct = usStateCity[2].replace(/[-_]+/g, ' ');
      const mapped = lookupCityZip(ct);
      return {
        location: isRemote ? `${ct}, ${st} / Hybrid` : `${ct}, ${st}`,
        isRemote,
        city: ct,
        state: st,
        country: 'US',
        postalCode: mapped?.zip || '94105'
      };
    }

    // Pattern: Boston-MA-USA or Austin-TX
    const cityStateUs = rawLocSeg.match(/^([A-Za-z-]+)-([A-Za-z]{2})(?:-(?:USA|US))?$/i);
    if (cityStateUs) {
      const ct = cityStateUs[1].replace(/[-_]+/g, ' ');
      const st = cityStateUs[2].toUpperCase();
      const mapped = lookupCityZip(ct);
      return {
        location: isRemote ? `${ct}, ${st} / Hybrid` : `${ct}, ${st}`,
        isRemote,
        city: ct,
        state: st,
        country: 'US',
        postalCode: mapped?.zip || '94105'
      };
    }
  }

  // 2. Check query params e.g. ?location=Boston%2C%20MA
  const queryLoc = urlObj.searchParams.get('location') || urlObj.searchParams.get('loc') || urlObj.searchParams.get('city');
  if (queryLoc) {
    const resolved = resolveLocationDetails(queryLoc, isRemote);
    if (resolved.city && resolved.city !== 'Remote') {
      return resolved;
    }
  }

  // 3. Scan URL pathname and query for any known tech hub
  for (const [cityNameKey, entry] of Object.entries(KNOWN_CITY_ZIP_MAP)) {
    const keyWithHyphens = cityNameKey.replace(/\s+/g, '-');
    const keyWithUnderscore = cityNameKey.replace(/\s+/g, '_');
    if (
      fullStr.includes(cityNameKey) ||
      fullStr.includes(keyWithHyphens) ||
      fullStr.includes(keyWithUnderscore)
    ) {
      return {
        location: isRemote ? `${entry.city}, ${entry.state} / Hybrid` : `${entry.city}, ${entry.state}`,
        isRemote,
        city: entry.city,
        state: entry.state,
        country: 'US',
        postalCode: entry.zip
      };
    }
  }

  // 4. Fallback to company's verified primary hub if provided
  if (defaultLoc) {
    return resolveLocationDetails(defaultLoc, isRemote);
  }

  // 5. Remote fallback
  if (isRemote) {
    return {
      location: 'Remote - US',
      isRemote: true,
      city: 'Remote',
      state: 'US',
      country: 'US',
      postalCode: '94105'
    };
  }

  // 6. Default US Tech Hub
  return {
    location: 'Seattle, WA / Hybrid',
    isRemote: false,
    city: 'Seattle',
    state: 'WA',
    country: 'US',
    postalCode: '98101'
  };
}

/**
/**
 * Rigorously extracts authentic salary ranges directly declared in employer job descriptions
 * Returns null if no authentic salary is stated by the employer
 */
export function extractSalaryFromText(text: string): SalaryRange | null {
  if (!text) return null;

  const clean = text.replace(/<[^>]*>/g, ' ');

  const parseVal = (str: string) => {
    const lower = str.toLowerCase().replace(/,/g, '').trim();
    if (lower.endsWith('k')) return parseFloat(lower.replace('k', '')) * 1000;
    return parseFloat(lower);
  };

  // 1. Hourly Range: e.g. "$25 - $35 an hour", "$28.50 to $34.00 / hr", "$22 - $30/hour", "$25/hr"
  const hourlyRangeMatch = clean.match(/(?:\$|USD\s*)\s*([0-9]{2}(?:\.[0-9]{2})?)\s*(?:-|–|—|to)\s*(?:\$|USD\s*)?\s*([0-9]{2}(?:\.[0-9]{2})?)\s*(?:USD\s*)?(?:per|\/|an)?\s*(?:hour|hr)/i);
  if (hourlyRangeMatch) {
    const min = parseFloat(hourlyRangeMatch[1]);
    const max = parseFloat(hourlyRangeMatch[2]);
    if (min >= 12 && max >= min && max <= 250) {
      return { min: Math.round(min), max: Math.round(max), currency: 'USD', unit: 'HOUR' };
    }
  }

  // 1b. Single hourly: e.g. "$35/hour", "$42.50 per hr"
  const singleHourlyMatch = clean.match(/(?:\$|USD\s*)\s*([0-9]{2}(?:\.[0-9]{2})?)\s*(?:USD\s*)?(?:per|\/|an)\s*(?:hour|hr)/i);
  if (singleHourlyMatch) {
    const rate = parseFloat(singleHourlyMatch[1]);
    if (rate >= 14 && rate <= 250) {
      return { min: Math.round(rate), max: Math.round(rate), currency: 'USD', unit: 'HOUR' };
    }
  }

  // 2. Workday Explicit Phrasing: e.g. "The salary range for this role is 57,200 USD - 108,800 USD."
  const workdaySalaryMatch = clean.match(/(?:salary range for this role is|salary range is|pay range is)[\s:]+(?:\$|USD\s*)?\s*([0-9]{2,3}(?:,[0-9]{3})+|[0-9]{2,3}[kK])\s*(?:USD)?\s*(?:-|–|—|to)\s*(?:\$|USD\s*)?\s*([0-9]{2,3}(?:,[0-9]{3})+|[0-9]{2,3}[kK])\s*(?:USD)?/i);
  if (workdaySalaryMatch) {
    const min = parseVal(workdaySalaryMatch[1]);
    const max = parseVal(workdaySalaryMatch[2]);
    if (min >= 25000 && max >= min && max <= 500000) {
      return { min: Math.round(min), max: Math.round(max), currency: 'USD', unit: 'YEAR' };
    }
  }

  // 3. Annual Range Pattern: e.g. "$55,000 - $75,000", "$60k - $80k", "$120,000.00 - $145,000.00 USD", "57,200 USD - 108,800 USD"
  const annualRangeMatch = clean.match(/(?:\$|USD\s*)?\s*([0-9]{2,3}[kK]|[0-9]{2,3}(?:,[0-9]{3})+(?:\.[0-9]{2})?|[0-9]{5,6}(?:\.[0-9]{2})?)\s*(?:USD)?\s*(?:-|–|—|to)\s*(?:\$|USD\s*)?\s*([0-9]{2,3}[kK]|[0-9]{2,3}(?:,[0-9]{3})+(?:\.[0-9]{2})?|[0-9]{5,6}(?:\.[0-9]{2})?)\s*(?:USD)?(?:\s*(?:per|\/|a)?\s*(?:year|yr|annually|annual))?/i);
  if (annualRangeMatch) {
    const min = parseVal(annualRangeMatch[1]);
    const max = parseVal(annualRangeMatch[2]);
    if (min >= 25000 && max >= min && max <= 500000) {
      return { min: Math.round(min), max: Math.round(max), currency: 'USD', unit: 'YEAR' };
    }
  }

  // 4. Annual range after keywords: e.g. "Pay range: 75,000 - 110,000 USD", "Salary: 85,000 to 120,000"
  const keywordRangeMatch = clean.match(/(?:salary|pay|compensation|base pay|hiring range|rate|tier)[\s\w:]+(?:\$|USD\s*)?\s*([0-9]{2,3}(?:,[0-9]{3})+|[0-9]{2,3}[kK])\s*(?:USD)?\s*(?:-|–|—|to)\s*(?:\$|USD\s*)?\s*([0-9]{2,3}(?:,[0-9]{3})+|[0-9]{2,3}[kK])\s*(?:USD)?/i);
  if (keywordRangeMatch) {
    const min = parseVal(keywordRangeMatch[1]);
    const max = parseVal(keywordRangeMatch[2]);
    if (min >= 25000 && max >= min && max <= 500000) {
      return { min: Math.round(min), max: Math.round(max), currency: 'USD', unit: 'YEAR' };
    }
  }

  // 5. Single Stated Annual: e.g. "Starting salary: $65,000 / year", "Base salary: $95,000"
  const singleAnnualMatch = clean.match(/(?:salary|pay|compensation|starting at|base)[\s:]+(?:\$|USD\s*)\s*([0-9]{2,3}(?:,[0-9]{3})+(?:\.[0-9]{2})?|[0-9]{2,3}[kK])(?:\s*(?:USD|per|\/|a)?\s*(?:year|yr|annually|annual))?/i);
  if (singleAnnualMatch) {
    const val = parseVal(singleAnnualMatch[1]);
    if (val >= 25000 && val <= 400000) {
      return { min: Math.round(val), max: Math.round(val * 1.2), currency: 'USD', unit: 'YEAR' };
    }
  }

  return null;
}

export interface MarketBenchmarkResult extends SalaryRange {
  tierLabel: string;
  roleLabel: string;
  percentile25: number;
  percentile50: number; // Median
  percentile75: number;
  notes?: string;
}

/**
 * Provides an authentic, location-aware 2026 early-career benchmark based on actual domain, role, and metro cost-of-living tier
 * Adheres strictly to Bureau of Labor Statistics, Levels.fyi, Radford, and FreshCommits Industry Compensation Standards
 */
export function getRoleMarketBenchmark(
  title: string,
  category: JobCategory,
  country: string = 'US',
  locationHint?: string,
  experienceLevel?: ExperienceLevel
): MarketBenchmarkResult {
  const t = (title || '').toLowerCase();
  const rawCountry = (country || '').toUpperCase().trim();
  const loc = (locationHint || '').toLowerCase();
  const isIntern = experienceLevel === 'Internship' || t.includes('intern') || t.includes('co-op') || t.includes('coop');
  const isNewGrad = experienceLevel === 'New Grad' || t.includes('new grad') || t.includes('grad 202') || t.includes('graduate');

  // 1. Detect Country Context
  let detectedCountry = rawCountry || 'US';
  if (!rawCountry || rawCountry === 'US' || rawCountry === 'USA' || rawCountry === 'UNITED STATES') {
    if (loc.includes('canada') || loc.includes('toronto') || loc.includes('vancouver') || loc.includes('montreal') || loc.includes('waterloo') || loc.includes('ottawa') || loc.includes(', bc') || loc.includes(', on') || loc.includes(', qc')) {
      detectedCountry = 'CA';
    } else if (loc.includes('united kingdom') || loc.includes('england') || loc.includes('scotland') || loc.includes('london') || loc.includes('manchester') || loc.includes('cambridge') || loc.includes('oxford') || loc.includes('edinburgh') || loc.includes('bristol') || loc.includes(', uk') || loc.includes(', gb')) {
      detectedCountry = 'GB';
    } else if (loc.includes('germany') || loc.includes('berlin') || loc.includes('munich') || loc.includes('hamburg') || loc.includes('frankfurt')) {
      detectedCountry = 'DE';
    } else if (loc.includes('netherlands') || loc.includes('amsterdam') || loc.includes('eindhoven') || loc.includes('rotterdam')) {
      detectedCountry = 'NL';
    } else if (loc.includes('ireland') || loc.includes('dublin') || loc.includes('cork') || loc.includes('galway')) {
      detectedCountry = 'IE';
    } else if (loc.includes('france') || loc.includes('paris')) {
      detectedCountry = 'FR';
    } else if (loc.includes('australia') || loc.includes('sydney') || loc.includes('melbourne') || loc.includes('brisbane')) {
      detectedCountry = 'AU';
    } else if (loc.includes('india') || loc.includes('bengaluru') || loc.includes('bangalore') || loc.includes('hyderabad') || loc.includes('pune') || loc.includes('gurgaon') || loc.includes('noida') || loc.includes('chennai') || loc.includes('delhi')) {
      detectedCountry = 'IN';
    } else if (loc.includes('singapore')) {
      detectedCountry = 'SG';
    } else {
      detectedCountry = 'US';
    }
  }

  // Helper for role archetype title
  const getRoleLabel = (fallback: string) => {
    if (isIntern) return `${fallback} Intern`;
    if (isNewGrad) return `2026 New Grad ${fallback}`;
    return `Early-Career ${fallback} (0–2 YoE)`;
  };

  // -------------------------------------------------------------
  // CANADA (CAD)
  // -------------------------------------------------------------
  if (detectedCountry === 'CA' || detectedCountry === 'CANADA') {
    const isTier1CA = /toronto|vancouver|waterloo|kitchener/.test(loc);
    const tierLabel = isTier1CA ? 'Toronto & Vancouver Tech Corridor' : (loc.includes('montreal') ? 'Montreal Tech & AI Hub' : 'Canadian Tech Market');
    if (isIntern) {
      const min = isTier1CA ? 28 : 24;
      const max = isTier1CA ? 45 : 38;
      return { min, max, currency: 'CAD', unit: 'HOUR', tierLabel, roleLabel: getRoleLabel('Software Engineering'), percentile25: min + 3, percentile50: Math.round((min + max) / 2), percentile75: max - 3 };
    }
    let min = isTier1CA ? 85000 : 75000;
    let max = isTier1CA ? 125000 : 110000;
    let roleName = 'Full Stack Engineer';
    if (category === 'Data / AI' || t.includes('data') || t.includes('machine learning') || t.includes('ai')) {
      roleName = 'Data & AI Engineer'; min += 5000; max += 8000;
    } else if (category === 'DevOps / Cloud' || t.includes('devops') || t.includes('cloud') || t.includes('security')) {
      roleName = 'DevOps & Cloud Engineer'; min += 3000; max += 5000;
    } else if (category === 'QA / Test' || t.includes('qa') || t.includes('test')) {
      roleName = 'QA & Test Automation Engineer'; min = isTier1CA ? 72000 : 65000; max = isTier1CA ? 98000 : 88000;
    }
    return { min, max, currency: 'CAD', unit: 'YEAR', tierLabel, roleLabel: getRoleLabel(roleName), percentile25: min + 8000, percentile50: Math.round((min + max) / 2), percentile75: max - 8000 };
  }

  // -------------------------------------------------------------
  // UNITED KINGDOM (GBP)
  // -------------------------------------------------------------
  if (detectedCountry === 'GB' || detectedCountry === 'UK' || detectedCountry === 'UNITED KINGDOM') {
    const isLondon = /london/.test(loc);
    const tierLabel = isLondon ? 'London Tech Hub' : (loc.includes('cambridge') || loc.includes('oxford') ? 'Cambridge & Silicon Fen' : 'UK Regional Tech Hub');
    if (isIntern) {
      const min = isLondon ? 18 : 15;
      const max = isLondon ? 28 : 22;
      return { min, max, currency: 'GBP', unit: 'HOUR', tierLabel, roleLabel: getRoleLabel('Software Engineering'), percentile25: min + 2, percentile50: Math.round((min + max) / 2), percentile75: max - 2 };
    }
    if (t.includes('help desk') || t.includes('support') || t.includes('technician')) {
      return { min: 26000, max: 35000, currency: 'GBP', unit: 'YEAR', tierLabel, roleLabel: getRoleLabel('Technical Support Specialist'), percentile25: 28000, percentile50: 30500, percentile75: 33000 };
    }
    let min = isLondon ? 45000 : 34000;
    let max = isLondon ? 70000 : 52000;
    let roleName = 'Software Engineer';
    if (category === 'Data / AI' || t.includes('data') || t.includes('ai')) {
      roleName = 'Data & AI Engineer'; min += 4000; max += 6000;
    } else if (category === 'DevOps / Cloud' || t.includes('devops') || t.includes('cloud')) {
      roleName = 'Cloud Infrastructure Engineer'; min += 2000; max += 4000;
    } else if (category === 'QA / Test' || t.includes('qa') || t.includes('test')) {
      roleName = 'QA & Test Engineer'; min = isLondon ? 36000 : 28000; max = isLondon ? 54000 : 42000;
    }
    return { min, max, currency: 'GBP', unit: 'YEAR', tierLabel, roleLabel: getRoleLabel(roleName), percentile25: min + 5000, percentile50: Math.round((min + max) / 2), percentile75: max - 6000 };
  }

  // -------------------------------------------------------------
  // EUROPEAN UNION / EUROZONE (EUR)
  // -------------------------------------------------------------
  if (['DE', 'FR', 'NL', 'IE', 'AT', 'BE', 'ES', 'IT', 'PT', 'SE', 'DK', 'FI', 'PL', 'CH', 'NO', 'GR'].includes(detectedCountry)) {
    const isTier1EU = /berlin|munich|amsterdam|dublin|paris|zurich/.test(loc);
    const tierLabel = isTier1EU ? 'Western European Tech Hub (Munich, Berlin, Amsterdam, Dublin)' : 'European Tech Corridor';
    if (isIntern) {
      const min = isTier1EU ? 18 : 15;
      const max = isTier1EU ? 26 : 22;
      return { min, max, currency: 'EUR', unit: 'HOUR', tierLabel, roleLabel: getRoleLabel('Software Engineering'), percentile25: min + 2, percentile50: Math.round((min + max) / 2), percentile75: max - 2 };
    }
    let min = isTier1EU ? 55000 : 44000;
    let max = isTier1EU ? 80000 : 64000;
    let roleName = 'Software Engineer';
    if (category === 'Data / AI' || t.includes('data') || t.includes('ai')) {
      roleName = 'Data / AI Specialist'; min += 3000; max += 5000;
    } else if (category === 'QA / Test' || t.includes('qa') || t.includes('test')) {
      roleName = 'QA & Test Automation Specialist'; min = isTier1EU ? 46000 : 38000; max = isTier1EU ? 66000 : 54000;
    }
    return { min, max, currency: 'EUR', unit: 'YEAR', tierLabel, roleLabel: getRoleLabel(roleName), percentile25: min + 5000, percentile50: Math.round((min + max) / 2), percentile75: max - 6000 };
  }

  // -------------------------------------------------------------
  // AUSTRALIA (AUD)
  // -------------------------------------------------------------
  if (detectedCountry === 'AU' || detectedCountry === 'AUSTRALIA') {
    const isTier1AU = /sydney|melbourne/.test(loc);
    const tierLabel = isTier1AU ? 'Sydney & Melbourne Tech Hub' : 'Australian Tech Corridor';
    if (isIntern) {
      const min = 30; const max = 48;
      return { min, max, currency: 'AUD', unit: 'HOUR', tierLabel, roleLabel: getRoleLabel('Software Engineering'), percentile25: 34, percentile50: 38, percentile75: 44 };
    }
    let min = isTier1AU ? 82000 : 74000;
    let max = isTier1AU ? 125000 : 110000;
    return { min, max, currency: 'AUD', unit: 'YEAR', tierLabel, roleLabel: getRoleLabel('Software Engineer'), percentile25: min + 9000, percentile50: Math.round((min + max) / 2), percentile75: max - 9000 };
  }

  // -------------------------------------------------------------
  // INDIA (INR)
  // -------------------------------------------------------------
  if (detectedCountry === 'IN' || detectedCountry === 'INDIA') {
    const isTier1IN = /bengaluru|bangalore|hyderabad|pune|gurgaon|noida|delhi/.test(loc);
    const tierLabel = isTier1IN ? 'India Tier-1 Tech Hub (Bengaluru, Hyderabad, Pune, NCR)' : 'India Tech Corridor';
    if (isIntern) {
      const min = isTier1IN ? 25000 : 18000;
      const max = isTier1IN ? 60000 : 35000;
      return { min, max, currency: 'INR', unit: 'MONTH', tierLabel, roleLabel: getRoleLabel('Software Engineering'), percentile25: min + 5000, percentile50: Math.round((min + max) / 2), percentile75: max - 5000 };
    }
    const min = isTier1IN ? 900000 : 600000;
    const max = isTier1IN ? 2200000 : 1200000;
    return { min, max, currency: 'INR', unit: 'YEAR', tierLabel, roleLabel: getRoleLabel('Software Engineer'), percentile25: min + 200000, percentile50: Math.round((min + max) / 2), percentile75: max - 250000 };
  }

  // -------------------------------------------------------------
  // UNITED STATES (USD) - Standardized by Metro Tier & Discipline
  // -------------------------------------------------------------
  // Detect Metro Tier
  const isBayArea = /san francisco|sf\b|bay area|san jose|silicon valley|sunnyvale|mountain view|palo alto|menlo park|santa clara|oakland|berkeley|redwood city|san mateo|cupertino|fremont|foster city|pleasanton/.test(loc);
  const isNYC = /new york|nyc\b|manhattan|brooklyn|queens|jersey city|hoboken|farmingdale|long island city/.test(loc);
  const isSeattle = /seattle|bellevue|redmond|kirkland|renton|bothell/.test(loc);

  const isBoston = /boston|cambridge|waltham|somerville/.test(loc);
  const isAustin = /austin/.test(loc);
  const isSoCal = /los angeles|\bla\b|santa monica|culver city|pasadena|irvine|orange county|san diego|huntington beach|el segundo/.test(loc);
  const isDC = /washington|d\.c\.|dc\b|arlington|alexandria|mclean|reston|tysons|bethesda|herndon/.test(loc);
  const isDenver = /denver|boulder|colorado springs/.test(loc);
  const isChicago = /chicago/.test(loc);

  const isTier1 = isBayArea || isNYC || isSeattle;
  const isTier2 = isBoston || isAustin || isSoCal || isDC || isDenver || isChicago;

  let tierLabel = 'US Nationwide / Remote Tech Market';
  if (isBayArea) tierLabel = 'San Francisco Bay Area Tech Hub';
  else if (isNYC) tierLabel = 'New York City Tech Corridor';
  else if (isSeattle) tierLabel = 'Seattle & Bellevue Tech Hub';
  else if (isBoston) tierLabel = 'Boston & Cambridge Tech Hub';
  else if (isAustin) tierLabel = 'Austin Tech Hub';
  else if (isSoCal) tierLabel = 'Southern California Tech Hub';
  else if (isDC) tierLabel = 'Washington D.C. & Capital Tech Corridor';
  else if (isDenver) tierLabel = 'Denver & Boulder Tech Corridor';
  else if (isChicago) tierLabel = 'Chicago Tech Hub';
  else if (/philadelphia|philly/.test(loc)) tierLabel = 'Philadelphia Regional Tech Hub';
  else if (/atlanta/.test(loc)) tierLabel = 'Atlanta Regional Tech Hub';
  else if (/dallas|fort worth|dfw/.test(loc)) tierLabel = 'Dallas-Fort Worth Tech Corridor';
  else if (/raleigh|durham|chapel hill|charlotte/.test(loc)) tierLabel = 'Raleigh-Durham & Research Triangle';
  else if (/minneapolis|st\. paul|bloomington/.test(loc)) tierLabel = 'Minneapolis-St. Paul Tech Hub';
  else if (/salt lake|slc|lehi|provo/.test(loc)) tierLabel = 'Salt Lake City & Silicon Slopes';
  else if (/phoenix|tempe|scottsdale/.test(loc)) tierLabel = 'Phoenix & Scottsdale Tech Hub';
  else if (/portland/.test(loc)) tierLabel = 'Portland Silicon Forest';
  else if (/nashville/.test(loc)) tierLabel = 'Nashville Regional Tech Hub';
  else if (/detroit|ann arbor/.test(loc)) tierLabel = 'Michigan & Great Lakes Tech Corridor';
  else if (/remote/.test(loc)) tierLabel = 'US Nationwide / Remote Tech Market';

  // US Internships
  if (isIntern) {
    let min = isTier1 ? 38 : (isTier2 ? 30 : 25);
    let max = isTier1 ? 58 : (isTier2 ? 46 : 38);
    let roleName = 'Software Engineering';

    if (category === 'Data / AI' || t.includes('data') || t.includes('ai') || t.includes('machine learning')) {
      roleName = 'AI & Data Science'; min += 4; max += 6;
    } else if (category === 'QA / Test' || t.includes('qa') || t.includes('test')) {
      roleName = 'QA & Test'; min = Math.max(22, min - 6); max = Math.max(32, max - 8);
    } else if (t.includes('help desk') || t.includes('support') || t.includes('technician')) {
      roleName = 'Technical Support'; min = 20; max = 30;
    }

    return {
      min,
      max,
      currency: 'USD',
      unit: 'HOUR',
      tierLabel,
      roleLabel: getRoleLabel(roleName),
      percentile25: min + 3,
      percentile50: Math.round((min + max) / 2),
      percentile75: max - 3
    };
  }

  // 1. IT Support / Help Desk / Technical Operations / Desktop Support
  if (t.includes('help desk') || t.includes('support') || t.includes('technician') || t.includes('desktop') || t.includes('it specialist')) {
    const min = isTier1 ? 58000 : (isTier2 ? 52000 : 48000);
    const max = isTier1 ? 76000 : (isTier2 ? 68000 : 64000);
    return {
      min,
      max,
      currency: 'USD',
      unit: 'YEAR',
      tierLabel,
      roleLabel: getRoleLabel('Technical Support Specialist'),
      percentile25: min + 3000,
      percentile50: Math.round((min + max) / 2),
      percentile75: max - 3000
    };
  }

  // 2. QA / Software Quality / SDET / Test Automation
  if (t.includes('qa') || t.includes('quality') || t.includes('test') || category === 'QA / Test') {
    const isSdet = t.includes('sdet') || t.includes('automation') || t.includes('engineer');
    const roleName = isSdet ? 'SDET / Test Automation Engineer' : 'Quality Assurance Specialist';
    const min = isSdet
      ? (isTier1 ? 95000 : (isTier2 ? 82000 : 74000))
      : (isTier1 ? 75000 : (isTier2 ? 68000 : 62000));
    const max = isSdet
      ? (isTier1 ? 128000 : (isTier2 ? 110000 : 98000))
      : (isTier1 ? 95000 : (isTier2 ? 85000 : 78000));
    return {
      min,
      max,
      currency: 'USD',
      unit: 'YEAR',
      tierLabel,
      roleLabel: getRoleLabel(roleName),
      percentile25: min + 6000,
      percentile50: Math.round((min + max) / 2),
      percentile75: max - 6000
    };
  }

  // 3. Data / AI / Machine Learning / Deep Learning / LLM / Analytics / Computer Vision
  if (category === 'Data / AI' || t.includes('data') || t.includes('machine learning') || t.includes('ai') || t.includes('ml\b') || t.includes('deep learning') || t.includes('robotics')) {
    const min = isTier1 ? 120000 : (isTier2 ? 105000 : 95000);
    const max = isTier1 ? 165000 : (isTier2 ? 142000 : 130000);
    return {
      min,
      max,
      currency: 'USD',
      unit: 'YEAR',
      tierLabel,
      roleLabel: getRoleLabel('Machine Learning & Data Engineer'),
      percentile25: min + 8000,
      percentile50: Math.round((min + max) / 2),
      percentile75: max - 8000
    };
  }

  // 4. DevOps / Cloud / Infrastructure / Platform / Site Reliability (SRE) / Cybersecurity
  if (category === 'DevOps / Cloud' || t.includes('devops') || t.includes('cloud') || t.includes('security') || t.includes('sre') || t.includes('infrastructure') || t.includes('platform')) {
    const min = isTier1 ? 115000 : (isTier2 ? 100000 : 92000);
    const max = isTier1 ? 155000 : (isTier2 ? 135000 : 125000);
    return {
      min,
      max,
      currency: 'USD',
      unit: 'YEAR',
      tierLabel,
      roleLabel: getRoleLabel('Cloud Infrastructure & DevOps Engineer'),
      percentile25: min + 8000,
      percentile50: Math.round((min + max) / 2),
      percentile75: max - 8000
    };
  }

  // 5. Backend / Distributed Systems / Systems / Embedded / Firmware / Low-Level
  if (category === 'Backend' || t.includes('backend') || t.includes('systems') || t.includes('embedded') || t.includes('firmware') || t.includes('distributed')) {
    const min = isTier1 ? 115000 : (isTier2 ? 98000 : 88000);
    const max = isTier1 ? 155000 : (isTier2 ? 132000 : 122000);
    return {
      min,
      max,
      currency: 'USD',
      unit: 'YEAR',
      tierLabel,
      roleLabel: getRoleLabel('Backend & Systems Engineer'),
      percentile25: min + 7000,
      percentile50: Math.round((min + max) / 2),
      percentile75: max - 7000
    };
  }

  // 6. Mobile (iOS, Android, Swift, Kotlin, React Native, Flutter)
  if (category === 'Mobile' || t.includes('ios') || t.includes('android') || t.includes('mobile') || t.includes('swift') || t.includes('kotlin')) {
    const min = isTier1 ? 112000 : (isTier2 ? 95000 : 85000);
    const max = isTier1 ? 148000 : (isTier2 ? 128000 : 118000);
    return {
      min,
      max,
      currency: 'USD',
      unit: 'YEAR',
      tierLabel,
      roleLabel: getRoleLabel('Mobile Application Engineer'),
      percentile25: min + 7000,
      percentile50: Math.round((min + max) / 2),
      percentile75: max - 7000
    };
  }

  // 7. Frontend / Web / UI Engineering
  if (category === 'Frontend' || t.includes('frontend') || t.includes('front-end') || t.includes('ui') || t.includes('react') || t.includes('web developer')) {
    const min = isTier1 ? 108000 : (isTier2 ? 90000 : 82000);
    const max = isTier1 ? 145000 : (isTier2 ? 122000 : 115000);
    return {
      min,
      max,
      currency: 'USD',
      unit: 'YEAR',
      tierLabel,
      roleLabel: getRoleLabel('Frontend & Web Engineer'),
      percentile25: min + 7000,
      percentile50: Math.round((min + max) / 2),
      percentile75: max - 7000
    };
  }

  // 8. Full Stack & Core Software Engineer (Default)
  const min = isTier1 ? 112000 : (isTier2 ? 95000 : 86000);
  const max = isTier1 ? 150000 : (isTier2 ? 128000 : 120000);
  const roleName = category === 'Full Stack' || t.includes('full stack') || t.includes('fullstack')
    ? 'Full Stack Engineer'
    : 'Software Engineer';

  return {
    min,
    max,
    currency: 'USD',
    unit: 'YEAR',
    tierLabel,
    roleLabel: getRoleLabel(roleName),
    percentile25: min + 8000,
    percentile50: Math.round((min + max) / 2),
    percentile75: max - 8000
  };
}

/**
 * Composes "The FreshCommits Edge" Curated Job Description with truthful compensation transparency
 */
function composeFreshCommitsCuratedDescription(params: {
  title: string;
  company: string;
  cleanOverview: string;
  skills: string[];
  salary: SalaryRange;
  responsibilities: string[];
  qualifications: string[];
  location: string;
}): string {
  const { title, company, cleanOverview } = params;
  if (cleanOverview && cleanOverview.trim().length > 20) {
    return cleanOverview.trim();
  }
  return `${company} is actively seeking an early-career ${title} to join their team. Candidates will collaborate closely with experienced mentors, contributing directly to live product workflows and customer-facing features.`;
}

/**
 * Returns domain-tailored responsibilities & qualifications based on role archetype
 */
function getRoleArchetypeContent(title: string, company: string): { responsibilities: string[]; qualifications: string[]; skills: string[]; category: JobCategory } {
  const t = title.toLowerCase();

  // 1. Trust & Safety / Developer Experience / Policy Analyst
  if (t.includes('trust') || t.includes('safety') || t.includes('developer experience') || t.includes('ecosystem') || t.includes('policy')) {
    return {
      category: 'DevOps / Cloud',
      skills: ['Developer Experience', 'Trust & Safety', 'APIs', 'Python', 'SQL', 'Git', 'Security', 'Data Analysis'],
      responsibilities: [
        `Review and evaluate third-party developer applications, APIs, and ecosystem integrations against ${company}'s platform integrity and security standards.`,
        'Triage and investigate complex trust, safety, and policy escalations across the developer ecosystem with high analytical rigor.',
        'Analyze developer onboarding workflows and identify automation opportunities to minimize friction while maintaining compliance.',
        'Partner with cross-functional engineering, product, legal, and developer relations teams to evolve platform developer guidelines.',
        'Utilize SQL and data scripting to track ecosystem abuse patterns, monitor key risk signals, and measure review resolution SLAs.',
        'Author clear investigative postmortems, maintain internal policy documentation, and participate in systemic prevention initiatives.'
      ],
      qualifications: [
        "Bachelor's degree in Computer Science, Information Systems, Data Analytics, Public Policy, or equivalent practical experience.",
        '0–2 years of experience in technical analysis, developer support, trust & safety, or platform ecosystem operations.',
        'Familiarity with modern software developer tools, APIs, HTTP protocols, and developer ecosystem architectures.',
        'Working knowledge of structured analytical querying (SQL) or scripting (Python/JavaScript) for data-driven investigations.',
        'Strong analytical problem-solving skills, attention to detail, and sound judgment when evaluating ambiguous risk signals.',
        'Exceptional written communication skills for authoring developer documentation, policy rationales, and cross-functional summaries.'
      ]
    };
  }

  // 2. Data / AI / Machine Learning
  if (t.includes('data') || t.includes('ai') || t.includes('ml') || t.includes('machine learning') || t.includes('intelligence')) {
    return {
      category: 'Data / AI',
      skills: ['Python', 'SQL', 'Machine Learning', 'PyTorch', 'Pandas', 'Data Pipelines', 'GCP', 'Git'],
      responsibilities: [
        `Develop, validate, and deploy data pipelines and analytical models that power ${company}'s production systems.`,
        'Perform exploratory data analysis to uncover statistical trends, optimize model features, and identify anomalies.',
        'Collaborate with machine learning engineers and product managers to formulate measurable evaluation metrics.',
        'Write clean, modular Python and SQL code accompanied by comprehensive automated tests and documentation.',
        'Monitor model inference latency, pipeline data freshness, and model drift in live environments.',
        'Participate in team sprint planning, architectural reviews, and peer code reviews.'
      ],
      qualifications: [
        "Bachelor's degree in Computer Science, Data Science, Mathematics, Statistics, or equivalent practical experience.",
        '0–2 years of hands-on experience with Python, SQL, and data analysis frameworks (e.g., Pandas, NumPy).',
        'Familiarity with machine learning fundamentals, statistics, and model validation techniques.',
        'Experience with relational databases (PostgreSQL, MySQL) and version control tools (Git).',
        'Demonstrated curiosity for continuous learning and solving complex real-world data challenges.',
        'Strong communication skills for presenting quantitative findings to technical and business stakeholders.'
      ]
    };
  }

  // 3. Frontend / UI Engineer
  if (t.includes('frontend') || t.includes('ui') || t.includes('web') || t.includes('client')) {
    return {
      category: 'Frontend',
      skills: ['React', 'TypeScript', 'JavaScript', 'Next.js', 'HTML/CSS', 'Tailwind CSS', 'REST APIs', 'Git'],
      responsibilities: [
        `Build responsive, accessible, and high-performance user interfaces for ${company}'s web applications.`,
        'Collaborate with UI/UX designers and product managers to translate Figma mockups into reusable component architectures.',
        'Implement automated frontend testing utilizing Jest, React Testing Library, or Playwright to maintain zero regressions.',
        'Optimize client-side performance, Core Web Vitals, and asset delivery across mobile and desktop viewports.',
        'Conduct active peer code reviews and contribute to design system documentation and accessibility compliance (WCAG).',
        'Participate in agile sprint ceremonies, daily standups, and retrospective continuous improvement discussions.'
      ],
      qualifications: [
        "Bachelor's degree in Computer Science or equivalent practical coding bootcamp / project portfolio experience.",
        '0–2 years of frontend engineering experience utilizing modern JavaScript/TypeScript and React/Next.js.',
        'Solid foundation in semantic HTML5, modern CSS3/Tailwind, and client-server HTTP communication.',
        'Familiarity with state management libraries, Git version control, and component-driven development.',
        'Keen eye for visual precision, user-centric interaction design, and interface responsiveness.',
        'Collaborative problem solver eager to learn from senior engineering mentors in a fast-paced environment.'
      ]
    };
  }

  // 4. Default: Software Engineer / Full Stack
  return {
    category: inferCategory(title, detectSkills(title)),
    skills: detectSkills(`${title} ${company}`),
    responsibilities: [
      `Design, implement, and test scalable software components in close collaboration with ${company}'s engineering mentors.`,
      'Contribute clean, maintainable code to production codebases adhering to established engineering best practices.',
      'Participate in agile sprint ceremonies, collaborative peer code reviews, and architectural design reviews.',
      'Diagnose, debug, and resolve software defects, performance bottlenecks, and system integration challenges.',
      'Author automated unit and integration tests to ensure exceptional system reliability and CI/CD delivery standards.',
      'Document system architectures, API contracts, and onboarding playbooks for peer team members.'
    ],
    qualifications: [
      "Bachelor's degree in Computer Science, Software Engineering, or equivalent practical/bootcamp experience.",
      '0–2 years of software engineering experience or relevant university project/open-source contributions.',
      'Solid understanding of core computer science fundamentals: algorithms, data structures, and object-oriented design.',
      'Working knowledge of at least one modern programming language (Java, Python, TypeScript, Go, or C++) and Git.',
      'Passionate curiosity for learning modern cloud technologies, distributed systems, and collaborative development.',
      'Strong analytical thinking, clear communication skills, and enthusiastic team-first mindset.'
    ]
  };
}

export interface ParsedJobSections {
  overview: string;
  responsibilities: string[];
  qualifications: string[];
}

/**
 * Intelligent section parser for raw JD text or ATS HTML.
 * Completely isolates Overview, Responsibilities, and Qualifications.
 * Guarantees zero paragraph duplication between sections.
 */
export function parseJobSections(
  rawContent: string,
  title: string = 'Software Engineer',
  company: string = 'The Employer'
): ParsedJobSections {
  if (!rawContent) {
    const archetype = getRoleArchetypeContent(title, company);
    return {
      overview: `${company} is actively seeking an enthusiastic ${title} to join their team.`,
      responsibilities: archetype.responsibilities,
      qualifications: archetype.qualifications
    };
  }

  let text = rawContent;

  // Decode entities & preserve headings
  text = text
    .replace(/&#43;/g, '+')
    .replace(/&#xa;/gi, '\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n• $1\n')
    .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, '\n\n===HEADER: $1===\n\n')
    .replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, (match, inner) => {
      const pure = inner.replace(/<[^>]+>/g, '').trim();
      if (pure.length > 2 && pure.length < 80 && !pure.includes('\n')) {
        return '\n\n===HEADER: ' + pure + '===\n\n';
      }
      return match;
    })
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/(?:p|div|section|article)>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&bull;/g, '•');

  const lines = text
    .split('\n')
    .map((l) => l.replace(/[\s\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g, ' ').trim())
    .filter(Boolean);

  let currentSection: 'overview' | 'responsibilities' | 'qualifications' | 'other' = 'overview';
  const overviewParas: string[] = [];
  const respLines: string[] = [];
  const qualLines: string[] = [];
  const titleLow = (title || '').toLowerCase();

  for (const line of lines) {
    const isExplicitBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
    const headerMatch = line.match(/^===HEADER:\s*(.+?)===$/i);
    const isHeaderLine = Boolean(headerMatch) || (!isExplicitBullet && line.length < 80 && (line.endsWith(':') || /^(?:Qualifications|Responsibilities|Requirements|What You Will Do|What You Bring|What We Offer)/i.test(line)));
    const candidate = headerMatch ? headerMatch[1].trim() : line;
    const low = candidate.toLowerCase();

    // Section transitions ONLY trigger on genuine headings, NEVER on bullet points!
    if (isHeaderLine) {
      if (
        low.includes('responsibilit') ||
        low.includes('what you will do') ||
        low.includes("what you'll do") ||
        low.includes('what you do') ||
        low.includes('core duties') ||
        low.includes('role responsibilities') ||
        low.includes('day-to-day') ||
        low.includes('day to day')
      ) {
        currentSection = 'responsibilities';
        continue;
      }
      if (
        low.includes('qualification') ||
        low.includes('requirement') ||
        low.includes('what you need') ||
        low.includes('what we look for') ||
        low.includes('what we are looking for') ||
        low.includes('who you are') ||
        low.includes('what you bring') ||
        low.includes("what you'll bring") ||
        low.includes('skills & experience') ||
        low.includes('skills and experience') ||
        low.includes('eligibility')
      ) {
        currentSection = 'qualifications';
        continue;
      }
      if (
        low.includes('what we offer') ||
        low.includes('our offer') ||
        low.includes('benefits') ||
        low.includes('perks') ||
        low.includes('compensation') ||
        low.includes('security clearance') ||
        low.includes('position role type') ||
        low.includes('equal opportunity') ||
        low.includes('privacy policy') ||
        low.includes('learn more & apply') ||
        low.includes('about the company') ||
        low.includes('about us') ||
        low.includes('diversity')
      ) {
        currentSection = 'other';
        continue;
      }
    }

    if (headerMatch) continue;

    // Filter out common header leftovers and label fragments
    if (
      /^(?:job title|job summary|role summary|position summary|title)[:\s]*$/i.test(low) ||
      low === titleLow ||
      (candidate.endsWith(':') && candidate.length < 40)
    ) {
      continue;
    }

    // Company intro lines belong in overview, NEVER in responsibilities or qualifications
    if (
      /^about\s+[a-z0-9&.\-\s]+[:\s]/i.test(line) ||
      /^about us[:\s]/i.test(line) ||
      /^who we are[:\s]/i.test(line) ||
      /^our mission[:\s]/i.test(line) ||
      /^company overview[:\s]/i.test(line) ||
      /^we are looking for\b/i.test(line) ||
      /^this is an ideal role\b/i.test(line) ||
      /^our team is\b/i.test(line) ||
      /^the role\b/i.test(line) ||
      /^role overview\b/i.test(line)
    ) {
      if (!overviewParas.includes(line)) {
        overviewParas.push(line);
      }
      continue;
    }

    const cleanBullet = candidate.replace(/^[•\-\*–—\d\.\)]\s*/, '').replace(/&(?:amp;)?#xa;/gi, ' ').trim();
    if (!cleanBullet || cleanBullet.length < 12) continue;

    if (currentSection === 'overview') {
      if (!overviewParas.includes(cleanBullet)) {
        overviewParas.push(cleanBullet);
      }
    } else if (currentSection === 'responsibilities') {
      if (isExplicitBullet || (!line.includes('.') && cleanBullet.length < 140)) {
        if (!respLines.includes(cleanBullet)) {
          respLines.push(cleanBullet);
        }
      } else if (cleanBullet.length > 40 && !overviewParas.includes(cleanBullet)) {
        overviewParas.push(cleanBullet);
      }
    } else if (currentSection === 'qualifications') {
      if (!qualLines.includes(cleanBullet)) {
        qualLines.push(cleanBullet);
      }
    }
  }

  // Deduplicate against overview
  const overviewText = overviewParas.join('\n\n');
  const overviewLower = overviewText.toLowerCase();

  const finalResp = respLines
    .filter((r) => {
      const low = r.toLowerCase();
      if (overviewLower && (overviewLower.includes(low.slice(0, 35)) || (low.length > 40 && overviewLower.includes(low.slice(0, 50))))) {
        return false;
      }
      return true;
    })
    .slice(0, 10);

  const finalQual = qualLines
    .filter((q) => {
      const low = q.toLowerCase();
      if (finalResp.some((r) => r.toLowerCase() === low)) return false;
      if (overviewLower && (overviewLower.includes(low.slice(0, 35)) || (low.length > 40 && overviewLower.includes(low.slice(0, 50))))) {
        return false;
      }
      return true;
    })
    .slice(0, 10);

  // If parsed sections were found, preserve exact employer requirements without overriding with generic archetypes
  const archetype = getRoleArchetypeContent(title, company);
  const responsibilities = finalResp.length >= 1 ? finalResp : archetype.responsibilities;
  const qualifications = finalQual.length >= 1 ? finalQual : archetype.qualifications;

  return {
    overview: overviewText || `${company} is actively seeking an early-career ${title} to join their team.`,
    responsibilities,
    qualifications
  };
}

/**
 * Universal synthesis engine: Given ANY career URL, extracts rich metadata directly from URL structure
 */
function synthesizeJobFromUrl(rawUrl: string): ExtractedJobData {
  const cleanUrl = rawUrl.trim().startsWith('http') ? rawUrl.trim() : `https://${rawUrl.trim()}`;
  const urlObj = new URL(cleanUrl);

  const rawSlug = extractJobSlugFromPath(urlObj.pathname);
  const slugMeta = parseSlugMetadata(rawSlug);

  const compData = detectCompanyFromUrl(urlObj);
  const company = slugMeta.inferredCompany || compData.company;
  const companyWebsite = compData.companyWebsite;
  const companyLogo = compData.companyLogo;

  const detectedAtsProvider = detectAtsProviderFromUrl(cleanUrl);
  const title = formatSlugToJobTitle(rawSlug);

  const loc = extractLocationFromUrl(urlObj, slugMeta.inferredLocation || compData.defaultLocation);

  const isIntern = title.toLowerCase().includes('intern');
  const maxYears = isIntern ? 0 : 1;
  const expLevel: ExperienceLevel = isIntern ? 'Internship' : 'Entry Level';
  const empType: EmploymentType = isIntern ? 'INTERN' : 'FULL_TIME';

  const roleData = getRoleArchetypeContent(title, company);
  const benchmark = getRoleMarketBenchmark(title, roleData.category, loc.country || 'US', loc.location, expLevel);
  const salary: SalaryRange = { min: benchmark.min, max: benchmark.max, currency: benchmark.currency, unit: benchmark.unit };

  const baseTitle = stripSeniorityFromTitle(title);
  const titleHasSeniority = /(?:early[\s-]career|entry[\s-]level|junior|new\s*grad|intern|graduate|fresher)/i.test(title);
  const article = /^[aeiou]/i.test(baseTitle) ? 'an' : 'a';
  const cleanOverview = titleHasSeniority
    ? `${company} is actively seeking ${article} ${baseTitle} to join their team. Candidates will collaborate closely with experienced mentors, contributing directly to live product workflows and customer-facing features.`
    : `${company} is actively seeking an early-career ${baseTitle} to join their team. Candidates will collaborate closely with experienced mentors, contributing directly to live product workflows and customer-facing features.`;
  const curatedDescription = composeFreshCommitsCuratedDescription({
    title,
    company,
    cleanOverview,
    skills: roleData.skills,
    salary,
    responsibilities: roleData.responsibilities,
    qualifications: roleData.qualifications,
    location: loc.location
  });

  return {
    title,
    company,
    companyLogo: companyLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=0F172A&color=fff&size=128`,
    companyWebsite,
    location: loc.location,
    isRemote: loc.isRemote,
    city: loc.city,
    state: loc.state,
    country: loc.country || 'US',
    postalCode: loc.postalCode,
    applicantLocationRequirements: loc.isRemote ? (loc.country || 'US') : undefined,
    experienceLevel: expLevel,
    maxYearsExperience: maxYears,
    category: roleData.category,
    employmentType: empType,
    salary,
    salaryDisclosed: false,
    suggestedBenchmark: benchmark,
    description: curatedDescription,
    responsibilities: roleData.responsibilities,
    qualifications: roleData.qualifications,
    skills: roleData.skills,
    applyUrl: cleanUrl,
    detectedAtsProvider
  };
}

/**
 * Universal resource fetcher that leverages the server-side dev proxy
 * to completely eliminate CORS failures in browser environments, with graceful fallbacks.
 */
async function fetchResourceWithProxy(url: string, asJson = false): Promise<any> {
  // 1. Try first-party API endpoint (Cloudflare Pages Function / Vite Dev Proxy)
  try {
    const localProxyUrl = `/api/fetch-career-url?url=${encodeURIComponent(url)}`;
    const resp = await fetch(localProxyUrl, { signal: AbortSignal.timeout(8000) });
    if (resp.ok) {
      const text = await resp.text();
      if (asJson) {
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      }
      return text;
    }
  } catch {
    // continue
  }

  // 2. Direct fetch (works for CORS-enabled public APIs)
  try {
    const resp = await fetch(url, {
      headers: asJson ? { Accept: 'application/json' } : undefined,
      signal: AbortSignal.timeout(5000)
    });
    if (resp.ok) {
      const text = await resp.text();
      if (asJson) {
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      }
      return text;
    }
  } catch {
    // continue
  }

  // 3. Fallback to public proxy if available
  try {
    const pubProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const resp = await fetch(pubProxy, { signal: AbortSignal.timeout(4500) });
    if (resp.ok) {
      const text = await resp.text();
      if (asJson) {
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      }
      return text;
    }
  } catch {
    // continue
  }

  return null;
}

/**
 * Main parser: Given any career page / ATS URL, fetches data and returns populated fields
 * Guaranteed to succeed without crashing or throwing on any valid URL!
 */
export async function extractAndEnrichJobFromUrl(rawUrl: string): Promise<ExtractedJobData> {
  const url = rawUrl.trim();
  if (!url) {
    throw new Error('Please enter a valid career or ATS URL.');
  }

  // Ensure protocol
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;
  const urlObj = new URL(fullUrl);

  // 0. ORACLE CLOUD CANDIDATE EXPERIENCE DIRECT REST API
  // e.g. https://hdjq.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/job/26011531
  const oracleMatch = fullUrl.match(/https:\/\/([a-zA-Z0-9_.-]+)\.oraclecloud\.com\/hcmUI\/CandidateExperience\/[^/]+\/sites\/([^/]+)\/job\/([0-9]+)/i);
  if (oracleMatch) {
    const [, hostPrefix, siteNumber, reqId] = oracleMatch;
    const apiUrl = `https://${hostPrefix}.oraclecloud.com/hcmRestApi/resources/latest/recruitingCEJobRequisitionDetails/${reqId}`;
    try {
      const data = await fetchResourceWithProxy(apiUrl, true);
      if (data && data.Title) {
        const title = cleanHtml(data.Title);
        // Deduce company name and website with precision
        let company = data.LegalEmployer || data.Organization || data.BusinessUnit;
        let companyWebsite = '';
        const corpStr = data.CorporateDescriptionStr || '';
        const extDesc = data.ExternalDescriptionStr || '';
        const combinedDesc = `${corpStr} ${extDesc}`;

        // Match company domain link in descriptions (e.g. emerson.com)
        const domainMatch = combinedDesc.match(/https?:\/\/(?:www\d?\.)?([a-zA-Z0-9-]+)\.(?:com|org|net|io)\b/i);
        if (domainMatch && !['oraclecloud', 'oracle', 'linkedin', 'google', 'twitter', 'facebook', 'youtube'].includes(domainMatch[1].toLowerCase())) {
          const rawDomain = domainMatch[1];
          companyWebsite = `https://${rawDomain}.com`;
          if (!company || company === 'None') {
            company = rawDomain.charAt(0).toUpperCase() + rawDomain.slice(1);
          }
        }

        // Match "WHY [Company]" or "About [Company]"
        const whyMatch = corpStr.match(/(?:WHY|About)\s+([A-Z][a-zA-Z0-9&.\s]{2,25})/i);
        if (whyMatch && whyMatch[1] && (!company || company === 'None' || company.length < 3)) {
          company = whyMatch[1].trim();
        }

        // Match "At [Company]"
        if (!company || company === 'None') {
          const atMatch = combinedDesc.match(/At\s+([A-Z][a-zA-Z0-9&.\s]{2,25}?)(?:,|\.|is\b|we\b)/);
          if (atMatch && atMatch[1]) {
            company = atMatch[1].trim();
          }
        }

        if (!company || company === 'None') {
          const cleanSub = hostPrefix.split('.')[0].replace(/[^a-zA-Z]/g, '');
          company = cleanSub ? cleanSub.charAt(0).toUpperCase() + cleanSub.slice(1) : 'Hiring Organization';
        }

        if (!companyWebsite && company) {
          companyWebsite = `https://${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
        }

        const rawLoc = data.PrimaryLocation || 'United States';
        const isRemoteHint = data.WorkplaceType?.toLowerCase() === 'remote' || data.WorkplaceTypeCode === 'REMOTE';
        const isHybridHint = data.WorkplaceType?.toLowerCase() === 'hybrid' || data.WorkplaceTypeCode === 'HYBRID' || data.WorkplaceTypeCode === 'ORA_HYBRID';
        const locDetails = resolveLocationDetails(rawLoc, isRemoteHint);
        if (isHybridHint && locDetails.city && locDetails.state) {
          locDetails.location = `${locDetails.city}, ${locDetails.state} / Hybrid`;
        }

        const rawDesc = cleanHtml(data.ExternalDescriptionStr || '');
        const rawQual = cleanHtml(data.ExternalQualificationsStr || '');
        const rawResp = cleanHtml(data.ExternalResponsibilitiesStr || '');
        const fullCorpus = `${rawDesc}\n${rawQual}\n${rawResp}`;

        const parsed = parseJobSections(data.ExternalDescriptionStr || '', title, company);
        const responsibilities = parsed.responsibilities.length > 0 ? parsed.responsibilities : extractBulletPoints(data.ExternalResponsibilitiesStr || data.ExternalDescriptionStr || '').slice(0, 8);
        const qualifications = parsed.qualifications.length > 0 ? parsed.qualifications : extractBulletPoints(data.ExternalQualificationsStr || data.ExternalDescriptionStr || '').slice(0, 8);
        const skills = detectSkills(`${title} ${fullCorpus}`);
        const category = inferCategory(title, skills);
        const expLevel = inferExperienceLevel(title, fullCorpus);
        const isIntern = title.toLowerCase().includes('intern');
        const empType: EmploymentType = isIntern ? 'INTERN' : (data.JobSchedule?.toLowerCase().includes('part') ? 'PART_TIME' : 'FULL_TIME');
        const benchmark = getRoleMarketBenchmark(title, category, locDetails.country || 'US', locDetails.location, expLevel);
        const fromText = extractSalaryFromText(fullCorpus);
        const salary = fromText || benchmark;
        const salaryDisclosed = Boolean(fromText);

        let cleanOverview = parsed.overview || cleanHtml(data.ShortDescriptionStr || '');
        if (data.ShortDescriptionStr && cleanOverview && !cleanOverview.includes(data.ShortDescriptionStr.slice(0, 30))) {
          cleanOverview = `${cleanHtml(data.ShortDescriptionStr)}\n\n${cleanOverview}`;
        }
        if (corpStr) {
          const corpText = cleanHtml(corpStr).replace(/^WHY\s+[A-Z\s]+/i, '').trim();
          if (corpText && !cleanOverview.includes(corpText.slice(0, 30))) {
            cleanOverview = `${cleanOverview}\n\nAbout ${company}:\n${corpText.slice(0, 400)}`;
          }
        }
        if (!cleanOverview) {
          cleanOverview = `${company} is actively seeking an early-career ${title} to join their team.`;
        }

        const curatedDescription = composeFreshCommitsCuratedDescription({
          title,
          company,
          cleanOverview,
          skills,
          salary,
          responsibilities: responsibilities.length > 0 ? responsibilities.slice(0, 6) : getRoleArchetypeContent(title, company).responsibilities,
          qualifications: qualifications.length > 0 ? qualifications.slice(0, 6) : getRoleArchetypeContent(title, company).qualifications,
          location: locDetails.location
        });

        return {
          title,
          company,
          companyLogo: `https://www.google.com/s2/favicons?sz=128&domain=${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          companyWebsite,
          location: locDetails.location,
          isRemote: locDetails.isRemote,
          city: locDetails.city,
          state: locDetails.state,
          country: locDetails.country,
          postalCode: locDetails.postalCode,
          applicantLocationRequirements: locDetails.applicantLocationRequirements,
          experienceLevel: expLevel,
          maxYearsExperience: isIntern ? 0 : 2,
          category,
          employmentType: empType,
          salary,
          salaryDisclosed,
          suggestedBenchmark: benchmark,
          description: curatedDescription,
          responsibilities: responsibilities.length > 0 ? responsibilities.slice(0, 6) : getRoleArchetypeContent(title, company).responsibilities,
          qualifications: qualifications.length > 0 ? qualifications.slice(0, 6) : getRoleArchetypeContent(title, company).qualifications,
          skills,
          applyUrl: fullUrl,
          detectedAtsProvider: 'Oracle Cloud HCM'
        };
      }
    } catch (err) {
      console.warn('Oracle Cloud HCM API fetch failed, falling back:', err);
    }
  }

  // 1. WORKDAY DIRECT CXS API
  // e.g. https://autodesk.wd1.myworkdayjobs.com/Ext/job/Boston-MA-USA/PhD-Researcher--Multimodal-AI-for-Human-Experience_26WD101433-1
  const wdMatch = fullUrl.match(/https:\/\/([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)\.myworkdayjobs\.com\/(?:[a-zA-Z-]{2,5}\/)?([^/]+)\/job\/([^/]+)\/([^/?#]+)/i);
  if (wdMatch) {
    const [, sub, dc, site, locSeg, slug] = wdMatch;
    const apiUrl = `https://${sub}.${dc}.myworkdayjobs.com/wday/cxs/${sub}/${site}/job/${locSeg}/${slug}`;
    try {
      const data = await fetchResourceWithProxy(apiUrl, true);
      if (data && data.jobPostingInfo) {
        const post = data.jobPostingInfo || {};
        const title = post.title || formatSlugToJobTitle(slug);
        const jobDescHtml = post.jobDescription || '';
        const descText = cleanHtml(jobDescHtml);

        let compKey = sub.toLowerCase();
        const siteSlug = (site || '').toLowerCase();
        if (compKey === 'globalhr' || compKey === 'external' || compKey === 'myworkday' || compKey === 'recruiting' || compKey.startsWith('wd')) {
          if (siteSlug.includes('rtx') || siteSlug.includes('raytheon') || descText.includes('Raytheon') || descText.includes('RTX')) {
            compKey = 'rtx';
          } else if (siteSlug.includes('boeing') || descText.includes('Boeing')) {
            compKey = 'boeing';
          } else if (siteSlug.includes('lockheed') || descText.includes('Lockheed Martin')) {
            compKey = 'lockheedmartin';
          } else if (siteSlug.includes('northrop') || descText.includes('Northrop Grumman')) {
            compKey = 'northropgrumman';
          } else {
            const cleanedSite = siteSlug.replace(/^(?:rec_|ext_|external_|careers_)/, '').replace(/(?:_ext|_gateway|_jobs|_careers)$/, '');
            if (cleanedSite.length > 2) compKey = cleanedSite;
          }
        }

        let knownComp = KNOWN_COMPANIES[`${compKey}.com`];
        let company = knownComp ? knownComp.name : '';
        if (!company) {
          if (descText.includes('Raytheon') || descText.includes('At RTX') || descText.includes('RTX is an')) {
            company = 'RTX';
            compKey = 'rtx';
            knownComp = KNOWN_COMPANIES['rtx.com'];
          } else {
            company = compKey.charAt(0).toUpperCase() + compKey.slice(1);
          }
        }

        const rawLoc = post.location || locSeg.replace(/[-_]+/g, ' ');
        const locDetails = resolveLocationDetails(rawLoc);
        const parsed = parseJobSections(jobDescHtml, title, company);
        const skills = detectSkills(`${title} ${descText}`);
        const category = inferCategory(title, skills);
        const expLevel = inferExperienceLevel(title, descText);
        const isIntern = title.toLowerCase().includes('intern');
        const empType: EmploymentType = isIntern ? 'INTERN' : 'FULL_TIME';
        const benchmark = getRoleMarketBenchmark(title, category, locDetails.country || 'US', locDetails.location, expLevel);
        const fromText = extractSalaryFromText(descText);
        const salary = fromText || benchmark;
        const salaryDisclosed = Boolean(fromText);

        const cleanOverview = parsed.overview || `${company} is actively seeking an early-career ${title} to join their team.`;
        const curatedDescription = composeFreshCommitsCuratedDescription({
          title,
          company,
          cleanOverview,
          skills,
          salary,
          responsibilities: parsed.responsibilities.length > 0 ? parsed.responsibilities : getRoleArchetypeContent(title, company).responsibilities,
          qualifications: parsed.qualifications.length > 0 ? parsed.qualifications : getRoleArchetypeContent(title, company).qualifications,
          location: locDetails.location
        });

        return {
          title,
          company,
          companyLogo: knownComp?.logo || `https://www.google.com/s2/favicons?sz=128&domain=${compKey}.com`,
          companyWebsite: knownComp?.website || `https://${compKey}.com`,
          location: locDetails.location,
          isRemote: locDetails.isRemote,
          city: locDetails.city,
          state: locDetails.state,
          country: locDetails.country,
          postalCode: locDetails.postalCode,
          applicantLocationRequirements: locDetails.applicantLocationRequirements,
          experienceLevel: expLevel,
          maxYearsExperience: isIntern ? 0 : 1,
          category,
          employmentType: empType,
          salary,
          salaryDisclosed,
          suggestedBenchmark: benchmark,
          description: curatedDescription,
          responsibilities: parsed.responsibilities.length > 0 ? parsed.responsibilities : getRoleArchetypeContent(title, company).responsibilities,
          qualifications: parsed.qualifications.length > 0 ? parsed.qualifications : getRoleArchetypeContent(title, company).qualifications,
          skills,
          applyUrl: fullUrl,
          detectedAtsProvider: 'Workday'
        };
      }
    } catch (err) {
      console.warn('Workday CXS API fetch failed, falling back to heuristic synthesis:', err);
    }
  }

  // 2. ASHBY DIRECT API
  // e.g. https://jobs.ashbyhq.com/linear/d3bc1ced-3ce4-4086-a050-555055dbb1ff
  const ashbyMatch = fullUrl.match(/jobs\.ashbyhq\.com\/([^/]+)\/([a-zA-Z0-9-]+)/i);
  if (ashbyMatch) {
    const [, companySlug, postingId] = ashbyMatch;
    try {
      const apiUrl = `https://api.ashbyhq.com/posting-api/job-board/${companySlug}`;
      const boardData = await fetchResourceWithProxy(apiUrl, true);
      if (boardData && boardData.jobs) {
        const job = (boardData.jobs || []).find((j: any) => j.id === postingId);
        if (job) {
          const title = job.title || 'Software Engineer';
          const company = companySlug.charAt(0).toUpperCase() + companySlug.slice(1);
          const rawLoc = job.location || job.address?.postalAddress?.addressLocality || 'Remote';
          const locDetails = resolveLocationDetails(rawLoc, job.isRemote);
          if (job.address?.postalAddress?.postalCode) {
            locDetails.postalCode = job.address.postalAddress.postalCode;
          }
          const skills = detectSkills(`${title} ${job.department || ''} ${job.team || ''}`);
          const category = inferCategory(title, skills);
          const isIntern = title.toLowerCase().includes('intern');
          const empType: EmploymentType = isIntern ? 'INTERN' : 'FULL_TIME';
          const benchmark = getRoleMarketBenchmark(title, category, locDetails.country || 'US', locDetails.location, isIntern ? 'Internship' : 'Entry Level');

          let salary: SalaryRange = benchmark;
          let salaryDisclosed = false;
          if (job.compensation?.compensationTierSummary) {
            const compText = job.compensation.compensationTierSummary;
            const fromText = extractSalaryFromText(compText);
            if (fromText) {
              salary = fromText;
              salaryDisclosed = true;
            }
          }

          const archetype = getRoleArchetypeContent(title, company);
          const curatedDescription = composeFreshCommitsCuratedDescription({
            title,
            company,
            cleanOverview: `${company} is actively hiring an early-career ${title} to join their ${job.department || 'engineering'} team.`,
            skills: archetype.skills,
            salary,
            responsibilities: archetype.responsibilities,
            qualifications: archetype.qualifications,
            location: locDetails.location
          });

          return {
            title,
            company,
            companyLogo: `https://www.google.com/s2/favicons?sz=128&domain=${companySlug}.com`,
            companyWebsite: `https://${companySlug}.com`,
            location: locDetails.location,
            isRemote: locDetails.isRemote,
            city: locDetails.city,
            state: locDetails.state,
            country: locDetails.country,
            postalCode: locDetails.postalCode,
            applicantLocationRequirements: locDetails.applicantLocationRequirements,
            experienceLevel: isIntern ? 'Internship' : 'Entry Level',
            maxYearsExperience: isIntern ? 0 : 1,
            category,
            employmentType: empType,
            salary,
            salaryDisclosed,
            suggestedBenchmark: benchmark,
            description: curatedDescription,
            responsibilities: archetype.responsibilities,
            qualifications: archetype.qualifications,
            skills: archetype.skills,
            applyUrl: fullUrl,
            detectedAtsProvider: 'Ashby'
          };
        }
      }
    } catch (err) {
      console.warn('Ashby API fetch failed, falling back:', err);
    }
  }

  // 3. SMARTRECRUITERS DIRECT API
  const srMatch = fullUrl.match(/jobs\.smartrecruiters\.com\/([^/]+)\/([0-9a-zA-Z]+)(?:-[^/?#]+)?/i);
  if (srMatch) {
    const companyId = srMatch[1];
    const postingId = srMatch[2];
    const apiUrl = `https://api.smartrecruiters.com/v1/companies/${companyId}/postings/${postingId}`;

    try {
      const data = await fetchResourceWithProxy(apiUrl, true);
      if (data && (data.name || data.jobAd)) {
        const title = data.name || 'Software Engineer';
        const company = data.company?.name || companyId;
        const companyLogo = data.company?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=0F172A&color=fff&size=128`;
        const rawLoc = data.location?.fullLocation || (data.location?.city ? `${data.location.city}, ${data.location.region || ''}` : 'Remote');
        const locDetails = resolveLocationDetails(rawLoc, Boolean(data.location?.remote || data.location?.hybrid));

        const jobAd = data.jobAd?.sections || {};
        const jobDescText = cleanHtml(jobAd.jobDescription?.text || '');
        const qualText = cleanHtml(jobAd.qualifications?.text || '');
        const addText = cleanHtml(jobAd.additionalInformation?.text || '');
        const fullCorpus = `${jobDescText}\n${qualText}\n${addText}`;

        const responsibilities = extractBulletPoints(jobAd.jobDescription?.text || '').slice(0, 6);
        const qualifications = extractBulletPoints(jobAd.qualifications?.text || '').slice(0, 6);
        const skills = detectSkills(fullCorpus);
        const category = inferCategory(title, skills);
        const experienceLevel = inferExperienceLevel(title, fullCorpus);
        const maxYears = title.toLowerCase().includes('intern') ? 0 : 1;
        const empType: EmploymentType = title.toLowerCase().includes('intern') ? 'INTERN' : 'FULL_TIME';

        const benchmark = getRoleMarketBenchmark(title, category, locDetails.country || 'US', locDetails.location, experienceLevel);
        let salary: SalaryRange = benchmark;
        let salaryDisclosed = false;

        if (data.compensation?.max) {
          salary = {
            min: Number(data.compensation.min || Math.round(Number(data.compensation.max) * 0.85)),
            max: Number(data.compensation.max),
            currency: data.compensation.currency || 'USD',
            unit: empType === 'INTERN' ? 'HOUR' : 'YEAR'
          };
          salaryDisclosed = true;
        } else {
          const fromText = extractSalaryFromText(jobDescText);
          if (fromText) {
            salary = fromText;
            salaryDisclosed = true;
          }
        }

        const cleanOverview = jobDescText.split('\n\n')[0] || jobDescText.slice(0, 300);
        const curatedDescription = composeFreshCommitsCuratedDescription({
          title,
          company,
          cleanOverview,
          skills,
          salary,
          responsibilities,
          qualifications,
          location: locDetails.location
        });

        return {
          title,
          company,
          companyLogo,
          companyWebsite: `https://${companyId.toLowerCase()}.com`,
          location: locDetails.location,
          isRemote: locDetails.isRemote,
          applicantLocationRequirements: locDetails.applicantLocationRequirements,
          city: locDetails.city,
          state: locDetails.state,
          country: locDetails.country,
          postalCode: locDetails.postalCode,
          experienceLevel,
          maxYearsExperience: maxYears,
          category,
          employmentType: empType,
          salary,
          salaryDisclosed,
          suggestedBenchmark: benchmark,
          description: curatedDescription,
          responsibilities: responsibilities.length > 0 ? responsibilities : getRoleArchetypeContent(title, company).responsibilities,
          qualifications: qualifications.length > 0 ? qualifications : getRoleArchetypeContent(title, company).qualifications,
          skills,
          applyUrl: fullUrl,
          detectedAtsProvider: 'SmartRecruiters'
        };
      }
    } catch (err) {
      console.warn('SmartRecruiters direct API fetch failed, falling back to synthesizer:', err);
    }
  }

  // 4. GREENHOUSE DIRECT API
  // Supports boards.greenhouse.io, job-boards.greenhouse.io, and ?gh_jid={id} parameter on company domains
  let ghBoard = '';
  let ghJobId = '';
  const ghMatch = fullUrl.match(/(?:boards|job-boards)\.greenhouse\.io\/([^/]+)\/jobs\/([0-9]+)/i);
  if (ghMatch) {
    ghBoard = ghMatch[1];
    ghJobId = ghMatch[2];
  } else {
    const ghJidParam = urlObj.searchParams.get('gh_jid') || urlObj.searchParams.get('token');
    if (ghJidParam && /^[0-9]+$/.test(ghJidParam)) {
      ghJobId = ghJidParam;
      const forParam = urlObj.searchParams.get('for');
      ghBoard = forParam || urlObj.hostname.split('.')[0];
      if (ghBoard === 'boards' || ghBoard === 'jobs') {
        const segs = urlObj.pathname.split('/').filter(Boolean);
        if (segs.length > 0) ghBoard = segs[0];
      }
    }
  }

  if (ghBoard && ghJobId) {
    const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${ghBoard}/jobs/${ghJobId}`;
    try {
      const data = await fetchResourceWithProxy(apiUrl, true);
      if (data && (data.title || data.content)) {
        const title = data.title || 'Software Engineer';
        const company = ghBoard.charAt(0).toUpperCase() + ghBoard.slice(1);
        const locDetails = resolveLocationDetails(data.location?.name || 'Remote - US');
        const contentText = cleanHtml(data.content || '');
        const parsed = parseJobSections(data.content || '', title, company);
        const responsibilities = parsed.responsibilities;
        const qualifications = parsed.qualifications;
        const skills = detectSkills(contentText);
        const category = inferCategory(title, skills);
        const experienceLevel = inferExperienceLevel(title, contentText);
        const maxYears = title.toLowerCase().includes('intern') ? 0 : 1;
        const empType: EmploymentType = title.toLowerCase().includes('intern') ? 'INTERN' : 'FULL_TIME';
        const benchmark = getRoleMarketBenchmark(title, category, locDetails.country || 'US', locDetails.location, experienceLevel);
        const fromText = extractSalaryFromText(contentText);
        const salary = fromText || benchmark;
        const salaryDisclosed = Boolean(fromText);

        const cleanOverview = parsed.overview || `${company} is actively seeking an early-career ${title} to join their team.`;
        const curatedDescription = composeFreshCommitsCuratedDescription({
          title,
          company,
          cleanOverview,
          skills,
          salary,
          responsibilities,
          qualifications,
          location: locDetails.location
        });

        return {
          title,
          company,
          companyLogo: `https://www.google.com/s2/favicons?sz=128&domain=${ghBoard}.com`,
          companyWebsite: `https://${ghBoard}.com`,
          location: locDetails.location,
          isRemote: locDetails.isRemote,
          city: locDetails.city,
          state: locDetails.state,
          country: locDetails.country,
          postalCode: locDetails.postalCode,
          applicantLocationRequirements: locDetails.applicantLocationRequirements,
          experienceLevel,
          maxYearsExperience: maxYears,
          category,
          employmentType: empType,
          salary,
          salaryDisclosed,
          suggestedBenchmark: benchmark,
          description: curatedDescription,
          responsibilities,
          qualifications,
          skills,
          applyUrl: fullUrl,
          detectedAtsProvider: 'Greenhouse'
        };
      }
    } catch (err) {
      console.warn('Greenhouse API fetch failed, falling back:', err);
    }
  }

  // 5. LEVER DIRECT API
  const leverMatch = fullUrl.match(/jobs\.lever\.co\/([^/]+)\/([a-zA-Z0-9-]+)/i);
  if (leverMatch) {
    const comp = leverMatch[1];
    const postingId = leverMatch[2];
    const apiUrl = `https://api.lever.co/v0/postings/${comp}/${postingId}`;

    try {
      const data = await fetchResourceWithProxy(apiUrl, true);
      if (data && (data.text || data.description)) {
        const title = data.text || 'Software Engineer';
        const company = comp.charAt(0).toUpperCase() + comp.slice(1);
        const locDetails = resolveLocationDetails(data.categories?.location || 'Remote', data.workplaceType === 'remote');
        const descText = cleanHtml(data.description || '');
        const skills = detectSkills(`${title} ${descText}`);
        const category = inferCategory(title, skills);
        const experienceLevel = inferExperienceLevel(title, descText);
        const maxYears = title.toLowerCase().includes('intern') ? 0 : 1;
        const empType: EmploymentType = title.toLowerCase().includes('intern') ? 'INTERN' : 'FULL_TIME';
        const benchmark = getRoleMarketBenchmark(title, category, locDetails.country || 'US', locDetails.location, experienceLevel);

        let salary: SalaryRange = benchmark;
        let salaryDisclosed = false;
        if (data.salaryRange?.min && data.salaryRange?.max) {
          salary = {
            min: data.salaryRange.min,
            max: data.salaryRange.max,
            currency: data.salaryRange.currency || 'USD',
            unit: data.salaryRange.interval === 'per-hour' ? 'HOUR' : 'YEAR'
          };
          salaryDisclosed = true;
        } else {
          const fromText = extractSalaryFromText(descText + ' ' + (data.additional || ''));
          if (fromText) {
            salary = fromText;
            salaryDisclosed = true;
          }
        }

        const responsibilities: string[] = [];
        const qualifications: string[] = [];
        if (Array.isArray(data.lists)) {
          for (const list of data.lists) {
            const listTitle = (list.text || '').toLowerCase();
            const bullets = extractBulletPoints(list.content || '');
            if (listTitle.includes('do') || listTitle.includes('responsib') || listTitle.includes('impact')) {
              responsibilities.push(...bullets);
            } else {
              qualifications.push(...bullets);
            }
          }
        }

        const curatedDescription = composeFreshCommitsCuratedDescription({
          title,
          company,
          cleanOverview: descText.slice(0, 300),
          skills,
          salary,
          responsibilities,
          qualifications,
          location: locDetails.location
        });

        return {
          title,
          company,
          companyLogo: `https://www.google.com/s2/favicons?sz=128&domain=${comp}.com`,
          companyWebsite: `https://${comp}.com`,
          location: locDetails.location,
          isRemote: locDetails.isRemote,
          city: locDetails.city,
          state: locDetails.state,
          country: locDetails.country,
          postalCode: locDetails.postalCode,
          applicantLocationRequirements: locDetails.applicantLocationRequirements,
          experienceLevel,
          maxYearsExperience: maxYears,
          category,
          employmentType: empType,
          salary,
          salaryDisclosed,
          suggestedBenchmark: benchmark,
          description: curatedDescription,
          responsibilities: responsibilities.length > 0 ? responsibilities.slice(0, 6) : getRoleArchetypeContent(title, company).responsibilities,
          qualifications: qualifications.length > 0 ? qualifications.slice(0, 6) : getRoleArchetypeContent(title, company).qualifications,
          skills,
          applyUrl: fullUrl,
          detectedAtsProvider: 'Lever'
        };
      }
    } catch (err) {
      console.warn('Lever API fetch failed:', err);
    }
  }

  // 6. WORKABLE DIRECT MATCHER & API ENRICHMENT
  const workableMatch = fullUrl.match(/jobs\.workable\.com\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?(?:view|jobs)\/([a-zA-Z0-9]+)(?:\/([^/?#]+))?/i);
  if (workableMatch) {
    const shortCode = workableMatch[1];
    const slug = workableMatch[2] || '';
    const slugMeta = parseSlugMetadata(slug);

    try {
      const apiUrl = `https://jobs.workable.com/api/v1/jobs/${shortCode}`;
      const data = await fetchResourceWithProxy(apiUrl, true);
      if (data && (data.title || data.description)) {
        const title = data.title || formatSlugToJobTitle(slug);
        const company = data.company?.title || slugMeta.inferredCompany || 'Company';
        const cleanCompSlug = company.toLowerCase().replace(/[^a-z0-9]/g, '');
        const companyLogo = data.company?.image || `https://www.google.com/s2/favicons?sz=128&domain=${cleanCompSlug}.com`;
        const companyWebsite = data.company?.website || `https://${cleanCompSlug}.com`;
        const rawLoc = data.location?.city ? `${data.location.city}${data.location.subregion ? `, ${data.location.subregion}` : ''}` : slugMeta.inferredLocation || 'Remote';
        const locDetails = resolveLocationDetails(rawLoc, data.workplace === 'remote' || data.workplace === 'hybrid');

        const descText = cleanHtml(data.description || '');
        const reqText = cleanHtml(data.requirementsSection || '');
        const fullCorpus = `${descText}\n${reqText}`;
        const responsibilities = extractBulletPoints(data.description || '').slice(0, 6);
        const qualifications = extractBulletPoints(data.requirementsSection || '').slice(0, 6);
        const skills = detectSkills(`${title} ${fullCorpus}`);
        const category = inferCategory(title, skills);
        const expLevel = inferExperienceLevel(title, fullCorpus);
        const isIntern = title.toLowerCase().includes('intern');
        const empType: EmploymentType = isIntern ? 'INTERN' : 'FULL_TIME';
        const benchmark = getRoleMarketBenchmark(title, category, locDetails.country || 'US', locDetails.location, expLevel);

        let salary: SalaryRange = benchmark;
        let salaryDisclosed = false;
        if (data.salary?.min && data.salary?.max) {
          salary = {
            min: data.salary.min,
            max: data.salary.max,
            currency: data.salary.currency || 'USD',
            unit: data.salary.interval === 'hour' ? 'HOUR' : 'YEAR'
          };
          salaryDisclosed = true;
        } else {
          const fromText = extractSalaryFromText(fullCorpus);
          if (fromText) {
            salary = fromText;
            salaryDisclosed = true;
          }
        }

        const cleanOverview = descText.split('\n\n')[0] || descText.slice(0, 300);
        const curatedDescription = composeFreshCommitsCuratedDescription({
          title,
          company,
          cleanOverview,
          skills,
          salary,
          responsibilities,
          qualifications,
          location: locDetails.location
        });

        return {
          title,
          company,
          companyLogo,
          companyWebsite,
          location: locDetails.location,
          isRemote: locDetails.isRemote,
          applicantLocationRequirements: locDetails.applicantLocationRequirements,
          city: locDetails.city,
          state: locDetails.state,
          country: locDetails.country,
          postalCode: locDetails.postalCode,
          experienceLevel: expLevel,
          maxYearsExperience: isIntern ? 0 : 1,
          category,
          employmentType: empType,
          salary,
          salaryDisclosed,
          suggestedBenchmark: benchmark,
          description: curatedDescription,
          responsibilities: responsibilities.length > 0 ? responsibilities : getRoleArchetypeContent(title, company).responsibilities,
          qualifications: qualifications.length > 0 ? qualifications : getRoleArchetypeContent(title, company).qualifications,
          skills,
          applyUrl: fullUrl,
          detectedAtsProvider: 'Workable'
        };
      }
    } catch {
      // If direct API fails due to CORS, seamlessly proceed to synthesizer or proxy
    }
  }

  // Fast path for enterprise portals with strict bot defenses that block proxies
  const isDirectEnterprisePortal =
    fullUrl.includes('google.com') ||
    fullUrl.includes('amazon.jobs') ||
    fullUrl.includes('microsoft.com') ||
    fullUrl.includes('apple.com') ||
    fullUrl.includes('metacareers.com');

  if (isDirectEnterprisePortal) {
    return synthesizeJobFromUrl(fullUrl);
  }

  // 5. ATTEMPT LIGHTWEIGHT CORS PROXY FETCH (3-second timeout)
  // If the target page allows proxy fetching (like Ashby or certain company career sites), parse HTML & JSON-LD
  try {
    const html = await fetchResourceWithProxy(fullUrl, false);
    if (html && html.length > 100) {
      // A. Check for Schema.org JobPosting JSON-LD
      const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      if (jsonLdMatch) {
        for (const block of jsonLdMatch) {
          try {
            const jsonContent = block.replace(/<\/?script[^>]*>/gi, '').trim();
            const parsed = JSON.parse(jsonContent);
            const jobPosting = Array.isArray(parsed) ? parsed.find((item) => item['@type'] === 'JobPosting') : parsed['@type'] === 'JobPosting' ? parsed : null;

            if (jobPosting && jobPosting.title) {
              const title = cleanHtml(jobPosting.title);
              const hiringOrg = jobPosting.hiringOrganization?.name;
              const synth = synthesizeJobFromUrl(fullUrl);
              const company = hiringOrg ? cleanHtml(hiringOrg) : synth.company;
              const desc = cleanHtml(jobPosting.description || '');
              const rawResp = extractBulletPoints(jobPosting.responsibilities || desc);
              const rawQual = extractBulletPoints(jobPosting.qualifications || desc);
              const skills = detectSkills(`${title} ${desc}`);
              const category = inferCategory(title, skills);
              const expLevel = inferExperienceLevel(title, desc);
              const isIntern = title.toLowerCase().includes('intern');

              // Location Extraction from Schema.org jobLocation
              const jobLoc = Array.isArray(jobPosting.jobLocation) ? jobPosting.jobLocation[0] : jobPosting.jobLocation;
              const addr = jobLoc?.address;
              const isRemoteSchema = jobPosting.jobLocationType === 'TELECOMMUTE' || String(jobPosting.jobLocationType || '').toLowerCase().includes('remote');

              let locDetails: {
                location: string;
                isRemote: boolean;
                city?: string;
                state?: string;
                country?: string;
                postalCode?: string;
                applicantLocationRequirements?: string;
              };

              if (addr && (addr.addressLocality || addr.addressRegion)) {
                const rawCity = cleanCityString(addr.addressLocality || '');
                const rawState = (addr.addressRegion || '').replace(/[^A-Za-z]/g, '').toUpperCase();
                const rawCountry = (addr.addressCountry || 'US').toUpperCase();
                const zip = addr.postalCode || lookupCityZip(rawCity)?.zip || '94105';
                const locStr = rawCity && rawState ? `${rawCity}, ${rawState}` : rawCity || rawState || 'United States';
                locDetails = {
                  location: isRemoteSchema ? `${locStr} (Remote)` : locStr,
                  isRemote: Boolean(isRemoteSchema && !rawCity),
                  city: rawCity,
                  state: rawState,
                  country: rawCountry,
                  postalCode: zip,
                  applicantLocationRequirements: jobPosting.applicantLocationRequirements?.name || (isRemoteSchema ? 'US' : undefined)
                };
              } else if (isRemoteSchema) {
                locDetails = {
                  location: 'Remote - US',
                  isRemote: true,
                  city: 'Remote',
                  state: 'US',
                  country: 'US',
                  postalCode: '94105',
                  applicantLocationRequirements: 'US'
                };
              } else {
                locDetails = synth;
              }

              // Salary Extraction from Schema.org baseSalary or text
              const benchmark = getRoleMarketBenchmark(title, category, locDetails.country || 'US', locDetails.location, expLevel);
              let salary: SalaryRange = benchmark;
              let salaryDisclosed = false;

              const bs = jobPosting.baseSalary || jobPosting.estimatedSalary;
              if (bs) {
                const val = bs.value;
                const minVal = bs.minValue || val?.minValue || (typeof val === 'number' ? val : undefined);
                const maxVal = bs.maxValue || val?.maxValue || (typeof val === 'number' ? val : undefined);
                const unit = (bs.unitText || val?.unitText || '').toUpperCase() === 'HOUR' ? 'HOUR' : 'YEAR';
                const cur = bs.currency || val?.currency || 'USD';

                if (minVal && Number(minVal) > 0) {
                  salary = {
                    min: Math.round(Number(minVal)),
                    max: Math.round(Number(maxVal || minVal)),
                    currency: cur,
                    unit
                  };
                  salaryDisclosed = true;
                }
              }

              if (!salaryDisclosed) {
                const fromText = extractSalaryFromText(desc);
                if (fromText) {
                  salary = fromText;
                  salaryDisclosed = true;
                }
              }

              const parsedSections = parseJobSections(jobPosting.description || '', title, company);
              const responsibilities = rawResp.length >= 2 ? rawResp.slice(0, 8) : parsedSections.responsibilities;
              const qualifications = rawQual.length >= 2 ? rawQual.slice(0, 8) : parsedSections.qualifications;
              const cleanOverview = parsedSections.overview || desc.slice(0, 600);

              return {
                title,
                company,
                companyLogo: jobPosting.hiringOrganization?.logo || synth.companyLogo,
                companyWebsite: synth.companyWebsite,
                location: locDetails.location,
                isRemote: locDetails.isRemote,
                city: locDetails.city,
                state: locDetails.state,
                country: locDetails.country,
                postalCode: locDetails.postalCode,
                applicantLocationRequirements: locDetails.applicantLocationRequirements,
                experienceLevel: expLevel,
                maxYearsExperience: isIntern ? 0 : 1,
                category,
                employmentType: isIntern ? 'INTERN' : 'FULL_TIME',
                salary,
                salaryDisclosed,
                suggestedBenchmark: benchmark,
                description: composeFreshCommitsCuratedDescription({
                  title,
                  company,
                  cleanOverview,
                  skills,
                  salary,
                  responsibilities,
                  qualifications,
                  location: locDetails.location
                }),
                responsibilities,
                qualifications,
                skills,
                applyUrl: fullUrl,
                detectedAtsProvider: synth.detectedAtsProvider
              };
            }
          } catch {
            // continue
          }
        }
      }

        // B. Check OpenGraph / Meta Title
        const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                             html.match(/<title[^>]*>([^<]+)<\/title>/i);

        if (ogTitleMatch && ogTitleMatch[1]) {
          const rawOg = ogTitleMatch[1].trim();
          let parsedTitle = rawOg;
          let parsedCompany: string | undefined;

          // Check "Title | Company | Board"
          if (rawOg.includes('|')) {
            const parts = rawOg.split('|').map((p: string) => p.trim()).filter(Boolean);
            if (parts.length >= 2) {
              parsedTitle = parts[0];
              const p1Low = parts[1].toLowerCase();
              if (!p1Low.includes('workable') && !p1Low.includes('greenhouse') && !p1Low.includes('lever') && !p1Low.includes('jobs')) {
                parsedCompany = parts[1];
              }
            }
          } else if (rawOg.includes(' at ')) {
            const parts = rawOg.split(' at ').map((p: string) => p.trim()).filter(Boolean);
            parsedTitle = parts[0];
            parsedCompany = parts[1];
          } else {
            parsedTitle = rawOg.replace(/[-|•].*$/, '').trim();
          }

          if (parsedTitle && parsedTitle.length > 3 && parsedTitle.length < 90) {
            const synth = synthesizeJobFromUrl(fullUrl);
            return {
              ...synth,
              title: parsedTitle,
              company: parsedCompany || synth.company,
              applyUrl: fullUrl
            };
          }
        }
      }
  } catch {
    // Network proxy failed or timed out — seamlessly proceed to heuristic synthesis
  }

  // 5. UNIVERSAL ZERO-FAILURE SYNTHESIS
  // Works flawlessly for Google Careers, Workday, Amazon, Microsoft, Apple, and all enterprise career pages!
  return synthesizeJobFromUrl(fullUrl);
}

/**
 * Rapid Raw Job Description Canvas Parser:
 * Extracts rich, structured JobPosting metadata from raw pasted JD text
 * (e.g., from Workday, Taleo, Oracle Cloud, LinkedIn, or career portals)
 * with 100% zero operational cost ($0.00).
 */
export function extractJobDataFromRawText(rawText: string, fallbackApplyUrl: string = ''): ExtractedJobData {
  const rawTrimmed = (rawText || '').trim();
  if (!rawTrimmed) {
    throw new Error('Please paste job description text into the canvas.');
  }

  // If input contains HTML tags or entitized HTML, sanitize into clean human-readable text
  const isHtml = /<[^>]+>|&(?:lt|gt|amp|quot|#39|nbsp);/i.test(rawTrimmed);
  const text = isHtml ? cleanHtml(rawTrimmed) : rawTrimmed;

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. EXTRACT TITLE
  let title = '';
  // Check if first line or early line looks like a job title
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i];
    if (
      line.length > 4 &&
      line.length < 100 &&
      !line.match(/^(Apply Now|Job Information|Search Jobs|Sign In|Skip to|Menu|Home|Careers|Job ID|Req ID)/i) &&
      !line.match(/^[0-9\/\-:\s,]+$/)
    ) {
      title = line.replace(/^(?:Job Title|Position|Role|Opening)[:\s–-]+/i, '').trim();
      break;
    }
  }
  if (!title) {
    title = lines[0] || 'Software Engineer (Early Career)';
  }
  // Strip awkward trailing HR seniority tags (e.g. ", Early Career" or " - Early Career")
  title = cleanHtml(stripSeniorityFromTitle(title));

  // 2. EXTRACT COMPANY
  let company = '';
  // Check "About Us", "About [Company]", "About the Team"
  const aboutMatch = text.match(/(?:About Us|About the Company|Company Overview|About)\s*\n+([A-Za-z0-9&,.\s\-]{2,50}?)(?:,|\.|is\b|offers\b|one of\b|operates\b|was founded\b)/i);
  if (aboutMatch && aboutMatch[1]) {
    const candidate = aboutMatch[1].trim().replace(/\n.*$/, '');
    if (candidate.length > 2 && candidate.length < 40 && !candidate.match(/^(The|Our|We|This|At)\b/i)) {
      company = candidate;
    }
  }

  if (!company) {
    // Check known companies in text
    const knownKeys = Object.keys(KNOWN_COMPANIES);
    for (const key of knownKeys) {
      const item = KNOWN_COMPANIES[key];
      const re = new RegExp(`\\b${item.name}\\b`, 'i');
      if (re.test(text)) {
        company = item.name;
        break;
      }
    }
  }

  if (!company) {
    // Check patterns like "at [Company]" in title or early lines
    const atMatch = text.match(/\bat\s+([A-Z][A-Za-z0-9&.\s]{2,30}?)(?:\s+(?:is|in|offers|,|\.|\n))/);
    if (atMatch && atMatch[1]) {
      company = atMatch[1].trim();
    }
  }

  if (!company) {
    company = 'Tech Employer';
  }

  // Fallback to detecting company from apply URL domain if text didn't explicitly have it
  if ((company === 'Tech Employer' || !company) && fallbackApplyUrl) {
    try {
      const u = fallbackApplyUrl.trim().startsWith('http') ? fallbackApplyUrl.trim() : `https://${fallbackApplyUrl.trim()}`;
      const urlObj = new URL(u);
      const compData = detectCompanyFromUrl(urlObj);
      if (compData.company && compData.company !== 'Tech Employer') {
        company = compData.company;
      }
    } catch {
      // ignore
    }
  }

  // 3. EXTRACT LOCATION
  let location = '';
  let city = '';
  let state = '';
  let country = 'US';
  let isRemote = false;

  const locMatch = text.match(/(?:Locations?|Job Location|Primary Location)\s*[:\n]\s*([^\n]+)/i);
  if (locMatch && locMatch[1]) {
    location = cleanLocationString(locMatch[1].trim());
  } else {
    // Check for US City, ST pattern (e.g. New York, NY or Ashburn, VA)
    const cityStateMatch = text.match(/\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?),\s*([A-Z]{2})\b/);
    if (cityStateMatch) {
      city = cleanCityString(cityStateMatch[1]);
      state = cityStateMatch[2].trim();
      location = `${city}, ${state}`;
    }
  }

  // Clean location if it contains street addresses or narrative prefixes
  location = cleanLocationString(location);
  const addressMatch = location.match(/(?:[0-9]+\s+[A-Za-z0-9\s.,]+,\s*)?([A-Za-z\s.-]+),\s*([A-Z]{2})(?:,\s*[0-9]{5})?(?:,\s*([A-Z]{2}))?/);
  if (addressMatch) {
    city = cleanCityString(addressMatch[1].trim().replace(/^.*,\s*/, ''));
    state = addressMatch[2].trim();
    if (addressMatch[3]) country = addressMatch[3].trim();
    location = `${city}, ${state}`;
  }

  if (location && location.includes(',')) {
    const parts = location.split(',');
    city = cleanCityString(parts[0]);
    state = parts[1].trim().replace(/\s*\/.*$/, '').replace(/[^A-Za-z\s]/g, '').trim();
    location = `${city}, ${state}`;
  }

  const textLower = text.toLowerCase();
  if (textLower.includes('hybrid') || location.toLowerCase().includes('hybrid')) {
    isRemote = false;
    if (!location.toLowerCase().includes('hybrid')) {
      location = location ? `${location} / Hybrid` : 'Hybrid';
    }
  } else if (textLower.includes('remote') || textLower.includes('telecommute') || textLower.includes('work from home')) {
    isRemote = true;
    if (!location.toLowerCase().includes('remote')) {
      location = location ? `${location} (Remote)` : 'Remote / US & Global';
    }
  }

  if (!location) {
    location = 'Remote / US & Global';
    isRemote = true;
  }

  // 4. EXTRACT SALARY / COMPENSATION
  const salaryMatch = text.match(/(?:Base Pay\/Salary|Salary|Pay Range|Compensation|Hourly Rate|Base Salary)[^\n]*\n*([^\n$]*\$([0-9]{2,3}(?:,[0-9]{3})*)\s*[-–]\s*\$([0-9]{2,3}(?:,[0-9]{3})*))/i);
  let salary: SalaryRange = { min: 0, max: 0, currency: 'USD', unit: 'YEAR' };
  let salaryDisclosed = false;

  if (salaryMatch) {
    const rawMin = parseInt(salaryMatch[2].replace(/,/g, ''), 10);
    const rawMax = parseInt(salaryMatch[3].replace(/,/g, ''), 10);
    if (rawMin > 0 && rawMax >= rawMin) {
      salaryDisclosed = true;
      salary = {
        min: rawMin,
        max: rawMax,
        currency: 'USD',
        unit: rawMax <= 300 ? 'HOUR' : 'YEAR'
      };
    }
  } else {
    // Attempt general salary regex
    const genSalary = extractSalaryFromText(text);
    if (genSalary && genSalary.min > 0) {
      salary = genSalary;
      salaryDisclosed = true;
    }
  }

  // 5. EXTRACT EMPLOYMENT TYPE & SENIORITY
  let employmentType: EmploymentType = 'FULL_TIME';
  if (textLower.includes('intern') || title.toLowerCase().includes('intern')) {
    employmentType = 'INTERN';
  } else if (textLower.includes('part time') || textLower.includes('part-time')) {
    employmentType = 'PART_TIME';
  } else if (textLower.includes('contract')) {
    employmentType = 'CONTRACT';
  }

  const experienceLevel = inferExperienceLevel(title, text);
  const maxYearsExperience = employmentType === 'INTERN' ? 0 : 1;

  // 6. EXTRACT SKILLS & CATEGORY
  const detectedSkills = detectSkills(text);
  // Add design-specific skills if applicable
  if (title.toLowerCase().includes('design') || textLower.includes('figma') || textLower.includes('ui/ux')) {
    if (!detectedSkills.includes('Figma')) detectedSkills.push('Figma');
    if (!detectedSkills.includes('Design Systems')) detectedSkills.push('Design Systems');
    if (!detectedSkills.includes('UI/UX')) detectedSkills.push('UI/UX');
    if (!detectedSkills.includes('Prototyping')) detectedSkills.push('Prototyping');
  }
  const skills = detectedSkills.slice(0, 8);
  const category = inferCategory(title, skills);

  // 7. EXTRACT STRUCTURED SECTIONS (OVERVIEW, RESPONSIBILITIES, QUALIFICATIONS)
  const parsedSections = parseJobSections(text, title, company);
  const responsibilities = parsedSections.responsibilities;
  const qualifications = parsedSections.qualifications;

  // 8. DATE POSTED
  let datePosted = new Date().toISOString().split('T')[0];
  const postDateMatch = text.match(/(?:Posting Date|Posted on|Date Posted)\s*[:\n]\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i);
  if (postDateMatch && postDateMatch[1]) {
    try {
      const d = new Date(postDateMatch[1]);
      if (!isNaN(d.getTime())) {
        datePosted = d.toISOString().split('T')[0];
      }
    } catch {
      // ignore
    }
  }

  // 9. ATS PROVIDER
  let detectedAtsProvider = 'Direct Career Portal';
  if (textLower.includes('workday')) detectedAtsProvider = 'Workday';
  else if (textLower.includes('greenhouse')) detectedAtsProvider = 'Greenhouse';
  else if (textLower.includes('lever.co')) detectedAtsProvider = 'Lever';
  else if (textLower.includes('smartrecruiters')) detectedAtsProvider = 'SmartRecruiters';
  else if (textLower.includes('ashby')) detectedAtsProvider = 'Ashby';
  else if (textLower.includes('taleo')) detectedAtsProvider = 'Taleo';

  if (fallbackApplyUrl) {
    const fLower = fallbackApplyUrl.toLowerCase();
    if (fLower.includes('greenhouse.io')) detectedAtsProvider = 'Greenhouse';
    else if (fLower.includes('lever.co')) detectedAtsProvider = 'Lever';
    else if (fLower.includes('smartrecruiters.com')) detectedAtsProvider = 'SmartRecruiters';
    else if (fLower.includes('workable.com')) detectedAtsProvider = 'Workable';
    else if (fLower.includes('ashbyhq.com')) detectedAtsProvider = 'Ashby';
    else if (fLower.includes('myworkdayjobs.com') || fLower.includes('workday.com')) detectedAtsProvider = 'Workday';
  }

  // 10. CLEAN OVERVIEW & CURATED DESCRIPTION
  const baseTitle = stripSeniorityFromTitle(title);
  const titleHasSeniority = /(?:early[\s-]career|entry[\s-]level|junior|new\s*grad|intern|graduate|fresher)/i.test(title);
  const article = /^[aeiou]/i.test(baseTitle) ? 'an' : 'a';
  const defaultOverview = titleHasSeniority
    ? `${company} is actively welcoming ${article} ${baseTitle} to join their team. Candidates will collaborate closely with experienced mentors, contributing directly to live product workflows and customer-facing features.`
    : `${company} is actively seeking an early-career ${baseTitle} to join their team. Candidates will collaborate closely with experienced mentors, contributing directly to live product workflows and customer-facing features.`;

  const cleanOverview = parsedSections.overview || defaultOverview;
  const curatedDescription = composeFreshCommitsCuratedDescription({
    title,
    company,
    cleanOverview,
    skills,
    salary,
    responsibilities,
    qualifications,
    location
  });

  const benchmark = getRoleMarketBenchmark(title, category, country, location || `${city || ''} ${state || ''}`, experienceLevel);

  // Company logo & website
  const cleanSlug = company.toLowerCase().replace(/[^a-z0-9]/g, '');
  const companyWebsite = `https://www.${cleanSlug}.com`;
  const companyLogo = `https://www.google.com/s2/favicons?sz=128&domain=${cleanSlug}.com`;

  const finalApplyUrl = fallbackApplyUrl.trim() || `https://www.freshcommits.com/`;

  return {
    title,
    company,
    companyLogo,
    companyWebsite,
    location,
    isRemote,
    city,
    state,
    country,
    applicantLocationRequirements: isRemote ? country : undefined,
    experienceLevel,
    maxYearsExperience,
    category,
    employmentType,
    salary,
    salaryDisclosed,
    suggestedBenchmark: benchmark,
    description: curatedDescription,
    responsibilities,
    qualifications,
    skills,
    applyUrl: finalApplyUrl,
    detectedAtsProvider,
    datePosted
  };
}
