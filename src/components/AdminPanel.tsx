import React, { useState } from 'react';
import { JobPosting, AdSenseConfig, SyncLog, JobCategory, ExperienceLevel, EmploymentType } from '../types';
import { generateFingerprint, executeAutomatedSync } from '../utils/jobAggregator';
import { validateJobPostingSchema, generateJobPostingSchema } from '../utils/schemaGenerator';
import {
  PlusCircle,
  RefreshCw,
  ListFilter,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Edit3,
  Copy,
  Check,
  Sparkles,
  Globe,
  DollarSign,
  Building,
  Briefcase,
  Layers,
  ArrowRight,
  Database
} from 'lucide-react';

interface AdminPanelProps {
  jobs: JobPosting[];
  setJobs: React.Dispatch<React.SetStateAction<JobPosting[]>>;
  adConfig: AdSenseConfig;
  setAdConfig: React.Dispatch<React.SetStateAction<AdSenseConfig>>;
  syncLogs: SyncLog[];
  setSyncLogs: React.Dispatch<React.SetStateAction<SyncLog[]>>;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  jobs,
  setJobs,
  adConfig,
  setAdConfig,
  syncLogs,
  setSyncLogs,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'post' | 'sync' | 'manage' | 'adsense' | 'schema-tester'>('post');

  // Manual Job Posting Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [location, setLocation] = useState('San Francisco, CA');
  const [isRemote, setIsRemote] = useState(false);
  const [applicantLocationRequirements, setApplicantLocationRequirements] = useState('US');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [country, setCountry] = useState('US');
  const [postalCode, setPostalCode] = useState('94105');
  const [category, setCategory] = useState<JobCategory>('Full Stack');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Entry Level');
  const [maxYearsExperience, setMaxYearsExperience] = useState(0);
  const [employmentType, setEmploymentType] = useState<EmploymentType>('FULL_TIME');
  const [salaryMin, setSalaryMin] = useState(115000);
  const [salaryMax, setSalaryMax] = useState(140000);
  const [description, setDescription] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [qualificationsText, setQualificationsText] = useState('');
  const [skillsText, setSkillsText] = useState('TypeScript, React, Node.js');
  const [applyUrl, setApplyUrl] = useState('');
  const [validDays, setValidDays] = useState(60);

  // Status feedback
  const [postSuccess, setPostSuccess] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [customFeedUrl, setCustomFeedUrl] = useState('');
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Draft Job Object for Live Validation
  const draftJob: JobPosting = {
    id: 'draft-preview',
    title: title || 'Software Engineer - Entry Level (Sample)',
    company: company || 'Acme Tech Corp',
    companyLogo: companyLogo || undefined,
    companyWebsite: companyWebsite || undefined,
    location: isRemote ? `Remote (${applicantLocationRequirements})` : location,
    isRemote,
    applicantLocationRequirements: isRemote ? applicantLocationRequirements : undefined,
    city: isRemote ? undefined : city,
    state: isRemote ? undefined : state,
    country,
    postalCode: isRemote ? undefined : postalCode,
    experienceLevel,
    maxYearsExperience,
    category,
    employmentType,
    salary: {
      min: salaryMin,
      max: salaryMax,
      currency: 'USD',
      unit: 'YEAR',
    },
    description: description || 'Seeking enthusiastic junior software developer with foundational CS knowledge.',
    responsibilities: responsibilitiesText
      ? responsibilitiesText.split('\n').filter((l) => l.trim())
      : ['Develop modular code features', 'Participate in peer code reviews'],
    qualifications: qualificationsText
      ? qualificationsText.split('\n').filter((l) => l.trim())
      : ['Bachelor degree or equivalent in CS', '0-2 years experience'],
    skills: skillsText.split(',').map((s) => s.trim()).filter(Boolean),
    applyUrl: applyUrl || 'https://careers.example.com/apply',
    datePosted: new Date().toISOString().split('T')[0],
    validThrough: new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    source: 'MANUAL_ADMIN',
    status: 'ACTIVE',
    fingerprint: generateFingerprint(company, title, location),
    viewsCount: 0,
  };

