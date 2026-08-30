<script lang="ts">
  import type { Application } from '@sagasu/api-contract';
  import { applicationStore } from '$lib/stores/applicationStore';
  import MatchScoreBadge from '../jobs/MatchScoreBadge.svelte';
  import {
    X,
    Clock,
    User,
    Sparkles
  } from 'lucide-svelte';

  export let application: Application;
  export let onClose: () => void;

  $: job = application.job;
  $: history = application.statusHistory;

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-backdrop" on:click={onClose}>
  <div class="modal-content timeline-modal" on:click|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
    <div class="modal-header">
      <div class="header-info">
        <h3 class="modal-title">Application Audit Timeline</h3>
        <p class="modal-sub">
          {job.title} at <span class="comp-highlight">{job.company}</span>
        </p>
      </div>
      <button type="button" class="close-btn" on:click={onClose} aria-label="Close timeline">
        <X size={16} />
      </button>
    </div>

    <div class="modal-body-scroll">
      <!-- Status & Meta Grid -->
      <div class="meta-grid">
        <div class="meta-card">
          <span class="meta-label">Current Pipeline Status</span>
          <span class="status-tag">
            {application.status}
          </span>
        </div>
        <div class="meta-card">
          <span class="meta-label">Compatibility Match</span>
          <div class="score-row">
            <MatchScoreBadge score={job.matchScore} size="sm" />
            <span class="match-desc">{job.matchResult.score}% Compatibility</span>
          </div>
        </div>
      </div>

      <!-- Recruiter & Contact Info -->
      {#if application.contactPerson}
        <div class="contact-card">
          <div class="contact-header">
            <User size={13} class="contact-ic" />
            <span class="contact-title">Hiring Contact</span>
          </div>
          <div class="contact-details">
            <span class="contact-name">{application.contactPerson.name}</span>
            <span class="contact-role">({application.contactPerson.role})</span>
            {#if application.contactPerson.emailOrLink}
              <span class="contact-email">{application.contactPerson.emailOrLink}</span>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Timeline Events List -->
      <div class="timeline-section">
        <h4 class="timeline-heading">Status History Trail (PRD Section 21)</h4>
        <div class="timeline-list">
          {#each history as event, idx}
            <div class="timeline-item">
              <div class="timeline-marker">
                <div class="marker-dot"></div>
                {#if idx < history.length - 1}
                  <div class="marker-line"></div>
                {/if}
              </div>
              <div class="timeline-content">
                <div class="event-header">
                  <span class="event-status">{event.status}</span>
                  <span class="event-time">
                    <Clock size={10} />
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
                {#if event.note}
                  <p class="event-note">{event.note}</p>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-ghost btn-sm" on:click={onClose}>
        Close
      </button>
      <button
        type="button"
        class="btn btn-primary btn-sm"
        on:click={() => {
          onClose();
          applicationStore.openStudioForJob(job);
        }}
      >
        <Sparkles size={12} />
        <span>Open Application Studio</span>
      </button>
    </div>
  </div>
</div>

<style>
  .timeline-modal {
    max-width: 600px;
  }

  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-subtle);
    background: var(--bg-surface-raised);
  }

  .modal-title {
    font-size: 1.05rem;
    color: var(--text-primary);
  }

  .modal-sub {
    font-size: 0.76rem;
    color: var(--text-muted);
  }

  .comp-highlight {
    color: var(--text-primary);
    font-weight: 500;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 2px;
  }
  .close-btn:hover {
    color: var(--text-primary);
  }

  .modal-body-scroll {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .meta-card {
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
  }

  .meta-label {
    font-size: 0.68rem;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .status-tag {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .score-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .match-desc {
    font-size: 0.76rem;
    color: var(--text-secondary);
  }

  .contact-card {
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
  }

  .contact-header {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .contact-details {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.76rem;
  }

  .contact-name {
    font-weight: 600;
    color: var(--text-primary);
  }

  .contact-role {
    color: var(--text-muted);
  }

  .contact-email {
    color: var(--text-secondary);
    font-family: var(--font-mono);
    font-size: 0.72rem;
  }

  .timeline-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .timeline-heading {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .timeline-list {
    display: flex;
    flex-direction: column;
  }

  .timeline-item {
    display: flex;
    gap: 12px;
  }

  .timeline-marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 14px;
  }

  .marker-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--text-primary);
    margin-top: 12px;
    flex-shrink: 0;
  }

  .marker-line {
    width: 1px;
    flex: 1;
    background: var(--border-subtle);
    margin: 3px 0;
  }

  .timeline-content {
    flex: 1;
    padding: 8px 12px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
  }

  .event-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .event-status {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .event-time {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 0.68rem;
    color: var(--text-muted);
  }

  .event-note {
    font-size: 0.74rem;
    color: var(--text-secondary);
    line-height: 1.35;
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-top: 1px solid var(--border-subtle);
    background: var(--bg-surface-raised);
  }
</style>
