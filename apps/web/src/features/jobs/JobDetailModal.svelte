<script lang="ts">
  import type { Job } from '@sagasu/api-contract';
  import { jobStore } from '$lib/stores/jobStore';
  import { applicationStore } from '$lib/stores/applicationStore';
  import MatchBreakdownCard from './MatchBreakdownCard.svelte';
  import {
    X,
    ExternalLink,
    Bookmark,
    Sparkles,
    MapPin,
    Calendar,
    DollarSign,
    Layers,
    FileText,
    Activity
  } from 'lucide-svelte';

  export let job: Job;
  export let onClose: () => void;

  let activeTab: 'match' | 'description' = 'match';

  $: isSaved = job.status === 'saved';

  function getMonogram(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  function formatSalary(j: Job) {
    if (!j.salary) return 'Market Rate / Competitive';
    const { min, max, currency, period } = j.salary;
    const perLabel = period === 'month' ? '/ mo' : '/ yr';
    if (currency === 'IDR') {
      return `Rp ${(min || 0) / 1000000}M – ${(max || 0) / 1000000}M ${perLabel}`;
    }
    return `${currency} ${min?.toLocaleString()} – ${max?.toLocaleString()} ${perLabel}`;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-backdrop" on:click={onClose}>
  <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
    <!-- Modal Header -->
    <div class="modal-header">
      <div class="header-left">
        <div class="company-monogram-box">
          <span>{getMonogram(job.company)}</span>
        </div>
        <div class="header-info">
          <h2 class="modal-job-title">{job.title}</h2>
          <div class="company-subline">
            <span class="comp-name">{job.company}</span>
            <span class="sep">•</span>
            <span class="loc"><MapPin size={11} /> {job.location}</span>
            {#if job.remote}
              <span class="badge badge-emerald">Remote</span>
            {/if}
            <span class="badge badge-neutral">{job.employmentType}</span>
          </div>
        </div>
      </div>

      <button type="button" class="modal-close-btn" on:click={onClose} aria-label="Close modal">
        <X size={16} />
      </button>
    </div>

    <!-- Quick Meta Bar -->
    <div class="quick-meta-bar">
      <div class="meta-cell">
        <DollarSign size={13} class="meta-ic" />
        <span class="meta-txt">{formatSalary(job)}</span>
      </div>
      <div class="meta-cell">
        <Calendar size={13} class="meta-ic" />
        <span class="meta-txt">Posted {new Date(job.postedAt).toLocaleDateString()}</span>
      </div>
      <div class="meta-cell">
        <Layers size={13} class="meta-ic" />
        <span class="meta-txt">Via {job.sourcePlatform}</span>
      </div>
    </div>

    <!-- Modal Navigation Subtabs -->
    <div class="modal-tabs">
      <button
        type="button"
        class="modal-tab {activeTab === 'match' ? 'active' : ''}"
        on:click={() => (activeTab = 'match')}
      >
        <Activity size={14} />
        <span>Match Analysis &amp; Breakdown</span>
      </button>
      <button
        type="button"
        class="modal-tab {activeTab === 'description' ? 'active' : ''}"
        on:click={() => (activeTab = 'description')}
      >
        <FileText size={14} />
        <span>Full Job Description</span>
      </button>
    </div>

    <!-- Modal Body Content -->
    <div class="modal-body-scroll">
      {#if activeTab === 'match'}
        <MatchBreakdownCard matchResult={job.matchResult} />
      {:else}
        <div class="description-view">
          <div class="desc-section">
            <h4 class="desc-heading">Position Overview</h4>
            <p class="desc-paragraph">{job.description}</p>
          </div>

          {#if job.responsibilities && job.responsibilities.length > 0}
            <div class="desc-section">
              <h4 class="desc-heading">Key Responsibilities</h4>
              <ul class="desc-list">
                {#each job.responsibilities as resp}
                  <li>{resp}</li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if job.requirements && job.requirements.length > 0}
            <div class="desc-section">
              <h4 class="desc-heading">Requirements &amp; Qualifications</h4>
              <ul class="desc-list">
                {#each job.requirements as req}
                  <li>{req}</li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if job.niceToHave && job.niceToHave.length > 0}
            <div class="desc-section">
              <h4 class="desc-heading">Nice to Have</h4>
              <ul class="desc-list">
                {#each job.niceToHave as nth}
                  <li>{nth}</li>
                {/each}
              </ul>
            </div>
          {/if}

          <!-- Deduplication Audit Trace (PRD Section 12) -->
          {#if job.deduplicationSources && job.deduplicationSources.length > 0}
            <div class="desc-section dedup-section">
              <h4 class="desc-heading">Deduplication Audit Trail (PRD Section 12)</h4>
              <p class="dedup-sub">Identified duplicate listings normalized into this single canonical record.</p>
              <div class="dedup-list">
                {#each job.deduplicationSources as src}
                  <div class="dedup-item">
                    <span class="src-plat">{src.platform}</span>
                    <span class="src-ext">Ext ID: {src.externalId}</span>
                    <a href={src.sourceUrl} target="_blank" rel="noopener noreferrer" class="src-url">
                      Link <ExternalLink size={10} />
                    </a>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Modal Footer Actions -->
    <div class="modal-footer">
      <div class="footer-left">
        <a
          href={job.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-secondary btn-sm"
        >
          <ExternalLink size={12} />
          <span>View Source Listing</span>
        </a>
        <button
          type="button"
          class="btn btn-ghost btn-sm {isSaved ? 'text-amber' : ''}"
          on:click={() => jobStore.saveJob(job.id)}
        >
          <Bookmark size={13} class={isSaved ? 'icon-filled' : ''} />
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      <div class="footer-right">
        <button type="button" class="btn btn-ghost btn-sm" on:click={onClose}>
          Close
        </button>
        <button
          type="button"
          class="btn btn-emerald"
          on:click={() => {
            onClose();
            applicationStore.openStudioForJob(job);
          }}
        >
          <Sparkles size={13} />
          <span>Open Application Studio</span>
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-subtle);
    background: var(--bg-surface-raised);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .company-monogram-box {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 0.88rem;
    color: var(--text-primary);
  }

  .header-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .modal-job-title {
    font-size: 1.15rem;
    color: var(--text-primary);
  }

  .company-subline {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    color: var(--text-secondary);
  }

  .comp-name {
    font-weight: 500;
    color: var(--text-primary);
  }

  .loc {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .sep {
    color: var(--border-subtle);
  }

  .modal-close-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: var(--radius-xs);
    transition: color var(--transition-fast);
  }
  .modal-close-btn:hover {
    color: var(--text-primary);
  }

  .quick-meta-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding: 8px 20px;
    background: var(--bg-input);
    border-bottom: 1px solid var(--border-subtle);
    font-size: 0.76rem;
  }

  .meta-cell {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--text-secondary);
  }

  :global(.meta-ic) {
    color: var(--text-muted);
  }

  .modal-tabs {
    display: flex;
    padding: 0 20px;
    border-bottom: 1px solid var(--border-subtle);
    gap: 12px;
    background: var(--bg-surface);
  }

  .modal-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 4px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-secondary);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .modal-tab:hover {
    color: var(--text-primary);
  }

  .modal-tab.active {
    color: var(--text-primary);
    border-bottom-color: #ffffff;
    font-weight: 600;
  }

  .modal-body-scroll {
    padding: 18px 20px;
    max-height: 55vh;
    overflow-y: auto;
  }

  .description-view {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .desc-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .desc-heading {
    font-size: 0.86rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .desc-paragraph {
    font-size: 0.8rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .desc-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .desc-list li {
    font-size: 0.78rem;
    color: var(--text-secondary);
    line-height: 1.45;
    position: relative;
    padding-left: 12px;
  }

  .desc-list li::before {
    content: '–';
    position: absolute;
    left: 0;
    color: var(--text-faint);
  }

  .dedup-section {
    background: var(--bg-input);
    border: 1px solid var(--border-faint);
    padding: 10px 14px;
    border-radius: var(--radius-sm);
  }

  .dedup-sub {
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  .dedup-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 6px;
  }

  .dedup-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.74rem;
  }

  .src-plat {
    font-weight: 600;
    color: var(--text-primary);
  }

  .src-ext {
    font-family: var(--font-mono);
    color: var(--text-muted);
    font-size: 0.7rem;
  }

  .src-url {
    display: flex;
    align-items: center;
    gap: 3px;
    color: var(--text-secondary);
    text-decoration: underline;
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-top: 1px solid var(--border-subtle);
    background: var(--bg-surface-raised);
  }

  .footer-left, .footer-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .text-amber {
    color: #fbbf24;
  }

  :global(.icon-filled) {
    fill: currentColor;
  }
</style>
