/**
 * 📅 BOOKING PAGE COMPONENT - SPA Edition
 * 
 * This magnificent component provides:
 * - Dynamic booking interface
 * - Pre-selected workshop handling
 * - Event-driven calendar and form interactions
 * - Consistent dark theme
 * - Real-time notifications
 */

import { globalEventBus } from '../../events/GlobalEventBus.js';
import { EventTypes } from '../../events/EventTypes.js';

export class BookingPage {
  private selectedWorkshop: any = null;
  
  constructor() {
    // Listen for workshop selection events
    globalEventBus.on(EventTypes.WORKSHOP_SELECTED, (event) => {
      this.selectedWorkshop = event;
      this.updateBookingInterface();
    });
  }
  
  public async render(data?: Record<string, any>): Promise<string> {
    // Check if we have workshop data from navigation
    if (data?.selectedWorkshop) {
      this.selectedWorkshop = data.workshopData;
    }
    
    // Emit page view event
    await globalEventBus.emit(EventTypes.USER_INTERACTION, {
      action: 'view',
      element: 'booking-page',
      page: '/book',
      timestamp: new Date(),
      metadata: { 
        hasSelectedWorkshop: !!this.selectedWorkshop,
        workshopId: this.selectedWorkshop?.workshopId,
        source: 'BookingPage'
      }
    });
    
    return `
      <div class="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-black text-white">
        <!-- Header -->
        <div class="container mx-auto px-4 py-12">
          <div class="text-center mb-12">
            <h1 class="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-200 dark:to-indigo-200">
              Book Your Workshop
            </h1>
            <p class="text-xl text-slate-300 max-w-2xl mx-auto">
              ${this.selectedWorkshop ? 
                `Great choice! Let's get you registered for the <strong>${this.selectedWorkshop.workshopName}</strong>.` :
                'Select your preferred workshop package and dates below. All workshops are conducted over consecutive business days.'
              }
            </p>
          </div>

          ${this.selectedWorkshop ? this.renderSelectedWorkshopInfo() : this.renderWorkshopSelection()}
          
          <!-- Main Booking Interface -->
          <section id="booking-widget" class="py-20">
            <div class="container mx-auto px-4">
              <div class="max-w-3xl mx-auto text-center mb-12">
                <div class="inline-block mb-3">
                  <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/30 border border-indigo-400/30 animate-pulse">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="relative">Book Now</span>
                  </span>
                </div>
                <h2 class="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 dark:from-pink-400 dark:via-purple-300 dark:to-cyan-300 drop-shadow-lg" style="text-shadow: 0 0 10px rgba(216, 180, 254, 0.5);">
                  Jump Into a Workshop
                </h2>
                <p class="text-xl text-white font-medium enhanced-text max-w-2xl mx-auto glow-text">
                  Ready to level up? Pick a date that works for you and let's make some <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500 font-bold">magic</span> happen!
                </p>
              </div>

              <!-- Booking Container -->
              <div class="booking-container max-w-5xl mx-auto relative">
                <!-- Animated Neon Border Effect -->
                <div class="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 rounded-2xl opacity-75 blur-lg animate-pulse"></div>
                
                <!-- Booking Widget Container -->
                <div class="min-h-[600px] flex flex-col relative z-10">
                  <div class="grid md:grid-cols-5 gap-0 h-full rounded-2xl overflow-hidden">
                    <!-- Left Column: Booking Form -->
                    <div class="md:col-span-3 p-8 flex flex-col justify-between booking-left-column relative overflow-hidden">
                      <!-- Decorative elements -->
                      <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                      <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-500/10 to-yellow-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
                      
                      <div class="relative z-10 flex-1">
                        <div class="flex items-center mb-8">
                          <div class="w-12 h-12 rounded-full calendar-icon-container flex items-center justify-center mr-4">
                            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                            </svg>
                          </div>
                          <h3 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 drop-shadow-md" style="text-shadow: 0 0 8px rgba(139, 92, 246, 0.5);">Book Your Workshop</h3>
                        </div>
                        
                        <!-- Booking Form -->
                        <form id="spa-booking-form" class="space-y-6">
                          <!-- Workshop Selection -->
                          <div class="space-y-2">
                            <label for="spa-workshop-select" class="block text-white font-semibold text-sm">Choose Service</label>
                            <select id="spa-workshop-select" name="productId" required 
                              class="w-full p-3 rounded-lg bg-black/30 border border-indigo-500/30 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all">
                              <option value="">Select a service...</option>
                              <option value="prod-3day" data-type="workshop" data-duration="3" data-price="3000" ${this.selectedWorkshop?.workshopId === 'prod-3day' ? 'selected' : ''}>3-Day YOLO Workshop - $3,000</option>
                              <option value="prod-5day" data-type="workshop" data-duration="5" data-price="4500" ${this.selectedWorkshop?.workshopId === 'prod-5day' ? 'selected' : ''}>5-Day YOLO Intensive - $4,500</option>
                              <option value="ai-consulting" data-type="consulting" data-duration="2" data-price="200" data-hourly="true" ${this.selectedWorkshop?.workshopId === 'ai-consulting' ? 'selected' : ''}>AI Business Development - $200/hour (Choose hours below)</option>
                            </select>
                          </div>

