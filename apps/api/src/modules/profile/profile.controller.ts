import { Elysia, t } from 'elysia';
import { sql } from '../../infrastructure/database/db';
import { formatError } from '../../infrastructure/http/error-handler';
import type { UserProfile, ProfileSkill } from '@sagasu/api-contract';

async function getFullProfile(): Promise<UserProfile | null> {
  const [profileRow] = await sql`SELECT * FROM user_profiles LIMIT 1`;
  if (!profileRow) return null;

  const skillsRows = await sql`
    SELECT id, name, category, level, years_of_experience as "yearsOfExperience"
    FROM profile_skills
    WHERE profile_id = ${profileRow.id}
    ORDER BY years_of_experience DESC, name ASC
  `;

  return {
    id: profileRow.id,
    personal: profileRow.personal,
    career: profileRow.career,
    skills: skillsRows as unknown as ProfileSkill[],
    experiences: profileRow.experiences || [],
    educations: profileRow.educations || [],
    resumes: profileRow.resumes || [],
    updatedAt: typeof profileRow.updated_at === 'string' ? profileRow.updated_at : new Date(profileRow.updated_at).toISOString()
  };
}

export const profileController = new Elysia({ prefix: '/profile' })
  .get('/', async ({ set }) => {
    const profile = await getFullProfile();
    if (!profile) {
      set.status = 404;
      return formatError('PROFILE_NOT_FOUND', 'Candidate profile has not been initialized.');
    }
    return profile;
  })
  .put('/', async ({ body, set }) => {
    const data = body as Partial<UserProfile>;
    const [existing] = await sql`SELECT id FROM user_profiles LIMIT 1`;
    if (!existing) {
      set.status = 404;
      return formatError('PROFILE_NOT_FOUND', 'Candidate profile has not been initialized.');
    }

    await sql`
      UPDATE user_profiles
      SET
        personal = COALESCE(${data.personal ? sql.json(data.personal) : sql.literal('NULL')}, personal),
        career = COALESCE(${data.career ? sql.json(data.career) : sql.literal('NULL')}, career),
        experiences = COALESCE(${data.experiences ? sql.json(data.experiences) : sql.literal('NULL')}, experiences),
        educations = COALESCE(${data.educations ? sql.json(data.educations) : sql.literal('NULL')}, educations),
        resumes = COALESCE(${data.resumes ? sql.json(data.resumes) : sql.literal('NULL')}, resumes),
        updated_at = NOW()
      WHERE id = ${existing.id}
    `;

    return await getFullProfile();
  })
  .post('/skills', async ({ body, set }) => {
    const skill = body as Omit<ProfileSkill, 'id'> & { id?: string };
    const [existing] = await sql`SELECT id FROM user_profiles LIMIT 1`;
    if (!existing) {
      set.status = 404;
      return formatError('PROFILE_NOT_FOUND', 'Candidate profile not found.');
    }

    const skillId = skill.id || `sk-${Date.now()}`;
    await sql`
      INSERT INTO profile_skills (id, profile_id, name, category, level, years_of_experience)
      VALUES (${skillId}, ${existing.id}, ${skill.name}, ${skill.category}, ${skill.level}, ${skill.yearsOfExperience || 1})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        level = EXCLUDED.level,
        years_of_experience = EXCLUDED.years_of_experience
    `;

    return await getFullProfile();
  })
  .delete('/skills/:id', async ({ params, set }) => {
    await sql`DELETE FROM profile_skills WHERE id = ${params.id}`;
    return await getFullProfile();
  })
  .post('/cv', async ({ body, set }) => {
    const payload = body as { fileName?: string; parsedSummary?: string };
    const [existing] = await sql`SELECT id, resumes FROM user_profiles LIMIT 1`;
    if (!existing) {
      set.status = 404;
      return formatError('PROFILE_NOT_FOUND', 'Candidate profile not found.');
    }

    const newResume = {
      id: `res-${Date.now()}`,
      fileName: payload.fileName || 'Uploaded_Resume.pdf',
      uploadedAt: new Date().toISOString(),
      fileSize: 350000,
      isCanonical: true,
      parsedSummary: payload.parsedSummary || 'Extracted verified technical qualifications from CV.'
    };

    const updatedResumes = [newResume, ...(existing.resumes || []).map((r: any) => ({ ...r, isCanonical: false }))];

    await sql`
      UPDATE user_profiles
      SET resumes = ${sql.json(updatedResumes)}, updated_at = NOW()
      WHERE id = ${existing.id}
    `;

    return {
      message: 'CV uploaded and profile updated successfully.',
      resume: newResume
    };
  });