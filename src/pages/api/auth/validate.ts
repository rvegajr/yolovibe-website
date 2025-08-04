import type { APIRoute } from 'astro';
import { UserAuthenticatorDB } from '../../../registration/implementations/database/UserAuthenticatorDB.js';
import { initializeDatabase } from '../../../registration/database/connection.js';

export const prerender = false;

/**
 * GET /api/auth/validate
 * Validates a session token and returns user information
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    console.log('🔍 API: Session validation request');
    
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
        error: 'No session token provided',
        authenticated: false
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('🔐 API: Validating session token');
    
    const userAuth = new UserAuthenticatorDB();
    const isValidSession = await userAuth.validateSession(sessionToken);
    
    if (!isValidSession) {
      console.log('❌ API: Session validation failed');
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid or expired session',
        authenticated: false
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('✅ API: Session validated successfully');
    
    return new Response(JSON.stringify({
      success: true,
      authenticated: true,
      message: 'Session is valid'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('❌ API Error during session validation:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Session validation failed',
      authenticated: false,
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
 * POST /api/auth/validate
 * Validates a session token provided in request body
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Initialize database if not already done
    await initializeDatabase();
    
    const body = await request.json();
    const { sessionToken } = body;
    
    if (!sessionToken) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session token is required',
        authenticated: false
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('🔐 API: Validating session token from body');
    
    const userAuth = new UserAuthenticatorDB();
    const isValidSession = await userAuth.validateSession(sessionToken);
    
    if (!isValidSession) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid or expired session',
        authenticated: false
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('✅ API: Session validated successfully');
    
    return new Response(JSON.stringify({
      success: true,
      authenticated: true,
      message: 'Session is valid'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('❌ API Error during session validation:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Session validation failed',
      authenticated: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
