import React from 'react';
import { X, Shield, ExternalLink, FileText, Lock, AlertCircle } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'disclaimer' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            {type === 'privacy' && <Lock className="w-5 h-5 text-blue-600" />}
            {type === 'terms' && <FileText className="w-5 h-5 text-emerald-600" />}
            {type === 'disclaimer' && <AlertCircle className="w-5 h-5 text-amber-600" />}
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {type === 'privacy' && 'Privacy Policy & DART Cookie Disclosures'}
              {type === 'terms' && 'Terms of Service & User Agreement'}
              {type === 'disclaimer' && 'Publisher & Job Aggregation Disclaimer'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs sm:text-sm text-slate-700 space-y-4 leading-relaxed">
          {type === 'privacy' && (
            <>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
                <strong>Google AdSense Publisher Notice:</strong> FreshCommits complies with Google&apos;s EU User Consent Policy and standard US State privacy statutes.
              </div>

              <h3 className="font-bold text-slate-900 text-sm">1. Google AdSense &amp; DoubleClick DART Cookies</h3>
              <p>
                Google, as a third-party vendor, uses cookies to serve advertisements on FreshCommits (freshcommits.com). Google&apos;s use of advertising cookies (including the DART cookie) enables it and its partners to serve ads based on user visits to this site and other websites on the Internet.
              </p>
              <p>
                Users may opt out of personalized advertising by visiting{' '}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 font-semibold underline inline-flex items-center gap-0.5"
                >
                  Google Ads Settings (policies.google.com/technologies/ads)
                  <ExternalLink className="w-3 h-3" />
                </a>{' '}
                or via the Network Advertising Initiative opt-out portal at{' '}
                <a
                  href="https://optout.networkadvertising.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 font-semibold underline"
                >
                  optout.networkadvertising.org
                </a>.
              </p>

              <h3 className="font-bold text-slate-900 text-sm">2. Candidate Data Minimization</h3>
              <p>
                FreshCommits does not require candidate accounts, does not charge users, does not collect government ID numbers, and does not store resume PDFs or cover letters on its servers. All job applications route directly to employer Applicant Tracking Systems (ATS).
              </p>

              <h3 className="font-bold text-slate-900 text-sm">3. GDPR &amp; CCPA/CPRA Compliance</h3>
              <p>
                We do not sell personal information. European Union (GDPR) and California (CCPA) residents maintain the right to access, rectify, or erase any technical log entries or saved device preferences. Direct all data inquiries to <span className="font-mono text-emerald-800 font-semibold">privacy@freshcommits.com</span>.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
                <strong>Terms of Service &amp; Conditions of Use:</strong> Effective September 2026. Governs access to freshcommits.com.
              </div>

              <h3 className="font-bold text-slate-900 text-sm">1. Acceptance of Terms &amp; Lawful Use</h3>
              <p>
                By accessing, browsing, or utilizing FreshCommits, you agree to be bound by these Terms of Service. FreshCommits provides an editorial and programmatic job directory intended exclusively for bona fide job-seeking activities and educational career research.
              </p>

              <h3 className="font-bold text-slate-900 text-sm">2. Zero-Fee Candidate Guarantee</h3>
              <p>
                FreshCommits is 100% free for job seekers. We never charge developers to browse roles, filter salary benchmarks, or access application links. Beware of any external party impersonating FreshCommits requesting payments or fees.
              </p>

              <h3 className="font-bold text-slate-900 text-sm">3. Direct ATS Routing &amp; Non-Agency Status</h3>
              <p>
                FreshCommits is not an employment agency or recruiter. We do not participate in candidate interviews, negotiations, or hiring determinations. All applications route directly to verified employer ATS domains.
              </p>

              <h3 className="font-bold text-slate-900 text-sm">4. Trademarks &amp; Fair Use</h3>
              <p>
                Company names, logos, and trademarks displayed on FreshCommits remain the intellectual property of their respective holders. Their display constitutes nominative fair use for identification purposes only.
              </p>

              <h3 className="font-bold text-slate-900 text-sm">5. Limitation of Liability</h3>
              <p>
                Services are provided &ldquo;as is&rdquo; without warranties of any kind. FreshCommits is not liable for indirect, consequential, or incidental damages arising from your use of the platform.
              </p>
            </>
          )}

          {type === 'disclaimer' && (
            <>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                <strong>Publisher &amp; Aggregation Disclaimer:</strong> Ensuring transparency in salary estimation and employer curation.
              </div>

              <h3 className="font-bold text-slate-900 text-sm">1. Authentic Job Requisition Feeds</h3>
              <p>
                Job requirements, qualification lists, and responsibilities are published verbatim from verified company career feeds (Greenhouse, Lever, Ashby, Workday) without synthetic distortion.
              </p>

              <h3 className="font-bold text-slate-900 text-sm">2. Salary Benchmark Methodology</h3>
              <p>
                Compensation ranges are compiled from statutory state wage transparency filings (California SB 1162, New York City Local Law 32, Washington EPEA), US Bureau of Labor Statistics data, and verified employer job postings.
              </p>

              <h3 className="font-bold text-slate-900 text-sm">3. Employer Listing Updates &amp; Takedowns</h3>
              <p>
                Employers wishing to modify or remove active job postings can submit a priority request to <span className="font-mono text-emerald-800 font-semibold">support@freshcommits.com</span> for review within 24 business hours.
              </p>
            </>
          )}
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-4">
          <a
            href={`/?view=${type}`}
            onClick={(e) => {
              e.preventDefault();
              onClose();
              const url = new URL(window.location.href);
              url.searchParams.set('view', type);
              window.history.pushState({}, '', url.toString());
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="text-xs text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1"
          >
            Open Full Dedicated {type === 'terms' ? 'Terms of Service' : type === 'privacy' ? 'Privacy Policy' : 'Disclaimer'} Page
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
