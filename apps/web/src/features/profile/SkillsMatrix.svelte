<script lang="ts">
  import { profileStore } from '$lib/stores/profileStore';
  import type { ProfileSkill, SkillCategory, SkillLevel } from '@sagasu/api-contract';
  import { Plus, X, Check } from 'lucide-svelte';

  export let skills: ProfileSkill[] = [];

  let newSkillName = '';
  let newSkillCategory: SkillCategory = 'frameworks';
  let newSkillLevel: SkillLevel = 'proficient';
  let newSkillYears = 3;
  let isAdding = false;

  const categories: { id: SkillCategory; label: string }[] = [
    { id: 'languages', label: 'Languages' },
    { id: 'frameworks', label: 'Frameworks & Libraries' },
    { id: 'databases', label: 'Databases & Storage' },
    { id: 'cloud', label: 'Cloud & Infrastructure' },
    { id: 'tools', label: 'Tools & Ecosystem' },
    { id: 'soft', label: 'Architecture & Leadership' }
  ];

  function getSkillsByCategory(cat: SkillCategory) {
    return skills.filter((s) => s.category === cat);
  }

  function handleAddSkill() {
    if (!newSkillName.trim()) return;
    profileStore.addSkill({
      name: newSkillName.trim(),
      category: newSkillCategory,
      level: newSkillLevel,
      yearsOfExperience: newSkillYears
    });
    newSkillName = '';
    isAdding = false;
  }
</script>

<div class="skills-matrix-view">
  <div class="matrix-header">
    <div>
      <h3 class="section-title">Verified Skills Matrix</h3>
      <p class="section-sub">
        Directly powers the deterministic skill matching algorithm (40% weight).
      </p>
    </div>

    <button
      type="button"
      class="btn btn-secondary btn-sm"
      on:click={() => (isAdding = !isAdding)}
    >
      <Plus size={13} />
      <span>{isAdding ? 'Close' : 'Add Skill'}</span>
    </button>
  </div>

  <!-- Add Skill Drawer -->
  {#if isAdding}
    <div class="add-skill-card">
      <h4 class="form-title">Add Technical Skill</h4>
      <div class="form-grid">
        <div class="form-field">
          <label for="new-skill-name" class="field-lbl">Skill Name</label>
          <input
            id="new-skill-name"
            type="text"
            class="input-text"
            placeholder="e.g. Svelte, Bun, PostgreSQL"
            bind:value={newSkillName}
          />
        </div>

        <div class="form-field">
          <label for="new-skill-cat" class="field-lbl">Category</label>
          <select id="new-skill-cat" class="input-select" bind:value={newSkillCategory}>
            {#each categories as c}
              <option value={c.id}>{c.label}</option>
            {/each}
          </select>
        </div>

        <div class="form-field">
          <label for="new-skill-level" class="field-lbl">Proficiency</label>
          <select id="new-skill-level" class="input-select" bind:value={newSkillLevel}>
            <option value="expert">Expert</option>
            <option value="proficient">Proficient</option>
            <option value="familiar">Familiar</option>
          </select>
        </div>

        <div class="form-field">
          <label for="new-skill-years" class="field-lbl">Years</label>
          <input
            id="new-skill-years"
            type="number"
            class="input-text"
            min="1"
            max="20"
            bind:value={newSkillYears}
          />
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-ghost btn-sm" on:click={() => (isAdding = false)}>
          Cancel
        </button>
        <button type="button" class="btn btn-primary btn-sm" on:click={handleAddSkill}>
          <Check size={12} />
          <span>Save Skill</span>
        </button>
      </div>
    </div>
  {/if}

  <!-- Categories Matrix Grid -->
  <div class="categories-grid">
    {#each categories as cat}
      {@const catSkills = getSkillsByCategory(cat.id)}
      <div class="cat-card">
        <div class="cat-header">
          <span class="cat-name">{cat.label}</span>
          <span class="cat-count">{catSkills.length}</span>
        </div>

        <div class="cat-skills-list">
          {#each catSkills as skill (skill.id)}
            <div class="skill-tag skill-level-{skill.level}">
              <div class="skill-main-text">
                <span class="skill-name">{skill.name}</span>
                <span class="skill-years">{skill.yearsOfExperience}y</span>
              </div>
              <span class="skill-level-badge">{skill.level}</span>
              <button
                type="button"
                class="remove-skill-btn"
                on:click={() => profileStore.removeSkill(skill.id)}
                title="Remove skill"
                aria-label="Remove {skill.name}"
              >
                <X size={10} />
              </button>
            </div>
          {/each}
          {#if catSkills.length === 0}
            <span class="empty-cat">No skills added</span>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .skills-matrix-view {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .matrix-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .section-title {
    font-size: 1.05rem;
    color: var(--text-primary);
  }

  .section-sub {
    font-size: 0.74rem;
    color: var(--text-muted);
  }

  .add-skill-card {
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
  }

  .form-title {
    font-size: 0.86rem;
    color: var(--text-primary);
  }

  .form-grid {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1fr 0.8fr;
    gap: 10px;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .field-lbl {
    font-size: 0.7rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 2px;
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
    gap: 12px;
  }

  .cat-card {
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
  }

  .cat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border-faint);
  }

  .cat-name {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .cat-count {
    font-size: 0.68rem;
    font-family: var(--font-mono);
    color: var(--text-muted);
    background: var(--bg-input);
    padding: 1px 5px;
    border-radius: var(--radius-xs);
  }

  .cat-skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .skill-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 6px 3px 8px;
    border-radius: var(--radius-xs);
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    font-size: 0.74rem;
  }

  .skill-main-text {
    display: flex;
    align-items: baseline;
    gap: 3px;
  }

  .skill-name {
    font-weight: 500;
    color: var(--text-primary);
  }

  .skill-years {
    font-size: 0.66rem;
    font-family: var(--font-mono);
    color: var(--text-muted);
  }

  .skill-level-badge {
    font-size: 0.62rem;
    text-transform: uppercase;
    font-weight: 600;
    padding: 1px 3px;
    border-radius: 2px;
    background: var(--bg-surface-raised);
    color: var(--text-muted);
  }

  .remove-skill-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 1px;
  }
  .remove-skill-btn:hover {
    color: #fb7185;
  }

  .empty-cat {
    font-size: 0.72rem;
    color: var(--text-faint);
  }

  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
