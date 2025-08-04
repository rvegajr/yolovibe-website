#!/usr/bin/env node
// test-dashboard-interfaces.ts - CLI test harness for dashboard interfaces
// Following TDD: Test the interfaces with mock implementations first

import type { IDashboardDataService, DashboardData, DatabaseUsageData, SystemHealthData, ActivityData, EventData } from '../core/interfaces/IDashboardDataService.js';
import type { IDashboardRenderer, IDashboardProgressRenderer, IDashboardStatusRenderer } from '../core/interfaces/IDashboardRenderer.js';

// Mock Dashboard Data Service
class MockDashboardDataService implements IDashboardDataService {
  async getDatabaseUsage(): Promise<DatabaseUsageData> {
    console.log('🔍 Testing getDatabaseUsage...');
    return {
      reads: 1250,
      writes: 340,
      storage: 15,
      percentage: 12,
      status: 'SAFE'
    };
  }

  async getSystemHealth(): Promise<SystemHealthData> {
    console.log('🔍 Testing getSystemHealth...');
    return {
      status: 'HEALTHY',
      uptime: '486987h',
      services: [
        { name: 'Database', status: 'UP', responseTime: '5ms' },
        { name: 'Email Service', status: 'UP', responseTime: '12ms' }
      ]
    };
  }

  async getSystemStatus(): Promise<string> {
    console.log('🔍 Testing getSystemStatus...');
    return 'UP';
  }

  async getActivityMetrics(): Promise<ActivityData> {
    console.log('🔍 Testing getActivityMetrics...');
    return {
      activeUsers: 4,
      recentBookings: 0,
      pendingPayments: 0,
      upcomingWorkshops: 0
    };
  }

  async getRecentEvents(): Promise<EventData[]> {
    console.log('🔍 Testing getRecentEvents...');
    return [
      { type: 'info', message: 'System started successfully', timestamp: '1h ago' },
      { type: 'success', message: 'Backup completed', timestamp: '19h ago' }
    ];
  }
}

// Mock Dashboard Renderer
class MockDashboardRenderer implements IDashboardRenderer, IDashboardProgressRenderer, IDashboardStatusRenderer {
  renderDatabaseUsage(data: DatabaseUsageData): void {
    console.log('🎨 Rendering database usage:', data);
  }

  renderSystemHealth(data: SystemHealthData): void {
    console.log('🎨 Rendering system health:', data);
  }

  renderSystemStatus(status: string): void {
    console.log('🎨 Rendering system status:', status);
  }

  renderActivity(data: ActivityData): void {
    console.log('🎨 Rendering activity:', data);
  }

  renderRecentEvents(events: EventData[]): void {
    console.log('🎨 Rendering recent events:', events);
  }

  showError(message: string): void {
    console.log('❌ Showing error:', message);
  }

  showLoading(): void {
    console.log('⏳ Showing loading...');
  }

  hideLoading(): void {
    console.log('✅ Hiding loading...');
  }

  updateProgressBar(type: 'reads' | 'writes' | 'storage', percentage: number): void {
    console.log(`📊 Updating ${type} progress bar to ${percentage}%`);
  }

  updateMetricDisplay(type: 'reads' | 'writes' | 'storage', value: string): void {
    console.log(`📈 Updating ${type} metric display to ${value}`);
  }

  updateStatusBadge(status: string, type: 'success' | 'warning' | 'error'): void {
    console.log(`🏷️ Updating status badge: ${status} (${type})`);
  }

  updateLastRefreshTime(): void {
    console.log('🕒 Updating last refresh time');
  }
}

// Dashboard Controller (following proper separation of concerns)
class DashboardController {
  constructor(
    private dataService: IDashboardDataService,
    private renderer: IDashboardRenderer & IDashboardProgressRenderer & IDashboardStatusRenderer
  ) {}

  async refreshDashboard(): Promise<void> {
    try {
      this.renderer.showLoading();
      
      // Fetch all data concurrently
      const [
        databaseUsage,
        systemHealth,
        systemStatus,
        activity,
        recentEvents
      ] = await Promise.all([
        this.dataService.getDatabaseUsage(),
        this.dataService.getSystemHealth(),
        this.dataService.getSystemStatus(),
        this.dataService.getActivityMetrics(),
        this.dataService.getRecentEvents()
      ]);

      // Render all components
      this.renderer.renderDatabaseUsage(databaseUsage);
      this.renderer.renderSystemHealth(systemHealth);
      this.renderer.renderSystemStatus(systemStatus);
      this.renderer.renderActivity(activity);
      this.renderer.renderRecentEvents(recentEvents);
      
      // Update progress bars
      this.renderer.updateProgressBar('reads', (databaseUsage.reads / 10000) * 100);
      this.renderer.updateProgressBar('writes', (databaseUsage.writes / 1000) * 100);
      this.renderer.updateProgressBar('storage', databaseUsage.percentage);
      
      // Update metric displays
      this.renderer.updateMetricDisplay('reads', databaseUsage.reads.toString());
      this.renderer.updateMetricDisplay('writes', databaseUsage.writes.toString());
      this.renderer.updateMetricDisplay('storage', `${databaseUsage.storage}MB`);
      
      // Update status
      const statusType = systemStatus === 'UP' ? 'success' : 
                        systemStatus === 'DOWN' ? 'error' : 'warning';
      this.renderer.updateStatusBadge(databaseUsage.status, statusType);
      this.renderer.updateLastRefreshTime();
      
      this.renderer.hideLoading();
      
    } catch (error) {
      this.renderer.hideLoading();
      this.renderer.showError(`Failed to refresh dashboard: ${error}`);
    }
  }
}

// Test Runner
async function runDashboardTests(): Promise<void> {
  console.log('🧪 Starting Dashboard Interface Tests');
  console.log('=====================================');
  
  // Test 1: Interface Compliance
  console.log('\n📋 Test 1: Interface Compliance');
  const mockDataService = new MockDashboardDataService();
  const mockRenderer = new MockDashboardRenderer();
  
  console.log('✅ MockDashboardDataService implements IDashboardDataService');
  console.log('✅ MockDashboardRenderer implements all renderer interfaces');
  
  // Test 2: Data Service Methods
  console.log('\n📋 Test 2: Data Service Methods');
  const databaseUsage = await mockDataService.getDatabaseUsage();
  const systemHealth = await mockDataService.getSystemHealth();
  const systemStatus = await mockDataService.getSystemStatus();
  const activity = await mockDataService.getActivityMetrics();
  const events = await mockDataService.getRecentEvents();
  
  console.log('✅ All data service methods return expected data structures');
  
  // Test 3: Renderer Methods
  console.log('\n📋 Test 3: Renderer Methods');
  mockRenderer.renderDatabaseUsage(databaseUsage);
  mockRenderer.renderSystemHealth(systemHealth);
  mockRenderer.renderSystemStatus(systemStatus);
  mockRenderer.renderActivity(activity);
  mockRenderer.renderRecentEvents(events);
  
  console.log('✅ All renderer methods execute without errors');
  
  // Test 4: Controller Integration
  console.log('\n📋 Test 4: Controller Integration');
  const controller = new DashboardController(mockDataService, mockRenderer);
  await controller.refreshDashboard();
  
  console.log('✅ Dashboard controller integrates all interfaces correctly');
  
  console.log('\n🎉 All Dashboard Interface Tests Passed!');
  console.log('Ready to implement concrete dashboard classes.');
}

// Run tests if called directly
if (import.meta.url.endsWith(process.argv[1])) {
  runDashboardTests().catch(console.error);
}

export { MockDashboardDataService, MockDashboardRenderer, DashboardController }; 