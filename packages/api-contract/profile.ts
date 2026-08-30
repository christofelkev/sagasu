export type SkillCategory = 'languages' | 'frameworks' | 'databases' | 'cloud' | 'tools' | 'soft';
export type SkillLevel = 'expert' | 'proficient' | 'familiar';

export interface ProfileSkill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  yearsOfExperience: number;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
  technologies: string[];
  achievements: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
  gpa?: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  bio: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  avatarUrl?: string;
}

export interface CareerGoals {
  desiredRoles: string[];
  yearsOfExperience: number;
  employmentTypes: string[];
  preferredIndustries: string[];
  preferredLocations: string[];
  remotePreference: 'remote_only' | 'hybrid' | 'onsite' | 'any';
  minimumSalary: {
    amount: number;
    currency: string;
    period: 'month' | 'year';
  };
}

export interface CVResumeFile {
  id: string;
  fileName: string;
  uploadedAt: string;
  fileSize: number;
  isCanonical: boolean;
  parsedSummary?: string;
}

export interface UserProfile {
  id: string;
  personal: PersonalInfo;
  career: CareerGoals;
  skills: ProfileSkill[];
  experiences: ExperienceItem[];
  educations: EducationItem[];
  resumes: CVResumeFile[];
  updatedAt: string;
}
