import type { APIRoute } from 'astro';

// Returns available hourly start times for a consulting session on a given date
// respecting admin blockouts stored via CalendarManagerDB
// Query params:
// - date: YYYY-MM-DD
// - durationHours: integer (1-8)
export const GET: APIRoute = async ({ url }) => {
  try {
    const dateStr = url.searchParams.get('date');
    const durationParam = url.searchParams.get('durationHours');

    if (!dateStr) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required parameter: date' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const durationHours = Math.max(1, Math.min(8, parseInt(durationParam || '2', 10)));

    // Validate weekday 1-5 (Mon-Fri). If weekend, return empty slots.
    const date = new Date(dateStr);
    const day = date.getDay();
    const isWeekday = day >= 1 && day <= 5;
    if (!isWeekday) {
      return new Response(
        JSON.stringify({ success: true, data: { slots: [], reason: 'WEEKEND' } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check admin blockouts via CalendarManagerDB
    const { CalendarManagerDB } = await import('../../../registration/implementations/CalendarManagerDB.js');
    const calendarManager = new CalendarManagerDB();
    const isAvailable = await calendarManager.isDateAvailable(date, 'HOURLY_CONSULTING' as any);

    if (!isAvailable) {
      return new Response(
        JSON.stringify({ success: true, data: { slots: [], reason: 'BLOCKED' } }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
      );
    }

    // Compute working windows from DB for this weekday
    const weekday = date.getDay();
    const { getDatabaseConnection } = await import('../../../registration/database/connection.js');
    const db = getDatabaseConnection();
    if (!db.isInitialized()) await db.initialize();
    const windows = await db.query('SELECT start_time, end_time FROM consulting_availability_windows WHERE weekday=? AND is_active=1 ORDER BY priority DESC, start_time ASC', [weekday]);

    const parse = (t: string) => {
      const [hh, mm] = t.split(':').map(Number);
      return hh + (mm || 0) / 60;
    };

    const slots: string[] = [];
    for (const w of windows) {
      const start = parse(w.start_time);
      const end = parse(w.end_time);
      for (let h = Math.ceil(start); h + durationHours <= end; h++) {
        const hh = h.toString().padStart(2, '0');
        slots.push(`${hh}:00`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: { slots, workday: { start: '09:00', end: '17:00' }, durationHours } }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('❌ API Error consulting-availability:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to compute consulting availability' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};


