/**
 * Admin Dashboard API Endpoint
 * 
 * Provides all dashboard data in a single request for optimal performance.
 * Follows interface segregation by using focused service implementations.
 */

import type { APIRoute } from 'astro';
import { DashboardService } from '../../../registration/implementations/DashboardService.js';
import { ProductionMonitor } from '../../../registration/implementations/ProductionMonitor.js';
import { ProductionDataValidator } from '../../../registration/implementations/ProductionDataValidator.js';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    // Initialize database connection if needed
    const { getDatabaseConnection, initializeDatabase } = await import('../../../registration/database/connection.js');
    const dbConnection = getDatabaseConnection();
    if (!dbConnection.isInitialized()) {
      await initializeDatabase();
    }
    
    // In production, verify admin authentication here
    // const auth = await verifyAdminAuth(request);
    // if (!auth.isValid) {
    //   return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    //     status: 401,
    //     headers: { 'Content-Type': 'application/json' }
    //   });
    // }

    // Get comprehensive dashboard data
    const dashboardService = new DashboardService();
    const dashboardData = await dashboardService.getDashboardData();
    
    // Add production monitoring data
    const monitor = ProductionMonitor.getInstance();
    const systemHealth = await monitor.performHealthCheck();
    
    const validator = ProductionDataValidator.getInstance();
    const dataValidation = await validator.validateProductionData();
    
    // Enhanced dashboard data with production monitoring
    const enhancedData = {
      ...dashboardData,
      productionHealth: {
        overall: systemHealth.overall,
        dataSource: dataValidation.dataSource,
        isUsingRealData: dataValidation.dataSource === 'REAL_DATABASE',
        lastCheck: systemHealth.timestamp,
        uptime: systemHealth.uptime,
        services: systemHealth.checks.map(check => ({
          name: check.service,
          status: check.status,
          responseTime: check.responseTime,
          error: check.error
        })),
        alerts: [
          ...dataValidation.errors.map(error => ({ type: 'error', message: error })),
          ...dataValidation.warnings.map(warning => ({ type: 'warning', message: warning }))
        ]
      }
    };

    return new Response(JSON.stringify(enhancedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Handle dashboard refresh requests
    const dashboardService = new SimpleDashboardService();
    const dashboardData = await dashboardService.getDashboardData();

    return new Response(JSON.stringify(dashboardData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Dashboard refresh error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to refresh dashboard',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 