/**
 * API Endpoint: Create Purchase
 * POST /api/purchase/create
 * 
 * Handles complete purchase workflow (booking + payment)
 */

import type { APIRoute } from 'astro';
import { PurchaseManager } from '../../../registration/implementations/PurchaseManager.js';
import type { PurchaseRequest } from '../../../registration/core/types/index.js';

export const POST: APIRoute = async ({ request }) => {
  console.log('🛒 Purchase API: Processing purchase request...');

  try {
    // Parse request body
    const body = await request.json();
    console.log('📝 Purchase request received:', {
      productId: body.bookingRequest?.productId,
      attendeeCount: body.bookingRequest?.attendeeCount,
      paymentMethod: body.paymentMethod?.type
    });

    // Validate required fields
    if (!body.bookingRequest) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing booking request'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!body.paymentMethod) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing payment method'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate booking request fields
    const { bookingRequest } = body;
    if (!bookingRequest.productId || !bookingRequest.startDate || !bookingRequest.attendeeCount) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required booking fields: productId, startDate, attendeeCount'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!bookingRequest.pointOfContact || !bookingRequest.attendees) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required booking fields: pointOfContact, attendees'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Convert startDate string to Date object
    const purchaseRequest: PurchaseRequest = {
      ...body,
      bookingRequest: {
        ...bookingRequest,
        startDate: new Date(bookingRequest.startDate)
      }
    };

    // Initialize purchase manager
    const purchaseManager = new PurchaseManager();

    // Process purchase
    console.log('💳 Processing purchase workflow...');
    const result = await purchaseManager.processPurchase(purchaseRequest);

    console.log('✅ Purchase workflow completed:', {
      purchaseId: result.purchaseId,
      status: result.status,
      totalAmount: result.totalAmount
    });

    // Return success response
    if (result.status === 'completed') {
      return new Response(JSON.stringify({
        success: true,
        data: {
          purchaseId: result.purchaseId,
          bookingId: result.bookingId,
          paymentId: result.paymentId,
          status: result.status,
          totalAmount: result.totalAmount,
          confirmationNumber: result.confirmationNumber,
          receiptUrl: result.receiptUrl
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Purchase failed
      return new Response(JSON.stringify({
        success: false,
        error: result.errorMessage || 'Purchase processing failed',
        data: {
          purchaseId: result.purchaseId,
          status: result.status
        }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ Purchase API error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
