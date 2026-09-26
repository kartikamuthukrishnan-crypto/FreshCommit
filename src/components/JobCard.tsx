import React from 'react';
import { JobPosting } from '../types';
import { MapPin, DollarSign, Calendar, Globe, CheckCircle2, ArrowRight, Bookmark } from 'lucide-react';
import { SocialShare } from './SocialShare';

interface JobCardProps {
  job: JobPosting;
  onSelect: (job: JobPosting) => void;
  onViewSchema?: (job: JobPosting) => void;
  isSaved?: boolean;
  onToggleSave?: (jobId: string, e: React.MouseEvent) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSelect, isSaved, onToggleSave }) => {
  const getCurrencySymbol = (curr?: string) => {
    switch (curr?.toUpperCase()) {
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'CAD': return 'CA$';
      case 'INR': return '₹';
      case 'AUD': return 'A$';
      default: return '$';
    }
  };

  const formatSalary = (salary: JobPosting['salary']) => {
    if (!salary || salary.min <= 0) return 'Salary Undisclosed';
    const sym = getCurrencySymbol(salary.currency);
    if (salary.unit === 'HOUR') {
      const maxH = salary.max && salary.max !== salary.min ? `–${sym}${salary.max}` : '';
      return `${sym}${salary.min}${maxH} / hr`;
    }
    const minK = Math.round(salary.min / 1000);
    const maxK = salary.max ? Math.round(salary.max / 1000) : minK;
    return `${sym}${minK}k – ${sym}${maxK}k / yr`;
  };

  const isNew = () => {
    const postDate = new Date(job.datePosted);
    const now = new Date();
    const diffDays = (now.getTime() - postDate.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 5;
  };

  return (
    <div
      id={`job-card-${job.id}`}
      onClick={() => onSelect(job)}
      className="group relative bg-white rounded-2xl border border-[#dadce0] hover:border-[#bdc1c6] hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Top Header: Company + Badges */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={`${job.company} logo`}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-[#dadce0] bg-[#f8f9fa] flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    job.company
                  )}&background=1A73E8&color=fff&size=128`;
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#1a73e8] text-white flex items-center justify-center font-bold text-base flex-shrink-0 shadow-xs">
                {job.company.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-[#202124] text-sm">{job.company}</span>
                {job.source === 'EMPLOYER_POST' || job.source === 'MANUAL_ADMIN' ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-[#137333] font-medium bg-[#e6f4ea] px-2 py-0.5 rounded-full border border-[#ceead6]">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Curated
                  </span>
                ) : null}
                {job.atsVerified && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-[#1a73e8] font-medium bg-[#e8f0fe] px-2 py-0.5 rounded-full border border-[#d2e3fc]" title="Requisition confirmed live on official direct feed">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                  </span>
                )}
                {isNew() && (
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-full border border-[#d2e3fc]">
                    New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#5f6368] mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#80868b]" />
                  {job.location}
                </span>
                {job.isRemote && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-full font-medium">
                    <Globe className="w-2.5 h-2.5" /> Remote
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bookmark Action */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {onToggleSave && (
              <button
                type="button"
                onClick={(e) => onToggleSave(job.id, e)}
                title={isSaved ? 'Remove from saved jobs' : 'Save job'}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-[#fef7e0] border-[#f9ab00] text-[#b06000]'
                    : 'bg-white border-[#dadce0] text-[#5f6368] hover:text-[#1a73e8] hover:border-[#1a73e8]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#f9ab00] text-[#f9ab00]' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Job Title */}
        <h3
          onClick={() => onSelect(job)}
          className="text-base sm:text-lg font-medium text-[#202124] group-hover:text-[#1a73e8] transition-colors cursor-pointer mb-2 line-clamp-2"
        >
          {job.title}
        </h3>

        {/* Snippet */}
        <p className="text-xs sm:text-sm text-[#5f6368] line-clamp-2 mb-3.5 leading-relaxed font-normal">
          {job.description}
        </p>

        {/* Salary & Attributes Bar */}
        <div className="flex items-center gap-2 text-xs font-medium mb-3.5 flex-wrap">
          <span className="flex items-center gap-1 text-[#1a73e8] bg-[#e8f0fe] px-3 py-1 rounded-full border border-[#d2e3fc] font-medium">
            <DollarSign className="w-3.5 h-3.5" />
            {formatSalary(job.salary)}
          </span>
          {job.atsProvider && (
            <span className="text-[11px] text-[#5f6368] bg-[#f8f9fa] border border-[#dadce0] px-2.5 py-0.5 rounded-full">
              {job.atsProvider}
            </span>
          )}
        </div>

        {/* Skills Tags */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          {job.skills.slice(0, 5).map((skill, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-[#f8f9fa] text-[#5f6368] border border-[#e8eaed] px-2.5 py-0.5 rounded-full font-medium"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 5 && (
            <span className="text-[11px] text-[#80868b] px-1 font-medium">
              +{job.skills.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-end justify-between pt-3.5 border-t border-[#f1f3f4] gap-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-[#5f6368]">
            <Calendar className="w-3.5 h-3.5 text-[#80868b]" />
            <span className="text-[11px] font-normal">Posted {job.datePosted}</span>
          </div>
          {/* Entry Level Field below Date Posted */}
          <span className="inline-flex items-center text-[10px] sm:text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#f1f3f4] text-[#3c4043] border border-[#dadce0] whitespace-nowrap w-fit">
            {job.experienceLevel === 'Internship'
              ? 'Internship'
              : 'Entry/Early Career'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <SocialShare job={job} compact={true} />
          <button
            id={`btn-view-apply-${job.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(job);
            }}
            className="text-xs font-medium px-4 py-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>View &amp; Apply</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
