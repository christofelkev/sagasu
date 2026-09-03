import type {
  Job,
  UserProfile,
  Application,
  JobPreferences,
  ProfileSkill
} from '@sagasu/api-contract';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status} ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson?.error?.message) {
          errorMsg = errorJson.error.message;
        }
      } catch {}
      throw new Error(errorMsg);
    }

    return (await res.json()) as T;
  }

  // Health
  async health(): Promise<{ status: string; database: string }> {
    return this.request<{ status: string; database: string }>('/health');
  }

  // Jobs
  async getJobs(params?: {
    q?: string;
    status?: string;
    minScore?: number;
    remote?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ items: Job[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.status) query.set('status', params.status);
    if (params?.minScore !== undefined) query.set('minScore', params.minScore.toString());
    if (params?.remote !== undefined) query.set('remote', params.remote.toString());
    if (params?.limit !== undefined) query.set('limit', params.limit.toString());
    if (params?.offset !== undefined) query.set('offset', params.offset.toString());

    const qs = query.toString();
    return this.request<{ items: Job[]; total: number }>(`/jobs${qs ? `?${qs}` : ''}`);
  }

  async getJob(id: string): Promise<Job> {
    return this.request<Job>(`/jobs/${id}`);
  }

  async saveJob(id: string): Promise<Job> {
    return this.request<Job>(`/jobs/${id}/save`, { method: 'POST' });
  }

  async rejectJob(id: string): Promise<Job> {
    return this.request<Job>(`/jobs/${id}/reject`, { method: 'POST' });
  }

  async reviewJob(id: string): Promise<Job> {
    return this.request<Job>(`/jobs/${id}/review`, { method: 'POST' });
  }

  // Profile
  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/profile');
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    });
  }

  async addSkill(skill: Omit<ProfileSkill, 'id'> & { id?: string }): Promise<UserProfile> {
    return this.request<UserProfile>('/profile/skills', {
      method: 'POST',
      body: JSON.stringify(skill)
    });
  }

  async removeSkill(id: string): Promise<UserProfile> {
    return this.request<UserProfile>(`/profile/skills/${id}`, {
      method: 'DELETE'
    });
  }

  async uploadCV(payload: { fileName?: string; parsedSummary?: string }): Promise<{ message: string; resume: any }> {
    return this.request<{ message: string; resume: any }>('/profile/cv', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Applications
  async getApplications(): Promise<Application[]> {
    return this.request<Application[]>('/applications');
  }

  async createApplication(jobId: string, status?: string): Promise<Application> {
    return this.request<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId, status })
    });
  }

  async updateApplication(id: string, patch: Partial<Application>): Promise<Application> {
    return this.request<Application>(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch)
    });
  }

  // Preferences
  async getPreferences(): Promise<JobPreferences> {
    return this.request<JobPreferences>('/preferences');
  }

  async updatePreferences(preferences: JobPreferences): Promise<JobPreferences> {
    return this.request<JobPreferences>('/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences)
    });
  }
}

export const api = new ApiClient();