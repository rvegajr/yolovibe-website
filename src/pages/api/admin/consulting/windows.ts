import type { APIRoute } from 'astro';
import { getDatabaseConnection } from '../../../../registration/database/connection.js';

export const GET: APIRoute = async () => {
  const db = getDatabaseConnection();
  if (!db.isInitialized()) await db.initialize();
  const rows = await db.query('SELECT id, weekday, start_time, end_time, is_active, priority FROM consulting_availability_windows ORDER BY weekday, start_time');
  return new Response(JSON.stringify({ success: true, data: rows }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();
    if (!Array.isArray(payload)) {
      return new Response(JSON.stringify({ success: false, error: 'Expected array of windows' }), { status: 400 });
    }
    const db = getDatabaseConnection();
    if (!db.isInitialized()) await db.initialize();
    await db.execute('DELETE FROM consulting_availability_windows');
    for (const w of payload) {
      if (typeof w.weekday !== 'number' || !w.start_time || !w.end_time) continue;
      await db.execute(
        'INSERT INTO consulting_availability_windows (weekday, start_time, end_time, is_active, priority) VALUES (?, ?, ?, ?, ?)',
        [w.weekday, w.start_time, w.end_time, w.is_active ? 1 : 0, w.priority ?? 0]
      );
    }
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e?.message || 'Failed to update windows' }), { status: 500 });
  }
};



