import React, { useState } from 'react';
import { JobPosting, AdSenseConfig, SyncLog, JobCategory, ExperienceLevel, EmploymentType } from '../types';
import {
  generateFingerprint,
  executeAutomatedSync,
  syncSmartRecruitersJobs,
  isJobExpired,
  getDaysUntilExpiration,
  checkDuplicateJob,
  batchVerifyJobsAtsHealth,
  JobHealthCheckResult
} from '../utils/jobAggregator';
import { validateJobPostingSchema, generateJobPostingSchema, generateJobPostingHtmlSnippet } from '../utils/schemaGenerator';
import {
  initGA,
  DEFAULT_GA_MEASUREMENT_ID,
  disableAnalyticsForAdmin,
  enableAnalyticsForAdmin,
  isAnalyticsExcludedForAdmin,
} from '../utils/analytics';
import {
  PlusCircle,
  RefreshCw,
  ListFilter,
  Settings,
  ShieldCheck,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Calendar,
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
  Database,
  Inbox,
  Mail,
  Clock,
  BarChart3,
  Link as LinkIcon,
  FileText,
  Download,
  Upload,
  Cloud,
  Search,
  Filter,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  saveJobToCloud,
  deleteJobFromCloud,
  batchSaveJobsToCloud,
  saveAdConfigToCloud
} from '../services/firebaseService';
import { extractAndEnrichJobFromUrl, detectAtsProviderFromUrl } from '../utils/jobExtractor';
import { MICRO_NICHE_PRESETS, generateAdSenseCompliantJd, MicroNichePreset } from '../utils/seoJdGenerator';
import { Target, Award, Zap } from 'lucide-react';

