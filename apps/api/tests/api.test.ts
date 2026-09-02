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

  it('GET /api/v1/jobs returns indexed jobs and total count', async () => {
    const res = await app.handle(new Request('http://localhost:3001/api/v1/jobs'));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeGreaterThanOrEqual(1);
    expect(body.total).toBeGreaterThanOrEqual(1);

    const job = body.items[0];
    expect(job).toHaveProperty('id');
    expect(job).toHaveProperty('title');
    expect(job).toHaveProperty('company');
    expect(job).toHaveProperty('matchScore');
    expect(job).toHaveProperty('matchResult');
  });

  it('POST /api/v1/jobs/:id/save bookmarks a job', async () => {
    const res = await app.handle(
      new Request('http://localhost:3001/api/v1/jobs/job-001/save', { method: 'POST' })
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.id).toBe('job-001');
    expect(body.status).toBe('saved');
  });

  it('GET /api/v1/profile returns candidate profile and verified skills', async () => {
    const res = await app.handle(new Request('http://localhost:3001/api/v1/profile'));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.personal.name).toBe('Raden Manopo');
    expect(Array.isArray(body.skills)).toBe(true);
    expect(body.skills.length).toBeGreaterThanOrEqual(5);
  });

  it('GET /api/v1/applications returns Kanban pipeline applications', async () => {
    const res = await app.handle(new Request('http://localhost:3001/api/v1/applications'));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(1);
    expect(body[0]).toHaveProperty('job');
    expect(body[0]).toHaveProperty('status');
  });

  it('GET /api/v1/preferences returns collector and search preferences', async () => {
    const res = await app.handle(new Request('http://localhost:3001/api/v1/preferences'));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body.desiredRoles)).toBe(true);
    expect(Array.isArray(body.enabledSources)).toBe(true);
    expect(body.minSalaryMonthlyIDR).toBeGreaterThan(0);
  });
});