                          <!-- Date Selection -->
                          <div class="space-y-2">
                            <label for="spa-workshop-date" class="block text-white font-semibold text-sm">Workshop Date</label>
                            <input type="date" id="spa-workshop-date" name="startDate" required
                              class="w-full p-3 rounded-lg bg-black/30 border border-indigo-500/30 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all">
                          </div>

                          <!-- Custom Calendar -->
                          <div id="spa-custom-calendar" class="hidden">
                            <div class="bg-black/20 rounded-lg p-4 border border-indigo-500/30">
                              <div class="flex items-center justify-between mb-4">
                                <button type="button" id="spa-prev-month" class="p-2 text-white hover:text-cyan-400 transition-colors">
                                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                  </svg>
                                </button>
                                <h4 id="spa-calendar-month" class="text-white font-semibold"></h4>
                                <button type="button" id="spa-next-month" class="p-2 text-white hover:text-cyan-400 transition-colors">
                                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                                  </svg>
                                </button>
                              </div>
                              <div class="grid grid-cols-7 gap-1 text-center text-sm">
                                <div class="p-2 text-slate-400 font-medium">Sun</div>
                                <div class="p-2 text-slate-400 font-medium">Mon</div>
                                <div class="p-2 text-slate-400 font-medium">Tue</div>
                                <div class="p-2 text-slate-400 font-medium">Wed</div>
                                <div class="p-2 text-slate-400 font-medium">Thu</div>
                                <div class="p-2 text-slate-400 font-medium">Fri</div>
                                <div class="p-2 text-slate-400 font-medium">Sat</div>
                              </div>
                              <div id="spa-calendar-days" class="grid grid-cols-7 gap-1 text-center text-sm mt-2">
                                <!-- Calendar days will be populated by JavaScript -->
                              </div>
                            </div>
                            <div id="spa-calendar-helper" class="mt-2 text-sm text-cyan-300"></div>
                          </div>

                          <!-- Selected Date Display -->
                          <div id="spa-selected-date-display" class="hidden bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-4">
                            <div class="flex items-center">
                              <svg class="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                              </svg>
                              <span class="text-green-300 font-medium">Selected dates:</span>
                            </div>
                            <div id="spa-selected-date-text" class="mt-1 text-white font-semibold"></div>
                          </div>

                          <!-- Attendee Count -->
                          <div class="space-y-2" id="spa-attendee-count-section">
                            <label for="spa-attendee-count" class="block text-white font-semibold text-sm">Number of Attendees</label>
                            <select id="spa-attendee-count" name="attendeeCount" required
                              class="w-full p-3 rounded-lg bg-black/30 border border-indigo-500/30 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all">
                              <option value="1">1 attendee</option>
                              <option value="2">2 attendees</option>
                              <option value="3">3 attendees</option>
                              <option value="4">4 attendees</option>
                              <option value="5">5 attendees</option>
                            </select>
                          </div>

                          <!-- Contact Information -->
                          <div class="space-y-4">
                            <h4 class="text-white font-semibold text-lg border-b border-indigo-500/30 pb-2">Contact Information</h4>
                            
                            <div class="grid md:grid-cols-2 gap-4">
                              <div>
                                <label for="spa-contact-first-name" class="block text-white font-semibold text-sm mb-1">First Name</label>
                                <input type="text" id="spa-contact-first-name" name="contactFirstName" required
                                  class="w-full p-3 rounded-lg bg-black/30 border border-indigo-500/30 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all">
                              </div>
                              <div>
                                <label for="spa-contact-last-name" class="block text-white font-semibold text-sm mb-1">Last Name</label>
                                <input type="text" id="spa-contact-last-name" name="contactLastName" required
                                  class="w-full p-3 rounded-lg bg-black/30 border border-indigo-500/30 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all">
                              </div>
                            </div>
                            
                            <div>
                              <label for="spa-contact-email" class="block text-white font-semibold text-sm mb-1">Email Address</label>
                              <input type="email" id="spa-contact-email" name="contactEmail" required
                                class="w-full p-3 rounded-lg bg-black/30 border border-indigo-500/30 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all">
                            </div>
                            
                            <div>
                              <label for="spa-contact-phone" class="block text-white font-semibold text-sm mb-1">Phone Number</label>
                              <input type="tel" id="spa-contact-phone" name="contactPhone" required
                                class="w-full p-3 rounded-lg bg-black/30 border border-indigo-500/30 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all">
                            </div>
                          </div>

                          <!-- Attendee Information -->
                          <div id="spa-attendees-container">
                            <!-- Dynamic attendee fields will be added here -->
                          </div>

                          <!-- Coupon Code -->
                          <div class="space-y-2">
                            <label for="spa-coupon-code" class="block text-white font-semibold text-sm">Coupon Code (Optional)</label>
                            <input type="text" id="spa-coupon-code" name="couponCode"
                              class="w-full p-3 rounded-lg bg-black/30 border border-indigo-500/30 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                              placeholder="Enter coupon code">
                          </div>

