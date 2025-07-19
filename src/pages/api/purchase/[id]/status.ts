/**
 * API Endpoint: Get Purchase Status
 * GET /api/purchase/{id}/status
 * 
 * Retrieves the status of a purchase
 */

import type { APIRoute } from 'astro';
import { PurchaseManager } from '../../../../registration/implementations/PurchaseManager.js';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  console.log('📊 Purchase Status API: Getting purchase status...');

  try {
    const purchaseId = params.id;

    if (!purchaseId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Purchase ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`🔍 Looking up purchase: ${purchaseId}`);

    // Initialize purchase manager
    const purchaseManager = new PurchaseManager();

    // Get purchase status
    const status = await purchaseManager.getPurchaseStatus(purchaseId);

    console.log('✅ Purchase status retrieved:', {
      purchaseId: status.purchaseId,
      bookingStatus: status.bookingStatus,
      paymentStatus: status.paymentStatus
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        purchaseId: status.purchaseId,
        bookingStatus: status.bookingStatus,
        paymentStatus: status.paymentStatus,
        totalAmount: status.totalAmount,
        paidAmount: status.paidAmount,
        refundAmount: status.refundAmount,
        createdAt: status.createdAt.toISOString(),
        updatedAt: status.updatedAt.toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Purchase Status API error:', error);

    // Handle not found case
    if (error instanceof Error && error.message.includes('not found')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Purchase not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
