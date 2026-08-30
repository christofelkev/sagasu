import type { Job, JobSearchQuery } from '@sagasu/api-contract';
import { jobStore } from '../stores/jobStore';
import { get } from 'svelte/store';

export const jobsApi = {
  async list(query?: JobSearchQuery): Promise<Job[]> {
    return get(jobStore);
  },

  async getById(id: string): Promise<Job | undefined> {
    return get(jobStore).find((j) => j.id === id);
  },

  async save(id: string): Promise<void> {
    jobStore.saveJob(id);
  },

  async reject(id: string): Promise<void> {
    jobStore.rejectJob(id);
  },

  async markReviewed(id: string): Promise<void> {
    jobStore.markReviewed(id);
  },

  async sync(): Promise<void> {
    await jobStore.syncSources();
  }
};
