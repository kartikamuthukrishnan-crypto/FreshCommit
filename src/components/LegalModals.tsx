import React from 'react';
import { X, Shield } from 'lucide-react';

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
            <Shield className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">
              {type === 'privacy' && 'Privacy Policy & Cookie Disclosure'}
              {type === 'terms' && 'Terms of Service'}
              {type === 'disclaimer' && 'AdSense & Job Aggregation Disclaimer'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs sm:text-sm text-slate-700 space-y-4 leading-relaxed">
          {type === 'privacy' && (
            <>
              <p>
                <strong>Effective Date: September 2026</strong>
              </p>
              <h3 className="font-bold text-slate-900 text-sm">Google AdSense & DoubleClick Cookie</h3>
              <p>
                Google, as a third-party vendor, uses cookies to serve ads on FreshCommit. Google&apos;s use of the DART cookie enables it to serve ads to our users based on their visit to our site and other sites on the Internet. Users may opt out of the use of the DART cookie by visiting the Google Ad and Content Network Privacy Policy at{' '}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 underline"
                >
                  policies.google.com/technologies/ads
                </a>
                .
              </p>
              <h3 className="font-bold text-slate-900 text-sm">Data Collection & Storage</h3>
              <p>
                FreshCommit does not sell, rent, or trade user personal information. We do not require account creation for browsing or applying to software developer jobs. All job applications are routed directly to the verified employer’s Applicant Tracking System (ATS).
              </p>
              <h3 className="font-bold text-slate-900 text-sm">GDPR & CCPA Rights</h3>
              <p>
                Users retain the right to request access to or deletion of any stored preferences. You may adjust browser cookie settings at any time.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <p>
                By using FreshCommit, you agree to access job listings and information for lawful personal job-seeking purposes only.
              </p>
              <h3 className="font-bold text-slate-900 text-sm">Employer Intellectual Property</h3>
              <p>
                All company logos, brand trademarks, and job descriptions remain the property of their respective copyright holders. Listings are curated for early-career developers under fair use with direct attribution and links to canonical application endpoints.
              </p>
              <h3 className="font-bold text-slate-900 text-sm">Direct Application Responsibility</h3>
              <p>
                FreshCommit is not an employment agency. We do not participate in employment negotiations, background checks, or hiring decisions.
              </p>
            </>
          )}

          {type === 'disclaimer' && (
            <>
              <h3 className="font-bold text-slate-900 text-sm">Authentic Unparaphrased Text Policy</h3>
              <p>
                In strict adherence to Google AdSense guidelines and authentic job verification standards, job requirements and responsibilities are published verbatim from verified company career feeds (such as Greenhouse, Lever, and Ashby) without AI paraphrasing.
              </p>
              <h3 className="font-bold text-slate-900 text-sm">Employer Removal Requests</h3>
              <p>
                If you are an employer and wish to update, modify, or remove your listing from FreshCommit, please email our support team with your company domain email for immediate processing within 24 hours.
              </p>
            </>
          )}
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
