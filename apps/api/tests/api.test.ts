import { describe, it, expect } from 'bun:test';
import { app } from '../src/server';

describe('SAGASU Backend API (/api/v1)', () => {
  it('GET /api/v1/health returns healthy status and connected database', async () => {
    const res = await app.handle(new Request('http://localhost:3001/api/v1/health'));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('healthy');
    expect(body.database).toBe('connected');
    expect(body.service).toBe('SAGASU API');
  });

  it('GET /api/v1/jobs returns initial clean list', async () => {
    const res = await app.handle(new Request('http://localhost:3001/api/v1/jobs'));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body).toHaveProperty('total');
  });

  it('POST /api/v1/jobs/sync discovers and indexes real jobs into PostgreSQL', async () => {
    const res = await app.handle(
      new Request('http://localhost:3001/api/v1/jobs/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limitPerSource: 2 })
      })
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.totalDiscovered).toBeGreaterThanOrEqual(1);
    expect(body.newIndexed + body.deduplicatedCount).toBeGreaterThanOrEqual(1);

    // Verify jobs feed now has the newly indexed opportunities
    const feedRes = await app.handle(new Request('http://localhost:3001/api/v1/jobs'));
    const feedBody = await feedRes.json();
    expect(feedBody.items.length).toBeGreaterThanOrEqual(1);

    // Test bookmark on the first discovered job
    const firstJob = feedBody.items[0];
    const saveRes = await app.handle(
      new Request(`http://localhost:3001/api/v1/jobs/${firstJob.id}/save`, { method: 'POST' })
    );
    expect(saveRes.status).toBe(200);
    const savedBody = await saveRes.json();
    expect(savedBody.id).toBe(firstJob.id);
    expect(savedBody.status).toBe('saved');
  });

  it('GET /api/v1/profile returns candidate profile and verified skills', async () => {
    const res = await app.handle(new Request('http://localhost:3001/api/v1/profile'));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.personal.name).toBe('Raden Manopo');
    expect(Array.isArray(body.skills)).toBe(true);
    expect(body.skills.length).toBeGreaterThanOrEqual(5);
  });

  it('GET /api/v1/applications returns Kanban pipeline', async () => {
    const res = await app.handle(new Request('http://localhost:3001/api/v1/applications'));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET /api/v1/preferences returns collector and search preferences', async () => {
    const res = await app.handle(new Request('http://localhost:3001/api/v1/preferences'));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body.desiredRoles)).toBe(true);
    expect(body.minSalaryMonthlyIDR).toBeGreaterThan(0);
  });
});