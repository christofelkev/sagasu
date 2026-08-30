import type { Job } from './jobs';

export type ApplicationStatus =
  | 'DISCOVERED'
  | 'SAVED'
  | 'REVIEWED'
  | 'PREPARING'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'EXPIRED';

export interface ApplicationHistoryEvent {
  id: string;
  status: ApplicationStatus;
  timestamp: string;
  note?: string;
}

export interface PreparedApplicationMaterials {
  tailoredResume: {
    headline: string;
    summary: string;
    targetedBulletPoints: string[];
  };
  coverLetter: string;
  recruiterMessage: string;
  applicationQuestionsAnswers: Array<{
    question: string;
    answer: string;
    rationale?: string;
  }>;
  approvedByUser: boolean;
  userNotes?: string;
}

export interface Application {
  id: string;
  jobId: string;
  job: Job;
  status: ApplicationStatus;
  statusHistory: ApplicationHistoryEvent[];
  preparedMaterials?: PreparedApplicationMaterials;
  targetSubmissionDate?: string;
  appliedDate?: string;
  salaryExpectation?: string;
  contactPerson?: {
    name: string;
    role: string;
    emailOrLink?: string;
  };
  interviews?: Array<{
    id: string;
    round: string;
    scheduledAt: string;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
