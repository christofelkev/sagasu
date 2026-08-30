<script lang="ts">
  import { jobStore } from '$lib/stores/jobStore';
  import { applicationStore } from '$lib/stores/applicationStore';
  import {
    RefreshCw,
    Layers,
    User,
    SlidersHorizontal,
    Search
  } from 'lucide-svelte';

  export let activeTab: 'jobs' | 'applications' | 'profile' | 'preferences' = 'jobs';

  $: totalJobs = $jobStore.length;
  $: highMatches = $jobStore.filter((j) => j.matchScore >= 80).length;
  $: savedCount = $jobStore.filter((j) => j.status === 'saved').length;
  $: activeApps = $applicationStore.filter((a) => a.status !== 'REJECTED' && a.status !== 'WITHDRAWN').length;
  const isSyncing = jobStore.isSyncing;
</script>

<header class="header">
  <div class="header-container">
    <!-- Brand & Monogram -->
    <div class="brand-section">
      <div class="brand-badge">
        <span class="kanji-mark">探</span>
      </div>
      <div class="brand-meta">
        <div class="brand-name">
          SAGASU
        </div>
        <div class="brand-status">
          <span class="pulsing-dot"></span>
          <span class="status-lbl">DISCOVERY ACTIVE</span>
        </div>
      </div>
    </div>

    <!-- Minimalist Navigation Tabs -->
    <nav class="nav-segment">
      <button
        type="button"
        class="nav-tab {activeTab === 'jobs' ? 'active' : ''}"
        on:click={() => (activeTab = 'jobs')}
      >
        <Search size={13} />
        <span>Jobs</span>
        <span class="tab-count">{totalJobs}</span>
      </button>

      <button
        type="button"
        class="nav-tab {activeTab === 'applications' ? 'active' : ''}"
        on:click={() => (activeTab = 'applications')}
      >
        <Layers size={13} />
        <span>Pipeline</span>
        {#if activeApps > 0}
          <span class="tab-count count-active">{activeApps}</span>
        {/if}
      </button>

      <button
        type="button"
        class="nav-tab {activeTab === 'profile' ? 'active' : ''}"
        on:click={() => (activeTab = 'profile')}
      >
        <User size={13} />
        <span>Profile</span>
      </button>

      <button
        type="button"
        class="nav-tab {activeTab === 'preferences' ? 'active' : ''}"
        on:click={() => (activeTab = 'preferences')}
      >
        <SlidersHorizontal size={13} />
        <span>Settings</span>
      </button>
    </nav>

    <!-- Header Actions & Counters -->
    <div class="header-actions">
      <div class="stats-group">
        <span class="stat-pill">
          <strong class="text-emerald">{highMatches}</strong> high match
        </span>
        {#if savedCount > 0}
          <span class="stat-pill">
            <strong>{savedCount}</strong> saved
          </span>
        {/if}
      </div>

      <button
        type="button"
        class="btn btn-secondary btn-sm sync-btn"
        disabled={$isSyncing}
        on:click={() => jobStore.syncSources()}
      >
        <RefreshCw size={12} class={$isSyncing ? 'spin-icon' : ''} />
        <span>{$isSyncing ? 'Syncing...' : 'Sync Sources'}</span>
      </button>
    </div>
  </div>
</header>

<style>
  .header {
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border-subtle);
    position: sticky;
    top: 0;
    z-index: 100;
    width: 100%;
  }

  .header-container {
    max-width: 1360px;
    margin: 0 auto;
    padding: 10px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .brand-section {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-badge {
    width: 28px;
    height: 28px;
    background: var(--bg-surface-raised);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .kanji-mark {
    font-family: var(--font-jp);
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--accent-primary);
  }

  .brand-meta {
    display: flex;
    flex-direction: column;
  }

  .brand-name {
    font-size: 0.92rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--text-primary);
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .brand-status {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.66rem;
    font-family: var(--font-mono);
    color: var(--text-muted);
    letter-spacing: 0.02em;
  }

  .nav-segment {
    display: flex;
    align-items: center;
    background: var(--bg-surface-raised);
    border: 1px solid var(--border-subtle);
    padding: 3px;
    border-radius: var(--radius-md);
    gap: 2px;
  }

  .nav-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-secondary);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .nav-tab:hover {
    color: var(--text-primary);
  }

  .nav-tab.active {
    color: var(--text-primary);
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    box-shadow: var(--shadow-sm);
  }

  .tab-count {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    background: var(--border-subtle);
    color: var(--text-muted);
    padding: 1px 5px;
    border-radius: var(--radius-full);
  }

  .tab-count.count-active {
    color: #ffffff;
    background: var(--accent-primary);
    font-weight: 600;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .stats-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stat-pill {
    font-size: 0.74rem;
    color: var(--text-secondary);
    background: var(--bg-surface-raised);
    border: 1px solid var(--border-subtle);
    padding: 3px 8px;
    border-radius: var(--radius-xs);
  }

  .stat-pill strong {
    color: var(--text-primary);
    font-family: var(--font-mono);
  }

  .text-emerald {
    color: var(--accent-emerald);
  }

  :global(.spin-icon) {
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @media (max-width: 900px) {
    .stats-group {
      display: none;
    }
  }
</style>
