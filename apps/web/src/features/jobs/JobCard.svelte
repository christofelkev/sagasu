<script lang="ts">
  import type { Job } from '@sagasu/api-contract';
  import { jobStore } from '$lib/stores/jobStore';
  import { applicationStore } from '$lib/stores/applicationStore';
  import MatchScoreBadge from './MatchScoreBadge.svelte';
  import {
    MapPin,
    Bookmark,
    Sparkles,
    Check,
    X,
    ExternalLink,
    Layers,
    Bot
  } from 'lucide-svelte';

  export let job: Job;

  $: isSaved = job.status === 'saved';
  $: matchedSkills = job.matchResult?.factors?.skills?.matched || [];
  $: missingSkills = job.matchResult?.factors?.skills?.missing || [];
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
    const perLabel = period === 'month' ? '/ mo' : period === 'year' ? '/ yr' : '';
    if (currency === 'IDR') {
      const minM = min ? (min / 1000000).toFixed(0) : '';
      const maxM = max ? (max / 1000000).toFixed(0) : '';
      if (minM && maxM) return `Rp ${minM}M – ${maxM}M ${perLabel}`;
      if (minM) return `From Rp ${minM}M ${perLabel}`;
      if (maxM) return `Up to Rp ${maxM}M ${perLabel}`;
    }
    return `${currency} ${min?.toLocaleString() || ''} – ${max?.toLocaleString() || ''} ${perLabel}`;
  }
</script>

