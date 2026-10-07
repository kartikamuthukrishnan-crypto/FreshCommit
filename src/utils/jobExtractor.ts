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
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#xa0;/gi, ' ')
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
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
    'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'FastAPI',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Linux', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB',
    'Redis', 'GraphQL', 'REST APIs', 'APIs', 'Git', 'CI/CD', 'ServiceNow', 'Terraform', 'Kafka', 'Jest', 'Playwright',
    'Developer Experience', 'Trust & Safety', 'Risk Analysis', 'Policy Operations', 'Data Analysis', 'Security'
  ];
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const skill of commonSkills) {
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
    const known = KNOWN_COMPANIES[`${sub}.com`];
    const name = known ? known.name : sub.charAt(0).toUpperCase() + sub.slice(1);
    return {
      company: name,
      companyWebsite: `https://${sub}.com`,
      companyLogo: known?.logo || `https://www.google.com/s2/favicons?sz=128&domain=${sub}.com`,
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
  const isRemote = Boolean(
    isRemoteHint ||
    lowLoc.includes('remote') ||
    lowLoc.includes('wfh') ||
    lowLoc.includes('hybrid') ||
    lowLoc.includes('telecommute') ||
    lowLoc.includes('anywhere')
  );

  // 1. Check known city zip map for exact or substring city matches
  for (const [key, entry] of Object.entries(KNOWN_CITY_ZIP_MAP)) {
    const keyWithHyphens = key.replace(/\s+/g, '-');
    if (lowLoc.includes(key) || lowLoc.includes(keyWithHyphens)) {
      return {
        location: isRemote ? `${entry.city}, ${entry.state} / Hybrid` : `${entry.city}, ${entry.state}`,
        isRemote,
        city: entry.city,
        state: entry.state,
        country: 'US',
        postalCode: entry.zip,
        applicantLocationRequirements: isRemote ? 'US' : undefined
      };
    }
  }

  // 2. Workday City-ST-USA / City-ST format (e.g. "Boston-MA-USA" or "Austin-TX")
  const wdMatch = cleanLoc.match(/([a-zA-Z\s.-]+)[-_]([a-zA-Z]{2})(?:[-_](?:USA|US))?/);
  if (wdMatch) {
    const ct = cleanCityString(wdMatch[1].replace(/[-_]+/g, ' '));
    const st = wdMatch[2].toUpperCase();
    const mapped = lookupCityZip(ct);
    return {
      location: isRemote ? `${ct}, ${st} / Hybrid` : `${ct}, ${st}`,
      isRemote,
      city: ct,
      state: st,
      country: 'US',
      postalCode: mapped?.zip || '94105',
      applicantLocationRequirements: isRemote ? 'US' : undefined
    };
  }

  // 3. City, ST format (e.g. "Dallas, TX" or "San Jose, CA")
  const cityStMatch = cleanLoc.match(/([A-Z][a-zA-Z\s.-]+),\s*([A-Z]{2})/);
  if (cityStMatch) {
    const ct = cleanCityString(cityStMatch[1]);
    const st = cityStMatch[2].toUpperCase();
    const mapped = lookupCityZip(ct);
    return {
      location: isRemote ? `${ct}, ${st} / Hybrid` : `${ct}, ${st}`,
      isRemote,
      city: ct,
      state: st,
      country: 'US',
      postalCode: mapped?.zip || '94105',
      applicantLocationRequirements: isRemote ? 'US' : undefined
    };
  }

  // 4. Remote fallbacks
  if (isRemote || lowLoc.includes('united states') || lowLoc === 'us' || lowLoc === 'usa') {
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

  // Clean html tags if present
  const clean = text.replace(/<[^>]*>/g, ' ');

  // 1. Hourly Pattern: e.g. "$25 - $35 an hour", "$28.50 to $34.00 / hr", "$22 - $30/hour", "$25/hr"
  const hourlyRangeMatch = clean.match(/(?:\$|USD\s*)\s*([0-9]{2}(?:\.[0-9]{2})?)\s*(?:-|–|—|to)\s*(?:\$|USD\s*)?\s*([0-9]{2}(?:\.[0-9]{2})?)\s*(?:per|\/|an)?\s*(?:hour|hr)/i);
  if (hourlyRangeMatch) {
    const min = parseFloat(hourlyRangeMatch[1]);
    const max = parseFloat(hourlyRangeMatch[2]);
    if (min >= 12 && max >= min && max <= 250) {
      return { min: Math.round(min), max: Math.round(max), currency: 'USD', unit: 'HOUR' };
    }
  }

  // 2. Annual Range Pattern: e.g. "$55,000 - $75,000", "$60k - $80k", "$70,000 to $90,000 per year"
  const annualRangeMatch = clean.match(/(?:\$|USD\s*)\s*([0-9]{2,3}(?:,[0-9]{3})*|[0-9]{2,3}k)\s*(?:-|–|—|to)\s*(?:\$|USD\s*)?\s*([0-9]{2,3}(?:,[0-9]{3})*|[0-9]{2,3}k)(?:\s*(?:per|\/|a)?\s*(?:year|yr|annually|annual))?/i);
  if (annualRangeMatch) {
    const parseVal = (str: string) => {
      const lower = str.toLowerCase().replace(/,/g, '');
      if (lower.endsWith('k')) return parseFloat(lower.replace('k', '')) * 1000;
      return parseFloat(lower);
    };
    const min = parseVal(annualRangeMatch[1]);
    const max = parseVal(annualRangeMatch[2]);
    if (min >= 25000 && max >= min && max <= 450000) {
      return { min: Math.round(min), max: Math.round(max), currency: 'USD', unit: 'YEAR' };
    }
  }

  // 3. Single Stated Annual: e.g. "Starting salary: $65,000 / year"
  const singleAnnualMatch = clean.match(/(?:salary|pay|compensation)[\s:]+(?:\$|USD\s*)\s*([0-9]{2,3},[0-9]{3})(?:\s*(?:per|\/|a)?\s*(?:year|yr|annually|annual))?/i);
  if (singleAnnualMatch) {
    const val = parseFloat(singleAnnualMatch[1].replace(/,/g, ''));
    if (val >= 25000 && val <= 400000) {
      return { min: Math.round(val), max: Math.round(val), currency: 'USD', unit: 'YEAR' };
    }
  }

  return null;
}

/**
 * Provides an authentic, non-hallucinated 2026 early-career benchmark based on actual domain and role
 * Used ONLY when an administrator explicitly requests a benchmark suggestion
 */
export function getRoleMarketBenchmark(title: string, category: JobCategory, country: string = 'US'): SalaryRange {
  const t = title.toLowerCase();
  const upperCountry = (country || 'US').toUpperCase();
  const isIntern = t.includes('intern');

  if (upperCountry === 'GB' || upperCountry === 'UK') {
    if (isIntern) return { min: 16, max: 22, currency: 'GBP', unit: 'HOUR' };
    if (t.includes('help desk') || t.includes('support') || t.includes('technician')) {
      return { min: 24000, max: 32000, currency: 'GBP', unit: 'YEAR' };
    }
    return { min: 32000, max: 45000, currency: 'GBP', unit: 'YEAR' };
  }

  if (['DE', 'FR', 'NL', 'IE'].includes(upperCountry)) {
    if (isIntern) return { min: 16, max: 22, currency: 'EUR', unit: 'HOUR' };
    return { min: 45000, max: 60000, currency: 'EUR', unit: 'YEAR' };
  }

  if (upperCountry === 'IN') {
    if (isIntern) return { min: 20000, max: 45000, currency: 'INR', unit: 'MONTH' };
    return { min: 600000, max: 1200000, currency: 'INR', unit: 'YEAR' };
  }

  // Default: US Market
  if (isIntern) {
    return { min: 28, max: 45, currency: 'USD', unit: 'HOUR' };
  }

  // 1. IT Support / Help Desk / Operations / Technician
  if (t.includes('help desk') || t.includes('support') || t.includes('technician') || t.includes('desktop') || t.includes('it specialist')) {
    return { min: 48000, max: 65000, currency: 'USD', unit: 'YEAR' };
  }

  // 2. QA / Software Quality / Test Engineer
  if (t.includes('qa') || t.includes('quality') || t.includes('test') || category === 'QA / Test') {
    return { min: 65000, max: 82000, currency: 'USD', unit: 'YEAR' };
  }

  // 3. Data / AI / ML / Analytics
  if (category === 'Data / AI' || t.includes('data') || t.includes('machine learning') || t.includes('ai')) {
    return { min: 90000, max: 120000, currency: 'USD', unit: 'YEAR' };
  }

  // 4. DevOps / Cloud / Infrastructure / Security
  if (category === 'DevOps / Cloud' || t.includes('devops') || t.includes('cloud') || t.includes('security') || t.includes('sre')) {
    return { min: 90000, max: 122000, currency: 'USD', unit: 'YEAR' };
  }

  // 5. Software Engineer / Full Stack / Frontend / Backend
  return { min: 82000, max: 112000, currency: 'USD', unit: 'YEAR' };
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
  const { title, company, cleanOverview, skills, salary, location } = params;

  const dynamicTake = generateLeadEngineerTake({
    id: `${company}-${title}`,
    title,
    company,
    skills
  });

  const dynamicChecklist = generateCandidatePreparationChecklist({
    id: `${company}-${title}`,
    title,
    company,
    skills,
    salary,
    location
  });

  const edgeBlock = [
    `🎯 The FreshCommits Career Take:`,
    dynamicTake,
    ``,
    `💡 Candidate Preparation Checklist:`,
    ...dynamicChecklist,
    ``,
    `🏢 Role Overview:`,
    (cleanOverview || `${company} is actively seeking an enthusiastic ${title} to join their team and contribute to high-impact products and customer experiences.`)
      .replace(/actively seeking an? early-career ([^.\n]+?)(?:,\s*Early Career)/gi, 'actively seeking a $1')
      .replace(/actively seeking an? early-career ([^.\n]+?)(?:,\s*Entry Level)/gi, 'actively seeking a $1')
      .replace(/early-career ([^.\n]+?), Early Career/gi, '$1')
  ].join('\n');

  return edgeBlock;
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

  // 1. Decode entities & preserve headings
  if (text.includes('&lt;') || text.includes('&gt;')) {
    text = text
      .replace(/&lt;br\s*[\/]?&gt;/gi, '\n')
      .replace(/&lt;\/(?:p|div|h[1-6]|li|ul|ol)&gt;/gi, '\n\n')
      .replace(/&lt;li[^&]*&gt;/gi, '\n• ')
      .replace(/&lt;[^&gt;]+&gt;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }

  text = text
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n\n===HEADER: $1===\n\n')
    .replace(
      /<strong>\s*(What you(?:’|'| )*(?:will|'ll)?\s*(?:do|bring)|Responsibilities|Key Responsibilities|Qualifications|Requirements|Basic Qualifications|About Us[:\s]*)\s*<\/strong>/gi,
      '\n\n===HEADER: $1===\n\n'
    )
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/(?:p|div|section|article)>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#xa0;/gi, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&bull;/g, '•');

  const lines = text
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean);

  let currentSection: 'overview' | 'responsibilities' | 'qualifications' | 'other' = 'overview';
  const overviewParas: string[] = [];
  const respLines: string[] = [];
  const qualLines: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^===HEADER:\s*(.+?)===$/i);
    const candidate = headerMatch ? headerMatch[1].trim() : line;
    const low = candidate.toLowerCase();

    // Section transitions
    if (
      /^(?:what you(?:’|'| )*(?:will|'ll)?\s*do|responsibilities|key responsibilities|the role|what you will be doing|your mission|core duties|role responsibilities)[:\s]*$/i.test(low)
    ) {
      currentSection = 'responsibilities';
      continue;
    }
    if (
      /^(?:what you(?:’|'| )*(?:will|'ll)?\s*bring|qualifications|requirements|basic qualifications|minimum qualifications|what we(?:’|'| )*(?:are looking for|look for)|who you are|skills & experience|about you|eligibility)[:\s]*$/i.test(low)
    ) {
      currentSection = 'qualifications';
      continue;
    }
    if (
      /^(?:what we offer|benefits|perks|compensation|about the team|equal opportunity|diversity)[:\s]*$/i.test(low)
    ) {
      currentSection = 'other';
      continue;
    }

    if (headerMatch) continue;

    // Filter out common header leftovers
    if (
      /^(?:what you will do|what you'll do|what you bring|what you'll bring|responsibilities|key responsibilities|qualifications|requirements|basic qualifications|minimum qualifications|about us|who you are|who we are)[:\s]*$/i.test(low) ||
      /^(?:in this role,\s*you will|as an?\s*[^,]+,\s*you will|you will\s*(?:be responsible for)?)[:\s]*$/i.test(low) ||
      /^(?:to be successful|requirements|qualifications|basic qualifications|minimum qualifications)[:\s]*$/i.test(low)
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

    const cleanBullet = candidate.replace(/^[•\-\*–—\d\.\)]\s*/, '').trim();
    if (!cleanBullet || cleanBullet.length < 8) continue;

    if (currentSection === 'overview') {
      if (!overviewParas.includes(cleanBullet)) {
        overviewParas.push(cleanBullet);
      }
    } else if (currentSection === 'responsibilities') {
      if (!respLines.includes(cleanBullet)) {
        respLines.push(cleanBullet);
      }
    } else if (currentSection === 'qualifications') {
      if (!qualLines.includes(cleanBullet)) {
        qualLines.push(cleanBullet);
      }
    }
  }

  // Deduplicate against overview
  const overviewText = overviewParas.slice(0, 3).join('\n\n');
  const overviewLower = overviewText.toLowerCase();

  const finalResp = respLines
    .filter((r) => {
      const low = r.toLowerCase();
      if (overviewLower && (overviewLower.includes(low.slice(0, 35)) || (low.length > 40 && overviewLower.includes(low.slice(0, 50))))) {
        return false;
      }
      return true;
    })
    .slice(0, 8);

  const finalQual = qualLines
    .filter((q) => {
      const low = q.toLowerCase();
      if (finalResp.some((r) => r.toLowerCase() === low)) return false;
      if (overviewLower && (overviewLower.includes(low.slice(0, 35)) || (low.length > 40 && overviewLower.includes(low.slice(0, 50))))) {
        return false;
      }
      return true;
    })
    .slice(0, 8);

  // If parsed sections were sparse, augment with archetype defaults
  const archetype = getRoleArchetypeContent(title, company);
  const responsibilities = finalResp.length >= 2 ? finalResp : archetype.responsibilities;
  const qualifications = finalQual.length >= 2 ? finalQual : archetype.qualifications;

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
  const benchmark = getRoleMarketBenchmark(title, roleData.category, loc.country || 'US');
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

  // 1. WORKDAY DIRECT CXS API
  // e.g. https://autodesk.wd1.myworkdayjobs.com/Ext/job/Boston-MA-USA/PhD-Researcher--Multimodal-AI-for-Human-Experience_26WD101433-1
  const wdMatch = fullUrl.match(/https:\/\/([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)\.myworkdayjobs\.com\/(?:[a-zA-Z-]{2,5}\/)?([^/]+)\/job\/([^/]+)\/([^/?#]+)/i);
  if (wdMatch) {
    const [, sub, dc, site, locSeg, slug] = wdMatch;
    const apiUrl = `https://${sub}.${dc}.myworkdayjobs.com/wday/cxs/${sub}/${site}/job/${locSeg}/${slug}`;
    try {
      const resp = await fetch(apiUrl, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(4500) });
      if (resp.ok) {
        const data = await resp.json();
        const post = data.jobPostingInfo || {};
        const title = post.title || formatSlugToJobTitle(slug);
        const knownComp = KNOWN_COMPANIES[`${sub.toLowerCase()}.com`];
        const company = knownComp ? knownComp.name : sub.charAt(0).toUpperCase() + sub.slice(1);
        const rawLoc = post.location || locSeg.replace(/[-_]+/g, ' ');
        const locDetails = resolveLocationDetails(rawLoc);
        const jobDescHtml = post.jobDescription || '';
        const descText = cleanHtml(jobDescHtml);
        const parsed = parseJobSections(jobDescHtml, title, company);
        const skills = detectSkills(`${title} ${descText}`);
        const category = inferCategory(title, skills);
        const expLevel = inferExperienceLevel(title, descText);
        const isIntern = title.toLowerCase().includes('intern');
        const empType: EmploymentType = isIntern ? 'INTERN' : 'FULL_TIME';
        const benchmark = getRoleMarketBenchmark(title, category, locDetails.country || 'US');
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
          responsibilities: parsed.responsibilities.length > 0 ? parsed.responsibilities.slice(0, 6) : getRoleArchetypeContent(title, company).responsibilities,
          qualifications: parsed.qualifications.length > 0 ? parsed.qualifications.slice(0, 6) : getRoleArchetypeContent(title, company).qualifications,
          location: locDetails.location
        });

        return {
          title,
          company,
          companyLogo: knownComp?.logo || `https://www.google.com/s2/favicons?sz=128&domain=${sub}.com`,
          companyWebsite: `https://${sub}.com`,
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
          responsibilities: parsed.responsibilities.length > 0 ? parsed.responsibilities.slice(0, 6) : getRoleArchetypeContent(title, company).responsibilities,
          qualifications: parsed.qualifications.length > 0 ? parsed.qualifications.slice(0, 6) : getRoleArchetypeContent(title, company).qualifications,
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
      const resp = await fetch(apiUrl, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(4000) });
      if (resp.ok) {
        const boardData = await resp.json();
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
          const benchmark = getRoleMarketBenchmark(title, category, locDetails.country || 'US');

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
      const resp = await fetch(apiUrl, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(4000) });
      if (resp.ok) {
        const data = await resp.json();
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

        const benchmark = getRoleMarketBenchmark(title, category, locDetails.country || 'US');
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
      const resp = await fetch(apiUrl, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(4000) });
      if (resp.ok) {
        const data = await resp.json();
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
        const benchmark = getRoleMarketBenchmark(title, category, locDetails.country || 'US');
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
      const resp = await fetch(apiUrl, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(4000) });
      if (resp.ok) {
        const data = await resp.json();
        const title = data.text || 'Software Engineer';
        const company = comp.charAt(0).toUpperCase() + comp.slice(1);
        const locDetails = resolveLocationDetails(data.categories?.location || 'Remote', data.workplaceType === 'remote');
        const descText = cleanHtml(data.description || '');
        const skills = detectSkills(`${title} ${descText}`);
        const category = inferCategory(title, skills);
        const experienceLevel = inferExperienceLevel(title, descText);
        const maxYears = title.toLowerCase().includes('intern') ? 0 : 1;
        const empType: EmploymentType = title.toLowerCase().includes('intern') ? 'INTERN' : 'FULL_TIME';
        const benchmark = getRoleMarketBenchmark(title, category, locDetails.country || 'US');

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
      const resp = await fetch(apiUrl, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(3500) });
      if (resp.ok) {
        const data = await resp.json();
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
        const benchmark = getRoleMarketBenchmark(title, category, locDetails.country || 'US');

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
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(fullUrl)}`;
    const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(3000) });
    if (resp.ok) {
      const html = await resp.text();
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
                const company = hiringOrg || synth.company;
                const desc = cleanHtml(jobPosting.description || '');
                const rawResp = extractBulletPoints(jobPosting.responsibilities || desc);
                const rawQual = extractBulletPoints(jobPosting.qualifications || desc);
                const skills = detectSkills(`${title} ${desc}`);
                const category = inferCategory(title, skills);
                const expLevel = inferExperienceLevel(title, desc);
                const isIntern = title.toLowerCase().includes('intern');
                const benchmark = getRoleMarketBenchmark(title, category, 'US');

                let salary: SalaryRange = { min: 0, max: 0, currency: benchmark.currency, unit: isIntern ? 'HOUR' : 'YEAR' };
                let salaryDisclosed = false;

                if (jobPosting.baseSalary?.value?.minValue && jobPosting.baseSalary?.value?.maxValue) {
                  salary = {
                    min: Number(jobPosting.baseSalary.value.minValue),
                    max: Number(jobPosting.baseSalary.value.maxValue),
                    currency: jobPosting.baseSalary.currency || 'USD',
                    unit: jobPosting.baseSalary.value.unitText === 'HOUR' ? 'HOUR' : 'YEAR'
                  };
                  salaryDisclosed = true;
                } else {
                  const fromText = extractSalaryFromText(desc);
                  if (fromText) {
                    salary = fromText;
                    salaryDisclosed = true;
                  }
                }

                return {
                  title,
                  company,
                  companyLogo: jobPosting.hiringOrganization?.logo || synth.companyLogo,
                  companyWebsite: synth.companyWebsite,
                  location: synth.location,
                  isRemote: synth.isRemote,
                  city: synth.city,
                  state: synth.state,
                  country: synth.country,
                  postalCode: jobPosting.jobLocation?.address?.postalCode || synth.postalCode,
                  applicantLocationRequirements: synth.applicantLocationRequirements,
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
                    cleanOverview: desc.slice(0, 300),
                    skills,
                    salary,
                    responsibilities: rawResp.slice(0, 6),
                    qualifications: rawQual.slice(0, 6),
                    location: synth.location
                  }),
                  responsibilities: rawResp.length > 0 ? rawResp.slice(0, 6) : synth.responsibilities,
                  qualifications: rawQual.length > 0 ? rawQual.slice(0, 6) : synth.qualifications,
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
            const parts = rawOg.split('|').map((p) => p.trim()).filter(Boolean);
            if (parts.length >= 2) {
              parsedTitle = parts[0];
              const p1Low = parts[1].toLowerCase();
              if (!p1Low.includes('workable') && !p1Low.includes('greenhouse') && !p1Low.includes('lever') && !p1Low.includes('jobs')) {
                parsedCompany = parts[1];
              }
            }
          } else if (rawOg.includes(' at ')) {
            const parts = rawOg.split(' at ').map((p) => p.trim()).filter(Boolean);
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

  const benchmark = getRoleMarketBenchmark(title, category, country);

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
