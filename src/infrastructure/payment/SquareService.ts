/**
 * Square Payment Service
 * Handles all Square API interactions with proper TypeScript integration
 */

import { SquareClient, SquareEnvironment, SquareError, Square } from 'square';
import type { AppConfig } from '../config.js';

export interface PaymentRequest {
  amount: number; // Amount in cents
  currency: string;
  sourceId: string; // Card nonce from Square Web Payments SDK
  locationId?: string;
  orderId?: string;
  note?: string;
  buyerEmailAddress?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  receiptUrl?: string;
  error?: string;
  errorCode?: string;
}

export interface LocationInfo {
  id: string;
  name: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    locality?: string;
    administrativeDistrictLevel1?: string;
    postalCode?: string;
    country?: string;
  };
  timezone?: string;
  capabilities?: string[];
}

export interface PaymentService {
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
  getLocation(locationId?: string): Promise<LocationInfo | null>;
  listLocations(): Promise<LocationInfo[]>;
  validateConnection(): Promise<{ valid: boolean; error?: string; location?: LocationInfo }>;
}

export class SquareService implements PaymentService {
  private client: SquareClient;
  private locationId: string;

  constructor(config: AppConfig) {
    // Initialize Square client with proper token
    this.client = new SquareClient({
      token: config.square.accessToken, // Square SDK expects 'token' but our config uses 'accessToken'
      environment: config.square.environment === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
    });

    this.locationId = config.square.locationId;
  }

  /**
   * Validates the Square connection by attempting to list locations
   * @returns Object with validation result and error message if any
   */
  async validateConnection(): Promise<{ valid: boolean; error?: string; location?: LocationInfo }> {
    try {
      // Try to list locations first (doesn't require a specific location ID)
      const locations = await this.listLocations();
      
      if (!locations || locations.length === 0) {
        return { valid: false, error: 'No locations found in Square account' };
      }
      
      // If we have a specific location ID, try to find it
      if (this.locationId) {
        const location = locations.find(loc => loc.id === this.locationId);
        if (!location) {
          return { 
            valid: false, 
            error: `Location ID ${this.locationId} not found in available locations` 
          };
        }
        return { valid: true, location };
      }
      
      // If no specific location ID, use the first available location
      return { valid: true, location: locations[0] };
    } catch (error: any) {
      // Provide detailed error information
      if (error.statusCode === 401) {
        return { 
          valid: false, 
          error: `Authentication failed: Invalid access token (401 Unauthorized)` 
        };
      }
      
      return { 
        valid: false, 
        error: `Square API error: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Process a payment using Square Payments API
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const createPaymentRequest = {
        sourceId: request.sourceId,
        idempotencyKey: this.generateIdempotencyKey(),
        amountMoney: {
          amount: BigInt(request.amount),
          currency: request.currency as Square.Currency,
        },
        locationId: request.locationId || this.locationId,
        ...(request.orderId && { orderId: request.orderId }),
        ...(request.note && { note: request.note }),
        ...(request.buyerEmailAddress && { buyerEmailAddress: request.buyerEmailAddress }),
      };

      const response = await this.client.payments.create(createPaymentRequest);

      if (response.payment) {
        const payment = response.payment;
        return {
          success: true,
          paymentId: payment.id,
          transactionId: payment.id, // In Square v2, payment ID is the transaction ID
          amount: Number(payment.amountMoney?.amount || 0),
          currency: payment.amountMoney?.currency || request.currency,
          status: payment.status,
          receiptUrl: payment.receiptUrl,
        };
      } else {
        return {
          success: false,
          error: 'Payment creation failed - no payment object returned',
        };
      }
    } catch (error) {
      return this.handleSquareError(error);
    }
  }

  /**
   * Get location information
   */
  async getLocation(locationId?: string): Promise<LocationInfo | null> {
    try {
      const targetLocationId = locationId || this.locationId;

      // Use listLocations and filter for the specific ID
      const response = await this.client.locations.list();
      
      if (!response.locations || response.locations.length === 0) {
        throw new Error('No locations found');
      }
      
      // Find the specific location by ID
      const location = response.locations.find(loc => loc.id === targetLocationId);
      
      if (!location) {
        throw new Error(`Location with ID ${targetLocationId} not found`);
      }
      
      return {
        id: location.id || '',
        name: location.name || '',
        address: location.address
          ? {
              addressLine1: location.address.addressLine1 || undefined,
              addressLine2: location.address.addressLine2 || undefined,
              locality: location.address.locality || undefined,
              administrativeDistrictLevel1:
                location.address.administrativeDistrictLevel1 || undefined,
              postalCode: location.address.postalCode || undefined,
              country: location.address.country || undefined,
            }
          : undefined,
        timezone: location.timezone || undefined,
        capabilities: location.capabilities,
      };
    } catch (error) {
      console.error('Failed to retrieve location:', error);
      return null;
    }
  }

  /**
   * List all locations for the account
   */
  async listLocations(): Promise<LocationInfo[]> {
    try {
      const response = await this.client.locations.list();
      const locations: LocationInfo[] = [];

      if (response.locations) {
        for (const location of response.locations) {
          locations.push({
            id: location.id || '',
            name: location.name || '',
            address: location.address
              ? {
                  addressLine1: location.address.addressLine1 || undefined,
                  addressLine2: location.address.addressLine2 || undefined,
                  locality: location.address.locality || undefined,
                  administrativeDistrictLevel1:
                    location.address.administrativeDistrictLevel1 || undefined,
                  postalCode: location.address.postalCode || undefined,
                  country: location.address.country || undefined,
                }
              : undefined,
            timezone: location.timezone || undefined,
            capabilities: location.capabilities,
          });
        }
      }

      return locations;
    } catch (error) {
      console.error('Failed to list locations:', error);
      return [];
    }
  }

  // Removed duplicate validateConnection method

  /**
   * Generate a unique idempotency key for payment requests
   */
  private generateIdempotencyKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Handle Square API errors with proper typing
   */
  private handleSquareError(error: unknown): PaymentResult {
    if (error instanceof SquareError) {
      const firstError = error.errors?.[0];
      return {
        success: false,
        error: firstError?.detail || error.message || 'Square API error',
        errorCode: firstError?.code || 'UNKNOWN_ERROR',
      };
    } else if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        errorCode: 'NETWORK_ERROR',
      };
    } else {
      return {
        success: false,
        error: 'Unknown error occurred',
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }
}

export default SquareService;
