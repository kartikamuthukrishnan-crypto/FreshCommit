import React, { useEffect, useState } from 'react';
import { JobPosting, AdSenseConfig } from '../types';
import { generateJobPostingSchema, injectJobJsonLd } from '../utils/schemaGenerator';
import { AdSlot } from './AdSlot';
import {
  X,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Code2,
  Copy,
  Check,
  Globe,
  Briefcase,
  AlertCircle
} from 'lucide-react';

interface JobDetailsModalProps {
  job: JobPosting | null;
  onClose: () => void;
  adConfig: AdSenseConfig;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose, adConfig }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'schema'>('details');
  const [copied, setCopied] = useState(false);

  // Injects Google JobPosting Schema into document head dynamically
  useEffect(() => {
    if (!job) return;
    const schema = generateJobPostingSchema(job);
    const cleanup = injectJobJsonLd(schema);
    return () => {
      cleanup();
    };
  }, [job]);

  if (!job) return null;

  const schemaJson = JSON.stringify(generateJobPostingSchema(job), null, 2);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(schemaJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const richResultsUrl = `https://search.google.com/test/rich-results`;

  const getAtsDetails = (url: string) => {
    if (!url) return { name: 'Direct ATS', host: 'Direct Requisition' };
    const lower = url.toLowerCase();
    if (lower.includes('greenhouse.io')) return { name: 'Greenhouse', host: 'boards.greenhouse.io' };
    if (lower.includes('lever.co')) return { name: 'Lever', host: 'jobs.lever.co' };
    if (lower.includes('ashbyhq.com')) return { name: 'Ashby', host: 'jobs.ashbyhq.com' };
    if (lower.includes('myworkdayjobs.com')) return { name: 'Workday', host: 'myworkdayjobs.com' };
    if (lower.includes('smartrecruiters.com')) return { name: 'SmartRecruiters', host: 'smartrecruiters.com' };
    return { name: 'Direct ATS', host: 'Company Requisition' };
  };

  const atsInfo = getAtsDetails(job.applyUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
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
                <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
                  {job.experienceLevel} ({job.maxYearsExperience} YoE)
                </span>
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
                  ${Math.round(job.salary.min / 1000)}k – ${Math.round(job.salary.max / 1000)}k / year
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Posted on {job.datePosted}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center border-b border-slate-200 px-6 bg-white">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Job Description & Qualifications
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'schema'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Google JobPosting Schema (JSON-LD)
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm leading-relaxed">
          {activeTab === 'details' ? (
            <>
              {/* Authenticity / Direct ATS Notice */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600">
                  <strong className="text-slate-900 block mb-0.5">Verified Early-Career Listing</strong>
                  This job was screened for strict entry-level requirements (&le; 2 years experience). The description below is presented in its original, authentic employer format without automated paraphrasing.
                </div>
              </div>

              {/* Overview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About The Role</h4>
                <p className="whitespace-pre-line text-slate-700">{job.description}</p>
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

              {/* Google AdSense policy-compliant in-modal banner (guaranteed margin from buttons) */}
              {adConfig.enabled && adConfig.detailSidebarAd && (
                <div className="pt-2">
                  <AdSlot type="in-feed" config={adConfig} />
                </div>
              )}
            </>
          ) : (
            // Schema Tab
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Google JobPosting Structured Data</h4>
                  <p className="text-xs text-slate-500">
                    This JSON-LD markup is active on this page and ready for Google Search rich snippet indexing.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySchema}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy JSON-LD'}</span>
                  </button>
                  <a
                    href={richResultsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    <span>Google Rich Results Test</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Google Search Schema Verified:</strong> Validated against Google Search Central <code>JobPosting</code> specification. Includes <code>jobLocationType: TELECOMMUTE</code>, salary range, and employer schema.
                </span>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-96 leading-relaxed">
                {schemaJson}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>
                Direct Destination: <strong className="text-indigo-700">{atsInfo.name}</strong> ({atsInfo.host})
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 ml-5">
              Direct application requisition — opens this specific opening without portal search friction.
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-white transition-colors"
            >
              Close
            </button>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Apply on {atsInfo.name}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
