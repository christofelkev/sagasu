import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { seedJobs, seedProfile, seedApplications, seedPreferences } from './seedData';

function resolveDatabaseHost(): string {
  if (process.env.DB_HOST) return process.env.DB_HOST;
  if (process.platform === 'win32') {
    try {
      const wslIp = execSync('wsl hostname -I', { encoding: 'utf8' }).trim().split(' ')[0];
      if (wslIp) return wslIp;
    } catch {}
  }
  return '127.0.0.1';
}

const host = resolveDatabaseHost();
const user = process.env.DB_USER || 'sagasu';
const password = process.env.DB_PASSWORD || 'sagasu';
const database = process.env.DB_NAME || 'sagasu';
const port = parseInt(process.env.DB_PORT || '5432', 10);

export const connectionString =
  process.env.DATABASE_URL || `postgres://${user}:${password}@${host}:${port}/${database}`;

export const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 5
});

export async function initializeDatabase() {
  console.log(`Connecting to PostgreSQL at ${host}:${port}/${database}...`);
  try {
    const schemaPath = path.resolve(import.meta.dir, 'schema.sql');
    const ddl = fs.readFileSync(schemaPath, 'utf8');
    await sql.unsafe(ddl);
    console.log('PostgreSQL schema applied successfully.');

    // Seed Profile if missing
    const existingProfile = await sql`SELECT id FROM user_profiles WHERE id = ${seedProfile.id} LIMIT 1`;
    if (existingProfile.length === 0) {
      console.log('Seeding candidate profile and verified skills...');
      await sql`
        INSERT INTO user_profiles (id, personal, career, experiences, educations, resumes)
        VALUES (
          ${seedProfile.id},
          ${sql.json(seedProfile.personal)},
          ${sql.json(seedProfile.career)},
          ${sql.json(seedProfile.experiences)},
          ${sql.json(seedProfile.educations)},
          ${sql.json(seedProfile.resumes)}
        )
      `;

      for (const skill of seedProfile.skills) {
        await sql`
          INSERT INTO profile_skills (id, profile_id, name, category, level, years_of_experience)
          VALUES (
            ${skill.id},
            ${seedProfile.id},
            ${skill.name},
            ${skill.category},
            ${skill.level},
            ${skill.yearsOfExperience}
          )
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }

    // Jobs and Applications start empty for user-driven discovery sync
    console.log('Database ready. Jobs & application tracking pipeline active.');

    // Seed Preferences if missing
    const existingPref = await sql`SELECT id FROM preferences WHERE id = 'default' LIMIT 1`;
    if (existingPref.length === 0) {
      await sql`
        INSERT INTO preferences (id, payload)
        VALUES ('default', ${sql.json(seedPreferences)})
      `;
    }

    console.log('Database initialization & seeding complete.');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}
