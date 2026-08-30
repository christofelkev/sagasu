<script lang="ts">
  import { applicationStore } from '$lib/stores/applicationStore';
  import { toasts } from '$lib/stores/toastStore';
  import {
    X,
    Sparkles,
    FileText,
    Mail,
    HelpCircle,
    MessageSquare,
    Copy,
    Check,
    Send
  } from 'lucide-svelte';

  const activePreparingAppId = applicationStore.activePreparingAppId;
  $: activeAppId = $activePreparingAppId;
  $: application = $applicationStore.find((a) => a.id === activeAppId);

  let activeTab: 'resume' | 'coverletter' | 'questions' | 'recruiter' = 'coverletter';
  let copiedField: string | null = null;
  let isGeneratingAI = false;

  function copyToClipboard(text: string, fieldName: string) {
    navigator.clipboard.writeText(text);
    copiedField = fieldName;
    toasts.success('Copied to Clipboard', `${fieldName} copied.`);
    setTimeout(() => {
      copiedField = null;
    }, 2000);
  }

  function handleApproveAndSubmit() {
    if (!application) return;
    if (!application.preparedMaterials?.approvedByUser) {
      toasts.warning('Approval Required', 'Please confirm your review before marking the application as applied.');
      return;
    }
    applicationStore.updateStatus(application.id, 'APPLIED', 'Application submitted with human verification.');
    applicationStore.closeStudio();
  }

  function simulateRegenerate() {
    isGeneratingAI = true;
    toasts.info('AI Grounding Engine', 'Refining tone and keyword alignment with job requirements...', 1600);
    setTimeout(() => {
      isGeneratingAI = false;
      toasts.success('Materials Refreshed', 'Cover letter and pitch updated.');
    }, 1200);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') applicationStore.closeStudio();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if application}
  {@const job = application.job}
  {@const mats = application.preparedMaterials}

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-backdrop" on:click={() => applicationStore.closeStudio()}>
    <div class="modal-content studio-modal" on:click|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
      <!-- Studio Header -->
      <div class="studio-header">
        <div class="header-left">
          <div class="studio-badge">
            <Sparkles size={12} />
            <span>APPLICATION STUDIO</span>
          </div>
          <h2 class="target-title">
            Tailoring for <span class="highlight">{job.title}</span> at <span class="highlight">{job.company}</span>
          </h2>
        </div>

        <button type="button" class="close-btn" on:click={() => applicationStore.closeStudio()} aria-label="Close studio">
          <X size={16} />
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="studio-nav-tabs">
        <button
          type="button"
          class="nav-tab {activeTab === 'coverletter' ? 'active' : ''}"
          on:click={() => (activeTab = 'coverletter')}
        >
          <Mail size={13} />
          <span>Cover Letter</span>
        </button>

        <button
          type="button"
          class="nav-tab {activeTab === 'resume' ? 'active' : ''}"
          on:click={() => (activeTab = 'resume')}
        >
          <FileText size={13} />
          <span>Resume Positioning</span>
        </button>

        <button
          type="button"
          class="nav-tab {activeTab === 'questions' ? 'active' : ''}"
          on:click={() => (activeTab = 'questions')}
        >
          <HelpCircle size={13} />
          <span>Q&amp;A Guide</span>
        </button>

        <button
          type="button"
          class="nav-tab {activeTab === 'recruiter' ? 'active' : ''}"
          on:click={() => (activeTab = 'recruiter')}
        >
          <MessageSquare size={13} />
          <span>Recruiter Note</span>
        </button>
      </div>

      <!-- Studio Body Content -->
      <div class="studio-body">
        {#if mats}
          <!-- 1. Cover Letter Tab -->
          {#if activeTab === 'coverletter'}
            <div class="editor-pane">
              <div class="pane-header">
                <div>
                  <h4 class="pane-title">Tailored Cover Letter</h4>
                  <p class="pane-sub">
                    Grounded in your verified experience and matched to {job.company}'s requirements.
                  </p>
                </div>
                <div class="header-tools">
                  <button
                    type="button"
                    class="btn btn-secondary btn-sm"
                    disabled={isGeneratingAI}
                    on:click={simulateRegenerate}
                  >
                    <Sparkles size={11} class={isGeneratingAI ? 'spin-icon' : ''} />
                    <span>Regenerate</span>
                  </button>
                  <button
                    type="button"
                    class="btn btn-secondary btn-sm"
                    on:click={() => copyToClipboard(mats.coverLetter, 'Cover Letter')}
                  >
                    {#if copiedField === 'Cover Letter'}
                      <Check size={11} class="text-emerald" />
                      <span>Copied</span>
                    {:else}
                      <Copy size={11} />
                      <span>Copy</span>
                    {/if}
                  </button>
                </div>
              </div>

              <textarea
                class="input-textarea letter-textarea"
                rows="13"
                value={mats.coverLetter}
                on:input={(e) =>
                  applicationStore.updateMaterials(application.id, { coverLetter: e.currentTarget.value })}
              ></textarea>
            </div>

          <!-- 2. Tailored Resume Tab -->
          {:else if activeTab === 'resume'}
            <div class="editor-pane">
              <div class="pane-header">
                <div>
                  <h4 class="pane-title">Resume Highlights</h4>
                  <p class="pane-sub">
                    Highlights aligned with {job.company}'s required stack: {job.skills.slice(0, 3).join(', ')}.
                  </p>
                </div>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  on:click={() =>
                    copyToClipboard(
                      `${mats.tailoredResume.headline}\n\n${mats.tailoredResume.summary}\n\n${mats.tailoredResume.targetedBulletPoints.join('\n')}`,
                      'Resume Highlights'
                    )}
                >
                  <Copy size={11} />
                  <span>Copy All</span>
                </button>
              </div>

              <!-- Tailored Headline -->
              <div class="form-group">
                <label for="headline-input" class="field-label">Headline</label>
                <input
                  id="headline-input"
                  type="text"
                  class="input-text"
                  value={mats.tailoredResume.headline}
                  on:input={(e) => {
                    const next = { ...mats.tailoredResume, headline: e.currentTarget.value };
                    applicationStore.updateMaterials(application.id, { tailoredResume: next });
                  }}
                />
              </div>

              <!-- Tailored Summary -->
              <div class="form-group">
                <label for="summary-input" class="field-label">Summary</label>
                <textarea
                  id="summary-input"
                  class="input-textarea"
                  rows="3"
                  value={mats.tailoredResume.summary}
                  on:input={(e) => {
                    const next = { ...mats.tailoredResume, summary: e.currentTarget.value };
                    applicationStore.updateMaterials(application.id, { tailoredResume: next });
                  }}
                ></textarea>
              </div>

              <!-- Prioritized Bullet Points -->
              <div class="form-group">
                <label for="bullet-input-0" class="field-label">Key Experience Bullets</label>
                <div class="bullets-list">
                  {#each mats.tailoredResume.targetedBulletPoints as bullet, idx}
                    <div class="bullet-item">
                      <span class="bullet-num">{idx + 1}</span>
                      <textarea
                        id="bullet-input-{idx}"
                        class="input-textarea bullet-input"
                        rows="2"
                        value={bullet}
                        on:input={(e) => {
                          const updated = [...mats.tailoredResume.targetedBulletPoints];
                          updated[idx] = e.currentTarget.value;
                          const next = { ...mats.tailoredResume, targetedBulletPoints: updated };
                          applicationStore.updateMaterials(application.id, { tailoredResume: next });
                        }}
                      ></textarea>
                    </div>
                  {/each}
                </div>
              </div>
            </div>

          <!-- 3. Application Questions Assistant Tab -->
          {:else if activeTab === 'questions'}
            <div class="editor-pane">
              <div class="pane-header">
                <div>
                  <h4 class="pane-title">Application Screening Answers</h4>
                  <p class="pane-sub">Drafted answers for portal screening questions.</p>
                </div>
              </div>

              <div class="questions-list">
                {#each mats.applicationQuestionsAnswers as qa, idx}
                  <div class="qa-card glass-panel">
                    <div class="qa-question-row">
                      <span class="qa-q-badge">Q{idx + 1}</span>
                      <h5 class="qa-q-title">{qa.question}</h5>
                      <button
                        type="button"
                        class="copy-qa-btn"
                        on:click={() => copyToClipboard(qa.answer, `Answer ${idx + 1}`)}
                        aria-label="Copy answer {idx + 1}"
                      >
                        <Copy size={11} />
                      </button>
                    </div>
                    <textarea
                      class="input-textarea qa-textarea"
                      rows="3"
                      value={qa.answer}
                      on:input={(e) => {
                        const updated = [...mats.applicationQuestionsAnswers];
                        updated[idx] = { ...updated[idx], answer: e.currentTarget.value };
                        applicationStore.updateMaterials(application.id, {
                          applicationQuestionsAnswers: updated
                        });
                      }}
                    ></textarea>
                    {#if qa.rationale}
                      <div class="qa-rationale">
                        <span class="rat-label">Rationale:</span>
                        <span>{qa.rationale}</span>
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>

          <!-- 4. Recruiter Outreach Tab -->
          {:else if activeTab === 'recruiter'}
            <div class="editor-pane">
              <div class="pane-header">
                <div>
                  <h4 class="pane-title">Direct Outreach Note</h4>
                  <p class="pane-sub">Direct message for LinkedIn InMail or recruiter email.</p>
                </div>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  on:click={() => copyToClipboard(mats.recruiterMessage, 'Recruiter Outreach')}
                >
                  <Copy size={11} />
                  <span>Copy</span>
                </button>
              </div>

              <textarea
                class="input-textarea"
                rows="6"
                value={mats.recruiterMessage}
                on:input={(e) =>
                  applicationStore.updateMaterials(application.id, { recruiterMessage: e.currentTarget.value })}
              ></textarea>
            </div>
          {/if}
        {/if}
      </div>

      <!-- Human Approval & Submission Boundary -->
      <div class="studio-footer">
        <div class="approval-box">
          <label class="approval-checkbox">
            <input
              type="checkbox"
              checked={mats?.approvedByUser}
              on:change={(e) =>
                applicationStore.updateMaterials(application.id, { approvedByUser: e.currentTarget.checked })}
            />
            <div class="check-box-square">
              {#if mats?.approvedByUser}
                <Check size={11} />
              {/if}
            </div>
            <div class="approval-text">
              <span class="approval-title">Human Verification</span>
              <span class="approval-sub">
                I have reviewed and customized these materials before applying.
              </span>
            </div>
          </label>
        </div>

        <div class="submission-actions">
          <button type="button" class="btn btn-ghost btn-sm" on:click={() => applicationStore.closeStudio()}>
            Save Draft
          </button>

          <button
            type="button"
            class="btn btn-emerald btn-sm submit-application-btn"
            disabled={!mats?.approvedByUser}
            on:click={handleApproveAndSubmit}
          >
            <Send size={12} />
            <span>Mark as Applied</span>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .studio-modal {
    max-width: 860px;
    height: 86vh;
    display: flex;
    flex-direction: column;
  }

  .studio-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-subtle);
    background: var(--bg-surface-raised);
  }

  .studio-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.7rem;
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.04em;
    margin-bottom: 3px;
  }

  .target-title {
    font-size: 1.05rem;
    color: var(--text-primary);
  }

  .highlight {
    color: var(--text-primary);
    font-weight: 700;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
  }
  .close-btn:hover {
    color: var(--text-primary);
  }

  .studio-nav-tabs {
    display: flex;
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border-subtle);
    padding: 0 16px;
    gap: 12px;
  }

  .nav-tab {
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

  .nav-tab:hover {
    color: var(--text-primary);
  }

  .nav-tab.active {
    color: var(--text-primary);
    border-bottom-color: #ffffff;
    font-weight: 600;
  }

  .studio-body {
    flex: 1;
    padding: 18px 20px;
    overflow-y: auto;
  }

  .editor-pane {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .pane-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .pane-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .pane-sub {
    font-size: 0.74rem;
    color: var(--text-muted);
  }

  .header-tools {
    display: flex;
    gap: 6px;
  }

  .letter-textarea {
    line-height: 1.55;
    font-size: 0.84rem;
    font-family: var(--font-sans);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field-label {
    font-size: 0.74rem;
    font-weight: 500;
    color: var(--text-muted);
  }

  .bullets-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .bullet-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .bullet-num {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 600;
    flex-shrink: 0;
    margin-top: 5px;
  }

  .bullet-input {
    flex: 1;
  }

  .questions-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .qa-card {
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--bg-input);
    border: 1px solid var(--border-faint);
  }

  .qa-question-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .qa-q-badge {
    background: var(--bg-surface-raised);
    color: var(--text-secondary);
    border: 1px solid var(--border-subtle);
    padding: 1px 5px;
    border-radius: var(--radius-xs);
    font-size: 0.68rem;
    font-family: var(--font-mono);
    font-weight: 600;
  }

  .qa-q-title {
    flex: 1;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .copy-qa-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 2px;
  }
  .copy-qa-btn:hover {
    color: var(--text-primary);
  }

  .qa-rationale {
    font-size: 0.72rem;
    color: var(--text-muted);
    background: var(--bg-surface);
    padding: 5px 8px;
    border-radius: var(--radius-xs);
  }

  .rat-label {
    color: var(--text-secondary);
    font-weight: 600;
    margin-right: 4px;
  }

  .studio-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-top: 1px solid var(--border-subtle);
    background: var(--bg-surface-raised);
    gap: 16px;
  }

  .approval-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }

  .approval-checkbox input {
    display: none;
  }

  .check-box-square {
    width: 18px;
    height: 18px;
    border-radius: 3px;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #34d399;
    flex-shrink: 0;
  }

  .approval-checkbox input:checked + .check-box-square {
    background: var(--accent-emerald-subtle);
    border-color: var(--accent-emerald-border);
  }

  .approval-title {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-primary);
    display: block;
  }

  .approval-sub {
    font-size: 0.7rem;
    color: var(--text-muted);
    display: block;
  }

  .submission-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
