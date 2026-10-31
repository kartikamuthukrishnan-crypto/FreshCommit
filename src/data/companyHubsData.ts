export interface CompanySalaryTier {
  role: string;
  level: string;
  baseSalaryRange: string;
  medianBase: string;
  equityPerYear: string;
  signOnBonus: string;
  totalCompYear1: string;
  locationTiers: {
    tier1: string; // SF Bay Area, NYC, Seattle
    tier2: string; // Austin, Boston, Los Angeles, DC
    tier3: string; // Remote / Tier 3 US Metros
  };
}

export interface InterviewStage {
  title: string;
  duration: string;
  format: string;
  focus: string;
  keyTopics: string[];
  screeningTips: string;
}

export type CompanyCategory =
  | 'FAANG & Big Tech'
  | 'Enterprise & Consulting'
  | 'Unicorns & FinTech'
  | 'Remote & Scale-Ups';

export interface CompanyHub {
  slug: string;
  name: string;
  category: CompanyCategory;
  tagline: string;
  officialCareersUrl: string;
  headquarters: string;
  usTechHubs: string[];
  primaryRequisitions: string[];
  searchKeywords: string[];
  monthlySearchVolume: string;
  organicKD: string;
  brandColor: string;
  accentBg: string;
  salaryTier: CompanySalaryTier;
  interviewStages: InterviewStage[];
  behavioralValues: {
    frameworkName: string;
    description: string;
    sampleQuestions: string[];
    prepAdvice: string;
  };
  zeroExperienceStrategy: {
    portfolioCriteria: string[];
    screeningPitfalls: string[];
    idealTimeline: string;
  };
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const COMPANY_HUBS: CompanyHub[] = [
  // ==========================================
  // CATEGORY 1: FAANG & BIG TECH
  // ==========================================
  {
    slug: 'google',
    name: 'Google',
    category: 'FAANG & Big Tech',
    tagline: 'Search, Cloud, Android, YouTube & Frontier AI Systems',
    officialCareersUrl: 'https://careers.google.com/jobs/results/?distance=50&employment_type=FULL_TIME&experience_level=ENTRY_LEVEL',
    headquarters: 'Mountain View, California',
    usTechHubs: ['Mountain View, CA', 'New York, NY', 'Seattle / Kirkland, WA', 'Sunnyvale, CA', 'Austin, TX', 'Boulder, CO'],
    primaryRequisitions: [
      'Software Engineer, Early Career (L3)',
      'Software Engineer, University Graduate (Campus)',
      'Systems Software Engineer, Early Career'
    ],
    searchKeywords: [
      'entry level software jobs in google',
      'google software engineer entry level careers',
      'how to apply for google entry level software jobs',
      'google l3 software engineer salary us',
      'google early career software engineer interview'
    ],
    monthlySearchVolume: '32,700/mo',
    organicKD: '42 (Moderate)',
    brandColor: '#1a73e8',
    accentBg: '#e8f0fe',
    salaryTier: {
      role: 'Software Engineer, Early Career',
      level: 'L3',
      baseSalaryRange: '$135,000 – $165,000',
      medianBase: '$148,000',
      equityPerYear: '$35,000 – $45,000 (GSUs vesting 33%/33%/22%/12%)',
      signOnBonus: '$15,000 – $25,000',
      totalCompYear1: '$198,000 – $225,000',
      locationTiers: {
        tier1: '$205,000 – $225,000 (Bay Area, NYC, Seattle)',
        tier2: '$180,000 – $198,000 (Austin, Boulder, Chicago)',
        tier3: '$165,000 – $182,000 (Atlanta, Reston, Raleigh)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Google Early Career Application & ATS Review',
        duration: '1–2 Weeks',
        format: 'Official Google Careers Portal submission',
        focus: 'Review of GPA / graduation date, technical skills, and production code repositories.',
        keyTopics: ['Google XYZ bullet format', 'Verifiable GitHub repos', 'US work authorization', 'Standard graduation window'],
        screeningTips: 'Google recruiters evaluate trajectory. Do not submit 2-page resumes. Format your achievements using: "Accomplished [X] as measured by [Y] by doing [Z]".'
      },
      {
        title: 'Stage 2: Technical Screening Assessment (Online Coding / Phone Screen)',
        duration: '45–60 Minutes',
        format: 'Google Docs / Code Collab with Google Software Engineer',
        focus: 'Live data structure implementation, algorithmic complexity, and edge case reasoning.',
        keyTopics: ['Hash tables & maps', 'Binary trees & graph traversals (BFS/DFS)', 'Two pointers & sliding window', 'Time & space complexity (Big-O)'],
        screeningTips: 'Do not stay silent while thinking. Google interviewers actively score your thought communication. Explain your approach before typing any code.'
      },
      {
        title: 'Stage 3: Virtual Onsite Coding Rounds (3–4 Technical Interviews)',
        duration: '4 x 45 Minutes',
        format: '1-on-1 video interviews with senior SWEs',
        focus: 'Independent algorithmic problem solving, clean coding syntax, and handling evolving constraints.',
        keyTopics: ['Dynamic programming (sub-problems)', 'Heaps & priority queues', 'Trie / prefix trees', 'Deterministic unit testing'],
        screeningTips: 'Interviewers often adjust requirements midway. They evaluate how calmly and methodically you adapt.'
      },
      {
        title: 'Stage 4: Googleyness & Leadership Round',
        duration: '45 Minutes',
        format: 'Behavioral & situational interview with Engineering Manager',
        focus: 'Navigating ambiguity, constructive collaboration, team communication, and ethical engineering judgment.',
        keyTopics: ['Constructive conflict resolution', 'Prioritizing team goals over ego', 'Admitting mistakes and post-mortems', 'Intellectual humility'],
        screeningTips: 'Provide structured STAR examples. Never blame teammates or managers for past project challenges; emphasize what you learned.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Googleyness & Leadership Principles',
      description: 'Google values candidates who thrive in ambiguous environments, collaborate with zero ego, and prioritize user safety and code sustainability.',
      sampleQuestions: [
        'Tell me about a time you encountered an ambiguous requirement and how you resolved it.',
        'Describe a situation where a teammate pushed code that caused a regression. How did you handle the situation?',
        'Give an example of receiving critical feedback on a pull request. How did your approach evolve?'
      ],
      prepAdvice: 'Structure your answers using STAR. Quantify the impact and show how you actively sought alternative viewpoints.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build at least one distributed or concurrent service with automated test suites.',
        'Demonstrate active open-source contributions or bug fixes in public repositories.',
        'Deploy projects to live cloud endpoints with continuous integration.'
      ],
      screeningPitfalls: [
        'Submitting generic tutorial apps with zero tests.',
        'Failing to test algorithmic solutions against empty collections or extreme scale boundary conditions.',
        'Applying to Experienced L4/L5 requisitions instead of "Early Career / University Graduate".'
      ],
      idealTimeline: 'Apply in August–October for the primary following summer/fall cohort; off-cycle openings appear in February–April.'
    },
    faqs: [
      {
        question: 'Does Google hire entry-level software engineers with 0 commercial experience?',
        answer: 'Yes. Google’s "Software Engineer, Early Career" (L3) requisitions are specifically designed for recent university graduates, bootcamp completers, and career switchers with less than 1 year of professional experience.'
      },
      {
        question: 'What is the starting salary for an entry-level Google Software Engineer (L3) in the US?',
        answer: 'In 2026, the median base salary for a Google L3 SWE in the US is approximately $148,000, with total first-year compensation ranging between $198,000 and $225,000 including GSUs and sign-on bonuses.'
      }
    ]
  },
  {
    slug: 'amazon',
    name: 'Amazon',
    category: 'FAANG & Big Tech',
    tagline: 'AWS Cloud Infrastructure, Retail Systems, Prime & Logistics Tech',
    officialCareersUrl: 'https://www.amazon.jobs/en/job_categories/software-development',
    headquarters: 'Seattle, Washington',
    usTechHubs: ['Seattle & Bellevue, WA', 'Arlington, VA (HQ2)', 'Austin, TX', 'Sunnyvale, CA', 'New York, NY', 'Boston, MA'],
    primaryRequisitions: [
      'Software Development Engineer I (SDE 1)',
      'AWS Software Development Engineer (Early Career)',
      'Amazon Student Programs - Full Time SDE'
    ],
    searchKeywords: [
      'amazon entry level software engineer openings',
      'amazon university recruiting software engineer portal',
      'amazon sde 1 salary us entry level',
      'amazon sde 1 online assessment prep 2026'
    ],
    monthlySearchVolume: '29,500/mo',
    organicKD: '48 (Moderate)',
    brandColor: '#ff9900',
    accentBg: '#fff8e6',
    salaryTier: {
      role: 'Software Development Engineer I (SDE 1)',
      level: 'L4',
      baseSalaryRange: '$128,000 – $155,000',
      medianBase: '$140,000',
      equityPerYear: '$25,000 – $35,000 (5%/15%/40%/40% 4-year schedule)',
      signOnBonus: '$25,000 (Year 1) + $20,000 (Year 2 cash bridge)',
      totalCompYear1: '$180,000 – $205,000',
      locationTiers: {
        tier1: '$190,000 – $208,000 (Seattle, Bay Area, NYC)',
        tier2: '$175,000 – $192,000 (Arlington HQ2, Austin, Boston)',
        tier3: '$160,000 – $176,000 (Phoenix, Nashville, Remote US)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Amazon Online Assessment Part 1 (Code Debugging & Data Structures)',
        duration: '70 Minutes',
        format: 'HackerRank automated assessment',
        focus: 'Two algorithmic challenges testing arrays, strings, two pointers, and time complexity.',
        keyTopics: ['Hash maps', 'Two sum variations', 'Substrings & sliding windows', 'BFS on 2D grids'],
        screeningTips: 'Automated test suites include hidden performance tests. Aim for O(n) or O(n log n) solutions.'
      },
      {
        title: 'Stage 2: Amazon Online Assessment Part 2 (Work Simulation & Leadership)',
        duration: '90 Minutes',
        format: 'Interactive corporate scenario simulation',
        focus: 'Simulated workplace email/Slack threads making architectural and prioritization trade-offs.',
        keyTopics: ['Customer Obsession', 'Ownership vs expedience', 'Bias for Action vs Frugality', 'Earn Trust'],
        screeningTips: 'Choose answers that put the customer first and take responsibility for bugs rather than blaming external teams.'
      },
      {
        title: 'Stage 3: Virtual Final Onsite Loop (3–4 Rounds)',
        duration: '4 x 45–60 Minutes',
        format: '1-on-1 interviews combining 20 min Leadership Principles + 30 min Coding',
        focus: 'Data structure mastery, object-oriented design, and deep verification of behavioral STAR stories.',
        keyTopics: ['Class modeling & encapsulation', 'Trees & binary search trees', 'Priority queues', 'System reliability'],
        screeningTips: 'Every single Amazon interviewer evaluates at least two Leadership Principles. Prepare 6 distinct stories.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Amazon 14 Leadership Principles',
      description: 'Amazon treats Leadership Principles as an absolute hiring bar. Technical excellence cannot compensate for failing the LP evaluation.',
      sampleQuestions: [
        'Tell me about a time you had a tough deadline and had to make trade-offs.',
        'Describe a time when you saw an issue that was outside your direct responsibility and stepped in to fix it.',
        'Tell me about a time you used data to persuade a skeptic.'
      ],
      prepAdvice: 'Frame all behavioral answers in the STAR format. State specific metrics: "reduced latency by 35%".'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Show an understanding of cloud services (AWS Lambda, S3, DynamoDB, Docker).',
        'Demonstrate modular Object-Oriented Design (clean classes, separation of concerns).'
      ],
      screeningPitfalls: [
        'Giving generic team answers using "we" instead of clarifying your specific individual contribution ("I designed...").',
        'Failing to handle null pointer exceptions, empty strings, and negative numbers in live coding.'
      ],
      idealTimeline: 'Amazon University Recruiting runs rolling hiring year-round, with peak requisition openings in August and January.'
    },
    faqs: [
      {
        question: 'What is the starting salary for an Amazon SDE 1 in the US?',
        answer: 'In 2026, an entry-level SDE 1 at Amazon earns a median base salary of $140,000, with first-year total compensation between $180,000 and $205,000 including sign-on bonuses.'
      }
    ]
  },
  {
    slug: 'microsoft',
    name: 'Microsoft',
    category: 'FAANG & Big Tech',
    tagline: 'Azure Cloud, GitHub, Windows, Office 365 & Developer Tooling',
    officialCareersUrl: 'https://careers.microsoft.com/v2/global/en/home.html',
    headquarters: 'Redmond, Washington',
    usTechHubs: ['Redmond / Seattle, WA', 'Sunnyvale, CA', 'Atlanta, GA', 'Reston, VA', 'Austin, TX', 'Cambridge, MA'],
    primaryRequisitions: [
      'Software Engineer (Level 59/60)',
      'Microsoft Aspire Experience (Early Career SWE)',
      'Azure Cloud Solutions Software Engineer (New Grad)'
    ],
    searchKeywords: [
      'microsoft entry level software developer jobs',
      'microsoft career portal entry level developer',
      'microsoft level 59 software engineer salary'
    ],
    monthlySearchVolume: '24,400/mo',
    organicKD: '44 (Moderate)',
    brandColor: '#00a4ef',
    accentBg: '#e6f7ff',
    salaryTier: {
      role: 'Software Engineer',
      level: 'Level 59 / Level 60',
      baseSalaryRange: '$120,000 – $145,000',
      medianBase: '$135,000',
      equityPerYear: '$30,000 – $40,000 (vesting 25% annually over 4 years)',
      signOnBonus: '$15,000 – $25,000',
      totalCompYear1: '$175,000 – $198,000',
      locationTiers: {
        tier1: '$182,000 – $200,000 (Redmond/Seattle, Bay Area, NYC)',
        tier2: '$168,000 – $185,000 (Atlanta, Austin, Reston)',
        tier3: '$155,000 – $170,000 (Remote US / Mid-tier metros)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Campus / Online Screening Round (Codility)',
        duration: '60 Minutes',
        format: 'Automated 2-question assessment or 30-min phone screen',
        focus: 'Fundamental data manipulation, string parsing, arrays, and recursion.',
        keyTopics: ['Array manipulation', 'String parsing', 'Linked lists', 'Basic recursion'],
        screeningTips: 'Focus on writing readable code with descriptive variable names.'
      },
      {
        title: 'Stage 2: Virtual Final Round Loop (4 Interviews)',
        duration: '4 x 45 Minutes',
        format: 'Pair programming & architectural discussions with Microsoft engineers',
        focus: 'Collaborative coding, data structure trade-offs, testing mindset, and Growth Mindset evaluation.',
        keyTopics: ['Trees, BFS/DFS traversals', 'Dynamic programming basics', 'API contracts', 'Handling edge cases'],
        screeningTips: 'Microsoft interviewers often test how receptive you are to guidance. Trace logic when given hints.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Growth Mindset & Customer Empathy',
      description: 'Humility, curiosity, and learning from failure are core tenets.',
      sampleQuestions: [
        'Tell me about a technical concept you struggled to grasp initially and how you mastered it.',
        'Describe a time you failed to deliver on time or introduced a software bug. What did you change?'
      ],
      prepAdvice: 'Emphasize curiosity. Share examples of reading documentation and experimenting.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build applications using modern web stacks (TypeScript, React, C#/.NET, Python, or Azure).',
        'Highlight projects with clean CI/CD pipelines or accessibility (WCAG) compliance.'
      ],
      screeningPitfalls: [
        'Ignoring test writing: Microsoft engineers place tremendous value on automated unit tests.',
        'Being defensive when given hints during live technical rounds.'
      ],
      idealTimeline: 'Microsoft University Recruiting opens heavily in August through October.'
    },
    faqs: [
      {
        question: 'What is the Microsoft Aspire Experience?',
        answer: 'The Microsoft Aspire Experience is an onboarding and career development program for university graduates joining Microsoft full-time, offering executive mentorship and specialized learning tracks.'
      }
    ]
  },
  {
    slug: 'apple',
    name: 'Apple',
    category: 'FAANG & Big Tech',
    tagline: 'iOS, macOS, Apple Silicon, Swift & Consumer Privacy Hardware/Software',
    officialCareersUrl: 'https://jobs.apple.com/en-us/search?team=software-and-services-SFTWR',
    headquarters: 'Cupertino, California',
    usTechHubs: ['Cupertino, CA', 'Austin, TX', 'Seattle, WA', 'San Diego, CA', 'New York, NY', 'Boulder, CO'],
    primaryRequisitions: [
      'Software Engineer - Early Career (ICT2)',
      'CoreOS / Embedded Software Engineer (New Grad)',
      'Applications & Frameworks Engineer (Junior)'
    ],
    searchKeywords: [
      'apple junior software engineer positions',
      'apple early career hiring software engineer site',
      'apple ict2 software engineer salary us'
    ],
    monthlySearchVolume: '14,500/mo',
    organicKD: '40 (Moderate)',
    brandColor: '#555555',
    accentBg: '#f5f5f7',
    salaryTier: {
      role: 'Software Engineer',
      level: 'ICT2',
      baseSalaryRange: '$135,000 – $165,000',
      medianBase: '$148,000',
      equityPerYear: '$35,000 – $50,000 (RSUs vesting quarterly over 4 years)',
      signOnBonus: '$15,000 – $30,000',
      totalCompYear1: '$190,000 – $225,000',
      locationTiers: {
        tier1: '$200,000 – $225,000 (Cupertino/Bay Area, Seattle, NYC)',
        tier2: '$175,000 – $195,000 (Austin, San Diego, Boulder)',
        tier3: '$160,000 – $180,000 (Remote US / Other Hubs)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Apple Technical Recruiter Screen',
        duration: '30 Minutes',
        format: 'Phone call reviewing projects, OS fundamentals, and hardware/software interest',
        focus: 'Deep inspection of portfolio code, C++/Swift/Python proficiency, and alignment with Apple culture.',
        keyTopics: ['Memory management', 'Object-oriented architecture', 'System performance', 'Privacy focus'],
        screeningTips: 'Apple is team-centric: each engineering organization conducts its own interviews rather than a company-wide pool.'
      },
      {
        title: 'Stage 2: Technical Phone Screen / Pair Programming',
        duration: '45–60 Minutes',
        format: 'CoderPad live coding with an Apple Senior Engineer',
        focus: 'Data structures, pointers/references, algorithmic complexity, and idiomatic syntax.',
        keyTopics: ['Hash maps', 'String manipulation', 'Linked lists/trees', 'Memory lifecycle (ARC/stack/heap)'],
        screeningTips: 'Apple values attention to detail. Double-check memory leaks, array bounds, and edge conditions.'
      },
      {
        title: 'Stage 3: Full Onsite Loop (4–5 Technical Rounds)',
        duration: '5 x 45 Minutes',
        format: '1-on-1 rounds with team engineers and Engineering Manager',
        focus: 'Domain specific problem solving: OS primitives, user interface performance, or backend distributed systems.',
        keyTopics: ['Concurrency & threading', 'API design', 'Data structure optimization', 'Culture & team collaboration'],
        screeningTips: 'Show genuine passion for Apple products and user privacy. Be prepared to explain low-level details of how code executes.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Perfectionism, Craft & User Privacy',
      description: 'Apple prizes relentless craft, extreme attention to detail, and a user-first mindset.',
      sampleQuestions: [
        'Tell me about a time you optimized a piece of code to run significantly faster or use less memory.',
        'How do you balance shipping quickly with ensuring zero security or visual flaws?'
      ],
      prepAdvice: 'Demonstrate pride in craftsmanship. Talk about clean UI/UX, deterministic testing, and documentation.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a native Swift/SwiftUI application or low-level C++/Rust systems project.',
        'Demonstrate memory profiling (Instruments) or unit testing.'
      ],
      screeningPitfalls: [
        'Superficial knowledge of language runtime: understand stack vs heap and memory management.',
        'Treating Apple interviews like standard generic LeetCode: Apple asks practical systems questions.'
      ],
      idealTimeline: 'Apple campus recruiting peaks September–November with ongoing direct team postings.'
    },
    faqs: [
      {
        question: 'Does Apple hire entry-level engineers into specific teams or a general pool?',
        answer: 'Unlike Google or Meta which hire into general pools, Apple hires directly into specific teams (e.g. CoreOS, Maps, Siri, Safari, Apple Music). Your interviews are conducted by the exact engineers you will work with.'
      }
    ]
  },
  {
    slug: 'meta',
    name: 'Meta',
    category: 'FAANG & Big Tech',
    tagline: 'Instagram, WhatsApp, Reality Labs, PyTorch & Open Source AI',
    officialCareersUrl: 'https://www.metacareers.com/jobs?teams[0]=Software%20Engineering',
    headquarters: 'Menlo Park, California',
    usTechHubs: ['Menlo Park, CA', 'Seattle / Bellevue, WA', 'New York, NY', 'Sunnyvale, CA', 'Austin, TX', 'Boston, MA'],
    primaryRequisitions: [
      'Software Engineer, University Grad (E3)',
      'Enterprise Engineer (Early Career)',
      'Production Engineer, Infrastructure (E3)'
    ],
    searchKeywords: [
      'meta entry level software developer careers',
      'meta careers page junior software engineer',
      'meta e3 software engineer salary us'
    ],
    monthlySearchVolume: '17,000/mo',
    organicKD: '41 (Moderate)',
    brandColor: '#0668e1',
    accentBg: '#e7f0fd',
    salaryTier: {
      role: 'Software Engineer',
      level: 'E3',
      baseSalaryRange: '$138,000 – $168,000',
      medianBase: '$150,000',
      equityPerYear: '$35,000 – $50,000 (RSUs quarterly over 4 years)',
      signOnBonus: '$20,000 – $35,000',
      totalCompYear1: '$200,000 – $235,000',
      locationTiers: {
        tier1: '$205,000 – $235,000 (Bay Area, Seattle, NYC)',
        tier2: '$185,000 – $205,000 (Austin, Boston, Chicago)',
        tier3: '$170,000 – $190,000 (Remote US Nationwide)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Technical Coding Screen (CoderPad)',
        duration: '45 Minutes',
        format: 'Live pair programming with Meta SWE: two algorithmic problems',
        focus: 'Speed, accuracy, and optimal big-O complexity in 45 minutes.',
        keyTopics: ['Arrays & strings', 'Tree/graph traversals', 'Binary search', 'Two pointers'],
        screeningTips: 'Meta’s coding bar is focused on speed: you typically need to solve two distinct algorithmic questions bug-free within 45 minutes.'
      },
      {
        title: 'Stage 2: Full Virtual Onsite Loop (3 Rounds)',
        duration: '3 x 45 Minutes',
        format: '2 Coding rounds + 1 Behavioral / Culture round',
        focus: 'Algorithmic mastery, handling constraints, and alignment with Meta values.',
        keyTopics: ['Dynamic programming', 'Graphs/BFS', 'Live bug testing', 'Move Fast mindset'],
        screeningTips: 'Meta recently streamlined entry-level loops to 3 high-intensity 45-minute rounds.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Move Fast, Focus on Long-Term Impact & Build Awesome Things',
      description: 'Meta values aggressive execution speed, impact measurement, and constructive feedback.',
      sampleQuestions: [
        'Tell me about a time you had to deliver a feature rapidly with incomplete specs.',
        'Describe a situation where you received constructive criticism from a teammate.'
      ],
      prepAdvice: 'Emphasize bias for action and delivering measurable outcomes.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Master core LeetCode mediums with clean 15-minute completion times.',
        'Build full-stack applications with React, GraphQL, or open-source PyTorch models.'
      ],
      screeningPitfalls: [
        'Coding too slowly: Meta screens for rapid, accurate implementation.',
        'Forgetting boundary edge cases (null inputs, integer overflows).'
      ],
      idealTimeline: 'Meta University Recruiting opens in late August through October.'
    },
    faqs: [
      {
        question: 'What is Meta Bootcamp for new E3 hires?',
        answer: 'Meta Bootcamp is an immersive 6–8 week onboarding program where new software engineers work across multiple codebases before mutually selecting their permanent team.'
      }
    ]
  },
  {
    slug: 'nvidia',
    name: 'Nvidia',
    category: 'FAANG & Big Tech',
    tagline: 'CUDA, Accelerated Computing, GPU Architecture & Frontier AI Systems',
    officialCareersUrl: 'https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite',
    headquarters: 'Santa Clara, California',
    usTechHubs: ['Santa Clara, CA', 'Austin, TX', 'Redmond / Seattle, WA', 'Durham, NC', 'Westford, MA'],
    primaryRequisitions: [
      'Software Engineer - New College Graduate (IC1)',
      'System Software Engineer (CUDA / AI Infra)',
      'Deep Learning Software Engineer (Early Career)'
    ],
    searchKeywords: [
      'nvidia entry level software engineer roles',
      'nvidia new grad software engineer salary us',
      'nvidia cuda software engineering interview'
    ],
    monthlySearchVolume: '12,100/mo',
    organicKD: '46 (Moderate)',
    brandColor: '#76b900',
    accentBg: '#f2f8e9',
    salaryTier: {
      role: 'Software Engineer',
      level: 'IC1 (Level 1)',
      baseSalaryRange: '$140,000 – $170,000',
      medianBase: '$152,000',
      equityPerYear: '$40,000 – $55,000 (RSUs vesting quarterly)',
      signOnBonus: '$15,000 – $25,000',
      totalCompYear1: '$205,000 – $240,000',
      locationTiers: {
        tier1: '$210,000 – $240,000 (Santa Clara/Bay Area, Seattle)',
        tier2: '$185,000 – $210,000 (Austin, Durham, Westford)',
        tier3: '$170,000 – $195,000 (Remote US)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Technical Screening Interview',
        duration: '60 Minutes',
        format: 'Video interview with Nvidia systems SWE testing C/C++, data structures, and computer architecture',
        focus: 'Bitwise operations, pointers, memory hierarchy (cache/RAM), and concurrency.',
        keyTopics: ['Pointers & dynamic memory', 'Bit manipulation', 'Multi-threading & locks', 'Algorithmic complexity'],
        screeningTips: 'Nvidia evaluates systems programming depth. Be ready to explain CPU/GPU cache lines, virtual memory, and thread safety.'
      },
      {
        title: 'Stage 2: Virtual Onsite Technical Loop (4 Rounds)',
        duration: '4 x 60 Minutes',
        format: 'In-depth interviews covering algorithms, OS internals, low-level optimization, and team fit',
        focus: 'Writing performant, zero-overhead C++/CUDA code and solving algorithmic challenges.',
        keyTopics: ['Modern C++ (smart pointers, RAII)', 'CUDA kernel basics', 'Graph/Tree algorithms', 'Profiling & optimization'],
        screeningTips: 'Show that you understand hardware efficiency: why contiguous array access is faster than linked lists due to cache spatial locality.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Speed of Light Execution & Intellectual Honesty',
      description: 'Nvidia values first-principles thinking, extreme engineering rigor, and intellectual honesty.',
      sampleQuestions: [
        'Tell me about a difficult bug that took days to diagnose. How did you isolate root causes?',
        'How do you approach learning complex low-level architectures you have not worked with before?'
      ],
      prepAdvice: 'Demonstrate deep curiosity about computer systems. Walk through your debugging methodologies step-by-step.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a CUDA accelerated project, custom memory allocator, or multi-threaded C++ engine.',
        'Demonstrate benchmarking with tools like Perf, Valgrind, or Nvidia Nsight.'
      ],
      screeningPitfalls: [
        'Relying solely on high-level frameworks without understanding underlying systems memory.',
        'Not knowing basic bitwise operations (&, |, ^, <<, >>).'
      ],
      idealTimeline: 'Nvidia early-career requisitions open in September through November for summer starts.'
    },
    faqs: [
      {
        question: 'Do I need prior CUDA experience to get an entry-level software job at Nvidia?',
        answer: 'Not necessarily. While CUDA knowledge is a plus, strong foundations in C++, algorithms, data structures, and operating systems memory management are sufficient for many early-career roles.'
      }
    ]
  },

  // ==========================================
  // CATEGORY 2: ENTERPRISE, CLOUD & CONSULTING
  // ==========================================
  {
    slug: 'accenture',
    name: 'Accenture',
    category: 'Enterprise & Consulting',
    tagline: 'Global Technology Consulting, Enterprise Cloud & Digital Modernization',
    officialCareersUrl: 'https://www.accenture.com/us-en/careers/jobsearch?jk=entry-level',
    headquarters: 'Dublin, Ireland / US HQ: Chicago, IL & New York, NY',
    usTechHubs: ['Chicago, IL', 'New York, NY', 'Austin, TX', 'San Francisco, CA', 'Atlanta, GA', 'Boston, MA'],
    primaryRequisitions: [
      'Technology Associate / Software Engineer',
      'Cloud Architecture Analyst (Campus)',
      'Enterprise Systems Developer (Early Career)'
    ],
    searchKeywords: [
      'accenture entry level software engineer US',
      'accenture technology associate salary us',
      'accenture campus recruiting early career tech'
    ],
    monthlySearchVolume: '14,500/mo',
    organicKD: '43 (Moderate)',
    brandColor: '#a100ff',
    accentBg: '#f7edff',
    salaryTier: {
      role: 'Technology Associate',
      level: 'Associate (Level 12)',
      baseSalaryRange: '$85,000 – $96,000',
      medianBase: '$90,000',
      equityPerYear: 'N/A (Employee Stock Purchase Plan 15% discount)',
      signOnBonus: '$5,000 – $10,000',
      totalCompYear1: '$95,000 – $106,000',
      locationTiers: {
        tier1: '$98,000 – $108,000 (NYC, SF, San Jose, Boston)',
        tier2: '$88,000 – $96,000 (Chicago, Austin, Atlanta, Dallas)',
        tier3: '$80,000 – $88,000 (Philadelphia, Charlotte, Remote US)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Cognitive & Behavioral Assessment (pymetrics)',
        duration: '30 Minutes',
        format: 'Neuroscience-based gamified traits assessment',
        focus: 'Risk tolerance, attention, multitasking, and problem-solving patterns.',
        keyTopics: ['Decision making under uncertainty', 'Working memory', 'Patience & accuracy'],
        screeningTips: 'Play games naturally without trying to game results; Accenture uses this to map you to consulting vs engineering tracks.'
      },
      {
        title: 'Stage 2: Technical Assessment / Foundational Coding',
        duration: '45 Minutes',
        format: 'HackerRank test covering basic programming logic, SQL queries, and string manipulation',
        focus: 'Clean syntax, logical problem-solving, and database basics.',
        keyTopics: ['Basic data structures', 'SQL joins & grouping', 'Object-oriented basics'],
        screeningTips: 'SQL questions carry high weight in enterprise consulting. Ensure you understand INNER vs LEFT joins.'
      },
      {
        title: 'Stage 3: Behavioral & Case Interview with Managing Director',
        duration: '45 Minutes',
        format: '1-on-1 interview with Partner or Senior Manager',
        focus: 'Client communication, problem structuring, team collaboration, and adaptability.',
        keyTopics: ['STAR situational responses', 'Handling client scope changes', 'Learning new tech stacks'],
        screeningTips: 'Articulate your thought process clearly. Consultancies look for engineers who can explain tech to non-technical clients.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Client Value Creation, Respect for Individual & Best People',
      description: 'Accenture evaluates interpersonal poise, emotional intelligence, and trainability.',
      sampleQuestions: [
        'Tell me about a time you had to learn an unfamiliar technology under a tight deadline.',
        'Describe a situation where a client or stakeholder changed requirements midway.'
      ],
      prepAdvice: 'Demonstrate adaptability and readiness to take on multi-disciplinary cloud challenges.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a full-stack CRUD application with role-based authentication and a relational database.',
        'Obtain an AWS Certified Cloud Practitioner or Azure Fundamentals (AZ-900) certification.'
      ],
      screeningPitfalls: [
        'Being overly rigid about a single programming language: consultancies value polyglot adaptability.',
        'Failing to practice SQL database queries.'
      ],
      idealTimeline: 'Accenture recruits heavily August–November for summer cohorts, with spring off-cycle openings.'
    },
    faqs: [
      {
        question: 'Does Accenture provide paid training for early-career developers?',
        answer: 'Yes. All new Technology Associates complete the Accenture Tech Academy (typically 8–12 weeks of paid training covering cloud, full-stack, and enterprise architecture) before billing on client engagements.'
      }
    ]
  },
  {
    slug: 'deloitte',
    name: 'Deloitte',
    category: 'Enterprise & Consulting',
    tagline: 'Technology Consulting, Cloud Engineering & Enterprise Solutions',
    officialCareersUrl: 'https://jobs2.deloitte.com/us/en/search-results?category=Information%20Technology',
    headquarters: 'New York, NY',
    usTechHubs: ['New York, NY', 'Dallas, TX', 'McLean, VA', 'Chicago, IL', 'San Jose, CA', 'Atlanta, GA'],
    primaryRequisitions: [
      'Technology Analyst - Systems Engineering',
      'Solutions Developer (Campus Hire)',
      'Cloud & Analytics Associate'
    ],
    searchKeywords: [
      'deloitte entry level software developer jobs',
      'deloitte technology analyst salary us',
      'deloitte consulting software engineering interview'
    ],
    monthlySearchVolume: '12,800/mo',
    organicKD: '40 (Moderate)',
    brandColor: '#86bc25',
    accentBg: '#f2f8e6',
    salaryTier: {
      role: 'Technology Analyst',
      level: 'Analyst (Year 1)',
      baseSalaryRange: '$88,000 – $102,000',
      medianBase: '$94,000',
      equityPerYear: 'N/A (Annual performance bonus 5–12%)',
      signOnBonus: '$7,500 – $12,500',
      totalCompYear1: '$100,000 – $118,000',
      locationTiers: {
        tier1: '$102,000 – $118,000 (NYC, SF, San Jose, Boston)',
        tier2: '$92,000 – $104,000 (Dallas, Chicago, McLean, Atlanta)',
        tier3: '$85,000 – $95,000 (Tampa, Houston, Denver)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Deloitte Online Cognitive Assessment (SHL)',
        duration: '40 Minutes',
        format: 'Numerical, inductive, and deductive reasoning tests',
        focus: 'Data interpretation, logic deduction, and speed of comprehension.',
        keyTopics: ['Percentages & ratios', 'Trend projection', 'Logical matrices'],
        screeningTips: 'Practice standard SHL numerical tests online to familiarize yourself with time constraints.'
      },
      {
        title: 'Stage 2: Technical & Case Interview with Senior Manager',
        duration: '45 Minutes',
        format: 'Structured technology case interview',
        focus: 'Evaluating a business scenario: migrating a legacy retail database to the cloud.',
        keyTopics: ['High-level cloud migration', 'Database backup & security', 'Cost estimation', 'Agile sprints'],
        screeningTips: 'Structure your response into 3 clear pillars: Architecture, Security, and Rollout Timeline.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Lead the Way, Serve with Integrity & Foster Inclusion',
      description: 'Deloitte values professional polish, collaborative leadership, and analytical rigor.',
      sampleQuestions: [
        'Tell me about a time you had to present complex findings to a skeptical audience.',
        'Describe a situation where your team had to pivot strategy quickly.'
      ],
      prepAdvice: 'Structure answers using the STAR method with clear quantitative outcomes.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build applications showing clear business value (e.g. financial transaction tracker, analytics dashboard).',
        'Demonstrate understanding of cloud architectures (AWS/Azure).'
      ],
      screeningPitfalls: [
        'Focusing purely on code syntax without articulating business impact.',
        'Not reading up on current enterprise cloud migration trends.'
      ],
      idealTimeline: 'Deloitte campus recruiting runs September–November for next summer starts.'
    },
    faqs: [
      {
        question: 'What is Deloitte University onboarding?',
        answer: 'All incoming analysts attend training at Deloitte University (in Westlake, Texas), participating in leadership workshops, technical simulations, and executive networking.'
      }
    ]
  },
  {
    slug: 'cognizant',
    name: 'Cognizant',
    category: 'Enterprise & Consulting',
    tagline: 'Digital Modernization, Cloud Engineering & Enterprise Scale Applications',
    officialCareersUrl: 'https://careers.cognizant.com/global/en/c/technology-engineering-jobs',
    headquarters: 'Teaneck, New Jersey',
    usTechHubs: ['Teaneck, NJ', 'Dallas / Plano, TX', 'Phoenix, AZ', 'Tampa, FL', 'Atlanta, GA', 'Denver, CO'],
    primaryRequisitions: [
      'Entry-Level Software Engineer (TAG)',
      'Associate Software Developer (Campus Hire)',
      'Junior Full Stack Cloud Engineer'
    ],
    searchKeywords: [
      'cognizant entry level tech positions',
      'cognizant entry level software engineer salary usa',
      'cognizant academy early career hiring'
    ],
    monthlySearchVolume: '15,200/mo',
    organicKD: '42 (Moderate)',
    brandColor: '#0033a0',
    accentBg: '#e6eefa',
    salaryTier: {
      role: 'Entry-Level Software Engineer',
      level: 'Associate (Programmer Analyst Trainee)',
      baseSalaryRange: '$75,000 – $88,000',
      medianBase: '$82,000',
      equityPerYear: 'N/A',
      signOnBonus: '$3,000 – $5,000',
      totalCompYear1: '$80,000 – $94,000',
      locationTiers: {
        tier1: '$85,000 – $94,000 (NY/NJ Metro, SF Bay Area, Seattle)',
        tier2: '$78,000 – $86,000 (Dallas, Phoenix, Atlanta, Denver)',
        tier3: '$72,000 – $80,000 (Tampa, Charlotte, Remote US)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Automated Coding & Aptitude Test (Amcat / HackerEarth)',
        duration: '90 Minutes',
        format: 'Aptitude, logical reasoning, and 2 foundational coding problems',
        focus: 'Array manipulation, string parsing, and basic SQL commands.',
        keyTopics: ['Java/Python basics', 'SQL SELECT/JOIN', 'Logical series', 'Time management'],
        screeningTips: 'Do not spend all your time on difficult edge cases: getting 80% test cases passed across both questions secures the interview.'
      },
      {
        title: 'Stage 2: Technical & Behavioral Panel Interview',
        duration: '45 Minutes',
        format: 'Video interview with Senior Technical Lead',
        focus: 'Review of academic projects, OOP concepts (Inheritance, Polymorphism), and database normalization.',
        keyTopics: ['OOP principles', 'Database primary/foreign keys', 'REST API basics', 'Willingness to relocate'],
        screeningTips: 'Be flexible regarding technical stack. Mentioning that you are eager to learn Java Spring or Cloud data engineering is a massive plus.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Start with a Point of View, Seek Data, Work as One',
      description: 'Cognizant values team collaboration, enthusiasm for enterprise clients, and steady execution.',
      sampleQuestions: [
        'How do you manage deadlines when multiple priorities arise?',
        'Tell me about a project where you collaborated with someone with a different working style.'
      ],
      prepAdvice: 'Show a practical, grounded mindset and enthusiasm for client technology solutions.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a Java Spring Boot REST API connected to MySQL or PostgreSQL.',
        'Demonstrate understanding of Git version control and Docker basics.'
      ],
      screeningPitfalls: [
        'Saying you only want to work on a single niche framework.',
        'Stumbling on basic object-oriented programming definitions.'
      ],
      idealTimeline: 'Cognizant recruits year-round through their Talent Acquisition Group (TAG) across US university campuses.'
    },
    faqs: [
      {
        question: 'What is Cognizant Academy training?',
        answer: 'Cognizant Academy is an 8 to 12-week paid curriculum covering full-stack Java, cloud certifications (AWS/Azure), and enterprise architecture before junior engineers are assigned to project teams.'
      }
    ]
  },
  {
    slug: 'oracle',
    name: 'Oracle',
    category: 'Enterprise & Consulting',
    tagline: 'Oracle Cloud Infrastructure (OCI), Autonomous Database & Enterprise Applications',
    officialCareersUrl: 'https://www.oracle.com/corporate/careers/',
    headquarters: 'Austin, Texas',
    usTechHubs: ['Austin, TX', 'Redwood Shores / Bay Area, CA', 'Seattle, WA', 'Reston, VA', 'Denver / Broomfield, CO'],
    primaryRequisitions: [
      'Associate Software Engineer (Early Career)',
      'OCI Software Developer I (Cloud Infra)',
      'Database Software Engineer (Campus Graduate)'
    ],
    searchKeywords: [
      'oracle entry level software engineer jobs',
      'oracle ic1 software engineer salary us',
      'oracle cloud infrastructure early career hiring'
    ],
    monthlySearchVolume: '6,800/mo',
    organicKD: '35 (Low-Moderate)',
    brandColor: '#c74634',
    accentBg: '#faecea',
    salaryTier: {
      role: 'Associate Software Engineer',
      level: 'IC1',
      baseSalaryRange: '$98,000 – $118,000',
      medianBase: '$108,000',
      equityPerYear: '$20,000 – $30,000 (RSUs vesting annually over 4 years)',
      signOnBonus: '$10,000 – $15,000',
      totalCompYear1: '$120,000 – $142,000',
      locationTiers: {
        tier1: '$128,000 – $148,000 (Bay Area, Seattle)',
        tier2: '$112,000 – $128,000 (Austin, Reston, Denver)',
        tier3: '$100,000 – $115,000 (Remote US)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Online Technical Assessment (HackerRank)',
        duration: '90 Minutes',
        format: '3 coding challenges testing data structures, algorithms, and SQL',
        focus: 'Array manipulation, sorting, hash maps, and database querying.',
        keyTopics: ['Hash tables', 'Binary trees', 'SQL joins', 'Big-O complexity'],
        screeningTips: 'Oracle places strong emphasis on database concepts alongside standard algorithmic questions.'
      },
      {
        title: 'Stage 2: Virtual Onsite Technical Rounds (3–4 Rounds)',
        duration: '4 x 45 Minutes',
        format: '1-on-1 interviews with OCI and Database engineers',
        focus: 'Object-oriented design (Java/C++), distributed systems fundamentals, and code maintainability.',
        keyTopics: ['Java concurrency & memory', 'Class modeling', 'File I/O & caching', 'Culture & fit'],
        screeningTips: 'Demonstrate deep understanding of Java or C++ core libraries rather than relying on pseudo-code.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Customer Success, Integrity & Technological Innovation',
      description: 'Oracle values engineering discipline, system reliability, and customer focus.',
      sampleQuestions: [
        'Describe a time you resolved a challenging software issue through methodical debugging.',
        'How do you ensure your code is testable and maintainable for team members?'
      ],
      prepAdvice: 'Highlight attention to detail, testing practices, and understanding of enterprise scale.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a multi-tier web application using Java Spring Boot, MySQL, and Docker.',
        'Demonstrate understanding of ACID transactions and database indexing.'
      ],
      screeningPitfalls: [
        'Shallow understanding of database fundamentals: understand B-trees and index lookups.',
        'Writing messy code without automated unit tests.'
      ],
      idealTimeline: 'Oracle University Recruiting opens in August–October for next summer cohort starts.'
    },
    faqs: [
      {
        question: 'What is the compensation difference between Oracle OCI and Oracle Applications?',
        answer: 'Roles within Oracle Cloud Infrastructure (OCI) in Seattle and the Bay Area typically carry higher equity grants ($30k+/yr) compared to traditional enterprise applications teams.'
      }
    ]
  },

  // ==========================================
  // CATEGORY 3: HIGH-GROWTH UNICORNS & FINTECH
  // ==========================================
  {
    slug: 'stripe',
    name: 'Stripe',
    category: 'Unicorns & FinTech',
    tagline: 'Global Financial Infrastructure, Payments, Billing & Developer APIs',
    officialCareersUrl: 'https://stripe.com/jobs/search?teams=engineering&experience=early-career',
    headquarters: 'San Francisco, CA & Dublin, Ireland',
    usTechHubs: ['San Francisco, CA', 'Seattle, WA', 'New York, NY', 'Remote (US Nationwide)'],
    primaryRequisitions: [
      'Software Engineer - Early Career / New Grad (L1/L2)',
      'Backend Engineer, Financial Infrastructure (Early Career)',
      'Full Stack Engineer, Payments Experience (New Grad)'
    ],
    searchKeywords: [
      'stripe entry level software engineer jobs',
      'stripe new grad software engineer salary',
      'stripe practical coding interview prep 2026'
    ],
    monthlySearchVolume: '13,500/mo',
    organicKD: '38 (Low-Moderate)',
    brandColor: '#635bff',
    accentBg: '#f0f3ff',
    salaryTier: {
      role: 'Software Engineer',
      level: 'L1 / L2',
      baseSalaryRange: '$140,000 – $170,000',
      medianBase: '$155,000',
      equityPerYear: '$45,000 – $60,000 (RSUs vesting quarterly over 4 years)',
      signOnBonus: '$20,000 – $35,000',
      totalCompYear1: '$215,000 – $255,000',
      locationTiers: {
        tier1: '$225,000 – $255,000 (San Francisco, NYC, Seattle)',
        tier2: '$200,000 – $230,000 (Austin, Chicago, Denver)',
        tier3: '$190,000 – $215,000 (Remote US Nationwide)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Recruiter Screen & Technical Fit Conversation',
        duration: '30 Minutes',
        format: 'Video call with Early Career Engineering Recruiter',
        focus: 'Background review, programming language proficiency, and interest in financial systems.',
        keyTopics: ['Past projects & architecture', 'Preferred languages', 'Work authorization'],
        screeningTips: 'Be prepared to explain why you want to work at Stripe specifically: emphasize documentation quality and developer experience.'
      },
      {
        title: 'Stage 2: Practical Coding Screen (Live IDE Pair Programming)',
        duration: '60 Minutes',
        format: 'Pair programming in your own preferred local IDE or CoderPad',
        focus: 'Solving a practical software problem: parsing structured data, designing classes, handling network failure.',
        keyTopics: ['HTTP API requests', 'JSON serialization', 'Idempotency', 'Writing unit tests'],
        screeningTips: 'Stripe does not test abstract puzzles. They test real developer workflows. You can look up documentation during the interview.'
      },
      {
        title: 'Stage 3: Full Virtual Onsite Loop (4 Practical Rounds)',
        duration: '4 x 60 Minutes',
        format: 'Hands-on practical rounds with Stripe Engineers',
        focus: '1 Bug squash round, 1 API design round, 1 system design round, 1 culture round.',
        keyTopics: ['Debugging test suites', 'REST API design', 'Database schema modeling', 'Rigor'],
        screeningTips: 'In the bug squash round, do not immediately rewrite code; read the tests, find root causes, and fix the minimal lines necessary.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Stripe Operating Principles',
      description: 'Stripe values "Users First", "Move with Urgency and Focus", "Think Rigorously", and "Global Optimization".',
      sampleQuestions: [
        'Tell me about a time you had to make an engineering decision with incomplete data.',
        'Describe a situation where you had to debug an issue that impacted a real end user.'
      ],
      prepAdvice: 'Demonstrate intense care for developer experience and user impact.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build an API-driven project with complete documentation, idempotency headers, webhook processing, and rate limiting.',
        'Use TypeScript, Go, Python, or Java with real database integration (PostgreSQL).'
      ],
      screeningPitfalls: [
        'Relying purely on LeetCode memorization without knowing how to write unit tests or debug real code in an IDE.',
        'Neglecting edge cases: what happens when an external payment API times out?'
      ],
      idealTimeline: 'Stripe opens its New Grad and Early Career applications in late August through October.'
    },
    faqs: [
      {
        question: 'Does Stripe hire remote entry-level software engineers in the US?',
        answer: 'Yes. Stripe is one of the premier remote-friendly technology employers in the US. Early-career software engineers can work remotely from anywhere in the continental United States.'
      }
    ]
  },
  {
    slug: 'uber',
    name: 'Uber',
    category: 'Unicorns & FinTech',
    tagline: 'Mobility, Delivery, Freight & Real-Time Distributed Systems',
    officialCareersUrl: 'https://www.uber.com/us/en/careers/list/?department=Engineering',
    headquarters: 'San Francisco, California',
    usTechHubs: ['San Francisco, CA', 'Seattle, WA', 'New York, NY', 'Sunnyvale, CA', 'Chicago, IL', 'Boulder, CO'],
    primaryRequisitions: [
      'Software Engineer I (L3)',
      'University Graduate Software Engineer (Full-Time)',
      'Backend Engineer, Marketplace & Routing'
    ],
    searchKeywords: [
      'uber entry level software engineer roles',
      'uber l3 software engineer salary us',
      'uber university recruiting new grad coding screen'
    ],
    monthlySearchVolume: '9,100/mo',
    organicKD: '41 (Moderate)',
    brandColor: '#000000',
    accentBg: '#f2f2f2',
    salaryTier: {
      role: 'Software Engineer I',
      level: 'L3',
      baseSalaryRange: '$135,000 – $155,000',
      medianBase: '$144,000',
      equityPerYear: '$40,000 – $55,000 (RSUs quarterly over 4 years)',
      signOnBonus: '$15,000 – $25,000',
      totalCompYear1: '$195,000 – $220,000',
      locationTiers: {
        tier1: '$200,000 – $220,000 (SF, Seattle, NYC)',
        tier2: '$178,000 – $195,000 (Chicago, Boulder, Austin)',
        tier3: '$165,000 – $180,000 (Remote US)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: CodeSignal General Coding Assessment (GCA)',
        duration: '70 Minutes',
        format: 'Automated 4-question proctored coding test on CodeSignal',
        focus: 'Implementation, 2D matrix traversal, and complex data modeling under strict time limits.',
        keyTopics: ['Matrix transformations', 'String parsing', 'Hash map lookups', 'Greedy algorithms'],
        screeningTips: 'Aim for a score of 820+ out of 850 to guarantee automatic review by Uber technical recruiters.'
      },
      {
        title: 'Stage 2: Technical Phone Screen / Pair Programming',
        duration: '45–60 Minutes',
        format: 'Live video coding with an Uber SWE in CoderPad',
        focus: 'Data structures, algorithmic trade-offs, and clean modular code writing.',
        keyTopics: ['Trees & graph traversals', 'Shortest path algorithms', 'Dynamic programming basics'],
        screeningTips: 'Uber frequently asks graph questions related to maps, networks, and shortest paths.'
      },
      {
        title: 'Stage 3: Virtual Final Onsite Loop (3–4 Rounds)',
        duration: '4 x 45 Minutes',
        format: 'Coding rounds + System design for juniors + Behavioral interview',
        focus: 'Clean architecture, error handling, scale reasoning, and team values.',
        keyTopics: ['Class modeling', 'REST API contracts', 'Data normalization', 'STAR scenarios'],
        screeningTips: 'Explain your reasoning aloud before coding. Proactively test null inputs and empty lists.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Go Get It, Trip by Trip, See the Forest and the Trees',
      description: 'Uber values customer obsession, high ownership, and relentless execution.',
      sampleQuestions: [
        'Tell me about a time you saw a problem in a codebase and fixed it without being asked.',
        'Describe a situation where you had to debug an issue under time pressure.'
      ],
      prepAdvice: 'Structure responses with clear metrics: "reduced latency by 20%", "eliminated 4 unnecessary API requests".'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a real-time tracking application using WebSockets, Redis, and PostgreSQL.',
        'Demonstrate understanding of geospatial queries (e.g. bounding boxes, nearest neighbor lookups).'
      ],
      screeningPitfalls: [
        'Failing to practice proctored CodeSignal assessments under timed conditions.',
        'Writing monolithic code without modular helper functions.'
      ],
      idealTimeline: 'Uber University Recruiting opens August–November for the following summer cohort.'
    },
    faqs: [
      {
        question: 'What is the minimum CodeSignal score required for Uber early-career roles?',
        answer: 'While requirements vary by season, a certified CodeSignal score of 820+ generally guarantees that your application moves directly to technical recruiter review.'
      }
    ]
  },
  {
    slug: 'airbnb',
    name: 'Airbnb',
    category: 'Unicorns & FinTech',
    tagline: 'Global Hospitality Marketplace, Travel Infrastructure & Design Systems',
    officialCareersUrl: 'https://careers.airbnb.com/positions/?team=engineering',
    headquarters: 'San Francisco, California',
    usTechHubs: ['San Francisco, CA', 'Seattle, WA', 'Remote US Nationwide (Live & Work Anywhere)'],
    primaryRequisitions: [
      'Software Engineer (L7 / New Grad)',
      'Frontend / Full Stack Engineer (Early Career)',
      'Backend Infrastructure Engineer (Junior)'
    ],
    searchKeywords: [
      'airbnb entry level software engineer openings',
      'airbnb l7 software engineer salary us',
      'airbnb live and work anywhere software engineering'
    ],
    monthlySearchVolume: '7,900/mo',
    organicKD: '40 (Moderate)',
    brandColor: '#ff5a5f',
    accentBg: '#fff0f1',
    salaryTier: {
      role: 'Software Engineer',
      level: 'L7 (New Grad)',
      baseSalaryRange: '$140,000 – $165,000',
      medianBase: '$150,000',
      equityPerYear: '$50,000 – $65,000 (RSUs vesting quarterly over 4 years)',
      signOnBonus: '$15,000 – $25,000',
      totalCompYear1: '$210,000 – $240,000',
      locationTiers: {
        tier1: '$215,000 – $240,000 (SF Bay Area, Seattle, NYC)',
        tier2: '$195,000 – $220,000 (Austin, Denver, Chicago)',
        tier3: '$185,000 – $210,000 (Remote US Nationwide)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: HackerRank Coding Challenge',
        duration: '60 Minutes',
        format: 'Automated 2-question coding screen',
        focus: 'Data structures, string parsing, and efficient array filtering.',
        keyTopics: ['Hash tables', 'Sliding window', 'Interval overlapping', 'Time complexity'],
        screeningTips: 'Airbnb tests clean code and edge cases. Ensure your solution handles empty strings and single elements.'
      },
      {
        title: 'Stage 2: Technical Phone Screen / Pair Programming',
        duration: '60 Minutes',
        format: 'Video pair programming in CoderPad with an Airbnb SWE',
        focus: 'Practical coding challenge modeling a real-world booking or calendar reservation system.',
        keyTopics: ['Date & interval arithmetic', 'Object-oriented class design', 'Unit tests'],
        screeningTips: 'Write modular code with clear method names. Airbnb engineers care heavily about readability.'
      },
      {
        title: 'Stage 3: Full Virtual Onsite Loop (4 Rounds)',
        duration: '4 x 60 Minutes',
        format: '2 Coding rounds + 1 System design for juniors + 1 Core Values round',
        focus: 'Full-stack problem solving, defensive programming, and Airbnb cultural alignment.',
        keyTopics: ['API design', 'Data normalization', 'Core Values interview', 'Host/Guest mindset'],
        screeningTips: 'Airbnb’s Core Values round carries equal weight to technical rounds. Be authentic and articulate your personal alignment.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Champion the Mission, Be a Host, Embrace the Adventure, Be a Cereal Entrepreneur',
      description: 'Airbnb values deep empathy for hosts and guests, creative resourcefulness, and exceptional craft.',
      sampleQuestions: [
        'Tell me about an experience where you went above and beyond to make someone feel welcome or supported.',
        'Describe a time you solved a tough problem with limited resources.'
      ],
      prepAdvice: 'Demonstrate genuine empathy, personal integrity, and passion for community experiences.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a booking or reservation portal with date-range conflict detection and interactive calendar components.',
        'Demonstrate accessibility (WCAG AA) and responsive mobile-first UI.'
      ],
      screeningPitfalls: [
        'Neglecting date interval edge cases (e.g. check-out on the same day as check-in).',
        'Treating the Core Values interview as a casual informal chat.'
      ],
      idealTimeline: 'Airbnb opens early-career roles in September through November.'
    },
    faqs: [
      {
        question: 'Does Airbnb allow entry-level engineers to work 100% remotely?',
        answer: 'Yes. Under Airbnb’s "Live and Work Anywhere" policy, software engineers can work from anywhere in their country of employment with unadjusted tier-based compensation.'
      }
    ]
  },
  {
    slug: 'palantir',
    name: 'Palantir',
    category: 'Unicorns & FinTech',
    tagline: 'Foundry, Gotham, Artificial Intelligence Platform (AIP) & Mission Systems',
    officialCareersUrl: 'https://www.palantir.com/careers/',
    headquarters: 'Denver, Colorado',
    usTechHubs: ['Denver, CO', 'New York, NY', 'Washington, DC', 'Palo Alto, CA', 'Seattle, WA'],
    primaryRequisitions: [
      'Forward Deployed Software Engineer (FDSE)',
      'Software Engineer (Core Infrastructure)',
      'Site Reliability Engineer (Early Career)'
    ],
    searchKeywords: [
      'palantir entry level software developer',
      'palantir fdse salary entry level us',
      'palantir software engineering interview process'
    ],
    monthlySearchVolume: '6,500/mo',
    organicKD: '39 (Low-Moderate)',
    brandColor: '#101113',
    accentBg: '#eaebee',
    salaryTier: {
      role: 'Forward Deployed Software Engineer',
      level: 'FDSE / SWE I',
      baseSalaryRange: '$130,000 – $155,000',
      medianBase: '$140,000',
      equityPerYear: '$35,000 – $50,000 (Stock grants quarterly)',
      signOnBonus: '$10,000 – $20,000',
      totalCompYear1: '$180,000 – $210,000',
      locationTiers: {
        tier1: '$190,000 – $215,000 (NYC, Palo Alto, Seattle)',
        tier2: '$178,000 – $198,000 (Denver, Washington DC)',
        tier3: '$165,000 – $182,000 (Remote US)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Technical Coding Screen (HackerRank / Karat)',
        duration: '60 Minutes',
        format: 'Live algorithmic screen testing arrays, graphs, and simulation',
        focus: 'Fast bug-free implementation and handling complex data schemas.',
        keyTopics: ['Graph traversal', 'Data transformation', 'Hash table caching', 'Big-O runtime'],
        screeningTips: 'Palantir uses Karat for initial technical screens. You can request a redo interview if you have an off day.'
      },
      {
        title: 'Stage 2: Deployed Systems / Practical Problem Solving Round',
        duration: '60 Minutes',
        format: 'Interactive architectural simulation with Palantir engineer',
        focus: 'Solving messy data pipelines: data inconsistencies, network latency, and client integration.',
        keyTopics: ['Data pipeline design', 'Schema validation', 'Fault tolerance', 'Client communication'],
        screeningTips: 'Focus on how you handle missing or corrupt data records rather than assuming clean inputs.'
      },
      {
        title: 'Stage 3: Full Virtual Onsite Loop (3 Rounds)',
        duration: '3 x 60 Minutes',
        format: '1 Decomposition round + 1 Algorithmic round + 1 Hiring Manager fit round',
        focus: 'Breaking down ambiguous real-world problems into modular software components.',
        keyTopics: ['System decomposition', 'API contracts', 'Mission alignment', 'Work ethic'],
        screeningTips: 'Palantir values engineers who care deeply about solving real-world operational problems.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Mission First, Intellectual Honesty & Extreme Ownership',
      description: 'Palantir engineers deploy to solve critical problems for defense, healthcare, and global supply chains.',
      sampleQuestions: [
        'Tell me about a time you solved an ambiguous technical problem with zero existing documentation.',
        'Why do you want to work on critical infrastructure at Palantir?'
      ],
      prepAdvice: 'Demonstrate deep curiosity about data systems, operational resilience, and direct client impact.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a real-world data pipeline that ingests complex public datasets (e.g. NOAA weather, SEC filings).',
        'Implement robust schema validation and error logging.'
      ],
      screeningPitfalls: [
        'Treating the interview like pure abstract math without understanding practical data engineering.',
        'Giving superficial answers regarding Palantir’s products (Foundry, Gotham, AIP).'
      ],
      idealTimeline: 'Palantir university recruiting runs heavily August–November with off-cycle intakes.'
    },
    faqs: [
      {
        question: 'What is the difference between a Palantir SWE and a Forward Deployed Software Engineer (FDSE)?',
        answer: 'Core SWEs work on Palantir’s foundational platforms (Foundry, AIP, Gotham), whereas FDSEs work directly with commercial and government clients implementing customized workflows and data integrations.'
      }
    ]
  },

  // ==========================================
  // CATEGORY 4: REMOTE-FIRST & SCALE-UPS
  // ==========================================
  {
    slug: 'shopify',
    name: 'Shopify',
    category: 'Remote & Scale-Ups',
    tagline: 'Global E-Commerce Infrastructure, Ruby on Rails, React & Digital by Design',
    officialCareersUrl: 'https://www.shopify.com/careers/search?teams=engineering',
    headquarters: 'Ottawa, Canada / US Remote Nationwide',
    usTechHubs: ['100% Remote US Nationwide (Digital by Design)', 'San Francisco, CA', 'New York, NY'],
    primaryRequisitions: [
      'Software Developer I (Early Career)',
      'Backend Engineer, Core Rails (Junior)',
      'Frontend Developer, Merchant Experience'
    ],
    searchKeywords: [
      'shopify entry level developer openings',
      'shopify digital by design junior software salary',
      'shopify early career remote engineering interview'
    ],
    monthlySearchVolume: '7,500/mo',
    organicKD: '37 (Low-Moderate)',
    brandColor: '#96bf48',
    accentBg: '#f4f8ec',
    salaryTier: {
      role: 'Software Developer I',
      level: 'L6 (Developer 1)',
      baseSalaryRange: '$125,000 – $145,000',
      medianBase: '$134,000',
      equityPerYear: '$30,000 – $45,000 (Stock grants + Flex Comp)',
      signOnBonus: '$10,000 – $20,000',
      totalCompYear1: '$165,000 – $190,000',
      locationTiers: {
        tier1: '$175,000 – $195,000 (Bay Area, NYC, Seattle)',
        tier2: '$160,000 – $180,000 (Austin, Denver, Chicago)',
        tier3: '$150,000 – $170,000 (100% Remote US Nationwide)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Life Story Interview',
        duration: '60 Minutes',
        format: 'Conversational interview with Shopify Recruiter or Engineering Manager',
        focus: 'Reviewing your personal trajectory, curiosity, self-taught habits, and self-directed projects.',
        keyTopics: ['Personal journey into tech', 'How you learn new stacks', 'Handling obstacles', 'Curiosity'],
        screeningTips: 'Shopify values self-starters. Be genuine and tell the authentic story of why you decided to learn software engineering.'
      },
      {
        title: 'Stage 2: Technical Pair Programming Interview',
        duration: '60 Minutes',
        format: 'Hands-on live coding in your preferred local IDE over screen share',
        focus: 'Building or refactoring a realistic e-commerce feature: parsing shopping cart payloads, applying discounts, or handling currency conversions.',
        keyTopics: ['Clean code syntax', 'Writing unit tests', 'Refactoring', 'Communicating design decisions'],
        screeningTips: 'Shopify cares about clean, readable, maintainable code over clever algorithmic hacks. Write tests as you go.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Make Commerce Better for Everyone, High Agency & Asynchronous Craft',
      description: 'Shopify is a "Digital by Design" remote company that rewards high agency, direct communication, and craft.',
      sampleQuestions: [
        'Tell me about an open-source project or tool you built entirely out of your own curiosity.',
        'How do you manage your daily workflow and communication when working 100% remotely?'
      ],
      prepAdvice: 'Demonstrate high agency. Highlight how you set your own learning roadmap without hand-holding.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a functional e-commerce or inventory management tool with full test coverage (RSpec, Jest, or PyTest).',
        'Record a concise 2-minute video walkthrough explaining the architecture and include it in your GitHub README.'
      ],
      screeningPitfalls: [
        'Neglecting unit tests: Shopify engineers expect tests for every new feature.',
        'Being passive during pair programming: verbalize your plan before writing code.'
      ],
      idealTimeline: 'Shopify hires early-career engineers in seasonal cohorts starting in January and September.'
    },
    faqs: [
      {
        question: 'What is Shopify’s Flex Comp compensation model?',
        answer: 'Shopify lets employees choose their desired split between cash salary and stock options/RSUs based on their personal financial preferences.'
      }
    ]
  },
  {
    slug: 'atlassian',
    name: 'Atlassian',
    category: 'Remote & Scale-Ups',
    tagline: 'Jira, Confluence, Trello, Bitbucket & Modern Developer Collaboration Tools',
    officialCareersUrl: 'https://www.atlassian.com/company/careers/all-jobs?team=Engineering',
    headquarters: 'Sydney, Australia / US HQ: San Francisco, CA',
    usTechHubs: ['100% Remote Nationwide (TEAM Anywhere)', 'San Francisco, CA', 'Austin, TX', 'Boston, MA'],
    primaryRequisitions: [
      'Associate Software Engineer (TEAM Anywhere)',
      'Graduate Software Engineer (Full-Time)',
      'Junior Cloud Systems Engineer'
    ],
    searchKeywords: [
      'atlassian entry level software jobs',
      'atlassian team anywhere graduate software salary us',
      'atlassian early career remote developer interview'
    ],
    monthlySearchVolume: '6,900/mo',
    organicKD: '36 (Low-Moderate)',
    brandColor: '#0052cc',
    accentBg: '#e6effc',
    salaryTier: {
      role: 'Associate Software Engineer',
      level: 'P10 (Graduate / Junior)',
      baseSalaryRange: '$120,000 – $142,000',
      medianBase: '$130,000',
      equityPerYear: '$35,000 – $48,000 (RSUs vesting quarterly over 4 years)',
      signOnBonus: '$10,000 – $20,000',
      totalCompYear1: '$165,000 – $195,000',
      locationTiers: {
        tier1: '$175,000 – $198,000 (SF Bay Area, NYC, Seattle)',
        tier2: '$160,000 – $182,000 (Austin, Boston, Chicago)',
        tier3: '$150,000 – $170,000 (100% Remote US Nationwide)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Karat Technical Screening Assessment',
        duration: '60 Minutes',
        format: 'Live video coding with a professional Karat interviewer',
        focus: 'Data structures, algorithm complexity, and code debugging.',
        keyTopics: ['Hash maps', 'String manipulation', '2D grid traversal', 'Time/space Big-O'],
        screeningTips: 'Spend the first 5 minutes clarifying the problem and stating test cases before writing code.'
      },
      {
        title: 'Stage 2: Full Virtual Onsite Loop (3 Rounds)',
        duration: '3 x 60 Minutes',
        format: '1 Code design & data structures round + 1 System architecture round + 1 Values interview',
        focus: 'Writing modular code, modeling extensible classes, and demonstrating Atlassian team values.',
        keyTopics: ['Class modeling', 'REST endpoints', 'Atlassian Values', 'Team collaboration'],
        screeningTips: 'Atlassian values clean object-oriented architecture. Think about how other engineers would extend your classes.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Open Company No Bullshit, Build with Heart and Balance, Play as a Team',
      description: 'Atlassian values total transparency, constructive feedback, and zero arrogance.',
      sampleQuestions: [
        'Tell me about a time you gave direct, constructive feedback to a peer or teammate.',
        'Describe a situation where a project failed to meet expectations. What was your post-mortem?'
      ],
      prepAdvice: 'Demonstrate vulnerability and transparency. Atlassian respects engineers who openly discuss what went wrong and how they grew.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a real-time collaborative workspace or project board (like a mini-Trello or Jira clone).',
        'Document your project with comprehensive API contracts and setup instructions.'
      ],
      screeningPitfalls: [
        'Being defensive during code reviews or interviews.',
        'Writing messy code without clear variable names.'
      ],
      idealTimeline: 'Atlassian University Recruiting opens in August–October for spring and summer cohorts.'
    },
    faqs: [
      {
        question: 'What is Atlassian’s "TEAM Anywhere" policy?',
        answer: 'TEAM Anywhere allows Atlassian employees to work from anywhere in the country where they are legally authorized to work, with access to collaborative hub offices if desired.'
      }
    ]
  },
  {
    slug: 'github',
    name: 'GitHub',
    category: 'Remote & Scale-Ups',
    tagline: 'The Home for All Developers, Git Version Control & GitHub Copilot AI',
    officialCareersUrl: 'https://github.com/about/careers',
    headquarters: 'San Francisco, CA / 100% Remote Worldwide',
    usTechHubs: ['100% Remote US Nationwide', 'San Francisco, CA', 'Bellevue / Redmond, WA'],
    primaryRequisitions: [
      'Software Engineer I (Early Career)',
      'Campus Software Engineer (New Grad)',
      'Frontend / Platform Engineer (Junior)'
    ],
    searchKeywords: [
      'gitHub entry level software engineer jobs',
      'github early career remote software developer salary',
      'github new grad software engineer interview'
    ],
    monthlySearchVolume: '5,200/mo',
    organicKD: '32 (Low-Moderate)',
    brandColor: '#24292e',
    accentBg: '#eaecef',
    salaryTier: {
      role: 'Software Engineer I',
      level: 'Level 59 (Microsoft Level Alignment)',
      baseSalaryRange: '$125,000 – $148,000',
      medianBase: '$135,000',
      equityPerYear: '$35,000 – $48,000 (Microsoft stock awards)',
      signOnBonus: '$15,000 – $25,000',
      totalCompYear1: '$175,000 – $200,000',
      locationTiers: {
        tier1: '$180,000 – $205,000 (Bay Area, Seattle, NYC)',
        tier2: '$165,000 – $188,000 (Austin, Denver, Chicago)',
        tier3: '$155,000 – $175,000 (100% Remote US Nationwide)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Asynchronous Coding Screen / GitHub Repo Review',
        duration: '45–60 Minutes',
        format: 'Review of open-source contributions and an online coding challenge',
        focus: 'Data structures, git knowledge, and code cleanliness.',
        keyTopics: ['Git internals', 'Hash tables', 'String parsing', 'Clean commit history'],
        screeningTips: 'Ensure your GitHub profile has active contribution streaks, clear README documentation, and sensible commit messages.'
      },
      {
        title: 'Stage 2: Virtual Pair Programming Loop (3 Rounds)',
        duration: '3 x 60 Minutes',
        format: 'Hands-on pair programming with GitHub engineers in your local environment',
        focus: 'Modifying an existing codebase, implementing new API endpoints, and discussing technical trade-offs.',
        keyTopics: ['REST / GraphQL APIs', 'Writing automated test suites', 'Git branching & pull requests', 'Asynchronous communication'],
        screeningTips: 'GitHub engineers care deeply about developer experience. Treat the interview like a real pull request review session.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Customer Obsessed, Inclusive, Growth Mindset, Extreme Ownership',
      description: 'GitHub values engineers who build tools that empower fellow developers worldwide.',
      sampleQuestions: [
        'Tell me about an open-source tool or library you contributed to or built.',
        'How do you communicate complex technical specifications in writing for remote team members?'
      ],
      prepAdvice: 'Emphasize your love for developer tooling, automation, and clear written communication.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Contribute meaningful pull requests (bug fixes, documentation, feature additions) to public open-source repos.',
        'Build a developer CLI tool or GitHub Action with clean CI/CD automated tests.'
      ],
      screeningPitfalls: [
        'Having an empty or disorganized GitHub profile when applying to GitHub.',
        'Dumping giant commits with messages like "update files" or "fix".'
      ],
      idealTimeline: 'GitHub hires through Microsoft’s university recruitment pipeline and direct early-career postings.'
    },
    faqs: [
      {
        question: 'Is GitHub completely remote for early-career software engineers?',
        answer: 'Yes. GitHub has been remote-first since its founding in 2008. All early-career software developers can work 100% remotely from anywhere in the United States.'
      }
    ]
  },
  {
    slug: 'discord',
    name: 'Discord',
    category: 'Remote & Scale-Ups',
    tagline: 'Real-Time Voice, Video & Text Communication Infrastructure',
    officialCareersUrl: 'https://discord.com/careers',
    headquarters: 'San Francisco, California',
    usTechHubs: ['San Francisco, CA', 'Remote US Nationwide'],
    primaryRequisitions: [
      'Software Engineer - Early Career (New Grad)',
      'Backend Infrastructure Engineer (Junior)',
      'Web / Client Software Engineer (Junior)'
    ],
    searchKeywords: [
      'discord entry level software jobs',
      'discord new grad software engineer salary us',
      'discord early career remote software hiring'
    ],
    monthlySearchVolume: '6,200/mo',
    organicKD: '33 (Low-Moderate)',
    brandColor: '#5865f2',
    accentBg: '#eeeffd',
    salaryTier: {
      role: 'Software Engineer',
      level: 'L1 / Early Career',
      baseSalaryRange: '$135,000 – $155,000',
      medianBase: '$145,000',
      equityPerYear: '$40,000 – $55,000 (Equity options/RSUs)',
      signOnBonus: '$15,000 – $25,000',
      totalCompYear1: '$180,000 – $215,000',
      locationTiers: {
        tier1: '$190,000 – $215,000 (SF Bay Area, NYC, Seattle)',
        tier2: '$175,000 – $198,000 (Austin, Denver, Chicago)',
        tier3: '$165,000 – $185,000 (Remote US Nationwide)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: CodeSignal / Online Coding Assessment',
        duration: '70 Minutes',
        format: 'Proctored algorithmic challenge testing arrays, strings, and hash maps',
        focus: 'Implementation speed and Big-O runtime optimality.',
        keyTopics: ['Hash tables', 'Sliding window', 'Dynamic memory', 'Complexity analysis'],
        screeningTips: 'Focus on passing all hidden test cases and edge cases.'
      },
      {
        title: 'Stage 2: Live Pair Programming & System Interview (3 Rounds)',
        duration: '3 x 60 Minutes',
        format: 'Hands-on live coding with Discord engineers',
        focus: 'Building real-time features: message queuing, rate limiting, and state synchronization.',
        keyTopics: ['WebSockets & HTTP', 'Rate limiting algorithms (Token bucket)', 'Clean asynchronous code', 'Culture & passion'],
        screeningTips: 'Discord relies heavily on Python, Rust, and Elixir for concurrency. Show familiarity with async/await patterns.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Build Belonging, Be Kind & Focus on Community',
      description: 'Discord values engineers who care about online community spaces, empathy, and high performance.',
      sampleQuestions: [
        'Tell me about an online community you belong to and how software impacts their connection.',
        'Describe a time you refactored code to make it easier for teammates to understand.'
      ],
      prepAdvice: 'Demonstrate genuine enthusiasm for Discord’s product and community ecosystem.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a real-time chat bot or WebSocket service that handles multiple concurrent connections.',
        'Demonstrate understanding of token bucket or leaky bucket rate limiting.'
      ],
      screeningPitfalls: [
        'Ignoring concurrency and race conditions when multiple users send messages simultaneously.',
        'Not testing network disconnection recovery.'
      ],
      idealTimeline: 'Discord university applications open in September through November.'
    },
    faqs: [
      {
        question: 'Does Discord hire remote entry-level software developers in the US?',
        answer: 'Yes. Discord supports remote work across the United States for early-career and new grad software engineers.'
      }
    ]
  }
];
