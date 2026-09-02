import { Elysia, t } from 'elysia';
import { sql } from '../../infrastructure/database/db';
import { formatError } from '../../infrastructure/http/error-handler';
import type { Application, ApplicationStatus, PreparedApplicationMaterials } from '@sagasu/api-contract';

function mapRowToApplication(row: any): Application {
  return {
    id: row.id,
    jobId: row.job_id,
    job: {
      id: row.job_id,
      title: row.job_title,
      company: row.job_company,
      companyLogo: row.job_company_logo,
      location: row.job_location,
      remote: row.job_remote,
      employmentType: row.job_employment_type,
      description: row.job_description,
      requirements: row.job_requirements || [],
      responsibilities: row.job_responsibilities || [],
      niceToHave: row.job_nice_to_have || [],
      skills: row.job_skills || [],
      salary: row.job_salary,
      postedAt: typeof row.job_posted_at === 'string' ? row.job_posted_at : new Date(row.job_posted_at).toISOString(),
      collectedAt: typeof row.job_collected_at === 'string' ? row.job_collected_at : new Date(row.job_collected_at).toISOString(),
      sourceUrl: row.job_source_url,
      sourcePlatform: row.job_source_platform,
      matchScore: row.job_match_score,
      matchResult: row.job_match_result,
      status: row.job_status
    },
    status: row.status,
    statusHistory: row.status_history || [],
    preparedMaterials: row.prepared_materials || undefined,
    targetSubmissionDate: row.target_submission_date || undefined,
    appliedDate: row.applied_date || undefined,
    salaryExpectation: row.salary_expectation || undefined,
    contactPerson: row.contact_person || undefined,
    interviews: row.interviews || [],
    createdAt: typeof row.created_at === 'string' ? row.created_at : new Date(row.created_at).toISOString(),
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : new Date(row.updated_at).toISOString()
  };
}

