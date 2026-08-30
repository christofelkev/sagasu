<script lang="ts">
  import { jobStore, type JobFilterState } from '$lib/stores/jobStore';
  import { Search, X, Check, SlidersHorizontal } from 'lucide-svelte';

  const platforms = ['LinkedIn', 'TechInAsia', 'Glints', 'RemoteOK', 'Deel', 'Company Careers'];

  const filtersStore = jobStore.filters;
  $: filters = $filtersStore;

  let showAdvanced = false;

  function togglePlatform(p: string) {
    const current = filters.sourcePlatforms;
    const exists = current.includes(p);
    const updated = exists ? current.filter((x) => x !== p) : [...current, p];
    jobStore.setFilter({ sourcePlatforms: updated });
  }
</script>

<div class="filters-toolbar">
  <!-- Primary Search Input -->
  <div class="search-wrap">
    <Search size={14} class="search-icon" />
    <input
      type="text"
      class="search-input"
      placeholder="Search role, skills, company..."
      value={filters.searchQuery}
      on:input={(e) => jobStore.setFilter({ searchQuery: e.currentTarget.value })}
    />
    {#if filters.searchQuery}
      <button
        type="button"
        class="clear-btn"
        on:click={() => jobStore.setFilter({ searchQuery: '' })}
        aria-label="Clear search"
      >
        <X size={12} />
      </button>
    {/if}
  </div>

  <!-- Status Filter Pills -->
  <div class="quick-status-tabs">
    {#each ['all', 'new', 'saved'] as status}
      <button
        type="button"
        class="status-chip {filters.statusFilter === status ? 'active' : ''}"
        on:click={() => jobStore.setFilter({ statusFilter: status as JobFilterState['statusFilter'] })}
      >
        {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
      </button>
    {/each}

    <!-- Remote Quick Toggle -->
    <button
      type="button"
      class="status-chip {filters.remoteOnly ? 'active' : ''}"
      on:click={() => jobStore.setFilter({ remoteOnly: !filters.remoteOnly })}
    >
      Remote
    </button>

    <!-- Filter Drawer Toggle -->
    <button
      type="button"
      class="status-chip filter-btn {showAdvanced ? 'active' : ''}"
      on:click={() => (showAdvanced = !showAdvanced)}
      title="Advanced Filters"
    >
      <SlidersHorizontal size={11} />
      <span>{filters.minMatchScore}%+</span>
    </button>
  </div>

  <!-- Collapsible Advanced Drawer -->
  {#if showAdvanced}
    <div class="advanced-drawer">
      <div class="drawer-row">
        <div class="drawer-field">
          <label for="min-match-slider" class="drawer-lbl">
            Min Match: <strong class="text-emerald">{filters.minMatchScore}%</strong>
          </label>
          <input
            id="min-match-slider"
            type="range"
            min="40"
            max="90"
            step="5"
            class="range-slider"
            value={filters.minMatchScore}
            on:input={(e) => jobStore.setFilter({ minMatchScore: Number(e.currentTarget.value) })}
          />
        </div>

        <div class="drawer-field">
          <label for="min-salary-select" class="drawer-lbl">Min Salary</label>
          <select
            id="min-salary-select"
            class="input-select select-compact"
            value={filters.minSalaryIDR}
            on:change={(e) => jobStore.setFilter({ minSalaryIDR: Number(e.currentTarget.value) })}
          >
            <option value={0}>Any</option>
            <option value={15000000}>15M+ IDR</option>
            <option value={20000000}>20M+ IDR</option>
            <option value={25000000}>25M+ IDR</option>
            <option value={35000000}>35M+ IDR</option>
          </select>
        </div>
      </div>

      <div class="drawer-platforms">
        <span class="drawer-lbl">Sources:</span>
        <div class="platform-chips">
          {#each platforms as plat}
            {@const isSelected = filters.sourcePlatforms.length === 0 || filters.sourcePlatforms.includes(plat)}
            <button
              type="button"
              class="plat-pill {isSelected ? 'plat-on' : 'plat-off'}"
              on:click={() => togglePlatform(plat)}
            >
              {plat}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .filters-toolbar {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 8px 10px;
    flex-shrink: 0;
  }

  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  :global(.search-icon) {
    position: absolute;
    left: 8px;
    color: var(--text-muted);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xs);
    padding: 5px 28px 5px 26px;
    color: var(--text-primary);
    font-size: 0.78rem;
    outline: none;
    transition: border-color var(--transition-fast);
  }
  .search-input:focus {
    border-color: var(--border-focus);
  }

  .clear-btn {
    position: absolute;
    right: 6px;
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 2px;
  }
  .clear-btn:hover {
    color: var(--text-primary);
  }

  .quick-status-tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }

  .status-chip {
    padding: 2px 7px;
    background: var(--bg-input);
    border: 1px solid var(--border-faint);
    border-radius: var(--radius-xs);
    font-size: 0.72rem;
    color: var(--text-secondary);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: all var(--transition-fast);
  }
  .status-chip:hover {
    color: var(--text-primary);
    border-color: var(--border-subtle);
  }
  .status-chip.active {
    background: var(--bg-surface-raised);
    color: var(--text-primary);
    border-color: var(--border-strong);
    font-weight: 500;
  }

  .filter-btn {
    margin-left: auto;
    font-family: var(--font-mono);
  }

  .advanced-drawer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--border-faint);
    margin-top: 2px;
  }

  .drawer-row {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 10px;
    align-items: center;
  }

  .drawer-field {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .drawer-lbl {
    font-size: 0.68rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .select-compact {
    padding: 3px 6px;
    font-size: 0.72rem;
    height: 26px;
  }

  .range-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 3px;
    border-radius: var(--radius-full);
    background: var(--border-subtle);
    outline: none;
    cursor: pointer;
  }
  .range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
  }

  .drawer-platforms {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .platform-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .plat-pill {
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 0.66rem;
    cursor: pointer;
    transition: all var(--transition-fast);
    border: 1px solid transparent;
  }
  .plat-on {
    background: var(--bg-surface-raised);
    color: var(--text-primary);
    border-color: var(--border-subtle);
  }
  .plat-off {
    background: transparent;
    color: var(--text-faint);
    border-color: var(--border-faint);
  }

  .text-emerald {
    color: #34d399;
  }
</style>
