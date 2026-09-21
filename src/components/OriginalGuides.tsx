import React from 'react';
import { DollarSign, MapPin, CheckCircle, BookOpen, ShieldAlert, Award, ArrowUpRight, TrendingUp } from 'lucide-react';

export const SalaryGuideView: React.FC = () => {
  const hubs = [
    {
      city: 'San Francisco Bay Area',
      state: 'CA',
      medianNewGrad: '$142,000',
      range: '$120,000 – $170,000',
      costIndex: 'Very High',
      topHiring: 'Stripe, Cloudflare, OpenAI, Figma, Datadog',
      notes: 'Highest starting base compensation, high stock/RSU packages for fresh grads.',
    },
    {
      city: 'New York City',
      state: 'NY',
      medianNewGrad: '$135,000',
      range: '$115,000 – $165,000',
      costIndex: 'Very High',
      topHiring: 'Bloomberg, Datadog, Etsy, Google NYC, Palantir',
      notes: 'Strong FinTech, adtech, and consumer web starting salaries.',
    },
    {
      city: 'Seattle & Bellevue',
      state: 'WA',
      medianNewGrad: '$130,000',
      range: '$110,000 – $155,000',
      costIndex: 'High (0% State Income Tax)',
      topHiring: 'Microsoft, Remitly, Amazon, Tableau, F5',
      notes: 'No state income tax yields higher take-home compensation for new grads.',
    },
    {
      city: 'Austin Tech Hub',
      state: 'TX',
      medianNewGrad: '$118,000',
      range: '$95,000 – $135,000',
      costIndex: 'Moderate (0% State Income Tax)',
      topHiring: 'Atlassian, Dell, Indeed, Oracle, AMD',
      notes: 'Rapidly growing early-career hardware and cloud software engineering scene.',
    },
    {
      city: 'Boston & Cambridge',
      state: 'MA',
      medianNewGrad: '$116,000',
      range: '$95,000 – $132,000',
      costIndex: 'High',
      topHiring: 'HubSpot, Wayfair, DraftKings, Toast',
      notes: 'Thriving robotics, marketing tech, and biotech software development ecosystem.',
    },
    {
      city: 'Remote (US Nationwide)',
      state: 'US',
      medianNewGrad: '$110,000',
      range: '$85,000 – $130,000',
      costIndex: 'Flexible',
      topHiring: 'Automattic, GitLab, Vercel, Supabase, Zapier',
      notes: 'Typically calculated via localized cost-of-living tiers or national flat rates.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Original Industry Research & Insights
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
          2025–2026 Entry-Level Software Engineer Salary Index
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
          Comprehensive compensation benchmarks for fresh university graduates and junior software engineers (0–2 years of experience) across major US tech hubs.
        </p>
      </div>

      {/* Benchmarks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hubs.map((hub, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-indigo-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 font-bold text-slate-900 text-base">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  {hub.city}
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {hub.state}
                </span>
              </div>

              <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Median Starting Base:</div>
                <div className="text-2xl font-extrabold text-emerald-700 mt-0.5">{hub.medianNewGrad}</div>
                <div className="text-xs text-slate-600 mt-1">Typical Range: {hub.range}</div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div>
                  <strong className="text-slate-800">Cost of Living:</strong> {hub.costIndex}
                </div>
                <div>
                  <strong className="text-slate-800">Top Early-Career Employers:</strong> {hub.topHiring}
                </div>
                <p className="pt-2 text-slate-500 italic">{hub.notes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Guide Content for AdSense Quality Assurance */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          How to Pass Entry-Level Technical Resume Screens
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700 leading-relaxed">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Quantified Project Impact
            </h3>
            <p className="text-xs text-slate-600">
              When applying with 0 YoE, replace generic course descriptions with metric-driven accomplishments:
              <em> &ldquo;Built a full-stack real-time collaborative markdown editor in Next.js & WebSockets supporting 50+ concurrent users with &lt;100ms latency.&rdquo;</em>
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Direct ATS Submissions Over InMail
            </h3>
            <p className="text-xs text-slate-600">
              All listings on FreshCommit point directly to official company Greenhouse, Lever, and Ashby ATS portals. Submitting directly through verified early-career ATS pipelines significantly speeds recruiter review compared to 3rd-party aggregators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdSensePolicyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          AdSense Compliance & Transparency
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-3">Google AdSense Policy Center</h1>
        <p className="text-sm text-slate-600 mt-2">
          How FreshCommit upholds Google publisher policies, protects user experience, and enforces strict editorial guidelines.
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            1. Non-Deceptive Ad Placement & Labeling
          </h2>
          <p>
            In accordance with Google AdSense program policies:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
            <li>All advertisement placements are explicitly labeled with <strong>&ldquo;Advertisement&rdquo;</strong>.</li>
            <li>Ad slots maintain generous margins and distinct boundaries, preventing accidental clicks on navigation or application buttons.</li>
            <li>We do not encourage users to click ads, nor do we employ deceptive pop-ups or interstitial screens.</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            2. Anti-Thin Content & Original Value Commitment
          </h2>
          <p>
            Google AdSense enforces strict guidelines against low-value or scraped content. FreshCommit combats thin aggregation by providing:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
            <li>Original salary index research across Silicon Valley, NYC, Seattle, Austin, Boston, and Remote tech centers.</li>
            <li>Strict human and automated relevancy filtering (&le; 2 YoE only), stripping senior/lead clutter.</li>
            <li>Exact unparaphrased job descriptions preserving authentic employer requirements without artificial AI spinning.</li>
            <li>Full Google <code>JobPosting</code> JSON-LD structured data for every listing.</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            3. Privacy Policy & Cookie Disclosures (GDPR / CCPA / DART)
          </h2>
          <p className="text-xs text-slate-600">
            Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to this website or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visit to our sites and/or other sites on the Internet. Users may opt out of personalized advertising by visiting{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 font-semibold underline"
            >
              Google Ads Settings
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export const CareerInsightsView: React.FC = () => {
  const articles = [
    {
      id: 'git-hygiene-day-one',
      tag: 'Engineering Culture',
      readTime: '6 min read',
      title: 'Git Commit & Branch Hygiene: What Senior Engineers Expect on Day One',
      summary: 'Why your commit history tells interviewers and team leads more about your engineering maturity than your LeetCode ranking.',
      highlights: [
        'Atomic commits with imperative mood ("feat: implement retry backoff" vs "fixed bug")',
        'Interactive rebasing to squash experimental commits before requesting PR review',
        'How semantic release and conventional commits drive automated deployment pipelines'
      ]
    },
    {
      id: 'rsu-base-equity-decoded',
      tag: 'Compensation',
      readTime: '8 min read',
      title: 'Decoding New Grad Tech Offers: Base Salary vs. RSUs vs. Sign-On Bonuses',
      summary: 'A mathematical walkthrough of total compensation (TC), 4-year vesting schedules, 1-year cliffs, and tax implications across US hubs.',
      highlights: [
        'Why a $130K base with 10% bonus can beat a volatile $160K TC offer in a bear market',
        'Understanding double-trigger RSUs at pre-IPO startups vs. liquid public RSUs',
        'Negotiation levers available to entry-level engineers without competing offers'
      ]
    },
    {
      id: 'standout-portfolio-architecture',
      tag: 'Portfolio Strategy',
      readTime: '7 min read',
      title: 'Beyond Todo Lists: 4 Production-Grade Projects That Get You Screened',
      summary: 'Hiring managers filter out generic bootcamp clones in seconds. Here are 4 architectures that demonstrate distributed systems, rate limiting, and caching.',
      highlights: [
        'Building an idempotent payment webhook receiver with Redis deduplication',
        'A lightweight event-driven log ingestion daemon with SQLite & backpressure handling',
        'Integrating OpenTelemetry metrics and structured JSON logging into your personal projects'
      ]
    },
    {
      id: 'reverse-interviewing-engineering-teams',
      tag: 'Interview Prep',
      readTime: '5 min read',
      title: 'Reverse-Interviewing Engineering Teams: Questions to Identify Mentorship Culture',
      summary: 'The single highest-risk factor for early-career developers is landing on a team with zero bandwidth for mentorship. Here is how to test for it.',
      highlights: [
        '"How do you structure PR reviews and onboarding buddies for the first 90 days?"',
        '"What was the last production incident caused by a junior engineer, and how did post-mortem handle it?"',
        'Red flags: absence of automated testing, no staging environments, or solo hero engineering'
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          FreshCommit Career Insights
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
          Engineering Career Guides &amp; Practical Field Notes
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
          Original editorial advice on technical resume optimization, compensation structures, git workflows, and mentorship evaluation for 0–2 YoE developers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((art) => (
          <article
            key={art.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  {art.tag}
                </span>
                <span className="text-slate-400 font-medium">{art.readTime}</span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug hover:text-emerald-700 transition-colors">
                {art.title}
              </h2>

              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                {art.summary}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Key Takeaways
                </div>
                {art.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

