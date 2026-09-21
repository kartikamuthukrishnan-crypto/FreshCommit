export interface ArticleSection {
  heading: string;
  content: string[];
  codeBlock?: {
    language: string;
    code: string;
    caption?: string;
  };
  table?: {
    headers: string[];
    rows: string[][];
  };
  callout?: {
    type: 'tip' | 'warning' | 'note';
    title: string;
    text: string;
  };
}

export interface CareerArticle {
  id: string;
  tag: string;
  readTime: string;
  publishedDate: string;
  author: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  title: string;
  subtitle: string;
  summary: string;
  highlights: string[];
  sections: ArticleSection[];
}

export const CAREER_ARTICLES: CareerArticle[] = [
  {
    id: 'git-hygiene-day-one',
    tag: 'Engineering Culture',
    readTime: '6 min read',
    publishedDate: 'Updated September 2026',
    author: {
      name: 'FreshCommit Editorial Team',
      role: 'Staff Infrastructure & Developer Experience'
    },
    title: 'Git Commit & Branch Hygiene: What Senior Engineers Expect on Day One',
    subtitle: 'Why your commit history reveals more about your engineering discipline than your LeetCode score.',
    summary: 'When a new junior engineer joins a production team, their code is rarely where problems start. Where senior engineers, tech leads, and DevOps engineers get nervous is messy git histories: 47 commits named "fix", merge commits interlaced with master, and un-rebased PRs that pollute `git bisect`. Here is the exact Git workflow expected on day one.',
    highlights: [
      'Atomic commits using imperative mood ("feat: implement retry backoff" vs "fixed bug")',
      'Interactive rebasing to squash experimental commits before requesting peer review',
      'Semantic release rules and how commit prefixes automate deployment pipelines',
      'Branch naming conventions that connect with Jira, GitHub, and Linear issue trackers'
    ],
    sections: [
      {
        heading: '1. The Anatomy of an "Atomic Commit"',
        content: [
          'An atomic commit encapsulates one logical unit of change. If you are adding an email validation regex and fixing a button styling bug on the same page, those belong in two separate commits.',
          'Why does this matter in production? Because when a deployment breaks at 2:00 AM, the on-call engineer needs to run `git revert <commit-hash>`. If your commit combined the database migration with CSS tweaks and a logging fix, reverting your commit will revert three unrelated changes, making incident mitigation painful.'
        ],
        codeBlock: {
          language: 'bash',
          code: `# ❌ Poor Commit Message (Vague, Past-Tense, Unstructured)
git commit -m "fixed the login issue and updated style"

# ✅ Senior-Grade Conventional Commit (Imperative Mood, Scoped, Explanatory)
git commit -m "fix(auth): prevent session race condition during OAuth callback

Resolves token invalidation when users double-click the provider sign-in button.
Adds a 300ms debounce and sets the pending status flag."`,
          caption: 'Conventional Commits standardize automated semantic versioning and release notes.'
        }
      },
      {
        heading: '2. The 7 Rules of Professional Git Commit Messages',
        content: [
          'Teams with high developer velocity adhere to the standard Tim Pope git guidelines adopted by Linux, Chromium, and major tech firms:',
          '1. Separate the subject line from body with a blank line.',
          '2. Limit the subject line to 50 characters.',
          '3. Capitalize the subject line (or follow conventional commits lowercase prefix like feat:).',
          '4. Do not end the subject line with a period.',
          '5. Use the imperative mood in the subject line ("Add feature", not "Added feature" or "Adds feature"). Think: "If applied, this commit will <your subject line>".',
          '6. Wrap the body text at 72 characters.',
          '7. Use the body to explain what and why vs. how. The diff already explains how.'
        ],
        callout: {
          type: 'tip',
          title: 'The Imperative Mood Rule',
          text: 'A quick trick: prepend "If merged, this commit will..." before your message. "If merged, this commit will fix authentication race condition" makes grammatical sense. "If merged, this commit will fixed bug" does not.'
        }
      },
      {
        heading: '3. Interactive Rebasing: Cleaning Up Before Code Review',
        content: [
          'While writing code locally, it is completely normal to have messy commits: "wip", "typo fix", "test print statement", "try again". But you should never present that raw draft to your team in a Pull Request.',
          'Before opening your PR or pinging your tech lead, clean up your history using interactive rebase (`git rebase -i HEAD~N`). Group exploratory trial-and-error into cohesive, self-contained commits.'
        ],
        codeBlock: {
          language: 'bash',
          code: `# Rebase the last 4 commits on your feature branch
git rebase -i HEAD~4

# An editor opens:
# pick e4a1b02 feat(jobs): add location radius filter
# squash 7b82c19 fix typo in query param
# squash 3d91f80 add unit tests for radius math
# pick 89c201a docs(api): document radius query syntax

# Save and close to automatically collapse 3 commits into 1 clean logical feature!`
        }
      },
      {
        heading: '4. Branch Naming Conventions That Fit Enterprise Workflows',
        content: [
          'Enterprise CI/CD systems like GitHub Actions, GitLab CI, and AWS CodePipeline frequently use branch names to spin up ephemeral preview environments or assign tickets. Avoid naming branches "my-branch" or "test".'
        ],
        table: {
          headers: ['Branch Pattern', 'Example', 'Intended Usage'],
          rows: [
            ['feat/<ticket>-<description>', 'feat/FC-104-salary-filter', 'New user-facing functionality'],
            ['fix/<ticket>-<description>', 'fix/FC-221-null-salary-crash', 'Bug fixes and regression patches'],
            ['refactor/<description>', 'refactor/extract-job-card-props', 'Code reorganization without behavior change'],
            ['chore/<description>', 'chore/bump-vite-8-peer-deps', 'Dependency updates, config changes, linter rules']
          ]
        }
      },
      {
        heading: '5. Pre-Commit Hooks & Avoiding Accidentally Committed Secrets',
        content: [
          'The fastest way to trigger a security escalation on week one is running `git add .` and committing an `.env` file containing an API key or AWS token. Always check `git status` or inspect `git diff --staged` before committing.',
          'Configure a pre-commit hook using `husky` or `pre-commit` to prevent accidental credential leakage, run linters automatically, and verify commit message formatting.'
        ]
      }
    ]
  },
  {
    id: 'rsu-base-equity-decoded',
    tag: 'Compensation',
    readTime: '8 min read',
    publishedDate: 'Updated September 2026',
    author: {
      name: 'FreshCommit Editorial Team',
      role: 'Compensation Research & Industry Benchmarks'
    },
    title: 'Decoding New Grad Tech Offers: Base Salary vs. RSUs vs. Sign-On Bonuses',
    subtitle: 'A practical, mathematical guide to evaluating Total Compensation (TC), 4-year cliffs, and tax surprises.',
    summary: 'You receive an offer letter: "$165,000 Total Compensation (First Year)". Before celebrating or comparing numbers on Blind or Reddit, you need to dissect how much of that number lands in your checking account on the 1st and 15th of each month, what portion is tied to stock volatility, and what happens if you switch jobs after 11 months.',
    highlights: [
      'The difference between guaranteed cash (base salary) vs. contingent and vesting assets',
      'The 1-year cliff and why first-year departures forfeit 100% of equity grant value',
      'Pre-IPO double-trigger options vs. liquid public stock (FAANG/Tier-1)',
      'High-impact negotiation levers for entry-level candidates without competing offers'
    ],
    sections: [
      {
        heading: '1. The Total Compensation (TC) Formula',
        content: [
          'In modern tech, compensation is never just a single salary number. The standard offer structure looks like this:',
          'Total First Year Compensation = Base Salary + (Total RSU Grant / 4) + First-Year Sign-on Bonus + Target Annual Performance Bonus.',
          'For example, an offer stating "$165K Total Compensation" often breaks down as: $115,000 Base Salary + $120,000 RSUs vested equally over 4 years ($30,000/year) + $10,000 First-Year Sign-on + $10,000 Annual Performance Bonus (not guaranteed).'
        ],
        table: {
          headers: ['Component', 'Type', 'Guaranteed?', 'Payment Cadence'],
          rows: [
            ['Base Salary', 'Cash', 'Yes', 'Bi-weekly or semi-monthly paycheck'],
            ['Sign-On Bonus', 'Cash', 'Yes (with clawback clause)', 'Lump sum in 1st or 2nd paycheck'],
            ['RSUs (Public)', 'Stock', 'Dollar value fluctuates with stock price', 'Quarterly or annually after 1-year cliff'],
            ['Stock Options (Private)', 'Equity Derivative', 'No (Paper money until liquidity event)', 'Subject to exercise cost and strike price'],
            ['Annual Bonus', 'Cash', 'Conditional (tied to company/individual rating)', 'Paid once per year (usually Q1)']
          ]
        }
      },
      {
        heading: '2. The 1-Year Cliff & Clawback Clauses',
        content: [
          'The most critical clause in any equity agreement is the **1-Year Cliff**. In a standard 4-year vesting schedule with a 1-year cliff, you receive zero shares during your first 364 days. On your exact 1-year anniversary, 25% of your equity grant vests all at once. Afterwards, shares vest monthly or quarterly.',
          'Similarly, review the sign-on bonus terms. Most sign-on bonuses have a **12-to-24-month clawback provision**: if you voluntarily leave or are terminated for cause within your first year, you are legally required to repay the gross sign-on bonus amount back to the employer.'
        ],
        callout: {
          type: 'warning',
          title: 'Tax Danger on Sign-On Clawbacks',
          text: 'If you receive a $15,000 sign-on bonus, taxes will be withheld and you might only receive ~$9,800 in cash. However, if you leave within 12 months, the company demands the full $15,000 gross back. Recovering the overpaid taxes requires filing an IRC Section 1341 claim on your next tax return.'
        }
      },
      {
        heading: '3. Pre-IPO Startups vs. Public Companies: Not All RSUs Are Equal',
        content: [
          'If a public company (like Google, Amazon, Microsoft, or Uber) grants you $100,000 in RSUs, those shares are immediately liquid on NASDAQ or NYSE upon vesting. You can sell them the day they vest and transfer cash into your index funds or bank account.',
          'If an early-stage or late-stage startup (Series B, C, or pre-IPO) offers you "$150K in equity", that equity has zero liquidity today. It cannot be sold unless the company undergoes an Initial Public Offering (IPO) or gets acquired. Furthermore, many startups issue double-trigger RSUs (requiring both time-vesting AND a liquidity event) or incentive stock options (which cost your own money to exercise).'
        ]
      },
      {
        heading: '4. Negotiation Levers for New Grads (Even Without Competing Offers)',
        content: [
          'Many university grads believe they have zero leverage. While it is true you cannot invent fake offers, you can always ask for specific, low-friction adjustments with respectful professionalism:',
          '1. **Sign-On Bonus Flexibility**: Companies have strict headcount salary bands for Level 1 / New Grad SWEs (e.g., $110k–$120k max), but recruiters have discretionary budget pools for one-time sign-on bonuses and relocation assistance.',
          '2. **Start Date Flexibility**: Need an extra 3 weeks to study or relocate? Ask for it before signing. Recruiters almost always accommodate reasonable start-date requests.',
          '3. **Equipment & Home Office Stipends**: Remote and hybrid roles often offer $1,000–$2,500 one-off hardware budgets for monitors and ergonomic setups.'
        ],
        codeBlock: {
          language: 'text',
          code: `// Sample Respectful Counter-Proposal Script:
"Dear [Recruiter Name],

Thank you so much for extending this offer. I am genuinely excited about the work 
the [Team Name] is doing with [Specific Tech/Product], and I would love to contribute.

After reviewing the total compensation structure and factoring in the cost of living 
in [City], I was hoping to see if there is any flexibility regarding the sign-on bonus 
or relocation assistance to help bridge the transition before starting.

An increase of $5,000–$8,000 in the sign-on bonus would make this an immediate and 
easy decision for me to sign today. Regardless, I am thrilled about the opportunity 
and look forward to hearing your thoughts!"`
        }
      }
    ]
  },
  {
    id: 'standout-portfolio-architecture',
    tag: 'Portfolio Strategy',
    readTime: '7 min read',
    publishedDate: 'Updated September 2026',
    author: {
      name: 'FreshCommit Editorial Team',
      role: 'Hiring Committee & Senior Staff Engineers'
    },
    title: 'Beyond Todo Lists: 4 Production-Grade Projects That Get You Screened',
    subtitle: 'Hiring managers filter out generic bootcamp clones in seconds. Here are 4 architectures that demonstrate distributed systems, rate limiting, and caching.',
    summary: 'A portfolio with a basic Todo list, a clone of Netflix, and a weather app that calls a free API tells an engineering manager one thing: this candidate knows how to follow a 2-hour YouTube tutorial. If you want to stand out for 0–2 YoE engineering positions in competitive markets, your projects must demonstrate knowledge of distributed systems, error boundaries, rate limiting, and observability.',
    highlights: [
      'Why recruiters ignore generic CRUD clones and what hiring managers actually look for',
      'Architecture 1: Idempotent Payment Webhook Ingestion Engine with Redis deduplication',
      'Architecture 2: High-Throughput Log Streaming Daemon with SQLite WAL mode',
      'Architecture 3: Distributed Rate Limiter Middleware with Sliding Window & Token Bucket',
      'How to write a senior-grade README with architecture diagrams, benchmarks, and trade-offs'
    ],
    sections: [
      {
        heading: '1. What Hiring Managers Actually Evaluate in Personal Projects',
        content: [
          'When an engineering lead clicks a candidate\'s GitHub link, they do not read 2,000 lines of frontend code. They look for 4 specific signals:',
          '1. **System Architecture**: Did the candidate think about edge cases, failure states, network timeouts, and concurrency?',
          '2. **Error Handling**: Are there try/catch blocks with meaningful fallbacks, or does an API failure crash the UI with a white screen?',
          '3. **Automated Testing**: Are there unit and integration tests configured with GitHub Actions CI?',
          '4. **Documentation**: Does the README include a clear system diagram, setup instructions that actually work with a single command (`docker-compose up`), and a discussion of technical trade-offs?'
        ]
      },
      {
        heading: '2. Project Idea 1: Idempotent Webhook Processing Engine',
        content: [
          'In real payment systems (Stripe, Adyen, PayPal), webhooks are delivered with "at-least-once" delivery semantics. That means a customer charged once might trigger duplicate webhooks due to network retries. If your server blindly executes the event twice, the user is double-charged or credited twice.',
          'Build an event ingestion service that receives webhook payloads, validates HMAC signatures, checks idempotency keys in Redis with atomicity, queues background processing with exponential backoff retries, and records execution status.'
        ],
        codeBlock: {
          language: 'typescript',
          code: `// Express / Node.js Idempotent Webhook Handler Concept
app.post('/api/webhooks', async (req, res) => {
  const eventId = req.headers['x-webhook-id'] as string;
  const signature = req.headers['x-webhook-signature'] as string;

  // 1. Verify cryptographic HMAC signature
  if (!verifyHmac(req.rawBody, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }

  // 2. Atomic Redis SETNX to ensure idempotency across concurrent instances
  const acquired = await redis.set(\`webhook:lock:\${eventId}\`, 'processing', 'NX', 'EX', 60);
  if (!acquired) {
    // Already processed or currently processing; return 200 to acknowledge delivery
    return res.status(200).json({ status: 'duplicate_acknowledged' });
  }

  // 3. Dispatch to background message queue for asynchronous execution
  await taskQueue.add('process_payment', req.body, { attempts: 5, backoff: { type: 'exponential', delay: 1000 } });

  return res.status(202).json({ status: 'queued' });
});`
        }
      },
      {
        heading: '3. Project Idea 2: Distributed Rate-Limiter Middleware',
        content: [
          'Every enterprise API (GitHub, OpenAI, Cloudflare) enforces strict rate limits to prevent denial-of-service and manage API costs. Implementing a distributed rate limiter demonstrates knowledge of Redis algorithms and HTTP response semantics.',
          'Implement both the **Token Bucket** and **Sliding Window Log** algorithms as middleware. Return standard RFC HTTP headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `Retry-After`. Include automated k6 or autocannon load testing scripts proving it handles 5,000 req/sec.'
        ]
      },
      {
        heading: '4. Project Idea 3: High-Throughput Log Aggregator with SQLite WAL Mode',
        content: [
          'Instead of throwing a heavyweight Elasticsearch cluster at small server workloads, build a lightweight, self-contained log daemon in Go, Rust, or Node.js. It tails log files, parses structured JSON logs, batches writes to SQLite in Write-Ahead-Log (WAL) mode, and exposes an HTTP query endpoint with full-text search.',
          'This project shows you understand memory allocation, buffer pooling, disk I/O bottlenecks, and SQLite concurrency.'
        ]
      },
      {
        heading: '5. The "Golden README" Template',
        content: [
          'A brilliant codebase with a blank README will never be read. Structure your GitHub repository README like an engineering RFC:',
          '• **Problem Statement**: What real-world constraint does this solve?',
          '• **Architecture Diagram**: An ASCII or Mermaid.js diagram illustrating data flow between client, reverse proxy, application server, cache, and database.',
          '• **Key Engineering Decisions**: Why did you choose Redis over in-memory Map? Why SQLite WAL mode over Postgres for this use-case?',
          '• **Benchmarking Data**: Latency percentiles (p50, p95, p99) under load.',
          '• **One-Line Quickstart**: `docker-compose up --build` with seeded demo data.'
        ]
      }
    ]
  },
  {
    id: 'reverse-interviewing-engineering-teams',
    tag: 'Interview Prep',
    readTime: '5 min read',
    publishedDate: 'Updated September 2026',
    author: {
      name: 'FreshCommit Editorial Team',
      role: 'Career Coaching & Engineering Mentorship'
    },
    title: 'Reverse-Interviewing Engineering Teams: Questions to Identify Mentorship Culture',
    subtitle: 'The single highest-risk factor for early-career developers is landing on a team with zero bandwidth for mentorship. Here is how to test for it.',
    summary: 'When you are a junior engineer with 0–2 years of experience, the company name on your resume matters far less than whether you are actually learning. If you join a chaotic startup or disconnected enterprise team where seniors are burnt out and PRs sit unreviewed for 3 weeks, your skill growth grinds to a halt. In the final 10 minutes of your interview, it is your turn to interview the team.',
    highlights: [
      'Diagnostic questions to ask peers vs. engineering managers',
      'How to uncover actual code review habits without sounding confrontational',
      'The "production incident" test to reveal psychological safety vs. blame culture',
      'Red flags: absence of automated testing, zero staging environments, and solo hero programming'
    ],
    sections: [
      {
        heading: '1. Why You Must Reverse-Interview Your Future Team',
        content: [
          'In job interviews, the power dynamic feels one-sided: they ask algorithmic questions, and you provide solutions. But when the interviewer says: "Do you have any questions for us?", asking "What is a typical day like?" is a wasted opportunity.',
          'You need to uncover the day-to-day engineering reality: Do they write tests? How long does it take for a junior to push their first commit to production? When things break, do they conduct blameless post-mortems or point fingers?'
        ]
      },
      {
        heading: '2. High-Signal Questions for the Engineering Manager',
        content: [
          'The hiring manager controls team staffing, expectations, and promotion criteria. Ask them systemic questions:'
        ],
        table: {
          headers: ['Question to Ask', 'What You Are Really Testing For', 'Green Flag Response'],
          rows: [
            [
              '"What does a successful first 90 days look like for someone joining this role?"',
              'Do they have an actual onboarding curriculum or will you be left stranded?',
              '"Week 1 you push a small fix to prod with your buddy. Month 1 you ship your first scoped feature. Month 2-3 you take sprint tickets independently."'
            ],
            [
              '"How do you allocate sprint time between feature development, tech debt, and test writing?"',
              'Is the team a death-march feature factory that builds fragile software?',
              '"We maintain a dedicated 15-20% capacity in every sprint for refactoring, tooling improvements, and dependency updates."'
            ],
            [
              '"How are onboarding buddies or mentors selected and evaluated?"',
              'Is mentorship rewarded in performance reviews or viewed as an unpaid burden?',
              '"Senior engineers are explicitly evaluated on their mentorship effectiveness and multiplying junior team members."'
            ]
          ]
        }
      },
      {
        heading: '3. High-Signal Questions for Peer Software Engineers',
        content: [
          'When you are in technical rounds with engineers who would be your daily peers, ask questions about practical workflow ergonomics:'
        ],
        codeBlock: {
          language: 'text',
          code: `// Question 1: The PR Review Test
"How does your team handle code reviews? What is the average turnaround time, 
and what happens if two engineers disagree on an architectural approach?"

// Question 2: The Production Incident Test (Crucial!)
"Can you tell me about the last production incident or outage that occurred, 
and how the team conducted the post-mortem?"

// Question 3: The Deployment Pipeline Test
"If I find a small typo on the homepage right now, what is the exact journey 
that fix takes from my local laptop to live production?"`
        },
        callout: {
          type: 'tip',
          title: 'Decoding the Incident Test',
          text: 'If the peer engineer laughs nervously and says: "Oh man, someone pushed bad code and the VP was furious", run away. If they calmly reply: "Our automated rollback caught it, we held a blameless post-mortem on Tuesday, and added a lint rule to prevent it happening again", that is a premier engineering culture.'
        }
      },
      {
        heading: '4. Critical Red Flags to Watch Out For',
        content: [
          'If you notice any of the following patterns during your conversations with team members, proceed with extreme caution:',
          '🚩 **"We don\'t have time for automated tests right now, we move fast."**: This means you will spend 80% of your time manual testing and debugging stressful production regressions.',
          '🚩 **"Only the tech lead reviews all PRs."**: Creates a massive bottleneck where your pull requests will sit blocked for days, destroying your momentum.',
          '🚩 **"You will be the sole developer building our new mobile app."**: For an entry-level engineer with 0–2 YoE, being the solo developer without seniors to guide architecture is a setup for burnout.'
        ]
      }
    ]
  }
];
