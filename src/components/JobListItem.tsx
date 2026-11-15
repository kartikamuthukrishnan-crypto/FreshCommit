import React from 'react';
import { JobPosting } from '../types';
import { MapPin, Calendar, Bookmark, ChevronRight, ShieldCheck } from 'lucide-react';
import { resolveCompanyLogo } from '../utils/logoHelper';
import {
  sanitizeJobTitle,
  stripUiAndIconNoise,
  stripSyntheticWrapperSections,
  formatDisclosedSalary,
  resolveWorkMode,
  formatRelativePostedAge,
} from '../utils/jobSanitizer';

interface JobListItemProps {
  job: JobPosting;
  onSelect: (job: JobPosting) => void;
  isSaved?: boolean;
  onToggleSave?: (jobId: string, e: React.MouseEvent) => void;
}

export const JobListItem: React.FC<JobListItemProps> = ({
  job,
  onSelect,
  isSaved = false,
  onToggleSave,
}) => {
  const cleanTitle = sanitizeJobTitle(job.title) || job.title;
  const cleanSnippet = stripUiAndIconNoise(stripSyntheticWrapperSections(job.description || ''));
  const salaryLabel = formatDisclosedSalary(job.salary, job.salaryDisclosed);
  const workMode = resolveWorkMode(job);
  const safeLogo = resolveCompanyLogo(job.company, job.companyLogo, job.companyWebsite);

  const isRecent = () => {
    const raw = job.postedAt || job.datePosted;
    if (!raw) return false;
    const postDate = new Date(raw);
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
      id={`job-list-item-${job.id}`}
      className="group bg-white rounded-xl border border-[#dadce0] hover:border-[#1a73e8]/60 hover:shadow-sm transition-all p-4 sm:p-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Avatar + Role Details */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <img
            src={safeLogo}
            alt={`${job.company} logo`}
            referrerPolicy="no-referrer"
            className="w-11 h-11 rounded-xl object-contain p-1 border border-[#e8eaed] bg-white flex-shrink-0 mt-0.5"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                job.company
              )}&background=0F172A&color=fff&size=128&bold=true`;
            }}
          />

          <div className="min-w-0 flex-1">
            {/* Title + New indicator */}
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`/job/${encodeURIComponent(job.id)}`}
                onClick={handleOpenJob}
                className="text-base sm:text-[17px] font-semibold text-[#202124] group-hover:text-[#1a73e8] transition-colors no-underline leading-snug"
              >
                {cleanTitle}
              </a>
              {isRecent() && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-md">
                  New
                </span>
              )}
            </div>

            {/* Clean inline metadata */}
            <div className="flex items-center gap-x-2.5 gap-y-1 flex-wrap text-xs text-[#5f6368] mt-1">
              <span className="font-semibold text-[#3c4043]">{job.company}</span>
              <span aria-hidden="true" className="text-[#dadce0]">&middot;</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#80868b] flex-shrink-0" />
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
              <span aria-hidden="true" className="text-[#dadce0]">&middot;</span>
              <span className="font-medium text-[#3c4043]">
                {job.experienceLevel === 'Internship'
                  ? 'Internship'
                  : job.experienceLevel === 'New Grad'
                  ? 'New Grad'
                  : 'Entry-Level'}
              </span>
            </div>

            {/* Description excerpt */}
            {cleanSnippet && (
              <p className="text-xs sm:text-[13px] text-[#5f6368] line-clamp-2 mt-2 leading-relaxed">
                {cleanSnippet}
              </p>
            )}

            {/* Work Auth & Skills */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
              {(job.stemOptEVerified || job.eVerify) && (
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md"
                  title="Eligible for STEM OPT / USCIS E-Verify enrolled"
                >
                  <ShieldCheck className="w-3 h-3 text-teal-600" />
                  <span>{job.stemOptEVerified ? 'STEM OPT · E-Verify' : 'E-Verify'}</span>
                </span>
              )}
              {job.visaSponsorship && (
                <span className="text-[11px] font-medium text-[#1a73e8] bg-[#e8f0fe] border border-[#d2e3fc] px-2 py-0.5 rounded-md">
                  Visa Sponsorship
                </span>
              )}
              {job.usCitizenOnly && (
                <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  US Citizen Only
                </span>
              )}
              {(job.skills || []).slice(0, 4).map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-[#f8f9fa] text-[#5f6368] border border-[#e8eaed] px-2 py-0.5 rounded-md font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Salary (if disclosed) + Date + Actions */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#f1f3f4] flex-shrink-0 sm:min-w-[168px]">
          <div className="flex flex-col sm:items-end gap-0.5">
            {salaryLabel && (
              <span className="text-sm font-semibold text-[#137333] tabular-nums">
                {salaryLabel}
              </span>
            )}
            <span
              className="inline-flex items-center gap-1 text-[11px] text-[#5f6368] tabular-nums"
              title={job.datePosted ? `Published ${job.datePosted}` : undefined}
            >
              <Calendar className="w-3 h-3 text-[#80868b]" />
              <span>{formatRelativePostedAge(job.datePosted, job.postedAt)}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleSave && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(job.id, e);
                }}
                title={isSaved ? 'Remove from saved jobs' : 'Save job'}
                aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-[#fef7e0] border-[#f9ab00] text-[#b06000]'
                    : 'bg-white border-[#dadce0] text-[#5f6368] hover:text-[#1a73e8] hover:border-[#1a73e8]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#f9ab00] text-[#f9ab00]' : ''}`} />
              </button>
            )}

            <a
              id={`btn-list-view-${job.id}`}
              href={`/job/${encodeURIComponent(job.id)}`}
              onClick={handleOpenJob}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white transition-colors inline-flex items-center gap-1 no-underline whitespace-nowrap"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
