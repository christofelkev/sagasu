<script lang="ts">
  import { jobStore } from '$lib/stores/jobStore';
  import JobFilters from './JobFilters.svelte';
  import JobCard from './JobCard.svelte';
  import JobDetailModal from './JobDetailModal.svelte';
  import { SearchX, RefreshCw } from 'lucide-svelte';

  $: filteredJobs = $jobStore.filtered;
  $: selectedJobId = $jobStore.selectedJobId;
  $: selectedJob = $jobStore.find((j) => j.id === $selectedJobId);
</script>

<div class="job-discovery-view">
  <!-- Top Filter Bar -->
  <JobFilters />

  <!-- Results Count & Context -->
  <div class="results-header">
    <div class="results-meta">
      <span class="count-badge">{$filteredJobs.length}</span>
      <span class="count-text">Opportunities match your current discovery criteria</span>
    </div>
  </div>

  <!-- Job Cards List -->
  {#if $filteredJobs.length > 0}
    <div class="job-list-container">
      {#each $filteredJobs as job (job.id)}
        <JobCard {job} />
      {/each}
    </div>
  {:else}
    <div class="empty-state glass-panel">
      <SearchX size={36} class="empty-icon" />
      <h3 class="empty-title">No matching opportunities found</h3>
      <p class="empty-desc">
        Try lowering your minimum match score threshold, expanding remote/salary preferences, or syncing new job sources.
      </p>
      <div class="empty-actions">
        <button type="button" class="btn btn-secondary btn-sm" on:click={() => jobStore.resetFilters()}>
          Reset Filters
        </button>
        <button type="button" class="btn btn-primary btn-sm" on:click={() => jobStore.syncSources()}>
          <RefreshCw size={12} />
          <span>Sync Job Sources</span>
        </button>
      </div>
    </div>
  {/if}

  <!-- Detail Modal -->
  {#if selectedJob}
    <JobDetailModal
      job={selectedJob}
      onClose={() => jobStore.selectJob(null)}
    />
  {/if}
</div>

<style>
  .job-discovery-view {
    max-width: 1040px;
    margin: 0 auto;
  }

  .results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding: 0 2px;
  }

  .results-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.78rem;
    color: var(--text-secondary);
  }

  .count-badge {
    background: var(--bg-surface-raised);
    color: var(--text-primary);
    border: 1px solid var(--border-subtle);
    padding: 1px 7px;
    border-radius: var(--radius-full);
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 0.74rem;
  }

  .job-list-container {
    display: flex;
    flex-direction: column;
  }

  .empty-state {
    padding: 50px 24px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-top: 16px;
    background: var(--bg-surface);
  }

  :global(.empty-icon) {
    color: var(--text-muted);
    opacity: 0.6;
  }

  .empty-title {
    font-size: 1.05rem;
    color: var(--text-primary);
  }

  .empty-desc {
    font-size: 0.8rem;
    color: var(--text-muted);
    max-width: 400px;
    line-height: 1.45;
  }

  .empty-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
  }
</style>
