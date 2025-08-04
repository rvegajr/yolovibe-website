/**
 * 🎯 SPA INITIALIZATION SCRIPT
 * 
 * This script transforms the existing Astro application into a magnificent SPA!
 * It should be included in the main layout to initialize the SPA functionality.
 * 
 * Features:
 * - Seamless transition from MPA to SPA
 * - Preserves existing functionality
 * - Adds event-driven navigation
 * - Beautiful loading transitions
 */

import { initializeSPA } from './YOLOVibeSPA.js';
import { globalEventBus } from '../events/GlobalEventBus.js';

// Wait for DOM to be ready
function waitForDOM(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => resolve());
    } else {
      resolve();
    }
  });
}

// Initialize the SPA when the script loads
async function initializeSPAApplication(): Promise<void> {
  try {
    console.log('🚀 Starting SPA initialization...');
    
    // Wait for DOM to be ready
    await waitForDOM();
    
    // Add a small delay to ensure all other scripts have loaded
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Initialize the SPA
    await initializeSPA();
    
    // Add global event bus to window for debugging
    (window as any).globalEventBus = globalEventBus;
    
    // Show initialization complete message
    console.log('✨ SPA initialization complete! Event-driven navigation is now active.');
    
    // Emit a custom event that other scripts can listen to
    const event = new CustomEvent('spa-initialized', {
      detail: {
        timestamp: new Date(),
        version: '1.0.0',
        features: ['event-driven-navigation', 'workshop-selection', 'persistent-state']
      }
    });
    
    document.dispatchEvent(event);
    
  } catch (error) {
    console.error('❌ SPA initialization failed:', error);
    
    // Fallback: ensure the original page still works
    console.log('🔄 Falling back to original page functionality...');
  }
}

// Auto-initialize when the script is loaded
initializeSPAApplication();

// Export for manual initialization if needed
export { initializeSPAApplication }; 