import { sql } from '../../infrastructure/database/db';
import { calculateMatch } from '../matching/matchingEngine';
import { LinkedInAdapter } from './adapters/linkedin.adapter';
import { GlintsAdapter } from './adapters/glints.adapter';
import { JobStreetAdapter } from './adapters/jobstreet.adapter';
import { RemoteOKAdapter } from './adapters/remoteok.adapter';
import { HackerNewsAdapter } from './adapters/hackernews.adapter';
import type { JobSourceAdapter, RawJob } from './adapters/types';
import { normalizeRawJob } from './normalizer';
import { checkJobDuplicate } from './deduplicator';
import type { Job, UserProfile, ProfileSkill, JobPreferences } from '@sagasu/api-contract';

export interface CollectorSyncResult {
  totalDiscovered: number;
  newIndexed: number;
  deduplicatedCount: number;
  items: Job[];
}

export class CollectorService {
  private adapters: JobSourceAdapter[];

  constructor() {
    this.adapters = [
      new LinkedInAdapter(),
      new GlintsAdapter(),
      new JobStreetAdapter(),
      new RemoteOKAdapter(),
      new HackerNewsAdapter()
    ];
  }

  async runSync(options?: { keywords?: string[]; limitPerSource?: number }): Promise<CollectorSyncResult> {
    console.log('[CollectorService] Starting multi-source job discovery...');

    // 1. Fetch user profile for matching calculation
    const [profileRow] = await sql`SELECT * FROM user_profiles LIMIT 1`;
    const skillsRows = profileRow
      ? await sql`
          SELECT id, name, category, level, years_of_experience as "yearsOfExperience"
          FROM profile_skills
          WHERE profile_id = ${profileRow.id}
        `
      : [];

    const profile: UserProfile = {
      id: profileRow?.id || 'candidate-default',
      personal: profileRow?.personal || { name: 'Raden Manopo', email: 'raden@example.com', location: 'Jakarta' },
      career: profileRow?.career || { targetRoles: ['Senior Fullstack Engineer'], remotePreference: 'remote_only' },
      skills: (skillsRows as unknown as ProfileSkill[]) || [],
      experiences: profileRow?.experiences || [],
      educations: profileRow?.educations || [],
      resumes: profileRow?.resumes || [],
      updatedAt: new Date().toISOString()
    };

    // 2. Fetch search preferences
    const [prefRow] = await sql`SELECT payload FROM preferences WHERE id = 'default' LIMIT 1`;
    const preferences: JobPreferences = (prefRow?.payload as JobPreferences) || {
      desiredRoles: ['Software Engineer', 'Frontend Engineer', 'Backend Engineer'],
      searchKeywords: ['TypeScript', 'Svelte', 'Node.js', 'PostgreSQL', 'Fullstack'],
      minSalaryMonthlyIDR: 20000000,
      targetLocations: ['Jakarta', 'Remote'],
      remoteOnly: true,
      enabledSources: []
    };

    const keywords = options?.keywords && options.keywords.length > 0
      ? options.keywords
      : preferences.searchKeywords;

    // 3. Load existing jobs from PostgreSQL for deduplication
    const existingJobRows = await sql`SELECT * FROM jobs`;
    const existingJobs: Job[] = existingJobRows.map((row: any) => ({
      id: row.id,
      title: row.title,
      company: row.company,
      companyLogo: row.company_logo || undefined,
      location: row.location,
      remote: row.remote,
      employmentType: row.employment_type,
      description: row.description,
      requirements: row.requirements || [],
      responsibilities: row.responsibilities || [],
      niceToHave: row.nice_to_have || [],
      skills: row.skills || [],
      salary: row.salary || undefined,
      postedAt: typeof row.posted_at === 'string' ? row.posted_at : new Date(row.posted_at).toISOString(),
      collectedAt: typeof row.collected_at === 'string' ? row.collected_at : new Date(row.collected_at).toISOString(),
      sourceUrl: row.source_url,
      sourcePlatform: row.source_platform,
      deduplicationSources: row.deduplication_sources || [],
      matchScore: row.match_score,
      matchResult: row.match_result,
      status: row.status
    }));

    // 4. Query all active adapters concurrently
    const adapterResults = await Promise.allSettled(
      this.adapters.map((adapter) =>
        adapter.search({
          keywords,
          remoteOnly: preferences.remoteOnly,
          limit: options?.limitPerSource || 15
        })
      )
    );

    const rawJobs: RawJob[] = [];
    adapterResults.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        rawJobs.push(...res.value);
        console.log(`[CollectorService] ${this.adapters[idx].name}: Discovered ${res.value.length} positions.`);
      } else {
        console.warn(`[CollectorService] ${this.adapters[idx].name} failed:`, res.reason);
      }
    });

    let newIndexed = 0;
    let deduplicatedCount = 0;
    const syncedJobs: Job[] = [];

    // 5. Process normalization, deduplication, scoring, and DB persistence
    for (const raw of rawJobs) {
      const normalized = normalizeRawJob(raw);

      // Check deduplication against current pool
      const dedupCheck = checkJobDuplicate(
        {
          title: normalized.title,
          company: normalized.company,
          sourceUrl: normalized.sourceUrl,
          sourcePlatform: normalized.sourcePlatform,
          externalId: raw.externalId,
          salary: normalized.salary
        },
        existingJobs
      );

      if (dedupCheck.isDuplicate && dedupCheck.existingJob) {
        deduplicatedCount++;
        const targetId = dedupCheck.existingJob.id;
        const updatedSources = dedupCheck.updatedSources || dedupCheck.existingJob.deduplicationSources;
        const mergedSalary = dedupCheck.mergedSalary || dedupCheck.existingJob.salary;

        await sql`
          UPDATE jobs
          SET
            deduplication_sources = ${sql.json(updatedSources)},
            salary = COALESCE(salary, ${mergedSalary ? sql.json(mergedSalary) : null}),
            updated_at = NOW()
          WHERE id = ${targetId}
        `;

        // Update in-memory copy
        const existingIdx = existingJobs.findIndex((j) => j.id === targetId);
        if (existingIdx !== -1) {
          existingJobs[existingIdx].deduplicationSources = updatedSources;
          if (mergedSalary) existingJobs[existingIdx].salary = mergedSalary;
          syncedJobs.push(existingJobs[existingIdx]);
        }
      } else {
        // New opportunity: calculate deterministic match
        const matchResult = calculateMatch(normalized, profile);
        const newJobId = `job-ext-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        const newJob: Job = {
          ...normalized,
          id: newJobId,
          matchScore: matchResult.score,
          matchResult
        };

        await sql`
          INSERT INTO jobs (
            id, title, company, company_logo, location, remote, employment_type,
            description, requirements, responsibilities, nice_to_have, skills,
            salary, posted_at, collected_at, source_url,
            source_platform, deduplication_sources, match_score, match_result, status
          ) VALUES (
            ${newJob.id}, ${newJob.title}, ${newJob.company}, ${newJob.companyLogo || null},
            ${newJob.location}, ${newJob.remote}, ${newJob.employmentType},
            ${newJob.description}, ${sql.json(newJob.requirements)},
            ${sql.json(newJob.responsibilities)}, ${sql.json(newJob.niceToHave || [])},
            ${sql.json(newJob.skills)}, ${newJob.salary ? sql.json(newJob.salary) : null},
            ${newJob.postedAt}, ${newJob.collectedAt}, ${newJob.sourceUrl},
            ${newJob.sourcePlatform}, ${sql.json(newJob.deduplicationSources || [])},
            ${newJob.matchScore}, ${sql.json(newJob.matchResult)}, 'new'
          )
        `;

        existingJobs.push(newJob);
        syncedJobs.push(newJob);
        newIndexed++;
      }
    }

    console.log(
      `[CollectorService] Sync finished: ${rawJobs.length} discovered, ${newIndexed} newly indexed, ${deduplicatedCount} merged duplicates.`
    );

    return {
      totalDiscovered: rawJobs.length,
      newIndexed,
      deduplicatedCount,
      items: syncedJobs
    };
  }
}

export const collectorService = new CollectorService();