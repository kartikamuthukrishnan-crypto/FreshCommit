import React, { useEffect, useState } from 'react';
import { JobPosting, AdSenseConfig } from '../types';
import { generateJobPostingSchema, injectJobJsonLd } from '../utils/schemaGenerator';
import { trackJobView, trackApplyClick } from '../utils/analytics';
import { isJobExpired, getDaysUntilExpiration } from '../utils/jobAggregator';
import { AdSlot } from './AdSlot';
import { SocialShare } from './SocialShare';
import {
  X,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Globe,
  Link2,
  Clock,
  Bookmark,
  Sparkles,
  Flag,
  ChevronRight
} from 'lucide-react';

interface JobDetailsModalProps {
  job: JobPosting | null;
  onClose: () => void;
  adConfig: AdSenseConfig;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose, adConfig, isSaved, onToggleSave }) => {
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Dynamic Title, Meta Description, Schema injection, and Escape listener
  useEffect(() => {
    if (!job) return;
    trackJobView(job);
    const schema = generateJobPostingSchema(job);
    const cleanup = injectJobJsonLd(schema);

    // Save previous metadata
    const originalTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const originalDesc = metaDesc ? metaDesc.content : '';

    // Update title and meta description dynamically
    document.title = `${job.title} at ${job.company} (${job.experienceLevel}) – FreshCommits`;
    if (metaDesc) {
      metaDesc.content = `Apply directly for ${job.title} at ${job.company} in ${job.location}. Verified early-career software engineering opportunity with direct employer application.`;
    }

    // Update canonical link for search engines to this dedicated job URL (with www to prevent 301 redirects)
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const originalHref = canonical ? canonical.href : 'https://www.freshcommits.com/';
    if (canonical) {
      canonical.href = `https://www.freshcommits.com/?job=${job.id}`;
    }

    // ESC key closes modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cleanup();
      document.title = originalTitle;
      if (metaDesc) metaDesc.content = originalDesc;
      if (canonical) {
        canonical.href = originalHref;
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [job, onClose]);

  if (!job) return null;

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(job.title);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  const handleCopyUrl = () => {
    const jobUrl = `${window.location.origin}/?job=${job.id}`;
    navigator.clipboard.writeText(jobUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleReportJob = async () => {
    setReportSubmitted(true);
    try {
      // 1. Update localStorage reported list to prevent duplicate spam from same browser
      const reportedKey = `reported_job_${job.id}`;
      if (!localStorage.getItem(reportedKey)) {
        localStorage.setItem(reportedKey, 'true');
        const updatedJob: JobPosting = {
          ...job,
          closedReportCount: (job.closedReportCount || 0) + 1,
          healthStatus: (job.closedReportCount || 0) + 1 >= 2 ? 'CANDIDATE_REPORTED' : job.healthStatus
        };
        // Fire-and-forget cloud update without blocking UI
        import('../services/firebaseService').then(({ saveJobToCloud }) => {
          saveJobToCloud(updatedJob).catch((e) => console.warn('Could not update report to Firestore:', e));
        });
      }
    } catch {
      // graceful fallback
    }
    setTimeout(() => setReportSubmitted(false), 6000);
  };

  const richResultsUrl = `https://search.google.com/test/rich-results`;

  const applyButtonText = job.company
    ? (job.company.length > 20 ? 'Apply on Company Site' : `Apply to ${job.company}`)
    : 'Apply on Company Site';

  const edgeData = (() => {
    if (!job.description || !job.description.includes('🎯 The FreshCommits Career Take:')) {
      return { hasEdge: false, careerTake: '', checklistItems: [], roleOverview: job.description };
    }
    const parts = job.description.split('🏢 Role Overview:');
    const edgeContent = parts[0] || '';
    const roleOverview = parts[1]?.trim() || '';

    const takeMatch = edgeContent.match(/🎯 The FreshCommits Career Take:\s*([\s\S]*?)(?=💡 Candidate Preparation Checklist:|$)/i);
    const checklistMatch = edgeContent.match(/💡 Candidate Preparation Checklist:\s*([\s\S]*?)$/i);

    const careerTake = takeMatch ? takeMatch[1].trim() : '';
    const checklistText = checklistMatch ? checklistMatch[1].trim() : '';
    const checklistItems = checklistText
      .split('\n')
      .map((l) => l.replace(/^•\s*/, '').trim())
      .filter(Boolean);

    return {
      hasEdge: true,
      careerTake,
      checklistItems,
      roleOverview: roleOverview || job.description
    };
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto overflow-x-hidden"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 max-h-[90vh] flex flex-col box-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visual Breadcrumb Navigation for SEO & Candidate Wayfinding */}
        <div className="px-6 py-2 bg-slate-100/90 border-b border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
          <span className="hover:text-slate-800 transition-colors">Home</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="hover:text-slate-800 transition-colors">Jobs</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-700 font-medium">{job.category}</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-indigo-700 font-semibold truncate max-w-[200px]">{job.company}</span>
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={job.companyLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=0F172A&color=fff&size=128`}
              alt={job.company}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-white p-1"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900">{job.company}</span>
                {job.experienceLevel === 'Internship' ? (
                  <span className="text-xs bg-violet-100 text-violet-800 font-bold px-2.5 py-0.5 rounded-full border border-violet-200">
                    🎓 Paid Internship
                  </span>
                ) : (
                  <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
                    {job.experienceLevel} ({job.maxYearsExperience} YoE)
                  </span>
                )}
                {job.isRemote && (
                  <span className="text-xs bg-violet-100 text-violet-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Remote Option
                  </span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">{job.title}</h2>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <DollarSign className="w-3.5 h-3.5" />
                  {(() => {
                    const sym = job.salary.currency === 'GBP' ? '£' : job.salary.currency === 'EUR' ? '€' : job.salary.currency === 'CAD' ? 'CA$' : job.salary.currency === 'INR' ? '₹' : '$';
                    if (job.salary.unit === 'HOUR') {
                      return `${sym}${job.salary.min}${job.salary.max && job.salary.max !== job.salary.min ? `–${sym}${job.salary.max}` : ''} / hour`;
                    }
                    return `${sym}${Math.round(job.salary.min / 1000)}k – ${sym}${Math.round(job.salary.max / 1000)}k / year`;
                  })()}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Posted on {job.datePosted}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(job.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shadow-2xs cursor-pointer ${
                  isSaved
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title={isSaved ? 'Remove from saved jobs' : 'Save this job'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : 'text-slate-500'}`} />
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            )}
            <button
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
              title="Copy direct shareable link for this job"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden sm:inline">{copiedUrl ? 'Copied Link!' : 'Share'}</span>
            </button>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <span>{applyButtonText}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm leading-relaxed">
          {/* Expiration Notice if past deadline */}
          {isJobExpired(job) ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <strong className="text-amber-950 block mb-0.5 font-bold">This Listing Has Expired / Reached Its Deadline</strong>
                This position's official application window concluded on {job.validThrough || 'recently'}. The direct application link is retained below in case the hiring team accepts rolling candidates.
              </div>
            </div>
          ) : (
            /* Authenticity / Direct ATS Notice */
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600">
                <strong className="text-slate-900 block mb-0.5">Verified Early-Career Listing</strong>
                This job was screened for strict entry-level requirements (&le; 2 years experience). The description below is presented in its original, authentic employer format without automated paraphrasing.
                {job.validThrough && (
                  <span className="block mt-1 text-[11px] text-slate-500">
                    Application window valid through: <strong>{job.validThrough}</strong>
                    {getDaysUntilExpiration(job.validThrough) !== null && getDaysUntilExpiration(job.validThrough)! > 0 && (
                      <span> ({getDaysUntilExpiration(job.validThrough)} days remaining)</span>
                    )}
                  </span>
                )}
                {job.atsVerified && (
                  <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    <CheckCircle2 className="w-3 h-3 text-indigo-600" /> ATS Verified: Confirmed live on official employer pipeline
                  </span>
                )}
              </div>
            </div>
          )}

          {/* THE FRESHCOMMITS EDGE (Proprietary Editorial Value & Analysis) */}
          {edgeData.hasEdge && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-emerald-50/70 border border-indigo-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-indigo-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                    The FreshCommits Edge &bull; Editorial Career Analysis
                  </span>
                </div>
                <span className="text-[10px] font-semibold bg-indigo-100/70 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200">
                  Proprietary Analysis
                </span>
              </div>

              {/* Career Take */}
              {edgeData.careerTake && (
                <div>
                  <h5 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>The FreshCommits Career Take</span>
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/95 p-3 rounded-xl border border-indigo-100 shadow-2xs">
                    {edgeData.careerTake}
                  </p>
                </div>
              )}

              {/* Preparation Checklist */}
              {edgeData.checklistItems && edgeData.checklistItems.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <span>💡</span>
                    <span>Candidate Preparation Checklist</span>
                  </h5>
                  <div className="grid grid-cols-1 gap-2">
                    {edgeData.checklistItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-white/95 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Overview */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {edgeData.hasEdge ? 'Official Employer Role Overview' : 'About The Role'}
            </h4>
            <p className="whitespace-pre-line text-slate-700">
              {edgeData.hasEdge ? edgeData.roleOverview : job.description}
            </p>
          </div>

          {/* Key Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Responsibilities</h4>
              <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                {job.responsibilities.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Qualifications */}
          {job.qualifications && job.qualifications.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Qualifications (Entry-Level / Fresher)
              </h4>
              <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                {job.qualifications.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tech Stack & Tools</h4>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md font-mono text-xs font-medium border border-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Social Share Engine: One-click LinkedIn, X, Reddit, WhatsApp */}
          <SocialShare job={job} />

          {/* Google AdSense policy-compliant in-modal banner (guaranteed margin from buttons) */}
          {adConfig.enabled && adConfig.detailSidebarAd && (
            <div className="pt-2">
              <AdSlot type="in-feed" config={adConfig} />
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>
                Verified Direct Application &bull; <strong className="text-indigo-700">{job.company}</strong> Official Career Portal
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 ml-5 flex items-center gap-2 flex-wrap">
              <span>Direct employer requisition — opens this specific opening directly without middleman friction.</span>
              <span className="font-mono text-[10px] text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded border border-slate-300/80 break-all">
                freshcommits.com/?job={job.id}
              </span>
            </div>
            <div className="mt-1 ml-5">
              <button
                type="button"
                onClick={handleReportJob}
                disabled={reportSubmitted}
                className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                title="Flag to FreshCommits curation team"
              >
                <Flag className="w-3 h-3 text-slate-400 hover:text-rose-500" />
                <span>{reportSubmitted ? '✓ Report Logged — Verification Queue Updated' : 'Report expired link or inaccurate YoE'}</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2.5 self-end sm:self-center flex-wrap">
            <button
              onClick={handleCopyUrl}
              className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Copy direct shareable link for this job (?job=...)"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedUrl ? 'Copied URL!' : 'Share Job'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-white transition-colors cursor-pointer"
            >
              Close
            </button>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackApplyClick(job)}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-all"
            >
              <span>{applyButtonText}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
