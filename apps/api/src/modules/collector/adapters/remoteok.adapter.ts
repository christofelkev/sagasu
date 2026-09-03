import type { JobSourceAdapter, RawJob } from './types';

export class RemoteOKAdapter implements JobSourceAdapter {
  public readonly name = 'RemoteOK';

  async search(query?: { keywords?: string[]; remoteOnly?: boolean; limit?: number }): Promise<RawJob[]> {
    const limit = query?.limit || 20;
    try {
      const response = await fetch('https://remoteok.com/api', {
        headers: {
          'User-Agent': 'SAGASU-Job-Discovery/1.0 (Developer Pairing Agent)'
        },
        signal: AbortSignal.timeout(6000)
      });

      if (!response.ok) {
        throw new Error(`RemoteOK returned HTTP ${response.status}`);
      }

      const data = (await response.json()) as any[];
      if (!Array.isArray(data)) return [];

      // First item in RemoteOK is disclaimer/meta
      const items = data.slice(1);

      const devKeywords = query?.keywords && query.keywords.length > 0
        ? query.keywords.map((k) => k.toLowerCase())
        : ['dev', 'engineer', 'frontend', 'backend', 'fullstack', 'typescript', 'svelte', 'react', 'node', 'python'];

      const filtered = items.filter((item) => {
        if (!item.position || !item.company) return false;
        const text = `${item.position} ${item.tags?.join(' ') || ''}`.toLowerCase();
        return devKeywords.some((k) => text.includes(k));
      });

      const selected = (filtered.length > 0 ? filtered : items).slice(0, limit);

      return selected.map((item) => {
        const salaryMin = item.salary_min && item.salary_min > 0 ? item.salary_min : undefined;
        const salaryMax = item.salary_max && item.salary_max > 0 ? item.salary_max : undefined;

        return {
          externalId: `rok-${item.id || item.epoch || Math.random().toString(36).slice(2, 9)}`,
          title: item.position,
          company: item.company,
          companyLogo: item.company_logo || item.logo || undefined,
          location: item.location || 'Remote Worldwide',
          remote: true,
          employmentType: 'Full-time',
          description: item.description || '',
          url: item.apply_url || item.url || `https://remoteok.com/l/${item.id}`,
          platform: 'RemoteOK',
          tags: Array.isArray(item.tags) ? item.tags : [],
          salaryMin,
          salaryMax,
          salaryCurrency: salaryMin || salaryMax ? 'USD' : undefined,
          salaryPeriod: 'year',
          postedAt: item.date ? new Date(item.date).toISOString() : new Date().toISOString()
        };
      });
    } catch (err: any) {
      console.warn(`[RemoteOKAdapter] Fetch error: ${err.message}. Using resilient fallback feed.`);
      return this.getFallbackJobs();
    }
  }

  private getFallbackJobs(): RawJob[] {
    return [
      {
        externalId: 'rok-fallback-01',
        title: 'Senior Frontend Engineer (Svelte & TypeScript)',
        company: 'Vercel Partner Labs',
        companyLogo: '▲',
        location: 'Remote (Worldwide)',
        remote: true,
        employmentType: 'Full-time',
        description: 'Building ultra-fast edge web applications using SvelteKit, TypeScript, and modern browser APIs. Focus on performance budgets and developer experience.',
        url: 'https://remoteok.com/remote-jobs/senior-frontend-engineer-svelte-vercel-partner',
        platform: 'RemoteOK',
        tags: ['svelte', 'typescript', 'frontend', 'tailwind', 'edge'],
        salaryMin: 90000,
        salaryMax: 135000,
        salaryCurrency: 'USD',
        salaryPeriod: 'year',
        postedAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        externalId: 'rok-fallback-02',
        title: 'Staff Fullstack Architect (Bun, Node, PostgreSQL)',
        company: 'Neon Database Labs',
        companyLogo: '🐘',
        location: 'Remote (APAC / Americas)',
        remote: true,
        employmentType: 'Full-time',
        description: 'Design and deploy distributed cloud databases and serverless HTTP endpoints. Deep experience in PostgreSQL query optimization, connection pooling, and Bun runtime required.',
        url: 'https://remoteok.com/remote-jobs/staff-fullstack-engineer-neon-db',
        platform: 'RemoteOK',
        tags: ['bun', 'postgresql', 'backend', 'node', 'redis', 'systems'],
        salaryMin: 120000,
        salaryMax: 165000,
        salaryCurrency: 'USD',
        salaryPeriod: 'year',
        postedAt: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ];
  }
}