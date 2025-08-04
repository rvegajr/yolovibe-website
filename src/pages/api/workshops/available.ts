import type { APIRoute } from 'astro';
import { ProductCatalogManager } from '../../../registration/implementations/ProductCatalogManager.js';
import type { Product } from '../../../registration/core/types/index.js';

export const prerender = false;

/**
 * GET /api/workshops/available
 * Returns all available workshop products with their details
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    console.log('🔍 API: Getting available workshops');
    
    const productCatalog = new ProductCatalogManager();
    const products = await productCatalog.getAvailableProducts();
    
    // Return all available products (they're already filtered by the implementation)
    const workshopsData = products.map(product => ({
      id: product.id,
      name: product.name,
      type: product.type,
      price: product.price,
      duration: product.duration,
      description: product.description,
      maxCapacity: product.maxCapacity,
      availableStartDays: product.availableStartDays
    }));
    
    console.log(`✅ API: Found ${workshopsData.length} available workshops`);
    
    return new Response(JSON.stringify({
      success: true,
      data: workshopsData,
      count: workshopsData.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });
    
  } catch (error) {
    console.error('❌ API Error getting available workshops:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch available workshops',
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
 * GET /api/workshops/available?productType=THREE_DAY
 * Returns available workshops filtered by product type
 */
export const GET_FILTERED: APIRoute = async ({ url }) => {
  try {
    const productType = url.searchParams.get('productType');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    console.log('🔍 API: Getting filtered workshops', { productType, startDate, endDate });
    
    const productCatalog = new ProductCatalogManager();
    let products = await productCatalog.getAvailableProducts();
    
    // Apply filters
    if (productType) {
      products = products.filter(product => product.type === productType);
    }
    
    // Return all available products (they're already filtered by the implementation)
    const workshopsData = products.map(product => ({
      id: product.id,
      name: product.name,
      type: product.type,
      price: product.price,
      duration: product.duration,
      description: product.description,
      maxCapacity: product.maxCapacity,
      availableStartDays: product.availableStartDays
    }));
    
    console.log(`✅ API: Found ${workshopsData.length} filtered workshops`);
    
    return new Response(JSON.stringify({
      success: true,
      data: workshopsData,
      count: workshopsData.length,
      filters: { productType, startDate, endDate }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
    
  } catch (error) {
    console.error('❌ API Error getting filtered workshops:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch filtered workshops',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
