/**
 * 🚀 YOLOVIBE SPA APPLICATION - The Heart of Our Event-Driven System
 * 
 * This magnificent application orchestrates:
 * - All SPA routes and components
 * - Global event bus initialization
 * - Persistent analytics and notifications
 * - Beautiful transitions and user experience
 * - Complete event-driven architecture
 */

import { spaRouter } from './SPARouter.js';
import { globalEventBus } from '../events/GlobalEventBus.js';
import { EventTypes } from '../events/EventTypes.js';
import { createHomePage } from './components/HomePage.js';
import { createBookingPage } from './components/BookingPage.js';

export class YOLOVibeSPA {
  private static instance: YOLOVibeSPA;
  private isInitialized = false;
  private analyticsService: any;
  private notificationService: any;
  
  private constructor() {
    console.log('🎉 YOLOVibeSPA instance created with pure joy!');
  }
  
  public static getInstance(): YOLOVibeSPA {
    if (!YOLOVibeSPA.instance) {
      YOLOVibeSPA.instance = new YOLOVibeSPA();
    }
    return YOLOVibeSPA.instance;
  }
  
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🎯 SPA already initialized - skipping');
      return;
    }
    
    console.log('🚀 Initializing YOLOVibe SPA with magnificent capabilities!');
    
    try {
      // 1. Set up the SPA root container
      this.setupSPAContainer();
      
      // 2. Initialize global event bus
      this.setupGlobalEvents();
      
      // 3. Set up routes
      this.setupRoutes();
      
      // 4. Initialize persistent services
      await this.initializePersistentServices();
      
      // 5. Handle initial route
      await this.handleInitialRoute();
      
      // 6. Set up navigation enhancement
      this.enhanceNavigation();
      
      this.isInitialized = true;
      
      // Emit SPA initialization complete event
      await globalEventBus.emit(EventTypes.USER_INTERACTION, {
        action: 'view',
        element: 'spa-application',
        page: window.location.pathname,
        timestamp: new Date(),
        metadata: {
          initialized: true,
          routes: this.getRouteList(),
          source: 'YOLOVibeSPA'
        }
      });
      
      console.log('✨ YOLOVibe SPA initialization complete! Ready for amazing interactions!');
      
    } catch (error) {
      console.error('❌ SPA initialization failed:', error);
      
      await globalEventBus.emit(EventTypes.ERROR_OCCURRED, {
        error: error instanceof Error ? error.message : 'SPA initialization failed',
        page: window.location.pathname,
        action: 'initialize',
        severity: 'critical',
        timestamp: new Date(),
        source: 'YOLOVibeSPA'
      });
      
      throw error;
    }
  }
  
  private setupSPAContainer(): void {
    // Create or find the SPA root container
    let spaRoot = document.getElementById('spa-root');
    
    if (!spaRoot) {
      spaRoot = document.createElement('div');
      spaRoot.id = 'spa-root';
      spaRoot.className = 'spa-root';
      
      // Insert after navbar or at the beginning of body
      const navbar = document.querySelector('nav') || document.querySelector('.navbar');
      if (navbar && navbar.parentNode) {
        navbar.parentNode.insertBefore(spaRoot, navbar.nextSibling);
      } else {
        document.body.appendChild(spaRoot);
      }
    }
    
    // Add SPA styles
    this.addSPAStyles();
    
    console.log('📦 SPA container set up successfully');
  }
  
  private addSPAStyles(): void {
    const existingStyle = document.getElementById('spa-styles');
    if (existingStyle) return;
    
    const style = document.createElement('style');
    style.id = 'spa-styles';
    style.textContent = `
      .spa-root {
        min-height: 100vh;
        position: relative;
        overflow: hidden;
      }
      
      .spa-page-container {
        min-height: 100vh;
        position: relative;
        opacity: 1;
        transform: none;
        transition: all 0.3s ease-in-out;
      }
      
      .spa-page-enter {
        opacity: 0;
        transform: translateY(20px);
      }
      
      .spa-page-exit {
        opacity: 0;
        transform: translateY(-20px);
      }
      
      /* Beautiful scrollbar */
      .spa-root::-webkit-scrollbar {
        width: 8px;
      }
      
      .spa-root::-webkit-scrollbar-track {
        background: rgba(15, 23, 42, 0.5);
      }
      
      .spa-root::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #7510F7, #00E5FF);
        border-radius: 4px;
      }
      
      .spa-root::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #5B0BC8, #00C4E5);
      }
      
      /* Booking widget styles */
      .booking-left-column {
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
        backdrop-filter: blur(20px);
        border: 1px solid rgba(139, 92, 246, 0.3);
      }
      
      .booking-right-column {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95));
        backdrop-filter: blur(20px);
        border: 1px solid rgba(139, 92, 246, 0.2);
      }
      
      .calendar-icon-container {
        background: linear-gradient(135deg, #7510F7, #00E5FF);
        box-shadow: 0 8px 20px rgba(117, 16, 247, 0.4);
      }
      
      /* Enhanced glow effects */
      .glow-text {
        text-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
      }
      
      .enhanced-text {
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
      }
      
      /* Button hover effects */
      .select-workshop-btn:hover,
      #spa-book-workshop-btn:hover {
        box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
        transform: translateY(-2px) scale(1.02);
      }
      
      /* Workshop card hover effects */
      .workshop-card:hover {
        box-shadow: 0 20px 40px rgba(139, 92, 246, 0.3);
        border-color: rgba(139, 92, 246, 0.5);
      }
    `;
    
    document.head.appendChild(style);
  }
  
  private setupGlobalEvents(): void {
    // Set up global event listeners for SPA-wide functionality
    
    // Listen for workshop selections to show notifications
    globalEventBus.on(EventTypes.WORKSHOP_SELECTED, async (event) => {
      this.showNotification(
        `✅ ${event.workshopName} selected!`,
        'success',
        `Price: $${event.price.toLocaleString()} • Next: Choose your date`
      );
    });
    
    // Listen for page navigation events
    globalEventBus.on(EventTypes.PAGE_NAVIGATION, async (event) => {
      this.updatePageMetadata(event.to);
    });
    
    // Listen for errors
    globalEventBus.on(EventTypes.ERROR_OCCURRED, async (event) => {
      this.showNotification(
        `❌ ${event.error}`,
        'error',
        'Please try again or contact support'
      );
    });
    
    console.log('🎧 Global event listeners set up');
  }
  
  private setupRoutes(): void {
    // Add all our beautiful routes
    spaRouter.addRoutes([
      {
        path: '/',
        component: createHomePage(),
        title: 'YOLOVibeCodeBootCamp - Learn Coding with AI Tools',
        description: 'Master AI-powered development with leading coding assistants',
        preload: true,
        transition: 'fade'
      },
      {
        path: '/book',
        component: createBookingPage(),
        title: 'Book a Workshop | YOLOVibeCodeBootCamp',
        description: 'Schedule your YOLOVibeCode workshop and accelerate your development process',
        transition: 'slide'
      },
      {
        path: '/knowledge-unbound',
        component: this.createKnowledgeUnboundPage(),
        title: 'Knowledge Unbound | YOLOVibeCodeBootCamp',
        description: 'Our philosophy on sharing knowledge freely',
        transition: 'fade'
      },
      {
        path: '/contact',
        component: this.createContactPage(),
        title: 'Contact Us | YOLOVibeCodeBootCamp',
        description: 'Get in touch with our team',
        transition: 'fade'
      }
    ]);
    
    console.log('🛣️ All routes set up successfully');
  }
  
  private async initializePersistentServices(): Promise<void> {
    // Initialize analytics service that persists across routes
    this.analyticsService = {
      trackEvent: async (eventType: string, data: any) => {
        await globalEventBus.emit(EventTypes.USER_INTERACTION, {
          action: 'track',
          element: 'analytics-service',
          page: spaRouter.getCurrentPath(),
          timestamp: new Date(),
          metadata: { eventType, data, source: 'AnalyticsService' }
        });
      }
    };
    
    // Initialize notification service
    this.notificationService = {
      container: this.createNotificationContainer()
    };
    
    console.log('🔧 Persistent services initialized');
  }
  
  private createNotificationContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'spa-notifications';
    container.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(container);
    return container;
  }
  
  private async handleInitialRoute(): Promise<void> {
    const currentPath = window.location.pathname;
    
    // Navigate to current path to initialize the SPA
    await spaRouter.navigate(currentPath, {}, 'replace');
  }
  
  private enhanceNavigation(): void {
    // Enhance existing navigation links to work with SPA
    const existingNavbar = document.querySelector('nav');
    if (existingNavbar) {
      // Add SPA navigation attributes to existing links
      const links = existingNavbar.querySelectorAll('a[href^="/"], a[href^="#"]');
      links.forEach(link => {
        if (!link.hasAttribute('data-external')) {
          link.addEventListener('click', (event) => {
            event.preventDefault();
            const href = link.getAttribute('href')!;
            
            if (href.startsWith('#')) {
              // Handle hash navigation
              const element = document.getElementById(href.substring(1));
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            } else {
              // Handle route navigation
              globalEventBus.navigateTo(href);
            }
          });
        }
      });
    }
    
    console.log('🔗 Navigation enhanced for SPA');
  }
  
  private updatePageMetadata(path: string): void {
    // Update page metadata based on route
    const routes = {
      '/': {
        title: 'YOLOVibeCodeBootCamp - Learn Coding with AI Tools',
        description: 'Master AI-powered development with leading coding assistants'
      },
      '/book': {
        title: 'Book a Workshop | YOLOVibeCodeBootCamp',
        description: 'Schedule your YOLOVibeCode workshop and accelerate your development process'
      },
      '/knowledge-unbound': {
        title: 'Knowledge Unbound | YOLOVibeCodeBootCamp',
        description: 'Our philosophy on sharing knowledge freely'
      },
      '/contact': {
        title: 'Contact Us | YOLOVibeCodeBootCamp',
        description: 'Get in touch with our team'
      }
    };
    
    const route = routes[path as keyof typeof routes];
    if (route) {
      document.title = route.title;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', route.description);
      }
    }
  }
  
  private showNotification(title: string, type: 'success' | 'error' | 'info', message?: string): void {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} transform translate-x-full transition-transform duration-300 ease-out`;
    
    const colors = {
      success: 'bg-green-500 border-green-400',
      error: 'bg-red-500 border-red-400',
      info: 'bg-blue-500 border-blue-400'
    };
    
    notification.innerHTML = `
      <div class="${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg border-l-4 max-w-sm">
        <div class="flex items-start">
          <div class="flex-1">
            <h4 class="font-semibold">${title}</h4>
            ${message ? `<p class="text-sm opacity-90 mt-1">${message}</p>` : ''}
          </div>
          <button class="ml-4 text-white hover:text-gray-200 transition-colors" onclick="this.parentElement.parentElement.parentElement.remove()">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    this.notificationService.container.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.classList.remove('translate-x-full');
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }
  
  private createKnowledgeUnboundPage() {
    return async (data?: Record<string, any>) => {
      return `
        <div class="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-black text-white">
          <div class="container mx-auto px-4 py-16">
            <div class="max-w-4xl mx-auto">
              <h1 class="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Knowledge Unbound</h1>
              <div class="prose prose-lg prose-invert">
                <p class="text-xl text-slate-300 leading-relaxed">
                  Our philosophy is simple: knowledge should be free and accessible to all. 
                  When we share what we know, we create a ripple effect that benefits everyone.
                </p>
                <p class="text-slate-300 mt-6">
                  That's why our workshops aren't just about learning - they're about empowering you 
                  to teach others and spread the knowledge further.
                </p>
              </div>
              <div class="mt-12 text-center">
                <button 
                  onclick="globalEventBus.navigateTo('/')"
                  class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all transform hover:scale-105"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    };
  }
  
  private createContactPage() {
    return async (data?: Record<string, any>) => {
      return `
        <div class="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-black text-white">
          <div class="container mx-auto px-4 py-16">
            <div class="max-w-2xl mx-auto text-center">
              <h1 class="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Contact Us</h1>
              <div class="space-y-6">
                <p class="text-xl text-slate-300">
                  Ready to start your AI-powered development journey?
                </p>
                <div class="bg-slate-800/50 rounded-lg p-8 border border-slate-700">
                  <h3 class="text-2xl font-semibold mb-4">Get in Touch</h3>
                  <p class="text-slate-300 mb-6">
                    Email us at: <a href="mailto:contact@yolovibecodebootcamp.com" class="text-cyan-400 hover:text-cyan-300">contact@yolovibecodebootcamp.com</a>
                  </p>
                  <button 
                    onclick="globalEventBus.navigateTo('/')"
                    class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all transform hover:scale-105"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    };
  }
  
  private getRouteList(): string[] {
    return ['/', '/book', '/knowledge-unbound', '/contact'];
  }
  
  // Public API methods
  public getRouter() {
    return spaRouter;
  }
  
  public getEventBus() {
    return globalEventBus;
  }
  
  public async navigateTo(path: string, data?: Record<string, any>) {
    return await globalEventBus.navigateTo(path, data);
  }
}

// Create and export the singleton instance
export const yoloVibeSPA = YOLOVibeSPA.getInstance();

// Export convenience methods
export const initializeSPA = () => yoloVibeSPA.initialize();
export const navigateTo = (path: string, data?: Record<string, any>) => yoloVibeSPA.navigateTo(path, data); 