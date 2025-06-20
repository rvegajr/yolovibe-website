import type { APIRoute } from 'astro';
import { UserAuthenticatorDB } from '../../../registration/implementations/database/UserAuthenticatorDB.js';
import { initializeDatabase } from '../../../registration/database/connection.js';

export const prerender = false;

/**
 * POST /api/auth/logout
 * Logs out a user by invalidating their session
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('🚪 API: User logout request');
    
    // Initialize database if not already done
    await initializeDatabase();
    
    // Get session token from cookie or Authorization header
    const cookies = request.headers.get('cookie');
    const authHeader = request.headers.get('authorization');
    
    let sessionToken: string | null = null;
    
    // Try to get token from cookie first
    if (cookies) {
      const sessionCookie = cookies
        .split(';')
        .find(cookie => cookie.trim().startsWith('sessionToken='));
      if (sessionCookie) {
        sessionToken = sessionCookie.split('=')[1];
      }
    }
    
    // Fallback to Authorization header
    if (!sessionToken && authHeader && authHeader.startsWith('Bearer ')) {
      sessionToken = authHeader.substring(7);
    }
    
    if (!sessionToken) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No session token provided'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('🔍 API: Invalidating session token');
    
    const userAuth = new UserAuthenticatorDB();
    const logoutResult = await userAuth.logoutUser(sessionToken);
    
    if (!logoutResult) {
      console.log('❌ API: Logout failed - invalid session');
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid session token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('✅ API: User logged out successfully');
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Logout successful'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'sessionToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0' // Clear cookie
      }
    });
    
  } catch (error) {
    console.error('❌ API Error during logout:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Logout failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

/**
 * OPTIONS /api/auth/logout
 * Handle CORS preflight requests
 */
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
};
