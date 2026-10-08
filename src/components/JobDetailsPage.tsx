import React, { useEffect, useState, useMemo } from 'react';
import { JobPosting, AdSenseConfig } from '../types';
import { generateJobPostingSchema, injectJobJsonLd } from '../utils/schemaGenerator';
import { trackJobView, trackApplyClick } from '../utils/analytics';
import { isJobExpired, getDaysUntilExpiration } from '../utils/jobAggregator';
import {
  humanizeCareerTake,
  generateLeadEngineerTake,
  generateCandidatePreparationChecklist,
  cleanLocationString,
  humanizeChecklistItems,
  generateRound1InterviewDrill
} from '../utils/textHumanizer';
import { cleanHtml, getRoleMarketBenchmark } from '../utils/jobExtractor';
import { resolveCompanyLogo } from '../utils/logoHelper';
import { CAREER_ARTICLES } from '../data/careerArticles';
import { getContextualArticlesForJob } from '../utils/relatedJobsMatcher';
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
  AlertCircle,
  ArrowRight,
  Target,
  FileSearch,
  BookOpen
} from 'lucide-react';
import { MockInterviewModal } from './MockInterviewModal';

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
  const [checkedPrepItems, setCheckedPrepItems] = useState<Record<number, boolean>>({});
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);

  const isExpired = isJobExpired(job) || (job.status && job.status !== 'ACTIVE');

  const benchmark = useMemo(() => {
    return getRoleMarketBenchmark(
      job.title,
      job.category,
      job.country || 'US',
      job.location || `${job.city || ''} ${job.state || ''}`,
      job.experienceLevel
    );
  }, [job.title, job.category, job.country, job.location, job.city, job.state, job.experienceLevel]);

  // Dynamic Title, Meta Description, Schema injection, and Canonical URL update
  useEffect(() => {
    trackJobView(job);
    const schema = generateJobPostingSchema(job);
    const cleanup = injectJobJsonLd(schema);

    // Save previous metadata
    const originalTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const originalDesc = metaDesc ? metaDesc.content : '';

    // Update title and meta description dynamically with long-tail keywords
    const hasLongTail = /(?:entry[\s-]level|0[\s-]2|junior|new\s*grad|intern|graduate|fresher)/i.test(job.title);
    const expTag = hasLongTail ? '' : (job.experienceLevel === 'Internship' ? ' (Internship)' : (job.experienceLevel === 'New Grad' ? ' (2026 New Grad)' : ' (0–2 YoE / Entry Level)'));
    document.title = `${job.title}${expTag} at ${job.company} – Direct ATS Apply | FreshCommits`;
    if (metaDesc) {
      metaDesc.content = `Apply directly for ${job.title} at ${job.company} in ${job.location || 'Remote'}. Verified early-career software engineering opportunity with direct employer ATS link (0–2 YoE, no ghost jobs). Free ATS resume match checker included.`;
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

  // Extract curated editorial insights if present or synthesize dynamically
  const edgeData = (() => {
    if (!job.description || !job.description.includes('🎯 The FreshCommits Career Take:')) {
      const dynamicTake = generateLeadEngineerTake({
        id: job.id,
        title: job.title,
        company: job.company,
        category: job.category,
        skills: job.skills
      });
      const dynamicChecklist = generateCandidatePreparationChecklist(job);
      return {
        hasEdge: true,
        careerTake: dynamicTake,
        checklistItems: dynamicChecklist,
        roleOverview: cleanHtml(job.description) || `${job.company} is seeking an enthusiastic ${job.title} to join their team.`
      };
    }
    const parts = job.description.split('🏢 Role Overview:');
    const edgeContent = parts[0] || '';
    const rawRoleOverview = parts[1]?.trim() || '';

    const takeMatch = edgeContent.match(/🎯 The FreshCommits Career Take:\s*([\s\S]*?)(?=💡 Candidate Preparation Checklist:|$)/i);
    const checklistMatch = edgeContent.match(/💡 Candidate Preparation Checklist:\s*([\s\S]*?)$/i);

    const rawCareerTake = takeMatch ? takeMatch[1].trim() : '';
    const careerTake = humanizeCareerTake(rawCareerTake, job);
    const checklistText = checklistMatch ? checklistMatch[1].trim() : '';
    const rawChecklistItems = checklistText
      ? checklistText
          .split('\n')
          .map((line) => line.replace(/^[-•*]\s*/, '').trim())
          .filter(Boolean)
      : [];

    const checklistItems = humanizeChecklistItems(rawChecklistItems, job);

    const cleanRoleOverview = cleanHtml(rawRoleOverview || job.description)
      .replace(/actively seeking an? early-career ([^.\n]+?)(?:,\s*Early Career)/gi, 'actively seeking a $1')
      .replace(/actively seeking an? early-career ([^.\n]+?)(?:,\s*Entry Level)/gi, 'actively seeking a $1')
      .replace(/early-career ([^.\n]+?), Early Career/gi, '$1')
      .replace(/This direct opening was discovered on [^.\n]+ official (?:[A-Za-z\s]+) portal\.?/gi, 'Candidates will collaborate closely with experienced technical mentors, contributing directly to live production systems.')
      .replace(/Direct Career Portal portal\.?/gi, 'Direct Career Portal.');

    return {
      hasEdge: true,
      careerTake,
      checklistItems,
      roleOverview: cleanRoleOverview
    };
  })();

  const cleanedResponsibilities = useMemo(() => {
    const overviewLower = (edgeData.roleOverview || '').toLowerCase();
    const list = (job.responsibilities || [])
      .map(cleanHtml)
      .map((r) => r.replace(/^[•\-\*–—\d\.\)]\s*/, '').trim())
      .filter((line) => {
        if (!line || line.length < 8) return false;
        const low = line.toLowerCase();
        if (/^(?:what you(?:’|'| )*(?:will|'ll)?\s*(?:do|bring)|responsibilities|key responsibilities|the role|what you will be doing|your mission|core duties|qualifications|requirements|basic qualifications|about us|who you are|who we are)[:\s]*$/i.test(low)) return false;
        if (/^about\s+[a-z0-9&.\-\s]+[:\s]/i.test(low)) return false;
        if (/^about us[:\s]/i.test(low)) return false;
        if (/^who we are[:\s]/i.test(low)) return false;
        if (/^our mission[:\s]/i.test(low)) return false;
        if (/^we are looking for\b/i.test(low)) return false;
        if (/^this is an ideal role\b/i.test(low)) return false;
        if (/^our team is\b/i.test(low)) return false;
        if (/^(?:in this role,\s*you will|as an?\s*[^,]+,\s*you will|you will\s*(?:be responsible for)?)[:\s]*$/i.test(low)) return false;
        if (overviewLower && (overviewLower.includes(low.slice(0, 35)) || (low.length > 40 && overviewLower.includes(low.slice(0, 50))))) return false;
        return true;
      });
    return list;
  }, [job.responsibilities, edgeData.roleOverview]);

  const cleanedQualifications = useMemo(() => {
    const overviewLower = (edgeData.roleOverview || '').toLowerCase();
    return (job.qualifications || [])
      .map(cleanHtml)
      .map((q) => q.replace(/^[•\-\*–—\d\.\)]\s*/, '').trim())
      .filter((line) => {
        if (!line || line.length < 8) return false;
        const low = line.toLowerCase();
        if (/^(?:what you(?:’|'| )*(?:will|'ll)?\s*bring|qualifications|requirements|basic qualifications|minimum qualifications|what we look for|who you are|about us)[:\s]*$/i.test(low)) return false;
        if (/^about\s+[a-z0-9&.\-\s]+[:\s]/i.test(low)) return false;
        if (/^(?:to be successful|requirements|qualifications|basic qualifications|minimum qualifications)[:\s]*$/i.test(low)) return false;
        if (cleanedResponsibilities.some((r: string) => r.toLowerCase() === low)) return false;
        if (overviewLower && (overviewLower.includes(low.slice(0, 35)) || (low.length > 40 && overviewLower.includes(low.slice(0, 50))))) return false;
        return true;
      });
  }, [job.qualifications, cleanedResponsibilities, edgeData.roleOverview]);

  const daysLeft = getDaysUntilExpiration(job.validThrough);

  const interviewDrill = useMemo(() => {
    return generateRound1InterviewDrill({
      title: job.title,
      category: job.category,
      skills: job.skills,
      company: job.company
    });
  }, [job.title, job.category, job.skills, job.company]);

  const formatSalary = (salary: JobPosting['salary']) => {
    if (!salary || salary.min <= 0) return 'Competitive compensation based on qualifications';
    const currencySymbol = salary.currency === 'EUR' ? '€' : salary.currency === 'GBP' ? '£' : salary.currency === 'INR' ? '₹' : salary.currency === 'CAD' ? 'CA$' : '$';
    if (salary.unit === 'HOUR') {
      return `${currencySymbol}${salary.min}${salary.max && salary.max !== salary.min ? `–${currencySymbol}${salary.max}` : ''} / hour`;
    }
    if (salary.unit === 'MONTH') {
      return `${currencySymbol}${salary.min.toLocaleString()}${salary.max && salary.max !== salary.min ? `–${currencySymbol}${salary.max.toLocaleString()}` : ''} / month`;
    }
    const minFormatted = salary.min >= 1000 ? `${Math.round(salary.min / 1000)}k` : `${salary.min}`;
    const maxFormatted = salary.max && salary.max >= 1000 ? `${Math.round(salary.max / 1000)}k` : `${salary.max}`;
    return `${currencySymbol}${minFormatted}${maxFormatted && maxFormatted !== minFormatted ? `–${currencySymbol}${maxFormatted}` : ''} / year`;
  };

  // Find 3-4 active related early-career jobs (ensuring they are active to rescue visitors on expired pages)
  const relatedJobs = allJobs
    .filter((j) => j.id !== job.id && !isJobExpired(j) && (j.category === job.category || j.experienceLevel === job.experienceLevel || j.isRemote))
    .slice(0, 4);

  const handleOpenAtsMatcherInNewTab = (e?: React.MouseEvent) => {
    const textToPass = `Job Title: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location || 'Remote'}\nSkills: ${(job.skills || []).join(', ')}\n\nDescription:\n${job.description || ''}\n\nResponsibilities:\n${(job.responsibilities || []).join('\n')}\n\nQualifications:\n${(job.qualifications || []).join('\n')}`;
    try {
      sessionStorage.setItem('freshcommits_ats_target_jd', textToPass);
      localStorage.setItem('freshcommits_ats_target_jd', textToPass);
    } catch {}
    // If clicked on an element that is not directly an <a> tag with target="_blank", open programmatically
    if (!e || (e.target as HTMLElement).tagName !== 'A') {
      window.open('/career-tools#ats-matcher', '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#202124]">
      {/* Top Navigation & Breadcrumb Header */}
      <div className="bg-white border-b border-[#dadce0] sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-[#1a73e8] hover:text-[#1557b0] px-2.5 py-1.5 rounded-full hover:bg-[#e8f0fe] transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4 flex-shrink-0" />
              <span>Back</span>
              <span className="hidden sm:inline">to all jobs</span>
            </button>
            <span className="hidden md:inline text-[#dadce0]">|</span>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-[#5f6368]">
              <span>Jobs</span>
              <ChevronRight className="w-3 h-3 text-[#80868b]" />
              <span>{job.category || 'Engineering'}</span>
              <ChevronRight className="w-3 h-3 text-[#80868b]" />
              <span className="font-medium text-[#202124] truncate max-w-[200px]">{job.company}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
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
              <span className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Closed</span>
              </span>
            ) : (
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackApplyClick(job)}
                className="text-xs sm:text-sm font-medium px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer no-underline whitespace-nowrap"
              >
                <span>Apply</span>
                <span className="hidden sm:inline">on Company Site</span>
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
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
                  {(() => {
                    const safeLogo = resolveCompanyLogo(job.company, job.companyLogo, job.companyWebsite);
                    return (
                      <img
                        src={safeLogo}
                        alt={`${job.company} logo`}
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            job.company
                          )}&background=0F172A&color=fff&size=128&bold=true`;
                        }}
                      />
                    );
                  })()}
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
                  <span>{cleanLocationString(job.location)}</span>
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

              {/* ATS Keyword Matcher Prompt Banner */}
              {!isExpired && (
                <div
                  onClick={(e) => handleOpenAtsMatcherInNewTab(e)}
                  className="mt-5 pt-4 border-t border-[#f1f3f4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/90 to-teal-50/50 border border-emerald-200/90 rounded-2xl p-4 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <FileSearch className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                        <span className="group-hover:text-emerald-700 transition-colors">Check Resume Match for This Role</span>
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Under 3 Seconds
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>Free automated scan: detects missing skills &amp; ATS filter-out risks.</span>
                        <span className="text-emerald-700 font-semibold">(Opens in new tab ↗)</span>
                      </p>
                    </div>
                  </div>

                  <a
                    href="/career-tools#ats-matcher"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenAtsMatcherInNewTab(e);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex-shrink-0 no-underline"
                    title="Open ATS Matcher in new tab"
                  >
                    <span>Scan My Resume</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </a>
                </div>
              )}
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
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-indigo-900 font-semibold text-base sm:text-lg">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <span>The FreshCommits Editorial Take</span>
                  </div>
                  <span className="text-[11px] font-semibold bg-indigo-100/80 text-indigo-800 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Lead Engineer Analysis
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal bg-white/70 p-3.5 rounded-xl border border-indigo-50 shadow-2xs">
                  {edgeData.careerTake}
                </p>
                {edgeData.checklistItems.length > 0 && (
                  <div className="pt-3 border-t border-indigo-100">
                    <div className="flex items-center justify-between mb-2.5 flex-wrap gap-1">
                      <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        💡 Candidate Preparation Checklist:
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Click items to track prep ({Object.values(checkedPrepItems).filter(Boolean).length}/{edgeData.checklistItems.length})
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                      {edgeData.checklistItems.map((item, idx) => {
                        const isDone = Boolean(checkedPrepItems[idx]);
                        return (
                          <li
                            key={idx}
                            onClick={() => setCheckedPrepItems((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                            className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer select-none ${
                              isDone
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                : 'bg-white/80 hover:bg-white border-slate-200/80 text-slate-800 hover:border-indigo-200 shadow-2xs'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${
                                isDone ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                              }`}
                            >
                              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className={isDone ? 'line-through opacity-85' : ''}>
                              {item.replace(/^•\s*/, '')}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Direct Project Blueprint Recommendation */}
                    <div className="pt-2">
                      <a
                        href="/project-blueprints"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 rounded-xl hover:border-indigo-300 transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">🚀</span>
                          <div className="text-xs">
                            <span className="font-bold text-indigo-950 block">
                              Need a Commercial Project on Your Resume for this Role?
                            </span>
                            <span className="text-indigo-700 text-[11px]">
                              Build the verified {job.category || 'Engineering'} Blueprint to stand out in technical screens.
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-indigo-700 group-hover:text-indigo-900 flex items-center gap-1 flex-shrink-0">
                          <span>View Blueprint</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Market Benchmark & Salary Intelligence */}
                <div className="pt-3 border-t border-indigo-100 flex items-start gap-3 bg-white/80 p-3.5 rounded-xl border border-indigo-50 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0 mt-0.5">
                    <DollarSign className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1 text-xs text-slate-700 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="font-bold text-slate-900">
                        Market Benchmark &amp; Salary Intelligence (0–2 YoE)
                      </span>
                      {benchmark.tierLabel && (
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/70">
                          {benchmark.tierLabel}
                        </span>
                      )}
                    </div>

                    {job.salary && job.salary.min > 0 ? (
                      <div className="text-slate-600 leading-relaxed space-y-1">
                        <p>
                          Verified Employer Compensation: <strong className="text-emerald-700">{formatSalary(job.salary)}</strong>.
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          Verified industry standard for {benchmark.roleLabel} in {benchmark.tierLabel}:{' '}
                          <strong className="text-slate-700 font-semibold">
                            {benchmark.currency} {benchmark.min.toLocaleString()} – {benchmark.max.toLocaleString()} / {benchmark.unit?.toLowerCase() || 'year'}
                          </strong>
                          {benchmark.unit === 'YEAR' && (
                            <span className="text-slate-400"> (Median: ~{benchmark.currency} {benchmark.percentile50.toLocaleString()})</span>
                          )}.
                        </p>
                      </div>
                    ) : (
                      <div className="text-slate-600 leading-relaxed space-y-1">
                        <p>
                          Employer did not disclose compensation in requisition.
                        </p>
                        <p className="text-slate-600">
                          FreshCommits 0–2 YoE market benchmark for {benchmark.roleLabel} in <span className="font-medium text-slate-800">{benchmark.tierLabel}</span>:{' '}
                          <strong className="text-emerald-700">
                            {benchmark.currency} {benchmark.min.toLocaleString()} – {benchmark.max.toLocaleString()} / {benchmark.unit?.toLowerCase() || 'year'}
                          </strong>
                          {benchmark.unit === 'YEAR' && (
                            <span className="text-slate-500 text-[11px]"> (Median: ~{benchmark.currency} {benchmark.percentile50.toLocaleString()}/yr)</span>
                          )}.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 🎯 Round 1 Interview Drill & Winning Formula */}
                <div className="pt-3 border-t border-indigo-100/90 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      🎯
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                        Round 1 Interview Drill &amp; Winning Formula
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        The practical engineering question tested in first-round technical screens for this role.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200/90 p-4 space-y-3 shadow-2xs">
                    {/* The Question */}
                    <div>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block mb-1">
                        1. The Core Question
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                        &ldquo;{interviewDrill.question}&rdquo;
                      </p>
                    </div>

                    {/* What They're Really Testing */}
                    <div>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 inline-block mb-1">
                        2. What the Interviewer is Really Testing
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {interviewDrill.testingObjective}
                      </p>
                    </div>

                    {/* The Winning Answer Formula */}
                    <div>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mb-1">
                        3. The Winning Answer Formula
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                        &ldquo;{interviewDrill.winningAnswerFormula}&rdquo;
                      </p>
                    </div>

                    {/* The Interviewer's Verdict (The Result) */}
                    <div className="pt-2 border-t border-slate-100 flex items-start gap-2 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200/80">
                      <span className="text-xs mt-0.5">💡</span>
                      <div className="text-xs text-emerald-950 leading-relaxed">
                        <strong className="text-emerald-900">The Result / Interviewer Perspective:</strong>{' '}
                        <span>{interviewDrill.interviewerVerdict}</span>
                      </div>
                    </div>

                    {/* Interactive 5-Round Mock Interview Launch Button */}
                    <button
                      type="button"
                      onClick={() => setIsMockModalOpen(true)}
                      className="w-full mt-2.5 py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:shadow-lg"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Launch 5-Round Mock Interview for {job.company} (Interactive Simulator)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
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
              {cleanedResponsibilities.length > 0 && (
                <div className="pt-4 border-t border-[#f1f3f4]">
                  <h3 className="text-base sm:text-lg font-bold text-[#202124] mb-3">
                    Key Responsibilities
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#3c4043] leading-relaxed">
                    {cleanedResponsibilities.map((resp: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] mt-2 flex-shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Qualifications */}
              {cleanedQualifications.length > 0 && (
                <div className="pt-4 border-t border-[#f1f3f4]">
                  <h3 className="text-base sm:text-lg font-bold text-[#202124] mb-3">
                    Qualifications &amp; Experience
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#3c4043] leading-relaxed">
                    {cleanedQualifications.map((qual: string, idx: number) => (
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

                <a
                  href="/career-tools#ats-matcher"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleOpenAtsMatcherInNewTab}
                  className="w-full text-center text-xs font-bold py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2.5 shadow-2xs no-underline"
                  title="Open ATS Matcher in new tab"
                >
                  <FileSearch className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Check Resume ATS Match (Under 3 Seconds)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
                </a>
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

              {/* Direct Apply Button in Sidebar (Desktop Only) */}
              <div className="pt-2 hidden lg:block">
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

            {/* Internal Linking Mesh: Relevant Career Field Guides for this Role */}
            {(() => {
              const contextualArticles = getContextualArticlesForJob(job, CAREER_ARTICLES, 2);
              if (contextualArticles.length === 0) return null;

              return (
                <div className="bg-gradient-to-br from-emerald-50/60 to-white rounded-2xl border border-emerald-200 p-5 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Interview &amp; Strategy Guides
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200">
                      E-E-A-T Verified
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Peer-reviewed engineering field guides tailored to prepare for {job.category?.toLowerCase() || 'technical'} screening rounds:
                  </p>

                  <div className="space-y-2.5">
                    {contextualArticles.map((art) => (
                      <a
                        key={art.id}
                        href={`/insights/${art.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl border border-emerald-200/80 bg-white hover:border-emerald-500 hover:shadow-xs transition-all block group text-left no-underline"
                      >
                        <div className="flex items-center justify-between text-[10px] text-emerald-700 font-bold mb-1">
                          <span>{art.tag}</span>
                          <span className="text-slate-400 font-medium">{art.readTime}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h4>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                          <span>By {art.author.name}</span>
                          <span className="text-emerald-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            Read Guide &rarr;
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>

                  <div className="pt-1">
                    <a
                      href="/insights"
                      className="text-center block text-[11px] font-bold text-emerald-800 hover:text-emerald-900 py-1.5 hover:underline"
                    >
                      Browse all {CAREER_ARTICLES.length} Technical Guides &rarr;
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </main>

      {/* 5-Round Mock Interview Modal Simulator */}
      {isMockModalOpen && (
        <MockInterviewModal job={job} onClose={() => setIsMockModalOpen(false)} />
      )}
    </div>
  );
};