interface AdminPanelProps {
  jobs: JobPosting[];
  setJobs: React.Dispatch<React.SetStateAction<JobPosting[]>>;
  adConfig: AdSenseConfig;
  setAdConfig: React.Dispatch<React.SetStateAction<AdSenseConfig>>;
  syncLogs: SyncLog[];
  setSyncLogs: React.Dispatch<React.SetStateAction<SyncLog[]>>;
  onClose: () => void;
  ownerPasscode: string;
  onUpdatePasscode: (newCode: string) => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  jobs,
  setJobs,
  adConfig,
  setAdConfig,
  syncLogs,
  setSyncLogs,
  onClose,
  ownerPasscode,
  onUpdatePasscode,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'post' | 'sync' | 'manage' | 'adsense' | 'schema-tester' | 'inbox'>('post');
  const [supportTickets, setSupportTickets] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('freshcommits_support_tickets') || '[]');
    } catch {
      return [];
    }
  });
  const [supportRecipientEmail, setSupportRecipientEmail] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('freshcommits_support_recipient_email');
      if (!saved || saved === 'freshcommits.com@gmail.com') {
        localStorage.setItem('freshcommits_support_recipient_email', 'freshcommitsjobs@gmail.com');
        return 'freshcommitsjobs@gmail.com';
      }
      return saved;
    } catch {
      return 'freshcommitsjobs@gmail.com';
    }
  });
  const [isActivating, setIsActivating] = useState(false);
  const [activationFeedback, setActivationFeedback] = useState('');
  const [customPasscode, setCustomPasscode] = useState(ownerPasscode);
  const [passcodeMsg, setPasscodeMsg] = useState('');

  // Google Analytics 4 State
  const [gaId, setGaId] = useState<string>(() => {
    try {
      return localStorage.getItem('freshcommits_ga_id') || (import.meta.env.VITE_GA_MEASUREMENT_ID as string) || DEFAULT_GA_MEASUREMENT_ID;
    } catch {
      return DEFAULT_GA_MEASUREMENT_ID;
    }
  });
  const [gaMsg, setGaMsg] = useState('');
  const [excludeAdminFromGa, setExcludeAdminFromGa] = useState<boolean>(() => isAnalyticsExcludedForAdmin());
  const [showGaFilterGuide, setShowGaFilterGuide] = useState(false);
  const [copiedFilterText, setCopiedFilterText] = useState(false);
  const [copiedAdsTxt, setCopiedAdsTxt] = useState(false);

  const handleSaveGaId = () => {
    const trimmed = gaId.trim();
    localStorage.setItem('freshcommits_ga_id', trimmed);
    initGA(trimmed);
    setGaMsg('Saved & activated successfully!');
    setTimeout(() => setGaMsg(''), 3000);
  };

  const handleToggleExcludeAdmin = () => {
    const next = !excludeAdminFromGa;
    setExcludeAdminFromGa(next);
    if (next) {
      disableAnalyticsForAdmin(gaId.trim() || DEFAULT_GA_MEASUREMENT_ID);
      setGaMsg('🛡️ Admin traffic blocked: Your visits, edits, and test clicks will NOT appear in Google Analytics.');
    } else {
      enableAnalyticsForAdmin(gaId.trim() || DEFAULT_GA_MEASUREMENT_ID);
      setGaMsg('⚠️ Admin tracking enabled (testing mode).');
    }
    setTimeout(() => setGaMsg(''), 4500);
  };

  const handleCopyFilterRegex = () => {
    navigator.clipboard.writeText('admin|\\?view=admin|#admin');
    setCopiedFilterText(true);
    setTimeout(() => setCopiedFilterText(false), 2500);
  };

  // Manual Job Posting Form State
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
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
  const [salaryCurrency, setSalaryCurrency] = useState('USD');
  const [salaryMin, setSalaryMin] = useState(115000);
  const [salaryMax, setSalaryMax] = useState(140000);
  const [description, setDescription] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [qualificationsText, setQualificationsText] = useState('');
  const [skillsText, setSkillsText] = useState('TypeScript, React, Node.js');
  const [applyUrl, setApplyUrl] = useState('');
  const [datePosted, setDatePosted] = useState<string>(new Date().toISOString().split('T')[0]);
  const [validDays, setValidDays] = useState(60);

  // Auto-Extraction / Instant Ingestion State
  const [autoExtractUrl, setAutoExtractUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSuccessMsg, setExtractSuccessMsg] = useState('');
  const [extractErrorMsg, setExtractErrorMsg] = useState('');

  // Status feedback
  const [postSuccess, setPostSuccess] = useState(false);
  const [lastPublishedJob, setLastPublishedJob] = useState<JobPosting | null>(null);
  const [schemaSearchQuery, setSchemaSearchQuery] = useState('');
  const [schemaFilter, setSchemaFilter] = useState<'all' | 'manual' | 'synced'>('all');
  const [syncLoading, setSyncLoading] = useState(false);
  const [customFeedUrl, setCustomFeedUrl] = useState('');
  const [copiedSchema, setCopiedSchema] = useState(false);

  // SmartRecruiters Feeder State
  const [srKeyword, setSrKeyword] = useState('junior software engineer');
  const [srRemoteOnly, setSrRemoteOnly] = useState(false);
  const [srLoading, setSrLoading] = useState(false);

  // Focus Keyword & AdSense JD Generator State
  const [selectedMicroNiche, setSelectedMicroNiche] = useState<MicroNichePreset | null>(null);
  const [seoJdSuccessMsg, setSeoJdSuccessMsg] = useState('');

  const handleApplyMicroNichePreset = (preset: MicroNichePreset) => {
    if (selectedMicroNiche?.id === preset.id) {
      // Toggle off / deselect if already chosen
      setSelectedMicroNiche(null);
      return;
    }
    setSelectedMicroNiche(preset);
    // Auto populate compatible defaults if fields are empty or default
    if (!country || country === 'US' || country === 'IN') {
      setCountry(preset.defaultCountry);
    }
    if (preset.isRemote) {
      setIsRemote(true);
      setApplicantLocationRequirements(preset.defaultCountry);
      setLocation(preset.defaultLocation);
    } else {
      setIsRemote(false);
      setLocation(preset.defaultLocation);
    }
    setSalaryCurrency(preset.suggestedSalaryRange.currency);
    setSalaryMin(preset.suggestedSalaryRange.min);
    setSalaryMax(preset.suggestedSalaryRange.max);
  };

  const handleGenerateSeoJd = () => {
    const rawSkills = skillsText.split(',').map((s) => s.trim()).filter(Boolean);
    const responsibilities = responsibilitiesText.split('\n').map((r) => r.trim()).filter(Boolean);
    const qualifications = qualificationsText.split('\n').map((q) => q.trim()).filter(Boolean);

    const generated = generateAdSenseCompliantJd({
      title: title || 'Software Engineer - Early Career',
      company: company || 'Tech Innovations Inc',
      location: location || selectedMicroNiche?.defaultLocation || 'San Francisco, CA',
      isRemote,
      selectedNiche: selectedMicroNiche,
      skills: rawSkills,
      salaryMin,
      salaryMax,
      salaryCurrency,
      responsibilities,
      qualifications,
      atsProvider: applyUrl ? detectAtsProviderFromUrl(applyUrl) : undefined,
      rawOverview: description
    });

    setDescription(generated.description);
    setResponsibilitiesText(generated.responsibilities.join('\n'));
    setQualificationsText(generated.qualifications.join('\n'));
    setSeoJdSuccessMsg(`✨ High-RPM SEO Job Description Generated (${generated.seoQualityScore}% Quality Score)! Google AdSense & Helpful Content policy compliant.`);
    setTimeout(() => setSeoJdSuccessMsg(''), 6000);
  };

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
      currency: salaryCurrency,
      unit: employmentType === 'INTERN' ? 'HOUR' : 'YEAR',
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
    datePosted: datePosted || new Date().toISOString().split('T')[0],
    validThrough: new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    source: 'MANUAL_ADMIN',
    atsProvider: applyUrl ? detectAtsProviderFromUrl(applyUrl) : undefined,
    atsVerified: Boolean(applyUrl && applyUrl.startsWith('http')),
    status: 'ACTIVE',
    fingerprint: generateFingerprint(company, title, location),
    viewsCount: 0,
  };

  const validation = validateJobPostingSchema(draftJob);

  // Real-time duplicate inspection against active ATS & manual inventory (excluding currently edited job)
  const otherJobs = editingJobId ? jobs.filter((j) => j.id !== editingJobId) : jobs;
  const duplicateCheck = checkDuplicateJob(otherJobs, {
    company,
    title,
    applyUrl,
    location,
    isRemote
  });

  const handleStartEditJob = (job: JobPosting) => {
    setEditingJobId(job.id);
    setTitle(job.title || '');
    setCompany(job.company || '');
    setCompanyLogo(job.companyLogo || '');
    setCompanyWebsite(job.companyWebsite || '');
    setLocation(job.location || 'San Francisco, CA');
    setIsRemote(Boolean(job.isRemote));
    setApplicantLocationRequirements(job.applicantLocationRequirements || (job.country || 'US'));
    setCity(job.city || '');
    setState(job.state || '');
    setCountry(job.country || 'US');
    setPostalCode(job.postalCode || '');
    setCategory(job.category || 'Full Stack');
    setExperienceLevel(job.experienceLevel || 'Entry Level');
    setMaxYearsExperience(job.maxYearsExperience ?? 0);
    setEmploymentType(job.employmentType || 'FULL_TIME');
    setSalaryCurrency(job.salary?.currency || 'USD');
    setSalaryMin(job.salary?.min || 100000);
    setSalaryMax(job.salary?.max || 140000);
    setDescription(job.description || '');
    setResponsibilitiesText((job.responsibilities || []).join('\n'));
    setQualificationsText((job.qualifications || []).join('\n'));
    setSkillsText((job.skills || []).join(', '));
    setApplyUrl(job.applyUrl || '');
    setDatePosted(job.datePosted || new Date().toISOString().split('T')[0]);

    // Estimate validity days remaining if present
    if (job.validThrough) {
      const days = getDaysUntilExpiration(job.validThrough);
      if (days && days > 0) {
        setValidDays(days);
      }
    }

    setActiveTab('post');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingJobId(null);
    setTitle('');
    setCompany('');
    setCompanyLogo('');
    setCompanyWebsite('');
    setDescription('');
    setApplyUrl('');
    setDatePosted(new Date().toISOString().split('T')[0]);
    setResponsibilitiesText('');
    setQualificationsText('');
    setSkillsText('TypeScript, React, Node.js');
    setSelectedMicroNiche(null);
  };

  const handleAutoExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoExtractUrl.trim()) return;
    setIsExtracting(true);
    setExtractSuccessMsg('');
    setExtractErrorMsg('');
    try {
      const data = await extractAndEnrichJobFromUrl(autoExtractUrl.trim());
      setTitle(data.title);
      setCompany(data.company);
      if (data.companyLogo) setCompanyLogo(data.companyLogo);
      if (data.companyWebsite) setCompanyWebsite(data.companyWebsite);
      setLocation(data.location);
      setIsRemote(data.isRemote);
      if (data.city) setCity(data.city);
      if (data.state) setState(data.state);
      if (data.country) setCountry(data.country);
      if (data.applicantLocationRequirements) setApplicantLocationRequirements(data.applicantLocationRequirements);
      if (data.datePosted) setDatePosted(data.datePosted);
      setCategory(data.category);
      setExperienceLevel(data.experienceLevel);
      setMaxYearsExperience(data.maxYearsExperience);
      setEmploymentType(data.employmentType);
      setSalaryCurrency(data.salary.currency || 'USD');
      setSalaryMin(data.salary.min);
      setSalaryMax(data.salary.max);
      setDescription(data.description);
      setResponsibilitiesText(data.responsibilities.join('\n'));
      setQualificationsText(data.qualifications.join('\n'));
      setSkillsText(data.skills.join(', '));
      setApplyUrl(data.applyUrl);

      setExtractSuccessMsg(`✨ Successfully imported from ${data.detectedAtsProvider || 'career page'}! "The FreshCommits Edge" editorial summary & structured fields are filled.`);
    } catch (err: any) {
      setExtractErrorMsg(err.message || 'Failed to extract from this link. Please check the URL.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !applyUrl) {
      alert('Please fill in required fields: Job Title, Company, and Direct ATS Apply URL.');
      return;
    }

    if (duplicateCheck.isDuplicate) {
      const confirmOverride = confirm(
        `DUPLICATE DETECTED!\n\n${duplicateCheck.reason}\n\nPosting duplicate jobs damages candidate trust and triggers Google Search spam penalties.\n\nDo you still want to force save this duplicate?`
      );
      if (!confirmOverride) {
        return;
      }
    }

    if (editingJobId) {
      // Update existing job
      const original = jobs.find((j) => j.id === editingJobId);
      const updatedJob: JobPosting = {
        ...draftJob,
        id: editingJobId,
        datePosted: datePosted || original?.datePosted || new Date().toISOString().split('T')[0],
        fingerprint: generateFingerprint(company, title, isRemote ? 'remote' : location),
        viewsCount: original?.viewsCount || 0,
        source: original?.source || 'MANUAL_ADMIN',
        status: original?.status || 'ACTIVE'
      };

      setJobs((prev) => prev.map((j) => (j.id === editingJobId ? updatedJob : j)));
      saveJobToCloud(updatedJob).catch((e) => console.warn('Could not sync update to cloud:', e));
      setEditingJobId(null);
      setLastPublishedJob(updatedJob);
      setPostSuccess(true);

      // Reset fields
      handleCancelEdit();
      return;
    }

    // Creating new job
    const newJob: JobPosting = {
      ...draftJob,
      id: `manual-${Date.now()}`,
      datePosted: datePosted || new Date().toISOString().split('T')[0],
      fingerprint: generateFingerprint(company, title, isRemote ? 'remote' : location),
    };

    // Deduplication check
    const existing = jobs.find((j) => j.fingerprint === newJob.fingerprint);
    if (existing) {
      alert('A listing with this exact company and title already exists! Duplicates are blocked to preserve SEO health.');
      return;
    }

    setJobs((prev) => [newJob, ...prev]);
    saveJobToCloud(newJob).catch((e) => console.warn('Could not sync new job to cloud:', e));
    setLastPublishedJob(newJob);
    setPostSuccess(true);

    // Reset fields
    handleCancelEdit();
    // Keep admin anchored at the top of the form with confirmation banner visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerSync = async () => {
    setSyncLoading(true);
    try {
      const { newJobs, log, refreshedJobIds } = await executeAutomatedSync(jobs, customFeedUrl);
      if (newJobs.length > 0) {
        batchSaveJobsToCloud(newJobs).catch((e) => console.warn('Cloud sync error for new jobs:', e));
      }
      setJobs((prev) => {
        let updated = [...prev];
        if (refreshedJobIds && refreshedJobIds.length > 0) {
          const validDate = new Date();
          validDate.setDate(validDate.getDate() + 45);
          const extended = validDate.toISOString().split('T')[0];
          updated = updated.map((j) =>
            refreshedJobIds.includes(j.id) ? { ...j, atsVerified: true, validThrough: extended } : j
          );
        }
        return [...newJobs, ...updated];
      });
      setSyncLogs((prev) => [log, ...prev]);
    } catch (err) {
      console.error(err);
      alert('Sync failed. Please check the network.');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleTriggerSmartRecruitersSync = async (customKw?: string) => {
    setSrLoading(true);
    try {
      const kw = customKw !== undefined ? customKw : srKeyword;
      const { newJobs, log, refreshedJobIds } = await syncSmartRecruitersJobs(jobs, kw, srRemoteOnly);
      if (newJobs.length > 0) {
        batchSaveJobsToCloud(newJobs).catch((e) => console.warn('Cloud sync error for SmartRecruiters jobs:', e));
      }
      setJobs((prev) => {
        let updated = [...prev];
        if (refreshedJobIds && refreshedJobIds.length > 0) {
          const validDate = new Date();
          validDate.setDate(validDate.getDate() + 45);
          const extended = validDate.toISOString().split('T')[0];
          updated = updated.map((j) =>
            refreshedJobIds.includes(j.id) ? { ...j, atsVerified: true, validThrough: extended } : j
          );
        }
        return [...newJobs, ...updated];
      });
      setSyncLogs((prev) => [log, ...prev]);
    } catch (err) {
      console.error(err);
      alert('SmartRecruiters live fetch encountered an issue.');
    } finally {
      setSrLoading(false);
    }
  };

  const handleDeleteJob = (id: string) => {
    if (confirm('Are you sure you want to remove this job listing?')) {
      setJobs((prev) => prev.filter((j) => j.id !== id));
      deleteJobFromCloud(id).catch((e) => console.warn('Could not delete from cloud:', e));
    }
  };

  const handleToggleStatus = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === id) {
          const updated = { ...j, status: j.status === 'ACTIVE' ? ('EXPIRED' as const) : ('ACTIVE' as const) };
          saveJobToCloud(updated).catch((e) => console.warn('Could not update status in cloud:', e));
          return updated;
        }
        return j;
      })
    );
  };

  const [pushingToCloud, setPushingToCloud] = useState(false);
  const handlePushAllToCloud = async () => {
    setPushingToCloud(true);
    try {
      // Ensure all jobs are sanitized without any undefined fields
      const sanitizedJobs = jobs.map((job) => JSON.parse(JSON.stringify(job)));
      await batchSaveJobsToCloud(sanitizedJobs);
      alert(`Successfully published all ${sanitizedJobs.length} jobs to Firestore Cloud! All visitors around the world now see all ${sanitizedJobs.length} jobs in real-time.`);
    } catch (err: any) {
      alert('Cloud publication note: ' + err.message);
    } finally {
      setPushingToCloud(false);
    }
  };

  // ATS Health Audit State
  const [isAuditingHealth, setIsAuditingHealth] = useState(false);
  const [healthProgress, setHealthProgress] = useState<{ checked: number; total: number }>({ checked: 0, total: 0 });
  const [healthAuditResults, setHealthAuditResults] = useState<Map<string, JobHealthCheckResult>>(() => new Map());
  const [healthAuditSummary, setHealthAuditSummary] = useState<string>('');

  const handleRunAtsHealthAudit = async () => {
    setIsAuditingHealth(true);
    setHealthAuditSummary('');
    try {
      const results = await batchVerifyJobsAtsHealth(jobs, (checked, total) => {
        setHealthProgress({ checked, total });
      });
      setHealthAuditResults(results);

      let deadCount = 0;
      const updatedJobs = jobs.map((j) => {
        const check = results.get(j.id);
        if (check && !check.isAlive) {
          deadCount++;
          return {
            ...j,
            healthStatus: 'DEAD_LINK' as const,
            lastHealthCheckedAt: new Date().toISOString()
          };
        } else if (check && check.isAlive) {
          return {
            ...j,
            healthStatus: 'HEALTHY' as const,
            lastHealthCheckedAt: new Date().toISOString()
          };
        }
        return j;
      });

      setJobs(updatedJobs);
      // Persist health metadata to Firestore
      batchSaveJobsToCloud(updatedJobs).catch((e) => console.warn('Could not persist health states:', e));

      if (deadCount > 0) {
        setHealthAuditSummary(`⚠️ Audit complete: ${deadCount} dead/removed or candidate-flagged role(s) detected! You can archive them below.`);
      } else {
        setHealthAuditSummary(`✓ Audit complete: All ${jobs.length} roles verified active on official ATS feeds!`);
      }
    } catch (err: any) {
      setHealthAuditSummary('Audit encountered an issue: ' + err.message);
    } finally {
      setIsAuditingHealth(false);
    }
  };

  const handleArchiveDeadJobs = async () => {
    const deadJobIds = new Set<string>();
    jobs.forEach((j) => {
      const check = healthAuditResults.get(j.id);
      if ((check && !check.isAlive) || j.healthStatus === 'DEAD_LINK' || (j.closedReportCount || 0) >= 2) {
        deadJobIds.add(j.id);
      }
    });

    if (deadJobIds.size === 0) {
      alert('No dead or closed roles to archive.');
      return;
    }

    if (confirm(`Archive ${deadJobIds.size} detected inactive/removed listing(s)? They will be moved to EXPIRED status and hidden from the public feed.`)) {
      const updated = jobs.map((j) => {
        if (deadJobIds.has(j.id)) {
          return { ...j, status: 'EXPIRED' as const, healthStatus: 'DEAD_LINK' as const };
        }
        return j;
      });
      setJobs(updated);
      try {
        await batchSaveJobsToCloud(updated);
        alert(`Successfully archived ${deadJobIds.size} dead listings! Public feed and Google schema are now clean.`);
      } catch (e: any) {
        alert('Archival note: ' + e.message);
      }
    }
  };

  const expiredJobs = jobs.filter((j) => isJobExpired(j));
  const liveActiveJobs = jobs.filter((j) => !isJobExpired(j));

  const handlePurgeExpiredJobs = () => {
    if (confirm(`Are you sure you want to permanently purge all ${expiredJobs.length} expired/vanished listings?`)) {
      setJobs((prev) => prev.filter((j) => !isJobExpired(j)));
    }
  };

  const handleExportJobsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jobs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `freshcommits_jobs_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJobsJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported) && imported.length > 0) {
          const shouldMerge = confirm(
            `Importing ${imported.length} jobs.\n\nClick OK to MERGE with current inventory, or Cancel to REPLACE current inventory.`
          );
          if (shouldMerge) {
            setJobs((prev) => {
              const existingIds = new Set(prev.map((j) => j.id));
              const newUnique = imported.filter((j: JobPosting) => !existingIds.has(j.id));
              return [...newUnique, ...prev];
            });
            alert(`Merged imported jobs! Total: ${jobs.length + imported.length}`);
          } else {
            setJobs(imported);
            alert(`Inventory replaced with ${imported.length} jobs!`);
          }
        } else {
          alert('Invalid JSON file format. Must be an array of job postings.');
        }
      } catch (err: any) {
        alert('Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Owner Mode: kartikamuthukrishnan@gmail.com
            </span>
            <span className="text-xs text-slate-400">Google Schema &amp; AdSense Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin &amp; Job Ingestion Panel</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Manual Google JobPosting schema creator, automated ATS job aggregator with relevancy &amp; deduplication filters, and Google AdSense compliance configurations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              try {
                setSupportTickets(JSON.parse(localStorage.getItem('freshcommits_support_tickets') || '[]'));
              } catch {
                // Ignore
              }
              setActiveTab('inbox');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
              activeTab === 'inbox'
                ? 'bg-emerald-500 text-slate-950 font-extrabold'
                : 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-400/40'
            }`}
            title="Open Received Inquiries Inbox"
          >
            <Inbox className="w-3.5 h-3.5 text-emerald-400" />
            <span>Support Inbox ({supportTickets.length})</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors border border-slate-700"
          >
            Back to Job Feed
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
            title="Lock Admin and require passcode again"
          >
            Lock &amp; Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto pb-1 gap-2 scrollbar-thin">
        <button
          onClick={() => setActiveTab('post')}
          className={`py-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors rounded-t-lg ${
            activeTab === 'post'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Manual Job Posting</span>
        </button>

        <button
          onClick={() => {
            try {
              setSupportTickets(JSON.parse(localStorage.getItem('freshcommits_support_tickets') || '[]'));
            } catch {
              // Ignore
            }
            setActiveTab('inbox');
          }}
          className={`py-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors rounded-t-lg ${
            activeTab === 'inbox'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60 font-bold'
              : 'border-transparent text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/30'
          }`}
        >
          <Inbox className="w-4 h-4 text-emerald-600" />
          <span>Inquiries &amp; Support Inbox</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            supportTickets.length > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {supportTickets.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`py-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors rounded-t-lg ${
            activeTab === 'sync'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${syncLoading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Automated ATS Aggregator</span>
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`py-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors rounded-t-lg ${
            activeTab === 'manage'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>Manage Listings ({jobs.length})</span>
          {(() => {
            const reportedCount = jobs.filter((j) => (j.closedReportCount || 0) > 0 || j.healthStatus === 'DEAD_LINK').length;
            if (reportedCount > 0) {
              return (
                <span className="text-[10px] bg-rose-500 text-white font-extrabold px-1.5 py-0.5 rounded-full animate-pulse" title={`${reportedCount} role(s) flagged or closed`}>
                  {reportedCount} alert{reportedCount > 1 ? 's' : ''}
                </span>
              );
            }
            return null;
          })()}
        </button>

        <button
          onClick={() => setActiveTab('schema-tester')}
          className={`py-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors rounded-t-lg ${
            activeTab === 'schema-tester'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Google Schema Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('adsense')}
          className={`py-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors rounded-t-lg ${
            activeTab === 'adsense'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
            {editingJobId && (
              <div className="mb-5 p-3.5 bg-amber-50 border-2 border-amber-300 rounded-xl flex items-center justify-between gap-3 flex-wrap animate-fade-in shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                      Editing Mode Active
                    </h3>
                    <p className="text-[11px] text-amber-800">
                      You are editing listing ID: <span className="font-mono font-semibold">{editingJobId}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                >
                  Cancel Edit &amp; Post New
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingJobId ? 'Edit & Update Job Listing' : 'Post New Global / US Job Listing'}
                </h2>
                <p className="text-xs text-slate-500">
                  {editingJobId
                    ? 'Update job details, salary, requirements, and Google JobPosting schema.'
                    : 'Full Google JobPosting schema compliant with telecommute/remote options.'}
                </p>
              </div>
              {postSuccess && lastPublishedJob && (
                <div className="flex flex-col gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 animate-fade-in shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{editingJobId ? 'Listing Updated & Synced to Cloud!' : 'Job Published & Synced to Cloud!'}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <a
                      href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(`https://www.freshcommits.com/?job=${lastPublishedJob.id}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                      title="Test live URL directly on Google Rich Results"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Test in Google Rich Results</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        const snippet = generateJobPostingHtmlSnippet(lastPublishedJob);
                        navigator.clipboard.writeText(snippet);
                        alert('Copied complete JobPosting schema wrapped in <script type="application/ld+json">! Paste directly into Google Rich Results "< > CODE" tab.');
                      }}
                      className="px-2.5 py-1 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                      title="Copy complete <script> HTML snippet for Google Rich Results Code tab"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy for Google Code Tab (&lt;script&gt;)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const s = generateJobPostingSchema(lastPublishedJob);
                        navigator.clipboard.writeText(JSON.stringify(s, null, 2));
                        alert('Copied raw JSON-LD object to clipboard.');
                      }}
                      className="px-2 py-1 bg-white/70 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg text-[10px] font-medium transition-colors cursor-pointer"
                      title="Copy raw JSON-LD"
                    >
                      <span>Raw JSON</span>
                    </button>
                    <a
                      href={`/?job=${lastPublishedJob.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 text-slate-600 hover:text-slate-900 text-[11px] font-medium underline"
                    >
                      View Job Link
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* ⚡ Instant Smart ATS Ingestion & Auto-Fill ("The FreshCommits Edge") */}
            <div className="mb-6 p-4 bg-gradient-to-br from-indigo-50/90 via-slate-50 to-emerald-50/70 border border-indigo-200 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                      Instant Career &amp; ATS Link Converter &amp; Auto-Fill
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Auto-extracts JD metadata &amp; generates "The FreshCommits Edge" summary from any career URL
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-100">
                  <span>Google Careers • Workday • Greenhouse • Lever • Ashby • Amazon • Any Career Link</span>
                </div>
              </div>

              <form onSubmit={handleAutoExtract} className="mt-3 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    required
                    placeholder="Paste job URL (e.g. Google Careers, Workday, Greenhouse, Lever, Ashby, or company link)"
                    value={autoExtractUrl}
                    onChange={(e) => setAutoExtractUrl(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs font-mono"
                  />
                  <LinkIcon className="w-3.5 h-3.5 text-indigo-400 absolute left-2.5 top-2.5" />
                </div>
                <button
                  type="submit"
                  disabled={isExtracting || !autoExtractUrl.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 flex-shrink-0 cursor-pointer"
                >
                  {isExtracting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting &amp; Curating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Convert &amp; Fill Form</span>
                    </>
                  )}
                </button>
              </form>

              {/* Feedback banners */}
              {extractSuccessMsg && (
                <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{extractSuccessMsg}</span>
                </div>
              )}
              {extractErrorMsg && (
                <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{extractErrorMsg}</span>
                </div>
              )}
            </div>

            <form onSubmit={handlePostJob} className="space-y-4 text-xs sm:text-sm">
              {/* Real-time ATS & Inventory Duplicate Sentinel */}
              {duplicateCheck.isDuplicate && (
                <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-2 animate-fade-in shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <strong className="text-xs font-bold text-rose-950">
                          Potential Duplicate Detected ({duplicateCheck.matchType === 'EXACT_URL' ? 'Exact ATS URL Match' : duplicateCheck.matchType === 'EXACT_FINGERPRINT' ? 'Exact Company & Title Match' : 'High Keyword Similarity'})
                        </strong>
                        <span className="text-[10px] uppercase font-bold bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded">
                          ATS Protected
                        </span>
                      </div>
                      <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                        {duplicateCheck.reason}
                      </p>
                    </div>
                  </div>

                  {duplicateCheck.matchingJob && (
                    <div className="bg-white/90 border border-rose-200 rounded-lg p-2.5 text-xs text-slate-700 flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <span className="font-bold text-slate-900">{duplicateCheck.matchingJob.title}</span> at <span className="font-semibold text-slate-800">{duplicateCheck.matchingJob.company}</span>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>Status: <strong>{duplicateCheck.matchingJob.status}</strong></span>
                          <span>•</span>
                          <span>Source: {duplicateCheck.matchingJob.source}</span>
                          <span>•</span>
                          <span>Posted: {duplicateCheck.matchingJob.datePosted}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={duplicateCheck.matchingJob.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded border border-indigo-200"
                        >
                          <ExternalLink className="w-3 h-3" /> View Existing
                        </a>
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-rose-700 italic">
                    💡 Tip: If this is an updated or unique requisition, modify the title (e.g. add "(Fall 2026 Cohort)") or use a unique direct ATS link to proceed.
                  </p>
                </div>
              )}

              {/* Unique / Clean Status Badge when inputs are typed */}
              {!duplicateCheck.isDuplicate && (title.trim().length > 3 || company.trim().length > 2 || applyUrl.trim().length > 10) && (
                <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    <strong>Unique Listing Confirmed:</strong> No conflicts found with current automated ATS feeds or active database.
                  </span>
                </div>
              )}

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

              {/* Date Posted & Experience Configuration */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      Date Posted <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={datePosted}
                      onChange={(e) => setDatePosted(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Listing publication date displayed on the card and in Google JobPosting schema.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Experience Level (Below Date Posted)
                    </label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                    >
                      <option value="Entry Level">Entry/Early Career</option>
                      <option value="New Grad">New Grad (2025/2026)</option>
                      <option value="Fresher">Fresher (0 YoE)</option>
                      <option value="Internship">Internship</option>
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Default option: Entry/Early Career.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/80">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Max Years Experience</label>
                    <select
                      value={maxYearsExperience}
                      onChange={(e) => setMaxYearsExperience(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      <option value={0}>0 Years (Strict Fresher / Grad)</option>
                      <option value={1}>1 Year Max</option>
                      <option value={2}>2 Years Max (Entry Level 0-2YoE)</option>
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
              </div>

              {/* Salary Range & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
                  <select
                    value={salaryCurrency}
                    onChange={(e) => setSalaryCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  >
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="CAD">CAD ($) - Canadian Dollar</option>
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="AUD">AUD ($) - Australian Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Minimum ({salaryCurrency}/{employmentType === 'INTERN' ? 'hr' : 'yr'})
                  </label>
                  <input
                    type="number"
                    step={employmentType === 'INTERN' ? 1 : 1000}
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Maximum ({salaryCurrency}/{employmentType === 'INTERN' ? 'hr' : 'yr'})
                  </label>
                  <input
                    type="number"
                    step={employmentType === 'INTERN' ? 1 : 1000}
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* High-RPM Focus Keyword & Google AdSense SEO JD Toolkit */}
              <div className="p-4 bg-gradient-to-br from-indigo-50/90 via-sky-50/60 to-purple-50/50 border-2 border-indigo-200/90 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        High-RPM Focus Keyword &amp; AdSense JD Generator
                        <span className="text-[10px] normal-case bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                          Google Helpful Content Compliant
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Synthesizes high-paying search intent, editorial commentary, and structured qualifications.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>AdSense Quality Certified</span>
                  </div>
                </div>

                {/* 1-Click Micro-Niche Preset Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        Micro-Niche Preset Mode:
                      </label>
                      <p className="text-[11px] text-slate-500">
                        {selectedMicroNiche
                          ? `Currently Active Preset: "${selectedMicroNiche.name}". Click "No Preset (Standard)" to clear.`
                          : 'Standard Mode Active: No keywords or niche constraints forced. Perfect for standard manual postings.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setSelectedMicroNiche(null)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                          !selectedMicroNiche
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        <span>● No Preset (Standard Job)</span>
                      </button>
                      <span className="text-slate-300">|</span>
                      <span className="text-[11px] text-slate-500 font-medium px-2">
                        {selectedMicroNiche ? 'Preset Active' : 'Select a Preset Below ↓'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {/* Explicit Option 1: Standard Job (No Preset) Card */}
                    <button
                      type="button"
                      onClick={() => setSelectedMicroNiche(null)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        !selectedMicroNiche
                          ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-200'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs leading-tight text-emerald-950">
                          🌱 Standard Job (No Preset)
                        </span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            !selectedMicroNiche
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {!selectedMicroNiche ? '✓ ACTIVE' : 'Click to Set'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 line-clamp-2">
                        Post standard manual job with exact employer title &amp; description. Zero forced keyword tags.
                      </p>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>Natural Schema</span>
                        <span className="italic">Any Location</span>
                      </div>
                    </button>

                    {/* Available Niche Presets */}
                    {MICRO_NICHE_PRESETS.map((preset) => {
                      const isSelected = selectedMicroNiche?.id === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplyMicroNichePreset(preset)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300'
                              : 'bg-white hover:bg-indigo-50/50 text-slate-800 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-xs leading-tight line-clamp-1">{preset.name}</span>
                            <span
                              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : preset.rpmTier === 'HIGH_RPM'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}
                            >
                              {isSelected ? '✓ Selected' : preset.rpmTier === 'HIGH_RPM' ? '💰 High RPM' : '🔥 Viral Vol'}
                            </span>
                          </div>
                          <p className={`text-[10px] line-clamp-2 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                            {preset.targetAudience}
                          </p>
                          <div className="mt-1.5 pt-1.5 border-t border-current/15 flex items-center justify-between text-[10px]">
                            <span className="font-mono opacity-90">
                              {preset.suggestedSalaryRange.currency === 'INR'
                                ? `₹${preset.suggestedSalaryRange.min / 100000}L–₹${preset.suggestedSalaryRange.max / 100000}L`
                                : `$${preset.suggestedSalaryRange.min / 1000}k–$${preset.suggestedSalaryRange.max / 1000}k`}
                            </span>
                            <span className="italic opacity-80">{preset.defaultLocation.split('(')[0].trim()}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Keywords for Selected Niche or Standard Mode */}
                {selectedMicroNiche ? (
                  <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-2.5 animate-fade-in">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Target Search Keywords ({selectedMicroNiche.badge}):
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {selectedMicroNiche.primaryKeywords.length} Search Queries
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedMicroNiche(null)}
                          className="text-[10px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer underline"
                        >
                          Deselect
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMicroNiche.primaryKeywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium bg-white text-indigo-900 px-2 py-0.5 rounded-md border border-indigo-200 font-mono"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-indigo-800 mt-1.5 italic">
                      💡 <strong>AdSense Strategy:</strong> {selectedMicroNiche.guidelinesNotes}
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
                      <span>
                        <strong>Standard Manual Job:</strong> No focus preset active. Title, location, and requirements will be posted cleanly without forced niche tags.
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 italic shrink-0">
                      (Click any preset above only if you wish to apply targeted keywords)
                    </span>
                  </div>
                )}

                {/* Generate Button & Feedback */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleGenerateSeoJd}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>Generate AdSense-Compliant Editorial JD</span>
                  </button>
                  <span className="text-[11px] text-slate-500 text-center sm:text-right">
                    Generates 150+ words of authentic editorial review, structured checklist &amp; requirements.
                  </span>
                </div>

                {seoJdSuccessMsg && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-medium">{seoJdSuccessMsg}</span>
                  </div>
                )}
              </div>

              {/* Unparaphrased Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Job Description (Original &amp; Editorial Content) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste verbatim job description or use 'Generate AdSense-Compliant Editorial JD' above..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono leading-relaxed"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>
                    Word count: <strong>{description.split(/\s+/).filter(Boolean).length} words</strong>{' '}
                    {description.split(/\s+/).filter(Boolean).length >= 150 ? (
                      <span className="text-emerald-600 font-semibold">(✅ Meets AdSense Helpful Content length)</span>
                    ) : (
                      <span className="text-amber-600">(⚠️ Suggest 150+ words for AdSense indexing)</span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400">Preserves original requirements without thin content penalties</span>
                </div>
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
                    Direct Career / ATS Apply URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.google.com/about/careers/... or Workday, Greenhouse, Lever, Ashby, etc."
                    value={applyUrl}
                    onChange={(e) => setApplyUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                  {applyUrl && (applyUrl.includes('/search') || applyUrl.endsWith('/careers') || applyUrl.includes('?q=')) ? (
                    <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                      Notice: This URL points to a search/portal page. Direct requisition links yield higher conversion and pass Google JobPosting validation.
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Links directly to this specific job opening (Google Careers, Workday, Greenhouse, Lever, Ashby, etc.) for direct candidate application.
                    </p>
                  )}
                </div>
              </div>

              {/* Auto-Vanish Window Configuration */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    Auto-Vanish Window (Validity Duration)
                  </label>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                    Vanishes on: {new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} ({validDays}d)
                  </span>
                </div>
                <select
                  value={validDays}
                  onChange={(e) => setValidDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={14}>14 Days — Short sprint / urgent requisition</option>
                  <option value={30}>30 Days — Standard early-career window</option>
                  <option value={45}>45 Days — Automated ATS Default (Recommended)</option>
                  <option value={60}>60 Days — University graduate hiring cycle</option>
                  <option value={90}>90 Days — Summer internship pipeline</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Once this date is reached, the job will automatically vanish from public listings, search filters, and Google schema without requiring manual deletion.
                </p>
              </div>

              {/* Submit / Save Button */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className={`flex-1 py-2.5 px-4 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer ${
                    editingJobId
                      ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
                      : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                  }`}
                >
                  {editingJobId ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes &amp; Update Schema</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Publish Job With Google Schema</span>
                    </>
                  )}
                </button>

                {editingJobId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
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

            {/* Quality & ATS Deduplication Guide for Site Owners */}
            <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4 shadow-sm text-xs text-indigo-950 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Founder's Quality Playbook (Anti-Duplicate Guide)</span>
              </div>
              <ul className="space-y-1.5 text-slate-700 leading-normal pl-3 list-disc text-[11px]">
                <li>
                  <strong className="text-slate-900">Bypass ATS Crawlers:</strong> Focus manual posting on early-stage YC startups, Twitter/X founder hires, and niche direct emails that automated feeds never reach.
                </li>
                <li>
                  <strong className="text-slate-900">Deep Link Requisitions:</strong> Always provide exact requisition URLs instead of general <code>/careers</code> landing pages.
                </li>
                <li>
                  <strong className="text-slate-900">Real-Time Sentinel:</strong> Our duplicate scanner checks direct URLs, title fingerprints, and company similarity on every keystroke.
                </li>
              </ul>
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

          {/* SMARTRECRUITERS DEDICATED LIVE ATS FEEDER */}
          <div className="bg-white rounded-2xl border border-teal-200/80 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full pointer-events-none -z-0 opacity-70" />
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-full border border-teal-300">
                  <CheckCircle2 className="w-3 h-3 text-teal-700" /> jobs.smartrecruiters.com Live Pipeline
                </span>
                <span className="text-[11px] text-slate-500 font-mono">CORS Proxy + Direct Enterprise API</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">SmartRecruiters Verified Job Ingestion</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connects directly to SmartRecruiters global job board and verified tech companies (such as Wise, Bosch, Canva, Arista Networks, Ubisoft, and Delta Electronics). Queries real-time early-career requisitions, filters through strict junior/entry rules (&le; 2 YoE, no senior/lead positions), and imports clean job cards with direct employer apply links.
              </p>

              {/* Keyword & Controls */}
              <div className="mt-5 p-4 bg-teal-50/60 rounded-xl border border-teal-200/70 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Search Keyword or Company Identifier
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. junior software engineer, new grad, Wise, Canva..."
                      value={srKeyword}
                      onChange={(e) => setSrKeyword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center pt-2 sm:pt-4">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={srRemoteOnly}
                        onChange={(e) => setSrRemoteOnly(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                      />
                      <span>Remote Only</span>
                    </label>
                  </div>

                  <div className="self-end sm:self-center pt-2 sm:pt-4">
                    <button
                      onClick={() => handleTriggerSmartRecruitersSync()}
                      disabled={srLoading}
                      className="w-full sm:w-auto px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${srLoading ? 'animate-spin' : ''}`} />
                      <span>{srLoading ? 'Querying SmartRecruiters...' : 'Fetch Live SmartRecruiters'}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Preset Buttons */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'junior software engineer',
                      'graduate software engineer',
                      'software engineer intern',
                      'entry level developer',
                      'Wise',
                      'Canva',
                      'Bosch'
                    ].map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => {
                          setSrKeyword(kw);
                          handleTriggerSmartRecruitersSync(kw);
                        }}
                        disabled={srLoading}
                        className="text-[11px] px-2 py-1 rounded bg-white hover:bg-teal-100 text-teal-900 border border-teal-200 transition-colors font-medium disabled:opacity-50"
                      >
                        +{kw}
                      </button>
                    ))}
                  </div>
                </div>
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
                        <td className="py-3 px-3">
                          <span className="text-amber-600 font-semibold">{log.duplicatesSkippedCount}</span>
                          {Boolean(log.manualOverridesCount && log.manualOverridesCount > 0) && (
                            <span className="block text-[10px] text-indigo-700 font-medium bg-indigo-50 px-1.5 py-0.2 rounded mt-0.5 border border-indigo-100 w-fit">
                              🛡️ {log.manualOverridesCount} manual protected
                            </span>
                          )}
                        </td>
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
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">Job Inventory</h2>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  {liveActiveJobs.length} Live Active
                </span>
                {expiredJobs.length > 0 && (
                  <span className="text-xs bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full border border-rose-200">
                    {expiredJobs.length} Auto-Vanished (Expired)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Active listings are live on the public feed and Google search index. Listings past their validity date automatically vanish.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleRunAtsHealthAudit}
                disabled={isAuditingHealth}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                title="Directly checks Greenhouse, Lever, and SmartRecruiters public API endpoints for 404 take-downs at $0 cost"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuditingHealth ? 'animate-spin' : ''}`} />
                <span>
                  {isAuditingHealth
                    ? `Auditing ATS Links (${healthProgress.checked}/${healthProgress.total})...`
                    : '🔍 Audit ATS Link Health ($0)'}
                </span>
              </button>

              {/* One-click archive button if any dead roles or reported roles exist */}
              {(() => {
                const deadRolesCount = jobs.filter(
                  (j) => j.healthStatus === 'DEAD_LINK' || (j.closedReportCount || 0) >= 2 || healthAuditResults.get(j.id)?.isAlive === false
                ).length;
                if (deadRolesCount > 0) {
                  return (
                    <button
                      onClick={handleArchiveDeadJobs}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer animate-pulse"
                      title="Instantly marks all 404 or closed listings as EXPIRED so they vanish from the feed and Google search index"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Archive All Dead Roles ({deadRolesCount})</span>
                    </button>
                  );
                }
                return null;
              })()}

              <button
                onClick={handlePushAllToCloud}
                disabled={pushingToCloud}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                title="Immediately publish all listings to Firestore so every visitor worldwide sees them instantly"
              >
                {pushingToCloud ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Cloud className="w-3.5 h-3.5" />
                )}
                <span>{pushingToCloud ? 'Publishing...' : `Publish to Global Cloud (${jobs.length})`}</span>
              </button>

              <button
                onClick={handleExportJobsJson}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition-colors shadow-2xs cursor-pointer"
                title="Download complete JSON backup of all job postings"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                Export Backup
              </button>

              <label
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors shadow-2xs cursor-pointer"
                title="Import/restore jobs from a JSON file"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                Import JSON
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJobsJson}
                  className="hidden"
                />
              </label>

              {expiredJobs.length > 0 && (
                <button
                  onClick={handlePurgeExpiredJobs}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors shadow-2xs cursor-pointer"
                  title="Permanently remove all expired listings"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Purge {expiredJobs.length} Vanished Listing{expiredJobs.length > 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>

          {/* Health Audit Results Alert Banner */}
          {healthAuditSummary && (
            <div className={`mb-4 p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
              healthAuditSummary.includes('⚠️')
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300'
            }`}>
              <div className="flex items-center gap-2">
                {healthAuditSummary.includes('⚠️') ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span className="font-semibold">{healthAuditSummary}</span>
              </div>
              <button
                type="button"
                onClick={() => setHealthAuditSummary('')}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Company &amp; Role</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Level / YoE</th>
                  <th className="py-2.5 px-3">Salary</th>
                  <th className="py-2.5 px-3">Source &amp; ATS Health</th>
                  <th className="py-2.5 px-3">Auto-Vanish / Expiry</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => {
                  const expired = isJobExpired(job);
                  const daysLeft = getDaysUntilExpiration(job.validThrough);
                  const check = healthAuditResults.get(job.id);
                  const isDeadOnAts = check ? !check.isAlive : job.healthStatus === 'DEAD_LINK';
                  const isCandidateFlagged = (job.closedReportCount || 0) >= 1;

                  return (
                    <tr
                      key={job.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isDeadOnAts
                          ? 'bg-rose-50/70 border-l-4 border-l-rose-500'
                          : isCandidateFlagged
                          ? 'bg-amber-50/50 border-l-4 border-l-amber-500'
                          : expired
                          ? 'bg-slate-50/60 opacity-80'
                          : ''
                      }`}
                    >
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
                        <div className="space-y-1">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold inline-block ${
                              job.source === 'EMPLOYER_POST'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}
                          >
                            {job.source === 'EMPLOYER_POST' ? 'Direct Employer' : 'ATS Aggregated'}
                          </span>

                          {/* ATS Health & Candidate Trigger Badges */}
                          {isDeadOnAts ? (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-300"
                              title={check?.reason || 'Role was removed or returned 404 from ATS'}
                            >
                              <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                              <span>🚨 ATS Removed (404)</span>
                            </span>
                          ) : job.healthStatus === 'HEALTHY' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              <span>✓ ATS Live</span>
                            </span>
                          ) : null}

                          {isCandidateFlagged && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300"
                              title="Flagged by real applicants clicking 'Report Expired Link'"
                            >
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-700" />
                              <span>⚠️ Reported Closed ({job.closedReportCount})</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {expired ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" /> Vanished
                          </span>
                        ) : (
                          <div className="text-[11px]">
                            <span className="font-mono text-slate-700">{job.validThrough || 'No date set'}</span>
                            {daysLeft !== null && (
                              <span className="block text-[10px] text-slate-400">
                                {daysLeft <= 0 ? 'Expires today' : `${daysLeft}d left`}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleStatus(job.id)}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                            job.status === 'ACTIVE' && !expired
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {job.status}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStartEditJob(job)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit this listing"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Open ATS Apply URL"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* TAB 4: GOOGLE SCHEMA INSPECTOR */}
      {activeTab === 'schema-tester' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-900">Google JobPosting Structured Data Inspector</h2>
              </div>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Every job on FreshCommits is backed by Google Search Central compliant <code>JobPosting</code> JSON-LD structured data. Test live URLs directly in Google's official tool or copy the code to inspect rich results.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <span>Google Rich Results Tool</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Educational Notice on Google Rich Results Testing */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>How To Validate Schema In Google Rich Results:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-700">
              <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                <strong className="block text-slate-900 mb-1">1. Test Live URL Tab</strong>
                Googlebot crawls <code>https://www.freshcommits.com/?job=...</code>. Note: Always use the canonical <code>www.freshcommits.com</code> URL to avoid 301 redirects, where our preloaded schema is immediately parsed in the &lt;head&gt;.
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                <strong className="block text-slate-900 mb-1">2. Test Code Tab (Instant 100% Validation)</strong>
                Click <strong>"Copy for Code Tab (&lt;script&gt;)"</strong> below. Google's &lt; &gt; CODE tab requires the <code>&lt;script type="application/ld+json"&gt;</code> wrapper (raw JSON without tags causes "No items detected"). Paste and click Test Code for full green checkmarks!
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or ID (e.g. manual-)..."
                value={schemaSearchQuery}
                onChange={(e) => setSchemaSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSchemaFilter('all')}
                className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  schemaFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({jobs.length})
              </button>
              <button
                type="button"
                onClick={() => setSchemaFilter('manual')}
                className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  schemaFilter === 'manual' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Manual Admin ({jobs.filter((j) => j.id.startsWith('manual-') || j.source === 'MANUAL_ADMIN').length})
              </button>
              <button
                type="button"
                onClick={() => setSchemaFilter('synced')}
                className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  schemaFilter === 'synced' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Synced ATS ({jobs.filter((j) => !j.id.startsWith('manual-') && j.source !== 'MANUAL_ADMIN').length})
              </button>
            </div>
          </div>

          {/* Job Schema Cards Grid */}
          {(() => {
            const filtered = jobs.filter((job) => {
              if (schemaFilter === 'manual' && !(job.id.startsWith('manual-') || job.source === 'MANUAL_ADMIN')) {
                return false;
              }
              if (schemaFilter === 'synced' && (job.id.startsWith('manual-') || job.source === 'MANUAL_ADMIN')) {
                return false;
              }
              if (!schemaSearchQuery.trim()) return true;
              const q = schemaSearchQuery.toLowerCase();
              return (
                job.title.toLowerCase().includes(q) ||
                job.company.toLowerCase().includes(q) ||
                job.id.toLowerCase().includes(q)
              );
            });

            if (filtered.length === 0) {
              return (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                  No jobs matched your schema search filter.
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.map((job) => {
                  const schema = generateJobPostingSchema(job);
                  const isManual = job.id.startsWith('manual-') || job.source === 'MANUAL_ADMIN';
                  const liveUrl = `https://www.freshcommits.com/?job=${encodeURIComponent(job.id)}`;
                  const richResultsTestUrl = `https://search.google.com/test/rich-results?url=${encodeURIComponent(liveUrl)}`;

                  return (
                    <div
                      key={job.id}
                      className={`p-4 rounded-xl border space-y-2.5 transition-all shadow-xs ${
                        isManual ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs">{job.title}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                isManual ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isManual ? 'Manual Admin' : 'ATS Feed'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            {job.company} &bull; ID: <code className="text-slate-700 font-mono text-[10px]">{job.id}</code>
                          </span>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
                          <a
                            href={richResultsTestUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                            title="Test this specific live job URL on Google Rich Results"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Test Live URL</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                          <button
                            onClick={() => {
                              const snippet = generateJobPostingHtmlSnippet(job);
                              navigator.clipboard.writeText(snippet);
                              alert(`Copied complete <script> tag for "${job.title}"! Paste directly into Google Rich Results "< > CODE" tab.`);
                            }}
                            className="px-2 py-1 bg-white border border-emerald-300 rounded text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 flex items-center gap-1 cursor-pointer"
                            title="Copy complete <script type='application/ld+json'> tag for Google Rich Results Code tab"
                          >
                            <Copy className="w-3 h-3 text-emerald-600" />
                            <span>Copy for Code Tab (&lt;script&gt;)</span>
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
                              alert(`Copied raw JSON-LD for "${job.title}".`);
                            }}
                            className="px-1.5 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600 hover:bg-slate-200 cursor-pointer"
                            title="Copy raw JSON"
                          >
                            <span>JSON</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 bg-white/80 p-2 rounded-lg border border-slate-200/80">
                        <span>🗓️ Posted: <strong>{job.datePosted || 'Active'}</strong></span>
                        <span>⏳ Valid Through: <strong>{job.validThrough || '2026-12-31'}</strong></span>
                        <span>💵 Base: <strong>{job.salary ? `${job.salary.currency || 'USD'} ${job.salary.min?.toLocaleString()}` : 'Disclosed'}</strong></span>
                      </div>

                      <pre className="p-2.5 bg-slate-900 text-slate-100 rounded text-[10px] font-mono overflow-x-auto max-h-44 leading-relaxed">
                        {JSON.stringify(schema, null, 2)}
                      </pre>
                    </div>
                  );
                })}
              </div>
            );
          })()}
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

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    saveAdConfigToCloud(adConfig);
                    alert('AdSense settings synced to Cloud Firestore!');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  Save &amp; Sync Ad Settings Globally
                </button>
              </div>
            </div>

            {/* Google Analytics 4 (GA4) Integration */}
            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Google Analytics 4 (GA4)</h3>
                </div>
                {gaId && gaId.startsWith('G-') && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                Connect your Google Analytics 4 Measurement ID (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">G-XXXXXXXXXX</code>) to track real-time active visitors, job click-throughs, and page views.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Measurement ID
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={gaId}
                      onChange={(e) => {
                        setGaId(e.target.value);
                        setGaMsg('');
                      }}
                      placeholder="G-XXXXXXXXXX"
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleSaveGaId}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                    >
                      Save &amp; Connect
                    </button>
                  </div>
                  {gaMsg && (
                    <p className={`text-[11px] mt-1.5 font-medium ${gaMsg.includes('Warning') ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {gaMsg}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-600">Tracked: Page Views, Job Views, ATS Apply Clicks</span>
                  <a
                    href="https://analytics.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Open GA4 Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Real-time Admin Traffic Exclusion Card */}
                <div className="p-3.5 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl text-white shadow-sm border border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                        <EyeOff className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">Exclude Admin Traffic from GA4</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            excludeAdminFromGa
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            {excludeAdminFromGa ? '🛡️ EXCLUDED & BLOCKED' : 'TRACKING ON'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                          Blocks your visits, page reloads, job creation tests, and clicks from being reported to Google Analytics.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleExcludeAdmin}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        excludeAdminFromGa ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                      role="switch"
                      aria-checked={excludeAdminFromGa}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          excludeAdminFromGa ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      {excludeAdminFromGa
                        ? '✓ All admin sessions & admin URL paths are automatically suppressed.'
                        : '⚠️ Your admin usage is currently being logged to GA4.'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowGaFilterGuide(!showGaFilterGuide)}
                      className="text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1"
                    >
                      <span>{showGaFilterGuide ? 'Hide' : 'How to filter past data in GA4'}</span>
                      {showGaFilterGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Expandable Step-by-Step Guide for GA4 Historical Data Removal */}
                  {showGaFilterGuide && (
                    <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] space-y-2.5 text-slate-300 animate-in fade-in duration-150">
                      <p className="font-semibold text-white">
                        How to remove admin pageviews from your existing Google Analytics reports:
                      </p>
                      <ol className="list-decimal pl-4 space-y-1.5 text-slate-300 text-[11px]">
                        <li>
                          In Google Analytics, go to <span className="font-mono text-emerald-300">Reports → Engagement → Pages and screens</span>.
                        </li>
                        <li>
                          Click the <span className="font-semibold text-white">+ Add filter</span> button at the top of the chart.
                        </li>
                        <li>
                          Set Dimension: <span className="font-mono text-emerald-300">Page path and screen class</span>.
                        </li>
                        <li>
                          Set Match type: <span className="font-mono text-emerald-300">does not contain</span>, and enter value: <span className="font-mono text-emerald-300">admin</span>.
                        </li>
                        <li>
                          Click <span className="font-semibold text-white">Apply</span>. All past admin visits (<code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">/?view=admin</code> and <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">#admin</code>) will instantly vanish from your reports!
                        </li>
                      </ol>

                      <div className="p-2 bg-slate-800/80 rounded-lg flex items-center justify-between gap-2 border border-slate-700/60 mt-2">
                        <span className="font-mono text-[10px] text-slate-300 truncate">
                          Filter regex: admin|\?view=admin|#admin
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyFilterRegex}
                          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-[10px] font-bold shrink-0 flex items-center gap-1 transition-colors"
                        >
                          {copiedFilterText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedFilterText ? 'Copied!' : 'Copy Filter'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Owner Security Settings */}
            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Owner Access &amp; Secret Passcode</h3>
              </div>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                The Admin Panel is completely hidden from public visitors and Google crawlers. Only the site owner can unlock it using your secret passcode or via <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">?admin=true</code> and <kbd className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">Ctrl+Shift+A</kbd>.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Update Secret Passcode
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customPasscode}
                      onChange={(e) => {
                        setCustomPasscode(e.target.value);
                        setPasscodeMsg('');
                      }}
                      placeholder="Enter new admin passcode"
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!customPasscode.trim()) {
                          setPasscodeMsg('Passcode cannot be empty.');
                          return;
                        }
                        onUpdatePasscode(customPasscode.trim());
                        setPasscodeMsg('Saved successfully!');
                        setTimeout(() => setPasscodeMsg(''), 3000);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Save Passcode
                    </button>
                  </div>
                  {passcodeMsg && (
                    <p className={`text-[11px] mt-1 font-semibold ${passcodeMsg.includes('Saved') ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {passcodeMsg}
                    </p>
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                  <span>Authorized Owner: </span>
                  <strong className="text-slate-900 font-mono">kartikamuthukrishnan@gmail.com</strong>
                </div>
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

            {/* Authorized ads.txt Generator */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Authorized ads.txt Generator
                </span>
                <span className="text-[10px] text-slate-500 font-mono">/ads.txt</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Google AdSense requires an <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">ads.txt</code> file in your domain root to prevent unauthorized inventory sales.
              </p>
              <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-xl font-mono text-[11px] flex items-center justify-between gap-3 shadow-inner">
                <code className="truncate">
                  {adConfig.publisherId.trim()
                    ? `google.com, ${adConfig.publisherId.trim().replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0`
                    : 'google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0'}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    const pub = adConfig.publisherId.trim().replace(/^ca-/, '') || 'pub-XXXXXXXXXXXXXXXX';
                    const text = `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`;
                    navigator.clipboard.writeText(text);
                    setCopiedAdsTxt(true);
                    setTimeout(() => setCopiedAdsTxt(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold border border-slate-700 transition-colors flex-shrink-0 cursor-pointer"
                >
                  {copiedAdsTxt ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: INQUIRIES & SUPPORT INBOX */}
      {activeTab === 'inbox' && (
        <div className="space-y-6">
          {/* Notification Email Settings & Activation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  Support Notification Destination Email
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inquiries will be forwarded to this inbox and automatically backed up below.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const sample = {
                      id: 'FC-428432',
                      name: 'Dillib Chandran',
                      email: 'dillib.chandran@gmail.com',
                      company: 'Tech Candidate',
                      inquiryType: 'jobseeker',
                      subject: 'Junior SWE Listing Question',
                      message: 'Hello, testing the FreshCommits contact desk inquiry transmission.',
                      timestamp: new Date().toISOString(),
                      status: 'delivered',
                    };
                    const existing = JSON.parse(localStorage.getItem('freshcommits_support_tickets') || '[]');
                    if (!existing.some((t: any) => t.id === 'FC-428432')) {
                      const updated = [sample, ...existing];
                      localStorage.setItem('freshcommits_support_tickets', JSON.stringify(updated));
                      setSupportTickets(updated);
                    }
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                  title="Restore or test ticket reference #FC-428432"
                >
                  + Restore Ref #FC-428432
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={supportRecipientEmail}
                  onChange={(e) => setSupportRecipientEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                />
              </div>

              <button
                onClick={() => {
                  localStorage.setItem('freshcommits_support_recipient_email', supportRecipientEmail);
                  setActivationFeedback('Saved notification email preference!');
                  setTimeout(() => setActivationFeedback(''), 4000);
                }}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
              >
                Save Recipient Email
              </button>

              <button
                disabled={isActivating || !supportRecipientEmail}
                onClick={async () => {
                  setIsActivating(true);
                  setActivationFeedback('');
                  try {
                    localStorage.setItem('freshcommits_support_recipient_email', supportRecipientEmail);
                    const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(supportRecipientEmail)}`;
                    const res = await fetch(endpoint, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                      body: JSON.stringify({
                        _subject: '[FreshCommits] Activation Verification Request',
                        name: 'FreshCommits Owner Desk',
                        email: supportRecipientEmail,
                        message: 'This is a one-time activation request for the FreshCommits Support Desk form.',
                        _captcha: 'false',
                      }),
                    });
                    const data = await res.json().catch(() => null);
                    if (data && data.message && data.message.toLowerCase().includes('activation')) {
                      setActivationFeedback(`Activation email sent! Please check ${supportRecipientEmail} (and Spam folder) to click 'Activate Form'.`);
                    } else {
                      setActivationFeedback(`Success! FormSubmit activation triggered for ${supportRecipientEmail}.`);
                    }
                  } catch (err: any) {
                    setActivationFeedback('Error sending activation ping. Check network or verify email address.');
                  } finally {
                    setIsActivating(false);
                  }
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isActivating ? 'animate-spin' : ''}`} />
                <span>{isActivating ? 'Triggering...' : 'Trigger Activation Link'}</span>
              </button>
            </div>

            {activationFeedback && (
              <div className="text-xs p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                {activationFeedback}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-600">
                  <strong className="text-slate-800">Sender Auto-Reply Active:</strong> Every candidate or employer automatically gets an instant confirmation email with their ticket ref &amp; submitted summary.
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-600">
                  <strong className="text-slate-800">Zero Lost Inquiries:</strong> Every submission is mirrored right into your local admin console even if offline.
                </span>
              </div>
            </div>
          </div>

          {/* Activation Notice Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-amber-900">
                  Why FormSubmit requires activation before sending emails:
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  FormSubmit will <strong>not forward any emails to the receiver OR send the autoresponse to the sender</strong> until you click the confirmation link in the one-time activation email sent to <strong>{supportRecipientEmail}</strong>.
                </p>
                <ol className="text-xs text-amber-900 list-decimal list-inside space-y-1 pl-1">
                  <li>Click <strong>"Trigger Activation Link"</strong> above if you haven't received it yet.</li>
                  <li>Open <strong>{supportRecipientEmail}</strong> and look for an email from <strong>FormSubmit</strong> (subject: <em>"Action Required: Activate your FormSubmit"</em>). Check <strong>Spam / Junk</strong> if not in primary inbox.</li>
                  <li>Click the <strong>"Activate Form"</strong> button inside that email. Once activated, all candidate inquiries and sender auto-responses will deliver immediately.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Inquiries List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-emerald-600" />
                  Received Support &amp; Employer Inquiries ({supportTickets.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Complete record of all messages submitted via the Contact Desk.
                </p>
              </div>

              {supportTickets.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Clear all stored inquiries from local console?')) {
                      localStorage.removeItem('freshcommits_support_tickets');
                      setSupportTickets([]);
                    }
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium px-3 py-1.5 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Inquiries
                </button>
              )}
            </div>

            {supportTickets.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No inquiries received yet. Submit an inquiry through the Contact Desk on the site to see it logged here.
              </div>
            ) : (
              <div className="space-y-4">
                {supportTickets.map((ticket, idx) => (
                  <div
                    key={ticket.id || idx}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          #{ticket.id}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{ticket.name}</span>
                        <span className="text-xs text-slate-500 font-mono">({ticket.email})</span>
                        {ticket.company && ticket.company !== 'Not Specified' && (
                          <span className="text-[11px] text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full">
                            {ticket.company}
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                          {ticket.inquiryType || 'General'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{ticket.timestamp ? new Date(ticket.timestamp).toLocaleString() : 'Recent'}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-800 mb-1">
                        {ticket.subject || '(No Subject)'}
                      </div>
                      <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                        {ticket.message}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Status: <strong className="text-emerald-700">{ticket.status || 'Received'}</strong></span>
                      <a
                        href={`mailto:${ticket.email}?subject=Re: [FreshCommits] ${encodeURIComponent(ticket.subject || 'Inquiry Ref: #' + ticket.id)}`}
                        className="text-emerald-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Reply to Candidate
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
