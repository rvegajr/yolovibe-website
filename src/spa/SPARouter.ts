/**
 * 🚀 SPA ROUTER - The Heart of Our Event-Driven Application
 * 
 * This beautiful router provides:
 * - Event-driven navigation
 * - Smooth transitions
 * - State persistence
 * - Component lifecycle management
 * - Beautiful loading states
 */

// We're building our own magnificent router - no external dependencies needed!
import { globalEventBus } from '../events/GlobalEventBus.js';
import { EventTypes } from '../events/EventTypes.js';
import type { PageNavigationEvent, UserInteractionEvent } from '../events/EventContracts.js';

export interface SPARoute {
  path: string;
  component: () => Promise<any>;
  title?: string;
  description?: string;
  requiresAuth?: boolean;
  preload?: boolean;
  transition?: 'fade' | 'slide' | 'zoom' | 'none';
}

export interface NavigationState {
  currentPath: string;
  previousPath?: string;
  isLoading: boolean;
  loadingProgress: number;
  error?: string;
  userData?: Record<string, any>;
}

export class SPARouter {
  private static instance: SPARouter;
  private currentRoute: SPARoute | null = null;
  private routes: Map<string, SPARoute> = new Map();
  private state: NavigationState;
  private rootElement: HTMLElement;
  private loadingElement: HTMLElement;
  private transitionDuration = 300;
  
  private constructor(rootElementId: string = 'spa-root') {
    this.state = {
      currentPath: window.location.pathname,
      isLoading: false,
      loadingProgress: 0
    };
    
    this.rootElement = document.getElementById(rootElementId) || document.body;
    this.setupLoadingElement();
    this.setupEventListeners();
    this.setupHistoryHandling();
    
    console.log('🚀 SPARouter initialized with magnificent capabilities!');
  }
  
  public static getInstance(rootElementId?: string): SPARouter {
    if (!SPARouter.instance) {
      SPARouter.instance = new SPARouter(rootElementId);
    }
    return SPARouter.instance;
  }
  
