import { CompanyHub } from '../companyHubTypes';

export const ENTERPRISE_HUBS: CompanyHub[] = [
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
        screeningTips: 'Play games naturally; Accenture uses this to map candidates to engineering vs functional tracks.'
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
  {
    slug: 'infosys',
    name: 'Infosys',
    category: 'Enterprise & Consulting',
    tagline: 'Digital Services, Cloud Transformation, Enterprise Core Systems & Global IT',
    officialCareersUrl: 'https://www.infosys.com/careers/',
    headquarters: 'Bengaluru, India / US HQ: Indianapolis, IN',
    usTechHubs: ['Indianapolis, IN', 'Raleigh, NC', 'Richardson / Dallas, TX', 'Hartford, CT', 'Phoenix, AZ'],
    primaryRequisitions: [
      'Associate Software Engineer (USA Campus)',
      'Systems Engineer (Graduate Program)',
      'Junior Full Stack Cloud Developer'
    ],
    searchKeywords: [
      'infosys entry level software engineer USA',
      'infosys systems engineer salary us',
      'infosys campus recruiting entry level tech'
    ],
    monthlySearchVolume: '11,400/mo',
    organicKD: '39 (Low-Moderate)',
    brandColor: '#007cc3',
    accentBg: '#e6f3fa',
    salaryTier: {
      role: 'Associate Software Engineer',
      level: 'Systems Engineer (Trainee)',
      baseSalaryRange: '$72,000 – $84,000',
      medianBase: '$78,000',
      equityPerYear: 'N/A',
      signOnBonus: '$3,000 – $5,000',
      totalCompYear1: '$76,000 – $89,000',
      locationTiers: {
        tier1: '$82,000 – $90,000 (NYC, SF, San Jose, Boston)',
        tier2: '$76,000 – $84,000 (Indianapolis, Raleigh, Dallas)',
        tier3: '$70,000 – $78,000 (Phoenix, Hartford, Remote US)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Infosys Online Test (InfyTQ / HackerEarth)',
        duration: '90 Minutes',
        format: 'Reasoning ability, mathematical aptitude, and 2 hands-on coding questions',
        focus: 'String operations, arrays, and basic algorithmic logic.',
        keyTopics: ['Number patterns', 'String manipulation', 'Array sorting', 'Pseudocode interpretation'],
        screeningTips: 'Focus on accuracy in mathematical and logical reasoning sections.'
      },
      {
        title: 'Stage 2: Technical & HR Panel Interview',
        duration: '40 Minutes',
        format: 'Video interview with an Infosys Delivery Lead',
        focus: 'Object-oriented programming concepts (OOP), database queries, and readiness to relocate.',
        keyTopics: ['Core Java / Python', 'SQL joins & normalization', 'Project overview', 'Relocation flexibility'],
        screeningTips: 'Show enthusiasm for enterprise cloud migrations and continuous learning.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Navigate Your Next, Respect, Teamwork & Continuous Learning',
      description: 'Infosys rewards team players, high adaptability, and eagerness to master new cloud technologies.',
      sampleQuestions: [
        'Tell me about an instance where you worked with a cross-functional team under a deadline.',
        'Why are you excited to begin your technology career at Infosys?'
      ],
      prepAdvice: 'Demonstrate humility, strong communication, and positive work ethic.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a web application with Python (Flask/Django) or Java connected to MySQL.',
        'Know basic Git operations (commit, branch, merge).'
      ],
      screeningPitfalls: [
        'Refusing relocation or claiming unwillingness to work across different client domains.',
        'Failing basic SQL primary/foreign key definitions.'
      ],
      idealTimeline: 'Infosys hires heavily across US campuses in spring and fall quarters.'
    },
    faqs: [
      {
        question: 'Does Infosys provide onboarding training for fresh college graduates in the US?',
        answer: 'Yes. US campus hires complete an 8 to 12-week paid foundation training program covering agile delivery, cloud certifications, and full-stack development.'
      }
    ]
  },
  {
    slug: 'tcs',
    name: 'Tata Consultancy Services',
    category: 'Enterprise & Consulting',
    tagline: 'Global IT Services, Enterprise Business Solutions & Digital Consulting',
    officialCareersUrl: 'https://www.tcs.com/careers/entry-level-hiring',
    headquarters: 'Mumbai, India / US HQ: New York, NY',
    usTechHubs: ['Edison / Metro Park, NJ', 'Cincinnati, OH', 'Austin, TX', 'Santa Clara, CA', 'Jacksonville, FL'],
    primaryRequisitions: [
      'Associate Software Engineer (Smart / Ignite)',
      'Graduate IT Trainee (US Campus)',
      'Junior Systems Analyst (Digital)'
    ],
    searchKeywords: [
      'tata consultancy services entry level jobs US',
      'tcs entry level software engineer salary usa',
      'tcs national qualifier test early career'
    ],
    monthlySearchVolume: '9,800/mo',
    organicKD: '38 (Low-Moderate)',
    brandColor: '#001428',
    accentBg: '#e6eaed',
    salaryTier: {
      role: 'Associate Software Engineer',
      level: 'Assistant System Engineer (Trainee)',
      baseSalaryRange: '$70,000 – $82,000',
      medianBase: '$76,000',
      equityPerYear: 'N/A',
      signOnBonus: '$2,500 – $5,000',
      totalCompYear1: '$74,000 – $87,000',
      locationTiers: {
        tier1: '$80,000 – $88,000 (NY/NJ Metro, Bay Area)',
        tier2: '$74,000 – $82,000 (Cincinnati, Austin, Dallas)',
        tier3: '$68,000 – $76,000 (Jacksonville, Columbus, Remote US)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: TCS National Qualifier Test (NQT / Test Portal)',
        duration: '120 Minutes',
        format: 'Aptitude, verbal reasoning, programming logic, and 2 hands-on coding problems',
        focus: 'Numerical ability, logical deduction, and algorithmic syntax.',
        keyTopics: ['Number theory', 'Logical deductions', 'Arrays & strings', 'C/C++/Java/Python basics'],
        screeningTips: 'Manage your time strictly: the cognitive section has strict per-section timers.'
      },
      {
        title: 'Stage 2: Technical, Managerial & HR Interview',
        duration: '45 Minutes',
        format: 'Combined panel interview covering technical knowledge and behavioral fit',
        focus: 'College coursework, software projects, basic databases, and company knowledge.',
        keyTopics: ['OOP concepts', 'Database schemas', 'Willingness to learn', 'Client professionalism'],
        screeningTips: 'Show respect and professional demeanor. Highlight your willingness to earn cloud badges.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Tata Code of Conduct: Integrity, Responsibility & Excellence',
      description: 'TCS places tremendous value on ethical conduct, long-term customer relationships, and continuous capability enhancement.',
      sampleQuestions: [
        'Describe how you handle a project challenge where the requirements are updated midway.',
        'Why do you want to start your engineering career with the Tata Group?'
      ],
      prepAdvice: 'Emphasize your commitment to professional ethics and team-first orientation.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a working CRUD project with user login, form validation, and relational database storage.',
        'Demonstrate ability to explain your code line-by-line.'
      ],
      screeningPitfalls: [
        'Showing up unprepared for basic programming definitions (e.g. encapsulation, abstraction).',
        'Being rigid about specific programming languages.'
      ],
      idealTimeline: 'TCS recruits year-round through campus placement drives and online NQT windows.'
    },
    faqs: [
      {
        question: 'What is the TCS Initial Learning Program (ILP)?',
        answer: 'The Initial Learning Program (ILP) is a comprehensive paid training curriculum that teaches incoming junior engineers agile project methodologies, corporate tools, and technology stacks.'
      }
    ]
  },
  {
    slug: 'capgemini',
    name: 'Capgemini',
    category: 'Enterprise & Consulting',
    tagline: 'Technology Services, Digital Transformation & Cloud Engineering',
    officialCareersUrl: 'https://www.capgemini.com/us-en/careers/',
    headquarters: 'Paris, France / US HQ: New York, NY',
    usTechHubs: ['New York, NY', 'Chicago, IL', 'Houston, TX', 'Atlanta, GA', 'San Francisco, CA', 'Dallas, TX'],
    primaryRequisitions: [
      'Junior Software Developer (Campus Hire)',
      'Cloud & Custom Applications Associate',
      'Technology Consultant (Early Career)'
    ],
    searchKeywords: [
      'capgemini junior software developer jobs',
      'capgemini software engineer salary us entry level',
      'capgemini campus hiring program'
    ],
    monthlySearchVolume: '8,200/mo',
    organicKD: '36 (Low-Moderate)',
    brandColor: '#0070ad',
    accentBg: '#e6f1f7',
    salaryTier: {
      role: 'Junior Software Developer',
      level: 'Consultant (Level 1)',
      baseSalaryRange: '$78,000 – $92,000',
      medianBase: '$84,000',
      equityPerYear: 'N/A',
      signOnBonus: '$4,000 – $7,500',
      totalCompYear1: '$83,000 – $98,000',
      locationTiers: {
        tier1: '$88,000 – $98,000 (NYC, SF, Chicago, Boston)',
        tier2: '$80,000 – $90,000 (Houston, Dallas, Atlanta)',
        tier3: '$74,000 – $82,000 (Phoenix, Charlotte, Remote US)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Gamified Cognitive & Aptitude Test (Aon / CoCubes)',
        duration: '45 Minutes',
        format: 'Memory, pattern recognition, and inductive logic modules',
        focus: 'Working memory and numerical agility.',
        keyTopics: ['Pattern series', 'Data interpretation', 'Basic programming flowcharts'],
        screeningTips: 'Stay calm and focused during pattern-matching rounds.'
      },
      {
        title: 'Stage 2: Technical & Behavioral Video Interview',
        duration: '45 Minutes',
        format: '1-on-1 interview with Capgemini Practice Manager',
        focus: 'Project architecture, Java/Python basics, SQL databases, and client consulting interest.',
        keyTopics: ['REST APIs', 'SQL querying', 'Team communication', 'Client engagement'],
        screeningTips: 'Explain your personal projects with emphasis on how they solve real-world problems.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Honesty, Boldness, Trust, Freedom, Fun & Modesty',
      description: 'Capgemini operates on 7 core values that emphasize collaborative spirit, modesty, and entrepreneurship.',
      sampleQuestions: [
        'Tell me about a time you worked on a project where you had to adapt to unexpected setbacks.',
        'Which of Capgemini’s 7 values resonates most with your personal working style?'
      ],
      prepAdvice: 'Show enthusiasm, cultural modesty, and proactive curiosity.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a clean full-stack application with a documented REST API and relational database.',
        'Obtain a cloud fundamentals certification (AWS, Azure, or GCP).'
      ],
      screeningPitfalls: [
        'Talking only about code syntax without mentioning user requirements.',
        'Unfamiliarity with basic Agile/Scrum concepts.'
      ],
      idealTimeline: 'Capgemini recruits across universities in September–November and January–March.'
    },
    faqs: [
      {
        question: 'What is Capgemini’s Accelerated Career Development program?',
        answer: 'Capgemini provides early-career developers with structured mentorship, milestone reviews, and employer-funded cloud certifications to fast-track promotion to Senior Consultant within 2 to 3 years.'
      }
    ]
  },
  {
    slug: 'cisco',
    name: 'Cisco',
    category: 'Enterprise & Consulting',
    tagline: 'Networking Hardware, Cyber Security, Webex & Cloud Infrastructure',
    officialCareersUrl: 'https://jobs.cisco.com/jobs/SearchJobs/?21178=%5B169482%5D&21178_format=1694',
    headquarters: 'San Jose, California',
    usTechHubs: ['San Jose, CA', 'RTP / Raleigh, NC', 'Austin, TX', 'Richardson, TX', 'Atlanta, GA'],
    primaryRequisitions: [
      'Junior Software Developer (Campus)',
      'Software Engineer I (Cloud & Networking)',
      'Embedded Software Engineer (Early Career)'
    ],
    searchKeywords: [
      'cisco junior software developer openings',
      'cisco grade 4 software engineer salary us',
      'cisco campus recruiting software interview'
    ],
    monthlySearchVolume: '5,500/mo',
    organicKD: '33 (Low-Moderate)',
    brandColor: '#1ba0d7',
    accentBg: '#e8f5fb',
    salaryTier: {
      role: 'Junior Software Developer',
      level: 'Grade 4 (Entry Level)',
      baseSalaryRange: '$95,000 – $115,000',
      medianBase: '$104,000',
      equityPerYear: '$15,000 – $25,000 (RSUs vesting annually)',
      signOnBonus: '$10,000 – $15,000',
      totalCompYear1: '$115,000 – $138,000',
      locationTiers: {
        tier1: '$120,000 – $142,000 (San Jose/Bay Area)',
        tier2: '$108,000 – $125,000 (Raleigh RTP, Austin, Dallas)',
        tier3: '$98,000 – $115,000 (Remote US / Other Hubs)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: HackerRank Technical Assessment',
        duration: '60 Minutes',
        format: '2 Coding questions covering data structures and networking fundamentals',
        focus: 'Array manipulation, string parsing, and basic socket or network concepts.',
        keyTopics: ['Hash tables', 'Binary trees', 'TCP/IP basics', 'Socket programming'],
        screeningTips: 'Review networking fundamentals (OSI model layers, TCP vs UDP) alongside standard coding algorithms.'
      },
      {
        title: 'Stage 2: Full Virtual Onsite Loop (3 Rounds)',
        duration: '3 x 45 Minutes',
        format: '1 Algorithmic coding round + 1 Systems/Networking design round + 1 Hiring Manager round',
        focus: 'Evaluating Python/C++/Go coding, network protocols, and collaborative communication.',
        keyTopics: ['Pointers/Memory (C++) or Python data structures', 'Network protocols', 'Clean code & tests', 'Culture fit'],
        screeningTips: 'Cisco values clean, robust network programming. Explain how your code handles timeouts or dropped connections.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Our People Deal: Connect, Inspire & Together We Win',
      description: 'Cisco emphasizes collaborative innovation, mutual respect, and inclusive leadership.',
      sampleQuestions: [
        'Tell me about a time you diagnosed a complex networking or software bug.',
        'Describe a situation where you had to bridge technical differences between team members.'
      ],
      prepAdvice: 'Demonstrate collaborative teamwork and genuine curiosity about networking scale.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a network packet sniffer, proxy server, or socket-based chat application in Python or Go.',
        'Demonstrate understanding of REST APIs, JSON payloads, and network headers.'
      ],
      screeningPitfalls: [
        'Not knowing the difference between TCP and UDP.',
        'Writing code without error checking on socket reads/writes.'
      ],
      idealTimeline: 'Cisco University Recruiting runs from August through November.'
    },
    faqs: [
      {
        question: 'Does Cisco hire entry-level engineers into software roles or strictly hardware?',
        answer: 'Cisco hires extensively for pure software engineering roles across cloud networking, cybersecurity (Duo, Splunk, Talos), and distributed orchestration platforms.'
      }
    ]
  },
  {
    slug: 'intel',
    name: 'Intel',
    category: 'Enterprise & Consulting',
    tagline: 'Semiconductors, Hardware-Software Co-Design, Firmware & Driver Engineering',
    officialCareersUrl: 'https://jobs.intel.com/en/search-jobs/software?team=Software',
    headquarters: 'Santa Clara, California',
    usTechHubs: ['Santa Clara, CA', 'Hillsboro, OR', 'Chandler / Phoenix, AZ', 'Austin, TX', 'Folsom, CA'],
    primaryRequisitions: [
      'Software Engineer I (Graduate)',
      'Firmware / BIOS Engineer (Early Career)',
      'Compiler & Performance Software Developer'
    ],
    searchKeywords: [
      'intel entry level software engineer roles',
      'intel grade 5 software engineer salary us',
      'intel new grad software engineering interview'
    ],
    monthlySearchVolume: '7,200/mo',
    organicKD: '36 (Low-Moderate)',
    brandColor: '#0071c5',
    accentBg: '#e6f1f9',
    salaryTier: {
      role: 'Software Engineer I',
      level: 'Grade 5 (Entry Level)',
      baseSalaryRange: '$92,000 – $112,000',
      medianBase: '$102,000',
      equityPerYear: '$15,000 – $25,000 (RSUs vesting annually)',
      signOnBonus: '$7,500 – $15,000',
      totalCompYear1: '$112,000 – $135,000',
      locationTiers: {
        tier1: '$120,000 – $140,000 (Santa Clara/Bay Area)',
        tier2: '$105,000 – $122,000 (Hillsboro OR, Austin TX)',
        tier3: '$95,000 – $110,000 (Phoenix AZ, Folsom CA)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Technical Screening Interview',
        duration: '45–60 Minutes',
        format: 'Video interview with an Intel Senior SWE testing C/C++, data structures, and computer architecture',
        focus: 'Pointers, memory management, bitwise operations, and algorithmic logic.',
        keyTopics: ['Pointers & dynamic memory', 'Bitwise operations', 'Struct memory layout', 'Big-O complexity'],
        screeningTips: 'Review computer architecture concepts: cache hierarchy, memory alignment, and registers.'
      },
      {
        title: 'Stage 2: Virtual Onsite Technical Loop (3–4 Rounds)',
        duration: '4 x 45 Minutes',
        format: 'Deep dive interviews covering low-level code, system debugging, OS principles, and team culture',
        focus: 'Writing clean, zero-overhead C/C++ or Python test harnesses.',
        keyTopics: ['C/C++ memory lifecycle', 'Multi-threading & locks', 'OS kernels / virtual memory', 'Culture fit'],
        screeningTips: 'Intel engineers value methodical debugging. Explain how you use GDB, Valgrind, or print logs to isolate faults.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Customer First, One Intel, Fearless, Inclusion & Quality',
      description: 'Intel prizes relentless quality, engineering rigor, and fearless problem-solving.',
      sampleQuestions: [
        'Tell me about a project where quality was critical and cutting corners was unacceptable.',
        'Describe how you diagnosed a bug that only reproduced intermittently.'
      ],
      prepAdvice: 'Demonstrate deep respect for hardware stability, testing discipline, and precision.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a low-level systems project (custom memory allocator, device emulator, or multi-threaded C++ simulation).',
        'Show familiarity with Linux system calls and memory profiling tools.'
      ],
      screeningPitfalls: [
        'Not understanding stack vs heap memory.',
        'Writing C/C++ without checking for memory leaks.'
      ],
      idealTimeline: 'Intel college recruiting opens in September through November for summer starts.'
    },
    faqs: [
      {
        question: 'Does Intel hire pure software engineers or only computer hardware engineers?',
        answer: 'Intel employs tens of thousands of pure software engineers writing compilers (LLVM), Linux drivers, AI frameworks (oneAPI, OpenVINO), and cloud platform virtualization tools.'
      }
    ]
  },
  {
    slug: 'qualcomm',
    name: 'Qualcomm',
    category: 'Enterprise & Consulting',
    tagline: 'Snapdragon Processors, 5G Wireless, Embedded Software & Edge AI Systems',
    officialCareersUrl: 'https://qualcomm.wd5.myworkdayjobs.com/External',
    headquarters: 'San Diego, California',
    usTechHubs: ['San Diego, CA', 'Santa Clara, CA', 'Austin, TX', 'Boulder, CO', 'Bridgewater, NJ'],
    primaryRequisitions: [
      'Software Engineer - Early Career / College Grad',
      'Embedded Systems Software Engineer (Snapdragon)',
      'Wireless Modem Software Engineer (Junior)'
    ],
    searchKeywords: [
      'qualcomm entry level software jobs',
      'qualcomm software engineer salary entry level us',
      'qualcomm embedded software engineering interview'
    ],
    monthlySearchVolume: '6,100/mo',
    organicKD: '32 (Low-Moderate)',
    brandColor: '#00549f',
    accentBg: '#e6eef5',
    salaryTier: {
      role: 'Software Engineer',
      level: 'Associate Engineer',
      baseSalaryRange: '$95,000 – $116,000',
      medianBase: '$105,000',
      equityPerYear: '$20,000 – $32,000 (RSUs vesting quarterly over 3 years)',
      signOnBonus: '$10,000 – $18,000',
      totalCompYear1: '$120,000 – $145,000',
      locationTiers: {
        tier1: '$125,000 – $150,000 (San Diego, Bay Area)',
        tier2: '$110,000 – $130,000 (Austin, Boulder)',
        tier3: '$98,000 – $118,000 (Remote US / Other Hubs)'
      }
    },
    interviewStages: [
      {
        title: 'Stage 1: Technical Coding Screen (HackerRank)',
        duration: '60 Minutes',
        format: 'Online test assessing C/C++ knowledge, bitwise manipulation, and data structures',
        focus: 'Low-level programming fundamentals, pointers, and memory constraints.',
        keyTopics: ['Bitwise operators', 'Pointers & arrays', 'Data structures', 'Complexity'],
        screeningTips: 'Qualcomm tests bit manipulation heavily: setting, clearing, and toggling bits.'
      },
      {
        title: 'Stage 2: Virtual Onsite Technical Loop (3–4 Rounds)',
        duration: '4 x 45 Minutes',
        format: 'Interviews with Qualcomm chip and platform software engineers',
        focus: 'Deep C/C++ coding, OS fundamentals (synchronization, interrupts, processes vs threads), and clean logic.',
        keyTopics: ['Mutexes & semaphores', 'Interrupt handling', 'C memory management', 'Snapdragon architecture basics'],
        screeningTips: 'Be prepared to write syntactically correct C code on virtual whiteboards without auto-complete.'
      }
    ],
    behavioralValues: {
      frameworkName: 'Inventing the Future, Collaborative Spirit & Uncompromising Quality',
      description: 'Qualcomm values innovation, deep technical curiosity, and precision engineering.',
      sampleQuestions: [
        'Describe a complex technical concept you learned recently and how you applied it.',
        'Tell me about a time you optimized code to run in a resource-constrained environment.'
      ],
      prepAdvice: 'Demonstrate deep passion for mobile processing, wireless standards, or low-level operating systems.'
    },
    zeroExperienceStrategy: {
      portfolioCriteria: [
        'Build a project running on an embedded board (Raspberry Pi, Arduino, ESP32) with sensor communication.',
        'Demonstrate understanding of multi-threaded race conditions and synchronization.'
      ],
      screeningPitfalls: [
        'Weak grasp of bitwise operations (&, |, ~, ^).',
        'Not understanding thread synchronization (mutex vs semaphore).'
      ],
      idealTimeline: 'Qualcomm campus recruiting runs heavily August through November.'
    },
    faqs: [
      {
        question: 'What is the standard vesting schedule for Qualcomm RSUs?',
        answer: 'Qualcomm utilizes a 3-year vesting schedule (33% per year) rather than the standard 4-year schedule, allowing new hires to vest equity more rapidly.'
      }
    ]
  }
];
