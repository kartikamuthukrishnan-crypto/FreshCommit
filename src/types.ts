export type ExperienceLevel = 'Entry Level' | 'New Grad' | 'Fresher' | 'Internship';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
export type JobCategory = 'Frontend' | 'Backend' | 'Full Stack' | 'Mobile' | 'DevOps / Cloud' | 'Data / AI' | 'QA / Test';
export type JobSource = 'MANUAL_ADMIN' | 'AUTOMATED_SYNC' | 'EMPLOYER_POST' | 'SMARTRECRUITERS';

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  unit: 'YEAR' | 'MONTH' | 'HOUR';
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyWebsite?: string;
  location: string;
  isRemote: boolean;
  applicantLocationRequirements?: string; // e.g. "US" or "Worldwide"
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  experienceLevel: ExperienceLevel;
  maxYearsExperience: number; // 0, 1, 2
  category: JobCategory;
  employmentType: EmploymentType;
  salary: SalaryRange;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  applyUrl: string;
  datePosted: string; // ISO format: YYYY-MM-DD
  validThrough: string; // ISO format: YYYY-MM-DD
  source: JobSource;
  atsProvider?: string; // e.g. "SmartRecruiters", "Greenhouse", "Lever", "Ashby"
  smartRecruitersId?: string;
  sourceUrl?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DRAFT';
  fingerprint: string; // company-title-location for strict deduplication
  viewsCount: number;
  featured?: boolean;
}

export interface AdSenseConfig {
  publisherId: string; // e.g. "ca-pub-1234567890123456"
  enabled: boolean;
  testMode: boolean; // Show clean mockup ads vs real script injection
  headerAd: boolean;
  inFeedAd: boolean;
  detailSidebarAd: boolean;
  footerAd: boolean;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  sourceName: string;
  rawJobsCount: number;
  passedRelevancyCount: number;
  duplicatesSkippedCount: number;
  savedCount: number;
  details: string;
}

export interface SchemaValidationResult {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
  jsonLd: Record<string, any>;
}

export type AppTab =
  | 'jobs'
  | 'salary-guide'
  | 'insights'
  | 'tools'
  | 'adsense-policy'
  | 'about'
  | 'contact'
  | 'admin'
  | 'terms'
  | 'privacy'
  | 'disclaimer'
  | 'cookie-policy';

