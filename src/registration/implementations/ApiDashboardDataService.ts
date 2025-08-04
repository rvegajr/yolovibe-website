// ApiDashboardDataService.ts - Concrete implementation that calls the existing API
// Following ISP and dependency injection principles

import type { 
  IDashboardDataService, 
  DatabaseUsageData, 
  SystemHealthData, 
  ActivityData, 
  EventData,
  DashboardData 
} from '../core/interfaces/IDashboardDataService.js';

export class ApiDashboardDataService implements IDashboardDataService {
  private readonly apiBaseUrl: string;

  constructor(apiBaseUrl: string = '/api/admin/dashboard') {
    this.apiBaseUrl = apiBaseUrl;
  }

  async getDatabaseUsage(): Promise<DatabaseUsageData> {
    const data = await this.fetchDashboardData();
    return data.databaseUsage;
  }

  async getSystemHealth(): Promise<SystemHealthData> {
    const data = await this.fetchDashboardData();
    return data.systemHealth;
  }

  async getSystemStatus(): Promise<string> {
    const data = await this.fetchDashboardData();
    return data.systemStatus;
  }

  async getActivityMetrics(): Promise<ActivityData> {
    const data = await this.fetchDashboardData();
    return data.activity;
  }

  async getRecentEvents(): Promise<EventData[]> {
    const data = await this.fetchDashboardData();
    return data.recentEvents;
  }

  private async fetchDashboardData(): Promise<DashboardData> {
    try {
      const response = await fetch(this.apiBaseUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate the response structure
      this.validateDashboardData(data);
      
      return data;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw new Error(`Dashboard API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateDashboardData(data: any): asserts data is DashboardData {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid dashboard data: not an object');
    }

    if (!data.systemStatus || typeof data.systemStatus !== 'string') {
      throw new Error('Invalid dashboard data: missing or invalid systemStatus');
    }

    if (!data.databaseUsage || typeof data.databaseUsage !== 'object') {
      throw new Error('Invalid dashboard data: missing or invalid databaseUsage');
    }

    if (!data.systemHealth || typeof data.systemHealth !== 'object') {
      throw new Error('Invalid dashboard data: missing or invalid systemHealth');
    }

    if (!data.activity || typeof data.activity !== 'object') {
      throw new Error('Invalid dashboard data: missing or invalid activity');
    }

    if (!Array.isArray(data.recentEvents)) {
      throw new Error('Invalid dashboard data: missing or invalid recentEvents');
    }
  }
} 