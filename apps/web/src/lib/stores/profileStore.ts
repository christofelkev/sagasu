import { writable, get } from 'svelte/store';
import type { UserProfile, ProfileSkill, ExperienceItem, EducationItem } from '@sagasu/api-contract';
import { initialProfile } from '../mock/initialData';
import { toasts } from './toastStore';
import { api } from '../api/client';

const STORAGE_KEY = 'sagasu_user_profile_v1';

function getStoredProfile(): UserProfile {
  if (typeof window === 'undefined') return initialProfile;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse stored profile', e);
  }
  return initialProfile;
}

function createProfileStore() {
  const { subscribe, set, update } = writable<UserProfile>(getStoredProfile());

  function saveAndNotify(newProfile: UserProfile) {
    newProfile.updatedAt = new Date().toISOString();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    }
    set(newProfile);
  }

  // Hydrate from backend API if available
  if (typeof window !== 'undefined') {
    api
      .getProfile()
      .then((serverProfile) => {
        if (serverProfile && serverProfile.personal) {
          saveAndNotify(serverProfile);
        }
      })
      .catch((err) => {
        console.info('Backend profile sync using cached store:', err.message);
      });
  }

  return {
    subscribe,
    updatePersonal: (personal: Partial<UserProfile['personal']>) => {
      update((profile) => {
        const next = { ...profile, personal: { ...profile.personal, ...personal } };
        saveAndNotify(next);
        toasts.success('Profile Updated', 'Personal details saved successfully.');
        api.updateProfile({ personal: next.personal }).catch(() => {});
        return next;
      });
    },
    updateCareer: (career: Partial<UserProfile['career']>) => {
      update((profile) => {
        const next = { ...profile, career: { ...profile.career, ...career } };
        saveAndNotify(next);
        toasts.success('Preferences Updated', 'Target roles and compensation criteria updated.');
        api.updateProfile({ career: next.career }).catch(() => {});
        return next;
      });
    },
    addSkill: (skill: Omit<ProfileSkill, 'id'>) => {
      const newSkillId = `sk-${Date.now()}`;
      update((profile) => {
        const newSkill: ProfileSkill = { ...skill, id: newSkillId };
        const next = { ...profile, skills: [...profile.skills, newSkill] };
        saveAndNotify(next);
        toasts.success('Skill Added', `Added ${skill.name} to skills matrix.`);
        api.addSkill({ ...skill, id: newSkillId }).catch(() => {});
        return next;
      });
    },
    removeSkill: (id: string) => {
      update((profile) => {
        const next = { ...profile, skills: profile.skills.filter((s) => s.id !== id) };
        saveAndNotify(next);
        toasts.info('Skill Removed', 'Skills matrix updated.');
        api.removeSkill(id).catch(() => {});
        return next;
      });
    },
    updateSkill: (id: string, updates: Partial<ProfileSkill>) => {
      update((profile) => {
        const skill = profile.skills.find((s) => s.id === id);
        const next = {
          ...profile,
          skills: profile.skills.map((s) => (s.id === id ? { ...s, ...updates } : s))
        };
        saveAndNotify(next);
        if (skill) {
          api.addSkill({ ...skill, ...updates, id }).catch(() => {});
        }
        return next;
      });
    },
    addExperience: (exp: Omit<ExperienceItem, 'id'>) => {
      update((profile) => {
        const newExp: ExperienceItem = { ...exp, id: `exp-${Date.now()}` };
        const next = { ...profile, experiences: [newExp, ...profile.experiences] };
        saveAndNotify(next);
        toasts.success('Experience Added', `Added role at ${exp.company}.`);
        api.updateProfile({ experiences: next.experiences }).catch(() => {});
        return next;
      });
    },
    removeExperience: (id: string) => {
      update((profile) => {
        const next = { ...profile, experiences: profile.experiences.filter((e) => e.id !== id) };
        saveAndNotify(next);
        toasts.info('Experience Removed', 'Work history updated.');
        api.updateProfile({ experiences: next.experiences }).catch(() => {});
        return next;
      });
    },
    applyExtractedCVData: (extracted: {
      bio?: string;
      skills?: string[];
      careerHeadline?: string;
    }) => {
      update((profile) => {
        const newSkills: ProfileSkill[] = [...profile.skills];
        if (extracted.skills) {
          for (const sName of extracted.skills) {
            const exists = newSkills.some((s) => s.name.toLowerCase() === sName.toLowerCase());
            if (!exists) {
              const newSkill: ProfileSkill = {
                id: `sk-cv-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                name: sName,
                category: 'frameworks',
                level: 'proficient',
                yearsOfExperience: 3
              };
              newSkills.push(newSkill);
              api.addSkill(newSkill).catch(() => {});
            }
          }
        }

        const next: UserProfile = {
          ...profile,
          personal: {
            ...profile.personal,
            bio: extracted.bio || profile.personal.bio
          },
          career: {
            ...profile.career,
            targetRoles: extracted.careerHeadline
              ? [extracted.careerHeadline, ...profile.career.targetRoles.slice(0, 3)]
              : profile.career.targetRoles
          },
          skills: newSkills
        };

        saveAndNotify(next);
        toasts.success('CV Imported', 'Extracted technical skills and headline synchronized into profile.');
        api.uploadCV({ parsedSummary: extracted.bio || 'Parsed CV Qualifications' }).catch(() => {});
        return next;
      });
    },
    resetToDefault: () => {
      saveAndNotify(initialProfile);
      toasts.info('Profile Reset', 'Restored default profile data.');
    }
  };
}

export const profileStore = createProfileStore();