<div class="job-card glass-panel {job.matchScore >= 85 ? 'card-high-match' : ''}">
  <!-- Top Header Row -->
  <div class="card-header">
    <div class="company-group">
      <div class="company-monogram">
        <span>{getMonogram(job.company)}</span>
      </div>
      <div class="title-col">
        <button
          type="button"
          class="job-title-btn"
          on:click={() => jobStore.selectJob(job.id)}
        >
          {job.title}
        </button>
        <div class="company-meta">
          <span class="company-name">{job.company}</span>
          <span class="dot-sep">•</span>
          <span class="location-txt">
            <MapPin size={11} />
            {job.location}
          </span>
          {#if job.remote}
            <span class="badge badge-emerald">Remote</span>
          {/if}
          <span class="badge badge-neutral">{job.employmentType}</span>
        </div>
      </div>
    </div>

    <!-- Match Score -->
    <div class="score-container">
      <MatchScoreBadge score={job.matchScore} size="md" />
    </div>
  </div>

  <!-- Salary & Sources Meta Row -->
  <div class="meta-row">
    {#if formatSalary(job)}
      <div class="salary-pill">
        <span class="salary-text">{formatSalary(job)}</span>
      </div>
    {/if}

    <div class="source-info">
      <span class="source-tag">Via {job.sourcePlatform}</span>
      {#if dedupCount > 1}
        <span class="dedup-tag" title="Aggregated from multiple external sources">
          <Layers size={11} />
          {dedupCount} sources
        </span>
      {/if}
    </div>
  </div>

  <!-- Matched & Missing Skills Chips -->
  <div class="skills-row">
    <div class="skills-list">
      {#each matchedSkills.slice(0, 5) as skill}
        <span class="skill-pill matched">
          <Check size={10} /> {skill}
        </span>
      {/each}
      {#each missingSkills.slice(0, 2) as skill}
        <span class="skill-pill missing">
          <X size={10} /> {skill}
        </span>
      {/each}
      {#if job.skills.length > 7}
        <span class="more-skills-txt">+{job.skills.length - 7} more</span>
      {/if}
    </div>
  </div>

  <!-- Grounded AI Fit Summary -->
  {#if job.matchResult?.aiAnalysis}
    <div class="ai-summary-callout">
      <Bot size={13} class="ai-bot-ic" />
      <span class="ai-fit-txt">{job.matchResult.aiAnalysis.fitSummary}</span>
    </div>
  {/if}

  <!-- Footer Actions -->
  <div class="card-footer">
    <div class="actions-left">
      <button
        type="button"
        class="btn btn-secondary btn-sm"
        on:click={() => jobStore.selectJob(job.id)}
      >
        <span>Match Breakdown</span>
      </button>
      <a
        href={job.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-ghost btn-sm ext-link"
      >
        <span>Source</span>
        <ExternalLink size={11} />
      </a>
    </div>

    <div class="actions-right">
      <button
        type="button"
        class="btn btn-ghost btn-sm save-btn {isSaved ? 'is-saved' : ''}"
        on:click={() => jobStore.saveJob(job.id)}
        title={isSaved ? 'Saved to bookmarks' : 'Save opportunity'}
      >
        <Bookmark size={13} class={isSaved ? 'icon-filled' : ''} />
        <span>{isSaved ? 'Saved' : 'Save'}</span>
      </button>

      <button
        type="button"
        class="btn btn-emerald btn-sm"
        on:click={() => applicationStore.openStudioForJob(job)}
      >
        <Sparkles size={12} />
        <span>Prepare Application</span>
      </button>
    </div>
  </div>
</div>

<style>
  .job-card {
    padding: 16px 18px;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

  .job-card:hover {
    border-color: var(--border-strong);
    background: var(--bg-surface-raised);
  }

  .card-high-match {
    border-left: 3px solid var(--accent-emerald);
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .company-group {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
  }

  .company-monogram {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 0.82rem;
    color: var(--text-primary);
    letter-spacing: 0.05em;
    flex-shrink: 0;
  }

  .title-col {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .job-title-btn {
    background: transparent;
    border: none;
    padding: 0;
    text-align: left;
    font-family: var(--font-sans);
    font-size: 0.98rem;
    font-weight: 600;
    color: var(--text-primary);
    cursor: pointer;
    line-height: 1.3;
    transition: opacity var(--transition-fast);
  }
  .job-title-btn:hover {
    opacity: 0.8;
  }

  .company-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 0.76rem;
    color: var(--text-secondary);
  }

  .company-name {
    font-weight: 500;
    color: var(--text-primary);
  }

  .location-txt {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .dot-sep {
    color: var(--border-subtle);
  }

  .score-container {
    display: flex;
    align-items: center;
  }

  .meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }

  .salary-pill {
    background: var(--accent-emerald-subtle);
    border: 1px solid var(--accent-emerald-border);
    padding: 2px 7px;
    border-radius: var(--radius-xs);
  }

  .salary-text {
    color: #34d399;
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 0.76rem;
  }

  .source-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  .source-tag {
    background: var(--bg-input);
    border: 1px solid var(--border-faint);
    padding: 1px 6px;
    border-radius: var(--radius-xs);
  }

  .dedup-tag {
    display: flex;
    align-items: center;
    gap: 3px;
    color: var(--text-secondary);
    background: var(--bg-input);
    padding: 1px 6px;
    border-radius: var(--radius-xs);
    border: 1px solid var(--border-faint);
    font-size: 0.7rem;
  }

  .skills-row {
    display: flex;
    align-items: center;
  }

  .skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
  }

  .skill-pill {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 6px;
    border-radius: var(--radius-xs);
    font-size: 0.7rem;
    font-weight: 500;
  }

  .skill-pill.matched {
    background: var(--accent-emerald-subtle);
    color: #34d399;
    border: 1px solid var(--accent-emerald-border);
  }

  .skill-pill.missing {
    background: var(--accent-rose-subtle);
    color: #fb7185;
    border: 1px solid var(--accent-rose-border);
  }

  .more-skills-txt {
    font-size: 0.68rem;
    color: var(--text-muted);
  }

  .ai-summary-callout {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    background: var(--bg-input);
    border: 1px solid var(--border-faint);
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    font-size: 0.76rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  :global(.ai-bot-ic) {
    color: var(--text-muted);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 1px solid var(--border-faint);
    gap: 10px;
  }

  .actions-left, .actions-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .save-btn.is-saved {
    color: #fbbf24;
  }

  :global(.icon-filled) {
    fill: currentColor;
  }

  @media (max-width: 640px) {
    .card-footer {
      flex-direction: column;
      align-items: stretch;
    }
    .actions-left, .actions-right {
      justify-content: space-between;
    }
  }
</style>
