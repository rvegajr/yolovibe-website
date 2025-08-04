/**
 * Database-backed Product Catalog Manager
 * 
 * This implementation uses real database data instead of hardcoded values.
 * Follows Interface Segregation Principle (ISP) by implementing IProductCatalog.
 */

import type { IProductCatalog, Product } from '../core/interfaces/index.js';
import { ProductType } from '../core/types/index.js';
import { getDatabaseConnection } from '../database/connection.js';

export class ProductCatalogManagerDB implements IProductCatalog {
  async getAvailableProducts(): Promise<Product[]> {
    const dbConnection = getDatabaseConnection();
    const db = await dbConnection.getDatabase();
    
    try {
      // Query active products from database
      const rows = await dbConnection.query(`
        SELECT 
          id,
          name,
          description,
          product_type as type,
          price,
          duration_days as duration,
          max_capacity as maxCapacity
        FROM products
        WHERE is_active = 1
        ORDER BY price ASC
      `);
      
      // Transform database rows to Product objects
      return rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description || '',
        type: row.type as ProductType,
        price: Number(row.price),
        duration: row.duration || 0,
        maxCapacity: row.maxCapacity || 12,
        availableStartDays: this.getAvailableStartDays(row.type as ProductType)
      }));
    } catch (error) {
      console.error('Error fetching products from database:', error);
      throw new Error('Failed to fetch available products');
    }
  }

  async getProductDetails(productId: string): Promise<Product> {
    const dbConnection = getDatabaseConnection();
    const db = await dbConnection.getDatabase();
    
    try {
      const rows = await dbConnection.query(`
        SELECT 
          id,
          name,
          description,
          product_type as type,
          price,
          duration_days as duration,
          max_capacity as maxCapacity
        FROM products
        WHERE id = ? AND is_active = 1
      `, [productId]);
      
      if (!rows || rows.length === 0) {
        throw new Error(`Product not found: ${productId}`);
      }
      
      const row = rows[0];
      return {
        id: row.id,
        name: row.name,
        description: row.description || '',
        type: row.type as ProductType,
        price: Number(row.price),
        duration: row.duration || 0,
        maxCapacity: row.maxCapacity || 12,
        availableStartDays: this.getAvailableStartDays(row.type as ProductType)
      };
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  }

  async getAvailableStartDates(productType: ProductType): Promise<Date[]> {
    const dates: Date[] = [];
    const today = new Date();
    
    // Generate dates for the next 4 weeks
    for (let week = 0; week < 4; week++) {
      const monday = new Date(today);
      monday.setDate(today.getDate() + (week * 7) + (1 - today.getDay() + 7) % 7);
      
      if (productType === ProductType.THREE_DAY) {
        // 3-day workshops can start Mon, Tue, Wed
        dates.push(new Date(monday)); // Monday
        dates.push(new Date(monday.getTime() + 24 * 60 * 60 * 1000)); // Tuesday
        dates.push(new Date(monday.getTime() + 2 * 24 * 60 * 60 * 1000)); // Wednesday
      } else if (productType === ProductType.FIVE_DAY) {
        // 5-day workshops only start Monday
        dates.push(new Date(monday));
      } else if (productType === ProductType.HOURLY_CONSULTING) {
        // Consulting can be any weekday
        for (let day = 0; day < 5; day++) {
          dates.push(new Date(monday.getTime() + day * 24 * 60 * 60 * 1000));
        }
      }
    }
    
    // Filter out past dates
    return dates.filter(date => date >= today);
  }

  async validateProductAvailability(productId: string, startDate: Date): Promise<boolean> {
    const product = await this.getProductDetails(productId);
    const availableDates = await this.getAvailableStartDates(product.type);
    
    // Check if the requested date is in the list of available dates
    return availableDates.some(date => 
      date.toDateString() === startDate.toDateString()
    );
  }

  private getAvailableStartDays(productType: ProductType): string[] {
    switch (productType) {
      case ProductType.THREE_DAY:
        return ['monday', 'tuesday', 'wednesday'];
      case ProductType.FIVE_DAY:
        return ['monday'];
      case ProductType.HOURLY_CONSULTING:
        return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      default:
        return [];
    }
  }

  /**
   * Add a new product to the catalog (admin function)
   */
  async addProduct(product: Omit<Product, 'id'>): Promise<string> {
    const dbConnection = getDatabaseConnection();
    const db = await dbConnection.getDatabase();
    const productId = `prod-${Date.now()}`;
    
    try {
      await dbConnection.execute(`
        INSERT INTO products (
          id, name, description, product_type, price, 
          duration_days, max_capacity, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `, [
        productId,
        product.name,
        product.description,
        product.type,
        product.price,
        product.duration,
        product.maxCapacity
      ]);
      
      return productId;
    } catch (error) {
      console.error('Error adding product:', error);
      throw new Error('Failed to add product');
    }
  }

  /**
   * Update product details (admin function)
   */
  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    const dbConnection = getDatabaseConnection();
    const db = await dbConnection.getDatabase();
    
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
      updateFields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.price !== undefined) {
      updateFields.push('price = ?');
      values.push(updates.price);
    }
    if (updates.maxCapacity !== undefined) {
      updateFields.push('max_capacity = ?');
      values.push(updates.maxCapacity);
    }
    
    if (updateFields.length === 0) {
      return; // Nothing to update
    }
    
    values.push(productId);
    
    try {
      await dbConnection.execute(`
        UPDATE products 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, values);
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  /**
   * Deactivate a product (soft delete)
   */
  async deactivateProduct(productId: string): Promise<void> {
    const dbConnection = getDatabaseConnection();
    const db = await dbConnection.getDatabase();
    
    try {
      await dbConnection.execute(`
        UPDATE products 
        SET is_active = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, productId);
    } catch (error) {
      console.error('Error deactivating product:', error);
      throw new Error('Failed to deactivate product');
    }
  }
}