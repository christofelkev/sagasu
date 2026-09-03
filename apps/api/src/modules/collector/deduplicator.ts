import type { Job, DedupSource, SalaryRange } from '@sagasu/api-contract';

export function normalizeCompanyName(company: string): string {
  return company
    .toLowerCase()
    .replace(/\b(inc|llc|corp|corporation|ltd|limited|gmbh|pt|tbk|technologies|labs|solutions)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export function normalizeJobTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateStringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (!str1 || !str2) return 0.0;

  const words1 = new Set(str1.split(' ').filter((w) => w.length > 2));
  const words2 = new Set(str2.split(' ').filter((w) => w.length > 2));

  if (words1.size === 0 || words2.size === 0) return 0.0;

  let intersection = 0;
  for (const w of words1) {
    if (words2.has(w)) intersection++;
  }

  const union = new Set([...words1, ...words2]).size;
  return intersection / union;
}

export interface DeduplicationCheckResult {
  isDuplicate: boolean;
  existingJob?: Job;
  updatedSources?: DedupSource[];
  mergedSalary?: SalaryRange;
}

export function checkJobDuplicate(
  incoming: {
    title: string;
    company: string;
    sourceUrl: string;
    sourcePlatform: string;
    externalId?: string;
    salary?: SalaryRange;
  },
  existingJobs: Job[]
): DeduplicationCheckResult {
  const incomingCompanyNorm = normalizeCompanyName(incoming.company);
  const incomingTitleNorm = normalizeJobTitle(incoming.title);
  const incomingUrlClean = incoming.sourceUrl.split('?')[0].toLowerCase().trim();

  for (const existing of existingJobs) {
    // 1. Strong Signal: Exact URL match
    const existingUrlClean = existing.sourceUrl.split('?')[0].toLowerCase().trim();
    if (existingUrlClean === incomingUrlClean) {
      return createDuplicateResult(incoming, existing);
    }

    // 2. Strong Signal: Matching deduplication source URL or external ID
    if (existing.deduplicationSources) {
      const matchSource = existing.deduplicationSources.some((s) => {
        const sUrl = s.sourceUrl?.split('?')[0].toLowerCase().trim();
        return (
          (sUrl && sUrl === incomingUrlClean) ||
          (incoming.externalId && s.externalId && s.externalId === incoming.externalId)
        );
      });
      if (matchSource) {
        return createDuplicateResult(incoming, existing);
      }
    }

    // 3. Secondary Signal: Normalized company match + Title similarity >= 0.75
    const existingCompanyNorm = normalizeCompanyName(existing.company);
    if (incomingCompanyNorm && existingCompanyNorm && incomingCompanyNorm === existingCompanyNorm) {
      const existingTitleNorm = normalizeJobTitle(existing.title);
      const similarity = calculateStringSimilarity(incomingTitleNorm, existingTitleNorm);
      if (similarity >= 0.75) {
        return createDuplicateResult(incoming, existing);
      }
    }
  }

  return { isDuplicate: false };
}

function createDuplicateResult(incoming: any, existing: Job): DeduplicationCheckResult {
  const currentSources = existing.deduplicationSources || [];
  const alreadyHasSource = currentSources.some(
    (s) => s.platform === incoming.sourcePlatform && s.sourceUrl === incoming.sourceUrl
  );

  const updatedSources: DedupSource[] = alreadyHasSource
    ? currentSources
    : [
        ...currentSources,
        {
          platform: incoming.sourcePlatform,
          sourceUrl: incoming.sourceUrl,
          externalId: incoming.externalId || `src-${Date.now()}`,
          fetchedAt: new Date().toISOString()
        }
      ];

  const mergedSalary = !existing.salary && incoming.salary ? incoming.salary : existing.salary;

  return {
    isDuplicate: true,
    existingJob: existing,
    updatedSources,
    mergedSalary
  };
}