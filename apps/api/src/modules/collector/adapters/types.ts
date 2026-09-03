export interface RawJob {
  externalId: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  remote: boolean;
  employmentType?: string;
  description: string;
  url: string;
  platform: string;
  tags?: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: 'year' | 'month' | 'hour';
  postedAt?: string;
}

export interface JobSourceAdapter {
  name: string;
  search(query?: { keywords?: string[]; remoteOnly?: boolean; limit?: number }): Promise<RawJob[]>;
}