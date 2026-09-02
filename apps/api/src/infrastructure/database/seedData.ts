import type { Job, UserProfile, Application, JobPreferences } from '@sagasu/api-contract';
import { calculateMatch } from '../../modules/matching/matchingEngine';

export const seedProfile: UserProfile = {
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
    preferredLocations: ['Jakarta', 'Remote', 'Singapore / Remote'],
    remotePreference: 'remote_only',
    minimumSalary: {
      amount: 20000000,
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
      location: 'Jakarta (Remote)',
      startDate: '2023-01',
      endDate: 'Present',
      current: true,
      responsibilities: [
        'Architected real-time telemetry dashboard using SvelteKit and Bun, reducing page load latency by 45%.',
        'Implemented distributed job queue with Redis and PostgreSQL handling 2M+ background events daily.',
        'Mentored junior engineers and led migration from legacy monolith to typed API contracts.'
      ],
      technologies: ['TypeScript', 'SvelteKit', 'Bun', 'PostgreSQL', 'Redis', 'Docker'],
      achievements: [
        'Reduced cloud infrastructure cost by 28% through optimized caching',
        'Achieved 99.95% API uptime across 4 microservices'
      ]
    },
    {
      id: 'exp-2',
      company: 'Fintech Nusantara Tech',
      role: 'Frontend & API Engineer',
      location: 'Jakarta',
      startDate: '2021-02',
      endDate: '2022-12',
      current: false,
      responsibilities: [
        'Built merchant onboarding workflows and KYC document verification portals.',
        'Engineered responsive design system components and client-side caching state.'
      ],
      technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
      achievements: [
        'Onboarded 50k+ merchants with zero drop-off due to UI bugs',
        'Built reusable UI library adopted by 3 internal engineering squads'
      ]
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
  updatedAt: '2026-08-29T14:30:00Z'
};

const rawJobs: Omit<Job, 'matchScore' | 'matchResult'>[] = [
  {
    id: 'job-001',
    title: 'Senior Fullstack Engineer (Svelte & TypeScript)',
    company: 'Vercel Ecosystem Partner',
    companyLogo: '⚡',
    location: 'Remote (APAC / Indonesia)',
    remote: true,
    employmentType: 'Full-time',
    description: 'We are seeking an experienced Senior Fullstack Engineer to lead development of high-performance developer analytics and automation tooling. You will collaborate directly with founders and build modern reactive interfaces paired with blazingly fast backend APIs.',
    requirements: [
      '5+ years professional experience building web applications with modern TypeScript',
      'Strong proficiency with Svelte / SvelteKit or modern component-driven architectures',
      'Deep understanding of REST/GraphQL API design and PostgreSQL database optimization',
      'Experience with Redis, asynchronous task processing, and background queues',
      'Proven track record delivering reliable, clean, tested production code'
    ],
    responsibilities: [
      'Design, build, and deploy new feature pipelines from database to UI',
      'Optimize web performance, Core Web Vitals, and server response times',
      'Participate in architecture reviews and mentor peer engineers'
    ],
    niceToHave: ['Experience with Bun or Elysia', 'Knowledge of LLM orchestration and prompt engineering'],
    skills: ['TypeScript', 'Svelte / SvelteKit', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'],
    salary: { min: 28000000, max: 38000000, currency: 'IDR', period: 'month' },
    postedAt: '2026-08-29T12:00:00Z',
    collectedAt: '2026-08-30T09:15:00Z',
    sourceUrl: 'https://linkedin.com/jobs/view/9928314',
    sourcePlatform: 'LinkedIn',
    deduplicationSources: [
      { platform: 'LinkedIn', sourceUrl: 'https://linkedin.com/jobs/view/9928314', externalId: 'li-9928314', fetchedAt: '2026-08-30T09:15:00Z' },
      { platform: 'Company Careers', sourceUrl: 'https://jobs.vercelpartner.io/sr-fullstack', externalId: 'car-4102', fetchedAt: '2026-08-30T09:16:00Z' }
    ],
    status: 'new'
  },
  {
    id: 'job-002',
    title: 'Senior Backend / Platform Engineer',
    company: 'Midtrans (GoTo Financial)',
    companyLogo: '💳',
    location: 'Jakarta, Indonesia (Hybrid / Flexible)',
    remote: false,
    employmentType: 'Full-time',
    description: 'Midtrans is scaling its high-throughput payment routing infrastructure. We are looking for a Senior Platform Engineer to build scalable microservices, manage transactional consistency, and optimize distributed caching for millions of daily financial transactions.',
    requirements: [
      '4+ years building distributed backend services in TypeScript, Go, or Java',
      'Strong knowledge of PostgreSQL, query tuning, isolation levels, and Redis caching',
      'Experience designing idempotent RESTful APIs and webhook delivery engines',
      'Comfortable with Docker, Kubernetes, and automated CI/CD pipelines'
    ],
    responsibilities: [
      'Scale core payment gateway integration endpoints to handle peak flash-sale loads',
      'Ensure sub-100ms API response latency across core transaction routes',
      'Implement real-time anomaly detection and operational monitoring alerts'
    ],
    skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'REST & GraphQL APIs'],
    salary: { min: 26000000, max: 35000000, currency: 'IDR', period: 'month' },
    postedAt: '2026-08-28T16:00:00Z',
    collectedAt: '2026-08-30T08:00:00Z',
    sourceUrl: 'https://techinasia.com/jobs/midtrans-senior-backend',
    sourcePlatform: 'TechInAsia',
    status: 'saved'
  },
  {
    id: 'job-003',
    title: 'Lead Frontend Architect (Design Systems & Web)',
    company: 'Traveloka',
    companyLogo: '✈️',
    location: 'Jakarta / Remote Indonesia',
    remote: true,
    employmentType: 'Full-time',
    description: 'Lead the frontend engineering evolution across Traveloka web surfaces. Define modular component architectures, micro-frontends, and responsive design systems that serve 40M+ active users across Southeast Asia.',
    requirements: [
      '6+ years of frontend development experience with deep JavaScript / TypeScript foundations',
      'Expertise in CSS architecture, design systems, performance optimization, and accessibility',
      'Experience leading technical direction for a team of 5+ engineers',
      'Familiarity with modern SSR frameworks and frontend state management'
    ],
    responsibilities: [
      'Standardize component libraries and enforce web performance budgets',
      'Collaborate with Product Design to build accessible, fluid interaction primitives',
      'Drive engineering excellence, automated E2E testing, and code quality standards'
    ],
    skills: ['TypeScript', 'JavaScript', 'Tailwind & Vanilla CSS', 'React / Next.js', 'Svelte / SvelteKit', 'System Design'],
    salary: { min: 35000000, max: 48000000, currency: 'IDR', period: 'month' },
    postedAt: '2026-08-27T08:00:00Z',
    collectedAt: '2026-08-29T10:00:00Z',
    sourceUrl: 'https://glints.com/id/opportunities/jobs/traveloka-lead-frontend',
    sourcePlatform: 'Glints',
    deduplicationSources: [
      { platform: 'Glints', sourceUrl: 'https://glints.com/id/opportunities/jobs/traveloka-lead-frontend', externalId: 'gl-8812', fetchedAt: '2026-08-29T10:00:00Z' },
      { platform: 'LinkedIn', sourceUrl: 'https://linkedin.com/jobs/view/7721832', externalId: 'li-7721832', fetchedAt: '2026-08-29T11:00:00Z' }
    ],
    status: 'new'
  },
  {
    id: 'job-004',
    title: 'AI Product Fullstack Engineer',
    company: 'Supabase Ecosystem Ventures',
    companyLogo: '⚡',
    location: 'Worldwide Remote',
    remote: true,
    employmentType: 'Full-time',
    description: 'Join an agile product engineering squad creating AI-assisted database exploration and automated migration tools. We work on the bleeding edge of developer tools, Svelte, Bun, PostgreSQL, and vector embeddings.',
    requirements: [
      '3+ years fullstack web development experience',
      'Strong command of TypeScript, PostgreSQL, and modern frontend frameworks (Svelte or React)',
      'Experience integrating LLM APIs (OpenAI, Anthropic, Gemini) with streaming UI responses',
      'Comfortable with rapid prototyping and developer-centric UX'
    ],
    responsibilities: [
      'Build intuitive web applications for AI-guided schema generation and query insights',
      'Create reactive streaming interfaces with Svelte and server-sent events',
      'Ship features end-to-end with high autonomy'
    ],
    skills: ['TypeScript', 'Svelte / SvelteKit', 'PostgreSQL', 'Bun / Elysia', 'REST & GraphQL APIs', 'Docker'],
    salary: { min: 32000000, max: 45000000, currency: 'IDR', period: 'month' },
    postedAt: '2026-08-29T20:00:00Z',
    collectedAt: '2026-08-30T10:00:00Z',
    sourceUrl: 'https://remoteok.com/remote-jobs/supabase-ai-fullstack',
    sourcePlatform: 'RemoteOK',
    status: 'new'
  }
];

export const seedJobs: Job[] = rawJobs.map((job) => {
  const matchResult = calculateMatch(job, seedProfile);
  return {
    ...job,
    matchScore: matchResult.score,
    matchResult
  };
});

export const seedApplications: Application[] = [
  {
    id: 'app-001',
    jobId: 'job-002',
    job: seedJobs.find((j) => j.id === 'job-002') || seedJobs[0],
    status: 'SAVED',
    statusHistory: [
      { id: 'h-1', status: 'SAVED', timestamp: '2026-08-29T10:00:00Z', note: 'Saved opportunity for weekend review' }
    ],
    preparedMaterials: {
      tailoredResume: {
        headline: 'Senior Platform Engineer | High-Throughput TypeScript & PostgreSQL Architecture',
        summary: 'Platform engineer with 5+ years specializing in distributed transaction engines, payment gateways, and PostgreSQL database performance tuning. Proven background scaling APIs to 2M+ daily requests with 99.95% uptime.',
        targetedBulletPoints: [
          'Engineered distributed job queue with PostgreSQL & Redis handling 2M+ events daily with sub-80ms transaction latency.',
          'Optimized PostgreSQL connection pooling and indexing, lowering query execution times by 38% under high concurrency.',
          'Architected idempotent webhook delivery mechanism with automatic exponential retry and dead-letter queues.'
        ]
      },
      coverLetter: `Dear Hiring Team at Midtrans,\n\nI am writing to express my strong interest in the Senior Backend / Platform Engineer position. Having built and optimized distributed transaction systems and PostgreSQL-backed data pipelines in the Indonesian fintech ecosystem, I have long admired Midtrans\'s engineering rigor in handling millions of daily payments.\n\nIn my current role at Nusantara Cloud Labs, I architected a distributed queue processing over 2M events daily with 99.95% uptime. My deep expertise in TypeScript microservices, PostgreSQL transaction tuning, and Redis caching aligns directly with your mission to deliver sub-100ms payment routing.\n\nI welcome the opportunity to discuss how my background can support Midtrans in scaling its payment infrastructure.\n\nSincerely,\nRaden Manopo`,
      recruiterMessage: `Hi Midtrans Talent Acquisition team, I saw the opening for Senior Backend / Platform Engineer. With 5+ years scaling high-throughput TypeScript/PostgreSQL payment systems in Jakarta, I would love to connect and share how my background aligns with your engineering roadmap.`,
      applicationQuestionsAnswers: [
        {
          question: 'How do you handle transactional idempotency in distributed payment APIs?',
          answer: 'I implement idempotency keys stored in Redis/PostgreSQL with unique constraint validation and conditional locks. Incoming requests verify key presence; in-flight requests wait on the lock while completed requests return cached responses immediately.',
          rationale: 'Demonstrates real-world distributed systems knowledge.'
        },
        {
          question: 'What is your approach to tuning slow PostgreSQL queries?',
          answer: 'I analyze EXPLAIN (ANALYZE, BUFFERS) plans, evaluate sequential scan vs index scan costs, check table bloat, optimize join order, and add composite or partial indexes where appropriate.',
          rationale: 'Validates hands-on database debugging proficiency.'
        }
      ],
      approvedByUser: true,
      userNotes: 'Verified cover letter and answers against actual production experience.'
    },
    createdAt: '2026-08-29T10:00:00Z',
    updatedAt: '2026-08-29T10:00:00Z'
  },
  {
    id: 'app-002',
    jobId: 'job-001',
    job: seedJobs.find((j) => j.id === 'job-001') || seedJobs[0],
    status: 'PREPARING',
    statusHistory: [
      { id: 'h-2', status: 'SAVED', timestamp: '2026-08-29T12:30:00Z' },
      { id: 'h-3', status: 'PREPARING', timestamp: '2026-08-30T09:00:00Z', note: 'AI Application Studio initialized' }
    ],
    preparedMaterials: {
      tailoredResume: {
        headline: 'Senior Fullstack Engineer | SvelteKit & High-Velocity TypeScript Specialist',
        summary: 'Fullstack developer with 5+ years crafting high-performance developer tools, reactive Svelte/SvelteKit user interfaces, and Bun/Elysia microservices.',
        targetedBulletPoints: [
          'Built high-performance telemetry dashboard using SvelteKit and Bun, achieving 98+ Lighthouse scores and 45% lower latency.',
          'Implemented end-to-end type safety between frontend client stores and backend Elysia endpoints using shared contract schemas.',
          'Led frontend performance initiatives, reducing bundle size by 35% through modular code splitting.'
        ]
      },
      coverLetter: `Dear Vercel Ecosystem Partner Team,\n\nI am thrilled to apply for the Senior Fullstack Engineer position. Having built reactive frontend architectures with SvelteKit and high-performance TypeScript microservices for over 5 years, I am passionate about developer tooling that feels instantaneous.\n\nAt Nusantara Cloud Labs, I led the development of a real-time analytics UI that reduced latency by 45% while maintaining flawless responsive ergonomics. I have also embraced Bun and Elysia for cutting-edge edge workloads.\n\nI would love to contribute to your analytics and automation platform.\n\nWarm regards,\nRaden Manopo`,
      recruiterMessage: `Hi team, I noticed your Senior Fullstack (Svelte & TypeScript) opening. I have 4+ years of dedicated SvelteKit experience combined with modern TypeScript backends, and I'd love to chat!`,
      applicationQuestionsAnswers: [
        {
          question: 'Why do you choose SvelteKit over other frameworks for complex dashboards?',
          answer: 'Svelte compiles to minimal imperative JavaScript with zero virtual DOM runtime overhead, delivering unmatched rendering performance, reactive stores out-of-the-box, and predictable bundle sizes for data-dense dashboards.',
          rationale: 'Highlights deep technical architectural convictions.'
        }
      ],
      approvedByUser: false,
      userNotes: 'Draft generated. Need to verify custom project highlights.'
    },
    createdAt: '2026-08-29T12:30:00Z',
    updatedAt: '2026-08-30T09:00:00Z'
  },
  {
    id: 'app-003',
    jobId: 'job-004',
    job: seedJobs.find((j) => j.id === 'job-004') || seedJobs[0],
    status: 'APPLIED',
    appliedDate: '2026-08-30',
    statusHistory: [
      { id: 'h-4', status: 'SAVED', timestamp: '2026-08-29T21:00:00Z' },
      { id: 'h-5', status: 'PREPARING', timestamp: '2026-08-30T08:00:00Z' },
      { id: 'h-6', status: 'APPLIED', timestamp: '2026-08-30T10:15:00Z', note: 'Submitted via Supabase Ventures Careers Portal' }
    ],
    createdAt: '2026-08-29T21:00:00Z',
    updatedAt: '2026-08-30T10:15:00Z'
  },
  {
    id: 'app-004',
    jobId: 'job-003',
    job: seedJobs.find((j) => j.id === 'job-003') || seedJobs[0],
    status: 'INTERVIEW',
    statusHistory: [
      { id: 'h-7', status: 'SAVED', timestamp: '2026-08-27T09:00:00Z' },
      { id: 'h-8', status: 'APPLIED', timestamp: '2026-08-27T14:00:00Z' },
      { id: 'h-9', status: 'INTERVIEW', timestamp: '2026-08-29T16:00:00Z', note: 'Invited to Technical Architecture interview' }
    ],
    interviews: [
      {
        id: 'int-1',
        round: 'Round 1: Technical Architecture & System Design',
        scheduledAt: '2026-09-04T10:00:00Z',
        notes: 'Prepare case study on micro-frontend component federation and performance budgeting.'
      }
    ],
    createdAt: '2026-08-27T09:00:00Z',
    updatedAt: '2026-08-29T16:00:00Z'
  }
];

export const seedPreferences: JobPreferences = {
  desiredRoles: [
    'Senior Fullstack Engineer',
    'Senior Frontend Engineer',
    'Svelte / TypeScript Engineer',
    'TypeScript Engineer',
    'TypeScript Developer',
    'Svelte Engineer',
    'Svelte Developer',
    'Bun Engineer',
    'Bun Developer'
  ],
  locations: ['Jakarta', 'Remote', 'Indonesia'],
  remoteOnly: true,
  minSalaryMonthlyIDR: 20000000,
  keywords: ['TypeScript', 'Svelte', 'Bun', 'Elysia', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'],
  excludedCompanies: ['CryptoGambling Inc', 'SpamMedia'],
  enabledSources: [
    { id: 'linkedin', name: 'LinkedIn Jobs', enabled: true, lastSyncedAt: '2026-08-30T16:15:00Z', itemsCount: 142 },
    { id: 'techinasia', name: 'TechInAsia Jobs', enabled: true, lastSyncedAt: '2026-08-30T15:00:00Z', itemsCount: 68 },
    { id: 'glints', name: 'Glints Southeast Asia', enabled: true, lastSyncedAt: '2026-08-30T14:45:00Z', itemsCount: 94 },
    { id: 'remoteok', name: 'RemoteOK', enabled: true, lastSyncedAt: '2026-08-30T17:00:00Z', itemsCount: 52 },
    { id: 'deel', name: 'Deel Careers', enabled: true, lastSyncedAt: '2026-08-30T18:00:00Z', itemsCount: 31 },
    { id: 'direct', name: 'Company Career Portals (Direct)', enabled: true, lastSyncedAt: '2026-08-30T16:30:00Z', itemsCount: 27 }
  ],
  autoSyncIntervalMinutes: 60,
  minMatchScoreThreshold: 70,
  alertEmailEnabled: true
};
