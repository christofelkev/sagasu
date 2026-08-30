import type { Application, ApplicationStatus, PreparedApplicationMaterials } from '@sagasu/api-contract';
import { applicationStore } from '../stores/applicationStore';
import { get } from 'svelte/store';

export const applicationsApi = {
  async list(): Promise<Application[]> {
    return get(applicationStore);
  },

  async updateStatus(id: string, status: ApplicationStatus, note?: string): Promise<void> {
    applicationStore.updateStatus(id, status, note);
  },

  async updateMaterials(id: string, materials: Partial<PreparedApplicationMaterials>): Promise<void> {
    applicationStore.updateMaterials(id, materials);
  },

  async remove(id: string): Promise<void> {
    applicationStore.deleteApplication(id);
  }
};
