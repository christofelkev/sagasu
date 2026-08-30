<script lang="ts">
  import type { MatchResult } from '@sagasu/api-contract';
  import {
    Check,
    X,
    Code,
    Clock,
    DollarSign,
    MapPin,
    Award,
    Sparkles
  } from 'lucide-svelte';

  export let matchResult: MatchResult;

  $: factors = matchResult.factors;
  $: ai = matchResult.aiAnalysis;
</script>

<div class="breakdown-card">
  <!-- 6 Deterministic Scoring Factors -->
  <div class="factors-section">
    <h4 class="section-title">Deterministic Scoring Breakdown</h4>

    <div class="factors-bars-grid">
      <!-- Skills (40%) -->
      <div class="factor-row">
        <div class="factor-header">
          <div class="factor-label">
            <Code size={12} class="factor-ic" />
            <span>Skills &amp; Tech Stack (40% weight)</span>
          </div>
          <span class="factor-score">{factors.skills.score}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar bar-emerald" style="width: {factors.skills.score}%"></div>
        </div>
      </div>

      <!-- Experience (20%) -->
      <div class="factor-row">
        <div class="factor-header">
          <div class="factor-label">
            <Clock size={12} class="factor-ic" />
            <span>Years of Experience (20% weight)</span>
          </div>
          <span class="factor-score">{factors.experience.score}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar bar-cyan" style="width: {factors.experience.score}%"></div>
        </div>
      </div>

      <!-- Salary (15%) -->
      <div class="factor-row">
        <div class="factor-header">
          <div class="factor-label">
            <DollarSign size={12} class="factor-ic" />
            <span>Compensation Alignment (15% weight)</span>
          </div>
          <span class="factor-score">{factors.salary.score}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar bar-amber" style="width: {factors.salary.score}%"></div>
        </div>
      </div>

      <!-- Location / Remote (10%) -->
      <div class="factor-row">
        <div class="factor-header">
          <div class="factor-label">
            <MapPin size={12} class="factor-ic" />
            <span>Location &amp; Remote (10% weight)</span>
          </div>
          <span class="factor-score">{factors.location.score}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar bar-purple" style="width: {factors.location.score}%"></div>
        </div>
      </div>

      <!-- Seniority (10%) -->
      <div class="factor-row">
        <div class="factor-header">
          <div class="factor-label">
            <Award size={12} class="factor-ic" />
            <span>Seniority Level (10% weight)</span>
          </div>
          <span class="factor-score">{factors.seniority.score}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar bar-cyan" style="width: {factors.seniority.score}%"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Matched & Missing Skills Tags -->
  <div class="skills-diff-section">
    <div class="skills-col">
      <span class="diff-title text-emerald">Matched Skills ({factors.skills.matched.length})</span>
      <div class="tags-wrap">
        {#each factors.skills.matched as s}
          <span class="tag-pill tag-matched">
            <Check size={10} />
            {s}
          </span>
        {/each}
        {#if factors.skills.matched.length === 0}
          <span class="text-faint">No exact skill matches</span>
        {/if}
      </div>
    </div>

    <div class="skills-col">
      <span class="diff-title text-muted">Missing Requirements ({factors.skills.missing.length})</span>
      <div class="tags-wrap">
        {#each factors.skills.missing as s}
          <span class="tag-pill tag-missing">
            <X size={10} />
            {s}
          </span>
        {/each}
        {#if factors.skills.missing.length === 0}
          <span class="text-emerald">All required skills matched!</span>
        {/if}
      </div>
    </div>
  </div>

  <!-- Qualitative Fit Analysis -->
  {#if ai}
    <div class="fit-analysis-card">
      <div class="fit-header">
        <Sparkles size={13} class="text-emerald" />
        <span class="fit-title">Fit Analysis</span>
      </div>
      <p class="fit-summary">{ai.fitSummary}</p>

      <div class="notes-grid">
        <div class="note-box">
          <span class="note-lbl">Application Angle</span>
          <p class="note-txt">{ai.recommendedApplicationAngle}</p>
        </div>
        <div class="note-box">
          <span class="note-lbl">Interview Focus</span>
          <p class="note-txt">{ai.interviewTip}</p>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .breakdown-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .factors-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 10px 12px;
  }

  .section-title {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .factors-bars-grid {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .factor-row {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .factor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.72rem;
  }

  .factor-label {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--text-secondary);
  }

  :global(.factor-ic) {
    color: var(--text-muted);
  }

  .factor-score {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .progress-track {
    height: 4px;
    background: var(--bg-surface-raised);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.3s ease;
  }

  .bar-emerald { background: var(--accent-emerald); }
  .bar-cyan { background: var(--accent-cyan); }
  .bar-amber { background: var(--accent-amber); }
  .bar-purple { background: var(--accent-purple); }

  .skills-diff-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .skills-col {
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .diff-title {
    font-size: 0.72rem;
    font-weight: 600;
  }

  .tags-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .tag-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: var(--radius-xs);
    font-size: 0.68rem;
    font-weight: 500;
  }

  .tag-matched {
    background: var(--accent-emerald-subtle);
    border: 1px solid var(--accent-emerald-border);
    color: var(--accent-emerald);
  }

  .tag-missing {
    background: var(--bg-surface-raised);
    border: 1px solid var(--border-subtle);
    color: var(--text-muted);
  }

  .fit-analysis-card {
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .fit-header {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .fit-title {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .fit-summary {
    font-size: 0.76rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .notes-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 2px;
  }

  .note-box {
    background: var(--bg-surface);
    border: 1px solid var(--border-faint);
    border-radius: var(--radius-xs);
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .note-lbl {
    font-size: 0.66rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .note-txt {
    font-size: 0.72rem;
    color: var(--text-primary);
    line-height: 1.35;
  }

  .text-emerald { color: var(--accent-emerald); }
  .text-faint { color: var(--text-faint); font-size: 0.7rem; }

  @media (max-width: 640px) {
    .skills-diff-section {
      grid-template-columns: 1fr;
    }
    .notes-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
