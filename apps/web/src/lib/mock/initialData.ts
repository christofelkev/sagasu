import type {
  UserProfile,
  Job,
  Application,
  JobPreferences
} from '@sagasu/api-contract';
import { calculateMatch } from '../matching/matchingEngine';

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

const rawJobList: Omit<Job, 'matchScore' | 'matchResult'>[] = [
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
  },
  {
    id: 'job-005',
    title: 'Senior Software Engineer - Core Infrastructure',
    company: 'Xendit Financial Services',
    companyLogo: '🔷',
    location: 'Jakarta / Remote',
    remote: true,
    employmentType: 'Full-time',
    description: 'Xendit powers payments across Southeast Asia. As a Senior Core Engineer, you will build and scale distributed services, manage database sharding, and ensure sub-second reliability for cross-border disbursements.',
    requirements: [
      '5+ years building distributed backend systems in TypeScript / Node.js or Go',
      'Deep PostgreSQL database indexing, transaction locking, and performance tuning',
      'Hands-on expertise with Redis, message queues (RabbitMQ/Kafka), and Docker',
      'Demonstrated experience building mission-critical financial systems'
    ],
    responsibilities: [
      'Maintain 99.99% availability on core payment processing pipelines',
      'Design fault-tolerant event-driven architectures with circuit breakers',
      'Collaborate with security and compliance teams on PCI-DSS compliance'
    ],
    skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'System Design'],
    salary: { min: 28000000, max: 38000000, currency: 'IDR', period: 'month' },
    postedAt: '2026-08-26T11:00:00Z',
    collectedAt: '2026-08-29T15:00:00Z',
    sourceUrl: 'https://linkedin.com/jobs/view/8812903',
    sourcePlatform: 'LinkedIn',
    status: 'new'
  },
  {
    id: 'job-006',
    title: 'Fullstack Developer (Svelte & Node.js)',
    company: 'Komerce SaaS Solutions',
    companyLogo: '📦',
    location: 'Yogyakarta / Remote',
    remote: true,
    employmentType: 'Full-time',
    description: 'Komerce helps thousands of Indonesian e-commerce sellers automate fulfillment and shipment tracking. We are expanding our tech team to rebuild core portals with modern SvelteKit and Node.js APIs.',
    requirements: [
      '3+ years experience with JavaScript / TypeScript and Node.js',
      'Hands-on experience with Svelte or Vue/React',
      'Solid SQL and relational database skills (PostgreSQL or MySQL)',
      'Self-driven mindset and ability to work effectively in a remote setup'
    ],
    responsibilities: [
      'Develop real-time order tracking and shipping rate calculation modules',
      'Refactor legacy interfaces into modular Svelte components',
      'Integrate with 3rd-party logistics APIs and payment webhooks'
    ],
    skills: ['TypeScript', 'JavaScript', 'Svelte / SvelteKit', 'Node.js', 'PostgreSQL', 'Tailwind & Vanilla CSS'],
    salary: { min: 18000000, max: 25000000, currency: 'IDR', period: 'month' },
    postedAt: '2026-08-28T09:30:00Z',
    collectedAt: '2026-08-30T07:45:00Z',
    sourceUrl: 'https://glints.com/id/opportunities/jobs/komerce-fullstack',
    sourcePlatform: 'Glints',
    status: 'new'
  },
  {
    id: 'job-007',
    title: 'Senior Frontend Engineer (Design Systems)',
    company: 'Bukalapak Tech',
    companyLogo: '🔴',
    location: 'Jakarta (Hybrid)',
    remote: false,
    employmentType: 'Full-time',
    description: 'Join Bukalapak marketplace engineering team. You will lead UI engineering for buyer experience, interactive cart mechanics, and localized promotional campaigns.',
    requirements: [
      '4+ years building high-traffic customer-facing web applications',
      'Strong mastery of HTML, modern CSS, JavaScript, and TypeScript',
      'Experience optimizing Core Web Vitals and SEO performance',
      'Understanding of component-driven architecture and state management'
    ],
    responsibilities: [
      'Maintain and elevate web frontend quality across high-volume checkout funnels',
      'Collaborate with UI/UX researchers to conduct A/B testing on user conversions',
      'Implement accessible design components matching design specs'
    ],
    skills: ['TypeScript', 'JavaScript', 'Tailwind & Vanilla CSS', 'React / Next.js', 'REST & GraphQL APIs'],
    salary: { min: 22000000, max: 30000000, currency: 'IDR', period: 'month' },
    postedAt: '2026-08-25T14:00:00Z',
    collectedAt: '2026-08-28T12:00:00Z',
    sourceUrl: 'https://techinasia.com/jobs/bukalapak-sr-frontend',
    sourcePlatform: 'TechInAsia',
    status: 'new'
  },
  {
    id: 'job-008',
    title: 'Staff Fullstack Engineer - Developer Experience',
    company: 'Deel Global Workspace',
    companyLogo: '🌐',
    location: 'Remote (Worldwide / APAC)',
    remote: true,
    employmentType: 'Full-time',
    description: 'Deel is hiring a Staff Fullstack Engineer to spearhead our next-gen internal developer platform. You will build tools that empower 800+ global engineers to ship code faster, safer, and with zero friction.',
    requirements: [
      '7+ years software engineering experience in modern fullstack ecosystems',
      'Mastery of TypeScript, Node.js, modern frontends, and cloud infrastructure (AWS/GCP)',
      'Experience designing CLI tools, build pipelines, and automated test runners',
      'Excellent asynchronous written communication and technical mentoring skills'
    ],
    responsibilities: [
      'Architect developer portal, automated environment provisioning, and preview deploys',
      'Standardize API contracts and code generation workflows across squads',
      'Champion engineering productivity metrics (DORA metrics)'
    ],
    skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'CI/CD & GitHub Actions', 'System Design'],
    salary: { min: 55000000, max: 75000000, currency: 'IDR', period: 'month' },
    postedAt: '2026-08-29T06:00:00Z',
    collectedAt: '2026-08-30T11:00:00Z',
    sourceUrl: 'https://deel.com/careers/staff-fullstack-devx',
    sourcePlatform: 'Deel',
    status: 'new'
  },
  {
    id: 'job-009',
    title: 'Senior TypeScript & API Backend Engineer',
    company: 'AwanData Cloud Platform',
    companyLogo: '☁️',
    location: 'Bandung / Remote',
    remote: true,
    employmentType: 'Full-time',
    description: 'AwanData is an Indonesian cloud platform providing managed PostgreSQL, Redis, and object storage for regional startups. We need an experienced backend engineer to build our control plane and billing services.',
    requirements: [
      '4+ years backend engineering with Node.js/TypeScript or Bun',
      'Strong hands-on experience with PostgreSQL internal architecture and Redis',
      'Familiarity with containerization, Docker APIs, and Linux fundamentals',
      'Passion for developer tools and high-quality API ergonomics'
    ],
    responsibilities: [
      'Develop automated database provisioning and snapshot backup workers',
      'Implement multi-tenant usage metering and invoice generation engine',
      'Maintain client SDKs and OpenAPI documentation'
    ],
    skills: ['TypeScript', 'Bun / Elysia', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'],
    salary: { min: 24000000, max: 32000000, currency: 'IDR', period: 'month' },
    postedAt: '2026-08-28T14:20:00Z',
    collectedAt: '2026-08-30T06:10:00Z',
    sourceUrl: 'https://linkedin.com/jobs/view/6612984',
    sourcePlatform: 'LinkedIn',
    status: 'new'
  },
  {
    id: 'job-010',
    title: 'Senior Svelte / Web Applications Engineer',
    company: 'Automattic (WordPress.com)',
    companyLogo: '💻',
    location: '100% Remote Anywhere',
    remote: true,
    employmentType: 'Full-time',
    description: 'Work from anywhere in the world on modern open-source web tooling, fast client interfaces, and real-time collaborative publishing editors. We value deep web fundamentals, craftsmanship, and asynchronous independence.',
    requirements: [
      '4+ years developing responsive, accessible web applications',
      'Strong expertise with modern JavaScript/TypeScript and Svelte or React',
      'Solid eye for UI details, animations, and micro-interactions',
      'Self-driven approach to remote work and transparent documentation'
    ],
    responsibilities: [
      'Build new features for collaborative content creation and media management',
      'Refactor legacy JavaScript into modular reactive Svelte components',
      'Contribute to open source design system packages and documentation'
    ],
    skills: ['TypeScript', 'JavaScript', 'Svelte / SvelteKit', 'Tailwind & Vanilla CSS', 'REST & GraphQL APIs'],
    salary: { min: 45000000, max: 62000000, currency: 'IDR', period: 'month' },
    postedAt: '2026-08-26T18:00:00Z',
    collectedAt: '2026-08-29T08:30:00Z',
    sourceUrl: 'https://automattic.com/work-with-us/senior-web-engineer',
    sourcePlatform: 'Company Careers',
    status: 'new'
  }
];

