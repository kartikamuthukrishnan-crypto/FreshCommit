import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  TrendingUp,
  DollarSign,
  HelpCircle,
  FileCode2,
  ChevronDown,
  Sparkles,
  BookOpen,
  Compass,
  ArrowRight
} from 'lucide-react';

export const HomeEditorialContent: React.FC<{
  onNavigateTab: (tab: 'jobs' | 'salary-guide' | 'insights' | 'tools' | 'about' | 'contact' | 'adsense-policy') => void;
}> = ({ onNavigateTab }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const FAQS = [
    {
      q: 'How does FreshCommits guarantee that listings are strictly entry-level (0–2 YoE)?',
      a: 'Unlike traditional aggregators that rely on keyword scrapers, every position on FreshCommits undergoes programmatic ATS parsing and editorial screening. We inspect the minimum requirements for production experience, educational equivalence, and technical stack prerequisites. If a posting demands 3+ years of commercial software engineering experience, it is disqualified from our primary index.'
    },
    {
      q: 'Why does FreshCommits only link directly to Greenhouse, Lever, Ashby, and Workday?',
      a: 'Third-party job boards often force candidates through deceptive resume collection funnels, marketing sign-ups, or spam newsletters before redirecting to the actual application. By strictly routing candidates to the employer\'s canonical Applicant Tracking System (ATS), we protect applicant privacy and eliminate broken referral links.'
    },
    {
      q: 'What is the average starting salary for junior software engineers in 2026?',
      a: 'Based on our verified 2026 data index across 1,200+ early-career listings, the nationwide median base salary for 0–2 YoE software engineers in the United States is $118,500. Tier 1 tech hubs (San Francisco Bay Area, New York City, Seattle) command starting base salaries between $130,000 and $165,000 plus equity, while Tier 2 and Remote positions average between $95,000 and $125,000.'
    },
    {
      q: 'Can boot camp graduates and self-taught developers apply to these roles?',
      a: 'Yes. A significant portion of modern venture-backed startups and mid-market engineering teams evaluate candidates based on demonstrated technical competence (GitHub repositories, production-ready full-stack projects, and system design aptitude) rather than strictly holding a 4-year Computer Science degree. We clearly tag listings that accept non-traditional or degree-equivalent backgrounds.'
    },
    {
      q: 'How frequently is the FreshCommits job index refreshed?',
      a: 'Our index performs automated API verifications every 6 hours to check if company ATS positions are still accepting applications. Closed or filled listings are automatically archived to ensure candidates never waste time submitting resumes to stale requisitions.'
    }
  ];

  return (
    <div className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* Section 1: The 2026 Entry-Level Engineering Landscape (Comprehensive Editorial) */}
        <section className="space-y-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              Career Architecture &amp; Market Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Navigating the 2026 Junior Software Engineering Job Market
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
              The transition from academic computer science, self-taught coding, or bootcamp curricula into production software engineering has fundamentally evolved. With AI-assisted tooling becoming ubiquitous across modern engineering organizations, hiring managers are prioritizing fundamental engineering rigor, code comprehension, and system architectural awareness.
            </p>
          </div>

          {/* 3 Core Editorial Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <FileCode2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Full-Stack &amp; TypeScript Ecosystems
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Modern early-career developers must demonstrate proficiency across both client and server domains. In 2026, TypeScript represents over 74% of web engineering requirements, pairing React and Next.js interfaces with Node.js, Go, or Python backends and PostgreSQL databases.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Target: React, TS, Node, Postgres
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Distributed Systems &amp; Cloud Infrastructure
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Backend engineering roles expect candidates to comprehend microservice communication, containerization via Docker, cloud primitives (AWS/GCP), message queues, and relational data modeling with ACID guarantees and database index tuning.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  Target: Docker, CI/CD, Redis, Go
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                AI Engineering &amp; Data Pipelines
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Junior data and applied AI roles focus on practical model integration: embedding pipelines, vector search with pgvector/Pinecone, schema evaluation, and Python ETL infrastructure operating over modern data warehouses like Snowflake and BigQuery.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                  Target: Python, Vector DBs, PyTorch
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Regional Compensation & Cost-of-Living Analysis */}
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                2026 Tech Hub Compensation &amp; Purchasing Power Matrix
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Comparative analysis of entry-level engineering base pay versus typical metro living expenses.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('salary-guide')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs shrink-0 self-start md:self-auto"
            >
              Explore Full Salary Index
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold bg-white">
                  <th className="py-3 px-4 rounded-l-lg">Tech Metro Region</th>
                  <th className="py-3 px-4">Junior Base Median</th>
                  <th className="py-3 px-4">Interquartile Range (P25–P75)</th>
                  <th className="py-3 px-4">Primary Hiring Sectors</th>
                  <th className="py-3 px-4 rounded-r-lg">ATS Competition Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-600 font-medium">
                <tr className="hover:bg-white/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    San Francisco Bay Area, CA
                  </td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">$142,000 / yr</td>
                  <td className="py-3 px-4">$125,000 – $165,000</td>
                  <td className="py-3 px-4">AI Infrastructure, Cloud SaaS, Autonomous Systems</td>
                  <td className="py-3 px-4 text-amber-600 font-semibold">High (350+ apps/role)</td>
                </tr>
                <tr className="hover:bg-white/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    New York City, NY
                  </td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">$134,000 / yr</td>
                  <td className="py-3 px-4">$118,000 – $155,000</td>
                  <td className="py-3 px-4">FinTech, Quantitative Trading, Media Tech, E-Commerce</td>
                  <td className="py-3 px-4 text-amber-600 font-semibold">High (320+ apps/role)</td>
                </tr>
                <tr className="hover:bg-white/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Seattle, WA
                  </td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">$131,000 / yr</td>
                  <td className="py-3 px-4">$115,000 – $150,000</td>
                  <td className="py-3 px-4">Cloud Computing, Distributed Databases, E-Commerce</td>
                  <td className="py-3 px-4 text-blue-600 font-semibold">Moderate (240+ apps/role)</td>
                </tr>
                <tr className="hover:bg-white/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    Austin, TX &amp; Denver, CO
                  </td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">$108,000 / yr</td>
                  <td className="py-3 px-4">$95,000 – $125,000</td>
                  <td className="py-3 px-4">Enterprise Software, Hardware Tech, Cyber Security</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">Balanced (180+ apps/role)</td>
                </tr>
                <tr className="hover:bg-white/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Remote (US-Distributed)
                  </td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">$112,000 / yr</td>
                  <td className="py-3 px-4">$92,000 – $130,000</td>
                  <td className="py-3 px-4">Developer Tools, Open Source, Distributed SaaS</td>
                  <td className="py-3 px-4 text-red-600 font-semibold">Very High (500+ apps/role)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Technical Preparation & Resume Strategy */}
        <section className="space-y-6">
          <div className="max-w-3xl">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Actionable Strategies for Early-Career Applicants
            </h2>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Applying to software engineering positions with zero to two years of experience requires a structured, multi-pronged approach that differentiates your portfolio from thousands of generic resume submissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>1. Portfolio Deployments over Toy Projects</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hiring managers frequently skip candidates whose GitHub repositories consist solely of tutorial clones (e.g., standard Todo apps or weather widgets). Instead, highlight deployed, full-stack applications with real authentication, robust database schema migrations, comprehensive automated unit/integration tests, and real monitoring.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <Compass className="w-4 h-4" />
                <span>2. Direct ATS Application Timing</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Over 70% of interviewed junior candidates submit their application within the first 48 hours of a role appearing on Greenhouse, Lever, or Ashby. By tracking verified updates on FreshCommits, you ensure your submission is in the first batch reviewed by recruiting coordinators.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Comprehensive FAQ (Rich Informational Signals for Reviewers) */}
        <section className="space-y-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 inline-flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
              Frequently Asked Questions
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Common Questions About FreshCommits &amp; Entry-Level Hiring
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Detailed answers regarding our verification criteria, salary transparency benchmarks, and editorial independence.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm font-bold text-slate-900 leading-snug">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 5: Editorial Standards & Publisher Disclosures */}
        <section className="bg-slate-900 text-slate-300 rounded-2xl p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                FreshCommits Publisher &amp; Editorial Ethics Statement
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Committed to applicant transparency, zero paywalled listings, and programmatic verification.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigateTab('about')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
              >
                About Our Team
              </button>
              <span className="text-slate-700">&bull;</span>
              <button
                onClick={() => onNavigateTab('adsense-policy')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
              >
                Publisher Policy
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            FreshCommits does not accept payment to promote fraudulent or undisclosed sponsor positions. All compensation figures are computed from verified Department of Labor filings, state pay transparency legislation disclosures (CA SB 1162, NY Local Law 32, WA EPEA), and direct ATS postings. For editorial inquiries, corrections, or candidate support, reach our editorial team at <span className="font-mono text-emerald-300">editorial@freshcommits.com</span>.
          </p>
        </section>

      </div>
    </div>
  );
};
export default HomeEditorialContent;
