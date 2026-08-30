export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';

export interface SalaryRange {
  min?: number;
  max?: number;
  currency: string;
  period: 'month' | 'year' | 'hour';
}

export interface DedupSource {
  platform: string;
  sourceUrl: string;
  externalId: string;
  fetchedAt: string;
}

export interface MatchFactorBreakdown {
  score: number;
  explanation: string;
}

export interface MatchResult {
  score: number; // 0 - 100
  factors: {
    skills: {
      score: number;
      matched: string[];
      partial: string[];
      missing: string[];
    };
    experience: MatchFactorBreakdown & {
      userYears: number;
      requiredYears: number;
    };
    salary: MatchFactorBreakdown & {
      userMin: number;
      jobMax?: number;
    };
    location: MatchFactorBreakdown & {
      isRemote: boolean;
      matchesPreference: boolean;
    };
    seniority: MatchFactorBreakdown & {
      level: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Staff / Principal';
    };
    other: MatchFactorBreakdown;
  };
  aiAnalysis?: {
    fitSummary: string;
    keyStrengths: string[];
    potentialGaps: string[];
    recommendedApplicationAngle: string;
    interviewTip: string;
  };
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  remote: boolean;
  employmentType: EmploymentType;
  description: string;
  requirements: string[];
  responsibilities: string[];
  niceToHave?: string[];
  skills: string[];
  salary?: SalaryRange;
  postedAt: string;
  collectedAt: string;
  sourceUrl: string;
  sourcePlatform: 'LinkedIn' | 'TechInAsia' | 'Glints' | 'Company Careers' | 'RemoteOK' | 'Deel' | 'Jobstreet';
  deduplicationSources?: DedupSource[];
  matchScore: number;
  matchResult: MatchResult;
  status: 'new' | 'saved' | 'rejected' | 'reviewed' | 'applied';
}

export interface JobSearchQuery {
  keywords?: string;
  role?: string;
  location?: string;
  remoteOnly?: boolean;
  minSalary?: number;
  minMatchScore?: number;
  sources?: string[];
  status?: string;
  sortBy?: 'match_score' | 'posted_at' | 'salary';
  sortOrder?: 'asc' | 'desc';
}

export interface RawJob {
  sourcePlatform: string;
  externalId: string;
  sourceUrl: string;
  rawPayload: Record<string, unknown>;
}
