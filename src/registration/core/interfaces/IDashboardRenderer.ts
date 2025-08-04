// IDashboardRenderer.ts - Interface for dashboard UI operations
// Following ISP: Separate data concerns from UI concerns

import type { DatabaseUsageData, SystemHealthData, ActivityData, EventData } from './IDashboardDataService.js';

export interface IDashboardRenderer {
  renderDatabaseUsage(data: DatabaseUsageData): void;
  renderSystemHealth(data: SystemHealthData): void;
  renderSystemStatus(status: string): void;
  renderActivity(data: ActivityData): void;
  renderRecentEvents(events: EventData[]): void;
  showError(message: string): void;
  showLoading(): void;
  hideLoading(): void;
}

export interface IDashboardProgressRenderer {
  updateProgressBar(type: 'reads' | 'writes' | 'storage', percentage: number): void;
  updateMetricDisplay(type: 'reads' | 'writes' | 'storage', value: string): void;
}

export interface IDashboardStatusRenderer {
  updateStatusBadge(status: string, type: 'success' | 'warning' | 'error'): void;
  updateLastRefreshTime(): void;
} 