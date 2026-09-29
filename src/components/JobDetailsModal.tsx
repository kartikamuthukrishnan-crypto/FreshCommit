import React, { useEffect, useState } from 'react';
import { JobPosting, AdSenseConfig } from '../types';
import { generateJobPostingSchema, injectJobJsonLd } from '../utils/schemaGenerator';
import { trackJobView, trackApplyClick } from '../utils/analytics';
import { isJobExpired, getDaysUntilExpiration } from '../utils/jobAggregator';
import { humanizeCareerTake } from '../utils/textHumanizer';
import { cleanHtml } from '../utils/jobExtractor';
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
  ChevronRight,
  ChevronLeft
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
      return { hasEdge: false, careerTake: '', checklistItems: [], roleOverview: cleanHtml(job.description) };
    }
    const parts = job.description.split('🏢 Role Overview:');
    const edgeContent = parts[0] || '';
    const roleOverview = parts[1]?.trim() || '';

    const takeMatch = edgeContent.match(/🎯 The FreshCommits Career Take:\s*([\s\S]*?)(?=💡 Candidate Preparation Checklist:|$)/i);
    const checklistMatch = edgeContent.match(/💡 Candidate Preparation Checklist:\s*([\s\S]*?)$/i);

    const rawCareerTake = takeMatch ? takeMatch[1].trim() : '';
    const careerTake = humanizeCareerTake(rawCareerTake, job);
    const checklistText = checklistMatch ? checklistMatch[1].trim() : '';
    const checklistItems = checklistText
      .split('\n')
      .map((l) => l.replace(/^•\s*/, '').trim())
      .filter(Boolean);

    const rawRoleOverview = parts[1]?.trim() || '';
    const cleanRoleOverview = cleanHtml(rawRoleOverview || job.description)
      .replace(/actively seeking an? early-career ([^.\n]+?)(?:,\s*Early Career)/gi, 'actively seeking a $1')
      .replace(/actively seeking an? early-career ([^.\n]+?)(?:,\s*Entry Level)/gi, 'actively seeking a $1')
      .replace(/early-career ([^.\n]+?), Early Career/gi, '$1');

    return {
      hasEdge: true,
      careerTake,
      checklistItems,
      roleOverview: cleanRoleOverview
    };
  })();

  const overviewFirst45 = (edgeData.roleOverview || '').slice(0, 45).toLowerCase().trim();

  const cleanedResponsibilities = (job.responsibilities || [])
    .map(cleanHtml)
    .map((r) => r.replace(/^[•\-\*–—\d\.\)]\s*/, '').trim())
    .filter((line) => {
      if (!line || line.length < 8) return false;
      const low = line.toLowerCase();
      if (/^(?:what you(?:’|'| )*(?:will|'ll)?\s*(?:do|bring)|responsibilities|key responsibilities|the role|what you will be doing|your mission|core duties|qualifications|requirements|basic qualifications|about us|who you are|who we are)[:\s]*$/i.test(low)) return false;
      if (/^about us[:\s]/i.test(low)) return false;
      if (/^we are looking for\b/i.test(low)) return false;
      if (/^this is an ideal role\b/i.test(low)) return false;
      if (/^our team is\b/i.test(low)) return false;
      if (overviewFirst45 && low.includes(overviewFirst45)) return false;
      return true;
    });

  const cleanedQualifications = (job.qualifications || [])
    .map(cleanHtml)
    .map((q) => q.replace(/^[•\-\*–—\d\.\)]\s*/, '').trim())
    .filter((line) => {
      if (!line || line.length < 8) return false;
      const low = line.toLowerCase();
      if (/^(?:what you(?:’|'| )*(?:will|'ll)?\s*bring|qualifications|requirements|basic qualifications|minimum qualifications|what we look for|who you are|about us)[:\s]*$/i.test(low)) return false;
      if (cleanedResponsibilities.some((r) => r.toLowerCase() === low)) return false;
      return true;
    });

  const formatSalary = (salary: JobPosting['salary']) => {
    if (!salary || salary.min <= 0) return 'Salary Undisclosed';
    const sym = salary.currency === 'GBP' ? '£' : salary.currency === 'EUR' ? '€' : salary.currency === 'CAD' ? 'CA$' : salary.currency === 'INR' ? '₹' : '$';
    const isHourly = salary.unit === 'HOUR' && (salary.max || salary.min) < 500;
    if (isHourly) {
      const maxH = salary.max && salary.max !== salary.min ? `–${sym}${salary.max}` : '';
      return `${sym}${salary.min}${maxH} / hr`;
    }
    const minK = Math.round(salary.min / 1000);
    const maxK = salary.max ? Math.round(salary.max / 1000) : minK;
    return `${sym}${minK}k – ${sym}${maxK}k / year`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-3 lg:p-4 bg-slate-900/65 backdrop-blur-sm overflow-hidden"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full md:max-w-4xl lg:max-w-5xl md:h-[96vh] bg-white rounded-none md:rounded-2xl shadow-2xl border-0 md:border border-slate-200 overflow-hidden flex flex-col box-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Universal Slim Sticky Navigation Bar (~50px: keeps maximum vertical space for JD on all devices) */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 bg-white/95 backdrop-blur-md border-b border-slate-200 shrink-0 sticky top-0 z-20">
          {/* Left: Quick Back Navigation & Company */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-indigo-600 px-2 py-1.5 -ml-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Back to job listings"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
              <span>Jobs</span>
            </button>

            <span className="text-slate-300 hidden sm:inline">|</span>

            <div className="flex items-center gap-2 min-w-0 truncate">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.company}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded object-cover border border-slate-200 bg-white shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  {job.company.charAt(0)}
                </div>
              )}
              <span className="text-xs font-bold text-slate-900 truncate">{job.company}</span>
              <span className="hidden sm:inline-flex text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/80 shrink-0">
                {job.category}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(job.id)}
                className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isSaved
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save job'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : 'text-slate-500'}`} />
                <span className="hidden md:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            )}

            <button
              onClick={handleCopyUrl}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              title="Copy share link"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden md:inline">{copiedUrl ? 'Copied Link!' : 'Share'}</span>
            </button>

            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackApplyClick(job)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <span className="truncate">{applyButtonText}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer ml-0.5"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content: Takes full available height on all devices! */}
        <div className="p-4 sm:p-8 lg:p-10 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm leading-relaxed">
          {/* Universal Rich Job Header: Scrolls naturally with the content so it NEVER traps the JD in a small gap */}
          <div className="pb-5 sm:pb-6 border-b border-slate-200 space-y-3.5">
            <div className="flex items-start gap-3.5 sm:gap-4">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.company}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover border border-slate-200 bg-white p-1 sm:p-1.5 shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-base sm:text-xl flex items-center justify-center shrink-0 shadow-xs">
                  {job.company.charAt(0)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{job.company}</span>
                  {job.experienceLevel === 'Internship' ? (
                    <span className="text-[11px] sm:text-xs bg-violet-100 text-violet-800 font-bold px-2.5 py-0.5 rounded-full border border-violet-200">
                      Internship
                    </span>
                  ) : (
                    <span className="text-[11px] sm:text-xs bg-indigo-100 text-indigo-800 font-semibold px-2.5 py-0.5 rounded-full">
                      Entry/Early Career
                    </span>
                  )}
                  {job.isRemote && (
                    <span className="text-[11px] sm:text-xs bg-violet-100 text-violet-800 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Remote
                    </span>
                  )}
                  {job.atsVerified && (
                    <span className="text-[11px] sm:text-xs bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Requisition
                    </span>
                  )}
                </div>

                <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 mt-1 sm:mt-1.5 leading-snug tracking-tight">
                  {job.title}
                </h1>
              </div>
            </div>

            {/* Quick Metadata Chips */}
            <div className="flex items-center gap-2 sm:gap-2.5 text-xs text-slate-600 flex-wrap pt-0.5">
              <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.location}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl font-bold">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>{formatSalary(job.salary)}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Posted {job.datePosted}</span>
              </span>
              <span className="text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl">
                {job.experienceLevel === 'Internship' ? 'Internship' : 'Entry/Early Career'}
              </span>
            </div>
          </div>
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
                    <CheckCircle2 className="w-3 h-3 text-indigo-600" /> Verified Direct Application: Confirmed live on official employer pipeline
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
              {cleanHtml(edgeData.hasEdge ? edgeData.roleOverview : job.description)}
            </p>
          </div>

          {/* Key Responsibilities */}
          {cleanedResponsibilities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Responsibilities</h4>
              <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                {cleanedResponsibilities.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Qualifications */}
          {cleanedQualifications.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Qualifications (Entry-Level / Fresher)
              </h4>
              <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                {cleanedQualifications.map((q, i) => (
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
          {/* Universal In-Document Direct Verification & Reporting (Scrolls naturally with content on all devices) */}
          <div className="pt-6 border-t border-slate-200 text-xs text-slate-500 space-y-3">
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Verified Direct Application &bull; <strong className="text-indigo-700">{job.company}</strong> Official Career Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Direct employer requisition — opens this specific opening directly without middleman friction.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 break-all select-all">
                freshcommits.com/?job={job.id}
              </span>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                {copiedUrl ? '✓ Link Copied!' : 'Copy Direct Link'}
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={handleReportJob}
                disabled={reportSubmitted}
                className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                title="Flag to FreshCommits curation team"
              >
                <Flag className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
                <span>{reportSubmitted ? '✓ Report Logged — Verification Queue Updated' : 'Report expired link or inaccurate YoE'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Universal Sleek Sticky Bottom Action Bar (~50px: Compact, keeps maximum screen space for JD on all devices) */}
        <div className="p-3 sm:px-6 sm:py-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shrink-0 flex items-center justify-between gap-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            onClick={onClose}
            className="px-4 py-2 sm:py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
          >
            Close
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyUrl}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="Copy direct shareable link for this job"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedUrl ? 'Copied!' : 'Share'}</span>
            </button>

            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackApplyClick(job)}
              className="py-2 sm:py-2.5 px-5 sm:px-7 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="truncate">{applyButtonText}</span>
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