  private setupLoadingElement(): void {
    this.loadingElement = document.createElement('div');
    this.loadingElement.id = 'spa-loading';
    this.loadingElement.className = 'spa-loading hidden';
    this.loadingElement.innerHTML = `
      <div class="loading-backdrop">
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading amazing content...</div>
          <div class="loading-progress">
            <div class="loading-progress-bar"></div>
          </div>
        </div>
      </div>
    `;
    
    // Add beautiful loading styles
    const style = document.createElement('style');
    style.textContent = `
      .spa-loading {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .spa-loading:not(.hidden) {
        opacity: 1;
      }
      
      .loading-backdrop {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(117, 16, 247, 0.95), rgba(0, 229, 255, 0.95));
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
      }
      
      .loading-container {
        text-align: center;
        color: white;
        padding: 2rem;
        border-radius: 1rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(20px);
      }
      
      .loading-spinner {
        width: 60px;
        height: 60px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .loading-text {
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 1rem;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      .loading-progress {
        width: 200px;
        height: 4px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
        overflow: hidden;
        margin: 0 auto;
      }
      
      .loading-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #00E5FF, #7510F7);
        border-radius: 2px;
        width: 0%;
        transition: width 0.3s ease;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(this.loadingElement);
  }
  
  private setupEventListeners(): void {
    // Listen for navigation events from the global event bus
    globalEventBus.on(EventTypes.PAGE_NAVIGATION, async (event: PageNavigationEvent) => {
      await this.navigate(event.to, event.data);
    });
    
    // Listen for workshop selections to trigger navigation
    globalEventBus.on(EventTypes.WORKSHOP_SELECTED, async (event) => {
      // Navigate to booking view when workshop is selected
      await this.navigate('/book', { 
        selectedWorkshop: event.workshopId,
        workshopData: event 
      });
    });
  }
  
  private setupHistoryHandling(): void {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', async (event) => {
      const path = window.location.pathname;
      await this.navigate(path, event.state, 'back');
    });
    
    // Intercept all internal links
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href^="/"], a[href^="#"]');
      
      if (link && !link.hasAttribute('data-external')) {
        event.preventDefault();
        const href = link.getAttribute('href')!;
        
        if (href.startsWith('#')) {
          // Handle hash navigation
          this.scrollToSection(href.substring(1));
        } else {
          // Handle route navigation
          this.navigate(href);
        }
      }
    });
  }
  
  public addRoute(route: SPARoute): void {
    this.routes.set(route.path, route);
    console.log(`🛣️ Route added: ${route.path}`);
    
    // Preload component if requested
    if (route.preload) {
      route.component().catch(error => {
        console.warn(`⚠️ Failed to preload route ${route.path}:`, error);
      });
    }
  }
  
  public addRoutes(routes: SPARoute[]): void {
    routes.forEach(route => this.addRoute(route));
  }
  
  public async navigate(
    path: string, 
    data?: Record<string, any>, 
    method: 'push' | 'replace' | 'back' = 'push'
  ): Promise<void> {
    try {
      const previousPath = this.state.currentPath;
      
      // Update state
      this.state = {
        ...this.state,
        previousPath,
        currentPath: path,
        isLoading: true,
        loadingProgress: 0,
        error: undefined,
        userData: data
      };
      
      // Show loading
      this.showLoading();
      
      // Emit navigation start event
      await globalEventBus.emit(EventTypes.USER_INTERACTION, {
        action: 'navigate',
        element: 'spa-router',
        page: path,
        timestamp: new Date(),
        metadata: {
          from: previousPath,
          to: path,
          method,
          hasData: !!data
        }
      } as UserInteractionEvent);
      
      // Find matching route
      const route = this.findRoute(path);
      if (!route) {
        throw new Error(`Route not found: ${path}`);
      }
      
      // Update progress
      this.updateProgress(25);
      
      // Load component
      const component = await route.component();
      this.updateProgress(75);
      
      // Update browser history
      if (method === 'push') {
        history.pushState(data, route.title || '', path);
      } else if (method === 'replace') {
        history.replaceState(data, route.title || '', path);
      }
      
      // Update document title
      if (route.title) {
        document.title = route.title;
      }
      
      // Render component
      await this.renderComponent(component, route);
      this.updateProgress(100);
      
      // Update current route
      this.currentRoute = route;
      
      // Complete navigation
      this.state = {
        ...this.state,
        isLoading: false,
        loadingProgress: 100
      };
      
      // Hide loading
      this.hideLoading();
      
      // Emit navigation complete event
      await globalEventBus.emit(EventTypes.PAGE_NAVIGATION, {
        from: previousPath,
        to: path,
        data,
        navigationMethod: method,
        timestamp: new Date(),
        source: 'SPARouter'
      } as PageNavigationEvent);
      
      console.log(`🎯 Navigation completed: ${previousPath} → ${path}`);
      
    } catch (error) {
      this.state = {
        ...this.state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Navigation failed'
      };
      
      this.hideLoading();
      
      // Emit error event
      await globalEventBus.emit(EventTypes.ERROR_OCCURRED, {
        error: error instanceof Error ? error.message : 'Navigation failed',
        page: path,
        action: 'navigate',
        severity: 'medium',
        timestamp: new Date(),
        source: 'SPARouter'
      });
      
      console.error('❌ Navigation failed:', error);
    }
  }
  
  private findRoute(path: string): SPARoute | null {
    // Direct match
    if (this.routes.has(path)) {
      return this.routes.get(path)!;
    }
    
    // Pattern matching for dynamic routes
    for (const [routePath, route] of this.routes) {
      if (this.matchRoute(routePath, path)) {
        return route;
      }
    }
    
    return null;
  }
  
  private matchRoute(routePath: string, actualPath: string): boolean {
    // Simple pattern matching - can be enhanced for complex patterns
    const routeParts = routePath.split('/');
    const actualParts = actualPath.split('/');
    
    if (routeParts.length !== actualParts.length) {
      return false;
    }
    
    return routeParts.every((part, index) => {
      return part.startsWith(':') || part === actualParts[index];
    });
  }
  
  private async renderComponent(component: any, route: SPARoute): Promise<void> {
    // Create transition container
    const newContainer = document.createElement('div');
    newContainer.className = 'spa-page-container';
    
    // Apply transition
    if (route.transition && route.transition !== 'none') {
      await this.applyTransition(newContainer, route.transition);
    }
    
    // Render component (this would be enhanced based on your component system)
    if (typeof component === 'function') {
      newContainer.innerHTML = await component(this.state.userData);
    } else if (component.render) {
      newContainer.innerHTML = await component.render(this.state.userData);
    } else {
      newContainer.innerHTML = component.toString();
    }
    
    // Replace content
    this.rootElement.innerHTML = '';
    this.rootElement.appendChild(newContainer);
    
    // Initialize any scripts in the new content
    this.initializePageScripts();
  }
  
  private async applyTransition(element: HTMLElement, transition: string): Promise<void> {
    return new Promise(resolve => {
      element.style.opacity = '0';
      element.style.transform = this.getTransitionTransform(transition, 'enter');
      element.style.transition = `all ${this.transitionDuration}ms ease-in-out`;
      
      requestAnimationFrame(() => {
        element.style.opacity = '1';
        element.style.transform = 'none';
        
        setTimeout(() => {
          element.style.transition = '';
          resolve();
        }, this.transitionDuration);
      });
    });
  }
  
  private getTransitionTransform(transition: string, direction: 'enter' | 'exit'): string {
    const factor = direction === 'enter' ? 1 : -1;
    
    switch (transition) {
      case 'slide':
        return `translateX(${factor * 100}%)`;
      case 'zoom':
        return `scale(${direction === 'enter' ? 0.8 : 1.2})`;
      case 'fade':
      default:
        return 'none';
    }
  }
  
  private initializePageScripts(): void {
    // Re-initialize any JavaScript components that need it
    // This would be customized based on your component architecture
    
    // Dispatch a custom event that components can listen to
    const event = new CustomEvent('spa-page-loaded', {
      detail: {
        path: this.state.currentPath,
        data: this.state.userData
      }
    });
    
    document.dispatchEvent(event);
  }
  
  private scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Emit scroll event
      globalEventBus.emit(EventTypes.USER_INTERACTION, {
        action: 'view',
        element: `section-${sectionId}`,
        page: this.state.currentPath,
        timestamp: new Date(),
        metadata: { scrollTo: sectionId }
      });
    }
  }
  
  private showLoading(): void {
    this.loadingElement.classList.remove('hidden');
  }
  
  private hideLoading(): void {
    setTimeout(() => {
      this.loadingElement.classList.add('hidden');
    }, 200);
  }
  
  private updateProgress(progress: number): void {
    this.state.loadingProgress = progress;
    const progressBar = this.loadingElement.querySelector('.loading-progress-bar') as HTMLElement;
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }
  
  // Public API methods
  public getCurrentPath(): string {
    return this.state.currentPath;
  }
  
  public getState(): NavigationState {
    return { ...this.state };
  }
  
  public goBack(): void {
    history.back();
  }
  
  public goForward(): void {
    history.forward();
  }
  
  public refresh(): void {
    this.navigate(this.state.currentPath, this.state.userData, 'replace');
  }
}

// Export the singleton instance
export const spaRouter = SPARouter.getInstance(); 