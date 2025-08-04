/**
 * 🎯 CORE EVENT-DRIVEN ARCHITECTURE INFRASTRUCTURE
 * 
 * This is the HEART of our inter-component communication system!
 * Based on the EVENT_DRIVEN_ARCHITECTURE_RULES.md specification.
 * 
 * Features:
 * - GlobalEventBus for cross-instance communication (security, system events)
 * - LocalEventBus for instance-specific communication (CRUD, navigation, workflows)
 * - Simple, robust, and performant
 * - Built-in error handling and logging
 * - Memory leak prevention with proper cleanup
 */

export type EventHandler = (data: any) => void | Promise<void>;

/**
 * 🌍 GlobalEventBus - Affects ALL application instances
 * Use for: Security events, System events, User preferences
 */
export class GlobalEventBus {
  private static handlers = new Map<string, EventHandler[]>();
  
  /**
   * Subscribe to a global event
   */
  static on(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
    
    // Return unsubscribe function
    return () => this.off(event, handler);
  }
  
  /**
   * Unsubscribe from a global event
   */
  static off(event: string, handler: EventHandler): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      const index = eventHandlers.indexOf(handler);
      if (index > -1) {
        eventHandlers.splice(index, 1);
      }
      
      // Clean up empty arrays
      if (eventHandlers.length === 0) {
        this.handlers.delete(event);
      }
    }
  }
  
  /**
   * Emit a global event to ALL instances
   */
  static async emit(event: string, data: any): Promise<void> {
    console.log(`🌍 Global Event: ${event}`, data);
    
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      // Execute all handlers, with error isolation
      const promises = eventHandlers.map(async (handler) => {
        try {
          await handler(data);
        } catch (error) {
          console.error(`❌ Global Event Handler Error [${event}]:`, error);
          // Continue processing other handlers
        }
      });
      
      await Promise.allSettled(promises);
    }
  }
  
  /**
   * Get all registered event types (for debugging)
   */
  static getRegisteredEvents(): string[] {
    return Array.from(this.handlers.keys());
  }
  
  /**
   * Clear all handlers (for testing)
   */
  static clearAll(): void {
    this.handlers.clear();
  }
}

/**
 * 🪟 LocalEventBus - Instance-specific communication
 * Use for: CRUD operations, Navigation, Workflows, UI state
 */
export class LocalEventBus {
  private handlers = new Map<string, EventHandler[]>();
  
  /**
   * Subscribe to a local event
   */
  on(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
    
    // Return unsubscribe function
    return () => this.off(event, handler);
  }
  
  /**
   * Unsubscribe from a local event
   */
  off(event: string, handler: EventHandler): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      const index = eventHandlers.indexOf(handler);
      if (index > -1) {
        eventHandlers.splice(index, 1);
      }
      
      // Clean up empty arrays
      if (eventHandlers.length === 0) {
        this.handlers.delete(event);
      }
    }
  }
  
  /**
   * Emit a local event to current instance only
   */
  async emit(event: string, data: any): Promise<void> {
    console.log(`🪟 Local Event: ${event}`, data);
    
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      // Execute all handlers, with error isolation
      const promises = eventHandlers.map(async (handler) => {
        try {
          await handler(data);
        } catch (error) {
          console.error(`❌ Local Event Handler Error [${event}]:`, error);
          // Continue processing other handlers
        }
      });
      
      await Promise.allSettled(promises);
    }
  }
  
  /**
   * Get all registered event types (for debugging)
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.handlers.keys());
  }
  
  /**
   * Clear all handlers (for cleanup)
   */
  clearAll(): void {
    this.handlers.clear();
  }
  
  /**
   * Get handler count for an event (for debugging)
   */
  getHandlerCount(event: string): number {
    return this.handlers.get(event)?.length || 0;
  }
} 