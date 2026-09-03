import { describe, it, expect } from 'bun:test';
import { normalizeRawJob } from '../src/modules/collector/normalizer';
import { checkJobDuplicate } from '../src/modules/collector/deduplicator';
import { collectorService } from '../src/modules/collector/collector.service';
import { app } from '../src/server';
import type { Job } from '@sagasu/api-contract';

describe('Job Collector & Deduplication Pipeline', () => {
  it('normalizes raw jobs and cleans HTML description', () => {
    const raw = {
      externalId: 'ext-test-1',
      title: 'Senior Frontend Engineer',
      company: 'Tech Labs Inc.',
      location: 'Remote',
      remote: true,
      description: '<p>Join us! We are building with <strong>SvelteKit</strong> and <strong>TypeScript</strong>.</p><ul><li>5+ years experience</li><li>Strong CSS & design systems</li></ul>',
      url: 'https://example.com/jobs/1',
      platform: 'RemoteOK',
      tags: ['svelte', 'typescript', 'frontend']
    };

    const normalized = normalizeRawJob(raw);
    expect(normalized.title).toBe('Senior Frontend Engineer');
    expect(normalized.company).toBe('Tech Labs Inc.');
    expect(normalized.description).not.toContain('<p>');
    expect(normalized.description).not.toContain('<strong>');
    expect(normalized.skills).toContain('Svelte / SvelteKit');
    expect(normalized.skills).toContain('TypeScript');
    expect(normalized.requirements.length).toBeGreaterThanOrEqual(1);
    expect(normalized.sourcePlatform).toBe('RemoteOK');
    expect(normalized.deduplicationSources[0].externalId).toBe('ext-test-1');
  });

  it('detects duplicate jobs across sources and merges deduplicationSources', () => {
    const existingJob: Job = {
      id: 'job-existing-1',
      title: 'Senior Fullstack Engineer (Svelte & TypeScript)',
      company: 'Nusantara Cloud Labs',
      location: 'Remote',
      remote: true,
      employmentType: 'Full-time',
      description: 'Building edge apps.',
      requirements: [],
      responsibilities: [],
      skills: ['TypeScript', 'Svelte / SvelteKit'],
      postedAt: new Date().toISOString(),
      collectedAt: new Date().toISOString(),
      sourceUrl: 'https://nusantara.dev/careers/senior-fullstack',
      sourcePlatform: 'Company Careers',
      deduplicationSources: [
        {
          platform: 'Company Careers',
          sourceUrl: 'https://nusantara.dev/careers/senior-fullstack',
          externalId: 'nus-1',
          fetchedAt: new Date().toISOString()
        }
      ],
      matchScore: 92,
      matchResult: {} as any,
      status: 'new'
    };

    // 1. Exact URL duplicate test
    const dupUrl = checkJobDuplicate(
      {
        title: 'Fullstack Engineer',
        company: 'Other Name',
        sourceUrl: 'https://nusantara.dev/careers/senior-fullstack',
        sourcePlatform: 'RemoteOK',
        externalId: 'rok-888'
      },
      [existingJob]
    );

    expect(dupUrl.isDuplicate).toBe(true);
    expect(dupUrl.updatedSources?.length).toBe(2);
    expect(dupUrl.updatedSources?.[1].platform).toBe('RemoteOK');

    // 2. Company + Title fuzzy duplicate test
    const dupFuzzy = checkJobDuplicate(
      {
        title: 'Senior Fullstack Engineer',
        company: 'Nusantara Cloud Labs Inc.',
        sourceUrl: 'https://glints.com/jobs/99',
        sourcePlatform: 'Glints',
        externalId: 'gl-99'
      },
      [existingJob]
    );

    expect(dupFuzzy.isDuplicate).toBe(true);

    // 3. Unrelated job test
    const notDup = checkJobDuplicate(
      {
        title: 'DevOps Security Specialist',
        company: 'Unrelated Cyber Corp',
        sourceUrl: 'https://cyber.com/jobs/sec-1',
        sourcePlatform: 'LinkedIn',
        externalId: 'li-sec'
      },
      [existingJob]
    );

    expect(notDup.isDuplicate).toBe(false);
  });

  it('runs sync discovery and stores newly indexed jobs in PostgreSQL', async () => {
    const result = await collectorService.runSync({ limitPerSource: 3 });
    expect(result.totalDiscovered).toBeGreaterThanOrEqual(1);
    expect(result.newIndexed + result.deduplicatedCount).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/v1/jobs/sync triggers live collection via HTTP', async () => {
    const res = await app.handle(
      new Request('http://localhost:3001/api/v1/jobs/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limitPerSource: 2 })
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('totalDiscovered');
    expect(body).toHaveProperty('newIndexed');
    expect(body).toHaveProperty('deduplicatedCount');
  });
});