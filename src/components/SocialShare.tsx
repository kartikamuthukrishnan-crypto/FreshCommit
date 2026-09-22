import React, { useState, useEffect, useRef } from 'react';
import { Share2, Linkedin, Twitter, MessageCircle, Link, Check, ExternalLink, X } from 'lucide-react';
import { JobPosting } from '../types';

interface SocialShareProps {
  job: JobPosting;
  compact?: boolean;
}

export const SocialShare: React.FC<SocialShareProps> = ({ job, compact = false }) => {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss popup on click outside or when ESC is pressed
  useEffect(() => {
    if (!showShareMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showShareMenu]);

  // Canonical shareable job link on freshcommits.com
  const jobUrl = `https://freshcommits.com/?job=${encodeURIComponent(job.id)}`;
  const salaryText = job.salary && job.salary.min > 0 
    ? `$${Math.round(job.salary.min / 1000)}k–$${Math.round((job.salary.max || job.salary.min) / 1000)}k` 
    : '';

  const shareText = `🚀 New Entry-Level Opening: ${job.title} at ${job.company}${salaryText ? ` (${salaryText})` : ''} - Verified 0–2 YoE with direct ATS application on FreshCommits:`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(jobUrl);

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=TechJobs,SoftwareEngineer,EntryLevelJobs,NewGrad`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(`${job.title} at ${job.company} (0–2 YoE SWE Role)`)}`
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(jobUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleShareClick = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareMenu(false);
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=550');
  };

  if (compact) {
    return (
      <div className="relative inline-block" ref={menuRef} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className={`p-1.5 rounded-lg border transition-colors shadow-2xs ${
            showShareMenu 
              ? 'border-indigo-400 bg-indigo-50 text-indigo-700' 
              : 'border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50'
          }`}
          title="Share opening across social media"
          aria-label="Share opening"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        {showShareMenu && (
          <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Share this Job
              </span>
              <button
                onClick={() => setShowShareMenu(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                title="Close"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1">
              <button
                onClick={(e) => handleShareClick(shareLinks.linkedin, e)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
              >
                <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                <span>LinkedIn</span>
              </button>
              <button
                onClick={(e) => handleShareClick(shareLinks.twitter, e)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left"
              >
                <Twitter className="w-3.5 h-3.5 text-slate-900" />
                <span>X / Twitter</span>
              </button>
              <button
                onClick={(e) => handleShareClick(shareLinks.reddit, e)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors text-left"
              >
                <MessageCircle className="w-3.5 h-3.5 text-orange-600" />
                <span>Reddit</span>
              </button>
              <button
                onClick={(e) => handleShareClick(shareLinks.whatsapp, e)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-left"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
              <div className="border-t border-slate-100 my-1 pt-1">
                <button
                  onClick={(e) => {
                    handleCopy(e);
                    setTimeout(() => setShowShareMenu(false), 900);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-900">Share with Tech Cohorts &amp; Friends</span>
        </div>
        <span className="text-[10px] text-slate-600 font-semibold bg-white px-2 py-0.5 rounded-full border border-slate-200">
          Boosts discovery
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={(e) => handleShareClick(shareLinks.linkedin, e)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold shadow-xs transition-colors"
          title="Share to your LinkedIn network"
        >
          <Linkedin className="w-3.5 h-3.5 fill-current" />
          <span>LinkedIn</span>
        </button>

        <button
          onClick={(e) => handleShareClick(shareLinks.twitter, e)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          title="Post to X / Twitter"
        >
          <Twitter className="w-3.5 h-3.5 fill-current" />
          <span>Post on X</span>
        </button>

        <button
          onClick={(e) => handleShareClick(shareLinks.reddit, e)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF4500] hover:bg-[#D93A00] text-white text-xs font-semibold shadow-xs transition-colors"
          title="Share to Reddit tech communities (r/csMajors, r/cscareerquestions)"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Reddit</span>
        </button>

        <button
          onClick={(e) => handleShareClick(shareLinks.whatsapp, e)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold shadow-xs transition-colors"
          title="Send via WhatsApp to your study group or cohort"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors ml-auto"
          title="Copy direct share URL"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copied ? 'Link Copied!' : 'Copy Direct Link'}</span>
        </button>
      </div>
    </div>
  );
};
