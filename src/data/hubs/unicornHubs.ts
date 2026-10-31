import { CompanyHub } from '../companyHubTypes';

export const UNICORN_HUBS: CompanyHub[] = [
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
  {
    slug: 'databricks',
    name: 'Databricks',
    category: 'Unicorns & FinTech',
    tagline: 'Lakehouse Platform, Apache Spark, Delta Lake & Generative AI Infrastructure',
    officialCareersUrl: 'https://www.databricks.com/company/careers/open-positions?department=Engineering',
    headquarters: 'San Francisco, California',
    usTechHubs: ['San Francisco, CA', 'Mountain View, CA', 'Seattle, WA', 'New York, NY', 'Remote US'],
    primaryRequisitions: [
      'Software Engineer, Early Career (L3)',
      'University Graduate Software Engineer',
      'Distributed Systems Engineer (Lakehouse Core)'
    ],
    searchKeywords: [
      'databricks entry level software roles',
      'databricks l3 software engineer salary us',
      'databricks early career coding interview'
    ],
    monthlySearchVolume: '5,800/mo',
    organicKD: '33 (Low-Moderate)',
    brandColor: '#ff3621',
    accentBg: '#ffebe9',
    salaryTier: {
      role: 'Software Engineer',
      level: 'L3 (Entry Level)',
      baseSalaryRange: '$145,000 – $170,000',
      medianBase: '$155,000',
      equityPerYear: '$50,000 – $70,000 (Pre-IPO / RSUs vesting quarterly)',
      signOnBonus: '$20,000 – $35,000',
      totalCompYear1: '$220,000 – $250,000',
      locationTiers: {
        tier1: '$225,000 – $250,000 (San Francisco, Bay Area, Seattle, NYC)',
        tier2: '$200,000 – $225,000 (Austin, Denver, Chicago)',
        tier3: '$185,000 – $210,000 (Remote US)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: CodeSignal General Coding Assessment (GCA)',
        duration: '70 Minutes',
        format: 'Automated 4-question proctored assessment',
        focus: 'Implementation speed, clean algorithm logic, and complex business rule simulation.',
        keyTopics: ['2D matrix manipulation', 'String parsing', 'Hash map lookups', 'Greedy logic'],
        screeningTips: 'Databricks typically requires an 830+ score on CodeSignal to advance to live interview rounds.'
      },
      {
        title: 'Stage 2: Technical Phone Screen / Pair Programming',
        duration: '60 Minutes',
        format: 'Video coding with Databricks systems SWE in CoderPad',
        focus: 'Concurrency, multi-threaded data structures, or custom memory buffers.',
        keyTopics: ['Multi-threading', 'Thread safety & mutexes', 'Hash tables / LRU caches', 'Memory efficiency'],
        screeningTips: 'Be ready to discuss distributed computing concepts: how data is partitioned across multiple worker nodes.'
      },
      {
        title: 'Stage 3: Full Virtual Onsite Loop (4 Rounds)',
        duration: '4 x 60 Minutes',
        format: '2 Systems/Data structure coding rounds + 1 System architecture round + 1 Culture round',
        focus: 'Deep algorithmic execution, distributed systems primitives, and code maintainability.',
        keyTopics: ['Tree & graph algorithms', 'Distributed cache design', 'Disk vs memory bottlenecks', 'Data engineering'],
        screeningTips: 'Explain how your code behaves under scale: what happens when data volume exceeds RAM capacity?'
      }
    ],
    behavioralValues: {
      frameworkName: 'Customer Obsession, Truth Seeking, Fire in the Belly & Team Spirit',
      description: 'Databricks values deep technical truth, engineering rigor, and intellectual honesty.',
      sampleQuestions: [
        'Tell me about a time you dug deep to find the root cause of a complex performance bottleneck.',
        'Describe how you approach evaluating trade-offs between two different database designs.'
      ],
      prepAdvice: 'Demonstrate first-principles thinking and passion for high-throughput distributed systems.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a mini-distributed key-value store or asynchronous job queue in Go, Rust, Java, or C++.',
        'Demonstrate understanding of consensus, write-ahead logging (WAL), or memory caching.'
      ],
      screeningPitfalls: [
        'Treating system design casually: even for early-career roles, Databricks checks distributed fundamentals.',
        'Failing to handle concurrency and race conditions.'
      ],
      idealTimeline: 'Databricks university applications open in August through October.'
    },
    faqs: [
      {
        question: 'Why does Databricks pay among the highest entry-level packages in tech?',
        answer: 'Databricks competes directly with Google, Meta, and OpenAI for elite systems engineering talent, offering high cash bases and substantial pre-IPO equity packages.'
      }
    ]
  },
  {
    slug: 'snowflake',
    name: 'Snowflake',
    category: 'Unicorns & FinTech',
    tagline: 'Data Cloud, Cloud Data Warehousing, Query Optimization & SQL Engines',
    officialCareersUrl: 'https://careers.snowflake.com/us/en/search-results?category=Engineering',
    headquarters: 'Bozeman, Montana / Silicon Valley Hub: San Mateo, CA',
    usTechHubs: ['San Mateo, CA', 'Bozeman, MT', 'Bellevue / Seattle, WA', 'Austin, TX', 'Remote US'],
    primaryRequisitions: [
      'Software Engineer I (New College Graduate)',
      'Database Engine Developer (Early Career)',
      'Cloud Platform Engineer (Junior)'
    ],
    searchKeywords: [
      'snowflake entry level software engineer',
      'snowflake new grad software engineer salary',
      'snowflake database engineering interview'
    ],
    monthlySearchVolume: '4,600/mo',
    organicKD: '30 (Low-Moderate)',
    brandColor: '#29b5e8',
    accentBg: '#e9f7fd',
    salaryTier: {
      role: 'Software Engineer I',
      level: 'IC1 (Entry Level)',
      baseSalaryRange: '$140,000 – $165,000',
      medianBase: '$150,000',
      equityPerYear: '$45,000 – $60,000 (RSUs vesting quarterly over 4 years)',
      signOnBonus: '$15,000 – $25,000',
      totalCompYear1: '$205,000 – $235,000',
      locationTiers: {
        tier1: '$210,000 – $235,000 (San Mateo, Seattle)',
        tier2: '$190,000 – $215,000 (Bozeman, Austin, Denver)',
        tier3: '$175,000 – $198,000 (Remote US)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: HackerRank Online Technical Assessment',
        duration: '75 Minutes',
        format: '3 Coding questions testing data structures, algorithms, and SQL logic',
        focus: 'String parsing, interval overlapping, and optimal array processing.',
        keyTopics: ['Hash tables', 'Sorting & custom comparators', 'Binary search', 'Time complexity'],
        screeningTips: 'Write clean, modular code with comments explaining edge cases.'
      },
      {
        title: 'Stage 2: Technical Phone Screen / Pair Programming',
        duration: '60 Minutes',
        format: 'Live video coding with a Snowflake database engineer in CoderPad',
        focus: 'Data structures, algorithmic trade-offs, and custom file/buffer simulation.',
        keyTopics: ['Trees & heaps', 'LRU cache implementation', 'File chunking / streaming'],
        screeningTips: 'Snowflake’s engine is written in C++ and Java. Show familiarity with memory allocation and I/O efficiency.'
      },
      {
        title: 'Stage 3: Full Virtual Onsite Loop (4 Rounds)',
        duration: '4 x 45 Minutes',
        format: 'Coding rounds + Practical systems architecture for juniors + Culture interview',
        focus: 'Writing bulletproof code, handling concurrent threads, and explaining database design.',
        keyTopics: ['B-trees & LSM trees', 'Multi-threading', 'Query parsing basics', 'Core values'],
        screeningTips: 'Demonstrate curiosity about query execution plans, columnar storage, and database indexing.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Put Customers First, Integrity Always, Get It Done & Own It',
      description: 'Snowflake prizes high ownership, directness, and relentless execution.',
      sampleQuestions: [
        'Tell me about an instance where you pushed through a stubborn software bug.',
        'How do you handle disagreement with an interviewer when discussing an algorithmic approach?'
      ],
      prepAdvice: 'Demonstrate humble listening, receptive collaboration, and passion for cloud data technology.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a toy relational database engine (parser, B-tree index, in-memory table) in C++, Java, or Go.',
        'Demonstrate understanding of columnar storage vs row-oriented storage.'
      ],
      screeningPitfalls: [
        'Not knowing how a database index (B-tree) works conceptually.',
        'Writing messy code without clear variable names.'
      ],
      idealTimeline: 'Snowflake university applications open in August through November.'
    },
    faqs: [
      {
        question: 'Does Snowflake hire entry-level engineers into its Bozeman, Montana headquarters?',
        answer: 'Yes. Snowflake maintains active early-career hiring in Bozeman, MT, San Mateo, CA, Bellevue, WA, and select remote positions.'
      }
    ]
  },
  {
    slug: 'coinbase',
    name: 'Coinbase',
    category: 'Unicorns & FinTech',
    tagline: 'Cryptocurrency Exchange, Web3 Wallets, Financial Ledger Infrastructure & Blockchain Tech',
    officialCareersUrl: 'https://www.coinbase.com/careers/positions?department=Engineering',
    headquarters: 'Remote-First (No physical HQ since 2020)',
    usTechHubs: ['100% Remote US Nationwide'],
    primaryRequisitions: [
      'Software Engineer I (IC3 / New Grad)',
      'Backend Engineer, Financial Ledger (Junior)',
      'Security & Protocol Software Engineer'
    ],
    searchKeywords: [
      'coinbase entry level software jobs',
      'coinbase ic3 software engineer salary us',
      'coinbase remote software engineering interview'
    ],
    monthlySearchVolume: '5,100/mo',
    organicKD: '34 (Low-Moderate)',
    brandColor: '#0052ff',
    accentBg: '#e6eeff',
    salaryTier: {
      role: 'Software Engineer I',
      level: 'IC3 (Entry Level)',
      baseSalaryRange: '$135,000 – $155,000',
      medianBase: '$144,000',
      equityPerYear: '$35,000 – $50,000 (RSUs vesting quarterly over 4 years)',
      signOnBonus: '$10,000 – $20,000',
      totalCompYear1: '$185,000 – $210,000',
      locationTiers: {
        tier1: '$195,000 – $215,000 (Bay Area, Seattle, NYC)',
        tier2: '$180,000 – $200,000 (Austin, Denver, Chicago)',
        tier3: '$170,000 – $190,000 (100% Remote US Nationwide)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: CodeSignal General Coding Assessment (GCA)',
        duration: '70 Minutes',
        format: 'Proctored 4-question algorithmic test',
        focus: 'Implementation speed, array transformations, and edge case coverage.',
        keyTopics: ['Hash maps', 'String formatting', '2D grid traversal', 'Time complexity'],
        screeningTips: 'Target an 800+ certified score to ensure fast-track recruiter review.'
      },
      {
        title: 'Stage 2: Live Technical Pair Programming (CoderPad)',
        duration: '60 Minutes',
        format: 'Hands-on live coding with a Coinbase backend engineer in Go, Python, or Ruby',
        focus: 'Designing and implementing a ledger transaction tracker or cryptocurrency order book simulator.',
        keyTopics: ['Double-entry bookkeeping concepts', 'Idempotency & transaction state', 'REST endpoints', 'Unit testing'],
        screeningTips: 'Financial engineering requires extreme care with monetary amounts. Always use integers (cents/satoshis) rather than floating point numbers.'
      },
      {
        title: 'Stage 3: Virtual Onsite Technical Loop (3 Rounds)',
        duration: '3 x 60 Minutes',
        format: '1 Architecture/ledger round + 1 Algorithmic round + 1 Culture & mission alignment round',
        focus: 'System reliability, defense-in-depth security, and crypto mission passion.',
        keyTopics: ['Ledger consistency', 'Rate limiting', 'Coinbase Cultural Principles', 'Autonomous remote execution'],
        screeningTips: 'Demonstrate respect for cryptographic security, error recovery, and financial accuracy.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Clear Communication, High Agency, Customer Focus, Continuous Learning',
      description: 'Coinbase is an intensely mission-focused company that prioritizes economic freedom, crypto utility, and high agency.',
      sampleQuestions: [
        'Tell me about an instance where you worked autonomously without waiting for instructions.',
        'Why are you excited about open financial protocols and cryptocurrency infrastructure?'
      ],
      prepAdvice: 'Show high agency, familiarity with crypto concepts (wallets, transactions, consensus), and written clarity.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a ledger service that processes simulated deposits, withdrawals, and transfers with atomic ACID transactions.',
        'Demonstrate zero floating-point arithmetic (use integer cents/big integers).'
      ],
      screeningPitfalls: [
        'Using floats for financial calculations: instant knockout in FinTech interviews.',
        'Failing to handle duplicate transactions (missing idempotency).'
      ],
      idealTimeline: 'Coinbase hires early-career engineers through seasonal university recruiting cohorts.'
    },
    faqs: [
      {
        question: 'Is Coinbase 100% remote for entry-level software developers?',
        answer: 'Yes. Coinbase is completely remote-first with no designated headquarters. Engineers can work from anywhere in the United States.'
      }
    ]
  },
  {
    slug: 'block',
    name: 'Block (Square)',
    category: 'Unicorns & FinTech',
    tagline: 'Square POS, Cash App, Spiral & Decentralized Financial Technology',
    officialCareersUrl: 'https://careers.block.xyz/us/en/search-results?team=Engineering',
    headquarters: 'Remote-First / US Hubs: San Francisco, CA & New York, NY',
    usTechHubs: ['100% Remote US Nationwide', 'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Atlanta, GA'],
    primaryRequisitions: [
      'Software Engineer I (L4 / Early Career)',
      'Cash App Software Engineer (Junior)',
      'Square Merchant Platform Developer'
    ],
    searchKeywords: [
      'block square entry level developer jobs',
      'block l4 software engineer salary us',
      'cash app junior software engineering interview'
    ],
    monthlySearchVolume: '3,800/mo',
    organicKD: '28 (Low)',
    brandColor: '#000000',
    accentBg: '#f2f2f2',
    salaryTier: {
      role: 'Software Engineer I',
      level: 'L4 (Entry Level)',
      baseSalaryRange: '$130,000 – $150,000',
      medianBase: '$140,000',
      equityPerYear: '$35,000 – $48,000 (RSUs vesting quarterly over 4 years)',
      signOnBonus: '$10,000 – $20,000',
      totalCompYear1: '$180,000 – $205,000',
      locationTiers: {
        tier1: '$190,000 – $208,000 (Bay Area, NYC, Seattle)',
        tier2: '$175,000 – $192,000 (Austin, Atlanta, Denver)',
        tier3: '$165,000 – $180,000 (100% Remote US Nationwide)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Pair Programming Technical Screen',
        duration: '60 Minutes',
        format: 'Live pair programming with a Block engineer in your own local IDE or CoderPad',
        focus: 'Collaborative problem solving: building a feature or refactoring code in Java, Kotlin, Go, or TypeScript.',
        keyTopics: ['Clean code principles', 'Object-oriented modeling', 'Unit test writing', 'Refactoring'],
        screeningTips: 'Block pairs on real problems. Treat the interviewer like a colleague; discuss trade-offs openly.'
      },
      {
        title: 'Stage 2: Full Virtual Onsite Loop (4 Rounds)',
        duration: '4 x 60 Minutes',
        format: '3 Hands-on pair programming sessions + 1 Values & culture round',
        focus: 'Live bug fixing, designing API contracts, and writing robust unit tests.',
        keyTopics: ['Test-driven development (TDD)', 'API design', 'Financial edge cases', 'Collaborative empathy'],
        screeningTips: 'Block places heavy value on Test-Driven Development (TDD). Write unit tests first or alongside your code.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Economic Empowerment, Thoughtful Execution & Empathy',
      description: 'Block builds tools that expand economic access for independent businesses and underserved individuals.',
      sampleQuestions: [
        'Tell me about an instance where you received difficult feedback on your code and how you incorporated it.',
        'How do you approach writing software that people with low technical literacy can use effortlessly?'
      ],
      prepAdvice: 'Demonstrate deep empathy for end users, collaborative humility, and care for clean code craft.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a payment or merchant ledger tool with automated integration tests (JUnit, PyTest, or Jest).',
        'Demonstrate understanding of REST/GraphQL APIs and asynchronous job workers.'
      ],
      screeningPitfalls: [
        'Writing code without unit tests: Block engineers are strict test-first advocates.',
        'Dominating the pair programming session without listening to interviewer hints.'
      ],
      idealTimeline: 'Block university applications open in August through October.'
    },
    faqs: [
      {
        question: 'What is the interview style at Block (Square / Cash App)?',
        answer: 'Block is famous for using 100% collaborative pair programming instead of traditional algorithmic puzzle interviews. You work side-by-side with engineers on realistic problems.'
      }
    ]
  },
  {
    slug: 'servicenow',
    name: 'ServiceNow',
    category: 'Unicorns & FinTech',
    tagline: 'Enterprise Digital Workflow Platform, IT Service Management & Cloud Automation',
    officialCareersUrl: 'https://careers.servicenow.com/careers/jobs?team=Engineering',
    headquarters: 'Santa Clara, California',
    usTechHubs: ['Santa Clara, CA', 'San Diego, CA', 'Kirkland / Seattle, WA', 'Chicago, IL', 'Remote US'],
    primaryRequisitions: [
      'Associate Software Engineer (Early Career)',
      'Platform Software Developer I',
      'Cloud Infrastructure Engineer (Campus)'
    ],
    searchKeywords: [
      'servicenow entry level developer careers',
      'servicenow ic1 software engineer salary us',
      'servicenow early career campus interview'
    ],
    monthlySearchVolume: '6,400/mo',
    organicKD: '35 (Low-Moderate)',
    brandColor: '#032d42',
    accentBg: '#e6ebef',
    salaryTier: {
      role: 'Associate Software Engineer',
      level: 'IC1 (Associate)',
      baseSalaryRange: '$118,000 – $138,000',
      medianBase: '$126,000',
      equityPerYear: '$25,000 – $38,000 (RSUs vesting quarterly over 4 years)',
      signOnBonus: '$10,000 – $18,000',
      totalCompYear1: '$158,000 – $185,000',
      locationTiers: {
        tier1: '$170,000 – $190,000 (Santa Clara, Seattle)',
        tier2: '$155,000 – $172,000 (San Diego, Chicago)',
        tier3: '$142,000 – $160,000 (Remote US)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: HackerRank Technical Assessment',
        duration: '60 Minutes',
        format: '2 Algorithmic coding problems assessing data structures and complexity',
        focus: 'Hash tables, arrays, and string operations.',
        keyTopics: ['Hash maps', 'Two pointers', 'Binary search', 'Time/space complexity'],
        screeningTips: 'Write clean, readable code and verify boundary edge cases.'
      },
      {
        title: 'Stage 2: Virtual Onsite Technical Loop (3 Rounds)',
        duration: '3 x 45 Minutes',
        format: '2 Coding rounds + 1 System/Object-oriented design round',
        focus: 'Java/JavaScript fundamentals, relational database models, and workflow automation.',
        keyTopics: ['OOP class hierarchy', 'Database schema modeling', 'REST endpoints', 'Culture fit'],
        screeningTips: 'ServiceNow’s platform is built on enterprise Java and JavaScript. Show strong OOP and database modeling.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Wow Our Customers, Win as a Team, Create Belonging',
      description: 'ServiceNow values collaborative empathy, customer success, and steady execution.',
      sampleQuestions: [
        'Tell me about a time you worked on a team project with conflicting opinions.',
        'Describe how you prioritize code maintainability when deadlines are tight.'
      ],
      prepAdvice: 'Demonstrate humility, team-first attitude, and customer empathy.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a ticketing or workflow automation app with status transitions and role-based access.',
        'Demonstrate clean relational database schemas (foreign keys, join tables).'
      ],
      screeningPitfalls: [
        'Superficial knowledge of database relationships (one-to-many, many-to-many).',
        'Ignoring clean code structure and comments.'
      ],
      idealTimeline: 'ServiceNow early-career hiring opens in August–October for summer starts.'
    },
    faqs: [
      {
        question: 'Does ServiceNow hire early-career software developers in San Diego?',
        answer: 'Yes. ServiceNow’s San Diego engineering campus is one of their largest development hubs, with extensive hiring for early-career developers.'
      }
    ]
  },
  {
    slug: 'lyft',
    name: 'Lyft',
    category: 'Unicorns & FinTech',
    tagline: 'Ride-Hailing, Micro-Mobility, Transit Infrastructure & Real-Time Logistics',
    officialCareersUrl: 'https://www.lyft.com/careers?team=Engineering',
    headquarters: 'San Francisco, California',
    usTechHubs: ['San Francisco, CA', 'Seattle, WA', 'New York, NY', 'Remote US Nationwide'],
    primaryRequisitions: [
      'Software Engineer I (T3 / New Grad)',
      'Backend Engineer, Dispatch & Pricing',
      'Mobile / Web Software Engineer (Junior)'
    ],
    searchKeywords: [
      'lyft entry level software developer jobs',
      'lyft t3 software engineer salary us',
      'lyft new grad software engineering interview'
    ],
    monthlySearchVolume: '4,200/mo',
    organicKD: '31 (Low-Moderate)',
    brandColor: '#ff00bf',
    accentBg: '#ffe6f8',
    salaryTier: {
      role: 'Software Engineer I',
      level: 'T3 (Entry Level)',
      baseSalaryRange: '$130,000 – $150,000',
      medianBase: '$138,000',
      equityPerYear: '$35,000 – $48,000 (RSUs vesting quarterly over 4 years)',
      signOnBonus: '$15,000 – $25,000',
      totalCompYear1: '$180,000 – $205,000',
      locationTiers: {
        tier1: '$185,000 – $208,000 (Bay Area, Seattle, NYC)',
        tier2: '$170,000 – $188,000 (Austin, Denver, Chicago)',
        tier3: '$160,000 – $175,000 (Remote US Nationwide)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Technical Coding Screen (CoderPad)',
        duration: '60 Minutes',
        format: 'Live pair programming with a Lyft software engineer',
        focus: 'Practical coding modeling real-time ride dispatch, pricing, or map coordinate matching.',
        keyTopics: ['Hash tables', 'Geospatial distance logic', 'Sliding window', 'Clean OOP'],
        screeningTips: 'Lyft values practical engineering. Verbalize your solution and write unit tests.'
      },
      {
        title: 'Stage 2: Full Virtual Onsite Loop (3 Rounds)',
        duration: '3 x 60 Minutes',
        format: '2 Coding rounds + 1 System architecture/debugging round',
        focus: 'Solving concurrent state problems, error recovery, and team collaboration.',
        keyTopics: ['Concurrency & locking', 'Data structures', 'REST APIs', 'Culture fit'],
        screeningTips: 'Show that you understand trade-offs between latency and consistency in real-time dispatch systems.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Make It Happen, Uplift Others, Be Yourself',
      description: 'Lyft values authenticity, empathy for riders and drivers, and collaborative spirit.',
      sampleQuestions: [
        'Tell me about an instance where you went above and beyond to support a struggling teammate.',
        'Describe a time you owned a mistake and how you rectified it.'
      ],
      prepAdvice: 'Demonstrate warmth, authenticity, and clear communication.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a real-time tracking service using WebSockets, Redis, and location coordinates.',
        'Demonstrate clean unit tests and clear API documentation.'
      ],
      screeningPitfalls: [
        'Writing monolithic code without modular helper functions.',
        'Failing to handle boundary conditions (zero drivers available, location out of range).'
      ],
      idealTimeline: 'Lyft early-career hiring opens in August–October for next summer cohorts.'
    },
    faqs: [
      {
        question: 'Does Lyft allow software engineers to work remotely in the US?',
        answer: 'Yes. Lyft operates a flexible workplace model where engineers can work remotely from anywhere in the continental United States.'
      }
    ]
  }
];
