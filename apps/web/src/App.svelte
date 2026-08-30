<script lang="ts">
  import Header from './components/layout/Header.svelte';
  import ToastContainer from './components/layout/ToastContainer.svelte';
  import JobList from './features/jobs/JobList.svelte';
  import ApplicationKanban from './features/applications/ApplicationKanban.svelte';
  import ProfileView from './features/profile/ProfileView.svelte';
  import PreferencesView from './features/preferences/PreferencesView.svelte';
  import ApplicationStudioModal from './features/prepare/ApplicationStudioModal.svelte';

  let activeTab: 'jobs' | 'applications' | 'profile' | 'preferences' = 'jobs';
</script>

<div class="app-shell">
  <!-- Top Navigation -->
  <Header bind:activeTab />

  <!-- Main Workspace -->
  <main class="main-content">
    {#if activeTab === 'jobs'}
      <JobList />
    {:else if activeTab === 'applications'}
      <ApplicationKanban />
    {:else if activeTab === 'profile'}
      <ProfileView />
    {:else if activeTab === 'preferences'}
      <PreferencesView />
    {/if}
  </main>

  <!-- Global Modals & Notifications -->
  <ApplicationStudioModal />
  <ToastContainer />

  <!-- Footer -->
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-left">
        <span class="footer-brand">SAGASU 探す</span>
        <span class="footer-tagline">— "SAGASU finds the opportunities. You decide where to apply."</span>
      </div>
      <div class="footer-right">
        <span class="footer-meta">Frontend v0.1.0 · Svelte 5 + TypeScript</span>
      </div>
    </div>
  </footer>
</div>

<style>
  .app-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-canvas);
  }

  .main-content {
    flex: 1;
    max-width: 1360px;
    width: 100%;
    margin: 0 auto;
    padding: 20px 24px 48px;
  }

  .app-footer {
    border-top: 1px solid var(--border-subtle);
    background: var(--bg-surface);
    padding: 14px 24px;
    margin-top: auto;
  }

  .footer-container {
    max-width: 1360px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    font-size: 0.76rem;
    color: var(--text-muted);
  }

  .footer-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .footer-brand {
    font-weight: 600;
    color: var(--text-primary);
  }

  .footer-tagline {
    color: var(--text-muted);
  }

  .footer-meta {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-faint);
  }
</style>
