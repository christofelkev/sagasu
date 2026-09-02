import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { initializeDatabase } from './infrastructure/database/db';
import { healthController } from './modules/health/health.controller';
import { jobsController } from './modules/jobs/jobs.controller';
import { profileController } from './modules/profile/profile.controller';
import { applicationsController } from './modules/applications/applications.controller';
import { preferencesController } from './modules/preferences/preferences.controller';

const PORT = parseInt(process.env.PORT || '3001', 10);

// Initialize DB schema & seeds on boot
await initializeDatabase();

export const app = new Elysia()
  .use(
    cors({
      origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    })
  )
  .use(
    swagger({
      path: '/swagger',
      documentation: {
        info: {
          title: 'SAGASU (探す) API',
          version: '1.0.0',
          description: 'AI-assisted job discovery, deterministic multi-factor matching, and application tracking pipeline.'
        },
        tags: [
          { name: 'health', description: 'System health check' },
          { name: 'jobs', description: 'Job discovery & indexing' },
          { name: 'profile', description: 'Candidate profile & verified skills matrix' },
          { name: 'applications', description: 'Application Kanban pipeline & materials' },
          { name: 'preferences', description: 'Search keywords & collector settings' }
        ]
      }
    })
  )
  .group('/api/v1', (app) =>
    app
      .use(healthController)
      .use(jobsController)
      .use(profileController)
      .use(applicationsController)
      .use(preferencesController)
  )
  .listen(PORT);

console.log(`🦊 SAGASU API is running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`📖 Swagger documentation: http://localhost:${PORT}/swagger`);