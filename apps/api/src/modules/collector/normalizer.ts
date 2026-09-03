import type { Job, SalaryRange } from '@sagasu/api-contract';
import type { RawJob } from './adapters/types';

function cleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<li>/gi, '\n• ')
    .replace(/<\/li>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractBullets(text: string): string[] {
  const lines = text.split('\n');
  const bullets = lines
    .map((l) => l.trim())
    .filter((l) => l.startsWith('•') || l.startsWith('-') || l.startsWith('*'))
    .map((l) => l.replace(/^[•\-*]\s*/, '').trim())
    .filter((l) => l.length > 10 && l.length < 240);

  return bullets.slice(0, 5);
}

const KNOWN_SKILLS_MAP: Record<string, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  svelte: 'Svelte / SvelteKit',
  sveltekit: 'Svelte / SvelteKit',
  react: 'React / Next.js',
  nextjs: 'React / Next.js',
  node: 'Node.js',
  nodejs: 'Node.js',
  bun: 'Bun / Elysia',
  elysia: 'Bun / Elysia',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  redis: 'Redis',
  docker: 'Docker',
  graphql: 'REST & GraphQL APIs',
  rest: 'REST & GraphQL APIs',
  api: 'REST & GraphQL APIs',
  python: 'Python',
  golang: 'Go',
  go: 'Go',
  tailwind: 'Tailwind & Vanilla CSS',
  css: 'Tailwind & Vanilla CSS',
  cicd: 'CI/CD & GitHub Actions',
  architecture: 'System Design'
};

export function normalizeRawJob(raw: RawJob): Omit<Job, 'id' | 'matchScore' | 'matchResult'> {
  const cleanDescription = cleanHtml(raw.description);
  const bullets = extractBullets(cleanDescription);

  // Extract skills from tags & description
  const foundSkills = new Set<string>();
  if (raw.tags) {
    for (const tag of raw.tags) {
      const lower = tag.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (KNOWN_SKILLS_MAP[lower]) {
        foundSkills.add(KNOWN_SKILLS_MAP[lower]);
      }
    }
  }

  const descLower = cleanDescription.toLowerCase();
  for (const [key, canonical] of Object.entries(KNOWN_SKILLS_MAP)) {
    if (descLower.includes(key)) {
      foundSkills.add(canonical);
    }
  }

  const skills = Array.from(foundSkills);
  if (skills.length === 0) {
    skills.push('TypeScript', 'Node.js', 'REST & GraphQL APIs');
  }

  // Parse salary
  let salary: SalaryRange | undefined = undefined;
  if (raw.salaryMin || raw.salaryMax) {
    let min = raw.salaryMin || (raw.salaryMax ? Math.round(raw.salaryMax * 0.75) : 0);
    let max = raw.salaryMax || (raw.salaryMin ? Math.round(raw.salaryMin * 1.3) : 0);
    let currency = raw.salaryCurrency || 'USD';
    let period = raw.salaryPeriod || 'year';

    // Convert annual USD to monthly IDR for consistent representation in SAGASU
    if (currency === 'USD' && period === 'year') {
      min = Math.round((min * 15800) / 12);
      max = Math.round((max * 15800) / 12);
      currency = 'IDR';
      period = 'month';
    }

    salary = { min, max, currency, period: period as 'month' | 'year' | 'hour' };
  }

  const requirements = bullets.length >= 2
    ? bullets
    : [
        `Demonstrated hands-on production experience in ${skills.slice(0, 2).join(' and ')}`,
        'Strong understanding of clean system design and asynchronous API integrations',
        'Proven track record delivering reliable software in fast-paced teams'
      ];

  const responsibilities = [
    `Design, develop, and maintain performant features for ${raw.title}`,
    `Collaborate with product and engineering teams to solve complex technical requirements`,
    `Ensure high availability, test coverage, and documentation across key workflows`
  ];

  return {
    title: raw.title.trim(),
    company: raw.company.trim(),
    companyLogo: raw.companyLogo,
    location: raw.location.trim() || 'Remote',
    remote: raw.remote ?? true,
    employmentType: raw.employmentType || 'Full-time',
    description: cleanDescription || `Exciting engineering role at ${raw.company} working with ${skills.join(', ')}.`,
    requirements,
    responsibilities,
    niceToHave: [],
    skills,
    salary,
    postedAt: raw.postedAt || new Date().toISOString(),
    collectedAt: new Date().toISOString(),
    sourceUrl: raw.url,
    sourcePlatform: raw.platform,
    deduplicationSources: [
      {
        platform: raw.platform,
        sourceUrl: raw.url,
        externalId: raw.externalId,
        fetchedAt: new Date().toISOString()
      }
    ],
    status: 'new'
  };
}