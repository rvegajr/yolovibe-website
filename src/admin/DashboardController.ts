import { emit, on } from '../events/GlobalEventBus.js';
import { LocalEventTypes } from '../events/EventTypes.js';

export interface DashboardMetrics {
  databaseUsage: {
    reads: number;
    writes: number;
    storage: number;
    percentage: number;
    status: 'SAFE' | 'WARNING' | 'CRITICAL';
  };
  systemStatus: string;
  systemHealth: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    performance: {
      avgResponseTime: number;
      throughput: string;
    };
    checks: Array<{
      name: string;
      status: 'healthy' | 'degraded' | 'unhealthy';
      message: string;
    }>;
  };
  activity: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }>;
  recentEvents: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    priority: 'urgent' | 'high' | 'medium' | 'low';
  }>;
}

export class AdminDashboard {
  private refreshInterval: number = 30000; // 30 seconds
  private autoRefreshTimer?: NodeJS.Timeout;
  private currentMetrics?: DashboardMetrics;

  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    try {
      // Load initial data
      await this.loadDashboardData();
      
      // Setup event listeners and auto-refresh
      this.setupEventListeners();
      this.startAutoRefresh();
      
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      this.showError('Failed to initialize dashboard');
    }
  }

  async loadDashboardData(): Promise<void> {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: DashboardMetrics = await response.json();
      console.log('Dashboard data loaded:', data);
      
      this.currentMetrics = data;
      
      // Update UI with data
      this.updateDatabaseUsage(data.databaseUsage);
      this.updateSystemStatus(data.systemStatus);
      this.updateSystemHealth(data.systemHealth);
      this.updateActivity(data.activity);
      this.updateRecentEvents(data.recentEvents);
      this.updateLastRefreshTime();
      
      // Emit event for other components
      emit(LocalEventTypes.DASHBOARD_UPDATED, data);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      this.showError('Failed to load dashboard data: ' + (error as Error).message);
    }
  }

  updateDatabaseUsage(databaseUsage: DashboardMetrics['databaseUsage']): void {
    if (!databaseUsage) return;
    
    // Update metric displays
    this.updateElement('reads-count', databaseUsage.reads.toString());
    this.updateElement('writes-count', databaseUsage.writes.toString());
    this.updateElement('storage-count', `${databaseUsage.storage}MB`);
    
    // Update progress bars
    this.updateProgressBar('reads', (databaseUsage.reads / 10000) * 100);
    this.updateProgressBar('writes', (databaseUsage.writes / 1000) * 100);
    this.updateProgressBar('storage', databaseUsage.percentage);
    
    // Update status badge
    this.updateStatusBadge(databaseUsage.status);
  }

  updateProgressBar(type: string, percentage: number): void {
    const bar = document.getElementById(`${type}-bar`);
    const percent = document.getElementById(`${type}-percent`);
    
    if (bar) {
      bar.style.width = `${Math.min(100, percentage || 0)}%`;
    }
    if (percent) {
      percent.textContent = `${(percentage || 0).toFixed(1)}%`;
    }
  }

  updateStatusBadge(status: 'SAFE' | 'WARNING' | 'CRITICAL'): void {
    const statusEl = document.getElementById('usage-status');
    if (!statusEl) return;
    
    const statusClasses = {
      SAFE: 'bg-green-900/30 text-green-400 border border-green-500/30',
      WARNING: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30',
      CRITICAL: 'bg-red-900/30 text-red-400 border border-red-500/30'
    };
    
    statusEl.className = `px-3 py-1 rounded-full text-sm font-medium ${statusClasses[status] || statusClasses.SAFE}`;
    statusEl.textContent = status;
  }

  updateSystemStatus(systemStatus: string): void {
    const banner = document.getElementById('system-status-banner');
    if (!banner) return;

    if (systemStatus === 'healthy') {
      banner.innerHTML = `
        <div class="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h3 class="font-semibold text-green-400">System Status: ${systemStatus}</h3>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-green-300">All systems operational</span>
              <button onclick="window.dashboard.loadDashboardData()" class="text-sm text-green-400 hover:text-green-300 underline transition-colors">
                Refresh
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      banner.innerHTML = `
        <div class="bg-gradient-to-r from-red-900/40 to-pink-900/40 border border-red-500/30 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              <h3 class="font-semibold text-red-400">System Status: ${systemStatus}</h3>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-red-300">Issues detected</span>
              <button onclick="dashboard.loadDashboardData()" class="text-sm text-red-400 hover:text-red-300 underline transition-colors">
                Refresh
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }

  updateSystemHealth(systemHealth: DashboardMetrics['systemHealth']): void {
    if (!systemHealth) return;
    
    console.log('System health:', systemHealth);
    
    const container = document.getElementById('system-health');
    if (!container) return;

    const uptimeHours = Math.floor(systemHealth.uptime / 3600);
    
    // Update health status indicator
    const indicator = document.getElementById('health-indicator');
    const status = document.getElementById('health-status');
    const uptime = document.getElementById('uptime');
    
    const healthConfig = {
      healthy: { bg: 'bg-green-100', text: 'text-green-600', icon: '✅' },
      degraded: { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: '⚠️' },
      unhealthy: { bg: 'bg-red-100', text: 'text-red-600', icon: '❌' }
    };
    
    const config = healthConfig[systemHealth.status] || healthConfig.healthy;
    
    if (indicator) {
      indicator.className = `w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-2 ${config.bg}`;
      indicator.textContent = config.icon;
    }
    if (status) {
      status.className = `text-lg font-medium ${config.text}`;
      status.textContent = systemHealth.status.charAt(0).toUpperCase() + systemHealth.status.slice(1);
    }
    if (uptime) {
      uptime.textContent = `Uptime: ${uptimeHours}h`;
    }

    // Update performance metrics
    this.updateElement('avg-response-time', `${systemHealth.performance.avgResponseTime.toFixed(0)}ms`);
    this.updateElement('throughput', systemHealth.performance.throughput);

    // Update health checks
    const checksContainer = document.getElementById('health-checks');
    if (checksContainer && systemHealth.checks) {
      checksContainer.innerHTML = systemHealth.checks.map(check => {
        const statusIcon = check.status === 'healthy' ? '🟢' :
                          check.status === 'degraded' ? '🟡' : '🔴';
        
        return `
          <div class="flex items-center justify-between py-2 border-b border-slate-600/30 last:border-b-0">
            <div class="flex items-center space-x-2">
              <span>${statusIcon}</span>
              <span class="text-sm font-medium">${check.name}</span>
            </div>
            <span class="text-xs text-slate-400">${check.message}</span>
          </div>
        `;
      }).join('');
    }
  }

  updateActivity(activity: DashboardMetrics['activity']): void {
    if (!activity) return;
    
    const container = document.getElementById('activity-feed');
    if (!container) return;

    const priorityColors = {
      urgent: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-blue-600',
      low: 'text-gray-600'
    };

    container.innerHTML = activity.map(item => `
      <div class="flex items-start space-x-3 py-3 border-b border-slate-600/30 last:border-b-0">
        <div class="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-slate-400"></div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-slate-300">${item.message}</p>
          <div class="flex items-center space-x-2 mt-1">
            <span class="text-xs text-slate-500">${this.formatTimeAgo(item.timestamp)}</span>
            <button onclick="markTaskComplete('${item.id}')" class="text-green-600 hover:text-green-700">
              <span class="text-xs">✓ Complete</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  updateRecentEvents(recentEvents: DashboardMetrics['recentEvents']): void {
    if (!recentEvents) return;
    
    const container = document.getElementById('recent-events');
    if (!container) return;

    container.innerHTML = recentEvents.map(event => {
      const now = new Date();
      const eventDate = new Date(event.timestamp);
      const isToday = now.toDateString() === eventDate.toDateString();
      const dateStr = isToday ? 'Today' : eventDate.toLocaleDateString();
      
      return `
        <div class="flex items-center justify-between py-2 border-b border-slate-600/30 last:border-b-0">
          <div class="flex-1">
            <div class="text-sm font-medium text-slate-200">${event.type}</div>
            <div class="text-xs text-slate-400 mt-1">${event.description}</div>
          </div>
          <div class="text-right">
            <div class="text-xs text-slate-500">${dateStr}</div>
            <div class="text-xs text-slate-400">${eventDate.toLocaleTimeString()}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  updateLastRefreshTime(): void {
    const element = document.getElementById('last-updated');
    if (element) {
      element.textContent = new Date().toLocaleTimeString();
    }
  }

  setupEventListeners(): void {
    const refreshButton = document.getElementById('refresh-dashboard');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => this.loadDashboardData());
    }

    // Listen for global events - using available event types
    on(LocalEventTypes.ERROR_OCCURRED, (data) => {
      this.showError(data.message || 'System error occurred');
    });
  }

  startAutoRefresh(): void {
    this.autoRefreshTimer = setInterval(() => {
      this.loadDashboardData();
    }, this.refreshInterval);
  }

  stopAutoRefresh(): void {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = undefined;
    }
  }

  showError(message: string): void {
    const banner = document.getElementById('system-status-banner');
    if (banner) {
      banner.innerHTML = `
        <div class="bg-gradient-to-r from-red-900/40 to-pink-900/40 border border-red-500/30 rounded-xl p-4">
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 bg-red-400 rounded-full"></div>
            <h3 class="font-semibold text-red-400">Error: ${message}</h3>
          </div>
        </div>
      `;
    }
    console.error('Dashboard Error:', message);
  }

  private updateElement(id: string, content: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = content;
    }
  }

  private formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  // Public methods for global access
  getCurrentMetrics(): DashboardMetrics | undefined {
    return this.currentMetrics;
  }

  destroy(): void {
    this.stopAutoRefresh();
    // Clean up event listeners if needed
  }
}

// Global functions for backward compatibility
export async function markTaskComplete(taskId: string): Promise<void> {
  try {
    await fetch(`/api/admin/tasks/${taskId}/complete`, { method: 'POST' });
    // Reload dashboard data
    if ((window as any).dashboard) {
      (window as any).dashboard.loadDashboardData();
    }
  } catch (error) {
    console.error('Failed to mark task complete:', error);
  }
}

export async function runUsageCheck(): Promise<void> {
  try {
    const response = await fetch('/api/admin/usage-check', { method: 'POST' });
    const result = await response.json();
    alert('Usage check completed');
    if ((window as any).dashboard) {
      (window as any).dashboard.loadDashboardData();
    }
  } catch (error) {
    alert('Usage check failed');
  }
}

export async function createBackup(): Promise<void> {
  try {
    const response = await fetch('/api/admin/backup', { method: 'POST' });
    const result = await response.json();
    alert(`Backup created: ${result.backupId}`);
    if ((window as any).dashboard) {
      (window as any).dashboard.loadDashboardData();
    }
  } catch (error) {
    alert('Failed to create backup');
  }
} 