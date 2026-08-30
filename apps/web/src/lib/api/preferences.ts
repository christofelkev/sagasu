import type { JobPreferences } from '@sagasu/api-contract';
import { preferenceStore } from '../stores/preferenceStore';
import { get } from 'svelte/store';

export const preferencesApi = {
  async get(): Promise<JobPreferences> {
    return get(preferenceStore);
  },

  async update(patch: Partial<JobPreferences>): Promise<void> {
    preferenceStore.update(patch);
  },

  async toggleSource(sourceId: string): Promise<void> {
    preferenceStore.toggleSource(sourceId);
  }
};
