import type { APIRoute } from 'astro';
import { getDatabaseConnection } from '../../../../registration/database/connection.js';

export const GET: APIRoute = async () => {
  const db = getDatabaseConnection();
  if (!db.isInitialized()) await db.initialize();
  const rows = await db.query('SELECT id, start_date, end_date, reason FROM calendar_blockouts ORDER BY start_date');
  return new Response(JSON.stringify({ success: true, data: rows }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { start_date, end_date, reason } = await request.json();
    if (!start_date || !end_date) {
      return new Response(JSON.stringify({ success: false, error: 'start_date and end_date required' }), { status: 400 });
    }
    const db = getDatabaseConnection();
    if (!db.isInitialized()) await db.initialize();
    await db.execute('INSERT INTO calendar_blockouts (id, start_date, end_date, reason, created_by) VALUES (?, ?, ?, ?, ?)', [
      `admin_${Date.now()}`, start_date, end_date, reason || 'Admin blockout', 'admin'
    ]);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e?.message || 'Failed to add blockout' }), { status: 500 });
  }
};