                          <!-- Submit Button -->
                          <button type="submit" id="spa-book-workshop-btn"
                            class="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl">
                            <span id="spa-btn-text">Book Workshop</span>
                            <span id="spa-btn-loading" class="hidden">
                              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </span>
                          </button>
                        </form>
                      </div>
                    </div>

                    <!-- Right Column: Summary -->
                    <div class="md:col-span-2 p-8 booking-right-column">
                      <div class="sticky top-8">
                        <h4 class="text-2xl font-bold text-white mb-6">Booking Summary</h4>
                        
                        <div id="spa-booking-summary" class="space-y-4">
                          <!-- Summary will be populated by JavaScript -->
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Message Container -->
        <div id="spa-booking-message" class="fixed bottom-4 right-4 z-50 hidden">
          <!-- Messages will be shown here -->
        </div>
      </div>
    `;
  }
  
  private renderSelectedWorkshopInfo(): string {
    if (!this.selectedWorkshop) return '';
    
    return `
      <div class="max-w-4xl mx-auto bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-2xl border border-purple-500/30 p-8 mb-12">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-white mb-4">${this.selectedWorkshop.workshopName}</h2>
          <p class="text-purple-300 text-xl font-semibold mb-6">$${this.selectedWorkshop.price.toLocaleString()}</p>
          <p class="text-slate-300">You've selected an amazing workshop! Let's get you registered below.</p>
        </div>
      </div>
    `;
  }
  
  private renderWorkshopSelection(): string {
    return `
      <div class="max-w-6xl mx-auto mb-12">
        <div class="grid md:grid-cols-2 gap-6">
          <!-- 3-Day Workshop Package -->
          <div class="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 p-6 rounded-xl border border-purple-500/30 shadow-md">
            <h3 class="text-xl font-bold mb-3 text-purple-300">3-Day YOLO Workshop</h3>
            <p class="text-slate-300 mb-4">Intensive 3-day workshop covering core YOLO principles and practical applications. Can start Monday, Tuesday, or Wednesday.</p>
            <div class="space-y-2 text-sm text-slate-400 mb-4">
              <p>• Maximum 12 attendees per session</p>
              <p>• 3 consecutive business days</p>
              <p>• Hands-on coding exercises</p>
              
            </div>
            <p class="font-bold text-xl text-green-400 bg-black/20 px-4 py-2 rounded-lg border border-green-400/30">$3,000 per seat</p>
          </div>
          
          <!-- 5-Day Workshop Package -->
          <div class="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 p-6 rounded-xl border border-blue-500/30 shadow-md">
            <h3 class="text-xl font-bold mb-3 text-blue-300">5-Day YOLO Intensive</h3>
            <p class="text-slate-300 mb-4">Comprehensive 5-day intensive program with advanced techniques and certification. Always starts on Monday.</p>
            <div class="space-y-2 text-sm text-slate-400 mb-4">
              <p>• Maximum 8 attendees per session</p>
              <p>• Monday through Friday</p>
              <p>• Advanced project work</p>
              <p>• Business integration planning</p>
            </div>
            <p class="font-bold text-xl text-green-400 bg-black/20 px-4 py-2 rounded-lg border border-green-400/30">$4,500 per seat</p>
          </div>
        </div>
      </div>
    `;
  }
  
  private updateBookingInterface(): void {
    // Update the workshop selection dropdown
    const select = document.getElementById('spa-workshop-select') as HTMLSelectElement;
    if (select && this.selectedWorkshop) {
      select.value = this.selectedWorkshop.workshopId;
      
      // Trigger change event to update the interface
      const event = new Event('change', { bubbles: true });
      select.dispatchEvent(event);
    }
  }
  
  public async initialize(): Promise<void> {
    // Initialize the booking widget with event-driven functionality
    // This would integrate with the existing booking widget logic
    
    console.log('📅 BookingPage initialized with SPA capabilities!');
    
    // Set up form submission handler
    const form = document.getElementById('spa-booking-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await this.handleBookingSubmission(event);
      });
    }
  }
  
  private async handleBookingSubmission(event: Event): Promise<void> {
    // Handle the booking submission with event emission
    await globalEventBus.emit(EventTypes.FORM_SUBMITTED, {
      action: 'submit',
      element: 'spa-booking-form',
      page: '/book',
      timestamp: new Date(),
      metadata: {
        workshopId: this.selectedWorkshop?.workshopId,
        source: 'BookingPage'
      }
    });
    
    // Process the booking (integrate with existing booking logic)
    console.log('🎯 Processing booking submission...');
  }
}

// Factory function for the router
export const createBookingPage = () => {
  const bookingPage = new BookingPage();
  
  return async (data?: Record<string, any>) => {
    const html = await bookingPage.render(data);
    
    // Initialize after DOM is updated
    setTimeout(() => {
      bookingPage.initialize();
    }, 100);
    
    return html;
  };
}; 