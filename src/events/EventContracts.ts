/**
 * 🎯 EVENT PAYLOAD INTERFACES
 * 
 * These interfaces define the exact structure of data passed with each event.
 * This ensures type safety and clear contracts between event emitters and handlers.
 */

/**
 * Base interface for all events
 */
export interface BaseEvent {
  timestamp: Date;
  source?: string;
  correlationId?: string;
}

// =====================================================
// 🪟 LOCAL EVENT PAYLOADS
// =====================================================

export interface WorkshopSelectedEvent extends BaseEvent {
  workshopId: string;
  workshopName: string;
  workshopType: 'THREE_DAY' | 'FIVE_DAY' | 'HOURLY_CONSULTING';
  price: number;
  componentId: string;
}

export interface DateSelectedEvent extends BaseEvent {
  date: Date;
  workshopId: string;
  workshopType: string;
  duration: number;
}

export interface BookingSubmittedEvent extends BaseEvent {
  bookingId: string;
  workshopId: string;
  userId: string;
  attendeeCount: number;
  totalAmount: number;
  startDate: Date;
  pointOfContact: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface UserInteractionEvent extends BaseEvent {
  action: 'click' | 'submit' | 'view' | 'search' | 'navigate';
  element: string;
  page: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ErrorOccurredEvent extends BaseEvent {
  error: string;
  errorCode?: string;
  stack?: string;
  userId?: string;
  page: string;
  action?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// 🎯 SPA NAVIGATION EVENT
export interface PageNavigationEvent extends BaseEvent {
  from: string;
  to: string;
  data?: Record<string, any>;
  navigationMethod?: 'push' | 'replace' | 'back' | 'forward';
  userId?: string;
} 