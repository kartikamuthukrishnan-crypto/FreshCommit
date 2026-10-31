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

export interface CompanyHub {
  slug: 'google' | 'amazon' | 'microsoft' | 'stripe';
  name: string;
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
  {
    slug: 'google',
    name: 'Google',
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
        screeningTips: 'Interviewers often adjust requirements midway (e.g. "What if the input does not fit into memory?"). They evaluate how calmly and methodically you adapt.'
      },
      {
        title: 'Stage 4: Googleyness & Leadership Round',
        duration: '45 Minutes',
        format: 'Behavioral & situational interview with Engineering Manager',
        focus: 'Navigating ambiguity, constructive collaboration, team communication, and ethical engineering judgment.',
        keyTopics: ['Constructive conflict resolution', 'Prioritizing team goals over ego', 'Admitting mistakes and post-mortems', 'Intellectual humility'],
        screeningTips: 'Provide structured STAR examples. Never blame teammates or managers for past project challenges; emphasize what you learned and implemented next.'
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
        'Build at least one distributed or concurrent service (e.g. asynchronous message queue, LRU cache) with automated test suites.',
        'Demonstrate active open-source contributions or bug fixes in public repositories.',
        'Deploy projects to live cloud endpoints with continuous integration (GitHub Actions).'
      ],
      screeningPitfalls: [
        'Submitting generic tutorial apps (e.g. basic Todo app, generic weather widget) with zero tests.',
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
      },
      {
        question: 'What programming languages can I use in Google interviews?',
        answer: 'Google allows candidates to interview in Python, Java, C++, Go, or JavaScript/TypeScript. We recommend choosing whichever language you can write idiomatic, bug-free code in most quickly.'
      }
    ]
  },
  {
    slug: 'amazon',
    name: 'Amazon',
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
      'amazon sde 1 online assessment prep 2026',
      'amazon leadership principles entry level interview'
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
        keyTopics: ['Hash maps', 'Two sum variations', 'Substrings & sliding windows', 'BFS on 2D grids (islands/matrices)'],
        screeningTips: 'Automated test suites include hidden performance tests. Aim for O(n) or O(n log n) solutions rather than O(n^2) nested loops.'
      },
      {
        title: 'Stage 2: Amazon Online Assessment Part 2 (Work Simulation & Leadership)',
        duration: '90 Minutes',
        format: 'Interactive corporate scenario simulation',
        focus: 'Simulated workplace email/Slack threads making architectural and prioritization trade-offs.',
        keyTopics: ['Customer Obsession', 'Ownership vs expedience', 'Bias for Action vs Frugality', 'Earn Trust with peers'],
        screeningTips: 'Choose answers that put the customer first, take responsibility for bugs rather than blaming external teams, and deliver working solutions incrementally.'
      },
      {
        title: 'Stage 3: Virtual Final Onsite Loop (3–4 Rounds)',
        duration: '4 x 45–60 Minutes',
        format: '1-on-1 interviews combining 20 min Leadership Principles + 30 min Coding',
        focus: 'Data structure mastery, object-oriented design, and deep verification of behavioral STAR stories.',
        keyTopics: ['Class modeling & encapsulation', 'Trees & binary search trees', 'Priority queues & Dijkstra', 'System reliability fundamentals'],
        screeningTips: 'Every single Amazon interviewer evaluates at least two Leadership Principles. Prepare 6 distinct stories so you never repeat the same example across rounds.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Amazon 14 Leadership Principles',
      description: 'Amazon treats Leadership Principles as an absolute hiring bar. Technical excellence cannot compensate for failing the behavioral LP evaluation.',
      sampleQuestions: [
        'Tell me about a time you had a tough deadline and had to cut corners. What was the trade-off? (Bias for Action & Insist on the Highest Standards)',
        'Describe a time when you saw an issue that was outside your direct responsibility and stepped in to fix it. (Ownership)',
        'Tell me about a time you used data to persuade a skeptic. (Dive Deep)'
      ],
      prepAdvice: 'Frame all behavioral answers in the STAR format (Situation, Task, Action, Result). State specific metrics: "reduced latency by 35%", "eliminated 12 weekly manual steps".'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Show an understanding of cloud services (e.g. AWS Lambda, S3, DynamoDB, or Docker containers).',
        'Demonstrate modular Object-Oriented Design (clean classes, separation of concerns, unit test mock interfaces).'
      ],
      screeningPitfalls: [
        'Giving generic team answers using "we" instead of clarifying your specific individual contribution ("I designed...", "I wrote...").',
        'Failing to handle null pointer exceptions, empty strings, and negative numbers in live coding.'
      ],
      idealTimeline: 'Amazon University Recruiting runs rolling hiring year-round, with peak requisition openings in August and January.'
    },
    faqs: [
      {
        question: 'What is the difference between Amazon SDE 1 and SDE 2?',
        answer: 'SDE 1 (L4) is the entry-level tier for engineers with 0 to 2 years of experience. SDE 1s are expected to deliver defined tasks with guidance and code review, whereas SDE 2s (L5) design and own multi-component architectures independently.'
      },
      {
        question: 'Why does Amazon offer a large Year 1 and Year 2 sign-on bonus for SDE 1?',
        answer: 'Amazon’s RSU equity vesting schedule is back-loaded (5% Year 1, 15% Year 2, 40% Year 3, 40% Year 4). To compensate for lower equity in the first two years, Amazon provides cash sign-on bonuses paid monthly across Years 1 and 2.'
      }
    ]
  },
  {
    slug: 'microsoft',
    name: 'Microsoft',
    tagline: 'Azure Cloud, GitHub, Windows, Office 365 & Developer Tooling',
    officialCareersUrl: 'https://careers.microsoft.com/v2/global/en/home.html',
    headquarters: 'Redmond, Washington',
    usTechHubs: ['Redmond / Seattle, WA', 'Sunnyvale / Silicon Valley, CA', 'Atlanta, GA', 'Reston, VA', 'Austin, TX', 'Cambridge, MA'],
    primaryRequisitions: [
      'Software Engineer (Level 59/60)',
      'Microsoft Aspire Experience (Early Career SWE)',
      'Azure Cloud Solutions Software Engineer (New Grad)'
    ],
    searchKeywords: [
      'microsoft entry level software developer jobs',
      'microsoft career portal entry level developer',
      'microsoft level 59 software engineer salary',
      'microsoft university recruiting early career tech',
      'microsoft new grad software engineering interview process'
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
        keyTopics: ['Array manipulation', 'String reversal & tokenization', 'Linked lists', 'Basic recursion'],
        screeningTips: 'Focus on writing readable code with descriptive variable names. Microsoft values maintainability over hyper-compressed one-liners.'
      },
      {
        title: 'Stage 2: Virtual Final Round Loop (4 Interviews)',
        duration: '4 x 45 Minutes',
        format: 'Pair programming & architectural discussions with Microsoft engineers and Principal SWE/Partner',
        focus: 'Collaborative coding, data structure trade-offs, testing mindset, and Growth Mindset evaluation.',
        keyTopics: ['Trees, BFS/DFS traversals', 'Dynamic programming basics', 'API contracts and data encapsulation', 'Handling edge cases'],
        screeningTips: 'Microsoft interviewers often test how receptive you are to guidance. If an interviewer says "What happens if this loop terminates early?", pause and trace the logic rather than defending your initial code.'
      },
      {
        title: 'Stage 3: As-Appropriate ("AA") Partner Round',
        duration: '45 Minutes',
        format: 'Interview with a Partner Software Engineer or Director',
        focus: 'Culture fit, career aspirations, technical curiosity, and long-term potential at Microsoft.',
        keyTopics: ['Growth mindset in software engineering', 'Empathy for end users and accessibility', 'Continuous learning habits'],
        screeningTips: 'Show genuine passion for developer tools or cloud platforms. Ask intelligent questions about team roadmaps, open-source adoption, and telemetry practices.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Growth Mindset & Customer Empathy',
      description: 'Under Satya Nadella, Microsoft transitioned from a "know-it-all" to a "learn-it-all" culture. Humility, curiosity, and learning from failure are core tenets.',
      sampleQuestions: [
        'Tell me about a technical concept you struggled to grasp initially and how you mastered it.',
        'Describe a time you failed to deliver on time or introduced a software bug. What did you change afterward?',
        'How do you handle disagreement with a senior engineer when you believe your approach is better?'
      ],
      prepAdvice: 'Emphasize curiosity. Share examples of reading documentation, experimenting with proofs-of-concept, and incorporating peer suggestions.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build applications using modern web stacks (TypeScript, React, C#/.NET, Python, or Azure services).',
        'Highlight projects with real users, clean CI/CD pipelines, or accessibility (WCAG) compliance.'
      ],
      screeningPitfalls: [
        'Ignoring test writing: Microsoft engineers place tremendous value on automated unit tests.',
        'Being defensive when given hints during live technical rounds.'
      ],
      idealTimeline: 'Microsoft University Recruiting opens heavily in August through October for graduating seniors and recent grads.'
    },
    faqs: [
      {
        question: 'What is the Microsoft Aspire Experience?',
        answer: 'The Microsoft Aspire Experience is an onboarding and career development program for university graduates and early-career hires joining Microsoft full-time, offering executive mentorship, specialized learning tracks, and peer networking.'
      },
      {
        question: 'Does Microsoft offer remote entry-level software positions in the US?',
        answer: 'Yes, Microsoft maintains a flexible workplace policy where certain entry-level roles can be performed 100% remotely or hybrid from anywhere in the continental United States, subject to manager approval.'
      }
    ]
  },
  {
    slug: 'stripe',
    name: 'Stripe',
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
      'stripe practical coding interview prep 2026',
      'stripe early career remote software jobs us',
      'how to pass stripe junior engineer interview'
    ],
    monthlySearchVolume: '13,500/mo',
    organicKD: '38 (Low-Moderate)',
    brandColor: '#635bff',
    accentBg: '#f0f3ff',
    salaryTier: {
      role: 'Software Engineer (Early Career / New Grad)',
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
        keyTopics: ['Past projects & architecture', 'Preferred languages (Ruby, Java, Go, TypeScript)', 'Work authorization'],
        screeningTips: 'Be prepared to explain why you want to work at Stripe specifically: emphasize their documentation quality, API developer experience, and mission to increase GDP of the internet.'
      },
      {
        title: 'Stage 2: Practical Coding Screen (Live IDE Pair Programming)',
        duration: '60 Minutes',
        format: 'Pair programming in your own preferred local IDE or CoderPad',
        focus: 'Solving a practical software problem: parsing structured data, designing classes, handling network failure.',
        keyTopics: ['HTTP API requests', 'JSON serialization & validation', 'State tracking & idempotency', 'Writing unit tests in real-time'],
        screeningTips: 'Stripe does not test abstract algorithmic puzzles like binary tree inversions. They test real developer workflows. You can Google syntax and documentation during the interview.'
      },
      {
        title: 'Stage 3: Full Virtual Onsite Loop (4 Practical Rounds)',
        duration: '4 x 60 Minutes',
        format: 'Hands-on practical rounds with Stripe Engineers',
        focus: '1 Bug squash / code reading round, 1 API design & integration round, 1 system design / architecture round, 1 culture round.',
        keyTopics: ['Debugging open-source test suites', 'REST API design (status codes, idempotency)', 'Relational database schema modeling', 'Macro & micro engineering rigor'],
        screeningTips: 'In the bug squash round, you are given an existing codebase with failing tests. Do not immediately rewrite the code; read the test output, identify root causes, and fix the minimal lines necessary.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Stripe Operating Principles',
      description: 'Stripe values "Users First", "Move with Urgency and Focus", "Think Rigorously", and "Global Optimization".',
      sampleQuestions: [
        'Tell me about a time you had to make an engineering decision with incomplete data. How did you balance rigor with speed?',
        'Describe a situation where you had to debug an issue that impacted a real end user. What did you prioritize?',
        'How do you ensure documentation and API contracts remain clear and maintainable for external developers?'
      ],
      prepAdvice: 'Demonstrate intense care for developer experience and user impact. Point to how you document endpoints and handle edge-case error messages cleanly.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build an API-driven project with complete documentation, idempotency headers, webhook processing, and rate limiting.',
        'Use TypeScript, Go, Python, or Java with real database integration (PostgreSQL) and automated Docker setups.'
      ],
      screeningPitfalls: [
        'Relying purely on LeetCode memorization without knowing how to write unit tests or debug real code in an IDE.',
        'Neglecting edge cases: what happens when an external payment API times out or returns a 500 error?'
      ],
      idealTimeline: 'Stripe opens its New Grad and Early Career applications in late August through October. Roles are highly competitive and fill rapidly.'
    },
    faqs: [
      {
        question: 'Does Stripe hire remote entry-level software engineers in the United States?',
        answer: 'Yes. Stripe is one of the premier remote-friendly technology employers in the US. Early-career software engineers can work remotely from anywhere in the United States, receiving competitive compensation benchmarked to regional tiers.'
      },
      {
        question: 'Why are Stripe technical interviews considered different from standard FAANG interviews?',
        answer: 'Instead of abstract puzzle questions, Stripe uses practical engineering evaluations: you code in your own local IDE, you can look up documentation online, and you work on real tasks like fixing failing test suites, designing APIs, and handling webhook events.'
      }
    ]
  }
];
