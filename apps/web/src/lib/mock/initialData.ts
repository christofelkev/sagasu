import type {
  UserProfile,
  Job,
  Application,
  JobPreferences
} from '@sagasu/api-contract';

export const initialProfile: UserProfile = {
  id: 'usr-sagasu-001',
  personal: {
    name: 'Raden Manopo',
    email: 'raden.manopo@example.com',
    phone: '+62 812-3456-7890',
    location: 'Jakarta, Indonesia',
    title: 'Senior Fullstack & AI Product Engineer',
    bio: 'Software engineer with 5+ years building performant web applications, TypeScript microservices, and human-in-the-loop AI workflows. Focused on Svelte, Bun, Elysia, and reactive architectures.',
    githubUrl: 'https://github.com/manopo',
    linkedinUrl: 'https://linkedin.com/in/manopo',
    portfolioUrl: 'https://manopo.dev',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  career: {
    desiredRoles: [
      'Senior Fullstack Engineer',
      'Senior Frontend Engineer',
      'Staff Software Engineer',
      'Svelte / TypeScript Engineer',
      'AI Applications Engineer'
    ],
    yearsOfExperience: 5,
    employmentTypes: ['Full-time', 'Contract'],
    preferredIndustries: ['Tech / SaaS', 'Fintech', 'Developer Tools', 'AI / LLM'],
    preferredLocations: ['Jakarta', 'Remote Indonesia', 'Bandung', 'Surabaya', 'Indonesia'],
    remotePreference: 'remote_only',
    minimumSalary: {
      amount: 15000000,
      currency: 'IDR',
      period: 'month'
    }
  },
  skills: [
    { id: 'sk-1', name: 'TypeScript', category: 'languages', level: 'expert', yearsOfExperience: 5 },
    { id: 'sk-2', name: 'JavaScript', category: 'languages', level: 'expert', yearsOfExperience: 6 },
    { id: 'sk-3', name: 'Svelte / SvelteKit', category: 'frameworks', level: 'expert', yearsOfExperience: 4 },
    { id: 'sk-4', name: 'Node.js', category: 'frameworks', level: 'expert', yearsOfExperience: 5 },
    { id: 'sk-5', name: 'Bun / Elysia', category: 'frameworks', level: 'proficient', yearsOfExperience: 2 },
    { id: 'sk-6', name: 'PostgreSQL', category: 'databases', level: 'expert', yearsOfExperience: 4 },
    { id: 'sk-7', name: 'Redis', category: 'databases', level: 'proficient', yearsOfExperience: 3 },
    { id: 'sk-8', name: 'REST & GraphQL APIs', category: 'frameworks', level: 'expert', yearsOfExperience: 5 },
    { id: 'sk-9', name: 'Docker', category: 'cloud', level: 'proficient', yearsOfExperience: 3 },
    { id: 'sk-10', name: 'Tailwind & Vanilla CSS', category: 'frameworks', level: 'expert', yearsOfExperience: 5 },
    { id: 'sk-11', name: 'React / Next.js', category: 'frameworks', level: 'proficient', yearsOfExperience: 4 },
    { id: 'sk-12', name: 'CI/CD & GitHub Actions', category: 'cloud', level: 'proficient', yearsOfExperience: 3 },
    { id: 'sk-13', name: 'Python', category: 'languages', level: 'familiar', yearsOfExperience: 2 },
    { id: 'sk-14', name: 'System Design', category: 'soft', level: 'expert', yearsOfExperience: 4 }
  ],
  experiences: [
    {
      id: 'exp-1',
      company: 'Nusantara Cloud Labs',
      role: 'Senior Fullstack Engineer',
      startDate: '2023-01',
      endDate: 'Present',
      current: true,
      location: 'Jakarta (Remote)',
      responsibilities:
        'Architected real-time telemetry dashboard using SvelteKit and Bun, reducing page load latency by 45%. Implemented distributed job queue with Redis and PostgreSQL handling 2M+ background events daily. Mentored junior engineers and led migration from legacy monolith to typed API contracts.',
      achievements: [
        'Reduced cloud infrastructure cost by 28% through optimized caching',
        'Achieved 99.95% API uptime across 4 microservices'
      ],
      technologies: ['TypeScript', 'SvelteKit', 'Bun', 'PostgreSQL', 'Redis', 'Docker']
    },
    {
      id: 'exp-2',
      company: 'Fintech Nusantara Tech',
      role: 'Frontend & API Engineer',
      startDate: '2021-02',
      endDate: '2022-12',
      current: false,
      location: 'Jakarta',
      responsibilities:
        'Built merchant onboarding workflows and KYC document verification portals. Engineered responsive design system components and client-side caching state.',
      achievements: [
        'Onboarded 50k+ merchants with zero drop-off due to UI bugs',
        'Built reusable UI library adopted by 3 internal engineering squads'
      ],
      technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'TailwindCSS']
    }
  ],
  educations: [
    {
      id: 'edu-1',
      institution: 'Universitas Indonesia',
      degree: 'Bachelor of Computer Science',
      field: 'Software Engineering & Informatics',
      startYear: 2017,
      endYear: 2021,
      gpa: '3.82 / 4.0'
    }
  ],
  resumes: [
    {
      id: 'res-1',
      fileName: 'Raden_Manopo_Senior_Fullstack_2026.pdf',
      uploadedAt: '2026-08-25T10:00:00Z',
      fileSize: 420000,
      isCanonical: true,
      parsedSummary: 'Verified 5+ yrs experience, TypeScript/Svelte/Node expertise, Bachelor in CS.'
    }
  ],
  updatedAt: new Date().toISOString()
};

// Start empty so user-driven discovery sync populates real opportunities
export const initialJobs: Job[] = [];
export const initialApplications: Application[] = [];

export const initialPreferences: JobPreferences = {
  desiredRoles: [
    'Senior Fullstack Engineer',
    'Senior Frontend Engineer',
    'Svelte / TypeScript Engineer',
    'Staff Software Engineer',
    'Backend Engineer (TypeScript / Node)'
  ],
  locations: ['Jakarta', 'Remote Indonesia', 'Bandung', 'Surabaya', 'Indonesia'],
  remoteOnly: true,
  minSalaryMonthlyIDR: 15000000,
  keywords: ['TypeScript', 'Svelte', 'Bun', 'Elysia', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'],
  excludedCompanies: ['CryptoGambling Inc', 'SpamMedia'],
  enabledSources: [
    { id: 'src-1', name: 'LinkedIn Indonesia', enabled: true, lastSyncedAt: '2026-09-03T00:00:00Z', itemsCount: 0 },
    { id: 'src-2', name: 'Glints Indonesia', enabled: true, lastSyncedAt: '2026-09-03T00:00:00Z', itemsCount: 0 },
    { id: 'src-3', name: 'JobStreet Indonesia', enabled: true, lastSyncedAt: '2026-09-03T00:00:00Z', itemsCount: 0 },
    { id: 'src-4', name: 'RemoteOK (Global/APAC)', enabled: true, lastSyncedAt: '2026-09-03T00:00:00Z', itemsCount: 0 }
  ],
  autoSyncIntervalMinutes: 60,
  minMatchScoreThreshold: 70,
  alertEmailEnabled: true
};