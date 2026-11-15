import React, { useEffect, useState, useMemo } from 'react';
import { JobPosting, AdSenseConfig } from '../types';
import { generateJobDetailGraphSchema, injectJobJsonLd } from '../utils/schemaGenerator';
import { trackJobView, trackApplyClick } from '../utils/analytics';
import { isJobExpired } from '../utils/jobAggregator';
import { cleanLocationString } from '../utils/textHumanizer';
import { resolveCompanyLogo } from '../utils/logoHelper';
import { CAREER_ARTICLES } from '../data/careerArticles';
import { getContextualArticlesForJob } from '../utils/relatedJobsMatcher';
import { AdSlot } from './AdSlot';
import { SocialShare } from './SocialShare';
import {
  sanitizeJobTitle,
  sanitizeAtsHtml,
  formatPlainTextJobDescription,
  htmlToReadableText,
  formatDisclosedSalary,
  resolveWorkMode,
} from '../utils/jobSanitizer';
import {
  MapPin,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  Flag,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  BookOpen,
  Building2,
  Loader2,
  CheckCircle2,
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
  onSelectRelatedJob,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedJd, setCopiedJd] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [isHydratingAts, setIsHydratingAts] = useState(false);
  const [hydratedHtml, setHydratedHtml] = useState<string | null>(null);
  const [hydratedText, setHydratedText] = useState<string | null>(null);

  const isExpired = isJobExpired(job) || (job.status && job.status !== 'ACTIVE');
  const cleanTitle = sanitizeJobTitle(job.title) || job.title;
  const workMode = resolveWorkMode(job);
  const salaryLabel = formatDisclosedSalary(job.salary, job.salaryDisclosed);
  const safeLogo = resolveCompanyLogo(job.company, job.companyLogo, job.companyWebsite);
  const canonicalUrl = `https://www.freshcommits.com/job/${encodeURIComponent(job.id)}`;

  const applyButtonText = job.company
    ? job.company.length > 22
      ? 'Apply on Company Site'
      : `Apply - ${job.company}`
    : 'Apply Now';

  // Live 1:1 ATS description hydration on mount (only when HTML missing or stored JD is short)
  useEffect(() => {
    let cancelled = false;
    setHydratedHtml(null);
    setHydratedText(null);

    const existingHtml = job.descriptionHtml ? sanitizeAtsHtml(job.descriptionHtml) : '';
    if (existingHtml && existingHtml.length > 400) {
      setHydratedHtml(existingHtml);
      setHydratedText(htmlToReadableText(existingHtml));
      return;
    }

    const cacheKey = `fc_ats_jd_${job.id}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.descriptionHtml && parsed.descriptionHtml.length > 150) {
          setHydratedHtml(parsed.descriptionHtml);
          setHydratedText(parsed.descriptionText || htmlToReadableText(parsed.descriptionHtml));
          return;
        }
      }
    } catch {}

    const storedLen = (job.description || '').trim().length;
    const needsHydration = !existingHtml || storedLen < 250;

    if (!needsHydration || !job.applyUrl) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);
    setIsHydratingAts(true);

    const params = new URLSearchParams({
      url: job.applyUrl,
      company: job.company || '',
      title: cleanTitle || '',
      location: job.location || '',
    });

    fetch(`/api/jobs/${encodeURIComponent(job.id)}?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        if (data.descriptionHtml && data.descriptionHtml.length > 80) {
          const safeHtml = sanitizeAtsHtml(data.descriptionHtml);
          const readable = data.descriptionText || htmlToReadableText(safeHtml);
          if (safeHtml && readable.length > 60) {
            setHydratedHtml(safeHtml);
            setHydratedText(readable);
            try {
              sessionStorage.setItem(
                cacheKey,
                JSON.stringify({ descriptionHtml: safeHtml, descriptionText: readable })
              );
            } catch {}
          }
        }
      })
      .catch(() => {
        // Keep stored fallback silently if ATS blocks or times out
      })
      .finally(() => {
        clearTimeout(timeoutId);
        if (!cancelled) setIsHydratingAts(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [job.id, job.applyUrl, job.descriptionHtml, job.description, job.company, job.location, cleanTitle]);

  // Resolved formatted job description (hydrated ATS HTML -> stored sanitized HTML -> formatted plain text)
  const resolvedDescription = useMemo(() => {
    if (hydratedHtml && hydratedHtml.length > 80) {
      return {
        html: hydratedHtml,
        text: hydratedText || htmlToReadableText(hydratedHtml),
      };
    }

    if (job.descriptionHtml) {
      const cleanHtml = sanitizeAtsHtml(job.descriptionHtml);
      if (cleanHtml && cleanHtml.length > 80) {
        return {
          html: cleanHtml,
          text: htmlToReadableText(cleanHtml),
        };
      }
    }

    const formatted = formatPlainTextJobDescription(
      job.description || '',
      job.responsibilities || [],
      job.qualifications || []
    );

    return {
      html:
        formatted.html ||
        `<p>Official early-career software engineering requisition for ${cleanTitle} at ${job.company}.</p>`,
      text: formatted.text,
    };
  }, [hydratedHtml, hydratedText, job.descriptionHtml, job.description, job.responsibilities, job.qualifications, cleanTitle, job.company]);

  // Dynamic Title, Meta Description, Canonical, Robots & JSON-LD Schema injection
  useEffect(() => {
    const hydratedJob: JobPosting = hydratedHtml
      ? { ...job, descriptionHtml: hydratedHtml, description: resolvedDescription.text || job.description }
      : job;

    trackJobView(hydratedJob);
    const schema = generateJobDetailGraphSchema(hydratedJob);
    const cleanup = injectJobJsonLd(schema);

    const originalTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const originalDesc = metaDesc ? metaDesc.content : '';

    document.title = `${cleanTitle} at ${job.company} | FreshCommits`;
    if (metaDesc) {
      const snippet = (resolvedDescription.text || '').replace(/\s+/g, ' ').slice(0, 150).trim();
      metaDesc.content = `${cleanTitle} at ${job.company} (${job.location || 'Remote'}). ${snippet}`;
    }

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const originalHref = canonical ? canonical.href : 'https://www.freshcommits.com/';
    if (canonical) {
      canonical.href = canonicalUrl;
    }

    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }
    const originalRobots = robotsMeta.content || 'index, follow';
    robotsMeta.content = isExpired
      ? 'noindex, follow'
      : 'index, follow, max-image-preview:large';

    return () => {
      cleanup();
      document.title = originalTitle;
      if (metaDesc) metaDesc.content = originalDesc;
      if (canonical) canonical.href = originalHref;
      if (robotsMeta) robotsMeta.content = originalRobots;
    };
  }, [job, cleanTitle, canonicalUrl, isExpired, hydratedHtml, resolvedDescription.text]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [job.id]);

  const handleCopyUrl = () => {
    const jobUrl = `${window.location.origin}/job/${encodeURIComponent(job.id)}`;
    navigator.clipboard.writeText(jobUrl).catch(() => {});
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyJd = () => {
    const fullText = `${cleanTitle} — ${job.company}\nLocation: ${job.location || workMode}\n\n${resolvedDescription.text}`;
    navigator.clipboard.writeText(fullText).catch(() => {});
    setCopiedJd(true);
    setTimeout(() => setCopiedJd(false), 2000);
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
          healthStatus: (job.closedReportCount || 0) + 1 >= 2 ? 'CANDIDATE_REPORTED' : job.healthStatus,
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

  const relatedJobs = useMemo(() => {
    return allJobs
      .filter(
        (j) =>
          j.id !== job.id &&
          !isJobExpired(j) &&
          (j.category === job.category || j.experienceLevel === job.experienceLevel || j.isRemote)
      )
      .slice(0, 3);
  }, [allJobs, job.id, job.category, job.experienceLevel]);

  const contextualArticles = useMemo(() => {
    return getContextualArticlesForJob(job, CAREER_ARTICLES, 2);
  }, [job]);

  return (
    <div className="min-h-screen bg-[#F0F8FF] text-[#202124] pb-24 lg:pb-12">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-[#dadce0] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#1a73e8] hover:text-[#1557b0] px-2.5 py-1.5 rounded-lg hover:bg-[#e8f0fe] transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Jobs</span>
            </button>

            <span className="hidden md:inline text-[#dadce0]">|</span>

            <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-xs text-[#5f6368] min-w-0">
              <a
                href="/jobs"
                onClick={(e) => {
                  e.preventDefault();
                  onBack();
                }}
                className="hover:text-[#1a73e8] transition-colors whitespace-nowrap"
              >
                All Jobs
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-[#80868b] flex-shrink-0" />
              <span className="whitespace-nowrap">{job.category || 'Engineering'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#80868b] flex-shrink-0" />
              <span className="font-medium text-[#202124] truncate max-w-[260px]">{cleanTitle}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(job.id)}
                title={isSaved ? 'Remove from saved jobs' : 'Save job'}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-[#fef7e0] border-[#f9ab00] text-[#b06000]'
                    : 'bg-white border-[#dadce0] text-[#5f6368] hover:text-[#1a73e8] hover:border-[#1a73e8]'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#f9ab00] text-[#f9ab00]' : ''}`} />
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyUrl}
              title="Copy job link"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dadce0] bg-white hover:bg-[#f8f9fa] text-xs font-medium text-[#3c4043] cursor-pointer"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#137333]" /> : <Copy className="w-3.5 h-3.5 text-[#5f6368]" />}
              <span>{copiedUrl ? 'Copied Link' : 'Copy Link'}</span>
            </button>

            {isExpired ? (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-300 inline-flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Position Closed</span>
              </span>
            ) : (
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackApplyClick(job)}
                className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white transition-colors inline-flex items-center gap-1.5 no-underline whitespace-nowrap"
              >
                <span>{applyButtonText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Expired Banner for Human Visitors */}
        {isExpired && (
          <div className="mb-6 p-4 sm:p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm sm:text-base font-bold text-amber-950">
                  Position Closed — {job.company}
                </h2>
                <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                  This requisition is no longer accepting new applications. Explore active early-career openings in the sidebar or return to all jobs.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm whitespace-nowrap cursor-pointer"
            >
              Browse Active Jobs
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left 2/3 Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Hero Header Card */}
            <section className="bg-white rounded-2xl border border-[#dadce0] p-6 sm:p-7 shadow-2xs space-y-5">
              <div className="flex items-start gap-4">
                <img
                  src={safeLogo}
                  alt={`${job.company} logo`}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-contain p-1.5 border border-[#e8eaed] bg-white flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      job.company
                    )}&background=0F172A&color=fff&size=128&bold=true`;
                  }}
                />

                <div className="flex-1 min-w-0">
                  <div className="text-sm sm:text-base font-semibold text-[#1a73e8] mb-1">
                    {job.company}
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-[#202124] tracking-tight leading-snug">
                    {cleanTitle}
                  </h1>

                  {/* Key Metadata Row */}
                  <div className="flex items-center gap-x-3 gap-y-1.5 flex-wrap text-xs sm:text-sm text-[#5f6368] mt-3">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#80868b]" />
                      <span>{cleanLocationString(job.location || 'United States')}</span>
                    </span>
                    <span aria-hidden="true" className="text-[#dadce0]">&middot;</span>
                    <span className="font-medium text-[#3c4043]">{workMode}</span>
                    <span aria-hidden="true" className="text-[#dadce0]">&middot;</span>
                    <span className="font-medium text-[#3c4043]">
                      {job.experienceLevel === 'Internship'
                        ? 'Internship'
                        : job.experienceLevel === 'New Grad'
                        ? 'New Grad'
                        : 'Entry-Level'}
                    </span>
                    {salaryLabel && (
                      <>
                        <span aria-hidden="true" className="text-[#dadce0]">&middot;</span>
                        <span className="font-semibold text-[#137333] tabular-nums">
                          {salaryLabel}
                        </span>
                      </>
                    )}
                    <span aria-hidden="true" className="text-[#dadce0]">&middot;</span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Calendar className="w-3.5 h-3.5 text-[#80868b]" />
                      <span>Posted {job.datePosted || 'Recently'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-[#f1f3f4] flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {!isExpired && (
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackApplyClick(job)}
                      className="px-5 py-2.5 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-semibold transition-colors inline-flex items-center gap-2 no-underline"
                    >
                      <span>{applyButtonText}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {onToggleSave && (
                    <button
                      type="button"
                      onClick={() => onToggleSave(job.id)}
                      className={`px-4 py-2.5 rounded-lg border text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isSaved
                          ? 'bg-[#fef7e0] border-[#f9ab00] text-[#b06000]'
                          : 'bg-white border-[#dadce0] text-[#3c4043] hover:bg-[#f8f9fa]'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#f9ab00]' : ''}`} />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="px-4 py-2.5 rounded-lg border border-[#dadce0] bg-white hover:bg-[#f8f9fa] text-xs sm:text-sm font-medium text-[#3c4043] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-[#137333]" /> : <Copy className="w-4 h-4 text-[#5f6368]" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>

                <SocialShare job={job} compact={true} />
              </div>
            </section>

            {/* Authentic Job Description Card */}
            <section className="bg-white rounded-2xl border border-[#dadce0] p-6 sm:p-8 shadow-2xs space-y-5">
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#f1f3f4] flex-wrap">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#1a73e8]" />
                  <h2 className="text-base sm:text-lg font-bold text-[#202124]">
                    Job Description
                  </h2>
                  {isHydratingAts && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#5f6368] ml-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1a73e8]" />
                      <span>Loading full details...</span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCopyJd}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dadce0] bg-[#f8f9fa] hover:bg-[#f1f3f4] text-xs font-medium text-[#3c4043] transition-colors cursor-pointer"
                >
                  {copiedJd ? <Check className="w-3.5 h-3.5 text-[#137333]" /> : <Copy className="w-3.5 h-3.5 text-[#5f6368]" />}
                  <span>{copiedJd ? 'Copied JD' : 'Copy JD'}</span>
                </button>
              </div>

              {/* Clean Sanitized ATS HTML or Formatted Plain Text */}
              <div
                className="text-sm text-[#3c4043] leading-relaxed break-words
                  [&_p]:mb-3.5 [&_p]:leading-relaxed
                  [&_h2]:text-base [&_h2]:sm:text-lg [&_h2]:font-bold [&_h2]:text-[#202124] [&_h2]:mt-6 [&_h2]:mb-2.5
                  [&_h3]:text-sm [&_h3]:sm:text-base [&_h3]:font-bold [&_h3]:text-[#202124] [&_h3]:mt-5 [&_h3]:mb-2
                  [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-[#202124] [&_h4]:mt-4 [&_h4]:mb-1.5
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mb-4
                  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:mb-4
                  [&_li]:leading-relaxed
                  [&_strong]:font-semibold [&_strong]:text-[#202124]
                  [&_b]:font-semibold [&_b]:text-[#202124]
                  [&_a]:text-[#1a73e8] [&_a]:underline [&_a]:break-all"
                dangerouslySetInnerHTML={{ __html: resolvedDescription.html }}
              />

              {/* Skills / Tags */}
              {job.skills && job.skills.length > 0 && (
                <div className="pt-5 border-t border-[#f1f3f4] space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#5f6368]">
                    Skills &amp; Technologies
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {job.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-[#f8f9fa] text-[#3c4043] border border-[#e8eaed] px-2.5 py-1 rounded-md font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Apply & Report Footer */}
              <div className="pt-5 border-t border-[#f1f3f4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleReportJob}
                  disabled={reportSubmitted}
                  className="text-xs text-[#5f6368] hover:text-[#d93025] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{reportSubmitted ? 'Report submitted — thank you' : 'Report expired or invalid listing'}</span>
                </button>

                {!isExpired && (
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackApplyClick(job)}
                    className="px-6 py-3 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 no-underline"
                  >
                    <span>{applyButtonText}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </section>

            {/* In-Feed AdSlot */}
            {adConfig.enabled && adConfig.inFeedAd && (
              <div className="my-2">
                <AdSlot type="in-feed" config={adConfig} />
              </div>
            )}
          </div>

          {/* Right 1/3 Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Job Summary Card */}
            <div className="bg-white rounded-2xl border border-[#dadce0] p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#202124]">
                Job Summary
              </h3>

              <dl className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start justify-between gap-2">
                  <dt className="text-[#5f6368]">Company</dt>
                  <dd className="font-semibold text-[#202124] text-right">{job.company}</dd>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <dt className="text-[#5f6368]">Location</dt>
                  <dd className="font-medium text-[#202124] text-right">
                    {cleanLocationString(job.location || 'United States')}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <dt className="text-[#5f6368]">Work Mode</dt>
                  <dd className="font-medium text-[#202124] text-right">{workMode}</dd>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <dt className="text-[#5f6368]">Experience</dt>
                  <dd className="font-medium text-[#202124] text-right">
                    {job.experienceLevel === 'Internship'
                      ? 'Internship'
                      : job.experienceLevel === 'New Grad'
                      ? 'New Grad'
                      : 'Entry-Level (0–2 YoE)'}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <dt className="text-[#5f6368]">Employment</dt>
                  <dd className="font-medium text-[#202124] text-right">
                    {job.employmentType === 'FULL_TIME'
                      ? 'Full-time'
                      : job.employmentType === 'INTERN'
                      ? 'Internship'
                      : job.employmentType || 'Full-time'}
                  </dd>
                </div>
                {salaryLabel && (
                  <div className="flex items-start justify-between gap-2">
                    <dt className="text-[#5f6368]">Compensation</dt>
                    <dd className="font-semibold text-[#137333] text-right tabular-nums">{salaryLabel}</dd>
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <dt className="text-[#5f6368]">Posted</dt>
                  <dd className="font-medium text-[#202124] text-right tabular-nums">
                    {job.datePosted || 'Recently'}
                  </dd>
                </div>
              </dl>

              <div className="pt-2 hidden lg:block">
                {isExpired ? (
                  <button
                    type="button"
                    onClick={onBack}
                    className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Browse Active Jobs
                  </button>
                ) : (
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackApplyClick(job)}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 no-underline"
                  >
                    <span>{applyButtonText}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Work Authorization Card */}
            <div className="bg-white rounded-2xl border border-[#dadce0] p-6 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1a73e8]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#202124]">
                  Work Authorization
                </h3>
              </div>

              {(job.stemOptEVerified || job.eVerify || job.visaSponsorship || job.usCitizenOnly) ? (
                <ul className="space-y-2 text-xs text-[#3c4043]">
                  {(job.stemOptEVerified || job.eVerify) && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span>
                        {job.stemOptEVerified
                          ? 'STEM OPT Eligible (USCIS E-Verify)'
                          : 'USCIS E-Verify Enrolled Employer'}
                      </span>
                    </li>
                  )}
                  {job.visaSponsorship && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1a73e8] flex-shrink-0" />
                      <span>Visa Sponsorship Mentioned</span>
                    </li>
                  )}
                  {job.usCitizenOnly && (
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>US Citizenship Required</span>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-xs text-[#5f6368] leading-relaxed">
                  Check the official application portal for specific work authorization and sponsorship eligibility requirements.
                </p>
              )}
            </div>

            {/* Sidebar AdSlot */}
            {adConfig.enabled && adConfig.detailSidebarAd && (
              <div className="my-2">
                <AdSlot type="sidebar" config={adConfig} />
              </div>
            )}

            {/* Similar Jobs */}
            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#dadce0] p-6 shadow-2xs space-y-3.5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#202124]">
                  {isExpired ? 'Active Similar Jobs' : 'Similar Jobs'}
                </h3>
                <div className="space-y-2.5">
                  {relatedJobs.map((rel) => {
                    const relTitle = sanitizeJobTitle(rel.title) || rel.title;
                    const relSalary = formatDisclosedSalary(rel.salary, rel.salaryDisclosed);
                    return (
                      <a
                        key={rel.id}
                        href={`/job/${encodeURIComponent(rel.id)}`}
                        onClick={(e) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
                          e.preventDefault();
                          if (onSelectRelatedJob) {
                            onSelectRelatedJob(rel);
                          } else {
                            window.location.href = `/job/${encodeURIComponent(rel.id)}`;
                          }
                        }}
                        className="block p-3.5 rounded-xl border border-[#e8eaed] hover:border-[#1a73e8] bg-[#f8f9fa] hover:bg-white transition-colors no-underline group"
                      >
                        <div className="text-xs font-semibold text-[#1a73e8]">{rel.company}</div>
                        <div className="text-sm font-semibold text-[#202124] group-hover:text-[#1a73e8] line-clamp-1 mt-0.5">
                          {relTitle}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#5f6368] mt-1.5 gap-2">
                          <span className="truncate">{rel.location || resolveWorkMode(rel)}</span>
                          {relSalary && (
                            <span className="text-[#137333] font-semibold tabular-nums flex-shrink-0">
                              {relSalary}
                            </span>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contextual Editorial Field Guides */}
            {contextualArticles.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#dadce0] p-6 shadow-2xs space-y-3">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#1a73e8]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#202124]">
                    Career &amp; Interview Guides
                  </h3>
                </div>
                <div className="space-y-2.5">
                  {contextualArticles.map((art) => (
                    <a
                      key={art.id}
                      href={`/insights/${art.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-xl border border-[#e8eaed] hover:border-[#1a73e8] bg-[#f8f9fa] hover:bg-white transition-colors no-underline group"
                    >
                      <div className="text-[11px] font-semibold text-[#1a73e8]">{art.tag}</div>
                      <div className="text-xs font-bold text-[#202124] group-hover:text-[#1a73e8] line-clamp-2 mt-0.5 leading-snug">
                        {art.title}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Sticky Mobile Apply Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xs border-t border-[#dadce0] px-4 py-2.5 flex items-center justify-between gap-3">
        {onToggleSave && (
          <button
            type="button"
            onClick={() => onToggleSave(job.id)}
            aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
            className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
              isSaved
                ? 'bg-[#fef7e0] border-[#f9ab00] text-[#b06000]'
                : 'bg-white border-[#dadce0] text-[#5f6368]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#f9ab00]' : ''}`} />
          </button>
        )}

        {isExpired ? (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-2.5 px-4 rounded-lg bg-amber-600 text-white text-sm font-semibold text-center cursor-pointer"
          >
            Position Closed — Browse Jobs
          </button>
        ) : (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackApplyClick(job)}
            className="flex-1 py-2.5 px-4 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-semibold flex items-center justify-center gap-2 no-underline"
          >
            <span className="truncate">{applyButtonText}</span>
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
          </a>
        )}
      </div>
    </div>
  );
};
