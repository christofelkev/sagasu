import type { UserProfile } from '@sagasu/api-contract';
import { profileStore } from '../stores/profileStore';
import { get } from 'svelte/store';

export const profileApi = {
  async get(): Promise<UserProfile> {
    return get(profileStore);
  },

  async updatePersonal(personal: Partial<UserProfile['personal']>): Promise<void> {
    profileStore.updatePersonal(personal);
  },

  async updateCareer(career: Partial<UserProfile['career']>): Promise<void> {
    profileStore.updateCareer(career);
  },

  async uploadCV(file: File): Promise<{ extractedSummary: string; skills: string[] }> {
    // Simulated AI Document Parser
    await new Promise((resolve) => setTimeout(resolve, 1400));
    return {
      extractedSummary: `Extracted candidate profile: Software engineering experience with strong modern TypeScript, Svelte, Node.js, and cloud deployments.`,
      skills: ['TypeScript', 'Svelte', 'PostgreSQL', 'Redis', 'Docker', 'GraphQL']
    };
  }
};
