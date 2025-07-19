/**
 * Admin Task Completion API Endpoint
 */

import type { APIRoute } from 'astro';
import { adminCalendarService } from '../../../../../registration/implementations/DashboardService.js';

export const prerender = false;

export const POST: APIRoute = async ({ params }) => {
  try {
    const taskId = params.id;
    
    if (!taskId) {
      return new Response(JSON.stringify({ error: 'Task ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await adminCalendarService.markTaskComplete(taskId);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Task marked as complete'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Task completion error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to complete task',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 