// Enrich with match results using the deterministic matching engine
export const initialJobs: Job[] = rawJobList.map((raw) => {
  const matchResult = calculateMatch(raw, initialProfile);
  return {
    ...raw,
    matchScore: matchResult.score,
    matchResult
  } as Job;
});

export const initialApplications: Application[] = [
  {
    id: 'app-001',
    jobId: 'job-001',
    job: initialJobs[0],
    status: 'PREPARING',
    statusHistory: [
      { id: 'h-1', status: 'DISCOVERED', timestamp: '2026-08-29T12:05:00Z', note: 'Discovered via LinkedIn auto-sync' },
      { id: 'h-2', status: 'SAVED', timestamp: '2026-08-29T14:20:00Z', note: 'Bookmarked for tailored resume prep' },
      { id: 'h-3', status: 'PREPARING', timestamp: '2026-08-30T09:00:00Z', note: 'AI Cover letter and pitch drafted' }
    ],
    preparedMaterials: {
      tailoredResume: {
        headline: 'Senior Fullstack Engineer | 5+ Yrs SvelteKit, Bun, TypeScript & Cloud Architecture',
        summary: 'Accomplished Fullstack Engineer with proven track record delivering sub-second web applications and distributed Redis/PostgreSQL queues. Expertise in SvelteKit and Bun aligns directly with Vercel Ecosystem tooling requirements.',
        targetedBulletPoints: [
          'Architected telemetry dashboards using SvelteKit & Bun with 45% reduction in latency',
          'Engineered background task processing pipeline handling 2M+ events daily with Redis & Postgres',
          'Authored reusable typed API contracts preventing integration regression across 4 microservices'
        ]
      },
      coverLetter: `Dear Hiring Team at Vercel Ecosystem Partner,

I am writing to express my strong interest in the Senior Fullstack Engineer position. Having spent the last 5 years building reactive, high-performance web systems using TypeScript, SvelteKit, and PostgreSQL, I was immediately drawn to your mission of crafting world-class developer automation tooling.

In my recent role at Nusantara Cloud Labs, I architected our real-time telemetry dashboard using SvelteKit and Bun, reducing initial page latency by 45% and optimizing Core Web Vitals to 99+ scores. I also engineered our background processing queues with Redis and PostgreSQL, ensuring bulletproof transactional reliability at high throughput.

Your role aligns exceptionally with my technical depth and passion for developer ergonomics. I welcome the opportunity to discuss how my hands-on background in modern reactive architectures can immediately benefit your product engineering squad.

Warm regards,
Raden Manopo`,
      recruiterMessage: `Hi Sarah, I saw the Senior Fullstack Engineer opening at Vercel Partner and noticed your focus on Svelte & TypeScript tooling. With 5+ yrs engineering high-throughput SvelteKit and Bun platforms, I would love to connect and share how my experience aligns with your team's roadmap. Best, Raden`,
      applicationQuestionsAnswers: [
        {
          question: 'Why are you interested in this role?',
          answer: 'I specialize in Svelte and TypeScript developer tooling. Your focus on building fast, developer-first cloud applications perfectly matches my hands-on expertise and career trajectory.',
          rationale: 'Connects candidate expertise directly to company mission with clear technical alignment.'
        },
        {
          question: 'Describe your experience with async processing and background queues.',
          answer: 'I have designed distributed queue architectures using Redis and PostgreSQL handling over 2M background jobs per day, with built-in idempotency, retries, and dead-letter queues.',
          rationale: 'Demonstrates deep backend reliability knowledge directly answering job requirements.'
        }
      ],
      approvedByUser: false,
      userNotes: 'Targeting submission by Monday morning.'
    },
    targetSubmissionDate: '2026-09-01',
    createdAt: '2026-08-29T12:05:00Z',
    updatedAt: '2026-08-30T09:00:00Z'
  },
  {
    id: 'app-002',
    jobId: 'job-002',
    job: initialJobs[1],
    status: 'SAVED',
    statusHistory: [
      { id: 'h-201', status: 'DISCOVERED', timestamp: '2026-08-28T16:15:00Z', note: 'Discovered via TechInAsia' },
      { id: 'h-202', status: 'SAVED', timestamp: '2026-08-29T10:00:00Z', note: 'High match score (89%), reviewing requirements' }
    ],
    createdAt: '2026-08-28T16:15:00Z',
    updatedAt: '2026-08-29T10:00:00Z'
  },
  {
    id: 'app-003',
    jobId: 'job-004',
    job: initialJobs[3],
    status: 'APPLIED',
    statusHistory: [
      { id: 'h-301', status: 'DISCOVERED', timestamp: '2026-08-29T20:10:00Z', note: 'Discovered via RemoteOK' },
      { id: 'h-302', status: 'SAVED', timestamp: '2026-08-29T21:00:00Z', note: 'Saved opportunity' },
      { id: 'h-303', status: 'PREPARING', timestamp: '2026-08-30T07:00:00Z', note: 'Generated customized application pack' },
      { id: 'h-304', status: 'APPLIED', timestamp: '2026-08-30T08:30:00Z', note: 'Submitted application via portal after human review' }
    ],
    appliedDate: '2026-08-30',
    preparedMaterials: {
      tailoredResume: {
        headline: 'AI & Fullstack Product Engineer (Svelte, Bun, PostgreSQL)',
        summary: 'Fullstack engineer with deep expertise in Svelte, streaming interfaces, and PostgreSQL vector systems.',
        targetedBulletPoints: [
          'Built LLM streaming UI workflows with SvelteKit and Server-Sent Events',
          'Engineered PostgreSQL indexing strategies for rapid schema search'
        ]
      },
      coverLetter: 'Dear Supabase Ecosystem Team, I am thrilled to apply for the AI Product Fullstack Engineer role...',
      recruiterMessage: 'Hi Team, just submitted my application for the AI Product Fullstack role!',
      applicationQuestionsAnswers: [],
      approvedByUser: true
    },
    createdAt: '2026-08-29T20:10:00Z',
    updatedAt: '2026-08-30T08:30:00Z'
  },
  {
    id: 'app-004',
    jobId: 'job-003',
    job: initialJobs[2],
    status: 'INTERVIEW',
    statusHistory: [
      { id: 'h-401', status: 'DISCOVERED', timestamp: '2026-08-27T08:15:00Z', note: 'Discovered via Glints' },
      { id: 'h-402', status: 'APPLIED', timestamp: '2026-08-27T14:00:00Z', note: 'Applied with tailored portfolio link' },
      { id: 'h-403', status: 'INTERVIEW', timestamp: '2026-08-29T11:00:00Z', note: 'Recruiter phone screen passed, Technical Round booked' }
    ],
    appliedDate: '2026-08-27',
    interviews: [
      {
        id: 'int-1',
        round: 'Round 1: Technical Architecture & System Design',
        scheduledAt: '2026-09-02T14:00:00+07:00',
        notes: 'Discussion with VP of Frontend Engineering on modular component scale and micro-frontends.'
      }
    ],
    contactPerson: {
      name: 'Dewi Lestari',
      role: 'Senior Tech Talent Partner',
      emailOrLink: 'dewi.lestari@traveloka.com'
    },
    createdAt: '2026-08-27T08:15:00Z',
    updatedAt: '2026-08-29T11:00:00Z'
  }
];

