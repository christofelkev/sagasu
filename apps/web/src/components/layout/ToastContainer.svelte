<script lang="ts">
  import { toasts } from '$lib/stores/toastStore';
  import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-svelte';
</script>

<div class="toast-container">
  {#each $toasts as toast (toast.id)}
    <div class="toast-card toast-{toast.type}">
      <div class="toast-icon">
        {#if toast.type === 'success'}
          <CheckCircle2 size={18} />
        {:else if toast.type === 'error'}
          <AlertCircle size={18} />
        {:else if toast.type === 'warning'}
          <AlertTriangle size={18} />
        {:else}
          <Info size={18} />
        {/if}
      </div>
      <div class="toast-body">
        <div class="toast-title">{toast.title}</div>
        <div class="toast-msg">{toast.message}</div>
      </div>
      <button class="toast-close" on:click={() => toasts.remove(toast.id)}>
        <X size={14} />
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 380px;
    pointer-events: none;
  }

  .toast-card {
    pointer-events: auto;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    border-radius: var(--radius-md);
    background: #0e1424;
    border: 1px solid var(--border-subtle);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes toastSlideIn {
    from {
      opacity: 0;
      transform: translateX(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  .toast-icon {
    margin-top: 2px;
    flex-shrink: 0;
  }

  .toast-success .toast-icon { color: var(--accent-emerald-light); }
  .toast-success { border-color: rgba(16, 185, 129, 0.35); }

  .toast-error .toast-icon { color: var(--accent-rose-light); }
  .toast-error { border-color: rgba(244, 63, 94, 0.35); }

  .toast-warning .toast-icon { color: var(--accent-amber-light); }
  .toast-warning { border-color: rgba(245, 158, 11, 0.35); }

  .toast-info .toast-icon { color: var(--accent-cyan-light); }
  .toast-info { border-color: rgba(6, 182, 212, 0.35); }

  .toast-body {
    flex: 1;
  }

  .toast-title {
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--text-white);
    margin-bottom: 2px;
  }

  .toast-msg {
    font-size: 0.78rem;
    color: var(--text-secondary);
    line-height: 1.35;
  }

  .toast-close {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 2px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color var(--transition-fast);
  }
  .toast-close:hover {
    color: var(--text-white);
  }
</style>
