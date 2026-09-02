import { Elysia, t } from 'elysia';
import { sql } from '../../infrastructure/database/db';
import { ApiError, formatError } from '../../infrastructure/http/error-handler';
import type { Job } from '@sagasu/api-contract';

function mapRowToJob(row: any): Job {
  return {
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
  };
}

export const jobsController = new Elysia({ prefix: '/jobs' })
  .get('/', async ({ query }) => {
    const q = query.q ? `%${query.q.toLowerCase()}%` : null;
    const status = query.status || null;
    const minScore = query.minScore ? parseInt(query.minScore as string, 10) : 0;
    const remoteOnly = query.remote === 'true';
    const limit = query.limit ? parseInt(query.limit as string, 10) : 50;
    const offset = query.offset ? parseInt(query.offset as string, 10) : 0;

    let rows: any[];
    if (q) {
      rows = await sql`
        SELECT * FROM jobs
        WHERE (LOWER(title) LIKE ${q} OR LOWER(company) LIKE ${q} OR LOWER(description) LIKE ${q})
          AND (${status ? sql`status = ${status}` : sql`status != 'rejected'`})
          AND match_score >= ${minScore}
          AND (${remoteOnly ? sql`remote = true` : sql`TRUE`})
        ORDER BY match_score DESC, posted_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      rows = await sql`
        SELECT * FROM jobs
        WHERE (${status ? sql`status = ${status}` : sql`status != 'rejected'`})
          AND match_score >= ${minScore}
          AND (${remoteOnly ? sql`remote = true` : sql`TRUE`})
        ORDER BY match_score DESC, posted_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const [totalRow] = await sql`SELECT COUNT(*)::int as count FROM jobs`;

    return {
      items: rows.map(mapRowToJob),
      total: totalRow.count,
      limit,
      offset
    };
  })
  .get('/:id', async ({ params, set }) => {
    const [row] = await sql`SELECT * FROM jobs WHERE id = ${params.id} LIMIT 1`;
    if (!row) {
      set.status = 404;
      return formatError('JOB_NOT_FOUND', `Job with ID ${params.id} was not found.`);
    }
    return mapRowToJob(row);
  })
  .post('/:id/save', async ({ params, set }) => {
    const [row] = await sql`
      UPDATE jobs
      SET status = 'saved', updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `;
    if (!row) {
      set.status = 404;
      return formatError('JOB_NOT_FOUND', `Job with ID ${params.id} was not found.`);
    }
    return mapRowToJob(row);
  })
  .post('/:id/reject', async ({ params, set }) => {
    const [row] = await sql`
      UPDATE jobs
      SET status = 'rejected', updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `;
    if (!row) {
      set.status = 404;
      return formatError('JOB_NOT_FOUND', `Job with ID ${params.id} was not found.`);
    }
    return mapRowToJob(row);
  })
  .post('/:id/review', async ({ params, set }) => {
    const [row] = await sql`
      UPDATE jobs
      SET status = 'reviewed', updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `;
    if (!row) {
      set.status = 404;
      return formatError('JOB_NOT_FOUND', `Job with ID ${params.id} was not found.`);
    }
    return mapRowToJob(row);
  });