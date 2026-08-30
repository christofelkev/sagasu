<script lang="ts">
  import { jobStore, type JobFilterState } from '$lib/stores/jobStore';
  import { Search, X, Check, SlidersHorizontal } from 'lucide-svelte';

  const platforms = ['LinkedIn', 'TechInAsia', 'Glints', 'RemoteOK', 'Deel', 'Company Careers'];

  const filtersStore = jobStore.filters;
  $: filters = $filtersStore;

  function togglePlatform(p: string) {
    const current = filters.sourcePlatforms;
    const exists = current.includes(p);
    const updated = exists ? current.filter((x) => x !== p) : [...current, p];
    jobStore.setFilter({ sourcePlatforms: updated });
  }
</script>

<div class="filters-container glass-panel">
  <!-- Primary Search & Status Row -->
  <div class="primary-row">
    <div class="search-box">
      <Search size={15} class="search-ic" />
      <input
        type="text"
        class="search-field"
        placeholder="Filter by role, skills (TypeScript, Svelte, PostgreSQL), or company..."
        value={filters.searchQuery}
        on:input={(e) => jobStore.setFilter({ searchQuery: e.currentTarget.value })}
      />
      {#if filters.searchQuery}
        <button class="clear-search-btn" on:click={() => jobStore.setFilter({ searchQuery: '' })}>
          <X size={13} />
        </button>
      {/if}
    </div>

    <!-- Status Tabs -->
    <div class="status-segment">
      {#each ['all', 'new', 'saved', 'reviewed'] as status}
        <button
          class="status-tab {filters.statusFilter === status ? 'active' : ''}"
          on:click={() => jobStore.setFilter({ statusFilter: status as JobFilterState['statusFilter'] })}
        >
          {status === 'all' ? 'All Feed' : status.toUpperCase()}
        </button>
      {/each}
    </div>
  </div>

  <!-- Filter Parameters Grid -->
  <div class="parameters-grid">
    <!-- Min Match Score -->
    <div class="param-cell">
      <div class="param-label-row">
        <span class="param-title">Min Match Score</span>
        <span class="param-value text-emerald">{filters.minMatchScore}%</span>
      </div>
      <input
        type="range"
        min="40"
        max="90"
        step="5"
        class="range-slider"
        value={filters.minMatchScore}
        on:input={(e) => jobStore.setFilter({ minMatchScore: Number(e.currentTarget.value) })}
      />
    </div>

    <!-- Min Salary -->
    <div class="param-cell">
      <div class="param-label-row">
        <span class="param-title">Minimum Salary</span>
      </div>
      <select
        class="input-select"
        value={filters.minSalaryIDR}
        on:change={(e) => jobStore.setFilter({ minSalaryIDR: Number(e.currentTarget.value) })}
      >
        <option value={0}>Any Compensation</option>
        <option value={15000000}>Rp 15,000,000+ / mo</option>
        <option value={20000000}>Rp 20,000,000+ / mo</option>
        <option value={25000000}>Rp 25,000,000+ / mo</option>
        <option value={35000000}>Rp 35,000,000+ / mo</option>
      </select>
    </div>

    <!-- Remote Checkbox -->
    <div class="param-cell checkbox-cell">
      <label class="remote-toggle-label">
        <input
          type="checkbox"
          checked={filters.remoteOnly}
          on:change={(e) => jobStore.setFilter({ remoteOnly: e.currentTarget.checked })}
        />
        <div class="custom-checkbox">
          {#if filters.remoteOnly}
            <Check size={11} />
          {/if}
        </div>
        <div class="toggle-text">
          <span class="toggle-title">Remote Only</span>
          <span class="toggle-desc">Show 100% remote</span>
        </div>
      </label>
    </div>

    <!-- Sort Order -->
    <div class="param-cell">
      <div class="param-label-row">
        <span class="param-title">Sort By</span>
      </div>
      <select
        class="input-select"
        value={filters.sortBy}
        on:change={(e) => jobStore.setFilter({ sortBy: e.currentTarget.value as JobFilterState['sortBy'] })}
      >
        <option value="match">Match Score (Highest)</option>
        <option value="recent">Discovered Date</option>
        <option value="salary">Compensation (Highest)</option>
      </select>
    </div>
  </div>

  <!-- Source Platforms Filter Row -->
  <div class="sources-row">
    <span class="sources-title">Sources:</span>
    <div class="sources-chips">
      {#each platforms as platform}
        {@const selected = filters.sourcePlatforms.includes(platform)}
        <button
          class="source-chip {selected ? 'selected' : ''}"
          on:click={() => togglePlatform(platform)}
        >
          {platform}
        </button>
      {/each}
      {#if filters.sourcePlatforms.length > 0}
        <button class="clear-sources-btn" on:click={() => jobStore.setFilter({ sourcePlatforms: [] })}>
          Reset
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .filters-container {
    padding: 14px 18px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .primary-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .search-box {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
  }

  :global(.search-ic) {
    position: absolute;
    left: 11px;
    color: var(--text-muted);
    pointer-events: none;
  }

  .search-field {
    width: 100%;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 7px 32px 7px 34px;
    color: var(--text-primary);
    font-size: 0.84rem;
    outline: none;
    transition: border-color var(--transition-fast);
  }

  .search-field:focus {
    border-color: var(--border-focus);
  }

  .clear-search-btn {
    position: absolute;
    right: 8px;
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
  }
  .clear-search-btn:hover {
    color: var(--text-primary);
  }

  .status-segment {
    display: flex;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    padding: 2px;
    border-radius: var(--radius-sm);
    gap: 2px;
  }

  .status-tab {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 0.74rem;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: var(--radius-xs);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .status-tab:hover {
    color: var(--text-primary);
  }

  .status-tab.active {
    background: var(--bg-surface-raised);
    color: var(--text-primary);
    font-weight: 600;
  }

  .parameters-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding-top: 10px;
    border-top: 1px solid var(--border-faint);
  }

  .param-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .param-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.72rem;
  }

  .param-title {
    color: var(--text-muted);
    font-weight: 500;
  }

  .param-value {
    font-family: var(--font-mono);
    font-weight: 600;
  }

  .range-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    border-radius: var(--radius-full);
    background: var(--border-subtle);
    outline: none;
    cursor: pointer;
    margin-top: 6px;
  }

  .range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
  }

  .checkbox-cell {
    justify-content: flex-end;
  }

  .remote-toggle-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    padding-top: 4px;
  }

  .remote-toggle-label input {
    display: none;
  }

  .custom-checkbox {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #34d399;
  }

  .remote-toggle-label input:checked + .custom-checkbox {
    background: var(--accent-emerald-subtle);
    border-color: var(--accent-emerald-border);
  }

  .toggle-text {
    display: flex;
    flex-direction: column;
  }

  .toggle-title {
    font-size: 0.76rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .toggle-desc {
    font-size: 0.68rem;
    color: var(--text-muted);
  }

  .sources-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.74rem;
    padding-top: 8px;
    border-top: 1px solid var(--border-faint);
  }

  .sources-title {
    color: var(--text-muted);
    font-size: 0.72rem;
  }

  .sources-chips {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
  }

  .source-chip {
    background: transparent;
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    padding: 2px 7px;
    border-radius: var(--radius-xs);
    font-size: 0.7rem;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .source-chip:hover {
    border-color: var(--border-strong);
    color: var(--text-primary);
  }

  .source-chip.selected {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.25);
    color: var(--text-primary);
    font-weight: 600;
  }

  .clear-sources-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 0.7rem;
    cursor: pointer;
    text-decoration: underline;
    margin-left: 4px;
  }

  .text-emerald {
    color: #34d399;
  }

  @media (max-width: 900px) {
    .parameters-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 600px) {
    .primary-row {
      flex-direction: column;
      align-items: stretch;
    }
    .parameters-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
