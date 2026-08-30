<script lang="ts">
  import { jobStore } from '$lib/stores/jobStore';
  import { applicationStore } from '$lib/stores/applicationStore';
  import JobFilters from './JobFilters.svelte';
  import JobCard from './JobCard.svelte';
  import MatchBreakdownCard from './MatchBreakdownCard.svelte';
  import {
    SearchX,
    RefreshCw,
    ExternalLink,
    Bookmark,
    Sparkles,
    MapPin,
    Building2,
    Calendar,
    DollarSign,
    Layers,
    CheckCircle2
  } from 'lucide-svelte';

  const filteredJobs = jobStore.filtered;
  const selectedJobId = jobStore.selectedJobId;

  // Auto-select the first job if none selected
  $: {
    if (!$selectedJobId && $filteredJobs.length > 0) {
      jobStore.selectJob($filteredJobs[0].id);
    }
  }

  $: activeJob = $jobStore.find((j) => j.id === $selectedJobId) || ($filteredJobs.length > 0 ? $filteredJobs[0] : null);
  $: isSaved = activeJob?.status === 'saved';

  function formatSalary(j: typeof activeJob) {
    if (!j || !j.salary) return null;
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

  function getMonogram(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
</script>

<div class="workspace-split">
  <!-- Left Column: Filter + Job List -->
  <aside class="pane-feed">
    <JobFilters />

    <div class="feed-header">
      <span class="count-txt">{$filteredJobs.length} opportunities</span>
    </div>

    {#if $filteredJobs.length > 0}
      <div class="jobs-stack">
        {#each $filteredJobs as job (job.id)}
          <JobCard {job} isSelected={activeJob?.id === job.id} />
        {/each}
      </div>
    {:else}
      <div class="empty-feed">
        <SearchX size={28} class="empty-icon" />
        <p class="empty-msg">No opportunities match current filters.</p>
        <button type="button" class="btn btn-secondary btn-sm" on:click={() => jobStore.resetFilters()}>
          Reset Filters
        </button>
      </div>
    {/if}
  </aside>

  <!-- Right Column: Selected Job Full Details & Breakdown -->
  <section class="pane-detail">
    {#if activeJob}
      <div class="detail-container">
        <!-- Top Action & Meta Header -->
        <div class="detail-header">
          <div class="header-main-row">
            <div class="company-badge-large">
              <span>{getMonogram(activeJob.company)}</span>
            </div>
            <div class="header-titles">
              <h2 class="detail-title">{activeJob.title}</h2>
              <div class="detail-sub-meta">
                <span class="company-txt">{activeJob.company}</span>
                <span class="dot">•</span>
                <span class="loc-txt">{activeJob.location}</span>
                {#if activeJob.remote}
                  <span class="badge badge-emerald">Remote</span>
                {/if}
                <span class="badge badge-neutral">{activeJob.employmentType}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="detail-actions">
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              on:click={() => isSaved ? jobStore.updateJobStatus(activeJob.id, 'new') : jobStore.saveJob(activeJob.id)}
            >
              <Bookmark size={13} fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <a
              href={activeJob.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-ghost btn-sm"
            >
              <span>Source ({activeJob.sourcePlatform})</span>
              <ExternalLink size={12} />
            </a>

            <button
              type="button"
              class="btn btn-primary btn-sm btn-highlight"
              on:click={() => applicationStore.openStudioForJob(activeJob)}
            >
              <Sparkles size={13} />
              <span>Prepare Application</span>
            </button>
          </div>
        </div>

        <!-- Quick Summary Bar -->
        <div class="quick-summary-bar">
          {#if formatSalary(activeJob)}
            <div class="stat-box">
              <span class="stat-label">Salary Range</span>
              <span class="stat-value text-emerald">{formatSalary(activeJob)}</span>
            </div>
          {/if}

          <div class="stat-box">
            <span class="stat-label">Compatibility</span>
            <span class="stat-value text-emerald">{activeJob.matchScore}% Match</span>
          </div>

          <div class="stat-box">
            <span class="stat-label">Posted</span>
            <span class="stat-value">{new Date(activeJob.postedAt).toLocaleDateString()}</span>
          </div>

          {#if activeJob.deduplicationSources && activeJob.deduplicationSources.length > 1}
            <div class="stat-box">
              <span class="stat-label">Aggregated Sources</span>
              <span class="stat-value">{activeJob.deduplicationSources.length} external feeds</span>
            </div>
          {/if}
        </div>

        <!-- Match Breakdown Card -->
        {#if activeJob.matchResult}
          <div class="section-block">
            <MatchBreakdownCard matchResult={activeJob.matchResult} />
          </div>
        {/if}

        <!-- Job Description -->
        <div class="section-block desc-block">
          <h3 class="block-title">Role Overview</h3>
          <p class="desc-text">{activeJob.description}</p>
        </div>

        <!-- Responsibilities & Requirements -->
        {#if activeJob.requirements && activeJob.requirements.length > 0}
          <div class="section-block">
            <h3 class="block-title">Requirements &amp; Qualifications</h3>
            <ul class="bullet-list">
              {#each activeJob.requirements as req}
                <li>{req}</li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if activeJob.responsibilities && activeJob.responsibilities.length > 0}
          <div class="section-block">
            <h3 class="block-title">Key Responsibilities</h3>
            <ul class="bullet-list">
              {#each activeJob.responsibilities as resp}
                <li>{resp}</li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    {:else}
      <div class="empty-detail">
        <p>Select a job from the list to view match breakdown and details.</p>
      </div>
    {/if}
  </section>
</div>

<style>
  .feed-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px;
  }

  .count-txt {
    font-size: 0.72rem;
    font-family: var(--font-mono);
    color: var(--text-muted);
  }

  .jobs-stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .empty-feed {
    padding: 36px 16px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
  }

  :global(.empty-icon) {
    color: var(--text-muted);
  }

  .empty-msg {
    font-size: 0.76rem;
    color: var(--text-muted);
  }

  .detail-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .detail-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--border-subtle);
    flex-wrap: wrap;
  }

  .header-main-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
    min-width: 280px;
  }

  .company-badge-large {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    background: var(--bg-surface-raised);
    border: 1px solid var(--border-strong);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
    font-weight: 700;
    font-family: var(--font-mono);
    color: var(--accent-primary);
    flex-shrink: 0;
  }

  .header-titles {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .detail-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .detail-sub-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.76rem;
    color: var(--text-muted);
    flex-wrap: wrap;
  }

  .company-txt {
    color: var(--text-secondary);
    font-weight: 600;
  }

  .dot {
    color: var(--text-faint);
  }

  .detail-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .btn-highlight {
    background: var(--accent-primary);
    color: #ffffff;
    font-weight: 600;
  }
  .btn-highlight:hover {
    background: #234731;
  }

  .quick-summary-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 10px;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
  }

  .stat-box {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-label {
    font-size: 0.66rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .stat-value {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-primary);
    font-family: var(--font-mono);
  }

  .section-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .block-title {
    font-size: 0.86rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .desc-text {
    font-size: 0.8rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .bullet-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .bullet-list li {
    font-size: 0.78rem;
    color: var(--text-secondary);
    line-height: 1.45;
    position: relative;
    padding-left: 14px;
  }

  .bullet-list li::before {
    content: "•";
    position: absolute;
    left: 2px;
    color: var(--text-muted);
  }

  .empty-detail {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    font-size: 0.8rem;
  }

  .text-emerald { color: var(--accent-emerald); }
</style>
