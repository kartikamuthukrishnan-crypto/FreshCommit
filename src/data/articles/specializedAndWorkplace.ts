import type { CareerArticle } from '../careerArticles';
import { AUTHOR_ENTITIES } from '../authorEntities';

export const SPECIALIZED_AND_WORKPLACE_ARTICLES: CareerArticle[] = [
  {
    id: 'break-into-entry-level-data-engineering',
    tag: 'Role Roadmaps',
    readTime: '10 min read',
    publishedDate: 'September 2026',
    lastUpdatedDate: 'October 2026',
    author: AUTHOR_ENTITIES['dilli-babu'],
    reviewer: AUTHOR_ENTITIES['akhil-vasu'],
    title: 'How to Break Into Entry-Level Data Engineering in 2026',
    subtitle: 'The modern data engineering blueprint: Master SQL window functions, dimensional modeling, automated ETL orchestration, and cloud warehouses.',
    summary: 'Data engineering has emerged as one of the highest-paying, most resilient engineering disciplines in tech. While entry-level web development is crowded with thousands of bootcamp graduates, data platform teams frequently struggle to find junior talent who understand that data engineering is software engineering applied to data—not just writing basic pandas scripts. This comprehensive roadmap demystifies what data hiring managers actually look for in entry-level data engineers, from dimensional schema design to production Airflow orchestration and data quality testing.',
    highlights: [
      'The foundational stack: Advanced SQL, Python data structures, dimensional modeling (Kimball Star Schema), and Git',
      'The 5 SQL window functions and analytical patterns tested in every technical data screen',
      'Building an end-to-end data pipeline project using dbt, DuckDB/PostgreSQL, and Apache Airflow',
      'Cloud data warehouse fundamentals: BigQuery, Snowflake, and partitioning/clustering strategies'
    ],
    sections: [
      {
        heading: '1. What Entry-Level Data Engineering Actually Entails',
        content: [
          'Many aspiring juniors confuse Data Engineering with Data Science. Data Scientists build machine learning models and statistical experiments. Data Engineers build the reliable, scalable, and automated infrastructure that ingests, cleanses, tests, transforms, and delivers clean data to those models and analytics dashboards.',
          'Your day-to-day work centers on three pillars: data extraction (APIs, CDC logs, files), transformation (SQL, dbt, Spark), and orchestration (Airflow, Dagster, Prefect).'
        ],
        table: {
          headers: ['Domain', 'Essential Junior Competencies', 'Industry Standard Tools', 'What Interviewers Test'],
          rows: [
            ['Querying & Analytics', 'Window functions, CTEs, self-joins, query profiling', 'PostgreSQL, DuckDB, ANSI SQL', 'Complex analytical aggregations & execution plans'],
            ['Transformation & Modeling', 'Star schema, dimensional modeling, slowly changing dimensions (SCD)', 'dbt (data build tool), SQL, Python', 'Fact vs. dimension table design, data normalization'],
            ['Pipeline Orchestration', 'DAG architecture, task dependencies, idempotency, backfilling', 'Apache Airflow, Prefect, Dagster', 'Handling task retries, data pipeline failure alerting'],
            ['Storage & Cloud', 'Columnar storage formats (Parquet), table partitioning, clustering', 'Snowflake, Google BigQuery, AWS Redshift, S3', 'Minimizing query scanning costs and runtime latency']
          ]
        }
      },
      {
        heading: '2. The 5 SQL Analytical Patterns Tested in Every Screen',
        content: [
          'If you cannot write SQL window functions fluently without looking at documentation, you will not pass a technical data interview screen. Master these five specific patterns:',
          '1. `ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)`: Deduplicating records and finding the most recent user action.',
          '2. `LAG()` and `LEAD()`: Calculating period-over-period differences (e.g., days elapsed between user purchases).',
          '3. `RANK()` vs. `DENSE_RANK()`: Handling ties in leaderboard and revenue calculations.',
          '4. Rolling aggregations: `SUM(amount) OVER (PARTITION BY user_id ORDER BY created_at ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)` for 7-day moving averages.',
          '5. Cumulative distributions: `NTILE()` and percentiles for cohort segmentation.'
        ],
        codeBlock: {
          language: 'sql',
          code: `-- Classic Interview Screen: Find the 2nd highest spending customer per region
WITH RankedCustomers AS (
  SELECT
    region_id,
    customer_id,
    SUM(order_total_cents) AS total_spend_cents,
    DENSE_RANK() OVER (
      PARTITION BY region_id 
      ORDER BY SUM(order_total_cents) DESC
    ) AS regional_rank
  FROM orders
  WHERE status = 'COMPLETED'
    AND order_date >= DATEADD('day', -90, CURRENT_DATE())
  GROUP BY region_id, customer_id
)
SELECT region_id, customer_id, total_spend_cents
FROM RankedCustomers
WHERE regional_rank = 2;`,
          caption: 'Clean, CTE-based SQL demonstrating window functions, filtering, and aggregation.'
        }
      },
      {
        heading: '3. The "Holy Grail" Portfolio Project for Data Engineers',
        content: [
          'Never submit a Kaggle Titanic notebook as a data engineering project. Instead, engineer an end-to-end modern data stack (MDS) pipeline:',
          '1. **Ingestion**: A Python script pulling daily weather or public transit data from a REST API, writing raw JSON into an S3 bucket or local directory as a data lake.',
          '2. **Transformation with dbt**: Clean models transforming raw JSON into a dimensional Star Schema (`fct_daily_transit` and `dim_stations`), enforcing unique and not-null schema tests.',
          '3. **Orchestration with Airflow**: A Python DAG that runs daily, triggers extraction, executes dbt runs, verifies tests, and alerts on Slack via webhook on failure.',
          '4. **Documentation**: A published dbt docs catalog demonstrating data lineage from source to analytical view.'
        ],
        callout: {
          type: 'tip',
          title: 'The Production Quality Differentiator',
          text: 'Data quality tests (asserting that primary keys are non-null and foreign keys exist in parent tables) demonstrate that you care about data integrity—the #1 priority of Data Directors.'
        }
      }
    ]
  },
  {
    id: 'entry-level-cybersecurity-soc-vs-pentester',
    tag: 'Role Roadmaps',
    readTime: '9 min read',
    publishedDate: 'September 2026',
    lastUpdatedDate: 'October 2026',
    author: AUTHOR_ENTITIES['akhil-vasu'],
    reviewer: AUTHOR_ENTITIES['dilli-babu'],
    title: 'Breaking Into Entry-Level Cybersecurity: SOC Analyst vs. Junior Pentester Pathways',
    subtitle: 'A realistic evaluation of certifications, virtual lab portfolios, and hiring pipelines for blue team defense versus offensive security.',
    summary: 'Cybersecurity is surrounded by misleading marketing campaigns promising six-figure ethical hacking salaries to beginners after passing a single multiple-choice certification exam. In reality, breaking into information security requires understanding computing systems, operating system internals, and networking before you can defend or exploit them. This guide cuts through the noise to contrast the two primary entry-level security career trajectories: Blue Team (Security Operations Center / SOC Analyst) and Red Team (Junior Penetration Tester), mapping out the realistic certification paths and hands-on lab portfolios that actually win interviews.',
    highlights: [
      'Blue Team (SOC Analyst L1) vs. Red Team (Junior Pentester): Hiring volume, daily reality, and career progression',
      'The certification reality check: CompTIA Security+, BTL1, and PJPT vs. expensive CISSP/CEH traps',
      'Building a verifiable home lab: Active Directory virtualization, pfSense firewalls, and Splunk log ingestion',
      'Converting TryHackMe and HackTheBox write-ups into professional security portfolio proof'
    ],
    sections: [
      {
        heading: '1. SOC Analyst vs. Junior Pentester: The Hiring Volume Reality',
        content: [
          'While pop culture portrays cybersecurity as hoodie-wearing hackers breaking into corporate mainframes, the commercial market hires **10 Blue Team analysts for every 1 Red Team penetration tester**.',
          'Most companies outsource penetration testing to specialized consulting firms once or twice a year, but every enterprise requires a 24/7/365 Security Operations Center (SOC) monitoring alerts, investigating phishing emails, and mitigating endpoint threats.'
        ],
        table: {
          headers: ['Parameter', 'SOC Analyst (Tier 1)', 'Junior Penetration Tester'],
          rows: [
            ['Primary Mission', 'Defensive monitoring, triage, incident containment', 'Offensive vulnerability assessment, exploitation reporting'],
            ['Market Requisition Ratio', '~85% of entry-level security openings', '~15% of entry-level security openings'],
            ['Core Daily Tools', 'Splunk, Elastic, Sentinel, Wireshark, CrowdStrike, Zeek', 'Burp Suite, Nmap, Metasploit, Nessus, BloodHound'],
            ['Top Entry Certifications', 'CompTIA Security+, Blue Team Level 1 (BTL1), CySA+', 'Practical Junior Pentester (PJPT), eJPT, PNPT'],
            ['Typical Entry Salary', '$70,000 – $95,000 base', '$75,000 – $105,000 base']
          ]
        }
      },
      {
        heading: '2. The Certification Hierarchy for Fresh Candidates',
        content: [
          'Do not fall for expensive certifications that cost thousands of dollars. Recruiters look for foundational validation followed by hands-on practical exam credentials:',
          '• **Foundational Baseline**: **CompTIA Security+** (Still the universal gatekeeper requirement for government/defense and enterprise HR filters).',
          '• **Defensive / Blue Team**: **Blue Team Level 1 (BTL1)** or **Security Blue Team Certified Analyst** (24-hour hands-on incident investigation exam).',
          '• **Offensive / Red Team**: **Practical Junior Penetration Tester (PJPT)** by TCM Security (Hands-on Active Directory network penetration test).'
        ],
        callout: {
          type: 'warning',
          title: 'The CEH Trap',
          text: 'Avoid the Certified Ethical Hacker (CEH) certification. It is notoriously expensive ($1,200+) and consists primarily of multiple-choice theory with minimal hands-on practical credibility among modern technical security teams.'
        }
      },
      {
        heading: '3. Building Your Personal Security Home Lab',
        content: [
          'The ultimate differentiator in a security interview is describing your home lab environment. A candidate who built an Active Directory environment with centralized SIEM logging beats a candidate who merely read a textbook every single time:',
          '1. Set up a virtualized network using VirtualBox or Proxmox.',
          '2. Deploy a Windows Server Domain Controller with 2 Windows 10 workstation endpoints.',
          '3. Install the **Splunk Universal Forwarder** or **Elastic Agent** on both endpoints to forward Sysmon security logs to a central server.',
          '4. Execute basic simulated attacks (e.g., Atomic Red Team tests, credential dumping via Mimikatz) and demonstrate how you authored custom detection rules to catch the activity in Splunk.'
        ]
      }
    ]
  },
  {
    id: 'junior-devops-cloud-role-beyond-certifications',
    tag: 'Role Roadmaps',
    readTime: '9 min read',
    publishedDate: 'September 2026',
    lastUpdatedDate: 'October 2026',
    author: AUTHOR_ENTITIES['akhil-vasu'],
    reviewer: AUTHOR_ENTITIES['dilli-babu'],
    title: 'How to Land a Junior Cloud/DevOps Role: What You Need Beyond AWS Certifications',
    subtitle: 'Why AWS Certified Cloud Practitioner won\'t get you hired, and the hands-on Linux, Docker, Terraform, and CI/CD competencies that actually do.',
    summary: 'DevOps and Cloud Infrastructure roles are traditionally considered mid-career transitions rather than entry-level jobs because companies are hesitant to give juniors production root access. However, as cloud complexity explodes, a growing number of forward-thinking engineering organizations are hiring Junior Site Reliability Engineers (SREs) and Platform Engineers. The trap many candidates fall into is collecting superficial cloud certifications (like AWS Cloud Practitioner) without knowing basic Linux command-line diagnostics or how to write an Infrastructure-as-Code module. This roadmap explains how to land a junior cloud role with practical hands-on proof.',
    highlights: [
      'The "Paper Certified" trap: Why multiple-choice cloud certs fail technical DevOps interviews',
      'The 4 Pillars of Junior DevOps: Linux administration, Docker containerization, Terraform IaC, and GitHub Actions CI/CD',
      'A complete Terraform module project establishing a production-grade VPC, ECS cluster, and RDS instance',
      'Site Reliability Engineering (SRE) fundamentals: SLOs, error budgets, and alerting hygiene'
    ],
    sections: [
      {
        heading: '1. The Four Pillars of Junior Platform Competency',
        content: [
          'To be trusted with infrastructure, you must prove competence across four fundamental layers of the modern platform engineering stack:'
        ],
        table: {
          headers: ['Pillar', 'Core Focus Area', 'Must-Know Tools', 'Common Interview Question'],
          rows: [
            ['Linux Administration', 'Process management, file permissions, systemd, bash scripting, network sockets', 'Ubuntu/Debian, Bash, systemctl, netstat, grep, awk', '"How do you find which process is holding port 8080?"'],
            ['Containerization', 'Multi-stage Docker builds, layer caching, non-root users, container networking', 'Docker, Docker Compose, Dockerfile optimization', '"Why should you avoid running containers as the root user?"'],
            ['Infrastructure as Code', 'Declarative state, modular resources, remote state locking', 'Terraform (HCL), AWS / GCP providers', '"What is the purpose of the terraform.tfstate file and DynamoDB locking?"'],
            ['CI/CD Pipelines', 'Automated test runners, security scanning, semantic versioning, artifact deployment', 'GitHub Actions, GitLab CI, ArgoCD', '"How do you implement zero-downtime rolling deployments?"']
          ]
        }
      },
      {
        heading: '2. The Production-Grade Dockerfile Example',
        content: [
          'In a DevOps interview, you will be handed a messy, 1.2GB Dockerfile and asked to optimize it. Show that you understand multi-stage builds and security hardening:'
        ],
        codeBlock: {
          language: 'dockerfile',
          code: `# Stage 1: Build & Dependency Resolution
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline
COPY . .
RUN npm run build && npm prune --production

# Stage 2: Minimal, Hardened Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Security Hardening: Never run as root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy only compiled artifacts and production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]`,
          caption: 'Multi-stage build reducing image size from 1.2GB to 85MB while removing root privileges.'
        }
      },
      {
        heading: '3. Demonstrating Infrastructure as Code (Terraform)',
        content: [
          'Never configure cloud resources via the AWS Web Console. Everything in production is managed through version-controlled Infrastructure as Code.',
          'Build a modular Terraform project on GitHub: provision a secure VPC with public/private subnets, an application load balancer (ALB), and automated HTTPS certificates. Include a clean `terraform.tfvars.example` and state locking via an S3 backend and DynamoDB table.'
        ],
        callout: {
          type: 'tip',
          title: 'The Free Tier Discipline',
          text: 'You do not need to spend money on expensive cloud bills. Design your Terraform configurations to deploy on AWS Free Tier resources (t4g.micro instances) and always include an automated `terraform destroy` cleanup script in your repository.'
        }
      }
    ]
  },
  {
    id: 'stand-out-entry-level-remote-software-engineer',
    tag: 'Workplace Reality',
    readTime: '8 min read',
    publishedDate: 'September 2026',
    lastUpdatedDate: 'October 2026',
    author: AUTHOR_ENTITIES['jishaka-jose'],
    reviewer: AUTHOR_ENTITIES['akhil-vasu'],
    title: 'How to Stand Out as an Entry-Level Remote Engineer',
    subtitle: 'Asynchronous communication habits, high-visibility documentation, and proactive collaboration strategies for thriving in fully distributed engineering teams.',
    summary: 'Starting your software engineering career in a fully remote environment is a double-edged sword. On one hand, you enjoy complete location flexibility and zero commute. On the other hand, you miss out on the natural serendipity of turning your chair around to ask a senior engineer for help, and you run the risk of becoming an invisible avatar on Slack. In distributed companies (GitLab, Automattic, Zapier, Vercel), visibility is not measured by hours spent at your desk—it is measured by written clarity, predictable execution, and proactive communication. This guide reveals how early-career engineers build an exceptional reputation while working remotely.',
    highlights: [
      'The Asynchronous First Rule: How to write Slack and Jira updates that require zero follow-up questions',
      'The "Loom Walkthrough" technique: Demonstrating PR functionality in 90-second video overviews',
      'Weekly 1-on-1 agendas that impress engineering managers and steer your promotion trajectory',
      'Time-zone etiquette and how to prevent isolated remote burnout'
    ],
    sections: [
      {
        heading: '1. In Remote Teams, Your Writing IS Your Professional Persona',
        content: [
          'When teammates cannot see your facial expressions or hear your tone, your written messages represent your entire engineering competence. Vague, single-line messages like *"Hey, the build broke, anyone know why?"* signal helplessness.',
          'Always communicate with structured context: What happened, what did you inspect, what error logs were generated, and what is your proposed hypothesis?'
        ],
        table: {
          headers: ['Communication Channel', 'Weak Remote Habit', 'High-Visibility Professional Remote Habit'],
          rows: [
            ['Slack / Discord', 'Sending "Hey" and waiting for reply before asking question', 'Full question in one message with links, screenshots, and reproduction steps'],
            ['Pull Requests', 'Empty PR description or "fixed styling"', 'Structured template with "What", "Why", "Screenshots/Loom", and "Testing Steps"'],
            ['Standup Updates', 'Generic "worked on ticket 104, continuing today"', 'Specific: "Merged PR #82. Blocked on Stripe API webhook; unblocking via mock server"'],
            ['Sprint Retrospectives', 'Silent participation', 'Constructive technical feedback on build speeds or documentation gaps']
          ]
        }
      },
      {
        heading: '2. The 90-Second Loom Walkthrough for PRs',
        content: [
          'Senior engineers spend hours reviewing code between their own tasks. When they open a Pull Request with 25 modified files, reviewing it feels like a chore.',
          'Record a 90-second video using Loom or screen recording software walking through your PR: show the feature running in localhost, demonstrate how it handles an error state, and highlight the 2–3 key files where the core business logic resides.',
          'This drastically accelerates review turnaround times and makes senior engineers eager to review your code.'
        ],
        callout: {
          type: 'tip',
          title: 'The PR Description Standard',
          text: 'Always include a section titled "Trade-offs & Alternatives Considered" in your PR template. Explaining why you chose one implementation over another proves you think deeply about long-term maintainability.'
        }
      },
      {
        heading: '3. Managing Your Manager Asynchronously',
        content: [
          'Do not wait for your manager to ask what you are doing. Maintain a shared Google Doc or Notion page titled "Weekly Engineering Log":',
          '• **Accomplishments This Week**: PRs merged, tickets closed, documentation written.',
          '• **Priorities for Next Sprint**: The 2 key initiatives you will drive.',
          '• **Risks & Blockers**: Dependencies waiting on external teams.',
          '• **Growth Goals**: Specific technical areas you are actively studying.',
          'Reviewing this document during your bi-weekly 1-on-1s provides indisputable evidence of steady growth when performance review cycles arrive.'
        ]
      }
    ]
  },
  {
    id: 'common-mistakes-new-grad-engineers-avoid',
    tag: 'Workplace Reality',
    readTime: '9 min read',
    publishedDate: 'September 2026',
    lastUpdatedDate: 'October 2026',
    author: AUTHOR_ENTITIES['dilli-babu'],
    reviewer: AUTHOR_ENTITIES['jishaka-jose'],
    title: 'Common Mistakes New Grad Engineers Make in Their First Role (And How to Avoid Them)',
    subtitle: 'From the 45-minute silent struggling rule to premature optimization and ignoring tests: The technical and interpersonal traps that derail early-career engineers.',
    summary: 'The technical skills that get you hired as a software engineer are completely different from the skills that make you successful once you are on the job. In university and coding bootcamps, your code was graded on whether it produced the correct output on your local laptop, usually inside a single repository with zero legacy code. In a commercial enterprise codebase, your code must be read, maintained, debugged, and extended by dozens of engineers over a decade. This guide covers the most frequent pitfalls early-career developers stumble into and the mental models required to navigate your first year like a seasoned pro.',
    highlights: [
      'The 45-Minute Rule: How to stop silent struggling without exhausting senior teammates',
      'Premature Optimization vs. Readable Architecture: Why simple boring code wins in production',
      'The "Chesterton\'s Fence" principle: Why you should never delete legacy code before understanding why it was written',
      'How to take critical code review feedback with professional maturity and zero defensiveness'
    ],
    sections: [
      {
        heading: '1. The Silent Struggling Trap (and the 45-Minute Rule)',
        content: [
          'The single most common reason junior engineers receive poor ratings during their 90-day review is **silent struggling**. You run into an obscure environment variable error or undocumented internal build script, feel embarrassed to ask for help, and spend three entire days reading Stack Overflow in silence.',
          'Engineering managers do not expect you to know everything. What frustrates them is discovering on Thursday that you have been completely blocked since Monday.',
          'Adopt the strict **45-Minute Rule**: When you encounter an obstacle, spend 45 minutes investigating it independently. Document the 3 hypotheses you tested, what error messages appeared, and where the trail ended. If you are still blocked at minute 45, message your designated onboarding buddy with your organized notes.'
        ],
        codeBlock: {
          language: 'plaintext',
          code: `❌ Bad Help Request:
"Hey, the local server won't start. Any ideas?"

✅ High-Signal Help Request (The 45-Minute Format):
"Hey @Alex! I am running into an issue starting the local billing worker.
• Goal: Running 'npm run dev:worker'
• Error: 'ConnectionRefused on 127.0.0.1:6379'
• What I've tried: Verified Docker is running, checked that docker-compose redis container is up, and confirmed PORT 6379 is open via netstat.
• Hypothesis: Seems like the worker might be looking for REDIS_HOST=localhost instead of the docker bridge network.
Do you have 5 minutes to confirm if I need an extra env variable for the local worker? Thanks!"`,
          caption: 'Shows effort, respects senior time, and usually enables the mentor to answer in 1 sentence.'
        }
      },
      {
        heading: '2. Chesterton\'s Fence: The Danger of "Cleaning Up" Legacy Code',
        content: [
          'When you join a new company, you will inevitably look at an internal service and think: *"This code is horrific! Why did they write this nested if-statement instead of an elegant ternary?"*',
          'Resist the urge to refactor unfamiliar code during your first sprint. This violates the famous **Chesterton\'s Fence** principle: *Do not remove a fence until you understand why it was built in the first place.*',
          'That "ugly" nested condition was likely introduced at 3:00 AM two years ago to handle an obscure edge case for your company\'s biggest enterprise customer. Always consult git blame and read historical PR discussions before touching working production code.'
        ],
        callout: {
          type: 'warning',
          title: 'Respect Legacy Architecture',
          text: 'Ugly code that generates $50M in annual revenue and maintains 99.99% uptime is infinitely more valuable to a business than elegant, untested code that breaks in production.'
        }
      },
      {
        heading: '3. Premature Optimization vs. Boring Maintainability',
        content: [
          'Junior developers often try to show off their computer science theoretical chops by writing overly clever code: obscure bitwise operators, complex micro-optimizations, and hyper-abstract design patterns.',
          'In production, **readability is king**. If a fellow engineer cannot understand what your function does within 10 seconds of scanning it during a high-stress production outage, your code is bad—regardless of how mathematically clever it is.',
          'Write boring, explicit code. Use descriptive variable names, write comprehensive unit tests, and optimize only when empirical profiling proves a bottleneck exists.'
        ]
      },
      {
        heading: '4. Decoupling Your Ego from Code Reviews',
        content: [
          'Receiving 18 comments on a Pull Request can feel devastating if you take it personally. Remember: **You are not your code.**',
          'A senior engineer taking the time to write detailed, constructive feedback on your PR is an act of mentorship. They are investing time in your technical development.',
          'Respond to every comment with gratitude or thoughtful questions: *"Thank you for pointing out the memory leak risk! I have refactored this to use a cleanup listener in useEffect. Does this resolve the concern?"*'
        ]
      }
    ]
  }
];
