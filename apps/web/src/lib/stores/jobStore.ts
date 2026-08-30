import { writable, derived, get } from 'svelte/store';
import type { Job, JobSearchQuery } from '@sagasu/api-contract';
import { initialJobs } from '../mock/initialData';
import { profileStore } from './profileStore';
import { calculateMatch } from '../matching/matchingEngine';
import { toasts } from './toastStore';

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
    },
    rejectJob: (id: string) => {
      jobs.update((curr) => {
        const next = curr.map((j) => (j.id === id ? { ...j, status: 'rejected' as const } : j));
        saveToStorage(next);
        toasts.info('Job Dismissed', 'Listing hidden from primary discovery feed.');
        return next;
      });
    },
    markReviewed: (id: string) => {
      jobs.update((curr) => {
        const next = curr.map((j) => (j.id === id ? { ...j, status: 'reviewed' as const } : j));
        saveToStorage(next);
        return next;
      });
    },
    updateJobStatus: (id: string, status: Job['status']) => {
      jobs.update((curr) => {
        const next = curr.map((j) => (j.id === id ? { ...j, status } : j));
        saveToStorage(next);
        return next;
      });
    },
    syncSources: async () => {
      isSyncing.set(true);
      toasts.info('Job Collector Running', 'Querying active adapters (LinkedIn, Glints, TechInAsia, RemoteOK)...', 2500);

      // Simulate network & normalization pipeline delay
      await new Promise((resolve) => setTimeout(resolve, 1800));

      const newDiscoveredJob: Job = {
        id: `job-sync-${Date.now()}`,
        title: 'Senior Frontend / UI Engineer (SvelteKit)',
        company: 'Linear Labs Partner',
        companyLogo: '⚡',
        location: 'Remote (Worldwide)',
        remote: true,
        employmentType: 'Full-time',
        description: 'Building world-class high-density interfaces for developer issue tracking. Fast, accessible, keyboard-first web applications.',
        requirements: [
          '4+ years building responsive web interfaces with TypeScript & Svelte/React',
          'Obsession with UI micro-interactions, CSS, and 60fps animations',
          'Experience building offline-first or optimistic state architectures'
        ],
        responsibilities: [
          'Deliver keyboard shortcuts and instantaneous optimistic UI interactions',
          'Collaborate directly with designers on custom canvas and DOM rendering components'
        ],
        skills: ['TypeScript', 'Svelte / SvelteKit', 'Tailwind & Vanilla CSS', 'REST & GraphQL APIs'],
        salary: { min: 38000000, max: 52000000, currency: 'IDR', period: 'month' },
        postedAt: new Date().toISOString(),
        collectedAt: new Date().toISOString(),
        sourceUrl: 'https://linear.app/careers',
        sourcePlatform: 'Company Careers',
        deduplicationSources: [
          { platform: 'Company Careers', sourceUrl: 'https://linear.app/careers', externalId: 'lin-99', fetchedAt: new Date().toISOString() },
          { platform: 'LinkedIn', sourceUrl: 'https://linkedin.com/jobs/view/9922', externalId: 'li-9922', fetchedAt: new Date().toISOString() }
        ],
        matchScore: 96,
        matchResult: calculateMatch(
          {
            title: 'Senior Frontend / UI Engineer (SvelteKit)',
            skills: ['TypeScript', 'Svelte / SvelteKit', 'Tailwind & Vanilla CSS'],
            remote: true
          },
          get(profileStore)
        ),
        status: 'new'
      };

      jobs.update((curr) => {
        const next = [newDiscoveredJob, ...curr];
        saveToStorage(next);
        return next;
      });

      isSyncing.set(false);
      toasts.success('Sync Complete', '1 new high-match opportunity discovered (96% Match)!');
    },
    resetToDefault: () => {
      saveToStorage(initialJobs);
      toasts.info('Jobs Reset', 'Restored default demo job listings.');
    }
  };
}

export const jobStore = createJobStore();
