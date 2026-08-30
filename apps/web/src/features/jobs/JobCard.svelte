<script lang="ts">
  import type { Job } from '@sagasu/api-contract';
  import { jobStore } from '$lib/stores/jobStore';
  import {
    Bookmark,
    Layers
  } from 'lucide-svelte';

  export let job: Job;
  export let isSelected = false;

  $: isSaved = job.status === 'saved';
  $: dedupCount = job.deduplicationSources?.length || 1;

  function getMonogram(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  function formatSalary(j: Job) {
    if (!j.salary) return null;
    const { min, max, currency, period } = j.salary;
    const perLabel = period === 'month' ? '/mo' : period === 'year' ? '/yr' : '';
    if (currency === 'IDR') {
      const minM = min ? (min / 1000000).toFixed(0) : '';
      const maxM = max ? (max / 1000000).toFixed(0) : '';
      if (minM && maxM) return `Rp ${minM}M–${maxM}M ${perLabel}`;
      if (minM) return `From Rp ${minM}M ${perLabel}`;
      if (maxM) return `Up to Rp ${maxM}M ${perLabel}`;
    }
    return `${currency} ${min?.toLocaleString() || ''} ${perLabel}`;
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="job-item {isSelected ? 'selected' : ''}"
  on:click={() => jobStore.selectJob(job.id)}
>
  <div class="item-header">
    <div class="header-left">
      <div class="company-monogram">
        <span>{getMonogram(job.company)}</span>
      </div>
      <div class="title-meta">
        <h4 class="job-title">{job.title}</h4>
        <div class="sub-meta">
          <span class="company-name">{job.company}</span>
          <span class="dot">•</span>
          <span class="location-txt">{job.location}</span>
          {#if job.remote}
            <span class="badge-mini badge-emerald">Remote</span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Match Badge -->
    <div class="score-pill {job.matchScore >= 80 ? 'score-high' : 'score-mid'}">
      <span>{job.matchScore}%</span>
    </div>
  </div>

  <!-- Meta Row: Salary, Source & Top Matched Skills -->
  <div class="item-footer">
    <div class="footer-left">
      {#if formatSalary(job)}
        <span class="salary-tag">{formatSalary(job)}</span>
      {/if}
      <span class="source-tag">{job.sourcePlatform}</span>
      {#if dedupCount > 1}
        <span class="dedup-tag">
          <Layers size={10} />
          {dedupCount}
        </span>
      {/if}
    </div>

    <!-- Quick Bookmark Action -->
    <button
      type="button"
      class="bookmark-btn {isSaved ? 'saved' : ''}"
      on:click|stopPropagation={() => isSaved ? jobStore.updateJobStatus(job.id, 'new') : jobStore.saveJob(job.id)}
      title={isSaved ? 'Remove from saved' : 'Save job'}
      aria-label="Bookmark"
    >
      <Bookmark size={13} fill={isSaved ? 'currentColor' : 'none'} />
    </button>
  </div>
</div>

<style>
  .job-item {
    padding: 10px 12px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: all var(--transition-fast);
  }

  .job-item:hover {
    border-color: var(--border-strong);
    background: var(--bg-surface-raised);
  }

  .job-item.selected {
    border-color: var(--accent-primary);
    background: var(--bg-surface-raised);
    box-shadow: 0 0 0 1px var(--accent-primary);
  }

  .item-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .company-monogram {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-xs);
    background: var(--bg-surface-raised);
    border: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    font-weight: 700;
    font-family: var(--font-mono);
    color: var(--accent-primary);
    flex-shrink: 0;
  }

  .title-meta {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .job-title {
    font-size: 0.84rem;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
  }

  .sub-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  .company-name {
    color: var(--text-secondary);
    font-weight: 500;
  }

  .dot {
    color: var(--text-faint);
  }

  .location-txt {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 130px;
  }

  .badge-mini {
    padding: 1px 4px;
    font-size: 0.64rem;
    border-radius: 2px;
    line-height: 1.2;
  }

  .score-pill {
    padding: 2px 6px;
    border-radius: var(--radius-xs);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .score-high {
    background: var(--accent-emerald-subtle);
    color: var(--accent-emerald);
    border: 1px solid var(--accent-emerald-border);
  }

  .score-mid {
    background: var(--bg-input);
    color: var(--text-secondary);
    border: 1px solid var(--border-subtle);
  }

  .item-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-top: 4px;
    border-top: 1px solid var(--border-faint);
  }

  .footer-left {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.7rem;
    flex-wrap: wrap;
  }

  .salary-tag {
    color: var(--accent-emerald);
    font-weight: 600;
    font-family: var(--font-mono);
  }

  .source-tag {
    color: var(--text-faint);
  }

  .dedup-tag {
    display: flex;
    align-items: center;
    gap: 3px;
    color: var(--text-secondary);
    background: var(--bg-surface-raised);
    padding: 1px 6px;
    border-radius: var(--radius-xs);
    border: 1px solid var(--border-subtle);
    font-size: 0.7rem;
  }

  .bookmark-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    transition: color var(--transition-fast);
  }
  .bookmark-btn:hover {
    color: var(--text-primary);
  }
  .bookmark-btn.saved {
    color: var(--accent-amber);
  }
</style>
