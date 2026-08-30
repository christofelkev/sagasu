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
            approvedByUser: false,
            userNotes: ''
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const next = [newApp, ...currentApps];
        saveToStorage(next);
        app = newApp;
      }

      activePreparingAppId.set(app.id);
      jobStore.updateJobStatus(job.id, 'saved');
    },

    closeStudio: () => {
      activePreparingAppId.set(null);
    },

    updateMaterials: (appId: string, materials: Partial<PreparedApplicationMaterials>) => {
      applications.update((curr) => {
        const next = curr.map((a) => {
          if (a.id === appId && a.preparedMaterials) {
            return {
              ...a,
              preparedMaterials: { ...a.preparedMaterials, ...materials },
              updatedAt: new Date().toISOString()
            };
          }
          return a;
        });
        saveToStorage(next);
        return next;
      });
    },

    updateStatus: (appId: string, nextStatus: ApplicationStatus, note?: string) => {
      applications.update((curr) => {
        const next = curr.map((a) => {
          if (a.id === appId) {
            const historyEvent = {
              id: `h-${Date.now()}`,
              status: nextStatus,
              timestamp: new Date().toISOString(),
              note: note || `Status updated to ${nextStatus}`
            };

            const updated: Application = {
              ...a,
              status: nextStatus,
              statusHistory: [...a.statusHistory, historyEvent],
              updatedAt: new Date().toISOString()
            };

            if (nextStatus === 'APPLIED') {
              updated.appliedDate = new Date().toISOString().split('T')[0];
              if (updated.preparedMaterials) {
                updated.preparedMaterials.approvedByUser = true;
              }
              // Trigger confetti celebration!
              try {
                confetti({
                  particleCount: 80,
                  spread: 60,
                  origin: { y: 0.6 }
                });
              } catch (e) {}
              toasts.success('Application Submitted!', `Successfully logged application to ${a.job.company}.`);
            } else if (nextStatus === 'OFFER') {
              try {
                confetti({
                  particleCount: 150,
                  spread: 100,
                  origin: { y: 0.5 }
                });
              } catch (e) {}
              toasts.success('🎉 Offer Received!', `Congratulations on the offer from ${a.job.company}!`);
            } else {
              toasts.info('Status Updated', `Moved to ${nextStatus}`);
            }

            return updated;
          }
          return a;
        });
        saveToStorage(next);
        return next;
      });
    },

    deleteApplication: (appId: string) => {
      applications.update((curr) => {
        const next = curr.filter((a) => a.id !== appId);
        saveToStorage(next);
        toasts.info('Application Removed', 'Application record deleted.');
        return next;
      });
    },

    resetToDefault: () => {
      saveToStorage(initialApplications);
      toasts.info('Applications Reset', 'Restored default application pipeline.');
    }
  };
}

export const applicationStore = createApplicationStore();
