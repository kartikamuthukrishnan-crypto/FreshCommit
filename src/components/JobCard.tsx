import React from 'react';
import { JobPosting } from '../types';
import { MapPin, Calendar, Bookmark, ChevronRight, ShieldCheck } from 'lucide-react';
import { SocialShare } from './SocialShare';
import { resolveCompanyLogo } from '../utils/logoHelper';
import {
  sanitizeJobTitle,
  stripUiAndIconNoise,
  stripSyntheticWrapperSections,
  formatDisclosedSalary,
  resolveWorkMode,
} from '../utils/jobSanitizer';

interface JobCardProps {
  job: JobPosting;
  onSelect: (job: JobPosting) => void;
  onViewSchema?: (job: JobPosting) => void;
  isSaved?: boolean;
  onToggleSave?: (jobId: string, e: React.MouseEvent) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSelect, isSaved, onToggleSave }) => {
  const cleanTitle = sanitizeJobTitle(job.title) || job.title;
  const cleanSnippet = stripUiAndIconNoise(stripSyntheticWrapperSections(job.description || ''));
  const salaryLabel = formatDisclosedSalary(job.salary, job.salaryDisclosed);
  const workMode = resolveWorkMode(job);
  const safeLogo = resolveCompanyLogo(job.company, job.companyLogo, job.companyWebsite);

  const isRecent = () => {
    if (!job.datePosted) return false;
    const postDate = new Date(job.datePosted);
    if (isNaN(postDate.getTime())) return false;
    const diffDays = (Date.now() - postDate.getTime()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 4;
  };

  const handleOpenJob = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    try {
      sessionStorage.setItem(`job_${job.id}`, JSON.stringify(job));
      sessionStorage.setItem('freshcommit_last_job', JSON.stringify(job));
    } catch {}
    onSelect(job);
  };

  return (
    <article
      id={`job-card-${job.id}`}
      onClick={() => onSelect(job)}
      className="group relative bg-white rounded-2xl border border-[#dadce0] hover:border-[#1a73e8]/60 hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Top Header: Company + Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={safeLogo}
              alt={`${job.company} logo`}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-xl object-contain p-1 border border-[#e8eaed] bg-white flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  job.company
                )}&background=0F172A&color=fff&size=128&bold=true`;
              }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-[#202124] text-sm truncate">{job.company}</span>
                {isRecent() && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-md">
                    New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#5f6368] mt-0.5 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#80868b]" />
                  <span>{job.location || 'United States'}</span>
                </span>
                <span aria-hidden="true" className="text-[#dadce0]">&middot;</span>
                <span
                  className={`font-medium ${
                    workMode === 'Remote'
                      ? 'text-[#137333]'
                      : workMode === 'Hybrid'
                      ? 'text-[#1a73e8]'
                      : 'text-[#5f6368]'
                  }`}
                >
                  {workMode}
                </span>
              </div>
            </div>
          </div>

          {onToggleSave && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(job.id, e);
              }}
              title={isSaved ? 'Remove from saved jobs' : 'Save job'}
              aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
              className={`p-2 rounded-lg border transition-colors cursor-pointer flex-shrink-0 ${
                isSaved
                  ? 'bg-[#fef7e0] border-[#f9ab00] text-[#b06000]'
                  : 'bg-white border-[#dadce0] text-[#5f6368] hover:text-[#1a73e8] hover:border-[#1a73e8]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#f9ab00] text-[#f9ab00]' : ''}`} />
            </button>
          )}
        </div>

        {/* Clean Job Title */}
        <h3 className="text-base sm:text-[17px] font-semibold text-[#202124] group-hover:text-[#1a73e8] transition-colors mb-2 line-clamp-2 leading-snug">
          <a
            href={`/job/${encodeURIComponent(job.id)}`}
            onClick={handleOpenJob}
            className="no-underline text-inherit hover:text-[#1a73e8]"
          >
            {cleanTitle}
          </a>
        </h3>

        {/* Clean Snippet */}
        {cleanSnippet && (
          <p className="text-xs sm:text-[13px] text-[#5f6368] line-clamp-2 mb-3 leading-relaxed font-normal">
            {cleanSnippet}
          </p>
        )}

        {/* Disclosed Compensation & Work Auth (only rendered when explicitly present) */}
        {(salaryLabel || job.stemOptEVerified || job.eVerify || job.visaSponsorship || job.usCitizenOnly) && (
          <div className="flex items-center gap-2 text-xs font-medium mb-3 flex-wrap">
            {salaryLabel && (
              <span className="text-[#137333] bg-[#e6f4ea] px-2.5 py-1 rounded-md border border-[#ceead6] font-semibold tabular-nums">
                {salaryLabel}
              </span>
            )}
            {(job.stemOptEVerified || job.eVerify) && (
              <span
                className="inline-flex items-center gap-1 text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 text-[11px] font-semibold"
                title="Company enrolled in USCIS E-Verify / STEM OPT eligible"
              >
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                <span>{job.stemOptEVerified ? 'STEM OPT · E-Verify' : 'E-Verify'}</span>
              </span>
            )}
            {job.visaSponsorship && (
              <span className="text-[11px] font-semibold text-[#1a73e8] bg-[#e8f0fe] px-2.5 py-1 rounded-md border border-[#d2e3fc]">
                Visa Sponsorship
              </span>
            )}
            {job.usCitizenOnly && (
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                US Citizen Only
              </span>
            )}
          </div>
        )}

        {/* Top Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            {job.skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="text-[11px] bg-[#f8f9fa] text-[#5f6368] border border-[#e8eaed] px-2 py-0.5 rounded-md font-medium"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-[11px] text-[#80868b] px-1 font-medium">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3.5 border-t border-[#f1f3f4] gap-2">
        <div className="flex flex-col gap-0.5 text-[11px] text-[#5f6368]">
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Calendar className="w-3 h-3 text-[#80868b]" />
            <span>{job.datePosted || 'Recent'}</span>
          </span>
          <span className="font-medium text-[#3c4043]">
            {job.experienceLevel === 'Internship'
              ? 'Internship'
              : job.experienceLevel === 'New Grad'
              ? 'New Grad'
              : 'Entry-Level'}
          </span>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <SocialShare job={job} compact={true} />
          <a
            id={`btn-view-apply-${job.id}`}
            href={`/job/${encodeURIComponent(job.id)}`}
            onClick={handleOpenJob}
            className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white transition-colors inline-flex items-center gap-1 no-underline whitespace-nowrap"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
};
