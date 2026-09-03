import { writable, derived, get } from 'svelte/store';
import type { Job, JobSearchQuery } from '@sagasu/api-contract';
import { initialJobs } from '../mock/initialData';
import { profileStore } from './profileStore';
import { calculateMatch } from '../matching/matchingEngine';
import { toasts } from './toastStore';
import { api } from '../api/client';

const STORAGE_KEY = 'sagasu_jobs_v1';

function getStoredJobs(): Job[] {
  if (typeof window === 'undefined') return initialJobs;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse stored jobs', e);
  }
  return initialJobs;
}

export interface JobFilterState {
  searchQuery: string;
  minMatchScore: number;
  remoteOnly: boolean;
  minSalaryIDR: number;
  sourcePlatforms: string[];
  statusFilter: 'all' | 'new' | 'saved' | 'reviewed' | 'rejected' | 'applied';
  sortBy: 'match' | 'recent' | 'salary';
}

function createJobStore() {
  const jobs = writable<Job[]>(getStoredJobs());
  const isSyncing = writable<boolean>(false);
  const selectedJobId = writable<string | null>(null);
  const isApiConnected = writable<boolean>(false);

  const filters = writable<JobFilterState>({
    searchQuery: '',
    minMatchScore: 60,
    remoteOnly: false,
    minSalaryIDR: 0,
    sourcePlatforms: [],
    statusFilter: 'all',
    sortBy: 'match'
  });

  // Keep jobs synchronized with profile skills & preferences
  profileStore.subscribe((profile) => {
    jobs.update((curr) => {
      const recalculated = curr.map((job) => {
        const matchResult = calculateMatch(job, profile);
        return {
          ...job,
          matchScore: matchResult.score,
          matchResult
        };
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recalculated));
      }
      return recalculated;
    });
  });

  function saveToStorage(items: Job[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
    jobs.set(items);
  }

  // Hydrate from backend API if available
  if (typeof window !== 'undefined') {
    api
      .getJobs({ limit: 100 })
      .then((res) => {
        if (res.items && res.items.length > 0) {
          saveToStorage(res.items);
          isApiConnected.set(true);
        }
      })
      .catch((err) => {
        console.info('Backend API offline or unreachable, using cached store:', err.message);
      });
  }

  // Derived filtered jobs
  const filteredJobs = derived([jobs, filters], ([$jobs, $filters]) => {
    return $jobs
      .filter((job) => {
        // Status filter
        if ($filters.statusFilter === 'all') {
          if (job.status === 'rejected') return false; // Hide rejected by default on 'all'
        } else if (job.status !== $filters.statusFilter) {
          return false;
        }

        // Match Score filter
        if (job.matchScore < $filters.minMatchScore) return false;

        // Remote only
        if ($filters.remoteOnly && !job.remote && !job.location.toLowerCase().includes('remote')) {
          return false;
        }

        // Min Salary filter
        if ($filters.minSalaryIDR > 0) {
          const maxSalary = job.salary?.max || job.salary?.min || 0;
          if (maxSalary < $filters.minSalaryIDR) return false;
        }

        // Source platform filter
        if ($filters.sourcePlatforms.length > 0) {
          if (!$filters.sourcePlatforms.includes(job.sourcePlatform)) return false;
        }

        // Search query
        if ($filters.searchQuery.trim()) {
          const q = $filters.searchQuery.toLowerCase();
          const matchTitle = job.title.toLowerCase().includes(q);
          const matchCompany = job.company.toLowerCase().includes(q);
          const matchSkills = job.skills.some((s) => s.toLowerCase().includes(q));
          const matchDesc = job.description.toLowerCase().includes(q);
          if (!matchTitle && !matchCompany && !matchSkills && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if ($filters.sortBy === 'match') {
          return b.matchScore - a.matchScore;
        }
        if ($filters.sortBy === 'recent') {
          return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
        }
        if ($filters.sortBy === 'salary') {
          const salA = a.salary?.max || a.salary?.min || 0;
          const salB = b.salary?.max || b.salary?.min || 0;
          return salB - salA;
        }
        return 0;
      });
  });

  return {
    subscribe: jobs.subscribe,
    filtered: filteredJobs,
    filters,
    isSyncing,
    selectedJobId,
    isApiConnected,

    setFilter: (patch: Partial<JobFilterState>) => {
      filters.update((f) => ({ ...f, ...patch }));
    },
    resetFilters: () => {
      filters.set({
        searchQuery: '',
        minMatchScore: 0,
        remoteOnly: false,
        minSalaryIDR: 0,
        sourcePlatforms: [],
        statusFilter: 'all',
        sortBy: 'match'
      });
    },
    selectJob: (id: string | null) => {
      selectedJobId.set(id);
    },
    saveJob: (id: string) => {
      jobs.update((curr) => {
        const next = curr.map((j) => (j.id === id ? { ...j, status: 'saved' as const } : j));
        saveToStorage(next);
        toasts.success('Job Saved', 'Added to your bookmarked opportunities.');
        return next;
      });
      api.saveJob(id).catch((err) => console.warn('Backend saveJob sync failed:', err.message));
    },
    rejectJob: (id: string) => {
      jobs.update((curr) => {
        const next = curr.map((j) => (j.id === id ? { ...j, status: 'rejected' as const } : j));
        saveToStorage(next);
        toasts.info('Job Dismissed', 'Listing hidden from primary discovery feed.');
        return next;
      });
      api.rejectJob(id).catch((err) => console.warn('Backend rejectJob sync failed:', err.message));
    },
    markReviewed: (id: string) => {
      jobs.update((curr) => {
        const next = curr.map((j) => (j.id === id ? { ...j, status: 'reviewed' as const } : j));
        saveToStorage(next);
        return next;
      });
      api.reviewJob(id).catch((err) => console.warn('Backend reviewJob sync failed:', err.message));
    },
    updateJobStatus: (id: string, status: Job['status']) => {
      jobs.update((curr) => {
        const next = curr.map((j) => (j.id === id ? { ...j, status } : j));
        saveToStorage(next);
        return next;
      });
      if (status === 'saved') api.saveJob(id).catch(() => {});
      else if (status === 'rejected') api.rejectJob(id).catch(() => {});
      else if (status === 'reviewed') api.reviewJob(id).catch(() => {});
    },
    syncSources: async () => {
      isSyncing.set(true);
      toasts.info('Job Collector Running', 'Querying active adapters (LinkedIn, Glints, TechInAsia, RemoteOK)...', 2500);

      try {
        const res = await api.getJobs({ limit: 100 });
        if (res.items && res.items.length > 0) {
          saveToStorage(res.items);
          isApiConnected.set(true);
          isSyncing.set(false);
          toasts.success('Sync Complete', `Synchronized ${res.items.length} opportunities from PostgreSQL.`);
          return;
        }
      } catch (e) {
        console.warn('API sync fallback to local simulation');
      }

      // Fallback simulation
      await new Promise((resolve) => setTimeout(resolve, 1400));
      isSyncing.set(false);
      toasts.success('Sync Complete', 'Opportunities up to date.');
    },
    resetToDefault: () => {
      saveToStorage(initialJobs);
      toasts.info('Jobs Reset', 'Restored default demo job listings.');
    }
  };
}

export const jobStore = createJobStore();
