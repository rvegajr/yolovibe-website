// IDashboardDataService.ts - Interface for dashboard data operations
// Following ISP: Clients should not depend on interfaces they don't use

export interface IDashboardDataService {
  getDatabaseUsage(): Promise<DatabaseUsageData>;
  getSystemHealth(): Promise<SystemHealthData>;
  getSystemStatus(): Promise<string>;
  getActivityMetrics(): Promise<ActivityData>;
  getRecentEvents(): Promise<EventData[]>;
}

export interface DatabaseUsageData {
  reads: number;
  writes: number;
  storage: number;
  percentage: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
}

export interface SystemHealthData {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  uptime: string;
  services: ServiceStatus[];
}

export interface ServiceStatus {
  name: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  responseTime: string;
}

export interface ActivityData {
  activeUsers: number;
  recentBookings: number;
  pendingPayments: number;
  upcomingWorkshops: number;
}

export interface EventData {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

export interface DashboardData {
  systemStatus: string;
  databaseUsage: DatabaseUsageData;
  systemHealth: SystemHealthData;
  activity: ActivityData;
  recentEvents: EventData[];
} 