export const initialPreferences: JobPreferences = {
  desiredRoles: [
    'Senior Fullstack Engineer',
    'Senior Frontend Engineer',
    'Svelte / TypeScript Engineer',
    'Staff Software Engineer',
    'Backend Engineer (TypeScript / Node)'
  ],
  locations: ['Jakarta', 'Remote', 'Singapore / Remote', 'Bandung'],
  remoteOnly: true,
  minSalaryMonthlyIDR: 20000000,
  keywords: ['TypeScript', 'Svelte', 'Bun', 'Elysia', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'],
  excludedCompanies: ['CryptoGambling Inc', 'SpamMedia'],
  enabledSources: [
    { id: 'src-1', name: 'LinkedIn Jobs', enabled: true, lastSyncedAt: '2026-08-30T09:15:00Z', itemsCount: 142 },
    { id: 'src-2', name: 'TechInAsia Jobs', enabled: true, lastSyncedAt: '2026-08-30T08:00:00Z', itemsCount: 68 },
    { id: 'src-3', name: 'Glints Southeast Asia', enabled: true, lastSyncedAt: '2026-08-30T07:45:00Z', itemsCount: 94 },
    { id: 'src-4', name: 'RemoteOK', enabled: true, lastSyncedAt: '2026-08-30T10:00:00Z', itemsCount: 52 },
    { id: 'src-5', name: 'Deel Careers', enabled: true, lastSyncedAt: '2026-08-30T11:00:00Z', itemsCount: 31 },
    { id: 'src-6', name: 'Company Career Portals (Direct)', enabled: true, lastSyncedAt: '2026-08-30T09:30:00Z', itemsCount: 27 }
  ],
  autoSyncIntervalMinutes: 60,
  minMatchScoreThreshold: 70,
  alertEmailEnabled: true
};
