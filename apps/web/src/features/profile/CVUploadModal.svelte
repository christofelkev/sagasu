<script lang="ts">
  import { profileStore } from '$lib/stores/profileStore';
  import { toasts } from '$lib/stores/toastStore';
  import {
    X,
    UploadCloud,
    FileText,
    Sparkles,
    Check
  } from 'lucide-svelte';

  export let onClose: () => void;

  let step: 'upload' | 'parsing' | 'review' = 'upload';
  let selectedFile: string = 'Raden_Manopo_Senior_Fullstack_2026.pdf';

  let extractedData = {
    careerHeadline: 'Senior Fullstack & AI Product Engineer',
    bio: 'Software engineer with 5+ years building performant web applications, TypeScript microservices, and human-in-the-loop AI workflows. Focused on Svelte, Bun, Elysia, and reactive architectures.',
    skills: [
      'TypeScript',
      'Svelte / SvelteKit',
      'Bun / Elysia',
      'PostgreSQL',
      'Redis',
      'Docker',
      'REST & GraphQL APIs',
      'System Design'
    ]
  };

  function startExtraction() {
    step = 'parsing';
    setTimeout(() => {
      step = 'review';
      toasts.success('CV Parsing Complete', 'Review extracted career parameters before merging.');
    }, 1200);
  }

  function handleConfirmApply() {
    profileStore.applyExtractedCVData(extractedData);
    onClose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-backdrop" on:click={onClose}>
  <div class="modal-content cv-modal" on:click|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
    <div class="modal-header">
      <div class="header-left">
        <div class="cv-badge">
          <Sparkles size={13} />
          <span>CV IMPORT &amp; EXTRACTION (PRD SECTION 8)</span>
        </div>
        <h3 class="modal-title">Extract Structured Career Profile</h3>
      </div>
      <button type="button" class="close-btn" on:click={onClose} aria-label="Close modal">
        <X size={16} />
      </button>
    </div>

    <div class="modal-body-scroll">
      <!-- Step 1: Upload / Dropzone -->
      {#if step === 'upload'}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="upload-zone" on:click={startExtraction}>
          <UploadCloud size={36} class="upload-icon" />
          <h4 class="upload-title">Drop your resume / CV here or click to browse</h4>
          <p class="upload-sub">Supports PDF, DOCX, TXT format (Max 10MB)</p>

          <div class="sample-pill">
            <FileText size={12} />
            <span>Sample selected: {selectedFile}</span>
          </div>

          <button type="button" class="btn btn-primary" on:click|stopPropagation={startExtraction}>
            <Sparkles size={13} />
            <span>Analyze &amp; Extract Parameters</span>
          </button>
        </div>

      <!-- Step 2: Parsing Animation -->
      {:else if step === 'parsing'}
        <div class="parsing-state">
          <div class="parsing-spinner"></div>
          <h4 class="parsing-title">Parsing CV Document...</h4>
          <p class="parsing-sub">
            Extracting career history, verified skill taxonomy, and contact coordinates.
          </p>
        </div>

      <!-- Step 3: Review Diff before applying (PRD Section 8) -->
      {:else if step === 'review'}
        <div class="review-pane">
          <div class="notice-card">
            <Check size={14} class="text-emerald" />
            <div class="notice-text">
              <span class="notice-title">Human-in-the-Loop Review (PRD Section 8)</span>
              <span class="notice-sub">
                Inspect extracted parameters before merging them into your canonical profile.
              </span>
            </div>
          </div>

          <!-- Extracted Title -->
          <div class="diff-card">
            <label for="ext-headline" class="diff-heading">Extracted Professional Headline</label>
            <input
              id="ext-headline"
              type="text"
              class="input-text"
              bind:value={extractedData.careerHeadline}
            />
          </div>

          <!-- Extracted Bio -->
          <div class="diff-card">
            <label for="ext-bio" class="diff-heading">Extracted Professional Summary</label>
            <textarea
              id="ext-bio"
              class="input-textarea"
              rows="3"
              bind:value={extractedData.bio}
            ></textarea>
          </div>

          <!-- Extracted Skills Matrix -->
          <div class="diff-card">
            <span class="diff-heading">Extracted Technical Skills ({extractedData.skills.length})</span>
            <div class="skills-chips-review">
              {#each extractedData.skills as skill}
                <span class="skill-pill-review">
                  <Check size={11} class="text-emerald" />
                  {skill}
                </span>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-ghost btn-sm" on:click={onClose}>
        Cancel
      </button>
      {#if step === 'review'}
        <button type="button" class="btn btn-emerald" on:click={handleConfirmApply}>
          <Check size={13} />
          <span>Confirm &amp; Merge into Profile</span>
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .cv-modal {
    max-width: 640px;
  }

  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-subtle);
    background: var(--bg-surface-raised);
  }

  .cv-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.68rem;
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.04em;
    margin-bottom: 2px;
  }

  .modal-title {
    font-size: 1.05rem;
    color: var(--text-primary);
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
    padding: 18px 20px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .upload-zone {
    padding: 36px 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    border: 1px dashed var(--border-subtle);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    transition: border-color var(--transition-fast);
  }
  .upload-zone:hover {
    border-color: var(--border-strong);
  }

  :global(.upload-icon) {
    color: var(--text-muted);
  }

  .upload-title {
    font-size: 0.95rem;
    color: var(--text-primary);
  }

  .upload-sub {
    font-size: 0.74rem;
    color: var(--text-muted);
  }

  .sample-pill {
    display: flex;
    align-items: center;
    gap: 5px;
    background: var(--bg-input);
    padding: 3px 8px;
    border-radius: var(--radius-xs);
    font-size: 0.72rem;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  .parsing-state {
    padding: 40px 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .parsing-spinner {
    width: 32px;
    height: 32px;
    border: 2px solid var(--border-subtle);
    border-top-color: var(--text-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .parsing-title {
    font-size: 0.98rem;
    color: var(--text-primary);
  }

  .parsing-sub {
    font-size: 0.76rem;
    color: var(--text-muted);
    max-width: 360px;
  }

  .review-pane {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .notice-card {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
    background: var(--accent-emerald-subtle);
    border: 1px solid var(--accent-emerald-border);
    border-radius: var(--radius-xs);
  }

  .notice-title {
    font-size: 0.76rem;
    font-weight: 600;
    color: #34d399;
    display: block;
  }

  .notice-sub {
    font-size: 0.7rem;
    color: var(--text-muted);
    display: block;
  }

  .diff-card {
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
  }

  .diff-heading {
    font-size: 0.76rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .skills-chips-review {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .skill-pill-review {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--bg-input);
    color: var(--text-primary);
    border: 1px solid var(--border-subtle);
    padding: 2px 7px;
    border-radius: var(--radius-xs);
    font-size: 0.72rem;
    font-weight: 500;
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 20px;
    border-top: 1px solid var(--border-subtle);
    background: var(--bg-surface-raised);
  }
</style>
