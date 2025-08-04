import type { APIRoute } from 'astro';
import { UserAuthenticatorDB } from '../../../registration/implementations/database/UserAuthenticatorDB.js';
import { initializeDatabase } from '../../../registration/database/connection.js';
import type { RegistrationData } from '../../../registration/core/types/index.js';

export const prerender = false;

/**
 * POST /api/auth/register
 * Registers a new user account
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('👤 API: User registration request');
    
    // Initialize database if not already done
    await initializeDatabase();
    
    // Parse request body
    const body = await request.json();
    const { email, password, firstName, lastName, company } = body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email, password, first name, and last name are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email format'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Password strength validation
    if (password.length < 8) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Password must be at least 8 characters long'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`🔍 API: Registering user: ${email}`);
    
    const userRegistration: RegistrationData = {
      email,
      password,
      firstName,
      lastName,
      company: company || undefined
    };
    
    const userAuth = new UserAuthenticatorDB();
    const result = await userAuth.registerUser(userRegistration);
    
    console.log(`✅ API: User registration successful for: ${email}`);
    
    // Create session for the newly registered user
    const session = await userAuth.createSession(result.id);
    
    // Set session cookie
    const cookieOptions = [
      `sessionToken=${session.token}`,
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      'Path=/',
      `Max-Age=${24 * 60 * 60}` // 24 hours
    ].join('; ');

    return new Response(JSON.stringify({
      success: true,
      message: 'User registered successfully',
      user: {
        id: result.id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName
      },
      sessionToken: session.token,
      expiresAt: session.expiresAt
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieOptions
      }
    });
    
  } catch (error) {
    console.error('❌ API Error during registration:', error);
    
    // Handle specific error types
    if (error instanceof Error && error.message.includes('already exists')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'An account with this email already exists'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Registration failed',
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
 * OPTIONS /api/auth/register
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
