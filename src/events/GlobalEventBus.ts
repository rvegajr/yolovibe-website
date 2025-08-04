/**
 * 🌍 GLOBAL EVENT BUS - SPA Edition
 * 
 * This magnificent event bus persists across route changes and provides
 * seamless communication between all components in our SPA!
 * 
 * Features:
 * - Persistent across route changes
 * - Cross-tab communication via BroadcastChannel
 * - Event history and replay
 * - Performance monitoring
 * - Beautiful debugging interface
 */

import { EventTypes, type EventType } from './EventTypes.js';
import type { 
  WorkshopSelectedEvent, 
  DateSelectedEvent, 
  BookingSubmittedEvent,
  UserInteractionEvent,
  ErrorOccurredEvent,
  PageNavigationEvent
} from './EventContracts.js';

export interface GlobalEventBusOptions {
  enableCrossTabSync?: boolean;
  enableEventHistory?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableDebugging?: boolean;
  maxHistorySize?: number;
}

export class GlobalEventBus {
  private static instance: GlobalEventBus;
  private listeners: Map<string, Set<Function>> = new Map();
  private eventHistory: Array<{ type: string; payload: any; timestamp: Date }> = [];
  private broadcastChannel: BroadcastChannel | null = null;
  private options: Required<GlobalEventBusOptions>;
  
  private constructor(options: GlobalEventBusOptions = {}) {
    this.options = {
      enableCrossTabSync: true,
      enableEventHistory: true,
      enablePerformanceMonitoring: true,
      enableDebugging: true,
      maxHistorySize: 1000,
      ...options
    };
    
    this.setupCrossTabSync();
    this.setupDebugging();
    
    console.log('🌍 GlobalEventBus initialized with magnificent powers!');
  }
  
  public static getInstance(options?: GlobalEventBusOptions): GlobalEventBus {
    if (!GlobalEventBus.instance) {
      GlobalEventBus.instance = new GlobalEventBus(options);
    }
    return GlobalEventBus.instance;
  }
  
  private setupCrossTabSync(): void {
    if (!this.options.enableCrossTabSync || typeof BroadcastChannel === 'undefined') {
      return;
    }
    
    this.broadcastChannel = new BroadcastChannel('yolovibe-global-events');
    this.broadcastChannel.addEventListener('message', (event) => {
      const { type, payload, source } = event.data;
      
      // Don't echo back our own events
      if (source !== this.getInstanceId()) {
        this.emitLocal(type, payload, false);
      }
    });
  }
  
  private setupDebugging(): void {
    if (!this.options.enableDebugging) return;
    
    // Add to window for debugging
    (window as any).GlobalEventBus = this;
    
    // Beautiful console styling
    const style = 'background: linear-gradient(45deg, #7510F7, #00E5FF); color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;';
    console.log('%c🌍 GlobalEventBus Debug Interface Available!', style);
    console.log('Use window.GlobalEventBus to inspect events, listeners, and history');
  }
  
  private getInstanceId(): string {
    return `instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  public async emit(eventType: EventType, payload: any): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Add metadata to payload
      const enrichedPayload = {
        ...payload,
        timestamp: new Date(),
        eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: 'GlobalEventBus'
      };
      
      // Emit locally
      await this.emitLocal(eventType, enrichedPayload, true);
      
      // Broadcast to other tabs
      if (this.broadcastChannel && this.options.enableCrossTabSync) {
        this.broadcastChannel.postMessage({
          type: eventType,
          payload: enrichedPayload,
          source: this.getInstanceId()
        });
      }
      
      // Performance monitoring
      if (this.options.enablePerformanceMonitoring) {
        const duration = performance.now() - startTime;
        if (duration > 10) { // Log slow events
          console.warn(`🐌 Slow event emission: ${eventType} took ${duration.toFixed(2)}ms`);
        }
      }
      
    } catch (error) {
      console.error(`❌ GlobalEventBus emission failed for ${eventType}:`, error);
      throw error;
    }
  }
  
  private async emitLocal(eventType: EventType, payload: any, addToHistory: boolean): Promise<void> {
    // Add to history
    if (addToHistory && this.options.enableEventHistory) {
      this.eventHistory.push({
        type: eventType,
        payload: { ...payload },
        timestamp: new Date()
      });
      
      // Trim history if too large
      if (this.eventHistory.length > this.options.maxHistorySize) {
        this.eventHistory = this.eventHistory.slice(-this.options.maxHistorySize);
      }
    }
    
    // Get listeners for this event type
    const listeners = this.listeners.get(eventType);
    if (!listeners || listeners.size === 0) {
      console.log(`📡 Event emitted but no listeners: ${eventType}`);
      return;
    }
    
    // Call all listeners
    const promises: Promise<void>[] = [];
    for (const listener of listeners) {
      try {
        const result = listener(payload);
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (error) {
        console.error(`❌ Event listener error for ${eventType}:`, error);
      }
    }
    
    // Wait for all async listeners
    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }
    
    // Beautiful logging
    if (this.options.enableDebugging) {
      const style = `background: linear-gradient(45deg, #7510F7, #00E5FF); color: white; padding: 1px 6px; border-radius: 3px; font-size: 11px;`;
      console.log(`%c🌍 ${eventType}`, style, payload);
    }
  }
  
