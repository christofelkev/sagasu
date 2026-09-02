import { Elysia } from 'elysia';
import { sql } from '../../infrastructure/database/db';
import { seedPreferences } from '../../infrastructure/database/seedData';
import type { JobPreferences } from '@sagasu/api-contract';

export const preferencesController = new Elysia({ prefix: '/preferences' })
  .get('/', async () => {
    const [row] = await sql`SELECT payload FROM preferences WHERE id = 'default' LIMIT 1`;
    if (!row) {
      return seedPreferences;
    }
    return row.payload as JobPreferences;
  })
  .put('/', async ({ body }) => {
    const payload = body as JobPreferences;
    await sql`
      INSERT INTO preferences (id, payload, updated_at)
      VALUES ('default', ${sql.json(payload)}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        payload = EXCLUDED.payload,
        updated_at = NOW()
    `;
    return payload;
  });