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
</div>

<style>
  .app-shell {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-canvas);
    overflow: hidden;
  }

  .main-content {
    flex: 1;
    max-width: 1560px;
    width: 100%;
    margin: 0 auto;
    padding: 12px 20px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 1024px) {
    .app-shell {
      height: auto;
      min-height: 100vh;
      overflow: visible;
    }
    .main-content {
      overflow: visible;
      padding: 12px 14px 40px;
    }
  }
</style>
