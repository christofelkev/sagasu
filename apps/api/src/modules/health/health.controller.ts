import { Elysia } from 'elysia';
import { sql } from '../../infrastructure/database/db';

export const healthController = new Elysia({ prefix: '/health' })
  .get('/', async () => {
    let dbStatus = 'disconnected';
    try {
      const [res] = await sql`SELECT 1 as ok`;
      if (res && res.ok === 1) {
        dbStatus = 'connected';
      }
    } catch (err) {
      dbStatus = 'error';
    }

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'SAGASU API',
      database: dbStatus
    };
  });