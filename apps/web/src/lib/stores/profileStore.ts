import { writable } from 'svelte/store';
import type { UserProfile, ProfileSkill, ExperienceItem, EducationItem } from '@sagasu/api-contract';
import { initialProfile } from '../mock/initialData';
import { toasts } from './toastStore';

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

  return {
    subscribe,
    updatePersonal: (personal: Partial<UserProfile['personal']>) => {
      update((profile) => {
        const next = { ...profile, personal: { ...profile.personal, ...personal } };
        saveAndNotify(next);
        toasts.success('Profile Updated', 'Personal details saved successfully.');
        return next;
      });
    },
    updateCareer: (career: Partial<UserProfile['career']>) => {
      update((profile) => {
        const next = { ...profile, career: { ...profile.career, ...career } };
        saveAndNotify(next);
        toasts.success('Preferences Updated', 'Target roles and compensation criteria updated.');
        return next;
      });
    },
    addSkill: (skill: Omit<ProfileSkill, 'id'>) => {
      update((profile) => {
        const newSkill: ProfileSkill = { ...skill, id: `sk-${Date.now()}` };
        const next = { ...profile, skills: [...profile.skills, newSkill] };
        saveAndNotify(next);
        toasts.success('Skill Added', `Added ${skill.name} to skills matrix.`);
        return next;
      });
    },
    removeSkill: (id: string) => {
      update((profile) => {
        const next = { ...profile, skills: profile.skills.filter((s) => s.id !== id) };
        saveAndNotify(next);
        toasts.info('Skill Removed', 'Skills matrix updated.');
        return next;
      });
    },
    updateSkill: (id: string, updates: Partial<ProfileSkill>) => {
      update((profile) => {
        const next = {
          ...profile,
          skills: profile.skills.map((s) => (s.id === id ? { ...s, ...updates } : s))
        };
        saveAndNotify(next);
        return next;
      });
    },
    addExperience: (exp: Omit<ExperienceItem, 'id'>) => {
      update((profile) => {
        const newExp: ExperienceItem = { ...exp, id: `exp-${Date.now()}` };
        const next = { ...profile, experiences: [newExp, ...profile.experiences] };
        saveAndNotify(next);
        toasts.success('Experience Added', `Added role at ${exp.company}.`);
        return next;
      });
    },
    removeExperience: (id: string) => {
      update((profile) => {
        const next = { ...profile, experiences: profile.experiences.filter((e) => e.id !== id) };
        saveAndNotify(next);
        toasts.info('Experience Removed', 'Work history updated.');
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
            if (!newSkills.some((s) => s.name.toLowerCase() === sName.toLowerCase())) {
              newSkills.push({
                id: `sk-cv-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
                name: sName,
                category: 'frameworks',
                level: 'proficient',
                yearsOfExperience: 3
              });
            }
          }
        }

        const next: UserProfile = {
          ...profile,
          personal: {
            ...profile.personal,
            bio: extracted.bio || profile.personal.bio,
            title: extracted.careerHeadline || profile.personal.title
          },
          skills: newSkills,
          resumes: [
            ...profile.resumes,
            {
              id: `res-${Date.now()}`,
              fileName: 'Extracted_CV_Candidate.pdf',
              uploadedAt: new Date().toISOString(),
              fileSize: 340000,
              isCanonical: true,
              parsedSummary: `AI parsed ${extracted.skills?.length || 0} skills and profile overview.`
            }
          ]
        };

        saveAndNotify(next);
        toasts.success('CV Data Applied', 'Extracted career information merged into your profile.');
        return next;
      });
    },
    resetToDefault: () => {
      saveAndNotify(initialProfile);
      toasts.info('Profile Reset', 'Reset profile back to demo defaults.');
    }
  };
}

export const profileStore = createProfileStore();
