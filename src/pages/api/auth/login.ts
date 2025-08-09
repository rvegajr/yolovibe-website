import type { APIRoute } from 'astro';
import { UserAuthenticatorDB } from '../../../registration/implementations/database/UserAuthenticatorDB.js';
import type { Credentials } from '../../../registration/core/types/index.js';
import { initializeDatabase } from '../../../registration/database/connection.js';

export const prerender = false;

/**
 * POST /api/auth/login
 * Authenticates a user and returns session token
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('🔐 API: User login attempt');
    // Ensure DB is initialized for LibSQL client
    await initializeDatabase();
    
    const body = await request.json();
    const { email, password } = body;
    
    // Validate required fields
    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email and password are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`🔍 API: Authenticating user: ${email}`);
    
    const credentials: Credentials = { email, password };
    const userAuth = new UserAuthenticatorDB();
    const authResult = await userAuth.authenticate(credentials);
    
    if (!authResult.success) {
      console.log(`❌ API: Authentication failed for: ${email}`);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email or password'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`✅ API: User authenticated successfully: ${email}`);
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (authResult.expiresIn || 86400));
    
    // Build session cookie with dev-friendly attributes (no Secure on http)
    const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
    const cookieParts = [
      `sessionToken=${authResult.token}`,
      'HttpOnly',
      'SameSite=Strict',
      'Path=/',
      `Max-Age=${authResult.expiresIn || 86400}`
    ];
    if (isProd) cookieParts.push('Secure');

    return new Response(JSON.stringify({
      success: true,
      data: {
        userId: authResult.userId,
        sessionToken: authResult.token,
        expiresAt: expiresAt.toISOString()
      },
      message: 'Login successful'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieParts.join('; ')
      }
    });
    
  } catch (error) {
    console.error('❌ API Error during login:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Login failed',
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
 * OPTIONS /api/auth/login
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
