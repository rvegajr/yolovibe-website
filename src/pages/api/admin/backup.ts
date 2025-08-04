/**
 * Admin Manual Backup API Endpoint
 */

import type { APIRoute } from 'astro';
import { backupManager } from '../../../registration/database/BackupManager.js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const description = body.description || `Manual backup - ${new Date().toLocaleString()}`;

    const backup = await backupManager.createBackup(description);

    return new Response(JSON.stringify({ 
      success: true,
      backupId: backup.id,
      filename: backup.filename,
      size: backup.size,
      timestamp: backup.timestamp,
      message: 'Backup created successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Manual backup error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to create backup',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 