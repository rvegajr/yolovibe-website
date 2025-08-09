import type { APIRoute } from 'astro';
import { UserAuthenticatorDB } from '../../registration/implementations/database/UserAuthenticatorDB.js';
import { initializeDatabase } from '../../registration/database/connection.js';

export const onRequest: APIRoute = async ({ request, redirect }) => {
  await initializeDatabase();
  const cookies = request.headers.get('cookie') || '';
  const sessionCookie = cookies.split(';').find(c=>c.trim().startsWith('sessionToken='));
  const token = sessionCookie ? sessionCookie.split('=')[1] : null;
  if (!token) return redirect('/login');
  const auth = new UserAuthenticatorDB();
  const valid = await auth.validateSession(token);
  if (!valid) return redirect('/login');
};



