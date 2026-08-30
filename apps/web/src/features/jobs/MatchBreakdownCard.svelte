<script lang="ts">
  import type { MatchResult } from '@sagasu/api-contract';
  import MatchScoreBadge from './MatchScoreBadge.svelte';
  import {
    Check,
    AlertCircle,
    X,
    Cpu,
    Calendar,
    DollarSign,
    MapPin,
    Award,
    Bot,
    Compass,
    HelpCircle
  } from 'lucide-svelte';

  export let matchResult: MatchResult;

  $: factors = matchResult.factors;
  $: ai = matchResult.aiAnalysis;
</script>

<div class="breakdown-card">
  <!-- Top Match Score Summary -->
  <div class="score-summary-panel">
    <div class="score-header-flex">
      <MatchScoreBadge score={matchResult.score} size="lg" />
      <div class="score-info">
        <h4 class="score-title">
          {#if matchResult.score >= 90}
            High Relevance Match
          {:else if matchResult.score >= 80}
            Strong Alignment
          {:else if matchResult.score >= 65}
            Moderate Match
          {:else}
            Lower Compatibility
          {/if}
        </h4>
        <p class="score-calc-desc">
          Calculated via deterministic formula: Skills (40%) + Exp (20%) + Salary (15%) + Location (10%) + Seniority (10%) + Other (5%)
        </p>
      </div>
    </div>
  </div>

  <!-- Grounded AI Analysis -->
  {#if ai}
    <div class="ai-intelligence-panel">
      <div class="panel-header">
        <Bot size={15} class="ai-icon" />
        <span class="panel-title">Grounded Match Intelligence</span>
      </div>
      <p class="fit-summary-text">{ai.fitSummary}</p>

      <div class="analysis-grid">
        <!-- Strengths -->
        <div class="analysis-col">
          <div class="col-heading text-emerald">
            <Check size={13} />
            <span>Key Match Strengths</span>
          </div>
          <ul class="clean-bullet-list">
            {#each ai.keyStrengths as str}
              <li>{str}</li>
            {/each}
          </ul>
        </div>

        <!-- Considerations / Gaps -->
        <div class="analysis-col">
          <div class="col-heading text-amber">
            <AlertCircle size={13} />
            <span>Considerations &amp; Gaps</span>
          </div>
          <ul class="clean-bullet-list">
            {#each ai.potentialGaps as gap}
              <li>{gap}</li>
            {/each}
          </ul>
        </div>
      </div>

      <!-- Application Strategy -->
      <div class="strategy-grid">
        <div class="strategy-card">
          <div class="strat-header">
            <Compass size={13} />
            <span>Recommended Application Angle</span>
          </div>
          <p class="strat-content">{ai.recommendedApplicationAngle}</p>
        </div>

        <div class="strategy-card">
          <div class="strat-header">
            <HelpCircle size={13} />
            <span>Interview Preparation Focus</span>
          </div>
          <p class="strat-content">{ai.interviewTip}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Deterministic Breakdown Section (PRD Section 13) -->
  <div class="factors-container">
    <div class="factors-header">
      <span class="factors-title">Deterministic Scoring Breakdown (PRD Section 13)</span>
    </div>

    <!-- Skills Overlap (40%) -->
    <div class="factor-item">
      <div class="factor-title-row">
        <div class="factor-label">
          <Cpu size={13} class="factor-ic" />
          <span>Technical Skills Overlap (40% Weight)</span>
        </div>
        <span class="factor-percent">{factors.skills.score}%</span>
      </div>
      <div class="factor-progress">
        <div class="progress-fill fill-emerald" style="width: {factors.skills.score}%"></div>
      </div>
      <div class="skills-pill-group">
        {#each factors.skills.matched as s}
          <span class="eval-pill pill-matched"><Check size={10} /> {s}</span>
        {/each}
        {#each factors.skills.partial as s}
          <span class="eval-pill pill-partial"><AlertCircle size={10} /> {s} (Partial)</span>
        {/each}
        {#each factors.skills.missing as s}
          <span class="eval-pill pill-missing"><X size={10} /> {s} (Missing)</span>
        {/each}
      </div>
    </div>

    <!-- Experience (20%) -->
    <div class="factor-item">
      <div class="factor-title-row">
        <div class="factor-label">
          <Calendar size={13} class="factor-ic" />
          <span>Experience Level (20% Weight)</span>
        </div>
        <span class="factor-percent">{factors.experience.score}%</span>
      </div>
      <div class="factor-progress">
        <div class="progress-fill fill-slate" style="width: {factors.experience.score}%"></div>
      </div>
      <p class="factor-note">{factors.experience.explanation}</p>
    </div>

    <!-- Salary (15%) -->
    <div class="factor-item">
      <div class="factor-title-row">
        <div class="factor-label">
          <DollarSign size={13} class="factor-ic" />
          <span>Compensation Fit (15% Weight)</span>
        </div>
        <span class="factor-percent">{factors.salary.score}%</span>
      </div>
      <div class="factor-progress">
        <div class="progress-fill fill-emerald" style="width: {factors.salary.score}%"></div>
      </div>
      <p class="factor-note">{factors.salary.explanation}</p>
    </div>

    <!-- Location & Remote (10%) -->
    <div class="factor-item">
      <div class="factor-title-row">
        <div class="factor-label">
          <MapPin size={13} class="factor-ic" />
          <span>Location &amp; Remote Fit (10% Weight)</span>
        </div>
        <span class="factor-percent">{factors.location.score}%</span>
      </div>
      <div class="factor-progress">
        <div class="progress-fill fill-slate" style="width: {factors.location.score}%"></div>
      </div>
      <p class="factor-note">{factors.location.explanation}</p>
    </div>

    <!-- Seniority (10%) -->
    <div class="factor-item">
      <div class="factor-title-row">
        <div class="factor-label">
          <Award size={13} class="factor-ic" />
          <span>Seniority &amp; Role Scope (10% Weight)</span>
        </div>
        <span class="factor-percent">{factors.seniority.score}%</span>
      </div>
      <div class="factor-progress">
        <div class="progress-fill fill-slate" style="width: {factors.seniority.score}%"></div>
      </div>
      <p class="factor-note">{factors.seniority.explanation}</p>
    </div>
  </div>
</div>

<style>
  .breakdown-card {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .score-summary-panel {
    background: var(--bg-surface-raised);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 14px 18px;
  }

  .score-header-flex {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .score-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .score-title {
    font-size: 1.05rem;
    color: var(--text-primary);
  }

  .score-calc-desc {
    font-size: 0.74rem;
    color: var(--text-muted);
    line-height: 1.35;
  }

  .ai-intelligence-panel {
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  :global(.ai-icon) {
    color: var(--text-secondary);
  }

  .panel-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: 0.01em;
  }

  .fit-summary-text {
    font-size: 0.82rem;
    color: var(--text-secondary);
    line-height: 1.45;
  }

  .analysis-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .analysis-col {
    background: var(--bg-surface);
    border: 1px solid var(--border-faint);
    border-radius: var(--radius-sm);
    padding: 10px 12px;
  }

  .col-heading {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.76rem;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .text-emerald { color: #34d399; }
  .text-amber { color: #fbbf24; }

  .clean-bullet-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .clean-bullet-list li {
    font-size: 0.74rem;
    color: var(--text-muted);
    line-height: 1.35;
    position: relative;
    padding-left: 10px;
  }

  .clean-bullet-list li::before {
    content: '–';
    position: absolute;
    left: 0;
    color: var(--text-faint);
  }

  .strategy-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .strategy-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-faint);
    border-radius: var(--radius-sm);
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .strat-header {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.74rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .strat-content {
    font-size: 0.74rem;
    color: var(--text-muted);
    line-height: 1.35;
  }

  .factors-container {
    background: var(--bg-surface-raised);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .factors-header {
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border-faint);
  }

  .factors-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .factor-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .factor-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.76rem;
  }

  .factor-label {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  :global(.factor-ic) {
    color: var(--text-muted);
  }

  .factor-percent {
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--text-primary);
  }

  .factor-progress {
    width: 100%;
    height: 4px;
    background: var(--bg-input);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.4s ease-out;
  }
  .progress-fill.fill-emerald { background: #10b981; }
  .progress-fill.fill-slate { background: #64748b; }

  .factor-note {
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  .skills-pill-group {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 2px;
  }

  .eval-pill {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 1px 6px;
    border-radius: var(--radius-xs);
    font-size: 0.7rem;
    font-weight: 500;
  }

  .pill-matched {
    background: var(--accent-emerald-subtle);
    color: #34d399;
    border: 1px solid var(--accent-emerald-border);
  }

  .pill-partial {
    background: var(--accent-amber-subtle);
    color: #fbbf24;
    border: 1px solid var(--accent-amber-border);
  }

  .pill-missing {
    background: var(--accent-rose-subtle);
    color: #fb7185;
    border: 1px solid var(--accent-rose-border);
  }

  @media (max-width: 640px) {
    .analysis-grid, .strategy-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
