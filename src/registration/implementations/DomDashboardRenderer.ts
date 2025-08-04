// DomDashboardRenderer.ts - Concrete DOM implementation of dashboard renderer interfaces
// Following ISP: Implements only the interfaces it needs

import type { 
  IDashboardRenderer, 
  IDashboardProgressRenderer, 
  IDashboardStatusRenderer 
} from '../core/interfaces/IDashboardRenderer.js';
import type { 
  DatabaseUsageData, 
  SystemHealthData, 
  ActivityData, 
  EventData 
} from '../core/interfaces/IDashboardDataService.js';

export class DomDashboardRenderer implements IDashboardRenderer, IDashboardProgressRenderer, IDashboardStatusRenderer {
  
  renderDatabaseUsage(data: DatabaseUsageData): void {
    // Update individual metric displays
    this.updateMetricDisplay('reads', data.reads.toString());
    this.updateMetricDisplay('writes', data.writes.toString());
    this.updateMetricDisplay('storage', `${data.storage}MB`);
    
    // Update progress bars
    this.updateProgressBar('reads', (data.reads / 10000) * 100);
    this.updateProgressBar('writes', (data.writes / 1000) * 100);
    this.updateProgressBar('storage', data.percentage);
    
    // Update status badge
    const statusType = data.status === 'SAFE' ? 'success' : 
                      data.status === 'WARNING' ? 'warning' : 'error';
    this.updateStatusBadge(data.status, statusType);
  }

  renderSystemHealth(data: SystemHealthData): void {
    const healthIndicator = document.getElementById('health-indicator');
    const healthStatus = document.getElementById('health-status');
    const uptimeElement = document.getElementById('uptime');
    
    if (healthIndicator) {
      const statusColors = {
        'HEALTHY': 'bg-green-500',
        'DEGRADED': 'bg-yellow-500',
        'DOWN': 'bg-red-500'
      };
      healthIndicator.className = `w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-2 ${statusColors[data.status]}`;
      healthIndicator.textContent = data.status === 'HEALTHY' ? '✅' : 
                                   data.status === 'DEGRADED' ? '⚠️' : '❌';
    }
    
    if (healthStatus) {
      healthStatus.textContent = data.status;
      healthStatus.className = `text-lg font-medium ${
        data.status === 'HEALTHY' ? 'text-green-400' :
        data.status === 'DEGRADED' ? 'text-yellow-400' : 'text-red-400'
      }`;
    }
    
    if (uptimeElement) {
      uptimeElement.textContent = `Uptime: ${data.uptime}`;
      uptimeElement.className = 'text-sm text-slate-400';
    }
    
    // Render services list
    const servicesList = document.getElementById('services-list');
    if (servicesList && data.services) {
      servicesList.innerHTML = data.services.map(service => `
        <div class="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
          <span class="text-slate-300">${service.name}</span>
          <div class="flex items-center space-x-2">
            <span class="text-xs ${
              service.status === 'UP' ? 'text-green-400' :
              service.status === 'DEGRADED' ? 'text-yellow-400' : 'text-red-400'
            }">${service.status}</span>
            <span class="text-xs text-slate-500">${service.responseTime}</span>
          </div>
        </div>
      `).join('');
    }
  }

  renderSystemStatus(status: string): void {
    const banner = document.getElementById('system-status-banner');
    if (!banner) return;
    
    if (status === 'UP') {
      banner.innerHTML = `
        <div class="p-4 rounded-lg border bg-green-900/20 border-green-500/30">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
              <div>
                <h3 class="font-semibold text-green-400">System Status: ${status}</h3>
                <p class="text-sm text-green-300 mt-1">All systems operational</p>
              </div>
            </div>
            <button onclick="window.dashboard?.refreshDashboard()" class="text-sm text-green-400 hover:text-green-300 underline transition-colors">
              Refresh Status
            </button>
          </div>
        </div>
      `;
    } else if (status === 'DOWN') {
      banner.innerHTML = `
        <div class="p-4 rounded-lg border bg-red-900/20 border-red-500/30">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
              <div>
                <h3 class="font-semibold text-red-400">System Status: ${status}</h3>
                <p class="text-sm text-red-300 mt-1">System experiencing issues</p>
              </div>
            </div>
            <button onclick="window.dashboard?.refreshDashboard()" class="text-sm text-red-400 hover:text-red-300 underline transition-colors">
              Refresh Status
            </button>
          </div>
        </div>
      `;
    } else {
      banner.innerHTML = `
        <div class="p-4 rounded-lg border bg-yellow-900/20 border-yellow-500/30">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
              <div>
                <h3 class="font-semibold text-yellow-400">System Status: ${status}</h3>
                <p class="text-sm text-yellow-300 mt-1">System status degraded</p>
              </div>
            </div>
            <button onclick="window.dashboard?.refreshDashboard()" class="text-sm text-yellow-400 hover:text-yellow-300 underline transition-colors">
              Refresh Status
            </button>
          </div>
        </div>
      `;
    }
  }

