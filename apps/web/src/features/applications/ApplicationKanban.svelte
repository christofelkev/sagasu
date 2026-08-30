<script lang="ts">
  import { applicationStore } from '$lib/stores/applicationStore';
  import type { Application, ApplicationStatus } from '@sagasu/api-contract';
  import MatchScoreBadge from '../jobs/MatchScoreBadge.svelte';
  import ApplicationTimelineModal from './ApplicationTimelineModal.svelte';
  import {
    Sparkles,
    Clock,
    ChevronRight,
    MapPin,
    Calendar
  } from 'lucide-svelte';

  const columns: { id: ApplicationStatus; title: string; color: string }[] = [
    { id: 'SAVED', title: 'Saved', color: 'badge-neutral' },
    { id: 'PREPARING', title: 'Preparing', color: 'badge-amber' },
    { id: 'APPLIED', title: 'Applied', color: 'badge-cyan' },
    { id: 'INTERVIEW', title: 'Interview', color: 'badge-purple' },
    { id: 'OFFER', title: 'Offer', color: 'badge-emerald' }
  ];

  let selectedTimelineApp: Application | null = null;

  $: apps = $applicationStore;

  function getMonogram(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  function getAppsByStatus(status: ApplicationStatus) {
    return apps.filter((a) => a.status === status);
  }

  function getNextStatus(current: ApplicationStatus): ApplicationStatus | null {
    switch (current) {
      case 'SAVED': return 'PREPARING';
      case 'PREPARING': return 'APPLIED';
      case 'APPLIED': return 'INTERVIEW';
      case 'INTERVIEW': return 'OFFER';
      default: return null;
    }
  }
</script>

<div class="kanban-view">
  <!-- Kanban Header -->
  <div class="kanban-header">
    <div>
      <h2 class="page-title">Application Pipeline</h2>
      <p class="page-sub">
        Track progress across each stage of your active applications.
      </p>
    </div>
  </div>

  <!-- Kanban Board Columns -->
  <div class="kanban-board">
    {#each columns as col}
      {@const colApps = getAppsByStatus(col.id)}
      <div class="kanban-column">
        <!-- Column Header -->
        <div class="column-header">
          <div class="col-title-group">
            <span class="col-dot {col.color}"></span>
            <span class="col-name">{col.title}</span>
          </div>
          <span class="col-count">{colApps.length}</span>
        </div>

        <!-- Cards Lane -->
        <div class="cards-lane">
          {#if colApps.length > 0}
            {#each colApps as app (app.id)}
              {@const job = app.job}
              {@const nextStatus = getNextStatus(app.status)}
              <div class="app-card">
                <!-- Top Row -->
                <div class="app-card-top">
                  <div class="company-monogram">
                    <span>{getMonogram(job.company)}</span>
                  </div>
                  <div class="app-info">
                    <h4 class="app-job-title">{job.title}</h4>
                    <span class="app-company">{job.company}</span>
                  </div>
                  <MatchScoreBadge score={job.matchScore} size="sm" />
                </div>

                <!-- Meta Details -->
                <div class="app-meta">
                  <span class="app-location">
                    <MapPin size={10} /> {job.location}
                  </span>
                  {#if app.appliedDate}
                    <span class="app-date">
                      <Calendar size={10} /> {app.appliedDate}
                    </span>
                  {/if}
                </div>

                <!-- Interview callout -->
                {#if app.interviews && app.interviews.length > 0}
                  <div class="interview-callout">
                    <Calendar size={11} />
                    <span>{app.interviews[0].round}</span>
                  </div>
                {/if}

                <!-- Action Bar -->
                <div class="app-actions">
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm btn-icon"
                    title="Audit History"
                    on:click={() => (selectedTimelineApp = app)}
                  >
                    <Clock size={12} />
                  </button>

                  {#if app.status === 'SAVED' || app.status === 'PREPARING'}
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm prep-btn"
                      on:click={() => applicationStore.openStudioForJob(job)}
                    >
                      <Sparkles size={11} />
                      <span>Studio</span>
                    </button>
                  {/if}

                  {#if nextStatus}
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm next-btn"
                      on:click={() => applicationStore.updateStatus(app.id, nextStatus)}
                    >
                      <span>Advance</span>
                      <ChevronRight size={11} />
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          {:else}
            <div class="empty-lane">
              <span class="empty-lane-text">Empty column</span>
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <!-- Timeline Audit Modal -->
  {#if selectedTimelineApp}
    <ApplicationTimelineModal
      application={selectedTimelineApp}
      onClose={() => (selectedTimelineApp = null)}
    />
  {/if}
</div>

<style>
  .kanban-view {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
  }

  .kanban-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .page-title {
    font-size: 1.15rem;
    color: var(--text-primary);
  }

  .page-sub {
    font-size: 0.76rem;
    color: var(--text-muted);
  }

  .kanban-board {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 12px;
    min-height: calc(100vh - 200px);
  }

  .kanban-column {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 230px;
  }

  .column-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
  }

  .col-title-group {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .col-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .col-dot.badge-neutral { background: var(--text-muted); }
  .col-dot.badge-amber { background: var(--accent-amber); }
  .col-dot.badge-cyan { background: var(--accent-cyan); }
  .col-dot.badge-purple { background: var(--accent-purple); }
  .col-dot.badge-emerald { background: var(--accent-emerald); }

  .col-name {
    font-size: 0.76rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .col-count {
    font-size: 0.68rem;
    font-family: var(--font-mono);
    color: var(--text-muted);
    background: var(--bg-surface-raised);
    padding: 1px 5px;
    border-radius: var(--radius-xs);
    border: 1px solid var(--border-subtle);
  }

  .cards-lane {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }

  .app-card {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
  }

  .app-card:hover {
    border-color: var(--border-strong);
    background: var(--bg-surface-raised);
  }

  .app-card-top {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .company-monogram {
    width: 28px;
    height: 28px;
    background: var(--bg-surface-raised);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xs);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--accent-primary);
    flex-shrink: 0;
  }

  .app-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .app-job-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.25;
  }

  .app-company {
    font-size: 0.7rem;
    color: var(--text-secondary);
  }

  .app-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.68rem;
    color: var(--text-muted);
  }

  .app-location, .app-date {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .interview-callout {
    background: var(--accent-purple-subtle);
    border: 1px solid var(--accent-purple-border);
    padding: 3px 6px;
    border-radius: var(--radius-xs);
    font-size: 0.68rem;
    color: var(--accent-purple);
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
  }

  .app-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    padding-top: 6px;
    border-top: 1px solid var(--border-faint);
  }

  .next-btn, .prep-btn {
    font-size: 0.7rem;
    padding: 2px 6px;
  }

  .empty-lane {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80px;
    border: 1px dashed var(--border-faint);
    border-radius: var(--radius-sm);
  }

  .empty-lane-text {
    font-size: 0.72rem;
    color: var(--text-faint);
  }

  @media (max-width: 1200px) {
    .kanban-board {
      grid-template-columns: repeat(5, 230px);
    }
  }
</style>
