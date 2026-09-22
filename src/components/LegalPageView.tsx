import React, { useState, useEffect } from 'react';
import { Shield, FileText, Scale, AlertCircle, CheckCircle2, Lock, Eye, ArrowLeft } from 'lucide-react';

export interface LegalPageViewProps {
  initialSection?: 'terms' | 'privacy' | 'disclaimer' | 'cookie-policy';
  onNavigateTab: (tab: 'jobs' | 'salary-guide' | 'insights' | 'tools' | 'about' | 'contact') => void;
}

export const LegalPageView: React.FC<LegalPageViewProps> = ({ initialSection = 'terms', onNavigateTab }) => {
  const [activeSection, setActiveSection] = useState<'terms' | 'privacy' | 'disclaimer' | 'cookie-policy'>(initialSection);

  useEffect(() => {
    setActiveSection(initialSection);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialSection]);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              Legal, Compliance &amp; Regulatory Disclosures
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Terms of Service &amp; Legal Disclosures
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Last Updated: September 2026 &bull; Compliant with Google AdSense Publisher Policies, GDPR, and CCPA
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('jobs')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0 self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Jobs
        </button>
      </div>

      {/* Navigation Pills for Sections */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 max-w-fit">
        <button
          id="tab-terms-of-service"
          onClick={() => setActiveSection('terms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSection === 'terms'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          Terms of Service (TOS)
        </button>

        <button
          id="tab-privacy-policy"
          onClick={() => setActiveSection('privacy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSection === 'privacy'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-blue-600" />
          Privacy Policy
        </button>

        <button
          id="tab-disclaimer"
          onClick={() => setActiveSection('disclaimer')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSection === 'disclaimer'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          Disclaimer &amp; Disclosures
        </button>

        <button
          id="tab-cookie-policy"
          onClick={() => setActiveSection('cookie-policy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSection === 'cookie-policy'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-purple-600" />
          Cookie &amp; Ad Policy
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-8 shadow-xs">
        {/* SECTION 1: TERMS OF SERVICE */}
        {activeSection === 'terms' && (
          <article className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Terms of Service &amp; Conditions of Use
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please read these terms carefully before utilizing FreshCommits (freshcommits.com).
              </p>
            </div>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h3>
              <p>
                By accessing, browsing, or utilizing FreshCommits (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;the Platform&rdquo;), you certify that you have read, understood, and agreed to be legally bound by these Terms of Service and our associated Privacy Policy. If you do not agree to these terms, you must discontinue use of the platform immediately.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">2. Description of Service &amp; Zero-Fee Pledge</h3>
              <p>
                FreshCommits operates an editorial and programmatic index of verified early-career software engineering roles (0–2 years of experience), regional salary benchmarks, and developer compensation tools. FreshCommits is 100% free for job seekers. We never charge candidates for job browsing, filtering, application routing, or accessing career salary matrices.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">3. Canonical ATS Direct Routing &amp; Third-Party Sites</h3>
              <p>
                FreshCommits does not operate as an employment agency, headhunter, or staffing firm. We do not participate in employment negotiations, candidate interviews, or hiring determinations. All application links route candidates directly to verified employer Applicant Tracking Systems (e.g., Greenhouse, Lever, Ashby, Workday). We are not responsible for the privacy practices, content, or hiring availability of external third-party portals.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">4. Intellectual Property &amp; Fair Use Curation</h3>
              <p>
                All company logos, registered trademarks, service marks, and trade names displayed on FreshCommits are the property of their respective corporate owners. Their display on FreshCommits constitutes nominative fair use for the sole purpose of identifying the prospective employer offering the employment requisition.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">5. Prohibited Conduct</h3>
              <p>
                Users agree not to: (a) scrape or harvest website data using automated bots in a manner that degrades service performance; (b) attempt to circumvent any security controls or authentication layers; (c) introduce malicious code, trojans, or automated vulnerability probes; or (d) misrepresent identity or affiliation when submitting employer correction inquiries.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">6. Disclaimer of Warranties &amp; Limitation of Liability</h3>
              <p>
                FreshCommits provides all content, compensation figures, and job listings on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind, whether express, statutory, or implied. In no event shall FreshCommits or its operators be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the platform.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">7. Employer Modification &amp; Takedown Requests</h3>
              <p>
                Employers wishing to update or remove active job listings may submit requests to <span className="font-mono text-emerald-700">support@freshcommits.com</span>. All verified requests are processed within 24 business hours.
              </p>
            </section>
          </article>
        )}

        {/* SECTION 2: PRIVACY POLICY */}
        {activeSection === 'privacy' && (
          <article className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                Privacy Policy &amp; Data Protection Disclosures
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Transparency regarding data handling, cookies, Google AdSense, and user rights.
              </p>
            </div>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">1. Information We Do NOT Collect</h3>
              <p>
                FreshCommits is committed to data minimization. We do not require account registration, do not collect social security numbers, and do not store resume files or candidate cover letters on our servers. You apply directly on employer ATS systems.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">2. Google AdSense &amp; DART Cookie Disclosures</h3>
              <p>
                Google, as a third-party vendor, uses cookies to serve advertisements on FreshCommits. Google&apos;s use of advertising cookies (such as the DoubleClick DART cookie) enables it and its partners to serve ads to users based on their visits to this site and other sites across the Internet.
              </p>
              <p className="text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl">
                Users may opt out of personalized advertising by visiting{' '}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 underline font-semibold"
                >
                  Google Ads &amp; Privacy Policy (policies.google.com/technologies/ads)
                </a>{' '}
                or via the Network Advertising Initiative opt-out portal at{' '}
                <a
                  href="https://optout.networkadvertising.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 underline font-semibold"
                >
                  optout.networkadvertising.org
                </a>.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">3. Log Files &amp; Technical Analytics</h3>
              <p>
                Like standard websites, our hosting infrastructure automatically logs standard technical metadata (e.g., browser user-agent, referrers, timestamp, and anonymous IP geographic region) strictly to monitor uptime, prevent malicious denial-of-service traffic, and analyze aggregate search trends.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">4. GDPR (European Users) &amp; CCPA (California Residents) Compliance</h3>
              <p>
                Under the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA/CPRA):
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                <li>We do not sell personal information to data brokers.</li>
                <li>Users have the right to request disclosure of any stored preferences or technical logs.</li>
                <li>Users may toggle cookie preferences at any time using the Cookie Preferences link in our footer.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">5. Contact Our Privacy Officer</h3>
              <p>
                For privacy or data handling inquiries, please reach our designated Data Compliance Officer at <span className="font-mono text-emerald-700">privacy@freshcommits.com</span>.
              </p>
            </section>
          </article>
        )}

        {/* SECTION 3: DISCLAIMER */}
        {activeSection === 'disclaimer' && (
          <article className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Publisher Disclosures &amp; Job Aggregation Disclaimer
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Authenticity guidelines, salary methodology, and employment disclaimers.
              </p>
            </div>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">1. Not an Employer or Employment Agency</h3>
              <p>
                FreshCommits does not represent, endorse, or guarantee any employer listed on this website. Inclusion of a job listing does not imply endorsement by the hiring entity. Job applicants are encouraged to perform their own due diligence before accepting employment offers.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">2. Compensation Benchmarks &amp; Methodology</h3>
              <p>
                All salary figures, percentile distributions, and total compensation estimates published in our guides are compiled from statutory state wage transparency filings (California SB 1162, New York City Local Law 32, Washington State EPEA), US Department of Labor records, and verified employer job postings. Compensation ranges may vary based on applicant skills, technical assessments, and geographic zone differentials.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">3. Anti-Scam &amp; Recruitment Fraud Warning</h3>
              <p>
                FreshCommits strictly indexes direct links to corporate ATS platforms. Legitimate employers will never ask candidates to pay for interviews, purchase equipment upfront via personal check, or communicate via unverified messaging apps. If you encounter a suspicious posting, report it immediately to <span className="font-mono text-emerald-700">safety@freshcommits.com</span>.
              </p>
            </section>
          </article>
        )}

        {/* SECTION 4: COOKIE & AD POLICY */}
        {activeSection === 'cookie-policy' && (
          <article className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                Cookie Policy &amp; Advertising Standards
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                How cookies are categorized and used across FreshCommits.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Essential Cookies
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Required for core platform navigation, dark/light theme persistence, search filter state, and security headers. Always active.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Analytics Cookies
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Measure aggregate traffic and job interest to help us surface the most in-demand entry-level roles. Can be toggled on/off.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  Advertising Cookies
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Set by Google AdSense to serve non-intrusive, relevant advertisements and measure ad viewability. Can be toggled on/off.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  localStorage.removeItem('freshcommits_cookie_consent_v1');
                  window.location.reload();
                }}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Reset Cookie Consent Preferences
              </button>
            </div>
          </article>
        )}
      </div>
    </div>
  );
};
export default LegalPageView;