  public on(eventType: EventType, listener: Function): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(listener);
    
    console.log(`🎧 Listener added for ${eventType} (${this.listeners.get(eventType)!.size} total)`);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(listener);
      if (this.listeners.get(eventType)?.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }
  
  public off(eventType: EventType, listener?: Function): void {
    if (!listener) {
      // Remove all listeners for this event type
      this.listeners.delete(eventType);
      console.log(`🔇 All listeners removed for ${eventType}`);
    } else {
      // Remove specific listener
      this.listeners.get(eventType)?.delete(listener);
      if (this.listeners.get(eventType)?.size === 0) {
        this.listeners.delete(eventType);
      }
      console.log(`🔇 Listener removed for ${eventType}`);
    }
  }
  
  public once(eventType: EventType, listener: Function): () => void {
    const onceListener = (payload: any) => {
      listener(payload);
      this.off(eventType, onceListener);
    };
    
    return this.on(eventType, onceListener);
  }
  
  // 🎯 SPA NAVIGATION HELPERS
  public async navigateTo(path: string, data?: any): Promise<void> {
    await this.emit(EventTypes.PAGE_NAVIGATION, {
      from: window.location.pathname,
      to: path,
      data,
      timestamp: new Date(),
      source: 'GlobalEventBus'
    } as PageNavigationEvent);
  }
  
  // 🎯 WORKSHOP SELECTION HELPERS
  public async selectWorkshop(workshopId: string, workshopData: any): Promise<void> {
    await this.emit(EventTypes.WORKSHOP_SELECTED, {
      workshopId,
      workshopName: workshopData.name,
      workshopType: workshopData.type.toUpperCase(),
      price: workshopData.price,
      timestamp: new Date(),
      source: 'GlobalEventBus'
    } as WorkshopSelectedEvent);
  }
  
  // 🎯 DEBUG AND MONITORING METHODS
  public getEventHistory(): Array<{ type: string; payload: any; timestamp: Date }> {
    return [...this.eventHistory];
  }
  
  public getListenerStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [eventType, listeners] of this.listeners) {
      stats[eventType] = listeners.size;
    }
    return stats;
  }
  
  public clearHistory(): void {
    this.eventHistory = [];
    console.log('🗑️ Event history cleared');
  }
  
  public replay(eventType?: EventType): void {
    const eventsToReplay = eventType 
      ? this.eventHistory.filter(e => e.type === eventType)
      : this.eventHistory;
      
    console.log(`🔄 Replaying ${eventsToReplay.length} events...`);
    
    for (const event of eventsToReplay) {
      this.emitLocal(event.type as EventType, event.payload, false);
    }
  }
  
  public destroy(): void {
    this.listeners.clear();
    this.eventHistory = [];
    this.broadcastChannel?.close();
    this.broadcastChannel = null;
    
    // Remove from window
    delete (window as any).GlobalEventBus;
    
    console.log('🔥 GlobalEventBus destroyed');
  }
}

// Create and export the singleton instance
export const globalEventBus = GlobalEventBus.getInstance();

// Export convenience methods
export const emit = (eventType: EventType, payload: any) => globalEventBus.emit(eventType, payload);
export const on = (eventType: EventType, listener: Function) => globalEventBus.on(eventType, listener);
export const off = (eventType: EventType, listener?: Function) => globalEventBus.off(eventType, listener);
export const once = (eventType: EventType, listener: Function) => globalEventBus.once(eventType, listener);
export const navigateTo = (path: string, data?: any) => globalEventBus.navigateTo(path, data);
export const selectWorkshop = (workshopId: string, workshopData: any) => globalEventBus.selectWorkshop(workshopId, workshopData); 