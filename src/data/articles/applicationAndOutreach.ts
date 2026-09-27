import type { CareerArticle } from '../careerArticles';

export const APPLICATION_AND_OUTREACH_ARTICLES: CareerArticle[] = [
  {
    id: 'live-coding-pair-programming-under-pressure',
    tag: 'Technical Interviews',
    readTime: '8 min read',
    publishedDate: 'September 2026',
    author: {
      name: 'FreshCommits Editorial Team',
      role: 'Senior Technical Interviewer'
    },
    title: 'How to Handle Live Coding & Pair Programming Assessments Without Panic',
    subtitle: 'Tactical communication frameworks, debugging protocols, and mindset techniques for coding with senior engineers watching your cursor.',
    summary: 'There is no setting in software engineering more anxiety-inducing than live coding. A stranger stares at your cursor over a shared screen, your hands tremble on the keyboard, and simple syntax you have written a thousand times suddenly vanishes from your memory. Interview panic is not a reflection of your coding intellect—it is an autonomic physiological response to feeling evaluated. This guide equips you with operational protocols to master live screen coding: the think-aloud framework, recovering gracefully from syntax errors, and converting an adversarial test into a collaborative pair-programming conversation.',
    highlights: [
      'The Think-Aloud Protocol: Converting silent anxiety into high-signal collaborative communication',
      'The "30-Second Recovery Reset" when your mind goes completely blank on a live screen',
      'How senior interviewers evaluate syntax lookups and why googling documentation is actually encouraged',
      'Handling compiler runtime errors and test failures under the live gaze of your evaluator'
    ],
    sections: [
      {
        heading: '1. Reframing the Assessment: From Exam to Pair-Programming',
        content: [
          'The greatest psychological error junior developers make during live screens is treating the interviewer as an antagonistic test proctor waiting to catch them in a mistake.',
          'In reality, the interviewer wants you to succeed. They took an hour out of their busy sprint because their team desperately needs another engineer to help ship features. They are not asking themselves "Can this person memorize syntax?" They are asking: *"Would I enjoy pairing with this engineer on a tough production bug on a Friday afternoon?"*'
        ],
        table: {
          headers: ['Candidate Mindset', 'Observed Behavior in Screen', 'Interviewer Perception', 'Score Outcome'],
          rows: [
            ['Adversarial Exam Mindset', 'Silent typing, rushing to code, defensive when questioned', 'Fragile ego, poor communication, risky team hire', 'Rejection (despite working solution)'],
            ['Collaborative Pairing Mindset', 'Thinks aloud, clarifies edge cases, accepts hints eagerly', 'Teachable, collaborative, strong communicator', 'Strong Hire (even with small syntax bugs)']
          ]
        }
      },
      {
        heading: '2. The Think-Aloud Framework in Action',
        content: [
          'If you code silently for 4 minutes, the interviewer has zero insight into your thought process. If you hit a dead end, they cannot guide you because they do not know what hypothesis you are testing.',
          'Adopt the continuous verbalization habit: state your observation, declare your hypothesis, and explain your line of code as you type it.'
        ],
        codeBlock: {
          language: 'plaintext',
          code: `❌ Silent Stumble:
(4 minutes of dead silence. Typing, deleting, typing again. Sits with hands on head.)
Interviewer: "What are you thinking right now?"
Candidate: "Uhh, I'm just confused."

✅ Collaborative Think-Aloud:
"I am noticing that as we iterate through this array, we have to look up previous elements repeatedly. Right now my brute force approach would re-scan the array, giving us O(N²) time. I want to optimize this to linear O(N) time. To do that, I can trade some memory for speed by storing previously seen elements in a Hash Map. I'll declare the map now with the element value as the key and its index as the value..."`,
          caption: 'Verbalizing trade-offs shows structured thinking and allows interviewers to validate your direction.'
        }
      },
      {
        heading: '3. What to Do When Your Mind Goes Completely Blank',
        content: [
          'If you hit a sudden wave of panic and your mind freezes, do not stare at the screen in paralysis. Execute the **30-Second Reset**:',
          '1. **Drop your hands from the keyboard**: Physical stillness stops frenetic, erratic typing.',
          '2. **Acknowledge and reset aloud**: *"Let me pause for 30 seconds to re-ground myself in the core problem statement."*',
          '3. **Return to the inputs and outputs**: Walk through a tiny example input by hand on lines of comments. Writing sample inputs step-by-step reactivates the analytical cortex and breaks panic loops.'
        ],
        callout: {
          type: 'tip',
          title: 'Can You Google Syntax in Live Screens?',
          text: 'Yes! Over 80% of companies allow you to search language documentation during live screens. The rule is transparency: simply state *"I am going to quickly check MDN for the exact parameters of Array.prototype.reduce"*. This demonstrates genuine professional engineering workflow.'
        }
      },
      {
        heading: '4. Responding to Critical Hints Without Ego',
        content: [
          'If an interviewer intervenes with a question like *"What happens if the input array contains negative numbers?"*, this is not an insult—it is a gift. They are pointing you toward an unhandled edge case.',
          'Never argue or dismiss the prompt. Immediately embrace the hint: *"Great catch. Let me trace how my current logic handles a negative value... Ah, my while condition assumes values are positive. Let me adjust the comparison boundary."*'
        ]
      }
    ]
  },
  {
    id: 'high-impact-github-projects-entry-level',
    tag: 'Portfolio Architecture',
    readTime: '10 min read',
    publishedDate: 'September 2026',
    author: {
      name: 'FreshCommits Editorial Team',
      role: 'Staff Systems Architect'
    },
    title: '5 High-Impact GitHub Project Ideas for Entry-Level Web Developers (With Production Architectures)',
    subtitle: 'Move beyond generic To-Do lists and tutorial clones with these full-stack systems featuring real database indexing, async workers, and public cloud deployment.',
    summary: 'The biggest lie in developer career guidance is the advice to "build 10 projects to show dedication". A hiring manager will never look at 10 projects. In fact, if they open your GitHub profile and see 15 shallow repositories consisting of simple weather widgets, generic calculators, and unmodified tutorial clones, they will assume you can only follow recipes. What converts skeptical engineering managers into enthusiastic interviewers is 2 to 3 deep, production-grade applications that solve real technical challenges. Here are 5 battle-tested project specifications designed to prove enterprise readiness.',
    highlights: [
      'Why tutorial clones kill recruiter interest and the 3 architectural criteria that define high-impact projects',
      'Project 1: Distributed Rate-Limiting API Gateway with Redis and sliding window counters',
      'Project 2: Real-Time Collaborative Markdown Editor using WebSockets and operational transforms',
      'Project 3: Asynchronous Background Job Processing Worker with message queues and retry backoffs',
      'Project 4: Multi-Tenant SaaS Billing & RBAC Platform with Stripe Webhooks and PostgreSQL row-level security'
    ],
    sections: [
      {
        heading: '1. The 3 Hallmarks of an Enterprise-Grade Junior Project',
        content: [
          'To convince an engineering team you are ready to ship production code without requiring hand-holding, your projects must demonstrate three critical capabilities that typical tutorial projects ignore:',
          '1. **Persistence & Data Integrity**: Using an actual relational database (PostgreSQL) with foreign key constraints, migration scripts, and indexed queries.',
          '2. **Resilience & Error Handling**: Graceful degradation, input schema validation (Zod/Pydantic), and structured HTTP status codes.',
          '3. **Automated Testing & CI/CD**: A GitHub Actions workflow running unit tests, linting, and building container images on every pull request.'
        ],
        table: {
          headers: ['Project Idea', 'Core Architecture', 'Key Technical Challenge', 'What It Proves to Recruiters'],
          rows: [
            ['Distributed Rate Limiter', 'Node.js/Go + Redis + Docker', 'Sliding window log algorithm under concurrent requests', 'Concurrency control, low-latency caching, HTTP middleware'],
            ['Real-Time Collaborative Editor', 'TypeScript + WebSockets + React', 'Race condition resolution, optimistic UI updates', 'State synchronization, event-driven architectures'],
            ['Async Background Queue', 'Express/FastAPI + BullMQ/Redis + Postgres', 'Idempotency, exponential retry backoff, dead-letter queue', 'Asynchronous systems, job scheduling, message handling'],
            ['Multi-Tenant RBAC Billing SaaS', 'Next.js + Stripe Webhooks + Prisma', 'Webhook signature verification, role-based access control', 'Enterprise security, third-party payment integration, RBAC'],
            ['Automated Git Metrics Dashboard', 'React + GraphQL/REST + Tailwind', 'OAuth token handling, rate-limit pagination, caching', 'API ingestion, data visualization, token lifecycle']
          ]
        }
      },
      {
        heading: '2. Deep Dive: Distributed Rate-Limiting API Gateway',
        content: [
          'Instead of another CRUD app, build a lightweight reverse proxy that protects downstream services from abusive traffic.',
          'Implement the Sliding Window Counter algorithm using Redis atomic increments (`MULTI`/`EXEC` or Lua scripts). When traffic exceeds 100 requests per minute from an IP address, return HTTP 429 Too Many Requests with standard `X-RateLimit-Reset` and `Retry-After` headers.'
        ],
        codeBlock: {
          language: 'typescript',
          code: `import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

export async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const currentWindow = Math.floor(Date.now() / 60000);
  const key = \`ratelimit:\${clientIp}:\${currentWindow}\`;

  const requests = await redis.incr(key);
  if (requests === 1) {
    await redis.expire(key, 120); // 2-minute safety TTL
  }

  res.setHeader('X-RateLimit-Limit', '100');
  res.setHeader('X-RateLimit-Remaining', Math.max(0, 100 - requests));

  if (requests > 100) {
    return res.status(429).json({
      error: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded. Try again in 60 seconds.'
    });
  }
  next();
}`,
          caption: 'A clean Redis-backed rate limiter demonstrates practical systems and middleware knowledge.'
        }
      },
      {
        heading: '3. Deep Dive: Async Background Job Worker with Dead-Letter Queues',
        content: [
          'In commercial applications, you never process heavy tasks (video encoding, PDF generation, transactional email delivery) synchronously inside an HTTP request cycle.',
          'Build an asynchronous task worker: the web service receives the request, places a job payload onto a Redis queue (BullMQ or Celery), and returns HTTP 202 Accepted immediately. Dedicated background worker processes consume jobs, implement 3 exponential retry attempts on failure, and route permanently failed jobs to a Dead-Letter Queue (DLQ) with alert logging.'
        ],
        callout: {
          type: 'tip',
          title: 'The Evaluator Impact',
          text: 'When you explain this project in an interview, managers see an applicant who understands that long-running operations block HTTP threads. That single realization elevates you into the top 10% of junior candidates.'
        }
      },
      {
        heading: '4. How to Present These Projects on GitHub',
        content: [
          'A brilliant codebase with a blank README gets zero recruiter attention. Ensure every repository includes:',
          '• **One-Line Pitch**: What problem does this solve and what is the primary architecture?',
          '• **Live Hosted Demo Link**: Accessible on Vercel, Railway, or Render without login friction.',
          '• **Architecture Diagram**: A simple Mermaid.js diagram illustrating the client, API, database, and cache flow.',
          '• **One-Command Setup**: A `docker-compose.yml` file so an evaluator can clone and run `docker compose up` to see the entire app running locally in 60 seconds.'
        ]
      }
    ]
  },
  {
    id: 'tech-cover-letter-blueprint-recruiters-read',
    tag: 'Application Strategy',
    readTime: '7 min read',
    publishedDate: 'September 2026',
    author: {
      name: 'FreshCommits Editorial Team',
      role: 'Talent Acquisition & Early-Career Sourcing'
    },
    title: 'How to Write a Tech Cover Letter That Recruiters Actually Read',
    subtitle: 'The 3-paragraph, zero-fluff engineering cover letter blueprint that captures attention in fast-growing startups and selective tech teams.',
    summary: 'You have likely heard conflicting career advice: half the internet claims cover letters are completely dead, while the other half insists you must write a poetic narrative about how you have loved technology since childhood. The truth is nuanced: automated mega-corporations (Amazon, Meta) rarely read them, but early-stage startups, Series A–C scale-ups, and specialized engineering consultancies read every cover letter to gauge technical enthusiasm, writing clarity, and team fit. If a job posting provides an optional cover letter field, submitting this precise 3-paragraph technical blueprint will dramatically increase your callback rates.',
    highlights: [
      'The 3-Paragraph Engineering Blueprint: The Hook, The Technical Alignment, and The Low-Friction Call-to-Action',
      'Why boilerplate generic letters ("I am writing to apply for the position of...") trigger immediate disqualification',
      'Connecting specific company features to personal GitHub projects and architectural decisions',
      'Word-for-word templates for fresh graduates, career switchers, and bootcamp applicants'
    ],
    sections: [
      {
        heading: '1. When Do Tech Cover Letters Actually Matter?',
        content: [
          'Do not waste hours writing cover letters for massive corporate portals with 10,000 applicants where an automated ATS parses only your resume PDF. Cover letters deliver 80%+ of their value in these specific scenarios:',
          '• **Startups & Scale-Ups (10–200 employees)**: The founders or head of engineering personally reviews applicants and prioritizes cultural and technical alignment.',
          '• **Non-Traditional Candidates**: When you need to explain why a mathematics, biology, or mechanical engineering graduate is uniquely qualified for software engineering.',
          '• **Direct Outreach & Small Portals**: Where a human recruiter actually opens attachments.'
        ],
        table: {
          headers: ['Company Type', 'Cover Letter Importance', 'What the Reviewer Evaluates'],
          rows: [
            ['Mega Tech (Google, Amazon, Meta)', 'Near Zero (Resume-driven)', 'Only scanned if candidate is on the border of a screen'],
            ['Growth Startups (Series A–C)', 'High (30–40% influence)', 'Writing clarity, understanding of their product, technical enthusiasm'],
            ['Remote-First Companies (GitLab, Zapier)', 'Critical (50%+ influence)', 'Asynchronous written communication skill, self-direction, remote habits'],
            ['Specialized Consultancies / Agencies', 'Moderate-to-High', 'Client communication ability, versatility across tech stacks']
          ]
        }
      },
      {
        heading: '2. The 3-Paragraph Architectural Blueprint',
        content: [
          'Keep your cover letter strictly under 250 words. Engineers despise verbose prose; they value density, technical clarity, and brevity:',
          '• **Paragraph 1: The Specific Hook (2–3 sentences)**: Mention a specific feature, blog post, or engineering challenge the company recently published and why you want to contribute to that specific mission.',
          '• **Paragraph 2: The Direct Technical Match (3–4 sentences)**: Connect their tech stack to one specific project you engineered, citing real tools and quantifiable metrics.',
          '• **Paragraph 3: Low-Friction Close (1–2 sentences)**: Direct link to live demo/GitHub repository with an invitation for a brief technical conversation.'
        ],
        codeBlock: {
          language: 'plaintext',
          code: `Dear [Engineering Manager Name or Engineering Team],

I read your recent engineering blog post detailing how your team migrated your real-time notification engine from polling to WebSockets, and it immediately resonated with my own development work. I am writing to apply for the Junior Full-Stack Engineer role at [Company Name].

Over the past six months, I engineered [Project Name], an open-source collaborative dashboard built with TypeScript, React, Express, and Redis. While building the notification subsystem, I faced similar throughput hurdles: I implemented Redis Pub/Sub combined with an exponential backoff retry worker, reducing average event delivery latency to under 65ms while managing 500+ mock concurrent connections. I would love to bring this hands-on focus on resilient, low-latency microservices to your platform team.

You can inspect the source code and architecture documentation at [GitHub Link] and explore the deployed application at [Live Demo Link]. I welcome the opportunity to discuss how my technical foundations can accelerate your upcoming sprint goals.

Best regards,
[Your Name] | [Your Phone] | [Your Email]`,
          caption: 'A concise, high-signal technical cover letter tailored to engineering managers.'
        }
      },
      {
        heading: '3. Phrases to Delete Immediately',
        content: [
          'Examine your draft for these generic phrases and delete them instantly:',
          '• ❌ *"I am a hardworking, passionate team player with a hunger to learn."* (Empty adjectives; prove it through metrics and open-source code).',
          '• ❌ *"As you can see from my attached resume..."* (Redundant; do not waste words stating what is self-evident).',
          '• ❌ *"This role would be a fantastic learning opportunity for my career."* (Hiring is an investment in company needs, not a personal charity or training camp).'
        ],
        callout: {
          type: 'warning',
          title: 'The Value Focus',
          text: 'Frame your letter around what you can deliver for their team on day one, not how the company can serve as your personal learning academy.'
        }
      }
    ]
  },
  {
    id: 'linkedin-cold-outreach-engineering-managers',
    tag: 'Job Search Strategy',
    readTime: '8 min read',
    publishedDate: 'September 2026',
    author: {
      name: 'FreshCommits Editorial Team',
      role: 'Staff Sourcing & Executive Recruiting'
    },
    title: 'Cold Outreach Strategies on LinkedIn for Entry-Level Roles That Get 30%+ Response Rates',
    subtitle: 'Concise messaging frameworks, timing rules, and follow-up cadences for reaching out to engineering managers without sounding transactional.',
    summary: 'When 1,000 candidates click "Easy Apply" on LinkedIn within hours of an entry-level posting going live, waiting passively for an automated recruiter email is a losing mathematical strategy. The candidates who consistently secure interview loops take control of their pipeline through respectful, highly targeted cold outreach. However, 95% of candidates do outreach incorrectly: they send 400-word walls of text, plead for referrals from strangers, or spam generic templates. This guide reveals the exact 65-word messaging framework that achieves consistent 30%+ response rates from engineering leads and hiring managers.',
    highlights: [
      'The "Who to Message" Hierarchy: Why targeting Staff Engineers and Engineering Managers outperforms cold messaging recruiters',
      'The 65-Word Golden Rule: Eliminating cognitive burden to maximize mobile response rates',
      'The 3-Touch Follow-Up Cadence: How to follow up without being annoying or unprofessional',
      'Word-for-word copyable outreach templates optimized for LinkedIn connection requests'
    ],
    sections: [
      {
        heading: '1. The Target Hierarchy: Who Should You Actually Message?',
        content: [
          'Most applicants make the mistake of messaging corporate recruiters who have 500 unread messages in their LinkedIn inboxes every morning. Sourcing recruiters are overwhelmed with volume.',
          'Instead, target the people who actually feel the pain of understaffed engineering sprints: **Engineering Managers (EMs)** and **Staff/Principal Software Engineers** on the specific team hiring for the role.'
        ],
        table: {
          headers: ['Target Profile', 'Inbound Message Volume', 'Decision-Making Power', 'Likely Response Strategy'],
          rows: [
            ['Corporate / Campus Recruiter', 'Extremely High (300+ msgs/wk)', 'Initial resume filter only', 'Ignores 90% of cold messages unless keyword match is perfect'],
            ['Engineering Manager (Hiring Manager)', 'Moderate (15–30 msgs/wk)', 'Full hiring decision authority', 'Responds to concise, tech-aligned notes that show initiative'],
            ['Staff / Senior Engineer on Team', 'Low (3–8 msgs/wk)', 'Influential internal referral champion', 'Happy to refer competent engineers who show genuine technical curiosity'],
            ['Company Founder / CTO (at Startups)', 'High from investors/sales', 'Instant interview fast-track', 'Values high agency, direct proof of work, and quick prototypes']
          ]
        }
      },
      {
        heading: '2. The 65-Word Golden Formula',
        content: [
          'Engineering managers review LinkedIn messages on their smartphones between sprint planning meetings. If your message requires scrolling, it gets swiped away for "later"—which means never.',
          'Keep your initial message under 65 words. Include: 1) Connection to their team, 2) One specific technical project metric, and 3) A direct link to inspect the code.'
        ],
        codeBlock: {
          language: 'plaintext',
          code: `Subject / Note (under 300 characters for LinkedIn connection requests):

"Hi [Name], loved your team's recent work open-sourcing the [Project/Tool Name]. I just submitted an application for the Junior Backend role (Requisition #1234). I recently built an async queue system in Go/Redis with sub-50ms processing times (github.com/myname/queue-app). If helpful, would love to share a 2-minute overview with your team. Thanks for your time!"`,
          caption: 'Under 300 characters, zero entitlement, clear technical proof, and easy to review.'
        }
      },
      {
        heading: '3. What Never to Say in a Cold Message',
        content: [
          'Avoid these high-friction outreach blunders:',
          '• ❌ *"Can you please refer me for this position?"* (A referral puts their professional reputation on the line for a stranger; never ask for a referral directly in the first message).',
          '• ❌ *"Can I pick your brain for 30 minutes over coffee?"* (Senior engineers do not have 30 minutes of free time to give away; ask a specific 1-sentence technical question instead).',
          '• ❌ *"I am desperately looking for any job in software."* (Desperation signals that you are applying indiscriminately rather than targeting their team deliberately).'
        ],
        callout: {
          type: 'tip',
          title: 'The "Low Friction" Rule',
          text: 'Make replying take less than 10 seconds of effort. Phrases like "No reply needed if your pipeline is currently full, but wanted to put this on your radar" reduce pressure and ironically increase response rates.'
        }
      },
      {
        heading: '4. The 3-Touch Follow-Up Cadence',
        content: [
          'If you receive no response after 5 business days, do not assume rejection. Managers get pulled into outages, deployments, and quarterly planning.',
          '• **Touch 1 (Day 1)**: Initial concise outreach note with project link.',
          '• **Touch 2 (Day 5)**: Gentle polite bump: *"Hi [Name], know you are busy shipping features! Just wanted to share that I added automated integration tests to my queue repo this week. Hope you have a great weekend."*',
          '• **Touch 3 (Day 12)**: Final touch: *"Closing the loop on this—wishing your team the best on the upcoming release."*'
        ]
      }
    ]
  },
  {
    id: 'frontend-engineer-roadmap-essential-skills',
    tag: 'Role Roadmaps',
    readTime: '9 min read',
    publishedDate: 'September 2026',
    author: {
      name: 'FreshCommits Editorial Team',
      role: 'Staff Frontend Architect'
    },
    title: 'Entry-Level Frontend Engineer Roadmap: Essential Skills vs. Nice-to-Haves',
    subtitle: 'A pragmatic guide cutting through framework fatigue: What core capabilities hiring managers test versus tools you should safely ignore as a junior.',
    summary: 'The modern frontend ecosystem is notoriously overwhelming for early-career developers. Social media influencers insist that to get an entry-level frontend role, you must know React, Vue, Svelte, Next.js, Remix, Tailwind, Webpack, Vite, GraphQL, WebSockets, Three.js, and WebAssembly. This advice causes severe burnout and shallow, superficial knowledge. In production, engineering leads do not hire juniors for encyclopedic framework knowledge; they hire for rock-solid core JavaScript fundamentals, CSS layout precision, component lifecycle comprehension, and accessibility. This roadmap separates the mandatory core from secondary distractions.',
    highlights: [
      'The Essential vs. Nice-to-Have Skills Matrix for entry-level frontend positions',
      'Why deep DOM, Event Loop, and TypeScript generics outweigh learning five different UI libraries',
      'The 4 CSS concepts that 70% of junior candidates fail in technical live screens (Flexbox, Grid, Stacking Context, and Specificity)',
      'Practical Core Web Vitals and Web Accessibility (a11y) fundamentals that impress senior frontend reviewers'
    ],
    sections: [
      {
        heading: '1. The Essential vs. Nice-to-Have Matrix',
        content: [
          'Spend 80% of your study hours mastering the **Tier 1 Essentials**. You can learn secondary build tools and alternative frameworks on the job within two weeks once your fundamentals are solid.'
        ],
        table: {
          headers: ['Category', 'Tier 1: Mandatory Core (Must Master)', 'Tier 2: Nice-to-Have (Learn on the Job)', 'Tier 3: Safe to Ignore for Now'],
          rows: [
            ['Core Languages', 'Modern JavaScript (ES6+), TypeScript, semantic HTML5, modern CSS', 'Web Workers, WebGL basics', 'WebAssembly, Rust in frontend'],
            ['UI Framework', 'One primary framework deeply (React with Hooks or Vue 3)', 'Next.js / SSR fundamentals', 'Svelte, Solid, Angular, Astro (don\'t learn all 5)'],
            ['Styling Architecture', 'Tailwind CSS, CSS Flexbox & CSS Grid, responsive media queries', 'CSS Modules, CSS-in-JS (Styled Components)', 'Sass/SCSS mixins, PostCSS custom plugins'],
            ['State Management', 'React useState, useReducer, Context API, URL query state', 'Zustand, TanStack Query (React Query)', 'Redux Toolkit with complex thunk sagas'],
            ['Quality & Tooling', 'Vite, Git, Chrome DevTools profiling, Vitest / React Testing Library', 'Playwright E2E basics, ESLint, Prettier', 'Custom Webpack 5 AST plugins, Turbopack internals']
          ]
        }
      },
      {
        heading: '2. The 4 CSS Concepts Juniors Routinely Fail in Screens',
        content: [
          'In frontend interview loops, senior engineers will frequently ask you to debug a styling problem live. The four most common stumbling blocks:',
          '1. **The Stacking Context & z-index**: Understanding why `z-index: 9999` fails when an ancestor element has `position: relative; opacity: 0.9` or `transform`.',
          '2. **CSS Grid vs. Flexbox**: Flexbox for one-dimensional linear layouts (navigation bars, button groups); CSS Grid for two-dimensional structured cards and dashboard matrices.',
          '3. **Box-Sizing**: The difference between `content-box` and `border-box` and how borders affect element calculations.',
          '4. **CSS Specificity**: How inline styles, IDs, classes, and element selectors cascade mathematically.'
        ]
      },
      {
        heading: '3. Modern TypeScript Fluency for Frontend SWEs',
        content: [
          'Submitting a React project with `any` types scattered across props and state variables is an instant red flag. Modern teams demand type-safe component contracts.'
        ],
        codeBlock: {
          language: 'typescript',
          code: `// ❌ Junior Mistake: Bypassing the type system with 'any'
interface UserCardProps {
  user: any;
  onUpdate: (data: any) => void;
}

// ✅ Senior-Grade Junior Pattern: Explicit discriminated unions and generic props
export type UserStatus = 'active' | 'suspended' | 'pending_verification';

export interface User {
  id: string;
  fullName: string;
  email: string;
  status: UserStatus;
  lastLoginAt: Date | null;
}

export interface UserCardProps {
  user: User;
  onUpdate: (updatedFields: Partial<Omit<User, 'id'>>) => Promise<void>;
  isLoading?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onUpdate, isLoading = false }) => {
  // Fully typed props with autocomplete and compile-time verification
  return <div>{user.fullName}</div>;
};`,
          caption: 'Clean, production-grade TypeScript contracts prevent runtime bugs before code ever deploys.'
        }
      },
      {
        heading: '4. Web Accessibility (a11y) & Core Web Vitals',
        content: [
          'If you want to blow away a frontend interviewer, do not talk about fancy 3D animations. Talk about accessibility and performance:',
          '• **Keyboard Navigation**: Ensure modals trap focus, menus close on `Escape`, and all interactive elements are reachable via `Tab`.',
          '• **Semantic HTML**: Use `<button>` instead of `<div onClick=...>`, `<main>`, `<article>`, and `<nav>` instead of endless nested `<div>` tags.',
          '• **Largest Contentful Paint (LCP)**: Explain image preloading, responsive `srcset`, and modern formats (WebP/AVIF) to keep initial load times under 2.5 seconds.'
        ],
        callout: {
          type: 'tip',
          title: 'The Accessibility Differentiator',
          text: 'Fewer than 15% of entry-level applicants mention accessibility during interviews. Bringing up screen reader testing with NVDA/VoiceOver instantly marks you as an engineer with production maturity.'
        }
      }
    ]
  }
];
