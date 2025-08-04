/**
 * Admin Dashboard Service Interfaces
 * 
 * Following interface segregation principle, each service has a focused responsibility:
 * - IDatabaseUsageService: Monitor Turso usage and limits
 * - IAdminCalendarService: Show upcoming admin tasks and events
 * - ISystemEventsService: Track current system activities
 * - ISystemHealthService: Monitor application health and uptime
 * - IDashboardService: Orchestrate all dashboard data
 */

// Database Usage Monitoring
export interface DatabaseUsageMetrics {
  readsUsedPercent: number;
  writesUsedPercent: number;
  storageUsedPercent: number;
  status: 'safe' | 'warning' | 'critical';
  monthlyProjection: {
    willExceedLimits: boolean;
    exceedingMetrics: string[];
    daysRemaining: number;
  };
  recommendations: string[];
}

export interface IDatabaseUsageService {
  getCurrentUsage(): Promise<DatabaseUsageMetrics>;
  getUsageHistory(days: number): Promise<{ date: string; usage: DatabaseUsageMetrics }[]>;
  getAlerts(): Promise<{ type: 'info' | 'warning' | 'critical'; message: string; action: string }[]>;
}

// Admin Calendar & Tasks
export interface AdminTask {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'workshop' | 'booking' | 'maintenance' | 'backup' | 'review';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  estimatedDuration?: number; // minutes
}

export interface UpcomingEvent {
  id: string;
  title: string;
  date: Date;
  type: 'workshop_start' | 'workshop_end' | 'booking_deadline' | 'payment_due' | 'follow_up';
  participants?: number;
  location?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled';
}

export interface IAdminCalendarService {
  getUpcomingTasks(days: number): Promise<AdminTask[]>;
  getUpcomingEvents(days: number): Promise<UpcomingEvent[]>;
  getTodaysTasks(): Promise<AdminTask[]>;
  getOverdueTasks(): Promise<AdminTask[]>;
  markTaskComplete(taskId: string): Promise<void>;
}

// System Events & Activity
export interface SystemEvent {
  id: string;
  timestamp: Date;
  type: 'booking_created' | 'payment_received' | 'user_registered' | 'backup_completed' | 'error_occurred' | 'system_started';
  severity: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: Record<string, any>;
  userId?: string;
  affectedResource?: string;
}

export interface SystemActivity {
  activeUsers: number;
  recentBookings: number;
  pendingPayments: number;
  systemLoad: number;
  lastBackup: Date;
  upcomingWorkshops: number;
}

export interface ISystemEventsService {
  getRecentEvents(limit: number): Promise<SystemEvent[]>;
  getCurrentActivity(): Promise<SystemActivity>;
  getEventsByType(type: string, hours: number): Promise<SystemEvent[]>;
  logEvent(event: Omit<SystemEvent, 'id' | 'timestamp'>): Promise<void>;
}

// System Health & Uptime
export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastChecked: Date;
  message?: string;
  uptime?: number;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number; // seconds
  startTime: Date;
  checks: HealthCheck[];
  performance: {
    avgResponseTime: number;
    errorRate: number;
    throughput: number; // requests per minute
  };
}

export interface ISystemHealthService {
  getSystemHealth(): Promise<SystemHealth>;
  checkDatabaseHealth(): Promise<HealthCheck>;
  checkEmailServiceHealth(): Promise<HealthCheck>;
  checkPaymentServiceHealth(): Promise<HealthCheck>;
  checkCalendarServiceHealth(): Promise<HealthCheck>;
  getUptimeStats(days: number): Promise<{ date: string; uptime: number }[]>;
}

// Main Dashboard Orchestrator
export interface DashboardData {
  usage: DatabaseUsageMetrics;
  tasks: AdminTask[];
  events: UpcomingEvent[];
  systemEvents: SystemEvent[];
  activity: SystemActivity;
  health: SystemHealth;
  summary: {
    criticalAlerts: number;
    overdueTasks: number;
    todaysEvents: number;
    systemStatus: 'operational' | 'degraded' | 'down';
  };
}

export interface IDashboardService {
  getDashboardData(): Promise<DashboardData>;
  refreshDashboard(): Promise<DashboardData>;
  getDashboardConfig(): Promise<{
    refreshInterval: number;
    alertThresholds: Record<string, number>;
    enabledWidgets: string[];
  }>;
}

// Dashboard Widget Configuration
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'usage' | 'calendar' | 'events' | 'health' | 'activity';
  size: 'small' | 'medium' | 'large';
  priority: number;
  refreshInterval: number;
  enabled: boolean;
}

export interface IDashboardConfigService {
  getWidgetConfig(): Promise<DashboardWidget[]>;
  updateWidgetConfig(widgets: DashboardWidget[]): Promise<void>;
  resetToDefaults(): Promise<DashboardWidget[]>;
} 