export interface JobPreferences {
  desiredRoles: string[];
  locations: string[];
  remoteOnly: boolean;
  minSalaryMonthlyIDR: number;
  keywords: string[];
  excludedCompanies: string[];
  enabledSources: Array<{
    id: string;
    name: string;
    enabled: boolean;
    lastSyncedAt?: string;
    itemsCount: number;
  }>;
  autoSyncIntervalMinutes: number;
  minMatchScoreThreshold: number;
  alertEmailEnabled: boolean;
}
