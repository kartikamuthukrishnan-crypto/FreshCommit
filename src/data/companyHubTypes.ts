export interface CompanySalaryTier {
  role: string;
  level: string;
  baseSalaryRange: string;
  medianBase: string;
  equityPerYear: string;
  signOnBonus: string;
  totalCompYear1: string;
  locationTiers: {
    tier1: string; // SF Bay Area, NYC, Seattle
    tier2: string; // Austin, Boston, Los Angeles, DC
    tier3: string; // Remote / Tier 3 US Metros
  };
}

export interface InterviewStage {
  title: string;
  duration: string;
  format: string;
  focus: string;
  keyTopics: string[];
  screeningTips: string;
}

export type CompanyCategory =
  | 'FAANG & Big Tech'
  | 'Enterprise & Consulting'
  | 'Unicorns & FinTech'
  | 'Remote & Scale-Ups';

export interface CompanyHub {
  slug: string;
  name: string;
  category: CompanyCategory;
  tagline: string;
  officialCareersUrl: string;
  headquarters: string;
  usTechHubs: string[];
  primaryRequisitions: string[];
  searchKeywords: string[];
  monthlySearchVolume: string;
  organicKD: string;
  brandColor: string;
  accentBg: string;
  salaryTier: CompanySalaryTier;
  interviewStages: InterviewStage[];
  behavioralValues: {
    frameworkName: string;
    description: string;
    sampleQuestions: string[];
    prepAdvice: string;
  };
  zeroExperienceStrategy: {
    portfolioCriteria: string[];
    screeningPitfalls: string[];
    idealTimeline: string;
  };
  faqs: {
    question: string;
    answer: string;
  }[];
}
