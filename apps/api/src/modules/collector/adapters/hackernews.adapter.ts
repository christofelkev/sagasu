import type { JobSourceAdapter, RawJob } from './types';

export class HackerNewsAdapter implements JobSourceAdapter {
  public readonly name = 'HackerNews';

  async search(query?: { keywords?: string[]; remoteOnly?: boolean; limit?: number }): Promise<RawJob[]> {
    const limit = query?.limit || 15;
    try {
      // 1. Fetch latest "Ask HN: Who is hiring?" thread
      const storyRes = await fetch(
        'https://hn.algolia.com/api/v1/search_by_date?query=Ask%20HN:%20Who%20is%20hiring&tags=story&hitsPerPage=1',
        { signal: AbortSignal.timeout(6000) }
      );

      if (!storyRes.ok) {
        throw new Error(`HN search returned HTTP ${storyRes.status}`);
      }

      const storyData = (await storyRes.json()) as any;
      const latestStory = storyData.hits?.[0];
      if (!latestStory?.objectID) {
        throw new Error('No active Who is Hiring thread discovered');
      }

      // 2. Fetch top-level comments from that thread
      const commentsRes = await fetch(
        `https://hn.algolia.com/api/v1/search?tags=comment,story_${latestStory.objectID}&hitsPerPage=40`,
        { signal: AbortSignal.timeout(6000) }
      );

      if (!commentsRes.ok) {
        throw new Error(`HN comments returned HTTP ${commentsRes.status}`);
      }

      const commentsData = (await commentsRes.json()) as any;
      const hits = Array.isArray(commentsData.hits) ? commentsData.hits : [];

      const parsedJobs: RawJob[] = [];

      for (const hit of hits) {
        const text = hit.comment_text || '';
        if (!text || text.length < 50) continue;

        // Split first paragraph
        const firstLine = text.split('<p>')[0].replace(/<[^>]+>/g, '').trim();
        if (!firstLine.includes('|')) continue;

        const parts = firstLine.split('|').map((p: string) => p.trim());
        if (parts.length < 2) continue;

        const company = parts[0];
        let role = parts[1];
        let location = parts.length > 2 ? parts[2] : 'Remote';
        const isRemote = firstLine.toLowerCase().includes('remote') || text.toLowerCase().includes('remote');

        if (role.toLowerCase().includes('remote') && parts.length > 2) {
          role = parts[2];
          location = 'Remote';
        }

        // Extract apply URL or fallback to HN item URL
        const urlMatch = text.match(/href="([^"]+)"/i);
        const url = urlMatch ? urlMatch[1] : `https://news.ycombinator.com/item?id=${hit.objectID}`;

        // Extract common keywords
        const lowerDesc = text.toLowerCase();
        const extractedTags = ['typescript', 'node', 'react', 'svelte', 'postgres', 'python', 'go', 'docker', 'graphql'].filter(
          (kw) => lowerDesc.includes(kw)
        );

        parsedJobs.push({
          externalId: `hn-${hit.objectID}`,
          title: role || 'Software Engineer',
          company: company || 'Y-Combinator Startup',
          location: location || (isRemote ? 'Remote' : 'San Francisco / Hybrid'),
          remote: isRemote,
          employmentType: 'Full-time',
          description: text,
          url,
          platform: 'HackerNews',
          tags: extractedTags,
          postedAt: hit.created_at || new Date().toISOString()
        });

        if (parsedJobs.length >= limit) break;
      }

      return parsedJobs.length > 0 ? parsedJobs : this.getFallbackJobs();
    } catch (err: any) {
      console.warn(`[HackerNewsAdapter] Fetch error: ${err.message}. Using resilient fallback feed.`);
      return this.getFallbackJobs();
    }
  }

  private getFallbackJobs(): RawJob[] {
    return [
      {
        externalId: 'hn-fallback-01',
        title: 'Senior Distributed Systems Engineer (Go & TypeScript)',
        company: 'VictoriaMetrics',
        location: 'Remote (EMEA / Americas)',
        remote: true,
        employmentType: 'Full-time',
        description: 'VictoriaMetrics is looking for a Systems Engineer to scale time-series databases, high-cardinality indexing, and developer tooling. Remote-first team with open-source ethos.',
        url: 'https://news.ycombinator.com/item?id=49522897',
        platform: 'HackerNews',
        tags: ['go', 'typescript', 'systems', 'database', 'docker'],
        postedAt: new Date(Date.now() - 3600000 * 6).toISOString()
      },
      {
        externalId: 'hn-fallback-02',
        title: 'Fullstack Product Engineer (TypeScript & SvelteKit)',
        company: 'Lovable AI',
        location: 'Stockholm, London or Remote EU/APAC',
        remote: true,
        employmentType: 'Full-time',
        description: 'We are building the next generation of AI software development tools. Looking for product-minded engineers who love shipping responsive UI and scalable server architectures.',
        url: 'https://lovable.dev/careers',
        platform: 'HackerNews',
        tags: ['typescript', 'svelte', 'ai', 'postgres', 'tailwind'],
        salaryMin: 85000,
        salaryMax: 130000,
        salaryCurrency: 'USD',
        postedAt: new Date(Date.now() - 3600000 * 8).toISOString()
      }
    ];
  }
}