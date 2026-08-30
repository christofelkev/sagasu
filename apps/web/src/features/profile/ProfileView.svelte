<script lang="ts">
  import { profileStore } from '$lib/stores/profileStore';
  import SkillsMatrix from './SkillsMatrix.svelte';
  import CVUploadModal from './CVUploadModal.svelte';
  import {
    User,
    Briefcase,
    Sparkles,
    RotateCcw,
    GraduationCap,
    MapPin,
    Mail
  } from 'lucide-svelte';

  let activeSubTab: 'personal' | 'skills' | 'experience' = 'personal';
  let showCVModal = false;

  $: profile = $profileStore;
  $: personal = profile.personal;
  $: career = profile.career;

  function handleSavePersonal() {
    profileStore.updatePersonal(personal);
  }

  function handleSaveCareer() {
    profileStore.updateCareer(career);
  }
</script>

<div class="profile-view">
  <!-- Profile Header Card -->
  <div class="profile-header glass-panel">
    <div class="header-main">
      <div class="avatar-box">
        <span class="avatar-initials">
          {personal.name.split(' ').map((n) => n[0]).join('')}
        </span>
      </div>
      <div class="user-meta">
        <h2 class="user-name">{personal.name}</h2>
        <p class="user-title">{personal.title}</p>
        <div class="user-coords">
          <span class="coord"><MapPin size={11} /> {personal.location}</span>
          <span class="coord"><Mail size={11} /> {personal.email}</span>
          <span class="badge badge-neutral">{career.yearsOfExperience}+ Years Experience</span>
          <span class="badge badge-emerald">
            {career.remotePreference === 'remote_only' ? 'Remote Preferred' : 'Flexible'}
          </span>
        </div>
      </div>
    </div>

    <div class="header-actions">
      <button type="button" class="btn btn-primary btn-sm" on:click={() => (showCVModal = true)}>
        <Sparkles size={13} />
        <span>Import / Update from CV</span>
      </button>
      <button type="button" class="btn btn-ghost btn-sm" on:click={() => profileStore.resetToDefault()}>
        <RotateCcw size={12} />
        <span>Reset Defaults</span>
      </button>
    </div>
  </div>

  <!-- Sub Navigation Tabs -->
  <div class="sub-nav-tabs">
    <button
      type="button"
      class="sub-tab {activeSubTab === 'personal' ? 'active' : ''}"
      on:click={() => (activeSubTab = 'personal')}
    >
      <User size={14} />
      <span>Personal &amp; Career Criteria</span>
    </button>

    <button
      type="button"
      class="sub-tab {activeSubTab === 'skills' ? 'active' : ''}"
      on:click={() => (activeSubTab = 'skills')}
    >
      <Sparkles size={14} />
      <span>Skills Matrix ({profile.skills.length})</span>
    </button>

    <button
      type="button"
      class="sub-tab {activeSubTab === 'experience' ? 'active' : ''}"
      on:click={() => (activeSubTab = 'experience')}
    >
      <Briefcase size={14} />
      <span>Work History &amp; Education</span>
    </button>
  </div>

  <!-- Subtab Content -->
  <div class="tab-content">
    {#if activeSubTab === 'personal'}
      <div class="personal-form-grid">
        <!-- Personal Coordinates Card -->
        <div class="card glass-panel">
          <h3 class="card-title">Personal Information</h3>
          <div class="form-grid-2">
            <div class="form-group">
              <label for="prof-fullname" class="field-lbl">Full Name</label>
              <input id="prof-fullname" type="text" class="input-text" bind:value={personal.name} on:change={handleSavePersonal} />
            </div>
            <div class="form-group">
              <label for="prof-headline" class="field-lbl">Professional Headline</label>
              <input id="prof-headline" type="text" class="input-text" bind:value={personal.title} on:change={handleSavePersonal} />
            </div>
            <div class="form-group">
              <label for="prof-email" class="field-lbl">Email Address</label>
              <input id="prof-email" type="email" class="input-text" bind:value={personal.email} on:change={handleSavePersonal} />
            </div>
            <div class="form-group">
              <label for="prof-loc" class="field-lbl">Location</label>
              <input id="prof-loc" type="text" class="input-text" bind:value={personal.location} on:change={handleSavePersonal} />
            </div>
          </div>

          <div class="form-group">
            <label for="prof-bio" class="field-lbl">Executive Summary &amp; Bio</label>
            <textarea id="prof-bio" class="input-textarea" rows="3" bind:value={personal.bio} on:change={handleSavePersonal}></textarea>
          </div>
        </div>

        <!-- Career Criteria Card -->
        <div class="card glass-panel">
          <div class="card-header-row">
            <div>
              <h3 class="card-title">Career Matching Parameters</h3>
              <p class="card-subtitle">
                Parameters used to evaluate opportunity fit, salary, and remote alignment.
              </p>
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label for="prof-exp-years" class="field-lbl">Years of Professional Experience</label>
              <input
                id="prof-exp-years"
                type="number"
                class="input-text"
                min="0"
                max="30"
                bind:value={career.yearsOfExperience}
                on:change={handleSaveCareer}
              />
            </div>

            <div class="form-group">
              <label for="prof-min-salary" class="field-lbl">Minimum Target Salary (Monthly IDR)</label>
              <input
                id="prof-min-salary"
                type="number"
                step="1000000"
                class="input-text"
                bind:value={career.minimumSalary.amount}
                on:change={handleSaveCareer}
              />
            </div>

            <div class="form-group">
              <label for="prof-remote-pref" class="field-lbl">Remote Preference</label>
              <select id="prof-remote-pref" class="input-select" bind:value={career.remotePreference} on:change={handleSaveCareer}>
                <option value="remote_only">Remote Only</option>
                <option value="hybrid">Hybrid / Remote Preferred</option>
                <option value="onsite">Onsite Only</option>
                <option value="any">Flexible / Any</option>
              </select>
            </div>

            <div class="form-group">
              <label for="prof-pref-locs" class="field-lbl">Preferred Locations (Comma Separated)</label>
              <input
                id="prof-pref-locs"
                type="text"
                class="input-text"
                value={career.preferredLocations.join(', ')}
                on:change={(e) => {
                  career.preferredLocations = e.currentTarget.value.split(',').map((x) => x.trim());
                  handleSaveCareer();
                }}
              />
            </div>
          </div>

          <div class="form-group">
            <label for="prof-target-roles" class="field-lbl">Target Roles (Comma Separated)</label>
            <input
              id="prof-target-roles"
              type="text"
              class="input-text"
              value={career.desiredRoles.join(', ')}
              on:change={(e) => {
                career.desiredRoles = e.currentTarget.value.split(',').map((x) => x.trim());
                handleSaveCareer();
              }}
            />
          </div>
        </div>
      </div>

    {:else if activeSubTab === 'skills'}
      <SkillsMatrix skills={profile.skills} />

    {:else if activeSubTab === 'experience'}
      <div class="experience-view">
        <!-- Work Experience List -->
        <div class="card glass-panel">
          <h3 class="card-title">Work Experience</h3>
          <div class="timeline-exp-list">
            {#each profile.experiences as exp (exp.id)}
              <div class="exp-item">
                <div class="exp-header">
                  <div>
                    <h4 class="exp-role">{exp.role}</h4>
                    <span class="exp-company">{exp.company} • {exp.location}</span>
                  </div>
                  <span class="exp-dates">{exp.startDate} — {exp.endDate}</span>
                </div>
                <ul class="exp-resp-list">
                  {#each exp.responsibilities as resp}
                    <li>{resp}</li>
                  {/each}
                </ul>
                <div class="exp-tech-tags">
                  {#each exp.technologies as tech}
                    <span class="tech-tag">{tech}</span>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Education List -->
        <div class="card glass-panel">
          <h3 class="card-title">Education</h3>
          <div class="edu-list">
            {#each profile.educations as edu (edu.id)}
              <div class="edu-item">
                <div class="edu-icon-box">
                  <GraduationCap size={16} />
                </div>
                <div class="edu-details">
                  <h4 class="edu-deg">{edu.degree} in {edu.field}</h4>
                  <span class="edu-inst">{edu.institution} ({edu.startYear} — {edu.endYear})</span>
                  {#if edu.gpa}
                    <span class="edu-gpa">GPA: {edu.gpa}</span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- CV Upload Modal -->
  {#if showCVModal}
    <CVUploadModal onClose={() => (showCVModal = false)} />
  {/if}
</div>

<style>
  .profile-view {
    max-width: 1040px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .profile-header {
    padding: 24px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-xs);
  }

  .header-main {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .avatar-box {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-sm);
    background: var(--bg-surface-raised);
    border: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-xs);
  }

  .avatar-initials {
    font-family: var(--font-mono);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--accent-primary);
  }

  .user-meta {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .user-name {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .user-title {
    font-size: 0.88rem;
    color: var(--text-secondary);
  }

  .user-coords {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 4px;
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .coord {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sub-nav-tabs {
    display: flex;
    gap: 4px;
    background: var(--bg-surface-raised);
    border: 1px solid var(--border-subtle);
    padding: 4px;
    border-radius: var(--radius-md);
    width: fit-content;
  }

  .sub-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    font-size: 0.84rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .sub-tab:hover {
    color: var(--text-primary);
  }

  .sub-tab.active {
    background: var(--bg-surface);
    color: var(--accent-primary);
    font-weight: 600;
    box-shadow: var(--shadow-xs);
  }

  .personal-form-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .card {
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-xs);
  }

  .card-title {
    font-size: 1.08rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .card-subtitle {
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  .form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-lbl {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .timeline-exp-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .exp-item {
    padding: 16px 18px;
    background: var(--bg-surface-raised);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .exp-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .exp-role {
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .exp-company {
    font-size: 0.74rem;
    color: var(--text-secondary);
  }

  .exp-dates {
    font-size: 0.7rem;
    font-family: var(--font-mono);
    color: var(--text-muted);
  }

  .exp-resp-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .exp-resp-list li {
    font-size: 0.76rem;
    color: var(--text-secondary);
    position: relative;
    padding-left: 12px;
    line-height: 1.4;
  }

  .exp-resp-list li::before {
    content: '–';
    position: absolute;
    left: 0;
    color: var(--text-faint);
  }

  .exp-tech-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 2px;
  }

  .tech-tag {
    background: var(--bg-surface);
    color: var(--text-secondary);
    border: 1px solid var(--border-subtle);
    padding: 1px 6px;
    border-radius: var(--radius-xs);
    font-size: 0.68rem;
  }

  .edu-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .edu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: var(--bg-input);
    border: 1px solid var(--border-faint);
    border-radius: var(--radius-sm);
  }

  .edu-icon-box {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-xs);
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .edu-deg {
    font-size: 0.84rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .edu-inst {
    font-size: 0.74rem;
    color: var(--text-muted);
    display: block;
  }

  .edu-gpa {
    font-size: 0.7rem;
    color: #34d399;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .form-grid-2 {
      grid-template-columns: 1fr;
    }
  }
</style>
