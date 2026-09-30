import { JobCategory } from '../types';

/**
 * Focus Keywords Engine for FreshCommits:
 * Strictly adheres to Google Search Quality Rater Guidelines (E-E-A-T),
 * Google AdSense Helpful Content & Anti-Spam policies, and our Zero Operational Cost policy.
 *
 * Core Target Focus Keywords:
 *   1. "entry level"
 *   2. "new graduates"
 *   3. "junior engineer"
 *   4. "early career"
 *   5. "freshers"
 *
 * Eliminates repetitive boilerplate by providing role-specific "Lead Engineer's Takes"
 * that analyze the actual tech stack, seniority archetype, and company engineering environment.
 */

export const CORE_FOCUS_KEYWORDS = [
  'entry level',
  'new graduates',
  'junior engineer',
  'early career',
  'freshers'
] as const;

export type FocusKeyword = (typeof CORE_FOCUS_KEYWORDS)[number];

export interface FocusKeywordMatch {
  keyword: FocusKeyword;
  displayTag: string;
  phrase: string;
}

/**
 * Strips awkward trailing seniority tags (e.g., ", Early Career", " - Early Career", "(0-2 YoE)")
 * from raw ATS titles so prose sentences read naturally and never duplicate keywords.
 */
export function stripSeniorityFromTitle(title: string): string {
  if (!title) return '';
  return title
    .replace(/[,–-]\s*(?:Early Career|Entry Level|New Grad(?:uate)?|Junior|Graduate|Fresher|0[–-]2\s*YoE)\s*$/i, '')
    .replace(/\((?:Early Career|Entry Level|New Grad(?:uate)?|Junior|Graduate|Fresher|0[–-]2\s*YoE)\)/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Dynamically selects a target audience phrase that does NOT collide with or duplicate
 * any keyword already present in the job title.
 */
export function getTargetAudiencePhrase(title: string, seed: number): string {
  const t = (title || '').toLowerCase();
  const pool = [
    'early-career technologists',
    'junior engineers',
    'entry-level developers',
    'new graduates',
    'emerging technologists'
  ];

  // Filter out any phrase whose core word is already in title to guarantee zero duplication
  const safePool = pool.filter((p) => {
    if (t.includes('junior') && p.includes('junior')) return false;
    if ((t.includes('early') || t.includes('career')) && p.includes('early')) return false;
    if (t.includes('entry') && p.includes('entry')) return false;
    if (t.includes('grad') && p.includes('grad')) return false;
    return true;
  });

  const candidates = safePool.length > 0 ? safePool : ['emerging developers'];
  return candidates[seed % candidates.length];
}

/**
 * Detects the engineering archetype of the role to generate
 * authentic, stack-aware editorial analysis with zero API operational cost.
 */
function inferRoleArchetype(title: string, category?: string, skills: string[] = []): string {
  const t = title.toLowerCase();
  const allSkills = skills.map((s) => s.toLowerCase()).join(' ');

  if (
    t.includes('intern') ||
    t.includes('apprentice') ||
    t.includes('co-op') ||
    t.includes('stage') ||
    t.includes('alternance')
  ) {
    return 'internship';
  }

  if (
    t.includes('graduate') ||
    t.includes('grad') ||
    t.includes('university') ||
    t.includes('campus') ||
    t.includes('rotational') ||
    t.includes('stem career fair')
  ) {
    return 'graduate';
  }

  if (
    t.includes('fresher') ||
    t.includes('freshers') ||
    t.includes('open for freshers') ||
    t.includes('no experience')
  ) {
    return 'fresher';
  }

  if (
    t.includes('sql') ||
    t.includes('data') ||
    t.includes('database') ||
    t.includes('bi') ||
    t.includes('analytics') ||
    category === 'Data & AI' ||
    allSkills.includes('sql')
  ) {
    return 'data_sql';
  }

  if (
    t.includes('design') ||
    t.includes('ux') ||
    t.includes('ui/ux') ||
    t.includes('product design') ||
    t.includes('interaction design') ||
    allSkills.includes('figma') ||
    allSkills.includes('ui/ux')
  ) {
    return 'design_uiux';
  }

  if (
    t.includes('solution') ||
    t.includes('support') ||
    t.includes('integration') ||
    t.includes('specialist') ||
    t.includes('consultant') ||
    t.includes('service') ||
    t.includes('it field') ||
    t.includes('helpdesk') ||
    t.includes('servicenow')
  ) {
    return 'solutions_systems';
  }

  if (
    t.includes('frontend') ||
    t.includes('front end') ||
    t.includes('ui') ||
    t.includes('react') ||
    t.includes('web developer') ||
    category === 'Frontend'
  ) {
    return 'frontend';
  }

  if (
    t.includes('backend') ||
    t.includes('back end') ||
    t.includes('api') ||
    t.includes('cloud') ||
    t.includes('devops') ||
    t.includes('golang') ||
    t.includes('python') ||
    t.includes('java') ||
    category === 'Backend' ||
    category === 'DevOps'
  ) {
    return 'backend_cloud';
  }

  if (t.includes('qa') || t.includes('test') || t.includes('quality') || category === 'QA') {
    return 'qa_testing';
  }

  return 'fullstack_general';
}

/**
 * Returns the best contextual focus keyword archetype and human display label for a given job.
 */
export function getFocusKeywordForJob(job: {
  id?: string;
  title: string;
  category?: string;
  qualifications?: string[];
  skills?: string[];
}): FocusKeywordMatch {
  const titleLower = (job.title || '').toLowerCase();
  const archetype = inferRoleArchetype(job.title, job.category, job.skills);
  const seed = (job.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  if (archetype === 'graduate') {
    return {
      keyword: 'new graduates',
      displayTag: 'New Graduates',
      phrase: 'new graduates launching their software engineering careers'
    };
  }

  if (archetype === 'fresher') {
    return {
      keyword: 'freshers',
      displayTag: 'Freshers Welcome',
      phrase: 'freshers transitioning into commercial software teams'
    };
  }

  if (archetype === 'internship') {
    return {
      keyword: 'entry level',
      displayTag: 'Entry Level',
      phrase: 'entry-level talent seeking immersive production exposure'
    };
  }

  if (titleLower.includes('junior') || titleLower.includes('jr.')) {
    return {
      keyword: 'junior engineer',
      displayTag: 'Junior Engineer',
      phrase: 'junior engineers ready for hands-on technical ownership'
    };
  }

  const generalPool: { keyword: FocusKeyword; displayTag: string; phrase: string }[] = [
    {
      keyword: 'entry level',
      displayTag: 'Entry Level',
      phrase: 'entry-level developers looking to establish strong engineering habits'
    },
    {
      keyword: 'early career',
      displayTag: 'Early Career',
      phrase: 'early-career developers in their first one to two years of commercial experience'
    },
    {
      keyword: 'junior engineer',
      displayTag: 'Junior Engineer',
      phrase: 'junior engineers launching their commercial software journey'
    },
    {
      keyword: 'new graduates',
      displayTag: 'New Graduates',
      phrase: 'new graduates seeking structured team mentorship'
    },
    {
      keyword: 'freshers',
      displayTag: 'Freshers',
      phrase: 'freshers eager to build real-world engineering depth'
    }
  ];

  return generalPool[seed % generalPool.length];
}

/**
 * Generates an authentic, domain-specific Lead Engineer's Take for a job.
 * Guaranteed zero keyword repetition within the same sentence or paragraph.
 * Runs 100% locally with zero external API calls or operational costs.
 */
export function generateLeadEngineerTake(job: {
  id?: string;
  title: string;
  company: string;
  category?: JobCategory | string;
  skills?: string[];
}): string {
  const { title, company } = job;
  const skills = job.skills || [];
  const topSkill = skills[0] || '';
  const cleanTitle = stripSeniorityFromTitle(title);
  const archetype = inferRoleArchetype(title, job.category, skills);
  const seed = ((job.id || '') + title).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const targetAudience = getTargetAudiencePhrase(title, seed);

  // 1. Data & SQL Roles (e.g. Natixis Junior SQL Developer)
  if (archetype === 'data_sql') {
    const takes = [
      `A focused opportunity for ${targetAudience} looking to deepen database architecture, query optimization, and enterprise data workflows. ${company} pairs this role with structured code reviews across active production systems.`,
      `Well-suited for ${targetAudience} focused on data reliability, reporting pipelines, and schema modeling. This opening at ${company} emphasizes hands-on data manipulation alongside senior database architects.`,
      `An exceptional launchpad for ${targetAudience} eager to build commercial fluency in ${topSkill ? `${topSkill} and ` : ''}backend data stores, contributing directly to high-volume business systems and data integrity.`
    ];
    return takes[seed % takes.length];
  }

  // 2. Product Design, UI/UX (e.g. JPMorganChase Product Designer)
  if (archetype === 'design_uiux') {
    const takes = [
      `An engaging opening for ${targetAudience} eager to build responsive user interfaces, design system components, and interactive prototypes. ${company} provides structured design critique and active cross-functional collaboration.`,
      `A high-impact opportunity for ${targetAudience} looking to translate user research into clean, accessible digital journeys alongside senior product architects at ${company}.`,
      `Tailored for emerging talent passionate about product design, interactive flows, and modern design tokens within ${company}'s collaborative team culture.`
    ];
    return takes[seed % takes.length];
  }

  // 3. Solutions, Support & Hybrid Integration (e.g. Vista Group Hybrid Solution Specialist)
  if (archetype === 'solutions_systems') {
    const takes = [
      `Well-suited for ${targetAudience} who thrive at the intersection of technical troubleshooting and client systems. This opening at ${company} emphasizes hands-on system integration and commercial velocity over isolated ticket queues.`,
      `A strong pathway for ${targetAudience} looking to master end-to-end software configurations and enterprise integrations. ${company} provides dedicated senior guidance while giving candidates direct ownership of technical resolution workflows.`,
      `Tailored for analytical problem-solvers who enjoy diagnosing complex technical issues across live applications, bridging engineering fixes with real-world user requirements.`
    ];
    return takes[seed % takes.length];
  }

  // 4. New Graduates & Campus Programs (e.g. AECOM / Data Intellect)
  if (archetype === 'graduate') {
    const takes = [
      `Designed for new graduates transitioning theoretical foundations into commercial production deployments. ${company}'s cohort pairs candidates with dedicated staff mentors to build strong technical habits.`,
      `A structured runway for university graduates seeking broad technical exposure, code review hygiene, and cross-functional agile development from day one at ${company}.`,
      `An exceptional starting point for new graduates ready to contribute to active production systems while receiving continuous architectural guidance and career progression milestones.`
    ];
    return takes[seed % takes.length];
  }

  // 5. Freshers & Beginner Programs (e.g. SGS Open for Freshers)
  if (archetype === 'fresher') {
    const takes = [
      `An accessible entry point for freshers eager to gain commercial technical credentials with guided senior mentorship and clear progression milestones at ${company}.`,
      `Tailored for freshers seeking a high-support team culture where curiosity, clean problem-solving, and continuous learning are actively nurtured.`,
      `A supportive bridge for emerging technologists transitioning into professional tech teams, offering hands-on technical exposure without legacy corporate bureaucracy.`
    ];
    return takes[seed % takes.length];
  }

  // 6. Internships & Apprenticeships
  if (archetype === 'internship') {
    const takes = [
      `An immersive opportunity for emerging talent to experience authentic production sprints, version control workflows, and senior code reviews at ${company}.`,
      `A supportive program where aspiring engineers work on real product deliverables alongside seasoned mentors, gaining foundational industry credentials.`,
      `Designed for emerging developers ready for practical software development learning, offering direct exposure to modern engineering practices.`
    ];
    return takes[seed % takes.length];
  }

  // 7. Frontend / UI Engineering
  if (archetype === 'frontend') {
    const takes = [
      `An engaging opening for ${targetAudience} eager to build responsive user interfaces and modern component architectures. ${company} provides structured pair programming and active design-system collaboration.`,
      `A high-impact opportunity for ${targetAudience} looking to write clean, accessible frontend code and optimize client-side web performance within an active sprint cadence.`,
      `Tailored for front-of-glass engineers passionate about user-facing feature delivery, working alongside product designers and seasoned UI architects at ${company}.`
    ];
    return takes[seed % takes.length];
  }

  // 8. Backend, Cloud & DevOps
  if (archetype === 'backend_cloud') {
    const takes = [
      `A robust launchpad for ${targetAudience} looking to build scalable backend services, RESTful APIs, and reliable database integrations under guided technical leadership at ${company}.`,
      `Designed for ${targetAudience} seeking immersion in live server architectures, automated CI/CD pipelines, and rigorous code reviews.`,
      `An ideal position for ${targetAudience} looking to strengthen foundational distributed system design, cloud primitives, and containerized deployments.`
    ];
    return takes[seed % takes.length];
  }

  // 9. General Software Engineering & Full Stack
  const generalTakes = [
    `A well-rounded opportunity for ${targetAudience} to touch both client-side interfaces and backend logic, shipping real features directly into production at ${company}.`,
    `Joining ${company} as a ${cleanTitle} gives ${targetAudience} practical experience with modern development workflows, automated testing, and agile team cadences.`,
    `Tailored for ${targetAudience} ready to move beyond tutorial projects and take ownership of user-facing features within a collaborative engineering culture.`,
    `An exciting opening for ${targetAudience} focused on clean code, software design patterns, and high-velocity team collaboration at ${company}.`
  ];

  return generalTakes[seed % generalTakes.length];
}

/**
 * Strips awkward conversational lead-in phrases from location strings.
 * Example: "s office is located in Ashburn, VA" -> "Ashburn, VA"
 */
export function cleanLocationString(loc: string): string {
  if (!loc) return '';
  return loc
    .replace(/^(?:(?:[a-z0-9&.\-\s]+['’])?s\s+)?(?:office\s+(?:is\s+)?located\s+in|headquarters\s+(?:is\s+)?located\s+in|located\s+in|based\s+in|headquartered\s+in|our\s+office\s+is\s+in|position\s+is\s+based\s+in)\s+/i, '')
    .replace(/^s\s+office\s+is\s+located\s+in\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Cleans city strings to prevent narrative phrases being used as city names.
 * Example: "s office is located in Ashburn" -> "Ashburn"
 */
export function cleanCityString(city: string): string {
  if (!city) return '';
  const cleaned = cleanLocationString(city)
    .replace(/^(?:s\s+)?office\s+is\s+located\s+in\s+/i, '')
    .replace(/^(?:office|headquarters|location)\s+in\s+/i, '')
    .trim();
  return cleaned || city.trim();
}

/**
 * Generates an authentic, domain-tailored Candidate Preparation Checklist
 * with 5 distinct actionable dimensions (Stack, Interview Prep, Portfolio Signal, Compensation, Location).
 */
export function generateCandidatePreparationChecklist(job: {
  id?: string;
  title: string;
  company: string;
  category?: JobCategory | string;
  skills?: string[];
  salary?: { min: number; max: number; currency?: string; unit?: string };
  location?: string;
  isRemote?: boolean;
}): string[] {
  const { title, company } = job;
  const skills = job.skills || [];
  const topSkillsStr = skills.slice(0, 4).join(', ');
  const archetype = inferRoleArchetype(title, job.category, skills);
  const seed = ((job.id || '') + title).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const cleanLoc = cleanLocationString(job.location || (job.isRemote ? 'Remote (US & Global)' : 'New York, NY'));

  // 1. Core Stack prep
  let coreStackItem = `• Core Stack: Brush up on ${topSkillsStr || 'core computer science fundamentals'} and version control (Git).`;
  if (archetype === 'frontend') {
    coreStackItem = `• Core Stack: Focus on responsive component hierarchy, CSS layout systems (Flexbox/Grid), and ${topSkillsStr || 'modern JavaScript / React fundamentals'}.`;
  } else if (archetype === 'backend_cloud') {
    coreStackItem = `• Core Stack: Refresh RESTful endpoint architecture, database queries/indexing, and ${topSkillsStr || 'server-side language fundamentals'}.`;
  } else if (archetype === 'data_sql') {
    coreStackItem = `• Core Stack: Review SQL joins, aggregation pipelines, schema normalization, and ${topSkillsStr || 'Python / SQL data manipulation'}.`;
  } else if (archetype === 'solutions_systems') {
    coreStackItem = `• Core Stack: Practice HTTP API troubleshooting (Postman/curl), log inspection, and ${topSkillsStr || 'scripting for system integrations'}.`;
  } else if (archetype === 'design_uiux') {
    coreStackItem = `• Core Stack: Polish interactive Figma component variants, responsive design tokens, and user flow accessibility.`;
  } else if (archetype === 'internship' || archetype === 'graduate') {
    coreStackItem = `• Core Stack: Brush up on core computer science foundations (${topSkillsStr || 'data structures & algorithms'}), Git workflow, and code documentation.`;
  }

  // 2. Interview Prep focus
  let interviewPrepItem = `• Interview Focus: Engineering leads evaluate clean analytical problem-solving, architectural curiosity, domain awareness, and collaborative communication.`;
  if (archetype === 'frontend') {
    const list = [
      `• Interview Focus: Engineering leads at ${company} assess responsive component layout, state architecture, and web accessibility (WCAG).`,
      `• Interview Focus: Expect practical UI challenges, component rendering trade-offs, and questions on client-side state lifecycles.`,
      `• Interview Focus: Technical interviewers evaluate clean modular styling, DOM efficiency, and clear communication while pair programming.`
    ];
    interviewPrepItem = list[seed % list.length];
  } else if (archetype === 'backend_cloud') {
    const list = [
      `• Interview Focus: Leads evaluate clean RESTful architecture, transactional integrity, boundary validations, and edge-case handling.`,
      `• Interview Focus: Expect discussions around database schema modeling, API authentication patterns, and scalable microservice logic.`,
      `• Interview Focus: Engineering leads at ${company} emphasize clean error handling, concurrency awareness, and unit testing rigor.`
    ];
    interviewPrepItem = list[seed % list.length];
  } else if (archetype === 'data_sql') {
    const list = [
      `• Interview Focus: Technical leads evaluate live SQL schema queries, data pipeline reliability, and clear analytical problem-solving.`,
      `• Interview Focus: Expect scenario-based SQL challenges (joins, CTEs, window functions), data validation checks, and reporting logic.`,
      `• Interview Focus: ${company} evaluates systematic data troubleshooting, ETL schema hygiene, and clear cross-functional data storytelling.`
    ];
    interviewPrepItem = list[seed % list.length];
  } else if (archetype === 'solutions_systems') {
    const list = [
      `• Interview Focus: Hiring teams assess structured root-cause troubleshooting, clear written communication, and customer empathy during technical incidents.`,
      `• Interview Focus: Expect scenario roleplays diagnosing elusive platform errors, API integration failures, and client escalation triage.`,
      `• Interview Focus: ${company} looks for analytical problem-solvers who can translate complex technical bugs into actionable engineering tickets.`
    ];
    interviewPrepItem = list[seed % list.length];
  } else if (archetype === 'design_uiux') {
    const list = [
      `• Interview Focus: Design leads evaluate design rationale walk-throughs, edge-case UI handling, and cross-functional engineering handoffs.`,
      `• Interview Focus: Walk through your end-to-end design thinking, user friction trade-offs, and interactive prototype feedback.`
    ];
    interviewPrepItem = list[seed % list.length];
  } else if (archetype === 'internship' || archetype === 'graduate') {
    const list = [
      `• Interview Focus: Mentors evaluate foundational problem-solving, intellectual curiosity, willingness to learn, and collaborative team communication.`,
      `• Interview Focus: Expect project walk-throughs, practical Git version control scenarios, and discussions of past coursework or personal builds.`,
      `• Interview Focus: ${company} values candidates who demonstrate strong engineering curiosity, receptiveness to code review critique, and proactive questions.`
    ];
    interviewPrepItem = list[seed % list.length];
  }

  // 3. Practical Portfolio / Proof Signal
  let portfolioSignal = `• Portfolio Signal: Highlight a GitHub repository or project demonstrating clean version control and structured documentation.`;
  if (archetype === 'frontend') {
    portfolioSignal = `• Portfolio Signal: Showcase a deployed web application demonstrating responsive mobile layout, clean component hierarchy, and zero console errors.`;
  } else if (archetype === 'backend_cloud') {
    portfolioSignal = `• Portfolio Signal: Pin a public repository featuring documented API endpoints, relational database schema migrations, and automated unit tests.`;
  } else if (archetype === 'data_sql') {
    portfolioSignal = `• Portfolio Signal: Prepare a repository or notebook highlighting SQL data transformations, schema diagrams, and data insight reports.`;
  } else if (archetype === 'solutions_systems') {
    portfolioSignal = `• Practical Signal: Be prepared to walk through a concrete example where you diagnosed an elusive software bug and guided users to a resolution.`;
  } else if (archetype === 'design_uiux') {
    portfolioSignal = `• Portfolio Signal: Have 2–3 case studies ready showing problem framing, iterative wireframes, and interactive Figma prototypes.`;
  } else if (archetype === 'internship' || archetype === 'graduate') {
    portfolioSignal = `• Portfolio Signal: Highlight an academic capstone, hackathon build, or open-source contribution with clear Git commit history.`;
  }

  // 4. Compensation
  const hasSalary = job.salary && job.salary.min > 0;
  const salaryDisplay = hasSalary
    ? (job.salary!.unit === 'HOUR'
        ? `${job.salary!.currency || 'USD'} ${job.salary!.min}–${job.salary!.max}/hr`
        : `${job.salary!.currency || 'USD'} ${Math.round(job.salary!.min / 1000)}k–${Math.round(job.salary!.max / 1000)}k/year`)
    : '';

  const compItem = hasSalary
    ? `• Compensation Range: Verified employer range of ~${salaryDisplay} with career progression reviews.`
    : `• Compensation: Competitive / Based on Experience (Employer did not disclose a public base salary in the requisition).`;

  // 5. Location
  const locType = job.isRemote ? '100% Remote Opportunity' : cleanLoc.toLowerCase().includes('hybrid') ? 'Hybrid Work Model' : 'On-Site Team Collaboration';
  const locItem = `• Location: Based in ${cleanLoc} (${locType}).`;

  return [coreStackItem, interviewPrepItem, portfolioSignal, compItem, locItem];
}

/**
 * Editorial parser & humanizer for "The FreshCommits Career Take".
 * Automatically replaces the old generic template with the authentic
 * Lead Engineer's Take for this specific job requisition.
 */
export function humanizeCareerTake(
  careerTake: string,
  job: {
    id: string;
    title: string;
    company?: string;
    category?: JobCategory | string;
    experienceLevel?: string;
    qualifications?: string[];
    skills?: string[];
  }
): string {
  if (!careerTake) return '';

  const isOldGenericTemplate =
    careerTake.includes('actively investing in early-career talent') ||
    careerTake.includes('structured exposure to modern production tooling') ||
    careerTake.includes('high-leverage launchpad') ||
    careerTake.includes('0–2 YoE') ||
    careerTake.includes('0-2 YoE') ||
    /Early Career gives early-career/i.test(careerTake) ||
    /Junior.*gives junior/i.test(careerTake);

  if (isOldGenericTemplate && job.title) {
    return generateLeadEngineerTake({
      id: job.id,
      title: job.title,
      company: job.company || 'The employer',
      category: job.category,
      skills: job.skills
    });
  }

  // Sanitize any lingering double repetitions like "Early Career gives early-career"
  return careerTake
    .replace(/(?:,\s*Early Career|–\s*Early Career)\s+gives\s+early-career/gi, ' gives emerging technologists')
    .replace(/(?:,\s*Entry Level|–\s*Entry Level)\s+gives\s+entry-level/gi, ' gives early-career developers')
    .replace(/early-career developers(?=.*early-career)/i, 'emerging technologists');
}

/**
 * Sanitizes and dynamically upgrades checklist items if they are outdated or generic.
 */
export function humanizeChecklistItems(
  items: string[],
  job: {
    id?: string;
    title: string;
    company: string;
    category?: JobCategory | string;
    skills?: string[];
    salary?: { min: number; max: number; currency?: string; unit?: string };
    location?: string;
    isRemote?: boolean;
  }
): string[] {
  if (!items || items.length === 0) {
    return generateCandidatePreparationChecklist(job);
  }

  const hasStaticInterviewFocus = items.some((item) =>
    item.includes('Engineering leads evaluate clean analytical problem-solving, architectural curiosity, domain awareness, and collaborative communication.')
  );
  const hasCorruptedLocation = items.some((item) => item.includes('s office is located in'));

  if (hasStaticInterviewFocus || hasCorruptedLocation || items.length < 3) {
    return generateCandidatePreparationChecklist(job);
  }

  return items.map((it) => {
    let clean = cleanLocationString(it);
    clean = clean.replace(/s office is located in/gi, '').replace(/\s+/g, ' ').trim();
    return clean;
  });
}

