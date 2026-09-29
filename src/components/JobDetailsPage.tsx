import React, { useEffect, useState } from 'react';
import { JobPosting, AdSenseConfig } from '../types';
import { generateJobPostingSchema, injectJobJsonLd } from '../utils/schemaGenerator';
import { trackJobView, trackApplyClick } from '../utils/analytics';
import { isJobExpired, getDaysUntilExpiration } from '../utils/jobAggregator';
import { humanizeCareerTake } from '../utils/textHumanizer';
import { AdSlot } from './AdSlot';
import { SocialShare } from './SocialShare';
import {
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  Globe,
  Clock,
  Bookmark,
  Sparkles,
  Flag,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

interface JobDetailsPageProps {
  job: JobPosting;
  allJobs?: JobPosting[];
  onBack: () => void;
  adConfig: AdSenseConfig;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
  onSelectRelatedJob?: (job: JobPosting) => void;
}

export const JobDetailsPage: React.FC<JobDetailsPageProps> = ({
  job,
  allJobs = [],
  onBack,
  adConfig,
  isSaved = false,
  onToggleSave,
  onSelectRelatedJob
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const isExpired = isJobExpired(job) || (job.status && job.status !== 'ACTIVE');

  // Dynamic Title, Meta Description, Schema injection, and Canonical URL update
  useEffect(() => {
    trackJobView(job);
    const schema = generateJobPostingSchema(job);
    const cleanup = injectJobJsonLd(schema);

    // Save previous metadata
    const originalTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const originalDesc = metaDesc ? metaDesc.content : '';

    // Update title and meta description dynamically for this dedicated page
    document.title = `${job.title} at ${job.company} (${job.experienceLevel}) – FreshCommits`;
    if (metaDesc) {
      metaDesc.content = `Apply directly for ${job.title} at ${job.company} in ${job.location}. Verified 0–2 YoE early-career software engineering opportunity with direct company application.`;
    }

    // Update canonical link to canonical job URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const originalHref = canonical ? canonical.href : 'https://www.freshcommits.com/';
    if (canonical) {
      canonical.href = `https://www.freshcommits.com/job/${job.id}`;
    }

    // Dynamic Robots Meta Tag: Keep active jobs indexable, but tell Google not to index expired positions
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }
    const originalRobots = robotsMeta.content || 'index, follow';
    if (isExpired) {
      robotsMeta.content = 'noindex, follow';
    } else {
      robotsMeta.content = 'index, follow, max-image-preview:large';
    }

    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      cleanup();
      document.title = originalTitle;
      if (metaDesc) metaDesc.content = originalDesc;
      if (canonical) {
        canonical.href = originalHref;
      }
      if (robotsMeta) {
        robotsMeta.content = originalRobots;
      }
    };
  }, [job, isExpired]);

  const handleCopyUrl = () => {
    const jobUrl = `${window.location.origin}/job/${job.id}`;
    navigator.clipboard.writeText(jobUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleReportJob = async () => {
    setReportSubmitted(true);
    try {
      const reportedKey = `reported_job_${job.id}`;
      if (!localStorage.getItem(reportedKey)) {
        localStorage.setItem(reportedKey, 'true');
        const updatedJob: JobPosting = {
          ...job,
          closedReportCount: (job.closedReportCount || 0) + 1,
          healthStatus: (job.closedReportCount || 0) + 1 >= 2 ? 'CANDIDATE_REPORTED' : job.healthStatus
        };
        import('../services/firebaseService').then(({ saveJobToCloud }) => {
          saveJobToCloud(updatedJob).catch((e) => console.warn('Could not update report to Firestore:', e));
        });
      }
    } catch {
      // graceful fallback
    }
    setTimeout(() => setReportSubmitted(false), 6000);
  };

  const applyButtonText = job.company
    ? (job.company.length > 20 ? 'Apply on Company Site' : `Apply to ${job.company}`)
    : 'Apply on Company Site';

  // Extract curated editorial insights if present
  const edgeData = (() => {
    if (!job.description || !job.description.includes('🎯 The FreshCommits Career Take:')) {
      return { hasEdge: false, careerTake: '', checklistItems: [], roleOverview: job.description };
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
      ? checklistText
          .split('\n')
          .map((line) => line.replace(/^[-•*]\s*/, '').trim())
          .filter(Boolean)
      : [];

    const rawRoleOverview = parts[1]?.trim() || '';
    const cleanRoleOverview = (rawRoleOverview || job.description)
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

  const daysLeft = getDaysUntilExpiration(job.validThrough);

  const formatSalary = (salary: JobPosting['salary']) => {
    if (!salary || salary.min <= 0) return 'Competitive compensation based on qualifications';
    const currencySymbol = salary.currency === 'EUR' ? '€' : salary.currency === 'GBP' ? '£' : '$';
    const isHourly = salary.unit === 'HOUR' && (salary.max || salary.min) < 500;
    if (isHourly) {
      return `${currencySymbol}${salary.min}${salary.max && salary.max !== salary.min ? `–${currencySymbol}${salary.max}` : ''} / hour`;
    }
    const minFormatted = salary.min >= 1000 ? `${Math.round(salary.min / 1000)}k` : `${salary.min}`;
    const maxFormatted = salary.max && salary.max >= 1000 ? `${Math.round(salary.max / 1000)}k` : `${salary.max}`;
    return `${currencySymbol}${minFormatted}${maxFormatted && maxFormatted !== minFormatted ? `–${currencySymbol}${maxFormatted}` : ''} / year`;
  };

  // Find 3-4 active related early-career jobs (ensuring they are active to rescue visitors on expired pages)
  const relatedJobs = allJobs
    .filter((j) => j.id !== job.id && !isJobExpired(j) && (j.category === job.category || j.experienceLevel === job.experienceLevel || j.isRemote))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#202124]">
      {/* Top Navigation & Breadcrumb Header */}
      <div className="bg-white border-b border-[#dadce0] sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#1a73e8] hover:text-[#1557b0] px-3 py-1.5 rounded-full hover:bg-[#e8f0fe] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all jobs</span>
            </button>
            <span className="hidden sm:inline text-[#dadce0]">|</span>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#5f6368]">
              <span>Jobs</span>
              <ChevronRight className="w-3 h-3 text-[#80868b]" />
              <span>{job.category || 'Engineering'}</span>
              <ChevronRight className="w-3 h-3 text-[#80868b]" />
              <span className="font-medium text-[#202124] truncate max-w-[200px]">{job.company}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(job.id)}
                title={isSaved ? 'Remove from saved jobs' : 'Save job'}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-[#fef7e0] border-[#f9ab00] text-[#b06000]'
                    : 'bg-white border-[#dadce0] text-[#5f6368] hover:text-[#1a73e8] hover:border-[#1a73e8]'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#f9ab00] text-[#f9ab00]' : ''}`} />
              </button>
            )}

            <SocialShare job={job} compact={true} />

            {isExpired ? (
              <span className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1.5 shadow-2xs">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Position Filled</span>
              </span>
            ) : (
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackApplyClick(job)}
                className="text-xs sm:text-sm font-medium px-4 py-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer no-underline"
              >
                <span>{applyButtonText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Expired Job Preservation Banner */}
        {isExpired && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm sm:text-base font-bold text-amber-950">
                  This requisition at {job.company} has been filled or closed
                </h2>
                <p className="text-xs sm:text-sm text-amber-800 mt-0.5 leading-relaxed">
                  The original application window has passed. We retain this job overview, interview preparation notes, and salary benchmarks for career research. Browse our verified active early-career roles below.
                </p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs sm:text-sm whitespace-nowrap shadow-xs transition-colors cursor-pointer"
            >
              Browse Active Jobs
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Job Article (8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Primary Job Header Card */}
            <div className="bg-white rounded-2xl border border-[#dadce0] p-6 sm:p-8 shadow-xs">
              <div className="flex items-start gap-4 mb-4">
                {/* Company Logo / Avatar */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-[#e8eaed] bg-white p-2 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt={`${job.company} logo`}
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-lg rounded-lg">
                      {job.company.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-base sm:text-lg text-[#202124]">{job.company}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#137333] bg-[#e6f4ea] px-2.5 py-0.5 rounded-full border border-[#ceead6]">
                      <CheckCircle2 className="w-3 h-3 text-[#137333]" />
                      Verified Requisition
                    </span>
                    {job.isRemote && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1a73e8] bg-[#e8f0fe] px-2.5 py-0.5 rounded-full border border-[#d2e3fc]">
                        <Globe className="w-3 h-3" />
                        Remote Option
                      </span>
                    )}
                  </div>

                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#202124] tracking-tight leading-snug">
                    {job.title}
                  </h1>
                </div>
              </div>

              {/* Badges, Location, Salary, Date Posted */}
              <div className="flex items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-[#5f6368] flex-wrap pt-2 border-t border-[#f1f3f4]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#80868b]" />
                  <span>{job.location}</span>
                </div>

                <div className="flex items-center gap-1.5 text-[#137333] font-medium">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatSalary(job.salary)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#80868b]" />
                  <span>Posted {job.datePosted}</span>
                </div>

                {/* Experience Badge */}
                <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-[#f1f3f4] text-[#3c4043] border border-[#dadce0]">
                  {job.experienceLevel === 'Internship' ? 'Internship' : 'Entry/Early Career'}
                </span>
              </div>

              {/* Mobile CTA Button */}
              <div className="mt-6 pt-4 border-t border-[#f1f3f4] flex sm:hidden">
                {isExpired ? (
                  <button
                    onClick={onBack}
                    className="w-full text-center text-sm font-medium py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Position Closed – View Active Openings</span>
                  </button>
                ) : (
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackApplyClick(job)}
                    className="w-full text-center text-sm font-medium py-3 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white transition-all flex items-center justify-center gap-2 shadow-xs no-underline"
                  >
                    <span>{applyButtonText}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* In-Article Leaderboard Ad if configured */}
            {adConfig.enabled && adConfig.inFeedAd && (
              <div className="my-4">
                <AdSlot type="in-feed" config={adConfig} />
              </div>
            )}

            {/* Editorial FreshCommits Edge (if present) */}
            {edgeData.hasEdge && (
              <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-white rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-indigo-900 font-semibold text-base sm:text-lg">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>The FreshCommits Editorial Take</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                  {edgeData.careerTake}
                </p>
                {edgeData.checklistItems.length > 0 && (
                  <div className="pt-3 border-t border-indigo-100">
                    <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      💡 Candidate Preparation Checklist:
                    </span>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                      {edgeData.checklistItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Full Authentic Job Description */}
            <div className="bg-white rounded-2xl border border-[#dadce0] p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#202124] mb-3">
                  About the Role
                </h2>
                <div className="text-xs sm:text-sm text-[#3c4043] leading-relaxed whitespace-pre-line font-normal">
                  {edgeData.roleOverview || job.description}
                </div>
              </div>

              {/* Key Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="pt-4 border-t border-[#f1f3f4]">
                  <h3 className="text-base sm:text-lg font-bold text-[#202124] mb-3">
                    Key Responsibilities
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#3c4043] leading-relaxed">
                    {job.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] mt-2 flex-shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Qualifications */}
              {job.qualifications && job.qualifications.length > 0 && (
                <div className="pt-4 border-t border-[#f1f3f4]">
                  <h3 className="text-base sm:text-lg font-bold text-[#202124] mb-3">
                    Qualifications &amp; Experience
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#3c4043] leading-relaxed">
                    {job.qualifications.map((qual, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#137333] mt-2 flex-shrink-0" />
                        <span>{qual}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills & Tech Stack */}
              {job.skills && job.skills.length > 0 && (
                <div className="pt-4 border-t border-[#f1f3f4]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#5f6368] mb-2.5">
                    Skills &amp; Technologies
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {job.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-[#f8f9fa] text-[#3c4043] border border-[#dadce0] px-3 py-1 rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Verification & Application Guarantee Box */}
            <div className="bg-[#e8f0fe]/50 border border-[#d2e3fc] rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-[#1a73e8] flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-[#1a73e8]">
                    Verified Direct Employer Routing
                  </h3>
                  <p className="text-xs sm:text-sm text-[#3c4043] leading-relaxed">
                    This requisition is verified for <strong>≤ 2 years of experience</strong> or paid internships. You are applying directly on <strong>{job.company}</strong>'s official career portal. No recruiter intermediaries, resume harvesting, or third-party marketing signups.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#d2e3fc] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5f6368]">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#80868b]" />
                  <span>
                    Valid through: <strong>{job.validThrough || 'Open until filled'}</strong>
                    {daysLeft !== null && daysLeft > 0 && ` (${daysLeft} days remaining)`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleReportJob}
                  disabled={reportSubmitted}
                  className="text-[11px] text-[#80868b] hover:text-[#d93025] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Flag className="w-3 h-3" />
                  <span>{reportSubmitted ? '✓ Report recorded for review' : 'Report expired or invalid listing'}</span>
                </button>
              </div>

              {/* Bottom Apply CTA Banner */}
              <div className="pt-2">
                {isExpired ? (
                  <button
                    onClick={onBack}
                    className="w-full text-center text-sm font-medium py-3.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Position Closed – View All Active Roles</span>
                  </button>
                ) : (
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackApplyClick(job)}
                    className="w-full text-center text-sm font-medium py-3.5 px-6 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white transition-all flex items-center justify-center gap-2 shadow-xs no-underline"
                  >
                    <span>{applyButtonText}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Job Overview Card */}
            <div className="bg-white rounded-2xl border border-[#dadce0] p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#202124]">
                Job Overview
              </h3>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div>
                  <span className="block text-[11px] text-[#5f6368] font-medium uppercase">Employer</span>
                  <span className="font-semibold text-[#202124]">{job.company}</span>
                </div>

                <div>
                  <span className="block text-[11px] text-[#5f6368] font-medium uppercase">Experience</span>
                  <span className="font-medium text-[#202124]">
                    {job.experienceLevel === 'Internship' ? 'Internship' : 'Entry/Early Career'}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] text-[#5f6368] font-medium uppercase">Employment Type</span>
                  <span className="font-medium text-[#202124]">
                    {job.employmentType === 'FULL_TIME' ? 'Full Time' : job.employmentType === 'INTERN' ? 'Internship' : job.employmentType}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] text-[#5f6368] font-medium uppercase">Location</span>
                  <span className="font-medium text-[#202124]">{job.location}</span>
                </div>

                <div>
                  <span className="block text-[11px] text-[#5f6368] font-medium uppercase">Compensation</span>
                  <span className="font-semibold text-[#137333]">{formatSalary(job.salary)}</span>
                </div>

                <div>
                  <span className="block text-[11px] text-[#5f6368] font-medium uppercase">Date Posted</span>
                  <span className="font-medium text-[#202124]">{job.datePosted}</span>
                </div>

                <div>
                  <span className="block text-[11px] text-[#5f6368] font-medium uppercase">Application Channel</span>
                  <span className="font-medium text-[#202124]">Official Company Portal</span>
                </div>
              </div>

              {/* Direct Apply Button in Sidebar */}
              <div className="pt-2">
                {isExpired ? (
                  <button
                    onClick={onBack}
                    className="w-full text-center text-xs sm:text-sm font-medium py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Browse Active Jobs</span>
                  </button>
                ) : (
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackApplyClick(job)}
                    className="w-full text-center text-xs sm:text-sm font-medium py-3 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white transition-all flex items-center justify-center gap-1.5 shadow-xs no-underline"
                  >
                    <span>{applyButtonText}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Share this Job Card */}
            <div className="bg-white rounded-2xl border border-[#dadce0] p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#202124]">
                Share this Opening
              </h3>
              <p className="text-xs text-[#5f6368]">
                Help a fellow early-career engineer or student find this opportunity:
              </p>
              <div className="pt-1">
                <SocialShare job={job} compact={false} />
              </div>
              <div className="pt-2 border-t border-[#f1f3f4]">
                <button
                  onClick={handleCopyUrl}
                  className="w-full text-xs font-medium py-2 px-3 rounded-lg border border-[#dadce0] bg-[#f8f9fa] hover:bg-[#f1f3f4] text-[#3c4043] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#137333]" /> : <Copy className="w-3.5 h-3.5 text-[#80868b]" />}
                  <span>{copiedUrl ? 'Copied Link!' : 'Copy Permanent Job Link'}</span>
                </button>
              </div>
            </div>

            {/* Sidebar Ad Slot */}
            {adConfig.enabled && adConfig.detailSidebarAd && (
              <div className="my-2">
                <AdSlot type="sidebar" config={adConfig} />
              </div>
            )}

            {/* Related Early Career Jobs */}
            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#dadce0] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#202124]">
                    {isExpired ? 'Recommended Active Openings' : 'Similar Opportunities'}
                  </h3>
                  {isExpired && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active Now
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {relatedJobs.map((relJob) => (
                    <div
                      key={relJob.id}
                      onClick={() => onSelectRelatedJob ? onSelectRelatedJob(relJob) : window.open(`/job/${relJob.id}`, '_blank')}
                      className="p-3 rounded-xl border border-[#f1f3f4] hover:border-[#1a73e8] bg-[#f8f9fa] hover:bg-white transition-all cursor-pointer group"
                    >
                      <span className="text-[11px] font-semibold text-[#5f6368] group-hover:text-[#1a73e8] block">
                        {relJob.company}
                      </span>
                      <h4 className="text-xs font-bold text-[#202124] group-hover:text-[#1a73e8] line-clamp-1 mb-1">
                        {relJob.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-[#80868b]">
                        <span>{relJob.location}</span>
                        <span className="text-[#137333] font-medium">{formatSalary(relJob.salary)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
