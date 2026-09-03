import { writable, derived, get } from 'svelte/store';
import type {
  Application,
  ApplicationStatus,
  PreparedApplicationMaterials,
  Job
} from '@sagasu/api-contract';
import { initialApplications } from '../mock/initialData';
import { toasts } from './toastStore';
import { jobStore } from './jobStore';
import { api } from '../api/client';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'sagasu_applications_v1';

function getStoredApplications(): Application[] {
  if (typeof window === 'undefined') return initialApplications;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse applications', e);
  }
  return initialApplications;
}

function createApplicationStore() {
  const applications = writable<Application[]>(getStoredApplications());
  const activePreparingAppId = writable<string | null>(null);

  function saveToStorage(apps: Application[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    }
    applications.set(apps);
  }

  // Hydrate from backend API if available
  if (typeof window !== 'undefined') {
    api
      .getApplications()
      .then((serverApps) => {
        if (serverApps && serverApps.length > 0) {
          saveToStorage(serverApps);
        }
      })
      .catch((err) => {
        console.info('Backend application sync using cached store:', err.message);
      });
  }

  return {
    subscribe: applications.subscribe,
    activePreparingAppId,

    openStudioForJob: (job: Job) => {
      const currentApps = get(applications);
      let app = currentApps.find((a) => a.jobId === job.id);

      if (!app) {
        // Create new preparing application
        const newApp: Application = {
          id: `app-${Date.now()}`,
          jobId: job.id,
          job,
          status: 'PREPARING',
          statusHistory: [
            {
              id: `h-${Date.now()}-1`,
              status: 'DISCOVERED',
              timestamp: job.collectedAt,
              note: `Discovered from ${job.sourcePlatform}`
            },
            {
              id: `h-${Date.now()}-2`,
              status: 'PREPARING',
              timestamp: new Date().toISOString(),
              note: 'Application preparation studio initiated'
            }
          ],
          preparedMaterials: {
            tailoredResume: {
              headline: `Senior ${job.skills.slice(0, 2).join(' & ')} Engineer | Production Scale Architect`,
              summary: `Results-driven software engineer specializing in ${job.skills.slice(0, 3).join(', ')} with deep experience building resilient web applications. Proven track record aligning directly with ${job.company}'s requirements.`,
              targetedBulletPoints: [
                `Architected scalable fullstack systems leveraging ${job.skills[0] || 'TypeScript'} and ${job.skills[1] || 'PostgreSQL'}`,
                `Optimized end-to-end performance and latency across high-throughput endpoints`,
                `Collaborated on developer ergonomics, automated testing, and CI/CD pipelines`
              ]
            },
            coverLetter: `Dear Hiring Team at ${job.company},

I am writing to express my strong interest in the ${job.title} opportunity. Having followed ${job.company}'s recent product developments, I am thrilled by your mission and technical focus.

With over 5 years of engineering experience centered around ${job.skills.slice(0, 4).join(', ')}, I have consistently delivered robust, maintainable solutions in high-velocity environments. In my previous roles, I spearheaded core web initiatives that drove substantial performance gains and system reliability.

The technical requirements for this role align seamlessly with my hands-on background in ${job.skills[0] || 'modern web development'}. I am eager to bring my problem-solving drive and collaborative approach to your engineering team.

Thank you for your time and consideration.

Best regards,
Raden Manopo`,
            recruiterMessage: `Hi ${job.company} Talent Team! I noticed your opening for ${job.title}. Given my 5+ years building with ${job.skills.slice(0, 3).join(', ')}, I would love to connect and share how my technical background can support your roadmap!`,
            applicationQuestionsAnswers: [
              {
                question: `Why do you want to join ${job.company}?`,
                answer: `I admire ${job.company}'s engineering culture and rapid innovation. The opportunity to contribute to ${job.title} directly matches my passion for modern distributed systems.`,
                rationale: 'Aligns enthusiasm with concrete company objectives.'
              },
              {
                question: 'What is your experience with the core tech stack for this role?',
                answer: `I have 5+ years of production experience working extensively with ${job.skills.slice(0, 3).join(', ')}, optimizing database queries, and shipping reliable user interfaces.`,
                rationale: 'Summarizes key qualifications with immediate credibility.'
              }
            ],
            interviewPrepNotes: [
              {
                topic: 'System Architecture & Concurrency',
                keyBullets: [
                  'Explain connection pooling and caching strategies',
                  'Walk through an end-to-end event flow handling spike loads'
                ]
              },
              {
                topic: 'Behavioral & Leadership',
                keyBullets: [
                  'Describe a critical refactor under tight timeline constraints',
                  'Give an example of aligning product priorities with engineering quality'
                ]
              }
            ]
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const updated = [newApp, ...currentApps];
        saveToStorage(updated);
        jobStore.updateJobStatus(job.id, 'saved');
        activePreparingAppId.set(newApp.id);
        toasts.success('Studio Initialized', `Drafted tailored materials for ${job.company}.`);
        api.createApplication(job.id, 'PREPARING').catch(() => {});
      } else {
        activePreparingAppId.set(app.id);
      }
    },

    closeStudio: () => {
      activePreparingAppId.set(null);
    },

    updateStatus: (id: string, newStatus: ApplicationStatus, note?: string) => {
      applications.update((apps) => {
        const next = apps.map((app) => {
          if (app.id !== id) return app;

          const historyItem = {
            id: `h-${Date.now()}`,
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: note || `Stage updated to ${newStatus}`
          };

          const updatedApp: Application = {
            ...app,
            status: newStatus,
            statusHistory: [...app.statusHistory, historyItem],
            updatedAt: new Date().toISOString(),
            appliedDate: newStatus === 'APPLIED' && !app.appliedDate ? new Date().toISOString() : app.appliedDate
          };

          if (newStatus === 'OFFER') {
            try {
              confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            } catch {}
            toasts.success('Congratulations!', `Offer received for ${app.job.title} at ${app.job.company}!`);
          } else if (newStatus === 'APPLIED') {
            toasts.success('Application Submitted', `Marked as applied to ${app.job.company}.`);
            jobStore.updateJobStatus(app.jobId, 'applied');
          } else {
            toasts.info('Status Updated', `Moved ${app.job.company} to ${newStatus}`);
          }

          api.updateApplication(id, { status: newStatus }).catch(() => {});
          return updatedApp;
        });

        saveToStorage(next);
        return next;
      });
    },

    updateMaterials: (id: string, materials: Partial<PreparedApplicationMaterials>) => {
      applications.update((apps) => {
        const next = apps.map((app) => {
          if (app.id !== id) return app;
          const updated: Application = {
            ...app,
            preparedMaterials: {
              ...(app.preparedMaterials || {
                tailoredResume: { headline: '', summary: '', targetedBulletPoints: [] },
                coverLetter: '',
                recruiterMessage: '',
                applicationQuestionsAnswers: [],
                interviewPrepNotes: []
              }),
              ...materials
            },
            updatedAt: new Date().toISOString()
          };
          api.updateApplication(id, { preparedMaterials: updated.preparedMaterials }).catch(() => {});
          return updated;
        });
        saveToStorage(next);
        toasts.success('Materials Saved', 'Customizations updated.');
        return next;
      });
    },

    deleteApplication: (id: string) => {
      applications.update((apps) => {
        const next = apps.filter((a) => a.id !== id);
        saveToStorage(next);
        toasts.info('Removed', 'Application removed from tracking pipeline.');
        return next;
      });
    },

    resetToDefault: () => {
      saveToStorage(initialApplications);
      toasts.info('Pipeline Reset', 'Restored demo application pipeline.');
    }
  };
}

export const applicationStore = createApplicationStore();
