import React from 'react';
import { JobPosting } from '../types';
import { MapPin, DollarSign, Calendar, Globe, Building2, CheckCircle2, ArrowRight } from 'lucide-react';

interface JobCardProps {
  job: JobPosting;
  onSelect: (job: JobPosting) => void;
  onViewSchema?: (job: JobPosting) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSelect }) => {
  const formatSalary = (salary: JobPosting['salary']) => {
    if (!salary || salary.min <= 0) return 'Salary Undisclosed';
    const minK = Math.round(salary.min / 1000);
    const maxK = salary.max ? Math.round(salary.max / 1000) : minK;
    return `$${minK}k – $${maxK}k / yr`;
  };

  const isNew = () => {
    const postDate = new Date(job.datePosted);
    const now = new Date();
    const diffDays = (now.getTime() - postDate.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 5;
  };

  const getAtsName = (url: string) => {
    if (!url) return 'Direct ATS';
    const lower = url.toLowerCase();
    if (lower.includes('greenhouse.io')) return 'Greenhouse';
    if (lower.includes('lever.co')) return 'Lever';
    if (lower.includes('ashbyhq.com')) return 'Ashby';
    if (lower.includes('myworkdayjobs.com')) return 'Workday';
    if (lower.includes('smartrecruiters.com')) return 'SmartRecruiters';
    return 'Direct ATS';
  };

  return (
    <div
      id={`job-card-${job.id}`}
      onClick={() => onSelect(job)}
      className="group relative bg-white rounded-xl border border-slate-200/90 hover:border-indigo-400/80 hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Top Header: Company + Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={`${job.company} logo`}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50 flex-shrink-0"
                onError={(e) => {
                  // Fallback to text avatar if broken
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    job.company
                  )}&background=0F172A&color=fff&size=128`;
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base flex-shrink-0">
                {job.company.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-900 text-sm">{job.company}</span>
                {job.source === 'EMPLOYER_POST' ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Direct Employer
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-sky-700 font-medium bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                    Verified ATS
                  </span>
                )}
                {isNew() && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                    New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
                {job.isRemote && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded font-medium border border-violet-100">
                    <Globe className="w-2.5 h-2.5" /> Remote Option
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Experience Badge */}
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200/80">
              {job.experienceLevel} ({job.maxYearsExperience} YoE)
            </span>
          </div>
        </div>

        {/* Job Title */}
        <h3
          onClick={() => onSelect(job)}
          className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer mb-2 line-clamp-2"
        >
          {job.title}
        </h3>

        {/* Snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
          {job.description}
        </p>

        {/* Key Attributes Bar */}
        <div className="flex items-center gap-3 text-xs text-slate-700 font-medium mb-3 flex-wrap">
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            <DollarSign className="w-3 h-3" />
            {formatSalary(job.salary)}
          </span>
          <span className="text-slate-500 text-[11px] flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Posted {job.datePosted}
          </span>
        </div>

        {/* Skills Tags */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          {job.skills.slice(0, 5).map((skill, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 5 && (
            <span className="text-[10px] text-slate-500 px-1 font-mono">
              +{job.skills.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span className="font-medium text-slate-600">Direct on {getAtsName(job.applyUrl)}</span>
        </div>

        <button
          id={`btn-view-apply-${job.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(job);
          }}
          className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-1.5 shadow-xs group-hover:shadow-sm"
        >
          <span>View & Apply</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
