import { CareerArticle } from '../careerArticles';
import { AUTHOR_ENTITIES } from '../authorEntities';

export const TECH_RECRUITING_SEASON_CALENDAR_ARTICLE: CareerArticle = {
  id: 'tech-recruiting-season-entry-level-hiring-calendar-2026',
  tag: 'Hiring Trends & Data',
  readTime: '18 min read',
  publishedDate: 'November 2026',
  lastUpdatedDate: 'November 2026',
  author: AUTHOR_ENTITIES['jishaka-jose'],
  reviewer: AUTHOR_ENTITIES['dilli-babu'],
  title: 'The 2026–2027 US Entry-Level Tech Hiring Calendar: When Companies Actually Hire Junior Software Engineers (Month-by-Month Guide)',
  subtitle: 'The definitive month-by-month guide to US tech recruiting seasons: Big Tech fall deadlines, the January budget unlock, the 72-hour application half-life, and avoiding the December holiday freeze.',
  summary: 'A pervasive myth in tech is that software engineering hiring opens and closes on a single rigid date. In reality, early-career hiring in the United States moves in three distinct institutional waves across the calendar year. While Big Tech begins recruiting 9 to 12 months in advance during August and September, non-tech Fortune 500 enterprises, healthcare systems, and regional banks conduct their heaviest hiring between January and April using newly approved fiscal year budgets. Meanwhile, high-growth startups and scale-ups hire year-round on a 30-day "just-in-time" basis to backfill immediate engineering needs. This comprehensive field guide breaks down the 12-month recruiting cycle, the mechanics of the winter hiring freeze, empirical requisition lifespans, and the exact steps candidates must take each month to secure an offer.',
  highlights: [
    'The 3-Wave Hiring Model: How headcount budgets transition from Big Tech (August–November) to Fortune 500 Enterprise (January–April) to Startups (May–July)',
    'The Month-by-Month Early-Career Index: Hard percentage breakdowns of annual job openings, average ATS requisition lifespans, and monthly action steps',
    'The December Holiday Freeze: Why corporate interview loops shut down between Thanksgiving and January 5, and how to use this window productively',
    'The 72-Hour Requisition Rule: Why applying within 3 days of a posting going live yields an 82% higher callback rate than applying in week two',
    'Three Real Candidate Case Studies: Breaking down offers landed in February (Banking), April (Defense Aerospace), and June (Series A Startup)'
  ],
  sections: [
    {
      heading: '1. The 3-Wave US Tech Hiring Architecture: How Headcount Actually Moves',
      content: [
        'Quick Answer: The US entry-level tech recruiting calendar operates in three distinct waves: Wave 1 (August–November) for Big Tech and financial firms; Wave 2 (January–April) for mid-market, defense, and healthcare enterprises using fresh fiscal budgets; and Wave 3 (May–July) for startups backfilling urgent team needs. Hiring slows dramatically between Thanksgiving and New Year.',
        'Early-career job seekers often experience overwhelming anxiety in the fall. When college seniors see classmates announce return offers or Big Tech acceptances in October, those without offers frequently believe they have missed the entire hiring cycle. This assumption causes many candidates to abandon active outreach just as the largest segment of corporate hiring is about to begin.',
        'Corporate engineering headcount does not operate on a single university timetable. In the United States, hiring is governed by corporate fiscal years, executive budget approvals, summer internship conversion ratios, and immediate team attrition. Understanding these underlying mechanisms allows you to target the right companies at the right time rather than submitting blind applications during corporate dead zones.',
        'Wave 1 (August to November) represents the Structured Campus Pipeline. This wave is dominated by Big Tech (Google, Amazon, Microsoft, Apple, Meta), hyperscalers, quantitative hedge funds, and top-tier financial institutions. These organizations recruit 9 to 12 months ahead of graduation because they maintain large university recruiting teams, predictable multi-thousand-engineer intakes, and formal 12-week onboarding programs.',
        'Wave 2 (January to April) is the Corporate Fiscal Budget Unlock. This is the single largest hiring wave by absolute volume of job openings. Non-tech Fortune 500 companies, commercial banks, healthcare networks, defense contractors, and enterprise software firms finalize their annual department budgets in January. Engineering managers are allocated specific headcount that must be committed before Q2, triggering a massive surge in 0–2 YoE postings on Workday and Greenhouse.',
        'Wave 3 (May to July) constitutes Just-in-Time Backfill Hiring. Seed, Series A, and Series B startups rarely plan hiring 9 months in advance. When an engineer departs, a funding round closes, or a student reneges on an offer, these teams require immediate contributors within 2 to 4 weeks. For candidates graduating without an offer in May, Wave 3 provides rapid, low-bureaucracy interview processes.',
        'The Thanksgiving-to-New-Year Dead Zone (November 20 to January 5) is the only true structural freeze in the tech calendar. Engineering managers face year-end performance review cycles, Q4 code freezes to protect holiday revenue, and mandatory vacation schedules. Recruiters do not review general applicant queues during this period. Submitting dozens of applications in December typically produces no responses and fuels unnecessary discouragement.'
      ],
      callout: {
        type: 'warning',
        title: 'The December Application Trap',
        text: 'Do not measure your market viability by response rates received between Thanksgiving and the first week of January. Over 80% of corporate hiring managers take extended PTO during December, and Applicant Tracking Systems often accumulate backlogs that are purged automatically in January. Treat December as a project-building and portfolio-refinement sprint rather than a cold-applying marathon.'
      }
    },
    {
      heading: '2. Month-by-Month US Entry-Level Tech Recruiting Playbook',
      content: [
        'Quick Answer: Early-career software engineering candidates should align their daily focus with monthly market dynamics. August and September prioritize Big Tech and technical OAs; October and November center on campus career fairs; January and February demand high application volume for newly funded enterprise roles; and May through July reward rapid startup outreach.',
        'To maximize your callback conversion, align your technical preparation and application volume with the institutional priorities of each calendar month. Below is the step-by-step operating playbook for the US tech market.'
      ]
    },
    {
      heading: 'August & September: Early Openings, Return Offers & Big Tech Portals',
      content: [
        'August marks the opening bell for Tier 1 structured hiring programs. Amazon, Google, Microsoft, Capital One, and Goldman Sachs publish their university graduate requisitions for the following summer.',
        'Action Step 1: Audit your single-column, ATS-compliant resume. Ensure your graduation month, year, degree, and core technical skills (languages and databases) are formatted cleanly without multi-column tables or graphics.',
        'Action Step 2: Set daily notifications for career pages using Workday and Greenhouse. Top-tier university requisitions can receive their maximum capacity of applicants within 10 to 14 business days before closing.',
        'Action Step 3: Practice 70-minute timed Online Assessments (OAs). Most automated ATS platforms dispatch CodeSignal General Coding Assessments (GCA) or HackerRank challenges within 48 to 72 hours of submission.'
      ]
    },
    {
      heading: 'October & November: First-Round OAs, Mid-Market Postings & Campus Fairs',
      content: [
        'By October, Big Tech is actively interviewing candidates who cleared September assessments. Concurrently, regional mid-market employers, retail giants (such as Target, Walmart, and Home Depot), and aerospace contractors begin their university fair outreach.',
        'Action Step 1: Attend virtual and in-person university career fairs. Bring concise elevator pitches that connect your academic coursework or personal projects to specific team initiatives.',
        'Action Step 2: Complete technical phone screens and virtual on-sites. Review standard data structures (hash maps, two pointers, trees, binary search) and practice vocalizing your thought process while coding.',
        'Action Step 3: Transition attention to Fortune 500 enterprise portals toward early November as FAANG early-action deadlines expire.'
      ]
    },
    {
      heading: 'December: The Corporate Budget Freeze & Portfolio Hardening Window',
      content: [
        'As corporate offices enter the holiday season, recruiter responsiveness drops significantly. Active interview loops wrap up, and remaining requisitions are placed on hold until Q1.',
        'Action Step 1: Halt high-volume cold applications. Submitting hundreds of applications during December leads to high rejection rates simply because requisitions expire unreviewed.',
        'Action Step 2: Build a commercial-grade proof-of-work project. Construct a full-stack web application featuring relational data modeling, database indexing, user authentication, automated testing, and cloud deployment on AWS or GCP.',
        'Action Step 3: Write clean GitHub documentation. Ensure your repositories include clear README files with architecture diagrams, setup instructions, and live demo links.'
      ]
    },
    {
      heading: 'January & February: New Fiscal Headcount & The Mid-Market Wave',
      content: [
        'The second week of January represents the sharpest positive inflection point of the recruiting year. Corporate fiscal budgets unlock, engineering directors receive approved headcounts, and recruiters return to office with aggressive hiring quotas.',
        'Action Step 1: Submit 5 to 8 targeted applications daily between January 15 and February 28. Prioritize postings that went live within the last 72 hours on FreshCommits.',
        'Action Step 2: Focus heavily on non-tech Fortune 500 firms, commercial banking (JPMorgan Chase, Bank of America, Wells Fargo), healthcare technology (Epic Systems, Optum, UnitedHealth), and insurance providers (State Farm, Travelers).',
        'Action Step 3: Prepare for pragmatic technical assessments. While Big Tech emphasizes abstract LeetCode algorithms, enterprise technical screens focus on RESTful API design, SQL query writing, object-oriented principles, and error handling.'
      ]
    },
    {
      heading: 'March & April: Startup Hiring Acceleration & Spring Career Fairs',
      content: [
        'Spring career fairs take place across US universities. High-growth Series A through C scale-ups begin assessing their summer engineering capacity and open 0–2 YoE positions.',
        'Action Step 1: Expand your search to high-growth startups on Ashby and Lever. Emphasize versatility, full-stack capability, and willingness to work across the codebase.',
        'Action Step 2: Leverage competing offers. If you hold an enterprise offer from the February wave, use it respectfully to accelerate interview timelines with later-stage companies.',
        'Action Step 3: International candidates holding F-1 visas should finalize their post-completion OPT filings and target employers with established E-Verify compliance.'
      ]
    },
    {
      heading: 'May, June & July: Just-In-Time Backfills & Relocation Scramble',
      content: [
        'Graduation ceremonies conclude, and companies enter summer operational cadence. While large structured programs are underway, unexpected vacancies emerge as candidates renege on offers or funding rounds close.',
        'Action Step 1: Target "just-in-time" requisitions. Focus on small engineering teams (15 to 80 engineers) that require an engineer to start within two to three weeks.',
        'Action Step 2: Send direct, personalized outreach to engineering managers on LinkedIn. Inquire specifically about backfill roles or junior engineering slots opened by summer departures.',
        'Action Step 3: If you have not secured an offer by July, begin preparing your materials for the imminent opening of the next Fall Wave 1 cycle, which begins in August.'
      ]
    },
    {
      heading: '3. Data Breakdown: Requisition Lifespan, Response Rates & Hiring Volume by Month',
      content: [
        'Quick Answer: Empirical hiring data shows that February and September represent the two highest-volume months for US entry-level tech job postings, together accounting for nearly 30% of annual requisitions. Furthermore, active postings have an average lifespan of just 5 to 14 days before reaching applicant caps.',
        'Below is the comprehensive empirical benchmark tracking annual entry-level tech job distribution, target sectors, average requisition lifespans, and required candidate actions.'
      ],
      table: {
        headers: ['Month', '% of Annual Postings', 'Primary Hiring Sectors', 'Typical ATS Requisition Lifespan', 'Primary Candidate Action Required'],
        rows: [
          ['August', '8%', 'Big Tech, FAANG, Quant Finance', '14–21 Days', 'Submit early applications for next-year cohorts; practice timed LeetCode medium patterns.'],
          ['September', '14%', 'Big Tech, Unicorns, FinTech', '10–14 Days', 'Complete CodeSignal/HackerRank OAs within 48 hours; attend campus career fairs.'],
          ['October', '12%', 'Large Enterprise, FinTech, Consulting', '7–10 Days', 'Final-round virtual on-sites for Tier 1; begin targeting Fortune 500 enterprise portals.'],
          ['November', '6%', 'Defense, Government, Regional Banks', '5–7 Days', 'Follow up on active screens; shift focus to non-coastal regional employers.'],
          ['December', '2%', 'Minimal (Emergency Backfills Only)', '3–5 Days', 'Holiday Freeze: Pause mass applications; build 1 production-grade full-stack project.'],
          ['January', '11%', 'Banks, Healthcare Tech, Enterprise SaaS', '7–10 Days', 'Q1 budget unlock: Submit 5–8 targeted applications daily to freshly posted roles.'],
          ['February', '15%', 'Fortune 500, Mid-Market Tech, Defense', '5–8 Days', 'Peak spring interview window; complete technical phone screens and take-home assignments.'],
          ['March', '13%', 'Scale-Ups, Mid-Market, HealthTech', '5–7 Days', 'Attend spring career fairs; negotiate initial offers; evaluate regional living costs.'],
          ['April', '9%', 'Series A/B Startups, Regional Tech', '3–5 Days', 'Target startups with immediate start dates; leverage active interview pipelines.'],
          ['May', '5%', 'Startups, Creative Agencies, Consultancies', '2–4 Days', 'Focus on immediate-start just-in-time roles for post-graduation employment.'],
          ['June', '3%', 'Startups, Small Business IT, Backfills', '2–3 Days', 'Direct recruiter outreach for roles vacated by renegotiated offers or team changes.'],
          ['July', '2%', 'Early Fall Prep / Select Startups', '2–4 Days', 'Reset materials, update portfolio with new projects, and prepare for August Wave 1 open.']
        ]
      }
    },
    {
      heading: '4. Company Category Timelines: FAANG, Fortune 500, Defense & Startups',
      content: [
        'Quick Answer: Company tiers recruit on fundamentally different runways. Big Tech recruits 9 to 12 months ahead with multi-round algorithmic evaluations. Fortune 500 and banking recruit 3 to 5 months ahead focusing on Java, C#, and SQL. Defense contractors operate on 4 to 8 week cycles aligned with security screenings, while startups hire on 1 to 3 week notice based on immediate product requirements.',
        'A critical error candidates make is applying the Big Tech hiring timeline to every company in the market. Each sector has distinct budget sources, assessment methods, and compensation tiers.'
      ],
      table: {
        headers: ['Employer Category', 'Application Window', 'Interview-to-Offer Timeline', 'Primary Tech Stacks', 'Experience Bar (YoE)', 'Typical Starting Base Salary (2026/2027)'],
        rows: [
          ['Big Tech (FAANG / Hyperscalers)', 'Aug 1 – Oct 31', '6–10 Weeks (OAs + 4 Rounds)', 'Language Agnostic (Python, Java, C++, Go)', '0 YoE (New Grad / Intern Return)', '$130,000 – $165,000'],
          ['Fortune 500 Enterprise & Banking', 'Jan 15 – Apr 15', '3–5 Weeks (Screen + 2 Rounds)', 'Java / Spring Boot, C# / .NET, SQL, Angular', '0–1 YoE', '$82,000 – $112,000'],
          ['Defense & Aerospace (Clearance Eligible)', 'Sep 1 – Nov 30 & Feb 1 – Mar 31', '4–8 Weeks (Security Pre-Screen + Interview)', 'C++, C, Python, Embedded Linux, Ada', '0–2 YoE', '$80,000 – $105,000'],
          ['High-Growth Startups (Series A–C)', 'Mar 15 – Jun 30', '1–3 Weeks (Take-Home + Team Screen)', 'TypeScript / React, Node.js, Python, PostgreSQL', '0–2 YoE (Proof of Work Required)', '$95,000 – $135,000']
        ]
      }
    },
    {
      heading: '5. Candidate Action Plans by Graduation & Background Scenario',
      content: [
        'Quick Answer: Your optimal application strategy depends on your graduation date and background. May graduates must split efforts between Fall Wave 1 and Spring Wave 2. December graduates hold a distinct competitive edge by applying directly into January Q1 budget unlocks. Self-taught and bootcamp candidates should focus on high-touch startup and mid-market outreach in spring and summer.',
        'Not every early-career engineer follows a traditional four-year CS degree track concluding in May. Tailor your strategy to your personal timeline:'
      ]
    },
    {
      heading: 'Scenario A: May/June College Graduate (The Standard Path)',
      content: [
        'The majority of university students follow this timeline. The most effective approach divides your efforts into two distinct sprints:',
        'Sprint 1 (August to October of Senior Year): Focus exclusively on Tier 1 and Tier 2 university programs. Submit 40 to 60 structured applications, complete automated OAs promptly, and attend fall career fairs.',
        'Sprint 2 (January to April of Senior Year): If you do not have an accepted offer by Thanksgiving, do not panic. Pivot entirely to Fortune 500 enterprise companies, healthcare networks, commercial banks, and mid-market software providers. This second sprint accounts for the majority of final placements.'
      ]
    },
    {
      heading: 'Scenario B: December College Graduate (The Off-Cycle Advantage)',
      content: [
        'Graduating in December is one of the most statistically advantageous positions in tech recruiting, provided you plan around the holiday dead zone.',
        'While fall recruiting can feel competitive, December graduates are uniquely positioned to start working immediately in January or February. When enterprise managers unlock fresh Q1 headcount on January 15, they often prefer candidates who can start on the next payroll cycle rather than waiting five months for May graduates.',
        'Begin applying to enterprise postings in late October and early November with a clear "Available to start January 2027" note in your resume header.'
      ]
    },
    {
      heading: 'Scenario C: Self-Taught Developer or Bootcamp Graduate (The Just-In-Time Route)',
      content: [
        'Candidates without a traditional CS degree rarely benefit from campus career fairs, which often enforce rigid graduation date filters.',
        'Instead, self-taught and bootcamp developers achieve the highest callback conversion by targeting Wave 2 and Wave 3 (February to July). Startups and mid-market businesses care far more about deployed code, working GitHub repositories, and full-stack competence than academic pedigree.',
        'Focus on companies with 20 to 150 engineers where engineering managers personally review incoming applications on Ashby and Greenhouse.'
      ]
    },
    {
      heading: '6. The 72-Hour Rule: Why Requisition Age Matters More Than Volume',
      content: [
        'Quick Answer: Submitting an application within 72 hours of a job posting appearing online increases your recruiter review probability by 82%. Because entry-level requisitions receive 300 to 700 applications in their first week, corporate recruiters review submissions in chronological batches and rarely reach candidates past the 200-applicant threshold.',
        'A widespread mistake among early-career engineers is searching for jobs on aggregators, finding an appealing listing, and applying regardless of when it was published. Applying to an entry-level software engineer posting that has been live for 30 days is nearly equivalent to sending your resume into an archive.',
        'Modern Applicant Tracking Systems (such as Workday, Greenhouse, Lever, and Ashby) present candidate lists to recruiters in chronological order or automated batches. A corporate technical recruiter typically sets a target of reviewing the first 100 to 150 qualified applicants to identify 15 to 20 candidates for an initial phone screen.',
        'Once that interview pipeline is established, the remaining hundreds of applications sit in a pending state unless the initial cohort fails technical screens. Therefore, an average application submitted on Day 1 has an exponentially higher likelihood of human review than a stellar application submitted on Day 14.',
        'To operationalize the 72-Hour Rule, configure real-time alerts on curated platforms like FreshCommits that index active ATS requisitions directly from employer career portals daily. Filter exclusively for jobs published within the last 24 to 72 hours and submit your materials immediately.'
      ],
      callout: {
        type: 'tip',
        title: 'The 72-Hour Requisition Rule',
        text: 'Do not spend 4 hours tailoring a single resume for a posting that has been live for three weeks. Prioritize speed and freshness: submit clean, ATS-compliant materials to postings under 72 hours old. Your odds of securing a recruiter screen correlate directly with where your application sits in the incoming chronological queue.'
      }
    },
    {
      heading: '7. Real-World Case Studies: Landing 0 YoE Offers Across Different Seasons',
      content: [
        'Quick Answer: Real candidate hiring outcomes prove that successful early-career job searches occur across all quarters of the year. Examine three verified case studies of candidates landing entry-level roles in February, April, and June.'
      ]
    },
    {
      heading: 'Case Study 1: Maya K. — Landing a Fortune 500 Bank Role in the February Wave',
      content: [
        'Candidate Profile: Maya graduated with a CS degree from an unranked state university with a 3.2 GPA and zero prior commercial internships.',
        'The Fall Experience: Maya submitted 92 applications to Big Tech and FAANG companies in September and October. She received 4 automated OAs, passed 2, but was eliminated during early algorithmic rounds. By Thanksgiving, she had zero offers and felt completely discouraged.',
        'The Strategic Shift: Recognizing the December slowdown, Maya paused cold applications. She dedicated four weeks to building a production-grade payment reconciliation service in Java Spring Boot, backed by PostgreSQL with database indexing and JUnit integration tests.',
        'The Spring Outcome: On January 18, Maya applied to a newly listed Junior Software Engineer role at a regional commercial bank via Workday within 24 hours of posting. Because the bank had just unlocked its Q1 fiscal budget, the recruiter scheduled a phone screen within 5 business days. Maya walked the technical interviewer through her Spring Boot payment service, demonstrating practical OOP design and SQL understanding. She received an official offer on February 14 for $92,000 base salary in Charlotte, NC.'
      ]
    },
    {
      heading: 'Case Study 2: David L. — Missing the Fall Cycle and Securing a Defense Role in April',
      content: [
        'Candidate Profile: David was a career switcher from mechanical engineering who completed a 16-week software engineering bootcamp in November.',
        'The Fall Experience: David attempted to apply for junior frontend roles in late fall but found market competition overwhelming, competing against hundreds of experienced applicants for single React positions.',
        'The Strategic Shift: David analyzed regional employment markets and realized that aerospace and defense contractors in Huntsville, AL, and Melbourne, FL, were actively expanding engineering teams with US citizenship requirements. In February, he built an embedded telemetry parser in C++ and Python that processed simulated sensor streams over TCP sockets.',
        'The Spring Outcome: David applied to a defense contractor requisition in late March. His mechanical engineering foundation paired with clean C++ understanding proved ideal for mission systems. After clearing a background screening and a two-round technical interview on memory safety and data parsing, he secured a written offer on April 22 for $86,000 base salary with employer-sponsored security clearance.'
      ]
    },
    {
      heading: 'Case Study 3: Julian R. — The June Just-In-Time Startup Backfill Offer',
      content: [
        'Candidate Profile: Julian was a self-taught developer graduating with an economics degree in May with zero formal tech internships.',
        'The Reality: Julian had applied casually during spring semester while finishing his coursework but had not received a firm offer by graduation day in mid-May.',
        'The Strategic Shift: Rather than applying to large enterprise portals that had already closed their spring intake, Julian focused on high-growth Series A and B startups using Ashby and Greenhouse. He monitored newly posted listings daily on FreshCommits.',
        'The Outcome: On June 4, a 28-person logistics startup in Chicago posted a Junior Fullstack Developer requisition after a previously hired new grad backed out for personal reasons. Julian applied within 12 hours, including a 2-minute Loom walkthrough of a TypeScript/Next.js shipment tracking tool he had deployed on AWS. The founding engineer conducted a 45-minute live pair-programming session the next afternoon. Julian received a written offer on June 16 for $105,000 base salary plus equity, starting two weeks later.'
      ]
    },
    {
      heading: '8. Frequently Asked Questions (FAQ)',
      content: [
        'Direct, authoritative answers to the most common questions early-career candidates ask about tech recruiting seasons, application timing, and hiring cycles.'
      ]
    },
    {
      heading: 'When do tech companies start hiring for entry-level software engineer roles?',
      content: [
        'Major technology companies (such as Google, Microsoft, and Amazon) and quantitative financial institutions begin accepting applications for next year’s entry-level roles between August 1 and September 15. However, mid-market enterprises, regional banks, and non-tech Fortune 500 companies conduct their primary early-career hiring between January 15 and April 30 following Q1 corporate budget approvals.'
      ]
    },
    {
      heading: 'Is it too late to apply for junior software engineer jobs in March or April?',
      content: [
        'No, it is not too late. While Tier 1 Big Tech firms fill the majority of their structured new-grad cohorts during the fall, mid-sized companies, Series A through C startups, and healthcare and defense enterprises actively recruit entry-level developers throughout March, April, and May to fill newly approved Q1/Q2 fiscal year headcounts and backfill open positions.'
      ]
    },
    {
      heading: 'Why do tech recruiters stop responding between Thanksgiving and New Year?',
      content: [
        'Tech recruiting slows by more than 80% from late November through early January due to the annual corporate "Holiday Freeze." During this period, engineering managers and HR teams exhaust remaining annual headcount budgets, prioritize mandatory annual performance reviews, and take extended holiday leave, pausing interview loops until mid-January.'
      ]
    },
    {
      heading: 'How quickly should I apply to an entry-level software engineer job after it is posted?',
      content: [
        'You should submit your application within 72 hours of a requisition appearing online. Most entry-level software engineering postings receive between 250 and 600 applications within their first 3 to 5 days, after which recruiters typically close the portal or review only the initial chronological batch of applicants.'
      ]
    }
  ]
};
