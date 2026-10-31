import { CompanyHub } from '../companyHubTypes';

export const FAANG_HUBS: CompanyHub[] = [
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
  {
    slug: 'netflix',
    name: 'Netflix',
    category: 'FAANG & Big Tech',
    tagline: 'Global Streaming Architecture, Chaos Engineering & Content Platform Tech',
    officialCareersUrl: 'https://jobs.netflix.com/search?team=Core%20Engineering',
    headquarters: 'Los Gatos, California',
    usTechHubs: ['Los Gatos, CA', 'Los Angeles, CA', 'Remote US Nationwide'],
    primaryRequisitions: [
      'Software Engineer (New Grad / Early Career)',
      'Backend Distributed Systems Engineer (L3)',
      'Data Platform Engineer (Early Career)'
    ],
    searchKeywords: [
      'netflix entry level software engineer jobs',
      'netflix new grad software engineer salary us',
      'netflix culture memo early career interview'
    ],
    monthlySearchVolume: '7,400/mo',
    organicKD: '52 (Moderate-High)',
    brandColor: '#e50914',
    accentBg: '#fbe6e7',
    salaryTier: {
      role: 'Software Engineer',
      level: 'L3 / New Grad',
      baseSalaryRange: '$145,000 – $175,000',
      medianBase: '$158,000',
      equityPerYear: '$35,000 – $50,000 (Employee Stock Option Program)',
      signOnBonus: '$15,000 – $25,000',
      totalCompYear1: '$200,000 – $235,000',
      locationTiers: {
        tier1: '$210,000 – $235,000 (Los Gatos, Bay Area, LA)',
        tier2: '$190,000 – $215,000 (Seattle, Austin, NYC)',
        tier3: '$175,000 – $195,000 (Remote US Nationwide)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Technical Coding Screen (Karat / CoderPad)',
        duration: '60 Minutes',
        format: 'Algorithmic problem solving and system debugging screen',
        focus: 'Data structures, algorithm complexity, and writing clean maintainable code.',
        keyTopics: ['Hash maps', 'BFS/DFS tree traversals', 'String manipulation', 'Time complexity'],
        screeningTips: 'Netflix tests clean code and production instincts. Proactively write tests for your code.'
      },
      {
        title: 'Stage 2: Virtual Onsite Technical & Culture Loop (4 Rounds)',
        duration: '4 x 45 Minutes',
        format: '2 Coding rounds + 1 System architecture round + 1 Culture & Freedom & Responsibility round',
        focus: 'Evaluating distributed systems thinking, error handling, and intense alignment with the Netflix Culture Memo.',
        keyTopics: ['Microservices', 'Resilience & retries', 'Netflix Culture Memo', 'High performance candid feedback'],
        screeningTips: 'Read the Netflix Culture Memo thoroughly. They rigorously test whether you thrive in high-autonomy environments.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Freedom and Responsibility & The Dream Team',
      description: 'Netflix operates on high autonomy, extreme candor, contextual leadership, and exceptional performance.',
      sampleQuestions: [
        'Tell me about a time you made an autonomous engineering decision without asking permission.',
        'How do you give direct, critical feedback to someone more senior than you?'
      ],
      prepAdvice: 'Demonstrate self-motivation, high agency, and readiness to own mistakes candidly.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a microservice architecture with resilience patterns (circuit breakers, exponential backoff retries, Redis caching).',
        'Demonstrate understanding of distributed logging or telemetry.'
      ],
      screeningPitfalls: [
        'Assuming Netflix only hires senior engineers: Netflix now maintains dedicated early-career pipelines.',
        'Being passive: Netflix wants engineers who voice opinions and take calculated risks.'
      ],
      idealTimeline: 'Netflix early-career requisitions open in September through November.'
    },
    faqs: [
      {
        question: 'Does Netflix hire early-career software engineers with zero commercial experience?',
        answer: 'Yes. While historically Netflix only hired senior engineers, they introduced their "New Grad and Early Career Engineering Program" across distributed systems and data engineering.'
      }
    ]
  },
  {
    slug: 'tesla',
    name: 'Tesla',
    category: 'FAANG & Big Tech',
    tagline: 'Autopilot, Full Self-Driving (FSD), Megapack Energy & Robotics Software',
    officialCareersUrl: 'https://www.tesla.com/careers/search/?category=engineering-information-technology',
    headquarters: 'Austin, Texas',
    usTechHubs: ['Austin, TX', 'Palo Alto / Fremont, CA', 'Sparks, NV', 'Buffalo, NY', 'San Diego, CA'],
    primaryRequisitions: [
      'Software Engineer - Early Career / College Grad (P1)',
      'Vehicle Software Engineer (Embedded C++)',
      'Energy / Applications Software Engineer'
    ],
    searchKeywords: [
      'tesla entry level software developer hiring',
      'tesla p1 software engineer salary us',
      'tesla autopilot early career software interview'
    ],
    monthlySearchVolume: '8,900/mo',
    organicKD: '38 (Low-Moderate)',
    brandColor: '#e82127',
    accentBg: '#fde9e9',
    salaryTier: {
      role: 'Software Engineer',
      level: 'P1 (Entry Level)',
      baseSalaryRange: '$115,000 – $142,000',
      medianBase: '$128,000',
      equityPerYear: '$25,000 – $40,000 (Stock grants vesting annually)',
      signOnBonus: '$10,000 – $20,000',
      totalCompYear1: '$155,000 – $188,000',
      locationTiers: {
        tier1: '$165,000 – $195,000 (Palo Alto/Fremont, Bay Area)',
        tier2: '$150,000 – $180,000 (Austin, San Diego)',
        tier3: '$138,000 – $165,000 (Sparks, Buffalo, Remote US)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Technical Phone Screen / Pair Programming',
        duration: '60 Minutes',
        format: 'Live coding with a Tesla senior software engineer',
        focus: 'Data structures, algorithm complexity, and hands-on coding in C++, Python, or Go.',
        keyTopics: ['Array & string manipulation', 'Concurrency basics', 'Low-level bit manipulation', 'Clean syntax'],
        screeningTips: 'Tesla engineers value speed and direct problem solving. Do not over-abstract simple problems.'
      },
      {
        title: 'Stage 2: Full Virtual Onsite Loop (3–4 Rounds)',
        duration: '4 x 45 Minutes',
        format: '1-on-1 rounds covering algorithmic coding, systems design/debugging, and high-intensity problem solving',
        focus: 'Testing how you handle high-pressure deadlines, hardware constraints, and production issues.',
        keyTopics: ['Real-time OS concepts', 'Thread safety', 'State machines', 'Work ethic & mission urgency'],
        screeningTips: 'Demonstrate stamina, intense curiosity, and a first-principles approach to hardware-software constraints.'
      }
    ],
    behavioralValues: {
      frameworkName: 'First Principles, Intense Urgency & Extreme Ownership',
      description: 'Tesla operates at high intensity with minimal bureaucracy, rewarding engineers who solve hard problems fast.',
      sampleQuestions: [
        'Tell me about a time you solved an urgent technical roadblock under extreme time pressure.',
        'How do you approach breaking down a problem to its physical and mathematical first principles?'
      ],
      prepAdvice: 'Emphasize your willingness to dive into complex codebases and deliver without waiting for perfect guidance.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build an embedded systems, robotics simulation, or real-time telemetry project (C++, Python, ROS).',
        'Demonstrate understanding of state machines and concurrent threads.'
      ],
      screeningPitfalls: [
        'Expecting a slow, corporate pace: Tesla looks for high-intensity problem solvers.',
        'Not understanding basic hardware-software communication (CAN bus, sockets, serial).'
      ],
      idealTimeline: 'Tesla university recruiting runs rolling hiring with peak openings in September and January.'
    },
    faqs: [
      {
        question: 'What programming languages are most valued for entry-level Tesla software engineering?',
        answer: 'C++ is heavily prized for Autopilot, vehicle firmware, and robotics, while Python and Go are widely used for fleet analytics, energy software, and cloud infrastructure.'
      }
    ]
  },
  {
    slug: 'ibm',
    name: 'IBM',
    category: 'FAANG & Big Tech',
    tagline: 'Hybrid Cloud, Red Hat Enterprise Linux, Quantum Computing & Watson AI',
    officialCareersUrl: 'https://www.ibm.com/careers/search?q=entry%20level%20software',
    headquarters: 'Armonk, New York',
    usTechHubs: ['Austin, TX', 'San Jose, CA', 'Raleigh / Research Triangle, NC', 'Cambridge / Boston, MA', 'New York, NY'],
    primaryRequisitions: [
      'Entry-Level Software Developer (Band 6)',
      'Cloud Platform Software Engineer (Campus Graduate)',
      'Systems & Security Software Engineer (Junior)'
    ],
    searchKeywords: [
      'ibm entry level developer jobs US',
      'ibm band 6 software engineer salary us',
      'ibm early career technical interview process'
    ],
    monthlySearchVolume: '10,500/mo',
    organicKD: '37 (Low-Moderate)',
    brandColor: '#054ada',
    accentBg: '#e6edfb',
    salaryTier: {
      role: 'Software Developer',
      level: 'Band 6 (Entry Level)',
      baseSalaryRange: '$90,000 – $112,000',
      medianBase: '$102,000',
      equityPerYear: 'N/A (Employee Stock Purchase Plan + 401k match)',
      signOnBonus: '$5,000 – $12,000',
      totalCompYear1: '$100,000 – $125,000',
      locationTiers: {
        tier1: '$110,000 – $130,000 (Bay Area, NYC, Boston)',
        tier2: '$98,000 – $118,000 (Austin, Raleigh, Denver)',
        tier3: '$88,000 – $105,000 (Remote US / Other Metros)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: IBM Cognitive Ability Assessment (IPAT / HackerRank)',
        duration: '45 Minutes',
        format: 'Cognitive reasoning and foundational coding test',
        focus: 'Numerical patterns, logical deduction, and fundamental data structures.',
        keyTopics: ['Number series', 'Logical deduction', 'Basic algorithms (arrays/strings)'],
        screeningTips: 'IBM’s cognitive test is time-pressured. Move quickly through patterns and do not stall on a single puzzle.'
      },
      {
        title: 'Stage 2: Technical & Behavioral Panel Interview',
        duration: '60 Minutes',
        format: 'Video interview with IBM Senior Technical Staff Member (STSM)',
        focus: 'Review of projects, object-oriented concepts, cloud fundamentals, and team collaboration.',
        keyTopics: ['OOP principles', 'Git workflows', 'REST APIs & Linux fundamentals', 'Continuous learning'],
        screeningTips: 'Show enthusiasm for enterprise cloud, Linux (Red Hat ecosystem), or AI integration.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Dedication to Every Client’s Success, Innovation that Matters & Trust',
      description: 'IBM values long-term reliability, ethical engineering, and enterprise trust.',
      sampleQuestions: [
        'Tell me about a time you had to master a new programming tool or operating system independently.',
        'Describe how you approach testing and validating software before deployment.'
      ],
      prepAdvice: 'Emphasize reliability, documentation, and structured software development lifecycle (SDLC) hygiene.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a containerized application using Docker, Kubernetes, or Red Hat OpenShift.',
        'Demonstrate understanding of Linux command-line tools and shell scripting.'
      ],
      screeningPitfalls: [
        'Not knowing basic Linux commands (grep, awk, curl, systemctl).',
        'Focusing only on front-end styling without understanding backend services.'
      ],
      idealTimeline: 'IBM hires in seasonal waves with heavy campus intake in August–October and January–March.'
    },
    faqs: [
      {
        question: 'What is IBM Band 6?',
        answer: 'Band 6 is IBM’s entry-level professional engineering grade for recent university graduates and early-career software developers.'
      }
    ]
  }
];