  const validation = validateJobPostingSchema(draftJob);

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !applyUrl) {
      alert('Please fill in required fields: Job Title, Company, and Direct ATS Apply URL.');
      return;
    }

    const newJob: JobPosting = {
      ...draftJob,
      id: `manual-${Date.now()}`,
      datePosted: new Date().toISOString().split('T')[0],
      fingerprint: generateFingerprint(company, title, isRemote ? 'remote' : location),
    };

    // Deduplication check
    const existing = jobs.find((j) => j.fingerprint === newJob.fingerprint);
    if (existing) {
      alert('A listing with this exact company and title already exists! Duplicates are blocked to preserve SEO health.');
      return;
    }

    setJobs((prev) => [newJob, ...prev]);
    setPostSuccess(true);
    setTimeout(() => setPostSuccess(false), 4000);

    // Reset fields
    setTitle('');
    setDescription('');
    setApplyUrl('');
    setResponsibilitiesText('');
    setQualificationsText('');
  };

  const handleTriggerSync = async () => {
    setSyncLoading(true);
    try {
      const { newJobs, log } = await executeAutomatedSync(jobs, customFeedUrl);
      if (newJobs.length > 0) {
        setJobs((prev) => [...newJobs, ...prev]);
      }
      setSyncLogs((prev) => [log, ...prev]);
    } catch (err) {
      console.error(err);
      alert('Sync failed. Please check the network.');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleDeleteJob = (id: string) => {
    if (confirm('Are you sure you want to remove this job listing?')) {
      setJobs((prev) => prev.filter((j) => j.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: j.status === 'ACTIVE' ? 'EXPIRED' : 'ACTIVE' } : j))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/30">
              Admin Control Center
            </span>
            <span className="text-xs text-slate-400">Google Schema & AdSense Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin & Job Ingestion Panel</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Manual Google JobPosting schema creator, automated ATS job aggregator with relevancy & deduplication filters, and Google AdSense compliance configurations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors border border-slate-700"
          >
            Exit Admin
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('post')}
          className={`pb-4 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'post'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Manual Job Posting</span>
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`pb-4 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'sync'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${syncLoading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Automated ATS Aggregator</span>
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`pb-4 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'manage'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>Manage Listings ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schema-tester')}
          className={`pb-4 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'schema-tester'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Google Schema Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('adsense')}
          className={`pb-4 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'adsense'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4 text-amber-600" />
          <span>Google AdSense Settings</span>
        </button>
      </div>

      {/* TAB 1: MANUAL JOB POSTING */}
      {activeTab === 'post' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Post New Global / US Job Listing</h2>
                <p className="text-xs text-slate-500">
                  Full Google <code>JobPosting</code> schema compliant with telecommute/remote options.
                </p>
              </div>
              {postSuccess && (
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Job Published!</span>
                </div>
              )}
            </div>

            <form onSubmit={handlePostJob} className="space-y-4 text-xs sm:text-sm">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Junior Full-Stack Engineer (New Grad)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as JobCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs bg-white"
                  >
                    <option value="Full Stack">Full Stack</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Mobile">Mobile (iOS / Android)</option>
                    <option value="DevOps / Cloud">DevOps / Cloud / SRE</option>
                    <option value="Data / AI">Data / AI Engineer</option>
                    <option value="QA / Test">QA / Test Automation</option>
                  </select>
                </div>
              </div>

              {/* Employer / Hiring Organization */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OpenAI, Stripe, Google"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Website URL</label>
                  <input
                    type="url"
                    placeholder="https://company.com"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Logo URL</label>
                  <input
                    type="url"
                    placeholder="https://.../logo.png"
                    value={companyLogo}
                    onChange={(e) => setCompanyLogo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>
              </div>

              {/* Remote & Location Options */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    Remote & Telecommute Configuration (Google Schema)
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isRemote}
                      onChange={(e) => setIsRemote(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-slate-700">100% Remote / Telecommute</span>
                  </label>
                </div>

                {isRemote ? (
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      Applicant Location Requirements (Google Schema <code>applicantLocationRequirements</code>)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. US, North America, Worldwide"
                      value={applicantLocationRequirements}
                      onChange={(e) => setApplicantLocationRequirements(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Google sets <code>jobLocationType: TELECOMMUTE</code> with country constraints.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">City</label>
                      <input
                        type="text"
                        placeholder="San Francisco"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          setLocation(`${e.target.value}, ${state}`);
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">State / Region</label>
                      <input
                        type="text"
                        placeholder="CA"
                        value={state}
                        onChange={(e) => {
                          setState(e.target.value);
                          setLocation(`${city}, ${e.target.value}`);
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Country</label>
                      <input
                        type="text"
                        placeholder="US"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Postal Code</label>
                      <input
                        type="text"
                        placeholder="94105"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Experience & Employment Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Entry Level">Entry Level (0-2 YoE)</option>
                    <option value="New Grad">New Grad (2025/2026)</option>
                    <option value="Fresher">Fresher (0 YoE)</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Years Experience</label>
                  <select
                    value={maxYearsExperience}
                    onChange={(e) => setMaxYearsExperience(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value={0}>0 Years (Strict Fresher / Grad)</option>
                    <option value={1}>1 Year Max</option>
                    <option value={2}>2 Years Max (Entry Level)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="INTERN">Intern</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="PART_TIME">Part Time</option>
                  </select>
                </div>
              </div>

              {/* Salary Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Minimum Salary (USD/yr) <span className="text-emerald-700 font-normal">($)</span>
                  </label>
                  <input
                    type="number"
                    step={5000}
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Maximum Salary (USD/yr) <span className="text-emerald-700 font-normal">($)</span>
                  </label>
                  <input
                    type="number"
                    step={5000}
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Unparaphrased Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Job Description (Original & Authentic) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste verbatim job description from employer..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              {/* Responsibilities & Qualifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Responsibilities (1 per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Build frontend web interfaces&#10;Write unit tests in Jest&#10;Collaborate with design team"
                    value={responsibilitiesText}
                    onChange={(e) => setResponsibilitiesText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Qualifications (1 per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="0-1 year experience or CS degree&#10;Proficiency in JavaScript or Python&#10;Good communication skills"
                    value={qualificationsText}
                    onChange={(e) => setQualificationsText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Skills & Direct ATS Apply URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Skills (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Go, Docker"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Direct ATS Apply URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://boards.greenhouse.io/... or https://jobs.lever.co/..."
                    value={applyUrl}
                    onChange={(e) => setApplyUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Job With Google Schema</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Schema Preview & Google Validator */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900 text-sm">Google Rich Results Validator</span>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    validation.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {validation.isValid ? 'Valid Schema' : 'Missing Requirements'}
                </span>
              </div>

              {validation.missingFields.length > 0 && (
                <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                  <strong className="block">Required by Google for Jobs:</strong>
                  {validation.missingFields.map((f, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Missing: <code>{f}</code></span>
                    </div>
                  ))}
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                  <strong className="block">Google Recommendation:</strong>
                  {validation.warnings.map((w, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span>• {w}</span>
                    </div>
                  ))}
                </div>
              )}

              {validation.isValid && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Google JobPosting Schema Compliant</span>
                </div>
              )}

              {/* JSON-LD Code Box */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span className="font-mono">Live Generated JSON-LD</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(validation.jsonLd, null, 2));
                      setCopiedSchema(true);
                      setTimeout(() => setCopiedSchema(false), 2000);
                    }}
                    className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    {copiedSchema ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSchema ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-[380px] leading-relaxed">
                  {JSON.stringify(validation.jsonLd, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATED ATS AGGREGATOR */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="max-w-3xl">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Automated Global ATS Feeder Engine</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Fetches software engineering listings from reliable global sources (Greenhouse, Lever, Ashby, and verified career feeds).
                Applies <strong>strict relevancy verification</strong> (&le; 2 YoE, entry level / fresher / new grad) and <strong>hash-based deduplication</strong> before posting without paraphrasing, in full compliance with Google AdSense quality and scraping policies.
              </p>
            </div>

            {/* Sync Trigger Box */}
            <div className="mt-6 p-4 sm:p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-bold text-slate-900 text-sm block">Run Ingestion Pipeline</span>
                <span className="text-xs text-slate-500">
                  Runs negative senior filters, deduplication checks, and formats JSON-LD schemas.
                </span>
              </div>

              <button
                onClick={handleTriggerSync}
                disabled={syncLoading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncLoading ? 'animate-spin' : ''}`} />
                <span>{syncLoading ? 'Ingesting Feeds...' : 'Fetch & Ingest Reliable Jobs'}</span>
              </button>
            </div>

            {/* Optional Custom Feed Endpoint */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Public ATS / JSON Feed URL (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://remoteok.com/api or public greenhouse json..."
                  value={customFeedUrl}
                  onChange={(e) => setCustomFeedUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Sync Logs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              Ingestion & Deduplication Audit Logs
            </h3>

            {syncLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No sync operations executed yet in this session.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Source</th>
                      <th className="py-2.5 px-3">Raw Evaluated</th>
                      <th className="py-2.5 px-3">Passed Early-Career</th>
                      <th className="py-2.5 px-3">Duplicates Discarded</th>
                      <th className="py-2.5 px-3">Saved to Feed</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {syncLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono text-slate-500">{log.timestamp}</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">{log.sourceName}</td>
                        <td className="py-3 px-3">{log.rawJobsCount}</td>
                        <td className="py-3 px-3 text-indigo-600 font-semibold">{log.passedRelevancyCount}</td>
                        <td className="py-3 px-3 text-amber-600 font-semibold">{log.duplicatesSkippedCount}</td>
                        <td className="py-3 px-3 text-emerald-600 font-bold">+{log.savedCount}</td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> OK
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE LISTINGS */}
      {activeTab === 'manage' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Manage Active Job Postings ({jobs.length})</h2>
              <p className="text-xs text-slate-500">Monitor active listings, views, and toggle expiration status.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Company & Role</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Level / YoE</th>
                  <th className="py-2.5 px-3">Salary</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{job.title}</div>
                      <div className="text-slate-500 text-[11px]">{job.company}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span>{job.location}</span>
                      {job.isRemote && (
                        <span className="ml-1 text-[10px] bg-violet-50 text-violet-700 px-1 py-0.2 rounded font-semibold">
                          Remote
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                        {job.experienceLevel} ({job.maxYearsExperience} YoE)
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-emerald-700">
                      ${Math.round(job.salary.min / 1000)}k–${Math.round(job.salary.max / 1000)}k
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          job.source === 'EMPLOYER_POST'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}
                      >
                        {job.source === 'EMPLOYER_POST' ? 'Direct Employer' : 'ATS Aggregated'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleStatus(job.id)}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                          job.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {job.status}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={job.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-400 hover:text-indigo-600"
                          title="Open ATS Apply URL"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: GOOGLE SCHEMA INSPECTOR */}
      {activeTab === 'schema-tester' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Google JobPosting Structured Data Inspector</h2>
            <p className="text-sm text-slate-600">
              Review and copy JSON-LD structured data generated for search engines to test directly on the official Google Rich Results Test tool.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://search.google.com/test/rich-results"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
            >
              <span>Open Google Rich Results Test</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.slice(0, 4).map((job) => {
              const schema = generateJobPostingSchema(job);
              return (
                <div key={job.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{job.title}</span>
                      <span className="text-[11px] text-slate-500">{job.company}</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
                        alert(`Copied JSON-LD schema for ${job.title}!`);
                      }}
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy Schema
                    </button>
                  </div>
                  <pre className="p-2.5 bg-slate-900 text-slate-100 rounded text-[10px] font-mono overflow-x-auto max-h-48">
                    {JSON.stringify(schema, null, 2)}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: GOOGLE ADSENSE SETTINGS & POLICY CHECKLIST */}
      {activeTab === 'adsense' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Settings Box */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Google AdSense Configuration</h2>
              <p className="text-xs text-slate-500">
                Setup your Google Publisher ID and control ad placements across the application.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Google AdSense Publisher ID (ca-pub-XXXXXXXXXXXXXXXX)
                </label>
                <input
                  type="text"
                  placeholder="ca-pub-1234567890123456"
                  value={adConfig.publisherId}
                  onChange={(e) => setAdConfig((prev) => ({ ...prev, publisherId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block">Ad Serving Mode</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adConfig.testMode}
                    onChange={(e) => setAdConfig((prev) => ({ ...prev, testMode: e.target.checked }))}
                    className="rounded text-indigo-600 w-4 h-4"
                  />
                  <div>
                    <span className="font-semibold text-slate-800">Policy Sandbox / Preview Mode (Recommended)</span>
                    <span className="block text-[11px] text-slate-500">
                      Renders policy-compliant mock ad blocks to prevent accidental self-clicks during development.
                    </span>
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 block">Ad Unit Placements</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adConfig.headerAd}
                    onChange={(e) => setAdConfig((prev) => ({ ...prev, headerAd: e.target.checked }))}
                    className="rounded text-indigo-600 w-4 h-4"
                  />
                  <span>Header Leaderboard (728x90)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adConfig.inFeedAd}
                    onChange={(e) => setAdConfig((prev) => ({ ...prev, inFeedAd: e.target.checked }))}
                    className="rounded text-indigo-600 w-4 h-4"
                  />
                  <span>In-Feed Native Ad Unit (Between job listings)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adConfig.detailSidebarAd}
                    onChange={(e) => setAdConfig((prev) => ({ ...prev, detailSidebarAd: e.target.checked }))}
                    className="rounded text-indigo-600 w-4 h-4"
                  />
                  <span>Job Details Modal Unit (Safely separated from Apply button)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adConfig.footerAd}
                    onChange={(e) => setAdConfig((prev) => ({ ...prev, footerAd: e.target.checked }))}
                    className="rounded text-indigo-600 w-4 h-4"
                  />
                  <span>Footer Ad Unit</span>
                </label>
              </div>
            </div>
          </div>

          {/* AdSense Policy Checklist */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Google AdSense Approval Checklist
              </h2>
              <p className="text-xs text-slate-500">
                To monetize solely through AdSense without policy rejections for scraped/thin content.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 block">Original Value & Guides Included</strong>
                  Site includes comprehensive Early-Career Salary Indices, New Grad resume guides, and authentic employer ATS routing, eliminating the "scraped thin content" penalty.
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 block">Distinct "Advertisement" Labels</strong>
                  Every ad slot is explicitly marked with "Advertisement", preventing accidental click violations.
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 block">Mandatory Legal Disclosures</strong>
                  Privacy Policy includes Google DART cookies, third-party advertising cookies, CCPA/GDPR compliance, and terms of service.
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 block">Extremely Lightweight & High Web Vitals</strong>
                  Zero unnecessary heavy libraries, zero render blocking, and fast mobile viewport response for optimal AdSense quality score.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