export const applicationsController = new Elysia({ prefix: '/applications' })
  .get('/', async () => {
    const rows = await sql`
      SELECT
        a.*,
        j.title as job_title,
        j.company as job_company,
        j.company_logo as job_company_logo,
        j.location as job_location,
        j.remote as job_remote,
        j.employment_type as job_employment_type,
        j.description as job_description,
        j.requirements as job_requirements,
        j.responsibilities as job_responsibilities,
        j.nice_to_have as job_nice_to_have,
        j.skills as job_skills,
        j.salary as job_salary,
        j.posted_at as job_posted_at,
        j.collected_at as job_collected_at,
        j.source_url as job_source_url,
        j.source_platform as job_source_platform,
        j.match_score as job_match_score,
        j.match_result as job_match_result,
        j.status as job_status
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      ORDER BY a.updated_at DESC
    `;

    return rows.map(mapRowToApplication);
  })
  .get('/:id', async ({ params, set }) => {
    const [row] = await sql`
      SELECT
        a.*,
        j.title as job_title,
        j.company as job_company,
        j.company_logo as job_company_logo,
        j.location as job_location,
        j.remote as job_remote,
        j.employment_type as job_employment_type,
        j.description as job_description,
        j.requirements as job_requirements,
        j.responsibilities as job_responsibilities,
        j.nice_to_have as job_nice_to_have,
        j.skills as job_skills,
        j.salary as job_salary,
        j.posted_at as job_posted_at,
        j.collected_at as job_collected_at,
        j.source_url as job_source_url,
        j.source_platform as job_source_platform,
        j.match_score as job_match_score,
        j.match_result as job_match_result,
        j.status as job_status
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ${params.id}
      LIMIT 1
    `;

    if (!row) {
      set.status = 404;
      return formatError('APPLICATION_NOT_FOUND', `Application with ID ${params.id} was not found.`);
    }

    return mapRowToApplication(row);
  })
  .post('/', async ({ body, set }) => {
    const payload = body as { jobId: string; status?: ApplicationStatus };
    const [job] = await sql`SELECT * FROM jobs WHERE id = ${payload.jobId} LIMIT 1`;
    if (!job) {
      set.status = 404;
      return formatError('JOB_NOT_FOUND', `Job with ID ${payload.jobId} was not found.`);
    }

    const appId = `app-${Date.now()}`;
    const initialStatus = payload.status || 'SAVED';
    const now = new Date().toISOString();
    const history = [{ id: `h-${Date.now()}`, status: initialStatus, timestamp: now, note: 'Application tracked' }];

    await sql`
      INSERT INTO applications (id, job_id, status, status_history, created_at, updated_at)
      VALUES (${appId}, ${payload.jobId}, ${initialStatus}, ${sql.json(history)}, NOW(), NOW())
    `;

    // Mark job as saved or applied
    await sql`UPDATE jobs SET status = 'saved' WHERE id = ${payload.jobId}`;

    const [created] = await sql`
      SELECT
        a.*,
        j.title as job_title,
        j.company as job_company,
        j.company_logo as job_company_logo,
        j.location as job_location,
        j.remote as job_remote,
        j.employment_type as job_employment_type,
        j.description as job_description,
        j.requirements as job_requirements,
        j.responsibilities as job_responsibilities,
        j.nice_to_have as job_nice_to_have,
        j.skills as job_skills,
        j.salary as job_salary,
        j.posted_at as job_posted_at,
        j.collected_at as job_collected_at,
        j.source_url as job_source_url,
        j.source_platform as job_source_platform,
        j.match_score as job_match_score,
        j.match_result as job_match_result,
        j.status as job_status
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ${appId}
      LIMIT 1
    `;

    return mapRowToApplication(created);
  })
  .patch('/:id', async ({ params, body, set }) => {
    const [existing] = await sql`SELECT * FROM applications WHERE id = ${params.id} LIMIT 1`;
    if (!existing) {
      set.status = 404;
      return formatError('APPLICATION_NOT_FOUND', `Application with ID ${params.id} was not found.`);
    }

    const payload = body as Partial<Application>;
    let updatedHistory = existing.status_history || [];

    if (payload.status && payload.status !== existing.status) {
      updatedHistory = [
        ...updatedHistory,
        {
          id: `h-${Date.now()}`,
          status: payload.status,
          timestamp: new Date().toISOString(),
          note: `Stage transition to ${payload.status}`
        }
      ];
    }

    await sql`
      UPDATE applications
      SET
        status = COALESCE(${payload.status || null}, status),
        status_history = ${sql.json(updatedHistory)},
        prepared_materials = COALESCE(${payload.preparedMaterials ? sql.json(payload.preparedMaterials) : null}, prepared_materials),
        target_submission_date = COALESCE(${payload.targetSubmissionDate || null}, target_submission_date),
        applied_date = COALESCE(${payload.appliedDate || null}, applied_date),
        salary_expectation = COALESCE(${payload.salaryExpectation || null}, salary_expectation),
        contact_person = COALESCE(${payload.contactPerson ? sql.json(payload.contactPerson) : null}, contact_person),
        interviews = COALESCE(${payload.interviews ? sql.json(payload.interviews) : null}, interviews),
        updated_at = NOW()
      WHERE id = ${params.id}
    `;

    const [updated] = await sql`
      SELECT
        a.*,
        j.title as job_title,
        j.company as job_company,
        j.company_logo as job_company_logo,
        j.location as job_location,
        j.remote as job_remote,
        j.employment_type as job_employment_type,
        j.description as job_description,
        j.requirements as job_requirements,
        j.responsibilities as job_responsibilities,
        j.nice_to_have as job_nice_to_have,
        j.skills as job_skills,
        j.salary as job_salary,
        j.posted_at as job_posted_at,
        j.collected_at as job_collected_at,
        j.source_url as job_source_url,
        j.source_platform as job_source_platform,
        j.match_score as job_match_score,
        j.match_result as job_match_result,
        j.status as job_status
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ${params.id}
      LIMIT 1
    `;

    return mapRowToApplication(updated);
  });