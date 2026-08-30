import { writable } from 'svelte/store';
import type { JobPreferences } from '@sagasu/api-contract';
import { initialPreferences } from '../mock/initialData';
import { toasts } from './toastStore';

const STORAGE_KEY = 'sagasu_job_preferences_v1';

function getStoredPreferences(): JobPreferences {
  if (typeof window === 'undefined') return initialPreferences;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load preferences', e);
  }
  return initialPreferences;
}

function createPreferenceStore() {
  const { subscribe, set, update } = writable<JobPreferences>(getStoredPreferences());

  function saveAndNotify(prefs: JobPreferences) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }
    set(prefs);
  }

  return {
    subscribe,
    update: (patch: Partial<JobPreferences>) => {
      update((curr) => {
        const next = { ...curr, ...patch };
        saveAndNotify(next);
        toasts.success('Settings Saved', 'Job discovery preferences updated.');
        return next;
      });
    },
    toggleSource: (sourceId: string) => {
      update((curr) => {
        const next = {
          ...curr,
          enabledSources: curr.enabledSources.map((s) =>
            s.id === sourceId ? { ...s, enabled: !s.enabled } : s
          )
        };
        saveAndNotify(next);
        return next;
      });
    },
    resetToDefault: () => {
      saveAndNotify(initialPreferences);
      toasts.info('Settings Reset', 'Restored default search configurations.');
    }
  };
}

export const preferenceStore = createPreferenceStore();
