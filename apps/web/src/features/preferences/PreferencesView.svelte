<script lang="ts">
  import { preferenceStore } from '$lib/stores/preferenceStore';
  import {
    Layers,
    Clock,
    RotateCcw,
    Sparkles,
    Check,
    Cpu
  } from 'lucide-svelte';

  $: prefs = $preferenceStore;

  function generateQueries(): string[] {
    const roles = prefs.desiredRoles || [];
    const keys = prefs.keywords || [];
    const queries: string[] = [];

    for (const r of roles.slice(0, 3)) {
      queries.push(r);
    }
    for (const k of keys.slice(0, 3)) {
      queries.push(`${k} Engineer`);
      queries.push(`${k} Developer`);
    }
    return Array.from(new Set(queries));
  }

  $: generatedQueries = generateQueries();
</script>

<div class="preferences-view">
  <!-- Header -->
  <div class="pref-header glass-panel">
    <div>
      <h2 class="pref-title">Search &amp; Collector Settings</h2>
      <p class="pref-sub">
        Configure active source connectors, query expansion variants, and discovery cadence.
      </p>
    </div>

    <button type="button" class="btn btn-ghost btn-sm" on:click={() => preferenceStore.resetToDefault()}>
      <RotateCcw size={12} />
      <span>Reset Defaults</span>
    </button>
  </div>

  <div class="pref-grid">
    <!-- 1. Source Adapters Grid -->
    <div class="pref-card glass-panel">
      <div class="card-title-row">
        <Layers size={16} class="card-icon" />
        <div>
          <h3 class="card-heading">Active Source Connectors</h3>
          <p class="card-subheading">Enabled job platforms and aggregators.</p>
        </div>
      </div>

      <div class="sources-list">
        {#each prefs.enabledSources as src (src.id)}
          <div class="source-adapter-row {src.enabled ? 'adapter-active' : 'adapter-disabled'}">
            <div class="adapter-info">
              <div class="adapter-name-row">
                <span class="adapter-name">{src.name}</span>
                <span class="badge {src.enabled ? 'badge-emerald' : 'badge-neutral'}">
                  {src.enabled ? 'Active' : 'Paused'}
                </span>
              </div>
              <div class="adapter-stats">
                <span class="stat-count">{src.itemsCount} indexed</span>
                {#if src.lastSyncedAt}
                  <span class="dot">•</span>
                  <span class="stat-time">
                    <Clock size={10} />
                    Synced {new Date(src.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                {/if}
              </div>
            </div>

            <button
              type="button"
              class="btn {src.enabled ? 'btn-secondary' : 'btn-ghost'} btn-sm toggle-btn"
              on:click={() => preferenceStore.toggleSource(src.id)}
            >
              {src.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        {/each}
      </div>
    </div>

    <!-- 2. Query Generator Simulator -->
    <div class="pref-card glass-panel">
      <div class="card-title-row">
        <Sparkles size={16} class="card-icon" />
        <div>
          <h3 class="card-heading">Search Query Expansion</h3>
          <p class="card-subheading">
            Expanded search queries derived from your target roles and keywords.
          </p>
        </div>
      </div>

      <div class="query-preview-box">
        <span class="query-box-title">Generated Query Variants:</span>
        <div class="query-pills">
          {#each generatedQueries as q}
            <span class="query-pill">
              <span class="query-dot"></span>
              {q}
            </span>
          {/each}
        </div>
      </div>

      <!-- Keywords Manager -->
      <div class="keywords-field">
        <label for="pref-keywords" class="field-lbl">Target Keywords</label>
        <input
          id="pref-keywords"
          type="text"
          class="input-text"
          value={prefs.keywords.join(', ')}
          on:change={(e) => {
            const arr = e.currentTarget.value.split(',').map((k) => k.trim()).filter(Boolean);
            preferenceStore.update({ keywords: arr });
          }}
        />
      </div>

      <!-- Excluded Companies -->
      <div class="keywords-field">
        <label for="pref-excluded" class="field-lbl">Excluded Companies &amp; Blacklist</label>
        <input
          id="pref-excluded"
          type="text"
          class="input-text"
          value={prefs.excludedCompanies.join(', ')}
          on:change={(e) => {
            const arr = e.currentTarget.value.split(',').map((k) => k.trim()).filter(Boolean);
            preferenceStore.update({ excludedCompanies: arr });
          }}
        />
      </div>
    </div>

    <!-- 3. Engine Parameters & Thresholds -->
    <div class="pref-card glass-panel full-width">
      <div class="card-title-row">
        <Cpu size={16} class="card-icon" />
        <div>
          <h3 class="card-heading">Discovery Cadence &amp; Notifications</h3>
          <p class="card-subheading">Alert thresholds and auto-sync schedule.</p>
        </div>
      </div>

      <div class="form-grid-3">
        <div class="form-group">
          <div class="range-header">
            <label for="pref-min-threshold" class="field-lbl">
              Compatibility Alert Threshold
            </label>
            <span class="range-val text-emerald">{prefs.minMatchScoreThreshold}%+</span>
          </div>
          <input
            id="pref-min-threshold"
            type="range"
            min="50"
            max="95"
            step="5"
            class="range-slider"
            value={prefs.minMatchScoreThreshold}
            on:input={(e) =>
              preferenceStore.update({ minMatchScoreThreshold: Number(e.currentTarget.value) })}
          />
        </div>

        <div class="form-group">
          <label for="pref-sync-interval" class="field-lbl">Auto-Discovery Interval</label>
          <select
            id="pref-sync-interval"
            class="input-select"
            value={prefs.autoSyncIntervalMinutes}
            on:change={(e) =>
              preferenceStore.update({ autoSyncIntervalMinutes: Number(e.currentTarget.value) })}
          >
            <option value={15}>Every 15 Minutes</option>
            <option value={30}>Every 30 Minutes</option>
            <option value={60}>Every 1 Hour (Standard)</option>
            <option value={120}>Every 2 Hours</option>
            <option value={360}>Every 6 Hours</option>
          </select>
        </div>

        <div class="form-group alert-toggle-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              checked={prefs.alertEmailEnabled}
              on:change={(e) =>
                preferenceStore.update({ alertEmailEnabled: e.currentTarget.checked })}
            />
            <div class="checkbox-custom">
              {#if prefs.alertEmailEnabled}
                <Check size={11} />
              {/if}
            </div>
            <div class="checkbox-text">
              <span class="title">High-Match Notifications</span>
              <span class="subtitle">Alert when &gt;{prefs.minMatchScoreThreshold}% match is found</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .preferences-view {
    max-width: 1040px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .pref-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .pref-title {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .pref-sub {
    font-size: 0.86rem;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .pref-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .pref-card {
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-xs);
  }

  .pref-card.full-width {
    grid-column: 1 / -1;
  }

  .card-title-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  :global(.card-icon) {
    color: var(--text-muted);
    margin-top: 3px;
    flex-shrink: 0;
  }

  .card-heading {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .card-subheading {
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  .sources-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .source-adapter-row {
    padding: 14px 16px;
    background: var(--bg-surface-raised);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .adapter-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .adapter-name-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .adapter-name {
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .adapter-stats {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.76rem;
    color: var(--text-muted);
  }

  .stat-time {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .query-preview-box {
    background: var(--bg-surface-raised);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .query-box-title {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .query-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .query-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    padding: 4px 10px;
    border-radius: var(--radius-xs);
    font-size: 0.78rem;
    color: var(--text-secondary);
  }

  .query-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--accent-emerald);
  }

  .keywords-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field-lbl {
    font-size: 0.72rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .range-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .range-val {
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 0.72rem;
  }

  .text-emerald {
    color: #34d399;
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

  .form-grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 14px;
  }

  .alert-toggle-group {
    justify-content: center;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-label input {
    display: none;
  }

  .checkbox-custom {
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

  .checkbox-label input:checked + .checkbox-custom {
    background: var(--accent-emerald-subtle);
    border-color: var(--accent-emerald-border);
  }

  .checkbox-text .title {
    font-size: 0.76rem;
    font-weight: 500;
    color: var(--text-primary);
    display: block;
  }
  .checkbox-text .subtitle {
    font-size: 0.68rem;
    color: var(--text-muted);
    display: block;
  }

  @media (max-width: 840px) {
    .pref-grid {
      grid-template-columns: 1fr;
    }
    .form-grid-3 {
      grid-template-columns: 1fr;
    }
  }
</style>
