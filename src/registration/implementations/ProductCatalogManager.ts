/**
 * ProductCatalogManager - Concrete Implementation
 * Simple, focused implementation of IProductCatalog interface
 * Follows interface segregation principle - no over-engineering!
 */

import type { IProductCatalog } from '../core/interfaces/index.js';
import type { Product, ProductType, TimeSlot } from '../core/types/index.js';
import { ProductType as ProductTypeEnum } from '../core/types/index.js';

export class ProductCatalogManager implements IProductCatalog {
  private readonly products: Product[] = [
    {
      id: 'prod-3day',
      name: '3-Day YOLO Workshop',
      type: ProductTypeEnum.THREE_DAY,
      price: 3000,
      duration: 3,
      description: 'Intensive 3-day workshop covering core YOLO principles and practical applications',
      maxCapacity: 12,
      availableStartDays: ['monday', 'tuesday', 'wednesday']
    },
    {
      id: 'prod-5day',
      name: '5-Day YOLO Intensive',
      type: ProductTypeEnum.FIVE_DAY,
      price: 4500,
      duration: 5,
      description: 'Comprehensive 5-day intensive program with advanced techniques and certification',
      maxCapacity: 8,
      availableStartDays: ['monday']
    },
    {
      id: 'ai-consulting',
      name: 'AI Business Development',
      type: ProductTypeEnum.HOURLY_CONSULTING,
      price: 200,
      duration: 2, // 2 hours minimum
      description: 'Personalized AI consulting sessions to help develop and implement your business ideas. $200/hour with 2-hour minimum.',
      maxCapacity: 1, // One-on-one sessions
      availableStartDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }
  ];

  async getAvailableProducts(): Promise<Product[]> {
    return [...this.products]; // Return copy to prevent mutation
  }

  async getProductDetails(productId: string): Promise<Product> {
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }
    return { ...product }; // Return copy to prevent mutation
  }

  async getAvailableStartDates(productType: ProductType): Promise<Date[]> {
    const product = this.products.find(p => p.type === productType);
    if (!product) {
      return [];
    }

    const dates: Date[] = [];
    const today = new Date();
    
    // Generate dates for the next 4 weeks to match test expectations
    for (let week = 0; week < 4; week++) {
      const monday = new Date(today);
      monday.setDate(today.getDate() + (week * 7) + (1 - today.getDay() + 7) % 7);
      
      if (productType === ProductTypeEnum.THREE_DAY) {
        // 3-day can start Mon, Tue, Wed
        dates.push(new Date(monday)); // Monday
        dates.push(new Date(monday.getTime() + 24 * 60 * 60 * 1000)); // Tuesday
        dates.push(new Date(monday.getTime() + 2 * 24 * 60 * 60 * 1000)); // Wednesday
      } else if (productType === ProductTypeEnum.FIVE_DAY) {
        // 5-day only starts Monday
        dates.push(new Date(monday));
      }
    }
    
    return dates;
  }

  async getHourlyAvailability(date: Date, startHour: number, endHour: number): Promise<TimeSlot[]> {
    const timeSlots: TimeSlot[] = [];
    
    // Check if it's a business day (Monday-Friday)
    const dayOfWeek = date.getDay();
    const isBusinessDay = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday = 1, Friday = 5
    
    // Generate 2-hour time slots between startHour and endHour
    for (let hour = startHour; hour < endHour - 1; hour += 2) { // 2-hour minimum
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 2).toString().padStart(2, '0')}:00`;
      
      timeSlots.push({
        startTime,
        endTime,
        available: isBusinessDay, // Only available on business days
        duration: 2
      });
    }
    
    return timeSlots;
  }
}
