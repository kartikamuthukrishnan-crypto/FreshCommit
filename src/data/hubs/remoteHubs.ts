import { CompanyHub } from '../companyHubTypes';

export const REMOTE_HUBS: CompanyHub[] = [
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
      prepAdvice: 'Demonstrate vulnerability and transparency. Atlassian respects engineers who openly discuss what went wrong.'
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
  },
  {
    slug: 'gitlab',
    name: 'GitLab',
    category: 'Remote & Scale-Ups',
    tagline: 'The One DevOps Platform, Public Handbook & 100% All-Remote Pioneer',
    officialCareersUrl: 'https://about.gitlab.com/jobs/all-jobs/',
    headquarters: '100% All-Remote (Pioneer of Remote Work)',
    usTechHubs: ['100% Remote US Nationwide & Worldwide'],
    primaryRequisitions: [
      'Junior Fullstack Engineer (All-Remote)',
      'Backend Engineer, Package & Container Registry',
      'Frontend Engineer, Manage & Analytics'
    ],
    searchKeywords: [
      'gitlab junior software developer roles',
      'gitlab all remote software engineer salary us',
      'gitlab early career public handbook interview'
    ],
    monthlySearchVolume: '4,100/mo',
    organicKD: '29 (Low)',
    brandColor: '#fc6d26',
    accentBg: '#fff0e8',
    salaryTier: {
      role: 'Junior Fullstack Engineer',
      level: 'Intermediate Trainee / Junior',
      baseSalaryRange: '$110,000 – $130,000',
      medianBase: '$120,000',
      equityPerYear: '$20,000 – $32,000 (Options / RSUs)',
      signOnBonus: '$5,000 – $10,000',
      totalCompYear1: '$135,000 – $155,000',
      locationTiers: {
        tier1: '$145,000 – $165,000 (SF Bay Area, NYC)',
        tier2: '$130,000 – $148,000 (Austin, Denver, Chicago)',
        tier3: '$120,000 – $138,000 (100% Remote US Nationwide)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Async Application & Open Source Contribution Review',
        duration: '1–2 Weeks',
        format: 'Review of candidate MRs, GitLab handbook comprehension, and written screening',
        focus: 'Written communication clarity and public git history.',
        keyTopics: ['GitLab public handbook', 'Merge request etiquette', 'Ruby on Rails / Vue.js'],
        screeningTips: 'Submitting a small documentation or bug fix merge request to GitLab’s public repo prior to applying fast-tracks your application.'
      },
      {
        title: 'Stage 2: Technical Pair Programming & Code Review (2 Rounds)',
        duration: '2 x 60 Minutes',
        format: 'Live video pairing on GitLab’s actual open-source codebase',
        focus: 'Navigating unfamiliar code, reading test specs, and implementing clean solutions.',
        keyTopics: ['Reading RSpec / Jest tests', 'Git branching & rebasing', 'API endpoints', 'Async problem solving'],
        screeningTips: 'GitLab pairs on real tasks. Read their open-source contribution guide before the interview.'
      }
    ],
    behavioralValues: {
      frameworkName: 'CREDIT: Collaboration, Results, Efficiency, Diversity, Iteration, Transparency',
      description: 'GitLab operates on total public transparency, asynchronous written communication, and rapid iteration.',
      sampleQuestions: [
        'How do you manage your workday and stay accountable when there are no set working hours or managers watching you?',
        'Tell me about an instance where you shipped an imperfect minimum viable change (MVC) to get quick feedback.'
      ],
      prepAdvice: 'Emphasize iteration (shipping small changes fast) and transparency in written communication.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Submit at least 1 merged pull request / merge request to GitLab or a public open-source tool.',
        'Demonstrate understanding of CI/CD pipeline configuration (.gitlab-ci.yml or GitHub Actions).'
      ],
      screeningPitfalls: [
        'Expecting sync meetings for everything: GitLab lives in async text.',
        'Hesitating to ship small, incremental iterations.'
      ],
      idealTimeline: 'GitLab posts remote requisitions on a rolling basis throughout the year.'
    },
    faqs: [
      {
        question: 'Does GitLab have physical offices?',
        answer: 'No. GitLab has been 100% all-remote since its inception with team members distributed across over 65 countries.'
      }
    ]
  },
  {
    slug: 'reddit',
    name: 'Reddit',
    category: 'Remote & Scale-Ups',
    tagline: 'The Front Page of the Internet, Community Subreddits & Real-Time Content Feeds',
    officialCareersUrl: 'https://www.redditinc.com/careers',
    headquarters: 'San Francisco, California',
    usTechHubs: ['100% Remote US Nationwide', 'San Francisco, CA', 'New York, NY'],
    primaryRequisitions: [
      'Software Engineer I (Distributed / Remote)',
      'Backend Engineer, Feeds & Recommendations (Junior)',
      'Mobile Engineer (iOS / Android Early Career)'
    ],
    searchKeywords: [
      'reddit entry level software developer US',
      'reddit l1 software engineer salary',
      'reddit remote software developer hiring'
    ],
    monthlySearchVolume: '5,600/mo',
    organicKD: '35 (Low-Moderate)',
    brandColor: '#ff4500',
    accentBg: '#fff0eb',
    salaryTier: {
      role: 'Software Engineer I',
      level: 'L1 (Entry Level)',
      baseSalaryRange: '$125,000 – $148,000',
      medianBase: '$136,000',
      equityPerYear: '$35,000 – $50,000 (RSUs vesting quarterly over 4 years)',
      signOnBonus: '$10,000 – $20,000',
      totalCompYear1: '$170,000 – $198,000',
      locationTiers: {
        tier1: '$180,000 – $205,000 (Bay Area, NYC, Seattle)',
        tier2: '$165,000 – $188,000 (Austin, Denver, Chicago)',
        tier3: '$155,000 – $175,000 (100% Remote US Nationwide)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Technical Coding Screen (HackerRank / Karat)',
        duration: '60 Minutes',
        format: 'Algorithmic coding test evaluating arrays, hash tables, and string manipulation',
        focus: 'Data structures, algorithm complexity, and clean syntax in Python, Go, or Java.',
        keyTopics: ['Hash tables', 'Sliding window', 'Tree traversal', 'Time complexity'],
        screeningTips: 'Focus on clear variable naming and testing edge cases (empty strings, single item arrays).'
      },
      {
        title: 'Stage 2: Virtual Onsite Technical Loop (3 Rounds)',
        duration: '3 x 60 Minutes',
        format: '2 Coding/system design rounds + 1 Culture & community fit round',
        focus: 'Feeds/ranking algorithms, caching with Redis/Memcached, and community empathy.',
        keyTopics: ['Feed ranking logic', 'Caching & pagination', 'REST/gRPC APIs', 'Reddit values'],
        screeningTips: 'Understand how paginated feeds (cursor-based pagination) work at scale.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Evolve, Remember the Human, Make Something People Love',
      description: 'Reddit values community empathy, respectful humor, continuous learning, and scalable systems.',
      sampleQuestions: [
        'Tell me about a community or forum you participate in and how software could improve their interactions.',
        'Describe a time you adapted to an evolving project requirement.'
      ],
      prepAdvice: 'Demonstrate deep respect for online community discourse and empathy for users.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a discussion forum or social feed application with voting, comment threading, and cursor pagination.',
        'Demonstrate understanding of Redis caching for hot feeds.'
      ],
      screeningPitfalls: [
        'Using naive offset pagination (LIMIT/OFFSET) for large datasets instead of cursor pagination.',
        'Ignoring comment tree recursion/nested structures.'
      ],
      idealTimeline: 'Reddit early-career hiring opens in September–November for summer cohorts.'
    },
    faqs: [
      {
        question: 'Does Reddit allow early-career engineers to work 100% remotely?',
        answer: 'Yes. Reddit operates a permanent distributed-first workforce across the continental United States with competitive national compensation.'
      }
    ]
  },
  {
    slug: 'spotify',
    name: 'Spotify',
    category: 'Remote & Scale-Ups',
    tagline: 'Music & Audio Streaming, Recommendation Algorithms & Work From Anywhere',
    officialCareersUrl: 'https://www.lifeatspotify.com/jobs?c=engineering',
    headquarters: 'Stockholm, Sweden / US HQ: New York, NY',
    usTechHubs: ['New York, NY', 'Boston, MA', 'Work From Anywhere (US Remote)'],
    primaryRequisitions: [
      'Associate Engineer (New Grad / Early Career)',
      'Backend Engineer, Audio Ingestion & Streaming',
      'Web Engineer, Core Player Experience'
    ],
    searchKeywords: [
      'spotify entry level developer positions',
      'spotify associate engineer salary us',
      'spotify work from anywhere software engineering'
    ],
    monthlySearchVolume: '5,900/mo',
    organicKD: '34 (Low-Moderate)',
    brandColor: '#1db954',
    accentBg: '#e8f8ed',
    salaryTier: {
      role: 'Associate Engineer',
      level: 'Associate (Band 1)',
      baseSalaryRange: '$120,000 – $142,000',
      medianBase: '$132,000',
      equityPerYear: '$28,000 – $42,000 (Stock options / RSUs)',
      signOnBonus: '$10,000 – $18,000',
      totalCompYear1: '$158,000 – $185,000',
      locationTiers: {
        tier1: '$170,000 – $192,000 (New York City, Boston, SF)',
        tier2: '$155,000 – $175,000 (Austin, Denver, Chicago)',
        tier3: '$145,000 – $165,000 (Remote US Nationwide)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: HackerRank Technical Assessment',
        duration: '60 Minutes',
        format: '2 Coding questions covering data structures and audio/playlist logic simulation',
        focus: 'Hash tables, arrays, sorting, and algorithmic complexity.',
        keyTopics: ['Hash maps', 'Two pointers', 'Binary search', 'Time/space Big-O'],
        screeningTips: 'Write clean, idiomatic Java, Python, or TypeScript code with automated test coverage.'
      },
      {
        title: 'Stage 2: Virtual Onsite Technical Loop (3 Rounds)',
        duration: '3 x 45 Minutes',
        format: '1 Architecture/pair programming round + 1 Algorithmic round + 1 Culture & Values interview',
        focus: 'Building or refactoring playlist features, microservices, and demonstrating Spotify squad values.',
        keyTopics: ['Event-driven architecture', 'REST APIs', 'Spotify Band culture', 'Collaborative humility'],
        screeningTips: 'Show enthusiasm for audio technology, collaborative team squads, and creative problem solving.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Innovative, Passionate, Collaborative, Transparent, Fair',
      description: 'Spotify values cross-functional teamwork, autonomous squads, and creative passion for music and creators.',
      sampleQuestions: [
        'Tell me about a time you collaborated with peers from different disciplines to ship a project.',
        'How do you handle technical debt when working on new features?'
      ],
      prepAdvice: 'Emphasize your love for music, creative products, and agile squad collaboration.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build an audio player or playlist management web application integrating with Spotify’s public Web API.',
        'Demonstrate understanding of audio streaming, buffering, and responsive playback UI.'
      ],
      screeningPitfalls: [
        'Failing to handle audio playback errors and network buffering states.',
        'Being overly individualistic: Spotify evaluates collaborative team fit heavily.'
      ],
      idealTimeline: 'Spotify runs an annual "Spotify Global Fellowship / Early Career" program opening in early fall.'
    },
    faqs: [
      {
        question: 'What is Spotify’s "Work From Anywhere" policy?',
        answer: 'Spotify allows employees to choose whether they work from an office hub, work from home, or a hybrid mix within their designated geographical region.'
      }
    ]
  },
  {
    slug: 'roblox',
    name: 'Roblox',
    category: 'Remote & Scale-Ups',
    tagline: '3D Spatial Simulation, Immersive Gaming Platform, Luau & Distributed Cloud Infrastructure',
    officialCareersUrl: 'https://careers.roblox.com/jobs?department=Engineering',
    headquarters: 'San Mateo, California',
    usTechHubs: ['San Mateo, CA', 'Remote US Nationwide (Select Teams)'],
    primaryRequisitions: [
      'Software Engineer (New College Graduate)',
      'Game Engine Software Engineer (C++ / Luau)',
      'Cloud Infrastructure & Reliability Engineer'
    ],
    searchKeywords: [
      'roblox entry level software developer',
      'roblox new grad software engineer salary',
      'roblox game engine coding interview'
    ],
    monthlySearchVolume: '6,100/mo',
    organicKD: '36 (Low-Moderate)',
    brandColor: '#000000',
    accentBg: '#eaeaea',
    salaryTier: {
      role: 'Software Engineer',
      level: 'IC1 (New Grad)',
      baseSalaryRange: '$140,000 – $165,000',
      medianBase: '$152,000',
      equityPerYear: '$45,000 – $60,000 (RSUs vesting quarterly over 4 years)',
      signOnBonus: '$15,000 – $25,000',
      totalCompYear1: '$200,000 – $235,000',
      locationTiers: {
        tier1: '$205,000 – $235,000 (San Mateo / Bay Area)',
        tier2: '$185,000 – $210,000 (Austin, Seattle, Denver)',
        tier3: '$170,000 – $190,000 (Remote US)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Roblox Cognitive & Algorithmic Assessment (Codesignal / Immersive)',
        duration: '75 Minutes',
        format: 'Proctored 4-question coding test + gamified spatial reasoning assessment',
        focus: 'Complex 2D/3D matrix manipulation, simulation logic, and algorithm speed.',
        keyTopics: ['2D/3D coordinate transformations', 'Hash tables', 'Graph traversals', 'Physics simulation basics'],
        screeningTips: 'Roblox uses unique spatial reasoning mini-games alongside standard coding challenges.'
      },
      {
        title: 'Stage 2: Virtual Onsite Technical Loop (4 Rounds)',
        duration: '4 x 45 Minutes',
        format: '2 C++/Java/Python coding rounds + 1 Systems/Physics simulation round + 1 Culture round',
        focus: 'Low-latency networking, spatial partitioning, concurrency, and clean code architecture.',
        keyTopics: ['Spatial indexing (Quadtrees/Octrees)', 'Concurrency & thread safety', 'State synchronization', 'Roblox values'],
        screeningTips: 'Show an understanding of client-server synchronization: how game state is updated across distributed clients with lag compensation.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Respect the Community, Take the Long View, Get Stuff Done, Own It',
      description: 'Roblox values long-term technological vision, extreme ownership, and deep respect for creators and players.',
      sampleQuestions: [
        'Tell me about an instance where you optimized a software system for extreme low latency.',
        'Describe a time you solved an ambiguous technical problem from first principles.'
      ],
      prepAdvice: 'Demonstrate technical curiosity about 3D math, physics simulation, or massive multi-player scale.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a real-time multiplayer game or 3D simulation using C++, WebGL/Three.js, or Luau with client-server sync.',
        'Demonstrate understanding of spatial indexing (Quadtrees, Octrees, or bounding volume hierarchies).'
      ],
      screeningPitfalls: [
        'Treating Roblox like a simple game company: their engineering bar is among the highest in systems programming.',
        'Neglecting low-level data structures and memory layout.'
      ],
      idealTimeline: 'Roblox university recruiting opens in late August through October.'
    },
    faqs: [
      {
        question: 'What is Roblox’s compensation level for new grad software engineers?',
        answer: 'Roblox offers top-of-market new grad compensation, with total first-year packages routinely exceeding $200,000 in the San Francisco Bay Area.'
      }
    ]
  },
  {
    slug: 'zoom',
    name: 'Zoom',
    category: 'Remote & Scale-Ups',
    tagline: 'Video Communications, Real-Time Media Streaming, AI Companion & Hybrid Work',
    officialCareersUrl: 'https://careers.zoom.us/jobs/search?team=Engineering',
    headquarters: 'San Jose, California',
    usTechHubs: ['San Jose, CA', 'Denver, CO', 'Remote US Nationwide'],
    primaryRequisitions: [
      'Software Engineer I (Campus / Early Career)',
      'Media Streaming & Real-Time Audio/Video Engineer',
      'Web Application Software Engineer (Junior)'
    ],
    searchKeywords: [
      'zoom entry level software engineer careers',
      'zoom l1 software engineer salary us',
      'zoom video communications early career hiring'
    ],
    monthlySearchVolume: '4,800/mo',
    organicKD: '30 (Low)',
    brandColor: '#2d8cff',
    accentBg: '#eaf3ff',
    salaryTier: {
      role: 'Software Engineer I',
      level: 'L1 (Entry Level)',
      baseSalaryRange: '$118,000 – $138,000',
      medianBase: '$128,000',
      equityPerYear: '$25,000 – $38,000 (RSUs vesting quarterly over 4 years)',
      signOnBonus: '$10,000 – $18,000',
      totalCompYear1: '$150,000 – $175,000',
      locationTiers: {
        tier1: '$160,000 – $182,000 (San Jose, Bay Area, NYC)',
        tier2: '$148,000 – $168,000 (Denver, Austin, Seattle)',
        tier3: '$138,000 – $155,000 (Remote US Nationwide)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: HackerRank Technical Assessment',
        duration: '60 Minutes',
        format: '2 Coding questions covering data structures and algorithms',
        focus: 'String parsing, array manipulation, and hash table caching.',
        keyTopics: ['Hash tables', 'Binary search', 'Sorting', 'Complexity'],
        screeningTips: 'Focus on clean implementation and handling boundary conditions.'
      },
      {
        title: 'Stage 2: Virtual Onsite Technical Loop (3 Rounds)',
        duration: '3 x 45 Minutes',
        format: '2 Coding rounds + 1 System architecture/culture round',
        focus: 'Real-time media streaming, WebRTC/UDP protocols, and collaborative team communication.',
        keyTopics: ['UDP vs TCP', 'WebSockets', 'Packet loss & jitter buffering', 'Customer happiness'],
        screeningTips: 'Review real-time streaming concepts: WebRTC, codecs, and packet retransmission.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Delivering Happiness, Care for Community, Customers & Teammates',
      description: 'Zoom’s core value is "Care": care for customers, teammates, the company, community, and oneself.',
      sampleQuestions: [
        'Tell me about a time you went above and beyond to solve an issue for a customer or teammate.',
        'How do you handle high-pressure deadlines while maintaining a caring, collaborative attitude?'
      ],
      prepAdvice: 'Demonstrate warmth, customer obsession, and genuine enthusiasm for real-time collaboration.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a peer-to-peer video chat or screen sharing app using WebRTC and WebSockets.',
        'Demonstrate understanding of handling intermittent network drops and reconnection.'
      ],
      screeningPitfalls: [
        'Not understanding the difference between TCP and UDP for video streaming.',
        'Focusing only on UI styling without understanding media streaming protocols.'
      ],
      idealTimeline: 'Zoom university hiring runs August–November for summer cohorts.'
    },
    faqs: [
      {
        question: 'Does Zoom offer remote software engineering positions for junior developers?',
        answer: 'Yes. Zoom offers flexible and remote software engineering opportunities across the United States.'
      }
    ]
  },
  {
    slug: 'twitch',
    name: 'Twitch',
    category: 'Remote & Scale-Ups',
    tagline: 'Live Video Streaming, Creator Economy, Real-Time Chat & Amazon Infrastructure',
    officialCareersUrl: 'https://www.twitch.tv/jobs/en/careers/',
    headquarters: 'San Francisco, California',
    usTechHubs: ['San Francisco, CA', 'Seattle, WA', 'Remote US Nationwide'],
    primaryRequisitions: [
      'Software Development Engineer I (SDE 1)',
      'Video Transcoding & CDN Software Engineer',
      'Chat & Community Platform Engineer (Junior)'
    ],
    searchKeywords: [
      'twitch entry level software engineer',
      'twitch sde 1 salary us entry level',
      'twitch live video streaming software interview'
    ],
    monthlySearchVolume: '4,500/mo',
    organicKD: '31 (Low-Moderate)',
    brandColor: '#9146ff',
    accentBg: '#f4edff',
    salaryTier: {
      role: 'Software Development Engineer I',
      level: 'SDE 1 (L4 / Amazon Alignment)',
      baseSalaryRange: '$128,000 – $150,000',
      medianBase: '$138,000',
      equityPerYear: '$28,000 – $40,000 (Amazon stock vesting over 4 years)',
      signOnBonus: '$20,000 – $30,000 (Cash sign-on Year 1 & 2)',
      totalCompYear1: '$175,000 – $200,000',
      locationTiers: {
        tier1: '$185,000 – $205,000 (San Francisco, Seattle)',
        tier2: '$170,000 – $188,000 (Austin, Denver, Chicago)',
        tier3: '$160,000 – $175,000 (Remote US Nationwide)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Amazon / Twitch Online Assessment (OA)',
        duration: '70 Minutes',
        format: 'HackerRank coding challenge + Work Style Assessment evaluating Leadership Principles',
        focus: 'Data structures, algorithm complexity, and customer-first trade-offs.',
        keyTopics: ['Hash maps', 'Two pointers', 'Binary search', 'Customer Obsession'],
        screeningTips: 'Twitch utilizes the Amazon assessment platform. Review Amazon’s 14 Leadership Principles.'
      },
      {
        title: 'Stage 2: Virtual Onsite Technical Loop (4 Rounds)',
        duration: '4 x 45–60 Minutes',
        format: '1-on-1 rounds evaluating coding, high-throughput chat design, and behavioral values',
        focus: 'Writing performant Go/Python/C++ code, handling millions of concurrent chat messages, and community safety.',
        keyTopics: ['Concurrency & channels in Go', 'Message queues (Kafka/RabbitMQ)', 'Live streaming latency', 'Leadership Principles'],
        screeningTips: 'Demonstrate familiarity with high-concurrency systems: how would you architect chat for an esports stream with 100k active chatters?'
      }
    ],
    behavioralValues: {
      frameworkName: 'Amazon Leadership Principles & Creator Community Focus',
      description: 'Twitch aligns with Amazon’s 14 Leadership Principles, with intense focus on creator empowerment and community safety.',
      sampleQuestions: [
        'Tell me about a time you had to balance shipping a feature quickly against system stability.',
        'Why are you passionate about live streaming and creator communities?'
      ],
      prepAdvice: 'Structure all behavioral responses using the STAR method with specific quantitative metrics.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a high-throughput chat server in Go or Node.js utilizing WebSockets and Redis Pub/Sub.',
        'Demonstrate understanding of HLS/DASH video streaming and CDN caching.'
      ],
      screeningPitfalls: [
        'Failing to handle broadcast bottlenecks when one message must be fanned out to thousands of connected clients.',
        'Neglecting Amazon Leadership Principles in the behavioral rounds.'
      ],
      idealTimeline: 'Twitch university hiring runs through Amazon Student Programs from August through November.'
    },
    faqs: [
      {
        question: 'Does Twitch offer remote software engineering positions?',
        answer: 'Yes. Twitch offers remote-friendly positions across the United States in addition to offices in San Francisco and Seattle.'
      }
    ]
  }
];
