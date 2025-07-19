/**
 * Admin Dashboard API Endpoint
 * 
 * Provides all dashboard data in a single request for optimal performance.
 * Follows interface segregation by using focused service implementations.
 */

import type { APIRoute } from 'astro';
import { dashboardService } from '../../../registration/implementations/DashboardService.js';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    // In production, verify admin authentication here
    // const auth = await verifyAdminAuth(request);
    // if (!auth.isValid) {
    //   return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    //     status: 401,
    //     headers: { 'Content-Type': 'application/json' }
    //   });
    // }

    // Get comprehensive dashboard data
    const dashboardData = await dashboardService.getDashboardData();

    return new Response(JSON.stringify(dashboardData), {
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
    const dashboardData = await dashboardService.refreshDashboard();

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