  renderActivity(data: ActivityData): void {
    const elements = {
      'active-users': data.activeUsers,
      'recent-bookings': data.recentBookings,
      'pending-payments': data.pendingPayments,
      'upcoming-workshops': data.upcomingWorkshops
    };
    
    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value.toString();
      }
    });
  }

  renderRecentEvents(events: EventData[]): void {
    const eventsContainer = document.getElementById('recent-events');
    if (!eventsContainer || !events.length) return;
    
    eventsContainer.innerHTML = events.slice(0, 5).map(event => {
      const typeColors = {
        'info': 'text-blue-400 bg-blue-900/20',
        'success': 'text-green-400 bg-green-900/20',
        'warning': 'text-yellow-400 bg-yellow-900/20',
        'error': 'text-red-400 bg-red-900/20'
      };
      
      const typeIcons = {
        'info': 'ℹ️',
        'success': '✅',
        'warning': '⚠️',
        'error': '❌'
      };
      
      return `
        <div class="p-3 rounded-lg ${typeColors[event.type]} border border-current border-opacity-30">
          <div class="flex items-start space-x-2">
            <span class="text-lg">${typeIcons[event.type]}</span>
            <div class="flex-1">
              <p class="text-sm font-medium">${event.message}</p>
              <p class="text-xs opacity-75 mt-1">${event.timestamp}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  showError(message: string): void {
    // Create or update error banner
    let errorBanner = document.getElementById('dashboard-error-banner');
    if (!errorBanner) {
      errorBanner = document.createElement('div');
      errorBanner.id = 'dashboard-error-banner';
      const container = document.querySelector('.dashboard-container') || document.body;
      container.insertBefore(errorBanner, container.firstChild);
    }
    
    errorBanner.innerHTML = `
      <div class="p-4 rounded-lg border bg-red-900/20 border-red-500/30 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span class="text-red-400 text-lg mr-3">❌</span>
            <div>
              <h3 class="font-semibold text-red-400">Dashboard Error</h3>
              <p class="text-sm text-red-300 mt-1">${message}</p>
            </div>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" class="text-red-400 hover:text-red-300">
            ✕
          </button>
        </div>
      </div>
    `;
  }

  showLoading(): void {
    const refreshButton = document.getElementById('refresh-dashboard');
    if (refreshButton) {
      refreshButton.innerHTML = '⏳ Loading...';
      refreshButton.setAttribute('disabled', 'true');
    }
  }

  hideLoading(): void {
    const refreshButton = document.getElementById('refresh-dashboard');
    if (refreshButton) {
      refreshButton.innerHTML = '🔄 Refresh';
      refreshButton.removeAttribute('disabled');
    }
  }

  updateProgressBar(type: 'reads' | 'writes' | 'storage', percentage: number): void {
    const bar = document.getElementById(`${type}-bar`);
    const percent = document.getElementById(`${type}-percent`);
    
    if (bar) {
      bar.style.width = `${Math.min(100, percentage || 0)}%`;
    }
    if (percent) {
      percent.textContent = `${(percentage || 0).toFixed(1)}%`;
    }
  }

  updateMetricDisplay(type: 'reads' | 'writes' | 'storage', value: string): void {
    const element = document.getElementById(`${type}-count`);
    if (element) {
      element.textContent = value;
    }
  }

  updateStatusBadge(status: string, type: 'success' | 'warning' | 'error'): void {
    const statusEl = document.getElementById('usage-status');
    if (!statusEl) return;
    
    const statusClasses = {
      success: 'bg-green-900/30 text-green-400 border border-green-500/30',
      warning: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30',
      error: 'bg-red-900/30 text-red-400 border border-red-500/30'
    };
    
    statusEl.className = `px-3 py-1 rounded-full text-sm font-medium ${statusClasses[type]}`;
    statusEl.textContent = status;
  }

  updateLastRefreshTime(): void {
    const element = document.getElementById('last-updated');
    if (element) {
      element.textContent = new Date().toLocaleTimeString();
    }
  }
} 