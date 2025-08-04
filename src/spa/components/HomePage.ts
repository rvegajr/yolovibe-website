/**
 * 🏠 HOME PAGE COMPONENT - SPA Edition
 * 
 * This magnificent component renders the homepage with:
 * - Beautiful hero section
 * - Workshop offerings
 * - Event-driven booking interactions
 * - Consistent dark theme
 */

import { globalEventBus } from '../../events/GlobalEventBus.js';
import { EventTypes } from '../../events/EventTypes.js';

export class HomePage {
  private container: HTMLElement;
  
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'home-page';
  }
  
  public async render(data?: Record<string, any>): Promise<string> {
    // Emit page view event
    await globalEventBus.emit(EventTypes.USER_INTERACTION, {
      action: 'view',
      element: 'homepage',
      page: '/',
      timestamp: new Date(),
      metadata: { 
        hasData: !!data,
        source: 'HomePage'
      }
    });
    
    return `
      <div class="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-black text-white">
        <!-- Navigation will be handled by SPA router -->
        
        <!-- Hero Section -->
        <main class="grid lg:grid-cols-2 place-items-center pt-16 pb-8 md:pt-12 md:pb-24">
          <div class="py-6 md:order-1 hidden md:block">
            <picture>
              <img
                src="/assets/hero.png"
                alt="YOLOVibe Hero"
                class="w-full h-auto max-w-lg mx-auto"
                loading="eager"
                format="webp"
              />
            </picture>
          </div>
          
          <div class="max-w-2xl px-4">
            <h1 class="text-5xl lg:text-6xl xl:text-7xl font-extrabold lg:tracking-tight xl:tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-500 drop-shadow-sm">
              YOLOVibeCoding Boot Camps
            </h1>
            <p class="text-lg mt-4 text-white max-w-xl font-medium bg-slate-800/90 p-3 rounded-md backdrop-blur-sm border border-indigo-500/50 shadow-sm">
              Accelerate your development workflow with cutting-edge AI-powered techniques. Choose from intensive workshops or personalized consulting sessions. Learn the skills to transform your business processes and create applications at unprecedented speed.
            </p>
            <div class="mt-6 flex flex-col sm:flex-row gap-3">
              <button 
                id="book-workshop-hero-btn"
                class="flex gap-1 items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                </svg>
                Book a Workshop
              </button>
              <button 
                id="knowledge-unbound-btn"
                class="flex gap-1 items-center justify-center px-6 py-3 border-2 border-slate-300 hover:border-indigo-400 text-slate-300 hover:text-indigo-400 font-semibold rounded-lg transition-all"
              >
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Knowledge Unbound
              </button>
            </div>
          </div>
        </main>

        <!-- Workshop Offerings Section -->
        <section id="offerings" class="py-20 bg-gradient-to-b from-slate-900 to-gray-900">
          <div class="container mx-auto px-4">
            <div class="text-center mb-16">
              <h2 class="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 mb-6">
                Choose Your Adventure
              </h2>
              <p class="text-xl text-slate-300 max-w-3xl mx-auto">
                Whether you're looking for intensive hands-on training or personalized consulting, 
                we have the perfect program to accelerate your AI-powered development journey.
              </p>
            </div>

            <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <!-- 3-Day Workshop -->
              <div class="workshop-card bg-gradient-to-br from-purple-900/50 to-indigo-900/50 p-8 rounded-2xl border border-purple-500/30 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <div class="text-center mb-6">
                  <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <h3 class="text-2xl font-bold text-white mb-2">3-Day YOLO Workshop</h3>
                  <p class="text-purple-300 text-lg font-semibold">$3,000</p>
                </div>
                
                <ul class="text-slate-300 space-y-3 mb-8">
                  <li class="flex items-center">
                    <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span><strong>Intensive:</strong> 3 consecutive days</span>
                  </li>
                  <li class="flex items-center">
                    <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span><strong>Hands-on:</strong> Real project development</span>
                  </li>
                  <li class="flex items-center">
                    <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span><strong>Tools:</strong> Windsurf, Cursor, GitHub Copilot</span>
                  </li>
                  <li class="flex items-center">
                    <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span><strong>Group:</strong> Max 12 participants</span>
                  </li>
                </ul>
                
                <button 
                  class="select-workshop-btn w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all transform hover:scale-105"
                  data-workshop-id="prod-3day"
                  data-workshop-name="3-Day YOLO Workshop"
                  data-workshop-type="THREE_DAY"
                  data-workshop-price="3000"
                >
                  Select Workshop
                </button>
              </div>

              <!-- 5-Day Intensive -->
              <div class="workshop-card bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-2xl border border-blue-500/30 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <div class="text-center mb-6">
                  <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 class="text-2xl font-bold text-white mb-2">5-Day YOLO Intensive</h3>
                  <p class="text-blue-300 text-lg font-semibold">$4,500</p>
                </div>
                
                <ul class="text-slate-300 space-y-3 mb-8">
                  <li class="flex items-center">
                    <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span><strong>Comprehensive:</strong> Full business week</span>
                  </li>
                  <li class="flex items-center">
                    <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span><strong>Business Focus:</strong> Market strategy + AI</span>
                  </li>
                  <li class="flex items-center">
                    <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span><strong>MVP Development:</strong> Build & validate</span>
                  </li>
                  <li class="flex items-center">
                    <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span><strong>Exclusive:</strong> Max 8 participants</span>
                  </li>
                </ul>
                
                <button 
                  class="select-workshop-btn w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg transition-all transform hover:scale-105"
                  data-workshop-id="prod-5day"
                  data-workshop-name="5-Day YOLO Intensive"
                  data-workshop-type="FIVE_DAY"
                  data-workshop-price="4500"
                >
                  Select Workshop
                </button>
              </div>

              <!-- AI Consulting -->
              <div class="workshop-card bg-gradient-to-br from-amber-900/50 to-orange-900/50 p-8 rounded-2xl border border-amber-500/30 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <div class="text-center mb-6">
                  <div class="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path>
                    </svg>
                  </div>
                  <h3 class="text-2xl font-bold text-white mb-2">AI Business Development</h3>
                  <p class="text-amber-300 text-lg font-semibold">$200/hour</p>
                </div>
                
                <ul class="text-slate-300 space-y-3 mb-8">
                  <li class="flex items-center">
                    <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span><strong>One-on-One:</strong> Personalized guidance</span>
                  </li>
                  <li class="flex items-center">
                    <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span><strong>Project Focus:</strong> Your real applications</span>
                  </li>
                  <li class="flex items-center">
                    <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span><strong>Flexible:</strong> Schedule when needed</span>
                  </li>
                  <li class="flex items-center">
                    <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span><strong>Expert Level:</strong> Advanced techniques</span>
                  </li>
                </ul>
                
                <button 
                  class="select-workshop-btn w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-lg transition-all transform hover:scale-105"
                  data-workshop-id="ai-consulting"
                  data-workshop-name="AI Business Development"
                  data-workshop-type="HOURLY_CONSULTING"
                  data-workshop-price="200"
                >
                  Book Session
                </button>
              </div>
            </div>

            <div class="text-center mt-12">
              <p class="text-slate-400 text-lg mb-4">
                Not sure which option is right for you?
              </p>
              <button 
                id="contact-btn"
                class="inline-flex items-center px-6 py-3 border-2 border-slate-400 hover:border-purple-400 text-slate-400 hover:text-purple-400 font-semibold rounded-lg transition-all"
              >
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
                </svg>
                Let's Chat About Your Needs
              </button>
            </div>
          </div>
        </section>

        <!-- Booking Section Placeholder -->
        <section id="book" class="py-20 bg-gradient-to-b from-gray-900 to-slate-900">
          <div class="container mx-auto px-4 text-center">
            <h2 class="text-4xl font-bold text-white mb-8">Ready to Get Started?</h2>
            <p class="text-xl text-slate-300 mb-8">Select a workshop above to begin your booking process!</p>
            <div id="booking-interface" class="hidden">
              <!-- Booking interface will be dynamically loaded here -->
            </div>
          </div>
        </section>
      </div>
    `;
  }
  
  public async initialize(): Promise<void> {
    // Set up event listeners for workshop selection
    document.addEventListener('click', async (event) => {
      const target = event.target as HTMLElement;
      
      if (target.classList.contains('select-workshop-btn')) {
        const workshopId = target.getAttribute('data-workshop-id')!;
        const workshopName = target.getAttribute('data-workshop-name')!;
        const workshopType = target.getAttribute('data-workshop-type')!;
        const workshopPrice = parseInt(target.getAttribute('data-workshop-price')!);
        
        // Emit workshop selection event
        await globalEventBus.selectWorkshop(workshopId, {
          id: workshopId,
          name: workshopName,
          type: workshopType,
          price: workshopPrice
        });
      }
      
      if (target.id === 'book-workshop-hero-btn') {
        // Navigate to booking section
        await globalEventBus.navigateTo('/#book');
      }
      
      if (target.id === 'knowledge-unbound-btn') {
        await globalEventBus.navigateTo('/knowledge-unbound');
      }
      
      if (target.id === 'contact-btn') {
        await globalEventBus.navigateTo('/contact');
      }
    });
    
    console.log('🏠 HomePage initialized with event-driven interactions!');
  }
}

// Factory function for the router
export const createHomePage = () => {
  const homePage = new HomePage();
  
  return async (data?: Record<string, any>) => {
    const html = await homePage.render(data);
    
    // Initialize after DOM is updated
    setTimeout(() => {
      homePage.initialize();
    }, 100);
    
    return html;
  };
}; 